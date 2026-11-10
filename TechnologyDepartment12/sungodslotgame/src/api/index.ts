/**
 * API 模块
 *
 * 接入示例:
 *   import { configureApi, login, getBalance, getGameDetail, spin } from '@/api'
 *
 *   configureApi({ baseUrl: 'https://api.example.com/api/v1' })
 *
 *   const auth = await login({ username: 'demo', REDACTED })
 *   configureApi({ token: auth.access_token })
 *
 *   const game = await getGameDetail(1)
 *   const bal = await getBalance()
 *   const result = await spin(1, { request_id: crypto.randomUUID(), bet_amount: 1000 })
 */
export { configureApi, ApiError, getErrorMessage } from './client'
export { ErrorCode } from './types'

export { login, exchangeGameToken } from './auth'
export { getGameDetail, getGames } from './games'
export { getBalance } from './wallet'
export { spin, getFreeSpinState, getGameHistory } from './game-spin'

export type {
  ApiResponse,
  UserProfile,
  LoginRequest,
  AuthData,
  GameTokenRequest,
  GameTokenData,
  GameDetail,
  GameIcon,
  PaytableEntry,
  FreeSpinRule,
  FreeSpinPackage,
  Payline,
  BalanceData,
  SpinRequest,
  SpinData,
  FreeSpinState,
  JackpotState,
  WinDetail,
  ReplayFrame,
  FreeSpinStateResponse,
  GameHistoryRecord,
  GameHistoryResponse,
  Pagination,
  GameListItem,
  GameListResponse,
} from './types'
