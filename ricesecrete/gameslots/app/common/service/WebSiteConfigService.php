<?php

namespace app\common\service;

use app\api\redis\ApiRedis;
use app\common\lib\TokenCheck;
use app\common\model\UserAgentConfigModel;
use app\common\model\UserModel;
use think\facade\Db;

class WebSiteConfigService{

    public static function getLangDomain($langs){
        $lang = [];
        foreach($langs as $key => $val){
            $data = [];
            $lang_file = base_path("lang") . strtolower($_SERVER['HTTP_HOST']) . '_' .strtolower($val['lang']) . ".php";
            if(file_exists($lang_file)){
                $lang[$val['lang']] = require($lang_file);
            }else{
                $lang[$val['lang']] = '';
            }
        }
        return $lang;
    }

    //获取站点配置中的logo和网站名称
    public static function getWebsiteConfigSetLang($uid = 0){
        $apiRedis=new ApiRedis();
        $domain = getOriginalDomain();
        $fieldArray = [
            'id', 'website_web_url', 'website_uid', 'website_status', 'create_time', 'update_time'
        ];

        $agentWebsiteKey = 'agent_website_key_'.$domain;
        if( $apiRedis->has($agentWebsiteKey) ){
            $agentData = $apiRedis->get($agentWebsiteKey);
        }else{
            //先从代理配置中获取
            $condition = [];
            $condition[] = ['website_status', '=', 1];
//            $condition1 = self::getWhereByDomain($domain);
            //获取代理id
            $agentId = AgentService::getAgentIdByWebSite();
            $agentData = [];
            if( $agentId ){
                $condition[] = ['website_uid', '=', $agentId];
                $agentData = UserAgentConfigModel::where($condition)->find();
                if( $agentData ){
                    $agentData = $agentData->toArray();
                    $agentData = hidden_array_data($agentData, $fieldArray);
                }
            }

            $apiRedis->set($agentWebsiteKey, $agentData, 86400 * 2);
        }

        //获取站点配置数据
        $data = SystemService::getSiteDataByUid($uid);
        $agentData = $agentData ?: [];
        $data = $data ?: [];
        //将网站信息嵌入每个语言中
        return array_replace($data, $agentData);
    }

    //根据域名获取绑定代理顶级id
    public static function getRecIdByDomain(){
        $condition = self::getWhereByDomain();
        $configDetail = UserAgentConfigModel::whereRaw($condition)->field('website_uid')->find();
        $uid = 0;
        if( $configDetail ){
            $uid = $configDetail->website_uid;
        }
        return $uid;
    }

    //根据域名获取代理配置查询条件
    private static function getWhereByDomain($domain = ''){
        if( !$domain ){
            $domain = getOriginalDomain();
        }
        //域名可能是http，也有可能是https，查询时候需要都处理
        if( strpos($domain, 'http://') !== false ){
            $domain1 = str_replace('http://', 'https://', $domain);
        }else{
            $domain1 = str_replace('https://', 'http://', $domain);
        }
        return 'find_in_set("'.$domain.'", website_web_url) or find_in_set("'.$domain1.'", website_web_url)';
    }

}