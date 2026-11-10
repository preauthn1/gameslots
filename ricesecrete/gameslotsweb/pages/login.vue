<template>
  <div>
    <NavBar></NavBar>
    <div class="content-wapper">
      <div class="title">{{ $t("欢迎来到这里") }}</div>
      <!-- <van-button round size="large" class="btn-top">
        <img src="@/assets/images/google-circle.png" class="btn-icon" />
        <span>{{ $t("使用 Google+ 登录") }}</span>
      </van-button>
      <div class="or-wapper">
        <span>{{ $t("或者") }}</span>
      </div> -->
      <van-form @submit="onSubmit">
        <div class="input-label">{{ $t("用户名") }}</div>
        <f-van-field :rules="usernameRules()" v-model="form.username" :placeholder="$t('输入手机号/邮箱')" :border="false"
          class="left-icon" :clearable="true"></f-van-field>
        <div class="input-label">{{ $t("密码") }}</div>
        <f-van-field :rules="passwordRules()" v-model="form.password" type="password" :placeholder="$t('输入密码')"
          :border="false" :clearable="true" />
        <div class="forget" @click="$openLink(serviceList[0]?.link, true)">{{ $t("忘记了我的密码?") }}</div>
        <van-button round size="large" class="btn" native-type="submit" :loading="btnLoading">
          <span>{{ $t("登录") }}</span>
          <FSvg name="right" class="right-icon" />
        </van-button>
        <div class="reg" @click="doRegist">
          <span>{{ $t("建立新账户") }}</span>
        </div>
      </van-form>
    </div>
    <FootLogin />
  </div>
</template>

<script setup lang="ts">
import { passwordRules, usernameRules } from "@/utils/rules";
import { login_login_api } from "@/api";
import jsBridge from "~/composables/jsBridge";
import type {
  serviceListType
} from "~/types";
import {
  serviceList as serviceListApi
} from "@/api";
const nuxtApp = useNuxtApp();
const $router = useRouter();
const serviceList: Ref<serviceListType> = ref([]);
const getServiceList = async () => {
  const res = await serviceListApi();
  if (res?.code == 1) {
    serviceList.value = res.data;
  }
};
await getServiceList()

const userAgent = navigator.userAgent.toLowerCase();
const deviceType = ref('');
if ((window.navigator as any).standalone) {
  deviceType.value = 'IPHONE';
} else {
  const userAgent1 = navigator.userAgent || navigator.vendor;
  if (/iPhone|iPad|iPod/.test(userAgent1) && !/Safari/.test(userAgent1)) {
    deviceType.value = 'IPHONE';
  } else if (/iPhone|iPad|iPod/.test(userAgent) && window.innerWidth === screen.width &&
    window.innerHeight === screen.height) {
    deviceType.value = 'IPHONE';
  } else {
    if (userAgent.includes("bl999.andriod")) {
      deviceType.value = 'ANDROID';
    } else {
      deviceType.value = 'WINDOWS';
    }
  }
}
const doRegist = () => {
  jsBridge.sendMessage("registerClick");
  $router.replace('/register')
}
const form = ref({
  username: "",
  password: "",
  code_key: "",
  device_type: deviceType.value,
});
const btnLoading = ref(false);
const onSubmit = async () => {
  btnLoading.value = true;
  const res = await login_login_api(form.value);
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast(nuxtApp.$t("登录成功"));
    // useCookie("token").value = res.data.token;
    // useCookie("token_key").value = res.data.token_key;

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("token_key", res.data.token_key);
    nextTick(() => {
      useLoginStatus().value = true;
    });
    jsBridge.sendMessage("login",);
    $router.replace("/");
  }
};
</script>

<style scoped lang="less" src="@/assets/css/login.less"></style>