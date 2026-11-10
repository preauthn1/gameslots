<?php


namespace app\common\FastGame;

use app\common\game\GameRequest;
use app\api\redis\ApiRedis;
use app\common\redis\CommomRedis;
use app\model\GameBetsTemp;
use app\common\FastGame\Base\{Http, Meta, Third, ThirdTask, Utils};
use app\model\Games;

class Third_saba extends Third
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

        $kvs['vendor_id'] = $config['trdcfg']['tc_api_signkey'];
        //OddsType Table（赔率类型表）
        //代码 定义
        //0 特殊盘口,不属于任何一种市场盘口(仅出现于 sport_type=157, 168, 245 或bet_type=468, 469, 8700 或游戏组别為 Casino 及 Live Casino)
        //1 Malay Odds(马来盘)
        //2 China Odds(中国盘)
        //3 Decimal Odds(欧洲盘)
        //4 Indo Odds(印度尼西亚盘)
        //5 American Odds(美国盘)
        //6 Myanmar Odds (缅甸盘)

        //钱包标识符
        //1 : 沙巴体育
        //5 : AG
        //13 : Exchange

        //token字段放配置参数，比如：盘口_钱包编号,token[0]为盘口，token[1]为钱包编号
        $token = explode('_',$config['trdcfg']['tc_token']);
        //所有
        if($kvs['runfunc'] != 'GETBETLIST'){

            $uname = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['vendor_member_id'] = $config['trdcfg']['tc_tag'].'_'.$uname;

        }

        if($kvs['runfunc'] == 'GETBETLIST'){


        }else if($kvs['runfunc'] == 'REGISTER'){


            $kvs['operatorId'] = $config['trdcfg']['tc_tag'];
            $kvs['username'] = $config['trdcfg']['tc_tag'].'_'.$uname;
            $kvs['oddstype'] = $token[0];
            //币种说明
            //编号 代码 名称 汇率
            //2 MYR 马元 1:1
            //3 USD 美元 1:1
            //4 THB 泰铢 1:1
            //6 EUR 欧元 1:1
            //12 GBP 英镑 1:1
            //13 RMB 人民币 1:1
            //15 IDR 印度尼西亚盾 1:1000
            //20 UUS 测试货币(测试环境使用)
            //32 JPY 日圆 1:1
            //41 CHF 瑞士法郎 1:1
            //42 PHP 菲律宾比索 1:1
            //45 WON 韩元 1:1
            //46 BND 文莱元 1:1
            //48 ZAR 南非兰特 1:1
            //49 MXN 墨西哥比绍 1:1
            //50 CAD 加币 1:1
            //51 INH(VND) 越南盾 1:1000
            //52 DKK 丹麦克朗 1:1
            //53 SEK 瑞典克朗 1:1
            //54 NOK 挪威克朗 1:1
            //55 RUB 俄罗斯卢布 1:1
            //56 PLN 波兰兹罗提 1:1
            //57 CZK 捷克克朗 1:1
            //58 RON 罗马尼亚列伊 1:1
            //61 INR 印度卢比 1:1
            //70 MMK(MKK) 缅甸元 1:1000
            //71 KHR 柬埔寨瑞尔 1:1000
            //73 LIR(TRY) 土耳其里拉 1:1
            //79 KES 肯尼亚先令 1:1
            //80 GHS 加纳塞地 1:1
            //82 BRL 巴西雷亚尔 1:1
            //83 CLP 智利比索 1:1
            //84 COP 哥伦比亚比索 1:1
            //85 PEN 秘鲁新索尔 1:1
            //86 ARS 阿根廷比索 1:1
            //90 AED 阿联酋迪拉姆 1:1
            //93 LAK 老挝基普(寮国基普) 1:1000
            //96 USDT USDT 1:1
            //97 BDT 孟加拉国塔卡 1:1
            //121 PKR 巴基斯坦卢比 1:1
            //122 KZT 哈萨克坦吉 1:1
            //123 NPR 尼泊尔卢比 1:1
            //124 RMB2 人民币(只支援沙巴白牌中国版)1:1
            //125 INH2(VND) 越南盾(只支援沙巴白牌中国版)1:1000
            //126 TB2 泰铢 (只支援沙巴白牌中国版) 1:1
            //127 INR2 印度卢比 (只支援沙巴白牌中国版) 1:1
            //128 PE2 菲律宾比索 (只支援沙巴白牌中国版) 1:1
            //129 IN2(IDR) 印度尼西亚盾 (只支援沙巴白牌中国版) 1 : 1000
            //130 Won2 韩元 (只支援沙巴白牌中国版) 1:1
            //131 RM2 马元 1:1 (只支援沙巴白牌中国版)
            //132 US$2 美元 (只支援沙巴白牌中国版)1:1
            //133 TND 突尼斯第纳尔 1:1
            //134 ZMW 赞比亚克瓦查 1:1
            //135 TZS 坦桑尼亚先令 1:1
            //203 JPY2 日圆(只支援沙巴白牌中国版)1:1
            //204 EUR2 欧元(只支援沙巴白牌中国版)1:1
            //205 BRL2 巴西雷亚尔 (只支援沙巴白牌中国版)1:1
            //206 USDT2 USDT2 (只支援沙巴白牌中国版)1:1
            //207 NGN 尼日利亚奈拉 1:1
            //210 DZD 阿尔及利亚第纳尔 1:1
            //211 MAD 摩洛哥迪拉姆 1:1
            //212 FRF 法国法郎 1:1
            //215 BDT2 孟加拉国塔卡(只支援沙巴白牌中国版)1:1
            //216 EGP 埃及镑 1:1
            $kvs['currency'] = $config['trdcfg']['tc_currency'];
            $kvs['maxtransfer'] = $config['trdcfg']['tc_max_bet'];
            $kvs['mintransfer'] = $config['trdcfg']['tc_min_bet'];

        }else if($kvs['runfunc'] == 'GETUSERURL'){

        }else if($kvs['runfunc'] == 'GETBALANCE'){

            $kvs['wallet_id'] = $token[1];

        }else{

            $tomeorthird = $kvs['runfunc'] == 'DEPOSIT' ? 1 : 0;
            $kvs['amount'] = Third::transExchangerate($kvs['o_amount'], $tomeorthird, 2);
            $kvs['traceId'] = $config['trdcfg']['tc_tag'].'_'.md5(date("YmdHis") . Utils::random(16));
            $kvs['currency'] = $config['trdcfg']['tc_currency'];
            $kvs['wallet_id'] = $token[1];

        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {

        if($func == 'GETBETLIST'){

        }

        if($func == 'DEPOSIT'){
            if($datas['message'] == 'pending'){
                //当返回状态为2时，就是pending情况，需要去确认状态
                $datas = checkTransfer($ohterkvs['traceId']);
            }
            if(isset($datas['Data']))
            {
                $kds['tcbalance'] = $datas['Data']['after_amount'] - $datas['Data']['before_amount'];
            }

        }
        if($func == 'WITHDRAW'){
            if($datas['message'] == 'pending'){
                //当返回状态为2时，就是pending情况，需要去确认状态
                $datas = checkTransfer($ohterkvs['traceId']);
            }

            if(isset($datas['Data']))
            {
                $kds['tcbalance'] = $datas['Data']['before_amount'] - $datas['Data']['after_amount'];
            }

        }
        if($func == 'GETBALANCE'){

            $kds['tcbalance'] = $datas['Data'][0]['balance'];

        }

    }

    function checkTransfer($traceId, $retry = 3){

        $config = $this->apicfgs;
        $vendor_id = $config['trdcfg']['tc_api_signkey'];
        //token字段放配置参数，比如：盘口_钱包编号,token[0]为盘口，token[1]为钱包编号
        $token = explode('_',$config['trdcfg']['tc_token']);

        // 增加HTTP代理请求
        $isProxy = env('IS_REQUIRE_GAME_PROXY', '');
        $proxy = '';
        if ($isProxy) {
            $proxy = env('GAME_PROXY_URL', '');
        }
        $header[]="Content-type: application/x-www-form-urlencoded";
        $params = array(
            'vendor_id' => $vendor_id,
            'vendor_trans_id' => $traceId,
            'wallet_id' => $token[1]
        );
        $url = $config['trdcfg']['tc_api_urlpre'].'/CheckFundTransfer';
        $retryCount = 0;
        do {
            $res = json_decode(GameRequest::curl_post($url, $params, $header, $proxy), true);

            if($res['error_code'] == 2 && $retryCount < $retry){
                usleep(5000); // 5毫秒
                $retryCount++;
            } else {
                break; // 退出循环
            }

        } while ($retryCount < $retry);

        return $res??false;
    }

}