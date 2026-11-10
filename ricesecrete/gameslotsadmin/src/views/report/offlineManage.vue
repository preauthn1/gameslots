<script setup lang="tsx">
import { reactive, ref } from "vue";
import { offlineManage } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime, timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
defineOptions({
  name: 'offlineManage'
})
const columns = [
    {
      label: transformI18n("用户信息"),
      prop: "username",
      width: 200,
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
    label: transformI18n("注册时间"),
    prop: "add_time",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        { formaTime(row.add_time * 1000) }
      </>
    )
  },
  {
    label: transformI18n("最后登录时间"),
    prop: "login_time",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        { formaTime(row.login_time * 1000) }
      </>
    )
  },
  {
    label: transformI18n("用户标签"),
    slot: "lebal",
    align:'center'
  },
  {
    label: transformI18n("充值总金额"),
    prop: "sum_arrival_price",
    align:'center'
    }
];

const searchList = {
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  time_type: {
    type: 'select',
    placeholder: '选择时间类型',
    value: '',
    options: [
      {
        label: '申请时间',
        value: 1,
      }, {
        label: '到账时间',
        value: 2,
      },
    ],
    prop: 'time_type'
  },
  date:{
    type: 'time',
    placeholder: '时间',
    value: (): Array<string> => {
      return []
    },
    prop:'date'
  },
   min_price: {
    type: 'input',
    placeholder: '最小金额',
    value: '',
    prop: 'min_price'
  },
   max_price: {
    type: 'input',
    placeholder: '最大金额',
    value: '',
    prop: 'max_price'
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
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username:'',
  time_type:'',
  date:'',
  min_price:'',
  max_price:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  offlineManage(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
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

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  // console.log('点击');
  //搜索列表 没有日期的写法
  //   for (var key in pagination) {
  //       if (key == searchList[key]?.prop) {
  //         pagination[key] = searchList[key].value;
  //       }
  // }
    //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
    pagination.page = 1;
    init(pagination);
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

    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
      <template #lebal="{ row }">
          <el-tag v-if="row.lebal == 1" type="success" size="small">{{ $t('一般用户') }}</el-tag>
          <el-tag v-if="row.lebal == 2" type="danger" size="small">{{ $t('测试用户') }}</el-tag>
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
