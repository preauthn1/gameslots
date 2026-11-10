<template>
  <div>
    <NavBar></NavBar>
    <div class="container">
      <div class="nav-item" @click="$router.push('/changePassword')">
        <span class="nav-name">{{ $t("更改密码") }}</span>
        <van-icon name="arrow" class="nav-right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="less" src="@/assets/css/setting.less"></style>