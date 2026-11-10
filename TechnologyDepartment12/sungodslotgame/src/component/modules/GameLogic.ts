import { Assets, Container, Sprite, Texture } from 'pixi.js'
import type { FederatedPointerEvent } from 'pixi.js'
import gsap from 'gsap'
import { GameRenderer, SymbolDef, SpinCallback, ClickCallback, STRIP, R, formatINR } from './GameRenderer'
import type { ResponsiveState } from './ResponsiveManager'
import type { SpinData, WinDetail } from '@/api'
import { gameSound } from './audio/GameSound'
import { gameMusic } from './audio/GameMusic'
import { centsToRupees } from '@/utils/useMoney'

import BIGWIN_BG_IMG from '../../assets/images/bigWin_bg.webp'
import BIGWIN_IMG from '../../assets/images/bigWin.webp'
import EPICWIN_BG_IMG from '../../assets/images/epicWin_bg.webp'
import EPICWIN_IMG from '../../assets/images/epicWin.webp'
import MEGAWIN_BG_IMG from '../../assets/images/megaWin_bg.webp'
import MEGAWIN_IMG from '../../assets/images/megaWin.webp'
import SUPERWIN_BG_IMG from '../../assets/images/superWin_bg.webp'
import SUPERWIN_IMG from '../../assets/images/superWin.webp'
import WIN_BG_IMG from '../../assets/images/wiin_bg.webp'

const WIN_BG_MAP: Record<string, string> = {
  'Big win': BIGWIN_BG_IMG, 'Epic win': EPICWIN_BG_IMG,
  'Mega win': MEGAWIN_BG_IMG, 'Super win': SUPERWIN_BG_IMG,
}
const WIN_TITLE_MAP: Record<string, string> = {
  'Big win': BIGWIN_IMG, 'Epic win': EPICWIN_IMG,
  'Mega win': MEGAWIN_IMG, 'Super win': SUPERWIN_IMG,
}
// 普通与一级快速模式每次滚动轮次的时长。
const REEL_SCROLL_DURATION = 1.15
// 二级快速模式：接口未返回时短循环；结果返回后统一落盘。
const TURBO_WAIT_CYCLE_DURATION = 0.3
const TURBO_LANDING_DURATION = 0.35
const TURBO_SPECIAL_LANDING_DURATION = 0.95

export class GameLogic {
  protected r!: GameRenderer
  protected keys: string[] = []
  private grid: string[][] = [[], [], [], [], []]
  private busy = false
  private cb: SpinCallback | null = null
  private autoSpin = false
  private autoTimer: number | null = null
  private turboLevel = 0 // 0:正常 1:快 2:极快
  private bigWinVisible = false
  private bigWinClosing = false
  private resolveBigWinClosed: (() => void) | null = null
  private bigWinTimer: number | null = null
  private freeSpinTimer: number | null = null
  protected fadeDone: Promise<void> = Promise.resolve()
  private selectedBetIndex = 5
  private betOpts: number[] = []
  private pendingServerResult: SpinData | null = null
  private turboSpinActive = false
  private turboLandingStarted = false
  private turboWaitCycleActive = false
  private turboCycleId = 0
  private scatterKey = 'SCATTER'


  get selectedBet(): number { return this.betOpts[this.selectedBetIndex] ?? 0 }

  private get rowCount(): number { return this.r.rowCount }

  onSpin?: ClickCallback
  onBet?: () => void
  onBack?: ClickCallback
  onSettings?: ClickCallback
  onMultiplierChange?: (value: number) => void
  onFreeSpinChange?: (remaining: number) => void

  get stage() { return this.r.stage }

  /** 子类覆写以注入游戏专属渲染选项 */
  protected getClipWinnerCells(): boolean { return false }

  /** 子类可隐藏不适用的倍率栏，默认保持显示。 */
  protected getShowMultiplier(): boolean { return true }

  /** 连消类玩法必须在开始下一次旋转前完成中奖展示。 */
  protected getWaitForWinnerSequence(): boolean { return false }

  /** 子类覆写以注入游戏专属渲染器 */
  protected createRenderer(): GameRenderer { return new GameRenderer() }

  async init(canvas: HTMLCanvasElement, symbols: SymbolDef[], callbacks?: {
    onSpin?: ClickCallback; onBet?: () => void; onBack?: ClickCallback; onSettings?: ClickCallback; onSpinComplete?: SpinCallback; onMultiplierChange?: (value: number) => void; onFreeSpinChange?: (remaining: number) => void
  }): Promise<void> {
    this.keys = symbols.map(s => s.key)
    if (callbacks) {
      this.onSpin = callbacks.onSpin
      this.onBet = callbacks.onBet
      this.onBack = callbacks.onBack
      this.onSettings = callbacks.onSettings
      this.cb = callbacks.onSpinComplete ?? null
      this.onMultiplierChange = callbacks.onMultiplierChange
      this.onFreeSpinChange = callbacks.onFreeSpinChange
    }

    this.r = this.createRenderer()
    await this.r.init(canvas, symbols, {
      clipWinnerCells: this.getClipWinnerCells(),
      showMultiplier: this.getShowMultiplier(),
    })

    // 绑定交互事件
    this.r.stage.on('pointerdown', () => { gameSound.unlock(); gameMusic.unlock() })
    this.r.settingsBtn.on('pointerdown', (event) => {
      event.stopPropagation()
      gameSound.play('click')
      this.onSettings?.()
    })
    this.r.spinBtn.on('pointertap', () => { if (!this.busy) { gameSound.play('spin'); this.onSpin?.() } })
    this.r.betBtn.on('pointerdown', () => { gameSound.play('click'); this.onBet?.() })
    this.r.backBtn.on('pointertap', () => { gameSound.play('click'); this.onBack?.() })
    this.r.autoIcon.on('pointertap', () => { gameSound.play('click'); this.toggleAutoSpin() })
    this.r.turboBtn.on('pointertap', () => { gameSound.play('click'); this.toggleTurbo() })
    this.r.turboSwitch.on('pointertap', () => { gameSound.play('click'); this.toggleTurbo() })
    this.r.betOptionTexts.forEach((t) => {
      t.off('pointertap')
    })

    this.r.multiPanel.setOnChange((value) => this.onMultiplierChange?.(value))

    // 投注菜单：点击外部关闭
    const betHit = this.r.betMenu.children[0]
    // 投注面板在设计分辨率下的命中区域边界
    const BET_PANEL = { left: 19, top: 1069, right: 377, bottom: 1308 }
    betHit.on('pointertap', (e: FederatedPointerEvent) => {
      const p = e.global
      const insidePanel = p.x >= BET_PANEL.left && p.x <= BET_PANEL.right && p.y >= BET_PANEL.top && p.y <= BET_PANEL.bottom
      if (!insidePanel) this.onBet?.()
    })

    // 原固定初始盘面先保留，后续如需恢复可打开。
    // this.r.randomizeStrips(this.keys, [
    //   ['10', 'J', 'Q'],
    //   ['K', 'A', '10'],
    //   ['WILD', 'Q', 'J'],
    //   ['A', 'K', 'WILD'],
    //   ['Q', '10', 'A'],
    // ])
    this.r.randomizeStrips(this.keys)
    this.readGrid()
    this.setSpinning(false)
    // 初始化阶段提前解码所有音效，避免首次交互时播放延迟
    void gameSound.preload()
  }

  // =========================================================================
  // 投注选项（init 后用 API 数据调用，金额单位 paise）
  // =========================================================================

  setBetOptions(options: number[]): void {
    this.betOpts = options
    this.r.rebuildBetGrid(options.length)
    this.r.betOptionTexts.forEach((t, i) => {
      const rupees = centsToRupees(options[i])
      t.text = rupees >= 1000 ? rupees.toLocaleString('en-US') : String(rupees)
      t.off('pointertap')
      t.on('pointertap', () => {
        gameSound.play('click')
        this.setBetText(rupees)
        this.selectedBetIndex = i
        this.onBet?.()
      })
    })
    const mid = Math.floor(options.length / 2)
    this.selectedBetIndex = mid
    this.setBetText(centsToRupees(options[mid]))
    this.r.updateBetSelected(mid)
  }

  // =========================================================================
  // 旋转
  // =========================================================================

  private getSpinColumns(grid: string[][]): string[][] {
    const keyMap = new Map<string, string>()
    for (const k of this.keys) keyMap.set(k.toLowerCase(), k)
    const resolve = (key: string): string => {
      const k = keyMap.get(key.toLowerCase())
      if (!k) throw new Error(`Unknown symbol in server grid: ${key}`)
      return k
    }

    // 以 R=5 为基准判断行列方向：第一维是5则为列主 [col][row]，否则为行主 [row][col] 转置
    const isColMajor = grid.length === R
    return Array.from({ length: R }, (_, c) =>
      Array.from({ length: this.rowCount }, (_, r) =>
        resolve(isColMajor ? grid[c][r] : grid[r][c])
      )
    )
  }

  spin(results: string[][]): void {
    if (this.busy) return
    this.setWin(0)
    this.r.multiPanel.reset()
    if (this.turboLevel === 2) {
      this.spinTurbo(results)
      return
    }

    this.busy = true
    this.setSpinning(true)
    this.clearWinners()
    gameSound.startRoll()

    let done = 0
    const onDone = () => {
      done++
      if (done === R) {
        gameSound.stopRoll()
        this.setSpinning(false)
        this.readGrid()
        if (this.getWaitForWinnerSequence()) {
          void this.finishSpin()
        } else {
          this.busy = false
          void this.finishSpin(false)
        }
      }
    }

    for (let r = 0; r < R; r++) {
      const strip = this.r.strips[r]
      const column = results[r] ?? []
      const offset = STRIP - this.rowCount

      // 在卷轴顶部追加新图标（结果 + 随机填充），旧图标纹理不动
      for (let i = offset - 1; i >= 0; i--) {
        const s = this.r.obtainSprite()
        s.anchor.set(0.5)
        s.y = i * this.r.cellStep + this.r.cellSize / 2
        const key = i < this.rowCount && this.keys.includes(column[i])
          ? column[i]
          : this.keys[Math.floor(Math.random() * this.keys.length)]
        this.r.applySymbol(s, key, this.r.colWidths[r])
        strip.addChildAt(s, 0)
      }

      // 旧图标下移给新图标让位，恢复 Mahjong 级联造成的位移/透明度/旋转
      for (let i = offset; i < strip.children.length; i++) {
        const s = strip.children[i] as Sprite
        gsap.killTweensOf(s)
        s.visible = true
        s.alpha = 1
        s.rotation = 0
        s.y = i * this.r.cellStep + this.r.cellSize / 2
      }

      // 上推卷轴使新图标在屏幕外，旧图标从顶部可见区域开始
      strip.y = this.r.reelY - offset * this.r.cellStep

      gsap.to(strip, {
        y: this.r.reelY,
        duration: (REEL_SCROLL_DURATION + r * 0.1) * this.getSpeedFactor(),
        delay: r * 0.05 * this.getSpeedFactor(),
        ease: 'none',
        onComplete: () => {
          // 显式对齐最终位置，防止 GSAP 浮点精度偏差
          strip.y = this.r.reelY
          for (let i = 0; i < offset; i++) {
            const last = strip.children[strip.children.length - 1]
            if (last) { strip.removeChild(last); last.destroy() }
          }
          this.verifyColumn(strip as Container, r, onDone)
        },
      })
    }
  }

  /**
   * 服务端结果到达前，每列独立继续循环。结果到达后，将该列盘面放在卷轴顶部的
   * 不可见区域，滚入正确位置后立即停下，绝不改写当前可见图标。
   */
  private verifyColumn(strip: Container, col: number, onDone: () => void): void {
    const expected = this.pendingServerResult
      ? this.getSpinColumns(this.pendingServerResult.grid)[col]
      : null

    // 下一轮的图标预置在可视区域外。接口结果已到达时直接使用结果，
    // 该轮结束后卷轴即停，避免在网络请求完成后再额外滚动一整轮。
    const offset = STRIP - this.rowCount
    for (let i = offset - 1; i >= 0; i--) {
      const s = new Sprite()
      s.anchor.set(0.5)
      s.y = i * this.r.cellStep + this.r.cellSize / 2
      const key = expected
        ? expected[i % this.rowCount]
        : this.keys[Math.floor(Math.random() * this.keys.length)]
      this.r.applySymbol(s, key, this.r.colWidths[col])
      strip.addChildAt(s, 0)
    }
    for (let i = offset; i < strip.children.length; i++) {
      (strip.children[i] as Sprite).y = i * this.r.cellStep + this.r.cellSize / 2
    }
    strip.y = this.r.reelY - offset * this.r.cellStep
    gsap.to(strip, {
      y: this.r.reelY,
      duration: (REEL_SCROLL_DURATION + col * 0.1) * this.getSpeedFactor(),
      ease: expected ? 'power1.out' : 'none',
      onComplete: () => {
        strip.y = this.r.reelY
        for (let i = 0; i < offset; i++) {
          const last = strip.children[strip.children.length - 1] as Sprite
          if (last) this.r.releaseSprite(last)
        }
          if (expected) {
            gameSound.play('reelStop')
            onDone()
          }
          else this.verifyColumn(strip, col, onDone)
      },
    })
  }

  /** 二级快速：所有卷轴同步短循环，结果一到便进入唯一一次同步落盘。 */
  private spinTurbo(results: string[][]): void {
    this.busy = true
    this.turboSpinActive = true
    this.turboLandingStarted = false
    this.setSpinning(true)
    this.clearWinners()
    gameSound.startRoll()

    if (this.pendingServerResult) this.startTurboLanding()
    else this.runTurboWaitCycle(results)
  }

  private runTurboWaitCycle(columns: string[][]): void {
    if (!this.turboSpinActive || this.turboLandingStarted) return
    if (this.pendingServerResult) {
      this.startTurboLanding()
      return
    }

    const cycleId = ++this.turboCycleId
    this.turboWaitCycleActive = true
    this.animateTurboColumns(columns, TURBO_WAIT_CYCLE_DURATION, 'none', cycleId, () => {
      if (cycleId !== this.turboCycleId || !this.turboSpinActive) return
      this.turboWaitCycleActive = false
      if (this.pendingServerResult) this.startTurboLanding()
      else this.runTurboWaitCycle(this.getRandomSpinColumns())
    })
  }

  private startTurboLanding(): void {
    const result = this.pendingServerResult
    if (!result || !this.turboSpinActive || this.turboLandingStarted) return

    this.turboLandingStarted = true
    if (!this.turboWaitCycleActive) {
      this.playTurboLandingFromRest(result)
      return
    }

    // 保留当前 strip.y，从正在向下移动的位置直接落盘，不能再推回顶部。
    const cycleId = ++this.turboCycleId
    const offset = STRIP - this.rowCount
    const columns = this.getSpinColumns(result.grid)
    const duration = this.isTurboSpecialResult(result)
      ? TURBO_SPECIAL_LANDING_DURATION
      : TURBO_LANDING_DURATION
    let done = 0

    this.r.strips.forEach((strip, col) => {
      gsap.killTweensOf(strip)
      this.applyTurboLandingResult(strip as Container, col, columns[col])
      gsap.to(strip, {
        y: this.r.reelY,
        duration,
        ease: 'power1.out',
        onComplete: () => {
          if (cycleId !== this.turboCycleId) return
          this.finishTurboColumn(strip as Container, offset)
          gameSound.play('reelStop')
          done++
          if (done !== R) return

          this.turboWaitCycleActive = false
          this.finishTurboSpin()
        },
      })
    })
  }

  /** 仅处理结果早于首个等待循环到达的极端情况。 */
  private playTurboLandingFromRest(result: SpinData): void {
    const cycleId = ++this.turboCycleId
    const duration = this.isTurboSpecialResult(result)
      ? TURBO_SPECIAL_LANDING_DURATION
      : TURBO_LANDING_DURATION

    this.animateTurboColumns(this.getSpinColumns(result.grid), duration, 'power1.out', cycleId, () => {
      if (cycleId !== this.turboCycleId || !this.turboSpinActive) return
      this.finishTurboSpin()
    })
  }

  private applyTurboLandingResult(strip: Container, col: number, column: string[]): void {
    for (let row = 0; row < this.rowCount; row++) {
      const sprite = strip.children[row] as Sprite | undefined
      const key = column[row] ?? this.keys[Math.floor(Math.random() * this.keys.length)]
      if (!sprite) continue
      gsap.killTweensOf(sprite)
      sprite.visible = true
      sprite.alpha = 1
      sprite.rotation = 0
      this.r.applySymbol(sprite, key, this.r.colWidths[col])
    }
  }

  private animateTurboColumns(
    columns: string[][],
    duration: number,
    ease: string,
    cycleId: number,
    onComplete: () => void,
  ): void {
    let done = 0
    for (let col = 0; col < R; col++) {
      const strip = this.r.strips[col] as Container
      const offset = this.prepareTurboColumn(strip, col, columns[col] ?? [])
      gsap.to(strip, {
        y: this.r.reelY,
        duration,
        ease,
        onComplete: () => {
          if (cycleId !== this.turboCycleId) return
          this.finishTurboColumn(strip, offset)
          gameSound.play('reelStop')
          done++
          if (done === R) onComplete()
        },
      })
    }
  }

  private prepareTurboColumn(strip: Container, col: number, column: string[]): number {
    const offset = STRIP - this.rowCount
    for (let i = offset - 1; i >= 0; i--) {
      const sprite = this.r.obtainSprite()
      sprite.anchor.set(0.5)
      sprite.y = i * this.r.cellStep + this.r.cellSize / 2
      const key = i < this.rowCount && this.keys.includes(column[i])
        ? column[i]
        : this.keys[Math.floor(Math.random() * this.keys.length)]
      this.r.applySymbol(sprite, key, this.r.colWidths[col])
      strip.addChildAt(sprite, 0)
    }

    for (let i = offset; i < strip.children.length; i++) {
      const sprite = strip.children[i] as Sprite
      gsap.killTweensOf(sprite)
      sprite.visible = true
      sprite.alpha = 1
      sprite.rotation = 0
      sprite.y = i * this.r.cellStep + this.r.cellSize / 2
    }
    strip.y = this.r.reelY - offset * this.r.cellStep
    return offset
  }

  private finishTurboColumn(strip: Container, offset: number): void {
    strip.y = this.r.reelY
    for (let i = 0; i < offset; i++) {
      const last = strip.children[strip.children.length - 1] as Sprite
      if (last) this.r.releaseSprite(last)
    }
  }

  private getRandomSpinColumns(): string[][] {
    return Array.from({ length: R }, () =>
      Array.from({ length: this.rowCount }, () => this.keys[Math.floor(Math.random() * this.keys.length)]),
    )
  }

  private isTurboSpecialResult(result: SpinData): boolean {
    const scatter = this.scatterKey.toLowerCase()
    const hasScatter = result.grid.some(column => column.some(key => key.toLowerCase() === scatter))
    return hasScatter
      || result.free_spin?.triggered
      || result.free_spin?.awarded > 0
      || result.jackpot?.won
      || (result.cascade_times ?? 0) > 0
  }

  private finishTurboSpin(): void {
    gameSound.stopRoll()
    this.turboSpinActive = false
    this.turboLandingStarted = false
    this.turboWaitCycleActive = false
    this.setSpinning(false)
    this.readGrid()
    if (this.getWaitForWinnerSequence()) {
      void this.finishSpin()
    } else {
      this.busy = false
      void this.finishSpin(false)
    }
  }

  private async finishSpin(releaseBusy = true): Promise<void> {
    await this.processResult()
    if (releaseBusy) this.busy = false
    this.cb?.(this.grid)
    if (this.freeSpinsRemaining > 0 && !this.bigWinVisible) {
      if (this.autoTimer !== null) window.clearTimeout(this.autoTimer)
      this.autoTimer = window.setTimeout(() => {
        this.autoTimer = null
        if (!this.busy && this.freeSpinsRemaining > 0 && !this.bigWinVisible) {
          this.onSpin?.()
        }
      }, 1200 * this.getSpeedFactor())
    } else {
      this.scheduleAutoSpin()
    }
  }

  // =========================================================================
  // 网格读取
  // =========================================================================

  private readGrid(): void {
    for (let r = 0; r < R; r++) {
      const strip = this.r.strips[r]
      const base = -(strip.y - this.r.reelY)
      for (let row = 0; row < this.rowCount; row++) {
        const i = Math.min(Math.round((base + row * this.r.cellStep) / this.r.cellStep), strip.children.length - 1)
        const sprite = strip.children[i] as Sprite
        const key = this.r.keyOfTexture(sprite.texture)
        if (key) this.grid[r][row] = key
      }
    }
  }

  // =========================================================================
  // 旋转结果处理
  // =========================================================================

  setSpinResult(result: SpinData): void {
    this.validateGrid(result.grid)
    this.pendingServerResult = result
    if (this.turboSpinActive) this.startTurboLanding()
  }

  /** 校验服务端盘面维度与符号，非法数据直接抛错，避免被静默改写。 */
  private validateGrid(grid: string[][]): void {
    const keySet = new Set(this.keys.map(k => k.toLowerCase()))
    const isColMajor = grid.length === R
    const check = (key: string): void => {
      if (typeof key !== 'string' || !keySet.has(key.toLowerCase())) {
        throw new Error(`Unknown symbol in server grid: ${key}`)
      }
    }
    if (isColMajor) {
      for (let c = 0; c < R; c++) {
        if (!Array.isArray(grid[c]) || grid[c].length < this.rowCount) throw new Error('Invalid server grid dimension')
        for (let r = 0; r < this.rowCount; r++) check(grid[c][r])
      }
    } else {
      for (let r = 0; r < this.rowCount; r++) {
        if (!Array.isArray(grid[r]) || grid[r].length < R) throw new Error('Invalid server grid dimension')
        for (let c = 0; c < R; c++) check(grid[r][c])
      }
    }
  }

  /** 中止当前旋转（接口失败时复位卷轴与状态），恢复可继续操作。 */
  cancelSpin(): void {
    this.pendingServerResult = null
    this.busy = false
    this.turboSpinActive = false
    this.turboLandingStarted = false
    this.turboWaitCycleActive = false
    this.turboCycleId++
    gameSound.stopRoll()
    this.setSpinning(false)

    for (const strip of this.r.strips) {
      gsap.killTweensOf(strip)
      while (strip.children.length > STRIP) {
        this.r.releaseSprite(strip.children[strip.children.length - 1] as Sprite)
      }
      strip.y = this.r.reelY
      for (const child of strip.children) {
        const s = child as Sprite
        s.visible = true
        s.alpha = 1
        s.rotation = 0
      }
    }
  }


  setScatterKey(scatterKey: string): void {
    this.scatterKey = scatterKey
  }

  /** 设置倍率列表（来自 engine_config.multiplier_trail，各游戏独立） */
  setMultiplierTrail(trail: number[]): void {
    this.r.multiPanel.setItems(trail)
  }

  randomSpin(): void {
    const cat = this.keys
    this.spin(Array.from({ length: R }, () =>
      Array.from({ length: this.rowCount }, () => cat[Math.floor(Math.random() * cat.length)]),
    ))
  }

  spinServerResult(grid: string[][]): void {
    this.spin(this.getSpinColumns(grid))
  }

  private async processResult(): Promise<void> {
    // 等待 API 结果（最长 3 秒），期间卷轴动画继续播放
    for (let i = 0; i < 60 && !this.pendingServerResult; i++) {
      await new Promise(r => setTimeout(r, 50))
    }
    const result = this.pendingServerResult
    this.pendingServerResult = null

    if (result) {
      this.readGrid()
      const winAmount = centsToRupees(result.win_amount)
      const finalBalance = centsToRupees(result.balance_after)

      // 麻将连消玩法每轮连消返回一个 WinDetail。先让各游戏专属逻辑
      // 逐轮展示，再回退到普通连线玩法使用的单结果展示。
      const playedCascadeRounds = await this.playCascadeRounds(result.wins)

      if (!playedCascadeRounds) {
        // 构建本地 key 映射（大小写不敏感）
        const keyMap = new Map<string, string>()
        for (const k of this.keys) keyMap.set(k.toLowerCase(), k)

        const wins = new Set<string>()
        for (const w of result.wins) {
          if (!keyMap.get(w.icon.toLowerCase())) continue
          for (const p of w.positions) {
            wins.add(`${p[1] + 1}-${p[0] + 1}`)
          }
        }
        this.setWinners(wins, result.wins)
        if (this.getWaitForWinnerSequence()) await this.fadeDone

        // 非逐轮连消玩法仍按后端汇总轮数推进倍率。
        await this.r.multiPanel.advanceTo(result.cascade_times ?? 0)
      }

      // 连消期间展示单轮奖金；所有轮次完成后回到本局总奖金。
      const bigWinLabel = this.getWinLabel(result)
      const popupAmount = result.jackpot?.won ? centsToRupees(result.jackpot.amount) : winAmount
      // 四种弹窗状态均为大奖：Big、Epic、Mega 与 Super。
      const isBigWin = bigWinLabel !== null && popupAmount > 0
      if (isBigWin) {
        this.markBigWinPending()
        gameSound.play('bigWin')
        await this.showBigWin(true, bigWinLabel, popupAmount)
      } else if (winAmount > 0) {
        gameSound.play('win')
      }
      // 在展示连线与中奖弹窗期间，保持底部为旋转前的数值。
      // 待该流程结束后再一次性提交两个总额。
      this.setBalance(finalBalance)
      this.setWin(winAmount)
      this.onWinAmountCommitted()

      // 免费局奖励完全以服务端为准，前端不做本地推导，避免账户状态与服务端不一致。
      const freeSpin = result.free_spin
      if (freeSpin?.triggered && freeSpin.awarded > 0) {
        // 如果大奖弹窗正在显示，等它结束
        if (this.bigWinVisible) {
          await new Promise<void>(resolve => setTimeout(resolve, 2500))
        }
        await this.showFreeSpin(freeSpin.awarded)
      } else if (freeSpin) {
        // 服务端提供剩余次数 → 使用真实数据
        this.setFreeSpinCount(freeSpin.remaining)
      }
    }
  }

  private getWinLabel(result: SpinData): string | null {
    if (result.jackpot?.won) return 'Super win'      // 中奖池 → Super win
    let maxMatch = 0
    for (const w of result.wins) {
      if (w.match_count > maxMatch) maxMatch = w.match_count
    }
    if (maxMatch >= 5) return 'Mega win'             // 最大连线数 ≥5
    if (maxMatch >= 4) return 'Epic win'             // 最大连线数 ≥4
    if (maxMatch >= 3) return 'Big win'              // 最大连线数 ≥3
    return null                                       // 非大奖
  }

  // =========================================================================
  // 中奖
  // =========================================================================

  protected setWinners(cells: Set<string>, _wins: WinDetail[] = []): void {
    this.fadeWinners()
    if (cells.size > 0) {
      this.r.addWinnerCells(cells)
      const prevDone = this.fadeDone
      this.fadeDone = prevDone.then(() => new Promise(r => setTimeout(r, 2000)))
    }
  }

  /** 供需要在底部总额处一并展示的游戏专属中奖详情使用。 */
  protected onWinAmountCommitted(): void {}

  /**
   * 支持连消的游戏覆写此方法以按顺序播放每个 WinDetail。
   * 当序列已处理时返回 true，从而跳过通用的静态中奖展示
   * 以及基于 cascade_times 的倍率动画。
   */
  protected async playCascadeRounds(_wins: WinDetail[]): Promise<boolean> {
    return false
  }

  clearWinners(): void {
    this.r.clearWinnerCells()
  }

  protected fadeWinners(): void {
    if (this.r.hasWinnerCells()) {
      this.r.clearWinnerCells()
      this.fadeDone = new Promise<void>(resolve => setTimeout(resolve, 400))
    } else {
      this.fadeDone = Promise.resolve()
    }
  }

  // =========================================================================
  // Big Win 弹窗
  // =========================================================================

  async showBigWin(show: boolean, label?: string, amount?: number): Promise<void> {
    if (this.bigWinTimer !== null) {
      window.clearTimeout(this.bigWinTimer)
      this.bigWinTimer = null
    }

    if (show && label && amount !== undefined) {
      const bgUrl = WIN_BG_MAP[label] ?? BIGWIN_BG_IMG
      const titleUrl = WIN_TITLE_MAP[label] ?? BIGWIN_IMG

      const [bgTex, titleTex, winBgTex] = await Promise.all([
        Assets.load<Texture>(bgUrl),
        Assets.load<Texture>(titleUrl),
        Assets.load<Texture>(WIN_BG_IMG),
      ])

      this.r.showBigWinPopup(bgTex, titleTex, winBgTex, amount)
      // 点击遮罩关闭弹窗
      const dim = this.r.bigWinPopup.children[0]
      dim.on('pointertap', () => this.showBigWin(false))
      this.bigWinVisible = true
      gameMusic.setDucked(true)
      this.bigWinTimer = window.setTimeout(() => {
        this.bigWinTimer = null
        void this.showBigWin(false)
      }, 8000)
      await new Promise<void>(resolve => { this.resolveBigWinClosed = resolve })
    } else {
      if (this.bigWinClosing) return
      this.bigWinClosing = true
      await this.r.hideBigWinPopup()
      this.bigWinVisible = false
      gameMusic.setDucked(false)
      gameSound.stop('bigWin')
      gameSound.play('bigWinEnd')
      this.bigWinClosing = false
      const resolveBigWinClosed = this.resolveBigWinClosed
      this.resolveBigWinClosed = null
      resolveBigWinClosed?.()
      if (this.freeSpinsRemaining > 0) {
        setTimeout(() => { if (!this.busy && this.freeSpinsRemaining > 0 && !this.bigWinVisible) this.onSpin?.() }, 500 * this.getSpeedFactor())
      } else if (this.autoSpin) {
        this.scheduleAutoSpin(0)
      }
    }
  }

  markBigWinPending(): void { this.bigWinVisible = true }

  // =========================================================================
  // 免费局弹窗
  // =========================================================================

  /** 免费剩余次数（-1 表示未触发） */
  freeSpinsRemaining = -1

  /** 更新免费旋转指示器（供外部初始化时同步状态） */
  setFreeSpinCount(count: number): void {
    this.freeSpinsRemaining = count
    this.r.setFreeSpinCount(count)
    this.onFreeSpinChange?.(count)
    if (count > 0 && !this.busy && this.autoTimer === null) {
      this.autoTimer = window.setTimeout(() => {
        this.autoTimer = null
        if (!this.busy && this.freeSpinsRemaining > 0 && !this.bigWinVisible) {
          this.onSpin?.()
        }
      }, 800)
    }
  }

  async showFreeSpin(spins: number): Promise<void> {
    // 已在使用免费旋转时触发新奖励 → 累加；首次触发 → 直接设置
    this.freeSpinsRemaining = this.freeSpinsRemaining > 0 ? this.freeSpinsRemaining + spins : spins
    this.onFreeSpinChange?.(this.freeSpinsRemaining)
    // 先播放转场动画
    this.r.showFreeSpinPopup(spins)
    gameSound.play('freeSpin')
    gameMusic.setDucked(true)
    this.bigWinVisible = true
    const video = this.r.freeSpinVideo
    await new Promise<void>(resolve => {
      const done = () => {
        if (this.freeSpinTimer !== null) {
          window.clearTimeout(this.freeSpinTimer)
          this.freeSpinTimer = null
        }
        video.removeEventListener('click', onClick)
        resolve()
      }
      const onClick = () => done()
      video.addEventListener('click', onClick, { once: true })
      this.freeSpinTimer = window.setTimeout(done, 4000)
    })
    this.hideFreeSpin()
    // 转场动画结束后再显示免费旋转指示器
    this.r.setFreeSpinCount(this.freeSpinsRemaining)
  }

  private hideFreeSpin(): void {
    if (this.freeSpinTimer !== null) {
      window.clearTimeout(this.freeSpinTimer)
      this.freeSpinTimer = null
    }
    this.r.hideFreeSpinPopup()
    this.bigWinVisible = false
    gameMusic.setDucked(false)
    if (this.autoSpin) this.scheduleAutoSpin(0)
  }

  // =========================================================================
  // 投注菜单
  // =========================================================================

  showBetMenu(show: boolean): void {
    this.r.betMenu.visible = show
    if (show) this.r.updateBetSelected(this.selectedBetIndex)
  }

  // =========================================================================
  // 自动旋转
  // =========================================================================

  private toggleAutoSpin(): void {
    this.autoSpin = !this.autoSpin
    gsap.killTweensOf(this.r.autoIcon)
    if (this.autoSpin) {
      this.r.autoIcon.texture = this.r.autoPauseTex
      gsap.to(this.r.autoIcon, { alpha: 0.75, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (!this.busy) this.scheduleAutoSpin(0)
    } else {
      this.r.autoIcon.texture = this.r.autoTex
      if (this.autoTimer !== null) window.clearTimeout(this.autoTimer)
      this.autoTimer = null
      this.r.autoIcon.rotation = 0
      this.r.autoIcon.alpha = 1
    }
  }

  private scheduleAutoSpin(delay = 600): void {
    if (!this.autoSpin || this.busy || !this.onSpin || this.bigWinVisible) return
    if (this.autoTimer !== null) window.clearTimeout(this.autoTimer)

    const go = () => {
      if (!this.autoSpin || this.busy || !this.onSpin || this.bigWinVisible) return
      this.autoTimer = window.setTimeout(() => {
        this.autoTimer = null
        if (this.autoSpin && !this.busy) this.onSpin?.()
      }, delay * this.getSpeedFactor())
    }

    this.fadeDone.then(() => {
      if (this.r.hasWinnerCells()) {
        this.fadeWinners()
        this.fadeDone.then(go)
      } else {
        go()
      }
    })
  }

  // =========================================================================
  // 加速
  // =========================================================================

  private toggleTurbo(): void {
    this.turboLevel = (this.turboLevel + 1) % 3
    this.r.turboIndicators.forEach((ind, i) => ind.visible = i < this.turboLevel)
  }

  private getSpeedFactor(): number {
    return [1, 0.65, 0.4][this.turboLevel]
  }

  // =========================================================================
  // 公开方法
  // =========================================================================

  setBetText(amount: number): void {
    this.r.betText.text = `Bet ₹ ${amount}`
    this.r.betText.scale.set(Math.min(1, 120 / this.r.betText.width))
  }

  setBalance(amount: number): void {
    const t = this.r.balanceText
    t.text = `₹ ${formatINR.format(amount)}`
    t.scale.set(Math.min(1, 244 / t.width))
  }

  setWin(amount: number): void {
    if (this.bigWinVisible) return
    this.r.setWinAmount(amount)
  }

  setSpinning(v: boolean): void {
    gsap.killTweensOf(this.r.spinCenter)
    this.r.spinCenter.rotation = 0
    const dur = v ? 0.3 : 6
    gsap.to(this.r.spinCenter, { rotation: Math.PI * 2, duration: dur, repeat: -1, ease: 'linear' })
  }

  // =========================================================================
  // 响应式缩放
  // =========================================================================

  /** 委托给 GameRenderer.resize()，同步视口变化到 PixiJS 渲染器 */
  resize(state: Readonly<ResponsiveState>): void {
    this.r.resize(state)
  }

  // =========================================================================
  // 销毁
  // =========================================================================

  destroy(): void {
    gameSound.stopRoll()
    if (this.autoTimer !== null) window.clearTimeout(this.autoTimer)
    if (this.bigWinTimer !== null) window.clearTimeout(this.bigWinTimer)
    if (this.freeSpinTimer !== null) window.clearTimeout(this.freeSpinTimer)
    if (!this.r) return
    gsap.killTweensOf(this.r.strips)
    gsap.killTweensOf(this.r.spinCenter)
    gsap.killTweensOf(this.r.autoIcon)
    this.r.destroy()
  }
}
