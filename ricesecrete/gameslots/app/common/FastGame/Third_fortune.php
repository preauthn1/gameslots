<?php


namespace app\common\FastGame;


use app\common\lib\Util;
use app\common\FastGame\Base\{ Meta, Third};


class Third_fortune extends Third
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
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if ($func == 'GETUSERURL') {
            $baseUrl = $config['trdcfg']['tc_api_urlpre'];
            $data = [];
            $data['oid'] = $config['trdcfg']['tc_tag'];
            $data['oa'] = Meta::initGetField('uname', $tcid, $gid, $uid);
            $data['op'] = md5('fortune_'.$data['oa']);
            $data['hv'] = 1;//用户的物理设备地址，没有可以传1
            $data['ip'] = Util::get_ip();
            $data['sid'] = 0;#会话id，没有填写0
            $data['l'] = $config['trdcfg']['tc_langmap'];//语言
            $data['g'] = $config['g_tag'];
            $data['m'] = 0;#固定值
            $data['t'] = intval(microtime(true) * 1000);//毫秒级时间戳
            $data['ce'] =  $config['trdcfg']['tc_currency'];//货币
            $kds['tcgameurl'] = $baseUrl.'/'.$data['g'].'/index.html?'.http_build_query($data);
        }
    }

}