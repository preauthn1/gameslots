<template>
  <div>
    <NavBar></NavBar>
    <div class="content-wapper">
      <div class="title">{{ $t("输入验证密码更改你的密码！") }}</div>
      <div class="sub-title" v-if="userInfo?.mail2">{{ $t("验证密码已发送至您邮箱") }}{{ userInfo?.mail2 }}</div>
      <div class="sub-title" v-else-if="userInfo?.yphone">{{ $t("验证密码已发送至您手机") }}{{ userInfo?.yphone }}</div>
      <van-form @submit="onSubmit">
        <f-van-field class="input" v-model="code" :rules="[{ required: true, message: $t('输入验证码') }]"
          :placeholder="$t('输入验证码')" :border="false" :clearable="true">
          <template #right-icon>
            <span class="time" @click="sendCode">{{ btnText }}</span>
          </template>
        </f-van-field>
        <van-button round size="large" class="btn" native-type="submit" :loading="btnLoading">{{ $t("去完成")
          }}</van-button>
      </van-form>
    </div>
    <FootLogin />
  </div>
</template>

<script setup lang="ts">
const userInfo = useUserInfo();
import { sendcode_mail_api, sendcode_index_api } from "@/api";
import { showNotify } from "vant";
import { my_editinfo_api } from "@/api";
const { $t } = useNuxtApp();
const nuxtApp = useNuxtApp();
const $route = useRoute();
const $router = useRouter();
const sendCodePhone = async () => {
  if (userInfo.value) {
    const res = await sendcode_index_api({
      phone: userInfo.value.phone,
      qh: userInfo.value.qh,
      scene: "verify",
    });
    return res;
  }
};
const sendCodeMail = async () => {
  if (userInfo.value) {
    const res = await sendcode_mail_api({
      email: userInfo.value.mail,
      scene: "verify",
    });
    return res;
  }
};

const sendCode = async () => {
  if (btnText.value != nuxtApp.$t("发送验证码")) {
    return;
  }
  initTimeBtnText();
  await (userInfo.value?.mail2 ? sendCodeMail : sendCodePhone)();
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

const code = ref("");
const btnLoading: Ref<boolean> = ref(false);
const onSubmit = async () => {
  btnLoading.value = true;
  const res = await my_editinfo_api({
    password: $route.query.password as string,
    old_password: $route.query.old_password as string,
    code: userInfo.value?.phone ? code.value : "",
    mail_code: userInfo.value?.mail ? code.value : "",
  });
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast($t("修改成功"));
    $router.go(-2);
  } else {
    showNotify({ type: "danger", message: res?.msg });
  }
};

onActivated(() => {
  sendCode();
});
onUnmounted(() => {
  timeId.value && clearInterval(timeId.value);
});
</script>

<style scoped lang="less" src="@/assets/css/verification.less"></style>