<?php
namespace app\api\controller;
use app\common\lib\Respons;
use app\api\factory\NewsFactory;
use think\Request;
class News
{	
	
    //问答列表
    public function lists(Request $request){
        $rsps=(new NewsFactory($request->token->uid))->list_run();
        return Respons::run($rsps);
    }
	

    //问答详情
    public function detail(Request $request){
        $rsps=(new NewsFactory($request->token->uid))->detail_run();
        return Respons::run($rsps);
    }
	
}