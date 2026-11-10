// =============================================================================
// 麻将胡了渲染器（gameId=2）
// 中间 UI 裁剪中奖高亮，附带烟花爆炸 + 补位动画
// =============================================================================
import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import gsap from 'gsap'
import { GameRenderer, GameRendererOptions, R } from './GameRenderer'
import { gameSound } from './audio/GameSound'

const REEL_LEFT = 17.02

export class MahjongGameRenderer extends GameRenderer {
  readonly rowCount = 4
  readonly cellSize = 119.75
  readonly cellGap = 4
  /** Figma 4行设计：列X坐标 */
  get colX() { return [0, 147.98, 297.73, 447.48, 597.23] }
  readonly reelY = 677

  protected async buildMiddleUI(at: Map<string, Texture>, _options: GameRendererOptions): Promise<void> {
    await this.buildChar(at)
    this.buildFrame(at)
    this.buildReels()
    this.buildWinnerLayer(true)
  }

  // =========================================================================
  // 烟花爆炸 + 补位动画
  // =========================================================================

  /** 在级联回合开始前，放置服务器上报的中奖符号。 */
  prepareMahjongCascadeWin(cells: Set<string>, icon: string): void {
    const normalizedIcon = [...this.tex.keys()].find(key => key.toLowerCase() === icon.toLowerCase())
    if (!normalizedIcon) return

    for (const cell of cells) {
      const [reel, row] = cell.split('-').map(Number)
      const sprite = this.strips[reel - 1]?.children[row - 1] as Sprite | undefined
      if (!sprite) continue
      this.applySymbol(sprite, normalizedIcon, this.colWidths[reel - 1])
      sprite.visible = true
      sprite.alpha = 1
      sprite.rotation = 0
    }
  }

  async playMahjongWinSequence(cells: Set<string>, keys: string[]): Promise<void> {
    await new Promise<void>(resolve => window.setTimeout(resolve, 2000))

    const selected = new Set(cells)

    gameSound.play('explode')
    const bursts: Promise<void>[] = []
    for (const cell of cells) {
      const [rr, row] = cell.split('-').map(Number)
      const ri = rr - 1
      const sprite = this.strips[ri].children[row - 1] as Sprite

      const bx = REEL_LEFT + this.colX[ri] + this.colWidths[ri] / 2
      const by = this.reelY + (row - 1) * this.cellStep + this.cellSize / 2

      bursts.push(
        this.burstTile(
          sprite.texture, bx, by,
          sprite.width, sprite.height,
          this.winnerLayer,
        ),
      )

      sprite.visible = false
    }

    this.clearWinnerCells()
    await Promise.all(bursts)

    // 补位：未中奖牌下落 + 新牌由上方掉入
    gameSound.play('drop')
    const drops: gsap.core.Tween[] = []
    const finalKeysByReel: string[][] = []
    for (let ri = 0; ri < R; ri++) {
      const strip = this.strips[ri]
      const sprites = strip.children.slice(0, this.rowCount) as Sprite[]
      const survivors: Sprite[] = []
      const replacements: Sprite[] = []
      const finalKeys = Array<string>(this.rowCount)

      for (let row = this.rowCount - 1; row >= 0; row--) {
        const sprite = sprites[row]
        if (selected.has(`${ri + 1}-${row + 1}`)) replacements.push(sprite)
        else survivors.push(sprite)
      }

      let targetRow = this.rowCount - 1
      for (const sprite of survivors) {
        finalKeys[targetRow] = this.keyOfTexture(sprite.texture) ?? keys[0]
        drops.push(gsap.to(sprite, { y: targetRow * this.cellStep + this.cellSize / 2, duration: 0.38, ease: 'bounce.out' }))
        targetRow--
      }
      for (const sprite of replacements) {
        const replacementKey = keys[Math.floor(Math.random() * keys.length)]
        finalKeys[targetRow] = replacementKey
        this.applySymbol(sprite, replacementKey, this.colWidths[ri])
        sprite.visible = true
        sprite.y = (targetRow - replacements.length) * this.cellStep + this.cellSize / 2
        drops.push(gsap.to(sprite, { y: targetRow * this.cellStep + this.cellSize / 2, duration: 0.5, delay: 0.08, ease: 'bounce.out' }))
        targetRow--
      }
      finalKeysByReel.push(finalKeys)
    }

    await Promise.all(drops.map(drop => new Promise<void>(resolve => drop.eventCallback('onComplete', resolve))))
    finalKeysByReel.forEach((finalKeys, ri) => {
      const strip = this.strips[ri]
      finalKeys.forEach((key, row) => {
        const sprite = strip.children[row] as Sprite
        this.applySymbol(sprite, key, this.colWidths[ri])
        sprite.y = row * this.cellStep + this.cellSize / 2
      })
    })
  }

  private burstTile(
    tileTexture: Texture,
    x: number, y: number,
    tileW: number, tileH: number,
    parent: Container,
  ): Promise<void> {
    const container = new Container()
    container.x = x
    container.y = y
    container.label = 'burst-container'
    parent.addChild(container)

    const front = new Sprite(tileTexture)
    front.anchor.set(0.5)
    front.width = tileW
    front.height = tileH
    container.addChild(front)

    const back = new Graphics()
    back.roundRect(-tileW / 2, -tileH / 2, tileW, tileH, 10)
      .fill({ color: 0x5e1b0e })
      .stroke({ width: 5, color: 0xffdd58 })
    back.roundRect(-tileW / 2 + 12, -tileH / 2 + 12, tileW - 24, tileH - 24, 6)
      .stroke({ width: 2, color: 0xfff3b6, alpha: 0.9 })
    back.alpha = 0
    back.scale.x = 0.04
    container.addChild(back)

    const FIRE = [0xff3333, 0xff9933, 0xffdd33, 0x33ff66, 0x3399ff, 0xcc33ff, 0xff66aa, 0x66ffcc, 0xffcc00, 0xff5588]

    const starContainer = new Container(); starContainer.alpha = 0; starContainer.scale.set(0.1)
    for (let i = 0; i < 8; i++) {
      const ray = new Graphics()
      const angle = (Math.PI * 2 / 8) * i - Math.PI / 2
      const len = 18
      ray.moveTo(0, 0)
        .lineTo(Math.cos(angle - 0.08) * len, Math.sin(angle - 0.08) * len)
        .lineTo(Math.cos(angle) * (len + 8), Math.sin(angle) * (len + 8))
        .lineTo(Math.cos(angle + 0.08) * len, Math.sin(angle + 0.08) * len)
        .closePath().fill({ color: FIRE[i], alpha: 0.95 })
      starContainer.addChild(ray)
    }
    const glow = new Graphics()
    glow.circle(0, 0, 7).fill({ color: 0xffffff, alpha: 0.95 })
    starContainer.addChild(glow)
    container.addChild(starContainer)

    const rings: Graphics[] = []
    for (let i = 0; i < 5; i++) {
      const g = new Graphics()
      g.circle(0, 0, 8 + i * 7)
      g.stroke({ width: 3 - i * 0.4, color: FIRE[(i * 2) % FIRE.length], alpha: 0.9 })
      g.alpha = 0; g.scale.set(0.1)
      container.addChild(g)
      rings.push(g)
    }

    const SPARK_COUNT = 22 + Math.floor(Math.random() * 9)
    const sparks: { gfx: Graphics; angle: number; distance: number }[] = []
    for (let i = 0; i < SPARK_COUNT; i++) {
      const gfx = new Graphics()
      const color = FIRE[Math.floor(Math.random() * FIRE.length)]
      const size = 3 + Math.random() * 6
      const shape = Math.floor(Math.random() * 4)

      if (shape === 0) {
        gfx.moveTo(0, -size).lineTo(size * 0.4, 0).lineTo(0, size).lineTo(-size * 0.4, 0).closePath().fill(color)
      } else if (shape === 1) {
        gfx.circle(0, 0, size * 0.45).fill(color)
      } else if (shape === 2) {
        gfx.moveTo(0, -size * 0.7).lineTo(0, size * 0.7)
        gfx.stroke({ width: 2, color, alpha: 0.9 })
      } else {
        const h = size * 0.8
        gfx.moveTo(0, -h / 2).lineTo(h * 0.4, h / 2).lineTo(-h * 0.4, h / 2).closePath().fill(color)
      }

      gfx.alpha = 0; gfx.scale.set(0.3)
      gfx.rotation = Math.random() * Math.PI * 2
      container.addChild(gfx)

      const angle = (Math.PI * 2 / SPARK_COUNT) * i + (Math.random() - 0.5) * 0.25
      const distance = 80 + Math.random() * 120
      sparks.push({ gfx, angle, distance })
    }

    return new Promise<void>(resolve => {
      const tl = gsap.timeline({ onComplete: resolve })

      tl.to(front.scale, { x: front.scale.x * 1.2, y: front.scale.y * 1.2, duration: 0.05, ease: 'power4.out' })
      tl.to(front, { alpha: 0.85, duration: 0.05, ease: 'none' }, '<')

      tl.to(front.scale, { x: 0.04, duration: 0.12, ease: 'power4.in' })
      tl.set(front, { alpha: 0 })
      tl.set(back, { alpha: 1 })
      tl.to(back.scale, { x: 1, duration: 0.1, ease: 'power4.out' })
      tl.to(back.scale, { x: 0.04, duration: 0.1, ease: 'power4.in' }, '+=0.08')

      tl.set(starContainer, { alpha: 1, scale: 0.1 }, '<')
      tl.to(starContainer.scale, { x: 3, y: 3, duration: 0.24, ease: 'power3.out' }, '<')
      tl.to(starContainer, { alpha: 0, duration: 0.26, ease: 'power3.in' }, '<')

      for (let i = 0; i < rings.length; i++) {
        tl.set(rings[i], { alpha: 1, scale: 0.1 }, '<')
        tl.to(rings[i].scale, { x: 3.5 + i, y: 3.5 + i, duration: 0.32 + i * 0.07, ease: 'power3.out' }, '<')
        tl.to(rings[i], { alpha: 0, duration: 0.28, ease: 'power3.in' }, '<')
      }

      tl.call(() => sparks.forEach(s => { s.gfx.scale.set(1); s.gfx.alpha = 1 }))
      tl.to(sparks.map(s => s.gfx), { alpha: 0, duration: 0 }, '<')

      for (const spark of sparks) {
        tl.to(spark.gfx, {
          x: Math.cos(spark.angle) * spark.distance,
          y: Math.sin(spark.angle) * spark.distance,
          alpha: 0,
          scale: 0.03,
          rotation: spark.gfx.rotation + (Math.random() - 0.5) * 3.5,
          duration: 0.6 + Math.random() * 0.4,
          ease: 'power4.out',
        }, '<')
      }

      tl.to(container, { alpha: 0, scale: 1.3, duration: 0.4, ease: 'power4.out' }, '<')
    }).then(() => {
      container.destroy({ children: true })
      parent.removeChild(container)
    })
  }
}
