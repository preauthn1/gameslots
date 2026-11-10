<?php


namespace app\common\FastGame;


use app\model\{GameBetsTemp, Games};
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};

class Third_fbapp extends Third
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
        ksort($data);
        $timestamp = strval(time())."000";
        $body_str = json_encode($data);
        $head_sign = md5("{$body_str}.{$config['trdcfg']['tc_tag']}.{$timestamp}.{$config['trdcfg']['tc_api_prikey']}");
        return compact('head_sign',  'timestamp');
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
        $param = $data['param'];
        $header = $data['header'];
        $ip_list = explode(',', $config['trdcfg']['tc_api_signkey']);
        //渠道id 等于数据库中的渠道id 或者ping请求的时候为true  并且请求ip要跟数据库定义的ip相等
        if(in_array($header['x-forwarded-for'], $ip_list)){
            if($param['callback'] == 'health'){
                return true;
            }
            if(($param['merchantId'] ?? $param[0]['merchantId']) == $config['trdcfg']['tc_tag']){
                return true;
            }
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
    }

    function test(){
        return 'kyrianstg CLASS';
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


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if($func == 'GETUSERURL'){
            $info = $datas['data'];
            $arr = ['url' => $info['serverInfo']['apiServerAddress'], 'token' => $info['token'], 'currency' => Meta::initGetField('tccurrency', $tcid, $gid, $uid)];
            $kds['tcgameurl'] = json_encode($arr);
        }
        if($func == 'REGISTER'){
            $kds['tcusername'] = Meta::initGetField('uname', $tcid, $gid, $uid);
        }

    }



}
