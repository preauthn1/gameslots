<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { taskStageRecordLists } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";
import menuList from "@/components/menu/menu.vue"
// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("ID"),
    prop: "id",
    width:50
  },
  {
    label: transformI18n("用户id"),
    prop: "uid",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("领取奖励活跃度"),
    prop: "activity",
  },
  {
    label: transformI18n("奖励金额"),
    prop: "reward_amount",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("奖励积分"),
    prop: "reward_integral",
  },
  {
    label: transformI18n("领取状态"),
    slot: "receive_status",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: '每日任务',
        value: 0,
      },{
        label: '每周任务',
        value: 1,
      },
    ]
  },
  receive_status:{
    type: 'select',
    label:'领取状态',
    placeholder:'领取状态',
    prop:'receive_status',
    options: [
      {
        label: '未领取',
        value: 0,
      },{
        label: '已领取',
        value: 1,
      }
    ]
  },
  time:{
    type: 'time',
    placeholder: '时间',
    idx:1,
    value: (): Array<string> => {
      return []
    }
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  title: '',//任务标题
  type: '',//类型
  date: '',//时间
  task_condition: '',//任务条件
  lang: storageLocal().getItem("i18n_locale"),//语言
  username: '',//用户
  receive_status: '',//领取状态
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  taskStageRecordLists(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    countDataBox.value = res.statistics
    // list2Box.dialogList.lang.options = res.langs
  })
}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init(pagination);
};

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  //时间转换
  const val = searchList['time'].value;
  console.log(val)
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination['date'] = time//时间
  init(pagination);
}

//判断条件是否显示
const judgeTaskConditionIsShow = (task_condition, value) =>{
  if(task_condition){
    return task_condition.includes(value)
  }
  return false
}
const countDataBox: any = ref({})
</script>

<template>
  <div style="padding-bottom: 40px;">
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div class="flex-bc" >
        <div style="margin-left:20px;font-size: 14px;" >
          <el-tag size="large">{{ $t('完成用户') }}:{{countDataBox.finish_user_count}}</el-tag>
          <el-tag size="large">{{ $t('总金额') }}:{{countDataBox.finish_amount}}</el-tag>
          <el-tag size="large">{{ $t('总积分') }}:{{countDataBox.finish_integral}}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
      <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('每日任务') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('每周任务') }}</el-tag>
      </template>
      <template #task_condition="{ row }">
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('最低下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('最低充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长') }}</el-tag>
      </template>
      <template #receive_status="{ row }">
         <el-tag size="small" type="success"  v-if="row.receive_status == 0">{{ $t('未领取') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.receive_status == 1">{{ $t('已领取') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('无') }}</el-tag>
      </template>
    </pure-table>
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
<style scoped>
.btmNav{
  padding-top:10px;
  padding-bottom: 30px;
}
</style>
