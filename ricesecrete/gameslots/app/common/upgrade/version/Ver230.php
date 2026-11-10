<?php

namespace app\common\upgrade\version;

use think\facade\Db;

/**
 * 任务增加内容字段
 * Class Ver230
 * @package app\common\upgrade\version
 */
class Ver230 extends VersionBase
{

    public function run() {
        //任务增加内容字段 dq_task_content  用于存储任务内容
        if ( !$this->existTableField("dq_task_content", "content") ) {
            $sql = "ALTER TABLE `dq_task_content` ADD COLUMN `content` longtext COLLATE utf8mb4_unicode_ci COMMENT '任务内容';";
            $this->execute($sql);
        }
    }
}