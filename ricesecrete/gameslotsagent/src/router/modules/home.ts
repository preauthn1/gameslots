import { transformI18n } from "@/plugins/i18n";
import type { RouteConfigsTable } from "/#/index";
const Layout = () => import("@/layout/index.vue");

const homeRouter: RouteConfigsTable = {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "home-filled",
    title: transformI18n("仪表盘"),
    rank: 0
  },
  children: []
};

export default homeRouter;
