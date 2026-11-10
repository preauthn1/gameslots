<?php

namespace app\api\factory;

use app\common\model\ArtificialBalanceModel;
use app\common\model\ActionApplyModel;
use app\common\model\PayAgentModel;
use app\common\model\PayTypeModel;
use app\common\model\UserAwardCfgsModel;
use app\common\model\UserOfflineModel;
use app\common\model\BankSkModel;
use app\common\model\UserBankModel;
use app\common\model\BankSkSetModel;
use app\common\model\UserModel;
use app\common\model\LangModel;
use app\api\redis\ApiRedis;
use app\common\model\PaySetModel;
use app\common\model\UserVerifyConfigModel;
use app\common\model\UserVerifyModel;
use app\common\model\UserWaterModel;
use app\common\model\UserWithdrawalModel;
use app\common\payment\Entry;
use app\common\redis\CommomRedis;
use app\common\service\MemberService;
use app\common\service\MessageService;
use think\facade\Request;
use app\common\lib\Util;
use think\facade\Db;
use think\facade\Config;

class UserVerifyFactory
{
    private $param;//请求参数
    private $uid;//用户id

    //验证
    public function __construct($uid = 0)
    {
        $this->param = Request::param();
        $this->uid = $uid;
    }

    /**
     * 获取用户实名制状态
     * @param $uid
     * @return int|mixed
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public static function userVerifyStatus($uid)
    {
        $user_verify_model = new UserVerifyModel();
        $temp = $user_verify_model->where('uid', $uid)->find();
        if (empty($temp)) {
            return 0;
        }
        return $temp['status'];
    }

    /**
     * 添加认证数据
     * @param $data
     * @return false|int|mixed|string
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function addVerify()
    {
        $content = $this->param['content'] ?? '';
        $rsps = [
            'code' => 0,
            'msg' => '',
        ];
        if (empty($this->uid)) {
            $rsps['code'] = 0;
            $rsps['msg'] = "用户信息有误";
            return $rsps;
        }
        $user_verify_model = new UserVerifyModel();
        $temp = $user_verify_model->where('uid', $this->uid)->order('id desc')->find();
        $ApiRedis = new ApiRedis();
        $sys = $ApiRedis->systemInfo();
        $status = 1;
        if ($sys['auto_user_verify'] == 1) {
            $status = 2;
        }
        if (empty($temp)) {
            $in_data = [
                'uid' => $this->uid,
                'content' => $content,
                'status' => $status,
                'create_time' => time(),
                'update_time' => time()
            ];
            $id = $user_verify_model->insertGetId($in_data);
            if (empty($id)) {
                $rsps['code'] = 0;
                $rsps['msg'] = "数据提交失败";
                return $rsps;
            }
            $rsps['code'] = 1;
            $rsps['data'] = $id;
            $rsps['msg'] = "操作成功";
            return $rsps;
        } else {
            if (($temp['status'] == 3) || ($temp['status'] == 0)) {
                $in_data = [
                    'uid' => $this->uid,
                    'content' => $content,
                    'status' => $status,
                    'update_time' => time()
                ];
                $id = $user_verify_model->where('id', $temp['id'])->update($in_data);
                if (empty($id)) {
                    $rsps['code'] = 0;
                    $rsps['msg'] = "数据提交失败";
                    return $rsps;
                }
                $rsps['code'] = 1;
                $rsps['data'] = $id;
                $rsps['msg'] = "操作成功";
                return $rsps;
            }
            ajax_return('当前审核状态无法更新认证质料', 0);
        }
    }

    /**
     * 获取需要上传的数据格式
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function getVerifyConfig()
    {
        $user_verify_config_model = new UserVerifyConfigModel();
        $temp = $user_verify_config_model->where('status', '1')->order('sort asc')->select();
        //获取用户验证数据
        $content = UserVerifyModel::where('uid', '=', $this->uid)->value('content');
        $content = json_decode($content, true);
        $config_data = [];
        foreach ($temp as $value) {
            if( $content ){
                foreach ($content as $_v){
                    if($value['keyv'] == $_v['key']){
                        $config_data[] = [
                            'name' => $value['name'],
                            'key' => $value['keyv'],
                            'type' => $value['type'],
                            'value' => $_v['value'],
                        ];
                    }
                }

            }else{
                $config_data[] = [
                    'name' => $value['name'],
                    'key' => $value['keyv'],
                    'type' => $value['type'],
                    'value' => "",
                ];
            }
        }
        return ['code' => 1, 'data' => $config_data];
    }
}