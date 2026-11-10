<?php

namespace app\common\payment;

use app\common\lib\Util;
use think\facade\Log;

class OwenPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //  {
        //  "appID":"HR181031122711824",
        //  "currencyCode":"MXN",
        //  "notifyUrl":"http://www.baidu.com",
        //  "outTradeNo":"1682580599788175127",
        //  "payEmail":"xiaoming@email.com",
        //  "payName":"linc",
        //  "payPhone":"68660387",
        //  "productTitle":"test",
        //  "randomNo":"6183",
        //  "totalAmount":"10099",
        //  "tradeCode":"MXN001",
        //  "tradeIP":"211.97.131.201",
        //  "sign":"37BC909F1FFF51CE3AEBAB78DFE4B45D",
        //  }
        $params['appID'] = $this->pay_set['app_id'];//平台唯一标识，即商户号
        $params['currencyCode'] = $this->pay_set['currency'];//币种编码
        $params['notifyUrl'] = $pay_arr['notify_url'];//交易异步回调地址
        $params['outTradeNo'] = $pay_arr['order_sn']; // 商户自身系统的订单号，请确保唯一性
        $params['payEmail'] = 'xiaoming@email.com';
        $params['payName'] = $pay_arr['username'];
        $params['payPhone'] = $pay_arr['phone'];
        $params['productTitle'] = 'test';
        $params['randomNo'] = Util::random(16);#随机字符串
        $params['totalAmount'] = $pay_arr['apply_price'] * 100 . ''; // 订单金额
        $params['tradeCode'] = $this->pay_set['trade_code'];
        $params['tradeIP'] = $pay_arr['pay_ip'];
        $params['payBankCard'] = '123';
        $params['payBankCode'] = 'gcash';
        $params['sign'] = $this->generateSign($params, $this->pay_set['secret_key']);


        Log::write(['Submit_create', "OwenPay", $params], "payment");
        $json = json_encode($params, JSON_UNESCAPED_UNICODE);
        $json = str_replace('\/', '/', $json);
        $data = ['ApplyParams' => urlencode($json)];
        $header = [];
        $res = PayRequest::curlS($this->pay_set['pay_url'], $data, $header);
        Log::write(['Return_create', "OwenPay", $res], "payment");
        $res = json_decode($res, true);
        if (empty($res) || !isset($res['resultCode']) || $res['resultCode'] != '0000') {
            throw new \Exception($res['stateInfo'] ?? '支付信息错误', 0);
        }
        if (!isset($res['payURL'])) {
            throw new \Exception($res['msg'] ?? '支付信息错误', 0);
        }
        $pay_info['pay_url'] = $res['payURL'];
        return $pay_info;
    }


    //获取转账信息
    public function create_withdrawal($pay_arr)
    {
        // {
        //    "accPhone": "xUXKYzWXC+9NUn95Z1TgNQ==",
        //    "appID": "HR181031122711824",
        //    "bankAcctNo": "K9romvUTsIq9IqKqH6+3j2OX31IJnruY",
        //    "bankCode": "CEB",
        //    "bankFirstName": "5dmRuECW+AM=",
        //    "bankLastName": "CJYPoerY+JI=",
        //    "currencyCode": "PHP",
        //    "notifyUrl": "http://www.baidu.com",
        //    "outTradeNo": "BF16850332687235878252465",
        //    "randomNo": "0302171300",
        //    "sign": "40EE9B9D7F554861C5ACD54B0C9ED76A",
        //    "totalAmount": "Sva5QG6cgNM="
        //}
        $b_code = explode('-', $pay_arr['bank_code']);
        if (isset($b_code[1])) {
            $bank_codes = $b_code[0] ?? '';
        } else {
            $bank_codes = $this->pay_set['bank_code'] ?? $pay_arr['bank_code'];
        }
        $params['appID'] = $this->pay_set['app_id'];//平台唯一标识，即商户号
        $params['currencyCode'] = $this->pay_set['currency'];//币种编码
        $params['randomNo'] = Util::random(14);#随机字符串
        $params['outTradeNo'] = $pay_arr['order_sn']; // 商户自身系统的订单号，请确保唯一性
        $params['bankCode'] = $bank_codes;
        if ($pay_arr['account_name']) {
            $params['bankAcctName'] = $this->encrypt3DES($pay_arr['account_name'], $this->pay_set['eds_key']); // 收款人姓名（全名） 若无法区分bankFirstName和bankLastName时，则必传该（全名）字段
        } else {
            $params['bankFirstName'] = $this->encrypt3DES('', $this->pay_set['eds_key']); // 收款人FirstName
            $params['bankLastName'] = $this->encrypt3DES('', $this->pay_set['eds_key']); // 收款人LastName
        }

        $params['bankAcctNo'] = $this->encrypt3DES($pay_arr['bank_number'], $this->pay_set['eds_key']); // 收款人账号
        $params['totalAmount'] = $this->encrypt3DES(intval($pay_arr['amount']*100)."", $this->pay_set['eds_key']); //
        $params['accPhone'] = $this->encrypt3DES($pay_arr['phone'], $this->pay_set['eds_key']); //
        $params['notifyUrl'] = $pay_arr['notify_url'];//交易异步回调地址
        $params['identityNo'] = $pay_arr['bank_number']; //证件号码/税号
        $identityType = "BRBANK";
        if (strtolower($bank_codes) == 'gcash') {
            $identityType = "GCASH";
        }
        if (strtolower($bank_codes) == 'maya') {
            $identityType = "MAYA";
        }
        $params['identityType'] = $identityType; //
        $params['sign'] = $this->generateSign($params, $this->pay_set['secret_key']);
        Log::write(['Submit_withdrawal', "OwenPay", ['CashOutParams' => $params]], "withdrawal");
        $json = json_encode($params, JSON_UNESCAPED_UNICODE);
        $json = str_replace('\/', '/', $json);
        $data = ['CashOutParams' => urlencode($json)];
        Log::write(['Submit_withdrawal', "OwenPay", $data], "withdrawal");
        $header = [];
        $res = PayRequest::curlS($this->pay_set['cash_out_url'], $data, $header);
        Log::write(['Return_withdrawal', "OwenPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['resultCode'] != 0000) {
            throw new \Exception("渠道返回:" . $res['resultMsg'], 0);
        }
        return $res['outTradeNo'];
    }

    private function generateSign($data, $signKey): string
    {
        // 移除 sign 键和空值
        $filteredData = array_filter($data, function ($v, $k) {
            return $v !== '' && $k !== 'sign';
        }, ARRAY_FILTER_USE_BOTH);

        // 按照键名 ASCII 升序排序
        ksort($filteredData);
        $json = str_replace('\/', '/', json_encode($filteredData));
        return strtoupper(md5($json . $signKey));
    }


    //异步回调支付
    public function notify($data)
    {
        if (!isset($data['NoticeParams'])) {
            return "error";
        }
        $data = json_decode($data['NoticeParams'], true);
        $sign = isset($data['sign']) ? $data['sign'] : '';
        unset($data['sign']);
        Log::write(['Notify', "OwenPay", $data], "notify");
        if ($data['payCode'] == '0000') {
            // 0000：成功；
            //0011：失败；
            //0099：未支付
            $sign_str = $this->generateSign($data, $this->pay_set['secret_key']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['outTradeNo'];
            $rsps['trade_sn'] = $data['tradeCode'];
            $rsps['result'] = "SUCCESS";
            $rsps['money'] = $data['totalAmount'] ? $data['totalAmount'] / 100 : 0;
            return $rsps;
        } else {
            $rsps['result'] = "SUCCESS";
            $rsps['money'] = 0;
            return $rsps;
        }
    }


    //异步回调支付
    public function notify_withdrawal($data)
    {

        if (!isset($data['NoticeParams'])) {
            return "error";
        }
        $data = json_decode($data['NoticeParams'], true);
        $sign = isset($data['sign']) ? $data['sign'] : '';
        Log::write(['Notify_Withdrawal', "OwenPay", $data], "withdrawal");
        unset($data['sign']);
        $rsps['status'] = 1;
        // 00：出款成功
        //50：提交失败（出款情况待确认）
        //99：申请待提交
        //01：申请提交成功（未出款）
        //02：出款失败
        //04：代付异常（出款情况待确认）
        //05：未知状态（出款情况待确认）
        //06：申请待审核
        //11 : 出款不明确（出款情况待确认）
        //12：代付驳回（出款失败）
        //13：代付取消（未扣款）
        //1000：代付失败，并退款（出款失败，金额退回余额）
        if ($data['remitResult'] != '00') {
            $rsps['status'] = 2;
        }
        $sign_str = $this->generateSign($data, $this->pay_set['secret_key']);
        if ($sign_str != $sign) {
            $rsps['status'] = 2;
        }
        $rsps['order_sn'] = $data['outTradeNo'];
        $rsps['othr_number'] = $data['outTradeNo'];
        $rsps['msg'] = '';
        $rsps['result'] = "SUCCESS";
        return $rsps;
    }


    private static $algorithm = 'DES-EDE3';

    // 转换成base64编码
    public static function byte2Base64($bytes)
    {
        return base64_encode($bytes);
    }

    // 3DES加密
    public static function encrypt3DES($value, $key)
    {
        $encrypted = self::encryptMode($key, $value);
        return self::byte2Base64($encrypted);
    }

    // key为加密密钥，长度为24字节
    // src为被加密的数据缓冲区（源）
    public static function encryptMode($key, $src)
    {
//        $methods = openssl_get_cipher_methods();
//        dd($methods);
        try {
            // ECB模式不需要IV
            $encrypted = openssl_encrypt($src, self::$algorithm, $key, OPENSSL_RAW_DATA);
            return $encrypted;
        } catch (Exception $e) {
            echo 'Exception: ', $e->getMessage(), "\n";
        }
        return null;
    }

    // 3DES解密
    public static function decrypt3DES($encryptedBase64, $key)
    {
        try {
            $encryptedData = base64_decode($encryptedBase64);
            // ECB模式不需要IV
            $decrypted = openssl_decrypt($encryptedData, self::$algorithm, $key, OPENSSL_RAW_DATA);
            return $decrypted;
        } catch (Exception $e) {
            echo 'Exception: ', $e->getMessage(), "\n";
        }
        return null;
    }
}
