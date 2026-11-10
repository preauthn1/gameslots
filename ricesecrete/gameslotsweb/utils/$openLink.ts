import bus from "@/utils/bus"
import { pwa } from "@/utils/pwa";

export default (url: string | undefined, isNewWindow: boolean = false) => {
  if (url) {
    if (url.startsWith("http") || url.startsWith("mailto")) {
      if (isNewWindow) {
        window.open(url)
      } else {
        window.location.href = url
      }
    } else if (url.startsWith("bus-")) {
      if (url === "bus-pddShow") {
        bus.emit("pddShow")
      }
      if (url === "bus-changeLangShow") {
        bus.emit("changeLangShow")
      }
      if (url === "bus-install") {
        const system = useSystem();
        if (detectMobileType() == 'iOS') {
          window.open(system?.value?.site?.ios_download_url);
        } else {
          window.open(system?.value?.site?.android_download_url);
        }
        // pwa.value?.prompt()
      }
    } else {
      useRouter().push(url)
    }
  }
}

function detectMobileType() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // 判断是否为 iOS
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iOS';
  }
  // 判断是否为 Android
  if (/Android/i.test(userAgent)) {
    return 'Android';
  }
  // 其他类型
  return 'Unknown';
}