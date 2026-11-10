<template>
  <div>
    <NavBar></NavBar>
    <div class="container">
      <!-- <img src="@/assets/images/pix-icon.png" class="pix-icon"> -->
      <div class="desc">{{ $t("请打开您的支付应用程序，扫描下面的二维码进行支付，或者复制下面的代码并粘贴到您的付款应用程序中以完成购买") }}</div>
      <div class="price">{{ $t("总数") }} {{ activeChannel.currencyApi.currency_symbol }}{{ $numInit(price) }}</div>
      <div class="code">
        <img :src="data.qrcode_url">
      </div>
      <van-button size="large" round class="btn" @click="$copy(data.address)">
        <span>{{ $t("复制地址") }}</span>
        <img src="@/assets/images/copy-icon.png" class="copy-icon">
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Offline,
  Online,
  V2_user_offline_apply_api_type,
} from "~/types/recharge";
const $route = useRoute();
const data: V2_user_offline_apply_api_type = JSON.parse(
  $route.query.data as string
);
const activeChannel: Offline | Online = JSON.parse(
  $route.query.activeChannel as string
);
const price = $route.query.price as string;
</script>

<style scoped lang="less" src="@/assets/css/depositCode.less">
</style>