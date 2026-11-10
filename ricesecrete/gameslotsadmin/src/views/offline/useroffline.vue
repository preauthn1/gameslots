<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, computed } from 'vue';
import { message } from "@/utils/message";
// import { timeCycle } from '@/utils/global'
import { useroffline, userOfflineEdit, userOfflineDetail, userofflineCount, userofflinePayChannel, userofflineAdd, userofflineDelete, systemEdit, userOfflineRemarkes } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
import commForm from '@/components/comm/comm-form3.vue'

defineOptions({
  name: 'useroffline'
})
const columns = [
  {
    label: transformI18n("订单"),
    prop: "id",
  },
  {
    label: transformI18n("订单号"),
    width: 160,
    slot: "order_sn"
  },
  {
    label: transformI18n("支付渠道"),
    prop: "pay_name",
    width: 150
  },
  {
    label: transformI18n("首充/复充"),
    prop: "first",
    width: 100,
    cellRenderer: ({ row }) => (
      <>
        <div >
          <el-tag type="info" v-show={row.first == 0}>{transformI18n("无效")}</el-tag>
          <el-tag type="success" v-show={row.first == 1}>{transformI18n("首充")}</el-tag>
          <el-tag type="info" v-show={row.first > 1}>{transformI18n("复充")}</el-tag>
        </div>
      </>
    )
  },
  {
    label: transformI18n("用户信息"),
    prop: "username",
    width: 200,
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
        <div>
          {transformI18n("标签")}:
          <el-tag class="ml-[3px]" type="success" effect="plain" v-show={row.lebal == 1}>{transformI18n('会员')}</el-tag>
          <el-tag class="ml-[3px]" type="danger" effect="plain" v-show={row.lebal == 2}>{transformI18n('测试')}</el-tag>
          {
            row.tags.map(item => {
              return <el-tag class="ml-[3px]" size="small" color={item.color} style={item.color ? 'color:#FFF' : ''} type={item.color ? '' : 'success'}>{transformI18n(item.name)}</el-tag>
            })
          }

        </div>
        <div>
          {transformI18n("会员备注")}:{row.remark}
        </div>
      </>
    )
  },
  {
    label: transformI18n("注册时间/注册ip"),
    headerRenderer: () => transformI18n("注册时间/注册ip"),
    width: 200,
    slot: "content"
  },
  {
    label: transformI18n("代理"),
    prop: "rec_id",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        <div v-show={row.rec_top_user}>
          {transformI18n("总代")}: {row.rec_top_user}
        </div>
        <div v-show={row.rec_user}>
          {transformI18n("上级")}: {row.rec_user}
        </div>
      </>
    )
  },
  {
    label: transformI18n("申请金额"),
    prop: "apply_price",
  },
  {
    label: transformI18n("币种|充值汇率|到账金额"),
    width: 200,
    cellRenderer: ({ index, row }) => (
      <>
        <div>{row.pay_currency} | {row.exchange_rate} | {row.arrival_price}</div>
      </>
    )
  },
  {
    label: transformI18n("状态"),
    // prop: "status",
    slot: "status",
    width: 160,
  },
  {
    label: transformI18n("申请时间"),
    prop: "add_time",
    width: 160,
    sortable: true
  },
  {
    label: transformI18n("审核时间"),
    prop: "update_time",
    width: 160,
    sortable: true
  },
  {
    label: transformI18n("操作员"),
    prop: "admin_name",
    width: 100
  },
  {
    label: transformI18n("备注"),
    prop: "remarks",
    width: 150
  },
  {
    label: transformI18n("数据"),
    // prop: "channel_name",
    slot: "channel_name",
  },
  {
    label: transformI18n("参与活动"),
    // prop: "status",
    slot: "not_auto_action",
    width: 160,
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: 120,
    slot: 'eidt',
    // cellRenderer: ({ index, row }) => (
    //   <>
    //     <el-button type="primary" size="small" onClick={() => handleEdit(index, row)}>
    //       查看
    //     </el-button>
    //   </>
    // )
  }
];

const handleEdit = (index, row) => {

}

const height = window.innerHeight - 390;
//以下是搜索框的数据
const list = {
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    idx: 1,
    prop: 'username'
  },
  order_id: {
    type: 'input',
    placeholder: '订单ID',
    value: '',
    idx: 3,
    prop: 'order_id'
  },
  order_sn: {
    type: 'input',
    placeholder: '订单号',
    value: '',
    idx: 4,
    prop: 'order_sn'
  },
  status: {
    type: 'select',
    placeholder: '审核状态',
    value: '',
    prop: 'status',
    idx: 6,
    options: [
      {
        label: '已取消',
        value: -2,
      }, {
        label: '延迟未付款',
        value: -1,
      }, {
        label: '待审核',
        value: 1,
      }, {
        label: '未通过',
        value: 2,
      }, {
        label: '已通过',
        value: 3,
      }, {
        label: '手动入款',
        value: 4,
      }
    ]
  },
  recharge_type: {
    type: 'select',
    placeholder: '充值类型',
    value: '',
    idx: 13,
    prop: 'recharge_type',
    options: [
      {
        label: '首充',
        value: 1,
      }, {
        label: '复充',
        value: 2,
      },
    ]
  },
  three_order_sn: {
    type: 'input',
    placeholder: '三方订单号',
    value: '',
    idx: 5,
    prop: 'three_order_sn'
  },
  bankcrad: {
    type: 'input',
    placeholder: '付款卡号',
    value: '',
    idx: 0,
    prop: 'bankcrad'
  },
  agent_name: {
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    idx: 2,
    prop: 'agent_name'
  },
  top_agent_name: {
    type: 'input',
    placeholder: '上级代理用户名',
    value: '',
    idx: 20,
    prop: 'top_agent_name'
  },
  channel: {
    type: 'select',
    placeholder: '数据来源',
    value: '',
    prop: 'channel',
    idx: 7,
    options: []
  },
  date: {
    type: 'time',
    placeholder: '时间',
    prop: 'date',
    idx: 8,
    value: (): Array<string> => {
      return []
    }
  },
  register_time: {
    type: 'time',
    placeholder: '注册时间',
    prop: 'register_time',
    idx: 8,
    value: (): Array<string> => {
      return []
    }
  },
  min_price: {
    type: 'input',
    placeholder: '最小金额',
    value: '',
    idx: 9,
    prop: 'min_price',
  },
  max_price: {
    type: 'input',
    placeholder: '最大金额',
    value: '',
    prop: 'max_price',
    idx: 10
  },
  time_type: {
    type: 'select',
    placeholder: '时间类型',
    value: '',
    prop: 'time_type',
    idx: 11,
    options: [
      {
        label: '下单时间',
        value: 1,
      }, {
        label: '审核时间',
        value: 2,
      }
    ]
  },
  pay_type: {
    type: 'select',
    placeholder: '支付渠道',
    value: '',
    idx: 12,
    prop: 'pay_type',
    options: []
  },
  level_id: {
    type: 'select',
    placeholder: '用户等级',
    value: '',
    idx: 14,
    prop: 'level_id',
    options: []
  },
  lebals: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    idx: 15,
    prop: 'lebals',
    options: []
  },
  set_content: {
    type: 'input',
    placeholder: '备注',
    value: '',
    prop: 'set_content',
    idx: 16
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search',
    idx: 17
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export',
    idx: 18
  }
};
const props = defineProps({
  uid: String,
})
const uid = computed(() => {
  return props.uid
})
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',//排序字段 id 或 balance
  set_content: '',
  lebals: '',
  level_id: '',
  recharge_type: '',
  pay_type: '',
  time_type: '',
  date: '',//时间
  register_time: '',//注册时间
  min_price: '',
  max_price: '',
  channel: '',
  status: '',
  three_order_sn: '',
  order_sn: '',
  order_id: '',
  agent_name: '',
  top_agent_name: '',//上级代理
  username: '',
  bankcrad: '',
  uid: uid
});
//获取按钮的值
const countQuery = reactive({
  uid: uid,
})
const countData: any = {}
const countDataBox: any = ref({})

const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  //时间转换
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date' || key == 'register_time') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] = time;
      }
      //  else if (key == 'pay_type') {
      // // } else if (key == 'pay_type' && list[key].value) {
      //   //pagination[key] = channelDataBox.channelData[list[key].value].id
      // // } else {
      //   pagination[key] = list[key].value
      // }

    }
  }
  init();
}

function offlinCount() {
  userofflineCount(pagination).then((res: any) => {
    if (res.code == 1) {
      countDataBox.value = res.data;
    }
  })
}
//首次需要加载的接口
init();
function init() {
  useroffline(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    listbox.list.level_id.options = res.user_level
    listbox.list.channel.options = res.channel_select
    listbox.list.lebals.options = res.tags
  })
  offlinCount();
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
//导出
const handleExport = () => {
  http.post('/user_offline/excel', { data: pagination }).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};

//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
  list[index].value = value;
  pagination[index] = value
}

// //点击清楚uid
// const handleRemoveUid = () => {
//   removeUid('offline');
//   router.replace({ path: '/user/pages/userloginlog' })
//   for (var key in pagination) {
//     if (key != 'page' && key != 'limit' && key != 'total') {
//          pagination[key] = ''
//     }
//   }
//   pagination.page = 1;
//   pagination.uid = '';
//   init();
// }


//弹框写法
const visible = ref(false);
const dialogList = {
  username: {
    type: 'slot',
    label: '用户',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    name: 'username',
    prop: 'username'
  },
  price: {
    type: 'input',
    label: '入单金额',
    placeholder: '入单金额',
    value: '',
    prop: 'price'
  },
  mx_msg: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    tip: '注：入单备注',
    value: '',
    prop: 'mx_msg'
  },
  pay_index: {
    type: 'select',
    label: '选择渠道',
    placeholder: '选择渠道',
    value: '',
    options: [
      // {
      //   label: 0,
      //   name:'关闭'
      // },
    ],
    prop: 'pay_index'
  },
  update_time: {
    type: 'time',
    label: '审核时间',
    placeholder: '审核时间',
    value: '',
    prop: 'update_time'
  },
}
const dialogModel = reactive({
  username: '',
  price: '',
  mx_msg: '',
  pay_index: '',
  update_time: '',
})
const listRules = {
  username: [
    { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' },
  ],
  price: {
    required: true, message: '价格', trigger: 'blur'
  },
  pay_index: {
    required: true, message: '请选择渠道', trigger: 'blur'
  }
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}
const manualRecharge = () => {
  visible.value = true
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
}

//---查看--
const seeDialog = ref(false)
const orderInfo: any = ref();
function seeInit(row) {
  const query = {
    find: true,
    id: row.id
  }
  userOfflineDetail(query).then((res: any) => {
    const seeList = res.data;
    orderInfo.value = res.data;
    seeBox4.credentials = res.data.credentials;
    // let seeObj = { ...seeBox1, ...seeBox2, ...seeBox3 }
    for (const key in seeList) {
      if (key == seeBox1[key]?.prop) {
        seeBox1[key].value = seeList[key]
      }
      if (key == seeBox2[key]?.prop) {
        seeBox2[key].value = seeList[key]
      }
      if (key == seeBox3[key]?.prop) {
        seeBox3[key].value = seeList[key]
      }
    }
  })
}
const hanldeSee = (row) => {
  seeDialog.value = true;
  seeInit(row);
}
const seeBox1 = reactive({
  username: {
    value: '',
    label: '充值用户',
    prop: 'username'
  },
  apply_price: {
    value: '',
    label: '充值金额',
    prop: 'apply_price'
  },
  order_sn: {
    value: '',
    label: '订单号',
    prop: 'order_sn'
  },
  add_time: {
    value: '',
    label: '申请时间',
    prop: 'add_time'
  },
  update_time: {
    value: '',
    label: '支付时间',
    prop: 'update_time'
  }
})
const seeBox2 = reactive({
  s_bank_name: {
    value: '',
    label: '链接名称',
    prop: 's_bank_name'
  },
  s_bank_number: {
    value: '',
    label: '收币地址',
    prop: 's_bank_number'
  },
  bank_qrcode: {
    name: 'img',
    value: '',
    label: 'U二维码',
    prop: 'bank_qrcode'
  },
})
const seeBox3 = reactive({
  pay_currency: {
    value: '',
    label: '充值货币',
    prop: 'pay_currency'
  },
  arrival_currency: {
    value: '',
    label: '目标货币',
    prop: 'arrival_currency'
  },
  exchange_rate: {
    value: '',
    label: '汇率',
    prop: 'exchange_rate'
  },
  arrival_price: {
    value: '',
    label: '到账金额',
    prop: 'arrival_price'
  },
  rebate: {
    value: 0,
    label: '返利金额',
    prop: 'rebate'
  },
})
const seeBox4 = reactive({
  credentials: ''
});

//获取渠道
getChannel();
const channelData = [];
const channelDataBox = reactive({
  channelData
})
function getChannel() {
  userofflinePayChannel().then((res: any) => {
    const payList = res.data;
    channelDataBox.channelData = res.data;
    const payArr = []
    payList.forEach((item, index) => {
      payArr.push({
        label: item.t_name + '-'
          + (item.p_type == 'online' ? item.pay_name : item.bank_name)
          + (item.remarks ? '(' + item.remarks + ')' : ''),
        // value: item.id
        value: index
      })
    })
    dialogList.pay_index.options = payArr;
    listbox.list.pay_type.options = payArr;
  })
}
//手动入单 保存
const saveAdd = () => {
  const query = {
    a_type: 1,
    mx_msg: dialogList.mx_msg.value,
    pay_id: channelDataBox.channelData[dialogList.pay_index.value].id,
    pay_index: dialogList.pay_index.value,
    pay_type: channelDataBox.channelData[dialogList.pay_index.value].p_type,
    price: dialogList.price.value,
    select_index: '',
    uid: '',
    username: dialogList.username.value,
    update_time: dialogList.update_time.value,
  }
  userofflineAdd({ info: query }).then((res: any) => {
    if (res.code == 1) {
      visible.value = false;
      message(res.msg, { type: 'success' });
    }
  })
}

//手动删除充值订单
const saveDel = (row) => {
  const query = {
    id: row.id
  };
  userofflineDelete({ info: query }).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    }
  })
}
//用户改变
const eidtUsername = (val) => {
  dialogList.username.value = val;
  dialogModel.username = val;
  selectShow.value = false;
}

const submitData = () => {
  userOfflineEdit({ info: orderInfo.value }).then((res: any) => {
    if (res.code == 1) {
      seeDialog.value = false;
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

// 充值设置 - 配置
const rechargeDialog = ref(false)
const systemSeting = {
  is_recharge: {
    type: 'radio',
    label: '充值开关',
    placeholder: '充值开关',
    tip: '关闭后不允许充值',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'is_recharge'
  },
  recharge_limit: {
    type: 'input',
    ty: 'number',
    label: '最小充值金额',
    placeholder: '提现后最小充值金额',
    tip: "首次提现后最小充值金额，0时表示不限制",
    value: 0,
    prop: 'recharge_limit'
  },
  recharge_rebate: {
    type: 'input',
    label: '充值返利',
    ty: 'number',
    placeholder: '输入数字，充值返利',
    tip: '充值返利，充值金额返利比例，比如 1%，填写 1',
    value: '',
    prop: 'recharge_rebate'
  },
  recharge_rec_rebate: {
    type: 'input',
    label: '上级返利',
    ty: 'number',
    placeholder: '输入数字，上级返利',
    tip: '充值返利，用户充值给直属上级返利比例，比如 1%，填写 1',
    value: '',
    prop: 'recharge_rec_rebate'
  },
  cancel_recharge_order: {
    type: 'radio',
    label: '充值订单',
    placeholder: '充值订单',
    tip: '这里设定是否自动取消前一天未付款的充值订单',
    value: '',
    options: [
      {
        label: 1,
        name: '取消'
      }, {
        label: 0,
        name: '不取消'
      }
    ],
    prop: 'cancel_recharge_order'
  },
  quick_recharge: {
    type: 'input',
    label: '快捷银行充值金额',
    placeholder: '快捷银行充值金额设置',
    tip: '快捷银行充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'quick_recharge'
  },
  hot_quick_recharge: {
    type: 'input',
    label: '热门银行充值金额',
    placeholder: '热门银行充值金额设置',
    tip: '热门银行充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'hot_quick_recharge'
  },
  usdt_quick_recharge: {
    type: 'input',
    label: '快捷USDT充值金额',
    placeholder: '快捷USDT充值金额',
    tip: '快捷usdt充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'usdt_quick_recharge'
  },
}

const systemSetModel = {
  is_recharge: '',
  recharge_limit: 0,
  recharge_rebate: '',
  recharge_rec_rebate: '',
  cancel_recharge_order: '',
  quick_recharge: '',
  hot_quick_recharge: '',
  usdt_quick_recharge: '',
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
    systemBoxObj[name][key] = data[key];
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
  rechargeDialog.value = true
}

const settingSave = () => {
  const rQuery = {
    edit: true,
    info: {
      ...systemBoxObj.systemSetModel,
    }
  }

  systemEdit(rQuery).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
  });
}


//表格渲染列表配置
const renderColumns = ref(columns)

//初始默认全部选中
const selectedColumns = ref(columns.map(item => item.label))


const handleColumnChange = () => {
  //过滤取消选中的多选框，隐藏对应列。 正常来说应该用prop字段，
  // 但很多做了表格自定义渲染的没有这个字段。将就用label。这里最好是唯一值。/
  // ps: 宽度塌陷是正常的，你可以在columns中将某个列去除宽度，这样如果这个还是显示的，就会自动铺满剩余宽度。具体看你如何取舍。
  //你也可以通过 多选框禁用，或设置一个默认数组与selectedColumns.value拼接去重，达到默认显示哪几个列的目的
  renderColumns.value = columns.filter(item => selectedColumns.value.includes(item.label))
}

//自定义备注
const remarkesTitle = ref<string>('');;
const handleSetRemarkes = (row) => {
  for (const key in remarkesDalogModel) {
    if (key == 'id') {
      remarkesDalogModel[key] = row[key]
    } else {
      remarkesBox.remarkesDialogList[key].value = row[key]
      remarkesDalogModel[key] = row[key]
    }
  }
  remarkesTitle.value = '自定义备注[' + row.order_sn + ']'
  remarkesVisible.value = true;
}
//弹框写法
const remarkesVisible = ref(false);
const remarkesDialogList = {
  remarks: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop: 'remarks',
  },
}
const remarkesDalogModel = reactive({
  id: '',
  remarks: '',
})

const RemarksListRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },
}
const remarkesBox = reactive({ remarkesDialogList })
const handleRemarkesDialogChange = ({ value, index }) => {
  remarkesBox.remarkesDialogList[index].value = value;
  remarkesDalogModel[index] = value;
}

const handleRemarkesSave = () => {
  const query = {
    edit: true,
    info: remarkesDalogModel
  }
  userOfflineRemarkes(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      remarkesVisible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <el-dialog v-model="rechargeDialog" :title="$t('充值设置')" width="70%">
      <commForm title="保存" @save="settingSave" :dialogObj="systemBoxObj.systemSetModel" @currentChage="systemSetChange"
        :listRules="tranSetRules" :list="systemSetBox.systemSeting" />
    </el-dialog>
    <commDialog :title="remarkesTitle" width="80%" @save="handleRemarkesSave" :dialogObj="remarkesDalogModel"
      @currentChage="handleRemarkesDialogChange" :listRules="RemarksListRules" :list="remarkesBox.remarkesDialogList"
      :visible="remarkesVisible" @close="remarkesVisible = false" />
    <!---查看-->
    <el-dialog v-model="seeDialog" :title="$t('充值详情')" width="70%">
      <div class="seeBox">
        <!-- <div class="seeBox-title">{{ $t('充值详情') }}</div> -->
        <div class="flex seeBox-box">
          <div class="seeBox-item">
            <div class="seeBox-item-t">{{ $t('充值信息') }}</div>
            <el-form disabled :model="seeBox1" class="demo-form-inline">
              <el-form-item label-width="80px" :label="$t(item.label)" v-for="item, index in seeBox1" :key="index">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item"
            v-if="orderInfo && !orderInfo.pay_type && (orderInfo.channel == 0 || orderInfo.channel == 1)">
            <div class="seeBox-item-t">{{ $t('收款银行') }}</div>
            <el-form disabled class="demo-form-inline">
              <el-form-item label-width="80px" :label="$t('银行名称')">
                <el-input v-model="orderInfo.s_bank_name" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('银行卡号')">
                <el-input v-model="orderInfo.s_bank_number" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('开户姓名')">
                <el-input v-model="orderInfo.s_bank_khm" />
              </el-form-item>
              <el-form-item v-if="orderInfo.s_bank_open" label-width="80px" :label="$t('开户行')">
                <el-input v-model="orderInfo.s_bank_open" />
              </el-form-item>
              <el-form-item v-if="orderInfo.bankcrad" label-width="80px" :label="$t('转账卡号')">
                <el-input v-model="orderInfo.bankcrad" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item"
            v-if="orderInfo && !orderInfo.pay_type && (orderInfo.channel == 2 || orderInfo.channel == 3)">
            <div class="seeBox-item-t">{{ $t('USDT信息') }}</div>
            <el-form disabled :model="seeBox2" class="demo-form-inline">
              <el-form-item label-width="80px" :label="$t(item.label)" v-for="item, index in seeBox2" :key="index">
                <template v-if="index == 'bank_qrcode'">
                  <el-image :preview-src-list="[item.value]" :initial-index="0" style="width: 100px; height: 100px"
                    :src="item.value" fit="contain" />
                </template>
                <template v-else>
                  <el-input v-model="item.value" />
                </template>
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && !orderInfo.pay_type && (orderInfo.channel == 4)">
            <div class="seeBox-item-t">{{ $t('电子钱包信息') }}</div>
            <el-form disabled class="demo-form-inline">
              <el-form-item label-width="80px" :label="$t('钱包名称')">
                <el-input v-model="orderInfo.s_bank_name" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('收款账号')">
                <el-input v-model="orderInfo.s_bank_number" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('收款二维码')">
                <el-image :preview-src-list="[orderInfo.bank_qrcode]" :initial-index="0"
                  style="width: 100px; height: 100px" :src="orderInfo.bank_qrcode" fit="contain" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && !orderInfo.pay_type && (orderInfo.channel == 6)">
            <div class="seeBox-item-t">{{ $t('PIX钱包信息') }}</div>
            <el-form disabled class="demo-form-inline">
              <el-form-item label-width="80px" :label="$t('类型')">
                <el-input v-model="orderInfo.s_bank_name" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('账号')">
                <el-input v-model="orderInfo.s_bank_number" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('姓名')">
                <el-input v-model="orderInfo.s_bank_khm" />
              </el-form-item>
              <el-form-item label-width="80px" :label="$t('税号')">
                <el-input v-model="orderInfo.s_financial" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && orderInfo.pay_type">
            <div class="seeBox-item-t">{{ $t('渠道信息') }}</div>
            <el-form disabled class="demo-form-inline">
              <el-form-item label-width="120px" :label="$t('支付渠道')">
                <el-input v-model="orderInfo.pay_type" />
              </el-form-item>
              <el-form-item label-width="120px" :label="$t('渠道订单号')">
                <el-input v-model="orderInfo.othr_number" />
              </el-form-item>
              <template v-if="orderInfo.pay_currency != orderInfo.arrival_currency">
                <el-form-item label-width="120px" :label="$t('充值货币')">
                  <el-input v-model="orderInfo.pay_currency" />
                </el-form-item>
                <el-form-item label-width="120px" :label="$t('目标货币')">
                  <el-input v-model="orderInfo.arrival_currency" />
                </el-form-item>
                <el-form-item label-width="120px" :label="$t('汇率')">
                  <el-input v-model="orderInfo.exchange_rate" />
                </el-form-item>
                <el-form-item label-width="120px" :label="$t('到账金额')">
                  <el-input v-model="orderInfo.arrival_price" />
                </el-form-item>
              </template>
            </el-form>
          </div>
          <div class="seeBox-item">
            <div class="seeBox-item-t">{{ $t('货币信息') }}</div>
            <el-form disabled :model="seeBox3" class="demo-form-inline">
              <el-form-item label-width="80px" :label="$t(item.label)" v-for="item, index in seeBox3" :key="index">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="flex-fi seeBox-btm">
          <div class="btm-text">{{ $t('充值凭证') }}</div>
          <el-image v-if="seeBox4.credentials" style="width: 100px; height: 100px"
            :preview-src-list="[seeBox4.credentials]" :initial-index="0" :src="seeBox4.credentials" fit="contain" />
          <span v-else>{{ $t('无') }}</span>
        </div>
        <p style="text-align: center;color: red;" v-if="orderInfo && orderInfo.cutrr_status == -1">
          该笔订单为延迟未付款，请确认好用户是否完成充值</p>
        <div class="flex-fi seeBox-btm" v-if="orderInfo && orderInfo.cutrr_status < 3">
          <el-form class="demo-form-inline">
            <el-form-item label-width="120px" :label="$t('状态')">
              <el-radio-group v-model="orderInfo.status">
                <el-radio size="large" :label="2">{{ $t('拒绝') }}</el-radio>
                <el-radio size="large" :label="4">{{ $t('通过') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('备注')">
              <el-input type="textarea" :rows="3" :placeholder="$t('请输入内容')" v-model="orderInfo.remarks" />
            </el-form-item>
            <el-form-item label-width="120px">
              <el-button type="primary" @click="submitData">{{ $t('保存') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"
      :list="listbox.list" />
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component :is="defineAsyncComponent(() =>
        import('@/views/report/exportreports.vue')
      )
        " />
    </el-dialog>
    <div class=" line-box">
      <div class="flex-bc flex-fi m-2.5">
        <el-button v-if="hasAuth('add')" type="primary" @click="manualRecharge">{{ $t('手动入单') }}</el-button>
        <el-button v-if="hasAuth('setting')" type="primary" @click="settingSystem">{{ $t('设置') }}</el-button>
      </div>
      <div class="flex-bc flex-fi">
        <div style="margin-right:20px;font-size: 14px;" v-for="row, idx in countDataBox" :key="idx">
          {{ $t(row.title) }}:
          <el-tag size="large">{{ $t('已通过') }}:{{ row.yes }}</el-tag>
          <el-tag size="large">{{ $t('笔数') }}:{{ row.count }}</el-tag>
          <el-tag size="large">{{ $t('人数') }}:{{ row.people }}</el-tag>
          <el-tag type="warning" size="large">{{ $t('未审核') }}:{{ row.stay }}</el-tag>
          <el-tag type="danger" size="large">{{ $t('未通过') }}:{{ row.no }}</el-tag>
        </div>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom:30px;">
        <component :is="defineAsyncComponent(() => import('@/views/user/pages/list.vue'))" :back="true" :field="1"
          @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <commDialog title="手动添加" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules"
      @save="saveAdd" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template #username>
        <div class="flex-fi user-box">
          <el-input v-model="dialogModel.username" @change="eidtUsername($event)" :placeholder="$t('UID')" />
          <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
        </div>
      </template>
    </commDialog>

    <el-checkbox-group v-model="selectedColumns" @change="handleColumnChange">
      <el-checkbox v-for="(item, index) in columns" :key="index" :label="item.label">{{ item.label }}</el-checkbox>
    </el-checkbox-group>

    <pure-table :data="tableData.dataList" width="100%" adaptive :columns="renderColumns">
      <template #content="{ row }">
        <p>{{ row.register_time }}</p>
        <span v-html="row.reg_ip" />
      </template>
      <template #status="{ row }">
        <el-tag type="warning" size="small" v-if="row.status == -2">{{ $t('已取消') }}</el-tag>
        <el-tag type="warning" size="small" v-if="row.status == -1">{{ $t('延迟未付款') }}</el-tag>
        <el-tag type="warning" size="small" v-if="row.status == 1">{{ $t('未审核') }}</el-tag>
        <el-tag type="danger" size="small" v-if="row.status == 2">{{ $t('未通过') }}</el-tag>
        <el-tag type="success" size="small" v-if="row.status == 3">{{ $t('已通过') }}</el-tag>
        <el-tag type="success" size="small" v-if="row.status == 4">{{ $t('手动入款') }}</el-tag>
      </template>
      <template #not_auto_action="{ row }">
        <el-tag type="danger" size="small" v-if="row.not_auto_action == 1">{{ $t('不参与') }}</el-tag>
        <el-tag type="success" size="small" v-if="row.not_auto_action == 0">{{ $t('自动') }}</el-tag>
        <el-tag type="success" size="small" v-if="row.not_auto_action > 1">{{ $t('指定活动(ID): ') }}{{ row.not_auto_action
        }}</el-tag>
      </template>
      <template #eidt="{ row }">
        <template v-if="hasAuth('edit')">
          <el-button type="danger" size="small" v-if="row.status == 1 || row.status == -1" @click="hanldeSee(row)">{{
            $t('审核') }}</el-button>
          <el-button type="danger" size="small" v-else-if="row.status == 2" @click="hanldeSee(row)">{{ $t('再次审核')
          }}</el-button>
          <el-button type="primary" size="small" v-else @click="hanldeSee(row)">{{ $t('查看') }}</el-button>
        </template>
        <el-button type="primary" size="small" v-if="hasAuth('set_remarks')" @click="handleSetRemarkes(row)">{{
          $t('自定义备注')
        }}</el-button>
        <el-button type="primary" size="small" v-else-if="row.status > 2" @click="hanldeSee(row)">{{ $t('查看')
        }}</el-button>
        <el-button type="danger" size="small" @click="saveDel(row)" v-if="hasAuth('delete')">{{ $t('删除') }}</el-button>
      </template>
      <template #lebal="{ row }">
        <el-tag type="success" effect="plain" v-if="row.lebal == 1">{{ $t('会员') }}</el-tag>
        <el-tag type="danger" effect="plain" v-else-if="row.lebal == 2">{{ $t('测试') }}</el-tag>
      </template>
      <template #order_sn="{ row }">
        <p>{{ row.order_sn }}</p>
        <p v-if="row.othr_number">{{ row.othr_number }}</p>
      </template>
      <template #channel_name="{ row }">
        {{ $t(row.channel_name) }}
      </template>
    </pure-table>
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>

  </div>
</template>
<style scoped lang="scss">
.el-tag {
  margin-right: 5px;
}

.btmNav {
  padding-top: 10px;
}

.line-box {
  margin: 10px 0;
}

.user-box {
  width: 100%;
}

.seeBox {
  .seeBox-title {
    margin-bottom: 20px;
  }

  .seeBox-box {
    background-color: #eee;
    padding: 30px;

    .seeBox-item-t {
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      height: 50px;
      line-height: 50px;
    }

    .seeBox-item {
      margin-right: 30px;
      background-color: #fff;
      padding: 20px;
      padding-top: 0px;
    }
  }

  .seeBox-btm {
    padding: 15px 0;

    .btm-text {
      color: #000;
      margin-right: 10px;
    }
  }
}
</style>
