<template>
  <div class="flex flex-col h-screen">
    <NavBar :title="titleName" :isGameList="true"></NavBar>

    <div class="mt-[8px] ml-[10px] mr-[10px]">
      <van-search :placeholder="$t('搜索游戏或服务商')" @search="search" v-model="keywordString">
      </van-search>
    </div>

    <div class="flex flex-1 overflow-hidden mt-[10px]">
      <div class="w-[20%] overflow-y-auto">
        <van-sidebar v-model="active" @change="changeTabs">
          <van-sidebar-item title="标签名 1" v-for="(item, index) in typeList" :key="index">
            <template #title>
              <div class="flex flex-col items-center w-full">
                <img :src="item.icon" class="tab-icon">
                <span class="text-center text-[10px]">{{ $t(item.name) }}</span>
              </div>
            </template>
          </van-sidebar-item>
        </van-sidebar>
      </div>
      <div class="flex flex-col flex-1">
        <div class="flex-1 overflow-y-auto" id="gameList">
          <!-- <GameList :list="gameList" class="game-list ml-[10px] mr-[10px]" /> -->
          <!-- <van-swipe class="game-swipe" :show-indicators="false" ref="gameSwiper">
            <van-swipe-item v-for="list, idx in initGameList(gameList || [])" :key="idx">
              
            </van-swipe-item>
          </van-swipe> -->
          <GameList :list="gameList" class="game-list ml-[10px] mr-[10px]" />
        </div>
        <div class="h-[60px]" v-if="isShowBtn">
          <van-pagination v-model="page" :page-count="totlePage" force-ellipses :show-page-size="3" prev-text="<"
            next-text=">" class="mt-[10px]" @change="changePage" />
        </div>
      </div>

    </div>

    <!-- 游戏分类 -->
    <!-- <van-tabs v-model:active="active" class="tabs" :before-change="changeTabs" :class="{ 'tabs-none': !t_id }"
      ref="tabs">
      <van-tab v-for="item, index in typeList" :key="index">
        <template #title>
          <div class="tab-item">
            <img :src="item.icon" class="tab-icon">
            <span>{{ $t(item.name) }}</span>
          </div>
        </template>
</van-tab>
</van-tabs> -->
    <!-- <div class="container">
      <div class="provider-name" v-if="$route.query.third_name">
        <span>{{ $t("游戏提供商") }}</span>
        <van-icon name="arrow" />
        <span>{{ $t($route?.query?.third_name) }}</span>
      </div>
      <GameList :list="gameList" class="game-list" /> -->
    <!-- <div class="tip">显示 9 场比赛中的 9 场</div> -->
    <!-- <van-button class="full btn" size="small" @click="loadMore" :loading="btnLoading" v-if="isShowBtn">{{ $t("加载更多")
        }}</van-button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { gameGet_typeApi, gameGet_typeApiv2 } from "~/api";
import { game_list_api } from "~/api_v2";
import type { gameGet_typeApiType, GameListApiType, GameType } from "~/types";
const $route = useRoute();
const $router = useRouter();
const t_id = parseInt($route.params.t_id as string) || "";
let tc_id = parseInt($route.params.tc_id as string) || "";
const tag = parseInt($route.params.tag as string) || "";
let type_name = ref("");
const tabs = ref();

const activeKey = ref(0);
const titleName = ref('');

// 获取游戏分类
const typeList: Ref<gameGet_typeApiType | null> = ref(null);
const active: Ref<number> = ref(0); // 注意active 组件默认值永远是0，通过css控制的样式
const getTypeList = async () => {

  const res = await gameGet_typeApi();
  if (res?.code == 1) {
    typeList.value = res.data;
    console.log(typeList.value.findIndex((item) => item.id == t_id));
    active.value = typeList.value.findIndex((item) => item.id == t_id);
  } else {
    console.log("接口报错了")
  }
};
const getTypeListv2 = async () => {
  const res = await gameGet_typeApiv2({ type_id: t_id });
  if (res?.code == 1) {
    typeList.value = res.data;
    active.value = 0;
    tc_id = typeList.value[0].id.toString();
    titleName.value = typeList.value[0].name;
  } else {
    console.log("接口报错了")
  }
  await getGameList();
};
const gameList: Ref<GameListApiType | null> = ref(null);
const page = ref(1);
const isShowBtn = ref(true);
const totlePage = ref(1);
const keywordString = ref("");
const getGameList = async () => {
  const res = await game_list_api({
    page: page.value,
    limit: 30,
    t_id,
    tc_id,
    keywords: keywordString.value,
    tag
  });
  if (res?.code == 1) {
    gameList.value = res.data;
    // gameList.value && page.value != 1
    //   ? [...gameList.value, ...res.data]
    //   : res.data;
    const total = (res as any).total || 0; // Ensure total is defined
    if (total > 30) {
      totlePage.value = Math.ceil(total / 30);
      console.log(totlePage.value);
      isShowBtn.value = true;
    } else {
      isShowBtn.value = false;
    }
    const contentWrapper = document.getElementById('gameList');
    if (contentWrapper) {
      contentWrapper.scrollTop = 0;
    }
  }
};
const search = () => {
  page.value = 1;
  getGameList();
}
const changePage = (v: number) => {
  console.log(v);
  page.value = v;
  getGameList();
};
const btnLoading = ref(false);
const loadMore = async () => {
  btnLoading.value = true;
  page.value++;
  await getGameList();
  btnLoading.value = false;
};
const changeTabs = async (v: number) => {
  if (typeList.value) {
    tc_id = typeList.value[v].id.toString();
    page.value = 1;
    keywordString.value = "";
  }
  await getGameList();
  // $router.replace({
  //   path: `/gameList/${typeList.value?.[v].id}/0/0`,
  // });
};

// 格式化游戏
const initGameList = (list: GameType[], size: number = 30) => {
  const result: GameType[][] = [];
  for (let i = 0; i < list.length; i += size) {
    result.push(list.slice(i, i + size));
  }
  return result;
};

// await getTypeList();
await getTypeListv2();
</script>

<style scoped lang="less" src="@/assets/css/gameListPage.less"></style>