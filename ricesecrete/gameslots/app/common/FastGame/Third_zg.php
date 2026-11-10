<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Http, Meta, Third, Utils};
use app\model\ThirdConfigs;

class Third_zg extends Third
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

        $agent_code = $config['trdcfg']['tc_tag'];
        $agent_key = $config['trdcfg']['tc_api_prikey'];
        $signKey = $config['trdcfg']['tc_api_signkey'];

        $channel = $config['trdcfg']['tc_token'];

        $signData = $data;

        unset($signData['data']);
        unset($signData['sign']);
        unset($signData['channel']);
        $signData['agent'] = $agent_code;

        $jsign = json_encode($signData);

        $userdata = $this->AESKeyEncryption($jsign, $agent_key);
        $sign = $this->SignKeyEncryption($userdata,$signKey);

        return compact('channel', 'sign','userdata');
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
     * 生成签名
     *
     * @param string $agent_code - agent代码
     * @param string $agent_key - agent密钥
     * @param string $timestamp - 时间戳
     * @param string $secret_key - 密钥
     * @return string - 生成的签名
     */
    public function AESKeyEncryption($d, $a)
    {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = $dx = '';
        while (strlen($salted) < 48) {
            $dx = md5($dx . $a . $salt, true);
            $salted .= $dx;
        }
        $key = substr($salted, 0, 32);
        $iv = substr($salted, 32, 16);
        return base64_encode('Salted__' . $salt . openssl_encrypt($d . '', 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv));
    }

    public function SignKeyEncryption($a,$signKey)
    {
        return md5($a.$signKey, false);
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
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {
            $kvs['traceId'] = md5(date("YmdHis") . Utils::random(16));
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
        }

    }

    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        //   if( $func == 'REGISTER' ){
        //         $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
        //         if( !$guser ){
        //             UserThirds::create([
        //                 'ut_uid' => $uid,
        //                 'ut_tcid' => $tcid,
        //                 'ut_token' => $datas['data']['token'],
        //                 'ut_trdid' => $datas['data']['user_id'],
        //                 'ut_intime' => time(),
        //                 'ut_trdname' => $datas['data']['player_id'],
        //                 'ut_state' => 0
        //             ]);
        //         }else{
        //             $guser->save([
        //                 'ut_token' => $datas['data']['token'],
        //                 'ut_trdid' => $datas['data']['user_id'],
        //                 'ut_trdname' => $datas['data']['player_id'],
        //             ]);
        //         }
        //     }
    }
}
