<?php


namespace app\common\FastGame;

use app\api\redis\ApiRedis;
use app\common\redis\CommomRedis;
use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;

class Third_sabasw extends Third
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
        return [];
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

        $kvs['vendor_id'] = $config['trdcfg']['tc_api_signkey'];
        //token字段放配置参数，比如：盘口_钱包编号,token[0]为盘口，token[1]为钱包编号
        $token = explode('_',$config['trdcfg']['tc_token']);
        $uname = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
        $kvs['vendor_member_id'] = $config['trdcfg']['tc_tag'].'_'.$uname;

        if($kvs['runfunc'] == 'REGISTER'){

            $kvs['operatorId'] = $config['trdcfg']['tc_tag'];
            $kvs['username'] = $config['trdcfg']['tc_tag'].'_'.$uname;
            $kvs['oddstype'] = $token[0];
            $kvs['currency'] = $config['trdcfg']['tc_currency'];
            $kvs['maxtransfer'] = $config['trdcfg']['tc_max_bet'];
            $kvs['mintransfer'] = $config['trdcfg']['tc_min_bet'];

        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {

    }

}