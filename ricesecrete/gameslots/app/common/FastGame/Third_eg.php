<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Http, Meta, Third, Utils};
use app\model\ThirdConfigs;

class Third_eg extends Third
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
        return [];
    }

    //使用 HMAC-SHA256 生成加密哈希
    function hmac_sha256($key, $data){
        return hash_hmac('sha256', $data, $key);
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

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {

        $config = $this->apicfgs;
        $agent = $agent_code = $config['trdcfg']['tc_tag'];
        $token = $config['trdcfg']['tc_api_prikey'];
        $currency = $config['trdcfg']['tc_currency'];
        $kvs['agent'] = $agent;

        if (in_array($kvs['runfunc'], ['GETUSERURL'])) {


            $kvs['uname'] = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 用户名

            $kvs['gtag'] = Meta::initGetField('gtag', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 游戏代码
            $kvs['token'] = $token;
            $message = 'Token='.$token.'&Username='.$kvs['uname'].'&GameID='.$kvs['gtag'].'&AgentName='.$agent;
        }
        if (in_array($kvs['runfunc'], ['REGISTER'])) {


            $kvs['uname'] = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 用户名
            $kvs['currency'] = $currency;
            $message='{"Username":"'.$kvs['uname'].'","Currency":"'.$currency.'","AgentName":"'.$agent.'"}';

        }
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {

            $kvs['uname'] = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 用户名
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
            if($kvs['runfunc'] == 'WITHDRAW'){
                $kvs['amount'] = -$kvs['amount'];
            }
            $message ='{"Amount":"'.$kvs['amount'].'","AgentName":"'.$agent.'","Username":"'.$kvs['uname'].'","ReferenceCode":"testReferenceCode","TakeAll":false}';


        }
        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {

            $kvs['uname'] = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 用户名
            $message = 'AgentName='.$agent.'&Username='.$kvs['uname'];
        }
        if (in_array($kvs['runfunc'], ['GETBETLIST'])) {

            $message = 'StartTime='.$kvs['start_time'].'&EndTime='.$kvs['end_time'].'&AgentName='.$agent.'&Status=1&Page='.$kvs['page'].'&PageSize='.$kvs['page_size'];
        }
        $hash = self::hmac_sha256($token, $message);
        $kvs['hash'] = $hash;

    }

    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if ($func == 'REGISTER') {

            $kds['uid'] = $uid;
        }

    }
}
