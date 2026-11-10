<?php

namespace app\common\service;

use app\api\redis\ApiRedis;
use app\common\model\WalletSystemModel;

class WalletService{

    const WALLET_DATA_CACHE_KEY = 'get_wallet_data';

    //获取钱包数据
    public static function getWalletData($isDatabase = false){
        $apiRedis=new ApiRedis();
        $key = self::WALLET_DATA_CACHE_KEY;
        if($apiRedis->has($key) && !$isDatabase){
            return $apiRedis->get($key);
        }
        //从数据库获取
        $list = WalletSystemModel::select();
        $data = [];
        foreach ($list as $v){
            $data[$v['wallet_field']] = $v['wallet_value'];
        }
        //设置一天缓存
        $apiRedis->set($key, $data, 86400);
        return $data;
    }

}