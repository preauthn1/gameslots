import { http } from "@/utils/http";
import { getQueryParams } from "@/utils/global";

export type UserResult = {
  success: any,
  // success: boolean;
  code: number,
  data: {
    /** 用户名 */
    username: string,
    // /** 当前登陆用户的角色 */
    roles: Array<string>,
    // /** `token` */
    // accessToken: string;
    // /** 用于调用刷新`accessToken`的接口时所需的`token` */
    // refreshToken: string;
    // /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    // expires: Date;
    token: string,
    token_key: string,
    WebSocket: string,
    socketKey: string
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
export const languageImport = (data?: object) => {
  return http.request("post", "/language/import", { data }, { timeout: 60000 });
};
export const languageExcel = (data?: object) => {
  return http.request("post", "/language/excel", { data }, { timeout: 60000 });
};


export const addlanguageitem = (data?: object) => {
  return http.request("post", "/login/languageitem", { data });
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

/*站内信*/
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
export const userIntegralMx = (data?: object) => {
  return http.request("post", "/user_integral_mx/list", { data });
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

//编辑用户保存
export const userEditSave = (data?: object) => {
  return http.request("post", "/user/edit_user", { data });
};

//用户权限编辑
export const authUser = (data?: object) => {
  return http.request("post", "/user/auth", { data });
};


//用户详情
export const userDetail = (data?: object) => {
  return http.request("post", "/user/detail", { data });
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
///user_agent/status_edit
//会员列表中 的 点击失败
export const agentStatusEdit = (data?: object) => {
  return http.request("post", "/user_agent/edit", { data });
};
export const agentStatusEditDetail = (data?: object) => {
  return http.request("post", "/user_agent/edit_detail", { data });
};
//基金列表
export const fundList = (data?: object) => {
  return http.request("post", "/fund/list", { data });
};
//基金列表修改
export const fundEdit = (data?: object) => {
  return http.request("post", "/fund/edit", { data });
};
export const fundReturn = (data?: object) => {
  return http.request("post", "/fund/found_return", { data });
};
export const fundLive = (data?: object) => {
  return http.request("post", "/fund/add?type=live", { data });
};
//基金列表修改
export const fundAdd = (data?: object) => {
  return http.request("post", "/fund/add", { data });
};
//基金列表
export const fundOrderList = (data?: object) => {
  return http.request("post", "/fund/order_list", { data });
};
//收益明细

export const userBalancemxList = (data: any) => {
  return http.request(
    "get",
    "/user_balance_mx/list?select=true&uid=" +
      data.uid +
      "&page=" +
      data.page +
      "&limit=" +
      data.limit
  );
};
//上级会员  /user/get_top_user
export const userGetTopuser = (data: any) => {
  return http.get(
    "/user/get_top_user?id=" +
      data.id +
      "&page=" +
      data.page +
      "&limit=" +
      data.limit
  );
};
//上级会员  /user/get_top_user
export const runningWater = (data: any) => {
  return http.get(
    "/user/running_water?select=true&uid=" +
      data.uid +
      "&page=" +
      data.page +
      "&limit=" +
      data.limit +
      "&set=" +
      data.set
  );
};

export const userWaterList = (data: any) => {
  return http.request("get", "/user/water?" + getQueryParams(data));
};

//调整用户流水
export const waterUpdate = (data?: object) => {
  return http.request("post", "/user/water_update", { data });
};
//基金报表
export const fundRecord = (data: any) => {
  return http.request("post", "/fund/fund_record", { data });
};
// 基金收益明细  /fund/interest
export const fundInterest = (data: any) => {
  return http.get(
    "/fund/interest?select=true&page=" + data.page + "&limit=" + data.limit
  );
};
//会员列表 弹出 资金明细  /fund/mx_list
export const fundMxList = (data: any) => {
  return http.get(
    "/fund/mx_list?select=true&page=" +
      data.page +
      "&uid=" +
      data.uid +
      "&limit=" +
      data.limit
  );
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

//链接管理
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
