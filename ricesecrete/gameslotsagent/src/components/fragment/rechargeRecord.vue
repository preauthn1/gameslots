<script setup lang='tsx'>
import { ref,reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import {useroffline,userlevelList} from "@/api/user";
import { transformI18n } from "@/plugins/i18n";

const props = defineProps({
  columns:Array
})
//页面的
const columns1 = [//TableColumnList
   {
      label: transformI18n("订单"),
      prop: "time"
    },{
      label: transformI18n("数据"),
        prop:'code'
    },
    {
      label: transformI18n("用户名"),
      prop: "username",
      width:'150px'
    }, {
      label: transformI18n("用户标"),
      prop: "label",
      width:'200px'
    }, {
      label: transformI18n("订单号"),
      prop: "bank",
       width:'200px'
    }, {
      label: transformI18n("申请时间"),
      prop: "bankcode",
      width:'200px'
    }, {
      label: transformI18n("申请金"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("币种/充值汇率/到账金"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("状态"),
      prop: "userBank"
    }, {
      label: transformI18n("支付渠道"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("审核时间"),
      prop: "userBank",
      width:'160px'
    },{
      label: transformI18n("备注"),
      prop: "userBank"
    },{
      label: transformI18n("操作员"),
      prop: "userBank",
      fixed: "right"
    },{
      label: transformI18n("操作"),
      prop: "userBank",
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button type="primary" >{ transformI18n('查看') }</el-button>
        </>
      )
    }
];
//弹框的
const columns2 = [//TableColumnList
   {
      label: transformI18n("订"),
      prop: "time"
    },{
      label: transformI18n("数"),
        prop:'code'
    },
    {
      label: transformI18n("用户"),
      prop: "username",
      width:'150px'
    }, {
      label: transformI18n("用户标"),
      prop: "label",
      width:'200px'
    }, {
      label: transformI18n("订单号"),
      prop: "bank",
       width:'200px'
    }, {
      label: transformI18n("申请时间"),
      prop: "bankcode",
      width:'200px'
    }, {
      label: transformI18n("申请"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("币种/充值汇率/到"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("状态"),
      prop: "userBank"
    }, {
      label: transformI18n("支付渠道"),
      prop: "userBank",
      width:'150px'
    }, {
      label: transformI18n("审核时间"),
      prop: "userBank",
      width:'160px'
    },{
      label: transformI18n("操作员"),
      prop: "userBank"
    },{
      label: transformI18n("备注"),
      prop: "userBank",
      fixed: "right"
    }
];
const searchList: any = [
  {
    type: 'input',
    placeholder: '付款卡号',
    value: ''
  },{
    type: 'input',
    placeholder: '用户名',
    value: ''
  },{
    type: 'input',
    placeholder: '代理用户名',
    value: ''
  },{
    type: 'input',
    placeholder: '订单ID',
    value: ''
  },{
    type: 'input',
    placeholder: '订单号',
    value: ''
  },{
    type: 'input',
    placeholder: '三方订单号',
    value: ''
  },{
    type: 'select',
    placeholder: '审核状态',
    value: '',
    options: [
      {
        value: '1',
        label: '待审核',
      },{
        value: '2',
        label: '未通过',
      },{
        value: '3',
        label: '已通过',
      },{
        value: '4',
        label: '手动入款',
      },
    ]
  },
  {
    type: 'select',
    placeholder: '数据来源',
    value: '',
    options: [
    {
        value: '1',
        label: '银行转账',
      },{
        value: '2',
        label: '线上渠道',
      },{
        value: '3',
        label: 'USDT渠道',
      },{
        value: '4',
        label: 'USDT转账',
      },{
        value: '5',
        label: '银商',
      },
    ]
  }, {
    type: 'time',
    placeholder: '时间',
    value: ():Array<string> => {
      return []
    }
  },

 {
    type: 'input',
    placeholder: '最小金额',
    value: ''
  },{
    type: 'input',
    placeholder: '最大金额',
    value: ''
  },
  // {
  //   type: 'select',
  //   placeholder: '支付渠道',
  //   value: '',
  //   options: [
  //     {
  //       value: '1',
  //       label: '下单时间',
  //     },{
  //       value: '2',
  //       label: '审核时间',
  //     },
  //   ]
  // },
  {
    type: 'select',
    placeholder: '选择支付渠道',
    value: '',
    options: [
      {
        value: '1',
        label: 'usldpay',
      }
    ]
  },
  {
    type: 'select',
    placeholder: '时间类型',
    value: '',
    options: [
      {
        value: '1',
        label: '下单时间',
      },{
        value: '2',
        label: '审核时间',
      },
    ]
  },
  {

    type: 'select',
    placeholder: '充值类型',
    value: '',
    options: [
      {
        value: '1',
        label: '首充',
      },{
        value: '2',
        label: '复充',
      },
    ]
  },{
    type: 'select',
    placeholder: '用户等级',
    value: '',
    options: []
  },{
    type: 'select',
    placeholder: '用户标签',
    value: '',
    options: [
      {
        value: '1',
        label: '一般用户',
      },{
        value: '2',
        label: '测试用户',
      },
    ]
  },
  // {
  //   type: 'input',
  //   placeholder: '三方订单号',
  //   value: ''
  // },
  // {
  //   type: 'select',
  //   placeholder: 'VIP等级',
  //   value: '',
  //   options: []
  // },
  {
    type: 'input',
    placeholder: '备注',
    value: ''
  }, {
    type: 'button',
    value:'搜索'
  }, {
    type: 'button',
    value:'导出'
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
interface tabinfo {
  page: number,
  limit: number,
  total: number,
  order: string,
  field: string,
  bankcrad: string,
  username: string,
  agent_name: string,
  order_id:string,
  order_sn: string,
  three_order_sn: string,
  status: string,
  date: string,
  time_type: string,
  recharge_type: string,
  level_id: string,
  lebals: string,
  set_content: string,
  // channel: string,
  // pay_type: string,
}
const pagination = ref<tabinfo>({
  // channel: '',
  // pay_type: '',

  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  order: 'desc',//排序 desc 或 asc
  field: 'id',//排序字段 id 或 balance
  bankcrad: '',
  username: '',
  agent_name: '',
  order_id: '',
  order_sn: '',
  three_order_sn:'',
  status: '',
  date: '',
  time_type: '',
  recharge_type: '',
  level_id: '',
  lebals: '',
  set_content:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  useroffline(pagination.value).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
  })
  // userlevelList(query).then((res: any) => {
  //   let list = res.data;
  //   let arr = [];
  //   list.forEach(item => {
  //      let obj = {
  //       value: item.id,
  //       label: item.level_name,
  //      }
  //     arr.push(obj);

  //   });
  //   searchList[5].options = arr;
  // })
}

const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init(pagination.value);
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
   init(pagination.value);
};

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
    <!-- <div class="flex-bc top-box">
      <div></div>
      <div>
          <el-button type="warning" >
            <template #icon>
              <IconifyIconOffline :size="26" icon="refresh-right" />
            </template>
            刷新
        </el-button>
        <el-button type="danger">{{ $t('自动刷新') }}</el-button>
      </div>

    </div> -->
      <div class="bankcard-box1">
          <!-- <el-form :inline="true" :model="ruleForm" :rules="rules">
            <el-form-item prop="username" class="item">
              <el-input  v-model="ruleForm.username" :placeholder="$t('付款卡号')" />
            </el-form-item>
            <el-form-item prop="daili" class="item">
              <el-input v-model="ruleForm.daili" :placeholder="$t('代理用户名')" />
            </el-form-item>
            <el-form-item prop="nickname" class="item">
              <el-input v-model="ruleForm.nickname" :placeholder="$t('订单ID')" />
            </el-form-item>
            <el-form-item prop="zhudui" class="item">
              <el-input v-model="ruleForm.zhudui" :placeholder="$t('订单号')" />
            </el-form-item>
            <el-form-item prop="kedui" class="item">
              <el-input v-model="ruleForm.kedui" :placeholder="$t('三方订单号')" />
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
            <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('充值类型')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('用户等级')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item class="item">
              <el-select v-model="ruleForm.stuts.value" :placeholder="$t('用户标签')">
                <el-option v-for="(cell,index) in ruleForm.stuts.options" :key="index" :label="cell.label" :value="cell.value" />
              </el-select>
            </el-form-item>
            <el-form-item prop="danhao" class="item">
              <el-input v-model="ruleForm.danhao" :placeholder="$t('备注')" />
            </el-form-item>
            <el-form-item  class="item">
              <el-button type="primary">{{ $t('搜索') }}</el-button>
            </el-form-item>
            <el-form-item label="Activity zone">
              <el-select v-model="formInline.region" placeholder="Activity zone">
                <el-option label="Zone one" value="shanghai" />
                <el-option label="Zone two" value="beijing" />
              </el-select>
            </el-form-item>-
            <el-form-item>
              <el-button type="primary" @click="onSubmit">Query</el-button>
            </el-form-item>
          </el-form> -->
          <el-form :inline="true" :model="searchList">
            <el-form-item v-for="(item,index) in searchList" :key="index" class="item">
               <template v-if="item.type == 'input'">
                  <el-input v-model="item.value" :placeholder="item.placeholder" />
               </template>
               <template v-else-if="item.type == 'select'">
                  <el-select v-model="item.value" :placeholder="item.placeholder">
                    <el-option v-for="(cell,idx) in item.options" :key="idx" :label="cell.label" :value="cell.value" />
                  </el-select>
               </template>
               <template v-else-if="item.type == 'time'">
                  <el-date-picker
                    v-model="item.value"
                    type="daterange"
                    range-separator="-"
                    :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')"
                  />
               </template>
               <template v-else>
                  <el-button type="primary">{{ item.value }}</el-button>
               </template>
            </el-form-item>
          </el-form>
      </div>
      <div class="bankcard-box2 flex-bc">
        <div class="flex-fi">
            银行卡：
            <el-button type="warning"  plain>待审核0</el-button>
            <el-button type="danger" plain>未通过0</el-button>
            <el-button type="primary" plain>已通过0</el-button>
        </div>
        <div class="flex-fi">
            USDT：
            <el-button type="warning" plain>待审核0</el-button>
            <el-button type="danger" plain>未通过0</el-button>
            <el-button type="primary" plain>已通过0</el-button>
        </div>
        <div class="flex-fi">
            银商：
            <el-button type="warning" plain>待审核0</el-button>
            <el-button type="danger" plain>未通过0</el-button>
            <el-button type="primary" plain>已通过0</el-button>
        </div>
      </div>
      <div class="bankcard-box3">
          <pure-table :border="true" :data="tableData.dataList" width="100%" :height="400"  :columns="columns1" />
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
