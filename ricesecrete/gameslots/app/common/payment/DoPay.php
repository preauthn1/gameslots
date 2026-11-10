<?php

namespace app\common\payment;

use think\facade\Log;

class DoPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //mchNo 商户号 String 必填 商户签约时，支付平台分配的唯一商户号。
        //time 请求时间 String 必填 请求时间（北京时间），格式为年月日时分秒(如:2022-07-08 13:13:34)
        //fee 提交金额 String 必填 支付请求金额。
        //orderNo 订单号 String 必填 商户系统里的订单号
        //type 通道类型 String 必填 支付通道的类型: gcash直连填写gcash，扫码填写gcash_qr；paymaya直连填
        //写paymaya
        //notifyUrl 回调地址 String 必填 会员支付成功时会通知的地址。
        //backUrl 跳转地址 String 非必填 直连通道之后成功后跳转地址。
        //notifytype 通知格式 String 非必填 填固定值 json 时通知回调时数据为json ,不填时通知则为form-data 格式
        //sign 签名 String 必填 MD5 签名结果，请参阅支付结果通知接口的签名算法。
        //设置北京时间时区
        date_default_timezone_set('Asia/Shanghai');
        $params['mchNo'] = $this->pay_set['mchNo'];//商户号
        $params['orderNo'] = $pay_arr['order_sn']; // 商户订单号
        $params['time'] = date('Y-m-d H:i:s'); // 格式为年月日时分秒(如:2022-07-08 13:13:34)
        $params['fee'] = floatval($pay_arr['apply_price']); // 订单金额
        $params['type'] = $this->pay_set['type']; // 通道类型 paymaya直连填paymaya
        $params['notifyUrl'] = $pay_arr['notify_url']; // 异步通知地址
        $params['backUrl'] = $pay_arr['call_domain']; // 重定向
        $params['sign'] = $this->generateSign($params, $this->pay_set['SecretKey']);
        Log::write(['Submit_create', "DoPay", $params], "payment");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8',
        );
        $res = PayRequest::curlS($this->pay_set['url'], $req, $header);
        Log::write(['Return_create', "DoPay", $res], "payment");
        $res = json_decode($res, true);
        if (empty($res) || !isset($res['code']) || $res['code'] != 1) {
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
        //mchNo 商户号 String 必填 商户签约时，支付平台分配的唯一商户号。
        //fee 提交金额 String 必填 代付请求金额。
        //notifyUrl 回调地址 String 必填 异步通知商戶回調地址，用以通知結果。
        //orderNo 订单号 String 必填 商户系统里的订单号
        //type 类型 String 必填 代付通道的类型 [gcash代付填写gcash_dpay, paymaya代付填写paymaya_dpay,bank代付
        //填写bank_dpay
        //time 请求时间 String 必填 请求时间（北京时间），格式为年月日时分秒(如:2022-07-08 13:13:34)
        //notifytype 通知格式 String 非必填 填固定值 json 时通知回调时数据为json ,不填时通知则为form-data 格式
        //bankName 收款人姓
        //名
        //String 必填 收款人姓名請填「Gcash收款手機號」或者「Paymaya收款手機號」
        //若是代付至銀行請填入正確姓名
        //bankAccount
        //收款人账
        //号
        //String 必填 收款人账号請填「Gcash收款手機號」或者「Paymaya收款手機號」
        //若是代付至銀行請填入正確帳號
        //bankCode 银行编码 String 非必填 gcash代付和paymaya代付此字段留空不填，银行卡代付请填写对应的银行代码，查看附录
        //sign 签名 String 必填 MD5 签名结果，请参阅支付结果通知接口的签名算法。
        //设置北京时间时区
        date_default_timezone_set('Asia/Shanghai');
//        $b_code = explode('-', $pay_arr['bank_code']);
//        if (isset($b_code[1])) {
//            $bank_codes = $b_code[0] ?? '';
//        } else {
//            $bank_codes = $this->pay_set['bank_code'] ?? $pay_arr['bank_code'];
//        }
//        if (strtolower($bank_codes) == 'gcash') {
//            $bank_codes = 'gcash';
//        }
        $params['mchNo'] = $this->pay_set['mchNo'];//商户号
        $params['orderNo'] = $pay_arr['order_sn']; // 商户订单号
        $params['fee'] = floatval($pay_arr['amount']); // 订单金额
        $params['type'] = $this->pay_set['withdrawal_type'];//代付类型
        $params['time'] = date('Y-m-d H:i:s'); // 格式为年月日时分秒(如:2022-07-08 13:13:34)
        $params['bankAccount'] = $pay_arr['bank_number']; //银行卡号
        $params['bankName'] = $pay_arr['account_name']; //姓名
//        $params['bankCode'] = $bank_codes; //银行编码
        $params['notifyUrl'] = $pay_arr['notify_url']; // 异步通知地址
        $params['sign'] = $this->generateSign($params, $this->pay_set['SecretKey']);
        Log::write(['Submit_withdrawal', "DoPay", $params], "withdrawal");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8',
        );
        $res = PayRequest::curlS($this->pay_set['withdrawal_url'], $req, $header);
        Log::write(['Return_withdrawal', "DoPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['code'] != 1) {
            throw new \Exception("渠道返回:" . $res['msg'], 0);
        }
        return $res['data']['ordernum'];
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
        Log::write(['Notify', "DoPay", $data], "notify");
        if ($data['status'] == '20') {
            $sign_str = $this->generateSign($data, $this->pay_set['SecretKey']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['mchOrdernum'];
            $rsps['trade_sn'] = $data['ordernum'];
            $rsps['result'] = "success";
            $rsps['money'] = $data['fee'] ? $data['fee'] : 0;
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
        Log::write(['Notify_Withdrawal', "DoPay", $data], "withdrawal");
        unset($data['sign']);
        $rsps['status'] = 1;
        if ($data['status'] != '20') {
            $rsps['status'] = 2;
        }
        if ($data['status'] == '20') {
            $sign_str = $this->generateSign($data, $this->pay_set['SecretKey']);
            if ($sign_str != $sign) {
                $rsps['status'] = 2;
            }
        }
        $rsps['order_sn'] = $data['mchOrdernum'];
        $rsps['othr_number'] = $data['ordernum'];
        $rsps['msg'] = '';
        $rsps['result'] = "success";
        return $rsps;
    }
}