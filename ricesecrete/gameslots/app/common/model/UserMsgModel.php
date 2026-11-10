<?php
namespace app\common\model;
use think\Model;
class UserMsgModel extends Model
{

	protected $name = 'user_msg';
	protected $schema = [
        'id'          => 'int',
        'lang'          => 'varchar',
        'add_time'          => 'bigint',
        'uid'          => 'int',
        'title'          => 'varchar',
        'content'          => 'varchar',
        'type'          => 'int',
        'othr_id'          => 'int',
        'read'          => 'int',
        'action_id'          => 'int',
        'img'          => 'varchar',
        'link_title'          => 'link_title',
        'link'          => 'varchar',
        'data'          => 'varchar',
        'recharge_first'          => 'int',
    ];

    //存日志记录字段
    public function getField(){
        $field = [
            'id'=>'id',
            'title'=>lang('标题'),
            'lang'=>lang('语种'),
            'add_time'=>lang('时间'),
            'content'=>lang('内容'),
            'type'=>lang('类型'),
            'action_id'=>lang('活动ID'),
            'img'=>lang('图片'),
            'link_title'=>lang('链接标题名称'),
            'link'=>lang('跳转链接'),
        ];
        $set_key = [
            ['type'=>[1=>lang('下注'),2=>lang('活动申请'),3=>lang('站内信')]],
        ];
        return ['field'=>$field,'set_key'=>$set_key,'table'=>$this->name];
    }

    /**
     * 添加消息
     * @param uid
     * @param title 消息标题
     * @param content 消息内容
     * @param type 类型 1注单 2活动 10基金 11抽奖 13系统消息 14游戏 15充值 16提现 17任务 18 等级 19 领取码 20赠金派发 21签到 22pdd转盘奖励 23五福奖励 24火箭活动 25红包雨活动 30注单退款
     * @param othr_id 关联id
    **/
    public static function add_msg($uid, $title, $content, $type, $othr_id, $data = [],$lang="CN", $recharge_first = ''){
        $add['add_time'] = time();
        $add['lang'] = $lang;
        $add['uid'] = $uid;
        $add['title'] = $title;
        $add['content'] = $content;
        $add['type'] = $type;
        $add['othr_id'] = $othr_id;
        $add['data'] = json_encode($data);
        $add['recharge_first'] = $recharge_first;
        self::insertGetId($add);
    }
}