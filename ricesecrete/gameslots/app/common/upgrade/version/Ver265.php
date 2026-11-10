<?php

namespace app\common\upgrade\version;

use think\facade\Db;

class Ver265 extends VersionBase
{

    public function run() {
        // 支付类型增加 返利字段
        if (!$this->existTableField("dq_pay_type", "cashback") ) {
            $sql = "ALTER TABLE `dq_pay_type` ADD COLUMN `cashback` decimal(10,2) DEFAULT '0.00' COMMENT '充值返利比例设置0表示不返利  此处只做显示',";
            $this->execute($sql);
        }
    }
}
