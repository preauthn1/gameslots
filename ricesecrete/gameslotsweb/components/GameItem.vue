<template>
  <div class="game-itme" @click="showGamePop">
    <div class="item-content">
      <FImg :src="props.data.icon" class="cover" fit="cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameType } from "~/types";

const { $bus } = useNuxtApp();
const props = defineProps<{
  data: GameType;
}>();
const showGamePop = () => {
  $bus.emit("gamePop", props.data);
};
</script>

<style scoped lang="less" src="@/assets/css/gameItem.less">
</style>