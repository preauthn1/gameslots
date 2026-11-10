<?php


namespace app\common\FastGame;


use app\common\lib\Util;
use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};
use app\model\Games;

class Third_fg extends Third
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
        // 签名秘钥
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
        $param = $data['param'];
        // 删除其他变量
        unset($param['s']);
        $sign = $param['sign'];
        unset($param['sign']);
        unset($param['third']);
        unset($param['v1']);
        unset($param['action_method']);
        unset($param['XDEBUG_SESSION_START']); // TODO 删掉

        // 按键名排序
        ksort($param);

        // 获取加密秘钥 wallet_key
        $param['key'] = $config['trdcfg']["tc_api_signkey"];
        // 生成签名并校验，怎么urldecode掉了呢
        if ($sign == strtoupper(md5(urldecode(http_build_query($param))))) {
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
        $uid = isset($kvs['uid']) ? $kvs['uid']:0;
        $g_tcid = isset($config['g_tcid']) ? $config['g_tcid']:$config['trdcfg']['tc_id'];
        $kvs['openid'] = UserThirds::where('ut_tcid',$g_tcid)->where('ut_uid',$uid)->value('ut_trdid');
        if($kvs['runfunc'] == 'GETUSERURL') {
            $kvs['ip'] = Util::get_ip();
            $kvs['return_url'] = getAppUrl();
            $kvs['return_url'] = getAppUrl();
        }elseif(substr($kvs['runfunc'],0,10)=="GETBETLIST"){
            $idUrl = '';
            if( $kvs['id'] == 0 ){
                //第一次不加参数
            }else{
                $idUrl = '/id/' . $kvs['id'];
            }
            $kvs['id_url'] = $idUrl;
        }elseif (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {

            $kvs['externaltransactionid'] = md5(date("YmdHis") . Utils::random(10, true));
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['amount'] = intval($kvs['o_amount']);
        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if( $func == 'REGISTER' ){
            $guser = UserThirds::where('ut_tcid',$tcid)->where('ut_uid',$uid)->find();
            if( !$guser ){
                UserThirds::create([
                    'ut_uid' => $uid,
                    'ut_tcid' => $tcid,
                    'ut_trdid' => $datas['data']['openid'] ?? '',
                    'ut_intime' => time(),
                    'ut_state' => 0
                ]);
            }else{
                $guser->save([
                    'ut_trdid' => $datas['data']['openid'] ?? '',
                ]);
            }
        }

        if($func == 'GETUSERURL'){

            $kds['tcgameurl'] = $datas['data']['game_url'].'&token='.$datas['data']['token'];
        }
    }
}
