/**
 * 通知相关 API
 */
import request from '@/api/request'

// 获取公告列表
export const noticeList = (params) => request.get('/api/v1/notice_list', params)

// 获取公告详情
export const noticeDetail = (params) => request.get('/api/v1/notice_detail', params)

// 标记已读公告
export const noticeRead = (data) => request.post('/api/v1/notice_read', data)

// 获取站内信列表
export const messageList = (params) => request.get('/api/v1/user/message_list', params)

// 获取站内信详情
export const messageDetail = (params) => request.get('/api/v1/user/message_detail', params)

// 标记站内信已读
export const readMessage = (data) => request.post('/api/v1/user/read_message', data)
