<?php

namespace app\common\upgrade\version;

use think\facade\Db;

/**
 * 推广链接点击记录
 * 代理列表软删除与备注
 * Class Ver230
 * @package app\common\upgrade\version
 */
class Ver231 extends VersionBase
{

    public function run() {
        // dq_user  推广点击次数记录
        if ( !$this->existTableField("dq_user", "rec_click") ) {
            $sql = "ALTER TABLE `dq_user` ADD COLUMN `rec_click` int DEFAULT '0' COMMENT '推广点击次数';";
            $this->execute($sql);
        }
        // dq_user_agent  代理列表软删除与备注
        if ( !$this->existTableField("dq_user_agent", "remark") ) {
            $sql = "ALTER TABLE `dq_user_agent` ADD COLUMN `remark` varchar(255) DEFAULT '' COMMENT '备注';";
            $this->execute($sql);
        }
        if ( !$this->existTableField("dq_user_agent", "is_del") ) {
            $sql = "ALTER TABLE `dq_user_agent` ADD COLUMN  `is_del` tinyint DEFAULT '0' COMMENT '0默认  1删除不显示';";
            $this->execute($sql);
        }

    }
}