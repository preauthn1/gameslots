<script setup lang='ts'>
import { ref, reactive, defineAsyncComponent } from 'vue';
import { useI18n } from "vue-i18n";
import amount from "./pages/amount.vue";
import bets from "./pages/bets.vue";
import promote from "./pages/promote.vue";

const selected = ref(0);
const tabList = reactive(
  [
    {
      name:'充提报表',
      component: amount,
    },
    {
      name:'注单报表',
      component: bets,
    },
    {
      name:'彩金报表',
      component: promote,
    },
  ]
)

function tabClick({ index }) {
  selected.value = index;
}
</script>
<template>
  <div>
   <el-tabs @tab-click="tabClick" type="border-card">
      <template v-for="(item, index) of tabList" :key="index">
        <el-tab-pane :lazy="true">
          <template #label>
            <div class="flex-c">
              <span>{{ $t(item.name) }}</span>
            </div>
          </template>
          <component v-if="selected == index" :is="item.component" />
        </el-tab-pane>
      </template>
    </el-tabs>
  </div>
</template>
