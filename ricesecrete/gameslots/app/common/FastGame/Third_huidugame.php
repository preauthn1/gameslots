<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Meta, Third, Utils};
use app\model\UserThirds;

//Third_huidugame
//HUIDUGAME
class Third_huidugame extends Third
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
        //Name：BL999
        //agency_uid：914e18a56d73cb37a619cd5b4bc6e4d1
        //aes_key：5d510c6edb61bfec7eccc7875e427a5a
        //player_prefix: h58e7d
        //server_url：https://jsgame.live
        //签名步骤一：按字典序排序参数
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
        return time() + 3600 * 24 * 5; // 5天过期
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
        $kvs['agency_uid'] = $config['trdcfg']['tc_api_prikey'];
        $kvs['timestamp'] = time() . "" . rand(100, 999);
        $transfer_id = date("YmdHis") . rand(10000, 99999);
        $payload = [];
        // {"agency_uid":"{agency_uid}","timestamp":"{timestamp}","payload":"{payload}"}
        if (in_array($kvs['runfunc'], ['GETUSERURL', 'REGISTER'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $gameid = Meta::initGetField('gtag', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); //游戏标识
            $lang = $config['trdcfg']['tc_langmap'];
            $currency = $config['trdcfg']['tc_currency'];
            $player_prefix = $config['trdcfg']['tc_tag'];
            $payload = [
                'agency_uid' => $kvs['agency_uid'],
                'timestamp' => $kvs['timestamp'],
                'member_account' => $player_prefix . "" . $uname,
                'game_uid' => $gameid,
                'credit_amount' => 0,
                'currency_code' => $currency,
                'language' => $lang,
                'home_url' => 'https://www.bl999.vip/',
                'platform' => 2,
                'transfer_id' => $transfer_id,
            ];
        }
        if (in_array($kvs['runfunc'], ['DEPOSIT'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $gameid = Meta::initGetField('gtag', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); //游戏标识
            $lang = $config['trdcfg']['tc_langmap'];
            $currency = $config['trdcfg']['tc_currency'];
            $player_prefix = $config['trdcfg']['tc_tag'];
            $payload = [
                'agency_uid' => $kvs['agency_uid'],
                'timestamp' => $kvs['timestamp'],
                'game_uid' => $gameid,
                'member_account' => $player_prefix . "" . $uname,
                'credit_amount' => 0,
                'currency_code' => $currency,
                'language' => $lang,
                'home_url' => 'https://www.bl999.vip/',
                'platform' => 2,
                'transfer_id' => $transfer_id,
            ];
            $payload['credit_amount'] = Third::transExchangerate($kvs['o_amount'], 1, 2);
        }
        if (in_array($kvs['runfunc'], ['WITHDRAW'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $lang = $config['trdcfg']['tc_langmap'];
            $currency = $config['trdcfg']['tc_currency'];
            $player_prefix = $config['trdcfg']['tc_tag'];
            $payload = [
                'agency_uid' => $kvs['agency_uid'],
                'timestamp' => $kvs['timestamp'],
                'member_account' => $player_prefix . "" . $uname,
                'credit_amount' => 0,
                'currency_code' => $currency,
                'language' => $lang,
                'home_url' => 'https://www.bl999.vip/',
                'platform' => 2,
                'transfer_id' => $transfer_id,
            ];
            $payload['credit_amount'] = 0 - Third::transExchangerate($kvs['o_amount'], 0, 2);
        }
        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $lang = $config['trdcfg']['tc_langmap'];
            $currency = $config['trdcfg']['tc_currency'];
            $player_prefix = $config['trdcfg']['tc_tag'];
            $payload = [
                'agency_uid' => $kvs['agency_uid'],
                'timestamp' => $kvs['timestamp'],
                'member_account' => $player_prefix . "" . $uname,
                'credit_amount' => 0,
                'currency_code' => $currency,
                'language' => $lang,
                'home_url' => 'https://www.bl999.vip/',
                'platform' => 2,
                'transfer_id' => $transfer_id,
            ];
        }
        if (in_array($kvs['runfunc'], ['GETBETLIST'])) {
            $payload = [
                'agency_uid' => $kvs['agency_uid'],
                'timestamp' => $kvs['timestamp'],
                'from_date' => $kvs['from_date'],
                'to_date' => $kvs['to_date'],
                'page_no' => $kvs['page_no'],
                'page_size' => $kvs['page_size']
            ];
        }
        $temp = $payload;
        $temp['runfunc'] = $kvs['runfunc'];
        Utils::L('OGS_transOtherKvsPayload', $temp);
        // 数据编码
        if (!empty($payload)) {
            ksort($payload);
            $string = json_encode($payload);
            $kvs['payload'] = base64_encode(openssl_encrypt($string, 'AES-256-ECB', $config['trdcfg']['tc_api_signkey'], OPENSSL_RAW_DATA));
        } else {
            $kvs['payload'] = "";
        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $temp = $datas;
        $temp['runfunc'] = $func;
        Utils::L('OGS_transResultDataPayload', $datas);
    }
}
