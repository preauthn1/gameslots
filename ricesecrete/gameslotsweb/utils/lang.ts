import type { SystemType } from "~/types";
class Lang {
  langData?: SystemType;
  locale?: Ref<string>
  init(data: SystemType) {
    this.langData = data
    const locale = localStorage.getItem('locale');
    this.locale = ref(locale || ''); //useCookie("locale");
  }
  t(key: string | undefined, data?: { [key: string]: string | number }): string {
    if (!this.langData?.lang[this.locale?.value || this.langData.locale]) return ""
    let value: string = this.langData?.lang[this.locale?.value || this.langData.locale][key] || key
    // 截取变量
    if (data) {
      for (const objKey in data) {
        const reg = new RegExp(`{${objKey}}`, "g")
        value = value.replace(reg, data[objKey] ? data[objKey].toString() : "")
      }
    }
    return value || key || ""
  }
  change(locale: string) {
    this.locale && (this.locale.value = locale)
    localStorage.setItem('locale', locale);
    window.location.reload()
  }
}
export default new Lang;