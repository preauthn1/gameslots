<script setup lang='tsx'>
import { transformI18n } from "@/plugins/i18n";
import { ref } from "vue";
  const columns = [//TableColumnList
    {
      label: transformI18n("登录时间"),
       prop: "bank",
      width: '300px',
    }, {
      label: transformI18n("登录ip"),
      prop: "bankcode",
      width: '300px'
    }, {
      label: transformI18n("登录地区"),
      prop: "userBank",
    }
];
const tableData = [
  {
    bank: '银行名称',
    bankcode:'银行卡号',
    userBank:'开户者姓名'
  }
]
const pagination = ref({ page: 1, limit: 12, total: 0 });
const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
};
const align = 'align'
</script>

<template>
  <div>
    <!-- <div class="flex-bc top-box">
      <div></div>
      <el-button type="primary">
          <template #icon>
            <IconifyIconOffline :size="26" icon="refresh-right" />
          </template>
          刷新
      </el-button>
    </div> -->
     <pure-table :border="true" header-cell-class-name="customHeaderStyle"  :data="tableData" width="100%" :align="align" :height="400" :columns="columns" />
    <div>
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
    .top-box{
      margin-bottom:20px;
    }
</style>
