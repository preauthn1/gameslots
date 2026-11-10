<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { agentSelllogList,agentReject,agentSell } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { http } from "@/utils/http";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
    selectable: (row) => {
      return row.status == 1
    }
  },
  {
      label: transformI18n("用户名"),
      prop: "username",
      cellRenderer: ({ row }) => (
        <>
        <div onClick={() => showUserInfo(row.uid)}>
          <p>UID:{row.uid}</p>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
        </>
      )
  },
  {
    label: transformI18n("推广奖金"),
    prop: "money",
  }, {
    label: transformI18n("状态"),
    slot: "status",
  }, {
    label: transformI18n("派发人数"),
    slot: "rec_person",
  }, {
    label: transformI18n("备注"),
    prop: "remark",
  }, {
    label: transformI18n("时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("操作"),
    slot:'right'
  }
];

const selectAll = ref([]);
const handleSelectionChange = (val) => {
  selectAll.value = val;
}
// 审核
const handleReview = (row,idx) => {
  const msg = idx == 1?'确认拒绝吗？':'确认派发吗？';
  const query={
    edit:true,
    id:row.id
  }
   proxy.$confirm(transformI18n(msg), '提示').then(() => {
    idx==1 ? noSend(query) : send(query);
  }).catch(() => {
    console.log('取消');
  })
}
function noSend(query){
  http.post('/agent_selllog/reject', {data: query}).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  });
}
function send(query){
  http.post('/agent_selllog/sell', {data: query}).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  });
}

const getIds =()=>{
  const s_arr = [];
  selectAll.value.forEach(item => {
    if (item.status == 1) {
      s_arr.push(item.id)
    }
  })
  return s_arr.join(',');
}

const batchPs = (type) => {
  if (selectAll.value.length <= 0) {
    message(transformI18n('请选择要派发的数据'), { type: 'error' });
    return;
  }
  const msg = type == 1 ? '确认拒绝吗？':'确认派发吗？';
  proxy.$confirm(transformI18n(msg), transformI18n('提示')).then(() => {
    http.post('/agent_selllog/batch', {data: {id: getIds(), type: type}}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })
}
//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
   username:{
    type: 'input',
    placeholder: '用户名',
    value: '',
    prop:'username'
  },
  date:{
    type: 'time',
    placeholder: '时间',
    value: ():Array<string> => {
      return []
    },
    prop:'date'
  },
   status:{
    type: 'select',
    placeholder: '状态',
     value: '',
     options: [
       {
         label: '待处理',
        value:1,
       },{
         label: '拒绝',
        value:2,
       },{
         label: '派发',
        value:3,
       },
    ],
    prop:'status'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
  export:{
    type: 'button',
    value: '导出',
    handle: 'export',
    prop:'export'
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username:'',
  date:'',
  status:'',

});
const dataList: any = [];
const tableData = reactive({ dataList });
const statData: any = ref({})
//获取列表数据
init();
function init(query?: object) {
  agentSelllogList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    statData.value = res.stat
  })
}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init(pagination);
};

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
    pagination.page = 1;
    init(pagination);
}

//导出
const handleExport = () => {
  http.post('/agent_selllog/excel', {data: pagination}).then((res:any)=>{
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
    <menuList />
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
     <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
     <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('edit')" :disabled="selectAll.length <= 0" type="primary" @click="batchPs(2)">{{ $t('一键派送') }}</el-button>
        <el-button v-if="hasAuth('edit')" :disabled="selectAll.length <= 0" type="danger" @click="batchPs(1)">{{ $t('一键拒绝') }}</el-button>
      </div>
      <div class="flex-bc flex-fi" >
        <template v-for="row,idx in statData" :key="idx">
          <el-tag size="large" type="warning" v-if="row.status == 1">{{ $t('待处理') }}:{{ row.money }}</el-tag>
          <el-tag size="large" type="danger" v-else-if="row.status == 2">{{ $t('拒绝') }}:{{ row.money }}</el-tag>
          <el-tag size="large" type="success" v-else-if="row.status == 3">{{ $t('已派发') }}:{{ row.money }}</el-tag>
        </template>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #right="{row}">
        <template  v-if="row.status == 1">
          <el-button size="small" v-if="hasAuth('edit')" type="danger" @click="handleReview(row,1)" >{{ $t('拒绝') }}</el-button>
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleReview(row,2)">{{ $t('派发') }}</el-button>
        </template>
      </template>
      <template #status="{row}">
        <!-- //状态：1，未处理，2，拒绝，3，派发 -->
        <el-tag type="warning" v-if="row.status == 1">{{ $t('待处理') }}</el-tag>
        <el-tag type="danger" v-else-if="row.status == 2">{{ $t('拒绝') }}</el-tag>
        <el-tag type="success" v-else-if="row.status == 3">{{ $t('已派发') }}</el-tag>
      </template>
      <template #rec_person="{row}">
        <el-tag type="success">{{ row.received_people_num }} / {{ row.rec_person }}</el-tag>
      </template>
    </pure-table>
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
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
  margin-top: 20px;
}
</style>
