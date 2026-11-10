<?php
namespace app\common\model;
use think\facade\Session;
use think\Model;
class ActionApplyModel extends Model
{
	protected $name = 'action_apply';
	protected $schema = [
        'id'          => 'int',
        'add_time'          => 'bigint',
        'uid'  =>  'int',
        'action_id' =>  'int',
        'user_ck_id' =>  'int',
        'gd_amount' =>  'decimal',
        'tyj_amount' =>  'decimal',
        'tyj_date' =>  'bigint',
        'ps_status' =>  'int',
        'ps_deta' =>  'bigint',
        'ck_bl' =>  'decimal',
        'ck_hl_amount' =>  'decimal',
        'integral' =>  'decimal',
        'integral_rate' =>  'decimal',
        'water' => 'decimal',
        'operator' => 'varchar',
        'contributor' => 'int',
        'consecutive_days' => 'int'
    ];

    //存日志记录字段
    public function getField(){
        $field = [
            'id'=>'id',
            'ps_status'=>lang('派送状态'),
        ];
        $set_key = [
            ['ps_status'=>[0=>lang('未派送'),1=>lang('已派送'),2=>lang('已拒绝')]],
        ];
        return ['field'=>$field,'set_key'=>$set_key,'table'=>$this->name];
    }

    public static function getamount($uid,$status = ""){
        $where = [];
        $where[] = ['uid','=',$uid];
        if($status !== ""){
            $where[] = ['ps_status','=',$status];
        }
        $gd_amount = self::where($where)->sum('gd_amount');
        $ck_hl_amount = self::where($where)->sum('ck_hl_amount');
        return sprintf("%.2f",$gd_amount+$ck_hl_amount);
    }

}