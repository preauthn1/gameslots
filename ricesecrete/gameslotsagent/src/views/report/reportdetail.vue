<script setup lang="tsx">
import { reactive,ref } from "vue";
import { agentReportUser } from "@/api/user";
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
    label: transformI18n("UID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  },
  {
    label: transformI18n("用户账号"),
    prop: "username",
    width:200,
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.id)}>
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
  }, {
    label: transformI18n("所属层级"),
    prop: "rec_level",
  }, {
    label: transformI18n("推广码"),
    prop: "rec_code",
  }, {
    label: transformI18n("推广用户"),
    prop: "rec_name",
  }, {
    label: transformI18n("余额"),
    prop: "balance",
  }, {
    label: transformI18n("充值总额"),
    prop: "recharge",
  }, {
    label: transformI18n("提现总额"),
    prop: "withdrawal",
  }, {
    label: transformI18n("注册时间"),
    prop: "add_time",
  }
];


const height = window.innerHeight - 400;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
   date: {
    type: 'time',
    value: (): Array<string> => {
      return []
    },
    prop:'date'
  },
   username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: route.query.username,
    prop:'username'
  },
  rec_level:{
    type: 'select',
    label: '所属层级',
    placeholder: '所属层级',
    value: '',
    options: [],
    prop:'rec_level'
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
  limit: 12,//条数】
  total: 0,//总数
  rec_level: '',
  date:'',
  username:route.query.username,
});

const dataList: any = [];

const dataObj:any = reactive({  list: {}  })
const tableData = reactive({ dataList });
//获取数据1
init1();
async function init1() {
  const query = {
    level: true,
    ...pagination
  }
  const res:any = await agentReportUser(query);
  if (res.code == 1) {
    tableData.dataList = res.data.data;
    pagination.total = res.data.total
    const level = [];
    for (let i = 1; i <= res.level; i++) {
      level.push({
        label: i,
        value: i
      })
    }
    searchListBox.searchList.rec_level.options = level
  }
}
//获取列表数据
 init();
function init() {
  const query = {
    search: true,
    info: {
      ...pagination
    },

  }
  agentReportUser(query).then((res:any) => {
    dataObj.list = res.data;
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
        const time = val?val.length > 0 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '':'';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
    pagination.page = 1;
    init();
    init1();
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
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <div class="flex-fi list">
      <div class="item">
          <div class="item-name">{{ $t('用户数') }}</div>
          <div class="item-num">{{ dataObj.list.count_pnumber }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('余额总数') }}</div>
          <div class="item-num">{{ dataObj.list.count_balance }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('注册人数') }}</div>
          <div class="item-num">{{ dataObj.list.reg_number }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('首充人数') }}</div>
          <div class="item-num">{{ dataObj.list.sc_pnumber }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('首充占比') }}</div>
          <div class="item-num">{{ dataObj.list.sc_bfb }}%</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('复充人数') }}</div>
          <div class="item-num">{{ dataObj.list.fc_pnumber }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('复充占比') }}</div>
          <div class="item-num">{{ dataObj.list.fc_bfb }}%</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('充值人数') }}</div>
          <div class="item-num">{{ dataObj.list.off_cz_pnumber }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('充值总额') }}</div>
          <div class="item-num">{{ dataObj.list.off_cz_price }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('首充总额') }}</div>
          <div class="item-num">{{ dataObj.list.sc_price }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('提现人数') }}</div>
          <div class="item-num">{{ dataObj.list.off_tpnumber }}</div>
      </div>
      <div class="item">
          <div class="item-name">{{ $t('提现总额') }}</div>
          <div class="item-num">{{ dataObj.list.off_tprice }}</div>
      </div>
    </div>

    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
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
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.list{
  background-color: #fff;
  border:1px solid #ddd;
  border-top: 0px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  .item{
    width: 16.66%;
    color: #666;
    font-size: 14px;
    border-right: 1px solid #ddd;
    &-name{
      background-color: #f2f2f2;
      padding:9px 0;
      padding-left:10px;
      border-top: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
    }
    &-num{
      background-color: #fff;
      padding-left:10px;
      height: 36px;
      line-height: 36px;
    }
  }
  .item:nth-child(6n+6){
    border-right: 0px;
  }
}
.dark{
  .list{
  .item{

    &-name{
      background-color: var(--el-fill-color-light);
    }
    &-num{
      background-color: var(--el-fill-color-light);
      color:#fff;
      padding-left:10px;
      height: 36px;
      line-height: 36px;
    }
  }
}
}
</style>
