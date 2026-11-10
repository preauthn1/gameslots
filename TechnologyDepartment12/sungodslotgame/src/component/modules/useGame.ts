import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { SlotGameLogic } from './SlotGameLogic'
import { MahjongGameLogic } from './MahjongGameLogic'
import type { GameLogic } from './GameLogic'
import { getBalance, getGameDetail, spin, getFreeSpinState, getErrorMessage, ApiError } from '@/api'
import { gameMusic } from './audio/GameMusic'
import { isGameLoading } from './loadingState'
import { DW, DH } from './GameRenderer'
import { ResponsiveManager } from './ResponsiveManager'
import { centsToRupees } from '@/utils/useMoney'
import type { SymbolDef } from './GameRenderer'
import type { GameDetail, SpinData } from '@/api'

interface GameConfig {
  gameId: number
  iconMap: Record<string, string>
  apiSymbolKeys: Set<string>
  onSettings?: () => void
}

export function useGame(config: GameConfig, canvasRef: ReturnType<typeof ref<HTMLCanvasElement | null>>) {
  const router = useRouter()

  // ---- 响应式适配 ----
  const responsive = new ResponsiveManager({ designWidth: DW, designHeight: DH })
  const responsiveState = ref({ ...responsive.state })
  const overlayStyle = computed(() => {
    const { scale, offsetX, offsetY } = responsiveState.value
    return { transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})` }
  })
  let removeResponsiveListener: (() => void) | null = null
  let isDisposed = false

  // ---- 状态 ----
  const winAmount = ref(0)
  const isBetMenuOpen = ref(false)
  const isSpinning = ref(false)
  const isReady = ref(false)
  const errorMessage = ref('')
  const hasFreeSpins = ref(false)
  const gameDetail = ref<GameDetail | null>(null)
  const balance = ref(0)
  const balanceReady = ref(false)
  const freeSpinStateReady = ref(false)

  function showError(message: string): void {
    errorMessage.value = message
    setTimeout(() => { errorMessage.value = '' }, 3000)
  }

  let renderer: GameLogic | null = null
  let rendererReady = false

  async function preloadImages(urls: string[]): Promise<void> {
    await Promise.all(urls.filter(Boolean).map(url => new Promise<void>(resolve => {
      const image = new Image()
      image.onload = () => { void image.decode?.().catch(() => undefined).finally(resolve) }
      image.onerror = () => resolve()
      image.src = url
    })))
  }

  onMounted(async () => {
    const c = canvasRef.value
    if (!c) return

    removeResponsiveListener = responsive.onUpdate((state) => {
      responsiveState.value = { ...state }
      renderer?.resize(state)
    })
    responsive.start()

    void gameMusic.play()

    let scatterKey: string | undefined
    let betOptions: number[] | undefined
    let multiplierTrail: number[] | undefined

    try {
      const game = await getGameDetail(config.gameId)
      gameDetail.value = game
      scatterKey = game.icons.find(i => i.is_scatter === 1)?.code
      betOptions = game.bet_options
      multiplierTrail = (game.engine_config as { multiplier_trail?: number[] } | null)?.multiplier_trail
      await preloadImages(game.icons.map(icon => config.iconMap[icon.code] || icon.image_url))
    } catch {
      if (!isDisposed) {
        showError('Failed to load game config')
        isGameLoading.value = false
        gameMusic.stop()
        setTimeout(() => { void router.replace('/lobby') }, 1200)
      }
      return
    }

    if (isDisposed) return

    const symbols: SymbolDef[] = gameDetail.value.icons
      .filter(icon => config.apiSymbolKeys.has(icon.code))
      .map(icon => ({ key: icon.code, src: config.iconMap[icon.code] || icon.image_url }))
    const gameRenderer = config.gameId === 1 ? new SlotGameLogic() : new MahjongGameLogic()
    renderer = gameRenderer

    try {
      await gameRenderer.init(c, symbols, {
        onSpin: () => handleSpin(),
        onBet: () => { isBetMenuOpen.value = !isBetMenuOpen.value; renderer?.showBetMenu(isBetMenuOpen.value) },
        onBack: () => router.push('/lobby'),
        onSettings: config.onSettings,
        onFreeSpinChange: (remaining) => { hasFreeSpins.value = remaining > 0 },
        onSpinComplete: () => { isSpinning.value = false },
      })
    } catch {
      if (!isDisposed) {
        gameRenderer.destroy()
        if (renderer === gameRenderer) renderer = null
        showError('Failed to initialize game')
        isGameLoading.value = false
        gameMusic.stop()
        setTimeout(() => { void router.replace('/lobby') }, 1200)
      }
      return
    }

    if (isDisposed) {
      gameRenderer.destroy()
      if (renderer === gameRenderer) renderer = null
      return
    }
    rendererReady = true

    // 初始化完成后同步一次缩放状态
    gameRenderer.resize(responsive.state)

    if (scatterKey) gameRenderer.setScatterKey(scatterKey)
    if (betOptions) gameRenderer.setBetOptions(betOptions)
    if (multiplierTrail) gameRenderer.setMultiplierTrail(multiplierTrail)
    gameRenderer.setBalance(0)
    gameRenderer.setWin(winAmount.value)

    isReady.value = true
    isGameLoading.value = false

    void refreshBalance(gameRenderer)
    void refreshFreeSpinState(gameRenderer)
  })

  onBeforeUnmount(() => {
    isDisposed = true
    gameMusic.stop()
    removeResponsiveListener?.()
    removeResponsiveListener = null
    responsive.destroy()
    if (rendererReady) renderer?.destroy()
    renderer = null
  })

  async function handleSpin(): Promise<void> {
    if (isSpinning.value) return

    // 账户状态未就绪时（首次加载失败/尚未完成），触发重载作为重试入口
    if (!balanceReady.value || !freeSpinStateReady.value) {
      if (renderer) {
        const pending: Promise<boolean>[] = []
        if (!balanceReady.value) pending.push(refreshBalance(renderer))
        if (!freeSpinStateReady.value) pending.push(refreshFreeSpinState(renderer))
        await Promise.all(pending)
      }
      if (!balanceReady.value || !freeSpinStateReady.value) {
        showError('Account state unavailable, please retry')
        return
      }
    }

    const hasFreeSpins = (renderer?.freeSpinsRemaining ?? -1) > 0
    const bet = renderer?.selectedBet || 0
    if (!hasFreeSpins && bet > 0 && balance.value < bet) {
      showError('Insufficient balance')
      return
    }

    isSpinning.value = true
    renderer?.randomSpin()

    const params: { request_id: string; bet_amount: number; use_free_spin?: boolean } = {
      request_id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      bet_amount: bet,
    }
    if (hasFreeSpins) params.use_free_spin = true

    // 网络错误/超时使用相同 request_id 幂等重试，避免服务端已结算但前端未展示
    let result: SpinData | undefined
    let lastError: unknown = null
    for (let attempt = 0; attempt < 3 && !result; attempt++) {
      try {
        result = await spin(config.gameId, params)
      } catch (e) {
        lastError = e
        // 业务错误（有明确错误码）不重试；仅网络错误/超时（code -1）重试
        if (!(e instanceof ApiError && e.code === -1)) break
        if (attempt < 2) await new Promise(r => setTimeout(r, 250 * (attempt + 1)))
      }
    }

    if (!result) {
      if (isDisposed) return
      isSpinning.value = false
      renderer?.cancelSpin()
      showError(getErrorMessage(lastError))
      // 结果未知时强制刷新余额，避免显示与服务端不一致
      if (renderer) void refreshBalance(renderer)
      return
    }

    if (isDisposed) return
    try {
      renderer?.setSpinResult(result)
      // 盘面校验通过后再更新余额，避免"余额已变但盘面未动"的不一致
      balance.value = result.balance_after
    } catch {
      isSpinning.value = false
      renderer?.cancelSpin()
      showError('Invalid game result from server')
      if (renderer) void refreshBalance(renderer)
    }
  }

  async function refreshBalance(gameRenderer: GameLogic): Promise<boolean> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const bal = await getBalance()
        if (isDisposed || renderer !== gameRenderer) return false
        balance.value = bal.balance
        gameRenderer.setBalance(centsToRupees(bal.balance))
        balanceReady.value = true
        return true
      } catch {
        if (attempt < 2) await new Promise(r => setTimeout(r, 400 * (attempt + 1)))
      }
    }
    if (!isDisposed && renderer === gameRenderer) showError('Failed to load balance')
    return false
  }

  async function refreshFreeSpinState(gameRenderer: GameLogic): Promise<boolean> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const freeState = await getFreeSpinState(config.gameId)
        if (isDisposed || renderer !== gameRenderer) return false
        freeSpinStateReady.value = true
        if (freeState.remaining_spins > 0) gameRenderer.setFreeSpinCount(freeState.remaining_spins)
        return true
      } catch {
        if (attempt < 2) await new Promise(r => setTimeout(r, 400 * (attempt + 1)))
      }
    }
    if (!isDisposed && renderer === gameRenderer) showError('Failed to load free spins state')
    return false
  }

  function closeBetMenu(): boolean {
    if (!isBetMenuOpen.value) return false
    isBetMenuOpen.value = false
    renderer?.showBetMenu(false)
    return true
  }

  return { overlayStyle, isReady, errorMessage, hasFreeSpins, gameDetail, closeBetMenu }
}
