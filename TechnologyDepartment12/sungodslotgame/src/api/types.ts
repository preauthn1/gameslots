// =============================================================================
// API 类型 (登录 + 游戏主界面)
// =============================================================================

// ---- 通用响应 ----
export interface ApiResponse<T = null> {
  code: number
  msg: string
  data: T
}

// ---- 错误码 ----
export const ErrorCode = {
  SUCCESS: 0,
  VALIDATION_FAILED: 40001,
  INVALID_BET_AMOUNT: 40002,
  UNAUTHORIZED: 40100,
  TOKEN_EXPIRED: 40101,
  FORBIDDEN: 40300,
  ACCOUNT_FROZEN: 40301,
  NOT_FOUND: 40400,
  DUPLICATE_REQUEST: 40901,
  INSUFFICIENT_BALANCE: 42201,
  GAME_DISABLED: 42202,
  NO_FREE_SPINS: 42203,
  MERCHANT_BET_FAILED: 42204,
  RATE_LIMITED: 42301,
  SERVER_ERROR: 50000,
  GAME_MAINTENANCE: 50301,
} as const

// ---- 用户 ----
export interface UserProfile {
  id: number
  username: string
  nickname: string
  locale: string
  merchant_id?: number
  status: number
}

// ---- Auth ----
export interface LoginRequest {
  username: string
  password: string
}

export interface AuthData {
  user: UserProfile
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface GameTokenRequest {
  game_token: string
}

export interface GameTokenData extends AuthData {
  game_id: number
  external_user_id: string
  merchant_id: number
}

// ---- 游戏详情 (界面渲染依赖) ----
export interface FreeSpinPackage {
  id: number
  bet_amount: number
  price: number
  free_spins: number
}

export interface GameIcon {
  code: string
  name: string
  icon_type: string
  image_url: string
  is_wild: number
  is_scatter: number
}

export interface PaytableEntry {
  icon: string
  count: number
  multiplier: number
}

export interface FreeSpinRule {
  scatter_count: number
  free_spins: number
  weight_version_id: number
  weight_version_name: string
  weight_version_key: string
}

export interface Payline {
  id: number
  name: string
  line_type: string
  positions: [number, number][]
  sort_order: number
}

export interface GameDetail {
  id: number
  code: string
  name: string
  game_type: string
  pay_type: string
  pay_table_type: string
  rows: number
  cols: number
  reel_layout: unknown
  engine_config: unknown
  cover_url: string
  bet_options: number[]
  free_spin_packages: FreeSpinPackage[]
  icons: GameIcon[]
  paytable_summary: PaytableEntry[]
  free_spin_rules: FreeSpinRule[]
  paylines: Payline[]
}

// ---- 钱包 ----
export interface BalanceData {
  balance: number
  frozen_amount: number
  available: number
  source: 'wallet' | 'merchant'
}

// ---- Spin ----
export interface SpinRequest {
  request_id: string
  bet_amount?: number
  use_free_spin?: boolean
}

export interface FreeSpinState {
  triggered: boolean
  awarded: number
  remaining: number
}

export interface JackpotState {
  won: boolean
  level: string | null
  amount: number
}

export interface WinDetail {
  payline_id: number
  payline_name: string
  positions: [number, number][]
  icon: string
  match_count: number
  multiplier: number
  win_amount: number
}

export interface ReplayFrame {
  step: number
  action: string
  grid?: string[][]
  payline_id?: number
  positions?: [number, number][]
  win_amount?: number
}

export interface SpinData {
  spin_id: string
  request_id: string
  game_id: number
  bet_amount: number
  win_amount: number
  net_amount: number
  balance_after: number
  is_free_spin: boolean
  free_spin: FreeSpinState
  jackpot: JackpotState
  grid: string[][]
  wins: WinDetail[]
  replay_token: string
  cascade_times: number | null
  replay: {
    schema_version: number
    frames: ReplayFrame[]
    meta: unknown
  }
  created_at: string
}

/** 免费局状态查询响应 (GET /game/{game_id}/free-spin-state) */
export interface FreeSpinStateResponse {
  game_id: number
  remaining_spins: number
  total_won: number
  bet_amount: number
}

// ---- 游戏历史 / Game Records ----
export interface GameHistoryRecord {
  spin_id: string
  game_id: number
  bet_amount: number
  win_amount: number
  net_amount: number
  is_free_spin: number
  created_at: string
}

export interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface GameHistoryResponse {
  list: GameHistoryRecord[]
  pagination: Pagination
}

// ---- 游戏列表 ----
export interface GameListItem {
  id: number
  code: string
  name: string
  category_id: number
  rows: number
  cols: number
  cover_url: string
  is_hot: number
  sort_order: number
  status: number
}

export interface GameListResponse {
  list: GameListItem[]
  pagination: Pagination
}
