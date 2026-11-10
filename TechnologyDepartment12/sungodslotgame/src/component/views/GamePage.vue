<template>
  <main class="game-page" :class="{ 'slot-game': gameId === 1, 'mahjong-game': gameId === 2, 'is-ready': isReady, 'is-free-spin': hasFreeSpins }">
    <div class="frame-bg"></div>
    <div class="stage-shell">
      <canvas ref="canvasRef" class="game-canvas" @pointerdown="unlockSound" />
      <div v-if="isReady" class="game-overlay" :style="overlayStyle">
        <button type="button" class="canvas-settings-hitbox" aria-label="设置" @click="openSettings" />
        <div class="game-shortcuts" aria-label="游戏快捷入口">
          <button type="button" class="game-shortcut" aria-label="历史记录" @click="openHistory">
            <img :src="historyIcon" alt="" />
          </button>
          <button type="button" class="game-shortcut" aria-label="玩法说明" @click="openHowToPlay">
            <img :src="howToPlayIcon" alt="" />
          </button>
        </div>
      </div>
    </div>
   <HowToPlay v-model:visible="isHowToPlayVisible" :game="gameDetail" :icon-map="iconMap" />
   <GameHistory v-model:visible="isHistoryVisible" :game-id="gameId" />
   <GameSettings v-model:visible="isSettingsVisible" />
   <div class="preload-assets" aria-hidden="true">
      <img :src="handhBg" fetchpriority="high" />
      <img :src="preloadImg('game-frame-22.webp')" />
      <img :src="preloadImg('game-frame-24.webp')" />
      <img :src="preloadImg('game-frame-58.webp')" />
      <img :src="paylineBackground" fetchpriority="high" />
    </div>
    <Teleport to="body">
      <div v-if="errorMessage" class="error-toast" @click="errorMessage = ''">{{ errorMessage }}</div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameHistory from '@/component/views/GameHistory.vue'
import HowToPlay from '@/component/views/HowToPlay.vue'
import GameSettings from '@/component/views/GameSettings.vue'
import { useGame } from '@/component/modules/useGame'
import { gameSound } from '@/component/modules/audio/GameSound'
import paylineBackground from '@/assets/images/wf/BG.webp'
import handhBg from '@/assets/images/HandH_BG.webp'

const historyIcon = new URL('../../assets/images/History.webp', import.meta.url).href
const howToPlayIcon = new URL('../../assets/images/HowtoPlay.webp', import.meta.url).href

function preloadImg(name: string) {
  return new URL(`../../assets/images/${name}`, import.meta.url).href
}

const { gameId } = defineProps<{ gameId: number }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isHistoryVisible = ref(false)
const isHowToPlayVisible = ref(false)
const isSettingsVisible = ref(false)

function unlockSound(): void {
  gameSound.unlock()
}

function openSettings(): void {
  if (closeBetMenu()) return
  isSettingsVisible.value = true
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const decoded = image.decode?.()
      if (decoded) decoded.catch(() => undefined).finally(resolve)
      else resolve()
    }
    image.onerror = () => resolve()
    image.src = src
  })
}

const paylineBackgroundReady = preloadImage(paylineBackground)
const handhBgReady = preloadImage(handhBg)

async function openHowToPlay(): Promise<void> {
  // 在浏览器解码完成前，避免挂载 CSS 背景。
  await Promise.all([paylineBackgroundReady, handhBgReady])
  isHowToPlayVisible.value = true
}

async function openHistory(): Promise<void> {
  await handhBgReady
  isHistoryVisible.value = true
}

const iconMap: Record<string, string> = {
  '10': new URL('../../assets/images/10.webp', import.meta.url).href,
  'J': new URL('../../assets/images/J.webp', import.meta.url).href,
  'Q': new URL('../../assets/images/Q.webp', import.meta.url).href,
  'K': new URL('../../assets/images/K.webp', import.meta.url).href,
  'A': new URL('../../assets/images/A.webp', import.meta.url).href,
  'chakra': new URL('../../assets/images/Chakra.webp', import.meta.url).href,
  'shankha': new URL('../../assets/images/shankha.webp', import.meta.url).href,
  'diya': new URL('../../assets/images/Diya.webp', import.meta.url).href,
  'kalash': new URL('../../assets/images/Kalash.webp', import.meta.url).href,
  'crown': new URL('../../assets/images/crown.webp', import.meta.url).href,
  'surya': new URL('../../assets/images/Surya.webp', import.meta.url).href,
  'WILD': new URL('../../assets/images/WILD.webp', import.meta.url).href,
  'SCATTER': new URL('../../assets/images/SCATTER.webp', import.meta.url).href,
}

const { overlayStyle, isReady, errorMessage, hasFreeSpins, gameDetail, closeBetMenu } = useGame(
  { gameId, iconMap, apiSymbolKeys: new Set(['10', 'J', 'Q', 'K', 'A', 'chakra', 'shankha', 'diya', 'kalash', 'crown', 'surya', 'WILD', 'SCATTER']), onSettings: openSettings },
  canvasRef,
)
</script>

<style scoped>
.game-page {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  background: #0e011f;
  background-image: url('../../assets/images/BG.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.game-page.is-free-spin {
  background-image: url('../../assets/images/BG_mfxz.webp');
}

.stage-shell {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 1;
  visibility: hidden;
}

.is-ready .stage-shell {
    visibility: visible;
}

.game-canvas {
  display: block;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 750px;
  height: 1624px;
  transform-origin: top left;
  pointer-events: none;
}

/* Native hit target avoids inconsistent Pixi tap recognition on touch devices. */
.canvas-settings-hitbox {
  position: absolute;
  top: 1320px;
  left: 49px;
  width: 80px;
  height: 80px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.game-shortcuts {
  position: absolute;
  top: 28px;
  right: 46px;
  z-index: 2;
  display: flex;
  gap: 24px;
}

.game-shortcut {
  display: block;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.game-shortcut img {
  display: block;
  width: 100%;
  height: 100%;
}

.frame-bg {
  position: absolute;
  top: 20.69%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 400px;
  height: 58.62%;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  visibility: hidden;
}
.is-ready .frame-bg {
  visibility: visible;
}
@media (max-width: 311px) {
  .frame-bg {
    display: none;
  }
}
/* 麻将胡了板块 */
.mahjong-game .frame-bg {
  background-image: url('../../assets/images/image_72_3_max.webp');
}

/* 老虎机板块 */
.slot-game .frame-bg {
  top: 25.12%;
  height: 52.59%;
  background-image: url('../../assets/images/slotMachine_bg_max.webp');
}

@media (min-width: 750px) {
  .frame-bg {
    background-size: cover;
  }
}
</style>

<style>
.error-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(220, 38, 38, 0.92);
  color: #fff;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  z-index: 9999;
  cursor: pointer;
  max-width: 80vw;
  text-align: center;
  line-height: 1.5;
}
.preload-assets {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
