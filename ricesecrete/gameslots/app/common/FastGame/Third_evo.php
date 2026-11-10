<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\Utils;
use DateTime;

class Third_evo extends Third
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
        $data['player']['session']['id'] = $sid = md5($data['player']['id']);
        return $sid;
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
        $sign = md5(json_encode($data,JSON_UNESCAPED_SLASHES));
        return $sign;
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
        if ($func == 'GETUSERURL') {
            $kds['tcgameurl'] = $datas['entry'];
        }
    }
}
