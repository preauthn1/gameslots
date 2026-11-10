import { defineNuxtPlugin } from "#app";
import $require from "@/utils/$require";
import $openLink from "@/utils/$openLink";
import $numInit from "@/utils/$numInit";
import $copy from "@/utils/$copy";
import lang from "@/utils/lang";
export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.vueApp.config.warnHandler = () => {}
  return {
    provide: {
      t:lang.t.bind(lang),
      require:$require,
      openLink:$openLink,
      numInit:$numInit,
      copy:$copy,
    }
  }
});