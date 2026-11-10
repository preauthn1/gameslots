/**
 * 游戏相关 API
 */
import request from '@/api/request'

// 获取游戏分类
export const gameType = () => request.get('/api/v1/game/game_type')

// 注单记录
export const gameBet = (params) => request.get('/api/v1/game/game_bet', params)

// 输赢记录
export const gameBetStat = (params) => request.get('/api/v1/game/game_bet_stat', params)

// 用户游戏统计：首页/我的页展示总下注、总输赢、大奖
export const gameUserStatIndex = (params = {}) => request.get('/api/v1/game/game_user_stat_index', params)
