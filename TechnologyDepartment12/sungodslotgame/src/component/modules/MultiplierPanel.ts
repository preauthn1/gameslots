// =============================================================================
// 倍率选择面板 — 水平排列的倍率按钮组，选中时高亮滑动 + 弹跳 + 闪白动画
// 外部通过 setItems(values) 动态注入倍率列表，调用 reset / advanceTo 控制状态
// 固定显示 7 个槽位，超过 7 项时隐藏右侧，选中时横向滚动入视
// =============================================================================
import { Container, FillGradient, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js'
import gsap from 'gsap'
import { gameSound } from './audio/GameSound'

// ---- 布局常量 (Figma 设计稿) ----
const START_X = 160  // 首个按钮中心 X
const END_X = 683    // 末个按钮中心 X
const BUTTON_Y = 598 // 按钮 Y 坐标
// 高亮精灵尺寸
const HIGHLIGHT_W = 113, HIGHLIGHT_H = 78
const HIGHLIGHT_OY = 24 // 高亮相对按钮的 Y 偏移
// 闪白覆盖层尺寸
const FLASH_W = 103, FLASH_H = 76
const MULTIPLIER_STEP_DELAY = 380
// 滚动布局
const VISIBLE_COUNT = 7                         // 固定可见槽位数
const ITEM_GAP = (END_X - START_X) / (VISIBLE_COUNT - 1) // 槽位间距
const MASK_LEFT = START_X - HIGHLIGHT_W / 2 - 4 // 遮罩左边界（确保首项高亮完整）
const MASK_RIGHT = END_X + HIGHLIGHT_W / 2 + 4  // 遮罩右边界（确保末项高亮完整）

// ---- 文字样式 ----
function goldGrad(): FillGradient {
  const g = new FillGradient({ start: { x: 0, y: 0 }, end: { x: 0, y: 1 } })
  g.addColorStop(0, 0xffffff)
  g.addColorStop(0.26, 0xfff3b6)
  g.addColorStop(0.84, 0xffcd44)
  g.addColorStop(1, 0xfff3b6)
  return g
}
const goldText: Partial<TextStyle> = { fill: 0xffcd44, fontWeight: '700', fontFamily: 'IBM Plex Serif' }
const gradText: Partial<TextStyle> = { fill: { fill: goldGrad() }, fontWeight: '700', fontFamily: 'IBM Plex Serif' }

// =============================================================================
export class MultiplierPanel {
  // ---- 渲染元素 ----
  readonly container: Container
  private scrollContent!: Container  // 包裹所有按钮 + 高亮，被遮罩裁剪
  private buttons: Container[] = []  // 每个倍率的点击区域
  private texts: Text[] = []         // 按钮上的文字
  private highlight!: Sprite         // 选中高亮 (单实例复用)

  // ---- 状态 ----
  private currentIdx = 0             // 当前选中项索引
  private items: number[] = [2, 3, 5, 10, 25, 50, 100]
  private onChange?: (value: number) => void

  // ===========================================================================
  // 初始化
  // ===========================================================================

  constructor(parent: Container, highlightTex: Texture) {
    this.container = new Container()
    parent.addChild(this.container)

    // 标题 "MULTI" — 固定不动
    this.container.addChild(
      new Text({ text: 'MULTI', style: new TextStyle({ fontSize: 20, ...goldText }) }),
    ).position.set(33, 600)

    // 滚动内容容器
    this.scrollContent = new Container()
    this.container.addChild(this.scrollContent)

    // 遮罩裁剪可视区域
    const mask = new Graphics()
    mask.rect(MASK_LEFT, BUTTON_Y - 60, MASK_RIGHT - MASK_LEFT, 120).fill(0xffffff)
    this.container.addChild(mask)
    this.scrollContent.mask = mask

    // 高亮精灵 — 放在滚动内容内，随按钮一起移动
    this.highlight = new Sprite(highlightTex)
    this.highlight.width = HIGHLIGHT_W
    this.highlight.height = HIGHLIGHT_H
    this.highlight.visible = false
    this.scrollContent.addChild(this.highlight)

    this.rebuild()
  }

  // ===========================================================================
  // 动态数据注入
  // ===========================================================================

  /** 设置倍率列表，自动重建布局 */
  setItems(values: number[]): void {
    this.items = values
    this.currentIdx = 0
    this.rebuild()
  }

  // ===========================================================================
  // 布局计算 & 重建
  // ===========================================================================

  /** 第 i 个按钮在滚动内容中的中心 X 坐标 */
  private xFor(i: number): number {
    return START_X + i * ITEM_GAP
  }

  /** 计算让第 idx 项在可视区内的 scrollOffset */
  private scrollForIndex(idx: number): number {
    const itemX = this.xFor(idx)
    // 左边界：让该项出现在第一个槽位
    if (itemX < START_X) return itemX - START_X
    // 右边界：让该项出现在最后一个槽位
    if (itemX > END_X) return itemX - END_X
    return 0
  }

  /** 销毁旧按钮并重建全部按钮 + 高亮定位 */
  private rebuild(): void {
    this.buttons.forEach(b => b.destroy({ children: true }))
    this.buttons = []
    this.texts = []

    this.items.forEach((v, i) => {
      const btn = new Container()
      btn.x = this.xFor(i); btn.y = BUTTON_Y
      btn.eventMode = 'none'

      const txt = new Text({ text: `${v}x`, style: new TextStyle({ fontSize: 24, ...gradText }) })
      txt.anchor.set(0.5)
      txt.y = 14.5
      btn.addChild(txt)

      this.buttons.push(btn)
      this.texts.push(txt)
      this.scrollContent.addChild(btn)
    })

    // 高亮定位到当前选中项
    this.highlight.x = this.xFor(this.currentIdx) - HIGHLIGHT_W / 2
    this.highlight.y = BUTTON_Y - HIGHLIGHT_OY
    this.highlight.visible = true

    // 如果选中项超出可视区，滚动到位
    this.scrollContent.x = -this.scrollForIndex(this.currentIdx)
  }

  // ===========================================================================
  // 选中切换 (GSAP 动画)
  // ===========================================================================

  /**
   * Move forward to a target tier. The panel owns sequential progression,
   * cap, visual transition, and the transition delay.
   */
  async advanceTo(index: number): Promise<void> {
    const target = Math.min(Math.max(0, index), this.items.length - 1)
    while (this.currentIdx < target) {
      this.updateMultiplier(this.currentIdx + 1)
      await new Promise<void>(resolve => window.setTimeout(resolve, MULTIPLIER_STEP_DELAY))
    }
  }

  /** Switch to exactly the next multiplier tier and play its UI transition. */
  private updateMultiplier(index: number): void {
    // 局内倍率只能逐档前进；回到首档只能由新局 reset() 完成。
    if (index !== this.currentIdx + 1 || index >= this.items.length) return
    this.currentIdx = index
    gameSound.play('levelUp')

    const itemLocalX = this.xFor(index) // 滚动内容坐标系下的 X
    const targetScroll = -this.scrollForIndex(index)

    // 1) 高亮滑动到目标位置（在滚动内容坐标系内）
    gsap.to(this.highlight, {
      x: itemLocalX - HIGHLIGHT_W / 2,
      y: BUTTON_Y - HIGHLIGHT_OY,
      duration: 0.3,
      ease: 'power2.out',
    })

    // 1.5) 滚动内容平移，保证选中项在可视区内
    gsap.to(this.scrollContent, {
      x: targetScroll,
      duration: 0.35,
      ease: 'power2.out',
    })

    // 2) 文字弹跳
    const txt = this.texts[index]
    gsap.fromTo(txt.scale, { x: 0.5, y: 0.5 }, { x: 1, y: 1, duration: 0.4, ease: 'back.out(2)' })

    // 3) 闪白覆盖层 (亮一下再消失) — 计算在 container 坐标系下的位置
    const flash = new Graphics()
    const flashScreenX = itemLocalX + targetScroll // 转换到 container 坐标系
    flash.roundRect(flashScreenX - FLASH_W / 2, BUTTON_Y - 26, FLASH_W, FLASH_H, 8)
      .fill({ color: 0xffffff, alpha: 0.6 })
    this.container.addChild(flash)
    gsap.to(flash, {
      alpha: 0, duration: 0.35, ease: 'power2.out',
      onComplete: () => { this.container.removeChild(flash) },
    })

    this.onChange?.(this.items[index])
  }

  /** 新一局开始时回到首档，不播放倒退动画。 */
  reset(): void {
    if (this.items.length === 0) return
    this.currentIdx = 0
    gsap.killTweensOf(this.highlight)
    gsap.killTweensOf(this.scrollContent)
    this.highlight.x = this.xFor(0) - HIGHLIGHT_W / 2
    this.highlight.y = BUTTON_Y - HIGHLIGHT_OY
    this.scrollContent.x = 0
    this.texts.forEach(text => text.scale.set(1))
    this.onChange?.(this.items[0])
  }

  // ===========================================================================
  // 回调 & 销毁
  // ===========================================================================

  setOnChange(cb: (value: number) => void): void { this.onChange = cb }

  destroy(): void {
    gsap.killTweensOf(this.highlight)
    gsap.killTweensOf(this.scrollContent)
    this.buttons.forEach(b => b.destroy({ children: true }))
    this.container.destroy({ children: true })
  }
}
