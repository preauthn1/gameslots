<script setup lang='tsx'>
import { ref,reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { transformI18n } from "@/plugins/i18n";

const columns = [//TableColumnList
   {
      label: transformI18n("ID"),
      prop: "time"
    },{
      label: transformI18n("基金名称"),
        prop:'code'
    },
    {
      label: transformI18n("基金类型"),
      prop: "username",
      width:'150px'
    }, {
      label: transformI18n("用户名"),
      prop: "label",
      width:'150px'
    }, {
      label: transformI18n("用户标签"),
      prop: "bank",
       width:'200px'
    }, {
      label: transformI18n("购买金额"),
      prop: "bankcode",
      width:'200px'
    }, {
      label: transformI18n("收益"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("收益开始/结束时间"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("状态"),
      prop: "userBank"
    }, {
      label: transformI18n("提现时间"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("购买时间"),
      prop: "userBank",
      width:'160px'
    },{
      label: transformI18n("退回时间"),
      prop: "userBank"
    },{
      label: transformI18n("支付类型"),
      prop: "userBank"
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
        label: '正常',
        value: '1',
      },{
        label: '已返回',
        value: '2',
      },{
        label: '手动退回',
        value: '3',
      }
    ]
  },
  fundType: {
    value: '',
    options: [
      {
        label: '活期',
        value: '1',
      },{
        label: '定期',
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
      <div class="bankcard-box1">
          <el-form :inline="true" :model="ruleForm" :rules="rules">
            <el-form-item prop="username" class="item">
              <el-input  v-model="ruleForm.username" :placeholder="$t('基金名称')" />
            </el-form-item>
             <el-form-item class="item">
              <el-select v-model="ruleForm.fundType.value" :placeholder="$t('基金类型')">
                <el-option v-for="(cell,index) in ruleForm.fundType.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
             <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('状态')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item prop="time" class="item">
              <el-date-picker
                v-model="ruleForm.time"
                type="daterange"
                range-separator="-"
                :start-placeholder="$t('开始时间')"
                :end-placeholder="$t('结束时间')"
              />
            </el-form-item>
            <el-form-item  class="item">
              <el-button type="primary">{{ $t('搜索') }}</el-button>
            </el-form-item>
          </el-form>
      </div>
      <div class="bankcard-box2 flex-bc">
         {{ $t('tips') }}:{{ $t('只有定期基金订单才会显示收益') }}
      </div>
      <div class="bankcard-box3">
          <pure-table :border="true" :data="tableData" width="100%" :height="400"  :columns="columns" />
      </div>
  </div>
</template>

<style scoped lang="scss">
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
   color:var(--el-color-danger);
  }
  .autoFefresh{

  }
  .top-box{
      margin-bottom:20px;
    }
</style>
