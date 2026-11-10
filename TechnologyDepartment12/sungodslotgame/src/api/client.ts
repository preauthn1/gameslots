import type { ApiResponse } from './types'
import { ErrorCode } from './types'

// =============================================================================
// 运行时配置
// =============================================================================

let _baseUrl = import.meta.env.VITE_API_BASE ?? ''
let _token: string | null = null
let _merchantCode = import.meta.env.VITE_MERCHANT_CODE ?? 'platform'
let _onAuthError: (() => void) | null = null

export function configureApi(opts: { token?: string | null; merchantCode?: string; onAuthError?: () => void }): void {
  if (opts.token !== undefined) _token = opts.token
  if (opts.merchantCode !== undefined) _merchantCode = opts.merchantCode
  if (opts.onAuthError !== undefined) _onAuthError = opts.onAuthError
}

// =============================================================================
// 错误
// =============================================================================

export class ApiError extends Error {
  code: number
  msg: string
  data: unknown

  constructor(code: number, msg: string, data: unknown = null) {
    super(`[${code}] ${msg}`)
    this.name = 'ApiError'
    this.code = code
    this.msg = msg
    this.data = data
  }
}

// =============================================================================
// 错误文案（错误码 → 用户可读提示）
// =============================================================================

const ERROR_MESSAGES: Record<number, string> = {
  [ErrorCode.VALIDATION_FAILED]: 'Invalid request',
  [ErrorCode.INVALID_BET_AMOUNT]: 'Invalid bet amount',
  [ErrorCode.UNAUTHORIZED]: 'Session expired, please sign in again',
  [ErrorCode.TOKEN_EXPIRED]: 'Session expired, please sign in again',
  [ErrorCode.FORBIDDEN]: 'Access denied',
  [ErrorCode.ACCOUNT_FROZEN]: 'Account is frozen',
  [ErrorCode.NOT_FOUND]: 'Not found',
  [ErrorCode.DUPLICATE_REQUEST]: 'Duplicate request',
  [ErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance',
  [ErrorCode.GAME_DISABLED]: 'Game unavailable',
  [ErrorCode.NO_FREE_SPINS]: 'No free spins remaining',
  [ErrorCode.MERCHANT_BET_FAILED]: 'Settlement failed, please try again',
  [ErrorCode.RATE_LIMITED]: 'Too many requests, please try again',
  [ErrorCode.SERVER_ERROR]: 'Server error, please try again',
  [ErrorCode.GAME_MAINTENANCE]: 'Game under maintenance',
}

/** 将任意错误转换为用户可读的提示 */
export function getErrorMessage(e: unknown): string {
  if (!(e instanceof ApiError)) return 'Network error, please check your connection'
  if (e.code === -1) return e.msg
  if (ERROR_MESSAGES[e.code]) return ERROR_MESSAGES[e.code]
  if (e.code >= 500) return 'Server error, please try again'
  return e.msg || 'Request failed, please try again'
}

// =============================================================================
// 请求封装
// =============================================================================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  public?: boolean
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = _baseUrl ? `${_baseUrl}${path}` : path

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...opts.headers,
  }

  if (!opts.public && _token) {
    headers['Authorization'] = `Bearer ${_token}`
  }
  if (_merchantCode) {
    headers['X-Merchant-Code'] = _merchantCode
  }

  let body: string | undefined
  if (opts.body !== undefined) {
    body = JSON.stringify(opts.body)
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  let res: Response
  try {
    res = await fetch(url, { method: opts.method ?? 'GET', headers, body, signal: controller.signal })
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'AbortError'
    throw new ApiError(-1, timedOut ? 'Request timeout' : 'Network error', e)
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    // 后端对未登录/Token 过期（40100/40101）返回 HTTP 401，需触发认证失效回调
    if (res.status === 401) {
      _token = null
      _onAuthError?.()
    }
    throw new ApiError(res.status, `HTTP ${res.status}`)
  }

  let json: ApiResponse<T>
  try {
    json = await res.json()
  } catch {
    throw new ApiError(res.status, 'Failed to parse response')
  }

  if (json.code === ErrorCode.UNAUTHORIZED || json.code === ErrorCode.TOKEN_EXPIRED) {
    _token = null
    _onAuthError?.()
  }

  if (json.code !== ErrorCode.SUCCESS) {
    throw new ApiError(json.code, json.msg, json.data)
  }

  return json.data as T
}

// =============================================================================
// 便捷方法
// =============================================================================

export function get<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...opts, method: 'GET' })
}

export function post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...opts, method: 'POST', body })
}
