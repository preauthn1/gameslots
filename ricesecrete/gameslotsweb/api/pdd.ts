import Request from "@/utils/Request";
import type { Pdd_getData_api_type, Pdd_turntable_api_type } from "~/types/pdd";
const request:Request = new Request();

// 获取pdd转盘数据
export const pdd_getData_api =()=>{
  return request.send<Pdd_getData_api_type>({
    url:"pdd/getData",
    method:"get"
  })
}

// pdd转盘抽奖
export const pdd_turntable_api =(data:{id:number|string})=>{
  return request.send<Pdd_turntable_api_type>({
    url:"pdd/turntable",
    method:"get",
    query:data
  })
}

// pdd转盘取款
export const pdd_withdrawal_api =(data:{id:number|string})=>{
  return request.send<[]>({
    url:"pdd/withdrawal",
    method:"get",
    query:data
  })
}