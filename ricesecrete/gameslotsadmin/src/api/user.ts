import { http } from "@/utils/http";
import { getQueryParams } from "@/utils/global";

export type UserResult = {
  success: any,
  // success: boolean;
  code: number,
  data: {
    /** 用户名 */
    username: string,
    /** 当前登陆用户的角色 */
    roles: Array<string>,
    /** `token` */
    accessToken: string,
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string,
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date,
    token: string,
    token_key: string
  }
};
export type WsResult = {
  success: any,
  // success: boolean;
  code: number,
  data: {
    token: string,
    WebSocket: string,
    uid: string
  }
};

export type RefreshTokenResult = {
  success: boolean,
  data: {
    /** `token` */
    accessToken: string,
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string,
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date
  }
};

//公共返回的接口类型

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login/login", { data });
};

export const getWsToken = (data?: object) => {
  return http.request<WsResult>("post", "/getWsToken", { data });
};
export const bindUid = (data?: object) => {
  return http.request<WsResult>("post", "/bindUid", { data });
};
/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refreshToken", { data });
};
/*会员列表*/
export const userList = (data?: object) => {
  return http.request("post", "/user/list", { data });
};

/*国家列表*/
export const nationList = (data?: object) => {
  return http.request("post", "/nation/index", { data });
};
export const nationEdit = (data?: object) => {
  return http.request("post", "/nation/edit", { data });
};
export const nationAdd = (data?: object) => {
  return http.request("post", "/nation/add", { data });
};
export const nationDelete = (data?: object) => {
  return http.request("post", "/nation/delete", { data });
};
export const nationStateEdit = (data?: object) => {
  return http.request("post", "/nation/state_edit", { data });
};
/*语言种类*/
export const languageIndex = (data?: object) => {
  return http.request("post", "/language/index", { data });
};
export const languageEdit = (data?: object) => {
  return http.request("post", "/language/edit", { data });
};
export const languageAdd = (data?: object) => {
  return http.request("post", "/language/add", { data });
};
export const languageDelete = (data?: object) => {
  return http.request("post", "/language/delete", { data });
};
export const languageSetSatus = (data?: object) => {
  return http.request("post", "/language/setstatus", { data });
};
export const languageUpdate = (data?: object) => {
  return http.request("post", "/Language/update", { data });
};

/*语言种类*/
export const languageItems = (data?: object) => {
  return http.request("post", "/language/items", { data });
};
export const languageTransltion = (data?: object) => {
  return http.request("post", "/language/translation", { data });
};
export const languageDelitem = (data?: object) => {
  return http.request("post", "/language/delitem", { data });
};
export const languageEidtitem = (data?: object) => {
  return http.request("post", "/language/edititem", { data });
};

export const addlanguageitem = (data?: object) => {
  return http.request("post", "/login/languageitem", { data });
};
export const languageImport = (data?: object) => {
  return http.request("post", "/language/import", { data }, { timeout: 60000 });
};
export const languageExcel = (data?: object) => {
  return http.request("post", "/language/excel", { data }, { timeout: 60000 });
};

/*榜单设定*/
export const bangdanList = (data?: object) => {
  return http.request("post", "/bangdan/list", { data });
};
export const bangdanEidt = (data?: object) => {
  return http.request("post", "/bangdan/edit", { data });
};
export const bangdanDelete = (data?: object) => {
  return http.request("post", "/bangdan/delete", { data });
};
export const bangdanAdd = (data?: object) => {
  return http.request("post", "/bangdan/add", { data });
};

/*榜单设定*/
export const falseAccoutList = (data?: object) => {
  return http.request("post", "/false_accout/list", { data });
};
export const falseAccoutEdit = (data?: object) => {
  return http.request("post", "/false_accout/edit", { data });
};
export const falseAccoutDelete = (data?: object) => {
  return http.request("post", "/false_accout/delete", { data });
};
export const falseAccoutAdd = (data?: object) => {
  return http.request("post", "/false_accout/add", { data });
};
export const falseAccoutStatusEdit = (data?: object) => {
  return http.request("post", "/false_accout/status_edit", { data });
};

/*管理员列表*/
export const adminList = (data?: object) => {
  return http.request("post", "/admin/lists", { data });
};
export const adminDelete = (data?: object) => {
  return http.request("post", "/admin/delete", { data });
};
export const adminAdd = (data?: object) => {
  return http.request("post", "/admin/add", { data });
};
export const adminEdit = (data?: object) => {
  return http.request("post", "/admin/edit", { data });
};
export const adminStatusEdit = (data?: object) => {
  return http.request("post", "/admin/status_edit", { data });
};
export const adminRand_char = (data?: object) => {
  return http.request("post", "/admin/rand_char", { data });
};

/*角色管理*/
export const adminRoleList = (data?: object) => {
  return http.request("post", "/admin_role/list", { data });
};
/*操作记录*/
export const adminLogList = (data?: object) => {
  return http.request("post", "/admin_log/list", { data });
};
export const userAdminLogList = (data?: object) => {
  return http.request("post", "/user_admin_log/list", { data });
};
/*三方登陆管理*/
export const thirdSetList = (data?: object) => {
  return http.request("post", "/third_set/list", { data });
};
export const thirdEidt = (data?: object) => {
  return http.request("post", "/third_set/edit", { data });
};
export const thirdAdd = (data?: object) => {
  return http.request("post", "/third_set/add", { data });
};

//三方日志
export const thirdLogLists = (data?: object) => {
  return http.request("post", "/third_log/lists", { data });
};
export const thirdLogEdit = (data?: object) => {
  return http.request("post", "/third_log/roll", { data });
};

/*三方登陆管理*/
export const ipLimitList = (data?: object) => {
  return http.request("post", "/ip_limit/list", { data });
};
export const ipLimitAdd = (data?: object) => {
  return http.request("post", "/ip_limit/add", { data });
};
export const ipLimitEdit = (data?: object) => {
  return http.request("post", "/ip_limit/edit", { data });
};
export const ipLimitDelete = (data?: object) => {
  return http.request("post", "/ip_limit/delete", { data });
};
/*三方登陆管理*/
export const bannerList = (data?: object) => {
  return http.request("post", "/banner/list", { data });
};
/*公告管理*/
export const gonggaoList = (data?: object) => {
  return http.request("post", "/gonggao/list", { data });
};
export const gonggaoEdit = (data?: object) => {
  return http.request("post", "/gonggao/edit", { data });
};
export const gonggaoStatusEdit = (data?: object) => {
  return http.request("post", "/gonggao/status_edit", { data });
};
export const gonggaoAdd = (data?: object) => {
  return http.request("post", "/gonggao/add", { data });
};
export const gonggaoDelete = (data?: object) => {
  return http.request("post", "/gonggao/delete", { data });
};

/*公告类型*/
export const gonggaoTypeList = (data?: object) => {
  return http.request("post", "/gonggaoType/list", { data });
};
export const gonggaoTypeEdit = (data?: object) => {
  return http.request("post", "/gonggaoType/edit", { data });
};
export const gonggaoTypeAdd = (data?: object) => {
  return http.request("post", "/gonggaoType/add", { data });
};
export const gonggaoTypeDelete = (data?: object) => {
  return http.request("post", "/gonggaoType/delete", { data });
};
/*基础问答*/
export const newsList = (data?: object) => {
  return http.request("post", "/news/lists", { data });
};
/*客服管理*/
export const serviceList = (data?: object) => {
  return http.request("post", "/service/list", { data });
};
export const serviceEidt = (data?: object) => {
  return http.request("post", "/service/edit", { data });
};
export const serviceDelete = (data?: object) => {
  return http.request("post", "/service/delete", { data });
};
export const serviceAdd = (data?: object) => {
  return http.request("post", "/service/add", { data });
};
export const serviceStatusEidt = (data?: object) => {
  return http.request("post", "/service/status_edit", { data });
};

/*客服管理*/
export const ruleList = (data?: object) => {
  return http.request("post", "/rule/lists", { data });
};
export const ruleEdit = (data?: object) => {
  return http.request("post", "/rule/edit", { data });
};
export const ruleAdd = (data?: object) => {
  return http.request("post", "/rule/add", { data });
};
export const ruleDelete = (data?: object) => {
  return http.request("post", "/rule/delete", { data });
};

/*首页规则管理*/
export const ruleIndexList = (data?: object) => {
  return http.request("post", "/rule_index/lists", { data });
};
export const ruleIndexEdit = (data?: object) => {
  return http.request("post", "/rule_index/edit", { data });
};
export const ruleIndexAdd = (data?: object) => {
  return http.request("post", "/rule_index/add", { data });
};
export const ruleIndexDelete = (data?: object) => {
  return http.request("post", "/rule_index/delete", { data });
};

/*客服管理*/
export const usermsgList = (data?: object) => {
  return http.request("post", "/usermsg/list", { data });
};
export const usermsgAdd = (data?: object) => {
  return http.request("post", "/usermsg/add", { data });
};
export const usermsgEdit = (data?: object) => {
  return http.request("post", "/usermsg/edit", { data });
};
export const usermsgDelete = (data?: object) => {
  return http.request("post", "/usermsg/delete", { data });
};

/*反馈管理*/
export const feedbackList = (data?: object) => {
  return http.request("post", "/feedback/list", { data });
};
/*反馈管理*/
export const bankSkList = (data?: object) => {
  return http.request("post", "/bank_sk/list", { data });
};

export const bankSkEdit = (data?: object) => {
  return http.request("post", "/bank_sk/edit", { data });
};
export const bankSkAdd = (data?: object) => {
  return http.request("post", "/bank_sk/add", { data });
};
export const bankSkDelete = (data?: object) => {
  return http.request("post", "/bank_sk/delete", { data });
};
export const bankSkBankSkSet = (data?: object) => {
  return http.request("post", "/bank_sk/bank_sk_set", { data });
};

/*反馈管理*/

/*支付方式图标管理*/
export const paymentTypeList = (data?: object) => {
  return http.request("post", "/payment_type/list", { data });
};
export const paymentTypeEdit = (data?: object) => {
  return http.request("post", "/payment_type/edit", { data });
};
export const paymentTypeAdd = (data?: object) => {
  return http.request("post", "/payment_type/add", { data });
};
export const paymentTypeDelete = (data?: object) => {
  return http.request("post", "/payment_type/delete", { data });
};

/*支付类型管理*/
export const payTypeList = (data?: object) => {
  return http.request("post", "/pay_type/list", { data });
};
export const payTypeEdit = (data?: object) => {
  return http.request("post", "/pay_type/edit", { data });
};
export const payTypeAdd = (data?: object) => {
  return http.request("post", "/pay_type/add", { data });
};
export const payTypeDelete = (data?: object) => {
  return http.request("post", "/pay_type/delete", { data });
};

/*支付平台*/

export const paySetList = (data?: object) => {
  return http.request("post", "/pay_set/lists", { data });
};
export const paySetAdd = (data?: object) => {
  return http.request("post", "/pay_set/add", { data });
};
export const paySetEdit = (data?: object) => {
  return http.request("post", "/pay_set/edit", { data });
};
export const paySetDelete = (data?: object) => {
  return http.request("post", "/pay_set/delete", { data });
};
/*会员等级列表*/
export const userlevelList = (data?: object) => {
  return http.request("post", "/user_level/list", { data });
};
/*会员等级列表*/
export const levelRecordLists = (data?: object) => {
  return http.request("post", "/user_level_record/list", { data });
};
/*会员等级列表 编辑保存*/
export const userlevelEdit = (data?: object) => {
  return http.request("post", "/user_level/edit", { data });
};
/*会员等级列表 添加*/
export const userlevelAdd = (data?: object) => {
  return http.request("post", "/user_level/add", { data });
};

/*代理列表*/
export const agentList = (data?: object) => {
  return http.request("post", "/user_agent/list", { data });
};

export const agentSystemEdit = (data?: object) => {
  return http.request("post", "/user_agent/systemEdit", { data });
};

/*会员提现账号*/
export const userbankList = (data?: object) => {
  return http.request("post", "/user_bank/list", { data });
};
/*会员  货币接口*/
export const userbankEidt = (data?: object) => {
  return http.request("post", "/user_bank/edit", { data });
};

export const userbankDelete = (data?: object) => {
  return http.request("post", "/user_bank/delete", { data });
};
/*会员  货币接口*/
export const userbankEidtDetail = (data?: object) => {
  return http.request("post", "/user_bank/edit_detail", { data });
};

export const userloginlog = (data?: object) => {
  return http.request("post", "/user_login_log/list", { data });
};

export const useroffline = (data?: object) => {
  return http.request("post", "/user_offline/list", { data });
};
//充值按钮值
export const userofflineCount = (data?: object) => {
  return http.request("post", "/user_offline/get_count", { data });
};

//充值渠道
export const userofflinePayChannel = (data?: object) => {
  return http.request("post", "/user_offline/pay_channel", { data });
};
///user_offline/add
//充值手动添加
export const userofflineAdd = (data?: object) => {
  return http.request("post", "/user_offline/add", { data });
};
//充值删除订单
export const userofflineDelete = (data?: object) => {
  return http.request("post", "/user_offline/delete", { data });
};
//提现手动添加
export const userwithdrawalAdd = (data?: object) => {
  return http.request("post", "/user_withdrawal/add", { data });
};
//提现按钮值
export const userwithdrawalCount = (data?: object) => {
  return http.request("post", "/user_withdrawal/get_count", { data });
};
//提现审核
export const userwithdrawalEdit = (data?: object) => {
  return http.request("post", "/user_withdrawal/edit_detail", { data });
};
export const userwithdrawalEdit2 = (data?: object) => {
  return http.request("post", "/user_withdrawal/edit", { data });
};
//提现备注修改
export const userwithdrawalRemarkes = (data?: object) => {
  return http.request("post", "/user_withdrawal/set_remarks", { data });
};

/*添加用户*/
export const addUser = (data?: object) => {
  return http.request("post", "/user/add", { data });
};
/* 用户编辑页详情*/
export const editDetail = (data?: object) => {
  return http.request("post", "/user/edit_detail", { data });
};
//登录的验证码
export const loginCaptcha = (data?: object) => {
  return http.request("get", "/login/captcha", { data });
};
//编辑用户保存
export const userEdit = (data?: object) => {
  return http.request("post", "/user/edit", { data });
};
//批量修改用户状态
export const userStatus = (data?: object) => {
  return http.request("post", "/user/status", { data });
};
//用户详情
export const userDetail = (data?: object) => {
  return http.request("post", "/user/detail", { data });
};
//用户权限编辑
export const authUser = (data?: object) => {
  return http.request("post", "/user/edit_auth", { data });
};

//会员提现列表
export const userWithdrawalList = (data?: object) => {
  return http.request("post", "/user_withdrawal/list", { data });
};
// 人工调整列表
export const userArtificial = (data?: object) => {
  return http.request("post", "/artificial_balance/list", { data });
};
// 人工调整流水
export const usersetWater = (data?: object) => {
  return http.request("post", "/artificial_balance/set_water", { data });
};

// 人工调整流水
export const userArtificialAdd = (data?: object) => {
  return http.request("post", "/artificial_balance/add", { data });
};
// 人工调整导入
export const userArtificialImport = (data?: object) => {
  return http.request("post", "/artificial_balance/import", { data });
};
//联赛管理列表
export const liansaiList = (data?: object) => {
  return http.request("post", "/liansai/list", { data });
};
//联赛管理添加
export const liansaiAdd = (data?: object) => {
  return http.request("post", "/liansai/add", { data });
};
//联赛管理编辑
export const liansaiEdit = (data?: object) => {
  return http.request("post", "/liansai/edit", { data });
};

//主队
export const liansaiTeamList = (data?: object) => {
  return http.request("post", "/liansai_team/list", { data });
};
//主队表列表编辑

export const liansaiTeamEdit = (data?: object) => {
  return http.request("post", "/liansai_team/edit", { data });
};
//添加对付
export const liansaiTeamAdd = (data?: object) => {
  return http.request("post", "/liansai_team/add", { data });
};
export const teamStatusEdit = (data?: object) => {
  return http.request("post", "/liansai_team/status_edit", { data });
};

///liansai/delete
//联赛管理删除
export const liansaiDelete = (data?: object) => {
  return http.request("post", "/liansai/delete", { data });
};
//赛程管理
export const liansaiSclist = (data?: object) => {
  return http.request("post", "/liansai_sc/list", { data });
};
//赛程管理获取数据

export const liansaiEditDetail = (data?: object) => {
  return http.request("post", "/liansai_sc/edit_detail", { data });
};
//赛程管理保存
export const liansaiEditSave = (data?: object) => {
  return http.request("post", "/liansai_sc/edit", { data });
};
//赛程管理
export const liansaiSatusEdit = (data?: object) => {
  return http.request("post", "/liansai_sc/status_edit", { data });
};
//赛程管理弹框
export const liansaiBdUpdate = (data?: object) => {
  return http.request("post", "/liansai_sc/bd_update", { data });
};
//波胆
export const liansaibdSet = (data?: object) => {
  return http.request("post", "/liansai_sc/bd_set", { data });
};
// //注单管理列表 /liansai_sc/list

export const getorderData = (data?: object) => {
  return http.request("post", "/liansai_zhudan/get_order_data", { data });
};
export const liansaiZhudanEidt = data => {
  return http.request("post", "/liansai_zhudan/edit", { data });
  // return http.request("get", "/liansai_zhudan/edit_detail?select=true&id=" + data.sc_id + '&page=' + data.page + '&limit=' + data.limit);
};
export const liansaiZhudanStatusEidt = (data?: object) => {
  return http.request("post", "/liansai_zhudan/status_edit", { data });
};
export const liansaiScResList = (data?: object) => {
  return http.request("post", "/liansai_sc_res/lists", { data });
};
export const liansaiScJiesuan = (data?: object) => {
  return http.request("post", "/liansai_sc_res/jiesuan", { data });
};
///
export const liansaiOrderback = (data?: object) => {
  return http.request("post", "/liansai_sc_res/order_back", { data });
};
//第三方游戏分类
export const gamesetType = (data?: object) => {
  return http.request("post", "/game_set/type", { data });
};
//游戏平台列表
export const gameThird = (data?: object) => {
  return http.request("post", "/game/third", { data });
};
//游戏平台列表
export const gameThirdWeb = (data?: object) => {
  return http.request("post", "/game/third_web", { data });
};
//游戏管理列表
export const gameLists = (data?: object) => {
  return http.request("post", "/game/lists", { data });
};
//游戏记录列表
export const gamebetList = (data?: object) => {
  return http.request("post", "/game_bets/lists", { data });
};
//返佣设置列表
export const gameAgentList = (data?: object) => {
  return http.request("post", "/game_agent/set", { data });
};
//游戏报表
export const gameReport = (data?: object) => {
  return http.request("post", "/game/report", { data });
};
//批量游戏状态修改
export const gameSwitchGame = (data?: object) => {
  return http.request("post", "/game/switch_game", { data });
};

//权限规则列表
export const adminNodelist = (data?: object) => {
  return http.request("post", "/admin_node/list", { data });
};
export const adminGetdata = (data?: object) => {
  return http.request("post", "/admin_node/get_data", { data });
};
export const adminRoleEdit = (data?: object) => {
  return http.request("post", "/admin_role/edit", { data });
};
export const adminRoleAdd = (data?: object) => {
  return http.request("post", "/admin_role/add", { data });
};
export const adminRoleDelete = (data?: object) => {
  return http.request("post", "/admin_role/delete", { data });
};
export const adminNodeEidt = (data?: object) => {
  return http.request("post", "/admin_node/edit", { data });
};
export const adminNodeAdd = (data?: object) => {
  return http.request("post", "/admin_node/add", { data });
};

export const adminSetSort = (data?: object) => {
  return http.request("post", "/admin_node/setSort", { data });
};
export const adminNodeDelete = (data?: object) => {
  return http.request("post", "/admin_node/delete", { data });
};
//代理返佣列表
export const gameAgentReport = (data?: object) => {
  return http.request("post", "/game_agent/report", { data });
};

//返水管理列表
export const gameBack = (data?: object) => {
  return http.request("post", "/game/back", { data });
};
//用户日报表列表
export const gameUserReport = (data?: object) => {
  return http.request("post", "/game/user_report", { data });
};
//优惠管理列表
export const actionlist = (data?: object) => {
  return http.request("post", "/action/list", { data });
};
//优惠申请列表
export const actionApplyList = (data?: object) => {
  return http.request("post", "/action_apply/list", { data });
};
//抽奖配置
export const lotteryConfigFind = (data?: object) => {
  return http.request("post", "/action/lottery_config_find", { data });
};
export const lotteryConfig = (data?: object) => {
  return http.request("post", "/action/lottery_config", { data });
};

//转盘列表
export const lotteryConfigList = (data?: object) => {
  return http.request("post", "/lotteryConfig/lists", { data });
};
export const lotteryConfigAdd = (data?: object) => {
  return http.request("post", "/lotteryConfig/add?add=true", { data });
};
export const lotteryConfigEdit = (data?: object) => {
  return http.request("post", "/lotteryConfig/edit", { data });
};
export const lotteryConfigDelete = (data?: object) => {
  return http.request("post", "/lotteryConfig/delete", { data });
};
export const lotteryConfigConditionRecord = (data?: object) => {
  return http.request("post", "/lotteryConfig/conditionRecord", { data });
};

//转盘介绍设置
export const lotteryNewsLists = (data?: object) => {
  return http.request("post", "/lotteryNews/lists", { data });
};
export const lotteryNewsEdit = (data?: object) => {
  return http.request("post", "/lotteryNews/edit", { data });
};
export const lotteryNewsAdd = (data?: object) => {
  return http.request("post", "/lotteryNews/add", { data });
};
export const lotteryNewsDelete = (data?: object) => {
  return http.request("post", "/lotteryNews/delete", { data });
};

//奖品列表
export const lotteryPrize = (data?: object) => {
  return http.request("post", "/action/lottery_prize", { data });
};
//奖品列表
export const lotteryRecord = (data?: object) => {
  return http.request("post", "/action/lottery_record", { data });
};
//积分记录列表
export const integralRecord = (data?: object) => {
  return http.request("post", "/action/integral_record", { data });
};
export const integralSave = (data?: object) => {
  return http.request("post", "/action/integral_save", { data });
};
//抽奖报表列表
export const integralDataRecord = (data?: object) => {
  return http.request("post", "/action/lottery_data_record", { data });
};
//会员列表中的 启用
export const statusEdit = (data?: object) => {
  return http.request("post", "/user/edit", { data });
};
//会员列表中 的 修改上级
export const userRecedit = (data?: object) => {
  return http.request("post", "/user/rec_edit", { data });
};
export const userVipEdit = (data?: object) => {
  return http.request("post", "/user/vip_edit", { data });
};
export const resetVip = (data?: object) => {
  return http.request("post", "/user/vip_reset", { data });
};
///user_agent/status_edit
//会员列表中 的 点击失败
export const agentStatusEdit = (data?: object) => {
  return http.request("post", "/user_agent/edit", { data });
};
export const agentStatusEditDetail = (data?: object) => {
  return http.request("post", "/user_agent/edit_detail", { data });
};
//用户在线列表
export const userOnlineList = (data?: object) => {
  return http.request("post", "/user/online", { data });
};
//收益明细

export const userBalancemxList = (data: any) => {
  return http.request("get", "/user_balance_mx/list?" + getQueryParams(data));
};
//上级会员  /user/get_top_user
export const userGetTopuser = (data: any) => {
  return http.request("get", "/user/get_top_user?" + getQueryParams(data));
};
//上级会员  /user/get_top_user
export const runningWater = (data: any) => {
  return http.request("get", "/user/running_water?" + getQueryParams(data));
};
export const userWaterList = (data: any) => {
  return http.request("get", "/user/water?" + getQueryParams(data));
};
//指定流水
export const appointWater = (data: any) => {
  return http.request("get", "/user/appointWater?" + getQueryParams(data));
};
//会员列表 弹出 资金明细  /fund/mx_list
export const fundMxList = (data: any) => {
  return http.request("get", "/fund/mx_list?" + getQueryParams(data));
};

//代理返佣总额count
export const agentListCount = (data?: object) => {
  return http.request("post", "/agent_rakeback/list_count", { data });
};
//代理返佣列表
export const agentRakeBack = (data?: object) => {
  return http.request("post", "/agent_rakeback/list", { data });
};

//人工返佣
export const artificialList = (data?: object) => {
  return http.request("post", "/artificial_balance/list", { data });
};
//点击批量下注限制

export const userLimit = (data?: object) => {
  return http.request("post", "/user/set_limit", { data });
};
//测试用户列表
export const userCsuser = (data?: object) => {
  return http.request("post", "/user/cs_user", { data });
};
//测试用户列表 删除
export const userCsDelete = (data?: object) => {
  return http.request("post", "/user/cs_user_delete", { data });
};
//批量清零流水
export const userRemoveWater = (data?: object) => {
  return http.request("post", "/user/remove_water", { data });
};
//代理列表 资料接口
export const userBase = (data?: object) => {
  return http.request("post", "/user/base", { data });
};
//充值记录详情
export const userOfflineDetail = (data?: object) => {
  return http.request("post", "/user_offline/edit_detail", { data });
};
//充值审核
export const userOfflineEdit = (data?: object) => {
  return http.request("post", "/user_offline/edit", { data });
};
//充值备注
export const userOfflineRemarkes = (data?: object) => {
  return http.request("post", "/user_offline/set_remarks", { data });
};

//上传图片
export const uploadImgApi = (data?: object) => {
  return http.request("post", "/upload/upload_img", { data });
};

//

export const gameAgentEidt = (data?: object) => {
  return http.request("post", "/game_agent/set_edit", { data });
};
export const gameAgentSend = (data?: object) => {
  return http.request("post", "/game_agent/send", { data });
};
export const gameAgentRefused = (data?: object) => {
  return http.request("post", "/game_agent/refused", { data });
};

export const gameRefused = (data?: object) => {
  return http.request("post", "/game/refused", { data });
};
export const gameSend = (data?: object) => {
  return http.request("post", "/game/send", { data });
};
export const gameAllRefused = (data?: object) => {
  return http.request("post", "/game/all_refused", { data });
};
export const gameAllSend = (data?: object) => {
  return http.request("post", "/game/all_send", { data });
};
export const actionApplyps = (data?: object) => {
  return http.request("post", "/action_apply/ps", { data });
};
export const actionApplyDistribute = (data?: object) => {
  return http.request("post", "/action_apply/distribute", { data });
};
export const lotteryPrizeDelete = (data?: object) => {
  return http.request("post", "/action/lottery_prize_delete", { data });
};
export const lotteryFakercode = (data?: object) => {
  return http.request("post", "/action/lottery_fakerecord", { data });
};
export const gameTypeSetEdit = (data?: object) => {
  return http.request("post", "/game_set/type_edit", { data });
};
export const gameTypeAdd = (data?: object) => {
  return http.request("post", "/game_set/type_add", { data });
};
export const gameConfigList = (data?: object) => {
  return http.request("post", "/game_set/backconfig_list", { data });
};
export const backconfigEidt = (data?: object) => {
  return http.request("post", "/game_set/backconfig_edit", { data });
};
export const backconfigAdd = (data?: object) => {
  return http.request("post", "/game_set/backconfig_add", { data });
};
export const backconfigDelete = (data?: object) => {
  return http.request("post", "/game_set/backconfig_delete", { data });
};
export const gamesetTypeDelete = (data?: object) => {
  return http.request("post", "/game_set/type_delete", { data });
};

export const gameThireEdit = (data?: object) => {
  return http.request("post", "/game/third_edit", { data });
};
export const gameThireAdd = (data?: object) => {
  return http.request("post", "/game/third_add", { data });
};

export const gameThireWebEdit = (data?: object) => {
  return http.request("post", "/game/third_edit_web", { data });
};
export const gameThireWebAdd = (data?: object) => {
  return http.request("post", "/game/third_add_web", { data });
};

export const gameThireWebDelete = (data?: object) => {
  return http.request("post", "/game/third_del_web", { data });
};

export const gameEdit = (data?: object) => {
  return http.request("post", "/game/edit", { data });
};

export const gameAgentsetAdd = (data?: object) => {
  return http.request("post", "/game_agent/set_add", { data });
};
export const actionEdit = (data?: object) => {
  return http.request("post", "/action/edit", { data });
};
export const newsLists = (data?: object) => {
  return http.request("post", "/news/lists", { data });
};
export const actionAdd = (data?: object) => {
  return http.request("post", "/action/add", { data });
};
export const actionDelete = (data?: object) => {
  return http.request("post", "/action/delete", { data });
};

export const newsEdit = (data?: object) => {
  return http.request("post", "/news/edit", { data });
};
export const newsAdd = (data?: object) => {
  return http.request("post", "/news/add", { data });
};
export const newsDelete = (data?: object) => {
  return http.request("post", "/news/delete", { data });
};
export const lotteryPrizeSave = (data?: object) => {
  return http.request("post", "/action/lottery_prize_save", { data });
};
export const bannerEdit = (data?: object) => {
  return http.request("post", "/banner/edit", { data });
};
export const bannerAdd = (data?: object) => {
  return http.request("post", "/banner/add", { data });
};
export const bannerDelete = (data?: object) => {
  return http.request("post", "/banner/delete", { data });
};
export const bannerStatusEdit = (data?: object) => {
  return http.request("post", "/banner/status_edit", { data });
};
export const agentReportIndex = (data?: object) => {
  return http.request("post", "/agent_report/index", { data });
};
export const reportManage = (data?: object) => {
  return http.request("post", "/report/getData", { data });
};
export const reportClearCache = (data?: object) => {
  return http.request("post", "/report/clear_cache", { data });
};
export const reportAgentManage = (data?: object) => {
  return http.request("post", "/reportAgent/getData", { data });
};
export const reportAgentClearCache = (data?: object) => {
  return http.request("post", "/reportAgent/clear_cache", { data });
};
export const reportClearCache1 = (data?: object) => {
  return http.request("post", "/report/clear_cache1", { data });
};
export const userManage = (data?: object) => {
  return http.request("post", "/report/user", { data });
};
export const offlineManage = (data?: object) => {
  return http.request("post", "/user_offline/leaderboard", { data });
};
export const withdrawalManage = (data?: object) => {
  return http.request("post", "/user_withdrawal/leaderboard", { data });
};
export const paysetcountList = (data?: object) => {
  return http.request("post", "/pay_set/count", { data });
};
export const currencyList = (data?: object) => {
  return http.request("post", "/currency/list", { data });
};

export const currencyEdit = (data?: object) => {
  return http.request("post", "/currency/edit", { data });
};
export const currencyAdd = (data?: object) => {
  return http.request("post", "/currency/add", { data });
};
export const currencySet = (data?: object) => {
  return http.request("post", "/currency/set", { data });
};
export const payAgentLists = (data?: object) => {
  return http.request("post", "/pay_agent/lists", { data });
};
export const payAgentDelete = (data?: object) => {
  return http.request("post", "/pay_agent/delete", { data });
};
export const payAgentAdd = (data?: object) => {
  return http.request("post", "/pay_agent/add", { data });
};
export const payAgentRecord = (data?: object) => {
  return http.request("post", "/pay_agent/record", { data });
};
export const payAgentEdit = (data?: object) => {
  return http.request("post", "/pay_agent/edit", { data });
};
export const payAgentRecharge = (data?: object) => {
  return http.request("post", "/pay_agent/recharge", { data });
};
export const chartCaiWulist = (data?: object) => {
  return http.request("post", "/chart_caiwu/list", { data });
};
export const systemEdit = (data?: object) => {
  return http.request("post", "/system/edit", { data });
};
export const queryData = (data?: object) => {
  return http.request("post", "/report/queryData", { data });
};
export const getMatch = (data?: object) => {
  return http.request("post", "/index/getMatch", { data });
};
export const indexCjlset = (data?: object) => {
  return http.request("post", "/index/cjl_set", { data });
};
export const indexCjlignore = (data?: object) => {
  return http.request("post", "/index/cjl_ignore", { data });
};
export const indexCanceMatch = (data?: object) => {
  return http.request("post", "/index/cancel_match", { data });
};
export const systemUpdlist = (data?: object) => {
  return http.request("post", "/system/upd_list", { data });
};
export const systemUpdAdd = (data?: object) => {
  return http.request("post", "/system/upd_add", { data });
};
export const systemUpdEditStatus = (data?: object) => {
  return http.request("post", "/system/upd_edit_status", { data });
};
export const overtimeMatch = (data?: object) => {
  return http.request("post", "/index/overtime_match", { data });
};
export const cancelGame = (data?: object) => {
  return http.request("post", "/index/cancelgame", { data });
};
export const indexWork = (data?: object) => {
  return http.request("post", "/index/work", { data });
};
export const angentRakeList = (data?: object) => {
  return http.request("post", "/agent_rakeback/list", { data });
};
export const angentDistribute = (data?: object) => {
  return http.request("post", "/agent_rakeback/distribute", { data });
};
export const angentRefused = (data?: object) => {
  return http.request("post", "/agent_rakeback/refused", { data });
};
export const angentListCount = (data?: object) => {
  return http.request("post", "/agent_rakeback/list_count", { data });
};

export const agentReject = (data?: object) => {
  return http.request("post", "/agent/reject", { data });
};
export const agentSell = (data?: object) => {
  return http.request("post", "/agent_rakeback/sell", { data });
};
export const agentSelllogList = (data?: object) => {
  return http.request("post", "/agent_selllog/list", { data });
};
export const agentReportUser = (data?: object) => {
  return http.request("post", "/agent_report/user", { data });
};
export const agentReportLists = (data?: object) => {
  return http.request("post", "/agent_list/lists", { data });
};
export const agentSettingList = (data?: object) => {
  return http.request("post", "/agent_setting/list", { data });
};
export const agentSettingEdit = (data?: object) => {
  return http.request("post", "/agent_setting/edit", { data });
};
export const agentSettingAdd = (data?: object) => {
  return http.request("post", "/agent_setting/add", { data });
};
export const agentSettingDelete = (data?: object) => {
  return http.request("post", "/agent_setting/delete", { data });
};

export const journalismList = (data?: object) => {
  return http.request("post", "/journalism/list?select=true", { data });
};

export const journalismAdd = (data?: object) => {
  return http.request("post", "/journalism/add?add=true", { data });
};
export const journalismEdit = (data?: object) => {
  return http.request("post", "/journalism/edit", { data });
};
export const journalismDelete = (data?: object) => {
  return http.request("post", "/journalism/delete", { data });
};

export const journalismTypeList = (data?: object) => {
  return http.request("post", "/journalism/type?select=true", { data });
};

export const journalismTypeAdd = (data?: object) => {
  return http.request("post", "/journalism/type_add?add=true", { data });
};
export const journalismTypeEdit = (data?: object) => {
  return http.request("post", "/journalism/type_edit", { data });
};
export const journalismTypeDelete = (data?: object) => {
  return http.request("post", "/journalism/type_delete", { data });
};

export const smsList = (data?: object) => {
  return http.request("post", "/sms/list?select=true", { data });
};

export const smsAdd = (data?: object) => {
  return http.request("post", "/sms/add?add=true", { data });
};
export const smsEdit = (data?: object) => {
  return http.request("post", "/sms/edit", { data });
};
export const smsDelete = (data?: object) => {
  return http.request("post", "/sms/delete", { data });
};

//邮箱配置
export const emailList = (data?: object) => {
  return http.request("post", "/emailConfigs/list?select=true", { data });
};
export const emailAdd = (data?: object) => {
  return http.request("post", "/emailConfigs/add?add=true", { data });
};
export const emailEdit = (data?: object) => {
  return http.request("post", "/emailConfigs/edit", { data });
};
export const emailDelete = (data?: object) => {
  return http.request("post", "/emailConfigs/delete", { data });
};

//链接管理
export const urlList = (data?: object) => {
  return http.request("post", "/url/lists", { data });
};

export const urlAdd = (data?: object) => {
  return http.request("post", "/url/add?add=true", { data });
};
export const urlEdit = (data?: object) => {
  return http.request("post", "/url/edit", { data });
};
export const urlDelete = (data?: object) => {
  return http.request("post", "/url/delete", { data });
};

//音乐管理
export const musicList = (data?: object) => {
  return http.request("post", "/music/lists", { data });
};

export const musicAdd = (data?: object) => {
  return http.request("post", "/music/add?add=true", { data });
};
export const musicEdit = (data?: object) => {
  return http.request("post", "/music/edit", { data });
};
export const musicDelete = (data?: object) => {
  return http.request("post", "/music/delete", { data });
};

//活动类型管理
export const actionTypeList = (data?: object) => {
  return http.request("post", "/action_type/lists", { data });
};

export const actionTypeAdd = (data?: object) => {
  return http.request("post", "/action_type/add?add=true", { data });
};
export const actionTypeEdit = (data?: object) => {
  return http.request("post", "/action_type/edit", { data });
};
export const actionTypeDelete = (data?: object) => {
  return http.request("post", "/action_type/delete", { data });
};

//镜像站点管理
export const mirrorSiteList = (data?: object) => {
  return http.request("post", "/mirror_site/lists", { data });
};

export const mirrorSiteAdd = (data?: object) => {
  return http.request("post", "/mirror_site/add?add=true", { data });
};
export const mirrorSiteEdit = (data?: object) => {
  return http.request("post", "/mirror_site/edit", { data });
};
export const mirrorSiteDelete = (data?: object) => {
  return http.request("post", "/mirror_site/delete", { data });
};

//任务管理
export const taskList = (data?: object) => {
  return http.request("post", "/task/lists", { data });
};

export const taskAdd = (data?: object) => {
  return http.request("post", "/task/add?add=true", { data });
};
export const taskEdit = (data?: object) => {
  return http.request("post", "/task/edit", { data });
};
export const taskDelete = (data?: object) => {
  return http.request("post", "/task/delete", { data });
};
//任务内容
export const taskContentLists = (data?: object) => {
  return http.request("post", "/task_content/lists", { data });
};
export const taskContentAdd = (data?: object) => {
  return http.request("post", "/task_content/add?add=true", { data });
};
export const taskContentEdit = (data?: object) => {
  return http.request("post", "/task_content/edit", { data });
};
export const taskContentDelete = (data?: object) => {
  return http.request("post", "/task_content/delete", { data });
};
//领取记录
export const taskRecordLists = (data?: object) => {
  return http.request("post", "/task_record/lists", { data });
};
//任务类型
export const taskTypeList = (data?: object) => {
  return http.request("post", "/task_Type/lists", { data });
};
export const taskTypeAdd = (data?: object) => {
  return http.request("post", "/task_Type/add?add=true", { data });
};
export const taskTypeEdit = (data?: object) => {
  return http.request("post", "/task_Type/edit", { data });
};
export const taskTypeDelete = (data?: object) => {
  return http.request("post", "/task_Type/delete", { data });
};
//阶段任务领取记录
export const taskStageRecordLists = (data?: object) => {
  return http.request("post", "/task_stage_record/lists", { data });
};
//阶段任务
export const taskStageList = (data?: object) => {
  return http.request("post", "/task_stage/lists", { data });
};
export const taskStageAdd = (data?: object) => {
  return http.request("post", "/task_stage/add?add=true", { data });
};
export const taskStageEdit = (data?: object) => {
  return http.request("post", "/task_stage/edit", { data });
};
export const taskStageDelete = (data?: object) => {
  return http.request("post", "/task_stage/delete", { data });
};
export const taskStageMode = (data?: object) => {
  return http.request("post", "/task_stage/mode", { data });
};
//阶段任务类型
export const taskStageTypeList = (data?: object) => {
  return http.request("get", "/task_stage_type/lists", { data });
};
export const taskStageTypeAdd = (data?: object) => {
  return http.request("post", "/task_stage_type/add", { data });
};
export const taskStageTypeEdit = (data?: object) => {
  return http.request("post", "/task_stage_type/edit", { data });
};
export const taskStageTypeDelete = (data?: object) => {
  return http.request("post", "/task_stage_type/delete", { data });
};
//签到管理
export const signList = (data?: object) => {
  return http.request("post", "/sign/lists", { data });
};
export const signAdd = (data?: object) => {
  return http.request("post", "/sign/add?add=true", { data });
};
export const signEdit = (data?: object) => {
  return http.request("post", "/sign/edit", { data });
};
export const signDelete = (data?: object) => {
  return http.request("post", "/sign/delete", { data });
};
//签到天数
export const signDayList = (data?: object) => {
  return http.request("post", "/sign_day/lists", { data });
};
export const signDayAdd = (data?: object) => {
  return http.request("post", "/sign_day/add?add=true", { data });
};
export const signDayEdit = (data?: object) => {
  return http.request("post", "/sign_day/edit", { data });
};
export const signDayDelete = (data?: object) => {
  return http.request("post", "/sign_day/delete", { data });
};
//签到记录
export const signRecordLists = (data?: object) => {
  return http.request("post", "/sign_record/lists", { data });
};

//签到规则管理
export const signNewsLists = (data?: object) => {
  return http.request("post", "/signNews/lists", { data });
};
export const signNewsEdit = (data?: object) => {
  return http.request("post", "/signNews/edit", { data });
};
export const signNewsAdd = (data?: object) => {
  return http.request("post", "/signNews/add", { data });
};
export const signNewsDelete = (data?: object) => {
  return http.request("post", "/signNews/delete", { data });
};

//领取码
export const receiveCodeList = (data?: object) => {
  return http.request("post", "/receive_code/lists", { data });
};
export const receiveCodeAdd = (data?: object) => {
  return http.request("post", "/receive_code/add?add=true", { data });
};
export const receiveCodeEdit = (data?: object) => {
  return http.request("post", "/receive_code/edit", { data });
};
export const receiveCodeDelete = (data?: object) => {
  return http.request("post", "/receive_code/delete", { data });
};
//领取记录
export const receiveCodeRecordList = (data?: object) => {
  return http.request("post", "/receive_code_record/lists", { data });
};

export const userReport = (data?: object) => {
  return http.request("post", "/follow/userreport", { data });
};

export const pendingfollow = (data?: object) => {
  return http.request("post", "/follow/pendingfollow", { data });
};

export const pendsave = (data?: object) => {
  return http.request("post", "/follow/save", { data });
};

export const distribute = (data?: object) => {
  return http.request("post", "/follow/distribute", { data });
};

export const distributesave = (data?: object) => {
  return http.request("post", "/follow/distributesave", { data });
};

export const reports = (data?: object) => {
  return http.request("post", "/follow/reports", { data });
};

//pdd转盘
export const pddList = (data?: object) => {
  return http.request("post", "/pdd/lists", { data });
};
export const pddAdd = (data?: object) => {
  return http.request("post", "/pdd/add?add=true", { data });
};
export const pddEdit = (data?: object) => {
  return http.request("post", "/pdd/edit", { data });
};
export const pddDelete = (data?: object) => {
  return http.request("post", "/pdd/delete", { data });
};
export const pddInviteRecord = (data?: object) => {
  return http.request("post", "/pdd/inviteRecord", { data });
};
export const pddTurntableRecord = (data?: object) => {
  return http.request("post", "/pdd/turntableRecord", { data });
};
export const pddWithdrawalRecord = (data?: object) => {
  return http.request("post", "/pdd/withdrawalRecord", { data });
};

//转盘在线任务
export const lotteryTaskList = (data?: object) => {
  return http.request("post", "/lotteryTask/lists", { data });
};
export const lotteryTaskAdd = (data?: object) => {
  return http.request("post", "/lotteryTask/add?add=true", { data });
};
export const lotteryTaskEdit = (data?: object) => {
  return http.request("post", "/lotteryTask/edit", { data });
};
export const lotteryTaskDelete = (data?: object) => {
  return http.request("post", "/lotteryTask/delete", { data });
};
//转盘在线任务记录
export const lotteryTaskRecordLists = (data?: object) => {
  return http.request("post", "/lotteryTaskrecord/lists", { data });
};

//客服链接
export const serviceUrlList = (data?: object) => {
  return http.request("post", "/serviceUrl/lists", { data });
};
export const serviceUrlAdd = (data?: object) => {
  return http.request("post", "/serviceUrl/add?add=true", { data });
};
export const serviceUrlEdit = (data?: object) => {
  return http.request("post", "/serviceUrl/edit", { data });
};
export const serviceUrlDelete = (data?: object) => {
  return http.request("post", "/serviceUrl/delete", { data });
};
export const serviceUrlStatistics = (data?: object) => {
  return http.request("post", "/serviceUrl/statistics", { data });
};

//附属机构配置
export const affiliateEdit = (data?: object) => {
  return http.request("post", "/affiliate/edit", { data });
};

//附属管理通讯平台配置
export const affiliatePlatformList = (data?: object) => {
  return http.request("post", "/affiliatePlatform/lists", { data });
};
export const affiliatePlatformAdd = (data?: object) => {
  return http.request("post", "/affiliatePlatform/add?add=true", { data });
};
export const affiliatePlatformEdit = (data?: object) => {
  return http.request("post", "/affiliatePlatform/edit", { data });
};
export const affiliatePlatformDelete = (data?: object) => {
  return http.request("post", "/affiliatePlatform/delete", { data });
};

//首页游戏排行榜
export const gameRankList = (data?: object) => {
  return http.request("post", "/gameRank/lists", { data });
};
export const gameRankAdd = (data?: object) => {
  return http.request("post", "/gameRank/add?add=true", { data });
};
export const gameRankEdit = (data?: object) => {
  return http.request("post", "/gameRank/edit", { data });
};
export const gameRankDelete = (data?: object) => {
  return http.request("post", "/gameRank/delete", { data });
};

//首页菜单规则管理
export const indexMenuList = (data?: object) => {
  return http.request("post", "/indexMenu/lists", { data });
};
export const indexMenuAdd = (data?: object) => {
  return http.request("post", "/indexMenu/add?add=true", { data });
};
export const indexMenuEdit = (data?: object) => {
  return http.request("post", "/indexMenu/edit", { data });
};
export const indexMenuDelete = (data?: object) => {
  return http.request("post", "/indexMenu/delete", { data });
};

//pdd号码
export const pddPhoneList = (data?: object) => {
  return http.request("post", "/pddPhone/lists", { data });
};
export const pddPhoneAdd = (data?: object) => {
  return http.request("post", "/pddPhone/add?add=true", { data });
};
export const pddPhoneEdit = (data?: object) => {
  return http.request("post", "/pddPhone/edit", { data });
};
export const pddPhoneDelete = (data?: object) => {
  return http.request("post", "/pddPhone/delete", { data });
};
export const pddPhoneImport = (data?: object) => {
  return http.request("post", "/pddPhone/import", { data });
};

//预测页
export const forecastList = (data?: object) => {
  return http.request("post", "/forecast/lists", { data });
};
export const forecastAdd = (data?: object) => {
  return http.request("post", "/forecast/add?add=true", { data });
};
export const forecastEdit = (data?: object) => {
  return http.request("post", "/forecast/edit", { data });
};
export const forecastDelete = (data?: object) => {
  return http.request("post", "/forecast/delete", { data });
};

//预测游戏
export const forecastGameList = (data?: object) => {
  return http.request("post", "/forecastGame/lists", { data });
};
export const forecastGameAdd = (data?: object) => {
  return http.request("post", "/forecastGame/add?add=true", { data });
};
export const forecastGameEdit = (data?: object) => {
  return http.request("post", "/forecastGame/edit", { data });
};
export const forecastGameDelete = (data?: object) => {
  return http.request("post", "/forecastGame/delete", { data });
};

//五福
export const wufuList = (data?: object) => {
  return http.request("post", "/wufu/lists", { data });
};
export const wufuAdd = (data?: object) => {
  return http.request("post", "/wufu/add?add=true", { data });
};
export const wufuEdit = (data?: object) => {
  return http.request("post", "/wufu/edit", { data });
};
export const wufuDelete = (data?: object) => {
  return http.request("post", "/wufu/delete", { data });
};
//五福卡片
export const wufuCardsList = (data?: object) => {
  return http.request("post", "/wufuCards/lists", { data });
};
export const wufuCardsAdd = (data?: object) => {
  return http.request("post", "/wufuCards/add?add=true", { data });
};
export const wufuCardsEdit = (data?: object) => {
  return http.request("post", "/wufuCards/edit", { data });
};
export const wufuCardsDelete = (data?: object) => {
  return http.request("post", "/wufuCards/delete", { data });
};

//五福内容设置
export const wufuContentLists = (data?: object) => {
  return http.request("post", "/wufuContent/lists", { data });
};
export const wufuContentEdit = (data?: object) => {
  return http.request("post", "/wufuContent/edit", { data });
};
export const wufuContentAdd = (data?: object) => {
  return http.request("post", "/wufuContent/add", { data });
};
export const wufuContentDelete = (data?: object) => {
  return http.request("post", "/wufuContent/delete", { data });
};

//卡片记录
export const cardRecordList = (data?: object) => {
  return http.request("post", "/wufuCardsRecord/lists", { data });
};

//提现记录
export const withdrawalRecordList = (data?: object) => {
  return http.request("post", "/wufuWithdrawalRecord/lists", { data });
};

//钱包配置
export const walletEdit = (data?: object) => {
  return http.request("post", "/wallet/edit", { data });
};

//广告管理
export const advertisingList = (data?: object) => {
  return http.request("post", "/advertising/lists", { data });
};
export const advertisingAdd = (data?: object) => {
  return http.request("post", "/advertising/add?add=true", { data });
};
export const advertisingEdit = (data?: object) => {
  return http.request("post", "/advertising/edit", { data });
};
export const advertisingDelete = (data?: object) => {
  return http.request("post", "/advertising/delete", { data });
};

//默认头像管理
export const defaultHeadImgList = (data?: object) => {
  return http.request("post", "/defaultHeadImg/lists", { data });
};
export const defaultHeadImgAdd = (data?: object) => {
  return http.request("post", "/defaultHeadImg/add?add=true", { data });
};
export const defaultHeadImgEdit = (data?: object) => {
  return http.request("post", "/defaultHeadImg/edit", { data });
};
export const defaultHeadImgDelete = (data?: object) => {
  return http.request("post", "/defaultHeadImg/delete", { data });
};

//火箭活动管理
export const rocketActivityList = (data?: object) => {
  return http.request("post", "/rocketActivity/lists", { data });
};
export const rocketActivityAdd = (data?: object) => {
  return http.request("post", "/rocketActivity/add?add=true", { data });
};
export const rocketActivityEdit = (data?: object) => {
  return http.request("post", "/rocketActivity/edit", { data });
};
export const rocketActivityDelete = (data?: object) => {
  return http.request("post", "/rocketActivity/delete", { data });
};

export const rocketActivityRecordList = (data?: object) => {
  return http.request("post", "/rocketActivityRecord/lists", { data });
};
export const rocketActivityBoxList = (data?: object) => {
  return http.request("post", "/rocketActivityBox/lists", { data });
};
export const rocketActivityFuelList = (data?: object) => {
  return http.request("post", "/rocketActivityFuel/lists", { data });
};
//火箭活动区间管理
export const rocketActivityLevelList = (data?: object) => {
  return http.request("post", "/rocketActivityLevel/lists", { data });
};
export const rocketActivityLevelAdd = (data?: object) => {
  return http.request("post", "/rocketActivityLevel/add?add=true", { data });
};
export const rocketActivityLevelEdit = (data?: object) => {
  return http.request("post", "/rocketActivityLevel/edit", { data });
};
export const rocketActivityLevelDelete = (data?: object) => {
  return http.request("post", "/rocketActivityLevel/delete", { data });
};

//红包活动管理
export const redPacketList = (data?: object) => {
  return http.request("post", "/redPacket/lists", { data });
};
export const redPacketAdd = (data?: object) => {
  return http.request("post", "/redPacket/add?add=true", { data });
};
export const redPacketEdit = (data?: object) => {
  return http.request("post", "/redPacket/edit", { data });
};
export const redPacketDelete = (data?: object) => {
  return http.request("post", "/redPacket/delete", { data });
};

export const redPacketAwardList = (data?: object) => {
  return http.request("post", "/redPacketAward/lists", { data });
};
export const redPacketDayList = (data?: object) => {
  return http.request("post", "/redPacketDay/lists", { data });
};
export const redPacketDayEdit = (data?: object) => {
  return http.request("post", "/redPacketDay/edit", { data });
};

//实名认证定义数据
export const userVerifyConfigList = (data?: object) => {
  return http.request("post", "/userVerifyConfig/lists", { data });
};
export const userVerifyConfigAdd = (data?: object) => {
  return http.request("post", "/userVerifyConfig/add?add=true", { data });
};
export const userVerifyConfigEdit = (data?: object) => {
  return http.request("post", "/userVerifyConfig/edit", { data });
};
export const userVerifyConfigDelete = (data?: object) => {
  return http.request("post", "/userVerifyConfig/delete", { data });
};

//实名认数据审核
export const userVerifyList = (data?: object) => {
  return http.request("post", "/userVerify/lists", { data });
};
export const userVerifyAdd = (data?: object) => {
  return http.request("post", "/userVerify/add?add=true", { data });
};
export const userVerifyEdit = (data?: object) => {
  return http.request("post", "/userVerify/edit", { data });
};
export const userVerifyDelete = (data?: object) => {
  return http.request("post", "/userVerify/delete", { data });
};

//PDD转盘介绍
export const pddNewsLists = (data?: object) => {
  return http.request("post", "/pddNews/lists", { data });
};
export const pddNewsEdit = (data?: object) => {
  return http.request("post", "/pddNews/edit", { data });
};
export const pddNewsAdd = (data?: object) => {
  return http.request("post", "/pddNews/add", { data });
};
export const pddNewsDelete = (data?: object) => {
  return http.request("post", "/pddNews/delete", { data });
};

//前端类目
export const webLangList = (data?: object) => {
  return http.request("post", "/system_lang/lists", { data });
};

export const webLangAdd = (data?: object) => {
  return http.request("post", "/system_lang/add?add=true", { data });
};
export const webLangEdit = (data?: object) => {
  return http.request("post", "/system_lang/edit", { data });
};
export const webLangDelete = (data?: object) => {
  return http.request("post", "/system_lang/delete", { data });
};
export const todoMessage = (data?: object) => {
  return http.request("post", "/index/getData", { data });
};

//导出数据清除缓存
export const exportExportClear = (data?: object) => {
  return http.request("post", "/report/get_export_reports_clear", { data });
};

//rtp
export const rtpLists = (data?: object) => {
  return http.request("post", "/game/rtpList", { data });
};
export const rtpEdit = (data?: object) => {
  return http.request("post", "/game/rtpEdit", { data });
};
export const rtpAdd = (data?: object) => {
  return http.request("post", "/game/rtpAdd", { data });
};
