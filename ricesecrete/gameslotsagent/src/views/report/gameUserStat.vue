<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { gameUserReport } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
import { http } from '@/utils/http';
defineOptions({
  name: 'gameUserDayReport'
})
const columns = [
  {
    label: transformI18n("三方平台"),
    prop: "tc_name",
    width: '150px',
  },
  {
    label: transformI18n("投注数量"),
    prop: "bet_num",
  },{
    label: transformI18n("投注金额"),
    prop: "bet_amount",
  },{
    label: transformI18n("有效投注金额"),
    prop: "bet_valid_amount",
  },{
    label: transformI18n("输次数"),
    prop: "bet_loss_num",
  },{
    label: transformI18n("输金额"),
    prop: "bet_loss_amount",
  },{
    label: transformI18n("派彩次数"),
    prop: "bet_win_num",
  },{
    label: transformI18n("派彩金额"),
    prop: "bet_win_amount",
  },{
    label: transformI18n("平次数"),
    prop: "bet_draw_num",
  },{
    label: transformI18n("平金额"),
    prop: "bet_draw_amount",
  },{
    label: transformI18n("平台盈利"),
    prop: "profit",
  }
];

const columns2 = [
  {
    label: transformI18n("游戏类别"),
    prop: "type_name",
    width: '150px',
  },
  {
    label: transformI18n("投注数量"),
    prop: "bet_num",
  },{
    label: transformI18n("投注金额"),
    prop: "bet_amount",
  },{
    label: transformI18n("有效投注金额"),
    prop: "bet_valid_amount",
  },{
    label: transformI18n("输次数"),
    prop: "bet_loss_num",
  },{
    label: transformI18n("输金额"),
    prop: "bet_loss_amount",
  },{
    label: transformI18n("派彩次数"),
    prop: "bet_win_num",
  },{
    label: transformI18n("派彩金额"),
    prop: "bet_win_amount",
  },{
    label: transformI18n("平次数"),
    prop: "bet_draw_num",
  },{
    label: transformI18n("平金额"),
    prop: "bet_draw_amount",
  },{
    label: transformI18n("平台盈利"),
    prop: "profit",
  }
];
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '请输入UID/用户名/邮箱/手机号',
    value: '',
    idx:0
  },
  {
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
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = ref<any>({
  username: '',
  date: '',
});
const dataList: any = [];
const dataList2: any = [];
const tableData = reactive({ dataList, dataList2 });

function init() {
  http.post('/game/user_stat', { data: pagination.value }).then((res: any) => {
    if (res.code == 1) {
      tableData.dataList = res.data;
      tableData.dataList2 = res.game_stat;
    }
  })
}
//搜索
const handleSerch = () => {
  pagination.value.page = 1;
  pagination.value.username = list[0].value
  pagination.value.date = list[1].value;
  init();
}
//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
  if (value === null) {
    list[index].value = '';
    return
  }
  list[index].value = index == 1 ? value.join(' - ') : value;
}

</script>

<template>
  <div>
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <h2 class="h2">{{ $t('游戏平台数据统计') }}</h2>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" />
    <h2 class="h2">{{ $t('游戏类别数据统计') }}</h2>
    <pure-table :data="tableData.dataList2" width="100%" :columns="columns2" />
  </div>
</template>
<style scoped lang="scss">
.h2 {
  padding-top:20px;
  margin-bottom: 15px;
  font-size: 18px;
}
</style>
