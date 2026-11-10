<template>
  <div class="user-page tabbar-page">
    <NavBar :isTransparent="true"></NavBar>
    <img src="@/assets/images/user-bg.png" class="bg-img">
    <div class="container">
      <div class="header-wapper">
        <div class="header">
          <div class="user-wapper" @click="$router.push('/setting')">
            <img :src="userInfo?.head_img" class="avatar" />
            <div class="nickname-wapper">
              <div class="nickname">{{ userInfo?.phone || userInfo?.mail }}</div>
              <div class="id">UID: {{ userInfo?.id }}</div>
            </div>
            <van-icon name="arrow" />
          </div>
          <div class="price-wapper">
            <div class="price-item">
              <img src="@/assets/images/price-icon.png" class="price-icon">
              <div class="price-item-content">
                <div>{{ $t("余额") }}</div>
                <div class="price">{{ system?.data.monetary_type }}{{ $numInit(userInfo?.balance) }}</div>
              </div>
            </div>
            <div class="price-item">
              <div class="price-item-content">
                <div class="bouns-title-wapper">{{ $t("奖金") }}<van-icon name="question" class="question-icon"
                    @click="bounsQuestion.show()" /></div>
                <div class="price">{{ system?.data.monetary_type }}{{ $numInit(userInfo?.cjbalance) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="btn-wapper">
          <van-button size="small" class="btn" @click="$router.push('/deposit/deposit')">{{ $t("订金")
            }}</van-button>
          <van-button size="small" class="btn" @click="$router.push('/withdrawalnew')">{{ $t("去取出")
            }}</van-button>
          <!-- $router.push('/selectionOfWithdrawalChannels') -->
        </div>
        <!-- <div class="free-bet-wapper">
          <div class="free-bet-content" @click="$router.push('/free')">
            <div class="free-bet-title">{{ $t("免费投注") }}</div>
            <div class="free-bet-subtitle">{{ $t("查看您的免费投注") }}</div>
          </div>
          <van-icon name="arrow" />
        </div> -->
      </div>
      <div class="nav-wapper">
        <!-- 这段报错刚刚注释掉 -->
        <div class="nav-item" v-for="item, index in navList" :key="index" @click="$openLink(item.href)">
          <span class="nav-name">{{ $t(item.name) }}</span>
          <img :src="item.icon_url" v-if="item.icon_url" class="nav-icon">
          <van-icon name="arrow" class="nav-right" />
        </div>
      </div>
      <van-button class="full exit-btn" @click="exit">{{ $t("退出登录") }}</van-button>
    </div>
    <BounsQuestion ref="bounsQuestion" />
  </div>
</template>

<script setup lang="ts">
import { pwa } from "@/utils/pwa";
import jsBridge from "~/composables/jsBridge";
const { $t } = useNuxtApp();
const $router = useRouter();
const bounsQuestion = ref();
const userInfo = useUserInfo();
const system = useSystem();
const menuList = useMenuList();

// pwa 需要动态检测更改
const navList = computed(() => {
  return pwa.value
    ? menuList.value?.user_center_menu
    : menuList.value?.user_center_menu.filter(
      (item) => item.href != "bus-install"
    );
});

const exit = () => {
  showDialog({
    theme: "round-button",
    message: $t("您想要退出吗？"),
    showCancelButton: true,
    confirmButtonText: $t("确认"),
    cancelButtonText: $t("取消"),
  }).then(() => {
    // useCookie("token").value = "";
    // useCookie("token_key").value = "";

    localStorage.setItem("token", "");
    localStorage.setItem("token_key", "");
    useLoginStatus().value = false;
    jsBridge.sendMessage("logout");
    $router.push("/");
  });
};
</script>

<style scoped lang="less" src="@/assets/css/user.less"></style>