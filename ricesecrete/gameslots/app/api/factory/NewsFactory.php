<?php
namespace app\api\factory;
use app\common\model\NewsModel;
use think\facade\Request;
class NewsFactory
{
    private $param;//请求参数
    private $uid;//用户id
    //验证
    public function __construct($uid=0){
        $this->param=Request::param();
        $this->uid=$uid;
    }

    //问答列表
    public function list_run(){
        $pagenow = $this->param['page']??1;
        $limit = $this->param['limit']??10;
        $lang = strtoupper(\think\facade\Lang::getLangSet());
        $offset = ($pagenow - 1) * $limit;
        $where = [];
        $where[] = ["type", "=", 0];
        if(!empty($lang)){
            $where[] = ["lang", "=", $lang];
        }
        
        $data = NewsModel::where($where)->limit($offset, $limit)->select();
        foreach ($data as $key => &$value) {
            $value['add_time'] = date("Y-m-d",$value['add_time']);
            $value['news_content']= mb_substr(strip_tags($value['news_content']), 0, 100);
        }

        $rsps['data']=$data;
        $rsps['code']=1;
        return $rsps;
    }

    //问答详情
    public function detail_run(){
        $news_id = $this->param['news_id']??0;
        if(empty($news_id)){
            ajax_return("参数错误", 0);
        }
        $data = NewsModel::where("id",$news_id)->find();
        if (empty($data)) {
            ajax_return('数据不存在', 0);
        }
        $data['add_time']=date("Y-m-d",$data['add_time']);
        $rsps['data']=$data;
        $rsps['code']=1;
        return $rsps;
    }
}