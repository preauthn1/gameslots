<template>
  <el-dialog v-model="dialogTableVisible" @close="emit('handleClose')">
    <template #header="{ titleId, titleClass }">
      <div class="flex-bc">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
      </div>
    </template>
    <el-form ref="formRef" :model="ruleForm" :rules="rules" label-width="150px">
      <el-form-item :label="$t('积分批量调整')" prop="integrals">
        <el-input type="textarea" :rows="10" v-model="ruleForm.integrals" :placeholder="$t('')" />
        <div style="width: 100%;">
          {{ $t('每行的数据格式：会员账号,积分 使用逗号或者空格隔开如:') }}
        </div>
        <div style="width: 100%;">{{ $t('aaaaaa,10使用空格隔开') }}</div>
        <div style="width: 100%;">{{ $t('bbbbbb,20 使用逗号隔开') }}</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="save-btn" size="large" @click="submitForm(formRef)">{{ $t('保存') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>

<script lang="ts" setup>
import { ref, reactive, withDefaults, watch, computed } from 'vue'
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
const emit = defineEmits(['btnSave', 'handleClose']);
const ruleForm = reactive({
  integrals: '',
})
watch(() => props.item, (value) => {
  const { integrals } = value;
  ruleForm.integrals = integrals
})
const formRef = ref<FormInstance>();


const rules = reactive<FormRules>({
  // username: [
  //   { required: true, message: '请输入用户名', trigger: 'blur'},
  // ],
  // email: [
  //   { required: true, message: '请输入邮箱', trigger: 'blur' },
  //   {
  //     type: 'email',
  //     message: '请输入正确邮箱',
  //     trigger: ['blur', 'change'],
  //   }
  // ],
  // password: [
  //   {
  //     required: true,
  //     message: '请输入密码',
  //     trigger: 'blur',
  //   },
  // ],
})


//提交的数据
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      emit('btnSave', ruleForm);
    } else {
      return false
    }
  })
}
</script>
<style scoped lang="scss">
.userEidt {
  padding: 30px;

  .item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .name {
      width: 120px;
      text-align: left;
      margin-right: 20px;
    }
  }
}

.save-box {
  display: flex;
  margin-top: 40px;
  //  margin-left:100px;
}

.save-btn {
  margin-top: 30px;
  padding: 10px 20px;
}
</style>
