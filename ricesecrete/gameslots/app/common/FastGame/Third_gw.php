<?php


namespace app\common\FastGame;


use app\model\{UserThirds, GameBetsTemp, Games};
use app\common\FastGame\Base\{Http, Meta, Third, Utils, Redis, ThirdTask};
use app\common\FastGame\Base\User;

class Third_gw extends Third
{

    /**
     * 签名
     * @param $config
     * @param $data
     * @return mixed
     * @author twt326
     * @date 2022-08-26 17:29
     */
    function MakeSign($config, &$data)
    {
        $body_str = json_encode($data);
        $key = $config['trdcfg']['tc_api_prikey'];
        $head_hash = md5($body_str.$key);
        return compact('head_hash');
    }

    /**验证签名
     * @param $config
     * @param $data
     * @return mixed
     * @author twt326
     * @date 2022-08-26 17:32
     */
    function CheckSign($config, $data)
    {
        return true;
    }

    /**
     * 转换第三方TOKEN过期时间为本平台支持的过期时间戳，将获取到的第三方TOKEN过期时间转换为整型秒为单位的时间戳
     * @param mixed $in
     * @return int
     * @author twt326
     * @date 2022-09-13 16:32
     */
    function TokenTimestampTranser($in)
    {
        return $in;
    }

    function test(){
        return 'kyrianstg CLASS';
    }

    /**
     * @inheritDoc
     *
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
        $uid = isset($kvs['uid'])?$kvs['uid']:0;
        $tcid =  $config['trdcfg']['tc_id'];
        $ts = time();
        $ms = microtime();
        $str_64 = Utils::random(64);
        if($kvs['runfunc'] == 'GETUSERURL'){
            $name = Meta::initGetField('uname', $tcid, $config['g_id'], $uid);
            $str_32 = Utils::random(32);
            $ut_token = md5("uid:{$uid}_tcid:{$tcid}_time:{$ts}_ms:{$ms}_str:{$str_32}");
            $guser = UserThirds::where('ut_tcid', $tcid)->where('ut_uid', $uid)->find();
            if (!$guser){
                //TODO 错误处理
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_trdid' => $name,
                    'ut_token' => $ut_token,
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            }else{
                $guser->ut_trdid =  $name;
                $guser->ut_token =  $ut_token;
                $guser->save();
            }
            $kvs['user_token'] = $ut_token;
        }else if($kvs['runfunc'] == 'DEPOSIT'){
            $ut_token = UserThirds::where('ut_tcid', $tcid)->where('ut_uid', $uid)->value('ut_token');
            $kvs['user_token'] = $ut_token;
            $money_token = md5("tid:{$tcid}_uid:{$uid}_type:DEPOSIT_time:{$ms}_str:{$str_64}");
            $kvs['in_money_token'] = $money_token;
            $key = "gw_recharge_" . $tcid . "_" . $money_token;
            Redis::setex($key, $money_token);
        }else if($kvs['runfunc'] == 'WITHDRAW'){
            $ut_token = UserThirds::where('ut_tcid', $tcid)->where('ut_uid', $uid)->value('ut_token');
            $kvs['user_token'] = $ut_token;
            $money_token = md5("tid:{$tcid}_uid:{$uid}_type:WITHDRAW_time:{$ms}_str:{$str_64}");
            $kvs['out_money_token'] = $money_token;
            $key = "gw_withdraw_" . $tcid . "_" . $money_token;
            Redis::setex($key, $money_token);
        }
        $kvs['roomId'] = explode('-', $config['trdcfg']['tc_api_signkey'])[0];
        $kvs['roomHash'] = explode('-', $config['trdcfg']['tc_api_signkey'])[1];
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {

        if($func == 'GETUSERURL'){
            $cfgs = Games::getConfigs(null, $tcid);
            $mall_key = "{$ohterkvs['roomId']}-{$ohterkvs['roomHash']}";
            $url = $cfgs['trdcfg']['tc_api_urlpre'] . '/login/thirdparty/' . $mall_key . "?token={$ohterkvs['user_token']}&op={$cfgs['trdcfg']['tc_tag']}&lang={$cfgs['trdcfg']['tc_langmap']}";
            $kds['tcgameurl'] = $url;
        }else if($func == 'GETBALANCE'){
            $info = $datas['data'];
            if($info['isSuccess'] == 1){
                $arr = array_values($info['userList'][0]);
                $kds['tcbalance'] = $arr[0];
            }
        }
    }

    function get_game_logs($apicfgs,$otherkvs){
        //每分钟只能调用10次
        /** 外部调用方法
         * $apicfgs=Games::getConfigs(tcid,gid);
         * Third::run($apicfgs,'本函数名',$otherkvs); //注单获取的开始时间结束时间等在在otherkvs中指定
         */
        // $rlt = Http::http($apicfgs,'GETBETLIST',self::$extClass,$otherkvs);
        //对获取的结果进行处理 这里只是以处理获取注单与游戏无关的情况，如果需要处理按游戏获取注单列表的任务的话，请参考 ThirdTask::runThirdTasks 方法中的$this->cfg['trdcfg']['tc_getbetlisttype']不等于all的情况
        //但事实上，核心点其实在于 Http::http方法 拿到三方返回数据之后的处理逻辑只要是正确的即可
        //如果是封装中有的方法 可以调用，比如：
        $cls = getc('ThirdTask_gw');
        if (!$cls) return false;
        /** @var ThirdTask_fb $ttobj */
        $ttobj = new $cls();
        $ttobj->init($apicfgs['trdcfg']['tc_id'],$apicfgs['trdcfg']['tc_code']);
        $rlt = Http::http($apicfgs, 'GETBETLIST', $this, $otherkvs);

        // Utils::L('wm_test', ['游戏参数', $rlt]);
        if ($rlt) {
            //处理API配置值
            $rltKeyFieldCfg = json_decode($apicfgs['apis']['GETBETLIST']['ga_keyfield'], true);
            $bds = Utils::getDataFromArrayByStrKey($rltKeyFieldCfg['r_list']['key'], $rlt);
//            Utils::L('wm_test',['游戏列表',$bds]);
            $wds = [];
//            Utils::L('task_fb', ['游戏参数2', $bds]);
            $bds = $ttobj->procBetDataPre($apicfgs, $bds, $rlt);
//            Utils::L('task_fb',['处理后的游戏列表',$bds]);
            foreach ($bds as $bdk => $bdv) {
                //Utils::L('test',['处理',$bdv]);
                $bd = $ttobj->procBetData('all', $bdv);
//                Utils::L('test',['处理结果',$bdv]);
                $bd = array_merge($bd, [
                    'gb_tcid'=>$apicfgs['trdcfg']['tc_id'],
                    'gb_intime' => time(),
//                    'gb_betinfo' => json_encode($bdv)
                ]);
                array_push($wds, $bd);
            }
            //记录数据
//            Utils::L('test_fb',['合并结果',$wds]);
            (new GameBetsTemp())->saveAll($wds);
            //处理uid为0的数据，写上UID的值（某些或全部的第三方返回的是用户名，不是用户ID）
            ThirdTask::procBetTempData($apicfgs['trdcfg']['tc_useridentify'], 'tcid', $apicfgs['trdcfg']['tc_id'], 0);
            $ttobj->transferBets($apicfgs['trdcfg']['tc_id'], 'all');

        }
    }
}
