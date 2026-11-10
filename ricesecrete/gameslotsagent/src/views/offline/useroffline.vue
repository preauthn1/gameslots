<script setup lang="tsx">
import { reactive, ref, computed } from 'vue';
import { message } from "@/utils/message";
import { useroffline,userofflineCount,userofflinePayChannel } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { http } from '@/utils/http';
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
    width:100,
    cellRenderer: ({ row }) => (
      <>
        <div >
          <el-tag type="info" v-show={row.first==0}>{transformI18n("无效")}</el-tag>
          <el-tag type="success" v-show={row.first==1}>{transformI18n("首充")}</el-tag>
          <el-tag type="info" v-show={row.first > 1}>{transformI18n("复充")}</el-tag>
        </div>
      </>
    )
  },
  {
    label: transformI18n("用户信息"),
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
        <div>
          {transformI18n("会员备注")}:{ row.remark }
        </div>
      </>
    )
  },
  {
    label: transformI18n("代理"),
    prop: "rec_id",
    width:200,
    cellRenderer: ({ row }) => (
      <>
        <div v-show={row.rec_top_user}>
          {transformI18n("总代")}: { row.rec_top_user}
        </div>
        <div v-show={row.rec_top_user}>
          {transformI18n("上级")}: { row.rec_user}
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
    label: transformI18n("备注"),
    prop: "set_content",
    width: 150
  }
];


//以下是搜索框的数据
const list = {
  date: {
    type: 'time',
    placeholder: '时间',
    prop: 'date',
    idx: 1,
    value: (): Array<string> => {
      return []
    }
  },
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    idx: 2,
    prop: 'username'
  },
  recharge_type: {
    type: 'select',
    placeholder: '充值类型',
    value: '',
    idx: 3,
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
  order_id: {
    type: 'input',
    placeholder: '订单ID',
    value: '',
    idx: 4,
    prop: 'order_id'
  },
  order_sn: {
    type: 'input',
    placeholder: '订单号',
    value: '',
    idx: 5,
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
  channel: {
    type: 'select',
    placeholder: '数据来源',
    value: '',
    prop: 'channel',
    idx: 7,
    options: [
      {
        label: '银行转账',
        value: 1,
      }, {
        label: '线上渠道',
        value: 2,
      }, {
        label: 'USDT渠道',
        value: 3,
      }, {
        label: 'USDT转账',
        value: 4,
      }, {
        label: '银商',
        value: 5,
      },
    ]
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
  // },
  // export: {
  //   type: 'button',
  //   value: '导出',
  //   handle: 'export',
  //   prop: 'export',
  //   idx: 18
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
  level_id:'',
  recharge_type:'',
  pay_type:'',
  time_type:'',
  date: '',//时间
  min_price: '',
  max_price: '',
  channel:'',
  status:'',
  three_order_sn:'',
  order_sn: '',
  order_id: '',
  agent_name: '',
  username:'',
  bankcrad: '',
  uid:uid
});
const countDataBox: any = ref({})
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
        pagination[key] =  time;
      } else if (key == 'pay_type' && list[key].value) {
        pagination[key] = channelDataBox.channelData[list[key].value].id
      } else {
        pagination[key] = list[key].value
      }

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
  useroffline(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    listbox.list.level_id.options = res.user_level
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
  http.post('/user_offline/excel', {data: pagination}).then((res:any)=>{
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



//弹框写法
const visible = ref(false);
const dialogList = {
  username:{
    type: 'slot',
    label: '用户',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    name:'username',
    prop:'username'
  },
  price:{
    type: 'input',
    label: '入单金额',
    placeholder: '入单金额',
    value: '',
    prop:'price'
  },
  mx_msg:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    tip:'注：入单备注',
    value: '',
    prop:'mx_msg'
  },
  pay_index:{
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
    prop:'pay_index'
  },
}
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
    payList.forEach((item,index)=> {
      payArr.push({
        label: item.t_name + '-'
          + (item.p_type == 'online' ? item.pay_name : item.bank_name)
        + (item.remarks ? '('+item.remarks+')' : ''),
        value: index
      })
    })
    dialogList.pay_index.options = payArr;
    listbox.list.pay_type.options = payArr;
  })
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
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list" :isAutoUpdate="true"/>
    <div class=" line-box">
      <div class="flex-bc flex-fi" />
      <div class="flex-bc flex-fi" >
        <div style="margin-right:20px;font-size: 14px;" v-for="row,idx in countDataBox" :key="idx">
          {{ $t(row.title) }}:
          <el-tag size="large">{{ $t('已通过') }}:{{ row.yes }}</el-tag>
          <el-tag size="large">{{ $t('笔数') }}:{{ row.count }}</el-tag>
          <el-tag size="large">{{ $t('人数') }}:{{ row.people }}</el-tag>
          <el-tag type="warning" size="large">{{ $t('未审核') }}:{{ row.stay }}</el-tag>
          <el-tag type="danger" size="large">{{ $t('未通过') }}:{{ row.no }}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
       <template #content="{ row }">
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
<style scoped lang="scss">
.el-tag {
  margin-right: 5px;
}
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
.user-box{
  width:100%;
}
.seeBox{
  .seeBox-title{
    margin-bottom: 20px;
  }
  .seeBox-box{
    background-color: #eee;
    padding:30px;
    .seeBox-item-t{
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      height: 50px;
      line-height: 50px;
    }
    .seeBox-item{
      margin-right: 30px;
      background-color: #fff;
      padding:20px;
      padding-top:0px;
    }
  }
  .seeBox-btm{
    padding: 15px 0;
    .btm-text{
      color: #000;
      margin-right: 10px;
    }
  }
}
</style>
