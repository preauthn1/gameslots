<template>
  <div>
    <NavBar left-text="" title="免费投注"></NavBar>
    <van-tabs v-model:active="active" shrink>
      <van-tab title="有效的">
        <div class="container">
          <FEmpty />
        </div>
      </van-tab>
      <van-tab title="已使用/已过期">
        <div class="container">
          内容 2
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="less"></style>