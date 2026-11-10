export interface Rule_params{
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
}
// 0	反洗钱政策
// 1	条款及条件
// 2	KYC 政策
// 3	自我排除政策
// 4	未成年人博彩政策（18 岁以上参与条款）
// 5	负责任的博彩政策
// 6	体育规则
// 7	帮助中心
// 8	关于我们
// 9	联系我们
// 10	怎么玩
// 11	奖金条款
// 12 充值规则
// 13 提现规则
export interface V2_rule_index_detail_api_type{
  id:number
  lang:string
  type:number
  content:string
  type_text:string
}