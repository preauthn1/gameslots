/**
 * 游戏局 — Spin & 免费局状态 & 历史
 */
import { get, post } from './client'
import type { SpinData, SpinRequest, FreeSpinStateResponse, GameHistoryResponse } from './types'

export function spin(gameId: number, data: SpinRequest): Promise<SpinData> {
  return post<SpinData>(`/game/${gameId}/spin`, data)
}

/** 查询当前用户在某游戏的免费局状态 */
export function getFreeSpinState(gameId: number): Promise<FreeSpinStateResponse> {
  return get<FreeSpinStateResponse>(`/game/${gameId}/free-spin-state`)
}

/** 指定游戏的 Spin 历史 */
export function getGameHistory(gameId: number, page = 1, pageSize = 20): Promise<GameHistoryResponse> {
  return get<GameHistoryResponse>(`/game/${gameId}/history?page=${page}&page_size=${pageSize}`)
}
