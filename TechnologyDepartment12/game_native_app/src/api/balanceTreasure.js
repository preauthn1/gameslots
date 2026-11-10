import request from '@/api/request'

const BASE = '/welfare/app/balance-treasure'

export const getBalanceTreasureOverview = () => request.get(`${BASE}/overview`, {}, { showLoading: false })

export const getBalanceTreasurePlans = () => request.get(`${BASE}/plans`, {}, { showLoading: false })

export const getBalanceTreasureRecord = () => request.get(`${BASE}/record`, {}, { showLoading: false })

export const joinBalanceTreasure = (data) => request.post(`${BASE}/join`, data, { showLoading: false })

export const getBalanceTreasureRecords = (params) => request.get(`${BASE}/records`, params, { showLoading: false })

export const claimBalanceTreasure = (recordId) => request.post(`${BASE}/records/${recordId}/claim`, {}, { showLoading: false })
