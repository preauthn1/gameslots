<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, computed } from 'vue';
import { timeCycle } from '@/utils/global'
import { message } from "@/utils/message";
import { userWithdrawalList, userwithdrawalAdd, userwithdrawalCount, userwithdrawalEdit, userwithdrawalEdit2, userofflinePayChannel } from "@/api/user";
// import { useRoute, useRouter } from "vue-router";
// import { getUid, removeUid } from "@/utils/route";
import { forEach } from 'lodash-unified';
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
// const route = useRoute();
// const router = useRouter();
defineOptions({
  name: 'userwithdrawal'
})
const columns = [
  {
    label: transformI18n("订单"),
    prop: "id",
    width: 50,
  },
  {
    label: transformI18n("订单号"),
    width: 160,
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
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
        {/* <div>
          {transformI18n("标签")}:
          <el-tag class="ml-[3px]" type="success" effect="plain" v-show={row.lebal == 1}>{ transformI18n('会员') }</el-tag>
          <el-tag class="ml-[3px]" type="danger" effect="plain" v-show={row.lebal == 2}>{transformI18n('测试')}</el-tag>
          {
            row.tags.map(item => {
              return <el-tag class="ml-[3px]" size="small" color={item.color} style={item.color ? 'color:#FFF' : ''} type={item.color ? '' : 'success'}>{ transformI18n(item.name) }</el-tag>
            })
          }
        </div> */}
        <div>
          {transformI18n("会员备注")}:{row.remark}
        </div>
      </>
    )
  },
  {
    label: transformI18n("首提/复提"),
    prop: "first",
    width: 90,
    cellRenderer: ({ row }) => (
      <>
        <div >
          <el-tag type="info" v-show={row.first==0}>{transformI18n("无效")}</el-tag>
          <el-tag type="success" v-show={row.first == 1}>{transformI18n("首提")}</el-tag>
          <el-tag type="info" v-show={row.first > 1}>{transformI18n("复提")}</el-tag>
        </div>
      </>
    )
  },
  {
    label: transformI18n("代理"),
    prop: "rec_id",
    width: 150,
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
    width: 100,
    prop: "w_price",
  },
  {
    label: transformI18n("实际金"),
    prop: "arrival_prices",
    width: 100,
  }, {
    label: transformI18n("币种|充值汇率|到账金额"),
    width: 180,
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
    width: 100
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
    prop: "set_content",
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
  date: {
    type: 'time',
    placeholder: '时间',
    idx: 0,
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    idx: 1,
    prop: 'username'
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
    idx: 5,
    prop: 'status',
    options: [
      {
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
    idx: 6,
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
    idx: 7,
    prop: 'lebals',
    options: []
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
  withdrawal_type: '',//提现类型
  time_type: '',
  date: '',//时间
  min_price: '',
  max_price: '',
  channel: '',
  status: '',
  order_sn: '',
  order_id: '',
  agent_name: '',
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
      window.location.href = res.data;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
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
    // console.log(res.data);
    const seeList = res.data;
    orderInfo.value = res.data;
    console.log(orderInfo.value);
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
const hanldeSee = (row) => {
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
    label: '开户行',
    prop: 'bank_hm'
  },
  bank_open: {
    value: '',
    label: '开户行',
    prop: 'bank_open'
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
  console.log(orderInfo.value)
  const data = {
    id: orderInfo.value.id,
    status: orderInfo.value.status,
    pay_id: orderInfo.value.pay_id,
    bank_code: orderInfo.value.bank_code,
    w_remarks: orderInfo.value.w_remarks,
    user_remarks: orderInfo.value.user_remarks
  }
  userwithdrawalEdit2(data).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      seeDialog.value = false;
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
  console.log($event)
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
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange" :list="listbox.list"
      :isAutoUpdate="true" />
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
        <div class="flex-fi seeBox-btm" v-if="cutrr_status == 1 || cutrr_status == 5 || cutrr_status == 6">
          <el-form class="demo-form-inline">
            <el-form-item label-width="120px" :label="$t('用户信息')">
              <el-input disabled v-model="orderInfo.username" />
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('状态')">
              <el-radio-group v-model="orderInfo.status">
                <el-radio size="large" :label="2">{{ $t('拒绝') }}</el-radio>
                <el-radio size="large" :label="6">{{ $t('正在处理中') }}</el-radio>
                  <!-- <el-radio size="large" :label="3">{{ $t('通过') }}</el-radio>
                  <el-radio size="large" :label="4">{{ $t('三方代付') }}</el-radio> -->
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
              <el-form-item v-show="orderInfo.status == 4 && orderInfo.channel == 0 && banks" label-width="120px"
                :label="$t('银行代码')">
                <el-select class="m-2" :placeholder="$t('银行代码')" v-model="orderInfo.bank_code" @change="change($event)">
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
            <el-form-item label-width="120px">
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
            <el-form-item label-width="120px" :label="$t('用户信息')">
              <div>{{ orderInfo.username }}</div>
            </el-form-item>
            <el-form-item label-width="120px" :label="$t('状态')">
              <el-tag type="danger" v-if="orderInfo.status == 2">{{ $t('拒绝') }}</el-tag>
              <el-tag type="warning" v-if="orderInfo.status == 6">{{ $t('正在处理中') }}</el-tag>
                <!-- <el-tag type="success" v-if="orderInfo.status == 3">{{ $t('通过') }}</el-tag>
                <el-tag type="info" v-if="orderInfo.status == 4">{{ $t('三方代付') }}</el-tag> -->
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
          </el-form>
        </div>
      </div>
    </el-dialog>
    <div class=" line-box">
      <div class="flex-bc flex-fi">
        <el-button v-if="hasAuth('add')" type="primary" @click="manualRecharge">{{ $t('手动入单') }}</el-button>
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
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #status="{ row }">
        <el-tag type="warning" size="small" v-if="row.status == -2">{{ $t('已取消') }}</el-tag>
        <el-tag type="warning" size="small" v-if="row.status == -1">{{ $t('代付失败') }}</el-tag>
        <el-tag type="warning" size="small" v-if="row.status == 1">{{ $t('未审核') }}</el-tag>
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
        <!-- <template > -->
        <!-- <el-button type="danger" size="small" v-if="row.status == 1 || row.status == 6" @click="hanldeSee(row)">{{ $t('审核') }}</el-button> -->
        <el-button type="primary" size="small" @click="hanldeSee(row)">{{ $t('查看') + "/" + $t('审核') }}</el-button>
        <!-- </template>
  <el-button type="primary" size="small" v-else-if="row.status == 3 || row.status == 4" @click="hanldeSee(row)">{{
    $t('查看') }}</el-button> -->
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
</style>
