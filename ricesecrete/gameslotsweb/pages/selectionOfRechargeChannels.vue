<template>
  <div class="tabbar-page min-h-85vh max-h-88vh">
    <NavBar title="充值"></NavBar>
    <div class="container">
      <div class="title">{{ $t("充值渠道选择") }}</div>
      <div class="channel-item" v-for="item, index in recharge?.online" @click="tabItem(item, 'online')" :key="index">
        <span class="itme-name">{{ item.pay_name }}</span>
        <img :src="item.icon" class="icon" v-if="item.icon">
      </div>
      <div class="channel-item" v-for="item, index in recharge?.offline" @click="tabItem(item, 'offline')" :key="index">
        <span class="itme-name">{{ item.bank_name }}</span>
        <img :src="item.icon" class="icon" v-if="item.icon">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Offline, Online } from "~/types/recharge";

const $router = useRouter();
const tabItem = (item: Offline | Online, type: "offline" | "online") => {
  $router.push(`/deposit/${item.id}?type=${type}`);
};
const recharge = useRecharge();
// 更新充值数据
if (!recharge.value) {
  await updateRecharge();
}
</script>

<style scoped lang="less" src="@/assets/css/selectionOfRechargeChannels.less"></style>