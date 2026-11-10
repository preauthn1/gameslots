export default class jsBridge {
  /**
   * 发送消息给 iOS 或 Android
   * @param method - 原生端的方法名
   * @param data - 需要传递的参数
   */
  static sendMessage(name: string, data: any = {}) {
    // name 方法名称  login ，logout ，registerClick ，register，rechargeClick，firstrecharge，recharge，withdrawOrderSuccess
    // data 是数据  {\"amount\":\"200\",\"currency\":\"PHP\",\"isFirst\":0,\"success\":1}  {\"amount\":\"104\",\"currency\":\"PHP\",\"success\":1}
    const message = { name, data: JSON.stringify(data) };
    // iOS 端 (WKWebView)
    if (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.jsBridge
    ) {
      window.webkit.messageHandlers.jsBridge.postMessage(message);
    }
    // Android 端 (WebView)
    else if (window.jsBridge) {
      window.jsBridge.callNative(JSON.stringify(message));
    }
    // 其他情况
    else {
      console.error("无法向 iOS 或 Android 发送消息，当前环境不支持 JSBridge");
    }
  }
}
