<?php

namespace app\common\upgrade\version;
use app\common\upgrade\version\VersionBase;

class Ver10 extends VersionBase {
    
    public function run() {
        // 版本升级自动执行代码
        
        if(!$this->existTableField("dq_user", "head_img")){
            $sql = "ALTER TABLE `dq_user` MODIFY COLUMN `head_img`  varchar(1024) CHARACTER "
                ." SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '头像';";
            $this->execute($sql);
        }

    }

}
