<template>
  <div class="error-box">
    <FSvg name="404" class="more-icon" size="100vw" v-if="props.error?.statusCode == 404" />
    <FSvg name="500" class="more-icon" size="100vw" v-if="props.error?.statusCode == 500" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object,
});
// eslint-disable-next-line no-console
console.error(props.error?.statusCode, props.error?.statusMessage);
</script>

<style scoped lang="less">
.error-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
}
</style>