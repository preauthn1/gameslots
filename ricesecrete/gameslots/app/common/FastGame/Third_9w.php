<?php


namespace app\common\FastGame;

use app\common\game\GameRequest;
use app\api\redis\ApiRedis;
use app\common\redis\CommomRedis;
use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;

class Third_9w extends Third
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

        $kvs['cert'] = $config['trdcfg']['tc_api_prikey'];

        if($kvs['runfunc'] != 'GETBETLIST'){

            //$uname = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            //$kvs['vendor_member_id'] = $config['trdcfg']['tc_tag'].'_'.$uname;

        }
        if($kvs['runfunc'] == 'GETBETLIST'){


        }
        if($kvs['runfunc'] == 'GETUSERURL'){
            $kvs['agent'] = $config['trdcfg']['tc_tag'];
            $kvs['currency'] = $config['trdcfg']['tc_currency'];

        }
        if($kvs['runfunc'] == 'GETBALANCE'){
        }

        if(in_array($kvs['runfunc'],['DEPOSIT','WITHDRAW'])){

            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
            $kvs['traceId'] = $config['trdcfg']['tc_tag'].'_'.md5(date("YmdHis") . Utils::random(16));
        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;

        if($func == 'GETUSERURL'){

            $uname = Meta::initGetField('uname',  $tcid, $config['g_id'], $uid);

            $kds['tcgameurl'] = $config['trdcfg']['tc_api_signkey'].'?userId='.$uname.'&key='.urlencode($datas['key']);

        }

        if($func == 'DEPOSIT'){

            $kds['tcbalance'] = $ohterkvs['o_amount'];

        }
        if($func == 'WITHDRAW'){

            $kds['tcbalance'] = $ohterkvs['o_amount'];


        }
        if($func == 'GETBALANCE'){

            $kds['tcbalance'] = $datas['results'][0]['balance'];

        }

    }
}