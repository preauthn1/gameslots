<template>
  <main class="lobby-page">
    <header class="topbar">
      <div class="brand">游戏<br />大厅</div>
      <div class="balance">
        <span class="balance-label">余额</span>
        <strong>₹ {{ formattedBalance }}</strong>
      </div>
    </header>

    <section class="game-list" aria-label="游戏列表">
      <article v-for="game in games" :key="game.name" class="game-card">
        <div class="game-art" :class="game.artClass">
          <div class="art-shade"></div>
         <span v-if="game.tag" class="game-tag">{{ game.tag }}</span>
        </div>
        <div class="game-info">
          <h1>{{ game.name }}</h1>
          <p>{{ game.description }}</p>
          <button type="button" class="play-button" :disabled="loading" @click="openGame(game.path)">
            {{ game.action }}
          </button>
        </div>
      </article>
    </section>

    <nav class="bottom-nav" aria-label="主导航">
      <button type="button" class="nav-item active" aria-current="page">
        <span class="nav-icon home-icon"></span>
        <span>大厅</span>
     </button>
    </nav>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getBalance, getGames } from '@/api'
import { isGameLoading } from '@/component/modules/loadingState'
import { centsToRupees } from '@/utils/useMoney'

interface GameItem {
  name: string
  description: string
  tag: string
  artClass: string
  action: string
  path: string
}

const router = useRouter()
const balance = ref(0)
const loading = ref(false)

// 游戏 ID → 路由与样式映射（当前两种玩法固定）
const GAME_ROUTES: Record<number, { path: string; artClass: string }> = {
  1: { path: '/home', artClass: 'sun-god-art' },
  2: { path: '/mahjong', artClass: 'mahjong-art' },
}

const FALLBACK_GAMES: GameItem[] = [
  { name: '经典老虎机', description: 'Sun God Golden Chariot', tag: '热门', artClass: 'sun-god-art', action: '开始游戏', path: '/home' },
  { name: '麻将胡了', description: '经典麻将，幸运开局', tag: '火爆', artClass: 'mahjong-art', action: '开始游戏', path: '/mahjong' },
]

const games = ref<GameItem[]>(FALLBACK_GAMES)

const formattedBalance = computed(() => balance.value.toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}))

onMounted(async () => {
  try {
    const data = await getBalance()
    balance.value = centsToRupees(data.balance)
  } catch {
    balance.value = 0
  }
  try {
    const res = await getGames()
    const list = res.list
      .filter(g => GAME_ROUTES[g.id])
      .map<GameItem>(g => ({
        name: g.name,
        description: g.code,
        tag: g.is_hot ? '热门' : '',
        artClass: GAME_ROUTES[g.id].artClass,
        action: '开始游戏',
        path: GAME_ROUTES[g.id].path,
      }))
    if (list.length > 0) games.value = list
  } catch {
  // 接口不可用时保留默认列表
  }
})

function openGame(path: string): void {
  if (!path || loading.value) return
  loading.value = true
  isGameLoading.value = true
  router.push(path)
}
</script>

<style scoped>
.lobby-page {
  --ink: #0e1430;
  --panel: #162347;
  --gold: #e0a814;
  min-height: 100dvh;
  color: #fff;
  background: radial-gradient(circle at 50% -10%, #273b76 0, #111a38 36%, var(--ink) 74%);
  padding-bottom: 88px;
  box-sizing: border-box;
}

.topbar {
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  background: rgba(19, 24, 52, 0.96);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  font-size: 19px;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: 0.03em;
}

.balance {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-left: auto;
  color: var(--gold);
}

.balance-label {
  font-size: 12px;
  color: #9ba8ca;
}

.balance strong {
  font-size: 16px;
}

.game-list {
  width: min(100% - 36px, 560px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 12px auto 0;
  height: calc(100dvh - 74px - 74px - 24px);
}

.game-card {
  flex: 1;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.26);
  display: flex;
  flex-direction: column;
}

.game-art {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #10172f;
  min-height: 0;
}

.game-art::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('../assets/images/BG.webp');
  background-repeat: no-repeat;
  transition: transform 0.25s ease;
}

.game-card:hover .game-art::before {
  transform: scale(1.04);
}

.sun-god-art::before {
  background-size: 100%;
  background-position: center 42%;
}

.mahjong-art::before {
  background-size: 118%;
  background-position: center 78%;
  filter: hue-rotate(100deg) saturate(0.72);
}

.art-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(10, 13, 32, 0.7), transparent 48%, rgba(10, 13, 32, 0.35)), linear-gradient(0deg, rgba(10, 14, 34, 0.72), transparent 62%);
}

.game-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 9px;
  font-size: 12px;
  font-weight: 700;
  color: #171528;
  background: var(--gold);
  border-radius: 99px;
}

.game-info {
  padding: 16px 18px 18px;
}

.game-info h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
}

.game-info p {
  margin: 6px 0 15px;
  font-size: 13px;
  color: #aab6d7;
}

.play-button {
  width: 100%;
  height: 42px;
  color: #171528;
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(100deg, #d89e0c, #f2c52a);
  border: 0;
  border-radius: 9px;
  cursor: pointer;
}

.play-button:active {
  transform: translateY(1px);
}

.bottom-nav {
  position: fixed;
  z-index: 2;
  bottom: 0;
  left: 0;
  right: 0;
  height: 74px;
  display: flex;
  justify-content: space-around;
  background: rgba(19, 24, 52, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-item {
  flex: 1;
  display: grid;
  place-content: center;
  gap: 5px;
  color: #8994b7;
  font-size: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.nav-item.active {
  color: var(--gold);
}

.nav-icon {
  width: 21px;
  height: 19px;
  display: block;
  margin: auto;
  position: relative;
}

.home-icon {
  border: 2px solid currentColor;
  border-top: 0;
  border-radius: 2px;
  margin-top: 5px;
}

.home-icon::before {
  content: '';
  position: absolute;
  width: 13px;
  height: 13px;
  border-top: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
  top: -8px;
  left: 2px;
}

.wallet-icon {
  border: 2px solid currentColor;
  border-radius: 5px;
}

.wallet-icon::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  right: 3px;
  top: 5px;
}

.profile-icon {
  border: 2px solid currentColor;
  border-radius: 50% 50% 40% 40%;
  width: 11px;
  height: 11px;
  margin-bottom: 5px;
}

.profile-icon::after {
  content: '';
  position: absolute;
  width: 19px;
  height: 8px;
  border: 2px solid currentColor;
  border-bottom: 0;
  border-radius: 12px 12px 0 0;
  left: -6px;
  top: 12px;
}

@media (min-width: 640px) {
  .game-list {
    margin-top: 34px;
  }

  .game-art {
    flex: 1 1 auto;
  }

  .bottom-nav {
    left: 50%;
    right: auto;
    width: 560px;
    transform: translateX(-50%);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
