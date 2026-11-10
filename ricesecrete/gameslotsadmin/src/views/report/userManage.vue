<script setup lang="tsx">
import { ref } from 'vue';
import UserChargeReport from "../user/pages/report/charge.vue";
import UserGameReport from "../user/pages/report/game.vue";
import UserDayReport from "../user/pages/report/day.vue";
defineOptions({
  name: 'userManage'
})
const activeName = ref('user_day')
const handleClick = (e) => {
   window.dispatchEvent(new Event('resize'));
}
</script>

<template>
  <div>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane :label="$t('用户数据总览')" name="user_stat">
        <component :is="UserGameReport" />
      </el-tab-pane>
      <el-tab-pane :label="$t('用户日报表')" name="user_day">
        <component :is="UserDayReport" />
      </el-tab-pane>
      <el-tab-pane :label="$t('用户充值/优惠报表')" name="user_charge">
        <component :is="UserChargeReport" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>