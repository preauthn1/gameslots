<template>
  <div>
    <FEmpty v-if="finished && list.length == 0" />
    <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('没有更多了')"
      :loading-text="$t('加载中...')" @load="onLoad">
      <div class="tabel">
        <div class="tabel-header">
          <div class="tabel-col">{{ $t("日期") }}</div>
          <div class="tabel-col">{{ $t("注册") }}({{ system?.data.monetary_type }})</div>
          <div class="tabel-col">{{ $t("有效投注") }}</div>
          <div class="tabel-col">{{ $t("委员会") }}</div>
          <div class="tabel-col">{{ $t("委员会") }}</div>
        </div>
        <div class="tabel-body" v-for="item, index in list" :key="index">
          <div class="tabel-col">{{ item.day }}</div>
          <div class="tabel-col">{{ item.register }}</div>
          <div class="tabel-col">{{ system?.data.monetary_type }}{{ $numInit(item.bet) }}</div>
          <div class="tabel-col">{{ item.team }}</div>
          <div class="tabel-col">{{ item.team }}</div>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { v2_affiliate_report_api } from "~/api_v2/affiliate";
import type { V2_affiliate_report_api_type } from "~/types/affiliate";
const system = useSystem();
const loading = ref(false);
const finished = ref(false);
const onLoad = async () => {
  query.page++;
  await getList();
  loading.value = false;
};

const query = {
  page: 1,
  limit: 50,
};
const list: Ref<V2_affiliate_report_api_type> = ref([]);
const getList = async () => {
  const res = await v2_affiliate_report_api(query);
  if (res?.code == 1) {
    if (res.data.length < query.limit) {
      finished.value = true;
    }
    list.value = [...list.value, ...res.data];
  }
};
await getList();
</script>

<style scoped lang="less">
.tabel {
  margin-top: -10px;
  font-size: 12px;
}
</style>