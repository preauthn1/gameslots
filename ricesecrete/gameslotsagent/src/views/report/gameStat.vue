<script setup lang="tsx">
import moment from 'moment'
import { reactive, ref } from 'vue';
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
import { http } from '@/utils/http';
defineOptions({
  name: 'gameStat'
})
const columns2 = [
  {
    label: transformI18n("平台名称"),
    prop: "tc_name",
    width: '150px',
  },
  {
    label: transformI18n("游戏名称"),
    prop: "game_name",
    width: '150px',
  },
  {
    label: transformI18n("投注数量"),
    prop: "bet_num",
    sortable: true
  },{
    label: transformI18n("投注金额"),
    prop: "bet_amount",
    sortable: true
  },{
    label: transformI18n("有效投注金额"),
    prop: "bet_valid_amount",
    width: '150px',
    sortable: true
  },{
    label: transformI18n("输次数"),
    prop: "bet_loss_num",
    sortable: true
  },{
    label: transformI18n("输金额"),
    prop: "bet_loss_amount",
    sortable: true
  },{
    label: transformI18n("派彩次数"),
    prop: "bet_win_num",
    sortable: true
  },{
    label: transformI18n("派彩金额"),
    prop: "bet_win_amount",
    sortable: true
  },{
    label: transformI18n("平次数"),
    prop: "bet_draw_num",
    sortable: true
  },{
    label: transformI18n("平金额"),
    prop: "bet_draw_amount",
    sortable: true
  },{
    label: transformI18n("平台盈利"),
    slot: "profit",
    prop: "profit",
    sortable: true
  }
];
//以下是搜索框的数据
//以下是搜索框的数据
const list = {
  gid: {
    type: 'input',
    placeholder: '游戏名称/ID',
    value: '',
    prop: 'gid',
  },
  username: {
    type: 'input',
    placeholder: 'UID/用户名/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  tc_id: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'tc_id',
    options: []
  },
  date: {
    type: 'time',
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
  // export: {
  //   type: 'button',
  //   value: '导出',
  //   handle: 'export',
  //   prop: 'export'
  // }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  gid:'',
  lebal: '',
  tc_id: '',
  date: '',
  username: '',
});
const dataList: any = [];
const dataList2: any = [];
const tableData = reactive({ dataList, dataList2 });
const isCache = ref(false)
const ttl = ref(0)
function init() {
  http.post('/game/game_stat', { data: pagination }).then((res: any) => {
    if (res.code == 1) {
      tableData.dataList2 = res.data;
      listbox.list.tc_id.options = res.game_third
      isCache.value = res.cache;
      ttl.value = res.ttl
    }
  })
}
//搜索
const handleSerch = () => {
  pagination.page = 1;
   for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
  init();
}
//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
  if (value === null) {
    list[index].value = '';
    return
  }
  list[index].value = value;
}
</script>

<template>
  <div>
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div v-if="isCache" style=" color: red; margin-bottom: 15px; font-size: 14px;">{{ $t('当前查询结果为缓存数据,缓存时间{0}秒', [ttl]) }}</div>
    <pure-table :data="tableData.dataList2" width="100%" :columns="columns2">
      <template #profit="{ row }">
          <el-tag size="small" type="danger"  v-if="row.profit < 0">{{ row.profit }}</el-tag>
          <el-tag size="small" type="success"  v-else>{{ row.profit }}</el-tag>
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
