<template>
  <div class="container">
    <van-search :placeholder="$t('搜索游戏或服务商')" :clearable="false" show-action @search="search" v-model="keywords">
      <template #action>
        <div @click="$router.replace('/')">{{ $t("取消") }}</div>
      </template>
    </van-search>
    <div class="tips">{{ $t("搜索至少需要3个字符") }}</div>

    <div class="history-title-box" v-if="historyList.length">
      <span>{{ $t("搜索历史记录") }}</span>
      <FSvg name="delete" class="delete-icon" @click="deleteHistory('all')" />
    </div>
    <div class="history-list" v-if="historyList.length">
      <div class="history-item" v-for="item, index in historyList" :key="index" @click="tabHistory(item)">
        <span class="history-item-text">{{ item }}</span>
        <FSvg name="cha" class="cha-icon" @click.stop="deleteHistory(index)" />
      </div>
    </div>

    <div class="recommend-title" v-if="searchGames?.length">
      {{ $t("游戏： 我们找到 {keywords} 的 {length} 个结果", { keywords: submitKeywords, length: searchGames?.length }) }}</div>
    <GameList v-if="searchGames?.length" :list="searchGames" class="game-list" />

    <div class="recommend-title">{{ $t("推荐游戏") }}</div>
    <GameList v-if="recommendGames?.length" :list="recommendGames" class="game-list" />
    <FEmpty v-else />
  </div>
</template>

<script setup lang="ts">
import { game_list_api } from "~/api";
import type { GameListApiType } from "~/types";

// 搜索历史
const historyList: Ref<string[]> = ref([]);
const addHistory = (keyword: string) => {
  const i = historyList.value.findIndex((item) => item == keyword);
  if (i != -1) {
    historyList.value.splice(i, 1);
  } else {
    if (historyList.value.length >= 6) {
      historyList.value.pop();
    }
  }
  historyList.value.unshift(keyword);
  localStorage.setItem("searchHistoryList", JSON.stringify(historyList.value));
};
const deleteHistory = (index: "all" | number) => {
  if (index == "all") {
    historyList.value = [];
  } else {
    historyList.value.splice(index, 1);
  }
  localStorage.setItem("searchHistoryList", JSON.stringify(historyList.value));
};
const tabHistory = (key: string) => {
  keywords.value = key;
  search();
};

// 搜索
const searchGames: Ref<GameListApiType | null> = ref(null);
const keywords: Ref<string> = ref("");
const submitKeywords: Ref<string> = ref("");
const search = async () => {
  const keywordsNew = keywords.value.trim();
  if (keywordsNew.length < 3) return;
  const res = await game_list_api({
    page: 1,
    limit: 18,
    keywords: keywordsNew,
  });
  if (res?.code == 1 && res.data.length) {
    addHistory(keywordsNew);
    submitKeywords.value = keywordsNew;
    searchGames.value = res.data;
  }
};

// 推荐游戏
const recommendGames: Ref<GameListApiType | null> = ref(null);
const getRecommendGames = async () => {
  const res = await game_list_api({
    page: 1,
    limit: 9,
    hot: 1,
  });
  if (res?.code == 1) {
    recommendGames.value = res.data;
  }
};
await getRecommendGames();

onMounted(() => {
  const searchHistoryListStr = localStorage.getItem("searchHistoryList");
  if (searchHistoryListStr) {
    historyList.value = JSON.parse(searchHistoryListStr).slice(0, 6);
  }
});
</script>

<style scoped lang="less" src="@/assets/css/searchGame.less"></style>