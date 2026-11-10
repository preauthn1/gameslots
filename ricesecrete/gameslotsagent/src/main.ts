import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
import ElementPlus from "element-plus";
import { useI18n } from "@/plugins/i18n";
import { getServerConfig } from "./config";
import { createApp, Directive } from "vue";
import { MotionPlugin } from "@vueuse/motion";
import { useEcharts } from "@/plugins/echarts";
import { useTable } from "@/plugins/vxe-table";
import { injectResponsiveStorage } from "@/utils/responsive";

import Table from "@pureadmin/table";
import PureDescriptions from "@pureadmin/descriptions";

import "animate.css";
// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
import "element-plus/dist/index.css";
import "@pureadmin/components/dist/index.css";
import "@pureadmin/components/dist/theme.css";
import "@pureadmin/components/dist/dark.scss";
import 'element-plus/theme-chalk/display.css'

// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

const app = createApp(App);

// 自定义指令
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册`@iconify/vue`图标库
import {
  IconifyIconOffline,
  IconifyIconOnline,
  FontIcon
} from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
app.component("Auth", Auth);
import commSerach from "@/components/comm/comm-search.vue";
import commDialog from "@/components/comm/comm-dialog.vue";
import userInfo from "@/components/user/userInfo.vue";
app.component("commSerach", commSerach);
app.component("commDialog", commDialog);
app.component("userInfo", userInfo);
getServerConfig(app).then(async config => {
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config);
  setupStore(app);
  app.use(MotionPlugin).use(useI18n).use(ElementPlus)
    .use(useEcharts)
    .use(Table)
    .use(PureDescriptions)
    .use(useTable);
  app.mount("#app");
});
