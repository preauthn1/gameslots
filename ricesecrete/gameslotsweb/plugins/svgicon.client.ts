import svgIcon from "@/components/FSvg.vue"
import "virtual:svg-icons-register"
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component("FSvg", svgIcon)
})