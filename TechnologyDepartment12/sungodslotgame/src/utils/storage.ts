// =============================================================================
// 认证信息本地存储统一封装
// 集中管理 key，避免硬编码散落导致的拼写错误与清理遗漏
// =============================================================================

/**
 * 认证相关的 localStorage key。
 * 仅覆盖认证会话信息；账号/密码的"记住密码"存储不在此处管理。
 */
const AUTH_KEYS = {
  token: 'sungod_token',
  user: 'sungod_user',
  expiresAt: 'sungod_expires_at',
  isExternal: 'sungod_is_external',
} as const

/** 读取访问令牌，未登录时返回 null。 */
export function getToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.token)
}

/** 读取令牌过期时间戳（毫秒），未写入时返回 0。 */
export function getExpiresAt(): number {
  return Number(localStorage.getItem(AUTH_KEYS.expiresAt) || 0)
}

/**
 * 登录/兑换成功后一次性写入认证会话。
 * @param accessToken 访问令牌
 * @param user 用户信息对象，内部会 JSON 序列化存储
 * @param expiresIn 令牌有效期（秒），据此计算并写入过期时间戳
 */
export function setAuth(data: { accessToken: string; user: unknown; expiresIn: number }): void {
  localStorage.setItem(AUTH_KEYS.token, data.accessToken)
  localStorage.setItem(AUTH_KEYS.user, JSON.stringify(data.user))
  localStorage.setItem(AUTH_KEYS.expiresAt, String(Date.now() + data.expiresIn * 1000))
}

/** 清除认证会话（令牌、用户信息、过期时间）。 */
export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEYS.token)
  localStorage.removeItem(AUTH_KEYS.user)
  localStorage.removeItem(AUTH_KEYS.expiresAt)
}

/** 是否为第三方平台嵌入用户（通过 game-token 进入）。 */
export function isExternalUser(): boolean {
  return localStorage.getItem(AUTH_KEYS.isExternal) === '1'
}

/** 标记当前用户为第三方平台用户。 */
export function markExternalUser(): void {
  localStorage.setItem(AUTH_KEYS.isExternal, '1')
}

/** 清除第三方平台用户标记（自营登录成功后调用）。 */
export function clearExternalUser(): void {
  localStorage.removeItem(AUTH_KEYS.isExternal)
}
