<template>
  <van-popup v-model:show="isShow" position="left" class="pop">
    <div class="pop-content">
      <div class="flex justify-end items-center">
        <img :src="system?.site?.website_mobile_logo" class="logo">
        <van-icon name="cross" class="close-icon" @click="isShow = !isShow" />
      </div>
      <!-- tab标签 -->
      <!-- <van-tabs v-model:active="active" class="van-tab-btn"> -->
      <!-- <van-tab>
          <template #title>
            <img :src="$require('menu-icon1.png')" class="tab-icon">
            <span class="tab-title">{{ $t("赌场") }}</span>
          </template>
</van-tab> -->
      <!-- <van-tab>
          <template #title>
            <img :src="$require('menu-icon2.png')" class="tab-icon">
            <img :src="$require('hot-icon.png')" class="hot-icon">
            <span class="tab-title">{{ $t("运动") }}</span>
          </template>
        </van-tab> -->
      <!--  </van-tabs> -->

      <div class="flex flex-col flex-wrap gap-1 mt-15px">
        <div class="rounded  p-.2rem center space-x-10px flex-1" v-for="item, index in menuList?.left_menu_casino"
          :key="index" @click="$openLink(item.href)">
          <img :src="item.icon_url" class="size-17px object-contain">
          <span class="flex-1">{{ $t(item.name) }}</span>
          <van-button size="mini" round v-if="item.icon == 'btn_install'" class="right-btn">{{ $t("安装") }}</van-button>
        </div>
      </div>

      <div class="flex flex-col rounded mt-10px p-1 bg-zinc-8 divide-y-1 divide-x-none divide-zinc-9 ">
        <div class="menu-item" v-for="item, index in menuList?.left_menu_support" :key="index"
          @click="$openLink(item.href)">
          <img :src="item.icon_url" class="menu-item-icon">
          <span class="menu-item-title">{{ $t(item.name) }}</span>
        </div>
      </div>

      <div class="rounded bg-zinc-8 p-.4rem mt-10px mb-10px">
        <div class="font-bold rounded-t from-#0cb646 to-#78e822 mb-1 border-lime-6">
          {{ $t("加入我们的社区") }}
        </div>
        <div class="mb-20px flex flex-nowrap justify-start">
          <img :src="item.icon_url" class="share-icon" v-for="item, index in menuList?.left_menu_join" :key="index"
            @click="$openLink(item.href, true)">
        </div>
        <div class="font-bold text-16px mb-5px">{{ $t("支持") }}</div>
        <div class="text-#c2c2c2 text-14px pt-5px pb-10px border-y border-x-none border-solid !border-zinc-9">
          {{ $t("通过致电或访问我们的帮助中心获取帮助") }}
        </div>
      </div>

    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { V2_index_menu_item_api_type } from "~/types/menu";
import { pwa } from "@/utils/pwa";
const system = useSystem();
const isShow: Ref<boolean> = ref(false);
const menuList = useMenuList();
const active = ref(0);
// const isShowSubMenu: Ref<boolean> = ref(true);

const filterPwa = (list: V2_index_menu_item_api_type[] | undefined) => {
  if (!list) return [];
  if (!pwa.value) return list.filter((item) => item.href != "bus-install");
  return list;
};

const show = () => {
  isShow.value = true;
};
defineExpose({ show });
</script>

<style scoped lang="less" src="@/assets/css/menu.less"></style>