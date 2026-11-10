import Request from "@/utils/Request";
import type { Rule_params, V2_rule_index_detail_api_type } from "~/types/rule";
const request = new Request();

// 系统配置

export const v2_rule_index_detail_api = (data: Rule_params) => {
  return request.send<V2_rule_index_detail_api_type>({
    url: "v2/rule_index/detail",
    method: "get",
    query: data,
    hideToast: true
  })
}