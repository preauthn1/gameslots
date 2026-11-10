import { defineNuxtPlugin } from "#app";
import bus from "@/utils/bus"
import { register } from "swiper/element/bundle";
// register Swiper custom elements
register();

//用于去掉eazyplayer警告,开发时禁用，打包开启
export default defineNuxtPlugin(async () => {
  return {
    provide: {
      bus
    }
  }
});