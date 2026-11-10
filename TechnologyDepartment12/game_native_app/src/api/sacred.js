import http from '@/utils/http.js'

// 神圣征途 V2 接口前缀。文档写的是 /api/welfare/app/sacred，此处按项目惯例去掉 /api
// （其余 welfare 接口如 sign.js / vip.js 均不带），联调若不通改这一行即可。
const SACRED = '/welfare/app/sacred'

// ===== 活动首页 =====

// 查询活动首页与动态页签（可匿名）
export const getSacredActivity = (params = {}, options = {}) => http.get(`${SACRED}/activity`, params, options)

// ===== 征途地图 =====

// 查询征途地图（可匿名）
export const getSacredJourney = (params = {}, options = {}) => http.get(`${SACRED}/journey`, params, options)

// 查询某个用户站点详情（userJourneyStationId）
export const getSacredJourneyStation = (params = {}, options = {}) =>
  http.get(`${SACRED}/journey/station`, params, options)

// 首次确认进入征途（requestNo）
export const enterSacredJourney = (params = {}, options = {}) => http.post(`${SACRED}/journey/enter`, params, options)

// 领取主线或支线奖励（userJourneyStationId, lineType: MAIN | SIDE, requestNo）
export const claimSacredJourneyLine = (params = {}, options = {}) =>
  http.post(`${SACRED}/journey/lines/claim`, params, options)

// 手动升级至下一阶段（userJourneyStageId, requestNo）
export const upgradeSacredJourneyStage = (params = {}, options = {}) =>
  http.post(`${SACRED}/journey/stages/upgrade`, params, options)

// 查询当前进行中阶段的升级资格（登录用户）
export const getSacredJourneyStageUpgradeEligibility = (params = {}, options = {}) =>
  http.get(`${SACRED}/journey/stages/upgrade-eligibility`, params, options)

// 查询补签充值阈值（userJourneyStationId）
export const getSacredResignThreshold = (params = {}, options = {}) =>
  http.get(`${SACRED}/journey/resign-threshold`, params, options)

// 创建补签充值会话（userJourneyStationId, requestNo）
export const createSacredResignSession = (params = {}, options = {}) =>
  http.post(`${SACRED}/journey/resign-sessions`, params, options)

// ===== 神圣通天塔 =====

// 查询通天塔、周期和进度（可匿名；userTowerPeriodId 可选）
export const getSacredTower = (params = {}, options = {}) => http.get(`${SACRED}/tower`, params, options)

export const getSacredTowerRewardTypes = (params = {}, options = {}) =>
  http.get(`${SACRED}/tower/reward-types`, params, options)

// 查询指定个人周期详情（userTowerPeriodId）
export const getSacredTowerDetail = (params = {}, options = {}) => http.get(`${SACRED}/tower/detail`, params, options)

// 进入通天塔（userTowerProgressId, requestNo）
export const enterSacredTower = (params = {}, options = {}) => http.post(`${SACRED}/tower/enter`, params, options)

// 确认已播放（或跳过）通天塔解锁效果（userTowerAccessId）
export const acknowledgeSacredTowerOpenEffect = (params = {}, options = {}) =>
  http.post(`${SACRED}/tower/open-effects/ack`, params, options)

// 领取塔层奖励（userTowerProgressId, requestNo）
export const claimSacredTowerFloor = (params = {}, options = {}) =>
  http.post(`${SACRED}/tower/floors/claim`, params, options)

// ===== 神力幸运转盘 =====

// 查询转盘规则和奖项（可匿名）
export const getSacredSpin = (params = {}, options = {}) => http.get(`${SACRED}/spin`, params, options)

// 执行抽奖（spinCount 仅支持 1 或 10, requestNo）
export const drawSacredSpin = (params = {}, options = {}) => http.post(`${SACRED}/spin/draws`, params, options)

// 查询个人抽奖记录（最多 100 条订单）
export const getSacredSpinRecords = (params = {}, options = {}) => http.get(`${SACRED}/spin/records`, params, options)

// 查询中奖滚动播报（可匿名）
export const getSacredSpinBroadcasts = (params = {}, options = {}) =>
  http.get(`${SACRED}/spin/broadcasts`, params, options)

// ===== 神力兑换 =====

// 查询兑换宝箱（可匿名）
export const getSacredExchangeChests = (params = {}, options = {}) =>
  http.get(`${SACRED}/exchange-chests`, params, options)

// 兑换宝箱（exchangeChestId, requestNo）
export const createSacredExchangeOrder = (params = {}, options = {}) =>
  http.post(`${SACRED}/exchange-orders`, params, options)

// 查询兑换记录（最多 100 条）
export const getSacredExchangeOrders = (params = {}, options = {}) =>
  http.get(`${SACRED}/exchange-orders`, params, options)

// ===== 神圣王权宝箱 =====

// 查询王权宝箱与奖励一览（可匿名）
export const getSacredRoyalChests = (params = {}, options = {}) => http.get(`${SACRED}/royal-chests`, params, options)

// 开启王权宝箱（royalChestId, requestNo）
export const openSacredRoyalChest = (params = {}, options = {}) =>
  http.post(`${SACRED}/royal-chests/open`, params, options)

// 查询王权宝箱开启记录（最多 100 条）
export const getSacredRoyalChestRecords = (params = {}, options = {}) =>
  http.get(`${SACRED}/royal-chests/records`, params, options)

// ===== 用户资产与奖励记录 =====

// 查询活动资产
export const getSacredAssets = (params = {}, options = {}) => http.get(`${SACRED}/assets`, params, options)

// 查询奖励发放记录（最近 100 条）
export const getSacredRewardGrants = (params = {}, options = {}) => http.get(`${SACRED}/reward-grants`, params, options)

// 查询单笔奖励发放详情（grantId）
export const getSacredRewardGrantDetail = (params = {}, options = {}) =>
  http.get(`${SACRED}/reward-grants/detail`, params, options)

// ===== 手动刷新任务进度 =====

// 刷新当前用户可查询任务进度（scene: JOURNEY | TOWER，不传则都返回）
export const refreshSacredTaskProgress = (params = {}, options = {}) =>
  http.post(`${SACRED}/task-progress/refresh`, params, options)
