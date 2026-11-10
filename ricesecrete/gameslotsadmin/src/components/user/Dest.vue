<template>
 <el-dialog v-model="dialogTableVisible" @close="emit('handleClose')">
    <template #header="{ titleId, titleClass }">
      <div class="flex-bc">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
      </div>
    </template>
    <el-form ref="formRef" :model="ruleForm"
    :rules="rules" label-width="120px">
      <el-form-item :label="$t('用户名')" prop="username">
        <el-input v-model="ruleForm.username" />
      </el-form-item>
      <el-form-item :label="$t('邮箱')" prop="mail">
        <el-input v-model="ruleForm.mail" />
      </el-form-item>
      <el-form-item :label="$t('区号')" prop="qh">
        <el-input v-model="ruleForm.qh" />
      </el-form-item>
      <el-form-item :label="$t('手机号')" prop="phone">
        <el-input v-model="ruleForm.phone" />
      </el-form-item>
      <el-form-item :label="$t('真实姓名')" prop="real_name">
        <el-input v-model="ruleForm.real_name" />
      </el-form-item>
      <el-form-item :label="$t('密码')" prop="password">
        <el-input type="password" v-model="ruleForm.password" />
      </el-form-item>
      <el-form-item :label="$t('上级推广码')" prop="top_code">
        <el-input v-model="ruleForm.top_code" />
      </el-form-item>
      <el-form-item :label="$t('备注')" prop="remark">
        <el-input type="textarea" v-model="ruleForm.remark" />
      </el-form-item>
      <el-form-item :label="$t('开通代理')" prop="agent" >
        <el-switch
        size="large"
        v-model="ruleForm.agent"
        inline-prompt
        :active-text="$t('开通')"
        :inactive-text="$t('不开通')"
      />
      </el-form-item>
       <el-form-item :label="$t('代理类型')" prop="agent_type" v-if="ruleForm.agent">
        <el-select v-model="ruleForm.agent_type.value" class="m-2" :placeholder="$t('请选择')" size="large">
          <el-option
            v-for="item,index in ruleForm.agent_type.options"
            :key="index"
            :label="$t(item.label)"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('站点权限')" prop="website_auth" v-if="ruleForm.agent">
        <el-radio-group v-model="ruleForm.website_auth.value">
            <el-radio v-for="cell in ruleForm.website_auth.options" :label="cell.label" :key="cell.name">{{ $t(cell.name) }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('代理返佣')" prop="rate" v-if="ruleForm.agent && ruleForm.agent_type.value == 1">
        <el-input v-model="ruleForm.rate" />
        <p>{{ $t('单位:百分比, 例如:50=50%') }}</p>
      </el-form-item>
      <el-form-item :label="$t('用户标签')" prop="userLabel">
        <el-radio-group v-model="ruleForm.userLabel.value">
            <el-radio v-for="cell in ruleForm.userLabel.options" :label="cell.label" :key="cell.name">{{ $t(cell.name) }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('标签限制')" prop="userTagIds">
        <el-checkbox-group v-model="ruleForm.userTagIds">
          <el-checkbox v-for="item in ruleForm.checkbox_tags" :label="item.value" :key="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('用户状态')" prop="userStuts">
        <el-radio-group v-model="ruleForm.userStuts.value">
            <el-radio v-for="cell in ruleForm.userStuts.options" :label="cell.label" :key="cell.name">{{ $t(cell.name) }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
         <el-button type="primary" class="save-btn" size="large"  @click="submitForm(formRef)">{{ $t('保存') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>

<script lang="ts" setup>
import { ref,reactive, computed, watch } from 'vue'
import type { FormInstance,FormRules  } from "element-plus";
const props = defineProps<{
  addUserList?: any[],
  title:string,
  dialogTableVisible: Boolean,
  item: any
}>();
const dialogTableVisible = computed(() => {
  // console.log(props)
  return props.dialogTableVisible;
})
const emit = defineEmits(['btnSave','handleClose']);

watch(() => props.item, (value) => {
    const { checkbox_tags} = value;
    ruleForm.checkbox_tags = checkbox_tags
})

const formRef = ref<FormInstance>()
const ruleForm = reactive({
  username: '',
  mail: '',
  qh: '55',
  phone: '',
  real_name:'',
  password: '',
  top_code: '',
  remark: '',
  agent: true,
  userTagIds:[],
  checkbox_tags:[],
  agent_type: {
    value: 1,
    options: [
       {
          value: 1,
          label: '内部代理',
        },{
          value: 0,
          label: '外部代理',
        },
    ]
  },
  website_auth: {
    value: 1,
    options: [
       {
        label: 1,
        name:'开启'
      },{
        label: 0,
        name:'关闭'
      }
    ]
  },
  rate: '7',
  userLabel: {
    value: 1,
    options: [
       {
        label: 1,
        name:'一般用户'
      },{
        label: 2,
        name:'测试用户'
      }
    ]
  },
  userStuts: {
    value: 1,
    options: [
       {
        label: 1,
        name:'开启'
      },{
        label: 0,
        name:'禁用'
      }
    ]
  }
})
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur'},
  ],
  mail: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确邮箱',
      trigger: ['blur', 'change'],
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
  ],
})


//提交的数据
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    console.log(ruleForm)
    if (valid) {
      emit('btnSave', ruleForm);
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
