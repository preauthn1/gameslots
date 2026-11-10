<script setup lang="tsx">
import { reactive,defineAsyncComponent,ref,computed } from 'vue';
import { gameUserReport } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
import { useDataLoad } from "@/components/table/dataLoad";
defineOptions({
  name: 'gameUserDayReport'
})
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/game/user_report');
const columns: TableColumnList = [
  {
    headerRenderer: () => transformI18n("用户"),
    prop: "username",
    cellRenderer: ({ row }) => (
      <>
      <div onClick={() => showUserInfo(row.su_uid)}>
        <p>UID:{row.su_uid}</p>
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
    headerRenderer: () => transformI18n("日期"),
    prop: "su_dt",
  },
  {
    headerRenderer: () => transformI18n("投注数量"),
    prop: "su_betnum",
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("投注金額"),
    prop: "su_bet",
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("有效投注"),
    prop: "su_validwater",
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("输赢"),
    prop: "su_otherwin",
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("获利比"),
    slot: "user_win_rate",
    sortable: true
  }
];
const props = defineProps({
    uid: String,
})
const uid = computed(() => {
  return props.uid;
})
//以下是搜索框的数据
const searchList = {
  username:{
    type: 'input',
    placeholder: '请输入UID/用户名/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  agent_name: {
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    prop: 'agent_name'
  },
  date:{
    type: 'date',
    prop: 'date',
    value: ():Array<string> => {
      return []
    }
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export:{
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
};
const searchListBox = reactive({ searchList });
//条件数据
const queryParams = reactive({
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  username: uid.value ? uid.value.toString() : '',
  date: '',
  agent_name: '',
  export: 0
});
const tableData = reactive({ dataList });

if(uid.value){
  searchListBox.searchList['username'].value = uid.value;
}

const total_su_betnum = ref(0)
const total_su_bet = ref(0)
const total_su_validwater = ref(0)
const total_su_otherwin = ref(0)


//首次需要加载的接口
init();
function init() {
  queryParams.export = 0;
  pagination.currentPage = 1;
  onInitList(queryParams,(res) => {
    if (res.code == 1) {
      // console.log(res);
      total_su_betnum.value = res.total_data.total_su_betnum;
      total_su_bet.value = res.total_data.total_su_bet;
      total_su_validwater.value = res.total_data.total_su_validwater;
      total_su_otherwin.value = res.total_data.total_su_otherwin;
    }
  })
}

const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
}
//搜索
const handleSerch = () => {
  init();
}
//导出
const handleExport = () => {
  queryParams.export = 1
  gameUserReport(queryParams).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const sortChange = (res) => {
  queryParams.field = res.prop;
  if (res.order) {
    queryParams.order = res.order == 'descending' ? 'DESC' : 'ASC';
  } else {
    queryParams.order = '';
  }
  init()
  return false;
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};


</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc flex-fi" >
        <div style="margin-right:20px;font-size: 14px;" >
          <el-tag size="large" style="margin-right:5px">{{ $t('投注总数量') }}:{{total_su_betnum}}</el-tag>
          <el-tag size="large" style="margin-right:5px">{{ $t('投注总金额') }}:{{total_su_bet}}</el-tag>
          <el-tag size="large" style="margin-right:5px">{{ $t('总有效投注') }}:{{total_su_validwater}}</el-tag>
          <el-tag type="danger" size="large" style="margin-right:5px">{{ $t('输赢') }}:{{total_su_otherwin}}</el-tag>
        </div>
    </div>
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
       <div class="tip">{{ $t('数据最多有5分钟延迟') }}</div>
    </div>
    <pure-table :loading="loading" :loading-config="loadingConfig" adaptive :adaptiveConfig="adaptiveConfig"
      :pagination="pagination" @page-size-change="onSizeChange" @page-current-change="onCurrentChange"
      :data="tableData.dataList" width="100%" :columns="columns" @sort-change="sortChange">
        <template #user_win_rate="{row}">
          {{ row.su_validwater > 0 ? parseFloat(row.su_otherwin/row.su_validwater*100).toFixed(2) : 0 }}%
        </template>
    </pure-table>
  </div>
</template>
<style scoped lang="scss">
.line-box{
  margin:10px 0;
}
.tip{
  font-size: 14px;
  color:var(--el-color-danger);
}
</style>
