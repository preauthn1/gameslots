<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { integralDataRecord } from "@/api/user";
import uploadImage from '@/components/comm/uploadImage.vue'
import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';
defineOptions({
  name:'lotteryReport'
})
const columns = [
    {
      label: transformI18n("時間"),
    prop: "date",
      align:'center'
    },
    {
      label: transformI18n("抽奖人数"),
      prop: "lottery_number",
      align:'center'
    },{
      label: transformI18n("消耗金额"),
      prop: "consumption_amount",
      align:'center'
    },
    {
      label: transformI18n("消耗积分"),
      prop: "consume_points",
      align:'center'
    },{
      label: transformI18n("抽奖次数"),
      prop: "number_draws",
      align:'center'
    },{
      label: transformI18n("中獎金額"),
      prop: "winning_amount",
      align:'center'
    }
];
  //编辑

const height = window.innerHeight - 200;
//以下是搜索框的数据
const list = [
 {
    type: 'time',
    idx:0,
    placeholder: '注册时间',
    value: ():Array<string> => {
      return []
    }
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:1
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = ref<any>({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  date:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.value.page = 1;
//   pagination.value.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  integralDataRecord(pagination.value).then((res: any) => {
    // console.log(res.data);
    // tableData.dataList = res.data.data
    // pagination.value.total = res.data.total
    // pagination.value.page = res.data.current_page

    const list = res.data;
    const arr = [];
    for (const key in list) {
      list[key].time = key;
      arr.push(list[key]);
    }
     tableData.dataList = arr
    //  pagination.value.total = res.data.total
    //   pagination.value.page = res.data.current_page
  })
}
// const onPageSizeChange = (size: number) => {
//   pagination.value.limit = size;
//   pagination.value.page = 1;
//   init();
// };
// const onCurrentChange = (current: number) => {
//   pagination.value.page = current;
//    init();
// };
//搜索
const handleSerch = () => {
  pagination.value.page = 1;
  //时间转换
  const time = list[0].value.length > 0 ? timeCycle(list[0].value[0]) + ' - ' + timeCycle(list[0].value[1]) : '';
  pagination.value.date = time
  init();
}
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}

</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
    <!-- <div class="btmNav">
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
    </div> -->
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
