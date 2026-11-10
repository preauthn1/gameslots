<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { getorderData,liansaiZhudanEidt,liansaiZhudanStatusEidt } from "@/api/user";
import { timeCycle } from '@/utils/global'
import { message } from "@/utils/message";
import { exportExcel } from "@/utils/exportExcel";
import { transformI18n } from '@/plugins/i18n';
const { proxy } = getCurrentInstance();
// import { useRoute } from "vue-router";
// import { getUid, removeUid } from "@/utils/route";
// import { router } from '@/router';
//  const route = useRoute();
const columns = [
  {
      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("下注时间"),
      prop: "add_time",
      width:'200px'
    },
    {
      label: transformI18n("注單編號"),
      prop: "zd_number",
      width:'200px'
    },{
      label: transformI18n("用戶名"),
      prop: "username",
    },{
      label: transformI18n("用户标签/赔率类型"),
      slot: "zd_type",
      width:'150px'
    },{
      label: transformI18n("联赛名称"),
      prop: "ls_name",
      width:'150px'
    },{
      label: transformI18n("賠率%"),
      prop: "peilv",
    },{
      label: transformI18n("投注项"),
      // prop: "ls_team_zname",
      cellRenderer: ({ row }) => (
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{row.zd_fs} - {row.kd_fs}</span>
        </div>
      )
    },{
      label: transformI18n("投注金額"),
      prop: "tz_price",
    },{
      label: transformI18n("金额类型"),
      slot: "money_type",
    },{
      label: transformI18n("输赢"),
      prop: "sy_res",
    },{
      label: transformI18n("备注"),
      prop: "remarks",
    },{
      label: transformI18n("注单状态"),
      slot: "status",
      width:'150px'
    },{
      label: transformI18n("结算时间"),
      prop: "cancel_time",
      width:'200px'
    },{
      label: transformI18n("操作人"),
      prop: "admin_name",
    },
    {
      label: transformI18n("操作"),
      slot: "right",
      fixed: 'right',
      align: 'center',
      width:'150px'
    }
  ];

const height = window.innerHeight - 320;
//以下是搜索框的数据
const list = {
  username: {
    type: 'input',
    placeholder: '用户id/用户名',
    value: '',
    prop: 'username'
  },
  agent_name: {
    type: 'input',
    placeholder: '代理名',
    value: '',
    prop: 'agent_name'
  },
  ls_name: {
    type: 'input',
    placeholder: '联赛名称',
    value: '',
    prop: 'ls_name'
  },
  z_name: {
    type: 'input',
    placeholder: '主隊',
    value: '',
    prop: 'z_name'
  },
  k_name: {
    type: 'input',
    placeholder: '客隊',
    value: '',
    prop: 'k_name'
  },
  zd_number: {
    type: 'input',
    placeholder: '单号',
    value: '',
    prop: 'zd_number'
  },
  add_time: {
    type: 'time',
    placeholder: '赛程日期',
    prop: 'add_time',
    value: (): Array<string> => {
      return []
    }
  },
  peilv: {
    type: 'input',
    placeholder: '超出赔率',
    value: '',
    prop: 'peilv'
  },
  lebals: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    prop: 'lebals',
    options: [
      {
        label: '一般用户',
        value: 1,
      }, {
        label: '测试用户',
        value: 2,
      }
    ]
  },
  s_status: {
    type: 'select',
    placeholder: '状态',
    value: '',
    prop: 's_status',
    options: [
      {
        label: '等待结算',
        value: 1,
      }, {
        label: '已注销',
        value: 2,
      }, {
        label: '输',
        value: 3,
      }, {
        label: '赢',
        value: 4,
      }
    ]
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
};
const props = defineProps({
    uid: String,
})
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field:'',
  username: '',
  agent_name: '',
  ls_name: '',
  z_name: '',
  k_name: '',
  zd_number: '',
  add_time: '',
  peilv: '',
  lebals: '',
  s_status: '',
  uid:''
});
if (props?.uid) {
    pagination.uid = props.uid
}
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  //时间转换
   pagination.page = 1;
    for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'add_time') {
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

//首次需要加载的接口
init();
function init() {
  getorderData(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
  })
}
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
   init();
};
//导出
const handleExport = () => {
  console.log('点击导出');
  // exportExcel(columns,tableData.dataList);
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
//点击清楚uid
const scodeQuery = reactive({
  select: true,
  select_bd: true,
  sc_id: '',
  page: 1,
  total:0,
  limit:10
})
//修改
let eidtRow = {
  sc_id:'',
  id:'',
  bd_id:''
}
const handleEidt = (row) => {
  visible.value = true;
  scodeQuery.sc_id = row.id
  eidtRow = row;
   dialogModel['zd'] = row['zd_fs']
  list2Box.dialogList['zd'].value = row['zd_fs']
  dialogModel['kd'] = row['kd_fs']
  list2Box.dialogList['kd'].value = row['kd_fs']

    dialogModel['fbd_pl'] = row['peilv']
  list2Box.dialogList['fbd_pl'].value = row['peilv']
}

const visible = ref(false);

const dialogList = {
  zidingyi: {
    type: 'slot',
    label: '',
    prop: 'zidingyi',
    name:'zidingyi'
  },
  zd:{
    type: 'input',
    label: '主队比分',
    placeholder: '主队比分',
    value: '',
    prop:'zd'
  },
  kd:{
    type: 'input',
    label: '客队比分',
    placeholder: '客队比分',
    value: '',
    prop:'kd'
  },
  fbd_pl:{
    type: 'input',
    label: '赔率',
    placeholder: '赔率',
    value: '',
    prop:'fbd_pl'
  },
}
const dialogModel = reactive({
  // level_name: '',
  zd: '',
  kd: '',
  fbd_pl:''
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}

const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  dialogModel[index] = value;
}

const handleSave = () => {
  const query={
    edit:true,
    info:{
      bd_id:eidtRow.bd_id,
      id:eidtRow.id,
      sc_id:eidtRow.sc_id,
      kd_fs:dialogModel.kd,
      peilv:dialogModel.fbd_pl,
      zd_fs:dialogModel.zd
    }
  }
  liansaiZhudanEidt(query).then((res:any)=>{
    if(res.code == 1){
       remarkShow.value = false
      message(res.msg, { type: 'success' });
    }
    visible.value = false;
  })
}
const selectScode = ref(false);
//点击选择比分
const selectpopShow = () => {
  selectScode.value = true
  codeList();

}
function codeList() {
  liansaiZhudanEidt(scodeQuery).then((res: any) => {
    if (res.code == 1) {
      scodeData.scodList = res.data
      // scodeQuery.total = res.data.total
      // scodeQuery.page = res.data.current_page
    }
  })
}
const onPageSizeChange1 = (size: number) => {
  scodeQuery.limit = size;
  scodeQuery.page = 1;
  codeList();
};
const onCurrentChange1 = (current: number) => {
  scodeQuery.page = current;
   codeList();
};
const codeColumns = [
  {
      label: transformI18n("主队比分"),
      prop: "zd",
  },{
      label: transformI18n("客队比分"),
      prop: "kd",
  },{
      label: transformI18n("赔率"),
      prop: "fbd_pl",
  }, {
    slot: 'right',
    label:'操作'
  }
]
const scodList = [];
const scodeData = reactive({ scodList })
const selectCurrent = (row) => {
  for(const key in dialogModel){
    dialogModel[key] = row[key]
    list2Box.dialogList[key].value = row[key]
  }
  selectScode.value = false
}
const remark = ref('');
const remarkShow = ref(false);
let remarkCurrentRow = {
  id:''
};
const logOut = (row) => {
  remarkCurrentRow  = row;
 remarkShow.value = true
}
const remackC=()=>{
  const query={
    edit:true,
    info:{
      id:remarkCurrentRow.id,
      remarks:remark.value
    }
  }
  liansaiZhudanStatusEidt(query).then((res:any)=>{
    if(res.code == 1){
       remarkShow.value = false
      message(res.msg, { type: 'success' });
    }
  })
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <!-- <el-button type="primary">{{ $t('添加') }}</el-button> -->
      </div>
      <div class="flex-fi">
         <!-- <el-button   type="danger" @click="handleRemoveUid" v-if="pagination.uid!=''">当前是{{ pagination.uid }}用户页面，点击可清除</el-button> -->
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
     <template #status="{ row }">
          <el-tag size="small" v-if="row.status == 1">{{ $t('等待结算') }}</el-tag>
          <el-tag size="small" v-if="row.status == 2">{{ $t('已注销') }}</el-tag>
          <el-tag size="small" v-if="row.status == 3">{{ $t('输') }}</el-tag>
          <el-tag size="small" v-if="row.status == 4">{{ $t('赢') }}</el-tag>
      </template>
    <template #zd_type="{ row }">
          <el-tag size="small" v-if="row.lebal == 1">{{ $t('一般用户') }}</el-tag>
          <el-tag size="small" v-if="row.lebal == 2">{{ $t('测试用户') }}</el-tag>
          <el-tag size="small" v-if="row.zd_type == 1">{{ $t('正赔率') }}</el-tag>
          <el-tag size="small" v-if="row.zd_type == 2">{{ $t('反赔率') }}</el-tag>
      </template>
      <template #money_type="{ row }">
          <el-tag size="small" v-if="row.lebal == 1">{{ $t('余额') }}</el-tag>
      </template>
       <template #right="{ row }">
          <template v-if="row.status == 1">
            <el-button  size="small" type="primary" @click="logOut(row)">{{ $t('注销') }}</el-button>
            <el-button size="small" type="primary" @click="handleEidt(row)">{{ $t('修改') }}</el-button>
          </template>
      </template>
    </pure-table>

     <el-dialog v-model="selectScode" width="80%" :title="$t('选择比分')">
      <pure-table :data="scodeData.scodList" width="100%" :columns="codeColumns" >
      <template #right="{ row }">
            <el-button size="small" type="primary" @click="selectCurrent(row)">{{ $t('选择当前比分') }}</el-button>
        </template>
      </pure-table>
      <!-- <div class="btmNav">
      <el-pagination
          class="float-right"
          v-model:currentPage="scodeQuery.page"
          :page-size="scodeQuery.limit"
          :total="scodeQuery.total"
          :page-sizes="[12, 24, 36, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange1"
          @current-change="onCurrentChange1"
        />
    </div> -->
    </el-dialog>
    <el-dialog v-model="remarkShow" width="40%" :title="$t('设置注销备注')">
      <el-input
        v-model="remark"
        :rows="2"
        type="textarea"
        :placeholder="$t('请输入备注')"
      />
      <div style="height: 20px;"/>
       <div class="flex-bc">
        <div/>
        <div>
          <el-button type="primary" @click="remackC">{{ $t('确认') }}</el-button>
          <el-button @click="remarkShow = false">{{ $t('取消') }}</el-button>
        </div>
       </div>
    </el-dialog>
    <commDialog title="编辑" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template #zidingyi>
           <el-button size="large" type="primary" @click="selectpopShow">{{ $t('选择比分') }}</el-button>
        </template>
    </commDialog>
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
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
</style>
