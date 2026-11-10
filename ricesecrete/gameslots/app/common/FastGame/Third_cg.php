<?php


namespace app\common\FastGame;


use app\common\payment\PayRequest;
use app\model\GameBetsSon;
use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};
use app\model\Games;

class Third_cg extends Third
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
        if($kvs['runfunc'] == 'REGISTER'){
            $data = json_encode([
                'accountId' => Meta::initGetField('uname',$g_tcid,$gid,$uid),
                'currency' => Meta::initGetField('tccurrency',$g_tcid,$gid,$uid),
            ]);
            $key = Meta::initGetField('tcapikey',$g_tcid,$gid,$uid);
            $iv = Meta::initGetField('tcapisignkey',$g_tcid,$gid,$uid);
            $kvs['data'] = $this->aes256CbcEncrypt($key, $data, $iv);
        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if($func == 'GETUSERURL'){
            $key = Meta::initGetField('tcapikey', $config['g_tcid'], $config['g_id'], $uid);
            $iv = Meta::initGetField('tcapisignkey', $config['g_tcid'], $config['g_id'], $uid);
            $url = $config['trdcfg']['tc_token'];
            $reCode = Meta::initGetField('uname', $config['g_tcid'], $config['g_id'], $uid);
            $query = [
                'version' => '1.0',
                'language' => Meta::initGetField('lang',$tcid,$gid,$uid),
                'channelId' => Meta::initGetField('tctag', $config['g_tcid'], $config['g_id'], $uid),
                'mask' => false,
                'data' => $this->aes256CbcEncrypt($key, $reCode, $iv),
            ];
            $gameId = Meta::initGetField('gtag', $config['g_tcid'], $config['g_id'], $uid);
            $kds['tcgameurl'] = rtrim($url, '/') . '/'.$gameId.'/?' . http_build_query($query);
        }else if($func == 'GETBETDETAIL') {
            $url = $config['apis']['GETBETDETAIL']['ga_gparam'];
            //http://testenv-dev.cg11systems.com/client/api/game_result.php?snmode&sn=18216877
//            $gb_sn_ac = GameBetsSon::where(['gb_uid'=>$uid,'gb_gid'=>$ohterkvs['betInfo']['gb_gid'],'gb_sn'=>$ohterkvs['gbsn']])->value('gb_sn_ac');
//            $gids = Meta::initGetField('gtag',$tcid,$ohterkvs['betInfo']['gb_gid'],$uid); //游戏标识
            $lang = Meta::initGetField('lang',$tcid,$gid,$uid);
            $kds['tcgamedetailurl'] = $url."/client/api/game_result.php?snmode&sn=".$ohterkvs['gbsn']."&lang=".$lang;
        }else{
            $key = Meta::initGetField('tcapikey', $config['g_tcid'], $config['g_id'], $uid);
            $iv = Meta::initGetField('tcapisignkey', $config['g_tcid'], $config['g_id'], $uid);
            if( $kds ){
                $kds = $this->aes256CbcDecrypt($key, $kds, $iv);
            }else{
                $kds = [];
            }
        }



    }

    private function aes256CbcDecrypt($key, $data, $iv)
    {
        $raw_key = base64_decode($key);
        $raw_iv = base64_decode($iv);
        //$raw_data = base64_decode($data);
        $raw_data = $data;

        return openssl_decrypt($raw_data, "AES-256-CBC", $raw_key, 0, $raw_iv);
    }

    private function aes256CbcEncrypt($key, $data, $iv)
    {
        $raw_key = base64_decode($key);
        $raw_iv = base64_decode($iv);
        //$raw_data = base64_decode($data);
        $raw_data = $data;

        return openssl_encrypt($raw_data, "AES-256-CBC", $raw_key, 0, $raw_iv);
    }
}
