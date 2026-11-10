<script setup lang='ts'>
import { ref,reactive, computed } from 'vue'
import { ElButton } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
const props = defineProps({
  list: [],
  listRules: Object as any,
  dialogObj: Object as any,
  title:String
})
const emit = defineEmits(['currentChage','save'])
const handleCurrentChage = (event,index) => {
  emit('currentChage', {value:event,index});
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      emit('save');
    } else {
      console.log('error submit!', fields)
    }
  })
}
const ruleFormRef = ref<FormInstance>();

const rs: any = computed(() => {
  return props.listRules
})
</script>

<template>
  <div>
      <el-form  ref="ruleFormRef" :rules="rs"  :model="dialogObj">
          <div v-for="item,index in list" :key="index">
            <el-form-item label-width="120" v-if="!item.show" :prop="item.prop" :class="item.cssItem">
              <template v-slot:label>{{ $t(item.label) }}</template>
              <template v-if="item.type == 'input'">
                <el-input :type="item.ty?item.ty:'text'" v-model="item.value" :placeholder="$t(item.placeholder)"  @change="handleCurrentChage($event,index)" />
                <div v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-if="item.type == 'radio'" >
                  <el-radio-group v-model="item.value" @change="handleCurrentChage($event,index)">
                    <el-radio :label="cell.label" v-for="cell,idx in item.options" :key="idx" size="large">{{ $t(cell.name) }}</el-radio>
                  </el-radio-group>
              </template>
              <template v-if="item.type == 'switch'" >
                  <el-switch  @change="handleCurrentChage($event,index)"
                      :size="item.size"
                      v-model="item.value"
                      :active-value="1"
                      :inactive-value="0"
                      :inline-prompt="item.inlinePrompt"
                      :active-text="$t(item.activeText)"
                      :inactive-text="$t(item.inactiveText)"
                    />
              </template>
              <template v-else-if="item.type == 'time'">
                    <el-date-picker @change="handleCurrentChage($event,index)"
                    v-model="item.value"
                    type="datetimerange"
                    range-separator="-"
                    :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')"
                  />
               </template>
              <template v-if="item.type == 'select'" >
                <el-select :placeholder="$t(item.placeholder)" v-model="item.value" class="m-2" @change="handleCurrentChage($event,index)">
                  <el-option
                    v-for="cell in item.options"
                    :key="cell.value"
                    :label="$t(cell.label)"
                    :value="cell.value"
                  />
                </el-select>
              </template>
              <template v-if="item.type == 'slot'" >
                  <slot :name="item.name" />
              </template>
            </el-form-item>
          </div>
          <el-form-item label-width="120">
            <el-button type="primary" @click="submitForm(ruleFormRef)">{{ $t(title) }}</el-button>
          </el-form-item>
        </el-form>
  </div>
</template>

<style scoped>
.aligenCenter{
  align-items: center;
}
</style>
