<template>
  <div>
    <NavBar left-text="" title="交易记录"></NavBar>
    <van-tabs v-model:active="active">
      <van-tab :title="$t(item.name)" v-for="item, index in type" :key="index"></van-tab>
    </van-tabs>
    <!-- 充值 -->
    <div class="container" v-if="active == 0">
      <FEmpty v-if="finished && rechargeList.length == 0" />
      <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('没有更多了')"
        :loading-text="$t('加载中...')" @load="onLoad" class="custom-list">
        <div class="card" v-for="item in rechargeList" :key="item.id">
          <div class="row">
            <span class="card-title">{{ $t("充值") }}</span>
            <span>{{ system?.data.monetary_type }}{{ item?.price }}</span>
          </div>
          <div class="row">
            <span>{{ item.add_time }}</span>
            <span>{{ $t(rechargeStatus.find(i => i.status == item.status)?.name) }}</span>
          </div>
        </div>
      </van-list>
    </div>

    <!-- 提现 -->
    <div class="container" v-if="active == 1">
      <FEmpty v-if="finished && withdrawList.length == 0" />
      <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('没有更多了')"
        :loading-text="$t('加载中...')" @load="onLoad">
        <div class="card" v-for="item in withdrawList" :key="item.id">
          <div class="row">
            <span class="card-title">{{ $t("提现") }}</span>
            <span>{{ system?.data.monetary_type }}{{ item.arrival_price }}</span>
          </div>
          <div class="row">
            <span>{{ item.add_time }}</span>
            <span>{{ $t(withdrawStatus.find(i => i.status == item.status)?.name) }}</span>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { recharge_record_api, withdraw_record_api } from "@/api/my";
import type {
  Recharge_record_api_type,
  Withdraw_record_type,
} from "~/types/my";
const system = useSystem();

// 状态相关
const rechargeStatus = [
  { name: "已取消", status: -2 },
  { name: "延迟未付款", status: -1 },
  { name: "待审核", status: 1 },
  { name: "未通过", status: 2 },
  { name: "已通过", status: 3 },
  { name: "已通过", status: 4 },
];
const withdrawStatus = [
  { name: "代付失败", status: -2 },
  { name: "已取消", status: -1 },
  { name: "待审核", status: 1 },
  { name: "未通过", status: 2 },
  { name: "已通过", status: 3 },
  { name: "已通过", status: 4 },
  { name: "进行中", status: 5 },
  { name: "封控审核", status: 6 },
];

const active = ref(0);
const type: Ref<{ name: string; type: string }[]> = ref([
  { name: "充值", type: "Recharge" },
  { name: "提现", type: "Withdraw" },
]);
const rechargeList: Ref<Recharge_record_api_type> = ref([]);
const withdrawList: Ref<Withdraw_record_type> = ref([]);
const params = {
  page: 1,
  limit: 20,
  type: 0,
};
const getRechargeList = async () => {
  params.type = 0;
  const res = await recharge_record_api({
    ...params,
  });
  if (res?.code == 1) {
    if (res.data.length < params.limit) {
      finished.value = true;
    }
    rechargeList.value = [...rechargeList.value, ...res.data];
  }
};
const getWithdrawList = async () => {
  params.type = 1;
  const res = await withdraw_record_api({
    ...params,
  });
  if (res?.code == 1) {
    if (res.data.length < params.limit) {
      finished.value = true;
    }
    withdrawList.value = [...withdrawList.value, ...res.data];
  }
};

watch(active, async () => {
  params.page = 1;
  (type.value[active.value].type == "Recharge"
    ? rechargeList
    : withdrawList
  ).value = [];
  finished.value = false;
  loading.value = true;
  await (type.value[active.value].type == "Recharge"
    ? getRechargeList
    : getWithdrawList)();
  loading.value = false;
});

// 加载更多
const loading = ref(false);
const finished = ref(false);
const onLoad = async () => {
  params.page++;
  await (type.value[active.value].type == "Recharge"
    ? getRechargeList
    : getWithdrawList)();
  loading.value = false;
};

await (type.value[active.value].type == "Recharge"
  ? getRechargeList
  : getWithdrawList)();
</script>

<style scoped lang="less" src="@/assets/css/transactions.less">
:deep(.van-list__loading .van-loading__text) {
  color: white !important;
  /* 强制设置颜色为白色 */
}
</style>