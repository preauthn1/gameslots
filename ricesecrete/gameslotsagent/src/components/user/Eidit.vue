<template>
 <el-dialog v-model="dialogTableVisible" @close="emit('handleClose')">
    <template #header="{ titleId, titleClass }">
      <div class="flex-bc">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
      </div>
    </template>
    <el-form ref="formRef" :model="ruleForm"
    :rules="rules" label-width="120px">
      <el-form-item :label="$t('用户名')"  prop="username">
        <el-input disabled v-model="ruleForm.username" />
      </el-form-item>
      <el-form-item :label="$t('邮箱')" prop="mail">
        <el-input v-model="ruleForm.mail" />
      </el-form-item>
      <el-form-item :label="$t('区号')" prop="qh">
        <el-input v-model="ruleForm.qh" />
      </el-form-item>
     <el-form-item :label="$t('手機號碼')" prop="phone">
        <el-input v-model="ruleForm.phone" autoComplete="off" />
      </el-form-item>
      <!-- <el-form-item :label="$t('餘額')" prop="balance">
        <el-input disabled v-model="ruleForm.balance" />
      </el-form-item>
      <el-form-item :label="$t('积分')" prop="integral">
        <el-input disabled v-model="ruleForm.integral" />
      </el-form-item> -->
      <!-- <el-form-item :label="$t('定期基金余额')" prop="set_fund_money">
        <el-input disabled v-model="ruleForm.set_fund_money" />
      </el-form-item> -->
      <!-- <el-form-item :label="$t('活期基金余额')" prop="live_fund_money">
        <el-input disabled v-model="ruleForm.live_fund_money" />
      </el-form-item> -->
      <el-form-item :label="$t('真实姓名')" prop="real_name">
        <el-input v-model="ruleForm.real_name" />
      </el-form-item>
      <!-- <el-form-item :label="$t('最低下注')" prop="limit_min">
        <el-input v-model="ruleForm.limit_min" />
      </el-form-item>
       <el-form-item :label="$t('最高下注')" prop="limit_max">
        <el-input v-model="ruleForm.limit_max" />
      </el-form-item>
      <el-form-item :label="$t('单场最高下注')" prop="limit_sum_max">
        <el-input v-model="ruleForm.limit_sum_max" />
      </el-form-item> -->
      <el-form-item :label="$t('会员等级')" prop="level_id">
        <el-select v-model="ruleForm.level_id">
          <el-option
            v-for="item,index in ruleForm.user_level"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item  :label="$t('推广码')" prop="rec_code">
        <el-input disabled v-model="ruleForm.rec_code" />
      </el-form-item> -->
      <el-form-item :label="$t('备注')" prop="remark">
          <el-input type="textarea" v-model="ruleForm.remark" />
      </el-form-item>
       <el-form-item label-width="0">
        <!-- <el-form-item :label="`${$t('注册时间')}/ip`" prop="add_time">
          <el-input disabled v-model="ruleForm.add_time" />
        </el-form-item> -->
        <!-- <el-form-item :label="`${$t('登录时间')}/ip`" prop="login_time">
          <el-input disabled v-model="ruleForm.login_time" />
        </el-form-item> -->
      </el-form-item>
      <el-form-item :label="$t('登錄密碼')" prop="password">
        <el-input type="password" v-model="ruleForm.password" autoComplete="off" />
      </el-form-item>
      <el-form-item :label="$t('提現密碼')" prop="withdrawal_psd">
        <el-input type="password" v-model="ruleForm.withdrawal_psd" />
      </el-form-item>


      <!-- <el-form-item :label="$t('手机验证')" prop="is_check_phone" >
        <el-switch
        size="large" active-value="1" inactive-value="0"
        v-model="ruleForm.is_check_phone"
        inline-prompt
        :active-text="$t('需要')"
        :inactive-text="$t('不需要')"
      />
      </el-form-item> -->

       <!-- <el-form-item :label="$t('代理类型')" prop="agentObj" v-if="ruleForm.agent">
        <el-select v-model="ruleForm.agentObj.value" class="m-2" placeholder="Select" size="large">
          <el-option
            v-for="item,index in ruleForm.agentObj.options"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item :label="$t('用户标签')" prop="userLabel">
        <el-radio-group v-model="ruleForm.userLabel.value">
            <el-radio v-for="cell in ruleForm.userLabel.options" :label="cell.label" :key="cell.label">{{ $t(cell.name) }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('用户状态')" prop="userStuts">
        <el-radio-group v-model="ruleForm.userStuts.value">
            <el-radio v-for="cell in ruleForm.userStuts.options" :label="cell.label" :key="cell.label">{{ $t(cell.name) }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item :label="$t('上架账号')" prop="account">
        <el-radio-group v-model="ruleForm.account.value">
            <el-radio v-for="cell in ruleForm.account.options" :label="cell.label" :key="cell.label">{{ $t(cell.name) }}</el-radio>
        </el-radio-group>
      </el-form-item> -->
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
  user_level:[],
  agentObj: {
    value: 0,
    options: [
       {
          value: 0,
          label: '内部代理',
        },{
          value: 1,
          label: '外部代理',
        },
    ]
  },
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
    value: 0,
    options: [
       {
        label: 0,
        name:'禁用'
      },{
        label: 1,
        name:'开启'
      }
    ]
  },
  account: {
    value: 0,
    options: [
       {
        label: 0,
        name:'禁用'
      },{
        label: 1,
        name:'开启'
      }
    ]
  }
})
  watch(() => props.item, (value) => {
      const { username, mail, balance, set_fund_money, live_fund_money, integral, real_name, limit_min, limit_max,
  limit_sum_max, level_id, user_level, rec_code, remark, add_time,login_time,qh,phone,password,withdrawal_psd,is_check_phone,lebal,status,sc_date,id
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
    ruleForm.user_level = user_level
    ruleForm.rec_code = rec_code
    ruleForm.remark = remark
    ruleForm.add_time = add_time
    ruleForm.qh = qh
    ruleForm.phone = phone
    ruleForm.login_time = login_time
    // ruleForm.password = password
    // ruleForm.withdrawal_psd = withdrawal_psd
    ruleForm.is_check_phone = is_check_phone
    ruleForm.userLabel.value = lebal
    ruleForm.userStuts.value = status
    ruleForm.account.value = sc_date
    ruleForm.id = id
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
