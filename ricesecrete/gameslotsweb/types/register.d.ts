export interface Login_register_request_type {
  username: string
  password: string
  code_key: string
  areacode: string
  rec_code: string
  code: string
  acid: string
  account_type: 1 | 2 //1 手机号  2 邮箱
}

export interface Login_request_api_type {
  username: string
  password: string
  code_key: string
}
export interface Login_api_type {
  token: string
  token_key: string
}

export interface Login_captcha_api_type {
  base64: string
  key: string
}

export interface My_editinfo_request_api {
  old_password?: string
  password?: string
  real_name?: string
  birthday?: string
  head_img?: string
  withdrawal_psd?: string
  owithdrawal_psd?: string
  phone?: string
  code?: string
  mail?: string
  mail_code?: string
  google_code?: string
}

export interface sendcode_mail_api_request_type {
  email: string
  scene: "register" | "login" | "forget" | "verify" | "bind"  //注册，登录，忘记密码，验证,绑定号码
}
export interface sendcode_index_api_request_type {
  scene: "register" | "login" | "forget" | "verify" | "bind"  //注册，登录，忘记密码，验证,绑定号码
  phone: string
  qh: string
}

export interface Forget_mail_api_request_type {
  mail: string
  mail_code: string
  password: string
}

export interface Forget_pwd_api_request_type {
  phone: string
  code: string
  password: string
}