<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { pddInviteRecord } from "@/api/user";
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
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("用户username"),
    prop: "username",
  },
  {
    label: transformI18n("邀请用户uid"),
    prop: "invite_uid",
  },
  {
    label: transformI18n("邀请用户username"),
    prop: "invite_username",
  },
  {
    label: transformI18n("抽奖金额"),
    prop: "amount",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("取款金额"),
    prop: "withdrawal_amount",
  },
  {
    label: transformI18n("是否取款"),
    slot: "is_withdrawal",
  },
  {
    label: transformI18n("转盘次数"),
    prop: "turntable_num",
  },
  {
    label: transformI18n("已转次数"),
    prop: "finish_turntable_num",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  uid:{
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'uid'
  },
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: '未知',
        value: 0,
      },
      {
        label: '转盘余额',
        value: 1,
      },
      {
        label: '钱包余额',
        value: 2,
      },
    ]
  },
  username:{
    type: 'input',
    placeholder: '用户username',
    value: '',
    prop: 'username'
  },
  invite_uid:{
    type: 'input',
    placeholder: '邀请用户uid',
    value: '',
    prop: 'invite_uid'
  },
  invite_username:{
    type: 'input',
    placeholder: '邀请用户username',
    value: '',
    prop: 'invite_username'
  },
  status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: '未抽奖',
        value: 0,
      },
      {
        label: '已抽奖',
        value: 1,
      },
    ]
  },
  is_withdrawal:{
    type: 'select',
    label:'取款状态',
    placeholder:'取款状态',
    prop:'is_withdrawal',
    options: [
      {
        label: '待取款',
        value: 0,
      },
      {
        label: '已取款',
        value: 1,
      },
    ]
  },
  is_recharge:{
    type: 'select',
    label:'是否充值',
    placeholder:'是否充值',
    prop:'is_recharge',
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
  is_first:{
    type: 'select',
    label:'是否第一次抽奖',
    placeholder:'是否第一次抽奖',
    prop:'is_first',
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
  uid:'',//UID
  type:'',//类型
  username:'',//用户username
  invite_uid:'',//邀请用户id
  invite_username:'',//邀请用户username
  status:'',//抽奖状态
  date: '',//时间
  is_withdrawal: '',//取款状态
  is_recharge: '',//是否充值
  is_first: '',//是否第一次抽奖
  export:0,//导出
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pddInviteRecord(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    countDataBox.value = res.statistics
    // list2Box.dialogList.lang.options = res.langs
  })
}

//导出
const handleExport = () => {
  pagination.export = 1;
  pddInviteRecord(pagination).then((res:any) => {
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


const turntableRecordShow = ref(false);
const turntableRecordId = ref("");
const handleDayList = row => {
  turntableRecordId.value = row.id;
  turntableRecordShow.value = true;
};
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
          <el-tag size="large">{{ $t('参与用户数') }}:{{countDataBox.take_user_count}}</el-tag>
          <el-tag size="large">{{ $t('邀请用户数') }}:{{countDataBox.invite_user_count}}</el-tag>
          <el-tag size="large">{{ $t('完成用户数') }}:{{countDataBox.finish_user_count}}</el-tag>
          <el-tag size="large">{{ $t('完成金额') }}:{{countDataBox.finish_amount}}</el-tag>
        </div>
      </div>
    </div>
    <el-dialog v-model="turntableRecordShow" :title="$t('转盘记录')" width="80%" heith="100%">
      <component
        :id="turntableRecordId"
        :is="
          defineAsyncComponent(() =>
            import('@/views/pdd/pddTurntableRecord.vue')
          )
        "
      />
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
       <template #status="{ row }">
         <el-tag size="small" type="success"  v-if="row.status == 0">{{ $t('未抽奖') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.status == 1">{{ $t('已抽奖') }}</el-tag>
      </template>
       <template #is_withdrawal="{ row }">
         <el-tag size="small" type="success"  v-if="row.is_withdrawal == 0">{{ $t('未取款') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.is_withdrawal == 1">{{ $t('已取款') }}</el-tag>
      </template>
       <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('未知') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('转盘余额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 2">{{ $t('钱包余额') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" type="primary" @click="handleDayList(row)">{{ $t('抽奖记录') }}</el-button>
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
