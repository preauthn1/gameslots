<template>
  <div>
    <div class="card">
      <div class="card-title-wapper">
        <span>{{ $t("今天") }}</span>
        <van-icon name="question" class="question-icon" @click="summaryQuestion?.show()" />
      </div>
      <div class="num-list">
        <div class="num-item">
          <div class="num">{{ data?.sta_today.register }}</div>
          <div class="num-title">{{ $t("注册") }}</div>
        </div>
        <div class="num-item">
          <div class="num">{{ data?.sta_today.player }}</div>
          <div class="num-title">{{ $t("新玩家") }}</div>
        </div>
        <div class="num-item">
          <div class="num">{{ system?.data.monetary_type }}{{ $numInit(data?.sta_today.bet) }}</div>
          <div class="num-title">{{ $t("有效球队投注") }}</div>
        </div>
        <div class="num-item">
          <div class="num">{{ system?.data.monetary_type }}{{ $numInit(data?.sta_today.team) }}</div>
          <div class="num-title">{{ $t("委员会") }}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title-wapper">
        <span>{{ $t("全部") }}</span>
        <van-icon name="question" class="question-icon" @click="summaryQuestion?.show()" />
      </div>
      <div class="num-list">
        <div class="num-item">
          <div class="num">{{ data?.sta_all.register }}</div>
          <div class="num-title">{{ $t("注册") }}</div>
        </div>
        <div class="num-item">
          <div class="num">{{ data?.sta_all.player }}</div>
          <div class="num-title">{{ $t("玩家总数") }}</div>
        </div>
        <div class="num-item">
          <div class="num">{{ system?.data.monetary_type }}{{ $numInit(data?.sta_all.bet) }}</div>
          <div class="num-title">{{ $t("有效投注总额") }}</div>
        </div>
        <div class="num-item">
          <div class="num">{{ system?.data.monetary_type }}{{ $numInit(data?.sta_all.team) }}</div>
          <div class="num-title">{{ $t("委员会") }}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title-wapper">
        <span>{{ $t("委员会") }}</span>
        <!-- <van-icon name="question" class="question-icon" @click="$router.push('/commissionRewardRules')" /> -->
      </div>
      <div class="committee-content">
        <div class="committee-cover">
          <div class="committee-cover-icon"></div>
        </div>
        <div class="committee-right">
          <div class="committee-num-list">
            <div class="num-item">
              <div class="num">{{ system?.data.monetary_type }}{{ $numInit(data?.team.bonus) }}</div>
              <div class="num-title">{{ $t("总支付") }}</div>
            </div>
            <div class="num-item">
              <div class="num">{{ system?.data.monetary_type }}{{ $numInit(data?.team.referral_reward) }}</div>
              <div class="num-title">{{ $t("我不付钱") }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title-wapper2">{{ $t(data?.share.title) }}</div>
      <div class="share-list">
        <div class="share-item" v-for="item, index in data?.share.platform" :key="index" @click="share(item.name === 'Facebook' ? 'Facebook' : item.name === 'WhatsApp' ? 'WhatsApp' : item.name === 'Telegram' ? 'Telegram' : item.name === 'Twitter' ?
          'Twitter' : item.name === 'Facebook' ? 'Facebook' : item.name === 'Tiktok' ? 'Tiktok' : 'Email')">
          <img :src="item.icon" class="share-icon">
          <div class="share-name">{{ item.name }}</div>
        </div>
      </div>
      <div class="link-title">{{ $t(data?.share.intro) }}</div>
      <div class="link-wapper">
        <span>{{ data?.share.url }}</span>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(data?.share.url)">
      </div>
    </div>
    <div class="card">
      <div class="card-title-wapper">{{ $t(data?.service.title) }}</div>
      <div class="tel-wapper">
        <img :src="data?.service.platform.icon" class="tel-icon" @click="$openLink(data?.service.platform.url)">
        <div class="tel-desc">{{ $t(data?.service.info) }}</div>
      </div>
      <div class="tel-tip">
        <van-icon name="warning" class="warning-icon" />
        <span>{{ $t(data?.service.tip) }}</span>
        <a class="link" :href="`${data?.service.platform.url}`">{{ $t(data?.service.contact) }}</a>
      </div>
    </div>
    <div class="card">
      <div class="card-title-wapper">
        <span>{{ $t(data?.rule.title) }}</span>
        <!-- <van-icon name="question" class="question-icon" @click="$router.push('/commissionRewardRules')" /> -->
      </div>
      <div class="commission-title">{{ $t(data?.rule.info) }}</div>
      <div class="commission-box-wapper">
        <img src="@/assets/images/summary-box.png" class="commission-box-img">
        <div class="commission-box-content">
          <div class="commission-box-text">{{ $t("指数") }} > {{ value }} {{ $t("委员会") }} > {{ system?.data.monetary_type
            }}
            {{ $numInit(value * data?.rule.brokerage_ratio, 0) }}
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
      </div>
      <div class="html" v-html="data?.rule.pop_info"></div>
      <!-- <div class="subordinate-title">{{ $t("下属无限发展") }}</div>
      <img src="@/assets/images/subordinate.png" class="subordinate-img">
      <div class="subordinate-tip">1.{{ $t("每当您推荐的玩家下注、获胜或失败时,您都会收到不同的佣金百分比。") }}</div>
      <div class="subordinate-tip">2.{{ $t("系统每3分钟计算一次佣金。") }}</div> -->
    </div>
    <SummaryQuestion ref="summaryQuestion" :data="data?.rule.pop_explain" />
  </div>
</template>

<script setup lang="ts">
import { v2_affiliate_summary_api } from "@/api_v2/affiliate";
import type { V2_affiliate_summary_api_type } from "~/types/affiliate";
const system = useSystem();
const { $t } = useNuxtApp();
const value: Ref<number> = ref(0);
const summaryQuestion = ref();
const shareText = $t("加入我们,免费获得100BRL,无条件即可PIX提款");
const share = (
  type: "Facebook" | "WhatsApp" | "Telegram" | "Twitter" | "Email" | "Tiktok"
) => {
  console.log(data.value?.share.url);
  const shareLinkData = {
    Facebook: `https://m.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      data.value?.share.url as string
    )}&t=${encodeURIComponent(shareText)}`,
    WhatsApp: `https://api.whatsapp.com/send/?text=${encodeURIComponent(
      shareText + data.value?.share.url
    )}&via=lopscoop`,
    Telegram: `https://t.me/share/url?url=${encodeURIComponent(
      data.value?.share.url as string
    )}&text=${encodeURIComponent(shareText)}`,
    Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${data.value?.share.url}`,
    Email: `mailto:?body=${encodeURIComponent(
      shareText + data.value?.share.url
    )}`,
    Tiktok: `https://www.tiktok.com`
  };

  window.open(shareLinkData[type]);
};
// 获取相关数据
const data: Ref<V2_affiliate_summary_api_type | null> = ref(null);
const getData = async () => {
  const res = await v2_affiliate_summary_api();
  if (res?.code == 1) {
    data.value = res.data;
  }
};
await getData();
</script>

<style scoped lang="less" src="@/assets/css/summary.less"></style>