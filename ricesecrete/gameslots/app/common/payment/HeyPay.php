<?php

namespace app\common\payment;

use think\facade\Log;

class HeyPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //{
        //    "appid": "58aae534cd7e1afe",
        //    "amount": 10000,
        //    "order_no": "1717653489",
        //    "notify_url": "http://irlws.ye/efxnpyghe",
        //    "timestamp": 1717653489,
        //    "jump_url": "http://xxxcydorqf.coop/lmnjt",
        //    "pay_method": "GC",
        //    "sign": "proident"
        //}
        $params['appid'] = $this->pay_set['app_id'];//商户号
        $params['order_no'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = intval($pay_arr['apply_price'] * 100); // 订单金额
        $params['timestamp'] = time();
        $params['notify_url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['jump_url'] = $pay_arr['call_domain']; // 重定向
        $params['pay_method'] = $this->pay_set['pay_method'];
        $params['sign'] = $this->generateSign($params, $this->pay_set['app_key']);
        Log::write(['Submit_create', "HeyPay", $params], "payment");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8'
        );
        $res = PayRequest::curlS($this->pay_set['url'], $req, $header);
        Log::write(['Return_create', "HeyPay", $res], "payment");
        $res = json_decode($res, true);
        if (empty($res) || !isset($res['code']) || $res['code'] != '0') {
            throw new \Exception($res['msg'] ?? '支付信息错误', 0);
        }
        if (!isset($res['data']['pay_url'])) {
            throw new \Exception($res['msg'] ?? '支付信息错误', 0);
        }
        $pay_info['pay_url'] = $res['data']['pay_url'];
        return $pay_info;
    }


    //获取转账信息
    public function create_withdrawal($pay_arr)
    {
        $b_code = explode('-', $pay_arr['bank_code']);
        if (isset($b_code[1])) {
            $bank_codes = $b_code[0] ?? '';
        } else {
            $bank_codes = $this->pay_set['bank_code'] ?? $pay_arr['bank_code'];
        }
        $params['appid'] = $this->pay_set['app_id'];//商户号
        $params['order_no'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = intval($pay_arr['amount'] * 100); // 订单金额
        $params['timestamp'] = time();
        $params['pay_no'] = $pay_arr['bank_number']; //银行卡号
        $params['pay_name'] = $pay_arr['account_name']; //姓名
        $params['pay_code'] = $bank_codes; //银行编码
        $params['notify_url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['sign'] = $this->generateSign($params, $this->pay_set['app_key']);
        Log::write(['Submit_withdrawal', "HeyPay", $params], "withdrawal");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8'
        );
        $res = PayRequest::curlS($this->pay_set['withdrawal_url'], $req, $header);
        Log::write(['Return_withdrawal', "HeyPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['code'] != 0) {
            throw new \Exception("渠道返回:" . $res['msg'], 0);
        }
        return $res['data']['order_no'];
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

        // 使用 hash_hmac 生成签名
        return base64_encode(hash_hmac("sha1", $str, $signKey, true));
    }


    //异步回调支付
    public function notify($data)
    {
        //GENERATED	订单已创建
        //SUCCESS	订单交易成功
        //FAIL	订单交易失败
        //EXPIRED	订单已过期
        //RETURN	订单已退款
        //OTHER	其他
        //UNKNOWN	未知
        $sign = isset($data['sign']) ? $data['sign'] : '';
        unset($data['sign']);
        Log::write(['Notify', "HeyPay", $data], "notify");
        $data['appid'] = $this->pay_set['app_id'];
        if ($data['status'] == 'SUCCESS') {
            $sign_str = $this->generateSign($data, $this->pay_set['app_key']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['merchant_no'];
            $rsps['trade_sn'] = $data['plantform_no'];
            $rsps['result'] = "SUCCESS";
            $rsps['money'] = $data['amount'] ? $data['amount'] / 100 : 0;
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
        $sign = isset($data['sign']) ? $data['sign'] : '';
        Log::write(['Notify_Withdrawal', "HeyPay", $data], "withdrawal");
        unset($data['sign']);
        $data['appid'] = $this->pay_set['app_id'];
        $rsps['status'] = 1;
        if ($data['status'] != 'SUCCESS') {
            $rsps['status'] = 2;
        }
        $sign_str = $this->generateSign($data, $this->pay_set['app_key']);
        if ($sign_str != $sign) {
            $rsps['status'] = 2;
        }
        $rsps['order_sn'] = $data['merchant_no'];
        $rsps['othr_number'] = $data['plantform_no'];
        $rsps['msg'] = '';
        $rsps['result'] = "SUCCESS";
        return $rsps;
    }
}