<?php

namespace app\common\payment;

use app\common\model\CurrencyModel;
use think\facade\Log;

class OsPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
        //配置参数
//        $pay_set = [
//            'merchant' => 'BL999',//商户号
//            'payment_type' => '1',//1=>扫码 , 2=> 网站 , 3=> 直連 , 7=>原生渠道
//            'bank_code' => 'gcash',//类型 直連gcash固定值gcash、直連paymaya固定值PMP
//            'secret_Key' => 'REDACTED',//秘钥
//            'url' => 'https://99pay.la2568.site/api/transfer',//代收网关
//            'withdrawal_url' => 'https://99pay.la2568.site/api/daifu',//代付网关
//        ];
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //{
        //"merchant": "BL999",
        //"payment_type": "1",//1=>扫码 , 2=> 网站 , 3=> 直連 , 7=>原生渠道
        //"amount": "100",
        //"order_id": "20230630167005",
        //"bank_code": "gcash",//直連gcash固定值gcash、直連paymaya固定值PMP
        //"callback_url": "https://www.baidu.com",
        //"return_url": "https://www.baidu.com",
        //"sign": "0f937adeb40680743c52f97fe28cfdad",//MD5 签名结果，请参阅支付结果通知接口的签名算法。
        //}
        $params['merchant'] = $this->pay_set['merchant'];//商户号
        $params['payment_type'] = $this->pay_set['payment_type'];//1=>扫码 , 2=> 网站 , 3=> 直連 , 7=>原生渠道
        $params['bank_code'] = $this->pay_set['bank_code'];//类型 直連gcash固定值gcash、直連paymaya固定值PMP
        $params['order_id'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = floatval(round($pay_arr['apply_price'], 2)); // 订单金额
        $params['callback_url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['return_url'] = $pay_arr['call_domain']; // 重定向
        $params['sign'] = $this->generateSign($params, $this->pay_set['secret_Key']);
        Log::write(['Submit_create', "OsPay", $params], "payment");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8'
        );
        $res = PayRequest::curlS($this->pay_set['url'], $req, $header);
        Log::write(['Return_create', "OsPay", $res], "payment");
        $res = json_decode($res, true);
        //	"status":"1",
        //	"message":"操作成功",
        //	"order_id":"20230630167005",
        //	"amount":"100",
        //	"redirect_url":"https://upqp.bishengusdt.com?orderNo=CZ202502052051031224651",
        //	"qrcode_url":"https://upqp.bishengusdt.com?orderNo=CZ202502052051031224651",
        //	"gcash_qr_url":"https://upqp.bishengusdt.com?orderNo=CZ202502052051031224651",
        if (empty($res) || !isset($res['status']) || $res['status'] != '1') {
            throw new \Exception($res['message'] ?? '支付信息错误', 0);
        }
        if (!isset($res['redirect_url'])) {
            throw new \Exception($res['message'] ?? '支付信息错误', 0);
        }
        $pay_info['pay_url'] = $res['redirect_url'];
        return $pay_info;
    }


    //获取转账信息
    public function create_withdrawal($pay_arr)
    {
        //merchant 商户号 String 必填 商户签约时，支付平台分配的唯一商户号。
        //total_amount 提交金额 Number 必填 代付请求金额。
        //callback_url 回调位址 String 必填 异步通知商戶回調位址，用以通知結果。
        //order_id 订单号 String 必填 商户系统里的订单号
        //bank 银行代码 String 必填 会员代付时使用的出款银行 「Gcash請填gcash」若是代付至銀行 請填入正確銀行代碼，文檔最後有提供銀行代碼
        //bank_card_name 收款人姓名 String 必填 收款人姓名請填 「Gcash收款手機號」若是代付至銀行 請填入正確姓名
        //bank_card_account 收款人账号 Number 必填 收款人账号請填「Gcash收款手機號」若是代付至銀行 請填入正確帳號
        //bank_card_remark IFSC String 必填 收款人IFSC請填「Gcash收款手機號」如无请填固定值「no」
        //sign 签名 String 必填 MD5 签名结果，请参阅支付结果通知接口的签名算法。
        $b_code = explode('-', $pay_arr['bank_code']);
        if (isset($b_code[1])) {
            $bank_codes = $b_code[0] ?? '';
        } else {
            $bank_codes = $this->pay_set['bank_code'] ?? $pay_arr['bank_code'];
        }
        $params['merchant'] = $this->pay_set['merchant'];//商户号
        $params['total_amount'] = floatval(round($pay_arr['amount'], 2)); // 订单金额
        $params['callback_url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['order_id'] = $pay_arr['order_sn']; // 商户订单号
        $params['bank'] = $bank_codes;//银行代码
        $params['bank_card_name'] = $pay_arr['account_name']; //姓名
        $params['bank_card_account'] = $pay_arr['bank_number']; //银行卡号
        $params['bank_card_remark'] = 'no'; //
        $params['sign'] = $this->generateSign($params, $this->pay_set['secret_Key']);
        Log::write(['Submit_withdrawal', "OsPay", $params], "withdrawal");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8'
        );
        $res = PayRequest::curlS($this->pay_set['withdrawal_url'], $req, $header);
        //status 处理码 String 取值为1 表示校验成功，其他錯誤碼为0。
        //message 回传资料 String 支付请求成功回传success，错误则传回错误资讯。
        Log::write(['Return_withdrawal', "OsPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['status'] != '1') {
            throw new \Exception("渠道返回:" . $res['message'], 0);
        }
        return $pay_arr['order_sn'];
    }

    private function generateSign($data, $signKey)
    {
        // 移除 sign 键和空值
        $filteredData = array_filter($data, function ($v, $k) {
            return $v !== '' && $k !== 'sign';
        }, ARRAY_FILTER_USE_BOTH);

        // 按照键名 ASCII 升序排序
        ksort($filteredData);

        // 格式化参数并生成签名字符串
        $str = '';
        foreach ($filteredData as $k => $val) {
            $str .= $k . '=' . $val . '&';
        }
        $md5 = md5($str . "key=" . $signKey);
        return strtolower($md5);
    }


    //异步回调支付
    public function notify($data)
    {
        //{
        //	"order_id": "dsfsdfdsf1608044474",
        //	"amount": "100.00",
        //	"merchant": "merchant",
        //	"message": "成功",
        //	"status": 5,//支付结果：5 - 成功 : 3 – 失败。
        //	"sign": "97e06225375f75d0ba88c12207035a34"
        //}
        $sign = isset($data['sign']) ? $data['sign'] : '';
        unset($data['sign']);
        Log::write(['Notify', "OsPay", $data], "notify");
        if ($data['status'] == '5') {
            $sign_str = $this->generateSign($data, $this->pay_set['secret_Key']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['order_id'];
            $rsps['trade_sn'] = $data['order_id'];
            $rsps['result'] = "SUCCESS";
            $rsps['money'] = $data['amount'] ? $data['amount'] : 0;
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
        //{
        //	"order_id": "dsfsdfdsf1608044474",
        //	"amount": "100.00",
        //	"merchant": "merchant",
        //	"message": "成功",
        //	"status": 5,//支付结果：5 - 成功 : 3 – 失败。
        //	"sign": "97e06225375f75d0ba88c12207035a34"
        //}
        $sign = isset($data['sign']) ? $data['sign'] : '';
        Log::write(['Notify_Withdrawal', "OsPay", $data], "withdrawal");
        unset($data['sign']);
        $rsps['status'] = 1;
        if ($data['status'] != '5') {
            $rsps['status'] = 2;
        }
        $sign_str = $this->generateSign($data, $this->pay_set['secret_Key']);
        if ($sign_str != $sign) {
            $rsps['status'] = 2;
        }
        $rsps['order_sn'] = $data['order_id'];
        $rsps['othr_number'] = $data['order_id'];
        $rsps['msg'] = '';
        $rsps['result'] = "SUCCESS";
        return $rsps;
    }
}