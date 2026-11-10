<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import uploadFile from '@/components/comm/uploadFile.vue'
import iconifyIconOnline from '../ReIcon/src/iconifyIconOnline'

const props = defineProps({
  visible: Boolean,
  list: Array as any,
  listRules: Object as any,
  dialogObj: Object as any,
  btn: String,
  title: String,
  width:String
})
const emit = defineEmits(['close', 'currentChage','save', 'update:visible'])
const handleCurrentChage = (event, index) => {
  emit('currentChage', {value:event,index});
}
const file = ref('')
const handleCurrentFileChange = (event, index) => {
  file.value = ''
  setTimeout(function() {
    file.value = event.file
  }, 500)
  emit('currentChage', {value:event.file,index});
}
const handleCurrentFileChangeOldData = (event, index) => {
  emit('currentChage', {value:event,index});
}
// 子组件定义自己的visible
const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});
const btnText = computed(() => {
  return props.btn ? props.btn : '保存'
})

const rs = computed(() => {
  return props.listRules
})

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

</script>
<template>
  <el-dialog v-model="visible" :width="width" :show-close="false" :close-on-click-modal="false">
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">{{ $t(title) }}</h4>
        <el-button type="danger" @click="emit('close')">
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
          {{ $t('关闭') }}
        </el-button>
      </div>
    </template>
    <div>
         <el-form ref="ruleFormRef" :rules="rs"  :model="dialogObj">
          <div v-for="item,index in list" :key="index">
            <el-form-item label-width="120" v-if="!item.show"  :prop="item.prop" :class="item.type == 'select' || item.type == 'radio' ?'flex-fi':''">
              <template v-slot:label>{{ $t(item.label) }}</template>
              <template v-if="item.type == 'text'" >
                  <div v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-if="item.type == 'input'">
                <el-input  :disabled="item.disable?item.disable:false" :type="item.ty?item.ty:'text'" :rows="item.rows"  v-model="item.value" :placeholder="item.placeholder ? $t(item.placeholder) : ''"  @change="handleCurrentChage($event,index)" />
                <div v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-if="item.type == 'radio'" >
                  <el-radio-group :disabled="item.disable?item.disable:false" v-model="item.value"  @change="handleCurrentChage($event,index)" >
                    <el-radio :label="cell.label" v-for="cell,idx in item.options" :key="idx" size="large">{{ $t(cell.name) }}</el-radio>
                  </el-radio-group>
                  <div style="margin-left:20px;" class="color" v-if="item.tip" v-html="$t(item.tip)"/>
              </template>
              <template v-if="item.type == 'checkbox'" >
                <el-checkbox-group v-model="item.value" :disabled="item.disable?item.disable:false" @change="handleCurrentChage($event,index)">
                  <el-checkbox :label="cell" v-for="cell,idx in item.options" :key="idx" size="large"/>
                </el-checkbox-group>
                <div style="margin-left:20px;" class="color" v-if="item.tip" v-html="$t(item.tip)"/>
              </template>
              <template v-if="item.type == 'checkbox2'" >
                <el-checkbox-group v-model="item.value" :disabled="item.disable?item.disable:false" @change="handleCurrentChage($event,index)">
                  <el-checkbox :label="cell.label" v-for="cell,idx in item.options" :key="idx" size="large"/>
                </el-checkbox-group>
                <div style="margin-left:20px;" class="color" v-if="item.tip" v-html="$t(item.tip)"/>
              </template>
              <template v-if="item.type == 'switch'" >
                  <el-switch  @change="handleCurrentChage($event,index)"
                      :size="item.size"
                      v-model="item.value"
                      :active-value="item.activeValue?item.activeValue:1"
                      :inactive-value="item.inactiveValue?item.inactiveValue:0"
                      :inline-prompt="item.inlinePrompt"
                      :active-text="$t(item.activeText)"
                      :inactive-text="$t(item.inactiveText)"
                    />
                    <div style="margin-left:20px;" v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-if="item.type == 'time'">
                  <el-date-picker @change="handleCurrentChage($event,index)"
                    v-model="item.value"
                    type="datetime"
                    :placeholder="item.placeholder ? $t(item.placeholder) : ''"
                  />
              </template>
              <template v-if="item.type == 'select'" >
                <el-select :disabled="item.disable?item.disable:false" :clearable="item.clearable?item.clearable:false"  v-model="item.value" :placeholder="item.placeholder ? $t(item.placeholder) : ''"  @change="handleCurrentChage($event,index)" >
                  <el-option
                    v-for="cell in item.options"
                    :key="cell.value"
                    :label="$t(cell.label)"
                    :value="cell.value"
                  />
                </el-select>
                <div class="color" v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-if="item.type == 'file'" >
                <uploadFile @success="handleCurrentFileChange($event,index)" :text="item.placeholder ? $t(item.placeholder) : ''" style="margin:0 12px;" />
                <div style="font-size: 22px; color: green;" v-if="file"><iconifyIconOnline icon="material-symbols:check-small"/></div>
                <div class="color" v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-else-if="item.type == 'fileInput'">
                <div style="display: flex;">
                  <el-input type="text" v-model="file[index]" :value="item.value" :placeholder="$t(item.placeholder)"
                    @change="handleCurrentChage($event, index)" />
                  <uploadFile @success="handleCurrentFileChange($event, index)" :data="{ 'type': 'app' }" />
                </div>
                <div class="color" v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-else-if="item.type == 'fileNameInput'">
                <div style="display: flex;">
                  <el-input type="text" v-model="file[index]" :value="item.value" :placeholder="$t(item.placeholder)"
                    @change="handleCurrentChage($event, index)" />
                  <uploadFile @success="handleCurrentFileChangeOldData($event, index)" :data="{ 'type': item.filetype ? item.filetype : 'app' }" />
                </div>
                <div class="color" v-if="item.tip">{{ $t(item.tip) }}</div>
              </template>
              <template v-if="item.type == 'color'">
                <el-color-picker v-model="item.value" @change="handleCurrentChage($event,index)"/>
              </template>
              <template v-if="item.type == 'slot'" >
                  <slot :name="item.name" :data="item"/>
              </template>
            </el-form-item>
          </div>
          <el-form-item label-width="120">
            <el-button type="primary" @click="submitForm(ruleFormRef)">{{ $t(btnText) }}</el-button>
          </el-form-item>
        </el-form>
    </div>
  </el-dialog>
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
