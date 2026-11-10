<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Game, TaskInterface, Third, ThirdTask, Utils};


class ThirdTask_xgpp extends ThirdTask implements TaskInterface
{

    /**
     * 继承类中开始执行三方平台任务
     * @return mixed
     * @author twt326
     * @date 2022-08-25 12:19
     */
    function exec()
    {
        $cfgvalues = $this->cfgvalues;
        //执行任务
        $this->runThirdTasks();
        $this->runJs($cfgvalues['jsst']);
        $this->runFy($cfgvalues['fyst']);
        $this->runStat($cfgvalues['statst']);
        $this->updateConfigValue();

    }

    /** 根据读取列表的返回数据更新下次游戏列表的开始特征字段值
     * @param $gtag
     * @param $thistime
     * @param $data
     * @return mixed
     * @author twt326
     * @date 2022-09-19 21:26
     */
    function setBetListStartFlag($gtag, $thistime, $data)
    {
        $func = 'GETBETLIST';
        Utils::L('test',
            ['准备保存API配置值', 'gcode' => $gtag, 'thistime' => $this, 'cfg' => $this->apiscfgvalues[$func]]);

        $cfg = json_decode(json_encode($this->apiscfgvalues[$func]), true); //getApiCfgvalues($func,$gcode);
        $upflag = false;
        if (isset($cfg[$gtag])) {
            $upflag = true;
            // 已完成
            if (isset($data['data']['pageTotal'])) {
                if ($data['data']['pageTotal'] <= $cfg[$gtag]['pageIndex']) {
                    // 页码归1
                    $cfg[$gtag]['pageIndex'] = 1;
                } else {
                    $cfg[$gtag]['pageIndex'] += 1;
                }
            } else {
                $cfg[$gtag]['pageIndex'] = 1;
            }
        }
//        pageTotal
        if ($upflag) {
            $this->updateApiConfigValue($func, $cfg);
        }
    }

    /**
     * 处理一条游戏记录数据为可写入注单表的状态
     * @param $gcode 游戏在三方平台的代码
     * @param $data 游戏注单数据（单条）
     * @return mixed
     * @author twt326
     * @date 2022-09-20 22:00
     */
    function procBetData($gcode, $data)
    {
        return $data;
    }

    //多条数据
    function procBetDataPre($gcfg, $data, $rlt)
    {
        Third::initExtClass(['trdcfg' => ['tc_code' => 'XGPP']]);
        $rd = [];
        foreach ($data as $v) {
            $gb_price = Third::transExchangerate($v['betAmount'], 0);//投注金额
            $gb_winprice = Third::transExchangerate($v['betAmount'] + $v['netWinningAmount'], 0);//赢金额
            $op = 'n';
            if ($gb_winprice > 0) {
                $gb_winlose = 3;
            } else {
                $gb_winlose = 2;
            }
            $rd[] = [
                'gb_op'       => $op,
                'gb_gid'      => Game::getGamesInfoBy($gcfg['trdcfg']['tc_id'], $v['gameCode'], 'gcode', 'g_id'),
                'gb_uname'    => $v['account'],
                'gb_winlose'  => $gb_winlose,
                'gb_bettime'  => intval($v['betTimestampMs'] / 1000),
                'gb_overtime' => intval($v['settlementTimestampMs'] / 1000),
                'gb_price'    => $gb_price,
                'gb_sn'       => $v['betNoVenue'],
                'gb_winprice' => $gb_winprice,
            ];
        }


        return empty($data) ? [] : $rd;
    }


    /**
     * 获取游戏列表的开始特征字段
     * @param  string  $gtag  游戏三方代码
     * @param  int  $thistime  当前调用时间节点
     * @return mixed
     * @author twt326
     * @date 2022-09-18 17:23
     */
    function getBetListStartFlag($gtag, $thistime)
    {
        $func = 'GETBETLIST';
        $cfg = $this->getApiCfgvalues($func, $gtag);
        $old_page = $cfg['pageIndex'] ?? 0; //查询上一次执行的分页
        if ($cfg['lastruntime'] == 0) { //初始化
            $start = time() - 600; //前10分钟
            $endtime = $thistime - 300; //前10分钟
            $old_page = 1;
        } else {
            if ($old_page > 1) {
                // 继续使用上次的时间
                $start = $cfg['start_time'];
                $endtime = $cfg['end_time'];
            } else {
                //比如上次执行时间是 10分  获取的是 00 - 05 分的数据 开始时间减 600 结束时间减 300
                //这次执行时间是15分 获取到上次的执行时间为 10分。 10分为结束时间 再减300 为开始时间
                //下次执行时间是20分 获取到上次的执行时间为 15分。15分为结束时间 再减300 为开始时间
                $start = $cfg['end']; //查询上一次执行的时间
                //            if ($start + 3600 <= $thistime) {//超过一个小时
                //                $start = $thistime - 600; //一个小时以前
                //                $endtime = $thistime - 300;
                //            } else {
                $endtime = $start;
                $start = $start - 300; //前5分钟
            }
        }
        $flags = [
            "lastruntime"      => $thistime,
            "end"              => min($endtime + 240, $thistime),
            "startTimestampMs" => $start * 1000, //前8分钟
            "endTimestampMs"   => $endtime * 1000, //前4分钟  结束时间戳, 开始与结束时间不能超过12个小时
            'pageIndex'        => $old_page,
        ];
        $this->apiscfgvalues[$func][$gtag] = array_merge($this->apiscfgvalues[$func][$gtag], $flags);
        return $flags;
    }

    /**
     * 重写蕨类的转移数据方法
     * @param $gid
     * @author twt326
     * @date 2022-09-20 22:50
     */
    public function transferBets($gid, $type)
    {
        //业务代码开始
        parent::transferBets($gid, $type);//此处为示例，直接调用基类方法进行转移，如果有特殊数值需要处理，请在此处处理，是否调用基类方法因情而定
        //业务代码结束
    }

    public function runFy($lasttime)
    {
        // TODO: Implement runJs() method.
    }

    public function runJs($lasttime)
    {
        // TODO: Implement runJs() method.
    }

    function decrypt_response($response, $EC_PRIVATE_KEY)
    {

        $response_json = json_decode($response, true);
        $encryptKey = $response_json["key"]; // MW加密KEY
        $encryptData = $response_json["data"]; // MW加密DATA
        $aesKey = self::rsa_decrypt($encryptKey, $EC_PRIVATE_KEY); // EC方私鑰 解密 MW加密KEY 獲得 AESKEY
        $decryptData = self::aes_decrypt($aesKey, $encryptData); // AESKEY 解密 MW加密DATA 獲得 DATA
        //echo_log("DecryptData: $decryptData");
        return json_decode($decryptData, true);
    }

    function aes_decrypt($key, $str)
    {
        $encryptedData = base64_decode($str);
        $decrypted = openssl_decrypt($encryptedData, 'AES-128-ECB', $key, OPENSSL_RAW_DATA);
        return $decrypted;
    }

    function rsa_decrypt($ciphertext, $prikey)
    {
        $receiveKey = base64_decode($ciphertext);
        $ecPrivateKey = openssl_pkey_get_private($prikey);
        openssl_private_decrypt($receiveKey, $decryptAesKey, $ecPrivateKey);
        return $decryptAesKey;
    }

}
