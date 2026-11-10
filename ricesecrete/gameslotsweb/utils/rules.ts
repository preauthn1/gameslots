import lang from "@/utils/lang";

// 邮箱
export const emaliRules = () => [
  {
    required: true,
    validator: (v: string) => {
      return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v);
    },
    message:lang.t("请输入正确的邮箱格式"),
  }
]

// 密码正则
export const passwordRules = ()=> [
  {
    validator: (v: string) => {
      return /^(([a-z]+[0-9]+)|([0-9]+[a-z]+))[a-z0-9]*$/i.test(v) && v.length>=6 && v.length<=32 ;
    },
    message: lang.t("6-32位数字和字符"),
  }
]

// 电话号码
export const phoneRules = () => [
  {
    validator: (v: string) => {
      return /^[0-9]+$/.test(v);
    },
    message: lang.t("请输入正确的手机号码"),
  }
]

// 账户 是邮箱和电话号码的合集
export const usernameRules = () => [
  {
    required: true,
    validator: (v: string) => {
      return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v) || /^[0-9]+$/.test(v);
    },
    message:lang.t("请输入正确的用户名"),
  }
] 
