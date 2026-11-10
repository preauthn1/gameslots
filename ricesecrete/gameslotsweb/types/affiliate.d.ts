// 控制版
export interface V2_affiliate_summary_api_type {
  sta_today: {
    register: number //今日注册人数
    player: number //今日新玩家
    bet: number //今日有效投注
    team: number //今日团队奖励
  }
  sta_all: {
    register: number //全部注册人数
    player: number //全部新玩家
    bet: number //全部有效投注
    team: number //全部团队奖励
  }
  team: {
    level: {
      id: number //用户等级id
      level_name: string //用户等级名称
    }
    bonus: number //团队总奖励
    referral_reward: number //团队推荐奖励
  }
  share: {
    title: string //分享说明标题
    platform: {
      name: string
      id: number
      icon: string
      url: string
    }[] //分享平台数组数据
    intro: string //分享简介
    url: string //分享推广链接
  }
  service: {
    title: string //客服服务标题
    info: string //客服服务简介
    tip: string //客服服务提示
    contact: string //客服服务联系方式
    platform: {
      name: string
      id: number
      icon: string
      url: string
    } //客服服务平台
  }
  rule: {
    title: string //佣金奖励规则名称
    info: string //佣金奖励规则简介
    brokerage_min: string //佣金奖励规则区间最小值
    brokerage_max: string //佣金奖励规则区间最大值
    brokerage_ratio: string //佣金奖励规则区间比例
    pop_info: string //佣金奖励规则简介
    pop_explain: string //佣金奖励规则拓展说明
  }
}

// 报告页面数据列表
export type V2_affiliate_report_api_type = {
  day: string
  register: number
  bet: number
  rec_award: number
  team: number
}[]

export interface V2_affiliate_faq_api_type {
  issues_list: {
    id: number
    news_title: string
    news_content: string
    add_time: string
  }[]
  rule: {
    title: string
    billing: string
    info: string
    brokerage_min: string
    brokerage_max: string
    brokerage_ratio: string
    pop_info: string
    pop_explain: string
  }
}

export interface V2_affiliate_course_api_type {
  calculate_title: string
  calculate_text: string
}