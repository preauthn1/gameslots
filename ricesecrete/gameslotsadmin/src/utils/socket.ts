/*
 * @Descripttion: 封装socket方法
 * @version:
 * @Date: 2021-08-06 11:14:39
 * @LastEditTime: 2021-10-26 14:06:34
 */
// import store from '@/store'
import { ElMessage } from 'element-plus'
import { Base64 } from 'js-base64'
import { getToken, setToken } from "@/utils/auth";
import { getQueryParams, parseMsg } from "@/utils/global";
import { useUserStoreHook } from '@/store/modules/user';
import { storageLocal } from '@pureadmin/utils';
// import { useUserStoreHook } from '@/store/modules/user';
// const userHook = useUserStoreHook();
// const language = store.state.users.language // 当前用户信息，后台配置
// const token = store.state.users.authorization // 获取验证信息，后台配置
interface socket {
  websocket: any
  connectURL: string
  socket_open: boolean
  hearbeat_timer: any
  hearbeat_interval: number
  is_reonnect: boolean
  reconnect_count: number
  reconnect_current: number
  ronnect_number: number
  reconnect_timer: any
  reconnect_interval: number
  init: (receiveMessage: Function | null, url?: string) => any
  msg: (receiveMessage: Function | null, url?: string) => any
  receive: (message: any) => void
  heartbeat: () => void
  send: (data: any, callback?: any) => void
  close: () => void
  reconnect: () => void,
  receive_message: Function
}

const socket: socket = {
  websocket: null,
  connectURL: '', //userHook.getSocketUrl(),
  // 开启标识
  socket_open: false,
  // 心跳timer
  hearbeat_timer: null,
  // 心跳发送频率
  hearbeat_interval: 9000,
  // 是否自动重连
  is_reonnect: true,
  // 重连次数
  reconnect_count: 3,
  // 已发起重连次数
  reconnect_current: 1,
  // 网络错误提示此时
  ronnect_number: 0,
  // 重连timer
  reconnect_timer: null,
  // 重连频率
  reconnect_interval: 5000,

  receive_message: null,

  msg: (receiveMessage: Function | null, url?: string) => {
    if (!('WebSocket' in window)) {
      ElMessage.warning('浏览器不支持WebSocket')
      return null
    }
    socket.receive_message = receiveMessage
    // console.log('进来执行了');
    socket.websocket = new WebSocket(url)
    socket.websocket.onmessage = (e: any) => {
      if (receiveMessage) {
        receiveMessage(e)
      }
    }

    socket.websocket.onclose = (e: any) => {
      clearInterval(socket.hearbeat_timer)
      socket.socket_open = false
      console.log('链接关闭,尝试重联');
      // 需要重新连接
      if (socket.is_reonnect) {
        socket.reconnect_timer = setTimeout(() => {
          // 超过重连次数
          if (socket.reconnect_current > socket.reconnect_count) {
            clearTimeout(socket.reconnect_timer)
            socket.is_reonnect = false
            return
          }

          // 记录重连次数
          socket.reconnect_current++
          socket.reconnect()
        }, socket.reconnect_interval)
      }
    }

    // 连接成功
    socket.websocket.onopen = function (e: any) {
      socket.socket_open = true
      socket.is_reonnect = true
      socket.reconnect_current = 1;
      console.log('消息连接成功');
      socket.send({
        type: 'add',
        uid: storageLocal().getItem("socketUid"),
        token: storageLocal().getItem("socketToken")
      });
      // 开启心跳
      socket.heartbeat()
      // console.log(e);
      // console.log('链接成功');
    }

    // 连接发生错误
    socket.websocket.onerror = function () {
      console.log('链接失败');
    }
  },

  init: (receiveMessage: Function | null, url?: string) => {
    const main_ws = new WebSocket(url)
    main_ws.onmessage = (msg: any) => {
      console.log(msg.data);
      const info = parseMsg(msg.data);
      if (info['order'] == 'server') {
        const msg_url = (window.location.protocol == 'http:' ? 'ws' : 'wss') + '://' + info['host'] + '/ws' + info['port'];
        storageLocal().setItem('socketMsgUrl', msg_url);
        socket.msg(receiveMessage, msg_url)
      }
    }

    main_ws.onclose = (e: any) => {
      console.log('主连接断开');
    }

    // 连接成功
    main_ws.onopen = function (e: any) {
      if (main_ws.readyState == 1) {
        console.log('主连接成功');
        main_ws.send('type=askserver');
      }
    }

    // 连接发生错误
    main_ws.onerror = function () {
      console.log('链接失败');
    }
  },
  send: (data, callback = null) => {
    // 开启状态直接发送
    if (socket.websocket.readyState === socket.websocket.OPEN) {
      socket.websocket.send(getQueryParams(data))
      if (callback) {
        callback()
      }

      // 正在开启状态，则等待1s后重新调用
    } else {
      clearInterval(socket.hearbeat_timer)
      if (socket.ronnect_number < 1) {
        ElMessage({
          type: 'error',
          message: 'chat.unopen',
          duration: 6000,
        })
      }
      socket.ronnect_number++
    }
  },

  receive: (message: any) => {
    let params = Base64.decode(JSON.parse(message.data).data)
    params = JSON.parse(params)
    return params
  },

  heartbeat: () => {
    if (socket.hearbeat_timer) {
      clearInterval(socket.hearbeat_timer)
    }

    socket.hearbeat_timer = setInterval(() => {
      const data = {
        type: 'online'
      }
      socket.send(data)
    }, socket.hearbeat_interval)
  },

  close: () => {
    clearInterval(socket.hearbeat_interval)
    socket.is_reonnect = false
    socket.websocket.close()
  },

  /**
   * 重新连接
   */
  reconnect: () => {
    if (socket.websocket && !socket.is_reonnect) {
      socket.close()
    }
    useUserStoreHook().initSocket(socket.receive_message)
    // console.log('重新链接');
    // const url: string = getToken('socketMsgUrl') ?? '';
    // if (url != '') {
    //   console.log('重新链接' + url)
    //   socket.msg(socket.receive_message, url)
    // }
  },
}

export default socket

