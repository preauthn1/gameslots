import http from '@/utils/http.js'
import { upload_chat_image } from '@/api/common.js'

// IM 客服走独立的 API 域名，通过 headers.baseUrl 覆盖默认 base URL（见 utils/http.js:186）
const IM_API_BASE_URL = 'https://im.gajapre.top'
const imOptions = (extra = {}) => ({
  showLoading: false,
  ...extra,
  headers: { baseUrl: IM_API_BASE_URL, ...extra.headers },
})

export const syncChatUserProfile = (data) => http.post('/im/users', data, imOptions())

export const putChatUserProfile = (data) => http.put('/im/users', data, imOptions())

export const fetchChatConversationList = (params = {}) => http.get('/im/conversations/myService', params, imOptions())

export const joinChatConversation = (data) => http.post('/im/conversations/join', data, imOptions())

export const createChatConversationGroup = (data) => http.post('/im/conversations/cs/start', data, imOptions())

export const fetchChatMessages = (params = {}) => http.get('/im/conversations/messages', params, imOptions())

export const markChatConversationRead = (data) => http.post('/im/conversations/read', data, imOptions())

export const agentChat = (data) => http.post('/im/agent/chat', data, imOptions())

//转人工客服
export const customerServiceChat = (data) => http.post('/im/conversations/cs/sync-agents', data, imOptions())

const createUploadError = () => ({
  code: 'PRESIGNED_UPLOAD_FAILED',
  type: 'PRESIGNED_UPLOAD_FAILED',
})

const getPresignedUploadInfo = (response) => {
  const candidates = [response?.data, response?.data?.data, response?.result, response]

  for (const candidate of candidates) {
    const key = candidate?.key || candidate?.uploadUrl || candidate?.presignedUrl
    const url = candidate?.url || candidate?.fileUrl || candidate?.objectUrl

    if (typeof key === 'string' && key.trim() && typeof url === 'string' && url.trim()) {
      return {
        key: key.trim(),
        url: url.trim(),
      }
    }
  }

  return null
}

const uploadToPresignedUrl = (key, file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('PUT', decodeURI(key), true)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      reject(createUploadError())
    }

    xhr.onerror = () => reject(createUploadError())
    xhr.onabort = () => reject(createUploadError())
    xhr.ontimeout = () => reject(createUploadError())

    // Do not set xhr.timeout: direct object-storage uploads must be allowed to
    // run for as long as a large file needs, rather than inheriting API timeout.
    xhr.send(file)
  })

// Customer-service files upload directly to object storage after the API creates a signed PUT URL.
// This keeps large files off the application API upload endpoint.
export const uploadCustomerServiceFile = async ({ file, folder = 'file', onProgress } = {}) => {
  if (!(file instanceof Blob) || !file.name) {
    throw createUploadError()
  }

  const response = await http.post('/api/v1/presigned', {
    folder,
    filename: file.name,
  })
  const uploadInfo = getPresignedUploadInfo(response)

  if (!uploadInfo) {
    throw createUploadError()
  }

  await uploadToPresignedUrl(uploadInfo.key, file, onProgress)

  return {
    ...response,
    fileUrl: uploadInfo.url,
  }
}

export const uploadChatImage = async ({ file, folder = 'img' } = {}) => {
  const response = await upload_chat_image({ file, folder })
  const rawData = response?.data || response
  const fileUrl =
    pickUploadedFileUrl(rawData) ||
    pickUploadedFileUrl(rawData?.data) ||
    pickUploadedFileUrl(Array.isArray(rawData) ? rawData[0] : null) ||
    pickUploadedFileUrl(Array.isArray(rawData?.data) ? rawData.data[0] : null)

  return {
    ...response,
    fileUrl,
  }
}

const pickUploadedFileUrl = (payload) => {
  const candidates = [payload?.url, payload?.fileUrl, payload?.imageUrl, payload?.src, payload?.path, payload?.fullUrl]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }
  return ''
}

export const findChatConversationByType = (conversations = [], conversationType = '') => {
  const targetType = String(conversationType || '').toUpperCase()
  return (
    conversations.find((item) => {
      const type = String(item?.conversationType || item?.type || '').toUpperCase()
      return type === targetType
    }) || null
  )
}

export const ensureChatConversationByType = async ({
  userId,
  conversationName,
  groupId,
  nickname = '',
  avatar = '',
  vipLevel = '',
  pageNum = 1,
  pageSize = 200,
} = {}) => {
  let conversationsResponse = await fetchChatConversationList({ pageNum, pageSize, visitorUserId: String(userId) })
  let conversations = conversationsResponse.data
  if (conversations || !userId) {
    return conversations
  }

  // 从 putChatUserProfile 拿到 visitor 资料(visitorUserId/visitorName/visitorAvatar/visitorVipLevel) 用于建群
  // const profileResponse = await putChatUserProfile({
  //   userId: String(userId),
  //   nickname,
  //   avatar,
  //   vipLevel,
  // }).catch((error) => {
  //   console.warn('put chat user profile failed:', error)
  //   return null
  // })
  // const visitor = profileResponse?.data || profileResponse || {}

  await createChatConversationGroup({
    visitorUserId: String(userId),
    visitorName: nickname,
    visitorAvatar: avatar,
    visitorVipLevel: String(vipLevel),
    ownerUserId: String(userId),
    groupId,
    conversationName,
    memberUserIds: [String(userId)],
  })

  conversationsResponse = await fetchChatConversationList({ pageNum, pageSize, visitorUserId: String(userId) })
  conversations = conversationsResponse.data

  if (conversations) return conversations

  return {
    conversationId: groupId,
    targetId: groupId,
    groupId,
    conversationName,
  }
}
