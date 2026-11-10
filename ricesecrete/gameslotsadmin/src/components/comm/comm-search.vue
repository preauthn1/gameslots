<script lang="ts"  setup>
import moment from 'moment'
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { computed, ref } from 'vue'
const props = defineProps({
   list:Object// [] as any
 })
const fromEle = ref(null);
const isAdv = ref(true);
const emit = defineEmits(['export', 'search', 'currentChange','addsearch'])
const handleCurrentChange = (event,index) => {
   emit('currentChange', {value:event,index});
}
const length = computed(() => {
   const items = {};
   let i = 1;
   for (const key in props.list) {
      if (Object.prototype.hasOwnProperty.call(props.list, key)) {
         const element = props.list[key];
         if (element.type !== 'button') {
            element.index = i;
            items[key] = element;
            i++;
            if (element.type == 'date' || element.type == 'time') {
               i++;
            }
         }
      }
   }
   return i;
})
const btns :any = computed(() => {
   const items = {};
  
   for (const key in props.list) {
      if (Object.prototype.hasOwnProperty.call(props.list, key)) {
         const element = props.list[key];
         if (element.type === 'button') {
            if (element.handle != 'search' && element.handel !='addsearch' && hasAuth(element.handle)) {
               items[key] = element;
            } else if (element.handle == 'search' || element.handle == 'addsearch') {
               items[key] = element;
            }
         }
      }
   }
   return items;
})
const inputs: any = computed(() => {
   const items = {};
   let i = 1;
   for (const key in props.list) {
      if (!isAdv.value && i > 4) {
         break;
      }
      if (Object.prototype.hasOwnProperty.call(props.list, key)) {
         const element = props.list[key];
         if (typeof element.show !== "undefined" && element.show === false) {
            continue;
         }
         if (element.type !== 'button') {
            element.index = i;
            items[key] = element;
            element.type == 'time' || element.type == 'date' ? i+=2 : i++;
         }
      }
   }
   return items;
})
const toggleAdvanced = () => {
   isAdv.value = !isAdv.value
   window.dispatchEvent(new Event('resize'));
}

const shortcuts = [
  {
    text: transformI18n('今日'),
    onClick(picker) {
      const start =  moment().startOf('day');
      const end = moment().endOf('day');
      picker.emit('pick', [start, end]);
    }
  },
  {
    text: transformI18n('昨日'),
    onClick(picker) {
      const start =  moment().subtract(1, 'days').startOf('day');
      const end = moment().subtract(1, 'days').endOf('day');
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
      const start = moment().subtract(weekOfday + 7, 'days').startOf('week');
      const end = moment().subtract(weekOfday + 1, 'days').endOf('week');
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
const shortcutsonly = [
  {
    text: transformI18n('今日'),
    onClick(picker) {
      const start =  moment().startOf('day');
      picker.emit('pick', start);
    }
  },
  {
    text: transformI18n('昨日'),
    onClick(picker) {
      const start =  moment().subtract(1, 'days').startOf('day');
      picker.emit('pick', start);
    }
  },
  {
    text: transformI18n('本周'),
    onClick(picker) {
      const start = moment().week(moment().week()).startOf('week');
      picker.emit('pick', start);
    }
  },
  {
    text: transformI18n('上周'),
    onClick(picker) {
      const weekOfday = parseInt(moment().format('d'))
      const start = moment().subtract(weekOfday + 7, 'days').startOf('week');
      picker.emit('pick', start);
    }
  },
  {
    text: transformI18n('本月'),
    onClick(picker) {
      const start = moment().startOf('month');
      picker.emit('pick', start);
    }
  },
  {
    text: transformI18n('上月'),
    onClick(picker) {
      const start = moment().subtract(1,'month').startOf('month');
      picker.emit('pick', start);
    }
  }
];
</script>
<template>
  <div>
     <el-form ref="fromEle" :model="list">
      <el-row :gutter="15">
         <el-col v-for="(item,index) in inputs" :key="index" :span="item.span ? item.span : (item.type == 'time' || item.type == 'date' ? 8 : 4)">
            <el-form-item class="item">
               <template v-if="item.type == 'input'">
                  <el-input clearable v-model="item.value" :disabled="item?.disabled?item.disabled:false" :placeholder="$t(item.placeholder)" @change="handleCurrentChange($event,index)" />
               </template>
               <template v-else-if="item.type == 'select'">
                  <el-select class="item" clearable  v-model="item.value" :disabled="item?.disabled?item.disabled:false" :placeholder="$t(item.placeholder)" @change="handleCurrentChange($event,index)">
                     <el-option v-for="(cell,idx) in item.options" :key="idx" :label="$t(cell.label)" :value="cell.value" />
                  </el-select>
               </template>
               <template v-else-if="item.type == 'time'">
                  <el-date-picker :disabled="item?.disabled?item.disabled:false" @change="handleCurrentChange($event,index)"
                     v-model="item.value"
                     :default-value="item?.value && item.value.length == 2 ? item.value : null"
                     value-format="YYYY-MM-DD HH:mm:ss"
                     type="datetimerange"
                     range-separator="-"
                     :shortcuts="shortcuts"
                     :default-time="[new Date('2014-12-25 00:00:00'), new Date('2014-12-25 23:59:59')]"
                     :start-placeholder="$t(item.placeholder ? item.placeholder : '开始时间')"
                     :end-placeholder="$t('结束时间')"
                  />
               </template>
               <template v-else-if="item.type == 'date'">
                  <el-date-picker :disabled="item?.disabled?item.disabled:false" @change="handleCurrentChange($event,index)"
                     v-model="item.value"
                     value-format="YYYY-MM-DD"
                     :shortcuts="shortcuts"
                     type="daterange"
                     range-separator="-"
                     :start-placeholder="$t(item.placeholder ? item.placeholder : '开始日期')"
                     :end-placeholder="$t('结束日期')"
                  />
               </template>
               <template v-else-if="item.type == 'dateonly'">
                  <el-date-picker :disabled="item?.disabled?item.disabled:false" @change="handleCurrentChange($event,index)"
                     v-model="item.value"
                     value-format="YYYY-MM-DD"
                     :shortcuts="shortcutsonly"
                     type="date"
                     :placeholder="$t(item.placeholder ? item.placeholder : '日期')"
                  />
               </template>
            </el-form-item>
         </el-col>
         <el-col :span="btns.length > 1 ? 6 : 4" style="display:flex;">
            <el-button v-for="(item,index) in btns" :key="index" type="primary" @click="emit(item.handle)">{{ $t(item.value) }}</el-button>
            <a v-if="length > 5" @click="toggleAdvanced" style="margin-left: 8px; color: #1890ff; font-size: 14px;">
               <div style="display:flex">
                  <div style="width: max-content">
                     {{ isAdv ? $t('收起') : $t('展开') }}
                  </div>
                     <span style="display: inline-block;"><iconify-icon-online :icon="isAdv ? 'material-symbols:keyboard-double-arrow-up-rounded' : 'material-symbols:keyboard-double-arrow-down-rounded'" />
                  </span>
               </div>
            </a>
         </el-col>
      </el-row>

      </el-form>
  </div>
</template>

<style scoped>
   .item{
      width: 100%;
    }
</style>
