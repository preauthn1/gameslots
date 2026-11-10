<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\Meta;

class Third_jslgames extends Third
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
        //签名步骤一：按字典序排序参数
        unset($data['sign']);
        ksort($data);
        $string = urldecode(http_build_query($data));
//        $string = Http::ToUrlParams($data,false,['sign']);
        //签名步骤二：在string后加入KEY
        $string = $string .'&key='. $config['trdcfg']['tc_api_prikey'];
        //签名步骤三：MD5加密
        $string = md5($string);
        $data['sign']=$string;

        return $string;
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
        unset($data['sign'], $data['s'], $data['action_method'], $data['third']);
        //签名步骤一：按字典序排序参数
        ksort($data);
        $string = http_build_query($data);
//        $string = Http::ToUrlParams($data,false,['sign', 'action_method', 's', 'third']);
        //签名步骤二：在string后加入KEY
        $string = $string .'&key='.  $config['trdcfg']['tc_api_prikey'];
        //签名步骤三：MD5加密
        return md5($string);
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

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        // TODO: Implement transOtherKvs() method.
    }

    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
    }
}
