<?php


namespace app\common\FastGame;

use app\common\lib\Util;
use app\common\model\UserMsgModel;
use Carbon\Carbon;
use app\common\FastGame\Base\{Game, Meta, Notify, Params, Redis, Third, User, Utils};
use app\model\{GameAward, GameBets, GameBetsex, GameBetsSon, GameCardsSpecial, GamePayLogs, Games, Users, UserThirds};
use app\common\model\UserModel;
use think\Exception;
use think\exception\HttpException;
use think\facade\Db;

class Notify_ygg extends Notify
{
    private $tcid = 27;

    /** 默认的第三方被动接口执行方法，如无需要直接返回值
     * @param $datas
     * @param $trdobj
     * @param $cfg
     * @return mixed
     * @author twt326
     * @date 2022-10-04 18:33
     */
    function notify($datas, $trdobj,$cfg)
    {
        $param = $datas['param'];
        //设置x-mgp-req-id
        if( isset($datas['header']['requestid']) ){
            $this->x_mgp_req_id = $datas['header']['requestid'];
        }
//        s=/game_notify/mg/notify/login
        //获取回调对应方法
        $s = $param['s'];
        $sArr = explode('/', $s);
        $action = $sArr[count($sArr) - 1];
        unset($param['s']);unset($param['action_method']);
//        $action = $param['name'];
//        $signflag = $trdobj->CheckSign($cfg,$param);
//        if($signflag){
        return $this->$action($param, $trdobj, $cfg);
//        } else {
//            Utils::L($param['third'],['notify:'.$action,'签名错误',$cfg]);
//            abort(403, 'Signature code');
//        }
    }

    //登录验证
    public function login($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'login', $trdobj);
        try {
            $brandId = $param['brand_id'];
            $token = $param['token'];
            $brandUid = $param['brand_uid'];
            //验证token
            $this->checkUserToken($brandId, $brandUid, $token);
            //获取用户数据
            $uid = UserModel::where(Meta::UFIELD['uname'], '=', $brandUid)->value(Meta::UFIELD['uid']);
            $userBalance = $this->getUserBalance($uid);
            return [
                'code' => 1000,
                'msg' => 'Success',
                'data' => [
                    'brand_uid' => $brandUid,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)Third::transExchangerate($userBalance, 1, 2),
                ],
            ];

        }catch (\Exception $e){
            $this->pushLog($param, 'check user error：'.$e->getMessage(), $trdobj);
        }
    }

    //获取玩家余额
    public function getBalance($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'getBalance', $trdobj);
        try {
            $brandUid = $param['brand_uid'];
            //获取用户数据
            $uid = UserModel::where(Meta::UFIELD['uname'], '=', $brandUid)->value(Meta::UFIELD['uid']);
            $userBalance = $this->getUserBalance($uid);
            return [
                'code' => 1000,
                'msg' => 'Success',
                'data' => [
                    'brand_uid' => $brandUid,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)Third::transExchangerate($userBalance, 1, 2),
                ],
            ];

        }catch (\Exception $e){
            $this->pushLog($param, 'check user error：'.$e->getMessage(), $trdobj);
        }
    }

    //下注
    public function wager($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'wager', $trdobj);

        Db::startTrans();
        try {

            $betType = $param['bet_type'];
            $accountId = $param['brand_uid'];
            $roundId = $param['round_id'];
            $gameId = $param['game_id'];
            $amount = $param['amount'];
            $amount = Third::transExchangerate($amount, 0, 2);
            $gid = Game::getGamesInfoBy($cfg['trdcfg']['tc_id'], $gameId, 'code', 'g_id');
            $ts=time();
            //获取用户数据
            $uinfo = UserModel::where(Meta::UFIELD['uname'], '=', $accountId)->find();
            $userBalance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData = [
                'code' => 1000,
                'msg' => 'Success.',
                'data' => [
                    'brand_uid' => $accountId,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)$userBalance,
                ],
            ];
            if( $betType == 1 ){
                //一般下注
                $bet = GameBets::where('gb_gid', $gid)->where('gb_sn', $roundId)->where('gb_winlose', '<>', 0)->find();
                if( $bet ){
                    $returnData['code'] = 5043;
                    $returnData['msg'] = 'Balance insufficient.';
                    Db::rollback();
                    return $returnData;
                }
                if( $amount < 0 ){
                    $this->pushLog($param, '用户余额为负', $trdobj);
                    $returnData['code'] = 5003;
                    $returnData['msg'] = 'Bet record duplicate.';
                    Db::rollback();
                    return $returnData;
                }
                //下分（下注）
                $data = [
                    'gb_gid'=>$gid,
                    'gb_tcid'=>$cfg['trdcfg']['tc_id'],
                    'gb_uid'=>$uinfo[Meta::UFIELD['uid']],
                    'gb_intime'=>$ts,
                    'gb_price'=>$amount,
                    'gb_sn'=>$roundId,
                    'gb_winlose'=> 1,
                    'gb_bettime'=>$ts,
                    'gb_overtime'=>$ts,
                    'gb_winprice'=> 0,
                    'gb_betinfo'=>json_encode($param)
                ];
                if( $amount > $userBalance ){
                    $msg = '余额不足';
                    Db::rollback();
                    $returnData['code'] = 5003;
                    $returnData['msg'] = 'Balance insufficient.';
                    $this->pushLog([$param, $trdobj, $cfg, $uinfo], $msg, $param);
                    return $returnData;
                }
                $msg = UserModel::betRemarks($roundId, $cfg['trdcfg']['tc_name'], $gid);
                $betcjprice = User::accountChange($uinfo[Meta::UFIELD['uid']], $amount, '-', 1, $msg, true, $cfg['trdcfg']['tc_id'], $gid);
//                if ($rlt){
                $data['gb_cjprice'] = $betcjprice;
                    //写入注单
                    $rlt=(new GameBets())->insertGetId($data);
                    if ($rlt){
                        $balance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
                        $returnData['balance'] = (float)$balance;
                        $returnData['errorCode'] = 0;
                        Db::commit();
                        return $returnData;
                    } else {
                        $msg = '插入注单失败';
                        Db::rollback();
                        $returnData['code'] = 1001;
                        $returnData['msg'] = 'System error.';
                        $this->pushLog($param, $msg, $trdobj);
                        return $returnData;
                    }
//                } else {
//                    $msg = '操作余额失败';
//                    Db::rollback();
//                    $returnData['code'] = 1001;
//                    $returnData['msg'] = 'System error.';
//                    $this->pushLog($param, $msg, $trdobj);
//                    return $returnData;
//                }
            }else{
                $ts = time();
                //小费
                $specialData = [
                    'gs_tcid' => $cfg['trdcfg']['tc_id'],
                    'gs_gid' => $gid,
                    'gs_uid' => $accountId,
                    'gs_price' => $amount,
                    'gs_sn' => 'tip_' . $roundId,
                    'gs_type' => 1,
                    'gs_type_name' => '小费支出',
                    'gs_time' => $ts,
                    'gs_info' => json_encode($param),
                    'gs_create_time' => $ts,
                ];
                $specialId = (new GameCardsSpecial())->insertGetId($specialData);
                if ($specialId) {
                    Db::commit();
                    $this->PushLog('wager', '小费保存成功', $param);
                } else {
                    Db::rollback();
                    $this->PushLog('wager', '小费保存失败', $param);
                    $returnData['code'] = 1001;
                    $returnData['msg'] = 'System error.';
                }
                return $returnData;

            }
        }catch (\Exception $e){
            Db::rollback();
            $returnData['code'] = 1001;
            $returnData['msg'] = 'System error.';
            $this->pushLog($param, 'bet error：'.$e->getMessage(), [$e->getFile(),$e->getLine(),$trdobj]);
            return $returnData;
        }
    }

    //取消玩家下注
    public function cancelWager($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'cancelWager', $trdobj);

        Db::startTrans();
        try {
            $accountId = $param['brand_uid'];
            $roundId = $param['round_id'];
            $wagerType = $param['wager_type'];

            $gid = 0;
            if( isset($param['game_id']) ){
                $gid = Game::getGamesInfoBy($cfg['trdcfg']['tc_id'], $param['game_id'], 'code', 'g_id');
            }
            //获取用户数据
            $uinfo = UserModel::where(Meta::UFIELD['uname'], '=', $accountId)->find();
            $userBalance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $ts = time();
            $returnData = [
                'code' => 1000,
                'msg' => 'Success.',
                'data' => [
                    'brand_uid' => $accountId,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)$userBalance,
                ],
            ];
            $bet = GameBets::where('gb_sn', $roundId)->find();
            if( !$bet ){
                $returnData['code'] = 5042;
                $returnData['msg'] = 'Bet record does not exist.';
                Db::rollback();
                return $returnData;
            }
            if( $bet->gb_winlose == 0 ){
                $returnData['code'] = 5043;
                Db::rollback();
                $returnData['msg'] = 'Bet record duplicate.';
                return $returnData;
            }
            //更改注单为无效注单
            $bet->gb_winlose = 0;
            $bet->gb_betinfo = json_encode($param);
            $bet->gb_overtime = $ts;
            $bet->save();
            //判断取消类型判断是否给用户加钱还是减钱
            if( $wagerType == 1 ){
                //当 wager_type 为 1 时，代表需要取消的是 wager 下注单(将金额还给玩家，玩家钱包余额增加)
                $msg = UserModel::betRemarks($roundId, $cfg['trdcfg']['tc_name'], $gid, '取消');
                $rlt = User::accountChange($uinfo[Meta::UFIELD['uid']], $bet->gb_price, '+', 3, $msg, true, $cfg['trdcfg']['tc_id'], $gid, $bet->gb_id, $bet->gb_price, $bet->gb_cjprice);

            }else if( $wagerType == 2 ){
                //wager_type 为 2 时代表需要取消的是 endWager 派彩单(从玩家余额中扣除，玩家钱包余额减少)。
                $msg = UserModel::betRemarks($roundId, $cfg['trdcfg']['tc_name'], $gid, '三方取消');
                $rlt = User::accountChange($uinfo[Meta::UFIELD['uid']], $bet->gb_winprice, '-', 4, $msg, true, $cfg['trdcfg']['tc_id'], $gid);
            }else{
                $returnData['code'] = 1001;
                $returnData['msg'] = 'System error.';
                Db::rollback();
                return $returnData;
            }
//            if (!$rlt){
//                Db::rollback();
//                $msg = '操作余额失败';
//                $returnData['code'] = 5003;
//                $returnData['msg'] = 'Balance insufficient.';
//                $this->pushLog([$param, $trdobj, $cfg, $uinfo], $msg, $param, 'error');
//                return $returnData;
//            }
            Db::commit();
            return $returnData;
        }catch (\Exception $e){
            Db::rollback();
            $this->pushLog($param, 'cancelWager error：'.$e->getMessage(), $trdobj);
            $returnData['code'] = 1001;
            $returnData['msg'] = 'System error.';
            return $returnData;
        }
    }

    //额外投注结算
    public function appendWager($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'appendWager', $trdobj);

        Db::startTrans();
        try {
            $accountId = $param['brand_uid'];
            $roundId = $param['round_id'];
            $gameId = $param['game_id'];
            $amount = $param['amount'];
            $isEndround = $param['is_endround'];
            $amount = (float)Third::transExchangerate($amount, 0, 2);
            $ts = time();
            //获取用户数据
            $uinfo = UserModel::where(Meta::UFIELD['uname'], '=', $accountId)->find();
            $userBalance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData = [
                'code' => 1000,
                'msg' => 'Success.',
                'data' => [
                    'brand_uid' => $accountId,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)$userBalance,
                ],
            ];
            if( $amount < 0 ){
                $this->pushLog($param, '用户余额为负', $trdobj);
                $returnData['code'] = 5003;
                $returnData['msg'] = 'Balance insufficient.';
                return $returnData;
            }
            $gid = Game::getGamesInfoBy($cfg['trdcfg']['tc_id'], $gameId, 'code', 'g_id');
            //没有子注单为总订单
            $bet = GameBets::where('gb_gid', $gid)->where('gb_sn', $roundId)->find();
            $bet->gb_overtime = $ts;
            if($amount > 0 ){
                $bet->gb_winprice += $amount;
            }
            if( $isEndround ){
                if($bet->gb_winprice > 0){
                    $bet->gb_winlose = 3;
                }else{
                    $bet->gb_winlose = 2;
                }
            }

            $bet->gb_betinfo = json_encode($param);
            $bet->save();

            if( $isEndround > 0 && $bet->gb_winprice > 0 ){
                //订单结束才操作用户余额
                $msg = UserModel::betRemarks($roundId, $cfg['trdcfg']['tc_name'], $gid, '结算');
                $rlt = User::accountChange($uinfo[Meta::UFIELD['uid']], $amount, '+', 2, $msg, true, $cfg['trdcfg']['tc_id'], $gid, $bet->gb_id, $bet->gb_price, $bet->gb_cjprice);
//                if (!$rlt){
//                    Db::rollback();
//                    $msg = '操作余额失败';
//                    $this->pushLog([$param, $trdobj, $cfg, $uinfo], $msg, $param, 'error');
//                    $returnData['code'] = 5003;
//                    $returnData['msg'] = 'Balance insufficient.';
//                    return $returnData;
//                }
            }

            $balance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData['data']['balance'] = (float)$balance;
            Db::commit();
            return $returnData;
        }catch (\Exception $e){
            Db::rollback();
            $this->pushLog($param, 'appendWager error：'.$e->getMessage(), $trdobj);
        }
    }

    //投注结算
    public function endWager($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'appendWager', $trdobj);

        Db::startTrans();
        try {
            $accountId = $param['brand_uid'];
            $roundId = $param['round_id'];
            $amount = $param['amount'];
            $isEndround = $param['is_endround'];
            $amount = (float)Third::transExchangerate($amount, 0, 2);
            $ts = time();
            //获取用户数据
            $uinfo = UserModel::where(Meta::UFIELD['uname'], '=', $accountId)->find();
            $userBalance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData = [
                'code' => 1000,
                'msg' => 'Success.',
                'data' => [
                    'brand_uid' => $accountId,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)$userBalance,
                ],
            ];
            if( $amount < 0 ){
                $this->pushLog($param, '用户余额为负', $trdobj);
                $returnData['code'] = 5003;
                $returnData['msg'] = 'Balance insufficient.';
                return $returnData;
            }
            //没有子注单为总订单
            $bet = GameBets::where('gb_sn', $roundId)->find();
            $bet->gb_overtime = $ts;
            if($amount > 0 ){
                $bet->gb_winprice += $amount;
            }
            if( $isEndround ){
                if($bet->gb_winprice > 0){
                    $bet->gb_winlose = 3;
                }else{
                    $bet->gb_winlose = 2;
                }
            }

            $bet->gb_betinfo = json_encode($param);
            $bet->save();

            $gid = 0;
            if( isset($param['game_id']) ){
                $gid = Game::getGamesInfoBy($cfg['trdcfg']['tc_id'], $param['game_id'], 'code', 'g_id');
            }
            if( $isEndround > 0 && $bet->gb_winprice > 0 ){
                //订单结束才操作用户余额
                $msg = UserModel::betRemarks($roundId, $cfg['trdcfg']['tc_name'], $gid, '结算');
                $rlt = User::accountChange($uinfo[Meta::UFIELD['uid']], $amount, '+', 2, $msg, true, $cfg['trdcfg']['tc_id'], $gid, $bet->gb_id, $bet->gb_price, $bet->gb_cjprice);
            }

            $balance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData['data']['balance'] = (float)$balance;
            Db::commit();
            return $returnData;
        }catch (\Exception $e){
            Db::rollback();
            $this->pushLog($param, 'appendWager error：'.$e->getMessage(), $trdobj);
        }
    }

    //活动投注结算结果
    public function freeSpinResult($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'freeSpinResult', $trdobj);
        Db::startTrans();
        try {
            $accountId = $param['brand_uid'];
            $roundId = $param['round_id'];
            $amount = $param['amount'];
            $gameId = $param['game_id'];
            $isEndround = $param['is_endround'];
            $amount = (float)Third::transExchangerate($amount, 0, 2);
            $gid = Game::getGamesInfoBy($cfg['trdcfg']['tc_id'], $gameId, 'code', 'g_id');
            $ts = time();
            //获取用户数据
            $uinfo = UserModel::where(Meta::UFIELD['uname'], '=', $accountId)->find();
            $userBalance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData = [
                'code' => 1000,
                'msg' => 'Success.',
                'data' => [
                    'brand_uid' => $accountId,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)$userBalance,
                ],
            ];
            if( !$isEndround ){
                return $returnData;
            }
            //活动派彩
            $specialData = [
                'gs_tcid' => $cfg['trdcfg']['tc_id'],
                'gs_gid' => $gid,
                'gs_uid' => $accountId,
                'gs_price' => $amount,
                'gs_sn' => 'action_' . $roundId,
                'gs_type' => 2,
                'gs_type_name' => '活动派彩',
                'gs_time' => $ts,
                'gs_info' => json_encode($param),
                'gs_create_time' => $ts,
            ];
            $specialId = (new GameCardsSpecial())->insertGetId($specialData);
            if ($specialId) {
                Db::commit();
                $this->PushLog('freeSpinResult', '活动保存成功', $param);
                return $returnData;
            } else {
                Db::rollback();
                $this->PushLog('freeSpinResult', '活动保存失败', $param);
                $returnData['code'] = 1001;
                $returnData['msg'] = 'System error.';
            }
            return $returnData;
        }catch (\Exception $e){
            Db::rollback();
            $this->pushLog($param, 'freeSpinResult error：'.$e->getMessage(), $trdobj);
            $returnData['code'] = 1001;
            $returnData['msg'] = 'System error.';
            return $returnData;
        }
    }

    // 派发活动推广奖金
    public function promoPayout($params, $trdobj = null, $cfg = null){
        $param = $this->getParam($params, $cfg);
        $this->pushLog($param, 'promoPayout', $trdobj);
        Db::startTrans();
        try {
            $accountId = $param['brand_uid'];
            $roundId = $param['trans_id'];
            $amount = $param['amount'];
            $actionName = $param['promotion_id'];
            $amount = (float)Third::transExchangerate($amount, 0, 2);
            $ts = time();
            //获取用户数据
            $uinfo = UserModel::where(Meta::UFIELD['uname'], '=', $accountId)->find();
            $userBalance = $this->getUserBalance($uinfo[Meta::UFIELD['uid']]);
            $returnData = [
                'code' => 1000,
                'msg' => 'Success.',
                'data' => [
                    'brand_uid' => $accountId,
                    'currency' => Util::i18n_currency_code(),
                    'balance' => (float)$userBalance,
                ],
            ];
            $special = GameCardsSpecial::where('gs_sn', $roundId)->find();
            if( $special ){
                $returnData['code'] = 5043;
                $returnData['msg'] = 'Balance insufficient.';
                Db::rollback();
                return $returnData;
            }
            //活动派彩
            $specialData = [
                'gs_tcid' => $cfg['trdcfg']['tc_id'],
                'gs_gid' => 0,
                'gs_uid' => $accountId,
                'gs_price' => $amount,
                'gs_sn' => 'action_' . $roundId,
                'gs_type' => 2,
                'gs_type_name' => '活动派彩',
                'gs_time' => $ts,
                'gs_info' => json_encode($param),
                'gs_create_time' => $ts,
            ];
            $specialId = (new GameCardsSpecial())->insertGetId($specialData);
            if( !$specialId ){
                $returnData['code'] = 1001;
                $returnData['msg'] = 'System error.';
                return $returnData;
            }

            $gid = 0;
            if( isset($param['game_id']) ){
                $gid = Game::getGamesInfoBy($cfg['trdcfg']['tc_id'], $param['game_id'], 'code', 'g_id');
            }
            //操作用户余额
            $msg = UserModel::betRemarks($roundId, $cfg['trdcfg']['tc_name'], $gid, '活动派彩');
            $rlt = User::accountChange($uinfo[Meta::UFIELD['uid']], $amount, '+', 2, $msg);
//            if (!$rlt){
//                Db::rollback();
//                $msg = '操作余额失败';
//                $this->pushLog([$param, $trdobj, $cfg, $uinfo], $msg, $param, 'error');
//                $returnData['code'] = 5003;
//                $returnData['msg'] = 'Balance insufficient.';
//                return $returnData;
//            }
            Db::commit();
            return $returnData;

        }catch (\Exception $e){
            Db::rollback();
            $this->pushLog($param, 'promoPayout error：'.$e->getMessage(), $trdobj);
            $returnData['code'] = 1001;
            $returnData['msg'] = 'System error.';
            return $returnData;
        }
    }


    //验证参数token（用户uid md5加密）
    private function checkUserToken($brandId, $brandUid, $token){
        if( md5($brandUid.$brandId) == $token ){
            return true;
        }
        throw new Exception('token err');
    }

    private function pushLog($action, $msg, $data, $dir = 'log'){
        Utils::L($this->tcid.'/'.$dir, [$action, $msg, $data]);
    }

    //处理params
    private function getParam($param, $cfg = null){
        //设置平台id
        if( isset($cfg['trdcfg']['tc_id']) && $cfg['trdcfg']['tc_id'] ){
            $this->tcid = $cfg['trdcfg']['tc_id'];
        }
        return $param['param']??$param;
    }

    private function getUserBalance($uid){
        $balance = UserModel::getBalanceForDoubleWalletByGid($uid);
        $balance = Third::transExchangerate($balance,1);
        return $balance;
    }

}
