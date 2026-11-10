<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;
use app\common\payment\PayRequest;


class Third_dgs extends Third
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
        $rand = get_rand_char(10);
        $token = md5($config['trdcfg']['tc_tag'].$config['trdcfg']['tc_api_signkey'].$rand);
        $kvs['token'] = $token;
        $kvs['rand'] = $rand;
        if(in_array($kvs['runfunc'],['REGISTER','GETUSERURL'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['password'] = md5($uname);
        }
        if(in_array($kvs['runfunc'],['DEPOSIT','WITHDRAW'])) {
            $kvs['money'] = Third::transExchangerate($kvs['o_amount'],$kvs['runfunc'] == 'DEPOSIT' ? 1 : 0, 2);
        }

    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if($func == 'GETUSERURL'){
            $web_url = getAppUrl();
            $token = $datas['token'];
            $lan = $config['trdcfg']['tc_langmap'];
            $game_id = Meta::initGetField('gtag',$tcid,$gid,$uid); //游戏标识
            if( $game_id ){
                $url1 = $datas['list'][0].$token.'&language='.$lan.'&tableId='.$game_id.'&backType=enter&backUrl='.$web_url;
                $url2 = $datas['list'][1].$token.'&language='.$lan.'&tableId='.$game_id.'&backType=enter&backUrl='.$web_url;
            }else{
                $url1 = $datas['list'][0].$token.'&language='.$lan.'&backType=enter&backUrl='.$web_url;
                $url2 = $datas['list'][1].$token.'&language='.$lan.'&backType=enter&backUrl='.$web_url;
            }
            $kds['tcgameurl'] = $ohterkvs['platform'] == 1 ? $url1:$url2;
        }
    }


}