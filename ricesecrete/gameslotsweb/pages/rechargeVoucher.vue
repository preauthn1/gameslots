<template>
  <div>
    <NavBar title="充值"></NavBar>
    <div class="container">
      <div class="item" v-if="activeChannel?.bank_name">
        <div class="title">{{ $t("渠道名字") }}</div>
        <div class="content">{{activeChannel.bank_name}}</div>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(activeChannel.bank_name)">
      </div>
      <div class="item" v-if="activeChannel.bank_number">
        <div class="title">{{ $t("渠道地址") }}</div>
        <div class="content">{{activeChannel.bank_number}}</div>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(activeChannel.bank_number)">
      </div>
      <div class="item">
        <div class="title">{{ $t("户名") }}</div>
        <div class="content">{{activeChannel?.bank_khm}}</div>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(activeChannel.bank_khm)">

      </div>
      <div class="item" v-if="activeChannel.bank_open">
        <div class="title">{{ $t("开户行") }}</div>
        <div class="content">{{activeChannel.bank_open}}</div>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(activeChannel.bank_open)">

      </div>
      <div class="item">
        <div class="title">{{ $t("付款金额") }}</div>
        <div class="content">{{ activeChannel.currencyApi.currency_symbol }}{{ $numInit(params.apply_price)}}</div>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(params.apply_price)">

      </div>
      <div class="item">
        <div class="title">{{ $t("到账金额") }}</div>
        <div class="content">{{ system?.data.monetary_type }}{{ $numInit(price) }}</div>
        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(price)">

      </div>
      <div class="upload-wapper">
        <van-uploader v-model="fileList" :max-count="1" />
        <span class="upload-tips">{{ $t("上传凭证") }}</span>
      </div>
      <van-button round size="large" class="btn" @click="submit" :loading="btnLoading">{{ $t("提交凭证") }}</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const $route = useRoute();
import type { Offline, Online, RechargeType } from "~/types/recharge";
import { upload_img_api } from "@/api";
import { v2_user_offline_apply_api } from "~/api_v2/recharge";
const system = useSystem();
const { $t } = useNuxtApp();
const $router = useRouter();
interface Params {
  type: RechargeType;
  apply_price: number;
  bank_sk_id: number;
  usdt_type: string;
  not_auto_action: number;
}
const params: Params = JSON.parse($route.query.data as string);
const activeChannel: Offline | Online = JSON.parse(
  $route.query.activeChannel as string
);
const price = $route.query.price as string;

const fileList: Ref<{ objectUrl: string; file: File }[]> = ref([]);
const upLoad = async () => {
  const formData = new FormData();
  formData.append("file", fileList.value[0].file);
  const res = await upload_img_api(formData);
  if (res?.code == 1) {
    return res.data.file;
  }
};
const btnLoading = ref(false);
const submit = async () => {
  if (fileList.value.length == 0) {
    showNotify({ type: "danger", message: $t("请上传充值凭证") });
    return;
  }
  btnLoading.value = true;
  const credentials = await upLoad();
  const res = await v2_user_offline_apply_api({ ...params, credentials });
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast($t("提交成功，等待后台审核"));
    $router.replace("/");
  }
};
</script>

<style scoped lang="less" src="@/assets/css/rechargeVoucher.less"></style>