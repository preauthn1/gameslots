import Request from "@/utils/Request";
import type { ApplyParams, V2_user_offline_recharge_config_api_type, V2_user_offline_apply_api_type, V2_user_withdrawal_withdrawal_channel_api_type, V2_user_withdrawal_withdrawal_config_api_type, WithdrawalApply, Bank_List_Type, Bank_My_Type, V2_user_offline_get_recharge_config_api_type } from "~/types/recharge";
const request = new Request();

// 充值参数
export const v2_user_offline_recharge_config_api = () => {
  return request.send<V2_user_offline_recharge_config_api_type>({
    url: "v2/user_offline/recharge_config_v2",
    method: "get"
  })
}
// 充值参数
export const v2_user_offline_get_recharge_config_api = () => {
  return request.send<V2_user_offline_get_recharge_config_api_type>({
    url: "v2/user_offline/get_recharge_info",
    method: "get"
  })
}
// 确认充值
export const v2_user_offline_apply_api = (data: ApplyParams) => {
  return request.send<V2_user_offline_apply_api_type>({
    url: "v2/user_offline/apply",
    method: "post",
    body: data
  })
}
// 提现渠道
export const v2_user_withdrawal_withdrawal_channel_api = () => {
  return request.send<V2_user_withdrawal_withdrawal_channel_api_type>({
    url: "v2/user_withdrawal/withdrawal_channel",
    method: "get",
  })
}

// 提现参数
export const v2_user_withdrawal_withdrawal_config_api = (data: { bank_type: number | string }) => {
  return request.send<V2_user_withdrawal_withdrawal_config_api_type>({
    url: "v2/user_withdrawal/withdrawal_config",
    method: "post",
    body: data
  })
}

// 提现申请
export const v2_user_withdrawal_apply_api = (data: WithdrawalApply) => {
  return request.send<[]>({
    url: "v2/user_withdrawal/apply",
    method: "post",
    body: data
  })
}

// 绑卡类型
export const user_bank_list_api = () => {
  return request.send<Bank_List_Type>({
    url: "bank/list_type",
    method: "post",
  })
}

// 银行卡列表
export const user_bank_my_api = (data: { bank_type: number | string }) => {
  return request.send<Bank_My_Type[]>({
    url: "bank/my",
    method: "post",
    body: data
  })
}

// 绑定银行卡
export const user_bank_add_api = (data: WithdrawalApply) => {
  return request.send<[]>({
    url: "bank/add",
    method: "post",
    body: data
  })
}

