<script setup lang='tsx'>
import { ref,reactive } from "vue";
import { fundMxList } from "@/api/user";
import { transformI18n } from "@/plugins/i18n";

  const columns = [//TableColumnList
    {
      label: transformI18n("ID"),
       prop: "bank",
    }, {
      label: transformI18n("添加时间"),
      prop: "add_time",
    }, {
      label: transformI18n("交易金额"),
      prop: "price",
    }, {
      label: transformI18n("旧的金额"),
      prop: "old_price",
    }, {
      label: transformI18n("新的金额"),
      prop: "new_price",
    },  {
      label: transformI18n("交易类型"),
      slot: "type",

    }, {
      label: transformI18n("交易备注"),
      prop: "msg",
    }
];
//{/* onClick={() => handleSeeData(index + 1, row)} */}
const list = []
const tableData = reactive({list})

const props = defineProps({
  uid:String
})
const query = reactive({
  uid: '',
  page: 1,
  limit:10,
})
if (props?.uid) {
  query.uid = props.uid
}
function init() {
  fundMxList(query).then((res: any) => {
    tableData.list = res.data.data;
  })
}
init();

</script>

<template>
  <div>
     <pure-table :border="true" header-cell-class-name="customHeaderStyle"  :data="tableData.list" width="100%" :height="400" :columns="columns" >
        <template #type="{ row }">
            <span>{{ row.type== 1?'+':'-' }}</span>
        </template>
    </pure-table>

  </div>
</template>

<style scoped>
    .top-box{
      margin-bottom:20px;
    }
</style>
