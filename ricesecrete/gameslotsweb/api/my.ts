import Request from "@/utils/Request";
import type { My_balanceRecord_api_type, Recharge_record_api_type, Withdraw_record_type, GameOrderlistItem } from "~/types/my";
const request: Request = new Request();

// 游戏记录
export const my_balanceRecord_api = (data: {
  page: number
  limit: number
  type: string | number
}) => {
  return request.send<My_balanceRecord_api_type, { type: string[] }>({
    url: "my/balanceRecord",
    method: "get",
    query: data
  })
}
// 充值记录
export const recharge_record_api = (data: { page: number, limit: number }) => {
  return request.send<Recharge_record_api_type>({
    url: "my/balanceRecord",
    method: "post",
    body: data
  })
}
// 提现记录
export const withdraw_record_api = (data: { page: number, limit: number }) => {
  return request.send<Withdraw_record_type>({
    url: "withdraw/record",
    method: "post",
    body: data
  })
}
//团队投注记录
/* export const team_orderlist_api = (data: {
  page: number;
  limit: number;
  date?: string;
  isday?: number | string;
  level?: number | string;
  settlement?: number | string;
}) => request.send<TeamOrderlistItem[]>({
  url: "/game/order",
  method: "post",
  body: data
}); */

/* 个人游戏投注记录 */
export const game_orderlist_api = (data: {
  page: number;
  limit: number;
  date?: string;
  isday?: number | string;
  settlement?: number | string;
  sports?: number;
}) => request.send<GameOrderlistItem[]>({
  url: "/game/order",
  method: "post",
  body: data
});