<script setup lang="tsx">
import { reactive,defineAsyncComponent, ref, computed } from "vue";
import { userReport } from "@/api/user";
import { transformI18n } from "@/plugins/i18n";
import { useDataLoad } from "@/components/table/dataLoad";
import { message } from '@/utils/message';
defineOptions({
  name: "userReport"
});
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/user/reports');

const columns: TableColumnList = [
  {
    headerRenderer: () => transformI18n("用户名"),
    prop: "username",
    width: 200,
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
    headerRenderer: () => transformI18n("注册时间"),
    prop: "reg_time",
    width: 160,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("首存时间"),
    prop: "first_deposit_time",
    width: 160,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("最近出金时间"),
    prop: "recent_withdraw_money_time",
    width: 160,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("最近入金时间"),
    prop: "recent_deposit_money_time",
    width: 160,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("最近登陆时间"),
    prop: "login_time",
    width: 160,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("入金次数"),
    prop: "deposit_nums",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("入金总额"),
    prop: "deposit_total",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("出金次数"),
    prop: "withdrawal_nums",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("出金总额"),
    prop: "withdrawal_total",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("赠送金额"),
    prop: "total_gift",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("活动优惠"),
    prop: "action_discount",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("抽奖"),
    prop: "lottery_total",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("返佣"),
    prop: "rebate_total",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("返水"),
    prop: "rebate1_total",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("推广奖金"),
    prop: "promotion_bonus",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("任务奖励"),
    prop: "mission_rewards",
    width: 150,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("VIP周月礼金"),
    prop: "vip_bonus",
    width: 150,
    sortable: true
  }
];

//搜索的数据

const searchList = {
  username: {
    type: "input",
    placeholder: "UID/邮箱/手机号/用户名",
    value: "",
    prop: "username"
  },
  deposit_nums: {
    type: "input",
    placeholder: "入金次数",
    value: "",
    prop: "deposit_nums"
  },
  deposit_total: {
    type: "input",
    placeholder: "入金总额",
    value: "",
    prop: "deposit_total"
  },
  withdrawal_nums: {
    type: "input",
    placeholder: "出金次数",
    value: "",
    prop: "withdrawal_nums"
  },
  withdrawal_total: {
    type: "input",
    placeholder: "出金总额",
    value: "",
    prop: "withdrawal_total"
  },
  reg_time: {
    type: "time",
    placeholder: "注册时间",
    value: (): Array<string> => {
      return [];
    }
  },
  login_time: {
    type: "time",
    placeholder: "登陆时间",
    value: (): Array<string> => {
      return [];
    }
  },
  first_deposit_time: {
    type: "time",
    placeholder: "首存时间",
    value: (): Array<string> => {
      return [];
    }
  },
  recent_withdraw_money_time: {
    type: "time",
    placeholder: "最近出金时间",
    value: (): Array<string> => {
      return [];
    }
  },
  recent_deposit_money_time: {
    type: "time",
    placeholder: "最近入金时间",
    value: (): Array<string> => {
      return [];
    }
  },
  search: {
    type: "button",
    value: "搜索",
    handle: "search",
    prop: "search"
  },
  export: {
    type: "button",
    value: "导出",
    handle: "export",
    prop: "export"
  }
};
const searchListBox = reactive({
  searchList
});
const props = defineProps({
    uid: String,
})
const uid = computed(() => {
  return props.uid;
})
if(uid.value){
  searchListBox.searchList['username'].value = uid.value;
}

const queryParams = reactive({
  username: uid.value ? uid.value : '', //id 推广码 用户名 精确搜索
  reg_time: "", //用户名 手机号 邮箱 模糊搜索
  first_deposit_time: "", //用户标签
  recent_withdraw_money_time: "", //用户等级
  recent_deposit_money_time: "",
  login_time: "",
  deposit_nums: "",
  deposit_total: "",
  withdrawal_nums: "",
  withdrawal_total: "",
  total_gift: "",
  export: 0,
  field: '',
  order:''
});
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  queryParams.export = 0;
  pagination.currentPage = 1;
  onInitList(queryParams)
}

const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
}

//点击确定
const handleSerch = () => {
  init();
};
//导出
const handleExport = () => {
  queryParams.export = 1;
  userReport(queryParams).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    } else {
      message(res.msg, { type: 'error' });
    }
  });
};

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
const visibleUserInfo = ref(false);
const showUid = ref(0);
const showUserInfo = uid => {
  visibleUserInfo.value = true;
  showUid.value = uid;
};

const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach
      @export="handleExport"
      @search="handleSerch"
      @currentChange="searchChange"
      :list="searchListBox.searchList"
    />
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <el-alert type="warning">
      {{ $t('出/入金次数,出/入金总额,支持范围筛选,例如:0-100') }}
    </el-alert>
    <el-alert type="error">
      {{ $t('报表每日凌晨刷新') }}
    </el-alert>
    
    <pure-table :loading="loading" :loading-config="loadingConfig" adaptive :adaptiveConfig="adaptiveConfig"
      :pagination="pagination" @page-size-change="onSizeChange" @page-current-change="onCurrentChange"
      :data="tableData.dataList" width="100%" :columns="columns" @sort-change="sortChange"/>
    
  </div>
</template>