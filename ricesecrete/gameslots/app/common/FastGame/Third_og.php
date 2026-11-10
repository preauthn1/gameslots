<?php


namespace app\common\FastGame;


use app\model\UserThirds;
use app\common\FastGame\Base\{Http, Meta, Third, Utils};
use app\model\Games;

class Third_og extends Third
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
        $kvs['ron_token'] = Utils::random(16);
        $kvs['timestamp'] = time() * 1000;
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if($func == 'GETUSERURL'){
            $config = $this->apicfgs;
            $name = Meta::initGetField('uname', $config['g_tcid'], $config['g_id'], $uid);
            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
            if (!$guser){
                //TODO 错误处理
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_trdid' => $name,
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            }else{
                $guser->ut_trdid =  $name;
                //TODO 错误处理
                $guser->save();
            }
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
}
