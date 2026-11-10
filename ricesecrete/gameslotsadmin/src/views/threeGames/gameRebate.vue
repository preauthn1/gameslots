<script setup lang="tsx">
import { reactive, ref ,defineAsyncComponent,getCurrentInstance} from 'vue';
import { gameAgentReport,gameAgentSend,gameAgentRefused,systemEdit } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
import commForm from '@/components/comm/comm-form3.vue'

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gameRebate'
})
const columns = [
  {
    label: transformI18n("ID"),
    prop: "sff_id",
    fixed:'left'
  },
  {
    label: transformI18n("代理用户"),
    prop: "username",
    width: '200px',
    fixed:'left',
    cellRenderer: ({ row }) => (
      <>
      <div onClick={() => showUserInfo(row.sff_uid)}>
        <p>UID:{row.sff_uid}</p>
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
  // {
  //   label: transformI18n("返佣月份"),
  //   prop: "sff_m",
  //   fixed:'left'
  // },
  {
    label: transformI18n("返佣周"),
    prop: "sff_w",
    fixed:'left',
    width:'140px',
    cellRenderer: ({ row }) => (
      <>
        <a onClick={() => showDetail(row)} class="el-link2">{row.sff_w_text}</a>
      </>
    )
  },
  {
    label: transformI18n("代理类型"),
    slot: "sff_utype",
    width:'100px'
  },
  {
    label: transformI18n("状态"),
    slot: "sff_payed",
  },
  {
    label: transformI18n("占成"),
    prop: "sff_base",
    width:'100px'
  },
  {
    label: transformI18n("收益"),
    prop: "sff_fy",
    width:'100px'
  },
  {
    label: transformI18n("客损"),
    prop: "sff_ks",
    width:'100px'
  },
  {
    label: transformI18n("上期负盈"),
    prop: "sff_prelosetotal",
  },
  {
    label: transformI18n("本期负盈"),
    prop: "sff_losetotal",
  },
  {
    label: transformI18n("外部代理返佣"),
    prop: "sff_subout",
    width:'150px',
    cellRenderer: ({ row }) => (
      <>
        <a onClick={() => showSuboutDetail(row)} class="el-link2">{row.sff_subout}</a>
      </>
    )
  },
  {
    label: transformI18n("充值金额"),
    prop: "sff_payin",
  },
  {
    label: transformI18n("充值手续费"),
    prop: "sff_payinfee",
    width:'100px'
  },
  {
    label: transformI18n("提现金额"),
    prop: "sff_payout",
  },
  {
    label: transformI18n("提现手续费"),
    prop: "sff_payoutfee",
    width:'100px'
  },
  {
    label: transformI18n("优惠额"),
    prop: "sff_yh",
  },
  {
    label: transformI18n("返水额"),
    prop: "sff_back",
  },
  {
    label: transformI18n("技术维护费"),
    prop: "sff_tec",
    width:'100px'
  },
  {
    label: transformI18n("派送时间"),
    prop: "sff_paytime",
    width: '160px',
  },
  {
    label: transformI18n("操作"),
    width: '150px',
    fixed:'right',
    slot:'right'
  },
];
  //编辑
const handleEidt = (row,idx) => {
  // visible.value = true;
  const msg = idx == 1?'确认拒绝吗？':'确认派发吗？';
  const query={
    edit:true,
    id:row.sff_id
  }
   proxy.$confirm(msg, '提示').then(() => {
       idx==1?noSend(query): send(query);
        }).catch(() => {
          console.log('取消');
    })

}
function noSend(query){
   gameAgentRefused(query).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  });
}
function send(query){
  gameAgentSend(query).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  });
}

//以下是搜索框的数据
const list = {
  username:{
    type: 'input',
    placeholder: '用户ID/邮箱/手机号/用户名',
    value: '',
    prop:'username',
  },
  week:{
    type: 'select',
    placeholder: 'N周',
    value: '',
    prop:'week',
    options: [
    ]
  },
  // utype:{
  //   type: 'select',
  //   placeholder: '代理类型',
  //   value: '',
  //   prop:'utype',
  //   options: [
  //     {label:'外部代理', value:1},
  //     {label:'内部代理', value:2},
  //   ]
  // },
  state:{
    type: 'select',
    placeholder: '状态',
    value: '',
    prop:'state',
    options: [
      {label:'无效', value:0},
      {label:'未派发', value:1},
      {label:'已派发', value:2},
    ]
  },
  month:{
    type: 'select',
    placeholder: '月份',
    value: '',
    prop:'month',
    options: [
    ]
  },
  date:{
    type: 'time',
    placeholder: '派送时间',
    value: ():Array<string> => {
      return []
    },
    prop:'date'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
  export:{
    type: 'button',
    value:'导出',
    handle: 'export',
    prop: 'export',
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  username: '',
  month: '',
  week: '',
  state: '',
  utype: 2,
  date: '',
  export:0,
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  gameAgentReport(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    const monthArr = [];
    const month = res.month
    for (let i = 0; i < month.length; i++) {
      monthArr.push({label:month[i],value:month[i]})
    }
    listbox.list.month.options = monthArr
    listbox.list.week.options = res.week
    // pagination.page = res.data.current_page
  })
}
//导出
const handleExport = () => {
  pagination.export = 1;
  gameAgentReport(pagination).then((res: any) => {
    console.log(res)
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
  })
}
//导出弹窗列表
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
   init();
};
//搜索
const handleSerch = () => {
  pagination.page = 1;
  // pagination.username = list[0].value
  // pagination.month = list[1].value
   for (const key in pagination) {
        if (key == list[key]?.prop) {
          pagination[key] = list[key].value;
        }
  }
  init();
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

//以下是搜索框的数据
const list2 = {
  username:{
    type: 'input',
    placeholder: '用户ID/邮箱/手机号/用户名',
    value: '',
    prop:'username',
  },
  filter_zreo: {
    type: 'select',
    placeholder: '过滤0数据',
    value: '',
    prop: 'filter_zreo',
    options: [
      {label: '是', value: 1},
      {label: '否', value: 0},
    ]
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox2 = reactive({ list2 });
// 返佣详情
const detailList: any = [];
const detailTableData = reactive({ detailList });

//当前某个发生变化
const handleCurrentChange2 = ({value,index }) => {
  list2[index].value = value;
}
//条件数据
const pagination2 = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  sff_m: '',
  sff_w: '',
  sff_uid: '',
  sff_utype: '',
  username: '',
  filter_zreo: 0
});
//获取详情
function getDetail() {
  http.post('/game_agent/detail', {data: pagination2}).then((res: any) => {
    detailTableData.detailList = res.data
    pagination2.total = res.count
  })
}
const onPageSizeChange2 = (size: number) => {
  pagination2.limit = size;
  pagination2.page = 1;
  getDetail();
};
const onCurrentChange2 = (current: number) => {
  pagination2.page = current;
   getDetail();
};
const detailShow = ref(false);
const detailColumns = [
  {
    label: transformI18n("用户"),
    prop: "username",
    width: '200px',
    fixed:'left',
    cellRenderer: ({ row }) => (
      <>
      <div onClick={() => showUserInfo(row.sffl_uid)}>
        <p>UID:{row.sffl_uid}</p>
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
    label: transformI18n("日期"),
    prop: "sffl_dt",
  },
  {
    label: transformI18n("有效投注"),
    prop: "sffl_betwin",
    width:'100px'
  },
  {
    label: transformI18n("客损"),
    prop: "sffl_ks",
  },
  {
    label: transformI18n("返佣比例"),
    slot: "rate",
  },
  {
    label: transformI18n("收益"),
    prop: "fy_amount",
  },
  {
    label: transformI18n("充值金额"),
    prop: "sffl_payin",
  },
  {
    label: transformI18n("充值手续费"),
    prop: "sffl_payinfee",
  },
  {
    label: transformI18n("提现金额"),
    prop: "sffl_payout",
  },
  {
    label: transformI18n("提现手续费"),
    prop: "sffl_payoutfee",
    width:'150px'
  },
  {
    label: transformI18n("优惠额"),
    prop: "sffl_yh",
  },
  {
    label: transformI18n("返水额"),
    prop: "sffl_back",
  },
];
const showDetail = (row) => {
  detailShow.value = true
  pagination2.sff_m = row.sff_m;
  pagination2.sff_w = row.sff_w;
  pagination2.sff_uid = row.sff_uid;
  pagination2.sff_utype = row.sff_utype;
  getDetail()
}

const handleSerch2 = () => {
  pagination2.page = 1;
   for (const key in pagination2) {
    if (key == list2[key]?.prop) {
      pagination2[key] = list2[key].value;
    }
  }
  getDetail();
}

// 外部代理分佣详情
//以下是搜索框的数据
const list3 = {
  username:{
    type: 'input',
    placeholder: '用户ID/邮箱/手机号/用户名',
    value: '',
    prop:'username',
  },
  filter_zreo: {
    type: 'select',
    placeholder: '过滤0数据',
    value: '',
    prop: 'filter_zreo',
    options: [
      {label: '是', value: 1},
      {label: '否', value: 0},
    ]
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox3 = reactive({ list3 });
// 返佣详情
const detailSuboutList: any = [];
const detailSuboutTableData = reactive({ detailSuboutList });

//当前某个发生变化
const handleCurrentChange3 = ({value,index }) => {
  list3[index].value = value;
}
//条件数据
const pagination3 = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  sff_m: '',
  sff_w: '',
  sff_uid: '',
  sff_utype: '',
  username: '',
  filter_zreo: 0
});
//获取详情
function getSuboutDetail() {
  http.post('/game_agent/detail_subout', {data: pagination3}).then((res: any) => {
    detailSuboutTableData.detailSuboutList = res.data
    pagination3.total = res.count
  })
}
const onPageSizeChange3 = (size: number) => {
  pagination3.limit = size;
  pagination3.page = 1;
  getSuboutDetail();
};
const onCurrentChange3 = (current: number) => {
  pagination3.page = current;
   getSuboutDetail();
};
const detailSuboutShow = ref(false);
const detailSuboutColumns = [
  {
    label: transformI18n("统计周期"),
    prop: "sfil_dw_text",
  },
  {
    label: transformI18n("来自下级内部代理"),
    prop: "username",
    cellRenderer: ({ row }) => (
      <>
      <div v-show={row.sfil_downproxyid > 0} onClick={() => showUserInfo(row.sfil_downproxyid)}>
        <p>UID:{row.sfil_downproxyid}</p>
        <div v-show={row.phone} class="flex items-center">
          <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
          <p class="ml-[3px] el-link2">{row.phone}</p>
        </div>
        <div v-show={row.mail} class="flex items-center">
          <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
          <p class="ml-[3px] el-link2">{row.mail}</p>
        </div>
      </div>
      <div v-show={row.sfil_downproxyid == 0}>
      { transformI18n('来自直属外部代理')}
      </div>
      </>
    )
  },
  {
    label: transformI18n("下级返佣比例"),
    prop: "sfil_baserate",
  },
  {
    label: transformI18n("外部代理返佣金额"),
    prop: "sfil_basefy",
  },
  {
    label: transformI18n("实际扣减比例"),
    prop: "sfil_realrate",
  },
  {
    label: transformI18n("返佣金额"),
    prop: "sfil_subfy",
  },
  {
    label: transformI18n("代理层级"),
    slot: "sfil_proxytype",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ row }) => (
      <>
      <div v-show={row.sfil_downproxyid == 0} onClick={() => showSuboutDetail4(row)}>
        <el-button >{ transformI18n('详细明细') }</el-button>
      </div>
      <div v-show={row.sfil_downproxyid > 0}>
      -
      </div>
      </>
    )
  },
];
const showSuboutDetail = (row) => {
  detailSuboutShow.value = true
  pagination3.sff_m = row.sff_m;
  pagination3.sff_w = row.sff_w;
  pagination3.sff_uid = row.sff_uid;
  pagination3.sff_utype = row.sff_utype;
  getSuboutDetail()
}

const handleSerch3 = () => {
  pagination3.page = 1;
   for (const key in pagination3) {
    if (key == list3[key]?.prop) {
      pagination3[key] = list3[key].value;
    }
  }
  getSuboutDetail();
}


// 外部代理分佣详情明细
//以下是搜索框的数据
const list4 = {
  username:{
    type: 'input',
    placeholder: '用户ID/邮箱/手机号/用户名',
    value: '',
    prop:'username',
  },
  filter_zreo: {
    type: 'select',
    placeholder: '过滤0数据',
    value: '',
    prop: 'filter_zreo',
    options: [
      {label: '是', value: 1},
      {label: '否', value: 0},
    ]
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox4 = reactive({ list4 });
// 返佣详情
const detailSuboutList4: any = [];
const detailSuboutTableData4 = reactive({ detailSuboutList4 });

//当前某个发生变化
const handleCurrentChange4 = ({value,index }) => {
  list4[index].value = value;
}
//条件数据
const pagination4 = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  sff_m: '',
  sff_w: '',
  sff_uid: '',
  sff_utype: '',
  username: '',
  filter_zreo: 0
});
//获取详情
function getSuboutDetail4() {
  http.post('/game_agent/detail_subout2', {data: pagination4}).then((res: any) => {
    detailSuboutTableData4.detailSuboutList4 = res.data
    pagination4.total = res.count
  })
}
const onPageSizeChange4 = (size: number) => {
  pagination4.limit = size;
  pagination4.page = 1;
  getSuboutDetail4();
};
const onCurrentChange4 = (current: number) => {
  pagination4.page = current;
   getSuboutDetail4();
};
const detailSuboutShow4 = ref(false);
const detailSuboutColumns4 = [
  {
    label: transformI18n("统计周期"),
    prop: "sfilt_cycle_text",
  },
  {
    label: transformI18n("外部代理"),
    prop: "username",
    cellRenderer: ({ row }) => (
      <>
      <div onClick={() => showUserInfo(row.sfilt_outproxyid)}>
        <p>UID:{row.sfilt_outproxyid}</p>
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
    label: transformI18n("返佣金额"),
    prop: "sfilt_fy",
  },
];
const showSuboutDetail4 = (row) => {
  detailSuboutShow4.value = true
  pagination4.sff_m = row.sfil_dm;
  pagination4.sff_w = row.sfil_dw;
  pagination4.sff_uid = row.sfil_proxyid;
  getSuboutDetail4()
}

const handleSerch4 = () => {
  pagination4.page = 1;
   for (const key in pagination4) {
    if (key == list3[key]?.prop) {
      pagination4[key] = list3[key].value;
    }
  }
  getSuboutDetail4();
}

// 设置 - 配置
const systemDialog = ref(false)
const systemSeting = {
  fyfy_losstype: {
    type: 'radio',
    label: '分佣模式',
    placeholder: '分佣模式',
    tip: '设置内部代理客损分佣模式负盈清零还是累积到下月',
    value: '',
    options: [
      {
        label: 0,
        name: '清零'
      }, {
        label: 1,
        name: '累积到下月'
      }
    ],
    prop: 'fyfy_losstype'
  },
  auto_commission: {
    type: 'radio',
    label: '自动返佣',
    placeholder: '自动返佣',
    tip: '推广代理负赢返佣派送设置',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      }
    ],
    prop: 'auto_commission'
  },
  FySavingRateOut: {
    type: 'input',
    label: '返佣流水倍数',
    placeholder: '返佣流水倍数',
    tip: '外部代理获得返佣奖励后需要N倍才能提现',
    value: '',
    ty: 'number',
    prop: 'FySavingRateOut'
  },
  fyfy_valid_user: {
    type: 'input',
    label: '有效充值额',
    placeholder: '有效充值额%',
    tip: '内部代理负盈分佣模式下有效客户的有效充值额下限',
    value: '',
    ty: 'number',
    prop: 'fyfy_valid_user'
  },
  fyfy_valid_order: {
    type: 'input',
    label: '有效投注额',
    placeholder: '有效投注额%',
    tip: '内部代理负盈分佣模式下有效客户的有效投注额下限',
    value: '',
    ty: 'number',
    prop: 'fyfy_valid_order'
  },
  auto_water: {
    type: 'radio',
    label: '自动返水',
    placeholder: '自动返水',
    tip: '针对三方游戏的返水设置',
    value: '',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      }
    ],
    prop: 'auto_water'
  },
  BackSavingRate: {
    type: 'input',
    label: '返水流水倍数',
    placeholder: '返水流水倍数',
    tip: '会员获得返水奖励后需要N倍才能提现',
    value: '',
    ty: 'number',
    prop: 'BackSavingRate'
  },
}

const systemSetModel = {
  fyfy_losstype: '',
  auto_commission: '',
  BackSavingRate: '',
  FySavingRateOut: '',
  fyfy_valid_user: '',
  fyfy_valid_order: '',
  auto_water: ''
}

const systemBoxObj = reactive({
  systemSetModel,
});

const systemSetBox = reactive({ systemSeting })
const systemSetChange = ({ value, index }) => {
  systemSetBox.systemSeting[index].value = value;
  systemBoxObj.systemSetModel[index] = value;
}

function assginMent(list, name, data, val) {
    for (const key in list) {
        systemBoxObj[name][key] = data[key]
        systemSetBox.systemSeting[key].value = data[key]
    }
}

function getSystemSetting() {
    systemEdit({ find: true }).then((res: any) => {
        if (res.code == 1) {
            assginMent(systemSetModel, 'systemSetModel', res.data, 'jiaoyi');
        }
    });
}

const settingSystem = () => {
    getSystemSetting();
    systemDialog.value = true
}

const settingSave = () => {
  const rQuery = {
    edit: true,
    info: {
      ...systemBoxObj.systemSetModel,
    }
  }
  console.log(rQuery);
  systemEdit(rQuery).then((res: any) => {
      if (res.code == 1) {
          message(res.msg, { type: 'success' });
      } else {
          message(res.msg, { type: 'error' });
      }
  });
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <el-dialog  v-model="systemDialog" :title="$t('返佣设置')" width="70%" >
      <commForm title="保存" @save="settingSave" :dialogObj="systemBoxObj.systemSetModel" @currentChage="systemSetChange"
          :listRules="tranSetRules" :list="systemSetBox.systemSeting" />
    </el-dialog>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <div class="flex-bc line-box">
       <div class="tip">
        <el-button v-if="hasAuth('setting')" type="primary" @click="settingSystem">{{ $t('设置') }}</el-button>
        {{ $t('占成') }}:{{ $t('客损') }}-{{ $t('优惠') }}-{{ $t('返水') }}-{{ $t('技术维护费') }}-{{ $t('充值手续费') }}-{{ $t('提现手续费') }}<br/>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
        <template #sff_utype="{ row }">
          <el-tag size="small" type="danger" v-if="row.sff_utype == 1">{{ $t('外部代理') }}</el-tag>
          <el-tag size="small" type="success" v-else>{{ $t('内部代理') }}</el-tag>
      </template>
      <template #sff_payed="{ row }">
          <el-tag size="small" type="info"  v-if="row.sff_payed == 0">{{ $t('无效') }}</el-tag>
          <el-tag  size="small" type="danger"  v-if="row.sff_payed == 1">{{ $t('未派发') }}</el-tag>
          <el-tag size="small" type="success"  v-if="row.sff_payed == 2">{{ $t('已派发') }}</el-tag>
      </template>
      <template #right="{row}">
          <template v-if="row.sff_payed == 1">
              <el-button v-if="hasAuth('edit')" size="small" type="danger" @click="handleEidt(row,1)">{{ $t('拒绝') }}</el-button>
              <el-button v-if="hasAuth('edit')" size="small" type="primary" @click="handleEidt(row,2)">{{ $t('派发') }}</el-button>
          </template>
          <template v-else-if="row.sff_payed == 2">
              <el-tag size="small" type="success" >{{ $t('已派发') }}</el-tag>
          </template>
          <template v-else>
              <el-tag size="small" type="info" >{{ $t('无效') }}</el-tag>
          </template>
      </template>
    </pure-table>
    <div class="btmNav clearfix">
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

    <el-dialog v-model="detailShow" :title="$t('返佣详情')" width="95%">
      <commSerach @export="handleExport" @search="handleSerch2" @currentChange="handleCurrentChange2"  :list="listbox2.list2"/>
      <pure-table :data="detailTableData.detailList" width="100%" :columns="detailColumns">
        <template #rate="{ row }">
          <el-tooltip :content="`${$t('我的返佣比例')}`">
            <el-tag type="success" size="small">{{ row.my_rate * 100 }}%</el-tag>
          </el-tooltip>
          <el-tooltip v-if="row.rate >= 0" :content="`${$t('下级返佣比例')}`">
            <el-tag type="danger" size="small">{{ row.rate * 100 }}%</el-tag>
          </el-tooltip>
        </template>
      </pure-table>
      <div class="btmNav clearfix">
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

    <el-dialog v-model="detailSuboutShow" :title="$t('外部代理返佣详情')" width="95%">
      <commSerach @export="handleExport" @search="handleSerch3" @currentChange="handleCurrentChange3"  :list="listbox3.list3"/>
      <pure-table :data="detailSuboutTableData.detailSuboutList" width="100%" :columns="detailSuboutColumns">
        <template #rate="{ row }">
          <el-tooltip :content="`${$t('我的返佣比例')}`">
            <el-tag type="success" size="small">{{ row.my_rate * 100 }}%</el-tag>
          </el-tooltip>
          <el-tooltip v-if="row.rate >= 0" :content="`${$t('下级返佣比例')}`">
            <el-tag type="danger" size="small">{{ row.rate * 100 }}%</el-tag>
          </el-tooltip>
        </template>
        <template #sfil_proxytype="{ row }">
          <el-tag v-if="row.sfil_proxytype == 2">{{ $t('直属下级代理') }}</el-tag>
          <el-tag v-else-if="row.sfil_proxytype == 1">{{ $t('隔层下级代理') }}</el-tag>
          <span v-else>-</span>
        </template>
      </pure-table>
      <div class="btmNav clearfix">
      <el-pagination
          class="float-right"
          v-model:currentPage="pagination3.page"
          :page-size="pagination3.limit"
          :total="pagination3.total"
          :page-sizes="[12, 24, 36, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange3"
          @current-change="onCurrentChange3"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="detailSuboutShow4" :title="$t('外部代理返佣详情明细')" width="95%">
      <commSerach @export="handleExport" @search="handleSerch4" @currentChange="handleCurrentChange4"  :list="listbox4.list4"/>
      <pure-table :data="detailSuboutTableData4.detailSuboutList4" width="100%" :columns="detailSuboutColumns4">
        <template #rate="{ row }">
          <el-tooltip :content="`${$t('我的返佣比例')}`">
            <el-tag type="success" size="small">{{ row.my_rate * 100 }}%</el-tag>
          </el-tooltip>
          <el-tooltip v-if="row.rate >= 0" :content="`${$t('下级返佣比例')}`">
            <el-tag type="danger" size="small">{{ row.rate * 100 }}%</el-tag>
          </el-tooltip>
        </template>
        <template #sfil_proxytype="{ row }">
          <el-tag v-if="row.sfil_proxytype == 2">{{ $t('直属下级代理') }}</el-tag>
          <el-tag v-else-if="row.sfil_proxytype == 1">{{ $t('隔层下级代理') }}</el-tag>
          <span v-else>-</span>
        </template>
      </pure-table>
      <div class="btmNav clearfix">
      <el-pagination
          class="float-right"
          v-model:currentPage="pagination4.page"
          :page-size="pagination4.limit"
          :total="pagination4.total"
          :page-sizes="[12, 24, 36, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange4"
          @current-change="onCurrentChange4"
        />
      </div>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
.tip{
  font-size: 14px;
  color:var(--el-color-danger);
}
</style>
