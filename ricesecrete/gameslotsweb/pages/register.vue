<template>
  <div>
    <nav-bar></nav-bar>
    <div class="content-wapper">
      <div class="title">{{ $t("欢迎来到这里") }}</div>
      <!-- <van-button round size="large" class="btn-top">
        <img src="@/assets/images/google-circle.png" class="btn-icon" />
        <span>{{ $t("使用 Google+ 登录") }}</span>
      </van-button>
      <div class="or-wapper">
        <span>{{ $t("或者") }}</span>
      </div> -->
      <van-form @submit="onSubmit" ref="formRef">
        <div v-if="system?.data.phone_bind == 2">
          <div class="input-label">{{ $t("邮箱") }}</div>
          <f-van-field name="username" :rules="emaliRules()" v-model="form.username" :placeholder="$t('输入邮箱')"
            :border="false" class="left-icon" :clearable="true"></f-van-field>
        </div>
        <div v-else-if="system?.data.phone_bind == 1">
          <div class="input-label">{{ $t("手机") }}</div>
          <f-van-field name="username" :rules="phoneRules()" v-model="form.username" :placeholder="$t('输入手机号码')"
            :border="false" class="left-icon" :clearable="true">
            <template #left-icon>+{{ system.idc_default }}</template>
          </f-van-field>
        </div>
        <div v-else>
          <van-tabs v-model:active="tabIndex" swipe-threshold background="transparent" class="tabs">
            <van-tab :title="$t(item.name)" v-for="item, index in tabList" :key="index"></van-tab>
          </van-tabs>
          <div class="input-label" v-if="tabIndex == 0">{{ $t("邮箱") }}</div>
          <f-van-field name="username" :rules="emaliRules()" v-model="form.username" v-if="tabIndex == 0"
            :placeholder="$t('输入邮箱')" :border="false" class="left-icon" :clearable="true"></f-van-field>
          <div class="input-label" v-if="tabIndex == 1">{{ $t("手机") }}</div>
          <f-van-field name="username" :rules="phoneRules()" v-model="form.username" v-if="tabIndex == 1"
            :placeholder="$t('输入手机号码')" :border="false" class="left-icon" :clearable="true">
            <template #left-icon>+{{ system.idc_default }}</template>
          </f-van-field>

        </div>



        <div class="input-label" v-if="system?.data.phone_check == 1">{{ $t("验证码") }}</div>
        <f-van-field class="input" v-if="system?.data.phone_check == 1" v-model="form.code"
          :rules="[{ required: true, message: $t('输入验证码') }]" :placeholder="$t('输入验证码')" :border="false"
          :clearable="true">
          <template #right-icon>
            <span class="time" @click="sendCode">{{ btnText }}</span>
          </template>
        </f-van-field>

        <div class="input-label">{{ $t("密码") }}</div>
        <f-van-field :rules="passwordRules()" v-model="form.password" type="password" :placeholder="$t('输入密码')"
          :border="false" :clearable="true" />

        <div class="input-label">{{ $t("推广码") }}</div>
        <f-van-field :disabled="!!share_code" v-model="form.rec_code" :placeholder="$t('输入推广码')" :border="false"
          :clearable="true" />
        <van-button round size="large" class="btn" native-type="submit" :loading="btnLoading">
          <span>{{ $t("注册") }}</span>
          <FSvg name="right" class="right-icon" />
        </van-button>
        <div class="reg">
          <span>{{ $t("已有账户？") }}</span>
          <span @click="$router.replace('/login')">{{ $t("去登陆") }}</span>
        </div>
      </van-form>
    </div>
    <foot-login />
  </div>
</template>

<script setup lang="ts">
import { login_captcha_api, login_register_api, recCode } from "@/api";
import type { Login_register_request_type } from "~/types/register";
import { emaliRules, passwordRules, phoneRules } from "@/utils/rules";
import { sendcode_mail_api, sendcode_index_api } from "@/api";
import jsBridge from "~/composables/jsBridge";
import { showToast } from "vant";
const nuxtApp = useNuxtApp();
const $router = useRouter();
const $route = useRoute();

const system = useSystem();
const tabIndex: Ref<0 | 1> = ref(0);
const formRef = ref();
const tabList = ref<{
  name: string
  account_type: 1 | 2
}[]>([]);

const share_code = ref("");

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

const form: Ref<Login_register_request_type> = ref({
  username: "",
  password: "",
  code_key: "",
  areacode: "",
  rec_code: "",
  acid: "",
  code: "",
  account_type: 1,
  device_type: deviceType.value,
});
const getCode = async () => {
  const res = await login_captcha_api();
  if (res?.code == 1) {
    form.value.code_key = res.data.key;
  }
};
const btnLoading = ref(false);
const onSubmit = async () => {
  btnLoading.value = true;
  form.value.account_type = tabList.value[tabIndex.value].account_type;
  form.value.areacode = system.value?.idc_default || "";
  await getCode();
  const res = await login_register_api(form.value);
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast(nuxtApp.$t("注册成功"));
    // useCookie("token").value = res.data.token;
    // useCookie("token_key").value = res.data.token_key;

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("token_key", res.data.token_key);
    nextTick(() => {
      useLoginStatus().value = true;
    });
    jsBridge.sendMessage("register");
    $router.replace("/");
  }
};

// 验证码
const sendCodePhone = async () => {
  const res = await sendcode_index_api({
    phone: form.value.username,
    qh: system.value?.idc_default || "",
    scene: "register",
  });
  return res;
};
const sendCodeMail = async () => {
  const res = await sendcode_mail_api({
    email: form.value.username,
    scene: "register",
  });
  return res;
};
const sendCode = async () => {
  const validate = await formRef.value.validate("username");
  if (validate) return;
  if (btnText.value != nuxtApp.$t("发送验证码")) return;
  initTimeBtnText();
  if (system.value?.data.phone_bind === 1) {
    await sendCodePhone();
  } else if (system.value?.data.phone_bind === 2) {
    await sendCodeMail();
  } else {
    await (tabIndex.value == 0 ? sendCodeMail : sendCodePhone)();
  }
};

const btnText: Ref<string> = ref(nuxtApp.$t("发送验证码"));
const timeId: Ref<NodeJS.Timeout | null> = ref(null);
const initTimeBtnText = () => {
  btnText.value = "60s";
  timeId.value = setInterval(() => {
    btnText.value = parseInt(btnText.value) - 1 + "s";
    if (parseInt(btnText.value) === 0) {
      timeId.value && clearInterval(timeId.value);
      btnText.value = nuxtApp.$t("发送验证码");
    }
  }, 1000);
};
onUnmounted(() => {
  timeId.value && clearInterval(timeId.value);
});
onMounted(async () => {
  nextTick(() => {
    if (system.value?.data.phone_bind === 1) {
      tabList.value = [{ name: "手机", account_type: 1 }];
      form.value.account_type = 1;
    } else if (system.value?.data.phone_bind === 2) {
      tabList.value = [{ name: "邮箱", account_type: 2 }];
      form.value.account_type = 2;
    } else {
      tabList.value = [{ name: "邮箱", account_type: 2 },
      { name: "手机", account_type: 1 }];
      form.value.account_type = tabList.value[tabIndex.value].account_type;
    }
  })

  let acid = localStorage.getItem('acid') || '';
  share_code.value = localStorage.getItem("share_code") || "";
  form.value.rec_code = share_code.value;
  if (acid) {
    form.value.acid = acid;
  }
  if (share_code.value) {
    const res = await recCode({ "rec_code": share_code.value, "acid": acid });
  }
});
</script>

<style scoped lang="less" src="@/assets/css/login.less"></style>