<template>
  <div class="flex-fi" style="margin-bottom: 20px;">
      <div style="width: 50%;">
        <el-date-picker @change="handleCurrentChange"
            v-model="time2"
            type="daterange"
            :editable="false"
            :shortcuts="shortcuts"
            range-separator="-"
            :start-placeholder="$t('开始时间')"
            :end-placeholder="$t('结束时间')"
          />
        <el-button style="margin-left: 10px;" @click="emit('search')" type="primary">{{ $t('搜索') }}</el-button>
      </div>
      <div style="width: 50%;">
        <el-alert type="error">{{ $t('缓存时间1分钟') }}</el-alert>
      </div>
  </div>
  <el-row :gutter="16">
    <el-col
      v-for="(item, index) in list" style="margin-bottom: 16px;"
      :key="index"
      :xs="24"
      :sm="12"
      :md="8"
      :lg="6"
      :xl="4"
    >
      <el-card class="box-card" v-loading="item.loading">
        <template v-slot:header>
          <div class="clearfix">
            <span>{{ $t(item.title) }}</span>
            <template v-if="item.tip && item.tip != ''">
              <el-tooltip :content="item.tip">
                <el-icon style="float: right;"><InfoFilled /></el-icon>
              </el-tooltip>
            </template>
          </div>
        </template>
        <div class="text item">
          {{ item.num }}
          <el-tag style="float: right;" v-if="item.tag" type="danger">{{ item.tag }}</el-tag>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card class="box-card">
        <template v-slot:header>
          <div class="clearfix">
            <span>{{ $t('平台盈利') }}</span>
            <el-tooltip :content="`${$t('充值总额')}-${$t('提现总额')}+${$t('提现手续费')}=${$t('平台盈利')}`">
              <el-icon style="float: right;"><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>
        <div class="text item">
          {{((list.TotalRecharge4.num - list.TotalWithdraw1.num) * 1 + list.TotalWithdrawFee1.num * 1).toFixed(2)}}
        </div>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="16">
      <el-col style="margin-bottom: 16px;"
        :xs="24"
        :sm="24"
        :md="24"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card>
          <template #header>
            <span style="font-size: 16px; font-weight: 500">
              {{ $t('最近7天充值') }}
            </span>
          </template>
          <el-skeleton animated :rows="7" :loading="loading">
            <template #default>
              <Line />
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col style="margin-bottom: 16px;"
        :xs="24"
        :sm="24"
        :md="24"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card>
          <template #header>
            <span style="font-size: 16px; font-weight: 500">
              {{ $t('最近7天留存率') }}
            </span>
          </template>
          <el-skeleton animated :rows="7" :loading="loading">
            <template #default>
              <Bar />
            </template>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import moment from 'moment'
import { transformI18n } from '@/plugins/i18n';
import { ref, defineAsyncComponent } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue'
import Bar from "./Bar.vue";
import Line from "./Line.vue";
const time2 = ref('');
const props = defineProps({
  list: {} as any,
  time:String
});
const loading = ref(false)
const emit = defineEmits(['select','search'])
const handleCurrentChange = (value) => {
  time2.value = value;
  emit('select', value)
}
const shortcuts = [
  {
    text: transformI18n('今日'),
    onClick(picker) {
      const end = moment();
      const start =  moment();
      picker.emit('pick', [start, end]);
    }
  },
  {
    text: transformI18n('昨日'),
    onClick(picker) {
      const end = moment().subtract(1, 'days');
      const start =  moment().subtract(1, 'days');
      picker.emit('pick', [start, end]);
    }
  },
  {
    text: transformI18n('本周'),
    onClick(picker) {
      const start = moment().week(moment().week()).startOf('week');
      const end = moment().week(moment().week()).endOf('week');
      picker.emit('pick', [start, end]);
    }
  },
  {
    text: transformI18n('上周'),
    onClick(picker) {
      const weekOfday = parseInt(moment().format('d'))
      const start = moment().subtract(weekOfday + 7, 'days');
      const end = moment().subtract(weekOfday + 1, 'days');
      picker.emit('pick', [start, end]);
    }
  },
  {
    text: transformI18n('本月'),
    onClick(picker) {
      const start = moment().startOf('month');
      const end = moment().endOf('month');
      picker.emit('pick', [start, end]);
    }
  },
  {
    text: transformI18n('上月'),
    onClick(picker) {
      const start = moment().subtract(1,'month').startOf('month');
      const end = moment().subtract(1,'month').endOf('month');
      picker.emit('pick', [start, end]);
    }
  }
];
</script>
<style scoped lang="scss">
 .item-th{
    background-color: #f5f5f5;
    height: 45px;
    line-height: 45px; text-align: center;
  }
.dark{
  .custom-table{
    border: 1px solid var(--el-fill-color-light);
    &-item{
      border-right: 1px solid var(--el-fill-color-light);
    }
  }
   .item-th{
        background-color: var(--el-fill-color-light);
        height: 45px;
        line-height: 45px; text-align: center;
      }
}
  .custom-table{
    display: flex;
    flex-wrap: wrap;
    border: 1px solid #ddd;

    &-item{
      width: 15%;
      border-right: 1px solid #ddd;

      // box-sizing: content-box;
      box-sizing: border-box;



      .item-th-tag{
        align-items: center;
      }

      .item-td{
        backdrop-color: #fff;
        height: 45px;
      }
    }

    // &-item:nth-of-type(7n+6){
    //   width: 20%;
    // }

    &-item:nth-child(6n+6){
      border-right: 0;
    }

    &-item:nth-child(6n+6)+&-item, &-item:nth-child(6n+6)+&-item+&-item{
      width: 20%;
    }

    &-item0,&-item1{
      width: 20%;
    }


  }

  .num{
    padding: 0 6px;
    font-size: 12px;
    text-align: center;
    height: 20px;
    color: #fff;
    border-radius: 2px;
  }
</style>
