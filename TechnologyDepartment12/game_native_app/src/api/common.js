import request from '@/api/request'
import http from '@/utils/http.js'

export const get_content_list = (params = {}) => request.get('/api/v1/content_list', params)

export const upload_chat_image = ({ file, folder = 'img' } = {}, options = {}) => {
  return http.upload(`/api/v1/upload`, file, {
    ...options,
    formData: {
      folder,
      ...(options.formData || {}),
    },
  })
}

//获取文章列表 （帮助中心）

export const get_article_content = (params = {}) => request.get('/api/v1/content_list', params)

//获取文章详情

export const get_article_detail = (params = {}) => request.get(`/api/v1/content_detail`, params)

// 判断是否首充
export const firstRecharge = (params) => http.get('/welfare/app/claim/first-recharge/status', params)
