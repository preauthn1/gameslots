<script setup lang='tsx'>
  import { transformI18n } from '@/plugins/i18n';

  const columns = [
    {
      label: transformI18n("ID"),
       prop: "bank",
      width: '200px',
    }, {
      label: transformI18n("添加时间"),
      prop: "bankcode"
    }, {
      label: transformI18n("操作说明"),
      prop: "userBank",
    },{
      label: transformI18n("操作者"),
      prop: "caozuo",
    }
];
const tableData = [
  {
    ID: 'ID',
    bankcode:'添加时间',
    userBank: '开户者姓名',
    caozuo:'操作者'
  }
]

</script>

<template>
  <div class="record-box">
     <pure-table :border="true" header-cell-class-name="customHeaderStyle"  :data="tableData" width="100%" :height="400" :columns="columns" />

  </div>
</template>

<style scoped>
    .top-box{
      margin-bottom:20px;
    }
</style>
