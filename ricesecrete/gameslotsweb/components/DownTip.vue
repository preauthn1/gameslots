<template>
  <van-popup v-model:show="isShow" position="bottom" class="pop">
    <div class="pop-content">
      <div class="content-wapper">
        <img :src="system?.site.website_desktop_logo" class="logo">
        <span class="desc">{{ $t("我们希望将本站添加到您的主屏幕，以获取最新的免费投注和奖金更新。") }}</span>
      </div>
      <div class="btn-wapper">
        <span class="cancel" @click="isShow = false">{{ $t("取消") }}</span>
        <van-button round class="btn" @click="inStall">{{ $t("继续") }}</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { pwa } from "@/utils/pwa";

const isShow: Ref<boolean> = ref(false);
const system = useSystem();
const inStall = () => {
  pwa.value?.prompt();
};

watch(
  pwa,
  (v) => {
    if (v) isShow.value = true;
  },
  { immediate: true }
);
</script>

<style scoped lang="less" src="@/assets/css/downTip.less"></style>