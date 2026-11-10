<?php


namespace app\common\model;


use think\Model;

class TaskStageModel extends Model
{
    protected $name = 'task_stage';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'create_time';
    protected $updateTime = 'update_time';

    protected $schema = [
        'id'            => 'int',
        'lang'          => 'varchar',
        'type'          => 'tinyint',
        'savings'       => 'decimal',
        'receive_agent_id'=> 'int',
        'receive_level_id'=> 'int',
        'receive_tag_id'=> 'int',
        'stage_id'      => 'int',
        'reg_json'      => 'text',
        'status'        => 'tinyint',
        'create_time'   =>  'int',
        'update_time'   =>  'int',
        'name'          => 'varchar',
    ];

    //奖励类型
    const BALANCE_REWARD_TYPE = 0;#当前货币余额
    const INTEGRAL_REWARD_TYPE = 1;#积分
    //获取奖励类型数组
    public static function getRewardTypeArr(){
        return [
            self::BALANCE_REWARD_TYPE,#当前货币余额
            self::INTEGRAL_REWARD_TYPE,#积分
        ];
    }

    //存日志记录字段
    public function getField(){
        $field = [
            'id'=>'id',
            'type'=>lang('任务类型'),
            'savings'    => lang("流水倍数"),
            'amount_or_integral'=>lang('奖励金额或积分'),
            'status'=>lang('状态'),
            'name'  => lang("名称")
        ];
        $set_key = [];
        return ['field'=>$field,'set_key'=>$set_key,'table'=>$this->name];
    }
}