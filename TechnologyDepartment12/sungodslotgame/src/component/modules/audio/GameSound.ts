// 滚轮开始转动声
import spinStartUrl from '@/assets/audio/licensed/spin-start.mp3'
// 滚轮循环滚动声
import spinLoopUrl from '@/assets/audio/licensed/spin-loop.mp3'
// 滚轮停止声
import reelStopUrl from '@/assets/audio/licensed/reel-stop.mp3'
// 中奖音效
import winUrl from '@/assets/audio/licensed/win.mp3'
// 大赢音效
import bigWinUrl from '@/assets/audio/licensed/big-win.mp3'
// 大赢结束音效
import bigWinEndUrl from '@/assets/audio/licensed/big-win-end.mp3'
// 免费旋转（scatter）音效
import scatterUrl from '@/assets/audio/licensed/scatter.mp3'
// 倍率音效
import multiplierUrl from '@/assets/audio/licensed/multiplier.mp3'
// 麻将消除音效
import mahjongEliminateUrl from '@/assets/audio/licensed/mahjong-eliminate.wav'
// 麻将掉落音效
import mahjongDropUrl from '@/assets/audio/licensed/mahjong-drop.wav'
// 按钮点击音效
import clickUrl from '@/assets/audio/licensed/click.mp3'

type SoundName =
  | 'spin' | 'reelStop' | 'win' | 'bigWin' | 'bigWinEnd' | 'freeSpin' | 'click'
  | 'explode' | 'drop' | 'levelUp'

/** 已授权线上版本的声音事件映射。未精确映射的旧事件保持静音。 */
const SOUND_SOURCES: Record<SoundName, string[]> = {
  spin: [spinStartUrl],
  reelStop: [reelStopUrl],
  win: [winUrl],
  bigWin: [bigWinUrl],
  bigWinEnd: [bigWinEndUrl],
  freeSpin: [scatterUrl],
  click: [clickUrl],
  explode: [mahjongEliminateUrl],
  drop: [mahjongDropUrl],
  levelUp: [multiplierUrl],
}

class GameSound {
  /** Web Audio 上下文（懒创建） */
  private context: AudioContext | null = null
  /** 主输出增益节点（接压缩器后输出到扬声器） */
  private output: GainNode | null = null
  /** 当前循环播放的滚轮音频源 */
  private rollSource: AudioBufferSourceNode | null = null
  private rollGain: GainNode | null = null
  /** 各音效当前活跃的播放源，用于按名称停止（如大奖音效） */
  private activeSources = new Map<SoundName, Set<AudioBufferSourceNode>>()
  private readonly settingsKey = 'sungod_audio_sfx'
  /** URL → 已解码 AudioBuffer 的缓存 */
  private buffers = new Map<string, AudioBuffer>()
  private loading = new Map<string, Promise<void>>()
  private failedAt = new Map<string, number>()
  private lastPlayedAt = new Map<SoundName, number>()
  /** 音效是否启用 */
  private enabled = this.readBoolean('enabled', true)
  private readonly volume = 0.8

  get isEnabled(): boolean { return this.enabled }

  /** 开关音效：关闭时停止滚轮滚动声及所有正在播放的音效 */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.save()
    if (!enabled) {
      this.stopRoll()
      for (const name of [...this.activeSources.keys()]) this.stop(name)
    }
  }

  /** 用户手势后调用：恢复挂起的上下文并预加载音频 */
  unlock(): void {
    const context = this.getContext()
    if (context?.state === 'suspended') void context.resume()
    void this.preload()
  }

  /** 播放指定音效；未加载时先触发预加载 */
  play(name: SoundName): void {
    if (!this.enabled) return
    const urls = SOUND_SOURCES[name]
    if (urls.length === 0) return
    const context = this.getContext()
    if (!context) return
    // 上下文未运行（如自动播放受限）时，先恢复再重试
    if (context.state !== 'running') {
      void context.resume().then(() => {
        if (context.state === 'running') this.play(name)
      }).catch(() => undefined)
      return
    }

    if (!this.hasBuffers(urls)) {
      void this.loadAll(urls).then(() => {
        if (this.hasBuffers(urls)) this.play(name)
      })
      return
    }

    const now = performance.now()
    const minimumInterval = name === 'reelStop' ? 70 : 25
    if (now - (this.lastPlayedAt.get(name) ?? -Infinity) < minimumInterval) return
    this.lastPlayedAt.set(name, now)

    // 逐个叠加播放，第一个为主音（音量 1），后续为点缀（音量 0.55）
    urls.forEach((url, index) => {
      const buffer = this.buffers.get(url)
      if (!buffer) return
      this.playBuffer(context, buffer, context.currentTime + index * 0.06, index === 0 ? 1 : 0.55, name)
    })
  }

  /** 滚轮滚动期间循环播放下载的滚轮音频；调用 stopRoll() 时停止。 */
  startRoll(): void {
    this.stopRoll()
    if (!this.enabled) return
    const context = this.getContext()
    if (!context) return
    if (context.state !== 'running') {
      void context.resume().then(() => this.startRoll()).catch(() => undefined)
      return
    }
    const buffer = this.buffers.get(spinLoopUrl)
    if (!buffer) {
      void this.loadAll([spinLoopUrl]).then(() => {
        if (this.buffers.has(spinLoopUrl)) this.startRoll()
      })
      return
    }

    const source = context.createBufferSource()
    const gain = context.createGain()
    source.buffer = buffer
    source.loop = true
    gain.gain.setValueAtTime(0.7, context.currentTime)
    source.connect(gain).connect(this.output!)
    source.onended = () => {
      source.disconnect()
      gain.disconnect()
    }
    source.start()
    this.rollSource = source
    this.rollGain = gain
  }

  /** 停止滚轮滚动声并释放相关节点 */
  stopRoll(): void {
    if (this.rollSource && this.rollGain && this.context) {
      const now = this.context.currentTime
      this.rollGain.gain.cancelScheduledValues(now)
      this.rollGain.gain.setValueAtTime(this.rollGain.gain.value, now)
      this.rollGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      this.rollSource.stop(now + 0.1)
      this.rollSource = null
      this.rollGain = null
    }
  }

  /** 在指定时间以指定音量播放单个 buffer；传入 name 时纳入可停止跟踪。 */
  private playBuffer(context: AudioContext, buffer: AudioBuffer, when: number, volume: number, name?: SoundName): void {
    const source = context.createBufferSource()
    source.buffer = buffer
    const gain = context.createGain()
    gain.gain.value = volume
    source.connect(gain).connect(this.output!)
    if (name) {
      let set = this.activeSources.get(name)
      if (!set) { set = new Set(); this.activeSources.set(name, set) }
      set.add(source)
    }
    source.onended = () => {
      if (name) this.activeSources.get(name)?.delete(source)
      source.disconnect()
      gain.disconnect()
    }
    source.start(when)
  }

  /** 立即停止指定音效的所有活跃播放源（如大奖弹窗关闭时停止大奖音效）。 */
  stop(name: SoundName): void {
    const set = this.activeSources.get(name)
    if (!set) return
    for (const source of set) {
      try { source.stop() } catch { /* 已停止或尚未开始，忽略 */ }
    }
    set.clear()
  }

  /** 判断所有 URL 对应的 buffer 是否都已缓存 */
  private hasBuffers(urls: string[]): boolean {
    return urls.every((url) => this.buffers.has(url))
  }

  /** 预加载所有已映射资源，供初始化阶段提前解码，避免首次播放延迟。 */
  preload(): Promise<void> {
    return this.loadAll([...new Set([...Object.values(SOUND_SOURCES).flat(), spinLoopUrl])])
  }

  private loadAll(urls: string[]): Promise<void> {
    return Promise.all(urls.map(url => this.load(url))).then(() => undefined)
  }

  private load(url: string): Promise<void> {
    if (this.buffers.has(url)) return Promise.resolve()
    const failedAt = this.failedAt.get(url)
    if (failedAt && Date.now() - failedAt < 3_000) return Promise.resolve()
    const pending = this.loading.get(url)
    if (pending) return pending

    const task = (async () => {
      try {
        const context = this.getContext()
        if (!context) return
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const buffer = await context.decodeAudioData(await response.arrayBuffer())
        this.buffers.set(url, buffer)
        this.failedAt.delete(url)
      } catch {
        this.failedAt.set(url, Date.now())
      } finally {
        this.loading.delete(url)
      }
    })()
    this.loading.set(url, task)
    return task
  }

  /** 获取（懒创建）AudioContext 并搭建压缩器与输出链路 */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.context = new Ctor()
      const compressor = this.context.createDynamicsCompressor()
      compressor.threshold.value = -16
      compressor.knee.value = 12
      compressor.ratio.value = 8
      compressor.attack.value = 0.003
      compressor.release.value = 0.2
      this.output = this.context.createGain()
      this.output.gain.value = this.volume
      this.output.connect(compressor).connect(this.context.destination)
    }
    return this.context
  }

  private readBoolean(key: string, fallback: boolean): boolean {
    if (typeof window === 'undefined') return fallback
    const raw = localStorage.getItem(`${this.settingsKey}_${key}`)
    return raw === null ? fallback : raw === 'true'
  }

  private save(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.settingsKey}_enabled`, String(this.enabled))
  }

}

export const gameSound = new GameSound()
