/**
 * 银行卡相关 API
 */
import request from '@/api/request'
import http from '@/utils/http.js'

// 获取银行卡
export const bankList = () => request.get('/api/v1/user/bank_list')

// 添加银行卡
export const bankAdd = (data) => request.post('/api/v1/user/bank_add', data)

// 修改银行卡
export const bankUpdate = (data) => request.post('/api/v1/user/bank_update', data)

// 删除银行卡
export const bankDelete = (data) => request.post('/api/v1/user/bank_delete', data)

// 获取支付列表
export const payList = () => request.get('/api/v1/payment/pay_list')

// 发起提现
export const payOut = (data) => request.post('/api/v1/payment/apply_withdraw', data)

// 提现列表
export const withdrawList = (params = {}) => request.get('/api/v1/payment/withdraw_list', params)

// 发起充值
export const payIn = (data) => request.post('/api/v1/payment/pay_in', data)

// 充值列表
export const rechargeList = (params = {}) => request.get('/api/v1/payment/recharge_list', params)

// 获取首充福利活动详情
export const getWelfareActivityDetail = (activityCode) => http.get(`/welfare/app/activity/${activityCode}`)

// 添加支付方式发送验证码
export const getRechargeGiftCoupons = (params = {}, options = {}) =>
  http.get('/welfare/app/recharge-gift/user/coupons', params, options)

export const previewRechargeGiftCoupon = (data = {}, options = {}) =>
  http.post('/welfare/app/recharge-gift/coupon/preview', data, options)

export const sendUserPhoneCode = (data) => request.post('/api/v1/user/send_user_phone_code', data)
