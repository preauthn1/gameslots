/**
 * API 基础配置
 */
import http from '@/utils/http.js'
import getCurrentLang from '@/utils/getCurrentLang.js'

// 配置缓存（按语言维度）：同一语言的重复/并发调用复用同一次请求与结果，
// 避免刷新时 loadAppConfig 与热更新检查各打一次 /api/v1/config
let configCache = null // { lang, data }
let configPromise = null // { lang, promise }

/**
 * 通用请求封装
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置
 * @returns {Promise} 响应数据
 */
async function request(url, options = {}) {
  try {
    const res = await http.get(url, options)
    // const response = await fetch(`${BASE_URL}${url}`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     ...options.headers
    //   },
    //   ...options
    // })

    // if (!res.ok) {
    //   throw new Error(`HTTP error! status: ${res.status}`)
    // }

    const data = await res

    if (data.code !== 200) {
      throw new Error(data.msg || '请求失败')
    }

    return data
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

/**
 * 获取应用配置信息(带缓存)
 * @param {boolean} force - 是否强制刷新缓存
 * @returns {Promise<object>} 配置数据
 */
export async function getAppConfig(force = false) {
  const lang = getCurrentLang()

  // 命中同语言的结果缓存，直接复用（config 一次会话内基本不变）
  if (!force && configCache && configCache.lang === lang) {
    return configCache.data
  }

  // 复用同语言的在途请求，避免并发/密集调用重复打接口
  if (!force && configPromise && configPromise.lang === lang) {
    return configPromise.promise
  }

  const promise = (async () => {
    const res = await request('/api/v1/config')
    configCache = { lang, data: res.data }
    return res.data
  })()

  configPromise = { lang, promise }

  try {
    return await promise
  } finally {
    // 请求结束后清掉在途标记，但保留结果缓存供后续复用
    if (configPromise && configPromise.promise === promise) {
      configPromise = null
    }
  }
}

/**
 * 获取 WebSocket 服务器地址
 * @returns {Promise<string>} WebSocket 地址
 */
export async function getWebSocketUrl() {
  const config = await getAppConfig()
  return config.ws
}

/**
 * 清除配置缓存
 */
export function clearConfigCache() {
  configCache = null
  configPromise = null
}

/**
 * 获取游戏分类列表
 * @returns {Promise} 游戏分类数据
 */
export async function getGameTypes() {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_type')
}

/**
 * 获取游戏列表
 * @param {object} params - 查询参数
 * @returns {Promise} 游戏列表数据
 */
export async function getGameList(params = {}) {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_list', params)
}

/**
 * 获取游戏链接
 * @param {object} params - 查询参数
 * @param {string} params.id - 游戏ID
 * @param {string} params.type - 类型 1=PC端, 2=H5
 * @returns {Promise} 游戏链接数据
 */
export async function getGameUrl(params = {}) {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_url', params)
}

/**
 * （转账钱包）退出游戏
 * @param {object} params - 查询参数
 * @param {string} params.id - 游戏ID
 * @param {string} params.type - 类型 1=PC端, 2=H5
 * @returns {Promise} 游戏链接数据
 */
export async function gameOut(params = {}) {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_out', params)
}

/**
 * （转账钱包）获取游戏余额
 * @param {object} params - 查询参数
 * @param {string} params.id - 游戏ID
 * @param {string} params.type - 类型 1=PC端, 2=H5
 * @returns {Promise} 游戏链接数据
 */
export async function gameBalance(params = {}) {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_balance', params)
}

//获取公告 1:弹出公告
// 2:跑马灯公告
// 3:普通公告
export const getNotice = async (params = {}) => {
  const { get } = await import('./request.js')
  return get('/api/v1/notice_list', params)
}

//游戏收藏或取消收藏
export const gameCollect = async (params = {}) => {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_collect', params)
}

//获取收藏列表id
export const getCollectList = async (params = {}) => {
  const { get } = await import('./request.js')
  return get('/api/v1/game/game_collect_id', params)
}
