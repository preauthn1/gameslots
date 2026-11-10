<template>
  <div>
    <NavBar left-text="" title="账变记录"></NavBar>
    <van-tabs v-model:active="active">
      <van-tab :title="$t(item.name)" v-for="item,index in type" :key="index"></van-tab>
    </van-tabs>
    <div class="container">
      <FEmpty v-if="finished && list.length==0" />
      <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('没有更多了')" :loading-text="$t('加载中...')" @load="onLoad">
        <div class="card" v-for="item in list" :key="item.id">
          <div class="row">
            <span class="card-title">{{ $t(item.child_type) }}</span>
            <span>{{ system?.data.monetary_type }}{{ $numInit(item.price) }}</span>
          </div>
          <div class="row">
            <span>{{ item.add_time }}</span>
          </div>
        </div>
      </van-list>

    </div>
  </div>
</template>

<script setup lang="ts">
import { my_balanceRecord_api } from "@/api/my";
import type { My_balanceRecord_api_type } from "~/types/my";
const system = useSystem();
const active = ref(0);
const type: Ref<{ name: string; type: string }[]> = ref([
  { name: "全部", type: "all" },
]);
const list: Ref<My_balanceRecord_api_type> = ref([]);
const params = {
  page: 1,
  limit: 20,
};
const getData = async () => {
  const res = await my_balanceRecord_api({
    ...params,
    type: type.value[active.value].type,
  });
  if (res?.code == 1) {
    type.value = [
      { name: "全部", type: "all" },
      ...Object.entries(res.type).map((item) => ({
        name: item[1],
        type: item[0],
      })),
    ];
    if (res.data.length < params.limit) {
      finished.value = true;
    }
    list.value = [...list.value, ...res.data];
  }
};
watch(active, async () => {
  params.page = 1;
  list.value = [];
  finished.value = false;
  loading.value = true;
  await getData();
  loading.value = false;
});

// 加载更多
const loading = ref(false);
const finished = ref(false);
const onLoad = async () => {
  params.page++;
  await getData();
  loading.value = false;
};

await getData();
</script>

<style scoped lang="less" src="@/assets/css/transactions.less"></style>