<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Http, Meta, Third, Utils};
use app\model\ThirdConfigs;

class Third_pbty extends Third
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

        $agent = $agent_code = $config['trdcfg']['tc_tag'];
        $agent_key = $config['trdcfg']['tc_api_prikey'];
        $signKey = $config['trdcfg']['tc_api_signkey'];
        $iv = $config['trdcfg']['tc_token'];

        $timestamp = time()*1000;
        $hashToken = md5($agent_code. $timestamp . $agent_key);
        $tokenPayLoad = $agent_code . '|' . $timestamp . '|' . $hashToken;
        $token = $this->encryptAES($signKey, $tokenPayLoad,$iv);
        //echo $token;die;
        return compact('token','agent');
    }

    private function encryptAES($secretKey, $tokenPayLoad,$iv){
        $encrypt = openssl_encrypt($tokenPayLoad, "AES-128-CBC", $secretKey, OPENSSL_RAW_DATA, $iv);
        return base64_encode($encrypt);
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


        if (in_array($kvs['runfunc'], ['GETUSERURL'])) {

        }
        if (in_array($kvs['runfunc'], ['REGISTER'])) {


        }
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {

            $kvs['traceId'] = md5(date("YmdHis") . Utils::random(16));
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
        }
        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {

        }

    }

    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {

    }
}
