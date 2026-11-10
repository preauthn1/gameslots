<template>
  <div class="tabbar-page">
    <NavBar title="提现"></NavBar>
    <div class="container">
      <div class="title">{{ $t("提现渠道选择") }}</div>
      <div class="channel-item" v-for="item,index in list" @click="tabItem(item.type)" :key="index">
        <span class="itme-name">{{ $t(item.name) }}</span>
        <img :src="item.icon" class="icon" v-if="item.icon">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v2_user_withdrawal_withdrawal_channel_api } from "@/api_v2/recharge";
import type { V2_user_withdrawal_withdrawal_channel_api_type } from "@/types/recharge";
const $router = useRouter();
const tabItem = (type: number) => {
  $router.push(`/withdrawal/${type}`);
};
const list: Ref<V2_user_withdrawal_withdrawal_channel_api_type["pay_type"]> =
  ref([]);
const getList = async () => {
  const res = await v2_user_withdrawal_withdrawal_channel_api();
  if (res?.code == 1) {
    list.value = res.data.pay_type;
  }
};
await getList();
</script>

<style scoped lang="less" src="@/assets/css/selectionOfRechargeChannels.less"></style>