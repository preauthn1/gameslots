import { AnimatedSprite, Spritesheet, Assets, Texture, Container } from 'pixi.js'
import gsap from 'gsap'

// Spritesheet assets are from src/assets/spritesheet/sungod-idle/ (42-frame idle animation sequence).
// 每帧尺寸 400×538，排列在 3600×2690 的图集上
import spritesheetData from '../../../assets/spritesheet/sungod-idle/sungod-idle-spritesheet.json'
import spritesheetTexture from '../../../assets/spritesheet/sungod-idle/sungod-idle-spritesheet.webp'

// =============================================================================
// 设计稿基准常量（Figma 750×1624）
// =============================================================================

/** 太阳神角色显示宽度（设计稿中 sungod 的宽度） */
const CHAR_W = 799
/** 太阳神角色显示高度（设计稿中 sungod 的高度） */
const CHAR_H = 1158

/** 角色锚点 X 坐标（设计稿中心） */
const CHAR_CX = 375.5
/** 角色锚点 Y 坐标（设计稿中心） */
const CHAR_CY = 579

// =============================================================================
// 动画参数
// =============================================================================

/** tile 编号的集合（用于正确排除指定 tile） */
const SKIP_TILE_NUMS = new Set([14])

/**
 * 帧动画播放速率
 * - 42 帧 × 0.15 ≈ 每循环约 4.7 秒，适合待机呼吸节奏
 * - 值越大播放越快，0.15 为经过视觉调优的默认值
 */
const ANIM_SPEED = 0.15

/**
 * 浮动动画幅度（像素，基于设计稿）
 * - 角色在垂直方向上下浮动 ±8px，模拟悬浮/呼吸感
 * - 使用正弦缓动，两端平滑过渡
 */
const FLOAT_AMPLITUDE = 8

/**
 * 浮动动画周期（秒）
 * - 一个完整上下周期约 3 秒，与待机帧动画节奏协调
 * - 不与帧动画同步，避免机械感
 */
const FLOAT_DURATION = 3.0

// =============================================================================
// 全局纹理缓存
// =============================================================================

/** 纹理缓存（全局共享，避免重复解析 spritesheet 造成 GPU 资源浪费） */
let cachedTextures: Texture[] | null = null

// =============================================================================
// SungodAnimation — 太阳神人物背景动态动画
// =============================================================================

/**
 * 太阳神待机动画
 *
 * 功能概述：
 * - 使用 spritesheet 帧序列实现人物待机动态效果（42 帧循环）
 * - 叠加 gsap 垂直浮动效果，增强画面生动感
 * - 支持 init / play / destroy 生命周期
 *
 * 使用方式：
 * ```
 * const anim = new SungodAnimation()
 * await anim.init()
 * anim.play()
 * // ... 游戏结束时
 * anim.destroy()
 * ```
 */
export class SungodAnimation {
  /** 帧动画精灵（AnimatedSprite 自动循环播放帧序列） */
  private anim!: AnimatedSprite

  /** 容器节点（可挂载到任意 PixiJS 父容器） */
  readonly container = new Container()

  /** 是否已完成 init() */
  private _ready = false

  /** gsap 浮动动画引用（用于 kill 清理） */
  private _floatTween: gsap.core.Tween | null = null

  // =========================================================================
  // 初始化 — 解析 spritesheet 并创建 AnimatedSprite
  // =========================================================================

  /**
   * 加载 spritesheet 纹理并创建动画精灵
   *
   * 初始化流程：
   * 1. 检查全局纹理缓存，避免重复解析 spritesheet JSON
   * 2. 按 tile000 ~ tile049 编号升序排列帧序列
   * 3. 创建 AnimatedSprite 并设置尺寸/锚点/位置（与设计稿一致）
   * 4. 将精灵添加到内部 container
   *
   * 注意：init 仅构建动画结构，不自动播放，需调用 play() 启动
   */
  async init(): Promise<void> {
    if (this._ready) return

    // 纹理缓存复用：同一 spritesheet 只解析一次，大幅减少后续实例的初始化耗时
    if (!cachedTextures) {
      // 使用 Assets.load 确保纹理完全加载后再解析 spritesheet（Texture.from 返回未加载纹理，会导致帧为空）
      const baseTex = await Assets.load(spritesheetTexture)
      const sheet = new Spritesheet(baseTex, spritesheetData)
      await sheet.parse()

      // 按 tile 编号排序，剔除 SKIP_TILE_NUMS 中的帧
      cachedTextures = Object.keys(spritesheetData.frames)
        .sort((a, b) => {
          const na = parseInt(a.match(/\d+/)![0])
          const nb = parseInt(b.match(/\d+/)![0])
          return na - nb
        })
        .filter(f => !SKIP_TILE_NUMS.has(parseInt(f.match(/\d+/)![0])))
        .map(f => (sheet.textures as Record<string, Texture>)[f])
    }

    // 创建帧动画精灵
    this.anim = new AnimatedSprite(cachedTextures)
    this.anim.animationSpeed = ANIM_SPEED
    this.anim.loop = true

    // 尺寸、锚点、位置均与设计稿中 sungod 的布局保持一致
    this.anim.width = CHAR_W
    this.anim.height = CHAR_H
    this.anim.anchor.set(0.5)
    this.anim.x = CHAR_CX
    this.anim.y = CHAR_CY

    this.container.addChild(this.anim)
    this._ready = true
  }

  // =========================================================================
  // 播放控制
  // =========================================================================

  /** 开始播放帧动画 + 浮动效果（若未初始化则忽略） */
  play(): void {
    if (!this._ready) return
    this.anim.play()
    this._startFloat()
  }

  // =========================================================================
  // 浮动动画（内部方法）
  // =========================================================================

  /**
   * 启动垂直浮动动画
   *
   * 使用 gsap 正弦缓动在 Y 轴方向产生周期性上下偏移，模拟角色悬浮/呼吸效果。
   * - 偏移范围：±FLOAT_AMPLITUDE 像素
   * - 周期：FLOAT_DURATION 秒一个完整上下循环
   * - 无限重复，yoyo 往返避免跳变
   */
  private _startFloat(): void {
    if (this._floatTween) return // 已存在浮动动画，不重复创建
    this._floatTween = gsap.to(this.anim, {
      y: CHAR_CY + FLOAT_AMPLITUDE, // 下浮终点 = 中心 + 振幅
      duration: FLOAT_DURATION,
      repeat: -1,
      yoyo: true,      // 往返运动，自动回到上浮点
      ease: 'sine.inOut', // 正弦缓动，两端减速 → 过渡最自然
    })
  }

  /** 停止并清理浮动动画 */
  private _stopFloat(): void {
    if (this._floatTween) {
      this._floatTween.kill()
      this._floatTween = null
    }
    // 复位到设计稿中心位置
    this.anim.y = CHAR_CY
  }

  // =========================================================================
  // 销毁
  // =========================================================================

  /** 销毁动画：停止播放、清理浮动动画、释放 GPU 纹理引用 */
  destroy(): void {
    this._stopFloat()
    this.anim?.stop()
    this.anim?.destroy()
    this._ready = false
  }

}
