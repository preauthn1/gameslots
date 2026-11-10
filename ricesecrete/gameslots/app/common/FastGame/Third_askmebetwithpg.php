<?php


namespace app\common\FastGame;


use app\common\model\GameInfosModel;
use app\common\model\GamesModel;
use app\common\payment\PayRequest;
use app\model\GameBetsSon;
use app\model\GameConfigs;
use app\model\UserThirds;
use app\common\FastGame\Base\{Http, Meta, Redis, Third, Utils};
use app\model\Games;

class Third_askmebetwithpg extends Third
{

    private $product="PGSOFT2";

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
        return ["authorization"=>"Basic ".base64_encode($config['trdcfg']['tc_tag'].":".$config['trdcfg']['tc_api_prikey'])];
    }

    /**验证签名
     * @param $config
     * @param $data 要求传入HEDAER
     * @return mixed
     * @author twt326
     * @date 2022-08-26 17:32
     */
    function CheckSign($config, $data)
    {
        if (isset($data['return_headers'])){
            $header=$data['return_headers'];
        }elseif(isset($data['header'])){
            $header=$data['header'];
        }elseif(isset($data['headers'])){
            $header=$data['headers'];
        }else{
            $header=$data;
        }
        if (is_array($header) && isset($header['Authorization'])){
            $au=explode(" ",$header['Authorization']);
            if (isset($au[1])){
                return $au[1]==base64_encode($config['trdcfg']['tc_tag'].":".$config['trdcfg']['tc_api_prikey']);
            }else{
                return false;
            }
        }else{
            return false;
        }
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
        return 'askmebetwithpg CLASS';
    }

    function utoken($uid,$v=null){
        if ($v){
            //写
            Redis::hset($this->product."_usertoken",$uid,$v,2);
        }else{
            //读
            return Redis::hget($this->product."_usertoken",$uid,2);
        }
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['Token']=md5($kvs['uid'].$config['trdcfg']['tc_id'].time()); //生成token
            $this->utoken($kvs['uid'],$kvs['Token']);
        }
        // TODO: Implement transOtherKvs() method.
    }


    function get_game_list($apicfgs,$otherkvs){
        try{
            $otherkvs = [];
            $rlt=Http::http($apicfgs,'GETGAMELIST',self::$extClass,$otherkvs);
            Utils::L('test',['gl:',$rlt]);
            if($rlt){
                /*$games=$rlt['data']['games'];
                foreach ($games as $v){
                    Utils::L('test',['gli:',$v]);
                    try {
                        $gid = (new GamesModel())->insertGetId([
                            "g_tcid" => 36,
                            "g_web_tcid" => 36,
                            "g_code" => strtoupper($v['code']),
                            "g_tag" => $v['code'],
                            "label" => $v['name']
                        ]);
                        GameInfosModel::create([
                            "gi_gid" => $gid,
                            "gi_lang" => 'CN',
                            "gi_name" => $v['name'],
                            "gi_headimg" => $v['img']
                        ]);
                        GameConfigs::create(['gc_gid'=>$gid]);
                    }catch (\Exception $ex){
                        Utils::L('test',['ex:',$ex->getMessage()]);
                    }
                }*/
                Utils::writeToStaticFile('askmebetwithpg.games.json', json_encode($rlt['data']));
            }
        }catch (\Exception $e){
//            dump($e->getMessage());
            return $e->getMessage();
        }

    }
}
