<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;
use app\api\redis\ApiRedis;

class Third_pp extends Third
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
        $da = $data;
        unset($da['hash'],$da['fg_posttype']);
        ksort($da);
        $hash = md5(urldecode(http_build_query(myArrayFilter($da))).$config['trdcfg']['tc_api_signkey']);
        return compact('hash');
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
        unset($data['action_method'],$data['third'],$data['s']);
        $sign = $this->MakeSign($config, $data);
        if($sign['hash'] != $data['hash']){
            Utils::L('pp', ['CheckSign','签名错误', ['sign'=>$sign['hash'],'third_sign'=>$data['hash']]]);
            return false;
        }
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
        if($kvs['runfunc'] == 'GETUSERURL'){
            $kvs['platform'] = $kvs['platform'] == 1 ? 'WEB' : 'MOBILE';
            $web_url = getAppUrl();
            $kvs['rcCloseUrl'] = $web_url;
            $kvs['cashierUrl'] = $web_url.'/#/transactions';
        }
        if($kvs['runfunc'] == 'GETBETDETAIL'){
            $kvs['roundId'] = explode('_',$kvs['gbsn'])[0];
            $kvs['gameId'] = Meta::initGetField('gtag',$kvs['betInfo']['gb_tcid'],$kvs['betInfo']['gb_gid'],$kvs['uid']); //游戏标识
        }

        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if ($func == 'GETUSERURL') {
            $kds['tcgameurl'] = $datas['gameURL'];
        }
    }

}
