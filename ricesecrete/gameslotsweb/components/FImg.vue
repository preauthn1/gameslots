<template>
  <van-image v-bind="$attrs" @load="load" :class="isFinish?'load':''">
    <template v-slot:loading>
      <van-loading size="20" color="var(--van-image-loading-icon-color)" />
    </template>
  </van-image>
</template>

<script setup lang="ts">
const isFinish = ref(false);
const load = () => {
  isFinish.value = true;
};
</script>

<style scoped lang="less">
.load {
  :deep(.van-image__img) {
    animation: show 1s;
  }
}
@keyframes show {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.game-icon {
  font-size: 50px;
}
</style>