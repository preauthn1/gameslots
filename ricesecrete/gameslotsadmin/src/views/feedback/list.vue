<script setup lang="tsx">
import { reactive,ref } from "vue";
import { feedbackList } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
defineOptions({
  name: 'feedbackList'
})
const columns = [//TableColumnList

  {
    label: transformI18n("用户名"),
    prop: "username",
  },{
    label: transformI18n("内容"),
    prop: "content",
  }, {
    label: transformI18n("时间"),
    prop: "time",
  }
];

const handleEdit = (index,row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  date:{
    type: 'time',
    placeholder: '开始时间-结束时间',
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
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  date:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  feedbackList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
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
  // console.log('点击');
  //搜索列表 没有日期的写法
  //   for (var key in pagination) {
  //       if (key == searchList[key]?.prop) {
  //         pagination[key] = searchList[key].value;
  //       }
  // }
    //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
    pagination.page = 1;
    init(pagination);
}

</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" />
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
