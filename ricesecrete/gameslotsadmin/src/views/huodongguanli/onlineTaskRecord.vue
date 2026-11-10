<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { lotteryTaskRecordLists } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";

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
    label: transformI18n("任务id"),
    prop: "task_id",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("领取次数"),
    prop: "receive_num",
  },
  {
    label: transformI18n("领取金额"),
    prop: "receive_amount",
  },
  {
    label: transformI18n("领取积分"),
    prop: "receive_integral",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  uid:{
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'uid'
  },
 task_id:{
    type: 'input',
    label:'任务id',
    placeholder:'任务id',
    prop: 'task_id',
    value: '',
  },
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: '按天',
        value: 0,
      },
      {
        label: '按周',
        value: 1,
      },
      {
        label: '按月',
        value: 2,
      },
    ]
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
  uid:'',//用户id
  type:'',//类型
  task_id:'',//任务id
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  lotteryTaskRecordLists(pagination).then((res:any) => {
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
  init(pagination);
}
const countDataBox: any = ref({})
</script>

<template>
  <div style="padding-bottom: 40px;">
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div class="flex-bc" >
        <div style="margin-left:20px;font-size: 14px;" >
          <el-tag size="large">{{ $t('领取金额') }}:{{countDataBox.receive_amount}}</el-tag>
          <el-tag size="large">{{ $t('领取积分') }}:{{countDataBox.receive_integral}}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
      <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('按天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('按周') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 2">{{ $t('按月') }}</el-tag>
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
