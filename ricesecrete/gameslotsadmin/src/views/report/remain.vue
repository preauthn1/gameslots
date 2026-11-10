<script setup lang="tsx">
import { reactive, ref } from "vue";
import { http } from "@/utils/http";
import { message } from "@/utils/message";
import { formaTime, timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
defineOptions({
  name: 'report_remain'
})
const columns = [
  {
    label: transformI18n("日期"),
    prop: "remain_stat",
    width: 100,
    fixed:'left',
  },
  {
    label: transformI18n("首充人数"),
    prop: "recharge_user",
    width: 100
  },
  {
    label: transformI18n("首充金额"),
    prop: "recharge_amount",
    width: 100
  },
  {
    label: transformI18n("1日"),
    prop: 'remain_rate1',
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount1" },
      { label: transformI18n("充值人数"), prop: "remain_people1" },
      { label: transformI18n("留存率"), prop: "remain_rate1" }
    ]
  },
  {
    label: transformI18n("2日"),
    prop: 'remain_rate2',
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount2" },
      { label: transformI18n("充值人数"), prop: "remain_people2" },
      { label: transformI18n("留存率"), prop: "remain_rate2" }
    ]
  },
  {
    label: transformI18n("3日"),
    prop: 'remain_rate3',
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount3" },
      { label: transformI18n("充值人数"), prop: "remain_people3" },
      { label: transformI18n("留存率"), prop: "remain_rate3" }
    ]
  },
  {
    label: transformI18n("4日"),
    prop: 'remain_rate4',
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount4" },
      { label: transformI18n("充值人数"), prop: "remain_people4" },
      { label: transformI18n("留存率"), prop: "remain_rate4" }
    ]
  },
  {
    label: transformI18n("5日"),
    prop: "remain_rate5",
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount5" },
      { label: transformI18n("充值人数"), prop: "remain_people5" },
      { label: transformI18n("留存率"), prop: "remain_rate5" }
    ]
  },
  {
    label: transformI18n("6日"),
    prop: "remain_rate5",
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount6" },
      { label: transformI18n("充值人数"), prop: "remain_people6" },
      { label: transformI18n("留存率"), prop: "remain_rate6" }
    ]
  },
  {
    label: transformI18n("7日"),
    prop: "remain_rate7",
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount7" },
      { label: transformI18n("充值人数"), prop: "remain_people7" },
      { label: transformI18n("留存率"), prop: "remain_rate7" }
    ]
  },
  {
    label: transformI18n("15日"),
    prop: "remain_rate15",
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount15" },
      { label: transformI18n("充值人数"), prop: "remain_people15" },
      { label: transformI18n("留存率"), prop: "remain_rate15" }
    ]
  },
  {
    label: transformI18n("30日"),
    prop: "remain_rate30",
    children: [
      { label: transformI18n("充值金额"), prop: "remain_amount30" },
      { label: transformI18n("充值人数"), prop: "remain_people30" },
      { label: transformI18n("留存率"), prop: "remain_rate30" }
    ]
  },
  // {
  //   label: transformI18n("60日"),
  //   prop: "remain_rate60",
  // },
];

const searchList = {
  date:{
    type: 'date',
    placeholder: '开始时间',
    value: (): Array<string> => {
      return []
    },
    prop: 'date'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
  export:{
    type: 'button',
    value: '导出',
    handle: 'export',
    prop:'export'
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  date: '',
  export: 0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  pagination.export = 0;
  http.post('/remain/index', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
  })
}

//导出
const handleExport = () => {
  pagination.export = 1;
  http.post('/remain/index', {data: pagination}).then((res:any)=>{
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}
//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
  init();
}
// 会员列表
const userShow = ref(false)
const showUser = (id, rate, number) => {
  if (id <= 0 || rate <= 0) {
    return;
  }
  userShow.value = true;
  pagination2.id = id
  pagination2.day = number.replace('remain_rate', '').replace('remain_amount', '')
  getUsers();
}

//条件数据
const pagination2 = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  id: '',
  day: '',
});

const userColumns = [
  {
    label: transformI18n("用户名"),
    prop: "username",
    width: 220,
    fixed: true,
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.id)}>
          <p>UID:{row.id}</p>
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
    label: transformI18n("用户标签"),
    slot: "lebal",
    align:'center'
  },
  {
    label: transformI18n("邀请码"),
    prop: 'rec_code'
  },
  {
    label: transformI18n("会员等级"),
    prop: "level_name",
  },
  {
    label: transformI18n("用户余额"),
    prop: "balance",
  },
  {
    label: transformI18n("注册时间"),
    prop: "add_time",
  },
  {
    label: transformI18n("最后登录时间"),
    prop: "login_time",
  },
];
const userList: any = [];
const userTableData = reactive({ userList });

//获取用户信息
function getUsers() {
  http.post('/remain/user', {data: pagination2}).then((res: any) => {
    userTableData.userList = res.data
    pagination2.total = res.count
  })
}
const onPageSizeChange = (size: number) => {
  pagination2.limit = size;
  pagination2.page = 1;
  getUsers();
};
const onCurrentChange = (current: number) => {
  pagination2.page = current;
   getUsers();
};
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

    <el-table :data="tableData.dataList" style="width: 100%">
      <el-table-column align="center" v-for="(col, index) in columns" :key="index" :prop="col.prop" :label="col.label" :width="col.width" :fixed="col.fixed">
        <template v-if="col.children && col.children.length > 0">
          <el-table-column align="center" v-for="(col2, index) in col.children" :key="index" :prop="col2.prop" :label="col2.label" :width="100">
            <template #default="{ row }">
              <span @click="showUser(row.id, row[col2.prop], col2.prop)">{{ row[col2.prop] }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="userShow" :title="$t('会员列表')" width="80%">
      <pure-table :data="userTableData.userList" width="100%" :columns="userColumns">
        <template #lebal="{ row }">
          <el-tag v-if="row.lebal == 1" type="success" size="small">{{ $t('一般用户') }}</el-tag>
          <el-tag v-if="row.lebal == 2" type="danger" size="small">{{ $t('测试用户') }}</el-tag>
        </template>
      </pure-table>
      <div class="btmNav">
      <el-pagination
          class="float-right"
          v-model:currentPage="pagination2.page"
          :page-size="pagination2.limit"
          :total="pagination2.total"
          :page-sizes="[12, 24, 36, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>
<style scoped>
.btmNav{
  padding:30px 0;
}
</style>
