<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;

class Third_wgs extends Third
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
        unset($da['sign']);
        $string = urldecode(http_build_query(myArrayFilter($da)));
        $string = str_replace("+", " ", $string).'&md5key='. $config['trdcfg']['tc_api_signkey'];
        $sign = md5($string);
        return compact('sign');
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
        if($kvs['runfunc'] == 'DEPOSIT') {
            $tcbalance = floatval(Meta::initGetField('tcbalance',$config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']));
            $o_amount = intval(Third::transExchangerate($kvs['o_amount'],1, 0));
            $kvs['apoints'] = round($tcbalance + $o_amount, 3);
        }
        if($kvs['runfunc'] == 'WITHDRAW') {
            $tcbalance = floatval(Meta::initGetField('tcbalance',$config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']));
            $o_amount = intval(Third::transExchangerate($kvs['o_amount'],0, 0));
            $kvs['apoints'] = round($tcbalance - $o_amount, 3);
        }

        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if($func == 'GETUSERURL'){
            $kds['tcgameurl'] = 'https:'.$datas['url'];
        }

    }

}