<?php


namespace app\common\FastGame\Base;



use app\api\factory\WuFuFactory;
use app\common\model\UserCjBalanceMxModel;
use app\common\model\UserModel;
use app\model\SysSets;
use app\model\Users;
use think\Exception;
use think\facade\Db;


class User
{

    /** 明确不支持彩金的时候调用此方法，比如充值模式的三方平台的充值提现和回滚余额等操作
     * @param $uid
     * @param $money
     * @param $operation
     * @param $type
     * @param $msg
     * @param $is_mx
     * @return array|true
     * @throws \Exception
     */
    public static function accountChange_old($uid, $money, $operation, $type=1, $msg='', $is_mx = true){
        //首次游戏赠送五福卡片
//        (new WuFuFactory())->giveCardFirstGame($uid);
        return UserModel::cz_balance($uid, $money, $operation, $is_mx, $msg, $type);
    }

    /** 用户帐变（三方注单投注和结算专用），支持彩金（明确不支持彩金的时候不要使用此方法，而应使用accountChange_old，比如充值模式的三方平台的充值提现和回滚余额等操作）
     * @param $uid 用户ID
     * @param $money 变更金额（投注时为投注总额，结算时为结算赢的金额
     * @param $operation + 结算增加余额 | - 投注扣减余额
     * @param $type 变更类型 1 注单 2 会员赢
     * @param $msg 变更描述
     * @param $is_mx true 生成帐变记录， false 不生成 不影响彩金记录
     * @param $tcid 三方平台ID 如业务调用时有此值（当前处理数据中有）一定要带上
     * @param $gid 游戏ID
     * @param $gbid 注单ID  tcid gid gbid 都不提供则相当于原操作余额功能，提供值不完整则会出错，全部值都提供则执行支持彩金的功能
     * @param $betprice 投注金额（含彩金） operation=+时 betprice betcjprice必须提供（从注单信息中直接拿 gb_price gb_cjprice
     * @param $betcjprice 投注彩金金额
     * @return array|true|float  特别注意，当operation=+ 即注单结算赢时，返回值是赢的彩金金额，这个返回值是要写到gb_wincjprice中的，当operation=- 即投注扣减时返回值是彩鑫投注金额，这个返回值是要写到gb_cjprice中的，当系统设置为不支持彩金或代码中没有调用支持彩金的参数时，返回值为0
     * 另，当非注单结算增加彩金（比如活动赠送，没有Gid的时候）返回值也是0
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public static function accountChange($uid,$money,$operation,$type=1,$msg='',$is_mx=true,$tcid=null,$gid=null,$gbid=null,$betprice=null,$betcjprice=null){
        $user=UserModel::where(['id' => $uid])->field('balance, cjbalance')->find();
        if (!$user){
            throw new \Exception("FastGame调用余额参数错误-用户未找到",0);
            return;
        }
        //系统设置是否支持彩金
        $cjset=SysSets::getSetByCode("sys_cj_support");
        if ($cjset!=1){//如果不支持彩金，直接通过作废参数使流程进入直接余额操作流程
            $tcid=null;
            $gid=null;
        }else{
            //如果支持彩金钱包，没有游戏id，或者平台Id的情况下,且操作为+时，彩金钱包有余额则加到彩金
            if (($gid==null || $tcid==null) && $operation=='+'){
                if ($user->cjbalance>0){
                    UserModel::cz_cjbalance($uid,$money,$operation,$msg,0,0, 101);
                    return 0;
                }
            }
        }
        if ($tcid==null || $gid==null){
            UserModel::cz_balance($uid, $money, $operation, $is_mx, $msg, $type);
            return 0;//不支持彩金时返回0，以适应已经更改为支持彩金的代码
        }else{
            if ($tcid && $gid) {
                $cj = Game::getGamesInfoBy($tcid,$gid,'id','g_cj');
                if ($cj!==null){//拿到彩金配置
                    if ($operation=='+' && ($betprice===null || $betcjprice===null || $betprice<0 || $betcjprice<0 || $betprice<$betcjprice)){
                        throw new \Exception("FastGame调用余额参数错误-彩金支持模式下缺少参数或参数不正确",0);
                        return;
                    }

                    //$cjbalance = $user->cjbalance;
                    $balance=$user->balance;
                    if ($operation=='-'){//注单扣余额
                        if ($cj==1){//不支持彩金
                            return UserModel::cz_balance($uid, $money, $operation, $is_mx, $msg, $type);
                        }else{
                            $betprice=$money;//投注金额（包含彩金）
                            $ban=($cj==2)?0:($balance>=$betprice?$betprice:$balance);//优先现金投注额
                            $betcjprice=$betprice-$ban;//彩金投注额
                            if ($ban>0){
                                UserModel::cz_balance($uid, $ban, $operation, $is_mx, $msg, $type);//增加余额钱包
                            }
                            if ($betcjprice>0){
                                UserModel::cz_cjbalance($uid,$betcjprice,$operation,$msg,1,0, 99);
                                /*//扣减彩金钱包
                                UserModel::where(['id' => $uid])->dec("cjbalance", $betcjprice)->update();
                                //写彩金日志
                                UserCjBalanceMxModel::cz_mx($uid,$msg,$cjbalance,$betcjprice,$operation,$gbid);*/
                            }
                            return $betcjprice;
                        }
                    }else if ($operation=='+'){//注单赢了结算
                        if ($cj==1){//不支持彩金
                            return UserModel::cz_balance($uid, $money, $operation, $is_mx, $msg, $type);
                        }else{
                            $ban=($cj==2)?0:($betprice-$betcjprice);//现金投注额
                            if( $betprice != 0 ){
                                $banwin=floatval(number_format($ban/$betprice*$money,2,'.',''));//余额按比例计算
                            }else{
                                $banwin = 0;
                            }
                            $cjwin=$money-$banwin;//彩金占比
                            if ($ban>0){
                                UserModel::cz_balance($uid, $banwin, $operation, $is_mx, $msg, $type);//增加余额钱包
                            }
                            if ($cjwin>0){
                                UserModel::cz_cjbalance($uid,$cjwin,$operation,$msg,0,0, 100);
                                /*//增加彩金钱包
                                UserModel::where(['id' => $uid])->inc("cjbalance", $cjwin)->update();
                                //写彩金日志
                                UserCjBalanceMxModel::cz_mx($uid,$msg,$cjbalance,$cjwin,$operation,$gbid);*/
                            }
                            return $cjwin;
                        }
                    }else{
                        throw new \Exception("FastGame调用余额参数错误-操作类型不正确",0);
                    }
                }else{
                    throw new \Exception("FastGame调用余额参数错误-游戏信息缓存未命中",0);
                }
            }else{
                throw new \Exception("FastGame调用余额参数错误",0);
            }
        }
        return true;
    }

    /** 获取用户数据
     * @param $uid 用户ID
     * @param $username 用户名
     * @return array
     */
    public static function getUserData($uid=0, $username=''){
        if(empty($uid) && empty($username)){
            return Rlt::get(Rlt::CODE_VERIFY_ERR_NOTMATCH,'非法参数');
        }
        $where = [];
        if(!empty($uid)){
            $where['id'] = $uid;
        }

        if(!empty($username)){
            $where['username'] = $username;
        }
        $info = UserModel::where($where)->field('id,username,lebal,balance')->find();
        if ($info){
            $info=$info->toArray();
        }
        return $info;
    }


}
