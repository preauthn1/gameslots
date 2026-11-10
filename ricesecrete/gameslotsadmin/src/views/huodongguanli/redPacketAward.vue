<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, getCurrentInstance, computed } from "vue";
import { redPacketAwardList } from "@/api/user";
import { message } from "@/utils/message";
import { storageLocal } from "@pureadmin/utils";

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("ID"),
    prop: "id",
    width: 50
  },
  {
    label: transformI18n("用户id"),
    prop: "uid",
  },
  {
    label: transformI18n("活动id"),
    prop: "rid",
  },
  {
    label: transformI18n("活动名称"),
    prop: "r_name",
  },
  {
    label: transformI18n("获得奖励"),
    prop: "award_value",
  },
  {
    label: transformI18n("领取奖励时间"),
    prop: "create_time",
  }
];
// const props = defineProps({
//   rid: String,
//   uid: String,
// })
// const rid = computed(() => {
//   return props.rid ? props.rid : 0;
// })
// const uid = computed(() => {
//   return props.uid ? props.uid : 0;
// })
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  uid: {
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'uid'
  },
  rid: {
    type: 'input',
    placeholder: '活动id',
    value: '',
    prop: 'rid'
  },
  date: {
    type: 'time',
    placeholder: '时间',
    idx: 1,
    value: (): Array<string> => {
      return []
    }
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export:{
    type: 'button',
    value:'导出',
    handle: 'export',
    prop: 'export',
  }
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  uid: '',//用户uid
  rid: '',//活动id
  date: '',//时间
  export:0,
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  redPacketAwardList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    // list2Box.dialogList.lang.options = res.langs
  })
}
//导出
const handleExport = () => {
  pagination.export = 1;
  redPacketAwardList(pagination).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
  })
  pagination.export = 0;
}
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};

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
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  pagination[index] = value
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  //时间转换
  const val = searchList['date'].value;
  // console.log(val)
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination['date'] = time//时间
  init(pagination);
}
</script>

<template>
  <div style="padding-bottom: 40px;">
    <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" />
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
  padding-bottom: 30px;
}
</style>
