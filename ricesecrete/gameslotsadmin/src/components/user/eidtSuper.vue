<template>
 <el-dialog v-model="dialogTableVisible"  @close="emit('handleClose')">
    <template #header="{ close, titleId, titleClass }">
      <div class="flex-bc">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
        <div/>
      </div>
    </template>
    <el-form ref="formRef" :model="ruleForm"
    :rules="rules" label-width="120px">

      <el-form-item :label="$t('上级')" prop="top_code">
        <el-input  :input-style="{height:'40px'}" placeholder="用户名/推广码" v-model="ruleForm.top_code" />
      </el-form-item>
      <el-form-item>
         <el-button type="primary" class="save-btn" size="large"  @click="submitForm(formRef)">{{ $t('保存') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>

<script lang="ts" setup>
import { ref,reactive, computed } from 'vue'
import type { FormInstance, FormRules } from "element-plus";
const props = defineProps<{
  title:string,
  dialogTableVisible: Boolean,
}>();
const dialogTableVisible = computed(() => {
  return props.dialogTableVisible;
})
const emit = defineEmits(['btnSave','handleClose']);
const formRef = ref<FormInstance>()
const ruleForm = reactive({
  top_code: '',
})
const rules = reactive<FormRules>({
  top_code: [
    { required: true, message: '请输入用户名/推广码', trigger: 'blur'},
  ],
})


//提交的数据
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      emit('btnSave',ruleForm);
    } else {
      return false
    }
  })
}
</script>
<style scoped lang="scss">
.userEidt{
  padding:30px;
  .item{
    display: flex;
     align-items: center;
     margin-bottom: 20px;
    .name{
      width:120px;
      text-align: left;
      margin-right: 20px;
    }
  }
}
.save-box{
   display: flex;
   margin-top:40px;
  //  margin-left:100px;
}
.save-btn{
    margin-top:30px;
   padding:10px 20px;
}
</style>
