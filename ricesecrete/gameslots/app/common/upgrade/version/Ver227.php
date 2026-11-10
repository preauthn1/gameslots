<?php

namespace app\common\upgrade\version;

use think\facade\Db;

/**
 * 在线统计
 * Class Ver227
 * @package app\common\upgrade\version
 */
class Ver227 extends VersionBase
{

    public function run() {
        // 在线表
        if ( !$this->existTableField("dq_user_online", "uo_dt") ) {
            $sql = "ALTER TABLE `dq_user_online` ADD COLUMN `uo_dt` int(11) NOT NULL DEFAULT 0 COMMENT '日期';";
            $this->execute($sql);
            //修改uo_dt值
            $sql = "update dq_user_online set uo_dt=FROM_UNIXTIME(uo_intime,'%Y%m%d') where uo_dt = 0;";
            $this->execute($sql);
        }
        // 在线表
        if ( !$this->existTableField("dq_user_online_temp", "uot_dt") ) {
            $sql = "ALTER TABLE `dq_user_online_temp` ADD COLUMN `uot_dt` int(11) NOT NULL DEFAULT 0 COMMENT '日期';";
            $this->execute($sql);
            //修改uo_dt值
            $sql = "update dq_user_online_temp set uot_dt=FROM_UNIXTIME(uot_intime,'%Y%m%d') where uot_dt = 0;";
            $this->execute($sql);
        }
    }
}