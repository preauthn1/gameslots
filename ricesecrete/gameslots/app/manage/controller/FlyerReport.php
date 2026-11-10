<?php
namespace app\admin\controller;
use app\common\model\UserModel;
use app\common\model\GameReportOperatingModel;
use app\common\lib\Respons;
use app\common\Utils;
use think\facade\Db;
use app\common\redis\CommomRedis;
use think\facade\View;
use think\facade\Request;
class FlyerReport
{

    //飞行报表
    public function index(){
        $param=Request::param();
        if (isset($param['select'])) {
            $arr = [];
            $start_time = strtotime(date('Ymd235959'));
            $end_time = $start_time - 7*86400;
            if (isset($param['date']) && $param['date']!='') {
                $date=explode(' - ',$param['date']);
                $end_time = Utils::getQueryDateTime($date[0]);
                $start_time = Utils::getQueryDateTime($date[1], true);
            }

            for($i = $start_time;$i >= $end_time;$i-=86400){
                $date = date("Y-m-d", $i);
                $data = GameReportOperatingModel::where("day_time",$date)->select();

                if (isset($data[0])){
                    $arr[$date]['date']         = $date;
                    $arr[$date]['game_name']   = $data[0]['game_name'];  //游戏
                    $arr[$date]['bets_number']   = $data[0]['bets_number'];  //投注人数
                    $arr[$date]['bets_total']   = $data[0]['bets_total'];  //投注金额
                    $arr[$date]['pay_total']   = $data[0]['pay_total'];  //平台支出金额
                    $arr[$date]['user_total_loss'] = $data[0]['user_total_loss'];  //用户盈亏
                    $arr[$date]['platform_total_lose'] = $data[0]['platform_total_lose'];  //平台盈亏
                }else{
                    $arr[$date]['date']         = $date;
                    $arr[$date]['game_name']   = '';  //游戏名称
                    $arr[$date]['bets_number']   = 0;  //投注人数
                    $arr[$date]['bets_total']   = 0;  //投注金额
                    $arr[$date]['pay_total']   = 0;  //平台支出金额
                    $arr[$date]['user_total_loss'] = 0;  //用户盈亏
                    $arr[$date]['platform_total_lose'] = 0;  //平台盈亏
                }

            }

            foreach($arr as  $value){
                if(isset($arr[lang('总计')])){
                    $arr[lang('总计')]['date']             = lang('总计');
                    $arr[lang('总计')]['game_name']      = '';
                    $arr[lang('总计')]['bets_number']      = '';
                    $arr[lang('总计')]['bets_total']      += $value['bets_total'];
                    $arr[lang('总计')]['pay_total']      += $value['pay_total'];
                    $arr[lang('总计')]['user_total_loss']    += $value['user_total_loss'];
                    $arr[lang('总计')]['platform_total_lose']     += $value['platform_total_lose'];
                }else{
                    $arr[lang('总计')]['date']            = lang('总计');
                    $arr[lang('总计')]['game_name']      = '';
                    $arr[lang('总计')]['bets_number']      = '';
                    $arr[lang('总计')]['bets_total']      = $value['bets_total'];
                    $arr[lang('总计')]['pay_total']      = $value['pay_total'];
                    $arr[lang('总计')]['user_total_loss']    = $value['user_total_loss'];
                    $arr[lang('总计')]['platform_total_lose']     = $value['platform_total_lose'];
                }

            }
            $rsps['data'] = $arr;
            $rsps['code']=1;
            return Respons::run($rsps);
        }
        return View::fetch();
    }
    /**
     * 飞行游戏余额管理
     */
    public function balance_list(){
        $param=Request::param();
        if (isset($param['select'])) {
            $page=$param['page'];
            $limit=$param['limit'];
            $where=[];
            //组装查询飞信要上分余额查询条件
            $where[]=["flyer_money",">",0.00]; //只展示上分余额大于0的数据
            //按用户名称进行查询
            if (isset($param['username']) && $param['username']!=''){
                $where[]=["username","=",$param['username']];
            }

            //正式用户
            $where[]=["lebal","=",1];
            $userModel =new UserModel();
            //获取数据总条数
            $rsps['count']=$userModel
                ->where($where)
                ->count();
            //获取数据分页列表
            $rsps['data']=$userModel
                ->where($where)
                ->limit((($page-1)*$limit),$limit)
                ->order("id esc")
                ->select();
            //处理数据中的时间
            if(isset($rsps['data'][0])){
                foreach ($rsps['data'] as $k=>$v){
                    $rsps['data'][$k]['add_time'] = date('Y-m-d H:i:s',$v['add_time']);
                }
            }
            $rsps['code']=1;
            return Respons::run($rsps);
        }
        return View::fetch();
    }
}
