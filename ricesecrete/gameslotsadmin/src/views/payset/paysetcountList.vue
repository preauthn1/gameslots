<script setup lang="tsx">
import { reactive,ref } from "vue";
// @ts-ignore
import userSelected from  '@/components/user/userSelected.vue'
import { paysetcountList } from "@/api/user";

import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
defineOptions({
  name: 'paysetcountList'
})
const columns = [//TableColumnList
  {
    label: transformI18n("渠道类型"),
    prop: "pay_type_name",
  },
  {
    label: transformI18n("支付名称"),
    prop: "pay_name",
  },
  {
    label: transformI18n("充值总笔数"),
    prop: "count_num",
  },
  {
    label: transformI18n("充值总金额"),
    prop: "count_price",
  },
  {
    label: transformI18n("成功总笔数"),
    prop: "count_success_num",
  },
  {
    label: transformI18n("成功总金额"),
    prop: "count_success_price",
  },
  {
    label: transformI18n("成功率"),
    prop: "percentage",
  }
];

const height = window.innerHeight - 260;
//搜索的数据

const searchList = [
  {
    type: 'time',
    placeholder: '时间',
    value: ():Array<string> => {
      return []
    }
  }, {
    type: 'button',
    handle: 'search',
    value:'搜索'
  }
]
const searchListBox = reactive({
  searchList
})

const pagination = ref({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  order: 'desc',//排序 desc 或 asc
  field: 'id',//排序字段 id 或 balance
  date:'',
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  paysetcountList(pagination.value).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.value.total = res.data.total
  })
}

const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init(pagination.value);
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
  init(pagination.value);
};

//下拉选择返回的数据
const selectChange = ({value,index}) => {
  searchListBox.searchList[index].value = value;
}
//下来时间返回的数据
const selectDateChange = ({starTime,endTime,index}) => {
  searchListBox.searchList[index].value[0] = starTime
  searchListBox.searchList[index].value[1] = endTime
}
//输入框的数据
const handleInput = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  const val = searchListBox.searchList[0].value;
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination.value.date = time
  init(pagination.value);
}

</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="selectChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"/> -->
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
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
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
</style>
