// =============================================================================
// 麻将胡了游戏逻辑（gameId=2）
// 覆写动画/渲染相关方法实现麻将胡了专属行为
// =============================================================================
import { GameLogic } from './GameLogic'
import { MahjongGameRenderer } from './MahjongGameRenderer'
import type { GameRenderer } from './GameRenderer'
import type { WinDetail } from '@/api'

export class MahjongGameLogic extends GameLogic {
  protected createRenderer(): GameRenderer { return new MahjongGameRenderer() }

  // 麻将胡了：中奖高亮需要在卷轴遮罩内裁剪
  protected getClipWinnerCells(): boolean { return true }

  protected getWaitForWinnerSequence(): boolean { return true }

  /**
   * API 为每一轮连消返回一个 WinDetail，按从首次中奖到最终补牌的顺序排列。
   * 第一轮保持 x1；完成一次消除/补牌后，倍率为下一轮推进。
  */
  protected override async playCascadeRounds(wins: WinDetail[]): Promise<boolean> {
    // 麻将不使用 cascade_times。没有中奖记录仅表示本局
    // 无连消动画或倍率推进。
    if (wins.length === 0) return true

    const renderer = this.r as MahjongGameRenderer
    for (const [roundIndex, win] of wins.entries()) {
      const cells = new Set(win.positions.map(([row, col]) => `${col + 1}-${row + 1}`))
      if (cells.size === 0) continue

      // API 响应仅携带最终盘面。在高亮前先还原本轮的中奖图标，
      // 使每轮连消都清晰可辨。
      renderer.prepareMahjongCascadeWin(cells, win.icon)
      this.setWinners(cells)
      await this.fadeDone

      if (roundIndex < wins.length - 1) {
        await this.r.multiPanel.advanceTo(roundIndex + 1)
      }
    }

    return true
  }

  /** 中奖牌先停留两秒，再翻转爆开并由新牌从上方补入。 */
  protected setWinners(cells: Set<string>): void {
    this.fadeWinners()
    if (cells.size === 0) return

    this.r.addWinnerCells(cells)
    const previous = this.fadeDone
    this.fadeDone = previous.then(() => this.r.playMahjongWinSequence(cells, this.keys))
  }
}
