<?php

namespace app\common\FastGame;

use app\common\FastGame\Base\Meta;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\Utils;
use app\model\Games;

class Third_evoplay extends Third
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
        $md5 = array();
        if (isset($data['token']) && isset($data['settings'])) {
            $data['token'] = $config['trdcfg']["tc_api_signkey"].":".$data['settings']['user_id'];
        }
        foreach ($data as $required_arg) {
            $arg = $required_arg;
            if(is_array($arg)){
                if(count($arg)) {
                    $recursive_arg = '';
                    array_walk_recursive($arg, function($item) use (& $recursive_arg) {
                        if(!is_array($item)) { $recursive_arg .= ($item . ':');} });
                    $md5[] = substr($recursive_arg, 0, strlen($recursive_arg)-1); // get rid of last colon-sign
                } else {
                    $md5[] = '';
                }
            } else {
                $md5[] = $arg;
            }
        }

        $md5[] = $config['trdcfg']["tc_api_prikey"];
        $md5_str = implode('*', $md5);
        $signature = md5($md5_str);
        $data['signature'] = $signature;
        return $signature;
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
        $md5 = array();
        $md5[] = $config['trdcfg']["tc_tag"];
        $md5[] = 2;
        $signature = $data['signature'];
        unset($data['third']);
        unset($data['signature']);
        foreach ($data as $required_arg) {
            $arg = $required_arg;
            if(is_array($arg)){
                if(count($arg)) {
                    $recursive_arg = '';
                    array_walk_recursive($arg, function($item) use (& $recursive_arg) {
                        if(!is_array($item)) { $recursive_arg .= (htmlspecialchars_decode($item) . ':');} });
                    $md5[] = substr($recursive_arg, 0, strlen($recursive_arg)-1); // get rid of last colon-sign
                } else {
                    $md5[] = '';
                }
            } else {
                $md5[] = $arg;
            }
        }
        $md5[] = $config['trdcfg']["tc_api_prikey"];
        $md5_str = implode('*', $md5);
        $md5 = md5($md5_str);
        if($signature != $md5){
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
        return time()+$in-600;
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $platform = $kvs['platform'] ?? 0;
        $kvs['platForm'] = $platform == 1 ? 'pc' : 'mobile'; //平台标识 1 pc 2 h5  3 mobile  'platform' 1 PC   2 手机
        $kvs['cashUrl'] = rtrim(getAppUrl(), "/") . "/#/wallet";
        $kvs['exitUrl'] = getAppUrl();
    }


    public function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $otherkvs) {
        if($func == 'GETBETDETAIL'){
            $details = $datas['data']['data'];
            if (isset($details['custom'])) {
                if (isset($details['game']['response'])) {
                    $details['game']['response'] = json_decode($details['game']['response'], true);
                }
                $kds['tcgamedetailurl'] = getWebUrl() . '/show?data=' . base64_encode(json_encode($details));
            } else {
                // /render-event
                // {"project": "{tctag}","version": 1,"signature": "{signature}","event_id": "{gbsn}"}
                $apicfgs = Games::getConfigs(null, $tcid);
                $data = [
                    'project' => $apicfgs['trdcfg']['tc_tag'],
                    'version' => 1,
                    'event_id' => $otherkvs['gbsn'],
                ];
                $this->MakeSign($apicfgs, $data);
                $kds['tcgamedetailurl'] =  $apicfgs['trdcfg']['tc_api_urlpre'] . "/render-event?" . http_build_query($data);
            }
        }
    }
    /**
     * 解析注单源数据
     * @param $apicfgs
     * @param $otherkvs
     * @return void
     */
    public function parsebetinfo($apicfgs, $otherkvs) {
        if (!isset($otherkvs['betInfo']) || empty($otherkvs['betInfo']['gb_betinfo'])) {
            return false;
        }
        $gb_betinfo = $otherkvs['betInfo']['gb_betinfo'];
        if (is_array($gb_betinfo)) {
            $bet_info = $gb_betinfo[0] ?? $gb_betinfo;
        } else {
            $bet_info = json_decode($gb_betinfo,true);
        }
        $details = json_decode($bet_info['data']['details'], true);

        if (isset($details['custom'])) {
            return $details['custom'];
        }
        // /render-event
        // {"project": "{tctag}","version": 1,"signature": "{signature}","event_id": "{gbsn}"}
        $data = [
            'project' => $apicfgs['trdcfg']['tc_tag'],
            'version' => 1,
            'event_id' => $otherkvs['gbsn'],
        ];
        $this->MakeSign($apicfgs, $data);
        return $apicfgs['trdcfg']['tc_api_urlpre'] . "/render-event?" . http_build_query($data);
    }
}