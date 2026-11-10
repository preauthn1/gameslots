<?php

namespace app\common\model;

use think\Model;

class GameTypeModel extends Model
{
    //0不指定 1电子  2捕鱼  3真人
    public static $Type = [
        0 => '不指定',
        1 => '电子',
        2 => '捕鱼',
        3 => '真人',
    ];

    protected $name = 'game_type';

    protected $schema = [
        'id' => 'int',
        'name' => 'varchar',
        'icon' => 'varchar',
        'default_icon' => 'varchar',
        'sort' => 'tinyint',
        'state' => 'tinyint',
        'type' => 'tinyint',
        'create_time' => 'int',
        'update_time' => 'int',
        'min_amount' => 'decimal',
        'max_amount' => 'decimal',
    ];

    //存日志记录字段
    public function getField()
    {
        $field = [
            'id' => 'id',
            'name' => lang('游戏分类名称'),
            'sort' => lang('排序'),
            'create_time' => lang('添加时间'),
            'update_time' => lang('修改时间'),
            'state' => lang('状态'),
        ];
        return ['field' => $field, 'table' => $this->name];
    }


}