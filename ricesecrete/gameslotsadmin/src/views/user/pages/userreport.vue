<script setup lang="tsx">
import { ref, computed } from 'vue';
import UserChargeReport from "./report/charge.vue";
import UserGameReport from "./report/game.vue";
import UserDayReport from "./report/day.vue";
defineOptions({
  name: 'userReport'
})
const activeName = ref('user_stat')
const handleClick = (e) => {
   window.dispatchEvent(new Event('resize'));
}
const props = defineProps({
    uid: String,
})
const uid = computed(() => {
  return props.uid;
})
</script>

<template>
  <div>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane :label="$t('用户数据总览')" name="user_stat">
        <component :is="UserGameReport" :uid="uid"/>
      </el-tab-pane>
      <el-tab-pane :label="$t('用户日报表')" name="user_day">
        <component :is="UserDayReport" :uid="uid"/>
      </el-tab-pane>
      <el-tab-pane :label="$t('用户充值/优惠报表')" name="user_charge">
        <component :is="UserChargeReport" :uid="uid"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>