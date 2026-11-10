<?php
namespace app\api\factory;
use app\common\lib\Util;
use app\common\model\PaySetModel;
use app\common\model\UserOfflineModel;
use app\common\model\UserWithdrawalModel;
use app\common\service\BetService;
use app\common\service\UserWithdrawalService;
use app\common\Utils;
use Carbon\Carbon;
use Longman\TelegramBot\Entities\CallbackQuery;
use Longman\TelegramBot\Entities\Message;
use Longman\TelegramBot\Exception\TelegramException;
use Longman\TelegramBot\Telegram;
use Longman\TelegramBot\Request;
use think\facade\Lang;
use think\facade\Db;
use think\facade\Cache;


class BotFactory
{
    private $api_key = '';
    private $username = "";
    private $param;//请求参数

    public function __construct(){
        $this->param=\think\facade\Request::param();
        $this->api_key = env('bot.api_key','');
        $this->username = env('bot.username','');
    }

    public function set_run(){
        try {
            $url = getWebUrl() . "/bot/webhook";
            $api = new Telegram($this->api_key, $this->username);
            $result = $api->setWebhook($url);
            $res['code'] = $result->isOk() ? 0 : 1;
            $res['msg'] = $result->isOk() ? 'success' : 'fail';
            return $res;
        } catch (TelegramException $e) {
            return $e->getMessage();
        }
    }

    public function del_run(){
        try {
            $api = new Telegram($this->api_key, $this->username);
            $result = $api->deleteWebhook();
            $res['code'] = $result->isOk() ? 0 : 1;
            $res['msg'] = $result->isOk() ? 'success' : 'fail';
            return $res;
        } catch (TelegramException $e) {
            return $e->getMessage();
        }
    }

    public function hook_run() {
        $api_key = $this->api_key;
        $username = $this->username;
        try {
            $api = new Telegram($api_key, $username);
            $param = $this->param;
            if(env('bot.log_status',0)){
                Utils::L('bot', $param);
            }
            $paths = [
                root_path('app/common/telegram'),
            ];
            $api->addCommandsPaths($paths);
            $api->handle();
        } catch (Exception $exc) {
            Utils::L('bot_error', [$exc->getMessage(), $exc->getTraceAsString()]);
        }
    }

    public function AutonMessage($status = 1,$oid = 0) {
        $api_key = $this->api_key;
        $username = $this->username;
        if(empty($api_key) || empty($username)){
            return;
        }
        try {
            new Telegram($api_key, $username);
            if($status == 1){
                $this->bets();
            }else if($status == 2){
                $this->OfflineMsg($oid);
            }else if($status == 3){
                $this->WithdrawalMsg($oid);
            }else if($status == 4){
                //线上充值成功
                $this->OlineSuccessMsg($oid);
            }else if($status == 5){
                //提现成功
                $this->WithdrawalSuccessMsg($oid);
            }
        } catch (Exception $exc) {
            Utils::L('bot_error', [$exc->getMessage(), $exc->getTraceAsString()]);
        }
    }

    //游戏派彩
    public function bets(){
        $count = env('bot.number',1);
        $min_price = env('bot.min_price',1);
        $max_price = env('bot.max_price',10);
        $chat_id = env('bot.chat_id','');
        $range = env('bot.lang','cn');
        $content = '';
        $startTime = strtotime("-30 minute");//前30分钟
        $endTime = time();
        $where = [
            ['a.gb_winlose','=',3],
            ['t.tc_status','=',1],
//            ['a.gb_bettime', 'between', [$startTime, $endTime]]
        ];
        $betWhere = BetService::getGbidByTime($startTime, $endTime, 'gb_bettime', 'a')['sql'];
        $list = Db::name('game_bets')->alias("a")->where($where)->where($betWhere)
            ->join("dq_user u","a.gb_uid=u.id")
            ->join("dq_game_infos g","a.gb_gid=g.gi_gid")
            ->join("dq_games ge","ge.g_id=a.gb_gid")
            ->join("dq_third_configs t","ge.g_web_tcid=t.tc_id")
            ->field('u.username,g.gi_name,a.gb_winprice,t.tc_name')
            ->order('a.gb_id desc')
            ->limit($count)
            ->select();
        $list_count = count($list->toArray());
        $currency = Util::getCurrencyDefaultSymbol('symbol');

        $num = $count - $list_count;
        for($i=1; $i<=$num; $i++) {
            $name = get_rand_char(10);
            $len = mb_strlen($name);
            $str1 = mb_substr($name,0,1);
            $str2 = mb_substr($name,$len-2,1);
            $game =  Db::name('game_infos')->alias("a")->where([['t.tc_status','=',1]])
                ->join("dq_games g","a.gi_gid=g.g_id")
                ->join("dq_third_configs t","g.g_web_tcid=t.tc_id")
                ->field('a.gi_name,t.tc_name')
                ->orderRaw("rand()")
                ->limit(1)
                ->find();
            $username = $str1.'****'.$str2;
            $amount = rand_float($min_price,$max_price);
            $msg_data = ['third'=>$game['tc_name'],'game'=>$game['gi_name'],'username'=>$username,'amount'=>$amount,'currency'=>$currency];
            $text = "🎉恭喜玩家{:username}，在<b>{:third}</b>平台，<b>{:game}</b>游戏，喜中<b><u>{:amount}</u>{:currency}</b>🎉";
            $content .= lang($text, $msg_data,strtolower($range))."\n";
        }

        if($list_count >= 1){
            foreach ($list as $v){
                $len = mb_strlen($v['username']);
                $str1 = mb_substr($v['username'],0,1);
                $str2 = mb_substr($v['username'],$len-2,1);
                $game = $v['gi_name'];
                $third = $v['tc_name'];
                $username = $str1.'****'.$str2;
                $amount = sprintf("%.2f",$v['gb_winprice']);
                $msg_data = ['third'=>$third,'game'=>$game,'username'=>$username,'amount'=>$amount,'currency'=>$currency];
                $text = "🎉恭喜玩家{:username}，在<b>{:third}</b>平台，<b>{:game}</b>游戏，喜中<b><u>{:amount}</u>{:currency}</b>🎉";
                $content .= lang($text, $msg_data,strtolower($range))."\n";
            }
        }

        $data = [
            'chat_id' => $chat_id,
            'text' => $content,
            'parse_mode' => 'HTML',
        ];
        $result = Request::sendMessage($data);
        $this->log($result);
    }

    //充值通知
    public function OfflineMsg($oid){
        $chat_id = env('bot.chat_id','');
        $range = strtolower(env('bot.lang','cn'));
        if(empty($chat_id) || empty($oid)){
            return;
        }
        $where = [['a.status','in',[-1,1]],['u.status','=',1],['a.id','=',$oid]];
        $content = '';
        $info = Db::name('user_offline')->alias("a")->where($where)
            ->join("user u","a.uid=u.id")
            ->field('a.id,a.order_sn,a.apply_price,a.add_time,u.id as uid,u.username,u.phone,u.rec_code,u.real_name')
            ->find();

        if($info){
            //今日总充值
            $_condition = [];
            $_condition[] = ['update_time', 'between', [Carbon::now()->startOfDay()->timestamp, Carbon::now()->endOfDay()->timestamp]];
            $_condition[] = ['status', 'in', '3,4'];
            $todayTotalRecharge = UserOfflineModel::where($_condition)->sum('arrival_price');
            $msg_data = ['uid'=>$info['uid'],'username'=>$info['username'],'real_name'=>$info['real_name'],'phone'=>$info['phone'],'order_sn'=>$info['order_sn'],'apply_price'=>$info['apply_price'],'add_time'=>date('Y-m-d H:i:s',$info['add_time']), 'today_total_price' => round($todayTotalRecharge, 2)];
            $text = "<b>[充值通知]</b>=用户ID:{:uid}=账号:{:username}=手机号码:{:phone}=订单编号:{:order_sn}=客戶本名:{:real_name}=充值金额:<u>{:apply_price}</u>=今日总充值:<u>{:today_total_price}</u>=充值时间:{:add_time}";
            Lang::load(app()->getRootPath() . 'app/lang/'.$range.'.php');
            $content = lang::get($text, $msg_data);
            $content = str_replace('=', "\n", $content);
        }

        if($content){
            $data = [
                'chat_id' => $chat_id,
                'text' => $content,
                'parse_mode' => 'HTML',
            ];
            $result = Request::sendMessage($data);
            $this->log($result);
        }
    }

    //线上成功充值通知
    public function OlineSuccessMsg($oid){
        $chat_id = env('bot.chat_id','');
        $range = strtolower(env('bot.lang','cn'));
        if(empty($chat_id) || empty($oid)){
            return;
        }
        $where = [['a.status','=',3],['u.status','=',1],['a.id','=',$oid]];
        $content = '';
        $info = Db::name('user_offline')->alias("a")->where($where)
            ->join("user u","a.uid=u.id")
            ->field('a.id,a.order_sn,a.apply_price,a.add_time,u.id as uid,u.username,u.phone,u.rec_code,u.real_name')
            ->find();

        if($info){
            //今日总充值
            $_condition = [];
            $_condition[] = ['update_time', 'between', [Carbon::now()->startOfDay()->timestamp, Carbon::now()->endOfDay()->timestamp]];
            $_condition[] = ['status', 'in', '3,4'];
            $todayTotalRecharge = UserOfflineModel::where($_condition)->sum('arrival_price');
            $msg_data = ['uid'=>$info['uid'],'username'=>$info['username'],'real_name'=>$info['real_name'],'phone'=>$info['phone'],'order_sn'=>$info['order_sn'],'apply_price'=>$info['apply_price'],'add_time'=>date('Y-m-d H:i:s',$info['add_time']), 'today_total_price' => round($todayTotalRecharge, 2)];
            $text = "<b>[充值完成]</b>=用户ID:{:uid}=账号:{:username}=手机号码:{:phone}=订单编号:{:order_sn}=客戶本名:{:real_name}=充值金额:<u>{:apply_price}</u>=今日总充值:<u>{:today_total_price}</u>=充值时间:{:add_time}";
            Lang::load(app()->getRootPath() . 'app/lang/'.$range.'.php');
            $content = lang::get($text, $msg_data);
            $content = str_replace('=', "\n", $content);
        }

        if($content){
            $data = [
                'chat_id' => $chat_id,
                'text' => $content,
                'parse_mode' => 'HTML',
            ];
            $result = Request::sendMessage($data);
            $this->log($result);
        }
    }


    //提现通知
    public function WithdrawalMsg($oid){
        $chat_id = env('bot.chat_id','');
        $range = strtolower(env('bot.lang','cn'));
        if(empty($chat_id) || empty($oid)){
            return;
        }
        $where = [['a.status','=',1],['u.status','=',1],['a.id','=',$oid]];
        $content = '';
        $info = Db::name('user_withdrawal')->alias("a")->where($where)
            ->join("user u","a.uid=u.id")
            ->join('user_bank ub', 'ub.uid = a.uid')
            ->field('a.id,a.order_sn,a.arrival_prices,a.add_time,u.id as uid,u.username,u.phone,u.rec_code,ub.bank_name,ub.bank_hm')
            ->find();

        if($info){
            //获取支付渠道获取提现银行卡的银行编码
            $bank_code = UserWithdrawalService::getBankCodeByBankName($info['bank_name']);
            //今日总提现
            $_condition = [];
            $_condition[] = ['update_time', 'between', [Carbon::now()->startOfDay()->timestamp, Carbon::now()->endOfDay()->timestamp]];
            $_condition[] = ['status', 'in', '3,4'];
            $todayTotalWithdrawal = UserWithdrawalModel::where($_condition)->sum('arrival_price');
            $msg_data = ['uid'=>$info['uid'],'username'=>$info['username'],'bank_name'=>$info['bank_name'],'bank_code'=>$bank_code,'real_name'=>$info['bank_hm'],'phone'=>$info['phone'],'order_sn'=>$info['order_sn'],'arrival_prices'=>$info['arrival_prices'],'add_time'=>date('Y-m-d H:i:s',$info['add_time']), 'today_total_price' => $todayTotalWithdrawal];
            $text = "<b>[提现通知]</b>=用户ID:{:uid}=账号:{:username}=手机号码:{:phone}=订单编号:{:order_sn}=客戶本名:{:real_name}=银行名称:{:bank_name}=银行编码:{:bank_code}=提现金额:<u>{:arrival_prices}</u>=今日总提现:<u>{:today_total_price}</u>=提现时间:{:add_time}";
            Lang::load(app()->getRootPath() . 'app/lang/'.$range.'.php');
            $content = lang::get($text, $msg_data);
            $content = str_replace('=', "\n", $content);
        }

        if($content){
            $data = [
                'chat_id' => $chat_id,
                'text' => $content,
                'parse_mode' => 'HTML',
            ];
            $result2 = Request::sendMessage($data);
            $this->log($result2);
        }
    }

    //提现通知
    public function WithdrawalSuccessMsg($oid){
        $chat_id = env('bot.chat_id','');
        $range = strtolower(env('bot.lang','cn'));
        if(empty($chat_id) || empty($oid)){
            return;
        }
        $where = [['a.status','=',3],['u.status','=',1],['a.id','=',$oid]];
        $content = '';
        $info = Db::name('user_withdrawal')->alias("a")->where($where)
            ->join("user u","a.uid=u.id")
            ->join('user_bank ub', 'ub.uid = a.uid')
            ->field('a.id,a.order_sn,a.arrival_prices,a.add_time,u.id as uid,u.username,u.phone,u.rec_code,ub.bank_name,ub.bank_hm')
            ->find();

        if($info){
            //获取支付渠道获取提现银行卡的银行编码
            $bank_code = UserWithdrawalService::getBankCodeByBankName($info['bank_name']);
            //今日总提现
            $_condition = [];
            $_condition[] = ['update_time', 'between', [Carbon::now()->startOfDay()->timestamp, Carbon::now()->endOfDay()->timestamp]];
            $_condition[] = ['status', 'in', '3,4'];
            $todayTotalWithdrawal = UserWithdrawalModel::where($_condition)->sum('arrival_price');
            $currentTime = time();
            $msg_data = ['uid'=>$info['uid'],'username'=>$info['username'],'real_name'=>$info['bank_hm'],'bank_name'=>$info['bank_name'],'bank_code'=>$bank_code,'phone'=>$info['phone'],'order_sn'=>$info['order_sn'],'arrival_prices'=>$info['arrival_prices'],'add_time'=>date('Y-m-d H:i:s',$currentTime), 'today_total_price' => $todayTotalWithdrawal];
            $text = "<b>[提现完成]</b>=用户ID:{:uid}=账号:{:username}=手机号码:{:phone}=订单编号:{:order_sn}=客戶本名:{:real_name}=银行名称:{:bank_name}=银行编码:{:bank_code}=提现金额:<u>{:arrival_prices}</u>=今日总提现:<u>{:today_total_price}</u>=提现时间:{:add_time}";
            Lang::load(app()->getRootPath() . 'app/lang/'.$range.'.php');
            $content = lang::get($text, $msg_data);
            $content = str_replace('=', "\n", $content);
        }

        if($content){
            $data = [
                'chat_id' => $chat_id,
                'text' => $content,
                'parse_mode' => 'HTML',
            ];
            $result2 = Request::sendMessage($data);
            $this->log($result2);
        }
    }



    public function log($result) {
        $count = env('bot.log_status',0);
        if (!$result->isOk()) {
            Utils::L('bot_error', $result);
        }
        if($count) {
            Utils::L('bot_message', $result);
        }
    }

    public function content($text) {
        return str_replace(
            ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!', ],
            ['\_', '\*', '\[', '\]', '\(', '\)', '\~', '\`', '\>', '\#', '\+', '\-', '\=', '\|', '\{', '\}', '\.', '\!', ],
            $text);
    }

}