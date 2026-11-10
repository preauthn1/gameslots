<template>
  <div class="card">
    <div v-for="item in data?.issues_list" :key="item.id">
      <div class="faq-title">{{ $t(item.news_title) }}</div>
      <div class="faq-content" v-html="item.news_content"></div>
      <!-- {{ $t(item.news_content) }} -->
    </div>
    <div class="link-wapepr">
      <!-- <div class="link" @click="$router.push('/commissionRewardRules')">{{ $t("佣金奖励规则") }}</div> -->
      <div class="link" @click="$router.push('/commissionCalculationRules')">{{ $t("佣金计算规则") }}</div>
    </div>
    <div class="commission-box-wapper">
      <div class="commission-box-content">
        <div class="commission-box-text">{{ $t("指数") }} > {{ value }} {{ $t("委员会") }} > {{ system?.data.monetary_type }}
          {{ $numInit(value * (data?.rule.brokerage_ratio ?? 0), 0) }}
          {{ $t("每个月") }}!
        </div>
        <div class="commission-progress-wapper">
          <van-slider v-model="value" :min="data?.rule.brokerage_min" :max="data?.rule.brokerage_max">
            <template #button>
              <FSvg name="sliderIcon" class="slider-icon" />
            </template>
          </van-slider>
        </div>
      </div>
      <img src="@/assets/images/summary-box.png" class="commission-box-img">
    </div>
    <div class="html" v-html="data?.rule.pop_info"></div>
    <div class="html faq-content" v-html="data?.rule.pop_explain"></div>

    <!-- <div class="subordinate-title">{{ $t("下属无限发展") }}</div>
    <img src="@/assets/images/subordinate.png" class="subordinate-img">
    <div class="subordinate-tip">1.{{ $t("每当您推荐的玩家下注、获胜或失败时,您都会收到不同的佣金百分比。") }}</div>
    <div class="subordinate-tip" style="margin-bottom:24px">2.{{ $t("系统每3分钟计算一次佣金。") }}</div>
    <div class="faq-title">{{$t("定义")}}</div> -->
    <!-- <div class="faq-content">
      {{ $t("注册 - 注册用户数量") }} <br>
      {{ $t("新玩家 - 今日注册用户中的新付费玩家") }} <br>
      {{ $t("equipar 上的有效投注[num] - 来自您团队的指示和贡献的有效投注总价值。") }} <br>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { v2_affiliate_faq_api } from "~/api_v2/affiliate";
import type { V2_affiliate_faq_api_type } from "~/types/affiliate";
const value: Ref<number> = ref(0);
const system = useSystem();
const data: Ref<V2_affiliate_faq_api_type | null> = ref(null);
const getData = async () => {
  const res = await v2_affiliate_faq_api();
  if (res?.code == 1) {
    data.value = res.data;
  }
};
await getData();
</script>

<style scoped lang="less" src="@/assets/css/faq.less"></style>