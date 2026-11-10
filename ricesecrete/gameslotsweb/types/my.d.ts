export type My_balanceRecord_api_type = {
  id: number
  new_price: string
  price: string
  type: string
  add_time: string
  child_type: string
}[]

export type Recharge_record_api_type = {
  type: 0 | 1 // 类型 0 线下 1 线上
  channel: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 渠道 0 挂卡 1 卡线上 3 usdt挂码 2 usdt线上 4电子钱包  6 PIX钱包
  add_time: string
  apply_price: string
  arrival_price: string
  order_sn: string
  update_time: string
  status: number
  remarks: string
  price: number
}[]

export type Withdraw_record_type = {
  id: number
  order_sn: string
  channel: 0 | 1 | 2 | 3
  w_price: string
  arrival_price: string
  arrival_prices: string
  w_service: string
  w_remarks: string
  status: -2 | -1 | 1 | 2 | 3 | 4 | 5 | 6 // -2已取消-1代付失败1 待审核 2 未通过 3 已通过 4 已通过 5 进行中6封控审核
  update_time: string
  add_time: string
  bank_number: string
  bank_name: string
  bankcrad: string
}[]
export type TeamOrderlistItem = {
  id: number;
  uid: number;
  add_time: string;
  zd_number: string;
  tz_price: string;
  sy_res: string;
  status: number;
  username: string;
  money_type: number;
};
export type GameOrderlistItem = {
  gb_id: number;
  gb_gid: number;
  gb_price: string;
  gb_sn: string;
  gb_winlose: number;
  gb_bettime: string;
  gb_overtime: string;
  gb_winprice: string;
  game_name: string;
  game_icon: string;
};
