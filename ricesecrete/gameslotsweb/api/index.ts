import Request from "@/utils/Request";
import type {
  SystemNewType,
  BannerIndexApiType,
  noticeListApiQueryType,
  noticeListApiType,
  gameThirdApiType,
  gameGet_typeApiType,
  GameListApiQueryType,
  GameListApiType,
  serviceListType,
  fakeDataListApiType
} from "~/types";
import type {
  Forget_mail_api_request_type,
  Forget_pwd_api_request_type,
  Login_api_type,
  Login_captcha_api_type,
  Login_register_request_type,
  Login_request_api_type,
  My_editinfo_request_api,
  sendcode_index_api_request_type,
  sendcode_mail_api_request_type,
} from "~/types/register";
import type { My_info_v5_api_type, web_socket_api_type } from "~/types/user";
const request: Request = new Request();

// 系统配置新
export const systemInfoNewApi = () => {
  return request.send<object, SystemNewType>({
    url: "system/info_new",
    method: "get",
  });
};

// banner
export const bannerIndexApi = () => {
  return request.send<BannerIndexApiType>({
    url: "banner/index",
    method: "get",
  });
};

// 跑马灯
export const noticeListApi = (data?: noticeListApiQueryType) => {
  return request.send<noticeListApiType>({
    url: "notice/list",
    method: "get",
    query: data,
  });
};

// 游戏登录
export const game_login_game_api = (data: {
  gid: string;
  platform: string;
}) => {
  return request.send<string>({
    url: "game/login_game",
    method: "post",
    body: data,
  });
};

export const game_list_api = (data: GameListApiQueryType) => {
  return request.send<GameListApiType>({
    url: "game/list",
    method: "post",
    body: data,
  });
};

// 三方獲取
export const gameThirdApi = () => {
  return request.send<gameThirdApiType>({
    url: "game/third",
    method: "post",
  });
};

// 游戏分类
export const gameGet_typeApi = () => {
  return request.send<gameGet_typeApiType>({
    url: "game/get_type",
    method: "post",
  });
};

// 游戏分类
export const gameGet_typeApiv2 = (data: any) => {
  return request.send<gameGet_typeApiType>({
    url: "v2/game/game_type_v2",
    method: "post",
    body: data
  });
};

// 游戏分类(首页)
export const gameGet_typeApi_v2 = (data: any) => {
  return request.send<gameGet_typeApiType>({
    url: "v2/game/index_game_list",
    method: "post",
    body: data
  });
};

// 注册
export const login_register_api = (data: Login_register_request_type) => {
  return request.send<Login_api_type>({
    url: "login/register",
    method: "post",
    body: data,
  });
};

//推广码
export const recCode = (data: { rec_code: string, acid: string | '' }) => {
  return request.send({
    url: "login/click_count",
    method: "get",
    query: data,
  });
};

// 验证码
export const login_captcha_api = () => {
  return request.send<Login_captcha_api_type>({
    url: "login/captcha",
    method: "post",
  });
};

// 登录
export const login_login_api = (data: Login_request_api_type) => {
  return request.send<Login_api_type>({
    url: "login/login",
    method: "post",
    body: data,
  });
};

// 获取即时通信路径
export const getWsToken = () => {
  return request.send<web_socket_api_type>({
    url: "user/get_ws_token",
    method: "get"
  })
}

// 修改密码
export const my_editinfo_api = (data: My_editinfo_request_api) => {
  return request.send({
    url: "my/editinfo",
    method: "post",
    body: data,
  });
};

// 个人资料
export const my_info_v5_api = () => {
  return request.send<My_info_v5_api_type>({
    url: "my/info_v5",
    method: "post",
  });
};

// 邮箱验证码
export const sendcode_mail_api = (data: sendcode_mail_api_request_type) => {
  return request.send({
    url: "sendcode/mail",
    method: "post",
    body: data,
  });
};

// 手机验证码
export const sendcode_index_api = (data: sendcode_index_api_request_type) => {
  return request.send({
    url: "sendcode/index",
    method: "post",
    body: data,
  });
};

// 忘记密码
export const forget_mail_api = (data: Forget_mail_api_request_type) => {
  return request.send({
    url: "forget/mail",
    method: "post",
    body: data,
  });
};

// 忘记密码
export const forget_pwd_api = (data: Forget_pwd_api_request_type) => {
  return request.send({
    url: "forget/pwd",
    method: "post",
    body: data,
  });
};

// 上传图片
export const upload_img_api = (data: FormData) => {
  return request.send<{ file: string }>({
    url: "upload/img",
    method: "post",
    isUpload: true,
    body: data,
  });
};

// 客服列表
export const serviceList = () => {
  return request.send<serviceListType>({
    url: "service/list",
    method: "post",
  });
};

// fakeData列表
export const fakeDataListApi = () => {
  return request.send<fakeDataListApiType>({
    url: "game/order4",
    method: "post",
  });
};
