<script setup lang="tsx">
import { reactive, ref, computed } from 'vue';
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
    label: transformI18n("投注金額"),
    prop: "bet_amount",
  },{
    label: transformI18n("有效投注金額"),
    prop: "bet_valid_amount",
  },{
    label: transformI18n("派彩金额"),
    prop: "bet_win_amount",
  },{
    label: transformI18n("输赢"),
    prop: "user_win",
  },{
    label: transformI18n("占单量"),
    prop: "bet_num_rate",
  },{
    label: transformI18n("获利比"),
    slot: "user_win_rate",
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
    label: transformI18n("投注金額"),
    prop: "bet_amount",
  },{
    label: transformI18n("有效投注金額"),
    prop: "bet_valid_amount",
  },{
    label: transformI18n("派彩金额"),
    prop: "bet_win_amount",
  },{
    label: transformI18n("输赢"),
    prop: "user_win",
  },{
    label: transformI18n("占单量"),
    prop: "bet_num_rate",
  },{
    label: transformI18n("获利比"),
    slot: "user_win_rate",
  }
];
const props = defineProps({
    uid: String,
})
const uid = computed(() => {
  return props.uid;
})
//以下是搜索框的数据
const searchList = {
  username:{
    type: 'input',
    placeholder: '请输入UID/用户名/邮箱/手机号',
    value: '',
    prop: 'username',
  },
  date:{
    type: 'date',
    placeholder: '时间',
    prop: 'date',
    value: ():Array<string> => {
      return []
    }
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search',
  }
};
const searchListBox = reactive({ searchList });
//条件数据
const queryParams = reactive({
  username: uid.value ? uid.value.toString() : '',
  time_zone: '',
  date: '',
});
const dataList: any = [];
const dataList2: any = [];
const tableData = reactive({ dataList, dataList2 });

const loading = ref(false)
const loadingText = ref('')
const loadingTexts = [
  '数据比较大,请耐心等待...',
]
if(uid.value){
  searchListBox.searchList['username'].value = uid.value;
  init();
}
function init() {
  if (!queryParams.username) {
    message('请输入用户信息', {type: 'error'})
    return;
  }
  if (loading.value) {
    return
  }
  loadingText.value = loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
  loading.value = true
  http.post('/game/user_stat', { data: queryParams }).then((res: any) => {
    loading.value = false
    if (res.code == 1) {
      tableData.dataList = res.data;
      tableData.dataList2 = res.game_stat;
    }
  })
}
//搜索
const handleSerch = () => {
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

</script>

<template>
  <div>
    <commSerach @search="handleSerch" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <div v-loading="loading" :element-loading-text="loadingText">
      <h2 class="h2">{{ $t('游戏平台数据统计') }}</h2>
      <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
        <template #user_win_rate="{row}">
          {{ row.bet_valid_amount > 0 ? parseFloat(row.user_win/row.bet_valid_amount*100).toFixed(2) : 0 }}%
        </template>
      </pure-table>
      <h2 class="h2">{{ $t('游戏类别数据统计') }}</h2>
      <pure-table :data="tableData.dataList2" width="100%" :columns="columns2">
        <template #user_win_rate="{row}">
          {{ row.bet_valid_amount > 0 ? parseFloat(row.user_win/row.bet_valid_amount*100).toFixed(2) : 0 }}%
        </template>
      </pure-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.h2 {
  padding-top:20px;
  margin-bottom: 15px;
  font-size: 18px;
}
</style>
