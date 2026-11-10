<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { gameUserReport } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
defineOptions({
  name: 'gameUserDayReport'
})
const columns = [
    {
      label: transformI18n("用户"),
      prop: "username",
      width:200,
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
      label: transformI18n("日期"),
      prop: "su_dt",
      width: '150px',
    },{
      label: transformI18n("投注数量"),
      prop: "su_betnum",
    },{
      label: transformI18n("投注金额"),
      prop: "su_bet",
    },{
      label: transformI18n("输次数"),
      prop: "su_losenum",
    },{
      label: transformI18n("输金额"),
      prop: "su_lose",
    },{
      label: transformI18n("赢次数"),
      prop: "su_winnum",
    },{
      label: transformI18n("派彩金额"),
      prop: "su_win",
    },{
      label: transformI18n("平次数"),
      prop: "su_drawnum",
    },{
      label: transformI18n("平金额"),
      prop: "su_draw",
    }
];

//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '请输入UID/用户名/邮箱/手机号',
    value: '',
    idx:0
  },{
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    idx:1
  },{
    type: 'time',
    placeholder: '时间',
    idx:2,
    value: ():Array<string> => {
      return []
    }
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:4
  },
  {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = ref<any>({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  username: '',
  date: '',
  agent_name: '',
  export: 1
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.value.page = 1;
//   pagination.value.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  pagination.value.export = 0
  gameUserReport(pagination.value).then((res: any) => {
    tableData.dataList = res.data
    pagination.value.total = res.count
    // pagination.value.page = res.data.current_page
  })
}
const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
   init();
};
//搜索
const handleSerch = () => {
  pagination.value.page = 1;
  pagination.value.username = list[0].value
  pagination.value.date = list[1].value
  init();
}
//导出
const handleExport = () => {
  pagination.value.export = 1
  gameUserReport(pagination.value).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div class="flex-bc line-box">
       <div class="tip">{{ $t('投注数量') }}:{{ $t('订单如果延迟结算的话,下注日会在统计内，结算日也会重复统计') }}</div>
    </div>
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
.tip{
  font-size: 14px;
  color:var(--el-color-danger);
}
</style>
