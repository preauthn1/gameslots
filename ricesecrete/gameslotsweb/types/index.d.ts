export interface RequestType<T = null> {
  code: 0 | 1 | 110 | 120 | 130 | 1000 // 0异常 1 正常 110谷歌验证码 120验证码  130提示：完善提现密码  1000需要登录
  data: T
  msg: string
}

// 系统配置相关
export interface SystemType {
  alllang: { icon: string, label: string, value: string }[]
  idc: { label: string, value: string }[]
  idc_default: string
  lang: { [key: string]: { [key: string] } }
  locale: string
  locale_flag: string
  nation: {
    name: string
    flag: string
    is_defa: 1 | 2
  }[]
  data: {
    android_download_url: string // 安卓下载地址
    app_version: string
    bind_card_status: 0 | 1 //绑卡验证  1开启  0关闭
    card_number: number //绑卡数量
    code_check: 0 | 1 | 2 | 3 //图形码验证 0全关 1全开 2登录 3注册
    favicon: string
    fund_status: 0 | 1 //基金板块 1开启  0关闭
    ios_download_url: string // 苹果下载地址
    mobile_service_url: string // 手机客服链接
    pc_service_url: string // 电脑客服链接
    phone_bind: 1 | 2 | 4 //绑定类型 1手机 2邮箱 4同时关闭
    phone_check: 0 | 1 //验证 方式 1开启  0关闭
    quick_recharge: string[] //快捷银行充值金额
    quick_withdrawal: string[] //快捷银行提现金额
    register_first_account_type: "email" | "phone" //注册显示
    service_charge: number // 提现服务费
    turntableStatus: 0 | 1 //转盘板块 1开启  0和1是关闭
    update_wpassword: 0 | 1 //修改提现密码验证 1开启，0关闭
    usdt_quick_recharge: string[] //快捷usdt充值金额
    usdt_quick_withdrawal: string[] //快捷usdt提现金额
    web_name: string
    web_url: string
    withdrawal_check_type: 1 | 2 | 3 //验证类型 1手机，2邮箱，3都开启，任意验证，4同时关闭
    withdrawal_status: 0 | 1 //提现验证 1开启，0关闭
    seo_keyword: string
    seo_intro: string
    monetary_type: string
  }
}
export interface SystemNewType {
  site: {
    android_download_url: string
    ios_download_url: string
    mobile_service_url: string
    pc_service_url: string
    website_desktop_logo: string
    website_favicon: string
    website_mobile_logo: string
    website_name: string
    website_pc_logo: string
    website_web_url: string
  }
  data: object
  lang: { [key: string]: { [key: string] } }
}


// 轮播图
interface Mobile {
  img: string
  jump_url: string
  show_position: number
  type: number
  url: string
}
export type BannerIndexApiType = {
  mobile: Mobile[]
}

// 公告
export interface noticeListApiQueryType {
  type?: 1 | 2,
  show_loca?: 1 | 2
}
export type noticeListApiType = {
  id: number
  add_time: string
  content: string
  is_show_time: number
  jump_url: string
  photo: string
  show_type: number
  title: string
}[]

// 首页游戏
export interface GameIndex2QueryApiType {
  nlimit?: number
}
export interface GameType {
  g_exfield: string
  g_is_self: number
  g_tcid: number
  g_type: number
  game_name: string
  game_status: number
  gi_content: string
  gi_headimg: string
  gi_info: string
  icon: string
  id: string
  is_collect: string
  label: string
  tc_code: string
  tc_name: string
  is_new_tab: number
}
export interface GameIndex2ApiType {
  [key: string]: {
    type: any
    game: GameType[]
    icon: string
    name: string
    icon_url: string
    total: number
    tag: number
  }
}
export interface GameListApiQueryType {
  page?: number | string
  limit?: number | string
  t_id?: number | string
  tc_id?: number | string
  tag?: number | string
  sports?: 1 | 2 	//1 体育赛事 2 非体育赛事
  push?: 1 | 2 //1 获取推送到首页游戏（悬浮图标展示） 2 正常（不传默认为2）
  hot?: 0 | 1
  is_play?: 0 | 1
  new?: 0 | 1
  collect?: 0 | 1
  keywords?: string
}
export type GameListApiType = GameType[]

// 三方
export type gameThirdApiType = {
  game_number: number
  icon: string
  simple_icon: string
  sort: number
  tc_id: number
  tc_name: number
}[]

// 游戏分类
export type gameGet_typeApiType = {
  name: string
  id: number
  sort: number
  icon: string
  icon2: string
  banner: string
  game_count: number
}[]


export interface swiperRefType {
  swiper: {
    slideNext: () => void
    slidePrev: () => void
  }
}

export type serviceListType = {
  name: string,
  introduce: string
  link: string
  img: string
}[]

interface high_win {
  gb_sn: string
  username: string
  gb_price: number
  gb_winprice: number
  gb_winlose: number
  gb_bettime: string
  game_name: string
  game_icon: string
}
export type fakeDataListApiType = {
  high_win: high_win[]
}