<?php


namespace app\common\FastGame;


use app\common\model\UserModel;
use app\model\{GameBetsTemp, Games, GameWmSpecial, UserThirds};
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};

class Third_luckysport extends Third
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
        return $in;
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        $config = $this->apicfgs;
//        $name = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
//        if( $kvs['runfunc'] == 'REGISTER' ){
//
//        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
//        if($func == 'REGISTER'){
//            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
//            if (!$guser){
//                //TODO 错误处理
//                UserThirds::create([
//                    'ut_uid' => $uid,
//                    'ut_tcid' => $tcid,
//                    'ut_trdname' => $ohterkvs['wm_name'],
//                    'ut_intime' => time(),
//                    'ut_state' => 0
//                ]);
//            }else{
//                $guser->ut_trdname =  $ohterkvs['wm_name'];
//                //TODO 错误处理
//                $guser->save();
//            }
//        }
    }
}
