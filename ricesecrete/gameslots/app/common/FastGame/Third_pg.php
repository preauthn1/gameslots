<?php


namespace app\common\FastGame;


use app\common\payment\PayRequest;
use app\model\GameBetsSon;
use app\model\UserThirds;
use app\common\FastGame\Base\{Http, Meta, Third, Utils};
use app\model\Games;

class Third_pg extends Third
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
        // $body_str = json_encode($data);
        $string = Http::ToUrlParams($data, false, []);
        $data['signature'] = md5("{$string}{$config['trdcfg']['tc_api_prikey']}");
        return $data;
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
        if($param['action'] == 'bulk_debit'){
            $param['records'] = json_encode($param['records']);
        }
        foreach($param as $k =>&$v){
            if(is_array($v)){
                $param[$k] = json_encode($v);
            }
        }
        unset($param['signature'], $param['third'], $param['action_method'], $param['api'], $param['operator'], $param['s'], $param['bulk'], $param['action']);
        ksort($param);
        $string = Http::ToUrlParams($param, false, []);
        $sign = md5("{$string}{$config['trdcfg']['tc_api_prikey']}");
        if($sign == $signature){
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

    function test(){
        return 'kyrianstg CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
        $uid = isset($kvs['uid']) ? $kvs['uid']:0;
        $kvs['ron_token'] = Utils::random(16);
        $kvs['timestamp'] = time() * 1000;
        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['trace_id'] = $this->generateUUID();
            $query = [
                'ops' => myEncrypt(Meta::initGetField('uname', $config['g_tcid'], $config['g_id'], $uid)),
                'btt' => 1,
                'l' => $config['trdcfg']['tc_langmap'],
                'iwk' => 1
            ];
            $kvs['extra_args'] = http_build_query($query);
            $kvs['ip'] = Utils::get_ip();
        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        // if($func == 'GETUSERURL'){
        //     $url = $config['trdcfg']['tc_token'];
        //     $query = [
        //         'ot' => Meta::initGetField('tctag', $config['g_tcid'], $config['g_id'], $uid),
        //         'ops' => myEncrypt(Meta::initGetField('uname', $config['g_tcid'], $config['g_id'], $uid)),
        //         'btt' => 1,
        //         'l' => $config['trdcfg']['tc_langmap'],
        //         'iwk' => 1
        //     ];
        //     $gameId = Meta::initGetField('gtag', $config['g_tcid'], $config['g_id'], $uid);
        //     $kds['tcgameurl'] = rtrim($url, '/') . '/'.$gameId.'/index.html?' . http_build_query($query);
        // }

        if($func == 'GETBETDETAIL') {
            $url = $config['apis']['GETBETDETAIL']['ga_taskvalue'];
            $trace_id = Utils::random(20);
            $t = $datas['data']['operator_session'];
            if(strpos($ohterkvs['gbsn'],"-")){
                $sn = explode('-',$ohterkvs['gbsn']);
                $psid = $sn[1];
                $sid = $sn[0];
            }else{
                $gb_sn_ac = GameBetsSon::where(['gb_uid'=>$uid,'gb_gid'=>$ohterkvs['betInfo']['gb_gid'],'gb_sn'=>$ohterkvs['gbsn']])->value('gb_sn_ac');
                if($gb_sn_ac){
                    $psid = $ohterkvs['gbsn'];
                    $sid = $gb_sn_ac;
                }else{
                    $psid = $ohterkvs['betInfo']['gb_cusfield'];
                    $sid = $ohterkvs['gbsn'];
                }
            }
            $gids = Meta::initGetField('gtag',$tcid,$ohterkvs['betInfo']['gb_gid'],$uid); //游戏标识
            $lang = $config['trdcfg']['tc_langmap'];
            $kds['tcgamedetailurl'] = $url."/history/redirect.html?trace_id=".$trace_id."&t=".$t."&psid=".$psid."&sid=".$sid."&gid=".$gids."&lang=".$lang."&type=operator";
        }
    }

    function get_game_list($apicfgs,$otherkvs){
        /** 外部调用方法
         * $apicfgs=Games::getConfigs(tcid,gid);
         * Third::run($apicfgs,'本函数名',$otherkvs); //注单获取的开始时间结束时间等在在otherkvs中指定
         */
        try{
            $otherkvs = [];
            $rlt=Http::http($apicfgs,'GETGAMELIST',self::$extClass,$otherkvs);
            if($rlt && $rlt['rs_code'] == 'S-100'){
                $arr = [];
                foreach ($rlt['records'] as $k=>$v){
                    $arr[$v['game_id']] = $v['game_name'];
                }
                Utils::writeToStaticFile('og_game.info.json', json_encode($arr));
            }
        }catch (\Exception $e){
//            dump($e->getMessage());
            return $e->getMessage();
        }

    }

    function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-4%03x-8%03x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }
}
