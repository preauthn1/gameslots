<template>
  <div>
  </div>
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loading: Ref<boolean> = ref(false);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
</script>

<style>
.loading {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #fff;
  z-index: 999;
}
</style>