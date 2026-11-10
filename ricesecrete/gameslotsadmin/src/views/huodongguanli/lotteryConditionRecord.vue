<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { message } from "@/utils/message";
import { lotteryConfigConditionRecord } from "@/api/user";
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
    label: transformI18n("转盘名称"),
    prop: "lottery_name",
  },
  {
    headerRenderer: () => transformI18n("用户账号"),
    prop: "username",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        {/* <p title={row.username} style="white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{row.username}</p> */}
        <div onClick={() => showUserInfo(row.uid)}>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.phone}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.mail}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.mail}</p>
          </div>
        </div>
      </>
    )
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("领取次数"),
    prop: "reward_count",
    width:100
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  title:{
    type: 'input',
    placeholder: '转盘名称',
    value: '',
    prop:'title'
  },
  type:{
    type: 'select',
    label:'条件类型',
    placeholder:'条件类型',
    prop:'type',
    options: [
    {
        label: '所有',
        value: -1,
      },{
        label: '最低下注',
        value: 0,
      },{
        label: '最低充值',
        value: 1,
      },{
        label: '最低倍数',
        value: 2,
      },{
        label: '累计充值',
        value: 3,
      },
      // {
      //   label: '在线时长',
      //   value: 4,
      // },
      {
        label: '累计下注',
        value: 5,
      },
      // {
      //   label: '游戏时长',
      //   value: 6,
      // },
      {
        label: '邀请人数',
        value: 7,
      },{
        label: 'APP登录',
        value: 8,
      },{
        label: '添加银行卡',
        value: 9,
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
    value:'1',
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
  title: '',//任务标题
  type: '',//类型
  date: '',//时间
  lang: storageLocal().getItem("i18n_locale"),//语言
  username: '',//用户
  export:0,
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pagination.export = 0;
  lotteryConfigConditionRecord(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
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
  lotteryConfigConditionRecord(pagination).then((res: any) => {
    console.log(res)
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
  })
  pagination.export = 0;
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

//判断条件是否显示
const judgeTaskConditionIsShow = (task_condition, value) =>{
  if(task_condition == fa){
    return task_condition.includes(value)
  }
  return false
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div style="padding-bottom: 40px;">
    <menuList />
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
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
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
      <template #type="{ row }">
         <el-tag size="small" type="success" v-if="row.type == '-1'">{{ $t('所有') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '0'">{{ $t('最低下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '1'">{{ $t('最低充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '2'">{{ $t('最低倍数') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '3'">{{ $t('累计充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '4'">{{ $t('在线时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '5'">{{ $t('累计下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '6'">{{ $t('游戏时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '7'">{{ $t('邀请人数') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '8'">{{ $t('APP登录') }}</el-tag>
         <el-tag size="small" type="success" v-if="row.type == '9'">{{ $t('添加银行卡') }}</el-tag>
      </template>
      <template #receive_status="{ row }">
         <el-tag size="small" type="success"  v-if="row.receive_status == 0">{{ $t('未领取') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.receive_status == 1">{{ $t('已领取') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('无') }}</el-tag>
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
