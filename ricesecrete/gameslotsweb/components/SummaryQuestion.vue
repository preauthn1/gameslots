<template>
  <!-- 左侧弹出 -->
  <van-popup v-model:show="isShow" round :closeable="true">
    <div class="wapper">
      <div class="title">{{ $t("定义") }}</div>
      <div class="content">
        <div class="html" v-html="props.data"></div>
        <p style="color:var(--text-color6);margin-top:15px">{{ $t("注意：今日数据每天更新一次") }}</p>
      </div>

    </div>
  </van-popup>
</template>

<script setup lang="ts">
const isShow: Ref<boolean> = ref(false);
const show = () => {
  isShow.value = true;
};
defineExpose({ show });
const props = defineProps({
  data: String,
});
</script>

<style scoped lang="less" src="@/assets/css/bounsQuestion.less"></style>