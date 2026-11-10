<?php

namespace app\common\payment;

use think\facade\Log;

class DayPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //parter    是    String    接口调用ID
        //value    是    String    代收金额(单位元)
        //type    是    String    支付类型 GCash扫码--GCashWAP  PayMaya--Maya
        //orderid    是    String    订单号
        //notifyurl    是    String    异步通知地址, 最长支持200个字符
        //callbackurl    是    String    支付成功后跳转到该页面
        //sign    是    String    签名
        $params['parter'] = $this->pay_set['parter'];//商户号
        $params['orderid'] = $pay_arr['order_sn']; // 商户订单号
        $params['value'] = floatval($pay_arr['apply_price']); // 订单金额
        $params['type'] = $this->pay_set['type']; // 通道类型 paymaya直连填paymaya
        $params['notifyurl'] = $pay_arr['notify_url']; // 异步通知地址
        $params['callbackurl'] = $pay_arr['call_domain']; // 重定向
        $params['sign'] = $this->generateSign($params, $this->pay_set['SecretKey']);
        Log::write(['Submit_create', "DayPay", $params], "payment");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8',
        );
        $res = PayRequest::curlS($this->pay_set['url'], $req, $header);
        Log::write(['Return_create', "DayPay", $res], "payment");
        $res = json_decode($res, true);
        if (empty($res) || !isset($res['code']) || $res['code'] != 200) {
            throw new \Exception($res['info'] ?? '支付信息错误', 0);
        }
        if (!isset($res['param']['payment_url'])) {
            throw new \Exception($res['info'] ?? '支付信息错误', 0);
        }
        $pay_info['pay_url'] = $res['param']['payment_url'];
        return $pay_info;
    }


    //获取转账信息
    public function create_withdrawal($pay_arr)
    {
        //parter 是String 接口调用ID
        //order_no 是String 付款订单号
        //type 是String 支付类型
        //name 是String 收款人员名称
        //account_number 是String 收款账号
        //money 是String 支付金额
        //notify_url 是String 支付成功回调地址
        //sign 是String 签名
        $b_code = explode('-', $pay_arr['bank_code']);
        if (isset($b_code[1])) {
            $bank_codes = $b_code[0] ?? '';
        } else {
            $bank_codes = $this->pay_set['bank_code'] ?? $pay_arr['bank_code'];
        }
        $params['parter'] = $this->pay_set['parter'];//商户号
        $params['order_no'] = $pay_arr['order_sn']; // 商户订单号
        $params['money'] = floatval($pay_arr['amount']); // 订单金额
        $params['type'] = $bank_codes;//银行代码
        $params['account_number'] = $pay_arr['bank_number']; //银行卡号
        $params['name'] = $pay_arr['account_name']; //姓名
        $params['notify_url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['sign'] = $this->generateSign($params, $this->pay_set['SecretKey']);
        Log::write(['Submit_withdrawal', "DayPay", $params], "withdrawal");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8',
        );
        $res = PayRequest::curlS($this->pay_set['withdrawal_url'], $req, $header);
        Log::write(['Return_withdrawal', "DayPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['code'] != 200) {
            throw new \Exception("渠道返回:" . $res['info'], 0);
        }
        return $params['order_no'];
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
        $str = rtrim($str, '&'); // 去除末尾的 &
        $str = $str . "&key=" . $signKey;
        //生成签名
        return md5($str);
    }

    //异步回调支付
    public function notify($data)
    {
        //订单状态:未支付=0;支付中=10;支付成功=20;支付失败=30。一般成功、失败时才会回调
        $sign = isset($data['sign']) ? $data['sign'] : '';
        unset($data['sign']);
        Log::write(['Notify', "DayPay", $data], "notify");
        if ($data['opstate'] == '1') {
            $sign_str = $this->generateSign($data, $this->pay_set['SecretKey']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['orderid'];
            $rsps['trade_sn'] = $data['orderid'];
            $rsps['result'] = "success";
            $rsps['money'] = $data['ovalue'] ? $data['ovalue'] : 0;
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
        $sign = isset($data['sign']) ? $data['sign'] : '';
        Log::write(['Notify_Withdrawal', "DayPay", $data], "withdrawal");
        unset($data['sign']);
        $rsps['status'] = 1;
        if ($data['opstate'] != '1') {
            $rsps['status'] = 2;
        }
        if ($data['opstate'] == '1') {
            $sign_str = $this->generateSign($data, $this->pay_set['SecretKey']);
            if ($sign_str != $sign) {
                $rsps['status'] = 2;
            }
        }
        $rsps['order_sn'] = $data['orderid'];
        $rsps['othr_number'] = $data['orderid'];
        $rsps['msg'] = '';
        $rsps['result'] = "success";
        return $rsps;
    }
}