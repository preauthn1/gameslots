<?php
namespace app\api\controller;
use app\common\lib\Respons;
use app\api\factory\BotFactory;
use think\Request;
class Bot
{
    public function __construct(){
        $status = env('bot.status',0);
        if(!$status){
            die;
        }
    }

    //设置回调地址
    public function set(Request $request){
        $rsps=(new BotFactory())->set_run();
        return Respons::run($rsps);
    }

    //删除回调地址
    public function del(Request $request){
        $rsps=(new BotFactory())->del_run();
        return Respons::run($rsps);
    }

    public function webhook(Request $request){
        $rsps=(new BotFactory())->hook_run();
        return Respons::run($rsps);
    }
}