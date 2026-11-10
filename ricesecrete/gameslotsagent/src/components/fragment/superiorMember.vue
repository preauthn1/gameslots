<script setup lang='tsx'>
import { transformI18n } from "@/plugins/i18n";
import { ref } from "vue";
  const columns = [//TableColumnList
    {
      label: transformI18n("用户名称"),
       prop: "bank",
      width: '150px',
    }, {
      label: transformI18n("等级"),
      prop: "bankcode",
      width: '150px'
    }, {
      label: transformI18n("推广码"),
      prop: "userBank",
    }, {
      label: transformI18n("广告用户"),
      prop: "userBank",
    }, {
      label: transformI18n("注册时间/注册ip"),
      prop: "userBank",
      width:'200px'
    },  {
      label: transformI18n("登录时间/登录ip"),
      prop: "userBank",
      width:'200px'
    }, {
      label: transformI18n("余额"),
      prop: "userBank",
    },{
      label: transformI18n("状态"),
      // prop: "status",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button type="primary">{ transformI18n('启用') }</el-button>
        </>
      )
    },
    {
      label: transformI18n("操作"),
      prop: "userBank",
       cellRenderer: ({ index, row }) => (
        <>
          <el-button type="warning">{ transformI18n('资料') }</el-button>
        </>
      )
    }
];
//{/* onClick={() => handleSeeData(index + 1, row)} */}
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
</script>

<template>
  <div>
     <pure-table :border="true" header-cell-class-name="customHeaderStyle"  :data="tableData" width="100%" :height="400" :columns="columns" />
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
