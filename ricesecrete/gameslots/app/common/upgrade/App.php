<?php

namespace app\common\upgrade;
use think\facade\Cache;
use app\common\upgrade\version\VersionBase;

class App {

    /**
     * 代码版本号, 升级时请修改此版本号
     */
    const APP_VERSION = 266;
    const APP_VERSION_KEY = "fb:app_version";

    public static function upgrade() {
        $redis = Cache::store('redis');
        $cache_app_version = $redis->get(self::APP_VERSION_KEY, 0);
        $app_version = self::APP_VERSION;
        for($i = $cache_app_version; $i < $app_version; $i++) {
            $className = "\\app\\common\\upgrade\\version\\Ver{$i}";
            $app_version_key = md5($className);
            if (!class_exists($className) || $redis->has($app_version_key)  ) {
                continue;
            }
            $redis->set($app_version_key, 1, 60);
            $upgrade = new $className();
            if ($upgrade instanceof VersionBase) {
                $upgrade->run();
            }
        }
        $redis->set(self::APP_VERSION_KEY, $app_version);
    }

    public static function getVersion() {
        return self::APP_VERSION;
    }

    public static function getCacheVersion() {
        $redis = Cache::store('redis');
        $cache_app_version = $redis->get(self::APP_VERSION_KEY, 0);
        return $cache_app_version;
    }

    public static function clearCacheVersion($ver = 0) {
        $redis = Cache::store('redis');
        $redis->set(self::APP_VERSION_KEY, $ver);
    }
}
