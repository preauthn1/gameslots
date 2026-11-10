<template>
  <van-popup v-model:show="isShow" position="bottom" round :closeable="true">
    <div class="pop-content">
      <div class="cover-wapper">
        <img :src="gameData?.icon" class="cover">
      </div>
      <div class="content-box">
        <div class="name">{{ gameData?.game_name }}</div>
        <van-button round class="btn" @click="toInfo">{{ $t("开始游戏") }}</van-button>
      </div>
    </div>
    <van-overlay :show="isShowLoad" class="center">
      <van-loading vertical>
        <template #icon>
          <van-icon name="star-o" size="30" />
        </template>
        {{ $t("游戏跳转中，请稍后...") }}
      </van-loading>
    </van-overlay>
  </van-popup>
</template>

<script setup lang="ts">
import type { GameType } from "~/types";
const $router = useRouter();
const isShow: Ref<boolean> = ref(false);
const isShowLoad: Ref<boolean> = ref(false);
const { $bus } = useNuxtApp();
const gameData: Ref<GameType | null> = ref(null);
const show = (data: GameType) => {
  gameData.value = data;
  isShow.value = true;
};
const toInfo = async () => {

  const currentUrl = $router.currentRoute.value.fullPath;
  localStorage.setItem("gameUrl", currentUrl);
  isShowLoad.value = true;
  if (gameData.value?.is_new_tab == 1) {
    await $router.replace({
      path: `/gameInfo/${gameData.value?.id}`,
    });
  } else {
    await $router.push({
      path: `/gameInfo/${gameData.value?.id}`,
    });
  }

  isShow.value = false;
  isShowLoad.value = false;
};

onMounted(() => {
  $bus.on("gamePop", show);
});
onUnmounted(() => {
  $bus.off("gamePop");
});
</script>

<style scoped lang="less" src="@/assets/css/gamePop.less"></style>