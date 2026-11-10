<script setup lang="tsx">
import { reactive,defineAsyncComponent,ref} from "vue";
import { transformI18n } from "@/plugins/i18n";
import { useDataLoad } from "@/components/table/dataLoad";
import { gameReport } from "@/api/user";
import { message } from "@/utils/message";
defineOptions({
  name: "gameReportDay",
});
const {
  loading,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  dataList
} = useDataLoad('/game/report');
const props = defineProps({
  query: Object
})
const tableData = reactive({ dataList });
const columns: TableColumnList = [
    {
      label: transformI18n("时间/ID"),
      prop:'date'
    },{
      label: transformI18n("名称/邀请码"),
      prop:'name'
    },
    {
      label: transformI18n("投注总额"),
      prop: "tz_price",
    },{
      label: transformI18n("有效投注总额"),
      prop: "bet_valid_amount",
    },{
      label: transformI18n("投注笔数"),
      prop: "tz_num",
    },{
      label: transformI18n("派彩金额"),
      prop: "tz_win",
    },{
      label: transformI18n("平台盈亏"),
      prop: "tz_ptsy",
    }
];

//搜索的数据
const searchList = {
  type: {
    type: 'select',
    placeholder: '统计类型',
    value: 0,
    prop: 'type',
    options: [
      // {
      //   label: '按小时统计',
      //   value: 0,
      // }, 
      {
        label: '按子游戏统计',
        value: 0,
      }, {
        label: '按会员统计',
        value: 1,
      }, {
        label: '按游戏平台统计',
        value: 2,
      }
    ]
  },
  search:{
    type: 'button',
    value:'搜索',
    handle: 'search',
    prop: 'search',
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

const queryParams: any = reactive({
  type: 0,
  query: {},
  is_cache: 0,
  act: 'detail'
});
//获取列表数据
init();
function init() {
  queryParams.query = props.query
  queryParams.query.export = 0;
  onInitList(queryParams)
}
const labels = [
  // '时间',
  '游戏名称',
  '会员邀请码',
  '游戏平台名称',
];
// 搜索输入框数据变动时触发
const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
  columns[1].label = transformI18n(labels[queryParams.type] ? labels[queryParams.type] : '时间')
  init();
}

//导出
const handleExport = () => {
  queryParams.query.export = 1;
  gameReport(queryParams).then((res: any) => {
    if (res.code == 1) {
      // window.location.href = res.data;
      handleDownloadList();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}


const downloadListShow = ref(false);
const handleDownloadList = row => {
  downloadListShow.value = true;
};
const handleSearch = () => {
  // queryParams['is_cache'] = 0
  init()
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSearch" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <pure-table
      :loading="loading"
      :loading-config="loadingConfig"
      adaptive
      :adaptiveConfig="adaptiveConfig"
     :data="tableData.dataList" width="100%" :columns="columns"/>
  </div>
</template>