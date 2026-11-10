<template>
  <van-popup v-model:show="isShow" round :closeable="true">
    <div class="wapper">
      <div class="title">{{ $t("语言切换") }}</div>
      <div class="lang-item" :class="{'lang-item-active':lang.locale?.value == item.name}" v-for="item in system?.nation" :key="item.id"
           @click="changeLang(item.name)">
        <img :src="item.flag" class="lang-logo">
        <span>{{ item.name }}</span>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import lang from "@/utils/lang";
const { $bus } = useNuxtApp();

const isShow = ref(false);
const system = useSystem();
const changeLang = (locale: string) => {
  lang.change(locale);
  isShow.value = false;
};

onMounted(() => {
  $bus.on("changeLangShow", () => {
    isShow.value = true;
  });
});
onUnmounted(() => {
  $bus.off("changeLangShow");
});
</script>

<style scoped lang="less" src="@/assets/css/changeLang.less"></style>