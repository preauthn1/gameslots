<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { useDataLoad } from "@/components/table/dataLoad";
import { http } from "@/utils/http";
defineOptions({
  name: "AdsReport",
});
const { t } = useI18n();
const { proxy } = getCurrentInstance();
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/ads/report');
const props = defineProps({
  channel: Object
})
//点击节流  用户编辑操作
const tableData = reactive({ dataList });
const columns: TableColumnList = [
  {
    headerRenderer: () => transformI18n("日期"),
    prop: "sr_dt",
  },
  {
    headerRenderer: () => transformI18n("代理邀请码"),
    prop: 'sr_share_code'
  },
  {
    headerRenderer: () => transformI18n("新注册"),
    prop: "sr_reg",
  },
  {
    headerRenderer: () => transformI18n("累计用户数"),
    prop: "sr_user",
  },
  {
    headerRenderer: () => transformI18n("首充用户数"),
    prop: "sr_first",
  },
  {
    headerRenderer: () => transformI18n("首充金额"),
    prop: "sr_first_amount"
  },
  {
    headerRenderer: () => transformI18n("充值人数"),
    prop: "sr_recharge_user"
  },
  {
    headerRenderer: () => transformI18n("充值金额"),
    prop: "sr_recharge_amount"
  },
  {
    headerRenderer: () => transformI18n("提现人数"),
    prop: "sr_withdraw_user"
  },
  {
    headerRenderer: () => transformI18n("提现金额"),
    prop: "sr_withdraw_amount"
  },
  {
    headerRenderer: () => transformI18n("有效投注"),
    prop: "sr_validbet"
  },
  {
    headerRenderer: () => transformI18n("客损"),
    prop: "sr_user_lost"
  },
  {
    headerRenderer: () => transformI18n("优惠"),
    prop: "sr_bonus"
  },
  {
    headerRenderer: () => transformI18n("操作"),
    fixed: "right",
    width: 150,
    slot:'right'
  }
];

//搜索的数据
const searchList = {
  date:{
    type: 'date',
    placeholder: '日期',
    value: ():Array<string> => {
      return []
    },
    prop: 'date'
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
  },
}
const searchListBox = reactive({
  searchList
})

const queryParams = reactive({
  acid:0,
  date: '',//注册时间
  export: 0
});
//获取列表数据
init();
function init() {
  queryParams.export = 0;
  queryParams.acid = props.channel.ac_id
  pagination.currentPage = 1;
  onInitList(queryParams)
}

// 搜索输入框数据变动时触发
const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
}

const updateCache = (acid, date) => {
  http.post('/ads/report', { data: { act: 'update', acid: acid, date: date } }).then((res: any) => {
    init();
  });
}

//导出
const handleExport = () => {
  queryParams.export = 1;
  http.post('/ads/report', { data: queryParams }).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}
</script>

<template>
  <div>
    <commSerach @search="init" @export="handleExport" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <div>
      <el-button
        type="success"
        @click="handleExport"
      >
        {{ t('导出') }}
      </el-button>
    </div>
    <pure-table
      :loading="loading"
      :loading-config="loadingConfig"
      adaptive
      :adaptiveConfig="adaptiveConfig"
      :pagination="pagination"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
     :data="tableData.dataList" width="100%" :columns="columns">
      <template #right="{index,row}">
          <el-button type="primary" size="small" @click="updateCache(row.sr_acid, row.sr_dt)">
            {{ t('更新缓存') }}
          </el-button>
      </template>
    </pure-table>
  </div>
</template>