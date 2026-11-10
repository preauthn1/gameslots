import Request from "@/utils/Request";
import type { Action_list_api_type } from "~/types/action";
import type { task_list_api_type } from "~/types/action";
const request: Request = new Request();

// 活动列表
export const action_list_api = (data?: {
  page: number
  limit: number
}) => {
  return request.send<Action_list_api_type[]>({
    url: "action/list",
    method: "post",
    body: data
  })
}

// 活动详情
export const action_detail_api = (data: {
  action_id: number | string
}) => {
  return request.send<Action_list_api_type>({
    url: "action/detail",
    method: "post",
    body: data
  })
}

// 任务详情
export const task_detail_api = (data: {
  id: number | string
}) => {
  return request.send<task_list_api_type>({
    url: "task/details",
    method: "post",
    body: data
  })
}

// 任务详情
export const task_receive_api = (data: {
  task_id: number | string
}) => {
  return request.send<task_list_api_type>({
    url: "task/receive",
    method: "post",
    body: data
  })
}
