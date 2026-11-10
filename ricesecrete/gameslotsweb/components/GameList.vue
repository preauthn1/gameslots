<template>
  <div class="list-wapper">
    <GameItem v-for="item in props.list" :key="item.id" :data="item" />
  </div>
</template>

<script setup lang="ts">
import type { GameType } from "~/types";
const props = defineProps<{
  list: GameType[] | null;
}>();
</script>

<style scoped lang="less" src="@/assets/css/gameList.less"></style>