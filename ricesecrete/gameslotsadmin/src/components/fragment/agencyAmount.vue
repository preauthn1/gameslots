<script setup lang='tsx'>
import { ref, reactive } from "vue";
import { timeCycle } from '@/utils/global'
import type { FormInstance, FormRules } from "element-plus";
import { agentListCount,agentRakeBack } from "@/api/user";
import { transformI18n } from "@/plugins/i18n";
const columns = [//TableColumnList
   {
      type: "selection",
      align: "left",
      fixed: "left",
    },{
      label: transformI18n("用户名"),
      prop: "username",
    }, {
      label: transformI18n("代理返佣"),
      prop: "money",
    }, {
      label: transformI18n("注单编号"),
      prop: "zd_number",
    }, {
      label: transformI18n("状态"),
      slot: "status"
    }, {
      label: transformI18n("备注"),
      prop: "remark",
    }, {
      label: transformI18n("生成时间"),
      prop: "create_time",
    },{
      label: transformI18n("派发时间"),
      prop: "update_time"
    },{
      label: transformI18n("操作"),
      fixed: "right"
    }
];
const dataList = [];
const tableData = reactive({
  dataList
})

//以下是搜索框的数据
const list = {
  zd_number:{
    type: 'input',
    placeholder: '注单号',
    value: '',
    prop:'zd_number'
  },
  username:{
    type: 'input',
    placeholder: '用户名',
    value: '',
    prop:'username'
  },
  date: {
    type: 'time',
    placeholder: '时间',
    prop:'date',
    value: ():Array<string> => {
      return []
    }
  },
  status:{
    type: 'select',
    placeholder: '状态',
    value: '',
    prop:'status',
    options: [
      {
        value: 1,
        label: '待处理',
      },{
        value: 2,
        label: '拒绝',
      },{
        value: 3,
        label: '派发',
      },{
        value: 3,
        label: '手动派发',
      }
    ]
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox = reactive({ list });
const cList = {
  manual_price: '',
  pending_price: '',
  distribute_price: '',
  refuse_price:''
}
const countList = reactive({
    cList
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
const props = defineProps({
  uid:String
})

const pagination = reactive({
  uid: '',
  page: 1,
  limit: 12,
  total:0,
  status: '',
  zd_number: '',
  username: '',
  date: ''
})
if (props?.uid) {
  pagination.uid = props.uid
}
function init() {
  agentListCount().then((res: any) => {
    if (res.code == 1) {
      countList.cList = res;
    }
  })
  agentRakeBack(pagination).then((res: any) => {
    if (res.code == 1) {
      tableData.dataList = res.data.data;
      pagination.total = res.data.current_page
      pagination.page = res.data.current_page
    }
  })
}
init();
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
   init();
};
//搜索
const handleSerch = () => {
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }

    }
  }
  init();
}
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}

//点击btn
const btnCurrent = ref(0);
const handleBtn = (val) => {
  btnCurrent.value = val;
  pagination.status = val;
  init();
 }
</script>

<template>
  <div>
      <div class="title">{{ $t('代理返佣总额') }}</div>
      <div class="bankcard-box1">
           <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
      </div>
      <div class="bankcard-box2 flex-bc">
          <div>
            <el-button type="warning" :plain="btnCurrent == 1?false:true" @click="handleBtn(1)">{{ $t('待处理') }} {{countList.cList.pending_price}}</el-button>
            <el-button type="primary" :plain="btnCurrent == 3?false:true" @click="handleBtn(3)">{{ $t('派发') }} {{countList.cList.distribute_price}}</el-button>
            <el-button type="danger" :plain="btnCurrent == 2?false:true" @click="handleBtn(2)">{{ $t('拒绝') }} {{countList.cList.refuse_price}}</el-button>
            <el-button type="primary" :plain="btnCurrent == 4?false:true" @click="handleBtn(4)">{{ $t('手动派发') }} {{countList.cList.manual_price}}</el-button>
          </div>
          <div>
            <el-button type="primary">{{ $t('汇出') }}</el-button>
          </div>
      </div>
      <div class="bankcard-box3" v-if="tableData.dataList.length>0">
          <pure-table :border="true" :data="tableData.dataList" width="100%" :height="400"  :columns="columns" >

            <template #status="{ row }">
              <el-tag type="warning" v-if="row.status == 1" size="small">{{ $t('待处理') }}</el-tag>
              <el-tag v-if="row.status == 3" size="small">{{ $t('派发') }}</el-tag>
              <el-tag type="danger" v-if="row.status == 2" size="small">{{ $t('拒绝') }}</el-tag>
              <el-tag v-if="row.status == 4" size="small">{{ $t('手动派发') }}</el-tag>
            </template>
          </pure-table>
      </div>
       <div class="btmNav">
      <el-pagination
          class="float-right"
          v-model:currentPage="pagination.page"
          :page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[12, 24, 36, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
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
   color:var(--el-color-danger);
  }
  .autoFefresh{

  }
  .top-box{
      margin-bottom:20px;
    }
</style>
