import bgmUrl from '@/assets/audio/licensed/bgm.mp3'

/** 已授权线上版本的主游戏背景音乐控制器。 */
class GameMusic {
  private readonly settingsKey = 'sungod_audio_music'
  /** 用户是否期望播放（用于自动播放被拦截后由 unlock() 重试） */
  private wantPlaying = false
  /** 音乐是否启用（可在设置中开关） */
  private enabled = this.readBoolean('enabled', true)
  private readonly volume = 0.4
  private duckFactor = 1
  /** 实际播放音频的 HTMLAudioElement 实例（懒创建） */
  private audio: HTMLAudioElement | null = null

  /** 开始播放；若自动播放被拦截会静默失败，等待 unlock() 重试 */
  async play(): Promise<void> {
    this.wantPlaying = true
    if (!this.enabled) return
    this.ensureAudio()
    const audio = this.audio
    if (!audio) return
    try {
      await audio.play()
    } catch {
      /* 自动播放会被浏览器拦截，直到有用户手势；unlock() 会重试。 */
    }
  }

  /** 用户手势后调用，恢复被拦截的播放 */
  unlock(): void {
    if (this.wantPlaying) void this.play()
  }

  get isEnabled(): boolean { return this.enabled }

  /** 开关音乐：开启时若此前想播放则恢复，关闭时暂停 */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.save()
    if (enabled) {
      if (this.wantPlaying) void this.play()
    } else {
      this.audio?.pause()
    }
  }

  /** Temporarily lower music beneath a major gameplay event. */
  setDucked(ducked: boolean): void {
    this.duckFactor = ducked ? 0.35 : 1
    this.applyVolume()
  }

  /** 停止播放并复位进度 */
  stop(): void {
    this.wantPlaying = false
    this.duckFactor = 1
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.applyVolume()
    }
  }

  /** 懒创建音频元素（循环播放、固定音量） */
  private ensureAudio(): void {
    if (this.audio) return
    const audio = new Audio(bgmUrl)
    audio.loop = true
    audio.preload = 'auto'
    this.audio = audio
    this.applyVolume()
  }

  private applyVolume(): void {
    if (this.audio) this.audio.volume = this.enabled ? this.volume * this.duckFactor : 0
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

export const gameMusic = new GameMusic()
