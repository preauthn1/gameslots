<template>
  <div>
    <NavBar></NavBar>
    <div class="container">
      <div class="desc">
        {{$t("本游戏适合 18 岁以上的成年人，仅供娱乐。社交游戏中的结果与现实生活中的结果之间没有必然联系。您可以免费享受游戏的乐趣，游戏中还包含可选购买内容。")}}
      </div>
      <div class="desc2">
        {{$t("下载游戏")}} <br>
        {{$t("并立即开始")}}
      </div>
      <van-button round size="large" class="btn" @click="downLoadApp">{{ $t(isInstall?"安装":"立即下载（3.7MB）") }}</van-button>
      <div class="bottom-desc">{{ $t("需要安卓4.4或以上版本") }}</div>
      <FSvg name="more" class="more-icon" />
    </div>
    <img src="@/assets/images/downLoad-bg.png" class="bg-img">

  </div>
</template>

<script setup lang="ts">
const system = useSystem();
const isInstall = ref(false);
const downLoadApp = () => {
  if (!system.value) return;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    if (isInstall.value) {
      location.href = "https://www.pgyer.com/app/getProvisionFile";
    } else {
      location.href = system.value.data.ios_download_url;
    }
    isInstall.value = !isInstall.value;
  } else {
    location.href = system.value.data.android_download_url;
  }
};
</script>

<style scoped lang="less" src="@/assets/css/downloadApp.less"></style>