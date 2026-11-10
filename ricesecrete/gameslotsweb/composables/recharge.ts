import { v2_user_offline_recharge_config_api } from "~/api_v2/recharge";
import type { V2_user_offline_recharge_config_api_type } from "~/types/recharge";


// 用户信息
export const useRecharge = ()=>{
  return useState<V2_user_offline_recharge_config_api_type | null>("recharge",()=>null);
}
export const updateRecharge = async ()=>{
  const recharge = useRecharge()
  const res = await v2_user_offline_recharge_config_api();
  if (res?.code == 1) {
    recharge.value = res.data;
  }
}