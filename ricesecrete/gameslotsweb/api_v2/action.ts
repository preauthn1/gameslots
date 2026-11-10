import Request from "@/utils/Request";
import type { V2_action_jyjdetail_api_type } from "~/types/action";
const request = new Request();

// 现金返还
export const v2_action_jyjdetail_api = () => {
  return request.send<V2_action_jyjdetail_api_type>({
    url: "v2/action/jyjdetail",
    method: "get"
  })
}

// 现金领取
export const v2_action_apply_api = (data: { action_id: number | string }) => {
  return request.send<[]>({
    url: "v2/action/apply",
    method: "get",
    query: data
  })
}

// 兑换码
export const code_receive = (data: { code: string }) => {
  return request.send<[]>({
    url: "/code/receive",
    method: "post",
    body: data
  })
}