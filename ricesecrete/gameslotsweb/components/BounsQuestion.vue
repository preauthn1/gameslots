<template>
  <!-- 左侧弹出 -->
  <van-popup v-model:show="isShow" round :closeable="true">
    <div class="wapper">
      <div class="title">{{ $t("奖金条款") }}</div>
      <div class="content html" v-html="rule?.content"></div>
      <div class="loading-wapper" v-if="isLoading">
        <van-loading size="12" class="loading" />
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { v2_rule_index_detail_api } from "@/api_v2/rule";
import type { V2_rule_index_detail_api_type } from "~/types/rule";
const isShow: Ref<boolean> = ref(false);
const isLoading = ref(false);
const show = () => {
  if (!rule.value) getRule();
  isShow.value = true;
};
defineExpose({ show });

const rule: Ref<V2_rule_index_detail_api_type | null> = ref(null);
const getRule = async () => {
  isLoading.value = true;
  const res = await v2_rule_index_detail_api({ type: 11 });
  isLoading.value = false;
  if (res?.code == 1) {
    rule.value = res.data;
  }
};
</script>

<style scoped lang="less" src="@/assets/css/bounsQuestion.less"></style>