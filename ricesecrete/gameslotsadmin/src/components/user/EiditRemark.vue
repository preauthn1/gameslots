<template>
 <el-dialog v-model="dialogTableVisible" @close="emit('handleClose')">
    <template #header="{ titleId, titleClass }">
      <div class="flex-bc">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
      </div>
    </template>
    <el-form ref="formRef" :model="ruleForm"
    :rules="rules" label-width="120px">
      <el-form-item :label="$t('备注')" prop="remark">
          <el-input type="textarea" v-model="ruleForm.remark" />
      </el-form-item>
      <el-form-item>
         <el-button type="primary" class="save-btn" size="large"  @click="submitForm(formRef)">{{ $t('保存') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>

<script lang="ts" setup>
import { ref,reactive,withDefaults,watch, computed } from 'vue'
import type { FormInstance, FormRules } from "element-plus";


const props = withDefaults(defineProps<{
  addUserList?: any[],
  title: string,
  dialogTableVisible: boolean,
  item: any
}>(), {
  // item:()=> {
  //   return {
  //     // username: '',
  //     // mail:''
  //   }
  // }
});
const dialogTableVisible = computed(() => {
  return props.dialogTableVisible;
})
const emit = defineEmits(['btnSave','handleClose']);
const ruleForm = reactive({
  id:'',
  remark:'',
})
  watch(() => props.item, (value) => {
      const { id, remark} = value;
    ruleForm.id = id
    ruleForm.remark = remark
  })
const formRef = ref<FormInstance>();


const rules = reactive<FormRules>({

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
