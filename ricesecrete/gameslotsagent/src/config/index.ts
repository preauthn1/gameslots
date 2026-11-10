import { App } from "vue";
import axios from "axios";
import { loadEnv } from "@build/index";
import { http } from "@/utils/http";
import { storageLocal } from "@pureadmin/utils";
import { i18n } from "@/plugins/i18n";
const { locale } = i18n.global;

let config: object = {};
const { VITE_PUBLIC_PATH } = loadEnv();


const setConfig = (cfg?: unknown) => {
  config = Object.assign(config, cfg);
};

const getConfig = (key?: string): ServerConfigs => {
  if (typeof key === "string") {
    const arr = key.split(".");
    if (arr && arr.length) {
      let data = config;
      arr.forEach(v => {
        if (data && typeof data[v] !== "undefined") {
          data = data[v];
        } else {
          data = null;
        }
      });
      return data;
    }
  }
  return config;
};

type Result = {
  code: number,
  data: Array<any>
};
/** 获取项目动态全局配置 */
export const getServerConfig = async (app: App): Promise<undefined> => {
  app.config.globalProperties.$config = getConfig();
  return http
    .request<Result>("get", "/i18n/config")
    .then(res => {
      const data = res.data as any;
      const config = data.config;
      let $config = app.config.globalProperties.$config;
      // 自动注入项目配置
      if (app && $config && typeof config === "object") {
        $config = Object.assign($config, config);
        app.config.globalProperties.$config = $config;
        // 设置全局配置
        setConfig($config);
      }
      for (const key in data.messages) {
        if (Object.prototype.hasOwnProperty.call(data.messages, key)) {
          const message = data.messages[key];
          i18n.global.mergeLocaleMessage(key, message);
        }
      }
      if (!storageLocal.getItem("i18n_locale")) {
        locale.value = data.locale;
        storageLocal.setItem("i18n_locale", data.locale);
      }
      storageLocal.setItem("i18n_messages", JSON.stringify(data.messages));
      storageLocal.setItem("i18n_langs", JSON.stringify(data.langs));
      storageLocal.setItem("i18n_fallbackLocale", data.fallbackLocale);
      return $config;
    })
    .catch((e) => {
      console.log(e)
      throw "请在public文件夹下添加serverConfig.json配置文件";
    });
};

export { getConfig, setConfig };
