<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;
use app\common\game\GameRequest;


class Third_atg extends Third
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
        if($kvs['runfunc'] == 'GETUSERURL') {
            //获取游戏key
            $gamekey = '';
            try {
                $username = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
                $urls = $config['trdcfg']['tc_api_urlpre']."/game-providers/".$config['trdcfg']['tc_tag']."/games/".$config['g_tag']."/key";
                $header[] = 'X-Token: '.Meta::initGetField('tctoken', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
                $content = GameRequest::curl_get($urls,['username'=>$username],$header);
                Utils::L("{$config['trdcfg']['tc_id']}/http",['获取游戏key',$urls, $header,$content]);
                $res = json_decode($content,true);
                if(isset($res['status']) && $res['status'] == 'success'){
                    $gamekey = $res['data']['key'];
                }else{
                    Utils::L("{$config['trdcfg']['tc_id']}/http",['获取游戏key失败', $res]);
                }
            } catch (\Exception $e) {
                Utils::L("{$config['trdcfg']['tc_id']}/http",['获取游戏key错误', $e->getMessage(), $e->getTraceAsString()]);
            }
            $kvs['gamekey'] = $gamekey;
            $platform = $kvs['platform'] ?? 0;
            $kvs['platForm'] = $platform == 1 ? 'desktop' : 'mobile'; //平台标识
        }else if( in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW']) ) {
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['o_amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {


    }

}