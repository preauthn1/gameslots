<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { signRecordLists } from "@/api/user";
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
    label: transformI18n("签到任务ID"),
    prop: "sign_id",
  },
  {
    label: transformI18n("签到天数"),
    prop: "day",
  },
  {
    label: transformI18n("奖励金额"),
    prop: "reward_amount",
  },
  {
    label: transformI18n("奖励积分"),
    prop: "reward_integral",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("签到状态"),
    slot: "sign_status",
  },
  {
    label: transformI18n("是否领取奖励"),
    slot: "is_receive_reward",
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
 day:{
    type: 'input',
    label:'天数',
    placeholder:'天数',
    prop: 'day',
    value: '',
  },
  status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: '累计发放',
        value: 0,
      },
      {
        label: '发放当天',
        value: 1,
      },
      {
        label: '发放所有',
        value: 2,
      },
    ]
  },
  sign_status:{
    type: 'select',
    label:'签到状态',
    placeholder:'签到状态',
    prop:'sign_status',
    options: [
      {
        label: '补签',
        value: 0,
      },
      {
        label: '正常签到',
        value: 1,
      },
    ]
  },
  is_expired:{
    type: 'select',
    label:'是否过期',
    placeholder:'是否过期',
    prop:'is_expired',
    options: [
      {
        label: '否',
        value: 0,
      },
      {
        label: '是',
        value: 1,
      },
    ]
  },
  is_receive_reward:{
    type: 'select',
    label:'是否领取奖励',
    placeholder:'是否领取奖励',
    prop:'is_receive_reward',
    options: [
      {
        label: '否',
        value: 0,
      },
      {
        label: '是',
        value: 1,
      },
    ]
  },
  time:{
    type: 'time',
    placeholder: '时间',
    idx:1,
    value: (): Array<string> => {
      return []
    }
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
  day:'',//天数
  status:'',//状态
  sign_status:'',//签到状态
  is_expired:'',//是否过期
  is_receive_reward:'',//是否领取奖励
  uid: '',//用户uid
  date: '',//时间
  export:0,//导出
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  signRecordLists(pagination).then((res:any) => {
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
  signRecordLists(pagination).then((res:any) => {
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
  //时间转换
  const val = searchList['time'].value;
  console.log(val)
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination['date'] = time//时间
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
          <el-tag size="large">{{ $t('签到用户') }}:{{countDataBox.finish_user_count}}</el-tag>
          <el-tag size="large">{{ $t('发放用户') }}:{{countDataBox.send_user_count}}</el-tag>
          <el-tag size="large">{{ $t('签到金额') }}:{{countDataBox.finish_amount}}</el-tag>
          <el-tag size="large">{{ $t('发放金额') }}:{{countDataBox.send_amount}}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
      <template #status="{ row }">
         <el-tag size="small" type="success"  v-if="row.status == 0">{{ $t('累计发放') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.status == 1">{{ $t('发放当天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.status == 2">{{ $t('发放所有') }}</el-tag>
      </template>
       <template #sign_status="{ row }">
         <el-tag size="small" type="success"  v-if="row.sign_status == 0">{{ $t('补签') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.sign_status == 1">{{ $t('正常签到') }}</el-tag>
      </template>
       <template #is_receive_reward="{ row }">
         <el-tag size="small" type="success"  v-if="row.is_receive_reward == 0">{{ $t('未领取') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.is_receive_reward == 1">{{ $t('已领取') }}</el-tag>
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
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
  padding-bottom: 30px;
}
</style>
