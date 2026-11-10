<?php
namespace app\common\model;
use think\Model;
class UserExtraModel extends Model
{
    protected $name = 'user_extra';

    protected $schema = [
        'uid'               => 'int',
        'whatsapp'          => 'varchar',
        'telegram'          =>  'varchar',
        'twitter'           =>  'varchar',
        'facebook'          =>  'varchar',
    ];


    //存日志记录字段
    public function getField(){
        $field = [
            'uid'           =>  'id',
            'whatsapp'      =>  lang('whatsapp'),
            'telegram'      =>  lang('telegram'),
            'twitter'       =>  lang('twitter'),
            'facebook'      =>  lang('facebook'),
        ];
        $set_key = [];
        return ['field'=>$field,'set_key'=>$set_key,'table'=>$this->name];
    }
}