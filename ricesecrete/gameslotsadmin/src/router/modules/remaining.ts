import { $t } from "@/plugins/i18n";
import type { RouteConfigsTable } from "/#/index";
const Layout = () => import("@/layout/index.vue");

const remainingRouter: Array<RouteConfigsTable> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: $t("登录"),
      showLink: false,
      showLevel: false,
      rank: 101
    }
  },
  {
    path: "/err/403",
    name: "403",
    component: () => import("@/views/err/403.vue"),
    meta: {
      title: $t("无权限"),
      showLink: false,
      showLevel: false,
      rank: 102
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      icon: "home-filled",
      title: $t("仪表盘"),
      showLink: false,
      showLevel: false,
      rank: 104
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  }
];

export default remainingRouter;
