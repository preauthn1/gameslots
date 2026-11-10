<?php

namespace app\common\payment;

use think\facade\Log;

class BtCashPay
{
    private $pay_set = [];

    public function __construct($pay_set, $domain)
    {
        $this->pay_set = $pay_set;
    }

    //获取支付信息
    public function create($pay_arr)
    {
        //channel_cashflow_id	是	uint32	通道资讯id
        //amount	是	string	订单金额 0.0001~2147483646.9999 (依据通道限额)
        //order_number	是	string	商户单号, 最大 50 字, 可接受英文大小写、数字、底线( _ )、破折号 ( - )
        //url	是	string	回调网址
        //redirect_url	是	string	交易后转跳至商户网页的网址
        //from_currency	否	string	来源币别 (仅提供 TRC20, ERC20 使用)
        //如 PHP to USDT, 请填入 PHP
        $params['channel_cashflow_id'] = $this->pay_set['channel_id'];//通道资讯id
        $params['order_number'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = floatval($pay_arr['apply_price']); // 订单金额
        $params['url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['redirect_url'] = $pay_arr['call_domain']; // 重定向
        $params['from_currency'] = $this->pay_set['currency']; // 来源币别
        Log::write(['Submit_create', "BtCashPay", $params], "payment");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8',
            'Authorization: Bearer ' . $this->pay_set['token'],
        );
        $res = PayRequest::curlS($this->pay_set['url'], $req, $header);
        Log::write(['Return_create', "BtCashPay", $res], "payment");
        $res = json_decode($res, true);
        if (empty($res) || !isset($res['code']) || $res['code'] != '0') {
            throw new \Exception($res['errors']['message'] ?? '支付信息错误', 0);
        }
        if (!isset($res['data']['url'])) {
            throw new \Exception($res['errors']['message'] ?? '支付信息错误', 0);
        }
        $pay_info['pay_url'] = $res['data']['url'];
        return $pay_info;
    }


    //获取转账信息
    public function create_withdrawal($pay_arr)
    {
        //channel_cashflow_id	是	uint32	通道资讯id
        //amount	是	string	订单金额 0.0001~2147483646.9999 (依据通道限额)
        //payee_name	是	string	收款人姓名
        //payee_bank_code	是	string	银行代码 (参照附录)
        //payee_bank_account	是	string	银行帐户
        //payee_phone	否	string	收款人电话 (对接 韩元 时必填)
        //order_number	是	string	商户单号, 最大 50 字, 可接受英文大小写、数字、底线( _ )、破折号 ( - )
        //url	是	string	回调网址
        //from_currency	否	string	来源币别 (仅提供 TRC20, ERC20 使用)
        //如 PHP to USDT, 请填入 PHP
        $b_code = explode('-', $pay_arr['bank_code']);
        if (isset($b_code[1])) {
            $bank_codes = $b_code[0] ?? '';
        } else {
            $bank_codes = $this->pay_set['bank_code'] ?? $pay_arr['bank_code'];
        }
        $params['channel_cashflow_id'] = $this->pay_set['channel_withdrawal_id'];//通道资讯id
        $params['order_number'] = $pay_arr['order_sn']; // 商户订单号
        $params['amount'] = floatval($pay_arr['amount']); // 订单金额
        $params['payee_bank_account'] = $pay_arr['bank_number']; //银行卡号
        $params['payee_name'] = $pay_arr['account_name']; //姓名
        $params['payee_bank_code'] = $bank_codes; //银行编码
        $params['url'] = $pay_arr['notify_url']; // 异步通知地址
        $params['from_currency'] = $this->pay_set['currency']; // 来源币别
        Log::write(['Submit_withdrawal', "BtCashPay", $params], "withdrawal");
        $req = json_encode($params, JSON_UNESCAPED_UNICODE);
        $header = array(
            'Accept: application/json',
            'Content-Type: application/json;charset=utf-8',
            'Authorization: Bearer ' . $this->pay_set['token'],
        );
        $res = PayRequest::curlS($this->pay_set['withdrawal_url'], $req, $header);
        Log::write(['Return_withdrawal', "BtCashPay", $res], "withdrawal");
        $res = json_decode($res, true);
        if (empty($res) || $res['code'] != 0) {
            throw new \Exception("渠道返回:" . $res['errors']['message'], 0);
        }
        return $res['data']['number'];
    }

    //异步回调支付
    public function notify($data)
    {
        //状态 (padding: 等待处理, success: 交易成功, fail: 交易失败)
        if ($data['status'] == 'success') {
            $rsps['order_sn'] = $data['order_number'];
            $rsps['trade_sn'] = $data['number'];
            $rsps['result'] = "SUCCESS";
            $rsps['money'] = $data['amount'] ? $data['amount'] : 0;
            return $rsps;
        } else {
            $rsps['result'] = "OK";
            $rsps['money'] = 0;
            return $rsps;
        }
    }


    //异步回调支付
    public function notify_withdrawal($data)
    {
        $rsps['status'] = 1;
        if ($data['status'] != 'success') {
            $rsps['status'] = 2;
        }
        $rsps['order_sn'] = $data['order_number'];
        $rsps['othr_number'] = $data['number'];
        $rsps['msg'] = '';
        $rsps['result'] = "OK";
        return $rsps;
    }
}