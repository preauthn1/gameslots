<script setup lang='tsx'>
import { reactive,onMounted } from 'vue'
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

//交易明细数据加载
const pagination = reactive({
  select: true,
  uid: '',
  page: 1,
  limit: 12,
  total: 0,
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
    }
  })
}

onMounted(() => {
  earnData();
})

</script>

<template>
  <div class="record-box">
    <div class="tip el-button--primary" style="margin-bottom:15px;">{{ $t('基金提现到账为0，不记录该次收益记录') }}</div>
     <pure-table :border="true" header-cell-class-name="customHeaderStyle"  cell-class-name="customRowtd" :data="tableDataBox.tableData" width="100%" :height="400" :columns="columns" >
      <template #type="{ row }">
        <span>{{ row.type == 1 ? '+' : '-' }}</span>
      </template>
    </pure-table>
     <div class="clearfix" style="margin-top: 15px;">
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
    .top-box{
      margin-bottom:20px;
    }
    .tip{
      color: var(--el-button-bg-color);
    }
</style>
