import type { RequestType } from "@/types/index";
import { showNotify } from "vant";
import qs from "qs";
interface Opt {
  url: string
  method: "get" | "post"
  cache?: boolean
  cacheName?: string
  isUpload?: boolean
  query?: object
  body?: object
  headers?: object
  hideToast?: boolean
}

class Request {
  baseUrl: string;
  locale?: Ref<string>;
  token?: Ref<string>;
  token_key?: Ref<string>;
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL
  }
  async send<T, U = object>(opt: Opt) {
    const locale = localStorage.getItem('locale');
    this.locale = locale ? ref(locale) : ref(''); //useCookie("locale");
    const token = localStorage.getItem('token');
    this.token = token ? ref(token) : ref(''); //useCookie("token")
    const tokenKey = localStorage.getItem('token_key');
    this.token_key = tokenKey ? ref(tokenKey) : ref(''); //useCookie("token_key")
    // 服务端数据缓存
    if (opt.cache && opt.cacheName && import.meta.env.VITE_API_SSR == "true") {
      const cacheData = await $cache.getData(opt.cacheName)
      this.updateCache(opt)
      return cacheData?.data.value as RequestType<T> & U | null;
    }
    const { data } = await useFetch<RequestType<T>>(this.baseUrl + opt.url, {
      method: opt.method,
      lazy: false,
      body:
        opt.isUpload ? opt.body :
          opt.method == "post" ? qs.stringify({
            lang: this.locale.value,
            ...opt.body
          }) : null,
      query: {
        lang: this.locale.value,
        ...opt.query,
      },
      headers: {
        ...(opt.isUpload ? {} : { "Content-Type": "application/x-www-form-urlencoded" }),
        ...{
          "Usertoken": this.token.value,
          "Usertokenkey": this.token_key.value,
          ...opt.headers
        }
      }
    })
    this.testValue(data as Ref<RequestType>, opt)
    return data.value as RequestType<T> & U | null;
  }
  async updateCache(opt: Opt) {
    if (process.server) {
      const res = await $fetch<RequestType>(this.baseUrl + opt.url, {
        method: opt.method,
        body: opt.method == "post" ? qs.stringify({
          lang: this.locale?.value,
          ...opt.body
        }) : null,
        query: {
          lang: this.locale?.value,
          ...opt.query,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Usertoken": this.token?.value || "",
          "Usertokenkey": this.token_key?.value || ""
        }
      })
      if (res.code == 1) {
        $cache.setData(res as object, opt.cacheName as string)
      }
    }
  }

  testValue(data: Ref<RequestType>, opt?: Opt) {
    // 验证数据，界面跳转，只在客服端做操作，服务端不管
    if (process.server) return
    if (data.value?.code == 0 && !opt?.hideToast) {
      showNotify({ type: "danger", message: data.value.msg });
    }
    if (data.value?.code == 1000) {
      this.token && (this.token.value = "")
      this.token_key && (this.token_key.value = "")
      localStorage.removeItem('token');
      localStorage.removeItem('token_key');
      useLoginStatus().value = false;
      useRouter().push("/login")
    }
  }

}
export default Request;
