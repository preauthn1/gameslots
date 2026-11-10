import request from '@/api/request'

const PRIZE_POOL = '/welfare/app/prize-pool'

export const getPrizePoolCurrent = () => request.get(`${PRIZE_POOL}/current`)

export const getPrizePoolLeaderboard = (params = {}) => request.get(`${PRIZE_POOL}/leaderboard`, params)

export const getPrizePoolRewards = (params = {}) => request.get(`${PRIZE_POOL}/rewards`, params)

export const claimPrizePoolReward = (params = {}) => request.get(`${PRIZE_POOL}/rewards/claim`, params)
