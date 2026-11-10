<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import en from "element-plus/lib/locale/lang/en";
// import { useUserStoreHook } from "@/store/modules/user";
// useUserStoreHook().initSocket()
export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider
  },
  computed: {
    currentLocale() {
      return this.$storage.locale?.locale === "cn" ? zhCn : en;
    }
  },
  mounted() {
    //
  },
});
</script>
<style>
::selection {
  background: rgb(59 130 246 / 0.8);
  color: #FFF;
}
</style>
