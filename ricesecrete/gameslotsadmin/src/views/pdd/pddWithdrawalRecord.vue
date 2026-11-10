<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { pddWithdrawalRecord } from "@/api/user";
import { message } from "@/utils/message";
import { storageLocal } from "@pureadmin/utils";
import menuList from "@/components/menu/menu.vue"

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("ID"),
    prop: "id",
    width:50
  },
  {
    label: transformI18n("用户id"),
    prop: "uid",
  },
  {
    label: transformI18n("用户username"),
    prop: "username",
  },
  {
    label: transformI18n("取款金额"),
    prop: "amount",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  uid:{
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'uid'
  },
  username:{
    type: 'input',
    placeholder: '用户username',
    value: '',
    prop: 'username'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
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
  uid:'',//UID
  username:'',//用户username
  export:0,//导出
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pddWithdrawalRecord(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    countDataBox.value = res.statistics
    // list2Box.dialogList.lang.options = res.langs
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


//导出
const handleExport = () => {
  pagination.export = 1;
  pddWithdrawalRecord(pagination).then((res:any) => {
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
    pagination.export = 0;
  });
}
//导出弹窗列表
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}
const countDataBox: any = ref({})
</script>

<template>
  <div style="padding-bottom: 40px;">
    <menuList />
    <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <div class="flex-bc line-box">
      <div class="flex-bc" >
        <div style="margin-left:20px;font-size: 14px;" >
          <el-tag size="large">{{ $t('提款用户数') }}:{{countDataBox.user_count}}</el-tag>
          <el-tag size="large">{{ $t('完成金额') }}:{{countDataBox.finish_amount}}</el-tag>
        </div>
      </div>
    </div>
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
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
  padding-bottom: 30px;
}
</style>
