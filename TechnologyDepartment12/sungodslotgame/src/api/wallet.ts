/**
 * 钱包 — 余额
 */
import { get } from './client'
import type { BalanceData } from './types'

export function getBalance(): Promise<BalanceData> {
  return get<BalanceData>('/wallet/balance')
}
