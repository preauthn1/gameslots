import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { configureApi } from './api'
import { getToken, clearAuth, isExternalUser } from './utils/storage'

// 初始化认证：读取已存 token，配置认证失效（401/过期）时的清理与跳转
configureApi({
  token: getToken(),
  onAuthError: () => {
    clearAuth()
    const current = router.currentRoute.value.name
    if (current === 'login' || current === 'session-expired') return
    void router.push(isExternalUser() ? '/session-expired' : '/')
  },
})

createApp(App).use(router).mount('#app')
