import { defineStore } from "pinia";
import { store } from "@/store";
import { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageLocal } from "@pureadmin/utils";
import { getLogin, getWsToken } from "@/api/user";
import { UserResult } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import socket from "@/utils/socket";
import { parseMsg } from "@/utils/global";
import { ElMessageBox, ElNotification } from "element-plus";
import { type DataInfo, setToken, removeToken, sessionKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username:
      storageLocal().getItem<DataInfo<number>>(sessionKey)?.username ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(sessionKey)?.roles ?? [],
    socketUrl: storageLocal().getItem("socketUrl") ?? "",
    socketToken: storageLocal().getItem("socketToken") ?? "",
    socketUid: storageLocal().getItem("socketUid") ?? "",
    playAudio: ""
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    }, //初始化soket
    async initSocket(receiveMessage) {
      if (!this.username) {
        return;
      }
      getWsToken().then(response => {
        if (response.code == 1) {
          const res = response.data;

          this.socketToken = res.token;
          this.socketUid = res.uid;
          this.socketUrl = res.WebSocket;
          storageLocal().setItem("socketUrl", this.socketUrl);
          storageLocal().setItem("socketToken", res.token);
          storageLocal().setItem("socketUid", res.uid);
          const url: string = this.socketUrl;
          if (url != "") {
            socket.init(receiveMessage, url);
          }
        }
      });
    },
    // 消息接收
    receiveMessage(e: any) {
      console.log(e);
      if (e) {
        const params = parseMsg(e.data);
        console.log(params);
        if (params["order"] == "msg") {
          params["title"] = decodeURIComponent(params["title"]);
          params["msg"] = decodeURIComponent(params["msg"]);
          this.playAudio = params["msg"];
          switch (params["mode"]) {
            case "toast":
              ElNotification({
                title: params["title"],
                message: params["msg"],
                type: "info"
              });
              break;
            case "pop":
              ElMessageBox.alert(params["msg"], params["title"]);
              break;
          }
        }
      }
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
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
      console.log("logout");
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
      try {
        socket.close();
      } catch (error) { }
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
