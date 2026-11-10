<?php

namespace app\common\upgrade\version;

use think\facade\Db;

/**
 * 首页菜单布局调整
 * Class Ver229
 * @package app\common\upgrade\version
 */
class Ver229 extends VersionBase
{

    public function run() {
        //首页菜单 增加 select_icon_url  选中图标
        if ( !$this->existTableField("dq_index_menu", "select_icon_url") ) {
            $sql = "ALTER TABLE `dq_index_menu` ADD COLUMN `select_icon_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '选中图标地址';";
            $this->execute($sql);
        }
        //首页菜单 增加 show_img
        if ( !$this->existTableField("dq_index_menu", "show_img") ) {
            $sql = "ALTER TABLE `dq_index_menu` ADD COLUMN `show_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '菜单显示主图';";
            $this->execute($sql);
        }
        //首页菜单 增加 show_bg1
        if ( !$this->existTableField("dq_index_menu", "show_bg1") ) {
            $sql = "ALTER TABLE `dq_index_menu` ADD COLUMN `show_bg1` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '菜单显示背景1';";
            $this->execute($sql);
        }
        //首页菜单 增加 show_bg2
        if ( !$this->existTableField("dq_index_menu", "show_bg2") ) {
            $sql = "ALTER TABLE `dq_index_menu` ADD COLUMN `show_bg2` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '菜单显示背景2';";
            $this->execute($sql);
        }
    }
}