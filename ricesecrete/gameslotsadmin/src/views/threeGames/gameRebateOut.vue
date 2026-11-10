<script setup lang="tsx">
import { reactive, ref ,defineAsyncComponent,getCurrentInstance} from 'vue';
import { gameAgentReport,gameAgentSend,gameAgentRefused,systemEdit } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
import commForm from '@/components/comm/comm-form3.vue';

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gameRebateOut'
})
const columns = [
  {
    type: "selection",
    align: "left",
    fixed: "left",
    selectable: (row) => {
      return row.sff_payed == 1
    }
  },
  {
    label: transformI18n("代理用户"),
    prop: "username",
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
    label: transformI18n("返佣日期"),
    prop: "sff_w",
    fixed:'left',
    cellRenderer: ({ row }) => (
      <>
        <a onClick={() => showDetail(row)} class="el-link2">{row.sff_w}</a>
      </>
    )
  },
  {
    label: transformI18n("代理类型"),
    slot: "sff_utype",
  },
  {
    label: transformI18n("分佣状态"),
    slot: "sff_payed",
  },
  {
    label: transformI18n("分佣金额"),
    prop: "sff_fy",
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
const handleReview = (row,idx) => {
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
    placeholder: '日期',
    value: '',
    prop:'week',
    options: [
    ]
  },
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
  date:{
    type: 'time',
    placeholder: '派送时间',
    value: ():Array<string> => {
      return []
    },
    prop:'date'
  },
  // month:{
  //   type: 'select',
  //   placeholder: '月份',
  //   value: '',
  //   prop:'month',
  //   options: [
  //   ]
  // },
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
  utype: 1,
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
const stat: any = ref({});
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
    listbox.list.week.options = res.week
    // pagination.page = res.data.current_page
    if (pagination.page == 1) {
      stat.value = res.stat
    }
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
  pagination.export = 0;
}
//导出弹窗列表
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};
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
});
//获取详情
function getDetail() {
  http.post('/game_agent/detail_out', {data: pagination2}).then((res: any) => {
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
    label: transformI18n("推广层级"),
    prop: "user_level",
  },
  {
    label: transformI18n("有效投注"),
    prop: "sffl_betwin",
  },
  {
    label: transformI18n("返佣比例"),
    prop: "cur_rate",
  },
  {
    label: transformI18n("返佣金额"),
    prop: "cur_amount",
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


const selectAll = ref([]);
const handleSelectionChange = (val) => {
  selectAll.value = val;
}

const getIds =()=>{
  const s_arr = [];
  selectAll.value.forEach(item => {
    if (item.sff_payed == 1) {
      s_arr.push(item.sff_id)
    }
  })
  return s_arr.join(',');
}

const batchPs = (type) => {
  if (selectAll.value.length <= 0) {
    message(transformI18n('请选择要派发的数据'), { type: 'error' });
    return;
  }
  const msg = type == 1 ? '确认拒绝吗？':'确认派发吗？';
  proxy.$confirm(transformI18n(msg), transformI18n('提示')).then(() => {
    http.post('/game_agent/batch', {data: {id: getIds(), type: type}}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })
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
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <el-dialog  v-model="systemDialog" :title="$t('返佣设置')" width="70%" >
      <commForm title="保存" @save="settingSave" :dialogObj="systemBoxObj.systemSetModel" @currentChage="systemSetChange"
          :listRules="tranSetRules" :list="systemSetBox.systemSeting" />
    </el-dialog>
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
      <div>
        <el-button v-if="hasAuth('edit')" :disabled="selectAll.length <= 0" type="primary" @click="batchPs(2)">{{ $t('一键派送') }}</el-button>
        <el-button v-if="hasAuth('edit')" :disabled="selectAll.length <= 0" type="danger" @click="batchPs(1)">{{ $t('一键拒绝') }}</el-button>
        <el-button v-if="hasAuth('setting')" type="primary" @click="settingSystem">{{ $t('设置') }}</el-button>
      </div>
      <div style="margin-right:20px;font-size: 14px;">
        <el-tag size="large" :type="row.info" v-for="row,idx in stat" :key="idx">{{ $t(row.label) }}:{{ row.total }}</el-tag>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
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
              <el-button v-if="hasAuth('edit')" size="small" type="danger" @click="handleReview(row,1)">{{ $t('拒绝') }}</el-button>
              <el-button v-if="hasAuth('edit')" size="small" type="primary" @click="handleReview(row,2)">{{ $t('派发') }}</el-button>
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
        <template #lebal="{ row }">
          <el-tag v-if="row.lebal == 1" type="success" size="small">{{ $t('一般用户') }}</el-tag>
          <el-tag v-if="row.lebal == 2" type="danger" size="small">{{ $t('测试用户') }}</el-tag>
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
