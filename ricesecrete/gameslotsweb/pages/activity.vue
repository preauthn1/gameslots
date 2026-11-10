<template>
  <div>
    <NavBar leftText="" :title="$t('促销活动')"></NavBar>
    <div class="container">
      <div class="activity-wapper" v-for="item, index in actionList" :key="index" @click="jumpTo(item)">
        <img :src="item.c_img">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { action_list_api } from "@/api/action";
import type { Action_list_api_type } from "~/types/action";
const actionList: Ref<Action_list_api_type[] | null> = ref(null);
const getActionList = async () => {
  const res = await action_list_api({ page: 1, limit: 40 });
  if (res?.code == 1) {
    actionList.value = res.data;
  }
};
await getActionList();

const $router = useRouter();
const jumpTo = (el: Action_list_api_type) => {
  if (el.jump_url) {
    if (el.jump_url.startsWith("http")) {
      window.open(el.jump_url);
    } else {
      $router.push(el.jump_url)
    }
  }
  else {
    $router.push(`/activityInfo/${el.id}`)
  }
}
</script>

<style scoped lang="less" src="@/assets/css/activity.less"></style>