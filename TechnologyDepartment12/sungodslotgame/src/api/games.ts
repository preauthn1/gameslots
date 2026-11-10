/**
 * 游戏 — 配置加载
 */
import { get } from './client'
import type { GameDetail, GameListResponse } from './types'

export function getGameDetail(gameId: number): Promise<GameDetail> {
  return get<GameDetail>(`/games/${gameId}`, { public: true })
}

export function getGames(category?: string, page = 1, pageSize = 20): Promise<GameListResponse> {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  params.set('page', String(page))
  params.set('page_size', String(pageSize))
  return get<GameListResponse>(`/games?${params.toString()}`, { public: true })
}
