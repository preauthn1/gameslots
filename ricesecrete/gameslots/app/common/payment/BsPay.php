<?php

namespace app\common\payment;

use app\common\model\CurrencyModel;
use think\facade\Log;

class BsPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
        //配置参数
//        $pay_set = [
//            'merchantId' => '10008',//商户号
//            'currencyCode' => 'USDT',//货币单位
//            'coinType' => 'USDT_TRC20',//代收订单实际支付的订单币种
//            'language' => 'en',//语言
//            'signType' => 'MD5',//加密类型
//            'app_key' => 'q65lz8RCBI5aQ9GtczbL6Brk2zTs7S80pAmtAJLD',//秘钥
//            'version' => '2.0.0',//版本
//            'url' => 'https://gateway.bishengusdt.com/api/coin/payOrder/createCashier',//代收网关
//            'withdrawal_url' => 'https://gateway.bishengusdt.com/api/coin/remitOrder/create',//代付网关
//        ];
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //{
        //"amount": "100",
        //"callbackCurrencyCode": "USDT",
        //"currencyCode": "USDT",
        //"coinType": "USDT_TRC20",
        //"merchantId": "10008",
        //"merchantOrderNo": "20230630167005",
        //"notifyUrl": "https://www.baidu.com",
        //"signType": "MD5",
        //"sign": "V6k+ZekXkJuDHiYEAAjyD4rP2+DxqKNHOk5XWfRVL6i5psTy/otAybLc87Sev6YNWyDjHPvgU+fAXT2H+7jJJmD5ZzzyCIRUBL18WZ/+7sADEThGQAQouJcxFU5i1jAMvkcnxJvaqBJTZ7Xzl7TsvntO2OrODfgjnrvz/SqBvY8=",
        //"version": "2.0.0"
        //}
        $params['merchantId'] = $this->pay_set['merchantId'];//商户号
        $params['callbackCurrencyCode'] = $this->pay_set['currencyCode'];//CNY、USDT
        $params['callbackExchangeRate'] = $this->pay_set['callbackExchangeRate'];// 汇率
        $params['currencyCode'] = $this->pay_set['currencyCode'];//CNY、USDT
        $params['coinType'] = $this->pay_set['coinType'];//代收订单实际支付的订单币种，由币种和地址协议拼接组成，如：USDT_TRC20，CNY（如果使用CNY那么则会按照汇率转换为U进行代收）
        $params['merchantOrderNo'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = floatval(round($pay_arr['apply_price'], 2)); // 订单金额
        $params['language'] = $this->pay_set['language'];//语言 en（英语）， hi（印地语），jp（日语），phl（菲律宾语），pt_br（葡萄牙语_巴西），th（泰语），zh（中文简体），eg（埃及阿拉伯语）
        $params['notifyUrl'] = $pay_arr['notify_url']; // 异步通知地址
        $params['returnUrl'] = $pay_arr['call_domain']; // 重定向
        $params['signType'] = $this->pay_set['signType'];//RSA,MD5 （默认RSA）
        $params['version'] = $this->pay_set['version'];// 2.0.0
        $params['sign'] = $this->generateSign($params, $this->pay_set['app_key']);
        Log::write(['Submit_create', "BsPay", $params], "payment");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8'
        );
        $res = PayRequest::curlS($this->pay_set['url'], $req, $header);
        Log::write(['Return_create', "BsPay", $res], "payment");
        $res = json_decode($res, true);
        //	"code":"0",
        //	"exchangeRate":"1",
        //	"msg":"操作成功",
        //	"payUrl":"https://upqp.bishengusdt.com?orderNo=CZ202502052051031224651",
        //	"sign":"0f937adeb40680743c52f97fe28cfdad"
        if (empty($res) || !isset($res['code']) || $res['code'] != '0') {
            throw new \Exception($res['msg'] ?? '支付信息错误', 0);
        }
        if (!isset($res['payUrl'])) {
            throw new \Exception($res['msg'] ?? '支付信息错误', 0);
        }
        $pay_info['pay_url'] = $res['payUrl'];
        return $pay_info;
    }


    //获取转账信息
    public function create_withdrawal($pay_arr)
    {
        //{
        //"amount": "100",
        //"coinType": "USDT_TRC20",
        //"bookingAddress": "TPHWprt9oCAW5Kaia3enbYcz4idJY6oyTj",
        //"merchantId": "80008",
        //"callbackCurrencyCode": "USDT",
        //"merchantOrderNo": "20230630202003",
        //"notifyUrl": "http://www.baidu.com",
        //"sign": "kqzun1v2Iw1nAr9bYzKsRuwKupKXppwNFVW34sLqCD7GmuXAaw1jvcXqBhDD9camhdt/1Yq1D7AyDWDOg60DHAigrbULuek+ZlwiRRiFJOVZTbJRnkewmfDXCVbPOfIGf0NTFjxcJqabL/5SKngwDEGav65+NlJhtgHGfo5UvoI=",
        //"version": "2.0.0"
        //}
        $params['merchantId'] = $this->pay_set['merchantId'];//商户号
        $params['merchantOrderNo'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = floatval(round($pay_arr['amount']/$this->pay_set['callbackExchangeRate'], 2)); // 订单金额
        $params['callbackCurrencyCode'] = $this->pay_set['currencyCode'];//CNY、USDT
        $params['callbackExchangeRate'] = $this->pay_set['callbackExchangeRate'];// 汇率
        $params['currencyCode'] = $this->pay_set['currencyCode'];//CNY、USDT
        $params['coinType'] = $this->pay_set['coinType'];//代收订单实际支付的订单币种，由币种和地址协议拼接组成，如：USDT_TRC20，CNY（如果使用CNY那么则会按照汇率转换为U进行代收）
        $params['bookingAddress'] = $pay_arr['bank_number']; //USDT提现地址
        $params['notifyUrl'] = $pay_arr['notify_url']; // 异步通知地址
        $params['version'] = $this->pay_set['version'];// 2.0.0
        $params['signType'] = $this->pay_set['signType'];//RSA,MD5 （默认RSA）
        $params['sign'] = $this->generateSign($params, $this->pay_set['app_key']);
        Log::write(['Submit_withdrawal', "BsPay", $params], "withdrawal");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8'
        );
        $res = PayRequest::curlS($this->pay_set['withdrawal_url'], $req, $header);
        Log::write(['Return_withdrawal', "BsPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['code'] != 0) {
            throw new \Exception("渠道返回:" . $res['msg'], 0);
        }
        return $res['merchantOrderNo'];
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
        //merchantOrderNo	true	商户订单号
        //merchantId	true	平台给定商户唯一标识	例：10001
        //amount	true	应收金额	单位：订单币种
        //coinType	true	订单币种	代付订单实际支付的订单币种，由币种和地址协议拼接组成，如：USDT_TRC20
        //payCoinAmount	true	实收金额	单位：订单币种
        //最多支持两位小数，如：100.01
        //callbackCurrencyCode	true	回调币种
        //callbackOrderAmount	true	回调金额	单位：回调币种（如果用CNY计算，以callbackOrderAmount回调金额上分。）
        //supplementOrderState	true	补单状态	0未补单、1待审核、2审核通过、-1 审核拒绝
        //supplementOrderRemark	true	补单备注
        //status	true	订单支付状态	0：处理中，1：成功，2：失败
        //sign	true	签名	参考签名规则
        $sign = isset($data['sign']) ? $data['sign'] : '';
        unset($data['sign']);
        Log::write(['Notify', "BsPay", $data], "notify");
        if ($data['status'] == '1') {
            $sign_str = $this->generateSign($data, $this->pay_set['app_key']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['merchantOrderNo'];
            $rsps['trade_sn'] = $data['merchantOrderNo'];
            $rsps['result'] = "success";
            $rsps['money'] = $data['amount'] ? $data['amount'] : 0;
            return $rsps;
        } else {
            $rsps['result'] = "success";
            $rsps['money'] = 0;
            return $rsps;
        }
    }


    //异步回调支付
    public function notify_withdrawal($data)
    {
        //merchantOrderNo	true	商户订单号
        //merchantId	true	平台给定商户唯一标识	例：10001
        //exchangeRate	true	汇率
        //amount	true	订单金额	单位：订单币种
        //coinType	true	订单币种	代付订单实际支付的订单币种，由币种和地址协议拼接组成，如：USDT_TRC20
        //remitCoinAmount	true	出币数量	单位：订单币种
        //最多支持两位小数，如：100.01
        //callbackCurrencyCode	true	回调币种
        //callbackOrderAmount	true	回调金额	单位：回调币种（如果用CNY计算，以callbackOrderAmount回调金额上分。）
        //status	true	订单支付状态	0：处理中，1：成功，2：失败
        //sign	true	签名	参考签名规则
        $sign = isset($data['sign']) ? $data['sign'] : '';
        Log::write(['Notify_Withdrawal', "BsPay", $data], "withdrawal");
        unset($data['sign']);
        $rsps['status'] = 1;
        if ($data['status'] != '1') {
            $rsps['status'] = 2;
        }
        $sign_str = $this->generateSign($data, $this->pay_set['app_key']);
        if ($sign_str != $sign) {
            $rsps['status'] = 2;
        }
        $rsps['order_sn'] = $data['merchantOrderNo'];
        $rsps['othr_number'] = $data['merchantOrderNo'];
        $rsps['msg'] = '';
        $rsps['result'] = "success";
        return $rsps;
    }
}