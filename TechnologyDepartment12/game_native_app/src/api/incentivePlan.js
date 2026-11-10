import request from '@/api/request'

export const creatorsSubmit = (data = {}) => request.post('/api/v1/user/creators_submit', data)

export const creatorsList = (params = {}) => request.get('/api/v1/user/creators_list', params)
