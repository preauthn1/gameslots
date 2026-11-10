<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Meta, Third, Utils};
use app\model\UserThirds;

class Third_cq9slot extends Third
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
        return true;
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

    function test()
    {
        return 'kyrianstg CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
        $kvs['AuthToken'] = $config['trdcfg']['tc_token'];
        if (in_array($kvs['runfunc'], ['GETUSERAUTH'])) {
            //{"secret_key":"{secret_key}","operator_token":"{operator_token}","player_name":"{player_name}","currency":"{currency}"}
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['account'] = $uname;
            $kvs['password'] = md5($kvs['uid']);
        }
        if (in_array($kvs['runfunc'], ['GETUSERURL'])) {
            //{"secret_key":"{secret_key}","operator_token":"{operator_token}","player_name":"{player_name}","game_code":"{game_code},"language":"{language}"}
            $g_tcid = isset($config['g_tcid']) ? $config['g_tcid'] : $config['trdcfg']['tc_id'];
            $kvs['usertoken'] = UserThirds::where('ut_tcid', $g_tcid)->where('ut_uid', $kvs['uid'])->value('ut_token');
            $kvs['gamehall'] = $config['trdcfg']['tc_tag'];
            $kvs['gamecode'] = Meta::initGetField('gtag', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); //游戏标识
            $kvs['gameplat'] = 'web';
            $kvs['lang'] = $config['trdcfg']['tc_langmap'];
            $kvs['app'] = "N";
            $kvs['detect'] = "N";
        }
        if (in_array($kvs['runfunc'], ['REGISTER'])) {
            //{"secret_key":"{secret_key}","operator_token":"{operator_token}","player_name":"{player_name}","currency":"{currency}"}
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['account'] = $uname;
            $kvs['nickname'] = $uname;
            $kvs['password'] = md5($kvs['uid']);
        }
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['account'] = $uname;
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['mtcode'] = date("YmdHis") . rand(100000, 999999);
            $kvs['amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
        }
        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['account'] = $uname;
        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        Utils::L('CQ9SLOT_transResultData_fun', $func);
        Utils::L('CQ9SLOT_transResultData', $datas);
        if ($func == 'GETUSERAUTH') {
            $guser = UserThirds::where('ut_tcid', $tcid)->where('ut_uid', $uid)->find();
            if (!$guser) {
                //TODO 错误处理
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_token' => $datas['data']['usertoken'],
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            } else {
                $guser->ut_token = $datas['data']['usertoken'];
                //TODO 错误处理
                $guser->save();
            }
        }
    }
}
