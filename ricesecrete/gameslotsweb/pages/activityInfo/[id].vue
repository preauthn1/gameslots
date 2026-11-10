<template>
  <div>
    <NavBar leftText="" :title="actionDetail?.c_title"></NavBar>
    <div class="container">
      <!-- <img :src="actionDetail?.c_img" class="cover"> -->
      <div class="html" v-html="actionDetail?.c_detail"></div>
      <van-button round size="small" class="btn full" @click="$openLink(actionDetail?.jump_url)"
        v-if="actionDetail?.jump_url">
        <span>{{ $t("细节") }}</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Action_list_api_type } from "~/types/action";
import { action_detail_api } from "@/api/action";
const actionDetail: Ref<Action_list_api_type | null> = ref(null);
const getData = async () => {
  const res = await action_detail_api({
    action_id: useRoute().params.id as string,
  });
  if (res?.code == 1) {
    actionDetail.value = res.data;
  }
};
await getData();
</script>

<style scoped lang="less" src="@/assets/css/activityInfo.less"></style>