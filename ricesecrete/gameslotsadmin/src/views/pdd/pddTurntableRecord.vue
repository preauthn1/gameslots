<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { pddTurntableRecord } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();


const props = defineProps({
  id:String,
})
const inviteRecordId = computed(() => {
  return props.id ? props.id : 0;
})

const columns = [//TableColumnList

  {
    label: transformI18n("用户id"),
    prop: "uid",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("抽奖金额"),
    prop: "amount",
  },
  {
    label: transformI18n("取款金额"),
    prop: "withdrawal_amount",
  },
  {
    label: transformI18n("是否取款"),
    slot: "is_withdrawal",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: '未知',
        value: 0,
      },
      {
        label: '转盘余额',
        value: 1,
      },
      {
        label: '钱包余额',
        value: 2,
      },
    ]
  },
  is_withdrawal:{
    type: 'select',
    label:'取款状态',
    placeholder:'取款状态',
    prop:'is_withdrawal',
    options: [
      {
        label: '待取款',
        value: 0,
      },
      {
        label: '已取款',
        value: 1,
      },
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
  uid:'',//UID
  type:'',//类型
  date: '',//时间
  is_withdrawal: '',//取款状态
  invite_record_id: inviteRecordId, //邀请记录id
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pddTurntableRecord(pagination).then((res:any) => {
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
const countDataBox: any = ref({})
</script>

<template>
  <div style="padding-bottom: 40px;">
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div class="flex-bc" >
        <div style="margin-left:20px;font-size: 14px;" >
          <el-tag size="large">{{ $t('参与用户数') }}:{{countDataBox.take_user_count}}</el-tag>
          <el-tag size="large">{{ $t('完成金额') }}:{{countDataBox.finish_amount}}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
       <template #is_withdrawal="{ row }">
         <el-tag size="small" type="success"  v-if="row.is_withdrawal == 0">{{ $t('未取款') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.is_withdrawal == 1">{{ $t('已取款') }}</el-tag>
      </template>
       <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('未知') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('转盘余额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 2">{{ $t('钱包余额') }}</el-tag>
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
