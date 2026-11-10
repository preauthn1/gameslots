<script setup lang="tsx">
import { reactive,ref } from "vue";
import { agentReportIndex } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { useRoute, useRouter } from "vue-router";
import {
  Back
} from '@element-plus/icons-vue'
import { transformI18n } from "@/plugins/i18n";
const route = useRoute();
const router = useRouter();
const columns = [//TableColumnList
  {
    label: transformI18n("代理用户"),
    prop: "username",
    width: '200px',
    fixed:'left',
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
  },
  {
    label: transformI18n("下级总人数"),
    prop: 'count_pnumber',
    width:'150'
  }, {
    label: transformI18n("新注册人数"),
    prop: "new_reg",
    width:'150'
  }, {
    label: transformI18n("充值人数"),
    prop: "recharge_pnumber",
    width:'150'
  }, {
    label: transformI18n("充值金额"),
    prop: "recharge_amount",
    width:'150'
  }, {
    label: transformI18n("首充人数"),
    prop: "first_recharge_pnumber",
    width:'150'
  }, {
    label: transformI18n("首充比例"),
    prop: "two_recharge_zb",
    width:'150'
  },{
    label: transformI18n("复充人数"),
    prop: "two_recharge_pnumber",
    width:'150'
  },{
    label: transformI18n("复充比例"),
    prop: "two_recharge_zb",
    width:'150'
  },{
    label: transformI18n("提现金额"),
    prop: "withdrawal_amount",
    width:'150'
  },{
    label: transformI18n("提现人数"),
    prop: "withdrawal_pnumber",
    width:'150'
  },{
  //   label: transformI18n("投注金额"),
  //   prop: "zd_price",
  //   width:'150'
  // },{
  //   label: transformI18n("投注人数"),
  //   prop: "zd_pnumber",
  //   width:'150'
  // },{
    label: transformI18n("所属层级"),
    prop: "max_level",
    width:'150'
  },
  {
    label: transformI18n("操作"),
    slot: 'right',
    fixed: 'right',
    width:'150'
  }
];



const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const list = {
  date: {
    type: 'time',
    value: (): Array<string> => {
      return []
    },
    prop:'date'
  },
  username:{
    type: 'input',
    placeholder: '用户UID/邮箱/手机号',
    value: '',
    prop:'username'
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
}
const searchListBox = reactive({
  list
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username:'',
  date: '',
  rec_code:'',
  id: route.query.id,
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  agentReportIndex(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    // pagination.page = res.data.current_page
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
  searchListBox.list[index].value = value;
}
//点击确定
const handleBtn = () => {
  console.log('点击');
  //搜索列表 没有日期的写法
  //   for (var key in pagination) {
  //       if (key == searchList[key]?.prop) {
  //         pagination[key] = searchList[key].value;
  //       }
  // }
    //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = searchListBox.list[key].value;
        const time = val?val.length > 0 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '':'';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
    pagination.page = 1;
    init();
}
const handleSee = (row) => {
  // route
  router.push('/weishang/viewreport?id='+row.uid)
}
const handleEdit = (row) => {
  router.push('/weishang/reportdetail?username='+row.username)
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
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
         <el-button type="primary" :icon="Back" @click="router.back()">{{ $t('返回') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.list"/>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
      <template #right="{row}">
        <el-button size="small" type="primary" @click="handleEdit(row)">{{ $t('查看') }}</el-button>
        <el-button size="small" type="primary" @click="handleSee(row)">{{ $t('下级') }}</el-button>
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
}
</style>
