<?php
namespace app\admin\controller;
use app\common\model\FlyerOrderModel;
use app\common\lib\Respons;
use app\common\Utils;
use think\db\Where;
use think\facade\View;
use think\facade\Request;
class FlyerOrder
{	
	protected $middleware = ['adminCheckLogin',"Language"];

    //列表
    public function list(){
        $param=Request::param();
        if (isset($param['select'])) {
            $page=$param['page'];
            $limit=$param['limit'];
            $where=[];

            if (isset($param['add_time']) && $param['add_time']!='') {
                $date=explode(' - ',$param['add_time']);
                $where[]=["a.add_time",">=", Utils::getQueryDateTime($date[0])];
                $where[]=["a.add_time","<=", Utils::getQueryDateTime($date[1], true)];
            }

            if (isset($param['order_id']) && $param['order_id']!=''){
                $where[]=["a.order_id","=",$param['order_id']];
            }
            if (isset($param['uid']) && $param['uid']!=''){
                $where[]=["a.uid|a.username","=",$param['uid']];
            }
            if (isset($param['type']) && $param['type']!=''){
                $where[]=["a.type","=",$param['type']];
            }

            if (isset($param['game_name']) && $param['game_name']!=''){
                $where[]=["a.game_name","=",$param['game_name']];
            }
            //正式用户
            $where[]=["a.lebal","=",1];
            $FlyerOrderModel =new FlyerOrderModel();
            $rsps['count']=$FlyerOrderModel
                ->alias("a")
                ->where($where)
                ->count();
            $rsps['data']=$FlyerOrderModel
                ->alias("a")
                ->where($where)
                ->limit((($page-1)*$limit),$limit)
                ->order("id desc")
                ->select();
            if(isset($rsps['data'][0])){
                foreach ($rsps['data'] as $k=>$v){
                    $rsps['data'][$k]['add_time'] = date('Y-m-d H:i:s',$v['add_time']);
                }
            }
            $rsps['code']=1;
            return Respons::run($rsps);
        }
        return View::fetch('flyer_order/list');
    }
}