<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent } from "vue";
import { http } from "@/utils/http";
import { message } from "@/utils/message";
import { formaTime, timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
defineOptions({
  name: 'report_remain'
})
const columns = [
  {
    label: transformI18n("用户名"),
    prop: "username",
    width: 200,
    children:[],
    fixed: true,
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
  agent_type:{
    type: 'select',
    label:'代理类型',
    placeholder:'代理类型',
    prop:'agent_type',
    options: [
      {
        label: '无上级（不含内部代理）',
        value: -2,
      },
      {
        label: '无上级（含内部代理）',
        value: -1,
      },
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
  username:{
    type: 'input',
    placeholder: 'id/推广码/手机号/邮箱',
    value: '',
    prop: 'username'
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
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  date: '',
  username:'',
  agent_type: '',
  export: 0
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init()
function init() {
  pagination.export = 0;
  http.post('/remain/agent', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
  })
}

//导出
const handleExport = () => {
  pagination.export = 1;
  http.post('/remain/agent', {data: pagination}).then((res:any)=>{
    if (res.code == 1) {
      handleDownloadList()
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
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init()
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init()
};
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
const updateData = () => {
  http.post('/remainAgent/update', {data: pagination}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        init();
      } else {
        message(res.msg, { type: "error" });
      }
  })
}
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>

    <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div>
        <el-button  type="primary" @click="updateData">{{
          $t("更新数据")
        }}</el-button>
      </div>
    </div>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <el-alert :title="$t('时间默认查询最近七天留存率，更新数据对应数据必须先筛选后再更新数据')" type="warning" />
    <el-table :data="tableData.dataList" style="width: 100%">
      <el-table-column align="center" v-for="(col, index) in columns" :key="index" :prop="col.prop" :label="col.label" :width="col.width" :fixed="col.fixed">
        <template v-if="col.children && col.children.length > 0">
          <el-table-column align="center" v-for="(col2, index) in col.children" :key="index" :prop="col2.prop" :label="col2.label" :width="100">
            <template #default="{ row }">
              <span> {{ row[col2.prop] }}</span>
            </template>
          </el-table-column>
        </template>
        <template v-else-if="col.prop == 'username'">
          <el-table-column  :width="200">
            <template #default="{ row }">
              <div v-show="row.uid=='合计'">
                <p>{{ row.uid }}:</p>
              </div>
              <div @click="showUserInfo(row.uid)" v-if="row.uid!='合计'">
                <p>UID:{{ row.uid }}</p>
                <div v-if="row.phone" class="flex items-center">
                  <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
                  <p class="ml-[3px] el-link2">{{ row.phone }}</p>
                </div>
                <div v-if="row.mail" class="flex items-center">
                  <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
                  <p class="ml-[3px] el-link2">{{ row.mail }}</p>
                </div>
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table-column>
    </el-table>
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
  padding:30px 0;
}
</style>
