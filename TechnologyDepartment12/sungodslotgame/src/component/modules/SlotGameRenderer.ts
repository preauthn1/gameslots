// =============================================================================
// 老虎机渲染器（经典老虎机，gameId=1）
// 中间 UI 使用默认实现，不裁剪中奖高亮、不展示倍率栏
// =============================================================================
import { GameRenderer, GameRendererOptions, SymbolDef, formatINR } from './GameRenderer'
import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js'
import gsap from 'gsap'
import slotMachineBg from '../../assets/images/slotMachine_bg.webp'

const WIN_LINE_EDGE_X = { left: 22, right: 728 }
const WIN_LINE_LABEL_EDGE_INSET = 42
const WIN_LINE_FLOW_DURATION = 1.7
const WIN_LINE_FLOW_LENGTH = 168
const WIN_LINE_FLOW_SEGMENTS = 16
const WIN_LINE_BASE_GLOW_WIDTH = 3
const WIN_LINE_BASE_CORE_WIDTH = 1.5
const WIN_LINE_FLOW_HALO_WIDTH = 4
const WIN_LINE_FLOW_CORE_WIDTH = 1.7
export interface SlotWinLine {
  name: string
  positions: [number, number][]
  amount?: number
}

interface WinScan {
  progress: { value: number }
  glow: Graphics
}

export class SlotGameRenderer extends GameRenderer {
  private _frameTex: Texture | null = null
  private winDimLayer!: Graphics
  private winCellLayer!: Container
  private winLineLayer!: Graphics
  private winLineLabelLayer!: Container
  private winScanLayer!: Container
  private winScans: WinScan[] = []
  private winLineAmountsVisible = false

  async init(canvas: HTMLCanvasElement, symbols: SymbolDef[], options: GameRendererOptions = {}): Promise<void> {
    this._frameTex = await Assets.load<Texture>(slotMachineBg)
    await super.init(canvas, symbols, options)
  }

  protected async buildMiddleUI(at: Map<string, Texture>, _options: GameRendererOptions): Promise<void> {
    await this.buildChar(at)
    at.set('frame', this._frameTex!)
    this.buildFrame(at)
    this.buildReels()
    this.buildWinnerLayer(false)
    this.winDimLayer = new Graphics()
    this.winnerLayer.addChild(this.winDimLayer)
    this.winCellLayer = new Container()
    this.winnerLayer.addChild(this.winCellLayer)
    this.winLineLayer = new Graphics()
    this.winnerLayer.addChild(this.winLineLayer)
    this.winLineLabelLayer = new Container()
    this.winnerLayer.addChild(this.winLineLabelLayer)
    this.winScanLayer = new Container()
    this.winnerLayer.addChild(this.winScanLayer)
  }

  /** Figma 设计：Frame h=854, centerY=835 */
  protected buildFrame(at: Map<string, Texture>): void {
    const f = new Sprite(at.get('frame')!)
    f.anchor.set(0.5)
    f.width = 750; f.height = 854
    f.x = 375; f.y = 835
    this.frameLayer.addChild(f)

    const logo = new Sprite(at.get('logo')!)
    logo.anchor.set(0.5)
    logo.width = 257; logo.height = 85
    logo.x = 377.5; logo.y = 558
    this.frameLayer.addChild(logo)
  }

  clearWinLines(): void {
    this.winDimLayer?.clear()
    this.winLineLayer?.clear()
    this.winLineLabelLayer?.removeChildren()
    this.clearWinScans()
    this.winLineAmountsVisible = false
  }

  override destroy(): void {
    // 流光 Tween 的目标是普通 progress 对象，不在 Pixi 显示树中，必须先显式停止。
    this.clearWinScans()
    super.destroy()
  }

  revealWinLineAmounts(): void {
    this.winLineAmountsVisible = true
    for (const child of this.winLineLabelLayer.children) {
      if (child.label === 'winLineAmount') child.visible = true
    }
  }

  showWinLines(lines: SlotWinLine[], colorOffset = 0): void {
    this.drawWinDimmer(lines)
    this.winLineLayer.clear()
    this.winLineLabelLayer.removeChildren()
    this.clearWinScans()
    this.createWinLineFlows(lines)
    for (const [index, line] of lines.entries()) {
      const { positions } = line
      if (positions.length < 2) continue
      const lineIndex = colorOffset + index
      const color = 0xffcf42

      // Paylines always follow their actual reel centres. Real overlapping
      // segments remain overlapped rather than being visually spread apart.
      const points = this.computeLinePoints(positions)
      this.winLineLayer.moveTo(points[0].x, points[0].y)
      for (const point of points.slice(1)) this.winLineLayer.lineTo(point.x, point.y)
      this.winLineLayer.stroke({ width: WIN_LINE_BASE_GLOW_WIDTH, color: 0x754000, alpha: 0.56 })
      this.winLineLayer.moveTo(points[0].x, points[0].y)
      for (const point of points.slice(1)) this.winLineLayer.lineTo(point.x, point.y)
      this.winLineLayer.stroke({ width: WIN_LINE_BASE_CORE_WIDTH, color: 0xcf8416, alpha: 0.78 })

      if (!line.name) continue
      const label = new Text({
        text: line.name,
        style: new TextStyle({
          fill: 0xffffff, fontSize: 21, fontWeight: '800', fontFamily: 'IBM Plex Serif',
          stroke: { color: 0x210800, width: 5 },
        }),
      })
      label.anchor.set(0.5)
      const badge = new Graphics()
      // 线条名称-样式设置
      badge.roundRect(-label.width / 2 - 12, -label.height / 2 - 7, label.width + 24, label.height + 14, 10)
        .fill({ color, alpha: 0.8 })
        .stroke({ width: 3, color: 0x3b1400, alpha: 0.9 })
      const tag = new Container()
      // 线号固定贴在左右边缘，避免遮住图标，也与连线端点对应。
      const showOnLeft = lineIndex % 2 === 0
      tag.x = showOnLeft ? WIN_LINE_LABEL_EDGE_INSET : 750 - WIN_LINE_LABEL_EDGE_INSET
      tag.y = showOnLeft ? points[0].y : points[points.length - 1].y
      tag.addChild(badge, label)
      this.winLineLabelLayer.addChild(tag)

      if (line.amount === undefined || line.amount <= 0) continue
      const [row, col] = positions[Math.floor(positions.length / 2)]
      const amount = new Text({
        text: `₹ ${formatINR.format(line.amount)}`,
        style: new TextStyle({
          fill: 0xffdc47, fontSize: 27, fontWeight: '900', fontFamily: 'IBM Plex Serif',
          stroke: { color: 0x351200, width: 6 },
          dropShadow: { color: 0x000000, alpha: 0.75, blur: 2, distance: 2, angle: Math.PI / 2 },
        }),
      })
      amount.anchor.set(0.5)
      amount.label = 'winLineAmount'
      amount.visible = this.winLineAmountsVisible
      amount.x = 17.02 + this.colX[col] + this.colWidths[col] / 2
      amount.y = this.reelY + row * this.cellStep + this.cellSize * 0.74
      this.winLineLabelLayer.addChild(amount)

      // 创建流光效果
    }
  }

  // ---- 中奖线效果 ----

  private computeLinePoints(positions: [number, number][]): { x: number; y: number }[] {
    const reelPoints = positions.map(([row, col]) => ({
      x: 17.02 + this.colX[col] + this.colWidths[col] / 2,
      y: this.reelY + row * this.cellStep + this.cellSize / 2,
    }))
    return [
      { x: WIN_LINE_EDGE_X.left, y: reelPoints[0].y },
      ...reelPoints,
      { x: WIN_LINE_EDGE_X.right, y: reelPoints[reelPoints.length - 1].y },
    ]
  }

  addWinnerCells(cells: Set<string>): void {
    // 中奖符号仅通过遮罩层来识别，不要再添加通用的格子边框动画：参考游戏保持中奖线细线效果。
    void cells
  }

  clearWinnerCells(): void {
    for (const frame of this.winCellLayer?.children ?? []) {
      gsap.killTweensOf(frame)
      frame.destroy()
    }
    this.winCellLayer?.removeChildren()
  }

  private drawWinDimmer(lines: SlotWinLine[]): void {
    if (!this.winDimLayer) return
    const winners = new Set(lines.flatMap(line => line.positions.map(([row, reel]) => `${reel}-${row}`)))
    this.winDimLayer.clear()
    for (let reel = 0; reel < this.colX.length; reel++) {
      for (let row = 0; row < this.rowCount; row++) {
        if (winners.has(`${reel}-${row}`)) continue
        this.winDimLayer.rect(
          17.02 + this.colX[reel],
          this.reelY + row * this.cellStep,
          this.colWidths[reel],
          this.cellSize,
        ).fill({ color: 0x060606, alpha: 0.62 })
      }
    }
  }

  private createWinLineFlows(lines: SlotWinLine[]): void {
    for (const line of lines) {
      if (line.positions.length < 2) continue
      const points = this.computeLinePoints(line.positions)
      this.animateLineFlow(points)
    }
  }

  private animateLineFlow(points: { x: number; y: number }[]): void {
    const lengths = [0]
    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1]
      const current = points[index]
      lengths.push(lengths[index - 1] + Math.hypot(current.x - previous.x, current.y - previous.y))
    }
    const totalLength = lengths[lengths.length - 1]
    if (!totalLength) return

    const glow = new Graphics()
    glow.blendMode = 'add'
    this.winScanLayer.addChild(glow)
    const progress = { value: 0 }
    this.winScans.push({ progress, glow })

    gsap.to(progress, {
      value: totalLength,
      duration: WIN_LINE_FLOW_DURATION,
      ease: 'none',
      repeat: -1,
      onUpdate: () => this.drawLineFlow(glow, points, lengths, totalLength, progress.value),
    })
  }

  private clearWinScans(): void {
    for (const scan of this.winScans) {
      gsap.killTweensOf(scan.progress)
    }
    this.winScans = []
    for (const child of this.winScanLayer?.removeChildren() ?? []) child.destroy({ children: true })
  }

  private drawLineFlow(
    glow: Graphics,
    points: { x: number; y: number }[],
    lengths: number[],
    totalLength: number,
    progress: number,
  ): void {
    if (glow.destroyed) return
    glow.clear()
    const start = progress - WIN_LINE_FLOW_LENGTH

    // 动画覆盖层就像一块窄幅渐变纹理，沿着固定的中奖线滑动：两端透明，中心最亮。
    for (let index = 0; index < WIN_LINE_FLOW_SEGMENTS; index++) {
      const from = start + WIN_LINE_FLOW_LENGTH * (index / WIN_LINE_FLOW_SEGMENTS)
      const to = start + WIN_LINE_FLOW_LENGTH * ((index + 1) / WIN_LINE_FLOW_SEGMENTS)
      const midpoint = (index + 0.5) / WIN_LINE_FLOW_SEGMENTS
      const intensity = Math.sin(Math.PI * midpoint) ** 1.45
      this.strokeWrappedSegment(glow, points, lengths, totalLength, from, to, WIN_LINE_FLOW_HALO_WIDTH, 0xff9d18, intensity * 0.26)
      this.strokeWrappedSegment(glow, points, lengths, totalLength, from, to, WIN_LINE_FLOW_CORE_WIDTH, 0xffe56e, intensity * 0.98)
    }
  }

  private strokeWrappedSegment(
    graphics: Graphics,
    points: { x: number; y: number }[],
    lengths: number[],
    totalLength: number,
    start: number,
    end: number,
    width: number,
    color: number,
    alpha: number,
  ): void {
    if (end <= 0 || start >= totalLength) {
      const wrappedStart = (start % totalLength + totalLength) % totalLength
      const wrappedEnd = (end % totalLength + totalLength) % totalLength
      if (wrappedStart <= wrappedEnd) {
        this.strokePathSegment(graphics, points, lengths, wrappedStart, wrappedEnd, width, color, alpha)
      } else {
        this.strokePathSegment(graphics, points, lengths, wrappedStart, totalLength, width, color, alpha)
        this.strokePathSegment(graphics, points, lengths, 0, wrappedEnd, width, color, alpha)
      }
      return
    }

    this.strokePathSegment(graphics, points, lengths, Math.max(0, start), Math.min(totalLength, end), width, color, alpha)
  }

  private strokePathSegment(
    graphics: Graphics,
    points: { x: number; y: number }[],
    lengths: number[],
    start: number,
    end: number,
    width: number,
    color: number,
    alpha: number,
  ): void {
    if (start >= end || alpha <= 0) return
    const first = this.pointAtDistance(points, lengths, start)
    graphics.moveTo(first.x, first.y)
    for (let index = 1; index < lengths.length - 1; index++) {
      if (lengths[index] > start && lengths[index] < end) graphics.lineTo(points[index].x, points[index].y)
    }
    const last = this.pointAtDistance(points, lengths, end)
    graphics.lineTo(last.x, last.y).stroke({ width, color, alpha })
  }

  private pointAtDistance(points: { x: number; y: number }[], lengths: number[], distance: number): { x: number; y: number } {
    for (let index = 1; index < lengths.length; index++) {
      if (distance > lengths[index]) continue
      const segmentLength = lengths[index] - lengths[index - 1]
      const ratio = segmentLength ? (distance - lengths[index - 1]) / segmentLength : 0
      return {
        x: points[index - 1].x + (points[index].x - points[index - 1].x) * ratio,
        y: points[index - 1].y + (points[index].y - points[index - 1].y) * ratio,
      }
    }
    return points[points.length - 1]
  }

}
