import type { My_info_v5_api_type } from "~/types/user";
import { my_info_v5_api } from "@/api";

// 用户信息
export const useUserInfo = ()=>{
  return useState<My_info_v5_api_type | null>("userInfo",()=>null);
}
export const updateUserInfo = async ()=>{
  const userInfo = useUserInfo()
  const res = await my_info_v5_api();
  if (res?.code == 1) {
    userInfo.value = res.data;
  }
}
// 用户信息
export const isRollout = () => {
  return useState('booleanState', () => false);
}