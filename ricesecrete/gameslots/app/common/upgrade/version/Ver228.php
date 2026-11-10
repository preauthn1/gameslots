<?php

namespace app\common\upgrade\version;

use think\facade\Db;

/**
 * 游戏前端分类功能改动
 * Class Ver227
 * @package app\common\upgrade\version
 */
class Ver228 extends VersionBase
{

    public function run() {
        //游戏前端分类
        if ( !$this->existTableField("dq_game_type", "type") ) {
            $sql = "ALTER TABLE `dq_game_type` ADD COLUMN `type` tinyint(1) DEFAULT '0' COMMENT '分类类型  0不指定 1电子  2捕鱼  3真人';";
            $this->execute($sql);
        }
    }
}