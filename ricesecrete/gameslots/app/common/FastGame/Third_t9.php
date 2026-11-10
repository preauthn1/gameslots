<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\{Meta, Third, Utils};


class Third_t9 extends Third
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
        date_default_timezone_set('UTC');//t9必须时区为UTC+0
        $config = $this->apicfgs;
        $kvs['AgentId'] = $config['trdcfg']['tc_tag'];
        $kvs['RequestTime'] = date("YmdHis");
        $kvs['Sign'] = strtolower(md5($config['trdcfg']['tc_tag'] . "&" . $kvs['RequestTime'] . "&" . $config['trdcfg']['tc_api_signkey']));
        if (in_array($kvs['runfunc'], ['REGISTER', 'GETUSERURL'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['password'] = md5($uname);
            $kvs['MiniBetLimit'] = $config['trdcfg']['tc_min_bet'];
            $kvs['MaxBetLimit'] = $config['trdcfg']['tc_max_bet'];
            $kvs['TimeZone'] = $config['trdcfg']['tc_timezone'];
            $lang = $config['trdcfg']['tc_langmap'];
            $kvs['Language'] = $this->_getLanguage($lang);
            $kvs['ForceMode'] = 0;//0 自动,1 H5 ,2 PC
        }
        if (in_array($kvs['runfunc'], ['DEPOSIT', 'WITHDRAW'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['money'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
            $kvs['MerchantOrderNumber'] = date("YmdHis") . rand(100000, 999999);
        }
        if (in_array($kvs['runfunc'], ['GETBALANCE'])) {
            $uname = Meta::initGetField('uname', $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
        }
//        Utils::L('T9_transOtherKvs',$kvs);
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        if ($func == 'GETBALANCE') {
            $kds['tcbalance'] = 0;
            if (isset($datas['Data'][0]['Balance'])) {
                $kds['tcbalance'] = $datas['Data'][0]['Balance'];
            }
        }
//        Utils::L('T9_transOtherKvsData',$kds);
//        Utils::L('T9_transResultData',$datas);
    }

    /**
     * 获取语言类型
     * @param string $lang
     * @return int
     */
    function _getLanguage($lang = '')
    {
        $lang = strtolower($lang);
        $Language = 3;
        switch ($lang) {
            case "tw":
                $Language = 1;
                break;
            case "cn":
                $Language = 2;
                break;
            case "en":
                $Language = 3;
                break;
            case "th":
                $Language = 4;
                break;
            case "vn":
                $Language = 5;
                break;
            case "kr":
                $Language = 6;
                break;
            case "jp":
                $Language = 7;
                break;
        }
        return $Language;
    }
}