<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent,getCurrentInstance } from 'vue';
import { actionApplyList, actionApplyps, actionApplyDistribute } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'applyManage'
})
const columns = [
    {
      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("申请时间"),
      prop: "add_time",
       width:'160x',
    },{
      label: transformI18n("优惠类型"),
      slot: "base_type",
      width:'150x',
    },
    {
      label: transformI18n("优惠代码"),
      prop: "dis_code",
       width:'150x',
    },{
      label: transformI18n("用戶名"),
      prop:'username',
      width: 200,
      fixed: true,
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
    },{
      label: transformI18n("用户标签"),
      width: '150px',
      slot:'lebal'
    },{
      label: transformI18n("金额"),
      prop: "ck_hl_amount",
      width:'150x',
      cellRenderer: ({ row }) => (
        <>
          {row.gd_amount > 0 ? row.gd_amount : row.ck_hl_amount}
        </>
      )
    },{
      label: transformI18n("积分"),
      prop: "integral",
       width:'150x',
    },{
      label: transformI18n("派送状态"),
      slot: "ps_status",
       width:'150x',
    },{
      label: transformI18n("操作时间"),
      prop: "ps_deta",
       width:'160x',
    },{
      label: transformI18n("操作"),
      fixed: 'right',
      width: '120x',
      slot:'right'
    },
];

const props = defineProps({
  uid: String,
  summaryTitle:String
})


const height = window.innerHeight - 240;
//以下是搜索框的数据

//以下是搜索框的数据
const searchList = {
  username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  ps_status: {
    type: 'select',
    placeholder: '派送状态',
    value: '',
    prop: 'ps_status',
    options: [
      {label: '已派发', value: 1},
      {label: '已拒绝', value: 2},
      {label: '未派送', value: 0},
    ],
  },
  apply_date:{
    type: 'time',
    placeholder: '申请时间',
    prop:'apply_date',
    value: ():Array<string> => {
      return []
    }
  },
  dis_code: {
    type: 'input',
    placeholder: '优惠代码',
    value: '',
    prop: 'dis_code'
  },
  base_type: {
    type: 'select',
    placeholder: '活动类别',
    value: '',
    prop: 'base_type',
    options: [
      {label: '注册首存', value: 1},
      {label: '再存优惠', value: 2},
      {label: '一般优惠', value: 3},
      {label: '体验金', value: 4},
      {label: '游戏救援金', value: 6},
      {label: '推荐奖励', value: 7},
    ],
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
}
const searchListBox = reactive({
  searchList
})
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  export: 0,
  order: '',//排序 desc 或 asc
  field: '',
  username: '',
  dis_code: '',
  base_type: '',
  apply_date: '',
  ps_status: '',
  uid:''
});
if (props?.uid) {
  pagination.uid = props.uid
}
const dataList: any = [];
const tableData = reactive({ dataList });

//首次需要加载的接口
init();
function init() {
  pagination.export = 0;
  actionApplyList(pagination).then((res: any) => {
    // console.log(res.data);
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    countDataBox.value = res.statistics
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
//搜索
const handleSerach = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'apply_date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
  pagination.page = 1;
  init();
}

//导出
const handleExport = () => {
  pagination.export = 1;
  actionApplyList(pagination).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
  })
}
//导出弹窗列表
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};
//当前某个发生变化
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}


//选中删除
let selectAll = [];
const handleSelectionChange = (val) => {
  selectAll = val;
}
const getIds =()=>{
  const s_arr = [];
  selectAll.forEach(item => {
    s_arr.push(item.id)
  })
  return s_arr.join(',');
}
//获取当前时间
//点击btn
const batchPs = () => {
  if (selectAll.length <= 0) {
    message(transformI18n('请选择要派发的数据'), { type: 'error' });
    return;
  }
  proxy.$confirm(transformI18n('是否一键派发'), transformI18n('提示')).then(() => {
    actionApplyDistribute({id: getIds()}).then((res: any) => {
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
//点击派送跟决绝
const handleEidt = (row,val) => {
  const msg = val == 1?'确认派送吗？':'确认要拒绝派送吗？'
   proxy.$confirm(msg, '提示').then(() => {
    // selectDelete(id);
    sendStatus(row,val);
  }).catch(() => {
      console.log('取消');
  })
}
function sendStatus(row,val) {
  const query = {
    eidt: true,
    info: {
      id:row.id,
      ps_status:val
    }
  }
  actionApplyps(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
const countDataBox: any = ref({})
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <div class="title" v-if="summaryTitle">{{ summaryTitle }}</div>
    <commSerach @export="handleExport" @search="handleSerach" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('edit')" type="primary" @click="batchPs()">{{ $t('一键派送') }}</el-button>
      </div>
      <div class="flex-bc" >
        <div style="margin-left:20px;font-size: 14px;" >
          <el-tag size="large">{{ $t('已派送') }}:{{countDataBox.checked}}</el-tag>
          <el-tag size="large">{{ $t('人数') }}:{{countDataBox.people_count}}</el-tag>
          <el-tag type="warning">{{ $t('未审核') }}:{{countDataBox.no_check}}</el-tag>
          <el-tag type="danger" size="large">{{ $t('已拒绝') }}:{{countDataBox.refuse}}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
        <template #base_type="{ row }">
          <el-tag size="small" type="success" v-if="row.base_type == 1">{{ $t('注册首存') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.base_type == 2">{{ $t('再存优惠') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.base_type == 3">{{ $t('一般优惠') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.base_type == 4">{{ $t('体验金') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.base_type == 5">{{ $t('展示活动') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.base_type == 6">{{ $t('游戏救援金') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.base_type == 7">{{ $t('推荐奖励') }}</el-tag>
        </template>
        <template #lebal="{ row }">
          <el-tag v-if="row.lebal == 1">{{ $t('一般用户') }}</el-tag>
          <el-tag type="danger" v-if="row.lebal == 2">{{ $t('测试用户') }}</el-tag>
        </template>
        <template #right="{ row }">
          <template v-if="row.ps_status == 0 && hasAuth('edit')">
              <el-button style="margin-bottom:15px;" size="small" type="primary" @click="handleEidt(row,1)">{{ $t('派发') }}</el-button><br />
              <el-button size="small" type="danger" @click="handleEidt(row,2)">{{ $t('拒绝派发') }}</el-button>
          </template>
        </template>
        <template #ps_status="{ row }">
          <el-tag v-if="row.ps_status == 0">{{ $t('未派送') }}</el-tag>
          <el-tag type="success" v-if="row.ps_status == 1">{{ $t('已派送') }}</el-tag>
          <el-tag type="danger" v-if="row.ps_status == 2">{{ $t('已拒绝') }}</el-tag>
        </template>
        <template #ck_hl_amount="{ row }">
            <span v-if="row.base_type == 1 || row.base_type == 2">{{ row.ck_hl_amount }}</span>
            <span v-if="row.base_type == 3">{{ row.gd_amount }}</span>
            <span v-if="row.base_type == 4">{{ row.tyj_amount }}/{{ row.tyj_date }}</span>
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

  </div>
</template>
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
.title{
  font-size: 16px;
  font-weight: bold;
  margin-top:20px;
  margin-bottom:10px;
  color:var(--el-color-primary);
}
</style>
