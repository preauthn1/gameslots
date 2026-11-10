<?php


namespace app\command;


use app\common\FastGame\Base\JsTaskCut as Js;
use app\common\Utils;
use think\console\Command;
use think\console\Input;
use think\console\Output;

class JsTaskCut extends Command
{
    protected function configure()
    {
        // 指令配置
        $this->setName('JsTaskCut')
            ->setDescription('测试分表任务');
    }

    protected function execute(Input $input, Output $output)
    {
        Js::cuttables();
    }
}
