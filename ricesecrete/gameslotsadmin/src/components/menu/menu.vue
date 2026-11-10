<script setup lang='ts'>
import { router } from "@/router";
import { useRoute } from "vue-router";
import { computed } from "vue";
// import { storageLocal, isAllEmpty } from "@pureadmin/utils";

const _route = useRoute();
const routes = router.currentRoute.value;
const currentMenuName = routes.meta.parentName;
const menu_route = router.getRoutes();
let menu_routes = "";
for (let i = 0; i < menu_route.length; i++) {
  if (menu_route[i].name == currentMenuName) {
    menu_routes = menu_route[i].children;
  }
}
console.log("------", menu_routes);
const defaultActive = computed(() =>
  _route.path
);

const handleClick = (e) => {
  router.push(e.paneName)
}

</script>
<template>
  <div>
    <el-tabs v-model="defaultActive" v-if="menu_routes" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane v-for="routeM in menu_routes" :label="$t(routeM.meta.title)" :name="routeM.path" />
    </el-tabs>
  </div>
</template>