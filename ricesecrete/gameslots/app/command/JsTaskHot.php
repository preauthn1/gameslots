<?php


namespace app\command;


use app\common\FastGame\Base\JsTask;
use app\common\FastGame\Base\JsTaskTest;
use think\console\Command;
use think\console\Input;
use think\console\Output;

class JsTaskHot extends Command
{
    protected function configure()
    {
        // 指令配置
        $this->setName('JsTaskHot')
            ->setDescription(' 热表记录迁移');
    }

    protected function execute(Input $input, Output $output)
    {
        JsTask::transHotBets();
    }
}
