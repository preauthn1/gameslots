<template>
  <div>
    <NavBar></NavBar>
    <div class="content-wapper">
      <div class="title">{{ $t("输入验证密码重置你的密码！") }}</div>
      <div class="sub-title" v-if="$route.query.account_type == 2">{{ $t("验证密码已发送至您邮箱") }}{{ $route.query.email }}</div>
      <div class="sub-title" v-else>{{ $t("验证密码已发送至您手机") }}{{ $route.query.phone }}</div>
      <van-form @submit="onSubmit">
        <f-van-field :rules="passwordRules()" class="input" v-model="form.password" type="password"
          :placeholder="$t('新密码')" :border="false" :clearable="true" />
        <f-van-field v-if="$route.account_type == 2" class="input" v-model="form.mail_code"
          :rules="[{ required: true, message: $t('输入验证码') }]" :placeholder="$t('输入验证码')" :border="false"
          :clearable="true">
          <template #right-icon>
            <span class="time" @click="sendCode">{{ btnText }}</span>
          </template>
        </f-van-field>
        <f-van-field v-else class="input" v-model="form.code" :rules="[{ required: true, message: $t('输入验证码') }]"
          :placeholder="$t('输入验证码')" :border="false" :clearable="true">
          <template #right-icon>
            <span class="time" @click="sendCode">{{ btnText }}</span>
          </template>
        </f-van-field>
        <van-button round size="large" class="btn" native-type="submit" :loading="btnLoading">{{ $t("完成")
          }}</van-button>
      </van-form>
    </div>
    <FootLogin />
  </div>
</template>

<script setup lang="ts">
import { passwordRules } from "@/utils/rules";
import {
  sendcode_mail_api,
  sendcode_index_api,
  forget_mail_api,
  forget_pwd_api,
} from "@/api";
import { showNotify } from "vant";
const system = useSystem();

const { $t } = useNuxtApp();
const nuxtApp = useNuxtApp();
const $route = useRoute();
const $router = useRouter();
const sendCodePhone = async () => {
  const res = await sendcode_index_api({
    phone: $route.query.phone as string,
    qh: system.value?.idc_default || "",
    scene: "forget",
  });
  return res;
};
const sendCodeMail = async () => {
  const res = await sendcode_mail_api({
    email: $route.query.email as string,
    scene: "forget",
  });
  return res;
};
const form = ref({
  password: "",
  code: "",
  phone: $route.query.phone as string,
  mail: $route.query.email as string,
  mail_code: "",
});
const sendCode = async () => {
  if (btnText.value != nuxtApp.$t("发送验证码")) {
    return;
  }
  initTimeBtnText();
  await ($route.query.account_type === "2" ? sendCodeMail : sendCodePhone)();
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

const forgetMail = async () => {
  return await forget_mail_api({
    mail: form.value.mail,
    mail_code: form.value.mail_code,
    password: form.value.password,
  });
};
const forgetPwd = async () => {
  return await forget_pwd_api({
    phone: form.value.phone,
    code: form.value.code,
    password: form.value.password,
  });
};
const btnLoading: Ref<boolean> = ref(false);
const onSubmit = async () => {
  btnLoading.value = true;
  const res = await ($route.query.account_type === "2"
    ? forgetMail
    : forgetPwd)();
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast($t("修改成功"));
    $router.go(-2);
  } else {
    showNotify({ type: "danger", message: res?.msg });
  }
};

onActivated(() => {
  initTimeBtnText();
});
onUnmounted(() => {
  timeId.value && clearInterval(timeId.value);
});
</script>

<style scoped lang="less" src="@/assets/css/verification.less"></style>