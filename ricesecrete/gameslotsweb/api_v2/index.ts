import Request from "@/utils/Request";
import type { GameIndex2ApiType, GameIndex2QueryApiType, GameListApiQueryType, GameListApiType, SystemType } from "~/types";
import type { V2_index_menu_list_api_type } from "~/types/menu";
const request = new Request();

// 系统配置
export const v2_system_info_api = () => {
  return request.send<object, SystemType>({
    url: "v2/system/info",
    method: "get",
  })
}

// 获取菜单配置相关
export const v2_index_menu_list_api = () => {
  return request.send<V2_index_menu_list_api_type>({
    url: "v2/index/menu_list",
    method: "post",
  })
}

// 首页游戏
export const v2_game_index_api = (data?: GameIndex2QueryApiType) => {
  return request.send<GameIndex2ApiType>({
    url: "v2/game/index",
    method: "get",
    query: data
  })
}
// 游戏列表
export const game_list_api = (data: GameListApiQueryType) => {
  return request.send<GameListApiType>({
    url: "v2/game/game_list",
    method: "get",
    query: data
  })
}


