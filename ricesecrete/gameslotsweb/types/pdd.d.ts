export interface Pdd_getData_api_type{
  id:number
  title:string
  introduce:string
  amount:string
  awarded_amount:number
  time:number
  remain_time:number
  invite_url:string
  current_symbol:string
  withdrawal_user_list:{
    username:string
    amount:string
  }[]
  user_invite_record:{
    username:string
    invite_username:string
    amount:string
  }[]
  remain_turntable_count:number
  phone_list:string[]
}

export interface Pdd_turntable_api_type {
  amount:number
  type:1|2 //类型（1转盘余额，2钱包余额）
}