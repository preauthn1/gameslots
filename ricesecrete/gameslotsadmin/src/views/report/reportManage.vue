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
      prop: "time",
      width:'150x',
      fixed: true
    },{
      label: transformI18n("充值总额"),
      prop: "total_recharge",
      width:'150x',
    },
    {
      label: transformI18n("首充金额"),
      prop: "first_recharge_amount",
       width:'150x',
    },{
      label: transformI18n("提现总额"),
      width: "150px",
      prop:'total_withdrawal'
    },{
      label: transformI18n("实际出款"),
      width: '150px',
      prop:'actual_payment'
    },{
      label: transformI18n("存取差额"),
      prop: "access_balance",
       width:'150x',
    },{
      label: transformI18n("新注册人数"),
      prop: "new_registrants",
       width:'150x',
    },{
      label: transformI18n("充值人数"),
      prop: "recharge_number",
       width:'150x',
    },{
      label: transformI18n("首充人数"),
      prop: "number_charge",
       width:'150x',
    },{
      label: transformI18n("复充人数"),
      prop: "again_recharge_amount",
       width:'150x',
    },{
      label: transformI18n("提现人数"),
      prop: "number_withdrawals",
       width:'150x',
    },{
      label: transformI18n("投注人数"),
      prop: "number_people",
       width:'150x',
    },{
      label: transformI18n("投注笔数"),
      prop: "number_bets",
       width:'150x',
  },
  {
    label: transformI18n("投注总额"),
    prop: "total_bet",
    width:'150x',
  },
  {
    label: transformI18n("有效投注"),
    prop: "bet_valid_amount",
    width:'150x',
  },
  {
    label: transformI18n("游戏盈亏"),
    prop: "betting_loss",
    width:'150x',
  },
  // {
  //   label: transformI18n("用户盈亏"),
  //   prop: "member_total_lose",
  //   width:'150x',
  // },
  {
    label: transformI18n("派彩总额"),
    prop: "win_price",
    width:'150x',
  },
  // {
  //   label: transformI18n("未结算注单"),
  //   prop: "no_settle_order",
  //   width:'150x',
  // },
  // {
  //   label: transformI18n("和局总额"),
  //   prop: "bet_draw",
  //   width:'150x',
  // },
  {
    label: transformI18n("杀率"),
    prop: "betting_loss_rate",
    width:'150x',
  },
  {
      label: transformI18n("人工增加"),
      prop: "artificial_increase",
       width:'150x',
    },{
      label: transformI18n("人工减少"),
      prop: "artificial_reduction",
       width:'150x',
  },
  // {
  //   label: transformI18n("代理佣金"),
  //   prop: "agency_commission",
  //   width:'150x',
  // },
  {
    label: transformI18n("推广奖励"),
    prop: "promotional_rebates",
    width:'150x',
  },
  {
      label: transformI18n("活动优惠"),
      prop: "activity_offer",
       width:'150x',
    },{
      label: transformI18n("赠送彩金"),
      prop: "give_bonuses",
      width:'150x',
    },{
      label: transformI18n("免费转盘奖励"),
      prop: "lottery",
      width:'150x',
    },{
      label: transformI18n("任务中心奖励"),
      prop: "task_reward",
      width:'150x',
    },{
      label: transformI18n("VIP等级周月奖励"),
      prop: "level_reward",
      width:'150x',
    },{
      label: transformI18n("游戏返水"),
      prop: "game_back",
      width:'150x',
    },{
      label: transformI18n("签到奖励"),
      prop: "sign_reward",
      width:'150x',
    },{
      label: transformI18n("代理返佣"),
      prop: "agent_fyfy",
      width:'150x',
    },{
      label: transformI18n("领取码"),
      prop: "record_reward",
      width:'150x',
    },{
      label: transformI18n("操作"),
      fixed: 'right',
      width:'150x',
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={row.time != '#'} size="small" type="primary" onClick={() => hanldeClearCache(row)} loading={row.loading}>{ transformI18n('重新统计') }</el-button>
        </>
      )
    },
];
const statColumns = [
  {
    label: transformI18n("今日新增"),
    prop: "today_new_user_count",
    children: [
      { label: transformI18n("正式"), prop: "today_new_user_count" },
      { label: transformI18n("虚拟"), prop: "today_new_test_user_count" }
    ]
  },
  {
    label: transformI18n("本月新增"),
    prop: "month_user_count",
    children: [
      { label: transformI18n("正式"), prop: "month_user_count" },
      { label: transformI18n("虚拟"), prop: "month_test_user_count" }
    ]
  },
  {
    label: transformI18n("上月新增"),
    prop: "lastmonth_user_count",
    children: [
      { label: transformI18n("正式"), prop: "lastmonth_user_count" },
      { label: transformI18n("虚拟"), prop: "lastmonth_test_user_count" }
    ]
  },
  {
    label: transformI18n("会员人数"),
    prop: "user_count",
    children: [
      { label: transformI18n("正式"), prop: "user_count" },
      { label: transformI18n("虚拟"), prop: "test_user_count" },
      { label: transformI18n("正常"), prop: "normal_user_count" },
      { label: transformI18n("封号"), prop: "seal_user_count" },
    ]
  },
  {
    label: transformI18n("余额总数"),
    prop: "user_count_money",
    children: [
      { label: transformI18n("正式"), prop: "user_count_money", width: 200 },
      { label: transformI18n("虚拟"), prop: "test_user_count_money", width: 200 }
    ]
  },
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
const statDataList: any = [];
const tableStatData = reactive({ statDataList });
//首次需要加载的接口
init({search: true, info: pagination});
init({stat: true});
function init(query: any) {
  reportManage(query).then((res: any) => {
    // console.log(res.data);
    if (query.search) {
      tableData.dataList = res.data;
    } else {
      tableStatData.statDataList = [res.data]
    }
  })
}
const hanldeClearCache = (row) => {
  const param = {
    date: row.time,
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
    <el-table :data="tableStatData.statDataList" style="width: 100%">
      <el-table-column align="center" v-for="(col, index) in statColumns" :key="index" :prop="col.prop" :label="col.label">
        <el-table-column align="center" v-for="(col2, index) in col.children" :key="index" :prop="col2.prop" :label="col2.label" :width="col2.width"/>
      </el-table-column>
    </el-table>
    <br/>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <p style="font-size: 12px; color: red; text-align: left; margin-bottom: 10px;">{{ $t('三方游戏相关数据均按投注时间统计') }}</p>
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
