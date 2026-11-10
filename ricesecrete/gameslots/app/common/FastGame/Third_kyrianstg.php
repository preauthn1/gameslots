<?php


namespace app\common\FastGame;


use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Third;
use app\common\FastGame\Base\ThirdTask;
use app\common\FastGame\Base\Utils;
use app\model\GameBetsTemp;
use app\model\Games;

class Third_kyrianstg extends Third
{

    /**
     * 签名
     * @param $config
     * @param $data
     * @return mixed
     * @author twt326
     * @date 2022-08-26 17:29
     */
    function MakeSign($config, &$data)
    {
        //签名步骤一：按字典序排序参数
        ksort($data);
        $string = Utils::custGetSignStr($data,false,['sign']);
        //签名步骤二：在string后加入KEY
        $string = $string . $config['trdcfg']['tc_api_signkey'];
        //签名步骤三：MD5加密
        $string = sha1($string);
        //$data['signstr']=Utils::custGetSignStr($data,false,['sign']).$config['trdcfg']['tc_api_signkey'];//TEST
        $data['sign']=$string;
        return $string;
    }

    /**验证签名
     * @param $config
     * @param $data
     * @return mixed
     * @author twt326
     * @date 2022-08-26 17:32
     */
    function CheckSign($config, $data)
    {
        // 此三方站回复数据无签名
        return true;
    }

    /**
     * 转换第三方TOKEN过期时间为本平台支持的过期时间戳，将获取到的第三方TOKEN过期时间转换为整型秒为单位的时间戳
     * @param mixed $in
     * @return int
     * @author twt326
     * @date 2022-09-13 16:32
     */
    function TokenTimestampTranser($in)
    {
        Utils::L('test',['TokenTimestampTranser',$in,time()+$in-600]);
        return time()+$in-600;
    }

    function test(){
        return 'kyrianstg CLASS';
    }

    /**
     * @inheritDoc
     */
    function transOtherKvs(&$kvs)
    {
        // TODO: Implement transOtherKvs() method.
    }

    /**
     * 获取指定时间注单的DEMO，可以参考给任何API调用去做特殊处理
     * 注意这里的方法名不能与设置中的的全大写方法名一致（因为全大写的方法会直接调用封装方法 ），即这里的方法名不能全大写
     * 特别注意：本方法在此三方平台中暂时是无效的，仅用作DEMO
     * @param $apicfgs 三方平台配置
     * @param $otherkvs 要传入的非元数据参数
     *
     */
    function getbetlist($apicfgs,$otherkvs){
        /** 外部调用方法
         * $apicfgs=Games::getConfigs(tcid,gid);
         * Third::run($apicfgs,'本函数名',$otherkvs); //注单获取的开始时间结束时间等在在otherkvs中指定
         */
        $rlt=Http::http($apicfgs,'GETBETLIST',self::$extClass,$otherkvs);
        //对获取的结果进行处理 这里只是以处理获取注单与游戏无关的情况，如果需要处理按游戏获取注单列表的任务的话，请参考 ThirdTask::runThirdTasks 方法中的$this->cfg['trdcfg']['tc_getbetlisttype']不等于all的情况
        //但事实上，核心点其实在于 Http::http方法 拿到三方返回数据之后的处理逻辑只要是正确的即可
        //如果是封装中有的方法 可以调用，比如：
        $cls=getc('ThirdTask_kyrianstg');
        if (!$cls) return false;
        /** @var ThirdTask $ttobj */
        $ttobj=new $cls();
        $ttobj->init($apicfgs['trdcfg']['tc_id'],$apicfgs['trdcfg']['tc_code']);
        $rlt = Http::http($apicfgs, 'GETBETLIST', $this, $otherkvs);
        if ($rlt) {
            //处理API配置值
            $rltKeyFieldCfg = json_decode($apicfgs['apis']['GETBETLIST']['ga_keyfield'], true);
            $bds = Utils::getDataFromArrayByStrKey($rltKeyFieldCfg['r_list']['key'], $rlt);
            //Utils::L('taskfb',['游戏列表',$bds]);
            $wds = [];
            $bds = $this->procBetDataPre($apicfgs, $bds, $rlt);
//                            Utils::L('taskfb',['处理后的游戏列表',$bds]);
            foreach ($bds as $bdk => $bdv) {
                //Utils::L('test',['处理',$bdv]);
                $bd = $this->procBetData('all', $bdv);
                //Utils::L('test',['处理结果',$bdv]);
                $bd = array_merge($bd, [
                    'gb_tcid'=>$apicfgs['trdcfg']['tc_id'],
                    'gb_intime' => time(),
                    'gb_betinfo' => json_encode($bdv)
                ]);
                //Utils::L('test',['合并结果',$bd]);
                array_push($wds, $bd);
            }
            //记录数据
            (new GameBetsTemp())->saveAll($wds);
            //处理uid为0的数据，写上UID的值（某些或全部的第三方返回的是用户名，不是用户ID）
            ThirdTask::procBetTempData($this->cfg['trdcfg']['tc_useridentify'],'tcid',$apicfgs['trdcfg']['tc_id'],0);
            $ttobj->transferBets($apicfgs['trdcfg']['tc_id'],'all');

        }
    }
}
