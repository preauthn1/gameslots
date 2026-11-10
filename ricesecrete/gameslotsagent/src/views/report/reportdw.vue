<script setup lang="tsx">
import { reactive, ref, getCurrentInstance} from 'vue';
import { reportManage, reportClearCache } from "@/api/user";
import { timeCycle } from '@/utils/global';
import { transformI18n } from '@/plugins/i18n';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'reportManage'
})
const columns = [
    {
      label: transformI18n("时间日期"),
      prop: "date",
      width:'150x',
      fixed: true
    },{
      label: transformI18n("充值总额"),
      prop: "total_recharge",
      width:'150x',
    },
   {
      label: transformI18n("申请提现总额"),
      width: "150px",
      prop:'total_withdrawal'
    },{
      label: transformI18n("实际出款"),
      width: '150px',
      prop:'actual_payment'
    },{
      label: transformI18n("充值单数"),
      prop: "total_recharge_num",
       width:'150x',
    },{
      label: transformI18n("首充金额"),
      prop: "first_recharge_amount",
       width:'150x',
    },{
      label: transformI18n("首充单数"),
      prop: "first_recharge_amount_num",
       width:'150x',
    },{
      label: transformI18n("提现单数"),
      prop: "total_withdrawal_num",
       width:'150x',
    }
];

//以下是搜索框的数据
const list = {
  date: {
    type: 'date',
    placeholder: '时间',
    prop: 'date',
    value: (): Array<string> => {
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
    prop:'export'
  },
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  search:true,
  date: '',
});
const dataList: any = [];
const tableData = reactive({ dataList });
//首次需要加载的接口
init({search: true, info: pagination});
function init(query: any) {
  reportManage(query).then((res: any) => {
    // console.log(res.data);
    if (query.search) {
      tableData.dataList = res.data;
    }
  })
}
const hanldeClearCache = (row) => {
  const param = {
    date: row.date,
    type: 1
  }
  proxy.$confirm(transformI18n('确定要清理缓存吗？'), transformI18n('提示')).then(() => {
    row.loading = 1
    reportClearCache(param).then((res: any) => {
      row.loading = 0
      init({search: true, info: pagination});
    })
  }).catch(() => {
    console.log('取消');
  })
}
//搜索
const handleSerch = () => {
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val.length > 0 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }

    }
  }
  init({search: true, info: pagination});
}
//导出
const handleExport = () => {
  // console.log('点击搜索');
  const query = {search: true, info: pagination,export:1}
  reportManage(query).then((res:any)=>{
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <p style="font-size: 12px; color: red; text-align: left; margin-bottom: 10px;">{{ $t('充值提现统计') }}</p>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" />
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
