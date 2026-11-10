<script setup lang='tsx'>
import { ref,reactive,computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { transformI18n } from "@/plugins/i18n";
const props = defineProps<{
    summaryTitle:string,
}>();
const title = computed(() => {
  return props.summaryTitle
})
const columns = [//TableColumnList  summaryTitle
    {
      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("申请时间"),
      prop: "label",
      width:'150px'
    }, {
      label: transformI18n("优惠类型"),
      prop: "bank",
       width:'150px'
    }, {
      label: transformI18n("优惠代码"),
      prop: "bankcode",
      width:'150px'
    }, {
      label: transformI18n("用户名"),
      prop: "userBank"
    }, {
      label: transformI18n("用户标签"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("体验金额/体验天数"),
      prop: "userBank",
      width:'200px'
    },{
      label: transformI18n("派送状态"),
      prop: "userBank"
    },{
      label: transformI18n("操作时间"),
      prop: "userBank",
    },{
      label: transformI18n("操作"),
      prop: "userBank",
      fixed: "right"
    }
];
const tableData = [
  {
    id: '1',
    time: '2321',
    lebal: '标签',
    rec_name: '提现汇率',
    username: '用户名',
    bank: '银行名称',
    bankcode:'银行卡号',
    userBank:'开户者姓名'
  }
]
const ruleForm = reactive({
  username: '',
  daili: '',
  nickname: '',
  zhudui: '',
  kedui: '',
  danhao: '',
  time: '',
  beili: '',
  stuts: {
    value: '',
    options: [
      {
        label: '人工增加',
        value: '1',
      },{
        label: '人工减少',
        value: '2',
      },{
        label: '赠送彩金',
        value: '3',
      },{
        label: 'VIP等级彩金',
        value: '4',
      },{
        label: '充值返利',
        value: '5',
      }
    ]
  },
  fundType: {
    value: '',
    options: [
      {
        label: '普通用户',
        value: '1',
      },{
        label: '测试',
        value: '2',
      }
    ]
  }
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

</script>

<template>
  <div>
      <div class="title">{{ title }}</div>
      <div class="bankcard-box1">
          <el-form :inline="true" :model="ruleForm" :rules="rules">
            <el-form-item prop="username" class="item">
              <el-input  v-model="ruleForm.username" :placeholder="$t('用户名')" />
            </el-form-item>
            <el-form-item prop="username" class="item">
              <el-input  v-model="ruleForm.username" :placeholder="$t('优惠代码')" />
            </el-form-item>
            <el-form-item  class="item">
              <el-button type="primary">{{ $t('搜索') }}</el-button>
            </el-form-item>
          </el-form>
      </div>
      <div class="bankcard-box2 flex-bc">
          <div>
            <el-button type="primary" plain>{{ $t('注册首存') }}</el-button>
            <el-button type="primary" plain>{{ $t('再存优惠') }}</el-button>
            <el-button type="primary" plain>{{ $t('一般优惠') }}</el-button>
            <el-button type="primary" plain>{{ $t('体验金') }}</el-button>
          </div>
      </div>
      <div class="bankcard-box3">
          <pure-table :border="true" :data="tableData" width="100%" :height="400"  :columns="columns" />
      </div>
  </div>
</template>

<style scoped lang="scss">
.title{
  font-size: 16px;
  font-weight: bold;
  margin-top:20px;
  margin-bottom:10px;
  color:var(--el-color-primary);
}
  .bankcard-box1{
    display: flex;
    flex-wrap: wrap;
    .item{
      margin-right: 5px;
      margin-bottom: 10px;
    }
  }
  .bankcard-box2{
    margin:10px 0;
    margin-top:20px;
   color:var(--el-color-danger);
  }
  .autoFefresh{

  }
  .top-box{
      margin-bottom:20px;
    }
</style>
