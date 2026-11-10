<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance,defineAsyncComponent } from "vue";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { useRouter } from "vue-router";
const { proxy } = getCurrentInstance();
const columns = [
  {
    label: transformI18n("用户账号"),
    prop: "username",
    width:200,
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.uid)}>
          <p>UID:{row.uid}</p>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
      </>
    )
  },{
    label: transformI18n("推广码"),
    prop: "rec_code",
  }, 
  {
    label: transformI18n("代理类型"),
    slot: "type",
  },
  {
    label: transformI18n("下级总人数"),
    prop: "count_pnumber",
  },
  {
    label: transformI18n("下级有效总人数"),
    prop: "total_valid_people",
  },
  {
    label: transformI18n("总提现"),
    prop: "total_withdrawal",
  },
  {
    label: transformI18n("佣金总数"),
    prop: "total_feebalance",
  },
  {
    label: transformI18n("游戏下注"),
    prop: "game_bets",
  },
  {
    label: transformI18n("新注册人数"),
    prop: "new_reg",
  },
  
  {
    label: transformI18n("操作"),
    slot:'right',
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: '',
    prop:'username'
  },
  invite_time: {
    type: 'time',
    placeholder: '推广时间',
    value: (): Array<string> => {
      return []
    }
  },
  agent_type:{
    type: 'select',
    label:'代理类型',
    placeholder:'代理类型',
    prop:'agent_type',
    options: [
      // {
      //   label: '无上级（不含内部代理）',
      //   value: -2,
      // },
      // {
      //   label: '无上级（含内部代理）',
      //   value: -1,
      // },
      {
        label: '外部代理',
        value: 0,
      },
      {
        label: '内部代理',
        value: 1,
      },
    ]
  },
  rec_code:{
    type: 'input',
    placeholder: '推广码',
    value: '',
    prop:'rec_code'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export',
  }
}


//导出
const handleExport = () => {
  pagination.export = 1;
  http.post('/agent_report/index', {data: pagination}).then((res:any) => {
    if (res.code == 1) {
      handleDownloadList()
    } else {
      message(res.msg, { type: 'error' });
    }
  })
  pagination.export = 0;
}

const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};

const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username: '',
  export: 0,
  invite_time: '',
  rec_code:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/agent_report/index', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
  })
}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init();
};

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
  if ( searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  pagination[index] = value
}
//点击确定
const handleBtn = () => {
  // console.log('点击');
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.export = 0;
  pagination.page = 1;
  init();
}

const router = useRouter();
const handleSee = (row) => {
  // route
  router.push('/weishang/viewreport?id='+row.uid)
}
const handleEdit = (row) => {
  console.log('/weishang/reportdetail?username='+row.uid);
  router.push('/weishang/reportdetail?username='+row.uid)
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
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
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns">
      <template #right="{ row }">
        <el-button size="small" type="primary" @click="handleEdit(row)">{{ $t('查看') }}</el-button>
        <el-button size="small" type="primary" @click="handleSee(row)">{{ $t('下级') }}</el-button>
      </template>
      <template #type="{ row }">
          <el-tag size="small" type="danger" v-if="row.type == 0">{{ $t('外部代理') }}</el-tag>
          <el-tag size="small" type="success" v-else>{{ $t('内部代理') }}</el-tag>
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
}
.line-box{
  margin-bottom: 10px;
}
</style>
