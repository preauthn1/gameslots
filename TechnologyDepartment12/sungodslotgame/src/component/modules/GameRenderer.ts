import { Application, Assets, Container, FillGradient, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js'
import gsap from 'gsap'
import { MultiplierPanel } from './MultiplierPanel'
import { SungodAnimation } from './sungod_anim/SungodAnimation'
import type { ResponsiveState } from './ResponsiveManager'

/** 最大设备像素比，覆盖常见移动端 3x 屏幕，同时限制 GPU 内存占用。 */
export const MAX_DPR = 3

// 静态资源导入（Vite 构建时处理）
import SUNGOD_IMG from '../../assets/images/sungod-character.webp'
import FRAME_IMG from '../../assets/images/game-frame.webp'
import LOGO_IMG from '../../assets/images/sungod-logo.webp'
import BACK_IMG from '../../assets/images/BACK_icon.webp'
import MULTI_SEL_IMG from '../../assets/images/multiplier-selector.webp'
import SETTINGS_IMG from '../../assets/images/settings.webp'
import BET_IMG from '../../assets/images/BET.webp'
import SPIN_IMG from '../../assets/images/SPIN_btn.webp'
import SPIN_CENTER_IMG from '../../assets/images/spin-button-center.webp'
import AUTO_IMG from '../../assets/images/auto-spin.webp'
import AUTO_PAUSE_IMG from '../../assets/images/auto-spin-paused.webp'
import TURBO_IMG from '../../assets/images/turbo.webp'
import TURBO_INDICATOR_IMG from '../../assets/images/turbo-indicator-bg.webp'
import TURBO_TRIANGLE_IMG from '../../assets/images/triangle.webp'
import PANEL_IMG from '../../assets/images/bet-panel.webp'
import BET_PANEL_IMG from '../../assets/images/bet-menu-panel.svg'
import BET_GRID_IMG from '../../assets/images/bet-menu-grid.svg'
import WIN_BG_IMG from '../../assets/images/wiin_bg.webp'
import FREE_SPINS_TITLE_BG_IMG from '../../assets/images/free-spins-title-bg.webp'
import FREE_SPINS_COUNT_BG_IMG from '../../assets/images/free-spins-count-bg.webp'
import FREE_SPINS_TEXT_IMG from '../../assets/images/free-spins-text.webp'
import TRANSITION_MP4 from '../../assets/gif/transition_750px.mp4'

export interface SymbolDef { key: string; src: string }

export interface GameRendererOptions {
  clipWinnerCells?: boolean
  showMultiplier?: boolean
}

export type SpinCallback = (grid: string[][]) => void
export type ClickCallback = () => void

// ---- Figma 常量 ----
export const DW = 750
export const DH = 1624
export const R = 5
const C = 3
export const CELL = 119.75
export const RGAP = 23.95
const REEL_LEFT = 17.02
export const FIGMA_COL_X = [0, 148.05, 300.46, 446.34, 595.48]
const SYMBOL_WIDTH_SCALE: Record<string, number> = { wheel: 0.9 }
export const STRIP = 30

// 渐变预设（PixiJS v8 FillGradient）
function goldGrad(): FillGradient {
  const g = new FillGradient({ start: { x: 0, y: 0 }, end: { x: 0, y: 1 } })
  g.addColorStop(0, 0xffffff)
  g.addColorStop(0.26, 0xfff3b6)
  g.addColorStop(0.84, 0xffcd44)
  g.addColorStop(1, 0xfff3b6)
  return g
}

const goldText: Partial<TextStyle> = { fill: 0xffcd44, fontWeight: '700', fontFamily: 'IBM Plex Serif' }
const whiteText: Partial<TextStyle> = { fill: 0xffffff, fontWeight: '700', fontFamily: 'IBM Plex Serif' }
const gradText: Partial<TextStyle> = { fill: { fill: goldGrad() }, fontWeight: '700', fontFamily: 'IBM Plex Serif' }

/** 金额格式化器（复用实例，避免 toLocaleString 每次创建） */
export const formatINR = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 静态资源 URL 与名称一一对应，用于 init() 中批量加载后按名存取
const ASSET_URLS = [SUNGOD_IMG, FRAME_IMG, LOGO_IMG, BACK_IMG, MULTI_SEL_IMG, SETTINGS_IMG, BET_IMG, SPIN_IMG, SPIN_CENTER_IMG, AUTO_IMG, AUTO_PAUSE_IMG, TURBO_IMG, TURBO_INDICATOR_IMG, TURBO_TRIANGLE_IMG, PANEL_IMG, BET_PANEL_IMG, BET_GRID_IMG, WIN_BG_IMG, FREE_SPINS_TITLE_BG_IMG, FREE_SPINS_COUNT_BG_IMG, FREE_SPINS_TEXT_IMG]
const ASSET_NAMES = ['sungod', 'frame', 'logo', 'back', 'multiSel', 'settings', 'bet', 'spin', 'spinCenter', 'auto', 'autoPause', 'turbo', 'turboIndicator', 'turboTriangle', 'panel', 'betPanel', 'betGrid', 'winBg', 'freeSpinsTitleBg', 'freeSpinsCountBg', 'freeSpinsText']

export class GameRenderer {
  private app!: Application
  private destroyed = false

  /** PixiJS 根容器（挂载在 app.stage 下，可缩放/位移以实现 PixiJS 级别适配） */
  protected root!: Container

  /** 游戏逻辑使用的设计稿坐标系根容器。 */
  get stage(): Container {
    return this.root
  }

  /** 卷轴行数（子类可覆写） */
  readonly rowCount: number = C

  /** 格子尺寸（子类可覆写） */
  readonly cellSize: number = CELL
  readonly cellGap: number = RGAP
  get cellStep() { return this.cellSize + this.cellGap }
  get colWidths() { return Array<number>(R).fill(this.cellSize) }
  /** 列X坐标（子类可覆写） */
  get colX() { return FIGMA_COL_X }
  /** 卷轴顶部Y坐标（子类可覆写） */
  readonly reelY: number = 707.49

  // 图层（公开供逻辑层访问）
  reelLayer!: Container
  popupLayer!: Container

  // 卷轴
  readonly strips: Container[] = []
  readonly tex = new Map<string, Texture>()
  /** Texture → key 反向索引（readGrid / 级联补位 O(1) 查表） */
  private readonly texReverse = new Map<Texture, string>()
  /** 旋转时临时精灵复用池，避免每次旋转反复 new/destroy */
  private readonly spritePool: Sprite[] = []

  // 交互元素
  spinBtn!: Container
  spinCenter!: Sprite
  autoIcon!: Sprite
  autoTex!: Texture
  autoPauseTex!: Texture
  turboBtn!: Sprite
  turboSwitch!: Container
  readonly turboIndicators: Sprite[] = []
  betBtn!: Sprite
  backBtn!: Sprite
  settingsBtn!: Sprite

  // 文本引用
  betText!: Text
  balanceText!: Text
  winText!: Text
  bigWinAmount!: Text
  private bigWinCounterTween?: gsap.core.Tween
  private bigWinTimeline?: gsap.core.Timeline
  private winDisplayLocked = false

  // 面板
  multiPanel!: MultiplierPanel
  betMenu!: Container
  betOptionTexts: Text[] = []
  private betGridY = 924
  bigWinPopup!: Container
  freeSpinVideo!: HTMLVideoElement
  private freeSpinIndicator!: Container
  private freeSpinIndicatorCount!: Text

  // 太阳神待机动画
  sungodAnim!: SungodAnimation

  // 图层（子类可通过 buildMiddleUI 访问）
  protected charLayer!: Container
  protected frameLayer!: Container
  protected winnerLayer!: Container
  protected multiLayer!: Container
  private ctrlLayer!: Container
  private panelLayer!: Container

  // =========================================================================
  // 初始化
  // =========================================================================

  async init(canvas: HTMLCanvasElement, symbols: SymbolDef[], options: GameRendererOptions = {}): Promise<void> {
    const symLoads = symbols.map(s => s.src ? Assets.load<Texture>(s.src) : Promise.resolve(Texture.EMPTY))
    const allLoads = [...symLoads, ...ASSET_URLS.map(u => Assets.load<Texture>(u))]
    const textures = await Promise.all(allLoads)
    symbols.forEach((s, i) => {
      if (s.src) {
        this.tex.set(s.key, textures[i])
        this.texReverse.set(textures[i], s.key)
      }
    })

    const assetTex = new Map<string, Texture>()
    ASSET_NAMES.forEach((name, i) => assetTex.set(name, textures[symbols.length + i]))

    this.app = new Application()
    await this.app.init({ canvas, width: DW, height: DH, backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, MAX_DPR), autoDensity: true })

    this.root = new Container()
    this.app.stage.addChild(this.root)

    this.charLayer = new Container(); this.root.addChild(this.charLayer)
    this.frameLayer = new Container(); this.root.addChild(this.frameLayer)
    this.reelLayer = new Container(); this.root.addChild(this.reelLayer)
    this.multiLayer = new Container(); this.root.addChild(this.multiLayer)
    this.ctrlLayer = new Container(); this.root.addChild(this.ctrlLayer)
    this.panelLayer = new Container(); this.root.addChild(this.panelLayer)
    this.popupLayer = new Container(); this.root.addChild(this.popupLayer)

    // 中间 UI（子类覆写）
    await this.buildMiddleUI(assetTex, options)
    // 共享 UI
    this.buildBackBtn(assetTex)
    this.buildMultiplier(assetTex)
    this.multiLayer.visible = options.showMultiplier ?? true
    this.buildControls(assetTex)
    this.buildPanels(assetTex)
    this.buildBetMenu(assetTex)
    this.buildBigWin()
    this.buildFreeSpin(assetTex)
  }

  // =========================================================================
  // 中间 UI（子类覆写以注入游戏专属渲染）
  // =========================================================================

  protected async buildMiddleUI(at: Map<string, Texture>, options: GameRendererOptions): Promise<void> {
    await this.buildChar(at)
    this.buildFrame(at)
    this.buildReels()
    this.buildWinnerLayer(options.clipWinnerCells ?? false)
  }

  // =========================================================================
  // 构建辅助方法
  // =========================================================================

  protected makeBtn(tex: Texture, x: number, y: number, w: number, h: number, parent: Container): Sprite {
    const s = new Sprite(tex)
    s.width = w; s.height = h; s.x = x; s.y = y
    s.eventMode = 'static'; s.cursor = 'pointer'
    parent.addChild(s)
    return s
  }

  makeText(text: string, x: number, y: number, fontSize: number, styleExtra: object = {}): Text {
    const t = new Text({
      text, style: new TextStyle({ fontSize, ...styleExtra }),
    })
    t.x = x; t.y = y
    return t
  }

  // =========================================================================
  // 角色
  // =========================================================================

  protected async buildChar(_at: Map<string, Texture>): Promise<void> {
    this.sungodAnim = new SungodAnimation()
    await this.sungodAnim.init()
    this.charLayer.addChild(this.sungodAnim.container)
    this.sungodAnim.play()
  }

  // =========================================================================
  // 边框 + Logo
  // =========================================================================

  protected buildFrame(at: Map<string, Texture>): void {
    const f = new Sprite(at.get('frame')!)
    f.anchor.set(0.5)
    f.width = DW; f.height = 952
    f.x = DW / 2; f.y = 812
    this.frameLayer.addChild(f)

    const logo = new Sprite(at.get('logo')!)
    logo.anchor.set(0.5)
    logo.width = 257; logo.height = 85
    logo.x = 377.5; logo.y = 473.5
    this.frameLayer.addChild(logo)
  }

  // =========================================================================
  // 返回按钮
  // =========================================================================

  private buildBackBtn(at: Map<string, Texture>): void {
    this.backBtn = this.makeBtn(at.get('back')!, 26, 32, 40, 40, this.frameLayer)
  }

  // =========================================================================
  // 卷轴
  // =========================================================================

  protected buildReels(): void {
    for (let r = 0; r < R; r++) {
      const x = REEL_LEFT + this.colX[r]
      const w = this.colWidths[r]

      const strip = new Container()
      strip.x = x; strip.y = this.reelY

      for (let i = 0; i < STRIP; i++) {
        const s = new Sprite()
        s.anchor.set(0.5)
        s.width = w; s.height = this.cellSize
        s.x = w / 2; s.y = i * this.cellStep + this.cellSize / 2
        strip.addChild(s)
      }

      const mask = new Graphics()
      mask.rect(x, this.reelY, w, this.cellStep * this.rowCount - this.cellGap).fill(0xffffff)
      this.reelLayer.addChild(mask)
      strip.mask = mask

      this.reelLayer.addChild(strip)
      this.strips.push(strip)
    }
  }

  protected buildWinnerLayer(clipWinnerCells: boolean): void {
    this.winnerLayer = new Container()
    this.reelLayer.addChild(this.winnerLayer)

    if (!clipWinnerCells) return

    const mask = new Graphics()
    const width = this.colX[R - 1] + this.colWidths[R - 1]
    mask.rect(REEL_LEFT, this.reelY, width, this.cellStep * this.rowCount - this.cellGap).fill(0xffffff)
    this.reelLayer.addChild(mask)
    this.winnerLayer.mask = mask
  }

  applySymbol(sprite: Sprite, key: string, cellWidth: number): void {
    const texture = this.tex.get(key)
    if (!texture) {
      // 资源缺失或 key 不一致时使用纯色占位，避免用第一个正常符号冒充
      sprite.texture = Texture.WHITE
      sprite.width = cellWidth
      sprite.height = this.cellSize
      sprite.x = cellWidth / 2
      return
    }
    sprite.texture = texture
    sprite.width = cellWidth * (SYMBOL_WIDTH_SCALE[key] ?? 1)
    sprite.height = this.cellSize
    sprite.x = cellWidth / 2
  }

  /** 根据纹理反查符号 key（无匹配返回 undefined） */
  keyOfTexture(texture: Texture): string | undefined {
    return this.texReverse.get(texture)
  }

  /** 从复用池取一个精灵（池空则新建） */
  obtainSprite(): Sprite {
    return this.spritePool.pop() ?? new Sprite()
  }

  /** 将精灵回收进复用池（从父节点移除并复位状态） */
  releaseSprite(sprite: Sprite): void {
    sprite.removeFromParent()
    sprite.texture = Texture.EMPTY
    sprite.visible = true
    sprite.alpha = 1
    sprite.rotation = 0
    sprite.scale.set(1)
    this.spritePool.push(sprite)
  }

  randomizeStrips(keys: string[], layout?: string[][]): void {
    for (let r = 0; r < R; r++) {
      const strip = this.strips[r]
      const col = layout?.[r]
      for (let i = 0; i < strip.children.length; i++) {
        const key = col?.[i] ?? keys[Math.floor(Math.random() * keys.length)]
        this.applySymbol(strip.children[i] as Sprite, key, this.colWidths[r])
      }
      strip.y = this.reelY
    }
  }

  // =========================================================================
  // 中奖高亮（仅视觉）
  // =========================================================================

  addWinnerCells(cells: Set<string>): void {
    for (const cell of cells) {
      const [rr, row] = cell.split('-').map(Number)
      const ri = rr - 1
      const x = REEL_LEFT + this.colX[ri]
      const y = this.reelY + (row - 1) * this.cellStep
      const g = new Graphics()
      g.roundRect(x - 6, y - 6, this.colWidths[ri] + 12, this.cellSize + 12, 10)
        .stroke({ width: 6, color: 0x33aaff, alpha: 0.35 })
      g.roundRect(x - 3, y - 3, this.colWidths[ri] + 6, this.cellSize + 6, 8)
        .stroke({ width: 3.5, color: 0x55ccff, alpha: 0.9 })
      g.roundRect(x + 4, y + 4, this.colWidths[ri] - 8, this.cellSize - 8, 6)
        .stroke({ width: 2, color: 0xaae8ff, alpha: 0.95 })
      g.label = 'w'
      this.winnerLayer.addChild(g)
      gsap.to(g, { alpha: 0.5, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    }
  }

  clearWinnerCells(): void {
    const winners = this.winnerLayer.children.filter(c => c.label === 'w')
    winners.forEach(c => {
      gsap.killTweensOf(c)
      this.winnerLayer.removeChild(c)
    })
  }

  hasWinnerCells(): boolean {
    return this.winnerLayer.children.some(c => c.label === 'w')
  }

  /** 麻将胡了专属：中奖后爆炸 + 补位动画。基类为空操作。 */
  async playMahjongWinSequence(_cells: Set<string>, _keys: string[]): Promise<void> {}

  // =========================================================================
  // 倍率栏
  // =========================================================================

  private buildMultiplier(at: Map<string, Texture>): void {
    this.multiPanel = new MultiplierPanel(this.multiLayer, at.get('multiSel')!)
  }

  // =========================================================================
  // 控制按钮
  // =========================================================================

  private buildControls(at: Map<string, Texture>): void {
    const ctrl = new Container()
    ctrl.x = 49; ctrl.y = 1230
    this.ctrlLayer.addChild(ctrl)

    this.settingsBtn = this.makeBtn(at.get('settings')!, 0, 90, 80, 80, ctrl)

    this.betBtn = this.makeBtn(at.get('bet')!, 108, 90, 80, 80, ctrl)
    this.betText = this.makeText('Bet ₹ 3', 148, 174, 24, whiteText)
    this.betText.anchor.set(0.5, 0)
    ctrl.addChild(this.betText)

    this.spinBtn = new Container()
    this.spinBtn.x = 222; this.spinBtn.y = 0
    this.spinBtn.eventMode = 'static'; this.spinBtn.cursor = 'pointer'
    const spinOuter = new Sprite(at.get('spin')!)
    spinOuter.anchor.set(0.5)
    spinOuter.width = 200; spinOuter.height = 200
    spinOuter.x = 100; spinOuter.y = 100
    this.spinBtn.addChild(spinOuter)
    this.spinCenter = new Sprite(at.get('spinCenter')!)
    this.spinCenter.width = 104; this.spinCenter.height = 104
    this.spinCenter.anchor.set(0.5)
    this.spinCenter.x = 100; this.spinCenter.y = 100
    this.spinBtn.addChild(this.spinCenter)
    ctrl.addChild(this.spinBtn)

    this.autoTex = at.get('auto')!
    this.autoPauseTex = at.get('autoPause')!
    this.autoIcon = this.makeBtn(this.autoTex, 454, 90, 80, 80, ctrl)

    this.turboBtn = this.makeBtn(at.get('turbo')!, 567, 90, 80, 80, ctrl)

    this.turboSwitch = new Container()
    this.turboSwitch.x = 562; this.turboSwitch.y = 174
    const switchBg = new Sprite(at.get('turboIndicator')!)
    switchBg.width = 90; switchBg.height = 35 //switchBg.height-原高度30
    this.turboSwitch.addChild(switchBg)

    for (let i = 0; i < 2; i++) {
      const tri = new Sprite(at.get('turboTriangle')!)
      tri.width = 25; tri.height = 28
      tri.anchor.set(0.5, 0)
      const gap = 4
      const margin = (switchBg.width - 2 * tri.width - gap) / 2
      tri.x = margin + tri.width / 2 + i * (tri.width + gap)
      tri.y = 3
      tri.visible = false
      this.turboSwitch.addChild(tri)
      this.turboIndicators.push(tri)
    }
    this.turboSwitch.eventMode = 'static'; this.turboSwitch.cursor = 'pointer'
    ctrl.addChild(this.turboSwitch)
  }

  // =========================================================================
  // 余额 / 赢取面板
  // =========================================================================

  private buildPanels(at: Map<string, Texture>): void {
    const ptex = at.get('panel')!
    const buildPanel = (x: number, label: string, amount: string): Text => {
      const bg = new Sprite(ptex)
      bg.anchor.set(0.5)
      bg.width = 290; bg.height = 100
      bg.x = x + 145; bg.y = 1509
      this.panelLayer.addChild(bg)

      const t = this.makeText(label, 0, 1474, 24, goldText)
      t.anchor.set(0.5, 0)
      t.x = x + 145
      this.panelLayer.addChild(t)

      const amt = this.makeText(`₹ ${amount}`, 0, 1509, 28, gradText)
      amt.anchor.set(0.5, 0)
      amt.x = x + 145
      this.panelLayer.addChild(amt)
      return amt
    }
    this.balanceText = buildPanel(49, 'BALANCE', '0.00')
    this.winText = buildPanel(407, 'WIN', '0.00')
  }

  // =========================================================================
  // 投注菜单弹窗
  // =========================================================================

  private buildBetMenu(at: Map<string, Texture>): void {
    this.betMenu = new Container()
    this.betMenu.visible = false

    const hit = new Graphics()
    hit.rect(0, 0, DW, DH).fill({ color: 0x000000, alpha: 0 })
    hit.eventMode = 'static'
    this.betMenu.addChild(hit)

    const panel = new Sprite(at.get('betPanel')!)
    panel.width = 358; panel.height = 388; panel.x = 19; panel.y = 920
    this.betMenu.addChild(panel)

    const grid = new Graphics()
    grid.x = 23; grid.y = 924
    this.betMenu.addChild(grid)

    this.popupLayer.addChild(this.betMenu)
  }

  rebuildBetGrid(count: number): void {
    this.betOptionTexts.forEach(t => this.betMenu.removeChild(t))
    this.betOptionTexts = []

    const rows = Math.ceil(count / 3)
    const rowHeight = 76
    const panelH = rows * rowHeight + 8
    this.betGridY = 1308 - panelH

    const panel = this.betMenu.children[1] as Sprite
    panel.y = this.betGridY; panel.height = panelH
    const grid = this.betMenu.children[2] as Graphics
    grid.clear()
    grid.y = this.betGridY + 4
    for (const x of [118.5, 234.5]) {
      grid.moveTo(x, 0).lineTo(x, rows * rowHeight).stroke({ width: 1, color: 0x211c10 })
    }
    for (let row = 1; row < rows; row++) {
      const y = row * rowHeight + 0.5
      grid.moveTo(0, y).lineTo(350, y).stroke({ width: 1, color: 0x211c10 })
    }

    const columnCenters = [82, 199.5, 315]
    for (let i = 0; i < count; i++) {
      const col = i % 3; const row = Math.floor(i / 3)
      const t = this.makeText('', columnCenters[col], this.betGridY + 42 + row * rowHeight, 24, whiteText)
      t.anchor.set(0.5)
      t.eventMode = 'static'; t.cursor = 'pointer'
      this.betMenu.addChild(t)
      this.betOptionTexts.push(t)
    }
  }

  updateBetSelected(index: number): void {
    const old = this.betMenu.children.find(c => c.label === 'betSelected') as Graphics | undefined
    if (old) this.betMenu.removeChild(old)

    const col = index % 3
    const row = Math.floor(index / 3)
    const columnCenters = [82, 199.5, 315]
    const x = columnCenters[col] - 56
    const y = this.betGridY + 7 + row * 76
    const g = new Graphics()
    g.label = 'betSelected'
    g.roundRect(x, y, 112, 70, 4).fill({ color: 0x4d4730 })
    g.roundRect(x, y, 112, 70, 4).stroke({ width: 2, color: 0xcab855, alpha: 0.9 })
    this.betMenu.addChildAt(g, 3)
  }

  // =========================================================================
  // Big Win 弹窗（仅视觉）
  // =========================================================================

  private buildBigWin(): void {
    this.bigWinPopup = new Container()
    this.bigWinPopup.visible = false
    this.popupLayer.addChild(this.bigWinPopup)
  }

  showBigWinPopup(bgTex: Texture, titleTex: Texture, winBgTex: Texture, amount: number): void {
    this.winDisplayLocked = true
    gsap.killTweensOf(this.bigWinPopup)
    gsap.killTweensOf(this.bigWinPopup.children.flatMap(child => [child, child.scale]))
    this.bigWinCounterTween?.kill()
    this.bigWinTimeline?.kill()
    this.bigWinPopup.removeChildren()

    const burst = new Sprite(bgTex)
    burst.anchor.set(0.5)
    const burstS = 926 / Math.max(bgTex.width, bgTex.height)
    burst.scale.set(burstS * 0.15)
    burst.x = 375; burst.y = 720
    burst.alpha = 0
    this.bigWinPopup.addChild(burst)

    const title = new Sprite(titleTex)
    title.anchor.set(0.5)
    const titleS = 540 / Math.max(titleTex.width, titleTex.height)
    title.scale.set(titleS * 0.2)
    title.x = 375; title.y = 720
    title.alpha = 0
    this.bigWinPopup.addChild(title)

    const winBg = new Sprite(winBgTex)
    winBg.anchor.set(0.5)
    const winBgSx = 706 / winBgTex.width
    const winBgSy = 168 / winBgTex.height
    winBg.scale.set(winBgSx * 0.72, winBgSy * 0.72)
    winBg.x = 375; winBg.y = 1070
    winBg.alpha = 0
    this.bigWinPopup.addChild(winBg)

    this.bigWinAmount = this.makeText(
      `₹ ${formatINR.format(amount)}`,
      winBg.x, winBg.y, 80,
      { fill: 0xffe285, fontWeight: '700', fontFamily: 'IBM Plex Serif' },
    )
    this.bigWinAmount.anchor = { x: 0.5, y: 0.5 }
    this.bigWinAmount.scale.set(Math.min(1, (706 * 0.84) / this.bigWinAmount.width))
    this.bigWinAmount.alpha = 0
    this.bigWinPopup.addChild(this.bigWinAmount)

    this.bigWinPopup.alpha = 0
    this.bigWinPopup.visible = true

    const formatAmount = (value: number) => `\u20B9${formatINR.format(value)}`
    const updateAmount = (value: number) => {
      if (this.destroyed) return
      this.bigWinAmount.text = formatAmount(value)
      const width = this.bigWinAmount.width || 1
      this.bigWinAmount.scale.set(Math.min(1, (706 * 0.8) / width))
    }
    const counter = { value: 0 }
    updateAmount(0)

    const timeline = gsap.timeline()
    this.bigWinTimeline = timeline
    timeline.to(this.bigWinPopup, { alpha: 1, duration: 0.4, ease: 'power1.out' })
    timeline.to(burst, { alpha: 1, scale: burstS, duration: 2, ease: 'power2.out' }, 0.3)
    timeline.to(title, { alpha: 1, scale: titleS, duration: 1.8, ease: 'power3.out' }, 0.04)
    timeline.to([winBg, this.bigWinAmount], { alpha: 1, duration: 0.5 }, 0.65)
    timeline.to(winBg.scale, { x: winBgSx, y: winBgSy, duration: 0.65, ease: 'back.out(1.5)' }, 0.65)
    timeline.to(this.bigWinAmount, { scale: 1, duration: 0.65, ease: 'back.out(1.5)' }, 0.72)
    timeline.to(counter, {
      value: amount,
      duration: 5,
      ease: 'power2.out',
      onUpdate: () => updateAmount(counter.value),
    }, 1.35)
    this.bigWinCounterTween = timeline.getChildren(true, true, true).find(
      t => t.targets()?.includes(counter),
    ) as gsap.core.Tween

    // 金额显示后启动呼吸动画
    timeline.to(burst, { rotation: Math.PI * 2, duration: 9, repeat: -1, ease: 'none' }, 1.35)
    timeline.to(burst.scale, { x: burstS * 1.045, y: burstS * 1.045, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 1.35)
    timeline.to(title.scale, { x: titleS * 1.04, y: titleS * 1.04, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 1.35)
  }

  hideBigWinPopup(): Promise<void> {
    // 不再提前 kill 子元素的补间动画（如 burst 的旋转、脉冲缩放），
    // 让它们在淡出过程中自然播放，避免旋转角度/缩放值卡在随机位置导致闪烁
    gsap.killTweensOf(this.bigWinPopup)
    this.bigWinCounterTween?.kill()
    this.bigWinTimeline?.kill()
    return new Promise(resolve => gsap.to(this.bigWinPopup, {
      alpha: 0,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: () => {
        // 淡出完成后统一清理所有动画
        for (const child of this.bigWinPopup.children) {
          gsap.killTweensOf(child)
          if ('scale' in child) {
            gsap.killTweensOf(child.scale)
          }
        }
        this.bigWinPopup.visible = false
        this.winDisplayLocked = false
        this.bigWinTimeline = undefined
        this.bigWinCounterTween = undefined
        resolve()
      },
    }))
  }

  setWinAmount(amount: number): void {
    if (this.winDisplayLocked) return
    this.renderWinAmount(amount)
  }

  private renderWinAmount(amount: number): void {
    this.winText.text = `\u20B9 ${formatINR.format(amount)}`
    this.winText.scale.set(Math.min(1, 244 / this.winText.width))
  }

  // =========================================================================
  // 免费局触发弹窗
  // =========================================================================

  private buildFreeSpin(at: Map<string, Texture>): void {
    // 全屏 DOM 视频层，覆盖整个可视区域，不受画布 750px 限制
    const video = document.createElement('video')
    video.src = TRANSITION_MP4
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true
    Object.assign(video.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      objectFit: 'cover', zIndex: '9999',
      opacity: '0', transition: 'opacity 0.6s ease-in-out',
      pointerEvents: 'none',
    })
    document.body.appendChild(video)
    this.freeSpinVideo = video

    // 免费旋转剩余次数指示器（持续显示在卷轴上方）
    this.freeSpinIndicator = new Container()
    this.freeSpinIndicator.visible = false
    const titleBg = new Sprite(at.get('freeSpinsTitleBg')!)
    titleBg.width = 700; titleBg.height = 160
    titleBg.x = 27; titleBg.y = 1258
    this.freeSpinIndicator.addChild(titleBg)

    const title = new Sprite(at.get('freeSpinsText')!)
    title.width = 251; title.height = 112
    title.x = 184; title.y = 1282
    this.freeSpinIndicator.addChild(title)

    const countBg = new Sprite(at.get('freeSpinsCountBg')!)
    countBg.width = 244; countBg.height = 244
    countBg.x = 483; countBg.y = 1215
    this.freeSpinIndicator.addChild(countBg)

    this.freeSpinIndicatorCount = this.makeText('10', 605, 1337.5, 96, {
      fill: 0xffd56a, fontWeight: '700', fontFamily: 'IBM Plex Serif',
      stroke: { color: 0x4b0000, width: 9 },
      dropShadow: { color: 0x1b0000, blur: 4, distance: 4, angle: Math.PI / 2, alpha: 0.8 },
    })
    this.freeSpinIndicatorCount.anchor.set(0.5)
    this.freeSpinIndicator.addChild(this.freeSpinIndicatorCount)
    this.popupLayer.addChild(this.freeSpinIndicator)
  }

  showFreeSpinPopup(_count: number): void {
    this.freeSpinVideo.style.opacity = '1'
    this.freeSpinVideo.style.pointerEvents = 'auto'
    this.freeSpinVideo.play()
  }

  hideFreeSpinPopup(): void {
    this.freeSpinVideo.style.opacity = '0'
    this.freeSpinVideo.style.pointerEvents = 'none'
  }

  /** 更新免费旋转剩余次数指示器 */
  setFreeSpinCount(count: number): void {
    if (count > 0) {
      this.freeSpinIndicatorCount.text = String(count)
      this.freeSpinIndicatorCount.scale.set(1)
      this.freeSpinIndicatorCount.scale.set(Math.min(1, 116 / this.freeSpinIndicatorCount.width))
      this.freeSpinIndicator.visible = true
      this.ctrlLayer.visible = false
    } else {
      this.freeSpinIndicator.visible = false
      this.ctrlLayer.visible = true
    }
  }

  // =========================================================================
  // 响应式缩放
  // =========================================================================

  /**
   * 响应视口变化，更新渲染器尺寸和舞台缩放。
   *
   * 渲染器以真实 CSS 像素尺寸输出，所有设计稿元素都位于 root 的 750×1624 坐标系中。
   * root 采用 contain 等比缩放并居中，避免画面变形或裁切。
   *
   * @param state ResponsiveManager 输出的状态快照
   */
  resize(state: Readonly<ResponsiveState>): void {
    if (this.destroyed) return

    const width = Math.max(1, state.viewportWidth)
    const height = Math.max(1, state.viewportHeight)
    const resolution = Math.min(Math.max(1, state.devicePixelRatio), MAX_DPR)

    // autoDensity 保持 CSS 尺寸，同时用 resolution 分配高 DPI 的实际画布像素。
    this.app.renderer.resize(width, height, resolution)
    this.root.scale.set(state.scale)
    this.root.position.set(state.offsetX, state.offsetY)
  }

  // =========================================================================
  // 销毁
  // =========================================================================

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.bigWinTimeline?.kill()
    this.bigWinCounterTween?.kill()
    this.bigWinTimeline = undefined
    this.bigWinCounterTween = undefined
    this.killTweens(this.root)
    this.sungodAnim?.destroy()
    if (this.freeSpinVideo) {
      this.freeSpinVideo.pause()
      this.freeSpinVideo.remove()
    }
    this.multiPanel?.destroy()
    this.spritePool.forEach(s => s.destroy())
    this.spritePool.length = 0
    // canvas 由 Vue 模板拥有，DOM 节点交给 Vue 卸载；PixiJS 上下文与显示对象在此释放。
    this.app.destroy({ removeView: false }, { children: true, context: true })
  }

  private killTweens(container: Container): void {
    gsap.killTweensOf([container, container.position, container.scale, container.pivot, container.skew])
    for (const child of container.children) this.killTweens(child)
  }
}
