import type { web_socket_api_type } from "~/types/user";
import { getWsToken } from "@/api";
import { ref } from "vue";

export const useSocketInfo = () => {
  return useState<web_socket_api_type | null>("socketInfo", () => null);
};

const parseMsg = (str: any) => {
  const strs = str.split("&");
  const pms = [];
  let pm;
  for (let i = 0; i < strs.length; i++) {
    pm = strs[i].split("=");
    if (pm.length == 2) {
      pms[pm[0]] = pm[1];
    }
  }
  return pms;
};

const getQueryParams = (queryParam: any) => {
  let url = "";
  for (const key in queryParam) {
    if (Object.hasOwnProperty.call(queryParam, key)) {
      const val = queryParam[key];
      if (val !== "") {
        url += "&" + key + "=" + encodeURIComponent(val);
      }
    }
  }
  return url.substring(1);
};

class socketClient {
  websocket: any = null;
  connectURL = "";
  // 开启标识
  socket_open = false;
  // 心跳timer
  hearbeat_timer: any = null;
  // 心跳发送频率
  hearbeat_interval = 9000;
  // 是否自动重连
  is_reonnect = true;
  // 重连次数
  reconnect_count = 3;
  // 已发起重连次数
  reconnect_current = 1;
  // 网络错误提示此时
  ronnect_number = 0;
  // 重连timer
  reconnect_timer: any = null;
  // 重连频率
  reconnect_interval = 5000;
  receive_message: string | null = null;
  wsUrl = "";
  async initSocket(receive_message: string | null) {
    this.receive_message = receive_message;
    const response = await getWsToken();
    if (response?.code == 1) {
      useSocketInfo().value = response.data;
      const url = response.data.WebSocket;
      if (url != "") {
        this.initWebSocket(this.receive_message, url);
      }
    }
  }
  // 初始化socket
  initWebSocket(receive_message, wsUrl) {
    if (!("WebSocket" in window)) {
      return null;
    }
    if (!useSocketInfo().value?.token) {
      return;
    }
    this.receive_message = receive_message;
    if (wsUrl) {
      this.wsUrl = wsUrl;
    }

    if (!this.wsUrl) {
      return;
    }
    const main_ws = new WebSocket(this.wsUrl);
    main_ws.onmessage = (msg) => {
      const info: any = parseMsg(msg.data);
      if (info.order == "server") {
        const msg_url = "wss" + "://" + info["host"] + "/ws" + info["port"];
        // helper.set('socketMsgUrl', msg_url);
        this.msg(receive_message, msg_url);
        main_ws.close();
      }
    };

    main_ws.onclose = () => {};

    // 连接成功
    main_ws.onopen = () => {
      if (main_ws.readyState == 1) {
        main_ws.send("type=askserver");
      }
    };

    // 连接发生错误
    main_ws.onerror = function () {};
  }

  msg(receiveMessage, url) {
    // console.log('进来执行了' + url);
    this.websocket = new WebSocket(url);

    this.websocket.onmessage = (e) => {
      if (receiveMessage) {
        receiveMessage(e);
      }
    };

    // 连接发生错误
    this.websocket.onerror = function (e) {};

    this.websocket.onclose = (e) => {
      clearInterval(this.hearbeat_timer);
      this.socket_open = false;
      // 需要重新连接
      if (this.is_reonnect) {
        this.reconnect_timer = setTimeout(() => {
          // 超过重连次数
          if (this.reconnect_current > this.reconnect_count) {
            clearTimeout(this.reconnect_timer);
            this.is_reonnect = false;
            return;
          }

          // 记录重连次数
          this.reconnect_current++;
          this.reconnect();
        }, this.reconnect_interval);
      }
    };

    // 连接成功
    let _this = this;
    this.websocket.onopen = function (e) {
      // console.log('消息连接成功');
      _this.socket_open = true;
      _this.is_reonnect = true;
      _this.reconnect_current = 1;
      console.log("消息连接成功1111", useSocketInfo());
      _this.send({
        type: "add",
        uid: useSocketInfo().value?.uid,
        token: useSocketInfo().value?.token,
      });
      // 开启心跳
      _this.heartbeat();
      // _this.onOpen && _this.onOpen()
    };
  }

  send(data: any, callback = null) {
    if (!this.websocket) return;
    // 开启状态直接发送
    if (this.websocket.readyState === this.websocket.OPEN) {
      this.websocket.send(getQueryParams(data));
      // if (callback) {
      //     callback()
      // }

      // 正在开启状态，则等待1s后重新调用
    } else {
      clearInterval(this.hearbeat_timer);
      if (this.ronnect_number < 1) {
        //   ElMessage({
        //     type: 'error',
        //     message: 'chat.unopen',
        //     duration: 6000,
        //   })
      }
      this.ronnect_number++;
    }
  }

  heartbeat() {
    if (this.hearbeat_timer) {
      clearInterval(this.hearbeat_timer);
    }
    const _this = this;
    this.hearbeat_timer = setInterval(() => {
      const data = {
        type: "online",
        op: "page",
        page: "/",
      };
      _this.send(data);
    }, this.hearbeat_interval);
  }

  close() {
    clearInterval(this.hearbeat_interval);
    this.is_reonnect = false;
    this.websocket && this.websocket.close && this.websocket.close();
  }

  /**
   * 重新连接
   */
  reconnect() {
    if (this.websocket && !this.is_reonnect) {
      this.close();
    }
    // console.log('重新链接');
    this.initSocket(this.receive_message);
    // const url = helper.get('socketMsgUrl') ?? '';
    // if (url != '') {
    //     console.log('重新链接' + url)
    //     this.msg(this.receive_message, url)
    // }
  }
}

export const useWebSocket = new socketClient();
