<?php

namespace app\common\payment;

use think\facade\Log;

class YpUsdtPay
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
        $params['pay_method'] = "GC";
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
        return $res['order_no'];
    }

//    private function generateSign($data, $signKey)
//    {
//        // 移除 sign 键和空值
//        $filteredData = array_filter($data, function ($v, $k) {
//            return $v !== '' && $k !== 'sign';
//        }, ARRAY_FILTER_USE_BOTH);
//
//        // 按照键名 ASCII 升序排序
//        ksort($filteredData);
//
//        // 格式化参数并生成签名字符串
//        $str = '';
//        foreach ($filteredData as $k => $val) {
//            $str .= $k . '=' . $val . '&';
//        }
//        $str = rtrim($str, '&'); // 去除末尾的 &
//
//        // 使用 hash_hmac 生成签名
//        return base64_encode(hash_hmac("sha1", $str, $signKey, true));
//    }


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
        if ($data['status'] == 'SUCCESS') {
            $sign_str = $this->generateSign($data, $this->pay_set['app_key']);
            if ($sign_str != $sign) {
                return "sign error";
            }
            $rsps['order_sn'] = $data['merchant_no'];
            $rsps['trade_sn'] = $data['plantform_no'];
            $rsps['result'] = "SUCCESS";
            $rsps['money'] = $data['actual_amount'] ? $data['actual_amount'] / 100 : 0;
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

    /**
     * 获取充值钱包地址
     * @param $user_id
     * @param $platform_id
     * @return array|bool|float|int|mixed|object|\stdClass|void|null
     * @throws DataNotFoundException
     * @throws DbException
     * @throws Exception
     * @throws ModelNotFoundException
     */
    private function _getRechargeAddress($user_id, $platform_id)
    {
        $channel = PaymentPlatformModel::getOne($platform_id, 'recharge');
        if (!$channel) {
            throw new UpayException(lang('参数错误'));
        }
        $config = json_decode($channel->config, true);
        $user = UserModel::where('id', $user_id)->find();

        switch ($config['chain']) {
            case 'TRC20':
                if ($user->recharge_address) {
                    return $user->recharge_address;
                }
                break;
            case 'BEP20':
                if ($user->bsc_address) {
                    return $user->bsc_address;
                }
                break;
        }

        $data = [
            'merchantNo' => $config['merchantNo'],
            'coin'       => $config['coin'],
            'chain'      => $config['chain'],
            'username'   => $user['user_name'],
            'timestamp'  => time(),
        ];
        $data['sign'] = self::generateSign($data, $config['key']);
        $res = PayRequest::curlS($this->pay_set['url'], $data);
        if ($res['code'] == 0) {
            switch ($config['chain']) {
                case 'TRC20':
                    $user->recharge_address = $res['data']['address'];
                    break;
                case 'BEP20':
                    $user->bsc_address = $res['data']['address'];
                    break;
            }

            $user->save();
            return $res['data']['address'];
        }
    }


    /**
     * 发起请求
     * @param  array  $data
     * @param  string  $url
     * @param  string  $method
     * @return mixed
     */
    private static function request(array $data, string $url, string $method = 'post')
    {
        $client = new Client();
        $options = [
            'json'    => $data,
            'timeout' => 10,
        ];
        // 记录日志
        self::requestLog($url, $method, $options);
        try {
            $response = $client->request($method, $url, $options);
        } catch (GuzzleException|\Exception $e) {
            $title = lang('请求 upay 节点失败');
            Log::write([
                'title' => $title,
                'msg'   => $e->getMessage()
            ], "upay");
            return ['code' => -1, 'msg' => $e->getMessage()];
        }

        $content = $response->getBody()->getContents();
        return json_decode($content, true);
    }

    /**
     * 生成签名
     * @param $data
     * @param $key
     * @return string
     */
    public static function generateSign($data, $key): string
    {
        ksort($data);
        $temp_str = '';
        foreach ($data as $k => $v) {
            $temp_str .= $k.'='.$v.'&';
        }
        $temp_str .= 'key='.$key;
        return md5($temp_str);
    }

//
//    /**
//     * 归集
//     * @param $address
//     * @param $minAmount
//     * @param $type
//     * @return int[]|mixed
//     * @throws DataNotFoundException
//     * @throws DbException
//     * @throws Exception
//     * @throws ModelNotFoundException
//     */
//    public static function swapCollect($address, $minAmount, $type)
//    {
//        $channel = PaymentPlatformModel::where('name', 'like', $type.'%')->find();
//        if (!$channel) {
//            $channel = PaymentPlatformModel::where('name', 'like', $type.'%')->find();
//        }
//        if (!$channel) {
//            throw new UpayException(lang('参数错误'));
//        }
//        $config = json_decode($channel->config, true);
//        $data = [
//            'merchantNo' => $config['merchantNo'],
//            'address'    => $address,
//            'chain'      => $config['chain'],
//            'coin'       => $config['coin'],
//            'minAmount'  => $minAmount,
//            'timestamp'  => time(),
//        ];
//
//        $key = self::generateSign($data, $config['key']);
//        $data['sign'] = $key;
//
//        $url = $config['swap_create_url'];
//        $res = self::request($data, $url);
//        if ($res['code'] == 0) {
//            return $res;
//        } else {
//            throw new UpayException(lang($res['msg']));
//        }
//    }
//
//    /**
//     * 归集结果查询
//     * @return int[]|mixed
//     * @throws DataNotFoundException
//     * @throws DbException
//     * @throws Exception
//     * @throws ModelNotFoundException
//     */
//    public static function swapCheck($batchNo, $collection)
//    {
//        $channel = PaymentPlatformModel::where('name', 'like', $collection->coin.'%')->find();
//        if (!$channel) {
//            $channel = PaymentPlatformModel::where('name', 'like', $collection->chain.'%')->find();
//        }
//
//        if (!$channel) {
//            throw new UpayException(lang('参数错误'));
//        }
//        $config = json_decode($channel->config, true);
//        $data = [
//            'merchantNo' => $config['merchantNo'],
//            'batchNo'    => $batchNo,
//            'timestamp'  => time(),
//        ];
//
//        $key = self::generateSign($data, $config['key']);
//        $data['sign'] = $key;
//
//        $url = $config['swap_check_url'];
//        $res = self::request($data, $url);
//        if ($res['code'] == 0) {
//            return $res;
//        } else {
//            throw new UpayException(lang($res['msg']));
//        }
//    }
//
//    /**
//     * 归集记录
//     * @return int[]|mixed
//     * @throws DataNotFoundException
//     * @throws DbException
//     * @throws Exception
//     * @throws ModelNotFoundException
//     */
//    public static function swapRecord(CollectionModel $collection, $pageNo = 1, $pageSize = 10)
//    {
//        $channel = PaymentPlatformModel::where('name', 'like', $collection->coin.'%')->find();
//        if (!$channel) {
//            $channel = PaymentPlatformModel::where('name', 'like', $collection->chain.'%')->find();
//        }
//        if (!$channel) {
//            throw new Exception(lang('参数错误'));
//        }
//        $config = json_decode($channel->config, true);
//        $data = [
//            'merchantNo' => $config['merchantNo'],
//            'batchNo'    => $collection->batch_no,
//            'timestamp'  => time(),
//        ];
//
//        $key = self::generateSign($data, $config['key']);
//        $data['sign'] = $key;
//        $data['pageNo'] = $pageNo;
//        $data['pageSize'] = $pageSize;
//
//        $url = $config['swap_record_url'];
//        $res = self::request($data, $url);
//        if ($res['code'] == 0) {
//            return $res;
//        } else {
//            throw new Exception(lang($res['msg']));
//        }
//    }
//
//    /**
//     * 单笔归集
//     * @param $address string 归集地址
//     * @param $user_address string 用户名
//     * @param $amount string 金额
//     * @param  string  $coin
//     * @param  string  $china
//     * @return int[]|mixed
//     * @throws DataNotFoundException
//     * @throws DbException
//     * @throws Exception
//     * @throws ModelNotFoundException
//     */
//    public static function swapSingle(
//        string $address,
//        string $user_address,
//        string $amount,
//        string $coin,
//        string $china
//    ) {
//        $channel = PaymentPlatformModel::where('name', 'like', $coin.'%')->find();
//        if (!$channel) {
//            $channel = PaymentPlatformModel::where('name', 'like', $china.'%')->find();
//        }
//        if (!$channel) {
//            throw new UpayException(lang('参数错误'));
//        }
//        $config = json_decode($channel->config, true);
//        $data = [
//            'merchantNo'  => $config['merchantNo'],
//            'address'     => $address,
//            'chain'       => $config['chain'],
//            'coin'        => $config['coin'],
//            'amount'      => floatval($amount),
//            'timestamp'   => time(),
//            'userAddress' => $user_address,
//            'notifyUrl'   => $config['swap_notify_url']
//        ];
//
//        $key = self::generateSign($data, $config['key']);
//        $data['sign'] = $key;
//        $url = $config['swap_single_url'];
//        $res = self::request($data, $url);
//        if ($res['code'] == 0) {
//            return $res;
//        } else {
//            throw new UpayException(lang($res['msg']));
//        }
//    }
//
//    /**
//     * 记录请求日志
//     * @param  string  $url
//     * @param  string  $method
//     * @param  array  $options
//     * @return void
//     */
//    public static function requestLog(string $url, string $method, array $options): void
//    {
//        if (Env::get("APP_DEBUG", false)) {
//            Log::write([
//                'url'     => $url,
//                'method'  => $method,
//                'options' => $options
//            ], "upay");
//        }
//    }
//
//    /**
//     * 充值回调处理方法
//     * @return Json
//     * @throws DbException
//     * @throws ModelNotFoundException
//     * @throws DataNotFoundException|Exception
//     */
//    public function recharge(): Json
//    {
//
//        $param = $this->request->param();
//        $chain = $param['chain'];
//        $address = $param['address'];
//        $trade_no = $param['orderNo'];
//
//        $redis = Cache::store('redis');
//        $ret = $redis->get('recharge_' . $trade_no);
//        if (empty($ret)) {
//            $redis->set('recharge_' . $trade_no, 1, 10);
//        } else {
//            Log::write($param, "upay");
//            $msg = lang('充值订单：%s，正在处理中，请勿重复提交', [$trade_no]);
//            Log::write($msg, "upay");
//            return json(['msg' => $msg]);
//        }
//
//        // 如果状态不是成功，不处理
//        /** 状态 1待确认2成功3失效*/
//        if ($param['status'] != 2) {
//            return json(['code' => 0, 'msg' => lang('状态不正确')]);
//        }
//
//        // 不做参数校验
//        $platform = PaymentPlatformModel::where('name', 'like', $param['coin'] . '%')->find();
//        if (!$platform) {
//            $platform = PaymentPlatformModel::where('name', 'like', $chain . '%')->find();
//        }
//        if (!$platform) {
//            return json(['code' => 0, 'msg' => lang('币种不存在')]);
//        }
//
//        // 判断金额是否正确
//        if ($param['amount'] < $platform->min_recharge_money) {
//            $msg = "充值金额{$param['amount']}小于最小充值金额{$platform->min_recharge_money}";
//            Log::write($msg, "upay");
//            return json(['code' => 1, 'msg' => $msg]);
//        }
////        $config = json_decode($platform->config, true);
////        $key = $config['key'];
////        unset($data['sign']);
////        $sign = PaymentPlatformModel::generateSign($data, $key);
//
//        // 查找用户
//        switch ($chain) {
//            case 'TRC20':
//                $user = UserModel::where('recharge_address', $address)->find();
//                if (!$user) {
//                    return json(['code' => 0, 'msg' => lang('用户不存在')]);
//                }
//                $user_address = $user->recharge_address;
//                break;
//            case 'BEP20':
//                $user = UserModel::where('bsc_address', $address)->find();
//                if (!$user) {
//                    return json(['code' => 0, 'msg' => lang('用户不存在')]);
//                }
//                $user_address = $user->bsc_address;
//                break;
//            default:
//                return json(['code' => 0, 'msg' => lang('用户不存在')]);
//
//        }
//
//        $user_id = $user->id;
//        // 判断订单是否重复
//        $exist = RechargeModel::where('trade_no', $trade_no)->find();
//        if ($exist) {
//            return json(['code' => 1, 'msg' => lang('充值订单已存在')]);
//        }
//
//        // 判断是不是首充
//        $recharge_count = RechargeModel::where('user_id', $user_id)->count();
//        $is_first = false;
//        if ($recharge_count == 0) {
//            $is_first = true;
//        }
//        $amount = $param['amount'] * $platform->exchange_rate;
//        // 生成充值订单
//        $data = [
//            'user_id'        => $user_id,
//            'original_money' => $param['amount'],
//            'exchange_rate'  => $platform->exchange_rate,
//            'money'          => $amount,
//            'type'           => RechargeModel::TYPE_CONTRACT,
//            'status'         => $param['status'],
//            'trade_no'       => $trade_no,
//            'pay_account'    => $param['from'],
//            'pay_time'       => timeToStr(),
//            'from_address'   => $param['from'],
//            'to_address'     => $address,
//            'is_first'       => $is_first,
//            'hash'           => $param['hash'],
//            'success_time'   => time(),
//            'pay_id'         => $platform->id,
//            'result'         => json_encode($param),
//            'txid'           => $param['txid']
//        ];
//        Db::startTrans();
//        try {
//            $order = RechargeModel::create($data);// 修改用户余额
//            $money_log = new MoneyLogModel();
//            $money_log->changeMoney($user_id, $amount, MoneyLogModel::TYPE_RECHARGE, 'add', '', '', 1, '', '', $order->id,
//                false);
//            $money_log->changeMoney($user_id, $amount, MoneyLogModel::TYPE_USER, 'add', '用户充值', '用户充值_' . $amount,
//                1, '', '', $order->id);
//            Db::commit();
//            $user_model = new UserModel();
//            $user_model->vipUpgradeStatus($user_id, '', getConfig('level_upgrade_type'));
//            // 判断是否有分佣
//            $money_log->allotBrokerage($user_id, $amount);
//            //充值完成判断上级是否可以领取抽奖次数
//            TurntableCountModel::isAddOnePCount($user_id,1,$amount);
//
//            //用户充值成功，判断是否有效如果有效给父级增加任务次数
//            UserModel::addRechargeTaskCount($user_id);
//            // 发起归集
//            $this->swapSingle($chain, $user_address, $param, $order);
//
//        } catch (\Exception $e) {
//            Log::write(lang('充值失败'), "upay");
//            Log::write($e->getMessage() . "\n" . $e->getTraceAsString(), "upay");
//            Db::rollback();
//            return json(['code' => 0, 'msg' => lang('未知错误')]);
//        }
//        if ($order) {
//            // 充值成功
//            // 恢复已匹配未支付的流量包订单
//            (new FinanceProductOrderRepository())->recoverOrder($user_id);
//
//            //给用户发信息
//            $param = [
//                'user_id' => $user_id,
//                'admin_id' => 0,
//                'type' => UserMessageModel::TYPE_RECHARGE,
//                'title' => '充值到账',
//                'content' => round($amount, 4) . 'USDT',
//                'is_pop' => 0,
//            ];
//            (new UserMessageModel)->insertUserMessage($param);
//
//            if ($is_first) { // 首充
//                // 判断是否有首充送款
//                $config = new ConfigModel();
//                $configInfo = $config->getConfig();
//                if ($configInfo['is_open_first_charge_rebate']) { // 首充送款
//                    if ($configInfo['first_charge_rebate_min'] > 0 && $amount < $configInfo['first_charge_rebate_min']) {
//                        // 充值金额 < 首充送款最低金额
//                        // 不满足条件
//                    }
//
//                    // 赠送金额
//                    $rebate = $amount * $configInfo['first_charge_rebate_percent'];
//                    if ($configInfo['first_charge_rebate_cap'] > 0 && $rebate > $configInfo['first_charge_rebate_cap']) {
//                        // 超出首充送款封顶，取首充送款封顶
//                        $rebate = $configInfo['first_charge_rebate_cap'];
//                    }
//                    $money_log = new MoneyLogModel();
//                    $money_log->changeMoney($user_id, $rebate, MoneyLogModel::TYPE_USER, 'add', '首充送款',
//                        '首充送款' . $rebate, 4, '', '', $order->id);
//
//                }
//                Promotion::handle($user, 'recharge', ['value' => $amount]);
//            }
//            return json(['code' => 1]);
//        } else {
//            return json(['code' => 0, 'msg' => lang('未知错误')]);
//        }
//    }
//
//    /**
//     * 归集回调
//     * @return Json
//     * @throws DataNotFoundException
//     * @throws DbException
//     * @throws ModelNotFoundException
//     */
//    public function swap()
//    {
//        $param = $this->request->param();
//
//        // 查找归集订单
//        $collection = CollectionModel::where('batch_no', $param['batchNo'])->find();
//        if (!$collection) {
//            return json(['code' => 1, 'msg' => lang('归集订单不存在')]);
//        }
//        $collection_id = $collection->id;
//
//        // 查询归集详情
//        $collection_detail = CollectionDetailModel::where('collection_id', $collection_id)
//            ->where('from_address', $param['from'])
//            ->where('to_address', $param['address'])
//            ->find();
//
//        if ($collection_detail && $collection_detail->status === 3) {
//            return json(['code' => 1, 'msg' => lang('订单已归集')]);
//        }
//
//
//        $amount = $param['amount'];
//
//        $collection_detail_data = [
//            'amount' => $amount,
//            'chain' => $collection['chain'],
//            'coin' => $collection['coin'],
//            'from_address' => $param['from'],
//            'to_address' => $param['address'],
//            'hash' => $param['hash'],
//            'status' => $param['status'], // 1-处理中 3-成功 4-失败
//        ];
//
//        if (!$collection_detail) {
//            $collection_detail_data['collection_id'] = $collection_id;
//            $collection_detail_data['create_time'] = time();
//            CollectionDetailModel::create($collection_detail_data);
//        } else {
//            // 更新
//            $collection_detail_data['update_time'] = time();
//            CollectionDetailModel::where('collection_id', $collection_id)
//                ->update($collection_detail_data);
//        }
//
//        if ($param['status'] == 3) {
//            $collection->success = 1;
//            $collection->pending = 0;
//            $collection->fail = 0;
//        } else {
//            $collection->success = 0;
//            $collection->pending = 0;
//            $collection->fail = 1;
//        }
//
//        $collection->money = $amount;
//        $collection->finish_time = time();
//        $collection->status = 1; // 已完成
//        $collection->save();
//
//        return json(['code' => 1]);
//    }
//
//    /**
//     * 发起归集
//     * @param $chain
//     * @param $user_address
//     * @param $param
//     * @param RechargeModel $order
//     * @return void
//     */
//    public function swapSingle($chain, $user_address, $param, RechargeModel $order): void
//    {
//        try {
//            $address = PaymentPlatformModel::getCollectionAddress($chain);
//            $res = PaymentPlatformModel::swapSingle($address, $user_address, $param['amount'], $param['coin'],
//                $chain);
//
//            $data = $res['data'];
//
//            // 记录归集订单号 $data['batchNo']
//            $order->batch_no = $data['batchNo'];
//            $order->save();
//
//            CollectionModel::singleSwap($data, $user_address, $address, $order->order_id);
//        } catch (UpayException | \Exception $e) {
//            // 归集失败, 记录日志，不影响充值
//            Log::write($e->getMessage(), 'upay');
//        }
//    }
}