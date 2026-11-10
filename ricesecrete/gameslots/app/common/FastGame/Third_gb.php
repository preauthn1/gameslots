<?php


namespace app\common\FastGame;


use app\common\payment\PayRequest;
use app\model\GameBetsSon;
use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};
use app\model\Games;

class Third_gb extends Third
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
        // 签名秘钥
        $key = json_decode($config['trdcfg']["tc_api_signkey"], true);
        $data['sign_key'] = $key['sign_key'];
        $encrypt_key = $key['encrypt_key'];
        // 加密秘钥
        $sign_key = $this->generateSign($data);
        $data['sign_key'] = $sign_key;
        $x = $this->generateX($data, $encrypt_key);
        $data['x'] = $x;
        return compact('sign_key', 'x');
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
        // 删除其他变量
        unset($param['s']);
        $sign = $param['sign'];
        unset($param['sign']);
        unset($param['third']);
        unset($param['action_method']);
        unset($param['XDEBUG_SESSION_START']); // TODO 删掉

        // 参数转 int
        $param['action'] = (int) $param['action'];
        $param['timestamp'] = (int) $param['timestamp'];
        if (isset($param['type'])) $param['type'] = (int) $param['type'];

        // 按键名排序
        ksort($param);

        // 获取加密秘钥 wallet_key
        $key = json_decode($config['trdcfg']["tc_api_signkey"], true);
        // 追加 key 变量到数组
        $param['key'] = $key['wallet_key'];
        // 生成签名并校验
        if ($sign == md5(json_encode($param))) {
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
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
        $uid = isset($kvs['uid']) ? $kvs['uid']:0;
        $g_tcid = isset($config['g_tcid']) ? $config['g_tcid']:$config['trdcfg']['tc_id'];
        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['user_token'] = UserThirds::where('ut_tcid',$g_tcid)->where('ut_uid',$uid)->value('ut_token');
            $kvs['user_id'] = UserThirds::where('ut_tcid',$g_tcid)->where('ut_uid',$uid)->value('ut_trdid');
        }
}


function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if( $func == 'REGISTER' ){
            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
            if( !$guser ){
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            }else{

            }
        }
    }

    private function generateSign($data){
        unset($data['x']);
        unset($data['lang']);
        $str = urldecode(http_build_query(myArrayFilter($data)));
        $sign_key = strtoupper(md5($str));
        return $sign_key;
    }

    private function generateX($data, $secret = ''){
            if (version_compare(PHP_VERSION, '8.1.0', '<=')) {
            unset($data['x']);
            unset($data['lang']);
            $pad = 8 - (strlen(json_encode($data)) % 8);
            // openssl_encrypt 的 DES-ECB 加密方式不支持 PHP 8.2
            $encryptedData = openssl_encrypt(json_encode($data).str_repeat(chr($pad), $pad), 'DES-ECB', $secret,
                OPENSSL_RAW_DATA | OPENSSL_NO_PADDING);
            return str_replace('/', '\/', base64_encode($encryptedData));
        } else {
            Utils::L('ThirdErrLogs',
                [
                    'msg'     => '当前 PHP 版本'.PHP_VERSION.'，openssl_encrypt 的 DES-ECB 仅支持 PHP 版本 <= 8.1',
                    'suggest' => '切换 PHP 版本 <= 8.1',
                ]
            );
            return '';
        }


    }
}
