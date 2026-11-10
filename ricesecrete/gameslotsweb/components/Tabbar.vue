<template>
  <div class="tabbar-box" v-show="isShow">
    <div class="tabbar-wapper">
      <div :class="['tabbar-item', $route.path == item.url ? 'tabbar-item-active' : '']" @click="$router.push(item.url)"
        v-for="item, index in urlList" :key="index">
        <img :src="item.icon" v-if="$route.path != item.url || !item.iconActive"
          :class="['tabbar-icon', index == 2 ? 'middle-icon' : '']" />
        <img :src="item.iconActive" v-else :class="['tabbar-icon', index == 2 ? 'middle-icon' : '']" />
        <span>{{ $t(item.name) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const $route = useRoute();
const urlList = [
  {
    name: "首页",
    iconActive: $require("shouye.png"),
    icon: $require("shou-7.png"),
    url: "/",
  },
  {
    name: "充值",
    iconActive: $require("qianbao.png"),
    icon: $require("recharge.png"),
    url: "/deposit/deposit",//$router.push(`/deposit/${item.id}?type=${type}`);
  },
  {
    name: "附属机构",
    icon: $require("tabbar-share.png"),
    url: "/affiliate/summary",
    hideTabbar: true,
  },
  {
    name: "活动",
    iconActive: $require("icon_actily_ac.png"),
    icon: $require("icon_actily.png"),
    // url: "/withdrawal",
    url: "/activity",
  },
  {
    name: "用户",
    iconActive: $require("yonghu.png"),
    icon: $require("wod2.png"),
    url: "/user",
  },
];
const isShow = computed(() => {
  return (
    urlList.findIndex(
      (item) => item.url === $route.path && !item.hideTabbar
    ) !== -1
  );
});
</script>
<style lang="less" src="@/assets/css/tabbar.less"></style>