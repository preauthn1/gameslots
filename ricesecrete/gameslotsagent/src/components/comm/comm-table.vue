<script setup lang="ts">
import { reactive } from "vue";
const props = defineProps<{
  data?: any[],
  columns: any[],
  searchItems: any[]
}>()

const emit = defineEmits(['export', 'search', 'load'])

function handleClick(row) {
  console.log(
    "%crow===>>>: ",
    "color: MidnightBlue; background: Aquamarine; font-size: 20px;",
    row
  );
}

//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  sff_m: '',
  sff_w: '',
  sff_uid: '',
  sff_utype: '',
});
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  // props.searchItems[index] = value;
}

const onPageSizeChange2 = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  emit('load', pagination)
};
const onCurrentChange2 = (current: number) => {
  pagination.page = current;
  emit('load', pagination)
};
</script>

<template>
  <div>
    <commSerach @export="emit('export')" @search="emit('search')" @currentChange="handleCurrentChange"  :list="searchItems"/>
    <pure-table :data="data" width="100%" :columns="columns">
      <template #lebal="{ row }">
        <el-tag v-if="row.lebal == 1" type="success" size="small">{{ $t('一般用户') }}</el-tag>
        <el-tag v-if="row.lebal == 2" type="danger" size="small">{{ $t('测试用户') }}</el-tag>
      </template>
    </pure-table>
    <div class="btmNav clearfix">
    <el-pagination
        class="float-right"
        v-model:currentPage="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[12, 24, 36, 50, 100]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange2"
        @current-change="onCurrentChange2"
      />
    </div>
  </div>
</template>
