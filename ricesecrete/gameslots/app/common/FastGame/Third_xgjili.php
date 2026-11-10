<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Meta, Third, Utils};

class Third_xgjili extends Third
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
        return true;
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
     * 转换第三方TOKEN过期时间为本平台支持的过期时间戳，将获取到的第三方TOKEN过期时间转换为整型秒为单位的时间戳
     * @param  mixed  $in
     * @return int
     * @author twt326
     * @date 2022-09-13 16:32
     */
    function TokenTimestampTranser($in)
    {
        return time() + 3600 * 24 * 365; // 5天过期
    }

    function test()
    {
        return 'kyrianstg CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
        $kvs['operator_token'] = $config['trdcfg']['tc_token'];
        $kvs['ts'] = time();
        if (in_array($kvs['runfunc'], ['REGISTER', 'GETUSERURL'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 用户名
            $data = [
                'account'  => $uname,// 区分大小写，总长度必须小于32个字符 (uid、utoken、merchantId 接入方自行生成與管理)
                'password' => md5($uname), // ec平台用户授权码，一次授权之后不可变更，长度必须为32个字符
                'gameType' => $config['trdcfg']['tc_api_prikey'],
                'gameCode' => Meta::initGetField('gcode', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']),
                'isMobile' => true,
                'lang'     => $config['trdcfg']['tc_langmap'],
                'coin'     => $config['trdcfg']['tc_currency'],
            ];
        }

        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {
            //{"operator_token":"{operator_token}","user_id":"{user_id}","ts":"{i|ts}","sign":"{sign}"}
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $data = [
                'account'  => $uname,// 区分大小写，总长度必须小于32个字符 (uid、utoken、merchantId 接入方自行生成與管理)
                'password' => md5($uname), // ec平台用户授权码，一次授权之后不可变更，长度必须为32个字符
                'gameType' => $config['trdcfg']['tc_api_prikey'],
                'coin'     => $config['trdcfg']['tc_currency'],
            ];
        }
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $data = [
                'account'         => $uname,// 区分大小写，总长度必须小于32个字符 (uid、utoken、merchantId 接入方自行生成與管理)
                'password'        => md5($uname), // ec平台用户授权码，一次授权之后不可变更，长度必须为32个字符
                'gameType'        => $config['trdcfg']['tc_api_prikey'],
                'coin'            => $config['trdcfg']['tc_currency'],
                'orderNoMerchant' => "s".time().rand(100000, 999999),
                'amount'          => floatval($kvs['o_amount']),
            ];
            if ($kvs['runfunc'] == 'DEPOSIT') {
                $data['type'] = 'in';
            }
            if ($kvs['runfunc'] == 'WITHDRAW') {
                $data['type'] = 'out';
            }

        }

        $kvs['data'] = $this->encryption($data, $config['trdcfg']['tc_api_signkey']);
        Utils::L("{$config['trdcfg']['tc_id']}/http_data", [$kvs['runfunc'], $data, $kvs]);
    }

    function encryption($data, $keys)
    {
        $signPars = json_encode($data);//urldecode(http_build_query(myArrayFilter($data)));
        $public_key = "-----BEGIN PUBLIC KEY-----\n".wordwrap($keys, 64, "\n", true)."\n-----END PUBLIC KEY-----";
        $key = openssl_pkey_get_public($public_key);
        if (!$key) {
            return false;
        }
        $crypto = '';
        foreach (str_split($signPars, 117) as $chunk) {
            openssl_public_encrypt($chunk, $encryptData, $key);
            $crypto .= $encryptData;
        }

        return base64_encode($crypto);
    }

    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
    }
}
