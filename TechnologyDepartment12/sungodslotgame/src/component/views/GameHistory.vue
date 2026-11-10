<template>
  <Teleport to="body">
    <div v-if="visible" class="game-history" role="dialog" aria-modal="true" aria-labelledby="game-history-title" @click.self="close">
      <section class="game-history__panel">
        <header class="game-history__header">
          <h2 id="game-history-title">最近记录</h2>
          <button class="game-history__close" type="button" aria-label="关闭历史记录" @click="close">×</button>
        </header>

        <div v-if="loading || !hasLoaded" class="game-history__empty">加载中...</div>
        <div v-else-if="records.length === 0" class="game-history__empty">{{ errorMsg || '暂无记录' }}</div>
        <div
          v-else
          class="game-history__list"
          @scroll="loadMoreOnScroll"
          @touchstart="startTouchScroll"
          @touchmove="moveTouchScroll"
          @touchend="endTouchScroll"
          @touchcancel="endTouchScroll"
        >
          <article v-for="record in displayRecords" :key="record.spin_id" class="game-history__record">
            <time class="game-history__time" :datetime="record.created_at">
              <span>{{ record.date }}</span>
              <span>{{ record.time }}</span>
            </time>
            <div class="game-history__value">
              <span>投注：</span>
              <strong>₹ {{ formatAmount(record.bet_amount) }}</strong>
            </div>
            <div class="game-history__value">
              <span>赢得：</span>
              <strong :class="record.winCls">{{ record.winText }}</strong>
            </div>
          </article>
          <p v-if="loadingMore" class="game-history__loading-more">加载更多...</p>
          <p v-else-if="errorMsg" class="game-history__loading-more">{{ errorMsg }}</p>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getGameHistory } from '@/api'
import type { GameHistoryRecord } from '@/api'
import { centsToRupees } from '@/utils/useMoney'
import { useTouchScroll } from '@/component/modules/useTouchScroll'

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ close: [] }>()
const props = defineProps<{ gameId: number }>()

const records = ref<GameHistoryRecord[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasLoaded = ref(false)
const errorMsg = ref('')
const PAGE_SIZE = 20
let currentPage = 0
let totalPages = 0
let requestVersion = 0

const { startTouchScroll, moveTouchScroll, endTouchScroll } = useTouchScroll()

watch(visible, async (v) => {
  const version = ++requestVersion
  if (v && props.gameId) {
    hasLoaded.value = false
    loading.value = true
    loadingMore.value = false
    currentPage = 0
    totalPages = 0
    records.value = []
    try {
      const res = await getGameHistory(props.gameId, 1, PAGE_SIZE)
      if (version !== requestVersion || !visible.value) return
      records.value = res.list
      currentPage = res.pagination.page
      totalPages = res.pagination.total_pages
      errorMsg.value = ''
    } catch {
      if (version === requestVersion) {
        records.value = []
        errorMsg.value = 'Failed to load records, please try again'
      }
    } finally {
      if (version === requestVersion) {
        loading.value = false
        hasLoaded.value = true
      }
    }
  } else {
    records.value = []
    loading.value = false
    loadingMore.value = false
    hasLoaded.value = false
    errorMsg.value = ''
    currentPage = 0
    totalPages = 0
  }
}, { flush: 'sync' })

async function loadMoreOnScroll(event: Event): Promise<void> {
  const list = event.currentTarget as HTMLElement
  const reachedBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 80

  if (!reachedBottom || loading.value || loadingMore.value || currentPage >= totalPages) return

  loadingMore.value = true
  const version = requestVersion
  try {
    const res = await getGameHistory(props.gameId, currentPage + 1, PAGE_SIZE)
    if (version !== requestVersion || !visible.value) return

    const existingIds = new Set(records.value.map(record => record.spin_id))
    records.value.push(...res.list.filter(record => !existingIds.has(record.spin_id)))
    currentPage = res.pagination.page
    totalPages = res.pagination.total_pages
    errorMsg.value = ''
  } catch {
    if (version === requestVersion) errorMsg.value = 'Failed to load more'
  } finally {
    if (version === requestVersion) loadingMore.value = false
  }
}

function formatAmount(cents: number): string {
  return centsToRupees(cents).toFixed(2)
}

function formatWin(cents: number, isFree: number): { text: string; cls: string } {
  if (cents > 0) return { text: `+₹ ${formatAmount(cents)}${isFree ? '  Free' : ''}`, cls: 'is-win' }
  return { text: `-₹ ${formatAmount(Math.abs(cents))}`, cls: 'is-loss' }
}

const displayRecords = computed(() => records.value.map(record => {
  const [date, time = ''] = record.created_at.replace('T', ' ').split(' ')
  const win = formatWin(record.win_amount, record.is_free_spin)
  return { ...record, date, time: time.slice(0, 8), winText: win.text, winCls: win.cls }
}))

function close() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.game-history {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 5dvh 3vw;
  background: rgb(0 0 0 / 65%);
}

.game-history__panel {
  container-type: inline-size;
  width: min(94vw, calc(90dvh * 705 / 1106), 705px);
  height: min(calc(94vw * 1106 / 705), 90dvh, 1106px);
  padding: 9.2% 7.1% 7%;
  box-sizing: border-box;
  color: #f8e69e;
  background: url('../../assets/images/HandH_BG.webp') center / 100% 100% no-repeat;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
}

.game-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 8.2cqw;
}

.game-history__header h2 {
  margin: 0;
  font-size: 5.7cqw;
  font-weight: 600;
  line-height: 1;
}

.game-history__close {
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

.game-history__list {
  display: grid;
  align-content: start;
  gap: 3.5cqw;
  margin-top: 5.4%;
  min-height: 0;
  align-self: stretch;
  overflow-x: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  scrollbar-width: none;
  transform: translateZ(0);
}

.game-history__list::-webkit-scrollbar {
  display: none;
}

.game-history__empty {
  display: grid;
  place-items: center;
  min-height: 0;
  color: #f8e69e;
  font-size: 4cqw;
}

.game-history__loading-more {
  margin: 0;
  min-height: 6cqw;
  color: #f8e69e;
  font-size: 3.3cqw;
  line-height: 1.5;
  text-align: center;
}

.game-history__record {
  display: grid;
  grid-template-columns: repeat(3, auto);
  align-items: center;
  justify-content: space-evenly;
  min-height: 21.3cqw;
  padding: 0 5cqw;
  box-sizing: border-box;
  background: url('../../assets/images/game-frame-58.webp') center / 100% 100% no-repeat;
  font-family: 'IBM Plex Serif', Georgia, serif;
  font-size: 3.25cqw;
  font-weight: 700;
  line-height: 1.45;
}

.game-history__time {
  display: grid;
  justify-items: center;
  color: #f8e69e;
  font-family: 'IBM Plex Sans Thai Looped', 'Microsoft YaHei', sans-serif;
  font-size: 3.15cqw;
  font-weight: 400;
}

.game-history__value {
  display: grid;
  gap: 0.2cqw;
  justify-items: center;
  text-align: center;
}

.game-history__value span {
  color: #f8e69e;
}

.game-history__value strong {
  font-size: 3.25cqw;
  white-space: nowrap;
}

.game-history__value .is-win {
  color: #58ee31;
}

.game-history__value .is-loss {
  color: #ff4c4c;
}
</style>
