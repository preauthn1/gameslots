<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;
use app\common\payment\PayRequest;


class Third_dg extends Third
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
        if($kvs['runfunc'] == 'REGISTER' || $kvs['runfunc'] == 'GETUSERURL') {
            $rand = get_rand_char(10);
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $token = md5($config['trdcfg']['tc_tag'].$config['trdcfg']['tc_api_signkey'].$rand);
            $password = md5($uname);
            $kvs['token'] = $token;
            $kvs['rand'] = $rand;
            $kvs['password'] = $password;
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
            $tctokentime = Meta::initGetField('tctokentime',$tcid,$gid,$uid); //DG游戏用这个来特殊标记是否进入指定游戏(1不进入)
            if( $tctokentime == 1 ){
                $url1 = $datas['list'][0].$token.'&language='.$lan.'&backType=enter&backUrl='.$web_url;
                $url2 = $datas['list'][1].$token.'&language='.$lan.'&backType=enter&backUrl='.$web_url;
            }else{
                $url1 = $datas['list'][0].$token.'&language='.$lan.'&tableId='.$game_id.'&backType=enter&backUrl='.$web_url;
                $url2 = $datas['list'][1].$token.'&language='.$lan.'&tableId='.$game_id.'&backType=enter&backUrl='.$web_url;
            }
            $kds['tcgameurl'] = $ohterkvs['platform'] == 1 ? $url1:$url2;
        }

        if($func == 'GETBETDETAIL') {
            $urls = $config['trdcfg']['tc_token']."/ag/result/getAgentFix.html?username=".$config['trdcfg']['tc_tag'];
            $agentFix = PayRequest::curlS($urls,[]);
            if($agentFix){
                $agentFix = intval(trim($agentFix,'"'));
                $kds['tcgamedetailurl'] = $config['trdcfg']['tc_token']."/ag/result/result.html?language=".$config['trdcfg']['tc_langmap']."&agentFix=".$agentFix."&id=".trim($ohterkvs['gbsn'],'-');
            }
        }

    }

}