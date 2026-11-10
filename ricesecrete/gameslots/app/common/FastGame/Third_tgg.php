<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Meta;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\Utils;

class Third_tgg extends Third
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
        if(isset($data['settings']['payout']) && $data['settings']['payout'] != 0){
            $rtp_file = base_path("common") . "FastGame/Rtp_tgg.php";
            if(file_exists($rtp_file)){
                $rtp = require($rtp_file);
                $game_rtp = $rtp[$config['g_code']]??0;
                $game_rtps = explode(",",$game_rtp);
                if(!in_array($data['settings']['payout'], $game_rtps)){
                    if(isset($game_rtps[0]) && !empty($game_rtps[0])){
                        $data['settings']['payout'] = $game_rtps[0];
                    } else {
                        unset($data['settings']['payout']);
                    }
                }
            } else {
                unset($data['settings']['payout']);
            }
        }
        $md5 = array();
        $data['token'] = $config['trdcfg']["tc_api_signkey"].":".$data['settings']['user_id'];
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
        $md5 = md5($md5_str);
        $data['signature'] = $md5;
        return $md5;
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
        Utils::L('test',['TokenTimestampTranser',$in,time()+$in-600]);
        return time()+$in-600;
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $platform = $kvs['platform'] ?? 0;
        $kvs['platForm'] = $platform == 1 ? 'pc' : 'mobile'; //平台标识 1 pc 2 h5  3 mobile  'platform' 1 PC   2 手机
        // TODO: Implement transOtherKvs() method.
    }
}
