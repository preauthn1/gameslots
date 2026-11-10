<?php

namespace app\common\FastGame;


use app\model\{GameBetsTemp, Games, GameWmSpecial, UserThirds};
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};

class Third_ag extends Third
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
        // $header = [
        // "alg" => "HS256"
        // ];
        // $header_str = base64_encode(json_encode($header));
        // $data_str = base64_encode(json_encode($data));
        // $data['head_sign'] = HMACSHA256($header_str.'.'.$data_str, $config['tc_api_prikey']);
        // $head_sign = 'Bearer '.hash('sha512', $header_str.'.'.$data_str, $config['trdcfg']['tc_api_prikey']);
        $head_sign = 'Bearer '.$config['trdcfg']['tc_api_prikey'];
        // hash('sha512', $data, $rawOutput)
        // dump($head_sign);
        return compact('head_sign');
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

        $header = $data['header'];
        $param = $data['param'];
        //token等于我方的token
        if($header['authorization'] == 'Bearer '.$config['trdcfg']['tc_api_prikey']){
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
        return 'KM CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $kvs['password'] = 'acf_pass_147258369';
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if($func == 'REGISTER'){
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



}
