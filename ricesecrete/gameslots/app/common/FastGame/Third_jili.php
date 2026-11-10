<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;
use app\api\redis\ApiRedis;

class Third_jili extends Third
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
        date_default_timezone_set('America/Caracas'); //转三方时区时间
        $pam = $data;
        unset($pam['Key']);
        if (isset($pam['AgentId'])) {
            $KeyA = urldecode(http_build_query(myArrayFilter($pam)));
        } else {
            $KeyA = urldecode(http_build_query(myArrayFilter($pam))).'&AgentId='.$config['trdcfg']['tc_tag'];
        }
        $KeyB = md5(date('ymj',time()).$config['trdcfg']['tc_tag'].$config['trdcfg']['tc_api_signkey']);
        $key = get_rand_char(6).md5($KeyA.$KeyB).get_rand_char(6);
        return compact('key');
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
        $sys=(new ApiRedis())->systemInfo();
        if($kvs['runfunc'] == 'GETUSERURL'){
            $kvs['platform'] = $kvs['platform'] == 1 ? 'web' : 'app';
            $kvs['homeurl'] = getAppUrl();
        }
        elseif ($kvs['runfunc'] == 'GETBETDETAIL') {
            $kvs['gbsn'] = $kvs['betInfo']['gb_sn'];
        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if ($func == 'GETUSERURL') {
            $kds['tcgameurl'] = $datas['Data'];
        }
    }

}
