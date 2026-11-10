<template>
  <div class="" :class="{ 'header-wapper-download': showDownload, 'header-wapper': !showDownload }">
    <div class="" :class="{ 'header-content-download': showDownload, 'header-content': !showDownload }">
      <div v-if="showDownload" class="h-[60px]  flex bg-[#222] justify-between">
        <div class="ml-[10px] flex items-center">
          <img :src="system?.site?.website_mobile_logo" class="logo mt-[5px] flex-1">
          <div class="flex flex-col ml-[5px]">
            <span class="text-[12px]">{{ $t("下载获得₱88") }}</span>
          </div>
        </div>
        <div class="flex items-center">
          <van-button round class="btn mr-[5px]" size="small" @click="inStall">{{ $t("下载") }}</van-button>
          <van-button icon="cross" color="#222" round type="success" size="small" @click="emit('closeItem')" />
        </div>
      </div>
      <div class="flex items-center container">
        <FSvg name="menu" class="menu-icon" @click="showMenu" />
        <img :src="system?.site?.website_mobile_logo" class="logo">
        <template v-if="loginStatus">
          <img src="@/assets/images/user.png" class="user-icon">

          <span class="price flex">
            {{ system?.data.monetary_type }}
            <van-loading v-if="isLoad" color="#0cb646" size="20" />
            <p v-else>{{ $numInit(userInfo?.balance) }}</p>
          </span>
          <van-button round size="small" class="btn" @click="$router.push('/deposit/deposit')">{{ $t("充值")
            }}</van-button>
        </template>
        <template v-else>
          <van-button round size="small" class="btn btn-reg" @click="$router.push('/register')">{{ $t("注册")
            }}</van-button>
          <van-button round size="small" class="btn" @click="$router.push('/login')">{{ $t("登录") }}</van-button>
        </template>
      </div>

    </div>
  </div>
  <Menu ref="menuRef" />
</template>

<script setup>
import { toRef } from "vue"

const loginStatus = useLoginStatus();
const userInfo = useUserInfo();
const system = useSystem();
const menuRef = ref();
const showMenu = () => {
  menuRef.value.show();
};

const inStall = () => {
  $openLink('bus-install');
}


const props = defineProps({ loadBalance: { type: Boolean, default: true }, showDown: { type: Boolean, default: false } })
const isLoad = toRef(props, "loadBalance");
const showDownload = toRef(props, "showDown");
const emit = defineEmits(["closeItem"]);
</script>

<style scoped lang="less" src="@/assets/css/header.less"></style>