/**
 * HTTP API 请求封装
 *
 * 历史上这里是 WebSocket 请求封装（所有请求走 WS）；现已改为底层复用
 * @/utils/http（fetch），但对外保持一致的接口与「成功返回解包数据」的语义，
 * 因此各 api 模块与其调用方均无需改动，接口整体从 WebSocket 迁移到 HTTP。
 */
import http from '@/utils/http.js'

/**
 * 通用请求方法
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法（GET/POST/PUT/DELETE）
 * @param {object} data - 请求数据（GET/DELETE 作为查询参数，POST/PUT 作为请求体）
 * @param {object} options - 额外配置，透传给底层 http（如 showLoading、headers 等）
 * @returns {Promise<any>} 成功时返回解包后的业务数据（等价响应体的 data 字段）
 */
export async function request(url, method = 'POST', data = {}, options = {}) {
  const normalizedMethod = String(method).toUpperCase()

  try {
    let response
    switch (normalizedMethod) {
      case 'GET':
        response = await http.get(url, data, options)
        break
      case 'PUT':
        response = await http.put(url, data, options)
        break
      case 'DELETE':
        response = await http.delete(url, data, options)
        break
      case 'POST':
      default:
        response = await http.post(url, data, options)
        break
    }

    // http 成功时返回完整响应体 { code, data, msg }；解包 data 以对齐原 WebSocket 版语义
    return response?.data
  } catch (error) {
    throw error
  }
}

/**
 * GET 请求
 */
export function get(url, params = {}, options = {}) {
  return request(url, 'GET', params, options)
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request(url, 'POST', data, options)
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
  return request(url, 'PUT', data, options)
}

/**
 * DELETE 请求
 */
export function del(url, params = {}, options = {}) {
  return request(url, 'DELETE', params, options)
}

export default {
  request,
  get,
  post,
  put,
  delete: del,
}
