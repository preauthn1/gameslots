
import type {
  SystemType,
  SystemNewType,
} from "~/types";
import type { V2_index_menu_list_api_type } from "~/types/menu";

// 系统配置
export const useSystem = () => {
  return useState<SystemNewType & SystemType | null>("system", () => null)
}


// 是否登录
export const useLoginStatus = () => {
  const token = localStorage.getItem('token') //useCookie("token")
  return useState<boolean>("loginStatus", () => !!token)
}




// 菜单相关配置
export const useMenuList = () => {
  return useState<V2_index_menu_list_api_type | null>("menuList", () => null)
}

