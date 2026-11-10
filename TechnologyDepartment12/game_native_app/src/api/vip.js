import request from '@/api/request'
import http from '@/utils/http.js'

// 获取等级列表
export const getLevelList = () => request.get('/api/v1/user/get_level_list')

// 领取会员奖励
export const getLevelReward = (params = {}) => request.get('/api/v1/user/get_level_reward', params)

// 获取代理列表
export const getAgentList = () => request.get('/api/v1/user/get_agent_list')

// 获取团队列表
export const getTeamList = (params = {}) => request.get('/api/v1/user/team_list', params)

// 获取团队面板
export const getTeamStatistics = (params = {}) => request.get('/api/v1/user/team_statistics', params)

// 获取团队列表
export const postWalletTransfer = (params = {}) => request.post('/api/v1/user/wallet_transfer', params)

// 会员账单列表
export const getBillList = (params = {}) => request.get('/api/v1/user/user_bill_list', { ...params, type: '2' })

// 活动管理
export const getActivityList = (params = {}) => http.get('/welfare/app/activity/list', params, { showLoading: false })

// 获取当前限时活动轮次
export const getCurrentLimitedActivity = (params = {}, options = {}) =>
  http.get('/welfare/app/limited-activity/current', params, { showLoading: false, ...options })

// 获取当前限时活动的用户进度与奖励信息
export const getLimitedActivityProgress = (params = {}, options = {}) =>
  http.get('/welfare/app/limited-activity/progress', params, { showLoading: false, ...options })

// 加入指定的限时活动轮次
export const joinLimitedActivity = (params = {}, options = {}) =>
  http.get('/welfare/app/limited-activity/join', params, { showLoading: false, ...options })

// 领取指定限时活动轮次的奖励
export const claimLimitedActivity = (params = {}, options = {}) =>
  http.get('/welfare/app/limited-activity/claim', params, { showLoading: false, ...options })

// 游戏救援金查询接口
export const getRescueFund = (params = {}, options = {}) => http.get('/welfare/app/rescue-fund/query', params, options)

// 全民反水查询接口
export const getRebate = (params = {}, options = {}) => http.get('/welfare/app/rebate/query', params, options)

// 领取救援金
export const claimRescueFund = (params = {}, options = {}) =>
  http.post('/welfare/app/claim/rescue-fund', params, options)

// 领取全民反水
export const claimRebate = (params = {}, options = {}) => http.post('/welfare/app/claim/rebate', params, options)

// 使用兑换码
export const claimRedeem = (params = {}, options = {}) => http.post('/welfare/app/redeem', params, options)

// 获取任务列表
export const getTaskList = (params = {}, options = {}) => http.get('/welfare/app/task/list', params, options)

// 任务领取
export const claimTask = (params = {}, options = {}) => http.post('/welfare/app/task/claim', params, options)

export const getTaskRewardSummary = (params = {}, options = {}) =>
  http.get('/welfare/app/task/reward-summary', params, options)

// 签到相关
export const getStageSignInfo = (params = {}, options = {}) => http.get('/welfare/app/stage-sign/info', params, options)

export const claimStageSignDailyReward = (params = {}, options = {}) =>
  http.post('/welfare/app/stage-sign/claim', params, options)

export const claimStageSignMilestoneReward = (params = {}, options = {}) =>
  http.post('/welfare/app/stage-sign/milestones/claim', params, options)

export const claimStageSignTaskReward = (params = {}, options = {}) =>
  http.post('/welfare/app/stage-sign/task-reward/claim', params, options)

// 查询幸运大转盘活动首页信息
export const getLuckyWheel = (params = {}, options = {}) => http.get('/welfare/app/lucky-wheel/index', params, options)

// 选择卡牌
export const getLuckyWheelPickCard = (params = {}, options = {}) =>
  http.post('/welfare/app/lucky-wheel/pick-card', params, options)

// 选择卡牌
export const getLuckyWheelDraw = (params = {}, options = {}) =>
  http.post('/welfare/app/lucky-wheel/draw', params, options)

// 领取幸运大转盘完成奖励
export const luckyWheelClaim = (params = {}, options = {}) =>
  http.post('/welfare/app/lucky-wheel/claim', params, options)

// 查询当前用户首充活动信息和天数奖励情况
export const first_recharge_query = (params = {}, options = {}) =>
  http.get('/welfare/app/first-recharge/query', params, { showLoading: false, ...options })

// 查询用户是否需要展示首充后续活动参加邀请弹窗
export const getFirstRechargeFollowupEntry = (params = {}, options = {}) =>
  http.get('/welfare/app/first-recharge-followup/entry', params, { showLoading: false, ...options })

export const joinFirstRechargeFollowup = (params = {}, options = {}) =>
  http.post('/welfare/app/first-recharge-followup/join', params, { showLoading: false, ...options })

export const getFirstRechargeFollowupInfo = (params = {}, options = {}) =>
  http.get('/welfare/app/first-recharge-followup/info', params, { showLoading: false, ...options })

export const claimFirstRechargeFollowupTask = (params = {}, options = {}) =>
  http.post('/welfare/app/first-recharge-followup/tasks/claim', params, { showLoading: false, ...options })

// 领取首冲奖励
export const claimFirstRecharge = (params = {}, options = {}) =>
  http.post('/welfare/app/claim/first-recharge', params, options)

//是否存在待领取且未过期的活动记录
export const claimPendingStatus = (params = {}, options = {}) =>
  http.get('/welfare/app/claim/pending-status', params, options)

//查询周卡/月卡首页配置与用户当前状态
export const cardBenefit = (params = {}, options = {}) => http.get('/welfare/app/card-benefit/index', params, options)

// 购买周卡/月卡
export const cardBenefitPurchase = (params = {}, options = {}) =>
  http.post('/welfare/app/card-benefit/purchase', params, options)

// 领取当日奖励
export const cardBenefitClaim = (params = {}, options = {}) =>
  http.post('/welfare/app/card-benefit/claim', params, options)

//宝箱列表
export const userBoxList = (params = {}, options = {}) => request.get('/api/v1/user/user_box_list', params, options)

// 领取宝箱
export const userBoxClaim = (params = {}, options = {}) => request.post('/api/v1/user/user_box_claim', params, options)

//宝箱列表
export const userTeamDirectList = (params = {}, options = {}) =>
  request.get('/api/v1/user/user_team_direct_list', params, options)
