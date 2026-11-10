import request from '@/api/request'

const TURNTABLE = '/api/v1/turntable'

export const getTurntableData = (params = {}, options = {}) => request.get(`${TURNTABLE}/getData`, params, options)

export const spinTurntable = (data = {}, options = {}) => request.post(`${TURNTABLE}/spin`, data, options)

export const withdrawTurntable = (data = {}, options = {}) => request.post(`${TURNTABLE}/withdrawal`, data, options)

export const getTurntableRecords = (params = {}, options = {}) => request.get(`${TURNTABLE}/record`, params, options)

export const getTurntableInvites = (params = {}, options = {}) => request.get(`${TURNTABLE}/invites`, params, options)

export const getTurntableWithdrawals = (params = {}, options = {}) =>
  request.get(`${TURNTABLE}/withdrawals`, params, options)
