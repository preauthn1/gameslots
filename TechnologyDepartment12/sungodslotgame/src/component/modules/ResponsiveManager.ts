/**
 * 响应式适配管理器
 *
 * 以设计稿尺寸为基准，计算视口缩放比例和居中偏移量。
 * 对外提供与 PixiJS renderer.resize / stage scale 同步的状态快照。
 *
 * 使用方式：
 *   const rm = new ResponsiveManager({ designWidth: 750, designHeight: 1624 })
 *   rm.start()
 *   const stop = rm.onUpdate((state) => renderer.resize(state))
 */

export interface ResponsiveConfig {
  /** 设计稿宽度（逻辑像素） */
  designWidth: number
  /** 设计稿高度（逻辑像素） */
  designHeight: number
}

export interface ResponsiveState {
  /** 等比缩放比例（fit 策略） */
  scale: number
  /** 当前视口宽度 */
  viewportWidth: number
  /** 当前视口高度 */
  viewportHeight: number
  /** 水平居中偏移 */
  offsetX: number
  /** 垂直居中偏移 */
  offsetY: number
  /** 当前设备像素比，供 PixiJS 设置高 DPI 渲染分辨率。 */
  devicePixelRatio: number
}

type UpdateCallback = (state: Readonly<ResponsiveState>) => void

export class ResponsiveManager {
  readonly designWidth: number
  readonly designHeight: number

  private _state: ResponsiveState
  private _listeners: UpdateCallback[] = []
  private resizeFrame: number | null = null
  private listening = false

  private readonly queueUpdate = (): void => {
    if (this.resizeFrame !== null) return
    this.resizeFrame = window.requestAnimationFrame(() => {
      this.resizeFrame = null
      this.update()
    })
  }

  constructor(config: ResponsiveConfig) {
    this.designWidth = config.designWidth
    this.designHeight = config.designHeight
    this._state = {
      scale: 1,
      viewportWidth: 0,
      viewportHeight: 0,
      offsetX: 0,
      offsetY: 0,
      devicePixelRatio: 1,
    }
  }

  /** 当前状态快照（只读） */
  get state(): Readonly<ResponsiveState> {
    return this._state
  }

  /**
   * 注册状态更新回调，返回取消注册函数。
   * 在 update() 触发、且尺寸变化时回调。
   */
  onUpdate(cb: UpdateCallback): () => void {
    this._listeners.push(cb)
    return () => {
      this._listeners = this._listeners.filter(f => f !== cb)
    }
  }

  /** 开始监听窗口、旋转方向及移动端可视区域变化。 */
  start(): void {
    if (this.listening) return
    this.listening = true
    window.addEventListener('resize', this.queueUpdate, { passive: true })
    window.addEventListener('orientationchange', this.queueUpdate, { passive: true })
    window.visualViewport?.addEventListener('resize', this.queueUpdate, { passive: true })
    window.visualViewport?.addEventListener('scroll', this.queueUpdate, { passive: true })
    this.update()
  }

  /** 停止监听并取消尚未执行的动画帧回调。 */
  stop(): void {
    if (!this.listening) return
    this.listening = false
    window.removeEventListener('resize', this.queueUpdate)
    window.removeEventListener('orientationchange', this.queueUpdate)
    window.visualViewport?.removeEventListener('resize', this.queueUpdate)
    window.visualViewport?.removeEventListener('scroll', this.queueUpdate)
    if (this.resizeFrame !== null) {
      window.cancelAnimationFrame(this.resizeFrame)
      this.resizeFrame = null
    }
  }

  /** 重新计算视口尺寸和缩放比例，仅在尺寸变化时触发回调 */
  update(): void {
    const vp = window.visualViewport
    // visualViewport 优先（排除移动端键盘/工具栏占位），不可用时降级到 window.inner
    const vw = Math.max(1, vp?.width ?? window.innerWidth)
    const vh = Math.max(1, vp?.height ?? window.innerHeight)
    const dpr = Math.max(1, window.devicePixelRatio || 1)

    if (vw === this._state.viewportWidth && vh === this._state.viewportHeight && dpr === this._state.devicePixelRatio) return

    const s = Math.min(vw / this.designWidth, vh / this.designHeight)

    this._state.viewportWidth = vw
    this._state.viewportHeight = vh
    this._state.scale = s
    this._state.offsetX = (vw - this.designWidth * s) / 2
    this._state.offsetY = (vh - this.designHeight * s) / 2
    this._state.devicePixelRatio = dpr

    for (const cb of this._listeners) {
      cb(this._state)
    }
  }

  /** 销毁管理器，清除所有监听器 */
  destroy(): void {
    this.stop()
    this._listeners.length = 0
  }
}
