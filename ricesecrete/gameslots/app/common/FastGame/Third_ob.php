<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\Utils;
use DateTime;

class Third_ob extends Third
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

        $contentMD5 =  base64_encode(pack('H*', md5(json_encode($data))));
        if (isset($data['agent'])) {
            $path = $config['apis']["REGISTER"]['ga_route'];
        } else {
            $path = $config['apis']["GETUSERURL"]['ga_route'];
        }
        $httpMethod = "POST";
        $contentType = "application/json; charset=UTF-8";
        $requestTime = date('D, d M Y H:i:s').' UTC';
        $stringToSign = $httpMethod . "\n"
        . $contentMD5 . "\n"
        . $contentType . "\n"
        . $requestTime . "\n"
        . $path;
        $tc_tag = $config['trdcfg']["tc_tag"];
        $deKey = base64_decode($config['trdcfg']["tc_api_signkey"]);
        $hash_hmac = hash_hmac("sha1", $stringToSign, $deKey, true);
        $encrypted = base64_encode($hash_hmac);
        $authorization = "AB" . " " . $tc_tag . ":" . $encrypted;
        
        return compact('requestTime', 'authorization', 'contentMD5');
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
        $authorization = $data['header']['authorization'];
        $authorization_arr = explode( ':', $authorization);
        $contentType = "application/json; charset=UTF-8";
        $requestTime = $data['header']['date'];
        if ($data['param']["action_method"] == 'GetBalance') {
            $httpMethod = "GET";
            $path_arr = explode( '/ob', $data['param']["s"]);
            $path = $path_arr[1];
            $stringToSign = $httpMethod . "\n"
            .  "\n"
            .  "\n"
            . $requestTime . "\n"
            . $path;
        } else {
            $path = '/'.$data['param']["action_method"];
            unset($data['param']['s'], $data['param']['third'], $data['param']['action_method']);
            $contentMD5 =  base64_encode(pack('H*', md5(file_get_contents('php://input', 'r'))));
            $httpMethod = "POST";
            $stringToSign = $httpMethod . "\n"
            . $contentMD5 . "\n"
            . $contentType . "\n"
            . $requestTime . "\n"
            . $path;
        }
        $deKey = base64_decode($config['trdcfg']["tc_api_prikey"]);
        $hash_hmac = hash_hmac("sha1", $stringToSign, $deKey, true);
        $encrypted = base64_encode($hash_hmac);
        if($encrypted == $authorization_arr[1]){
            return true;
        }
        return false;
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
        /*Utils::L('test',['TokenTimestampTranser',$in,time()+$in-600]);
        return time()+$in-600;*/
    }

    function test(){
        return 'kyrianstg CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        // TODO: Implement transOtherKvs() method.
    }

    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if ($func == 'REGISTER') {
            $kds['tcuserkey'] = substr($datas['data']['player'], 0, -3);
        }
        if ($func == 'GETUSERURL') {
            $kds['tcgameurl'] = $datas['data']['gameLoginUrl'];
        }
    }
}
