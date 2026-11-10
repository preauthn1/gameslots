/**
 * 认证 — 登录
 */
import { post } from './client'
import type { AuthData, LoginRequest, GameTokenData } from './types'

export function login(data: LoginRequest): Promise<AuthData> {
  return post<AuthData>('/auth/login', data, { public: true })
}

/** 第三方平台 game_token 兑换玩家 JWT（无需注册/登录） */
export function exchangeGameToken(token: string): Promise<GameTokenData> {
  return post<GameTokenData>('/auth/game-token', { game_token: token }, { public: true })
}
