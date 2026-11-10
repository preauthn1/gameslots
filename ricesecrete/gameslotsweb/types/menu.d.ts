export interface V2_index_menu_item_api_type{
  name:string
  href:string
  icon:string
  icon_url:string
}
export interface V2_index_menu_list_api_type{
  index_icon:V2_index_menu_item_api_type[]
  index_rule:V2_index_menu_item_api_type[]
  left_menu_casino:V2_index_menu_item_api_type[]
  left_menu_esports:V2_index_menu_item_api_type[]
  left_menu_popular:V2_index_menu_item_api_type[]
  left_menu_join:V2_index_menu_item_api_type[]
  left_menu_support:V2_index_menu_item_api_type[]
  index_about:V2_index_menu_item_api_type[]
  index_help:V2_index_menu_item_api_type[]
  user_center_menu:V2_index_menu_item_api_type[]
}