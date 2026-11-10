<script setup lang="tsx">
import { computed, reactive, ref } from 'vue';
import { userAdminLogList } from "@/api/user";
 import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';

const columns = [//TableColumnList
  {
    label: transformI18n("ID"),
    prop: "id",
  },
  {
    label: transformI18n("操作时间"),
    prop: "add_time",
  },
  {
    label: transformI18n("操作说明"),
    prop: "cz_msg"
  },
  {
    label: transformI18n("操作者"),
    slot: "admin_name",
  },
];
const props = defineProps({
    uid: String,
})
const uid = computed(() => {
  return props.uid
})

//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  handle_name: '',//id 推广码 用户名 精确搜索
  date: '',
  uid:uid
});

const dataList: any = [];
const tableData = reactive({ dataList });

//首次需要加载的接口
init();
function init() {
  userAdminLogList(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    // pagination.page = res.data.current_page
  })
}
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
   init();
};

</script>

<template>
  <div class="">
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
      <template #admin_name="{ row }">
        {{ $t(row.admin_name) }}
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
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
</style>
