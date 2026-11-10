<template>
  <div>
    <NavBar :title="data?.type_text"></NavBar>
    <div class="container">
      <div class="html" v-html="data?.content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v2_rule_index_detail_api } from "@/api_v2/rule";
import type { Rule_params, V2_rule_index_detail_api_type } from "~/types/rule";

const $route = useRoute();
const data: Ref<V2_rule_index_detail_api_type | null> = ref(null);
const getData = async () => {
  if (!$route.params.type) return;
  const res = await v2_rule_index_detail_api({
    type: Number($route.params.type as string),
  } as Rule_params);
  if (res?.code == 1) {
    data.value = res.data;
  }
};
await getData();
</script>

<style scoped lang="less" src="@/assets/css/rule.less"></style>