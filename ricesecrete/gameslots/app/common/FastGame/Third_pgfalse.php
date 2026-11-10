<?php


namespace app\common\FastGame;


use app\common\payment\PayRequest;
use app\model\GameBetsSon;
use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};
use app\model\Games;

class Third_pgfalse extends Third
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
        $secret = $config['trdcfg']["tc_api_signkey"];
        $data['ts'] = time();
        $sign = $this->generateSign($data, $secret);
        $data['sign'] = $sign;
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
        $uid = isset($kvs['uid']) ? $kvs['uid']:0;
        $g_tcid = isset($config['g_tcid']) ? $config['g_tcid']:$config['trdcfg']['tc_id'];
        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['user_token'] = UserThirds::where('ut_tcid',$g_tcid)->where('ut_uid',$uid)->value('ut_token');
            $kvs['user_id'] = UserThirds::where('ut_tcid',$g_tcid)->where('ut_uid',$uid)->value('ut_trdid');
        }
        if($kvs['runfunc'] == 'SETUSERRTP') {
            //传过来userids格式为id逗号隔开
            $thirdUserIds = [];
            $userIdsArr = explode(',', $kvs['user_ids']);
            $userThirdsModel = new UserThirds();
            foreach ($userIdsArr as $v){
                $condition = [];
                $condition[] = ['ut_uid', '=', $v];
                $condition[] = ['ut_tcid', '=', $g_tcid];
                $_userId = $userThirdsModel->where($condition)->value('ut_trdname');
                if( $_userId ){
                    $thirdUserIds[] = $_userId;
                }
            }
            $kvs['user_ids'] = implode('|', $thirdUserIds);
        }
        if($kvs['runfunc'] == 'GETONEUSERRTP') {
            $kvs['user_id'] = UserThirds::where('ut_tcid',$g_tcid)->where('ut_uid',$uid)->value('ut_trdname');
        }
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if( $func == 'REGISTER' ){
            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
            if( !$guser ){
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_token' => $datas['data']['token'],
                    'ut_trdid' => $datas['data']['user_id'],
                    'ut_intime' => time(),
                    'ut_trdname' => $datas['data']['player_id'],
                    'ut_state' => 0
                ]);
            }else{
                $guser->save([
                    'ut_token' => $datas['data']['token'],
                    'ut_trdid' => $datas['data']['user_id'],
                    'ut_trdname' => $datas['data']['player_id'],
                ]);
            }
        }
    }

    private function generateSign($data, $secret = ''){
        unset($data["sign"]);
        ksort($data);
        $str = urldecode(http_build_query(myArrayFilter($data)));
        $str .= '&key='.$secret;
        return strtolower(md5($str));
    }

}
