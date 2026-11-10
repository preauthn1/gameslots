<template>
  <router-view />
  <Teleport to="body">
    <Transition name="loading-fade">
      <div v-if="isGameLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring inner"></div>
          <div class="spinner-glow"></div>
        </div>
        <p class="loading-text">正在进入游戏</p>
        <p class="loading-sub">加载资源中...</p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { isGameLoading } from '@/component/modules/loadingState'
</script>

<style>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: radial-gradient(circle at 50% 40%, #1a2a5e 0, #0e1430 70%);
}

.loading-fade-enter-active { transition: opacity 0.25s ease; }
.loading-fade-leave-active { transition: opacity 0.15s ease; }
.loading-fade-enter-from,
.loading-fade-leave-to { opacity: 0; }

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: #e0a814;
  border-right-color: #e0a814;
  border-radius: 50%;
  animation: spin-ring 1s linear infinite;
}

.spinner-ring.inner {
  inset: 10px;
  border-top-color: #f2c52a;
  border-right-color: transparent;
  border-bottom-color: #f2c52a;
  animation-direction: reverse;
  animation-duration: 0.7s;
}

.spinner-glow {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(224, 168, 20, 0.2), transparent 70%);
  animation: pulse-glow 1.4s ease-in-out infinite;
}

@keyframes spin-ring {
  to { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 0.7; transform: scale(1.08); }
}

.loading-text {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #e0a814;
  letter-spacing: 0.04em;
}

.loading-sub {
  margin: 0;
  font-size: 13px;
  color: #6a7aaf;
}
</style>
