<template>
  <Teleport to="body">
    <div v-if="visible" class="game-settings" role="dialog" aria-modal="true" aria-labelledby="game-settings-title" @click.self="close">
      <section class="game-settings__panel">
        <header class="game-settings__header">
          <h2 id="game-settings-title">设置</h2>
          <button class="game-settings__close" type="button" aria-label="关闭设置" @click="close">×</button>
        </header>

        <div class="game-settings__body">
          <div class="game-settings__item">
            <span class="game-settings__label">背景音乐</span>
            <div class="game-settings__switch" role="group" :aria-label="`背景音乐${musicOn ? '开启' : '关闭'}`">
              <button type="button" class="game-settings__option" :class="{ 'is-on': musicOn }" @click="setMusic(true)">开</button>
              <button type="button" class="game-settings__option" :class="{ 'is-on': !musicOn }" @click="setMusic(false)">关</button>
            </div>
          </div>

          <div class="game-settings__item">
            <span class="game-settings__label">音效</span>
            <div class="game-settings__switch" role="group" :aria-label="`音效${soundOn ? '开启' : '关闭'}`">
              <button type="button" class="game-settings__option" :class="{ 'is-on': soundOn }" @click="setSound(true)">开</button>
              <button type="button" class="game-settings__option" :class="{ 'is-on': !soundOn }" @click="setSound(false)">关</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { gameSound } from '@/component/modules/audio/GameSound'
import { gameMusic } from '@/component/modules/audio/GameMusic'

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ close: [] }>()

const musicOn = ref(gameMusic.isEnabled)
const soundOn = ref(gameSound.isEnabled)

watch(visible, (open) => {
  if (open) {
    musicOn.value = gameMusic.isEnabled
    soundOn.value = gameSound.isEnabled
  }
})

function setMusic(on: boolean): void {
  musicOn.value = on
  gameMusic.setEnabled(on)
}

function setSound(on: boolean): void {
  soundOn.value = on
  gameSound.setEnabled(on)
  if (on) gameSound.unlock()
}

function close() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.game-settings {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 5dvh 3vw;
  background: rgb(0 0 0 / 65%);
}

.game-settings__panel {
  container-type: inline-size;
  width: min(92vw, 560px);
  padding: 6cqw 7cqw;
  box-sizing: border-box;
  color: #f8e69e;
  background: #101a33;
  border: 0.4cqw solid #bd811d;
  border-radius: 3cqw;
  box-shadow: 0 0 5cqw rgb(0 0 0 / 45%);
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  display: grid;
  gap: 5cqw;
}

.game-settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-settings__header h2 {
  margin: 0;
  font-size: 5.5cqw;
  font-weight: 600;
  line-height: 1;
}

.game-settings__close {
  display: grid;
  width: 6.4cqw;
  height: 6.4cqw;
  place-items: center;
  padding: 0;
  color: #ffc452;
  border: 0.35cqw solid #bd811d;
  border-radius: 50%;
  background: #0a1226;
  font-size: 5.4cqw;
  line-height: 1;
  cursor: pointer;
}

.game-settings__body {
  display: grid;
  gap: 4.5cqw;
}

.game-settings__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 9cqw;
}

.game-settings__label {
  color: #f0dbbd;
  font-size: 4.2cqw;
  font-weight: 500;
}

.game-settings__switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7cqw;
  width: 30cqw;
  padding: 0.7cqw;
  border: 0.3cqw solid #bd811d;
  border-radius: 999px;
  background: #0a1226;
}

.game-settings__option {
  padding: 2.4cqw 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #7d8fae;
  font: 600 3.8cqw/1 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.game-settings__option.is-on {
  color: #3a2408;
  background: linear-gradient(180deg, #f8e69e 0%, #fec452 100%);
}
</style>
