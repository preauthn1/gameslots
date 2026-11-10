<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, computed } from 'vue';
import { timeCycle } from '@/utils/global'
import { message } from "@/utils/message";
import { userWithdrawalList, userwithdrawalAdd, userwithdrawalCount, userwithdrawalEdit, userwithdrawalEdit2, userofflinePayChannel, systemEdit, userwithdrawalRemarkes } from "@/api/user";
// import { useRoute, useRouter } from "vue-router";
// import { getUid, removeUid } from "@/utils/route";
import { forEach } from 'lodash-unified';
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
import commForm from '@/components/comm/comm-form3.vue'
import { Delete, Plus } from '@element-plus/icons-vue'

// const route = useRoute();
// const router = useRouter();
defineOptions({
  name: 'userwithdrawal'
})
const columns = [
  {
    label: transformI18n("订单"),
    prop: "id",
    width: 100,
  },
  {
    label: transformI18n("订单号"),
    width: 200,
    slot: "order_sn"
  },
  {
    label: transformI18n("支付渠道"),
    prop: "pay_name",
    width: 100
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
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.phone}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.mail}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.mail}</p>
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
    label: transformI18n("代理"),
    prop: "rec_id",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        <div v-show={row.rec_top_user}>
          {transformI18n("总代")}: {row.rec_top_user}
        </div>
        <div v-show={row.rec_top_user}>
          {transformI18n("上级")}: {row.rec_user}
        </div>
      </>
    )
  },
  {
    label: transformI18n("提现金"),
    prop: "w_price",
  },
  {
    label: transformI18n("首提/复提"),
    prop: "first",
    width: 90,
    cellRenderer: ({ row }) => (
      <>
        <div >
          <el-tag type="info" v-show={row.first == 0}>{transformI18n("无效")}</el-tag>
          <el-tag type="success" v-show={row.first == 1}>{transformI18n("首提")}</el-tag>
          <el-tag type="info" v-show={row.first > 1}>{transformI18n("复提")}</el-tag>
        </div>
      </>
    )
  },
  {
    label: transformI18n("实际金"),
    prop: "arrival_prices",
    width: 100,
    sortable: true
  }, {
    label: transformI18n("币种|充值汇率|到账金额"),
    width: 200,
    cellRenderer: ({ index, row }) => (
      <>
        <div>
          <span style="color:#01AAED;margin-right:5px;">{row.arrival_currency}</span>/
          <span style="color:#e6a23c;margin-right:5px;margin-left:5px">{parseFloat(row.exchange_rate)}</span>/
          <span style="color:#FF5722;margin-left:5px">{row.arrival_price}</span></div>
      </>
    )
  }, {
    label: transformI18n("状态"),
    slot: "status",
    width: 150
  }, {
    label: transformI18n("代付失败原因"),
    prop: "third_err_remarks",
    width: 150
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
    label: transformI18n("操作人"),
    prop: "operator",
    width: 150
  },
  {
    label: transformI18n("备注"),
    prop: "w_remarks",
    width: 150
  },
  {
    label: transformI18n("数据"),
    slot: "channel_name",
    width: 150,
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

//以下是搜索框的数据
const list = {
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    idx: 0,
    prop: 'username'
  },
  order_id: {
    type: 'input',
    placeholder: '订单ID',
    value: '',
    idx: 1,
    prop: 'order_id'
  },
  order_sn: {
    type: 'input',
    placeholder: '订单号',
    value: '',
    idx: 2,
    prop: 'order_sn'
  },
  withdrawal_type: {
    type: 'select',
    placeholder: '提现类型',
    value: '',
    idx: 2,
    prop: 'withdrawal_type',
    options: [
      {
        label: '首次提现',
        value: 1,
      }, {
        label: '二次提现',
        value: 2,
      },
    ]
  },
  status: {
    type: 'select',
    placeholder: '审核状态',
    value: '',
    idx: 4,
    prop: 'status',
    options: [
      {
        label: '失败审核',
        value: -9,
      }, {
        label: '已取消',
        value: -2,
      }, {
        label: '代付失败',
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
        label: '手动出款',
        value: 4,
      }, {
        label: '进行中',
        value: 5,
      }, {
        label: '正在处理中',
        value: 6,
      }
    ]
  },
  agent_name: {
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    idx: 3,
    prop: 'agent_name'
  },
  // channel: {
  //   type: 'select',
  //   placeholder: '数据来源',
  //   value: '',
  //   idx: 5,
  //   prop: 'channel',
  //   options: [
  //     {
  //       label: 'USDT',
  //       value: 1,
  //     }
  //   ]
  // },
  lebals: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    idx: 6,
    prop: 'lebals',
    options: []
  },
  date: {
    type: 'time',
    placeholder: '时间',
    idx: 7,
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  min_price: {
    type: 'input',
    placeholder: '最小金额',
    value: '',
    prop: 'min_price',
    idx: 8
  },
  max_price: {
    type: 'input',
    placeholder: '最大金额',
    value: '',
    idx: 9,
    prop: 'max_price'
  },
  time_type: {
    type: 'select',
    placeholder: '时间类型',
    value: '',
    idx: 10,
    prop: 'time_type',
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
    placeholder: '代付渠道',
    value: '',
    idx: 11,
    prop: 'pay_type',
    options: []
  },
  remarks: {
    type: 'input',
    placeholder: '备注',
    value: '',
    prop: 'remarks',
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx: 17,
    prop: 'search'
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
  return props.uid;
})
const listbox = reactive({ list });
//条件数据

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  lebals: '',
  pay_type: '',
  time_type: '',
  withdrawal_type: '',
  date: '',//时间
  min_price: '',
  max_price: '',
  channel: '',
  status: '',
  order_sn: '',
  order_id: '',
  agent_name: '',
  remarks: '',
  username: '',
  uid: uid
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  //时间转换
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] = time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
  init();
}

//首次需要加载的接口
init();
function init() {
  userWithdrawalList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    listbox.list.pay_type.options = res.channel;
    listbox.list.lebals.options = res.tags;
  })
  withdrawalCount();
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
  http.post('/user_withdrawal/excel', { data: pagination }).then((res: any) => {
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
}


// //点击清楚uid
// const handleRemoveUid = () => {
//   removeUid('withdrawal');
//   router.replace({ path: '/offline/userwithdrawal' })
//   for (var key in pagination) {
//     if (key != 'page' && key != 'limit' && key != 'total') {
//          pagination[key] = ''
//     }
//   }
//   pagination.page = 1;
//   pagination.uid = '';
//   init();
// }
const countData = {
  bank: {
    no: 0,
    stay: 0,
    yes: 0
  },
  pix: {
    no: 0,
    stay: 0,
    yes: 0
  },
  usdt: {
    no: 0,
    stay: 0,
    yes: 0
  },
  wallet: {
    no: 0,
    stay: 0,
    yes: 0
  }
}
const countDataBox = reactive({
  countData
})

function withdrawalCount() {
  userwithdrawalCount(pagination).then((res: any) => {
    if (res.code == 1) {
      countDataBox.countData = res.data;
    }
  })
}


//弹框写法
const visible = ref(false);
const dialogList = {
  username: {
    type: 'slot',
    label: '用户',
    placeholder: '用户/邮箱/手机号',
    value: '',
    name: 'username',
    prop: 'username'
  },
  price: {
    type: 'input',
    label: '出款金额',
    placeholder: '出款金额',
    value: '',
    prop: 'price'
  },
  w_remarks: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    tip: '注：入单备注',
    value: '',
    prop: 'w_remarks'
  },
}
const dialogModel = reactive({
  username: '',
  price: '',
  mx_msg: '',
  a_type: 1,
  uid: ''
})
const listRules = {
  username: [
    { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' },
  ],
  price: {
    required: true, message: '价格', trigger: 'blur'
  },
  mx_msg: {
    required: true, message: '请选择备注', trigger: 'blur'
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
//获取渠道
// getChannel();
const channelData = [];
const channelDataBox = reactive({
  channelData
})
// function getChannel() {
//   userofflinePayChannel().then((res: any) => {
//     let payList = res.data;
//     channelDataBox.channelData = res.data;
//     let payArr = []
//     payList.forEach((item,index)=> {
//       payArr.push({ label:item.t_name + '-' + (item.p_type == 'online' ? item.pay_name : item.bank_name),value:index })
//     })
//     listbox.list.pay_type.options = payArr;
//   })
// }
//手动入单 保存
const saveAdd = () => {
  userwithdrawalAdd({ info: dialogModel }).then((res: any) => {
    if (res.code == 1) {
      visible.value = false;
      message(res.msg, { type: 'success' });
    }
  })
}
//用户改变
const eidtUsername = (val) => {
  dialogList.username.value = val;
  dialogModel.username = val;
  selectShow.value = false;
}

let selectId = ''
const cutrr_status = ref(0)
//---查看--
const seeDialog = ref(false)
const orderInfo: any = ref();
function seeInit(row) {
  const query = {
    find: true,
    id: row.id
  }
  userwithdrawalEdit(query).then((res: any) => {
    const seeList = res.data;
    orderInfo.value = res.data;
    selectId = res.data.id;
    cutrr_status.value = res.data.cutrr_status
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
      if (key == seeBox4[key]?.prop) {
        seeBox4[key].value = seeList[key]
      }
      if (key == seeBox5[key]?.prop) {
        seeBox5[key].value = seeList[key]
      }

    }
    const msgList = res.data.w_remarks_arr;
    const withArr = [];
    msgList.forEach((item: any, index: number) => {
      withArr.push({ label: item.value, value: index })
    })
  })
}
const is_check = ref(false)
const hanldeSee = (row, check = true) => {
  is_check.value = check
  seeDialog.value = true;
  seeInit(row);
}
const seeBox1 = reactive({
  w_price: {
    value: '',
    label: '提现金额',
    prop: 'w_price',
    tip: '',
  },
  w_service: {
    value: '',
    label: '提现手续费',
    prop: 'w_service',
    tip: '',
  },
  arrival_price: {
    value: '',
    label: '实付金额',
    prop: 'arrival_price',
    tip: '实付金额=(提现金额 - 提现手续费)* 汇率'
  },
  exchange_rate: {
    value: '',
    label: '提现汇率',
    prop: 'exchange_rate',
    tip: '',
  },
  add_time: {
    value: '',
    label: '申请时间',
    prop: 'add_time',
    tip: '',
  }
})
const seeBox2 = reactive({
  bank_name: {
    value: '',
    label: '链接名称',
    prop: 'bank_name'
  },
  bank_number: {
    value: '',
    label: '收币地址',
    prop: 'bank_number'
  },
  bank_open: {
    value: '',
    label: 'U二维码',
    prop: 'bank_open'
  },
})
const seeBox3: any = reactive({
  bank_name: {
    value: '',
    label: '银行名称',
    prop: 'bank_name'
  },
  bank_number: {
    value: '',
    label: '银行卡号',
    prop: 'bank_number'
  },
  bank_hm: {
    value: '',
    label: '会员姓名',
    prop: 'bank_hm'
  },
  bank_open: {
    value: '',
    label: '开户行',
    prop: 'bank_open'
  },
  financial: {
    value: '',
    label: '金融编码',
    prop: 'financial'
  },
})
/// PIX
const seeBox4: any = reactive({
  bank_name: {
    value: 'PIX',
    label: '类型',
    prop: 'bank_name'
  },
  bank_number: {
    value: '',
    label: '账号',
    prop: 'bank_number'
  },
  bank_hm: {
    value: '',
    label: '姓名',
    prop: 'bank_hm'
  },
  financial: {
    value: '',
    label: '税号',
    prop: 'financial'
  },
})
/// 电子钱包
const seeBox5: any = reactive({
  bank_name: {
    value: '',
    label: '钱包名称',
    prop: 'bank_name'
  },
  bank_number: {
    value: '',
    label: '收款地址',
    prop: 'bank_number'
  },
  bank_hm: {
    value: '',
    label: '名称',
    prop: 'bank_hm'
  },
  bank_open: {
    value: '',
    label: '收款二维码',
    prop: 'bank_open'
  },
})

//一键复制
const copyAll = () => {

}
//reviewSave
const reviewSave = () => {
  const data = {
    id: orderInfo.value.id,
    status: orderInfo.value.status,
    pay_id: orderInfo.value.pay_id,
    bank_code: orderInfo.value.bank_code,
    w_remarks: orderInfo.value.w_remarks,
    user_remarks: orderInfo.value.user_remarks,
  }
  userwithdrawalEdit2(data).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      seeDialog.value = false;
      init();
    }
  })
}

//选择返回
const backSelect = (row) => {
  list2Box.dialogList.username.value = row.username
  dialogModel.username = row.username
  selectShow.value = false
}
const change = ($event) => {
  // console.log($event)
}

const banks = ref([])
const changeChannel = ($event) => {
  banks.value = orderInfo.value.channel_list[$event].pay_bank;
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

// 参数设置 - 配置
const systemDialog = ref(false)
const systemSeting = {
  is_withdraw: {
    type: 'radio',
    label: '提现开关',
    placeholder: '提现开关',
    tip: '关闭后不允许提现',
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
    prop: 'is_withdraw'
  },
  saving_zero_withdrawal: {
    type: 'radio',
    label: '流水为0提现',
    placeholder: '流水为零提现',
    tip: '开启后用户流水为零才能提现',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'saving_zero_withdrawal'
  },

  withdrawal_extra_status: {
    type: 'radio',
    label: '代付失败额外状态',
    placeholder: '代付失败额外状态',
    tip: '提现代付失败额外状态，如果开启后三方代付失败后需要重新审核钱才会退回用户余额',
    value: '0',
    options: [
      {
        label: '1',
        name: '开启'
      }, {
        label: '0',
        name: '关闭'
      }
    ],
    prop: 'withdrawal_extra_status'
  },
  pay_passwd_verify: {
    type: 'radio',
    label: '提现支付密码验证',
    placeholder: '支付密码验证状态',
    tip: '提现支付密码验证，开启后用户提现需要输入支付密码',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'pay_passwd_verify'
  },
  add_bank_verify: {
    type: 'radio',
    label: '添加银行卡验证',
    placeholder: '添加银行卡验证',
    tip: '开启后只能添加相同开户行的银行卡，且别的会员不能添加该银行卡，0关闭后则不限制',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'add_bank_verify'
  },
  withdraw_user_verify: {
    type: 'radio',
    label: '提现实名认证验证',
    placeholder: '提现实名认证验证',
    tip: '开启后只能提现实名认证验证成功后才能提现，0关闭后则不限制',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'withdraw_user_verify'
  },
  paypasswd_phone_check: {
    type: 'radio',
    label: '支付密码修改需要验证码',
    placeholder: '支付密码修改需要验证码状态',
    tip: '提现支付密码在修改时是否需要验证码，如果开启修改密码时强制验证码',
    value: 0,
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      }
    ],
    prop: 'paypasswd_phone_check'
  },
  withdraw_amcount: {
    type: 'radio',
    label: '提现金额',
    placeholder: '提现金额',
    tip: '关闭后不允许提现',
    value: '',
    options: [
      {
        label: 1,
        name: '100的倍数'
      }, {
        label: 0,
        name: '10的倍数'
      }, {
        label: 2,
        name: '不限制'
      }
    ],
    prop: 'withdraw_amcount'
  },
  service_charge: {
    type: 'input',
    label: '提现手续费%',
    placeholder: '提现手续费',
    value: '',
    prop: 'service_charge'
  },
  usdt_charge: {
    type: 'input',
    label: 'USDT提现手续费%',
    placeholder: 'USDT提现手续费',
    value: '',
    prop: 'usdt_charge',
    show: true,
  },
  w_water: {
    type: 'input',
    ty: 'number',
    label: '提现流水倍数',
    placeholder: '提现流水倍数',
    value: '',
    prop: 'w_water'
  },
  allow_not_recharge: {
    type: 'input',
    ty: 'number',
    label: '允许未审核数量',
    placeholder: '允许未审核数量',
    tip: '1为用户只允许有一笔未审核的充值订单，0或为空为不限制',
    value: 0,
    prop: 'allow_not_recharge'
  },
  withdrawal_rules: {
    type: 'radio',
    label: '提现规则',
    placeholder: '提现规则',
    tip: '单流水：记单笔充值流水，如：充值1000，下了2000流水，再充值1000，用户账户必须预留新充值的金额，多提会提示流水不足<br>总流水：总充值匹配总流水',
    value: '1',
    prop: 'withdrawal_rules',
    options: [
      {
        label: 1,
        name: '单流水'
      },
      // {
      //   label: 2,
      //   name:'总流水'
      // }
    ]
  },
  free_type: {
    type: 'radio',
    label: '免手续费类型',
    placeholder: '免手续费类型',
    tip: '全部：累计免除提现手续费次数<br>当天：当天累计免除提现手续费次数，新一天重新计算<br>当月：当月累计免除提现手续费次数，下一月重新计算',
    value: '1',
    prop: 'free_type',
    options: [
      {
        label: 0,
        name: '全部'
      },
      {
        label: 1,
        name: '当天'
      },
      {
        label: 2,
        name: '当月'
      }
    ]
  },
  free_poundage: {
    type: 'input',
    ty: 'number',
    label: 'USDT免手续费',
    placeholder: 'USDT几次提现免除手续费',
    tip: 'USDT几次提现免除手续费, 填几次就是免除几次手续费。填0则不免',
    value: '',
    prop: 'free_poundage'
  },
  withdrawal_status: {
    type: 'radio',
    label: '首次提现验证',
    placeholder: '首次提现验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'withdrawal_status'
  },
  bind_card_status: {
    type: 'radio',
    label: '绑卡验证',
    placeholder: '绑卡验证',
    value: '',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'bind_card_status'
  },
  card_number: {
    type: 'input',
    ty: 'number',
    label: '绑卡数量',
    placeholder: '绑卡数量',
    tip: '每个用户银行卡，usdt，电子钱包绑定的数量',
    value: '',
    prop: 'card_number'
  },
  allow_not_withdrawal: {
    type: 'input',
    ty: 'number',
    label: '允许未审核数量',
    placeholder: '允许未审核数量',
    tip: '1为用户只允许有一笔未审核的提现订单，0或为空为不限制',
    value: 0,
    prop: 'allow_not_withdrawal'
  },
  withdrawal_auto: {
    type: 'radio',
    label: '提现自动审核',
    placeholder: '提现自动审核',
    value: '0',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ],
    prop: 'withdrawal_auto'
  },
  auto_withdrawal_pay_id: {
    type: 'select',
    ty: 'uint',
    label: '自动出款渠道',
    placeholder: '自动出款渠道',
    tip: '自动出款渠道，不设置将不能自动出款',
    value: '',
    show: true,
    options: [{ label: '无', value: 0 }],
    prop: 'auto_withdrawal_pay_id'
  },
  auto_withdrawal_recharge_rate: {
    type: 'input',
    ty: 'string',
    label: '充值提现比',
    placeholder: '充值提现比',
    tip: '充值提现比 用户充值总额/(用户提现金额+用户充值成功金额+用户余额) 小于设定值即可自动出款，例：0.3为30%，公式计算小于该值则会自动出款',
    value: 0,
    show: true,
    prop: 'auto_withdrawal_recharge_rate'
  },
  savings_multiple: {
    type: 'input',
    ty: 'number',
    label: '打码倍数',
    placeholder: '打码倍数',
    tip: '满足当日充值的打码倍数即可自动出款',
    value: 1,
    show: true,
    prop: 'savings_multiple'
  },
  auto_max_amount: {
    type: 'input',
    ty: 'number',
    label: '最高出款金额',
    placeholder: '最高出款金额',
    tip: '自动审核最高出款金额,0为不限制',
    value: '',
    show: true,
    prop: 'auto_max_amount'
  },
  quick_withdrawal: {
    type: 'input',
    label: '快捷银行提现金额',
    placeholder: '快捷银行提现金额设置',
    tip: '快捷银行提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'quick_withdrawal'
  },
  usdt_quick_withdrawal: {
    type: 'input',
    label: '快捷USDT提现金额',
    placeholder: '快捷usdt提现金额设置',
    tip: '快捷usdt提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop: 'usdt_quick_withdrawal'
  },
  test_withdraw: {
    type: 'radio',
    label: '测试号提现',
    placeholder: '测试号提现',
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
    prop: 'test_withdraw'
  },
}

const systemSetModel = {
  is_withdraw: "",
  saving_zero_withdrawal: 0,
  withdrawal_extra_status: 0,
  pay_passwd_verify: 0,
  paypasswd_phone_check: 0,
  withdraw_amcount: '',
  service_charge: '',
  usdt_charge: '',
  w_water: '',
  allow_not_recharge: 0,
  withdrawal_rules: '',
  free_type: '',
  free_poundage: '',
  withdrawal_status: '',
  bind_card_status: '',
  card_number: '',
  allow_not_withdrawal: 0,
  withdrawal_auto: '0',
  auto_withdrawal_pay_id: '',
  savings_multiple: 1,
  auto_max_amount: '',
  quick_withdrawal: '',
  usdt_quick_withdrawal: '',
  test_withdraw: '',
  auto_withdrawal_recharge_rate: 0,
  add_bank_verify: 0,
  withdraw_user_verify: 0,
}

const tranSetRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },
}
const systemBoxObj = reactive({
  systemSetModel,
  withdraw_notes: [],//提现备注
});

const systemSetBox = reactive({ systemSeting })
const systemSetChange = ({ value, index }) => {
  if (index == 'withdrawal_auto') {
    systemSetBox.systemSeting['savings_multiple'].show = value == 1 ? false : true;
    systemSetBox.systemSeting['auto_max_amount'].show = value == 1 ? false : true;
    systemSetBox.systemSeting['auto_withdrawal_pay_id'].show = value == 1 ? false : true;
    systemSetBox.systemSeting['auto_withdrawal_recharge_rate'].show = value == 1 ? false : true;
  }
  systemSetBox.systemSeting[index].value = value;
  systemBoxObj.systemSetModel[index] = value;
}

function assginMent(list, name, data, val) {
  for (const key in list) {
    if (key == 'withdrawal_auto') {
      systemSetBox.systemSeting['savings_multiple'].show = data[key] == 1 ? false : true;
      systemSetBox.systemSeting['auto_max_amount'].show = data[key] == 1 ? false : true;
      systemSetBox.systemSeting['auto_withdrawal_pay_id'].show = data[key] == 1 ? false : true;
      systemSetBox.systemSeting['auto_withdrawal_recharge_rate'].show = data[key] == 1 ? false : true;
    }
    systemBoxObj[name][key] = data[key];
    systemSetBox.systemSeting[key].value = data[key]
  }
}

function getSystemSetting() {
  systemEdit({ find: true }).then((res: any) => {
    if (res.code == 1) {
      systemBoxObj.withdraw_notes = res.data.withdraw_notes
      systemSetBox.systemSeting.auto_withdrawal_pay_id.options = [{ label: "无", value: 0 }].concat(
        res.data.pay_list
      );
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
      withdraw_notes: systemBoxObj.withdraw_notes,
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

const hanldeAdd = (val) => {
  systemBoxObj.withdraw_notes.push({ value: '' });
}
const handleDelete = (index, val) => {
  systemBoxObj.withdraw_notes.splice(index, 1);
}

//自定义备注

//添加
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
  w_remarks: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop: 'w_remarks',
  },
}
const remarkesDalogModel = reactive({
  id: '',
  w_remarks: '',
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
  userwithdrawalRemarkes(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      remarkesVisible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
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

</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"
      :list="listbox.list" />
    <el-dialog v-model="systemDialog" :title="$t('提现设置')" width="70%">
      <el-tabs type="border-card" class="systemFrom">
        <el-tab-pane :label="$t('参数设置')">
          <commForm title="保存" @save="settingSave" :dialogObj="systemBoxObj.systemSetModel"
            @currentChage="systemSetChange" :listRules="tranSetRules" :list="systemSetBox.systemSeting" />
        </el-tab-pane>
        <el-tab-pane :label="$t('快捷备注设置')">
          <el-form>
            <el-form-item :label="$t('提现备注')" label-width="110px">
              <div style="width:100%">
                <el-button class="input-item-btn" type="primary" :icon="Plus" @click="hanldeAdd(2)">{{ $t('添加')
                  }}</el-button>
                <div class="flex-fi input-item-box">
                  <div class="input-item" v-for="(item, index) in systemBoxObj.withdraw_notes" :key="index">
                    <el-input v-model="item.value">
                      <template #suffix>
                        <el-button type="danger" @click="handleDelete(index, 2)" :icon="Delete" circle />
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="settingSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component :is="defineAsyncComponent(() =>
        import('@/views/report/exportreports.vue')
      )
        " />
    </el-dialog>
    <commDialog :title="remarkesTitle" width="80%" @save="handleRemarkesSave" :dialogObj="remarkesDalogModel"
      @currentChage="handleRemarkesDialogChange" :listRules="RemarksListRules" :list="remarkesBox.remarkesDialogList"
      :visible="remarkesVisible" @close="remarkesVisible = false">
      <!-- <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input v-model="dialogModel.agent_id" clearable :placeholder="$t('用户/代理')" />
            <el-button style="margin-left: 20px" type="primary" @click="selectUser">{{ $t("选择用户") }}</el-button>
          </div>
          <div>{{ $t("限制某代理线下面用户才能参与") }}</div>
        </div>
      </template> -->
      <!-- <template v-slot:introduce>
        <component @chage="editorEle" :content="dialogModel.introduce"
          :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
      </template> -->
    </commDialog>
    <!---查看-->
    <el-dialog v-model="seeDialog" :title="$t('提现详情')" width="70%">
      <div class="seeBox">
        <!-- <div class="seeBox-title"><el-button type="primary" size="small" @click="copyAll">{{ $t('一键复制') }}</el-button></div> -->
        <div class="flex seeBox-box">
          <div class="seeBox-item">
            <div class="seeBox-item-t">
              <span>{{ $t('提现信息') }}</span>
            </div>
            <el-form disabled :model="seeBox1" class="demo-form-inline">
              <el-form-item label-width="120px" :label="$t(item.label)" v-for="item, index in seeBox1" :key="index">
                <el-input v-model="item.value" />
                <div v-if="item.tip">{{ $t(item.tip) }}</div>
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && orderInfo.channel == 0">
            <div class="seeBox-item-t">{{ $t('银行卡信息') }}</div>
            <el-form disabled :model="seeBox3" class="demo-form-inline">
              <el-form-item label-width="120px" :label="$t(item.label)" v-for="item, index in seeBox3" :key="index">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && orderInfo.channel == 1">
            <div class="seeBox-item-t">{{ $t('USDT信息') }}</div>
            <el-form disabled :model="seeBox2" class="demo-form-inline">
              <el-form-item label-width="120px" :label="$t(item.label)" v-for="item, index in seeBox2" :key="index">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && orderInfo.channel == 3">
            <div class="seeBox-item-t">{{ $t('PIX信息') }}</div>
            <el-form disabled :model="seeBox4" class="demo-form-inline">
              <el-form-item label-width="120px" :label="$t(item.label)" v-for="item, index in seeBox4" :key="index">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-form>
          </div>
          <div class="seeBox-item" v-if="orderInfo && orderInfo.channel == 2">
            <div class="seeBox-item-t">{{ $t('电子钱包') }}</div>
            <el-form disabled :model="seeBox5" class="demo-form-inline">
              <el-form-item label-width="120px" :label="$t(item.label)" v-for="item, index in seeBox5" :key="index">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-form>
          </div>

        </div>
        <div class="flex-fi seeBox-btm"
          v-if="cutrr_status == 1 || cutrr_status == 5 || cutrr_status == 6 || cutrr_status == -9">
          <el-form class="demo-form-inline">
            <el-form-item label-width="120px" :label="$t('用户信息')">
              <el-input disabled v-model="orderInfo.username" />
            </el-form-item>
            <el-form-item label-width="120px" v-if="cutrr_status == -9 && is_check">
              <p style="color: red;">*--再次审核需确认三方没有代付成功，否则可能会造成多次出款--*</p>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('状态')" v-if="is_check">
              <el-radio-group v-model="orderInfo.status">
                <el-radio size="large" :label="2">{{ $t('拒绝') }}</el-radio>
                <el-radio size="large" :label="6" v-if="cutrr_status != -9">{{ $t('正在处理中') }}</el-radio>
                <el-radio size="large" :label="3">{{ $t('通过') }}</el-radio>
                <el-radio size="large" :label="4">{{ $t('三方代付') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="orderInfo.channelCount > 0">
              <el-form-item v-show="orderInfo.status == 4" label-width="120px" :label="$t('选择渠道')">
                <el-select class="m-2" :placeholder="$t('选择渠道')" v-model="orderInfo.pay_id"
                  @change="changeChannel($event)">
                  <el-option v-for="(item, idx) in orderInfo.channel_list" :key="idx" :value="idx"
                    :label="`${item.pay_name}-${item.remarks}`" />
                </el-select>
              </el-form-item>
              <el-form-item
                v-show="orderInfo.status == 4 && (orderInfo.channel == 0 || orderInfo.channel == 3) && banks"
                label-width="120px" :label="$t('银行代码')">
                <el-select class="m-2" :placeholder="$t('银行代码')" v-model="orderInfo.bank_code" @change="change($event)"
                  filterable>
                  <el-option v-for="(item, idx) in banks" :key="idx" :value="item.bank_code"
                    :label="`${item.bank_name}-${item.bank_code}`" />
                </el-select>
              </el-form-item>
            </template>
            <el-form-item label-width="120px" :label="$t('快捷备注')">
              <el-select class="m-2" :placeholder="$t('请选择')" v-model="orderInfo.w_remarks" @change="change($event)">
                <el-option v-for="(text, idx) in orderInfo.w_remarks_arr" :key="idx" :value="text.value" />
              </el-select>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('备注')">
              <el-input type="textarea" :rows="3" :placeholder="$t('请输入内容')" v-model="orderInfo.w_remarks" />
            </el-form-item>
            <!-- <el-form-item label-width="120px" :label="$t('用户备注')">
              <el-input type="textarea" :rows="3" :placeholder="$t('请输入内容')" v-model="orderInfo.user_remarks" />
              <p style="color: red;">前台用户可见</p>
            </el-form-item> -->
            <el-form-item label-width="120px" v-if="is_check">
              <el-button type="primary" @click="reviewSave">{{ $t('保存') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="flex-fi seeBox-btm" v-else-if="orderInfo">
          <el-form disabled class="demo-form-inline">
            <el-form-item label-width="120px" :label="$t('操作者')">
              <div>{{ orderInfo.operator }}</div>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('审核时间')">
              <div>{{ orderInfo.update_time }}</div>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('三方渠道')">
              <div>{{ orderInfo.pay_type }}</div>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('用户信息')">
              <div>{{ orderInfo.username }}</div>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('状态')">
              <el-tag type="danger" v-if="orderInfo.status == 2">{{ $t('拒绝') }}</el-tag>
              <el-tag type="warning" v-if="orderInfo.status == 6">{{ $t('正在处理中') }}</el-tag>
              <el-tag type="success" v-if="orderInfo.status == 3">{{ $t('通过') }}</el-tag>
              <el-tag type="info" v-if="orderInfo.status == 4">{{ $t('三方代付') }}</el-tag>
            </el-form-item>
            <template v-if="orderInfo && orderInfo.channelCount > 0">
              <el-form-item v-show="orderInfo.status == 4" label-width="120px" :label="$t('选择渠道')">
                <el-select class="m-2" :placeholder="$t('选择渠道')" v-model="orderInfo.pay_id">
                  <el-option v-for="(item, idx) in orderInfo.channel_list" :key="idx" :value="idx"
                    :label="`${item.pay_name}-${item.remarks}`" />
                </el-select>
              </el-form-item>
            </template>
            <el-form-item label-width="120px" :label="$t('备注')">
              <div>{{ orderInfo.w_remarks }}</div>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('用户备注')">
              <div>{{ orderInfo.user_remarks }}</div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
    <div class=" line-box">
      <div class="flex-bc flex-fi">
        <el-button v-if="hasAuth('add')" type="primary" @click="manualRecharge">{{ $t('手动入单') }}</el-button>
        <el-button v-if="hasAuth('setting')" type="primary" @click="settingSystem">{{ $t('设置') }}</el-button>

        <div style="margin-right:20px;font-size: 14px;"
          v-if="countDataBox.countData.wallet.stay > 0 || countDataBox.countData.wallet.no > 0 || countDataBox.countData.wallet.yes > 0">
          {{ $t('电子钱包') }}：
          <el-tag type="warning" size="small">{{ $t('未审核') }}:{{ countDataBox.countData.wallet.stay }}</el-tag>
          <el-tag type="danger" size="small">{{ $t('未通过') }}:{{ countDataBox.countData.wallet.no }}</el-tag>
          <el-tag type="success" size="small">{{ $t('已通过') }}:{{ countDataBox.countData.wallet.yes }}</el-tag>
        </div>

      </div>
      <div class="flex-bc flex-fi" style="margin-top:10px;">
        <div style="margin-right:20px;font-size: 14px;"
          v-if="countDataBox.countData.bank.stay > 0 || countDataBox.countData.bank.no > 0 || countDataBox.countData.bank.yes > 0">
          {{ $t('银行卡') }}：
          <el-tag size="small" type="warning">{{ $t('未审核') }}:{{ countDataBox.countData.bank.stay }}</el-tag>
          <el-tag type="danger" size="small">{{ $t('未通过') }}:{{ countDataBox.countData.bank.no }}</el-tag>
          <el-tag type="success" size="small">{{ $t('已通过') }}:{{ countDataBox.countData.bank.yes }}</el-tag>
        </div>
        <!-- <el-tag  class="uidBtn" type="danger" @click="handleRemoveUid" v-if="pagination.uid!=''">当前是{{ pagination.uid }}用户页面，点击可清除</el-tag> -->
        <div style="margin-right:20px;font-size: 14px;"
          v-if="countDataBox.countData.usdt.stay > 0 || countDataBox.countData.usdt.no > 0 || countDataBox.countData.usdt.yes > 0">
          USDT：
          <el-tag size="small" type="warning">{{ $t('未审核') }}:{{ countDataBox.countData.usdt.stay }}</el-tag>
          <el-tag type="danger" size="small">{{ $t('未通过') }}:{{ countDataBox.countData.usdt.no }}</el-tag>
          <el-tag type="success" size="small">{{ $t('已通过') }}:{{ countDataBox.countData.usdt.yes }}</el-tag>
        </div>
        <div style="margin-right:20px;font-size: 14px;"
          v-if="countDataBox.countData.pix.stay > 0 || countDataBox.countData.pix.no > 0 || countDataBox.countData.pix.yes > 0">
          PIX：
          <el-tag size="small" type="warning">{{ $t('未审核') }}:{{ countDataBox.countData.pix.stay }}</el-tag>
          <el-tag type="danger" size="small">{{ $t('未通过') }}:{{ countDataBox.countData.pix.no }}</el-tag>
          <el-tag type="success" size="small">{{ $t('已通过') }}:{{ countDataBox.countData.pix.yes }}</el-tag>
        </div>
      </div>

    </div>
    <el-dialog width="80%" v-model="selectShow" title="选择">
      <div style="padding-bottom:30px;">
        <component :is="defineAsyncComponent(() => import('@/views/user/pages/list.vue'))" :back="true" :field="1"
          @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <commDialog title="手动出款" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules"
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

    <pure-table adaptive :data="tableData.dataList" width="100%" :columns="renderColumns">
      <template #status="{ row }">
        <el-tag type="warning" size="small" v-if="row.status == -9">{{ $t('失败审核') }}</el-tag>
        <el-tag type="warning" size="small" v-else-if="row.status == -2">{{ $t('已取消') }}</el-tag>
        <el-tag type="warning" size="small" v-else-if="row.status == -1">{{ $t('代付失败') }}</el-tag>
        <el-tag type="warning" size="small" v-else-if="row.status == 1">{{ $t('未审核') }}</el-tag>
        <el-tag type="danger" size="small" v-else-if="row.status == 2">{{ $t('未通过') }}</el-tag>
        <el-tag type="success" size="small" v-else-if="row.status == 3">{{ $t('已通过') }}</el-tag>
        <el-tag type="success" size="small" v-else-if="row.status == 4">{{ $t('手动入款') }}</el-tag>
        <el-tag type="info" size="small" v-else-if="row.status == 5">{{ $t('进行中') }}</el-tag>
        <el-tag type="warning" size="small" v-else-if="row.status == 6">{{ $t('正在处理中') }}</el-tag>
      </template>
      <template #lebal="{ row }">
        <el-tag size="small" type="success" plain v-if="row.lebal == 1">{{ $t('一般用户') }}</el-tag>
        <el-tag size="small" type="danger" plain v-if="row.lebal == 2">{{ $t('测试用户') }}</el-tag>
      </template>
      <template #eidt="{ row }">
        <template v-if="hasAuth('edit')">
          <el-button type="danger" size="small" v-if="row.status == 1 || row.status == 5 || row.status == 6"
            @click="hanldeSee(row)">{{ $t('审核') }}</el-button>
          <el-button type="danger" size="small" v-else-if="row.status == -9" @click="hanldeSee(row)">{{ $t('再次审核')
            }}</el-button>
        </template>
        <el-button type="primary" size="small" @click="hanldeSee(row, false)">{{ $t('查看') }}</el-button>
        <el-button type="primary" size="small" v-if="hasAuth('set_remarks')" @click="handleSetRemarkes(row)">{{
          $t('自定义备注')
          }}</el-button>
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

.seeBox {
  .seeBox-title {
    margin-bottom: 20px;
  }

  .seeBox-box {
    flex: 1;
    background-color: #eee;
    padding: 30px;
    padding-top: 20px;

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
      width: 50%;
    }

    .seeBox-item:last-child {
      margin-right: 0px;
    }
  }

  .seeBox-btm {
    margin-top: 20px;

    .btm-text {
      color: #000;
      margin-right: 10px;
    }
  }
}

.input-item {
  width: 50%;
  margin-bottom: 15px;
  margin-right: 15px;
}

.input-item-box {
  flex-wrap: wrap;
}

.input-item-btn {
  margin-bottom: 30px;
}

.line-box {
  margin-bottom: 15px;
}

.systemFrom ::v-deep .el-form-item__content>div {
  width: 80%;
}
</style>