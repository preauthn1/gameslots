<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Http, Meta, Third, Utils};
use app\model\ThirdConfigs;

class Third_ogs extends Third
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
        $param = $data;
        $signature = $param['signature'];
        if ($param['action'] == 'bulk_debit') {
            $param['records'] = json_encode($param['records']);
        }
        foreach ($param as $k => &$v) {
            if (is_array($v)) {
                $param[$k] = json_encode($v);
            }
        }
        unset($param['signature'], $param['third'], $param['action_method'], $param['api'], $param['operator'], $param['s'], $param['bulk'], $param['action']);
        ksort($param);
        $string = Http::ToUrlParams($param, false, []);
        $sign = md5("{$string}{$config['trdcfg']['tc_api_prikey']}");
        if ($sign == $signature) {
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
        $kvs['public_key'] = $config['trdcfg']['tc_api_prikey'];
        $kvs['operator_name'] = $config['trdcfg']['tc_tag'];
        $kvs['timestamp'] = time();
        if (in_array($kvs['runfunc'], ['GETUSERURL'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['player_id'] = "togs_" . $uname;
            $kvs['nickname'] = "anni" . $uname;
            $kvs['lang'] = $config['trdcfg']['tc_langmap'];
            $kvs['token'] = md5($kvs['player_id']);
            $kvs['game_id'] = Meta::initGetField('gtag', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); //游戏标识
            $kvs['betlimit'] = $config['trdcfg']['tc_token'];
            $signaData = [
                'player_id' => $kvs['player_id'],
                'nickname' => $kvs['nickname'],
                'token' => $kvs['token'],
                'game_id' => $kvs['game_id'] ?: '',
                'betlimit' => $kvs['betlimit'],
                'timestamp' => $kvs['timestamp'],
            ];
            ksort($signaData);
            $string = Http::ToUrlParams($signaData, false, []);
            $kvs['signature'] = md5("{$string}{$config['trdcfg']['tc_api_signkey']}");
        }
        if (in_array($kvs['runfunc'], ['REGISTER'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['player_id'] = "togs_" . $uname;
            $kvs['nickname'] = "anni" . $uname;
            $signaData = [
                'player_id' => $kvs['player_id'],
                'nickname' => $kvs['nickname'],
                'timestamp' => $kvs['timestamp'],
            ];
            //签名步骤一：按字典序排序参数
            ksort($signaData);
            // $body_str = json_encode($data);
            $string = Http::ToUrlParams($signaData, false, []);
            $kvs['signature'] = md5("{$string}{$config['trdcfg']['tc_api_signkey']}");
        }
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['player_id'] = "togs_" . $uname;
            $kvs['transaction_id'] = md5(date("YmdHis") . Utils::random(16));
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['transfer_amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
            $signaData = [
                'player_id' => $kvs['player_id'],
                'transaction_id' => $kvs['transaction_id'],
                'transfer_amount' => $kvs['transfer_amount'],
                'timestamp' => $kvs['timestamp'],
            ];
            ksort($signaData);
            // $body_str = json_encode($data);
            $string = Http::ToUrlParams($signaData, false, []);
            $kvs['signature'] = md5("{$string}{$config['trdcfg']['tc_api_signkey']}");
        }
        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['player_id'] = "togs_" . $uname;
            $signaData = [
                'player_id' => $kvs['player_id']
            ];
            ksort($signaData);
            // $body_str = json_encode($data);
            $string = Http::ToUrlParams($signaData, false, []);
            $kvs['signature'] = md5("{$string}{$config['trdcfg']['tc_api_signkey']}");
        }
//        Utils::L('OGS_transOtherKvs', $kvs);
//        Utils::L('OGS_transOtherKvs', $kvs['runfunc']);
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
//        Utils::L('OGS_transOtherKvsData', $kds);
//        Utils::L('OGS_transResultData', $datas);
        if ($func == 'GETAUTH') {
            if(isset($datas['records'])){
                $config = $this->apicfgs;
                $temp_bet = $this->_getBetlimit($config, $datas['records']);
                //跟新限制配置
                $up_data = [
                    'tc_token' => $temp_bet['id'],
                    'tc_min_bet' => $temp_bet['min_limit'],
                    'tc_max_bet' => $temp_bet['max_limit'],
                ];
                ThirdConfigs::where('tc_id', $tcid)->update($up_data);
            }
        }
        if ($func == "REGISTER") {
            $kds['tcuserkey'] = "";
        }
    }

    /**
     * 获取游戏限制区间数据
     * @param $config
     * @param $betlimit_arr
     * @return mixed
     */
    public function _getBetlimit($config, $betlimit_arr)
    {
        if (!empty($betlimit_arr)) {
            $tc_min_bet = floatval($config['trdcfg']['tc_min_bet']);
            $tc_max_bet = floatval($config['trdcfg']['tc_max_bet']);
            $diff_bet_arr = [];
            foreach ($betlimit_arr as $value) {
                $diff_bet_arr[] = [
                    'data' => $value,
                    'diff' => abs($value['min_limit'] - $tc_min_bet) + abs($value['max_limit'] - $tc_max_bet),
                ];
                if (floatval($value['min_limit']) <= $tc_min_bet && floatval($value['max_limit']) >= $tc_max_bet) {
                    //找到区间内的数据
                    return $value;
                }
            }
            usort($diff_bet_arr, function ($a, $b) {
                return $a['diff'] - $b['diff'];
            });
            return $diff_bet_arr[0]['data'];
        }
    }
}
