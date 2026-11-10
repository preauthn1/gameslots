<template>
  <div>
    <NavBar :leftText="data?.title">
      <template #right>
        <div class="nav-right-wapper">
          <img src="@/assets/images/user.png" class="user-icon">
          <span>{{ system?.data.monetary_type }}{{ $numInit(userInfo?.balance) }}</span>
        </div>
      </template>
    </NavBar>
    <div class="container">
      <div class="header-wapper">
        <div class="h-title-wapper">
          <img src="@/assets/images/money-icon.png" class="money-icon">
          <div class="h-title">
            {{ data?.current_symbol }}<count-up :end-val="data?.awarded_amount || 100" :decimalPlaces="2"></count-up>
          </div>
          <van-button size="mini" class="h-btn" @click="withdrawal" :loading="btnLoading">
            {{ $t("去取出") }}
          </van-button>
        </div>
        <div class="progress-title">{{ $numInit(Number(data?.awarded_amount) / Number(data?.amount) * 100) || 0 }}%
        </div>
        <van-progress :percentage="Math.floor(Number(data?.awarded_amount) / Number(data?.amount) * 100) || 0"
          class="progress" :stroke-width="14" />
        <div class="h-desc">
          <span>{{ $t("您还需要") }}</span>
          <span class="h-desc-price">{{ $numInit(Number(data?.amount) - Number(data?.awarded_amount)) }}</span>
          <span>{{ $t("才能提款") }}</span>
        </div>
      </div>

      <div class="turntable-title">{{ $t("1 小时内提取 R$100") }}</div>
      <div class="turntable-box">
        <Turntable @start="start" @finished="finished" :data="data" />
      </div>
      <div class="time-box">
        <span>{{ $t("倒计时") }}</span>
        <ClientOnly>
          <vue-countdown :time="Number(data?.remain_time) * 1000 || 0" v-slot="{ days, hours, minutes, seconds }">
            {{ days }}D {{ hours.toString().padStart(2, 0) }}:{{ minutes.toString().padStart(2, 0) }}:{{
              seconds.toString().padStart(2, 0) }}
          </vue-countdown>
        </ClientOnly>

      </div>
      <van-button round size="large" class="share-btn" @click="pddShare?.show">
        {{ $t("邀请好友帮忙提款") }}
        <div class="share-box">
          <FSvg name="share" />
        </div>
      </van-button>
      <div class="tabs-box">
        <div class="tabs-item" :class="{ 'tabs-item-active': tabsActive == 0 }" @click="tabsActive = 0">{{ $t("报告") }}
        </div>
        <div class="tabs-item" :class="{ 'tabs-item-active': tabsActive == 1 }" @click="tabsActive = 1">{{ $t("参考资料") }}
        </div>
        <div class="tabs-item" :class="{ 'tabs-item-active': tabsActive == 2 }" @click="tabsActive = 2">{{ $t("规则") }}
        </div>
      </div>
      <div class="tab-content">
        <div class="list" v-if="tabsActive == 0">
          <FEmpty v-if="!data?.withdrawal_user_list.length" />
          <div class="list-item" v-for="item, index in data?.withdrawal_user_list" :key="index">
            <div>{{ item.username }}</div>
            <div>{{ $t("刚刚提现") }}</div>
            <div class="item-price">
              <span class="unit">{{ data?.current_symbol }}</span> {{ $numInit(item.amount) }}
            </div>
          </div>
        </div>
        <div class="list" v-if="tabsActive == 1">
          <FEmpty v-if="!data?.user_invite_record.length" />
          <div class="list-item" v-for="item, index in data?.user_invite_record" :key="index">
            <div>{{ item.invite_username }}</div>
            <div>{{ $t("刚刚助力") }}</div>
            <div class="item-price">
              <span class="unit">{{ data?.current_symbol }}</span> {{ $numInit(item.amount) }}
            </div>
          </div>
        </div>
        <div v-if="tabsActive == 2" class="html rule" v-html="data?.introduce"></div>
      </div>
    </div>
    <PddShare :data="data" ref="pddShare" />
    <PddTips :data="data" @share="pddShare?.show" ref="pddTips" />
  </div>
</template>

<script setup lang="ts">
import {
  pdd_getData_api,
  pdd_turntable_api,
  pdd_withdrawal_api,
} from "~/api/pdd";
import CountUp from "vue-countup-v3";
import type { Pdd_getData_api_type } from "~/types/pdd";
import VueCountdown from "@chenfengyuan/vue-countdown";
const { $t } = useNuxtApp();
const pddShare = ref();
const pddTips = ref();
const tabsActive = ref(0);
const userInfo = useUserInfo();
const system = useSystem();
// 获取数据
const data: Ref<Pdd_getData_api_type | null> = ref(null);
const getData = async () => {
  const res = await pdd_getData_api();
  if (res?.code == 1) {
    console.log(res.data)
    data.value = res.data;
  }
};
await getData();

// 转盘
const start = async (
  // eslint-disable-next-line no-unused-vars
  run: (data: { key: string | number; amount: number }) => void,
  stop: () => void
) => {
  // 验证数据
  if (!data.value) {
    stop();
    return;
  }

  // 验证次数
  if (!data.value.remain_turntable_count) {
    pddTips.value.show();
    stop();
    return;
  }

  // 请求接口
  const res = await pdd_turntable_api({ id: data.value.id });
  if (res?.code == 1) {
    if (data.value.remain_turntable_count) {
      data.value.remain_turntable_count--;
      if (res.data.amount > 0) {
        run({
          key: res.data.type == 1 ? "?" : "?-bouns",
          amount: res.data.amount,
        });
        // 更新用户信息
        res.data.type == 2 && updateUserInfo();
      } else {
        run({
          key: 0,
          amount: res.data.amount,
        });
      }
    }
  }
};

const finished = () => {
  getData();
};

// 转盘提取
const btnLoading = ref(false);
const withdrawal = async () => {
  if (!data.value) return;
  if (Number(data.value.amount) - data.value.awarded_amount > 0) {
    pddTips.value.show();
    return;
  }
  btnLoading.value = true;
  const res = await pdd_withdrawal_api({ id: data.value.id });
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast($t("恭喜您，提现钱包金额"));
    updateUserInfo();
    getData();
  }
};
</script>

<style scoped lang="less" src="@/assets/css/pdd.less"></style>