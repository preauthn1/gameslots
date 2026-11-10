<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Sun God Slot</h1>

      <div class="input-group">
        <label>账户</label>
        <input v-model="account" type="text" placeholder="请输入账户" autocomplete="username" />
      </div>

      <div class="input-group">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
      </div>

      <div class="remember-row">
        <label class="remember-label">
          <input v-model="remember" type="checkbox" />
          <span>记住密码</span>
        </label>
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { configureApi, login, getErrorMessage } from '@/api'
import { setAuth, clearExternalUser } from '@/utils/storage'

const router = useRouter()

const account = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  const savedAccount = localStorage.getItem('sungod_account')
  const savedPassword = localStorage.getItem('sungod_password')
  if (savedAccount) {
    account.value = savedAccount
    password.value = savedPassword || ''
    remember.value = true
  } else {
    account.value = 'demo'
    password.value = 'User@123'
    remember.value = true
  }
})

async function handleLogin() {
  if (!account.value.trim() || !password.value.trim()) return
  if (loading.value) return

  errorMsg.value = ''
  loading.value = true

  try {
    const auth = await login({
      username: account.value.trim(),
      password: password.value,
    })

    // 存储 token 和用户信息（refresh_token 后端尚未提供刷新接口，暂不存储）
    configureApi({ token: auth.access_token })
    setAuth({ REDACTED, user: auth.user, expiresIn: auth.expires_in })
    // 自营登录成功，清除第三方用户标记
    clearExternalUser()

    if (remember.value) {
      localStorage.setItem('sungod_account', account.value)
      localStorage.setItem('sungod_password', password.value)
    } else {
      localStorage.removeItem('sungod_account')
      localStorage.removeItem('sungod_password')
    }

    router.push('/lobby')
  } catch (err) {
    errorMsg.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0e011f, #1a0a3e);
}

.login-card {
  width: 320px;
  padding: 40px 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 205, 68, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-family: 'IBM Plex Serif', serif;
  color: #ffcd44;
  margin: 0 0 32px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  font-size: 13px;
  color: #a89bc2;
  margin-bottom: 6px;
}

.input-group input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  font-size: 15px;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 205, 68, 0.2);
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: rgba(255, 205, 68, 0.6);
}

.remember-row {
  margin-bottom: 24px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a89bc2;
  cursor: pointer;
}

.remember-label input[type='checkbox'] {
  accent-color: #ffcd44;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 700;
  color: #1a0a3e;
  background: linear-gradient(135deg, #ffcd44, #ff9f00);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}
.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
  margin: 0 0 12px;
}
</style>
