<template>
  <div>
    <div class="tabel" v-if="true">
      <div class="tabel-header">
        <div class="tabel-col">{{ $t("日期") }}</div>
        <div class="tabel-col">{{ $t("细节") }}</div>
        <div class="tabel-col">{{ $t("委员会") }}</div>
        <div class="tabel-col">{{ $t("地位") }}</div>
      </div>
      <div class="tabel-body" v-for="item,index in 5" :key="index">
        <div class="tabel-col">1</div>
        <div class="tabel-col">0</div>
        <div class="tabel-col">13%</div>
        <div class="tabel-col">13%</div>
      </div>
    </div>
    <FEmpty v-else />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="less">
.tabel {
  margin-top: -10px;
  font-size: 12px;
}
</style>