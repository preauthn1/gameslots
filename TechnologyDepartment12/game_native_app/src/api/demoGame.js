/**
 * 试玩游戏（Hot Games Demo）接口
 *
 * 由平台网关代理到第三方试玩平台。网关原样透传第三方返回 { error, msg, id, url }，
 * 没有平台统一的 code 字段，因此走 http 封装时声明 rawResponse 跳过业务码校验；
 * token / lang / version 仍由请求拦截器自动携带。
 */
import http from '@/utils/http.js'

/**
 * 获取试玩游戏地址
 * @param {object} data
 * @param {string} data.user_id   16 位数字
 * @param {string} data.user_name Player_ + 12 位十六进制
 * @param {string} data.id        32 位十六进制
 * @param {string} data.game_code 游戏编码
 * @param {object} options 透传给 http（如 showLoading）
 * @returns {Promise<{ id: string, url: string }>}
 */
export const launchDemoGame = async (data = {}, options = {}) => {
  const body = await http.post(
    '/game_test/launch',
    {
      user_id: String(data.user_id || ''),
      user_name: String(data.user_name || ''),
      id: String(data.id || ''),
      game_code: String(data.game_code || ''),
    },
    { rawResponse: true, ...options }
  )

  // 兼容网关直接透传 { error, msg, id, url }，或日后包成 { code, data: { id, url } }
  const payload = body?.url ? body : body?.data
  if (!payload?.url || payload.error) {
    throw new Error(payload?.msg || payload?.error || body?.msg || 'Demo game launch failed')
  }

  return { id: String(payload.id || ''), url: String(payload.url) }
}
