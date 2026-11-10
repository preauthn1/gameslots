<script setup lang='tsx'>
import { reactive,onMounted,ref } from 'vue'
import { userBalancemxList } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';

  const columns = [
    {
      label: transformI18n("ID"),
       prop: "id",
    }, {
      label: transformI18n("添加时间"),
      prop: "add_time"
    }, {
      label: transformI18n("交易金额"),
      prop: "price",
    },{
      label: transformI18n("旧的金额"),
      prop: "old_price",
    },{
      label: transformI18n("新的金额"),
      prop: "new_price",
    },{
      label: transformI18n("交易类型"),
      slot: "type",
    },{
      label: transformI18n("分类"),
      prop: "balance_type",
    },{
      label: transformI18n("交易备注"),
      prop: "msg",
    }
];
const tableData = []
const tableDataBox = reactive({
  tableData
})
const props = defineProps({
  uid:String
})

//以下是搜索框的数据
const list = {
  id:{
    type: 'input',
    placeholder: '交易ID',
    value: '',
    prop:'id',
  },
  main_type: {
    type: 'select',
    placeholder: '分类',
    value: '',
    prop: 'main_type',
    options: []
  },
  remark:{
    type: 'input',
    placeholder: '交易备注',
    value: '',
    prop:'remark',
  },
  min_amount:{
    type: 'input',
    placeholder: '最小交易金额',
    value: '',
    prop:'min_amount',
  },
  max_amount:{
    type: 'input',
    placeholder: '最大交易金额',
    value: '',
    prop:'max_amount',
  },
  date:{
    type: 'time',
    placeholder: '交易时间',
    value: ():Array<string> => {
      return []
    },
    prop:'date'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox = reactive({ list });
//交易明细数据加载
const pagination = reactive({
  select: true,
  uid: '',
  id: '',
  page: 1,
  limit: 15,
  total: 0,
  remark: '',
  min_amount: '',
  max_amount: '',
  main_type: '',
  date: ''
})
if (props?.uid) {
  pagination.uid = props.uid
}


const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  earnData();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  earnData();
};

// earnData();
function earnData() {
  userBalancemxList(pagination).then((res: any) => {
      console.log(res)
    if (res.code == 1) {
      tableDataBox.tableData = res.data;
      pagination.total = res.total
      listbox.list.main_type.options = res.type_list
    }
  })
}

onMounted(() => {
  earnData();
})
//搜索
const handleSerch = () => {
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      pagination[key] = list[key].value;
    }
  }
  earnData();
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
</script>

<template>
  <div class="record-box">
    <div class="tip el-button--primary" style="margin-bottom:15px;">{{ $t('基金提现到账为0，不记录该次收益记录') }}</div>
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
     <pure-table :border="true" header-cell-class-name="customHeaderStyle"  cell-class-name="customRowtd" :data="tableDataBox.tableData" width="100%" :height="400" :columns="columns" >
      <template #type="{ row }">
        <el-tag type="danger" v-if="row.type == 2">{{ $t('减少') }}</el-tag>
        <el-tag type="success" v-else-if="row.type == 1">{{ $t('增加') }}</el-tag>
        <el-tag type="success" v-else>{{ $t('其他') }}({{ row.type }})</el-tag>
      </template>
    </pure-table>
     <div class="clearfix" style="margin-top: 15px;">
      <el-pagination
          class="float-right"
          v-model:currentPage="pagination.page"
          :page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[15, 50, 100, 500]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
    </div>
  </div>
</template>

<style scoped lang="scss">
    .top-box{
      margin-bottom:20px;
    }
    .tip{
      color: var(--el-button-bg-color);
    }
</style>