import { useNav } from "./useNav";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { watch, type Ref } from "vue";
import { storageLocal } from "@pureadmin/utils";
import { http } from "@/utils/http";
import { func } from "vue-types";

type Result = {
  code: number,
  data: Array<any>
};

export function useTranslationLang(ref?: Ref) {
  const { $storage, changeTitle, handleResize } = useNav();
  const { locale, t } = useI18n();
  const route = useRoute();

  function translationCh() {
    $storage.locale = { locale: "cn" };
    locale.value = "cn";
    ref && handleResize(ref.value);
  }

  function translationEn() {
    $storage.locale = { locale: "en" };
    locale.value = "en";
    ref && handleResize(ref.value);
  }

  function translation(lang) {
    $storage.locale = { locale: lang };
    locale.value = lang;
    storageLocal().setItem("i18n_locale", lang);
    ref && handleResize(ref.value);
  }
  function locales() {
    const langs_str: string = storageLocal().getItem("i18n_langs");
    let langs = [];
    if (langs_str) {
      langs = JSON.parse(langs_str);
    }
    if (langs.length == 0) {
      http.request<Result>("get", "/i18n/config").then(res => {
        const data = res.data as any;
        langs = data.langs
        storageLocal().setItem("currency_defa", data.currency_name);
        storageLocal().setItem("currency_date", data.currency_date);
        console.log('重新获取的语言',data.langs)
      });
      console.log('缓存没有语言')
    }
    console.log("langs", langs);
    return langs;
  }

  function get_currency(){
    let currency_defa = "";
    let currency_date = "";
    try {
      currency_defa = storageLocal().getItem("currency_defa");
      currency_date = storageLocal().getItem("currency_date");
    }catch (error) {
     
    }
  
    return [currency_defa ?? '', currency_date ?? ''];
  }

  watch(
    () => locale.value,
    () => {
      changeTitle(route.meta);
    }
  );

  return {
    t,
    route,
    locale,
    translationCh,
    translationEn,
    translation,
    locales,
    get_currency
  };
}
