<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { cardRecordList } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import uploadImage from '@/components/comm/uploadImage.vue'
import { hasAuth } from '@/router/utils';
import { Sign } from "crypto";
import menuList from "@/components/menu/menu.vue"
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'cardRecordList'
})

const props = defineProps({
  id:String,
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("UID"),
    prop: "uid",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("五福名称"),
    prop: "w_name",
  },
  {
    label: transformI18n("卡片名称"),
    prop: "c_name",
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
    label:'UID',
    placeholder:'UID',
    prop: 'uid',
    value: '',
  },
  invite_uid:{
    type: 'input',
    label:'邀请用户UID',
    placeholder:'邀请用户UID',
    prop: 'invite_uid',
    value: '',
  },
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: '邀请获得',
        value: 0,
      },
      {
        label: '首次充值',
        value: 1,
      },
      {
        label: '首次游戏',
        value: 2,
      },
      {
        label: '注册获得',
        value: 3,
      },
      {
        label: '任务获得',
        value: 4,
      },
      {
        label: 'APP下载',
        value: 5,
      },
    ]
  },
  w_name:{
    type: 'input',
    label:'五福名称',
    placeholder:'五福名称',
    prop: 'w_name',
    value: '',
  },
  c_name:{
    type: 'input',
    label:'卡片名称',
    placeholder:'卡片名称',
    prop: 'c_name',
    value: '',
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
  uid:'',//uid
  type:'',//类型
  w_name: '',//五福名称
  c_name: '',//卡片名称
  export:0,//导出
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  cardRecordList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
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
  cardRecordList(pagination).then((res: any) => {
    console.log(res)
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
  })
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
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}
</script>

<template>
  <div>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <menuList />
    <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
      <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('邀请获得') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('首次充值') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 2">{{ $t('首次游戏') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 3">{{ $t('注册获得') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 4">{{ $t('任务获得') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 5">{{ $t('APP下载') }}</el-tag>
      </template>
    </pure-table>
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
  padding-bottom:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
