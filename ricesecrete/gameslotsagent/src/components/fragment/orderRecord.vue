<script setup lang='tsx'>
import { ref,reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { transformI18n } from "@/plugins/i18n";

const columns = [//TableColumnList
    {

      type: "selection",
      align: "left",
      fixed: "left",
    }, {
      label: transformI18n("下注时间"),
      prop: "time"
    },{
      label: transformI18n("注单编号"),
        prop:'code'
    },
    {
      label: transformI18n("用户名"),
      prop: "username",
    }, {
      label: transformI18n("用户标签/赔率类型"),
      prop: "label"
    }, {
      label: transformI18n("联赛名称"),
       prop: "bank"
    }, {
      label: transformI18n("赔率%"),
      prop: "bankcode"
    }, {
      label: transformI18n("投注项"),
      prop: "userBank"
    }, {
      label: transformI18n("投注金额"),
      prop: "userBank"
    }, {
      label: transformI18n("金额类型"),
      prop: "userBank"
    }, {
      label: transformI18n("输赢"),
      prop: "userBank"
    }, {
      label: transformI18n("备注"),
      prop: "userBank"
    }, {
      label: transformI18n("注单状态"),
      prop: "userBank"
    }, {
      label: transformI18n("结算时间"),
      prop: "userBank"
    },{
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
    <div class="flex-bc top-box">
      <div/>
      <el-button type="primary">
          <template #icon>
            <IconifyIconOffline :size="26" icon="refresh-right" />
          </template>
          {{ $t('刷新') }}
      </el-button>
    </div>
      <div class="bankcard-box1">
          <el-form :inline="true" :model="ruleForm" :rules="rules">
            <el-form-item prop="username" class="item">
              <el-input  v-model="ruleForm.username" :placeholder="$t('用户id/用户名')" />
            </el-form-item>
            <el-form-item prop="daili" class="item">
              <el-input v-model="ruleForm.daili" :placeholder="$t('代理名')" />
            </el-form-item>
            <el-form-item prop="nickname" class="item">
              <el-input v-model="ruleForm.nickname" :placeholder="$t('联赛名称')" />
            </el-form-item>
            <el-form-item prop="zhudui" class="item">
              <el-input v-model="ruleForm.zhudui" :placeholder="$t('主队')" />
            </el-form-item>
            <el-form-item prop="kedui" class="item">
              <el-input v-model="ruleForm.kedui" :placeholder="$t('客队')" />
            </el-form-item>
            <el-form-item prop="danhao" class="item">
              <el-input v-model="ruleForm.danhao" :placeholder="$t('单号')" />
            </el-form-item>
            <el-form-item prop="time" class="item">
              <!-- <el-input v-model="ruleForm.time" :placeholder="$t('下注时间')" /> -->
              <el-date-picker
                v-model="ruleForm.time"
                type="daterange"
                range-separator=" - "
                :start-placeholder="$t('开始时间')"
                :end-placeholder="$t('结束时间')"
              />
            </el-form-item>
            <el-form-item prop="beili" class="item">
              <el-input v-model="ruleForm.beili" :placeholder="$t('超出倍率')" />
            </el-form-item>
            <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('状态')">
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
    margin:20px 0;
    // &-btn{

    // }
  }
  .top-box{
      margin-bottom:20px;
    }
</style>
