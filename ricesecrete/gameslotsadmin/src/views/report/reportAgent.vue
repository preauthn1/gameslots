<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent} from 'vue';
import { reportAgentManage, reportAgentClearCache } from "@/api/user";
import { timeCycle } from '@/utils/global';
import { transformI18n } from '@/plugins/i18n';
import { message } from "@/utils/message";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'reportManage'
})
const columns = [
    {
      headerRenderer: () => transformI18n("用户名"),
      prop: "username",
      width: 200,
      fixed: true,
      cellRenderer: ({ row }) => (
        <>
          <div v-show={row.uid=='合计'}>
            <p>{row.uid}:</p>
          </div>
          <div onClick={() => showUserInfo(row.uid)} v-show={row.uid!='合计'}>
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
  agent_type:{
    type: 'select',
    label:'代理类型',
    placeholder:'代理类型',
    prop:'agent_type',
    options: [
      {
        label: '无上级（不含内部代理）',
        value: -2,
      },
      {
        label: '无上级（含内部代理）',
        value: -1,
      },
      {
        label: '外部代理',
        value: 0,
      },
      {
        label: '内部代理',
        value: 1,
      },
    ]
  },
  username:{
    type: 'input',
    placeholder: 'id/推广码/手机号/邮箱',
    value: '',
    prop: 'username'
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
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  export:0,
  username:'',
  agent_type: '',
  date: '',
});
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init(pagination);
};

const dataList: any = [];
const tableData = reactive({ dataList });
const statDataList: any = [];
const tableStatData = reactive({ statDataList });
//首次需要加载的接口
init(pagination);
function init(query: any) {
  query.export = 0;
  query.currentPage = 1;
  reportAgentManage(query).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
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
  init(pagination);
}
//导出
const handleExport = () => {
  // console.log('点击搜索');
  pagination.export = 1
  const query = pagination
  reportAgentManage(query).then((res:any)=>{
    if (res.code == 1) {
      handleDownloadList()
    }
  })
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
const updateData = () => {
  reportAgentClearCache(pagination).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        init({search: true, info: pagination});
      } else {
        message(res.msg, { type: "error" });
      }
  })
}

const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
const showHeJi = (row) => {
  if(row.uid == '合计'){
    return false;
  }
  return true;
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/><div class="flex-bc line-box" />
    <p style="font-size: 12px; color: red; text-align: left; margin-bottom: 10px;">{{ $t('三方游戏相关数据均按投注时间统计,所有统计都是统计代理这条线（包含自己），时间筛选为各项数据的时间，例：充值为充值审核时间，不填默认为最近7天的') }}</p>
    
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
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
