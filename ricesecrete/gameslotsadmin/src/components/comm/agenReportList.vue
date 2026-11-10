<script setup lang="tsx">
import { reactive,ref } from "vue";
import { agentReportIndex } from "@/api/user";
import { message } from "@/utils/message";
import { useRoute, useRouter } from "vue-router";
import { transformI18n } from "@/plugins/i18n";
const route = useRoute();
const router = useRouter();
const emit = defineEmits(['select'])
const prop = defineProps({
  select:Boolean
})
const columns = [//TableColumnList
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
  }, {
    label: transformI18n("下级总人数"),
    prop: "count_pnumber",
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

const handleEdit = (row) => {
  emit('select',row)
}


const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {

  username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: '',
    prop:'username'
  },
  rec_code:{
    type: 'input',
    placeholder: '推广码',
    value: '',
    prop:'rec_code'
  },
  min_recharge:{
    type: 'input',
    placeholder: '最低充值',
    value: '',
    widoth: '100',
    prop:'min_recharge'
  },
  max_recharge:{
    type: 'input',
    placeholder: '最高充值',
    value: '',
    widoth: '100',
    prop:'max_recharge'
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
  username: '',
  min_recharge: '',//最低充值
  max_recharge: '',//最高充值
  rec_code:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  agentReportIndex(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
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
    //搜索列表 有日期的写法

  // for (var key in pagination) {
  //   if (key == list[key]?.prop) {
  //     if (key == 'date') {
  //       let val = list[key].value;
  //       const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  //       pagination[key] =  time;
  //     } else {
  //       pagination[key] = list[key].value
  //     }
  //   }
  // }
    pagination.page = 1;
    init(pagination);
}

const handleSee = (row) => {
  // route
  router.push('/weishang/viewreport?id='+row.uid)
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
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
        <template #right="{ row }">
             <el-button v-if="prop.select" size="small" type="primary" @click="handleEdit(row)">{{ $t('选择当前账号') }}</el-button>
             <el-button v-else size="small" type="primary" @click="handleSee(row)">{{ $t('查看') }}</el-button>
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
