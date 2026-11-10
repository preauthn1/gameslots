<template>
  <div>
    <NavBar :isGameList="true"></NavBar>
    <!-- 游戏分类 -->
    <van-tabs v-model:active="active" class="tabs" :before-change="changeTabs" :class="{ 'tabs-none': !t_id }"
      ref="tabs">
      <van-tab v-for="item, index in typeList" :key="index">
        <template #title>
          <div class="tab-item">
            <img :src="item.icon" class="tab-icon-old">
            <span>{{ $t(item.name) }}</span>
          </div>
        </template>
      </van-tab>
    </van-tabs>
    <div class="container">
      <div class="provider-name" v-if="$route.query.third_name">
        <span>{{ $t("游戏提供商") }}</span>
        <van-icon name="arrow" />
        <span>{{ $t($route?.query?.third_name) }}</span>
      </div>
      <GameList :list="gameList" class="game-list" />
      <!-- <div class="tip">显示 9 场比赛中的 9 场</div> -->
      <van-button class="full btn" size="small" @click="loadMore" :loading="btnLoading" v-if="isShowBtn">{{ $t("加载更多")
        }}</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gameGet_typeApi } from "~/api";
import { game_list_api } from "~/api_v2";
import type { gameGet_typeApiType, GameListApiType } from "~/types";
const $route = useRoute();
const $router = useRouter();
const t_id = parseInt($route.params.t_id as string) || "";
const tc_id = parseInt($route.params.tc_id as string) || "";
const tag = parseInt($route.params.tag as string) || "";
const tabs = ref();

// 获取游戏分类
const typeList: Ref<gameGet_typeApiType | null> = ref(null);
const active: Ref<number> = ref(0); // 注意active 组件默认值永远是0，通过css控制的样式
const getTypeList = async () => {
  const res = await gameGet_typeApi();
  if (res?.code == 1) {
    typeList.value = res.data;
    active.value = typeList.value.findIndex((item) => item.id == t_id);
  }
};
const gameList: Ref<GameListApiType | null> = ref(null);
const page = ref(1);
const isShowBtn = ref(true);
const getGameList = async () => {
  const res = await game_list_api({
    page: page.value,
    limit: 18,
    t_id,
    tc_id,
    tag,
  });
  if (res?.code == 1) {
    isShowBtn.value = res.data.length == 18;
    gameList.value =
      gameList.value && page.value != 1
        ? [...gameList.value, ...res.data]
        : res.data;
  }
};
const btnLoading = ref(false);
const loadMore = async () => {
  btnLoading.value = true;
  page.value++;
  await getGameList();
  btnLoading.value = false;
};
const changeTabs = (v: number) => {
  $router.replace({
    path: `/gameListOld/${typeList.value?.[v].id}/0/0`,
  });
};
await getTypeList();
await getGameList();
</script>

<style scoped lang="less" src="@/assets/css/gameListPage.less"></style>