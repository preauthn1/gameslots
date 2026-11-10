<template>
  <div>
    <NavBar></NavBar>
    <div class="content-wapper">
      <div class="title">{{ $t("找到您的账户") }}</div>
      <div class="sub-title">{{ $t("输入您的手机号码/邮箱以搜索您的帐户。") }}</div>
      <van-tabs v-model:active="tabIndex" swipe-threshold background="transparent" class="tabs">
        <van-tab :title="$t(item.name)" v-for="item, index in tabList" :key="index"></van-tab>
      </van-tabs>
      <van-form @submit="onSubmit">
        <f-van-field :rules="emaliRules()" class="input" v-if="tabIndex == 0" v-model="email" :placeholder="$t('输入邮箱')"
          :border="false" :clearable="true"></f-van-field>
        <f-van-field :rules="phoneRules()" class="input" v-else v-model="phone" :placeholder="$t('输入手机号码')"
          :border="false" :clearable="true">
          <template #left-icon>+{{ system?.idc_default }}</template>
        </f-van-field>
        <van-button round size="large" class="btn" native-type="submit" :loading="btnLoading">{{ $t("继续")
          }}</van-button>
      </van-form>
    </div>
    <FootLogin />
  </div>
</template>

<script setup lang="ts">
import { emaliRules, phoneRules } from "@/utils/rules";
import { sendcode_mail_api, sendcode_index_api } from "@/api";

const $router = useRouter();
const system = useSystem();
const tabIndex: Ref<0 | 1> = ref(0);
const tabList: { name: string; account_type: 1 | 2 }[] = [
  { name: "邮箱", account_type: 2 },
  /* { name: "手机", account_type: 1 }, */
];
const email = ref("");
const phone = ref("");
const sendCodePhone = async () => {
  const res = await sendcode_index_api({
    phone: phone.value,
    qh: system.value?.idc_default || "",
    scene: "forget",
  });
  return res;
};
const sendCodeMail = async () => {
  const res = await sendcode_mail_api({
    email: email.value,
    scene: "forget",
  });
  return res;
};
const btnLoading: Ref<boolean> = ref(false);
const onSubmit = async () => {
  btnLoading.value = true;
  const res = await (tabIndex.value == 0 ? sendCodeMail : sendCodePhone)();
  btnLoading.value = false;
  if (res?.code == 1) {
    $router.push({
      path: "/verification",
      query: {
        email: email.value,
        phone: phone.value,
        account_type: tabList[tabIndex.value].account_type,
      },
    });
  }
};
</script>

<style scoped lang="less" src="@/assets/css/resetPhone.less"></style>