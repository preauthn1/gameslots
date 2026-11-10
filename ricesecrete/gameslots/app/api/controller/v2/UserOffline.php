<?php

namespace app\api\controller\v2;

use app\api\factory_v2\UserOfflineFactory;
use app\common\lib\Respons;
use think\Request;

class UserOffline
{

    /**
     * 获取充值配置参数
     * @param Request $request
     * @return \think\response\Json
     */
    public function recharge_config(Request $request)
    {
        $rsps = (new UserOfflineFactory($request->token->uid))->recharge_config_run();
        return Respons::run($rsps);
    }

    /**
     * 获取充值配置参数 V2
     * @param Request $request
     * @return \think\response\Json
     */
    public function recharge_config_v2(Request $request)
    {
        $rsps = (new UserOfflineFactory($request->token->uid))->recharge_config_v2_run();
        return Respons::run($rsps);
    }

    //充值
    public function apply(Request $request)
    {
        $rsps = (new UserOfflineFactory($request->token->uid))->apply_run();
        return Respons::run($rsps);
    }

    /**
     * 获取一分钟内的充值有效记录
     * @return \think\response\Json
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function get_recharge_info(Request $request)
    {
        $rsps = (new UserOfflineFactory($request->token->uid))->get_recharge_info_run();
        return Respons::run($rsps);
    }
}