import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken, getExpiresAt, clearAuth } from '@/utils/storage'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/login.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/home.vue'),
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('../views/lobby.vue'),
    },
    {
      path: '/mahjong',
      name: 'mahjong',
      component: () => import('../views/mahjong.vue'),
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('../views/play.vue'),
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: () => import('../views/session-expired.vue'),
    },
  ],
})

// 路由守卫：未登录访问受保护页面时重定向到登录页；已登录访问登录页则进入大厅
router.beforeEach((to) => {
  const token = getToken()
  const expiresAt = getExpiresAt()
  const expired = expiresAt > 0 && expiresAt <= Date.now()
  if (token && expired) {
    clearAuth()
  }
  const authed = !!token && !expired
  if (!authed && to.name !== 'login' && to.name !== 'play' && to.name !== 'session-expired') return { name: 'login' }
  if (authed && to.name === 'login') return { name: 'lobby' }
})

export default router
