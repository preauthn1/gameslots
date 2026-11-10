<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;

class Third_mt extends Third
{

    /**
     * 签名
     * @param $config
     * @param $data
     * @return mixed
     * @author twt326
     */
    function MakeSign($config, &$data)
    {
        $da = $data;
        unset($da['s'],$da['third'],$da['action_method'],$da['trace_id']);
        ksort($da);
        $trace_id = $config['trdcfg']['tc_api_signkey'];
        foreach ($da as $v) {
            $trace_id .= $v;
        }
        $trace_id = md5($trace_id);
        return compact('trace_id');
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
        // 此三方站回复数据无签名
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
        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['Token'] = Utils::uToken($kvs['uid'].$config['trdcfg']['tc_id']);  //生成token
        }
        if($kvs['runfunc'] == 'GETBETDETAIL') {
            $kvs['OrderID'] = $kvs['gbsn'];
        }
        $kvs['time'] = time();
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {

    }

}