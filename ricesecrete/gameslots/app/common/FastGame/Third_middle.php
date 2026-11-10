<?php


namespace app\common\FastGame;

use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};


class Third_middle extends Third
{

    /**
     * 签名
     * @param $config
     * @param $data
     * @return mixed
     * @author twt326
     */
    function MakeSign($config, &$data)
    {
        if (isset($data['sign'])) $data['sign']='{sign}';
        //签名步骤一：按字典序排序参数
        // ksort($data);
        $string = Http::ToUrlParams($data,false,['sign', 'CreateTime', 'password', 'language', 'backURL']);
        //签名步骤二：在string后加入KEY
        $string = $string .'&apikey='. $config['trdcfg']['tc_api_signkey'];
        //签名步骤三：MD5加密
        $sign = md5($string);
        Utils::L('32/http', ['testsign',$data, $string, $sign]);
        return compact('sign');
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
        $data = $data['param'];
        //签名步骤一：按字典序排序参数
        // ksort($data);
        $string = Http::ToUrlParams($data,false,['sign', 'CreateTime', 'password', 'language', 'backURL', 's', 'third', 'action_method']);
        //签名步骤二：在string后加入KEY
        $string = $string .'&apikey='. $config['trdcfg']['tc_api_signkey'];
        //签名步骤三：MD5加密
        $sign = md5($string);
        if( $sign == $data['sign'] ){
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
        if( $kvs['runfunc'] == 'REGISTER' || $kvs['runfunc'] == 'GETUSERURL' ){
            $kvs['playername'] = $config['trdcfg']['tc_tag'] . '_' . Meta::initGetField('uname',$config['trdcfg']['tc_id'],$config['g_id'],$kvs['uid']);

            if( $kvs['runfunc'] == 'GETUSERURL' ){
                $kvs['backURL'] = getAppUrl();
            }
        }

    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if ($func == 'REGISTER') {
            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
            if (!$guser){
                //TODO 错误处理
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            }
        }
    }

}