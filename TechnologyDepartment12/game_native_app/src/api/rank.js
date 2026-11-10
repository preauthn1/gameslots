import request from '@/api/request'

// 我的充值排行待领取数据
export const getRechargeRank = (params = {}) => request.get('/api/v1/payment/recharge_rank_record_list', params)

// 我的充值排行待领取数据
export const getGameBetRank = (params = {}) => request.get('/api/v1/game/game_bet_rank_record_list', params)

// 本周充值排行
export const geNowRecharge = (params = {}) => request.get('/api/v1/payment/now_recharge_rank', params)

// 本周游戏排行
export const geNowGame = (params = {}) => request.get('/api/v1/game/now_game_bet_rank', params)

// 领取充值排行榜奖励
export const claimRechargeRank = (params = {}) => request.post('/api/v1/payment/claim_recharge_rank_record', params)

// 领取游戏排行奖励
export const claimGameBetRank = (params = {}) => request.post('/api/v1/game/claim_game_bet_rank_record', params)
