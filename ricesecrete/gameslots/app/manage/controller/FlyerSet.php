<?php
namespace app\admin\controller;
use app\common\model\FlyerSetModel;
use app\common\lib\Respons;
use think\facade\View;
use think\facade\Request;
class FlyerSet
{	
	protected $middleware = ['adminCheckLogin',"Language"];

    //列表
    public function list(){
        $param=Request::param();
        if (isset($param['select'])) {
            $page=$param['page'];
            $limit=$param['limit'];
            $where=[];
            $FlyerSetModel =new FlyerSetModel();
            $rsps['count']=$FlyerSetModel
	            ->where($where)
	            ->count();
            $rsps['data']=$FlyerSetModel
	            ->where($where)
	            ->limit((($page-1)*$limit),$limit)
	            ->order("id desc")
	            ->select();
            $rsps['code']=1;
            return Respons::run($rsps);
        }
        return View::fetch('flyer_set/list');
    }

    //编辑
    public function add(){
        $param=Request::param();
        if (isset($param['add'])) {
            $info=$param['info'];
            $GameSetModel=new FlyerSetModel();
            $res=$GameSetModel->insert($info);
            return Respons::run($res?1:0);
        }
        return View::fetch('flyer_set/add');
    }

    //编辑
    public function edit(){
        $param=Request::param();
        if (isset($param['edit'])) {
            $info=$param['info'];
            $FlyerSetModel=new FlyerSetModel();
            $upd['id']=$info['id'];
            $upd['name']=$info['name'];
            $upd['status']=$info['status'];
            $upd['key']=$info['key'];
            $upd['channel']=$info['channel'];
            $upd['exchange_rate']=$info['exchange_rate'];
            $upd['currency']=$info['currency'];
            $upd['api_url']=$info['api_url'];
            $res=$FlyerSetModel->update($upd);
            return Respons::run($res?1:0);
        }
        if (isset($param['find'])) {
            $FlyerSetModel =new FlyerSetModel();
            $res=$FlyerSetModel->where("id",$param['id'])->find();
            return Respons::run(1,$res);
        }
        View::assign("id",$param['id']);
        return View::fetch('flyer_set/edit');
    }
    
}