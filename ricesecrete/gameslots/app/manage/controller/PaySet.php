<?php

namespace app\manage\controller;

use app\common\Utils;
use app\manage\factory\PaySetFactory;
use app\common\model\{CurrencyModel, PaySetModel, UserOfflineModel, UserModel, UserLevelModel, RebateSetModel};
use app\common\lib\{Respons, Util};
use think\facade\{Db, View, Config};
use think\Request;

class PaySet extends Base
{
    protected $middleware = ['ManageCheckLogin', "Language"];

    //列表
    public function lists(\think\Request $request)
    {
        $rsps = (new PaySetFactory($request->token->uid))->lists();
        return $rsps;
    }

    //添加
    public function add(Request $request)
    {
        $param = $request->param();
        if (isset($param['currency'])) {
            return Respons::run(1, Util::getCurrency());
        }

        if (isset($param['add'])) {
            $info = $param['info'];
            /* @var PaySetModel $PaySetModel */
            $PaySetModel = app()->make(PaySetModel::class);
            try {
                validate(\app\common\validate\PaySetValidate::class)->check($info);
            } catch (\think\exception\ValidateException $e) {
                // 验证失败 输出错误信息
                return Respons::run(0, [], $e->getError());
            }
            $currency = CurrencyModel::where('id', $info['currency_id'])->find();
            if (empty($currency)) {
                // 验证失败 输出错误信息
                return Respons::run(0, [], '货币有误');
            }
            $info['recharge_rate'] = $currency['recharge_rate'];
            $info['withdrawal_rate'] = $currency['withdrawal_rate'];
            $pay_rebate = isset($info['pay_rebate']) ? $info['pay_rebate'] : [];
            unset($info['id'], $info['pay_rebate']);
            $info['pay_param'] = isset($info['pay_param']) ? json_encode($info['pay_param']) : [];
            $info['pay_bank'] = isset($info['pay_bank']) ? json_encode($info['pay_bank']) : [];
            $res = $PaySetModel->insertGetId($info);
            $info['id'] = $res;
            if (isset($pay_rebate) && count($pay_rebate) > 0) {
                foreach ($pay_rebate as $kk => $vv) {
                    $rebate[$kk]['min'] = $vv['min'];
                    $rebate[$kk]['max'] = $vv['max'];
                    $rebate[$kk]['proportion'] = $vv['proportion'];
                    $rebate[$kk]['ps_id'] = $res;
                }
                RebateSetModel::where(['ps_id' => $info['id']])->delete();
                (new RebateSetModel())->saveAll($rebate);
            }
            return Respons::run($res ? 1 : 0, '', '', '', $info, $PaySetModel, lang('支付渠道添加'));
        }
    }

    //编辑
    public function edit(Request $request)
    {
        $param = $request->param();
        if (isset($param['currency'])) {
            return Respons::run(1, Util::getCurrency());
        }
        if (isset($param['edit'])) {
            $info = $param['info'];
            $PaySetModel = app()->make(PaySetModel::class);
            try {
                validate(\app\common\validate\PaySetValidate::class)->check($info);
            } catch (\think\exception\ValidateException $e) {
                // 验证失败 输出错误信息
                return Respons::run(0, [], $e->getError());
            }
            $upd['id'] = $info['id'];
            $upd['pay_types'] = $info['pay_types'];
            $upd['pay_type'] = $info['pay_type'];
            $upd['currency_id'] = $info['currency_id'];
            $upd['pay_name'] = $info['pay_name'];
            $upd['pay_status'] = $info['pay_status'];
            $upd['pay_min_amout'] = $info['pay_min_amout'];
            $upd['pay_max_amout'] = $info['pay_max_amout'];
            $upd['recharge_rate'] = $info['recharge_rate'];
            $upd['sort'] = $info['sort'] * 1;
            $upd['withdrawal_rate'] = $info['withdrawal_rate'];
            $upd['usdt_type'] = $info['usdt_type'];
            $upd['is_withdra'] = $info['is_withdra'];
            $upd['is_hot'] = $info['is_hot'] ?? 0;
            $upd['pay_param'] = isset($info['pay_param']) ? json_encode($info['pay_param']) : [];
            $upd['pay_bank'] = isset($info['pay_bank']) ? json_encode($info['pay_bank']) : [];
            $upd['agent_id'] = $info['agent_id'] ?? 0;
            $upd['new_user'] = $info['new_user'] ?? 0;
            $upd['is_all'] = $info['is_all'];
            $upd['start_level_id'] = $info['start_level_id'] ?? 0;
            $upd['end_level_id'] = $info['end_level_id'] ?? 0;
            $upd['remarks'] = $info['remarks'];
            $upd['icon'] = $info['icon'];
            $rebate = [];
            if (isset($info['pay_rebate']) && count($info['pay_rebate']) > 0) {
                foreach ($info['pay_rebate'] as $kk => $vv) {
                    $rebate[$kk]['min'] = $vv['min'];
                    $rebate[$kk]['max'] = $vv['max'];
                    $rebate[$kk]['proportion'] = $vv['proportion'];
                    $rebate[$kk]['ps_id'] = $info['id'];
                }
                RebateSetModel::where(['ps_id' => $info['id']])->delete();
                (new RebateSetModel())->saveAll($rebate);
            }


            $data = $PaySetModel->where('id', $info['id'])->find();
            $res = $PaySetModel->update($upd);
            return Respons::run($res ? 1 : 0, '', '', $data, $upd, $PaySetModel, lang('支付渠道修改'));
        }

        if (isset($param['find'])) {
            $PaySetModel = new PaySetModel();
            $res = $PaySetModel->where("id", $param['id'])->find();
            $res['pay_param'] = json_decode($res['pay_param']) ?? [];
            $res['pay_bank'] = json_decode($res['pay_bank']) ?? [];
            $res['pay_rebate'] = RebateSetModel::where(['ps_id' => $res['id']])->select() ?? [];
            return Respons::run(1, $res);
        }
    }

    //删除
    public function delete(Request $request)
    {
        $param = $request->param();
        if (isset($param['delete'])) {
            $id = $param['id'];
            $res = PaySetModel::where("id", "in", $id)->save(['update_time' => time(), 'isdel' => 1]);
            return Respons::run($res ? 1 : 0, '', '', $param, '', new PaySetModel(), lang('支付渠道删除'));
        }
    }

    //渠道统计
    public function count(\think\Request $request)
    {
        $rsps = (new PaySetFactory($request->token->uid))->count();
        return $rsps;
    }

    /**
     * 导入
     * @return void
     */
    public function import()
    {
        $data = json_decode(base64_decode($this->request->param('data/s')), true);
        if (empty($data) || !isset($data['pay_sys_sign'])) {
            return $this->error('数据有误', ['data' => $data]);
        }
        $data['pay_status'] = 0;
        $data['is_withdra'] = 0;
        unset($data['id']);
        PaySetModel::create($data);
        Utils::addOptLog(null, $data, 'pay_set', '导入充值渠道', new PaySetModel());
        return $this->success();
    }

    /**
     * 导出
     * @return void
     */
    public function export()
    {
        $id = $this->request->param('id/d');
        $info = PaySetModel::where('id', $id)->find();
        if (empty($info)) {
            return $this->error('平台信息不存在');
        }
        return $this->success([
            'data' => base64_encode(json_encode($info)),
            'json' => $info
        ]);
    }

}