import { defineStore } from "pinia";
import { store } from "@/store";
import { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageSession } from "@pureadmin/utils";
import { getLogin, refreshTokenApi } from "@/api/user";
import { UserResult, RefreshTokenResult, indexWork } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  type DataInfo,
  setToken,
  loginOutClear,
  sessionKey,
  getToken,
  setSessionKey,
  getSessionKey
} from "@/utils/auth";
import socket from "@/utils/socket";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username: getSessionKey(sessionKey)?.username ?? "",
    // 页面级别权限
    roles: getSessionKey(sessionKey)?.roles ?? [],
    // 前端生成的验证码（按实际需求替换）
    verifyCode: "",
    // 判断登录页面显示哪个组件（0：登录（默认）、1：手机登录、2：二维码登录、3：注册、4：忘记密码）
    currentPage: 0,
    socketUrl: getToken("socketUrl") ?? "",
    socketKey: getToken("socketKey") ?? ""
  }),
  getters: {
    getSocketUrl() {
      return this.socketUrl;
    },
    getSocketKey() {
      return this.socketKey;
    }
  },
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储前端生成的验证码 */
    SET_VERIFYCODE(verifyCode: string) {
      this.verifyCode = verifyCode;
    },
    /** 存储登录页面显示哪个组件 */
    SET_CURRENTPAGE(value: number) {
      this.currentPage = value;
    },
    //初始化soket
    async initSocket() {
      //     const url: string = this.socketUrl;
      //  //   console.log("执行了");
      //     if (url != "") {
      //         socket.init(this.receiveMessage(), url);
      //     }
    },
    // 消息接收
    receiveMessage(message: any) {
      // const params = JSON.parse(message.data)
      console.log(message);
      // const param = JSON.parse(Base64.decode(JSON.parse(message.data).data))
      // // 处理 赋值问题
      // const params = JSON.parse(JSON.stringify(param))
      // if (params) {
      //   switch (params.message) {
      //     case 'scheduleListFeedBack':
      //       break
      //     case 'onMessage':
      //       // 地磁获取消息列表 正则替换给过来的编码

      //       break
      //   }
      // }
    },

    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(response => {
            if (response.code == 1) {
              const res = response.data;
              // let obj = {
              //   accessToken: data.data.token,
              //   accessTokenKey: data.data.token_key
              // }
              // setToken(obj);
              setToken("token", res.token);
              setToken("token_key", res.token);
              setSessionKey(res.username, res.roles);
            }
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];

      loginOutClear();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
      // try {
      //   socket.close();
      // } catch (error) { }
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              // setToken(data.data);
              // setToken('token', data.data.token)
              // setToken('token_key', data.data.token_key)
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
