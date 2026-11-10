<template>
  <van-popup v-model:show="cookiesAccepted" position="bottom" class="pop" z-index="2002" :close-on-click-overlay="false">
    <div class="pop-content">
      <div class="desc">{{ $t("本网站使用Cookies来确保您在我们的网站上获得最佳体验。") }}</div>
      <van-button round class="btn" @click="acceptCookies">{{ $t('接受所有cookie') }}</van-button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
const cookiesAccepted = ref<boolean>(false);

onMounted(() => {
  cookiesAccepted.value = localStorage.getItem("cookies_accepted") !== "true";
});

const acceptCookies = () => {
  // 设置名为 'cookies_accepted' 的本地存储标志
  localStorage.setItem("cookies_accepted", "true");
  cookiesAccepted.value = false;
};
</script>

<style lang="less" scoped>
.pop {
  --van-popup-background: var(--base-text-color);
  color: var(--page-bg-color);
}
.pop-content {
  padding: 20px;
}
.desc {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}
.btn {
  display: block;
  margin-left: auto;
}
</style>