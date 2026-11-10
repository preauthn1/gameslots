import request from '@/api/request'

// 获取账单列表 /api/v1/user/user_bill_list
export const getUserBillList = (params) => request.get('/api/v1/user/user_bill_list', params)
