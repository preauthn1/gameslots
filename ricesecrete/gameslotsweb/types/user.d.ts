export interface My_info_v5_api_type {
  username: string
  head_img: string
  balance: string
  balance1: string
  level_id: number
  level_name: string
  next_level_name: string
  next_level_rate: string
  id: number
  real_name: string
  qh: string
  phone: string
  phone_status: number
  is_check_phone: 0 | 1 //是否手机验证，1需验证手机0不验证
  phone_bind_status: 0 | 1, //手机绑定状态 1 则为已绑定  0 为未绑定
  mail_bind_status: 0 | 1, //邮箱绑定状态 1 则为已绑定  0 为未绑定
  birthday: string
  withdrawal_psd: boolean
  usdt: number
  valid_money: number
  invalid_money: number
  recharge: number
  water: string
  accumulate: null | string
  yphone: string
  live_fund_money: string
  terday: number
  count_interest: number
  mail: string
  mail2: string
  goodsle_bind: 0 | 1 //谷歌验证是否绑定 0否 1是
  login_check: 0 | 1 //登录验证 0关 1开
  login_password_check: 0 | 1 //修改登录密码验证 0关 1开
  withdrawal_password_check: 0 | 1 //修改提现密码验证 0关 1开
  bankcard_check: 0 | 1 //绑定银行卡验证 0关 1开
  withdrawal_check: 0 | 1 //提现验证 0关 1开
  give_price: number
  third_balance: number //游戏中是否还存在资金
  cjbalance: string
}

export interface web_socket_api_type {
  WebSocket: string
  token: string
  uid: string
}