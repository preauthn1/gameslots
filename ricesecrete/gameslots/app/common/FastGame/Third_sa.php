<?php


namespace app\common\FastGame;


use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;

class Third_sa extends Third
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
        return true;
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
        // 此三方站回复数据无签名
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
        $time = date('YmdHis',time());
        if(in_array($kvs['runfunc'],['GETUSERURL','GETBALANCE','DEPOSIT','WITHDRAW'])){
            $uname = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 用户名
            $tccurrency = Meta::initGetField('tccurrency', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']); // 货币
        }
        // 获取游戏URL
        if($kvs['runfunc'] == 'GETUSERURL') {
            $data = [
                'method'=>'LoginRequest',
                'Key'=>$config['trdcfg']['tc_tag'],
                'Time'=>$time,
                'Username'=>$uname,
                'CurrencyType'=>$tccurrency,
            ];
        }
        // 获取用户余额
        if($kvs['runfunc'] == 'GETBALANCE') {
            $data = [
                'method'=>'GetUserStatusDV',
                'Key'=>$config['trdcfg']['tc_tag'],
                'Time'=>$time,
                'Username'=>$uname
            ];
        }
        // 转入
        if($kvs['runfunc'] == 'DEPOSIT') {
            $data = [
                'method'=>'CreditBalanceDV',
                'Key'=>$config['trdcfg']['tc_tag'],
                'Time'=>$time,
                'Username'=>$uname,
                'OrderId'=>'IN'.$time.$uname,
                'CreditAmount'=>floatval(Third::transExchangerate($kvs['o_amount'], 1, 2)),
                'CurrencyType'=>$tccurrency,
            ];
        }
        //转出
        if($kvs['runfunc'] == 'WITHDRAW') {
            $data = [
                'method'=>'DebitAllBalanceDV',
                'Key'=>$config['trdcfg']['tc_tag'],
                'Time'=>$time,
                'Username'=>$uname,
                'OrderId'=>'OUT'.$time.$uname,
            ];
        }
        //获取游戏注单数据-老虎机类型
        if($kvs['runfunc'] == 'GETBETLIST') {
            $data = [
                'method'=>'GetAllBetDetailsForTimeIntervalDV',
                'Key'=>$config['trdcfg']['tc_tag'],
                'Time'=>$time,
                'FromTime'=>$kvs['FromTime'],
                'ToTime'=>$kvs['ToTime'],
            ];
        }
        $kvs['q'] = $this->Encrypt($data,$config['trdcfg']['tc_api_prikey'],$config['trdcfg']['tc_api_prikey']);
        $kvs['s'] = $this->md5sign($data,$config['trdcfg']['tc_api_signkey'],$time,$config['trdcfg']['tc_tag']);
        Utils::L("{$config['trdcfg']['tc_id']}/http_data",[$kvs['runfunc'], $data]);
        // TODO: Implement transOtherKvs() method.
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        $res_data = Http::FromXml($datas);
        if($res_data){
            Utils::L("{$config['trdcfg']['tc_id']}/ResultData",['返回数据',$func, $res_data]);
            if($func == 'GETUSERURL'){
                if($res_data['ErrorMsgId'] == 0) {
                    $url = $config['trdcfg']['tc_token'];
                    $lobby = 'A9935';
                    $u = Meta::initGetField('uname',$tcid,$gid,$uid);
                    $is_mobile = $ohterkvs['platform'] == 1 ? 'false' : 'true';
                    $lang = $config['trdcfg']['tc_langmap'];
                    $returnurl = getAppUrl();
                    $kds['tcgameurl'] = $url.'?token='.$res_data['Token'].'&username='.$u.'&lobby='.$lobby.'&lang='.$lang.'&returnurl='.$returnurl.'&mobile='.$is_mobile;
                }else{
                    $kds['tcgameurl'] = '';
                    Utils::L("{$config['trdcfg']['tc_id']}/ResultData_error",['状态异常',$func, $res_data]);
                }
            }

            if($func == 'GETBALANCE' || $func == 'DEPOSIT'){
                if($res_data['ErrorMsgId'] == 0) {
                    $kds['tcbalance'] = $res_data['Balance'];
                }else{
                    $kds['tcbalance'] = 0;
                    Utils::L("{$config['trdcfg']['tc_id']}/ResultData_error",['状态异常',$func, $res_data]);
                }
            }

            if($func == 'WITHDRAW'){
                if($res_data['ErrorMsgId'] == 0) {
                    $kds['tcbalance'] = 0;
                }else{
                    $kds['tcbalance'] = 0;
                    Utils::L("{$config['trdcfg']['tc_id']}/ResultData_error",['状态异常',$func, $res_data]);
                }
            }
            if( $res_data['ErrorMsgId'] != 0 ){
                throw new \Exception('状态异常', 500);
            }
        }else{
            Utils::L("{$config['trdcfg']['tc_id']}/ResultData_error",['数据异常', $func,$datas]);
        }
    }

    // DES加密
    function Encrypt($data, $DesKey, $DesIV)
    {
        $encrypt_data = base64_encode(openssl_encrypt(http_build_query($data),'DES-CBC',$DesKey,OPENSSL_RAW_DATA ,$DesIV));
        return $encrypt_data;
    }

    //MD5加密
    function md5sign($data,$md5key, $Time, $SecretKey)
    {
        $PreMD5Str = http_build_query($data) . $md5key . $Time . $SecretKey;
        return md5($PreMD5Str);
    }
}