<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
import { userReport, agentStatusEdit, userDetail } from "@/api/user";
import { message } from "@/utils/message";
import seeData from "@/components/user/seeData.vue";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import router from "@/router";
import { http } from '@/utils/http';
defineOptions({
  name: "userReport"
});
const { t } = useI18n();
const { proxy } = getCurrentInstance();
const emit = defineEmits(['backSelect'])
const props = defineProps({
  back: Boolean,
  field: Number,
})
const columns = [
  {

    type: "selection",
    align: "left",
    fixed: "left",

  },
  {
    label: t("用户信息"),
    prop: "username",
    width: 300,
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.uid)}>
          <p >UID:{row.uid}</p>
           <p>{t("用户名")} <el-tag size="small">{row.username}</el-tag></p>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
        <div v-show={row.rec_id} >
         {transformI18n("上级")}: <span class="el-link2" onClick={() => showUserInfo(row.rec_id)}>UID:{row.rec_id}</span>
        </div>
         <p>{t("会员等级")} <el-tag type="success" size="small">{row.level}</el-tag></p>
      </>
    )
  },
  {
    label: t("状态信息"),
    prop: "televised_status",
    width: 320,
    cellRenderer: ({ row }) => (
      <>
        <div>
        <p>
          <span>{t("电访进度")}:
            <el-tag size="small" v-show={row.televised_status == 0}>{t('未安排')}</el-tag>
            <el-tag size="small" type="warning" v-show={row.televised_status == 1}>{t('待电访')} <span v-show={row.status_show == 1}>({t('已超时')})</span></el-tag>
            <el-tag size="small" type="success"  v-show={row.televised_status == 2}>{t('已电访')} <span v-show={row.status_show == 2}>({t('未回归')})</span></el-tag>
            <el-tag size="small" type="danger" v-show={row.televised_status == 3}>{t('已电访2次以上')}</el-tag>
          </span>
           <span style="margin-left:10px;">{t("电访状态")}:
           <el-tag size="small" v-show={row.is_connected == 0}>{t("未安排")}</el-tag>
           <el-tag size="small" type="danger" v-show={row.is_connected == 1}>{t('未接通')}</el-tag>
           <el-tag size="small" type="success"  v-show={row.is_connected == 2}>{t('已接通')}</el-tag>
           </span>
           </p>
           <p>
           <span>{t("短信状态")}:
           <el-tag size="small" v-show={row.sms_status == 0}>{t("未发送")}</el-tag>
           <el-tag size="small" type="success" v-show={row.sms_status == 1}>{t('已发送')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("客户意向")}:
            <el-tag size="small" v-show={row.intention_status == 0}>{t("未评估")}</el-tag>
            <el-tag size="small" type="danger" v-show={row.intention_status == 1}>{t('低')}</el-tag>
            <el-tag size="small" type="warning"  v-show={row.intention_status == 2}>{t('中')}</el-tag>
            <el-tag size="small" type="success" v-show={row.intention_status == 3}>{t('高')}</el-tag>
           </span>
            </p>
             <p>
           <span>{t("代理状态")}:
           <el-tag size="small" v-show={row.agent_status == 0}>{t("未申请")}</el-tag>
           <el-tag size="small" type="success" v-show={row.agent_status == 1}>{t('已申请')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("手机验证状态")}:
           <el-tag size="small" v-show={row.phone_status == 0}>{t("未完成")}</el-tag>
           <el-tag size="small" type="success" v-show={row.phone_status == 1}>{t('已完成')}</el-tag>
           </span>
           </p>
            <p>
           <span>{t("会员状态")}:
           <el-tag size="small" v-show={row.status == 0}>{t("禁用")}</el-tag>
           <el-tag size="small" type="success" v-show={row.status == 1}>{t('正常')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("赠金领取状态")}:
            <el-tag size="small" v-show={row.give_status == 0}>{t("未派发")}</el-tag>
            <el-tag size="small" type="warning" v-show={row.give_status == 1}>{t('未领取')}</el-tag>
            <el-tag size="small" type="success"  v-show={row.give_status == 2}>{t('已领取')}</el-tag>
            <el-tag size="small" type="danger"  v-show={row.give_status == 3}>{t('已失效')}</el-tag>
           </span>
            </p>
        </div>
      </>
    )
  },
  {
    label: t("用户时间信息"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("注册时间")}: {row.reg_time}</span></p>
          <p><span>{t("首存时间")}: {row.first_deposit_time}</span></p>
          <p><span>{t("最近登陆时间")}: {row.login_time}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("回访信息"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("回访派发时间")}: {row.assign_time}</span></p>
          <p><span>{t("电访时间")}: {row.televised}</span></p>
          <p><span>{t("短信发送时间")}: {row.sms_time}</span></p>
          <p><span>{t("赠金派发时间")}: {row.distribution_time}</span></p>
          <p><span>{t("赠金领取时间")}: {row.give_time}</span></p>
          <p><span>{t("赠金总额")}: {row.distribution_price}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("出入金信息"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
         <p><span>{t("入金次数")}: {row.deposit_nums}</span></p>
          <p><span>{t("入金总额")}: {row.deposit_total}</span></p>
          <p><span>{t("最近入金时间")}: {row.recent_deposit_money_time}</span></p>
          <p><span>{t("出金次数")}: {row.withdrawal_nums}</span></p>
          <p><span>{t("出金总额")}: {row.withdrawal_total}</span></p>
          <p><span>{t("最近出金时间")}: {row.recent_withdraw_money_time}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("活动信息"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("抽奖")}: {row.lottery_total}</span></p>
          <p><span>{t("返佣")}: {row.rebate_total}</span></p>
          <p><span>{t("返水")}: {row.rebate1_total}</span></p>
          <p><span>{t("推广奖金")}: {row.promotion_bonus}</span></p>
          <p><span>{t("任务奖励")}: {row.mission_rewards}</span></p>
          <p><span>{t("周月礼金")}: {row.vip_bonus}</span></p>
          <p><span>{t("优惠赠送金额")}: {row.total_gift}</span></p>
          <p><span>{t("活动优惠")}: {row.action_discount}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("未上线天数"),
    prop: "offline_day",
    width: 160,
    sortable: true
  },
  {
    label: t("余额"),
    prop: "balance",
    width: 120,
    sortable: true
  },
  {
    label: t("电访组别"),
    prop: "admin_group",
    width: 150
  },
  {
    label: t("电访人员"),
    prop: "admin_name",
    width: 150
  },
  {
    label: t("反馈"),
    prop: "feedback",
    width: 200
  },
  {
    label: t("备注"),
    prop: "remark",
    width: 200
  },
  {
    label: t("操作"),
    width: 130,
    fixed: "right",
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('followlist')} size="small" type="primary" onClick={() => handleShow(row)}>{ t('回访派发记录') }</el-button>
      </>
    )
  },
];

//搜索的数据

const searchList = {
  username: {
    type: "input",
    placeholder: t("UID/邮箱/手机号/用户名"),
    value: "",
    prop: "username"
  },
  deposit_nums: {
    type: "input",
    placeholder: t("入金次数"),
    value: "",
    prop: "deposit_nums"
  },
  deposit_total: {
    type: "input",
    placeholder: t("入金总额"),
    value: "",
    prop: "deposit_total"
  },
  withdrawal_nums: {
    type: "input",
    placeholder: t("出金次数"),
    value: "",
    prop: "withdrawal_nums"
  },
  withdrawal_total: {
    type: "input",
    placeholder: t("出金总额"),
    value: "",
    prop: "withdrawal_total"
  },
  offline_day: {
    type: "input",
    placeholder: t("未上线天数"),
    value: "",
    prop: "offline_day"
  },
  reg_time: {
    type: "time",
    placeholder: t("注册时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  login_time: {
    type: "time",
    placeholder: t("登陆时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  first_deposit_time: {
    type: "time",
    placeholder: t("首存时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  recent_withdraw_money_time: {
    type: "time",
    placeholder: t("最近出金时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  recent_deposit_money_time: {
    type: "time",
    placeholder: t("最近入金时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  televised: {
    type: "time",
    placeholder: t("电访时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  distribution_time: {
    type: "time",
    placeholder: t("赠金派发时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  min_give: {
    type: "input",
    placeholder: t("赠金总额最小金额"),
    value: "",
    prop: "min_give"
  },
  max_give: {
    type: "input",
    placeholder: t("赠金总额最大金额"),
    value: "",
    prop: "max_give"
  },
  televised_status:{
    type: 'select',
    placeholder: t('电访进度'),
    value: '0',
    options: [
    {
        value: '0',
        label: t('未安排'),
      },{
        value: '1',
        label: t('待电访'),
      },{
        value: '4',
        label: t('待电访(已超时)'),
      },{
        value: '2',
        label: t('已电访'),
      },{
        value: '5',
        label: t('已电访(未回归)'),
      },{
        value: '3',
        label: t('电访2次以上'),
      },
    ]
  },
  role_id: {
    type: 'select',
    placeholder: '电访组别',
    value: '',
    prop: 'role_id',
    options: []
  },
  is_connected:{
    type: 'select',
    placeholder: t('是否接通'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未安排'),
      },{
        value: '1',
        label: t('未接通'),
      },{
        value: '2',
        label: t('已接通'),
      }
    ]
  },
  sms_status:{
    type: 'select',
    placeholder: t('短信发送状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未发送'),
      },{
        value: '1',
        label: t('已发送'),
      }
    ]
  },
  give_status:{
    type: 'select',
    placeholder: t('赠金领取状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未派发'),
      },{
        value: '1',
        label: t('未领取'),
      },{
        value: '2',
        label: t('已领取'),
      },{
        value: '3',
        label: t('已失效'),
      }
    ]
  },
  search: {
    type: "button",
    value: t("搜索"),
    handle: "search",
    prop: "search"
  },
  export: {
    type: "button",
    value: t("导出"),
    handle: "export",
    prop: "export"
  }
};
const searchListBox = reactive({
  searchList
});

const pagination = reactive({
  page: 1, //页数
  limit: 12, //条数
  total: 0, //总数
  username: "", //id 推广码 用户名 精确搜索
  reg_time: "", //用户名 手机号 邮箱 模糊搜索
  first_deposit_time: "", //用户标签
  recent_withdraw_money_time: "", //用户等级
  recent_deposit_money_time: "",
  login_time: "",
  deposit_nums: "0",
  deposit_total: "0",
  withdrawal_nums: "0",
  withdrawal_total: "0",
  total_gift: "0",
  export: 0,
  min_give: "", //最小赠金
  max_give: "", //最大赠金
  offline_day: "",
  televised_status:'',//电访进度
  televised:'',
  distribution_time:'',
  role_id:'',
  is_connected:'',
  sms_status:'',
  give_status:'',
  field: '',
  order: '',//排序 desc 或 asc
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pagination.export = 0;
  userReport(pagination).then((res: any) => {
    tableData.dataList = res.data;
    pagination.total = res.total;
    list3Box.dialogBatchList.admin_id.options = res.admin
    searchList.role_id.options = res.admin_role
     for (const key in dialogBatchList2) {
       list3Box.dialogBatchList2[key].value = res.distribution_config[key]
       dialogBatchModel2[key] = res.distribution_config[key]
     }
  });
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

//下拉选择返回的数据
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
};

const selectDateChange = ({ starTime, endTime, index }) => {
  searchListBox.searchList[index].value[0] = new Date(starTime);
  searchListBox.searchList[index].value[1] = new Date(endTime);
};

//点击确定
const handleSerch = () => {
  for (const key in pagination) {
    if (searchListBox.searchList[key]) {
      if (
        searchListBox.searchList[key].type == "date" ||
        searchListBox.searchList[key].type == "time"
      ) {
        const val = searchListBox.searchList[key].value;
        const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
        pagination[key] = time;
      } else {
        pagination[key] = searchListBox.searchList[key].value;
      }
    }
  }
  pagination.page = 1;
  init(pagination);
};
//导出
const handleExport = () => {
  for (const key in pagination) {
    if (searchListBox.searchList[key]) {
      if (
        searchListBox.searchList[key].type == "date" ||
        searchListBox.searchList[key].type == "time"
      ) {
        const val = searchListBox.searchList[key].value;
        const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
        pagination[key] = time;
      } else {
        pagination[key] = searchListBox.searchList[key].value;
      }
    }
  }
  pagination.export = 1;
  userReport(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    }
  });
};
const dialogBatchModel = reactive({
  admin_id:'',
  ids:''
})

const dialogBatchModel2 = reactive({
  type:0,
  max_price:0,
  water:1,
  timeout:0,
  regression:0,
})

//选中数据
let selectAll = [];
const sortChange = val => {
  selectAll = val;
  const arr = []
  for (const key in selectAll) {
    arr.push(selectAll[key].uid)
  }
  dialogBatchModel.ids = arr
};

const visibleUserInfo = ref(false);
const showUid = ref(0);
const showUserInfo = uid => {
  visibleUserInfo.value = true;
  showUid.value = uid;
};


// 批量修改状态
const batchVisible = ref(false);
const handleBatch = () => {
  if(selectAll.length <= 0){
    message("请选择用户", { type: "warning" });
    return;
  }
  batchVisible.value = true;
}
//赠金配置
const batchVisible2 = ref(false);
const configuration = () => {
  batchVisible2.value = true;
}

const dialogBatchList = {
  admin_id: {
    type: 'select',
    label: '电访人员',
    placeholder: '电访人员',
    value: '',
    options: [],
    prop: 'admin_id'
  }
}

const dialogBatchList2 = {
 type: {
   type: 'radio',
   label: '赠金审核类型',
   placeholder: '赠金审核类型',
   tip: '手动则需要审核通过才派发赠金，自动则直接派发赠金',
   value: 0,
   prop: 'type',
   options: [
     {
       label: 0,
       name: '手动'
     },
     {
       label: 1,
       name: '自动'
     }
   ]
 },
 max_price:{
   type: 'input',
   ty:'number',
   label: '派发最大金额',
   placeholder: '派发最大金额',
   tip: '派发最大金额0为不限制',
   value: 0,
   prop:'max_price'
 },
 water:{
   type: 'input',
   ty:'number',
   label: '默认流水倍数',
   placeholder: '默认流水倍数',
   value: 1,
   prop:'water'
 },
 timeout:{
   type: 'input',
   ty:'number',
   label: '待电访超时时间',
   placeholder: '待电访超时时间',
   tip: '待电访超时时间，单位小时',
   value: 0,
   prop:'timeout'
 },
}

const list3Box = reactive({ dialogBatchList,dialogBatchList2 })
const handleBatchDialogChange = ({ value, index }) => {
  dialogBatchList[index].value = value;
  const prop = dialogBatchList[index].prop;
  dialogBatchModel[prop] = value;
}

const handleBatchDialogChange2 = ({ value, index }) => {
  dialogBatchList2[index].value = value;
  const prop = dialogBatchList2[index].prop;
  dialogBatchModel2[prop] = value;
}

const handleBatchSave = () => {
  if(dialogBatchModel.admin_id == ""){
    message("请选择电访人员", { type: "warning" });
    return;
  }
  http.post('/follow/assignsave', { data: dialogBatchModel }).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      batchVisible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleBatchSave2 = () => {
  if(dialogBatchModel2.max_price < 0 || dialogBatchModel2.water < 0 || dialogBatchModel2.timeout < 0 || dialogBatchModel2.regression < 0){
    message("请输入正确的数值", { type: "warning" });
    return;
  }
  http.post('/follow/distributionconfig', { data: dialogBatchModel2 }).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      batchVisible2.value = false;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const backSelect = () => {
  if (selectAll.length <= 0) {
    message(t('请选择用户'), { type: 'warning' });
    return;
  }
  const username = [];
  selectAll.forEach((item) => {
    username.push(props.field == 1 ? item.uid : '');
  })

  emit('backSelect', username);
}

const sortChange2 = (res) => {
  pagination.field = res.prop;
  if (res.order) {
    pagination.order = res.order == 'descending' ? 'DESC' : 'ASC';
  } else {
    pagination.order = '';
  }
  init()
  return false;
}
const followColumns = [
  {
    label: t("电访人员"),
    prop: "salesman_name",
  },
  {
    label: t("审核人员"),
    prop: "admin_name",
  },
  {
    label: t("电访进度"),
    slot: "televised_status",
  },
  {
    label: t("短信发送状态"),
    slot: "sms_status",
  },
  {
    label: t("客户意向"),
    slot: "intention_status",
  },
  {
    label: t("电访状态"),
    slot: "is_connected",
  },
  {
    label: t("是否领取赠金"),
    slot: "is_distribution",
  },
  {
    label: t("派发时间"),
    prop: 'add_time',
    sortable: true
  },
  {
    label: t("电访时间"),
    prop: "televised",
    sortable: true
  },
  {
    label: t("短信发送时间"),
    prop: "sms_time",
    sortable: true
  },
  {
    label: t("备注"),
    prop: "remark",
  },
  {
    label: t("反馈内容"),
    prop: "feedback",
  },
];

const list: any = [];
const followlist = reactive({ list });
const followShow = ref(false)
const handleShow = (data) => {
  followShow.value = true;
  http.post('/follow/followlist', { data: { id: data.uid } }).then((res: any) => {
    followlist.list = res.data
  });
}

</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach
      @export="handleExport"
      @search="handleSerch"
      @currentChange="handleCurrentChange"
      :list="searchListBox.searchList"
    />
   <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('assign') && !props.back" type="primary" @click="handleBatch">{{ $t('批量派发') }}</el-button>
        <el-button v-if="hasAuth('distributionconfig') && !props.back" type="danger" @click="configuration">{{ $t('派发设置') }}</el-button>
        <el-button v-if="props.back" type="primary" @click="backSelect">{{ $t('选择勾选用户') }}</el-button>
        <el-button type="info" @click="init">{{ $t('刷新') }}</el-button>
      </div>
    </div>
    <commDialog title="批量派发" width="40%" @save="handleBatchSave" :dialogObj="dialogBatchModel" @currentChage="handleBatchDialogChange" :list="list3Box.dialogBatchList"  :visible="batchVisible" @close="batchVisible = false" />
    <commDialog title="派发设置" width="40%" @save="handleBatchSave2" :dialogObj="dialogBatchModel2" @currentChage="handleBatchDialogChange2" :list="list3Box.dialogBatchList2"  :visible="batchVisible2" @close="batchVisible2 = false" />
    <el-alert type="warning">
      {{ $t('出/入金次数,出/入金总额,支持范围筛选,例如:0-100') }}
    </el-alert>
    <el-alert type="error">
      {{ $t('报表每日凌晨刷新') }}
    </el-alert>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns"   @selection-change="sortChange" @sort-change="sortChange2">


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

    <el-dialog v-model="followShow" :title="$t('回访派发记录')" width="80%">
      <pure-table :data="followlist.list" width="100%" :columns="followColumns">
      <template #televised_status="{ row }">
        <el-tag size="small" v-if="row.televised_status == 1">{{ $t('待电访') }}</el-tag>
        <el-tag size="small" type="success"  v-else-if="row.televised_status == 2">{{ $t('已电访') }}</el-tag>
        <el-tag size="small" type="danger"  v-else-if="row.televised_status == 3">{{ $t('已电访2次以上') }}</el-tag>
      </template>

      <template #sms_status="{ row }">
        <el-tag size="small"  v-if="row.sms_status == 0">{{ $t('未发送') }}</el-tag>
        <el-tag size="small" type="success"  v-else-if="row.sms_status == 1">{{ $t('已发送') }}</el-tag>
      </template>

      <template #intention_status="{ row }">
        <el-tag size="small"  v-if="row.intention_status == 0">{{ $t('未评估') }}</el-tag>
        <el-tag size="small" type="danger"  v-else-if="row.intention_status == 1">{{ $t('低') }}</el-tag>
        <el-tag size="small" type="warning"  v-else-if="row.intention_status == 2">{{ $t('中') }}</el-tag>
        <el-tag size="small" type="success"  v-else-if="row.intention_status == 3">{{ $t('高') }}</el-tag>
      </template>

      <template #is_connected="{ row }">
        <el-tag size="small"  v-if="row.is_connected == 0">{{ $t('未安排') }}</el-tag>
        <el-tag size="small" type="danger"  v-else-if="row.is_connected == 1">{{ $t('未接通') }}</el-tag>
        <el-tag size="small" type="warning"  v-else-if="row.is_connected == 2">{{ $t('已接通') }}</el-tag>
      </template>

      <template #is_distribution="{ row }">
        <el-tag size="small"  v-if="row.is_distribution == 0">{{ $t('未处理') }}</el-tag>
        <el-tag size="small" type="danger"  v-else-if="row.is_distribution == 1">{{ $t('否') }}</el-tag>
        <el-tag size="small" type="warning"  v-else-if="row.is_distribution == 2">{{ $t('是') }}</el-tag>
      </template>

      </pure-table>
    </el-dialog>

  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
}
.line-box{
  margin:10px 0;
}
</style>
