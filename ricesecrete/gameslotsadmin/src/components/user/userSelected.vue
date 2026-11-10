<script setup lang='ts'>
//  import { ref } from 'vue'


const props = defineProps<{
  list?: any[],
}>();
const emit = defineEmits(['selectChange','selectDateChange','handleInput','handleBtn'])

const selectCurrentChange = (event,index) => {
  emit('selectChange', {value:event,index})
}
const picekChage = (event,index) => {
  const starTime = new Date(event[0]).getTime();
  const endTime = new Date(event[1]).getTime();
  emit('selectDateChange', {starTime,endTime,index});
}
const handleCurrentInput = (event,index) => {
  emit('handleInput', {value:event,index});
}
//点击搜索
const handleBtns = () => {
  emit('handleBtn');
}

</script>

<template>
  <div class="tablist flex-wp">
    <div  v-for="item,index in list" :key="index">
        <template v-if="item.type == 'input'">
          <div class="item">
            <el-input v-model="item.value" :placeholder="item.placeholder" @change="handleCurrentInput($event,index)" clearable />
          </div>
        </template>
        <template v-else-if="item.type == 'select'">
          <div class="item">
             <el-select
              v-model="item.value"
              :placeholder="item.placeholder"
              style="width: 240px"
              @change="selectCurrentChange($event,index)"
            >
              <el-option
                v-for="cell in item.options"
                :key="cell.value"
                :label="cell.label"
                :value="cell.value"
              />
            </el-select>
          </div>
        </template>
        <template v-else-if="item.type == 'time'">
          <div class="item">
             <el-date-picker
              v-model="item.value"
              type="datetimerange"
              range-separator=" - "
              :start-placeholder="$t('开始时间')"
              :end-placeholder="$t('结束时间')"
              @change="picekChage($event,index)"
            />
          </div>
        </template>
        <template v-else-if="item.type == 'button'">
            <div class="item">
              <el-button type="primary" @click="handleBtns">{{ item.value }}</el-button>
            </div>
        </template>
        <template v-else>
            <div class="item">
              <el-button type="primary">{{ item.value }}</el-button>
            </div>
        </template>
    </div>
      <!-- <el-select
      v-model="value1"
      multiple
      placeholder="Select"
      style="width: 240px"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select> -->
  </div>
</template>

<style scoped lang="scss">
  .tablist{

    .item{
      margin:10px 0;
      margin-right:20px;
      margin-top: 0;
    }
  }
</style>
