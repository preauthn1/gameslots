<template>
  <div>
    <NavBar left-text="" :title="$t('会员-每月赚取 R$10000')"></NavBar>
    <van-tabs v-model:active="active" :ellipsis="false" :before-change="changeTabs">
      <van-tab :title="$t(item.name)" v-for="item, index in navList" :key="index"></van-tab>
    </van-tabs>
    <div class="container">
      <NuxtPage></NuxtPage>
    </div>
  </div>
</template>

<script setup lang="ts">
const $router = useRouter();
const $route = useRoute();
const navList: { name: string; url: string; type?: "push" | "replace" }[] = [
  { name: "控制版", url: "/affiliate/summary" },
  // { name: "参考", url: "/affiliate/referrals" },
  { name: "报告", url: "/affiliate/report" },
  // { name: "付款", url: "/affiliate/payments" },
  { name: "常问问题", url: "/affiliate/faq" },
  {
    name: "教程",
    url: "/commissionCalculationRules",
    type: "push",
  },
];
const active = ref(navList.findIndex((item) => item.url == $route.path));
if (active.value == -1) {
  active.value = 0;
}
const changeTabs = (v: number) => {
  $router[navList[v].type || "replace"](navList[v].url);
  return navList[v].type !== "push";
};
onActivated(() => {
  active.value = navList.findIndex((item) => item.url == $route.path);
});
</script>

<style scoped lang="less">
.container {
  padding-top: 15px;
  padding-bottom: 15px;
}
</style>