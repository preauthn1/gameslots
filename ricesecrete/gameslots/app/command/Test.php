<?php
declare (strict_types = 1);
namespace app\command;

use app\api\factory\SignFactory;
use app\common\FastGame\Base\Http;
use app\common\FastGame\Base\Params;
use app\common\FastGame\Base\Utils;
use app\common\FastGame\Third_ogs;
use app\common\lib\ActiveReport;
use app\common\model\ThirdCostLogsModel;
use app\common\service\BetService;
use app\model\Games;
use app\common\lib\ReportExport;
use app\common\lib\Util;
use app\common\model\ExportReportsModel;
use app\common\model\PaySetModel;
use app\common\model\UserModel;
use app\common\model\UserOfflineModel;
use app\common\payment\Entry;
use app\common\service\MemberService;
use app\manage\factory\GameBetsFactory;
use think\console\Command;
use think\console\Input;
use think\console\Output;
use think\console\input\Argument;
use think\console\input\Option;
use app\api\redis\ApiRedis;
use think\facade\Queue;
use think\facade\Log;

class Test extends Command {

    protected function configure() {
        $this->setName('test')->setDescription('专用测试命令，用于开发调试');
    }

    protected function execute(Input $input, Output $output) {
        $start = strtotime("2025-02-10 23:58:00");
        $endtime = time();
        //防止时间区间跨天
        if (date("Y-m-d", $start) != date("Y-m-d", $endtime)) {
            $endtime = strtotime(date("Y-m-d", $start) . " 23:59:59");
        }
        exit();
        //ActiveReport::runtask();
        /*for($i=0;$i<500;$i++) {
            ActiveReport::runtask();
        }*/
        //print_r(ActiveReport::getActiveDatas('d',20231001,20231101));*/
        /*BetService::cacheBetIdByTime();
        Utils::L('test',BetService::getGbidByTime(1706634900,1708370100,'gb_intime'));
        Utils::L('test',BetService::getGbidByTime(1006104199,1708870100,'gb_bettime'));
        Utils::L('test',BetService::getGbidByTime(1706634900,1908870099,'gb_overtime'));*/
        //Utils::L('test',ExportReportsModel::getlist());
       //ReportExport::testExportList();
        //UserBxModel::recoverBxitem(52);
//       echo MemberService::getRechargeByUid(98);
        //UserBxModel::bxPorcByRegister(68,65,1705957336);
        //UserBxModel::bxPorcByRecharge(65,200,1,1705957336);
        //print_r(UserBxModel::getDaycntByUid(65,20240122));
        //var_dump(UserBxModel::addBx(2,1,5));
        //var_dump(UserBxModel::pay(3,65));
        //var_dump(UserBxModel::getlist());
        //print_r(UserBxModel::getLogs(20240122,65));
        //UserBxModel::taskPayBx();

    }

    private function generateSign($data, $signKey)
    {
        // 移除 sign 键和空值
        $filteredData = array_filter($data, function ($v, $k) {
            return $v !== '' && $k !== 'sign';
        }, ARRAY_FILTER_USE_BOTH);

        // 按照键名 ASCII 升序排序
        ksort($filteredData);

        // 格式化参数并生成签名字符串
        $str = '';
        foreach ($filteredData as $k => $val) {
            $str .= $k . '=' . $val . '&';
        }
        $str = rtrim($str, '&'); // 去除末尾的 &

        // 使用 hash_hmac 生成签名
        return base64_encode(hash_hmac("sha1", $str, $signKey, true));
    }

}
