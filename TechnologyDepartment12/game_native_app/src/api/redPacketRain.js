import http from '@/utils/http.js'

// 文档前缀为 /api/welfare/app/red-packet-rain，项目内其余 welfare 接口均不带 /api
const BASE_URL = '/welfare/app/red-packet-rain'

/** 查询当前进行中的活动（免登录，无活动时 data 为 []） */
export const getActiveRedPacketRain = (params = {}, options = {}) =>
  http.get(`${BASE_URL}/active`, params, { showLoading: false, ...options })

/** 查询参与资格（需登录） */
export const getRedPacketRainQualification = (activityId, params = {}, options = {}) =>
  http.get(`${BASE_URL}/${activityId}/qualification`, params, { showLoading: false, ...options })

/** 加入活动（幂等，无请求体） */
export const joinRedPacketRain = (activityId, params = {}, options = {}) =>
  http.post(`${BASE_URL}/${activityId}/join`, params, { showLoading: false, ...options })

/** 点击金币，每次点击由服务端独立判奖 */
export const grabRedPacketRain = (activityId, params = {}, options = {}) =>
  http.post(`${BASE_URL}/${activityId}/grab`, params, { showLoading: false, ...options })
