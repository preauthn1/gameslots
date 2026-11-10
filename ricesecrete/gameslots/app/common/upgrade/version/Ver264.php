<?php

namespace app\common\upgrade\version;

use think\facade\Db;

class Ver264 extends VersionBase
{

    public function run() {
        // 注单记录表 gb_sn 字段长度修改
        if ($this->existTableField("dq_game_bets_temp", "gb_sn") ) {
            $sql = "ALTER TABLE `dq_game_bets_temp` MODIFY COLUMN `gb_sn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '投注单号或KEY' AFTER `gb_price`";
            $this->execute($sql);
        }
        if ($this->existTableField("dq_game_bets_hot", "gb_sn") ) {
            $sql = "ALTER TABLE `dq_game_bets_hot` MODIFY COLUMN `gb_sn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '投注单号或KEY' AFTER `gb_cjprice`";
            $this->execute($sql);
        }
        if ($this->existTableField("dq_game_bets", "gb_sn") ) {
            $sql = "ALTER TABLE `dq_game_bets` MODIFY COLUMN `gb_sn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '投注单号或KEY' AFTER `gb_cjprice`";
            $this->execute($sql);
        }
        if ($this->existTableField("dq_game_bets_son", "gb_sn") ) {
            $sql = "ALTER TABLE `dq_game_bets_son` MODIFY COLUMN `gb_sn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '投注单号或KEY' AFTER `gb_cjprice`";
            $this->execute($sql);
        }
    }
}
