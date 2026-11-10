<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent, getCurrentInstance, h } from 'vue';
import { gameReport } from "@/api/user";
import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
import { http } from '@/utils/http';
import Report from "./gameReportDay.vue";
import { addDialog } from "@/components/ReDialog";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gameReport'
})
const columns = [
    {
      label: transformI18n("时间日期"),
      prop:'time'
    },
    {
      label: transformI18n("投注总额"),
      prop: "tz_price",
    },{
      label: transformI18n("有效投注总额"),
      prop: "bet_valid_amount",
    },{
      label: transformI18n("投注人數"),
      prop: "tz_number",
    },{
      label: transformI18n("投注笔数"),
      prop: "tz_num",
    },{
      label: transformI18n("派彩金额"),
      prop: "tz_win",
    },{
    //   label: transformI18n("用户输"),
    //   prop: "tz_loss",
    // },{
      label: transformI18n("平台盈亏"),
      prop: "tz_ptsy",
    },
    {
      label: transformI18n("清除缓存"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" type="primary" v-show={row.time != '总计'} onClick={() => handleReport(row)}>{ transformI18n('详情') }</el-button>
          <el-button size="small" type="danger" v-show={row.cache_key} onClick={() => handleClear(index, row)}>{ transformI18n('清除') }</el-button>
        </>
      )
    }
];
//点击清除
const handleClear = (index, row) => {
  const param = {
    key: row.cache_key,
    type: 1
  }
  proxy.$confirm(transformI18n('确定要清理缓存吗？'), transformI18n('提示')).then(() => {
    http.post('/game/clear', {data: param}).then((res: any) => {
      init();
    })
  }).catch(() => {
    console.log('取消');
  })
}

const handleReport = (row) => {
  const props = queryParams
  props.time = row.date
  console.log(props)
  addDialog({
    title: row.date + ( queryParams.time_zone ? " ( 时区:"+queryParams.time_zone+")" : "" ) + " - " + transformI18n("详细报表"),
    hideFooter: true,
    fullscreen: true,
    contentRenderer: () => h(Report, {query:props})
  });
}
//以下是搜索框的数据
const searchList = {
  game_name: {
    type: 'input',
    placeholder: '游戏名称',
    value: '',
    prop: 'game_name'
  },
  username:{
    type: 'input',
    placeholder: '请输入UID/用户名/邮箱/手机号',
    value: '',
    prop: 'username',
  },
  tc_id: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'tc_id',
    options: []
  },
  type: {
    type: 'select',
    placeholder: '游戏分类',
    value: '',
    prop: 'type',
    options: [
    ]
  },
  // time_type: {
  //   type: 'select',
  //   placeholder: '时间类型',
  //   value: 1,
  //   prop: 'time_type',
  //   options: [
  //     {
  //       label: '下注时间',
  //       value: 1,
  //     }, {
  //       label: '结算时间',
  //       value: 2,
  //     }
  //   ]
  // },
  date: {
    type: 'date',
    placeholder: '日期',
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  time_zone: {
    type: 'select',
    placeholder: '选择时区',
    value:'',
    prop: 'time_zone',
    options: [
      { label: '+0', value: '+0', },
      { label: '+1', value: '+1', },
      { label: '+2', value: '+2', },
      { label: '+3', value: '+3', },
      { label: '+4', value: '+4', },
      { label: '+5', value: '+5', },
      { label: '+6', value: '+6', },
      { label: '+7', value: '+7', },
      { label: '+8', value: '+8', },
      { label: '+9', value: '+9', },
      { label: '+10', value: '+10', },
      { label: '+11', value: '+11', },
      { label: '+12', value: '+12', },
      { label: '-1', value: '-1', },
      { label: '-2', value: '-2', },
      { label: '-3', value: '-3', },
      { label: '-4', value: '-4', },
      { label: '-5', value: '-5', },
      { label: '-6', value: '-6', },
      { label: '-7', value: '-7', },
      { label: '-8', value: '-8', },
      { label: '-9', value: '-9', },
      { label: '-10', value: '-10', },
      { label: '-11', value: '-11', },
      { label: '-12', value: '-12', },
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
const searchListBox = reactive({ searchList });
//条件数据
const queryParams = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  game_name: '',
  username: '',
  lebal: '',
  tc_id: '',
  type: '',
  date: '',
  time: '',
  time_zone: '',
  time_type: '',
  is_cache: 0,
  export: 0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  // queryParams['is_cache'] = 0
  init();
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
//首次需要加载的接口
const loading = ref(false)
const loadingText = ref('')
const loadingTexts = [
  '数据比较大,请耐心等待...',
]

init();
function init() {
  if (loading.value) {
    return
  }
  loadingText.value = loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
  loading.value = true
  gameReport(queryParams).then((res: any) => {
    loading.value = false
    const list = res.data;
    const arr = [];
    for (const key in list) {
      list[key].time = key;
      arr.push(list[key]);
    }
    tableData.dataList = arr
    const game_type = res.game_type;
    const typeArr = [];
    game_type.forEach(item => {
      typeArr.push({label:item.name,value:item.id})
    })
    searchListBox.searchList.type.options = typeArr
    const thirds = res.thirds;
    const thirdArr = []
    for (const key in thirds) {
      thirdArr.push({label:thirds[key],value:key})
    }
    searchListBox.searchList.tc_id.options = thirdArr
  })
}

//导出
const handleExport = () => {
  queryParams.export = 1;
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

// const create_cache = () => {
//   queryParams['is_cache'] = 1
//   init()
//   message('请等待5-10分钟后再来查看筛选的数据', { type: 'success' });
// }
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <div class="tip">
      {{ $t('由于三方账单时区问题，时区搜索仅用于对账，需要结合游戏平台，时间区域进行搜索') }},
      <!-- <el-button size="small" style="float: right;" type="danger" @click="handleClear(0, {cache_key: 'all'})">{{ $t('清理所有缓存') }}</el-button> -->
    </div>
    <div v-loading="loading" :element-loading-text="loadingText">
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
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
.tip{
  color:var(--el-color-danger);
  margin:10px 0;
  font-size: 14px;
}
</style>
