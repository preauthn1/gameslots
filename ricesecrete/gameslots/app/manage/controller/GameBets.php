<?php
namespace app\manage\controller;

use app\manage\factory\GameBetsFactory;

class GameBets extends Base
{
    //列表
    public function lists(){
        $rsps = (new GameBetsFactory($this->user_id))->lists();
        return $rsps;
    }

    public function detail() {
        $gb_id = $this->request->param('gb_id/d');
        $detail_url = \app\common\FastGame\Base\Game::getBetDetail($gb_id);

        if ($detail_url) {
            return $this->success(['data' => $detail_url]);
        } else {
            return $this->success(['data' => '']);
        }
    }

}