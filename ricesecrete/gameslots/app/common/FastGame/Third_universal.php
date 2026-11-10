<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\Utils;

class Third_universal extends Third
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
        //$postData = http_build_query($data);
        $postData = json_encode($data);
        $str = hash_hmac('sha256', $postData, $config['trdcfg']['tc_api_signkey']);
        return $str;
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
        Utils::L('test',['checksign','data'=>$data]);
        if (!isset($data['return_headers'])){
            return false;
        }
        $header=$data['return_headers'];
        unset($data['s'],$data['third'], $data['game_sys_sign'], $data['action_method'], $data['gid'], $data['uid'], $data['return_headers']);
        Utils::L('test',['checksign:1','data'=>$data,'header:'=>$header]);

        $postData = json_encode($data);
        $str = hash_hmac('sha256', $postData, $config['trdcfg']['tc_api_signkey']);
        Utils::L('test',['checksign:2',$header['x-request-sign'],$str]);
        if($str != $header['x-request-sign']){
            Utils::L('test',['body'=>$data,'local' => $header['x-request-sign'], 'header' => $str, 'msg' => '签名错误']);
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

    function test(){
        return 'universal CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        // TODO: Implement transOtherKvs() method.
    }
}
