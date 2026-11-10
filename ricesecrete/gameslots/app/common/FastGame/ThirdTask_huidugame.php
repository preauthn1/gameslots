<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Game, TaskInterface, Third, ThirdTask, Utils};

//HUIDUGAME
class ThirdTask_huidugame extends ThirdTask implements TaskInterface
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
        $cfg = json_decode(json_encode($this->apiscfgvalues[$func]), true);
        $upflag = false;
        if (isset($cfg[$gtag])) {
            $upflag = true;
            // 已完成
            if ($data['payload']['total_count'] <= 5000) {
                // 页码归1
                $cfg[$gtag]['page_no'] = 1;
            } else {
                $cfg[$gtag]['page_no'] += 1;
            }
        }
        if ($upflag) {
            $this->updateApiConfigValue($func, $cfg);
        }
    }

    //多条数据
    function procBetDataPre($gcfg, $data, $rlt)
    {
        date_default_timezone_set('UTC');
        $rd = [];
        Third::initExtClass(['trdcfg' => ['tc_code' => 'HUIDUGAME']]);
        if ($data === null) {
            return [];
        }
        foreach ($data as $key => $v) {
            $gb_winprice = Third::transExchangerate($v['win_amount'] ?? 0, 0, 2);
            $gb_price = Third::transExchangerate($v['bet_amount'] ?? 0, 0, 2);
            if ($gb_winprice > 0) {
                $gb_winlose = 3;
            } else {
                $gb_winlose = 2;
            }
            $op = 'n';
            // 派彩金额不包含下注所以加上下注金额
//            $gb_winprice = round(floatval($gb_winprice) + floatval($gb_price), 4);
            $gid = Game::getGamesInfoBy($gcfg['trdcfg']['tc_id'], $v['game_uid'], 'tag', 'g_id');
            $gb_uname = str_replace($gcfg['trdcfg']['tc_tag'], '', $v['member_account']);
            $gb_uname = str_replace("_", '', $gb_uname);
            $rd[] = [
                'gb_op' => $op,
                'gb_gid' => $gid,
                'gb_uname' => $gb_uname,
                'gb_winlose' => $gb_winlose,
                'gb_overtime' => strtotime($v['timestamp']),
                'gb_price' => $gb_price,
                'gb_sn' => $v['serial_number'],
                'gb_bettime' => strtotime($v['timestamp']),
                'gb_winprice' => $gb_winprice,
                'gb_cusfield' => $v['game_round']
            ];
        }
        return empty($rd) ? [] : $rd;
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


    /**
     * 获取游戏列表的开始特征字段
     * @param string $gtag 游戏三方代码
     * @param int $thistime 当前调用时间节点
     * @return mixed
     * @author twt326 DBLIVE
     * @date 2022-09-18 17:23
     */
    function getBetListStartFlag($gtag, $thistime)
    {
        date_default_timezone_set('UTC'); //转三方时区时间
        //取前10分钟到前5分钟 为期5分钟的数据
        $func = 'GETBETLIST';
        $cfg = $this->getApiCfgvalues($func, $gtag);
//        $this->cfg=Games::getConfigs(null,$this->trdid);
//        Redis::hset('trdcfgs',$this->trdcode,json_encode($this->cfg));
        //Utils::L('taskfb',['读取到的函数配置',$cfg]);
        //业务代码 设置非元数据中的字段值
        $old_page = $cfg['page_no'] ?? 1; //查询上一次执行的分页
//        $cfg['lastruntime'] = 0;
        $time_span = 300;
        if ($cfg['lastruntime'] == 0) { //初始化
            $start = (time() - 600); //前10分钟
            $endtime = ($thistime - $time_span); //前10分钟
//            $start = 1737763489;
//            $endtime = 1737763189;
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
                $endtime = $cfg['end']; //查询上一次执行的时间
                $start = ($cfg['end'] - $time_span); //前5分钟
            }
        }
        $is_span = false;
        //防止时间区间跨天
        if (date("Y-m-d", $start) != date("Y-m-d", $endtime)) {
            $endtime = strtotime(date("Y-m-d", $start) . " 23:59:59");
            $is_span = true;
        }
        $end = min($endtime + $time_span, $thistime);
        if ($is_span) {
            $end = $endtime + ($time_span + 1);
        }
        $flags = [
            "lastruntime" => $thistime,
            "end" => $end, //当前执行时间 给下次执行用的
            "from_date" => $start * 1000, //上次的执行时间减5分钟为这次的开始时间
            "to_date" => $endtime * 1000,//上次的执行时间为这次的结束时间
            'page_no' => $old_page,
            'page_size' => 5000
        ];
//        print_r($flags);
        $this->apiscfgvalues[$func][$gtag] = array_merge($this->apiscfgvalues[$func][$gtag], $flags);
        //Utils::L('taskfb',['处理后的函数配置',$this->apiscfgvalues[$func][$gtag]]);
        //业务代码结束
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

}
