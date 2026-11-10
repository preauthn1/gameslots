<template>
  <main class="play-entry">
    <p class="play-entry__text">{{ message }}</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { configureApi, exchangeGameToken, getErrorMessage } from '@/api'
import { setAuth, markExternalUser } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const message = ref('正在进入游戏...')

// game_id → 游戏路由（当前两种玩法固定）
const GAME_PATHS: Record<number, string> = {
  1: '/home',
  2: '/mahjong',
}

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  const gameId = Number(route.query.game_id ?? 0)

  if (!token) {
    void router.replace({ name: 'login' })
    return
  }

  try {
    const auth = await exchangeGameToken(token)
    configureApi({ token: auth.access_token })
    setAuth({ REDACTED, user: auth.user, expiresIn: auth.expires_in })
    // 标记为第三方平台用户，会话过期时引导返回平台而非自营登录页
    markExternalUser()
    // 清理平台自营登录可能残留的账号密码
    localStorage.removeItem('sungod_account')
    localStorage.removeItem('sungod_password')

    const targetGameId = auth.game_id ?? gameId
    const target = GAME_PATHS[targetGameId]
    if (target) {
      void router.replace(target)
    } else {
      message.value = '无效的游戏'
      setTimeout(() => void router.replace({ name: 'login' }), 1200)
    }
  } catch (e) {
    message.value = getErrorMessage(e)
    setTimeout(() => void router.replace({ name: 'login' }), 1200)
  }
})
</script>

<style scoped>
.play-entry {
  width: 100vw;
  height: 100dvh;
  display: grid;
  place-content: center;
  background: radial-gradient(circle at 50% -10%, #273b76 0, #111a38 36%, #0e1430 74%);
}

.play-entry__text {
  font-size: 16px;
  color: #ffcd44;
}
</style>
