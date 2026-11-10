<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { transformI18n } from '@/plugins/i18n';
import moment from 'moment'
import { useDataLoad } from "@/components/table/dataLoad";
defineOptions({
  name: 'gameStat'
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
} = useDataLoad('/game/game_stat');
const columns = ref({})
const columns0: TableColumnList = [
  {
    label: transformI18n("游戏名称"),
    prop: "type_name",
  },
  {
    label: transformI18n("投注数量"),
    prop: "bet_num",
    sortable: true
  },
  {
    label: transformI18n("用户数"),
    prop: "user_num",
  },
  {
    label: transformI18n("有效投注金額"),
    prop: "bet_valid_amount",
    sortable: true
  },{
    label: transformI18n("派彩总额"),
    prop: "bet_win_amount",
    sortable: true
  },{
    label: transformI18n("平台盈利"),
    slot: "profit",
    prop: "profit",
    sortable: true
  },{
    label: transformI18n("杀率"),
    slot: "rate",
  }
];

const columns1: TableColumnList = [
  {
    label: transformI18n("平台名称"),
    prop: "tc_name",
    width: '150px',
  },
  {
    label: transformI18n("投注数量"),
    prop: "bet_num",
    sortable: true
  },
  {
    label: transformI18n("用户数"),
    prop: "user_num",
  },
  {
    label: transformI18n("有效投注金額"),
    prop: "bet_valid_amount",
    sortable: true
  },{
    label: transformI18n("派彩总额"),
    prop: "bet_win_amount",
    sortable: true
  },{
    label: transformI18n("平台盈利"),
    slot: "profit",
    prop: "profit",
    sortable: true
  },{
    label: transformI18n("杀率"),
    slot: "rate",
  }
];
const columns2: TableColumnList = [
  {
    label: transformI18n("平台名称"),
    prop: "tc_name",
  },
  {
    label: transformI18n("游戏分类"),
    prop: "type_name",
  },
  {
    label: transformI18n("游戏名称"),
    prop: "game_name",
  },
  {
    label: transformI18n("投注数量"),
    prop: "bet_num",
    sortable: true
  },
  {
    label: transformI18n("用户数"),
    prop: "user_num",
  },
  {
    label: transformI18n("有效投注金額"),
    prop: "bet_valid_amount",
    sortable: true
  },{
    label: transformI18n("派彩总额"),
    prop: "bet_win_amount",
    sortable: true
  },{
    label: transformI18n("平台盈利"),
    slot: "profit",
    prop: "profit",
    sortable: true
  },{
    label: transformI18n("杀率"),
    slot: "rate",
  }
];
columns.value = columns0
//以下是搜索框的数据
const searchList = {
  date: {
    type: 'date',
    placeholder: '时间',
    prop: 'date',
    value: [moment().startOf('day').format('YYYY-MM-DD'), moment().endOf('day').format('YYYY-MM-DD')]
  },
  // username: {
  //   type: 'input',
  //   placeholder: 'UID/用户名/邮箱/手机号',
  //   value: '',
  //   prop: 'username'
  // },
  stat_type: {
    type: 'select',
    placeholder: '统计类型',
    value: 0,
    prop: 'stat_type',
    options: [
      {label:'游戏类型统计', value:0},
      {label:'游戏平台统计', value:1},
      {label:'子游戏统计', value:2},
    ]
  },
  g_type: {
    type: 'select',
    placeholder: '游戏分类',
    value: '',
    prop: 'g_type',
    options: [],
    show: false
  },
  tc_id: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'tc_id',
    options: [],
    show: false
  },
  gid: {
    type: 'input',
    placeholder: '游戏名称/ID',
    value: '',
    prop: 'gid',
    show: false
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  // export: {
  //   type: 'button',
  //   value: '导出',
  //   handle: 'export',
  //   prop: 'export'
  // }
};
const searchListBox = reactive({ searchList });
//条件数据
const queryParams = reactive({
  gid:'',
  lebal: '',
  tc_id: '',
  date: '',
  username: '',
  order: '',
  field: '',
  g_type: 0,
  stat_type: 0,
  export: 0
});
const tableData = reactive({ dataList });

function init() {
  queryParams.export = 0;
  pagination.currentPage = 1;
  onInitList(queryParams, function (res) { 
    if (res.code == 1) {
      searchListBox.searchList.tc_id.options = res.game_third
      searchListBox.searchList.g_type.options = res.game_type
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
  if (index == 'stat_type') {
    switch (value) {
      case 1: // 平台
        columns.value = columns1;
        searchListBox.searchList.g_type.show = true
        searchListBox.searchList.gid.show = true
        searchListBox.searchList.tc_id.show = false
        break;
      case 2: // 游戏
        columns.value = columns2;
        searchListBox.searchList.g_type.show = true
        searchListBox.searchList.gid.show = true
        searchListBox.searchList.tc_id.show = true
        break;
      default: // 分类
        columns.value = columns0;
        searchListBox.searchList.g_type.show = false
        searchListBox.searchList.gid.show = false
        searchListBox.searchList.tc_id.show = false
        break;
    }
    init();
  }
}
//搜索
const handleSerch = () => {
  init();
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
</script>

<template>
<div>
  <commSerach @search="handleSerch" @currentChange="searchChange"  :list="searchListBox.searchList"/>
  <pure-table :loading="loading" :loading-config="loadingConfig" adaptive :adaptiveConfig="adaptiveConfig"
    :pagination="pagination" @page-size-change="onSizeChange" @page-current-change="onCurrentChange"
    :data="tableData.dataList" width="100%" :columns="columns" @sort-change="sortChange">
    <template #profit="{ row }">
        <el-tag size="small" type="danger"  v-if="row.profit < 0">{{ row.profit }}</el-tag>
        <el-tag size="small" type="success"  v-else>{{ row.profit }}</el-tag>
    </template>
     <template #rate="{ row }">
        {{ row.bet_valid_amount > 0 ? parseFloat(row.profit/row.bet_valid_amount*100).toFixed(2) : 0 }}%
    </template>
      <!-- <template #right="{ row }">
        <el-button size="small" type="danger" @click="showDetail(row)">{{ $t('详情') }}</el-button>
      </template> -->
  </pure-table>
</div>
</template>
<style scoped lang="scss">
.h2 {
  padding-top:20px;
  margin-bottom: 15px;
  font-size: 18px;
}
</style>
