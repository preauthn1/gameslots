// =============================================================================
// 老虎机游戏逻辑（经典老虎机，gameId=1）
// 覆写动画/渲染相关方法实现老虎机专属行为
// =============================================================================
import { GameLogic } from './GameLogic'
import { SlotGameRenderer } from './SlotGameRenderer'
import type { GameRenderer } from './GameRenderer'
import type { SlotWinLine } from './SlotGameRenderer'
import type { WinDetail } from '@/api'
import { centsToRupees } from '@/utils/useMoney'

export class SlotGameLogic extends GameLogic {
  private winnerSequenceId = 0

  protected createRenderer(): GameRenderer { return new SlotGameRenderer() }

  // 老虎机：中奖高亮不裁剪
  protected getClipWinnerCells(): boolean { return false }

  // 老虎机不展示倍率栏；麻将继续使用默认倍率栏界面。
  protected getShowMultiplier(): boolean { return false }

  // 结果一落定即弹出中奖弹窗；中奖线高亮仅作为视觉效果，不得延迟结果展示。
  protected getWaitForWinnerSequence(): boolean { return false }

  protected setWinners(_cells: Set<string>, wins: WinDetail[] = []): void {
    if (wins.length === 0) return

    this.clearWinners()
    const sequenceId = ++this.winnerSequenceId
    let resolveFirstCycle!: () => void
    this.fadeDone = new Promise<void>(resolve => { resolveFirstCycle = resolve })
    void this.playWinnerSequence(wins, sequenceId, resolveFirstCycle)
  }

  private async playWinnerSequence(wins: WinDetail[], sequenceId: number, resolveFirstCycle: () => void): Promise<void> {
    const renderer = this.r as SlotGameRenderer
    let firstCycle = true
    while (sequenceId === this.winnerSequenceId) {
      for (const [index, win] of wins.entries()) {
        if (sequenceId !== this.winnerSequenceId) return
        renderer.showWinLines([this.toWinLine(win)], index)
        renderer.addWinnerCells(this.toWinnerCells([win]))
        await new Promise<void>(resolve => window.setTimeout(resolve, 900))
        if (sequenceId !== this.winnerSequenceId) return
        renderer.clearWinnerCells()
      }

      renderer.showWinLines(wins.map(win => this.toWinLine(win)))
      renderer.addWinnerCells(this.toWinnerCells(wins))
      await new Promise<void>(resolve => window.setTimeout(resolve, 1200))
      if (sequenceId !== this.winnerSequenceId) return
      renderer.clearWinnerCells()
      if (firstCycle) {
        firstCycle = false
        resolveFirstCycle()
      }
    }
  }

  private toWinnerCells(wins: WinDetail[]): Set<string> {
    return new Set(wins.flatMap(win => win.positions.map(([row, col]) => `${col + 1}-${row + 1}`)))
  }

  protected onWinAmountCommitted(): void {
    (this.r as SlotGameRenderer).revealWinLineAmounts()
  }

  private toWinLine(win: WinDetail): SlotWinLine {
    return {
      name: win.payline_name.match(/\d+/)?.[0] ?? '',
      positions: win.positions,
      amount: centsToRupees(win.win_amount),
    }
  }

  clearWinners(): void {
    this.winnerSequenceId++
    super.clearWinners()
    ;(this.r as SlotGameRenderer).clearWinLines()
  }

  override destroy(): void {
    // 使等待 setTimeout 的中奖线轮播在恢复后立即退出。
    this.winnerSequenceId++
    super.destroy()
  }

}
