<?php


namespace app\command;


use app\common\FastGame\Base\JsTask as Js;
use app\common\lib\ActiveReport;
use app\common\Utils;
use think\console\Command;
use think\console\Input;
use think\console\Output;

class UserReport extends Command
{
    protected function configure()
    {
        // 指令配置
        $this->setName('UserReport')
            ->setDescription('用户报表测试服-每五分钟');
    }

    protected function execute(Input $input, Output $output)
    {
        $output->writeln("------------------countUserBets--------------------");
        Js::countUserBets();
        $output->writeln("------------------countStatGlobal--------------------");
        Js::countStatGlobal();
        $output->writeln("------------------countActiveReport--------------------");
        ActiveReport::runtask();
    }
}
