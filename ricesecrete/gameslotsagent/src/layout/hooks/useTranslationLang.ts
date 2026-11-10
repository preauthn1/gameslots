import { useNav } from "./useNav";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { watch, type Ref } from "vue";
import { storageLocal } from "@pureadmin/utils";

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
    storageLocal.setItem("i18n_locale", lang);
    ref && handleResize(ref.value);
  }
  function locales() {
    const langs_str: string = storageLocal.getItem("i18n_langs");
    let langs = [];
    if (langs_str) {
      langs = JSON.parse(langs_str);
    }

    return langs;
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
    locales
  };
}
