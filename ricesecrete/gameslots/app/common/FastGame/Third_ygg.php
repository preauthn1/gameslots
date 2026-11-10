<?php


namespace app\common\FastGame;


use app\common\payment\PayRequest;
use app\model\GameBetsSon;
use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};
use app\model\Games;

class Third_ygg extends Third
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
        $uid = isset($kvs['uid']) ? $kvs['uid']:0;
        $g_tcid = isset($config['g_tcid']) ? $config['g_tcid']:$config['trdcfg']['tc_id'];
        $gid = $config['g_id'] > 0 ?  $config['g_id'] : Game::getGamesInfoBy($g_tcid, 'aecricket', 'code', 'g_id');

        $signKey = Meta::initGetField('tcapisignkey',$g_tcid,$gid,$uid);
        $brandId = Meta::initGetField('tctag',$g_tcid,$gid,$uid);
        $username = Meta::initGetField('uname',$g_tcid,$gid,$uid);
        $kvs['sign'] = strtoupper(md5($brandId.$username.$signKey));

        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['token'] = md5($username.$brandId);
            $platform = $kvs['platform'] ?? 0;
            $kvs['channel'] = $platform == 1 ? 'pc' : 'mobile'; //平台标识 1 pc 2 h5  3 mobile  'platform' 1 PC   2 手机
            $kvs['return_url'] = $kvs['back_url']= getAppUrl();
        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if($func == 'GETUSERURL'){
//            $key = Meta::initGetField('tcapikey', $config['g_tcid'], $config['g_id'], $uid);
//            $iv = Meta::initGetField('tcapisignkey', $config['g_tcid'], $config['g_id'], $uid);
//            if( $kds ){
//                $kds = $this->aes256CbcDecrypt($key, $kds, $iv);
//            }else{
//                $kds = [];
//            }
        }
    }

}
