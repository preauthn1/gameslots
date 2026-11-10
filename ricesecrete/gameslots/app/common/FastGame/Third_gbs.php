<?php


namespace app\common\FastGame;


use app\model\{GameBetsTemp, Games, GameWmSpecial, UserThirds};
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};

class Third_gbs extends Third
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
//
//        $head_sign = $config['trdcfg']["tc_token"];
//        return compact('head_sign');
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

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
//        $config['trdcfg']['tc_api_signkey']
        $uname = '';
        $data = [];
        if( $kvs['runfunc'] != 'GETBETLIST' ){
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
        }
        if( $kvs['runfunc'] == 'REGISTER' ){
            //注册
            $data = [
                'action' => 'register',
                'appID' => $config['trdcfg']['tc_tag'],
                'appSecret' => $config['trdcfg']['tc_api_prikey'],
                'uid' => $uname,
                'name' => $uname,
            ];
        }elseif( $kvs['runfunc'] == 'GETUSERURL' ){
            //获取游戏地址
            $data = [
                'action' => 'login',
                'appID' => $config['trdcfg']['tc_tag'],
                'appSecret' => $config['trdcfg']['tc_api_prikey'],
                'lang' => $config['trdcfg']['tc_api_prikey'],
                'uid' => $uname,
                'is_https' => 1,
            ];
            if( $config['g_tag'] ){
                //有游戏标签则为游戏登录
                $data['gameCode'] = $config['g_tag'];
            }else{
                //没有则为大厅登录
                $data['action'] = 'lobbyLogin';
            }
        }elseif( $kvs['runfunc'] == 'GETBALANCE' ){
            //获取用户余额
            $data = [
                'action' => 'getMoney',
                'appID' => $config['trdcfg']['tc_tag'],
                'appSecret' => $config['trdcfg']['tc_api_prikey'],
                'uid' => $uname,
            ];
        }elseif( $kvs['runfunc'] == 'DEPOSIT' ){
            //充值
            $data = [
                'action' => 'transfer',
                'appID' => $config['trdcfg']['tc_tag'],
                'appSecret' => $config['trdcfg']['tc_api_prikey'],
                'uid' => $uname,
                'orderNo' => date('YmdHis'),
                'amount' => rtrim(rtrim(sprintf('%.2f', Third::transExchangerate($kvs['o_amount'], 1, 2)), '0'), '.'),
                'isForce' => 1,
            ];
        }elseif( $kvs['runfunc'] == 'WITHDRAW' ){
            //提现
            $data = [
                'action' => 'transfer',
                'appID' => $config['trdcfg']['tc_tag'],
                'appSecret' => $config['trdcfg']['tc_api_prikey'],
                'uid' => $uname,
                'orderNo' => date('YmdHis'),
                'amount' => -rtrim(rtrim(sprintf('%.2f', Third::transExchangerate($kvs['o_amount'], 0, 2)), '0'), '.'),
                'isForce' => 1,
            ];
        }elseif( $kvs['runfunc'] == 'GETBETLIST' ){
            //获取游戏注单
            $data = [
                'action' => 'getDetailed',
                'appID' => $config['trdcfg']['tc_tag'],
                'appSecret' => $config['trdcfg']['tc_api_prikey'],
                'starttime' => date('Y-m-d H:i:s', $kvs['starttime']),
                'endtime' => date('Y-m-d H:i:s', $kvs['endtime']),
                'page' => $kvs['page']??1,
                'pernumber' => $kvs['pernumber']??5000,
            ];
        }
        $kvs['x'] = $this->encryptData($data, $config['trdcfg']['tc_api_signkey'], $config['trdcfg']['tc_token']);
        // TODO: Implement transOtherKvs() method.
    }

    //加密参数
    private function encryptData($data, $signKey, $encryptKey){
        $data['sign_key'] = $this->generateSign($data, $signKey);
        return $this->des_ecb_encrypt(json_encode($data), $encryptKey);
    }

    //签名
    private function generateSign(&$data,$signKey){
        ksort($data);
        $string = Http::ToUrlParams($data);
        $string = $string .'&sign_key='. $signKey;
        return strtoupper(md5($string));
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if($func == 'REGISTER'){
            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
            if (!$guser){
                //TODO 错误处理
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            }
        }
    }

    public function des_ecb_encrypt($data, $key) {
        // 使用 DES-ECB 模式加密数据
        $encryptedData = openssl_encrypt($data, 'DES-ECB', $key, OPENSSL_RAW_DATA);
        // 将加密后的数据编码为 Base64 以便于存储或传输
        return base64_encode($encryptedData);
    }

    public function des_ecb_decrypt($encryptedData, $key) {
        // 将 Base64 编码的数据解码
        $encryptedData = base64_decode($encryptedData);
        // 使用 DES-ECB 模式解密数据
        return openssl_decrypt($encryptedData, 'DES-ECB', $key, OPENSSL_RAW_DATA);
    }
}
