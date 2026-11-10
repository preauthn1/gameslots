<?php

namespace app\api\factory;

use app\common\model\BankModel;
use app\common\model\PayTypeModel;
use app\common\model\UserBankModel;
use app\common\model\UserGoogleModel;
use app\common\model\UserModel;
use app\common\lib\Util;
use app\api\redis\ApiRedis;
use app\common\redis\CommomRedis;
use app\common\service\BankService;
use app\common\service\MemberService;
use think\facade\Request;
use think\facade\Config;

class BankFactory
{
    private $param;//请求参数
    private $uid;//用户id

    //验证
    public function __construct($uid = 0)
    {
        $this->param = Request::param();
        $this->uid = $uid;
    }

    //银行卡
    public function list_run()
    {
        $payment_method_type = Config::get('custom.payment_method_type');
        $is_withdrawal_bank = env('is_withdrawal_bank', 0); //银行渠道
        $is_withdrawal_usdt = env('is_withdrawal_usdt', 0); // usdt渠道
        $is_withdrawal_wallet = env('is_withdrawal_wallet', 0); // 电子钱包
        $is_withdrawal_pix = env('is_withdrawal_pix', 0); // PIX

        if ($is_withdrawal_bank == 0) {
            unset($payment_method_type[0]);
        }
        if ($is_withdrawal_usdt == 0) {
            unset($payment_method_type[1]);
        }
        if ($is_withdrawal_wallet == 0) {
            unset($payment_method_type[2]);
        }
        if ($is_withdrawal_pix == 0) {
            unset($payment_method_type[3]);
        }

        $CommomRedis = new CommomRedis();
        $currency = $CommomRedis->getCurrency();
        $lang = Request::header('lang') ?? ''; //空的时候 获取默认币种
        $currency_data = [];
        $all_currency = $currency['ordinary_data'];
        foreach ($currency['ordinary_data'] as $k => $v) {
            //获取当前语言的币种
            if ($v['country_code'] == $lang) {
                $currency_data = $v;
                break;
            }
        }
        //没有对应语言的货币的时候 获取默认货币
        if (!$currency_data && $currency['defa_data']['type']['val'] == 2) {
            //默认货币是法币的时候 是usdt 返回空
            $currency_data = $currency['defa_data'];
        }
        $currency['ordinary_data'] = $currency_data;
        if (isset($currency['usdt_data'][0])) {
            $currency['usdt_data'] = $currency['usdt_data'][0];
        }

        //排序并翻译
        $payment_method_type = BankService::payMethodTypeSort($payment_method_type);

        $data['paytype'] = $payment_method_type;
        // TODO 废弃usdt_type 使用货币中USDT的链接名称
        $usdt_type = Util::getUsdtType();

//        $usdt_type = Config::get('custom.usdt_type');
        $data['currency'] = $currency;
        $data['all_currency'] = $all_currency;
        $pix_type = Config::get('custom.pix_type');
        //去除pix类型
        $unsetPixType = env('UNSET_PIX_TYPE', '');
        if ($unsetPixType) {
            $unsetPixTypeArr = explode(',', $unsetPixType);
            foreach ($unsetPixTypeArr as $v) {
                if (isset($pix_type[$v])) {
                    unset($pix_type[$v]);
                }
            }
        }
        $data['usdt_type'] = $usdt_type;
        $data['pix_type'] = $pix_type;
        $data['bank_list'] = $CommomRedis->getBankList();
        $rsps['data'] = $data;
        $rsps['code'] = 1;
        return $rsps;
    }

    //银行卡类型
    public function list_type_run()
    {
        $payment_method_type = Config::get('custom.payment_method_type');
        $CommomRedis = new CommomRedis();
        $currency = $CommomRedis->getCurrency();
        $lang = Request::header('lang') ?? ''; //空的时候 获取默认币种
        $currency_data = [];
        $all_currency = $currency['ordinary_data'];
        foreach ($currency['ordinary_data'] as $k => $v) {
            //获取当前语言的币种
            if ($v['country_code'] == $lang) {
                $currency_data = $v;
                break;
            }
        }
        //没有对应语言的货币的时候 获取默认货币
        if (!$currency_data && $currency['defa_data']['type']['val'] == 2) {
            //默认货币是法币的时候 是usdt 返回空
            $currency_data = $currency['defa_data'];
        }
        $currency['ordinary_data'] = $currency_data;
        if (isset($currency['usdt_data'][0])) {
            $currency['usdt_data'] = $currency['usdt_data'][0];
        }

        //排序并翻译
//        $payment_method_type = BankService::payMethodTypeSort($payment_method_type);
        $payment_method_type_list = [];
        $pay_types = PayTypeModel::field("id,icon,name")->select();
        $pay_icons = [];
        foreach ($pay_types as $pay_type) {
            $pay_icons[strtolower($pay_type['name'])] = $pay_type['icon'];
        }
        foreach ($payment_method_type as $k => $v) {
            $list = [];
            if (strtolower($v) == "bank") {
                $bank_type = $CommomRedis->getBankList();
                $bank_type_arr = [];
                foreach ($bank_type as $value) {
                    foreach ($value as $val) {
                        if (!in_array(strtolower($val['bank_code']), ['gcash', 'maya'])) {
                            $bank_type_arr[] = [
                                'bank_name' => $val['bank_name'],
                                'bank_code' => $val['bank_code'],
                                'orderby' => $val['orderby'],
                                'bank_field' => $val['bank_field'],
                            ];
                        }
                    }
                }
                $list = $bank_type_arr;
                $icon = isset($pay_icons['bank']) ? $pay_icons['bank'] : '';
            }
            if (strtolower($v) == "pix") {
                $pix_type = Config::get('custom.pix_type');
                //去除pix类型
                $unsetPixType = env('UNSET_PIX_TYPE', '');
                if ($unsetPixType) {
                    $unsetPixTypeArr = explode(',', $unsetPixType);
                    foreach ($unsetPixTypeArr as $v) {
                        if (isset($pix_type[$v])) {
                            unset($pix_type[$v]);
                        }
                    }
                }
                $list = $pix_type;
            }
            if (strtolower($v) == 'usdt') {
                // TODO 废弃usdt_type 使用货币中USDT的链接名称
                $usdt_type = Util::getUsdtType();
                $list = $usdt_type;
                $icon = isset($pay_icons['usdt']) ? $pay_icons['usdt'] : '';
            }
            if (strtolower($v) == 'gcash') {
                $list[] = [
                    "bank_name" => "GCASH",
                    "bank_code" => "GCash",
                    "bank_field" => [
                        "bank_type",
                        "bank_name",
                        "bank_number",
                        "bank_hm"
                    ]
                ];
                $icon = isset($pay_icons['gcash']) ? $pay_icons['gcash'] : '';
            }
            if (strtolower($v) == 'paymaya') {
                $list[] = [
                    "bank_name" => "PayMaya",
                    "bank_code" => "maya",
                    "bank_field" => [
                        "bank_type",
                        "bank_name",
                        "bank_number",
                        "bank_hm"
                    ]
                ];
                $icon = isset($pay_icons['maya']) ? $pay_icons['maya'] : '';
            }
            $payment_method_type_list[] = [
                'name' => $v,
                'icon' => $icon,
                'key' => $k,
                'list' => $list,
            ];
        }
        $data['paytype'] = $payment_method_type_list;
        // TODO 废弃usdt_type 使用货币中USDT的链接名称
        $data['currency'] = $currency;
        $data['all_currency'] = $all_currency;
        $user = UserModel::uinfo($this->uid, ",b.min_amount,b.max_amount,b.day_limit");//查看当前用户流水和最低提现金额
        $data['limit'] = [
            'min_amount' => $user['min_amount'],
            'max_amount' => $user['max_amount'],
            'day_limit' => $user['day_limit']
        ];
        $rsps['data'] = $data;
        $rsps['code'] = 1;
        return $rsps;
    }


    //添加银行卡
    public function add_bank_run()
    {
        $param = $this->param;
        try {
            validate(\app\common\validate\UserBankValidate::class)->check($param);
        } catch (\think\exception\ValidateException $e) {
            // 验证失败 输出错误信息
            ajax_return($e->getError(), 0);
        }

        $BankModel = new BankModel();
        $UserBankModel = new UserBankModel();
        if (!preg_match("/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/i", $param['bank_number'])) {
            if (!preg_match("/^[0-9A-Za-z]+$/", $param['bank_number'])) { // 限制银行卡卡号格式
                ajax_return("收款账号只能是字母或数字组合", 0);
            }
        }
        $ApiRedis = new ApiRedis();
        $sys = $ApiRedis->systemInfo();

        $user = UserModel::uinfo($this->uid, ",a.phone,a.mail,a.mail_bind_status,a.phone_bind_status");
        if (isset($sys['bind_card_status']) && $sys['bind_card_status'] == 1) {
            //设置绑卡必须验证
            $verify_code = $param['verify_code'] ?? null;
            MemberService::checkCode($user, $verify_code, 'bankcard_check');
        } elseif (isset($sys['is_open_email_or_phone_check']) && $sys['is_open_email_or_phone_check'] == 1) {
            //设置了手机号或邮箱必须验证一次
            if ($user['mail_bind_status'] != 1 && $user['phone_bind_status'] != 1) {
                $verify_code = $param['verify_code'] ?? null;
                MemberService::checkCode($user, $verify_code, 'bankcard_check');
            }
        }
        $currency_id = isset($param['currency_id']) ? $param['currency_id'] : 0;
        $card_number = (isset($sys['card_number']) && $sys['card_number'] > 0) ? $sys['card_number'] : 5;
        if ($param['bank_type'] == 0) { // 银行卡
            $count = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 0, "currency_id" => $currency_id])->count();
            if ($count >= $card_number) {
                ajax_return("收款账号绑定已超上限", 0);
            }
            //添加银行卡验证
            if (isset($sys['add_bank_verify']) && $sys['add_bank_verify'] == 1) {
                $count = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 0])->count();
                if ($count >= 1) { // 判断是否已绑卡，没绑不限制
                    $bankC = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 0, 'bank_hm' => $param['bank_hm']])->count();
                    if ($bankC == 0) {
                        ajax_return("开户名与之前绑卡开户名要一致", 0);
                    }

                    $bankNC = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 0, 'bank_number' => $param['bank_number']])->count();
                    if ($bankNC > 0) {
                        ajax_return("该卡已绑定，请勿重复绑定", 0);
                    }
                }
            }

            $bankNC = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => $param['bank_type'], 'bank_number' => $param['bank_number']])->count();
            if ($bankNC > $sys['card_number']) {
                ajax_return("收款账号绑定已超上限", 0);
            }

            //添加银行卡验证
            if (isset($sys['add_bank_verify']) && $sys['add_bank_verify'] == 1) {
                $bankNC = $UserBankModel->where(['bank_type' => 0, 'bank_number' => $param['bank_number']])->where('uid', '<>', $this->uid)->count();
                if ($bankNC > 0) {
                    ajax_return("该卡已被其他人绑定，请勿重复绑定", 0);
                }
            }
        }

        if ($param['bank_type'] == 1) { // USDT
            $count = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 1])->count();
            if ($count >= $card_number) {
                ajax_return("收款账号绑定已超上限", 0);
            }
            if ($count >= 1) { // 判断是否已绑卡，没绑不限制
                $bankNC = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 1, 'bank_number' => $param['bank_number']])->count();
                if ($bankNC > 0) {
                    ajax_return("该账号已绑定，请勿重复绑定", 0);
                }
            }
            //添加银行卡验证
            if (isset($sys['add_bank_verify']) && $sys['add_bank_verify'] == 1) {
                $bankNC = $UserBankModel->where(['bank_type' => 1, 'bank_number' => $param['bank_number']])->count();
                if ($bankNC > 0) {
                    ajax_return("该账号已被其他人绑定，请勿重复绑定", 0);
                }
            }
        }

        if ($param['bank_type'] == 2) { // 电子钱包
            $count = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 2])->count();
            if ($count >= $card_number) {
                ajax_return("收款账号绑定已超上限", 0);
            }
            if ($count >= 1) { // 判断是否已绑卡，没绑不限制
                $bankNC = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 2, 'bank_number' => $param['bank_number']])->count();
                if ($bankNC > 0) {
                    ajax_return("该账号已绑定，请勿重复绑定", 0);
                }
            }
            //添加银行卡验证
            if (isset($sys['add_bank_verify']) && $sys['add_bank_verify'] == 1) {
                $bankNC = $UserBankModel->where(['bank_type' => 2, 'bank_number' => $param['bank_number']])->count();
                if ($bankNC > 0) {
                    ajax_return("该账号已被其他人绑定，请勿重复绑定", 0);
                }
            }
        }

        //添加银行卡验证
        if ($param['bank_type'] == 3) { // PIX钱包
            $count = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 3])->count();
            if ($count >= 1) { // 判断是否已绑卡，没绑不限制
                $bankNC = $UserBankModel->where(["uid" => $this->uid, 'bank_type' => 3, 'bank_number' => $param['bank_number']])->count();
                if ($bankNC > 0) {
                    ajax_return("该账号已绑定，请勿重复绑定", 0);
                }
            }
            //添加银行卡验证
            if (isset($sys['add_bank_verify']) && $sys['add_bank_verify'] == 1) {
                $bankNC = $UserBankModel->where(['bank_type' => 3, 'bank_number' => $param['bank_number']])->count();
                if ($bankNC > 0) {
                    ajax_return("该账号已被其他人绑定，请勿重复绑定", 0);
                }
            }
        }
        //验证过验证码则将用户中验证状态改为已验证
        $checkType = $param['check_type'] ?? 0;
        $update = [];
        if ($checkType == 1) {
            //号码验证
            $update['phone_bind_status'] = 1;
        } elseif ($checkType == 2) {
            //邮箱验证
            $update['mail_bind_status'] = 1;
        }
        if ($update) {
            UserModel::where('id', '=', $this->uid)->update($update);
        }

        $add['add_time'] = time();
        $add['uid'] = $this->uid;
        $add['bank_type'] = isset($param['bank_type']) ? $param['bank_type'] : 0;
        $add['bank_name'] = isset($param['bank_name']) ? $param['bank_name'] : "";
        $add['bank_number'] = isset($param['bank_number']) ? $param['bank_number'] : "";
        $add['bank_open'] = isset($param['bank_open']) ? $param['bank_open'] : "";
        $add['bank_hm'] = isset($param['bank_hm']) ? $param['bank_hm'] : "";
        $add['province'] = isset($param['province']) ? $param['province'] : '';
        $add['city'] = isset($param['city']) ? $param['city'] : '';
        $add['remarks'] = isset($param['remarks']) ? $param['remarks'] : '';
        $add['financial'] = isset($param['financial']) ? $param['financial'] : '';
        $add['currency_id'] = $param['currency_id'] ?? '';
        $UserBankModel->insertGetId($add);
        \app\common\model\UserAdminLogModel::add_log($this->uid, '会员绑卡|IP:' . Util::get_ip() . "|卡号：" . $add['bank_number'], "会员绑卡");
        $rsps['code'] = 1;
        return $rsps;
    }

    //银行卡列表
    public function my_bank_run()
    {
        $param = $this->param;
        $bank_type = isset($param['bank_type']) ? $param['bank_type'] : "all";
        $UserBankModel = new UserBankModel();
        $type = [];
        if ($bank_type === "all") {
            $is_withdrawal_bank = env('is_withdrawal_bank', 0); //银行渠道
            $is_withdrawal_usdt = env('is_withdrawal_usdt', 0); // usdt渠道
            $is_withdrawal_wallet = env('is_withdrawal_wallet', 0); // 电子钱包
            $is_withdrawal_pix = env('is_withdrawal_pix', 0); // PIX

            if ($is_withdrawal_bank == 1) {
                $type[] = 0;
            }
            if ($is_withdrawal_usdt == 1) {
                $type[] = 1;
            }
            if ($is_withdrawal_wallet == 1) {
                $type[] = 2;
            }
            if ($is_withdrawal_pix == 1) {
                $type[] = 3;
            }
        } else {
            $type[] = $bank_type;
        }
        $CommomRedis = new CommomRedis();
        $currency = $CommomRedis->getCurrency();
        $currency_code = Config::get('custom.currency_code');
        $bank_type = $CommomRedis->getBankList();
        $bank_type_arr = [];
        foreach ($bank_type as $value) {
            foreach ($value as $val) {
                $bank_type_arr[$val['bank_code']] = $val['bank_name'];
            }
        }
        $french_currency = [];
        foreach ($currency['ordinary_data'] as $val) {
            $val['currency_code'] = $currency_code[$val['country_code']];
            $french_currency[$val['id']] = $val->toArray();
        }

        $bank = $UserBankModel->alias("a")
            ->where("a.uid", $this->uid)
            ->where("a.bank_type", "in", $type)
            ->field('a.id,a.bank_type,a.bank_id,a.bank_number,a.bank_open,a.bank_hm,a.province,a.city,a.remarks,a.bank_name,a.currency_id')
            ->order('a.id DESC')
            ->select();

        foreach ($bank as $key => $value) {
            $bank[$key]['bank_name'] = $bank_type_arr[$value['bank_name']] ?? $value['bank_name'];
            if ($value['bank_type'] == 1) {
                $bank[$key]['withdrawal_rate'] = $currency['usdt_data'][0]['withdrawal_rate'] ?? '1.000000';
                $bank[$key]['recharge_rate'] = $currency['usdt_data'][0]['recharge_rate'] ?? '1.000000';
                $bank[$key]['currency_code'] = "USDT";
            } else {
                if (isset($french_currency[$value['currency_id']])) {
                    $bank[$key]['withdrawal_rate'] = $french_currency[$value['currency_id']]['withdrawal_rate'] ?? '1.000000';
                    $bank[$key]['recharge_rate'] = $french_currency[$value['currency_id']]['recharge_rate'] ?? '1.000000';
                    $bank[$key]['currency_code'] = $french_currency[$value['currency_id']]['currency_code'] ?? '';
                } else {
                    $bank[$key]['withdrawal_rate'] = $currency['ordinary_data'][0]['withdrawal_rate'] ?? '1.000000';
                    $bank[$key]['recharge_rate'] = $currency['ordinary_data'][0]['recharge_rate'] ?? '1.000000';
                    $bank[$key]['currency_code'] = $currency_code[$currency['ordinary_data'][0]['country_code']];
                }
            }
            $bank[$key]['bankcrad'] = Util::bank_number_sub($value['bank_number']);
        }

        $rsps['data'] = $bank;
        $rsps['code'] = 1;
        return $rsps;
    }

    //银行卡删除
    public function my_del_run()
    {
        /*
        $info = $this->param;
        $bank_id = isset($info['bank_id'])?$info['bank_id']:'';
        $UserBankModel=new UserBankModel();
        $data=$UserBankModel->where(["id"=>$bank_id, 'uid' => $this->uid])->find();
        if (!isset($data['id'])) {
            ajax_return("银行卡不存在！", 0);
        }
        $data->delete();
        $rsps['code']=1;
        return $rsps;
         */
    }
}