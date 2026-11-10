<?php
declare (strict_types=1);

namespace app\command;

use app\common\model\UserModel;
use app\common\service\UserWithdrawalService;
use think\console\{Command, Input, Output};

/**
 * 彩金结算任务
 * 彩金流水为零后自动将彩金钱包转到余额余额钱包
 * Class CjSettleTask
 * @package app\command
 */
class CjSettleTask extends Command
{
    protected function configure()
    {
        // 指令配置
        $this->setName('cjsettletask')
            ->setDescription('Cj settle');
    }

    protected function execute(Input $input, Output $output)
    {
//        UserWithdrawalService::clearCjRecord(3383);//提现审核后清除彩金流水和彩金余额
        $user_ids = $this->updateCjUserList(1000);
//         指令输出
        $output->writeln('update user_ids:' . json_encode($user_ids));
    }

    /**
     * 更新用户 彩金钱包转余额钱包
     * @param int $limit
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    private function updateCjUserList($limit = 1000)
    {
        $map = [];
        $map[] = ['cjsavings', '=', 0];
        $map[] = ['cjbalance', '>', 0];
        $UserModel = new UserModel();
        $user_list = $UserModel->where($map)->limit($limit)->field('id,cjsavings,cjbalance')->select();
        $user_ids = [];
        foreach ($user_list as $value) {
            if ($value['cjsavings'] == 0 && $value['cjbalance'] > 0) {
                //修改余额
                $ret = UserModel::cz_balance($value['id'], floatval($value['cjbalance']), "+", true, "彩金钱包转入余额钱包", 18);
                if ($ret) {
                    UserModel::clearCjBalanceUnmet($value['id'], '彩金钱包转入余额钱包',false);
                    $user_ids[] = $value['id'];
                }
            }
        }
        return $user_ids;
    }
}
