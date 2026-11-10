/**
 * 用户相关 API
 */
import request from '@/api/request'

// get  带params  示例
export const isNewUser = (params) => request.get('/sys/sysLoginLog/isNewUser', params)

// 用户登出
export const logout = () => request.post('/api/v1/user/logout')

// 用户登录
export const loginApi = (data, options = {}) => request.post('/api/v1/user/login', data, options)

// 注册
export const registerApi = (data, options = {}) => request.post('/api/v1/user/register', data, options)

// 发送手机验证码
export const sendPhoneCode = (data) => request.post('/api/v1/user/send_phone_code', data)

// 发送邮箱验证码
export const sendEmailCode = (data) => request.post('/api/v1/user/send_email_code', data)

// 手机号登录
export const phone_login = (data, options = {}) => request.post('/api/v1/user/phone_login', data, options)

// 获取用户信息
export const getUserInfo = () => request.get('/api/v1/user/info')

// 更新用户信息
export const updateUserInfo = (data) => request.post('/api/v1/user/update', data)

// 更新登录密码
export const updatePassword = (data) => request.post('/api/v1/user/update_password', data)

// 更新交易密码
export const updatePayPassword = (data) => request.post('/api/v1/user/update_pay_password', data)

// 修改手机号
export const updatePhone = (data) => request.post('/api/v1/user/update_phone', data)

// 获取手机号验秘钥
export const verifyPhoneCode = (data) => request.post('/api/v1/user/verify_phone_code', data)

// 重置密码（找回密码）
export const resetPassword = (data) => request.post('/api/v1/user/reset_password', data)

// 重置交易密码
export const resetTradePassword = (data) => request.post('/api/v1/user/reset_pay_pwd', data)

// 设置交易密码
export const setPayPwd = (data) => request.post('/api/v1/user/set_pay_pwd', data)

// 获取kyc
export const getKyc = () => request.get('/api/v1/user/get_kyc')

// 添加kyc
export const addKyc = (data) => request.post('/api/v1/user/add_update_kyc', data)

// 获取谷歌授权链接
export const getAuthUrl = () => request.get('/api/v1/user/auth_url')

// 获取谷歌授权链接
export const getGoogleToken = () => request.get('/api/v1/user/google_token')

// 谷歌idtoken登录
export const googleTokenLogin = (data, options = {}) => request.post('/api/v1/google_token_login', data, options)

// 谷歌账号绑定
export const googleBind = (data) => request.post('/api/v1/user/google_bind', data)

// 获取用户排行数据
export const getUserRank = () => request.get('/api/v1/user/user_rank')

// 获取未消息数量
export const getUserUnreadCount = () => request.get('/api/v1/user/unread_count')

// 自动登录-获取加密秘钥
export const deviceKeyExchange = (data) => request.post('/api/v1/device/key-exchange', data)

// 自动登录-自动注册登录
export const autoLogin = (data, options = {}) => request.post('/api/v1/device/auto-login', data, options)

// 自动登录-老账号登录绑定
export const deviceLogin = (data, options = {}) => request.post('/api/v1/device/login', data, options)

// 自动登录-升级账号为正式账号
export const upgradeDeviceAccount = (data) => request.post('/api/v1/device/upgrade', data)
