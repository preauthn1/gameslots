<?php


namespace app\common\FastGame;


use app\common\game\GameRequest;
use app\common\lib\Util;
use app\common\model\GameBetsModel;
use app\model\GameBets;
use app\model\GameBetsSon;
use app\model\UserThirds;
use app\common\FastGame\Base\{Game, Http, Meta, Third, Utils};
use app\model\Games;

class Third_kl extends Third
{

    const PICK3 = 'pick3';
    const MATKA = 'matka';
    const KERALA = 'kerala';

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
        $SecretKey = $config['trdcfg']["tc_api_signkey"];

        if(isset($data['sign']))$data['sign']='{sign}';

        $sign = md5($data['Data'] . $SecretKey);

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
        $SecretKey = $config['trdcfg']["tc_api_signkey"];
        $param = $data['param'];
        $_sign = md5($param['Data'] . $SecretKey);
        // 生成签名并校验，怎么urldecode掉了呢
        if ($_sign == $param['Sign']) {
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

        if($kvs['runfunc'] == 'GETUSERURL') {
            $username = Meta::initGetField('uname',  $config['trdcfg']['tc_id'], $config['g_id'], $kvs['uid']);
            $kvs['sdata'] = json_encode(['acc'=>$username]);
        }
    }


    function transResultData($func, &$kds, $datas, $tcid, $uid, $gid, $ohterkvs)
    {
        $config = $this->apicfgs;
        if( $func == 'GETUSERURL' ){
            if( $datas['code'] == 0 ){
                $kds['tcgameurl'] = json_decode($datas['data'], true)['URL'].'&game=' . $config['g_code'];
            }
        }
        if($func == 'GETBETDETAIL') {
            $kds['tcgamedetailurl'] = false;
            $result = $this->_request($ohterkvs['betInfo'], $config['trdcfg'], $ohterkvs['betInfo']['gb_cusfield']);
            if( $result ){
                $kds['tcgamedetailurl'] = $this->handleDetailResult($result, $ohterkvs['betInfo']['gb_cusfield']);
            }
        }
    }

    //请求
    public function _request($hotBet, $platformDetail, $type){
        switch ($type){
            case Third_kl::KERALA:
                $_url = '/player_kerala_bet_log_by_order_id';
                $resultField = 'KeralaBetLog';
                break;
            case Third_kl::PICK3:
                $_url = '/player_pick3_bet_log_by_order_id';
                $resultField = 'Pick3BetLog';
                break;
            case Third_kl::MATKA:
                $_url = '/player_matka_bet_log_by_order_id';
                $resultField = 'MatkaBetLog';
                break;
            default:
                return false;
        }
        $url = $platformDetail['tc_api_urlpre'] . $_url;
        $params = [
            'Data' => json_encode([
                'type' => 1,
                'platform_order_id' => $hotBet['gb_sn'],
            ]),
            'PlatformCode' => $platformDetail['tc_tag'],
        ];
        $params['Sign'] = md5($params['Data'].$platformDetail['tc_api_signkey']);
        $header = [
            'Content-type: application/x-www-form-urlencoded',
        ];
        // 增加HTTP代理请求
        $isProxy = env('IS_REQUIRE_GAME_PROXY', '');
        $proxy = '';
        if ($isProxy) {
            $proxy = env('GAME_PROXY_URL', '');
        }
        $res = GameRequest::curl_post($url, http_build_query($params), $header, $proxy);
        $res = json_decode($res, true);
        if( !$res || !isset($res['code']) || $res['code'] != 0 ){
            return false;
        }
        $result = json_decode($res['data'], true);
        return $result[$resultField][0] ?? ($result[$resultField] ?? []);
    }

    //处理详情结果
    private function handleDetailResult($thirdResult, $type){
        switch ($type){
            case Third_kl::KERALA:
                $resultField = 'KeralaLogNo';
                break;
            case Third_kl::PICK3:
                $resultField = 'Pick3LogId';
                break;
            case Third_kl::MATKA:
                $resultField = 'MatkaLogId';
                break;
            default:
                return false;
        }
        $statusArr = [-1 => '未知', 0 => '未开奖', 1 => '未中奖', 2 => '未领取', 3 => '已领取'];
        $arr = [];
        $arr[] = [
            'name' => lang('局号'),
            'value' => $thirdResult[$resultField] ?? '无',
        ];
        $arr[] = [
            'name' => lang('流水号'),
            'value' => $thirdResult['UserId'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('购买订单号'),
            'value' => $thirdResult['BuyOrderNo'] ?? '',
        ];
        $arr[] = [
            'name' => lang('购买号码'),
            'value' => $thirdResult['BuyingNumbers'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('购买数量'),
            'value' => $thirdResult['Quantity'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('购买总金额'),
            'value' => $thirdResult['Amount'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('克拉拉结算状态'),
            'value' => $statusArr[$thirdResult['Status']?? -1],
        ];
        $arr[] = [
            'name' => lang('开奖号码'),
            'value' => $thirdResult['WinningNumbers'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('奖级'),
            'value' => $thirdResult['Award'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('中将金额'),
            'value' => $thirdResult['Prize'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('下单时间'),
            'value' => $thirdResult['CreatedAt'] ?? '无',
        ];
        $arr[] = [
            'name' => lang('结算时间'),
            'value' => $thirdResult['UpdatedAt'] ?? '无',
        ];
        return $arr;
    }
}
