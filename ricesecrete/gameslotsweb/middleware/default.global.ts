export default defineNuxtRouteMiddleware((to)=>{
  const loginStatus = useLoginStatus()
  const noLoginPath:string[] = [
    "index",
    "login",
    "register",
    "resetPhone",
    "verification",
    "downloadApp",
    "gameList-t_id-tc_id-tag",
    "searchGame"
  ]
  if(!noLoginPath.includes(to.name as string) && !loginStatus.value){
    abortNavigation()
    return navigateTo("/login")
  }
})