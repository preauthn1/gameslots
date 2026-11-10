<template>
 <el-dialog v-model="dialogTableVisible" width="70%" @close="emit('handleClose')">
    <template #header="{ close, titleId, titleClass }">
      <div class="flex-bc">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
        <div/>
      </div>
    </template>
     <el-form ref="formRef"  :model="ruleForm"
    :rules="rules" label-width="120px">
     <el-form-item :label="$t('货币')">
        <el-select v-model="ruleForm.account.value" :placeholder="$t('类型')">
          <el-option v-for="(cell,index) in ruleForm.account.options" :key="index" :label="cell.label" :value="cell.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('链接名称')">
        <el-select v-model="ruleForm.account.value" :placeholder="$t('链接名称')">
          <el-option v-for="(cell,index) in ruleForm.account.options" :key="index" :label="cell.label" :value="cell.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('USDT收款地址')" prop="balance">
        <el-input :input-style="{width:'300px'}" v-model="ruleForm.balance" :placeholder="$t('USDT收款地址')" />
      </el-form-item>
      <el-form-item :label="$t('USDT二维码')">
          <uploadImage  />
      </el-form-item>
      <el-form-item>
         <el-button type="primary">{{ $t('立即提交') }}</el-button>
      </el-form-item>
    </el-form>

  </el-dialog>

</template>

<script lang="tsx" setup>
import { ref,reactive,withDefaults,watch  } from 'vue'
import type { FormInstance, FormRules } from "element-plus";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
const props = withDefaults(defineProps<{
  addUserList?: any[],
  title: string,
  dialogTableVisible: Boolean,
  item: any
}>(), {
  // item:()=> {
  //   return {
  //     // username: '',
  //     // mail:''
  //   }
  // }
});
//银行卡组件


const ruleForm = reactive({
  id:'',
  username:'',
  mail:'',
  balance:0,
  set_fund_money:0,
  live_fund_money:0,
  integral:0,
  limit_min:0,
  limit_max:0,
  limit_sum_max:0,
  level_id:'',
  rec_code:'',
  add_time:'',
  login_time:'',
  qh:'',
  real_name:'',
  password:'',
  top_code: '',
  phone:'',
  withdrawal_psd:'',
  is_check_phone:'',
  remark:'',
  agent: false,
  account: {
    value: 0,
    options: [
       {
        label: 0,
        value:'累计充值'
      },{
        label: 1,
        value:'单次充值'
      }
    ]
  }
})
  watch(() => props.item, (value) => {
      const { username, mail, balance, set_fund_money, live_fund_money, integral, real_name, limit_min, limit_max,
  limit_sum_max, level_id, rec_code, remark, add_time,login_time,qh,phone,password,withdrawal_psd,is_check_phone,lebal,status,sc_date,id
    } = value;
    ruleForm.username = username;
    ruleForm.mail = mail
    ruleForm.balance = balance
    ruleForm.set_fund_money = set_fund_money
    ruleForm.live_fund_money = live_fund_money
    ruleForm.integral = integral
    ruleForm.real_name = real_name
    ruleForm.limit_min = limit_min
    ruleForm.limit_max = limit_max
    ruleForm.limit_sum_max = limit_sum_max
    ruleForm.level_id = level_id
    ruleForm.rec_code = rec_code
    ruleForm.remark = remark
    ruleForm.add_time = add_time
    ruleForm.qh = qh
    ruleForm.phone = phone
    ruleForm.login_time = login_time
    ruleForm.password = password
    ruleForm.withdrawal_psd = withdrawal_psd
    ruleForm.is_check_phone = is_check_phone
    // ruleForm.userLabel.value = lebal
    // ruleForm.userStuts.value = status
    ruleForm.account.value = sc_date
    ruleForm.id = id
  })
const emit = defineEmits(['btnSave','handleClose']);
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
.listTab{
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-bottom:15px;
  &-item{
    margin-left:0px;
    margin-right: 12px;
    margin-bottom: 10px;
  }
}
.headerClass{
  background-color:#f2f2f2;
}
.frame-iframe{
  width:100%;
  height: 400px;
}

</style>
