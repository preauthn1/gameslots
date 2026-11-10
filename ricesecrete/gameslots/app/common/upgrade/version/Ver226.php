<?php

namespace app\common\upgrade\version;

use think\facade\Db;

/**
 * 定制菜单 增加选中图标和默认图标
 * Class Ver226
 * @package app\common\upgrade\version
 */
class Ver226 extends VersionBase
{

    public function run()
    {
        //菜单选中图标地址
        if (!$this->existTableField("dq_index_menu", "select_icon_url")){
            $sql = "ALTER TABLE `dq_index_menu` ADD COLUMN `select_icon_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '选中图标地址';";
            $this->execute($sql);
        }
    }
}