<template>
  <van-popup v-model:show="isShow" round :closeable="true">
    <div class="wapper">
      <div class="title">{{ $t("你真幸运！") }}</div>
      <div class="sub-title">{{ $t("邀请好友帮忙提款") }}</div>
      <div class="card">
        <div class="price-box">
          <img src="@/assets/images/money-icon.png" class="money-icon">
          <span class="price">{{ system?.data.monetary_type }}{{ $numInit(props.data?.awarded_amount) }}</span>
        </div>
        <div class="progress-wapper">
          <van-progress :percentage="parseInt(props.data?.awarded_amount / props.data?.amount * 100) || 0"
            class="progress" />
          <span class="progress-text">{{ $numInit(props.data?.awarded_amount / props.data?.amount * 100) || 0 }}%</span>
        </div>
        <div class="price-tip">
          <span>{{ $t("仍需要") }}</span>
          <span class="price-text">{{ $numInit(props.data?.amount - props.data?.awarded_amount) }}</span>
          <span>{{ $t("才能提现") }}</span>
        </div>
      </div>
      <van-button class="full" round @click="share">{{ $t("与朋友共享") }}</van-button>
      <div class="bottom-tip" @click="isShow = false">
        {{ $t("放弃") }}
        {{ system?.data.monetary_type }}
        {{ $numInit(props.data?.awarded_amount) }}
        {{ $t("的提款") }}
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { Pdd_getData_api_type } from "~/types/pdd";
const isShow: Ref<boolean> = ref(false);
const props = defineProps<{
  data: Pdd_getData_api_type | null;
}>();
const system = useSystem();
const share = () => {
  emit("share");
};
const show = () => {
  isShow.value = true;
};
const emit = defineEmits(["share"]);
defineExpose({ show });
</script>

<style scoped lang="less" src="@/assets/css/pddTips.less"></style>