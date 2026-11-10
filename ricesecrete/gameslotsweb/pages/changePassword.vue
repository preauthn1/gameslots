<template>
  <div>
    <NavBar></NavBar>
    <div class="content-wapper">
      <div class="title">{{ $t("更改密码") }}</div>
      <van-form @submit="onSubmit">
        <f-van-field :rules="passwordRules()" class="input" v-model="form.old_password" type="password"
          :placeholder="$t('当前密码')" :border="false" :clearable="true"></f-van-field>
        <f-van-field :rules="passwordRules()" class="input" v-model="form.password" type="password"
          :placeholder="$t('新密码')" :border="false" :clearable="true" />
        <van-button round size="large" class="btn" native-type="submit" :loading="btnLoading">
          <span>{{ $t("改变") }}</span>
        </van-button>
        <NuxtLink class=" forget" v-if="serviceList?.length">
          <span @click="$openLink(serviceList[0]?.link, true)">{{ $t("我忘记了我的密码？") }}</span>
        </NuxtLink>
      </van-form>
    </div>
    <FootLogin />
  </div>
</template>

<script setup lang="ts">
import { my_editinfo_api } from "@/api";
import { passwordRules } from "@/utils/rules";
const { $t } = useNuxtApp();
const $router = useRouter();
const form = ref({
  password: "",
  old_password: "",
});

const btnLoading: Ref<boolean> = ref(false);
const onSubmit = async () => {
  btnLoading.value = true;
  const res = await my_editinfo_api(form.value);
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast($t("修改成功"));
  } else if (res?.code == 120) {
    $router.push({
      path: "/changePasswordVerification",
      query: {
        ...form.value,
      },
    });
  }
};
import {
  serviceList as serviceListApi
} from "@/api";
import type {
  serviceListType
} from "~/types";
// 获取客服列表
const serviceList: Ref<serviceListType | null> = ref(null);
const getServiceList = async () => {
  const res = await serviceListApi();
  if (res?.code == 1) {
    serviceList.value = res.data;
  }
};
await getServiceList()
</script>

<style scoped lang="less" src="@/assets/css/changePassword.less"></style>