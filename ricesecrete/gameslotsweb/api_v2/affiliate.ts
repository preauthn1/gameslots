import Request from "@/utils/Request";
import type {V2_affiliate_report_api_type, V2_affiliate_summary_api_type,V2_affiliate_faq_api_type,V2_affiliate_course_api_type} from "~/types/affiliate";
const request = new Request();

// 控制板
export const v2_affiliate_summary_api =()=>{
  return request.send<V2_affiliate_summary_api_type>({
    url:"v2/affiliate/summary",
    method:"get",
  })
}

// 报告页面数据列表
export const v2_affiliate_report_api =(data:{page:number,limit:number})=>{
  return request.send<V2_affiliate_report_api_type>({
    url:"v2/affiliate/report",
    method:"get",
    query:data
  })
}

// 常问问题接口
export const v2_affiliate_faq_api =()=>{
  return request.send<V2_affiliate_faq_api_type>({
    url:"v2/affiliate/faq",
    method:"get"
  })
}

// 教程（佣金计算规则）
export const v2_affiliate_course_api =()=>{
  return request.send<V2_affiliate_course_api_type>({
    url:"v2/affiliate/course",
    method:"get"
  })
}