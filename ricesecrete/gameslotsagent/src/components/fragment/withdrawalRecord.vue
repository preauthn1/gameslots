<script setup lang='tsx'>
import { ref,reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { transformI18n } from "@/plugins/i18n";

const columns = [
   {
      label: transformI18n("订"),
      prop: "time"
  },
  {
    label: transformI18n("数"),
    prop: 'code',
    width:'150px'
  },
    {
      label: transformI18n("用户"),
      prop: "username",
      width:'150px'
    }, {
      label: transformI18n("订单号"),
      prop: "label",
      width:'200px'
  },
  {
      label: transformI18n("三方订单"),
      prop: "bank",
      width:'150px'
  },
  {
      label: transformI18n("申请时间"),
      prop: "bankcode",
      width:'150px'
  },
  {
      label: transformI18n("提现"),
      prop: "userBank"
  },
  {
      label: transformI18n("手续"),
      prop: "userBank",
      width:'150px'
  },
  {
      label: transformI18n("实际"),
      prop: "userBank"
  },
  {
      label: transformI18n("币种/提现汇率/到"),
      prop: "userBank",
      width:'150px'
  },
  {
      label: transformI18n("状态"),
      prop: "userBank"
  },
  {
      label: transformI18n("代付渠道"),
      prop: "userBank",
      width:'150px'
  },
  {
      label: transformI18n("操作时间"),
      prop: "userBank",
      width:'150px'
  },
  {
      label: transformI18n("备注"),
      prop: "userBank"
  },
  {
    label: transformI18n("操作人"),
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
        label: '等待计算',
        value: '1',
      },{
        label: '已注销',
        value: '2',
      },{
        label: '输',
        value: '3',
      },{
        label: '赢',
        value: '4',
      },
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
            <el-form-item prop="nickname" class="item">
              <el-input v-model="ruleForm.nickname" :placeholder="$t('订单ID')" />
            </el-form-item>
            <el-form-item prop="zhudui" class="item">
              <el-input v-model="ruleForm.zhudui" :placeholder="$t('订单号')" />
            </el-form-item>
            <el-form-item prop="kedui" class="item">
              <el-input v-model="ruleForm.kedui" :placeholder="$t('代理用户名')" />
            </el-form-item>
             <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('审核状态')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
             <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('数据来源')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item prop="time" class="item">
              <!-- <el-input v-model="ruleForm.time" :placeholder="$t('下注时间')" /> -->
              <el-date-picker
                v-model="ruleForm.time"
                type="daterange"
                range-separator="-"
                :start-placeholder="$t('开始时间')"
                :end-placeholder="$t('结束时间')"
              />
            </el-form-item>
            <el-form-item prop="danhao" class="item">
              <el-input v-model="ruleForm.danhao" :placeholder="$t('最小金额')" />
            </el-form-item>
            <el-form-item prop="danhao" class="item">
              <el-input v-model="ruleForm.danhao" :placeholder="$t('最大金额')" />
            </el-form-item>
             <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('下单时间')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('状选择支付渠道')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item  class="item">
              <el-button type="primary">{{ $t('搜索') }}</el-button>
            </el-form-item>
            <!-- <el-form-item label="Activity zone">
              <el-select v-model="formInline.region" placeholder="Activity zone">
                <el-option label="Zone one" value="shanghai" />
                <el-option label="Zone two" value="beijing" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">Query</el-button>
            </el-form-item> -->
          </el-form>
      </div>
      <div class="bankcard-box2 flex-fi">

        <div class="flex-fi">
            USDT：
            <el-button type="warning" plain>{{ $t('待审核') }}</el-button>
            <el-button type="danger" plain>{{ $t('未通过') }}</el-button>
            <el-button type="primary" plain>{{ $t('已通过') }}</el-button>
            <el-button type="primary" plain>{{ $t('进行中') }}</el-button>
        </div>
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
    margin:15px 0;
    margin-bottom:5px;
    // &-btn{

    // }
  }
  .autoFefresh{

  }
  .top-box{
      margin-bottom:20px;
    }
</style>
