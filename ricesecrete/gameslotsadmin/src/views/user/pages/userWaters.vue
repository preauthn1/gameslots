<script setup lang='tsx'>
import { reactive, ref, defineAsyncComponent } from 'vue';
import { timeCycle } from '@/utils/global'
import { runningWater, userWaterList } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { message } from "@/utils/message";
import appointWater from "@/components/user/appointWater.vue";
  const columns = [//TableColumnList
    {
      label: transformI18n("类型"),
       // prop: "title",
       slot:'title'
    }, {
      label: transformI18n("金额总计"),
      prop: "total_price",
    }, {
      label: transformI18n("所需流水"),
      prop: "required_price",
    }
];
const columns1 = [//TableColumnList
    {
      label: transformI18n("类型"),
       // prop: "title",
       slot:'title'
    }, {
      label: transformI18n("未结算"),
      prop: "unsettlement",
    }, {
      label: transformI18n("已结算"),
      prop: "settled",
    }, {
      label: transformI18n("总计"),
      prop: "total_price",
    }
];
const list1 = [];
const list2 = [];
const detailList = [];
const appointSavingList = [];
const tableData = reactive({
  list1,list2,detailList,appointSavingList
})
const props = defineProps({
  uid:String
})


//交易明细数据加载
const query = reactive({
  select: true,
  uid: 0,
  set:1,
  page: 1,
  limit: 12,
})
interface tabinfo {
  page: number,
  limit: number,
  total: number,
  uid: number
}

//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  uid:{
    type: 'input',
    placeholder: 'UID/手机号/邮箱/用户名',
    value: '',
    prop: 'uid'
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
const pagination = ref<tabinfo>({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  uid: 0
});

//选中标签
const selectTab = ref('0')
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  query.uid =  pagination.value.uid
  if(query.uid <= 0){
    message('请输入UID/邮箱/用户名', { type: 'error' });
    return;
  }
  selectTab.value = '0'
  pagination.value.page = 1;
  toalInit(1)
  toalInit(2)
  init();
}

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
  pagination.value[index] = value
}

const withdrawal_rules = ref(0)
const savings = ref(0);
const today_savings = ref(0);
const userAppointWater = ref(0);
//交易明细数据加载
const userDetail = reactive({
  id: 0,
  phone: '',
  mail: '',
  login_ip_count: 0,
})
function toalInit(val) {
  query.set =  val
  runningWater(query).then((res: any) => {
    withdrawal_rules.value = res.withdrawal_rules
    savings.value = res.savings
    today_savings.value = res.today_savings
    userAppointWater.value = res.appoint_savings
    
    for (const key in userDetail) {
      userDetail[key] = res.userDetail[key]
    }
    if (val == 1) {
      tableData.list1 = res.data;
    } else {
      tableData.list2 = res.data;
    }
  })
}

const columnsDetail = [//TableColumnList
    {
      label: transformI18n("ID"),
      prop: "id",
      fixed: "left",
      cellRenderer: ({ row }) => (
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{row.uid}</span>
        </div>
      ),
    }, {
      label: transformI18n("添加时间"),
      prop: "create_time",
    },
    {
      label: transformI18n("原始金额"),
      prop:'amount'
    },
    {
      label: transformI18n("流水倍数"),
      prop: "multiple",
    }, {
      label: transformI18n("流水金额"),
      prop: "water"
    }, {
      label: transformI18n("备注"),
       prop: "remark",
      width: 300,
    },
];
const visibleAppointWater = ref(false)
const hnadleTab = (val) => {
  console.log(val)
  if (val == 1) {
    pagination.value.page = 1;
    init();
  }
  //搜索时已经加载数据，无需切换时再请求接口
  if (val == 2) {
    visibleAppointWater.value = true
  }else{
    visibleAppointWater.value = false
  }
}
//获取列表数据
const ajax = ref(false);
function init(query?: object) {
  userWaterList(pagination.value).then((res:any) => {
    tableData.detailList = res.data.data
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    ajax.value = false;
  })
}
const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
  init(pagination);
};

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

//指定流水查询

</script>

<template>
  <div style="padding-bottom: 40px;">
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
      <el-tabs type="border-card" class="demo-tabs" @tab-change="hnadleTab" v-model="selectTab">
        <el-tab-pane :label="$t('流水总览')">
            <div class="txt1">
              <div @click="showUserInfo(userDetail.id)">
              <div v-if="userDetail.phone" class="flex items-center">
                <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
                <p class="ml-[3px] el-link2" v-if="userDetail.login_ip_count > 1" style="color:red">{{ userDetail.phone }}</p>
                <p class="ml-[3px] el-link2" v-if="userDetail.login_ip_count <= 1">{{ userDetail.phone }}</p>
              </div>
              <div v-if="userDetail.mail" class="flex items-center">
                <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
                <p class="ml-[3px] el-link2" v-if="userDetail.login_ip_count > 1" style="color:red">{{ userDetail.mail }}</p>
                <p class="ml-[3px] el-link2" v-show="userDetail.login_ip_count <= 1">{{ userDetail.mail }}</p>
              </div>
            </div>

              <div class="txt1">{{ $t('提现规则') }}：<span>{{ withdrawal_rules == 1 ? $t('单流水') : $t('总流水') }}</span>
                <template v-if="withdrawal_rules == 1">
                  {{ $t('剩余流水') }}：<span>{{ savings }}</span>
                  {{ $t('指定流水') }}：<span>{{ userAppointWater }}</span>
                  <!-- {{ $t('今日流水') }}：<span>{{ today_savings }}</span> -->
                </template>
              </div>
              <div class="txt2">{{ $t('单流水：记单笔充值流水，如：充值1000，下了2000流水，再充值1000，用户账户必须预留新充值的金额，多提会提示流水不足总流水：总充值匹配总流水') }}</div>
              <template v-if="tableData.list1.length>0">
                  <pure-table :border="true" header-cell-class-name="customHeaderStyle"  :data="tableData.list1" width="100%"   :columns="columns" >
                    <template #title="{ row }">
                      {{ $t(row.title) }}
                    </template>
                  </pure-table>
              </template>
              <div style="height: 50px;"/>
              <template v-if="tableData.list2.length>0">
                  <pure-table :border="true" header-cell-class-name="customHeaderStyle"  :data="tableData.list2" width="100%" :columns="columns1" >
                  <template #title="{ row }">
                    {{ $t(row.title) }}
                  </template>
                  </pure-table>
              </template>

            </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('流水明细')">
            <div class="bankcard-box3">
                <pure-table  :border="true" :data="tableData.detailList" width="100%" :columns="columnsDetail" />
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
        </el-tab-pane>
        <el-tab-pane :label="$t('指定流水')" v-if="pagination.uid" name="2">
          <appointWater  v-if="visibleAppointWater" :uid="pagination.uid"/>
          <!-- </template> -->
        </el-tab-pane>
    </el-tabs>
  </div>

</template>

<style scoped lang="scss">
    .top-box{
      margin-bottom:20px;
    }
    .txt1{
      margin-bottom: 5px;
      span{
        color:var(--el-color-danger);
      }
      span:first-child{
      margin-right: 30px;
      }
      padding-top: 10px;
    }
    .txt2{
      margin-bottom: 10px;
    }
</style>
