<template>
  <Teleport to="body">
    <div v-if="visible" class="how-to-play" role="dialog" aria-modal="true" aria-labelledby="how-to-play-title" @click.self="close">
      <section
        class="how-to-play__panel"
        :class="{
          'how-to-play__panel--free-game': activeTab === '免费游戏',
          'how-to-play__panel--lines': activeTab === '连线',
        }"
      >
        <header class="how-to-play__header">
          <h2 id="how-to-play-title">玩法介绍</h2>
          <button class="how-to-play__close" type="button" aria-label="关闭玩法介绍" @click="close">×</button>
        </header>

        <nav class="how-to-play__tabs" aria-label="玩法介绍分类">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="how-to-play__tab"
            :class="{ 'is-active': activeTab === tab }"
            type="button" @click="activeTab = tab">
            <span class="how-to-play__tab-label">{{ tab }}</span>
          </button>
        </nav>

        <div
          v-if="activeTab === '赔率表'"
          class="how-to-play__paytable"
          @touchstart="startTouchScroll"
          @touchmove="moveTouchScroll"
          @touchend="endTouchScroll"
          @touchcancel="endTouchScroll"
        >
          <template v-if="paytable.length">
            <div class="how-to-play__row how-to-play__row--head"
              :style="{ gridTemplateColumns: `1.4fr repeat(${paytableCounts.length}, 1fr)` }">
              <span>符号</span>
              <span v-for="count in paytableCounts" :key="count">x{{ count }}</span>
            </div>
            <div v-for="entry in paytable" :key="entry.symbol" class="how-to-play__row"
              :style="{ gridTemplateColumns: `1.4fr repeat(${paytableCounts.length}, 1fr)` }">
              <img class="how-to-play__symbol" :src="entry.icon" :alt="entry.symbol" />
              <span v-for="count in paytableCounts" :key="count">{{ entry.multipliers[count] ?? '-' }}</span>
            </div>
          </template>
          <p v-else class="how-to-play__empty">暂无赔率数据</p>
        </div>

        <div
          v-else-if="activeTab === '免费游戏'"
          class="how-to-play__free-game"
          @touchstart="startTouchScroll"
          @touchmove="moveTouchScroll"
          @touchend="endTouchScroll"
          @touchcancel="endTouchScroll"
        >
          <template v-if="freeGames.length">
            <p class="how-to-play__free-intro">{{ scatterName }} 出现在任意位置可触发免费游戏：</p>
            <div class="how-to-play__free-table">
              <div class="how-to-play__free-row how-to-play__free-row--head">
                <span>{{ scatterName }}</span>
                <span>免费局</span>
              </div>
              <div v-for="entry in freeGames" :key="entry.scatter" class="how-to-play__free-row">
                <span>{{ entry.scatter }}</span>
                <span>{{ entry.spins }}</span>
              </div>
            </div>
            <p v-if="wildName" class="how-to-play__free-note">{{ wildName }} 可替代普通符号（{{ scatterName }} 除外）。</p>
          </template>
          <p v-else class="how-to-play__empty">暂无免费游戏数据</p>
        </div>

        <div
          v-else
          class="how-to-play__lines"
          @touchstart="startTouchScroll"
          @touchmove="moveTouchScroll"
          @touchend="endTouchScroll"
          @touchcancel="endTouchScroll"
        >
          <template v-if="paylines.length">
            <p class="how-to-play__lines-intro">从左至右，滚轮上连续相同符号经过下列路径即形成中奖连线。</p>
            <p class="how-to-play__lines-total">共 {{ paylines.length }} 条连线</p>
            <div v-for="line in paylines" :key="line.id" class="how-to-play__line-example">
              <div class="how-to-play__line-heading">
                <span>{{ line.name }}</span>
                <span>{{ line.line_type }}</span>
              </div>
              <div class="how-to-play__line-grid"
                :style="{ gridTemplateColumns: `repeat(${lineColumns}, 1fr)`, gridTemplateRows: `repeat(${lineRows}, 1fr)` }">
                <svg class="how-to-play__line-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline :points="linePoints(line.positions)" />
                </svg>
                <span v-for="cell in lineRows * lineColumns" :key="cell" class="how-to-play__line-cell"
                  :class="{ 'is-active': isLinePosition(line.positions, cell) }">
                  <img
                    v-if="isLinePosition(line.positions, cell)"
                    class="how-to-play__line-symbol how-to-play__line-symbol--active"
                    :src="paylineSymbols.active"
                    alt=""
                  />
                  <img
                    v-else
                    class="how-to-play__line-symbol"
                    :src="paylineSymbols.idle[(cell - 1) % paylineSymbols.idle.length]"
                    alt=""
                  />
                </span>
              </div>
            </div>
          </template>
          <p v-else class="how-to-play__empty">暂无连线数据</p>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GameDetail } from '@/api'
import { useTouchScroll } from '@/component/modules/useTouchScroll'
import paylineSun from '@/assets/images/wf/payline-sun.webp'
import paylineLotus from '@/assets/images/wf/payline-lotus.webp'
import paylineDiamond from '@/assets/images/wf/payline-diamond.webp'
import paylineSpade from '@/assets/images/wf/payline-spade.webp'
import paylineClub from '@/assets/images/wf/payline-club.webp'
import paylineBackground from '@/assets/images/wf/BG.webp'
import paylineIconBackground from '@/assets/images/wf/icon_bg.webp'

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ close: [] }>()
const props = defineProps<{ game: GameDetail | null; iconMap: Record<string, string> }>()

// 预加载赔率表图标（本地 iconMap 资源），避免打开弹窗时图标先空白再显示
watch(() => props.iconMap, (iconMap) => {
  for (const src of Object.values(iconMap)) {
    if (src) new Image().src = src
  }
}, { immediate: true })

const tabs = ['赔率表', '免费游戏', '连线'] as const
const activeTab = ref<(typeof tabs)[number]>('赔率表')

const { startTouchScroll, moveTouchScroll, endTouchScroll } = useTouchScroll()

const paytableCounts = computed(() => [...new Set(props.game?.paytable_summary.map(entry => entry.count) ?? [])].sort((a, b) => a - b))

const paytable = computed(() => {
  const entries = new Map<string, { symbol: string; icon: string; multipliers: Record<number, number> }>()

  for (const item of props.game?.paytable_summary ?? []) {
    const iconUrl = props.iconMap?.[item.icon] || ''
    const entry = entries.get(item.icon) ?? {
      symbol: item.icon,
      icon: iconUrl,
      multipliers: {},
    }
    entry.multipliers[item.count] = item.multiplier
    entries.set(item.icon, entry)
  }

  return [...entries.values()]
})

const scatterName = computed(() => props.game?.icons.find(icon => icon.is_scatter === 1)?.name || 'SCATTER')
const wildName = computed(() => props.game?.icons.find(icon => icon.is_wild === 1)?.name || '')
const freeGames = computed(() => [...(props.game?.free_spin_rules ?? [])]
  .sort((a, b) => a.scatter_count - b.scatter_count)
  .map(rule => ({
  scatter: String(rule.scatter_count),
  spins: String(rule.free_spins),
  })))

const lineRows = computed(() => props.game?.rows ?? 3)
const lineColumns = computed(() => props.game?.cols ?? 5)
const paylines = computed(() => [...(props.game?.paylines ?? [])].sort((a, b) => a.sort_order - b.sort_order))
const paylineSymbols = {
  active: paylineSun,
  idle: [paylineDiamond, paylineClub, paylineSpade, paylineLotus],
}

// 游戏进入时预加载连线页素材，在弹窗打开前完成。
for (const src of [paylineBackground, paylineIconBackground, paylineSun, ...paylineSymbols.idle]) {
  new Image().src = src
}

function isLinePosition(positions: [number, number][], cell: number): boolean {
  const row = Math.floor((cell - 1) / lineColumns.value)
  const column = (cell - 1) % lineColumns.value
  return positions.some(([positionRow, positionColumn]) => positionRow === row && positionColumn === column)
}

function linePoints(positions: [number, number][]): string {
  // 将 SVG 路径对齐到 CSS 网格单元格的视觉中心。
  const padding = 6.8
  const columnGap = 1.2
  const rowGap = 1.75
  const cellWidth = (100 - padding * 2 - columnGap * (lineColumns.value - 1)) / lineColumns.value
  const cellHeight = (100 - padding * 2 - rowGap * (lineRows.value - 1)) / lineRows.value

  return positions.map(([row, column]) => {
    const x = padding + cellWidth / 2 + column * (cellWidth + columnGap)
    const y = padding + cellHeight / 2 + row * (cellHeight + rowGap)
    return `${x},${y}`
  }).join(' ')
}

function close() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.how-to-play {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 5dvh 3vw;
  background: rgb(0 0 0 / 65%);
}

.how-to-play__panel {
  container-type: inline-size;
  position: relative;
  width: min(94vw, calc(90dvh * 705 / 1106), 705px);
  height: min(calc(94vw * 1106 / 705), 90dvh, 1106px);
  padding: 9.2% 7.1% 7%;
  color: #f8e69e;
  background: url('../../assets/images/HandH_BG.webp') center / 100% 100% no-repeat;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

.how-to-play__panel--free-game {
  width: min(94vw, calc(90dvh * 705 / 824), 705px);
  height: min(calc(94vw * 824 / 705), 90dvh, 824px);
  padding: 8.4% 5% 7%;
}

/* Figma 连线内容在 705px 弹窗内宽 636px。 */
.how-to-play__panel--lines {
  padding-right: 4.9%;
  padding-left: 4.9%;
}
.how-to-play__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 8.2cqw;
}

.how-to-play__header h2 {
  margin: 0;
  font-size: 5.7cqw;
  font-weight: 600;
  line-height: 1;
}

.how-to-play__close {
  display: grid;
  width: 6.8cqw;
  height: 6.8cqw;
  place-items: center;
  padding: 0;
  color: #ffc452;
  border: 0.35cqw solid #bd811d;
  border-radius: 50%;
  background: #111b35;
  font-size: 5.8cqw;
  line-height: 1;
  cursor: pointer;
}

.how-to-play__tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1cqw;
  margin-top: 5.4%;
}

.how-to-play__tab {
  height: 10.8cqw;
  padding: 0;
  color: #f0dbbd;
  border: 0;
  background: url('../../assets/images/game-frame-22.webp') center / 100% 100% no-repeat;
  font: 600 3.4cqw/1 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  cursor: pointer;
}

.how-to-play__tab.is-active {
  background-image: url('../../assets/images/game-frame-24.webp');
}

.how-to-play__tab.is-active .how-to-play__tab-label {
  color: transparent;
  background: linear-gradient(180deg, #f8e69e 0%, #fec452 100%);
  background-clip: text;
  -webkit-background-clip: text;
}
.how-to-play__paytable,
.how-to-play__free-game,
.how-to-play__lines {
  min-height: 0;
  align-self: stretch;
  overflow-x: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  transform: translateZ(0);
}

.how-to-play__paytable {
  margin-top: 5.5%;
}

.how-to-play__row {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  align-items: center;
  min-height: 12.45cqw;
  border-bottom: 0.18cqw solid #18223e;
  text-align: center;
  font-family: 'IBM Plex Serif', Georgia, serif;
  font-size: 3.4cqw;
  font-weight: 700;
}

.how-to-play__row--head {
  min-height: 11.6cqw;
  color: #fec452;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  font-size: 3.7cqw;
  font-weight: 500;
  background: transparent;
}

.how-to-play__symbol {
  justify-self: center;
  width: 8.6cqw;
  height: 8.6cqw;
  object-fit: contain;
}

.how-to-play__free-game {
  margin-top: 3.4cqw;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
}

.how-to-play__free-intro {
  margin: 0;
  color: transparent;
  background: linear-gradient(180deg, #f8e69e 0%, #fec452 100%);
  background-clip: text;
  -webkit-background-clip: text;
  font-size: 3.45cqw;
  font-weight: 500;
  line-height: 1.5;
}

.how-to-play__free-table {
  width: 89%;
  margin: 4.55cqw auto 0;
}

.how-to-play__free-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  min-height: 12.48cqw;
  align-items: center;
  border-bottom: 0.18cqw solid #18223e;
  color: transparent;
  text-align: center;
  background: linear-gradient(180deg, #f8e69e 0%, #fec452 100%);
  background-clip: text;
  -webkit-background-clip: text;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  font-size: 3.4cqw;
  font-weight: 500;
}

.how-to-play__free-row:last-child {
  border-bottom: 0;
}

.how-to-play__free-row--head {
  min-height: 12.48cqw;
  font-size: 3.4cqw;
  font-weight: 500;
}

.how-to-play__free-note {
  margin: 3.4cqw 0 0;
  color: #263e69;
  font-size: 3.35cqw;
  line-height: 1.5;
}

.how-to-play__lines {
  margin-top: 5.4%;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  scrollbar-width: none;
}

.how-to-play__lines::-webkit-scrollbar { display: none; }

.how-to-play__lines-intro {
  margin: 0;
  color: transparent;
  background: linear-gradient(180deg, #f8e69e 0%, #fec452 100%);
  background-clip: text;
  -webkit-background-clip: text;
  font-size: 3.4cqw;
  font-weight: 500;
  line-height: 1.67;
}

.how-to-play__lines-total {
  margin: 1.7cqw 0 3.4cqw;
  color: #263e69;
  font-size: 3.4cqw;
  font-weight: 400;
}

.how-to-play__line-example {
  display: grid;
  justify-items: center;
  gap: 3.4cqw;
  margin-top: 4.5cqw;
}

.how-to-play__line-example:first-of-type {
  margin-top: 0;
}

.how-to-play__line-heading {
  display: flex;
  width: 100%;
  justify-content: space-between;
  color: #212e54;
  font-size: 3.55cqw;
  font-weight: 400;
  line-height: 1;
}

.how-to-play__line-heading span:first-child {
  color: transparent;
  background: linear-gradient(180deg, #f8e69e 0%, #fec452 100%);
  background-clip: text;
  -webkit-background-clip: text;
  font-weight: 500;
}

.how-to-play__lines,
.how-to-play__line-heading span:last-child {
  color: #263e69;
}

.how-to-play__line-grid {
  position: relative;
  display: grid;
  /* 仅缩小五列三行图标单元格之间的间距。 */
  gap: 0.2%;
  width: 66.4%;
  aspect-ratio: 422 / 267;
  padding: 3%;
  box-sizing: border-box;
  background: url('@/assets/images/wf/BG.webp') center / 100% 100% no-repeat;
}

.how-to-play__line-cell {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  margin: -8%;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: url('@/assets/images/wf/icon_bg.webp') center / 100% 100% no-repeat;
}

.how-to-play__line-cell.is-active {
  background-image: url('@/assets/images/wf/icon_bg.webp');
}

.how-to-play__line-path {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.how-to-play__line-path polyline {
  fill: none;
  stroke: #ffcf22;
  stroke-width: 1.05;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 0.42cqw #ffda06) drop-shadow(0 0 1.05cqw #ffb006) drop-shadow(0 0 2.1cqw #ff7e06);
}

.how-to-play__line-symbol {
  position: relative;
  z-index: 2;
  display: block;
  width: 55.56%;
  height: 55.56%;
  object-fit: contain;
  filter: none;
}

.how-to-play__line-symbol--active {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 108%;
  height: 108%;
  transform: translate3d(-50%, -50%, 0);
  filter: drop-shadow(0 0 0.2cqw rgb(255 183 20 / 60%));
}

.how-to-play__placeholder {
  display: grid;
  min-height: 65cqw;
  place-items: center;
  color: #f0dbbd;
  font-size: 4cqw;
}
.how-to-play__empty {
  display: grid;
  place-items: center;
  height: 100%;
  color: #f8e69e;
  font-size: 4cqw;
}
</style>
