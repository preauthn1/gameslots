<script setup lang='ts'>
// @ts-ignore
import commForm from '@/components/comm/comm-form2.vue'
import { reactive, ref, defineAsyncComponent } from 'vue';
import { systemEdit } from "@/api/user";
import { Delete, Plus } from '@element-plus/icons-vue'
import { message } from "@/utils/message";
import { http } from '@/utils/http';
defineOptions({
  name: 'systemSetting'
})
//基础设置
const website = {
  website_name: {
    type: 'input',
    label: '网站名称',
    placeholder: '网站名称',
    value: '',
    prop: 'website_name'
  },
  // website_web_url:{
  //   type: 'input',
  //   label: '网站域名',
  //   placeholder: '网站域名',
  //   tip: '域名，多个英文逗号隔开，例：https://test.com,https://test1.com',
  //   value: '',
  //   prop:'website_web_url'
  // },
  website_favicon: {
    type: 'file',
    label: '浏览器icon',
    placeholder: '浏览器icon',
    tip: '浏览器icon（32*32）',
    value: '',
    upload_type: 'file',
    prop: 'website_favicon'
  },
  website_pc_logo: {
    type: 'file',
    label: 'PC端 LOGO',
    placeholder: 'PC端 LOGO',
    tip: 'PC端 LOGO（284*70）',
    value: '',
    upload_type: 'file',
    prop: 'website_pc_logo'
  },
  website_desktop_logo: {
    type: 'file',
    label: '桌面 LOGO',
    placeholder: '桌面 LOGO',
    tip: '移动端保存到桌面的LOGO（1024*1024）',
    value: '',
    upload_type: 'file',
    prop: 'website_desktop_logo'
  },
  website_mobile_logo: {
    type: 'file',
    label: '移动端 LOGO',
    placeholder: '移动端 LOGO',
    tip: '移动端 LOGO（100*100）',
    value: '',
    upload_type: 'file',
    prop: 'website_mobile_logo'
  },
  android_download_url: {
    type: 'file',
    label: '安卓下载链接',
    placeholder: '安卓下载链接',
    value: '',
    upload_type: 'app',
    prop: 'android_download_url'
  },
  ios_download_url: {
    type: 'file',
    label: 'iOS下载链接',
    placeholder: 'iOS下载链接',
    value: '',
    upload_type: 'app',
    prop: 'ios_download_url'
  },
  pc_service_url: {
    type: 'input',
    label: 'pc端客服链接',
    placeholder: 'pc端客服链接',
    tip: '多个链接用逗号隔开，前端将随机获取一个链接',
    value: '',
    prop: 'pc_service_url'
  },
  mobile_service_url: {
    type: 'input',
    label: '移动端客服链接',
    placeholder: '移动端客服链接',
    tip: '多个链接用逗号隔开，前端将随机获取一个链接',
    value: '',
    prop: 'mobile_service_url'
  },
  whatsapp_public_url: {
    type: 'input',
    label: 'WhatsApp链接',
    placeholder: 'WhatsApp链接',
    tip: '多个链接用逗号隔开，前端将随机获取一个链接',
    value: '',
    prop: 'whatsapp_public_url'
  },
}
const websiteRules = {

}
const websiteBox = reactive({ website })
//基础设置变化
const websiteChange = ({ value, index }) => {
  websiteBox.website[index].value = value;
  boxObj.websiteModel[index] = value;
}
//基础数据变化
const websiteModel = {
  website_name: '',
  // website_web_url: '',
  website_favicon: '',
  website_pc_logo: '',
  website_desktop_logo: '',
  website_mobile_logo: '',
  android_download_url: '',
  ios_download_url: '',
  pc_service_url: '',
  mobile_service_url: '',
  whatsapp_public_url: '',
}


//站点
const jichu = {
  domain: {
    type: 'input',
    label: '域名',
    placeholder: '域名',
    value: '',
    prop: 'domain'
  },
  web_url: {
    type: 'input',
    label: '用户端域名',
    placeholder: '用户端域名',
    value: '',
    prop: 'web_url'
  },
  seo_keyword: {
    type: 'input',
    label: 'SEO关键字',
    placeholder: 'SEO关键字',
    value: '',
    prop: 'seo_keyword'
  },
  seo_intro: {
    type: 'input',
    label: 'SEO简介',
    placeholder: 'SEO简介',
    value: '',
    prop: 'seo_intro'
  },
  time_zone: {
    type: 'input',
    label: '默认时区',
    placeholder: '默认时区',
    value: '',
    prop: 'time_zone'
  },
  COUNT_DATA_TIMEZONE_LIST: {
    type: 'input',
    ty: 'list',
    label: '统计数据时区列表',
    placeholder: '统计数据时区列表',
    tip: '格式：时区标志|时区+-值，每一个时区都会生成一张后缀为时区代码的表（包括切表） 默认表不带后缀，不设置此配置时DEFAULT的时候按env.mysql_timezone，+0：00顺序取值，设置时按env.mysql_timezone,此设置值顺序取值',
    value: '',
    prop: 'COUNT_DATA_TIMEZONE_LIST'
  },
  weihu: {
    type: 'slot',
    label: '维护设置',
    placeholder: '维护设置',
    value: '',
    name: 'weihu',
    prop: 'weihu'
  },
  /*fund_status: {
    type: 'radio',
    label: '基金板块',
    placeholder: '基金板块',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 2,
        name: '关闭'
      },
    ],
    prop: 'fund_status'
  },*/
  start_page_status: {
    type: 'radio',
    label: '启动页',
    placeholder: '启动页',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'start_page_status'
  },
}
const jichuRules = {

}
const jichuBox = reactive({ jichu })
//基础设置变化
const jichuChange = ({ value, index }) => {
  jichuBox.jichu[index].value = value;
  boxObj.jichuModel[index] = value;
}
//基础数据变化
const jichuModel = {
  domain: '',
  web_url: '',
  seo_intro: '',
  seo_keyword: '',
  // share_title: '',
  // share_img: '',
  // share_info: '',
  time_zone: '',
  COUNT_DATA_TIMEZONE_LIST: '',
  //fund_status: '',
  start_page_status: '',
}

//验证设置
const yanzhen = {
  phone_bind: {
    type: 'radio',
    label: '注册账号类型',
    placeholder: '注册账号类型',
    value: '',
    options: [
      {
        label: 1,
        name: '手机'
      }, {
        label: 2,
        name: '邮箱'
      }, {
        label: 3,
        name: '同时开启'
      },
    ],
    prop: 'phone_bind'
  },
  is_reg_type: {
    type: 'radio',
    label: '需要额外填信息',
    placeholder: '需要额外填信息',
    tip: '当注册类型选择单个类型时是否需要另外填写[手机/邮箱]资料',
    value: 0,
    options: [
      {
        label: 1,
        name: '手机'
      },
      {
        label: 2,
        name: '邮箱'
      },
      {
        label: 0,
        name: '否'
      },
    ],
    show: true,
    prop: 'is_reg_type'
  },
  phone_check: {
    type: 'radio',
    label: '注册验证码',
    placeholder: '注册验证码',
    value: '',
    show: false,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'phone_check'
  },
  mail_open: {
    type: 'radio',
    label: '邮件次数验证',
    placeholder: '邮件次数验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'mail_open'
  },
  mail_ip_num: {
    type: 'input',
    ty: 'number',
    label: '邮件次数',
    placeholder: '邮件次数限制',
    value: '',
    show: true,
    prop: 'mail_ip_num'
  },
  mail_time: {
    type: 'input',
    ty: 'number',
    label: '邮件发送频率',
    placeholder: '间隔时间/秒',
    tip: '邮件发送频率，单位/秒',
    value: '',
    show: true,
    prop: 'mail_time'
  },
  phone_open: {
    type: 'radio',
    label: '短信次数验证',
    placeholder: '短信次数验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'phone_open'
  },
  phone_ip_num: {
    type: 'input',
    ty: 'number',
    label: '短信次数',
    placeholder: '短信次数限制',
    tip: '短信发送频率，单位/秒',
    value: '',
    show: true,
    prop: 'phone_ip_num'
  },
  phone_time: {
    type: 'input',
    ty: 'number',
    label: '短信发送频率',
    placeholder: '间隔时间/秒',
    tip: '短信发送频率，单位/秒',
    value: '',
    show: true,
    prop: 'phone_time'
  },
  code_check: {
    type: 'radio',
    label: '图形码验证',
    placeholder: '图形码验证',
    value: '',
    options: [
      {
        label: 0,
        name: '全关'
      }, {
        label: 1,
        name: '全开'
      }, {
        label: 2,
        name: '登录'
      }, {
        label: 3,
        name: '注册'
      }
    ],
    prop: 'code_check'
  },
  promotion_code: {
    type: 'radio',
    label: '邀请码必填',
    placeholder: '邀请码必填',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      },
    ],
    prop: 'promotion_code'
  },
  user_verify_status: {
    type: 'radio',
    label: '实名认证是否开启',
    placeholder: '实名认证是否开启',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      },
    ],
    prop: 'user_verify_status'
  },
  auto_user_verify: {
    type: 'radio',
    label: '实名认证是否自动审核',
    placeholder: '实名认证是否自动审核',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      },
    ],
    prop: 'auto_user_verify'
  },
  area_code: {
    type: 'input',
    label: '手机区号',
    placeholder: '手机区号设置',
    tip: '手机区号设置，每个数字以英文“,”隔开,格式：86,87,88',
    value: '',
    prop: 'area_code'
  },
  phone_rule: {
    type: 'input',
    label: '手机首位',
    placeholder: '手机首位',
    tip: '手机号码首位数字规则设置，每个数字以英文“,”隔开,格式：1,2,3',
    value: '',
    prop: 'phone_rule'
  },
  phone_num_rule: {
    type: 'input',
    label: '手机位数',
    placeholder: '手机位数',
    tip: '手机号码位数规则设置，每个数字以英文“,”隔开,格式：8,9,10',
    value: '',
    prop: 'phone_num_rule'
  },
  ip_num_limit: {
    type: 'input',
    ty: 'number',
    label: 'IP限制',
    placeholder: 'IP限制',
    tip: '用户同IP能注册几个账号（0代表不限制注册账号数量）',
    value: '',
    prop: 'ip_num_limit'
  },
  user_google_status: {
    type: 'radio',
    label: '用户谷歌验证',
    placeholder: '用户谷歌验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'user_google_status'
  },
  is_open_email_or_phone_check: {
    type: 'radio',
    label: '是否开启邮箱验证或手机验证',
    placeholder: '是否开启邮箱验证或手机验证',
    tip: '是否开启邮箱验证或手机验证，开启后添加银行必须要该账号已经验证过手机或邮箱，验证过一次后下次不再验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'is_open_email_or_phone_check'
  },
  is_lowercs: {
    type: 'radio',
    label: '测试账号',
    placeholder: '测试账号',
    tip: '正式会员：测试账号推广的用户注册为正式用户<br/>测试会员：测试账号推广的用户注册为测试用户<br/>无效：测试账号不能推广',
    value: '',
    options: [
      {
        label: 0,
        name: '正式会员'
      }, {
        label: 1,
        name: '测试会员'
      }, {
        label: 2,
        name: '无效'
      },
    ],
    prop: 'is_lowercs'
  },
  reg_gift_bonus: {
    type: 'input',
    label: '注册赠送彩金',
    placeholder: '注册赠送彩金',
    tip: '',
    value: '',
    prop: 'reg_gift_bonus'
  },
  reg_gift_savings: {
    type: 'input',
    label: '注册赠送彩金流水倍数',
    placeholder: '注册赠送彩金流水倍数',
    tip: '',
    value: '',
    prop: 'reg_gift_savings'
  },
  reg_gift_integral: {
    type: 'input',
    label: '注册赠送积分',
    placeholder: '注册赠送积分',
    tip: '',
    value: '',
    prop: 'reg_gift_integral'
  },
  trial_amount: {
    type: 'input',
    label: '试玩金额限制',
    placeholder: '试玩金额限制',
    tip: '',
    value: '',
    prop: 'trial_amount'
  },
  recharge_amount:{
    type: 'input',
    label: '充值金额限制',
    placeholder: '充值金额限制',
    tip: '',
    value: '',
    prop: 'recharge_amount'
  }
}
const yanzhenRules = {

}
const yanzhenBox = reactive({ yanzhen })

const yanzhenModel = {
  phone_bind: '',
  is_reg_type: '',
  phone_check: '',
  mail_open: '',
  mail_ip_num: '',
  mail_time: '',
  phone_open: '',
  phone_ip_num: '',
  phone_time: '',
  code_check: '',
  promotion_code: '',
  user_verify_status: '',
  auto_user_verify: '',
  area_code: '',
  phone_rule: '',
  phone_num_rule: '',
  ip_num_limit: '',
  user_google_status: '',
  is_open_email_or_phone_check: '',
  is_lowercs: '',
  reg_gift_bonus: 0,
  reg_gift_savings: 0,
  reg_gift_integral:0,
  trial_amount:500,
  recharge_amount:100,

}
const yanzhenChange = ({ value, index }) => {
  if (index == 'mail_open') {
    yanzhenBox.yanzhen['mail_ip_num'].show = value == 1 ? false : true;
    yanzhenBox.yanzhen['mail_time'].show = value == 1 ? false : true;
  } else if (index == 'phone_open') {
    yanzhenBox.yanzhen['phone_ip_num'].show = value == 1 ? false : true;
    yanzhenBox.yanzhen['phone_time'].show = value == 1 ? false : true;
  }
  else if (index == 'phone_bind') {
    yanzhenBox.yanzhen['is_reg_type'].show = value != 3 ? false : true;
  }
  yanzhenBox.yanzhen[index].value = value;
  boxObj.yanzhenModel[index] = value;

}


//提现设置
const tixian = {
  // withdrawal_check_type:{
  //   type: 'radio',
  //   label: '验证类型',
  //   placeholder: '验证类型',
  //   value: '',
  //   options: [
  //     {
  //       label: 1,
  //       name:'手机'
  //     },{
  //       label: 2,
  //       name:'邮箱'
  //     },{
  //       label: 4,
  //       name:'关闭'
  //     },
  //   ],
  //   prop:'withdrawal_check_type'
  // },
  is_withdraw: {
    type: 'radio',
    label: '提现开关',
    placeholder: '提现开关',
    tip: '关闭后不允许提现',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'is_withdraw'
  },
  saving_zero_withdrawal: {
    type: 'radio',
    label: '流水为0提现',
    placeholder: '流水为零提现',
    tip: '开启后用户流水为零才能提现',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'saving_zero_withdrawal'
  },
  withdrawal_extra_status: {
    type: 'radio',
    label: '提现代付失败额外状态',
    placeholder: '提现代付失败额外状态',
    tip: '提现代付失败额外状态，如果开启后三方代付失败后需要重新审核钱才会退回用户余额',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'withdrawal_extra_status'
  },
  withdraw_amcount: {
    type: 'radio',
    label: '提现金额',
    placeholder: '提现金额',
    tip: '关闭后不允许提现',
    value: '',
    options: [
      {
        label: 1,
        name: '100的倍数'
      }, {
        label: 0,
        name: '10的倍数'
      }, {
        label: 2,
        name: '不限制'
      }
    ],
    prop: 'withdraw_amcount'
  },
  service_charge: {
    type: 'input',
    label: '提现手续费%',
    placeholder: '提现手续费',
    value: '',
    prop: 'service_charge'
  },
  usdt_charge: {
    type: 'input',
    label: 'USDT提现手续费%',
    placeholder: 'USDT提现手续费',
    value: '',
    prop: 'usdt_charge',
    show: true,
  },
  w_water: {
    type: 'input',
    ty: 'number',
    label: '提现流水倍数',
    placeholder: '提现流水倍数',
    value: '',
    prop: 'w_water'
  },
  allow_not_recharge: {
    type: 'input',
    ty: 'number',
    label: '允许未审核数量',
    placeholder: '允许未审核数量',
    tip: '1为用户只允许有一笔未审核的充值订单，0或为空为不限制',
    value: 0,
    prop: 'allow_not_recharge'
  },
  withdrawal_rules: {
    type: 'radio',
    label: '提现规则',
    placeholder: '提现规则',
    tip: '单流水：记单笔充值流水，如：充值1000，下了2000流水，再充值1000，用户账户必须预留新充值的金额，多提会提示流水不足<br>总流水：总充值匹配总流水',
    value: '1',
    prop: 'withdrawal_rules',
    options: [
      {
        label: 1,
        name: '单流水'
      },
      // {
      //   label: 2,
      //   name:'总流水'
      // }
    ]
  },
  free_type: {
    type: 'radio',
    label: '免手续费类型',
    placeholder: '免手续费类型',
    tip: '全部：累计免除提现手续费次数<br>当天：当天累计免除提现手续费次数，新一天重新计算<br>当月：当月累计免除提现手续费次数，下一月重新计算',
    value: '1',
    prop: 'free_type',
    options: [
      {
        label: 0,
        name: '全部'
      },
      {
        label: 1,
        name: '当天'
      },
      {
        label: 2,
        name: '当月'
      }
    ]
  },
  free_poundage: {
    type: 'input',
    ty: 'number',
    label: 'USDT免手续费',
    placeholder: 'USDT几次提现免除手续费',
    tip: 'USDT几次提现免除手续费, 填几次就是免除几次手续费。填0则不免',
    value: '',
    prop: 'free_poundage'
  },
  withdrawal_status: {
    type: 'radio',
    label: '首次提现验证',
    placeholder: '首次提现验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'withdrawal_status'
  },
  bind_card_status: {
    type: 'radio',
    label: '绑卡验证',
    placeholder: '绑卡验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'bind_card_status'
  },
  // force_pwd:{
  //   type: 'radio',
  //   label: '强制提现密码设置',
  //   placeholder: '强制提现密码设置',
  //   tip:'开启后，未设置提现密码的用户，会强制要求设置',
  //   value: '',
  //   options: [
  //     {
  //       label: 1,
  //       name:'开启'
  //     },{
  //       label: 0,
  //       name:'关闭'
  //     },
  //   ],
  //   prop:'force_pwd'
  // },
  card_number: {
    type: 'input',
    ty: 'number',
    label: '绑卡数量',
    placeholder: '绑卡数量',
    tip: '每个用户银行卡，usdt，电子钱包绑定的数量',
    value: '',
    prop: 'card_number'
  },
  allow_not_withdrawal: {
    type: 'input',
    ty: 'number',
    label: '允许未审核数量',
    placeholder: '允许未审核数量',
    tip: '1为用户只允许有一笔未审核的提现订单，0或为空为不限制',
    value: 0,
    prop: 'allow_not_withdrawal'
  },
  withdrawal_auto: {
    type: 'radio',
    label: '提现自动审核',
    placeholder: '提现自动审核',
    value: '0',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'withdrawal_auto'
  },
  auto_withdrawal_pay_id: {
    type: 'select',
    ty: 'uint',
    label: '自动出款渠道',
    placeholder: '自动出款渠道',
    tip: '自动出款渠道，不设置将不能自动出款',
    value: '',
    show: true,
    options: [{ label: '无', value: 0 }],
    prop: 'auto_withdrawal_pay_id'
  },
  savings_multiple: {
    type: 'input',
    ty: 'number',
    label: '打码倍数',
    placeholder: '打码倍数',
    tip: '满足当日充值的打码倍数即可自动出款',
    value: 1,
    show: true,
    prop: 'savings_multiple'
  },
  auto_max_amount: {
    type: 'input',
    ty: 'number',
    label: '最高出款金额',
    placeholder: '最高出款金额',
    tip: '自动审核最高出款金额,0为不限制',
    value: '',
    show: true,
    prop: 'auto_max_amount'
  },
  quick_withdrawal: {
    type: 'input',
    label: '快捷银行提现金额',
    placeholder: '快捷银行提现金额设置',
    tip: '快捷银行提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'quick_withdrawal'
  },
  usdt_quick_withdrawal: {
    type: 'input',
    label: '快捷USDT提现金额',
    placeholder: '快捷usdt提现金额设置',
    tip: '快捷usdt提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'usdt_quick_withdrawal'
  },
  test_withdraw: {
    type: 'radio',
    label: '测试号提现',
    placeholder: '测试号提现',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'test_withdraw'
  },
}
const tixianRules = {

}
const tixianBox = reactive({ tixian })
const tixianModel = {
  is_withdraw: "",
  saving_zero_withdrawal: 0,
  withdrawal_extra_status: 0,
  withdraw_amcount: '',
  service_charge: '',
  usdt_charge: '',
  w_water: '',
  allow_not_recharge: 0,
  withdrawal_rules: '',
  free_type: '',
  free_poundage: '',
  // withdrawal_check_type:'',
  withdrawal_status: '',
  bind_card_status: '',
  // force_pwd:'',
  card_number: '',
  allow_not_withdrawal: 0,
  withdrawal_auto: '0',
  auto_withdrawal_pay_id: '',
  savings_multiple: 1,
  auto_max_amount: '',
  quick_withdrawal: '',
  usdt_quick_withdrawal: '',
  test_withdraw: '',
}
const tixianChange = ({ value, index }) => {
  if (index == 'withdrawal_auto') {
    tixianBox.tixian['savings_multiple'].show = value == 1 ? false : true;
    tixianBox.tixian['auto_max_amount'].show = value == 1 ? false : true;
    tixianBox.tixian['auto_withdrawal_pay_id'].show = value == 1 ? false : true;
  }
  tixianBox.tixian[index].value = value;
  boxObj.tixianModel[index] = value;
}

//交易设置
const tradSeting = {
  // monetary_type: {
  //   type: 'input',
  //   label: '基础货币',
  //   placeholder: '基础货币',
  //   value: '',
  //   prop: 'monetary_type'
  // },
  is_recharge: {
    type: 'radio',
    label: '充值开关',
    placeholder: '充值开关',
    tip: '关闭后不允许充值',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'is_recharge'
  },
  recharge_limit: {
    type: 'input',
    ty: 'number',
    label: '最小充值金额',
    placeholder: '提现后最小充值金额',
    tip: "首次提现后最小充值金额，0时表示不限制",
    value: 0,
    prop: 'recharge_limit'
  },
  recharge_rebate: {
    type: 'input',
    label: '充值返利',
    ty: 'number',
    placeholder: '输入数字，充值返利',
    tip: '充值返利，充值金额返利比例，比如 1%，填写 1',
    value: '',
    prop: 'recharge_rebate'
  },
  recharge_rec_rebate: {
    type: 'input',
    label: '上级返利',
    ty: 'number',
    placeholder: '输入数字，上级返利',
    tip: '充值返利，用户充值给直属上级返利比例，比如 1%，填写 1',
    value: '',
    prop: 'recharge_rec_rebate'
  },
  cancel_recharge_order: {
    type: 'radio',
    label: '充值订单',
    placeholder: '充值订单',
    tip: '这里设定是否自动取消前一天未付款的充值订单',
    value: '',
    options: [
      {
        label: 1,
        name: '取消'
      }, {
        label: 0,
        name: '不取消'
      }
    ],
    prop: 'cancel_recharge_order'
  },
  quick_recharge: {
    type: 'input',
    label: '快捷银行充值金额',
    placeholder: '快捷银行充值金额设置',
    tip: '快捷银行充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'quick_recharge'
  },
  hot_quick_recharge: {
    type: 'input',
    label: '热门银行充值金额',
    placeholder: '热门银行充值金额设置',
    tip: '热门银行充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'hot_quick_recharge'
  },
  usdt_quick_recharge: {
    type: 'input',
    label: '快捷USDT充值金额',
    placeholder: '快捷USDT充值金额',
    tip: '快捷usdt充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'usdt_quick_recharge'
  },
  quick_withdrawal: {
    type: 'input',
    label: '快捷银行提现金额',
    placeholder: '快捷银行提现金额设置',
    tip: '快捷银行提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'quick_withdrawal'
  },
  usdt_quick_withdrawal: {
    type: 'input',
    label: '快捷USDT提现金额',
    placeholder: '快捷usdt提现金额设置',
    tip: '快捷usdt提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'usdt_quick_withdrawal'
  },
  test_withdraw: {
    type: 'radio',
    label: '测试号提现',
    placeholder: '测试号提现',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'test_withdraw'
  },
  /*
  fund_time: {
    type: 'input',
    label: '基金活期收益时间',
    placeholder: '基金活期收益时间',
    tip: '活期基金收益间隔时间，单位为小时，0为24小时结算一次，大于0为x小时结算一次',
    value: '',
    prop: 'fund_time'
  },*/
}
const tranSetRules = {}
const tranSetBox = reactive({ tradSeting })
const tranSetChange = ({ value, index }) => {
  tranSetBox.tradSeting[index].value = value;
  boxObj.tranSetModel[index] = value;
}
const tranSetModel = {
  // monetary_type: '',
  is_recharge: '',
  recharge_limit: 0,
  recharge_rebate: '',
  recharge_rec_rebate: '',
  cancel_recharge_order: '',
  quick_recharge: '',
  hot_quick_recharge: '',
  usdt_quick_recharge: '',
  quick_withdrawal: '',
  usdt_quick_withdrawal: '',
  test_withdraw: '',
  //fund_time: '',
}

//推广
const spread = {
  //  agent_settlement_type:{
  //   type: 'radio',
  //   label: '返佣类型',
  //   placeholder: '返佣类型',
  //   tip:'按注单：单笔注单产生返佣<br/>按盈亏：时间范围内，赢会产生返佣，输不产生返佣',
  //   value: '',
  //   options: [
  //     {
  //       label: 1,
  //       name:'按盈亏'
  //     },{
  //       label: 0,
  //       name:'按注单'
  //     }
  //   ],
  //   prop:'agent_settlement_type'
  // },
  // agent_settlement:{
  //   type: 'radio',
  //   label: '代理返佣',
  //   placeholder: '代理返佣',
  //   value: '',
  //   show: true,
  //   disabled:false,
  //   options: [
  //     {
  //       label: 0,
  //       name:'实时返佣'
  //     },{
  //       label: 1,
  //       name:'自定义时间返佣'
  //     },{
  //       label: 2,
  //       name:'星期制'
  //     },{
  //       label: 3,
  //       name:'月度制'
  //     },{
  //       label: 4,
  //       name:'手动返佣'
  //     }
  //   ],
  //   prop:'agent_settlement'
  // },
  // agent_settlement_time:{
  //   type: 'input',
  //   label: '返佣时间',
  //   placeholder: '输入数字，时间点',
  //   tip:'实时返佣：订单结算立即返佣<br/>自定义时间返佣：12，13，下午一点输入13，隔天时间点<br/>星期制：填写0,1,2,3,4,5,6(0 星期天 .... 6 星期六)，大于6，按0算<br/>月度制：填写日期如果每月1号返佣，就填写1，不能填写31，没有31的月份没法返佣',
  //   value: '',
  //   ty:'number',
  //   prop:'agent_settlement_time'
  // },
  // commission_water:{
  //   type: 'input',
  //   label: '返佣流水设置',
  //   placeholder: '返佣流水设置',
  //   tip:'0为不限制、 只能设置整数 123456789',
  //   value: '',
  //   ty:'number',
  //   prop:'commission_water'
  // },
  // one_fy:{
  //   type: 'input',
  //   label: '1级返佣%',
  //   placeholder: '1级返佣%',
  //   value: '',
  //   ty:'number',
  //   prop:'one_fy'
  // },
  // two_fy:{
  //   type: 'input',
  //   label: '2级返佣%',
  //   placeholder: '2级返佣%',
  //   value: '',
  //   ty:'number',
  //   prop:'two_fy'
  // },
  // three_fy:{
  //   type: 'input',
  //   label: '3级返佣%',
  //   placeholder: '3级返佣%',
  //   value: '',
  //   ty:'number',
  //   prop:'three_fy'
  // },
  tg_condition: {
    type: 'input',
    ty: 'number',
    label: '推广有效条件',
    placeholder: '输入数字，充值金额',
    tip: '设置充值金额，如设置：100，推广进来的用户充值了100，才算有效推广用户，0 不限制',
    value: '',
    prop: 'tg_condition'
  },
  tg_condition_valid_bet: {
    type: 'input',
    ty: 'number',
    label: '推广有效有效流水',
    placeholder: '输入数字',
    tip: '设置有效流水，如设置：100，推广进来的用户有效下注100，才算有效推广用户，0 不限制',
    value: '',
    prop: 'tg_condition_valid_bet'
  },
  vip_upgrade: {
    type: 'radio',
    label: 'VIP升级',
    placeholder: 'VIP升级',
    value: '',
    tip: '用户VIP升级条件设置（设置后请尽快到用户管理  会员等级 设置相关参数）<br/>有效充值：根据用户充值自动升级VIP等级<br/>有效推广会员数：跟直推用户数，团队用户数自动升级VIP等级，要满足上面的推广条件<br/>推广会员数：跟直推用户数，团队用户数自动升级VIP等级<br/>有效(推广会员+充值)：用户充值(累计)+有效直推用户数，团队用户数自动升级VIP等级',
    options: [
      {
        label: 0,
        name: '有效充值'
      }, {
        label: 1,
        name: '有效推广会员数'
      }, {
        label: 2,
        name: '推广会员数'
      }, {
        label: 3,
        name: '有效(推广会员+充值)'
      }
    ],
    prop: 'vip_upgrade'
  },
  agent_apply_verify: {
    type: 'radio',
    label: '成为代理',
    placeholder: '成为代理',
    value: '',
    options: [
      {
        label: 0,
        name: '手动申请，需审核'
      }, {
        label: 1,
        name: '手动申请，无需审核'
      }, {
        label: 2,
        name: '注册即为代理'
      },
    ],
    prop: 'agent_apply_verify'
  },
  same_phone_register: {
    type: 'radio',
    label: '相同号码注册',
    placeholder: '相同号码注册',
    tip: '开启后使用不同代理不同的域名的相同号码可以注册',
    value: '0',
    options: [
      {
        label: '0',
        name: '关闭'
      }, {
        label: '1',
        name: '开启'
      },
    ],
    prop: 'same_phone_register'
  },
  agent_recharge: {
    type: 'input',
    ty: 'number',
    label: '成为代理充值金额',
    placeholder: '成为代理充值金额',
    tip: '诺设置注册即为代理，则此规则无效',
    value: '',
    prop: 'agent_recharge',
    show: true,
  },
  agent_water: {
    type: 'input',
    label: '成为代理流水金额',
    placeholder: '成为代理流水金额',
    tip: '诺设置注册即为代理，则此规则无效',
    value: '',
    prop: 'agent_water',
    show: true,
  },
  fyfy_losstype: {
    type: 'radio',
    label: '分佣模式',
    placeholder: '分佣模式',
    tip: '设置内部代理客损分佣模式负盈清零还是累积到下月',
    value: '',
    options: [
      {
        label: 0,
        name: '清零'
      }, {
        label: 1,
        name: '累积到下月'
      }
    ],
    prop: 'fyfy_losstype'
  },
  auto_commission: {
    type: 'radio',
    label: '自动返佣',
    placeholder: '自动返佣',
    tip: '推广代理负赢返佣派送设置',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      }
    ],
    prop: 'auto_commission'
  },
  FySavingRateOut: {
    type: 'input',
    label: '返佣流水倍数',
    placeholder: '返佣流水倍数',
    tip: '外部代理获得返佣奖励后需要N倍才能提现',
    value: '',
    ty: 'number',
    prop: 'FySavingRateOut'
  },
  fyfy_valid_user: {
    type: 'input',
    label: '有效充值额',
    placeholder: '有效充值额%',
    tip: '内部代理负盈分佣模式下有效客户的有效充值额下限',
    value: '',
    ty: 'number',
    prop: 'fyfy_valid_user'
  },
  fyfy_valid_order: {
    type: 'input',
    label: '有效投注额',
    placeholder: '有效投注额%',
    tip: '内部代理负盈分佣模式下有效客户的有效投注额下限',
    value: '',
    ty: 'number',
    prop: 'fyfy_valid_order'
  },
  auto_water: {
    type: 'radio',
    label: '自动返水',
    placeholder: '自动返水',
    tip: '针对三方游戏的返水设置',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      }
    ],
    prop: 'auto_water'
  },
  BackSavingRate: {
    type: 'input',
    label: '返水流水倍数',
    placeholder: '返水流水倍数',
    tip: '会员获得返水奖励后需要N倍才能提现',
    value: '',
    ty: 'number',
    prop: 'BackSavingRate'
  },
}
const spreadRules = {}
const spreadBox = reactive({ spread })
const spreadChange = ({ value, index }) => {
  if (index == 'agent_settlement_type') {
    spreadBox.spread['agent_settlement'].show = value == 0 ? false : true;
    spreadBox.spread['agent_settlement'].disabled = value == 1 ? true : false;
  } else {
    spreadBox.spread[index].value = value;
    boxObj.spreadModel[index] = value;
  }

}
const spreadModel = {
  // agent_settlement_type:'',
  // agent_settlement:'',
  // agent_settlement_time:'',
  // commission_water:'',
  // one_fy:'',
  // two_fy:'',
  // three_fy:'',
  tg_condition: '',
  tg_condition_valid_bet: '',
  vip_upgrade: '',
  agent_apply_verify: '',
  same_phone_register: '0',
  agent_recharge: '',
  agent_water: '',
  fyfy_losstype: '',
  auto_commission: '',
  BackSavingRate: '',
  FySavingRateOut: '',
  fyfy_valid_user: '',
  fyfy_valid_order: '',
  auto_water: ''
}

//注单设置
const betslip = {
  is_bet: {
    type: 'radio',
    label: '投注开关',
    placeholder: '投注开关',
    tip: '关闭后不允许投注',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'is_bet'
  },
  transaction_charge: {
    type: 'input',
    label: '交易手续费%',
    placeholder: '交易手续费%',
    value: '',
    ty: 'number',
    prop: 'transaction_charge'
  },
  settlement: {
    type: 'radio',
    label: '注单结算',
    placeholder: '注单结算',
    value: '',
    options: [
      {
        label: 1,
        name: '自动'
      }, {
        label: 0,
        name: '手动'
      }
    ],
    prop: 'settlement'
  },
  quick_bet: {
    type: 'input',
    label: '下注快捷金额设置',
    placeholder: '下注快捷金额设置',
    tip: '下注快捷金额设置，必须三个数字，多或少都无效，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'quick_bet'
  },
  single_stroke_min: {
    type: 'input',
    label: '单注最低',
    placeholder: '输入数字，单注最低',
    tip: '单注最低限制，如设置，波胆的默认数据将无效，设置0时，启用波胆的限制数据',
    value: '',
    prop: 'single_stroke_min'
  },
  single_stroke_max: {
    type: 'input',
    label: '单注最高',
    placeholder: '输入数字，单注最高',
    tip: '单注最高限制，如设置，波胆的默认数据将无效，设置0时，启用波胆的限制数据',
    value: '',
    prop: 'single_stroke_max'
  },
  individual_max: {
    type: 'input',
    label: '单项最高',
    placeholder: '输入数字，单项最高',
    tip: '单项最高限制，如设置，波胆的默认数据将无效，设置0时，启用波胆的限制数据',
    value: '',
    prop: 'individual_max'
  },
  revoke_order: {
    type: 'radio',
    label: '撤销注单',
    placeholder: '撤销注单',
    tip: '开启用户端撤单',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '禁用'
      }
    ],
    prop: 'revoke_order'
  },
  revoke_order_time: {
    type: 'input',
    label: '撤单时效',
    placeholder: '撤单时效，分钟为单位',
    tip: '撤单时效，分钟为单位，0不限制，下单时间起算，开赛时间结束，撤销注单状态开启有效',
    value: '',
    prop: 'revoke_order_time'
  },
  odds_show: {
    type: 'radio',
    label: '赔率显示',
    placeholder: '赔率显示',
    value: '',
    options: [
      {
        label: 1,
        name: '包含本金'
      }, {
        label: 2,
        name: '不包含本金'
      }
    ],
    prop: 'odds_show'
  },
  match_multiple: {
    type: 'select',
    label: '赔率倍数',
    placeholder: '赔率倍数',
    value: '',
    tip: '设置赛事波胆赔率倍数,从设置后开始生效,之前的不作更改,最终赔率 = 三方赔率 * 赔率倍数',
    options: [
      {
        label: 1.5,
        value: 1.5
      }, {
        label: 1.45,
        value: 1.45
      }, {
        label: 1.4,
        value: 1.4
      }, {
        label: 1.35,
        value: 1.35
      }, {
        label: 1.3,
        value: 1.3
      }, {
        label: 1.25,
        value: 1.25
      }, {
        label: 1.2,
        value: 1.2
      }, {
        label: 1.5,
        value: 1.5
      }, {
        label: 1.15,
        value: 1.15
      }, {
        label: 1.1,
        value: 1.1
      }, {
        label: 1.05,
        value: 1.05
      }, {
        label: 1,
        value: 1
      }, {
        label: 0.95,
        value: 0.95
      }, {
        label: 0.9,
        value: 0.9
      }, {
        label: 0.85,
        value: 0.85
      }, {
        label: 0.8,
        value: 0.8
      }, {
        label: 0.75,
        value: 0.75
      }, {
        label: 7,
        value: 7
      }, {
        label: 0.65,
        value: 0.65
      }, {
        label: 0.6,
        value: 0.6
      }, {
        label: 0.55,
        value: 0.55
      }, {
        label: 0.5,
        value: 0.5
      }, {
        label: 0.45,
        value: 0.45
      }, {
        label: 0.4,
        value: 0.4
      }, {
        label: 0.35,
        value: 0.35
      }, {
        label: 0.3,
        value: 0.3
      }, {
        label: 0.25,
        value: 0.25
      }, {
        label: 0.2,
        value: 0.2
      }, {
        label: 0.15,
        value: 0.15
      }, {
        label: 0.1,
        value: 0.1
      },
    ],
    prop: 'match_multiple'
  },
  match_hot: {
    type: 'radio',
    label: '赛事热门',
    placeholder: '赛事热门',
    tip: '赛事采集默认热门，设置"是"所有赛事都是热门，从设置后开始生效，之前的不作更改',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      }
    ],
    prop: 'match_hot'
  },
  bold_filter: {
    type: 'radio',
    label: '波胆过滤',
    placeholder: '波胆过滤  ',
    value: '',
    options: [
      {
        label: 0,
        name: '全开'
      }, {
        label: 1,
        name: '关闭4:4和其他比分'
      }, {
        label: 2,
        name: '4:4并入其他比分'
      }, {
        label: 3,
        name: '关闭其他比分'
      }, {
        label: 4,
        name: '关闭4:4'
      }
    ],
    prop: 'bold_filter'
  },
};
const betslipBox = reactive({ betslip })
const betslipRules = {}
const betslipChange = ({ value, index }) => {
  betslipBox.betslip[index].value = value;
  boxObj.betslipModel[index] = value;
}
const betslipModel = {
  is_bet: '',
  transaction_charge: '',
  settlement: '',
  quick_bet: '',
  single_stroke_min: '',
  single_stroke_max: '',
  individual_max: '',
  revoke_order: '',
  revoke_order_time: '',
  odds_show: '',
  match_multiple: '',
  match_hot: '',
  bold_filter: ''
}

const boxObj = reactive({
  jichuModel,
  websiteModel,
  yanzhenModel,
  tixianModel,
  tranSetModel,
  spreadModel,
  betslipModel,
  withdraw_notes: [],//提现备注
  detail_notes: []//人工调整备注
});
init();
function init() {
  systemEdit({ find: true }).then((res: any) => {
    if (res.code == 1) {
      // assginMent();
      boxObj.withdraw_notes = res.data.withdraw_notes
      boxObj.detail_notes = res.data.detail_notes

      tixianBox.tixian.auto_withdrawal_pay_id.options = [{ label: "无", value: 0 }].concat(
        res.data.pay_list
      );
      assginMent(jichuModel, 'jichuModel', res.data, 'jichu')
      assginMent(websiteModel, 'websiteModel', res.data, 'website')
      assginMent(yanzhenModel, 'yanzhenModel', res.data, 'yanzhen')
      assginMent(tixianModel, 'tixianModel', res.data, 'tixian')
      assginMent(tranSetModel, 'tranSetModel', res.data, 'jiaoyi')
      assginMent(spreadModel, 'spreadModel', res.data, 'tuiguang')
      // assginMent(betslipModel,'betslipModel',res.data,'zhudan')
    }
  })
}
//赋值
function assginMent(list, name, data, val) {
  for (const key in list) {
    boxObj[name][key] = data[key]
    if (val == 'jichu') {
      jichuBox.jichu[key].value = data[key]
    }
    if (val == 'yanzhen') {
      yanzhenChange({ value: data[key], index: key })
      // yanzhenBox.yanzhen[key].value = data[key]
    }
    if (val == 'tixian') {
      tixianChange({ value: data[key], index: key })
      // tixianBox.tixian[key].value = data[key]
    }
    if (val == 'jiaoyi') {
      tranSetBox.tradSeting[key].value = data[key]
    }
    if (val == 'tuiguang') {
      spreadBox.spread[key].value = data[key]
    }
    if (val == 'zhudan') {
      betslipBox.betslip[key].value = data[key]
    }
    if (val == 'website') {
      websiteBox.website[key].value = data[key]
    }
  }
}

const handleSave = () => {
  const query = {
    edit: true,
    info: {
      ...boxObj.jichuModel,
      ...boxObj.websiteModel,
      ...boxObj.yanzhenModel,
      ...boxObj.tixianModel,
      ...boxObj.tranSetModel,
      // ...boxObj.betslipModel,
      ...boxObj.spreadModel,
      withdraw_notes: boxObj.withdraw_notes,
      detail_notes: boxObj.detail_notes
    }
  }
  systemEdit(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const hanldeAdd = (val) => {
  if (val == 2) {
    boxObj.withdraw_notes.push({ value: '' })
  }
  if (val == 3) {
    boxObj.detail_notes.push({ value: '' })
  }
}
const handleDelete = (index, val) => {
  if (val == 2) {
    boxObj.withdraw_notes.splice(index, 1)
  }
  if (val == 3) {
    boxObj.detail_notes.splice(index, 1)
  }
}

const selectShow = ref(false);
const isclear = ref(false);
const clearCache = () => {
  if (isclear.value) {
    return
  }
  isclear.value = true;
  http.get("/system/clear_cache").then((res: any) => {
    isclear.value = false;
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
</script>

<template>
  <div>
    <div class=" line-box">
      <div class="flex-bc flex-fi">
        <div />
        <div>
          <el-button type="primary" @click="handleSave">{{ $t('保存') }}</el-button>
          <el-button :loading="isclear" type="primary" @click="clearCache">{{ $t('清除缓存') }}</el-button>
        </div>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('系统维护设置')">
      <div style="padding-bottom:30px;">
        <component :is="defineAsyncComponent(() => import('@/views/admin/updlist.vue'))" />
      </div>
    </el-dialog>
    <el-tabs type="border-card" class="systemFrom">
      <el-tab-pane :label="$t('基础设置')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.jichuModel" @currentChage="jichuChange"
          :listRules="jichuRules" :list="jichuBox.jichu">
          <template v-slot:weihu>
            <el-button type="primary" @click="selectShow = true">{{ $t('系统维护设置') }}</el-button>
          </template>
        </commForm>
      </el-tab-pane>
      <el-tab-pane :label="$t('站点设置')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.websiteModel" @currentChage="websiteChange"
          :listRules="websiteRules" :list="websiteBox.website" />
      </el-tab-pane>
      <el-tab-pane :label="$t('注册设置')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.yanzhenModel" @currentChage="yanzhenChange"
          :listRules="yanzhenRules" :list="yanzhenBox.yanzhen">
          <template v-slot:weihu>
            <el-button type="primary">{{ $t('系统维护设置') }}</el-button>
          </template>
        </commForm>
      </el-tab-pane>
      <!--<el-tab-pane :label="$t('提现设置')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.tixianModel" @currentChage="tixianChange"
          :listRules="tixianRules" :list="tixianBox.tixian" />
      </el-tab-pane>
      <el-tab-pane :label="$t('充值设置')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.tranSetModel" @currentChage="tranSetChange"
          :listRules="tranSetRules" :list="tranSetBox.tradSeting" />
      </el-tab-pane>
      <el-tab-pane :label="$t('推广设置')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.spreadModel" @currentChage="spreadChange"
          :listRules="spreadRules" :list="spreadBox.spread" />
      </el-tab-pane>
      <el-tab-pane :label="$t('注单设置')">
         <commForm title="保存" @save="handleSave" :dialogObj="boxObj.betslipModel" @currentChage="betslipChange" :listRules="betslipRules" :list="betslipBox.betslip" />
      </el-tab-pane> 
      <el-tab-pane :label="$t('快捷备注设置')">
        <el-form>
          <el-form-item :label="$t('提现备注')" label-width="110px">
            <div style="width:100%">
              <el-button class="input-item-btn" type="primary" :icon="Plus" @click="hanldeAdd(2)">{{ $t('添加')
              }}</el-button>
              <div class="flex-fi input-item-box">
                <div class="input-item" v-for="(item, index) in boxObj.withdraw_notes" :key="index">
                  <el-input v-model="item.value">
                    <template #suffix>
                      <el-button type="danger" @click="handleDelete(index, 2)" :icon="Delete" circle />
                    </template>
                  </el-input>
                </div>
              </div>
            </div>

          </el-form-item>
          <el-form-item :label="$t('人工调整备注')" label-width="110px">
            <div style="width:100%">
              <el-button class="input-item-btn" type="primary" :icon="Plus" @click="hanldeAdd(3)">{{ $t('添加')
              }}</el-button>
              <div class="flex-fi input-item-box">
                <div class="input-item" v-for="(item, index) in boxObj.detail_notes" :key="index">
                  <el-input v-model="item.value">
                    <template #suffix>
                      <el-button type="danger" @click="handleDelete(index, 3)" :icon="Delete" circle />
                    </template>
                  </el-input>
                </div>
              </div>
            </div>

          </el-form-item>
        </el-form>
      </el-tab-pane>-->
    </el-tabs>
  </div>
</template>

<style scoped>
.input-item {
  width: 50%;
  margin-bottom: 15px;
  margin-right: 15px;
}

.input-item-box {
  flex-wrap: wrap;
}

.input-item-btn {
  margin-bottom: 30px;
}

.line-box {
  margin-bottom: 15px;
}

.systemFrom ::v-deep .el-form-item__content>div {
  width: 80%;
}
</style>
