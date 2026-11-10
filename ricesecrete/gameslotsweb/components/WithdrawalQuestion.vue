<template>
  <!-- 左侧弹出 -->
  <van-popup v-model:show="isShow" round :closeable="true">
    <div class="wapper">
      <div class="title-wapper">
        <img src="@/assets/images/liwu.png" class="title-icon">
        <span>{{ $t("下次奖金提取") }}</span>
      </div>
      <div class="tip">{{ $t("已收到") }} <span class="unit">{{system?.data.monetary_type}}</span> {{ userInfo?.cjbalance }}</div>
      <div class="tip">{{ $t("0X 滚动要求") }}</div>
      <div class="progress-wapper">
        <van-progress :percentage="progress" class="progress" />
        <span class="progress-text">{{ progress }}%</span>
      </div>
      <!-- <div class="foot-tip">{{ $t("禁止投注") }} <span class="unit">R$</span> <span class="num">0</span></div> -->
    </div>
  </van-popup>
</template>

<script setup lang="ts">
const isShow: Ref<boolean> = ref(false);
const progress = ref(0);
const show = (water_progress: number) => {
  isShow.value = true;
  progress.value = water_progress;
};
defineExpose({ show });
const userInfo = useUserInfo();
const system = useSystem();
</script>

<style scoped lang="less" src="@/assets/css/withdrawalQuestion.less"></style>