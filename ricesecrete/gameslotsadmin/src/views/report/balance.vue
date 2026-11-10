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
    label: transformI18n("余额"),
    prop: 'balance'
  },
  {
    label: transformI18n("统计时间"),
    prop: "create_time",
  },
];

const searchList = {
  date:{
    type: 'time',
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
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  date:'',
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/report/balance', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
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
const showUser = (ip) => {
  userShow.value = true;
  pagination2.end_login_ip = ip
  getUsers();
}

//条件数据
const pagination2 = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  end_login_ip: '',
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
    label: transformI18n("注册IP"),
    slot: "reg_ip",
  },
  {
    label: transformI18n("最后登录时间"),
    prop: "login_time",
  },
  {
    label: transformI18n("最后登录IP"),
    slot: "end_login_ip",
  },
];
const userList: any = [];
const userTableData = reactive({ userList });

//获取用户信息
function getUsers() {
  http.post('/user/list', {data: pagination2}).then((res: any) => {
    userTableData.userList = res.data.data
    pagination2.total = res.data.total
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
const onPageSizeChange2 = (size: number) => {
  pagination2.limit = size;
  pagination2.page = 1;
  getUsers();
};
const onCurrentChange2 = (current: number) => {
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

    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #total="{ row }">
        <el-tag size="small" @click="showUser(row.ip_address)" type="success">{{ row.total }}</el-tag>
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
    <el-dialog v-model="userShow" :title="$t('会员列表')" width="80%">
      <pure-table :data="userTableData.userList" width="100%" :columns="userColumns">
        <template #lebal="{ row }">
          <el-tag v-if="row.lebal == 1" type="success" size="small">{{ $t('一般用户') }}</el-tag>
          <el-tag v-if="row.lebal == 2" type="danger" size="small">{{ $t('测试用户') }}</el-tag>
        </template>
        <template #reg_ip="{row}">
          <p v-html="row.reg_ip"/>
        </template>
        <template #end_login_ip="{row}">
          <p v-html="row.end_login_ip"/>
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
          @size-change="onPageSizeChange2"
          @current-change="onCurrentChange2"
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
