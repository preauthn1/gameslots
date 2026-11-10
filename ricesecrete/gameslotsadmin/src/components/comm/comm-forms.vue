<script lang="ts" setup>
import { ref,reactive, computed } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import uploadFile from '@/components/comm/uploadFile.vue'
import iconifyIconOnline from '../ReIcon/src/iconifyIconOnline'
import type { FormInstance, FormRules } from 'element-plus'
const props = defineProps({
  visible: Boolean,
  list: [],
  listRules: {},
  dialogObj: {},
  title: String,
  width:String
})
const emit = defineEmits(['close', 'currentChage','save'])
const handleCurrentChage = (event,index) => {
  emit('currentChage', {value:event,index});
}

const file = ref([])
const handleCurrentFileChange = (event, index) => {
  file.value[index] = ''
  setTimeout(function() {
    file.value[index] = event.file
  }, 500)
  emit('currentChage', {value:event.file,index});
}
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      emit('save')
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
    <el-form  ref="ruleFormRef" :rules="rs" :model="dialogObj">
      <div v-for="item,index in list" :key="index" >
        <el-form-item :label="$t(item.label)" label-width="140" v-if="!item.show" :prop="item.prop" :class="item.type == 'select' || item.type == 'radio' ?'':''">
          <template v-if="item.type == 'input'">
            <div>
                <div>
                  <el-input :disabled="item.disable?item.disable:false" :type="item.ty?item.ty:'text'"  v-model="item.value" :placeholder="$t(item.placeholder)" @change="handleCurrentChage($event,index)" />
                </div>
                <div v-if="item.tip" v-html="$t(item.tip)"/>
            </div>
          </template>
          <template v-if="item.type == 'radio'" >
            <div>
                <div>
                  <el-radio-group :disabled="item.disable?item.disable:false"   v-model="item.value"  @change="handleCurrentChage($event,index)" >
                    <el-radio :label="cell.label" v-for="cell,idx in item.options" :key="idx" size="large">{{ $t(cell.name) }}</el-radio>
                  </el-radio-group>
                </div>
                <div v-if="item.tip" v-html="$t(item.tip)"/>
            </div>
          </template>
          <template v-if="item.type == 'select'" >
            <div>
                <div>
                  <el-select :disabled="item.disable?item.disable:false" :multiple="item.multiple?true:false"  v-model="item.value" :placeholder="$t(item.placeholder)"  @change="handleCurrentChage($event,index)" >
                    <el-option
                      v-for="cell in item.options"
                      :key="cell.value"
                      :label="$t(cell.label)"
                      :value="cell.value"
                    />
                  </el-select>
                </div>
                <div v-if="item.tip" v-html="$t(item.tip)"/>
            </div>
          </template>
          <template v-else-if="item.type == 'file'" >
            <div style="display: flex;">
              <el-input type="text" v-model="file[index]" :value="item.value" :placeholder="$t(item.placeholder)" @change="handleCurrentChage($event,index)" />
              <uploadFile @success="handleCurrentFileChange($event,index)" :data="{'type':'app'}"/>
            </div>
            <div class="color" v-if="item.tip">{{ $t(item.tip) }}</div>
          </template>
          <template v-else-if="item.type == 'time'">
                <div>
                  <div style="width: 200px;">
                    <el-date-picker  @change="handleCurrentChage($event,index)"
                    v-model="item.value"
                    type="datetimerange"
                    range-separator="-"
                    :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')"
                  />
                  </div>
                  <div v-if="item.tip" v-html="$t(item.tip)"/>
                </div>
            </template>
          <template v-if="item.type == 'slot'" >
              <slot :name="item.name"/>
          </template>
        </el-form-item>
      </div>
      <!-- <el-form-item label-width="120" >
        <el-button type="primary" @click="submitForm(ruleFormRef)">{{ $t('保存') }}</el-button>
      </el-form-item> -->
    </el-form>
  </div>
</template>
<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.color{
  color:var(--el-color-danger);
}
</style>
