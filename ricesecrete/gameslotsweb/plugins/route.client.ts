// 处理nuxt3 路由快速切换，页面崩溃的bug
import { defineNuxtPlugin } from "#app";
export default defineNuxtPlugin(()=>{
  const isFinish = ref(false)
  const nuxtApp = useNuxtApp()
  const Rollout = isRollout()
  nuxtApp.hook("page:start",()=>{
    isFinish.value = true
    const app = document.getElementById("app")
    app && (app.style.pointerEvents = "none")
  })
  nuxtApp.hook("page:finish",()=>{
    isFinish.value = false
    const app = document.getElementById("app")
    app && (app.style.pointerEvents = "")
  })
  nuxtApp.$router.beforeEach((to,from,next)=>{
    if(to.name == "index" || to.name == "searchGame"){
      Rollout.value = true
    }else{
      Rollout.value = false
    }
    if(isFinish.value){
      next(false)
      return
    }
    next(true)
  })

  window.onerror = (e:string|Event)=>{
    const error = e as string
    if(error.includes("subTree") || error.includes("insertBefore") ){
      location.reload()
    }
  }
});