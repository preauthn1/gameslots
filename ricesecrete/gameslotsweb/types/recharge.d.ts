export type RechargeType = 0 | 1 | 2 | 3 | 4 | 6;
export type Offline = {
  id: number
  type: number
  bank_name: string
  icon?: string
  bank_khm: string
  bank_open: string
  bank_qrcode: string
  min_amcount: string
  max_amcount: string
  financial: string
  currency_id: number
  is_all: 0 | 1
  is_hot: 0 | 1
  pay_type: RechargeType
  hide_rate: number
  currencyApi: {
    id: number
    type: {
      text: string
      val: number
    }
    name: string
    country_code: string
    recharge_rate: string
    withdrawal_rate: string
    link_name: [],
    state: number
    is_defa: number
    currency_code: string
    currency_symbol: string
  }
}
export type Online = DeletKey<Offline, "min_amcount" | "max_amcount"> & {
  usdt_type: string
  pay_sys_sign: string
  pay_name: string
  pay_min_amout: string
  pay_max_amout: string
  address: string
}
export type PayTypes = {
  id: number
  name: string
  icon?: string
  online_list: Online[]
  cashback: number
}
export type V2_user_offline_get_recharge_config_api_type = {
  amount: string
  currency: string
  isFirst: 0 | 1
  success: number
}
export type V2_user_offline_recharge_config_api_type = {
  offline: Offline[]
  online: Online[]
  hide_rate: string
  currency_defa: number
  recharge_rate: number
  pay_agent: []
  recharge_amount_sitting: {
    bank_recharge_list: string[]
    hot_bank_recharge_list: string[]
    usdt_recharge_list: string[]
  }
  action_list: {
    id: number
    reg_json: {
      type: string
      min_reg: string
      max_reg: string
      bl_or_amount: string
      integral_amount: string
    }[]
    news_title: string
    news_images: string
  }[]
  pay_types: PayTypes[]
}

export type V2_user_offline_apply_api_type = {
  pay_url: string
  handle_type: string
  is_qrcode: 0 | 1
  qrcode_url: string
  address: string
}

export type ApplyParams = {
  type: RechargeType;
  bank_sk_id?: number;
  usdt_type?: string;
  pay_set_id?: number;
  apply_price: number | string;
  not_auto_action?: number;
  credentials?: string;
}

// 目前系统只支持4种渠道
// 0 => ‘银行卡’,
// 1 => ‘USDT’,
// 2 => ‘电子钱包’,
// 3 => ‘PIX’
export type V2_user_withdrawal_withdrawal_channel_api_type = {
  pay_type: {
    name: string
    type: 0 | 1 | 2 | 3
  }[]
}
export type WithdrawalApply = {
  bank_type: 0 | 1 | 2 | 3 | string
  bank_name: string
  bank_number: string
  bank_open?: string
  bank_hm?: string
  financial?: string
  province?: string
  city?: string
  remarks?: string
  w_price?: string
  ispass?: 0 | 1
  wpass?: string
  phone?: string
}

export type V2_user_withdrawal_withdrawal_config_api_type = {
  now_water_balance: string
  min_amount: string
  max_amount: string
  day_limit: number
  usdt_charge: number
  service_charge: number
  ver_withdrawal_first: number
  withdrawal_rules: number
  water: number
  waterdone: number
  water_progress: number
  user_withdrawal_amount: number
  usdt_type: {
    name: string
    code: string
    orderby: number
    field: string[]
  }[]
  pix_type: V2_user_withdrawal_withdrawal_config_api_type["usdt_type"]
  bank_type: V2_user_withdrawal_withdrawal_config_api_type["usdt_type"]
  wallet_type: V2_user_withdrawal_withdrawal_config_api_type["usdt_type"]
  last_card: {
    id: number
    bank_type: WithdrawalApply["bank_type"],
    bank_id: number
    bank_number: string
    bank_open: string
    bank_hm: string
    province: string
    city: string
    remarks: string
    bank_name: string
    currency_id: number
  }
  currency_defa: 1 | 2
  currency_code: string
  currency_symbol: string
}

export type Bank_List_Type = {
  paytype: Bank_List_Paytype_Type[]
  usdt_type: {}
  all_currency: {}
  currency: {}
  name: string
  country_code: string
  recharge_rate: string
  withdrawal_rate: string
  link_name: []
  state: string
  is_defa: 0 | 1
  limit: {
    day_limit: number
    max_amount: string
    min_amount: string
  }
}
export type Bank_List_Paytype_Type = {
  name: string
  key: number
  icon: string
  list: {
    bank_code: string
    bank_name: string
    orderby: number
    bank_field: []
  }[]
}
export type Bank_My_Type = {
  id: string
  bank_type: string
  bank_number: string
  bank_open: string
  bank_name: string
  bank_hm: string
  remarks: string
  withdrawal_rate: string
  recharge_rate: string
  currency_code: string
  currency_id: number
  withdrawal_rate: string
  recharge_rate: string
  currency_code: string
  is_input: number
  fast_pay: string[]
  bankcrad: string
}
