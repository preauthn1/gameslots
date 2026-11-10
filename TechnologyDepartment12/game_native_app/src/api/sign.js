import http from '@/utils/http.js'

// 获取签到列表
export const get_sign_list = () => http.get('/welfare/app/ac-sign/list', {}, { showLoading: false })

// 执行签到操作
export const post_action_sign = () => http.post('/welfare/app/ac-sign/claim', {}, { showLoading: false })
