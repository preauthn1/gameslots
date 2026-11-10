<template>
  <div class="box">
    <div class="header">
      <div class="title-wapper">
        <img src="@/assets/images/money-icon.png" class="money-icon">
        <span>{{ $t(props.data?.title) }}</span>
      </div>
      <div class="price-title">{{ $t("恭喜您刚刚抽中了:") }}</div>
      <div class="price">
        {{ system?.data.monetary_type }}<count-up :end-val="props.data?.awarded_amount" :decimalPlaces="2"
          @finished="finished"></count-up>
      </div>
      <div class="progress-wapper">
        <van-progress :percentage="parseInt(props.data?.awarded_amount / props.data?.amount * 100) || 0"
          class="progress" />
        <span class="progress-text">{{ $numInit(props.data?.awarded_amount / props.data?.amount * 100) || 0 }}%</span>
      </div>
      <div class="h-tip">
        {{ $t('仍然需要') }}
        {{ $numInit(props.data?.amount - props.data?.awarded_amount) }}
        {{ $t("才能提出") }}
      </div>
    </div>
    <div class="box-container">
      <van-button round class="btn full" @click="$router.push('/pdd')">{{ $t("申请更多可提取") }}</van-button>
      <div class="list">
        <div class="list-title">
          {{ $t("快速提现") }}
        </div>
        <div class="list-box">
          <div class="list-content"
            :style="{ 'animation-duration': `${props.data?.withdrawal_user_list.length * 0.5}s` }">
            <div class="list-item" v-for="item, index in props.data?.user_invite_record" :key="index">
              <div>{{ item.username }}</div>
              <div>{{ $t("刚刚获得") }}</div>
              <div class="item-price">
                + <span class="unit">{{ system?.data.monetary_type }}</span> {{ $numInit(item.amount) }}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import CountUp from "vue-countup-v3";
import type { Pdd_getData_api_type } from "~/types/pdd";
const props = defineProps<{
  data: Pdd_getData_api_type | null;
}>();
const system = useSystem();
</script>

<style scoped lang="less" src="@/assets/css/pddSuccess.less"></style>