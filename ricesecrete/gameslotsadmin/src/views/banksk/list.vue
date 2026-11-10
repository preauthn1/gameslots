<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { bankSkList,bankSkEdit,bankSkAdd,bankSkDelete,bankSkBankSkSet } from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import commForm from '@/components/comm/comm-form.vue'
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { formaTime } from '@/utils/global'
import { forEach } from 'lodash-unified';
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
// @ts-ignore
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'bankskList'
})
const columns1 = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("添加时间"),
    prop: "add_time",
    width: 150,
  },
  {
    label: transformI18n("货币"),
    prop: "country_code",
    width: 150,
  },
   {
    label: transformI18n("图标"),
    slot: "icon",
  },
  {
    label: transformI18n("充值汇率"),
    prop: "currency_recharge_rate",
    width: 150,
  },
  {
    label: transformI18n("银行名称"),
    prop: "bank_name",
    width: 150,
  },
  {
    label: transformI18n("银行账号"),
    prop: "bank_number",
    width: 150,
  },
  {
    label: transformI18n("开户者姓名"),
    prop: "bank_khm",
    width: 150,
  },
  {
    label: transformI18n("开户支行"),
    prop: "bank_open",
    width: 150,
  },
  {
    label: transformI18n("代理线"),
    prop: "financial",
    width: 150,
  },
  {
    label: transformI18n("等级限制"),
    slot: "start_level_id",
    width: 150,
  },
  {
    label: transformI18n("备注"),
    prop: "bank_remarks",
    width: 150,
  },
  {
    label: transformI18n("排序"),
    prop: "bank_sort",
    width: 150,
  },
  {
    label: transformI18n("状态"),
    slot: "bank_status",
    width: 150,
  },
  {
    label: transformI18n("通用渠道"),
    slot: "is_all",
    width: 150,
  },
  {
    label: transformI18n("热门状态"),
    slot: "is_hot",
    width: 150,
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: 120,
    slot:'right'
  }
];
const columns2 = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
   {
    label: transformI18n("添加时间"),
    prop: "add_time",
    width: 150,
  },{
    label: transformI18n("货币"),
    prop: "country_code",
    width: 150,
  }, {
    label: transformI18n("图标"),
    slot: "icon",
  }, {
    label: transformI18n("充值汇率"),
    prop: "currency_recharge_rate",
    width: 150,
  },{
    label: transformI18n("链名称"),
    prop: "bank_name",
    width: 150,
  },{
    label: transformI18n("收币地址"),
    prop: "bank_number",
    width: 150,
  },{
    label: transformI18n("收币二维码"),
    slot: "bank_qrcode",
    width: 150,
  },{
    label: transformI18n("代理线"),
    prop: "agent_name",
    width: 150,
  },{
    label: transformI18n("等级限制"),
    slot: "start_level_id",
    width: 150,
  },{
    label: transformI18n("排序"),
    prop: "bank_sort",
    width: 150,
  },{
    label: transformI18n("备注"),
    prop: "bank_remarks",
    width: 150,
  },{
    label: transformI18n("状态"),
    slot: "bank_status",
    width: 150,
  },{
    label: transformI18n("操作"),
    slot:'right',
    fixed:'right',
    width: 120,
  },



]
const columns3 = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("添加时间"),
    prop: "add_time",
    width: 150,
  },{
    label: transformI18n("货币"),
    prop: "country_code",
    width: 150,
  }, {
    label: transformI18n("图标"),
    slot: "icon",
  },{
    label: transformI18n("充值汇率"),
    prop: "currency_recharge_rate",
    width: 150,
  }, {
    label: transformI18n("名称"),
    prop: "bank_name",
    width: 150,
  }, {
    label: transformI18n("收款账号"),
    prop: "bank_number",
    width: 150,
  }, {
    label: transformI18n("收款二维码"),
    slot: "bank_qrcode",
    width: 150,
  }, {
    label: transformI18n("代理线"),
    prop: "agent_name",
    width: 150,
  }, {
    label: transformI18n("等级限制"),
    slot: "start_level_id",
    width: 150,
  }, {
    label: transformI18n("排序"),
    prop: "bank_sort",
    width: 150,
  }, {
    label: transformI18n("备注"),
    prop: "bank_remarks",
    width: 150,
  }, {
    label: transformI18n("状态"),
    slot: "bank_status",
    width: 150,
  }, {
    label: transformI18n("通用渠道"),
    prop: "is_all",
    width: 150,
  },{
    label: transformI18n("操作"),
    slot:'right',
    fixed:'right',
    width: 120,
  },
]
const columns4 = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("添加时间"),
    prop: "add_time",
    width: 150,
  },{
    label: transformI18n("货币"),
    prop: "country_code",
    width: 150,
  }, {
    label: transformI18n("图标"),
    slot: "icon",
  },{
    label: transformI18n("充值汇率"),
    prop: "currency_recharge_rate",
    width: 150,
  }, {
    label: transformI18n("类型"),
    prop: "bank_name",
    width: 150,
  }, {
    label: transformI18n("账号"),
    prop: "bank_number",
    width: 150,
  }, {
    label: transformI18n("姓名"),
    prop: "bank_khm",
    width: 150,
  }, {
    label: transformI18n("税号"),
    prop: "financial",
    width: 150,
  },  {
    label: transformI18n("代理线"),
    prop: "agent_name",
    width: 150,
  }, {
    label: transformI18n("等级限制"),
    slot: "start_level_id",
    width: 150,
  }, {
    label: transformI18n("排序"),
    prop: "bank_sort",
    width: 150,
  }, {
    label: transformI18n("备注"),
    prop: "bank_remarks",
    width: 150,
  }, {
    label: transformI18n("状态"),
    slot: "bank_status",
    width: 150,
  }, {
    label: transformI18n("通用渠道"),
    slot: "is_all",
    width: 150,
  },{
    label: transformI18n("操作"),
    slot:'right',
    fixed:'right',
    width: 120,
  },
]
const height = window.innerHeight - 260;
//搜索的数据



const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  type:0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据





 //银行卡



//弹框写法
const visible = ref(false);
//银行卡
const bankDialog = {
  pay_types:{
    type: 'select',
    label: '支付类型',
    placeholder: '支付类型',
    value: '',
    options:[],
    prop:'pay_types'
  },
  currency_id:{
    type: 'select',
    label: '货币',
    placeholder: '货币',
    value: '',
    options:[],
    prop:'name'
  },
  icon: {
    type: 'slot',
    name: 'icon_upload',
    label: '图标',
    prop: 'icon',
    value: '',
  },
  bank_name:{
    type: 'input',
    label: '银行名称',
    placeholder: '银行名称',
    value: '',
    prop:'bank_name'
  },
  bank_number:{
    type: 'input',
    label: '银行卡号',
    placeholder: '银行卡号',
    value: '',
    prop:'bank_number'
  },
   bank_khm:{
    type: 'input',
    label: '开户者姓名',
    placeholder: '开户者姓名',
    value: '',
    prop:'bank_khm'
  },
  bank_open:{
    type: 'input',
    label: '开户支行',
    placeholder: '开户支行',
    value: '',
    prop:'bank_open'
  },
  //  financial:{
  //   type: 'input',
  //   label: '金融编码',
  //   placeholder: '金融编码',
  //   value: '',
  //   prop:'financial'
  // },
  agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
  },
  new_user:{
    type: 'radio',
    label: '新老用户',
    placeholder: '新老用户',
    value: 0,
    tip:'新用户：指未充值成功过的用户，老用户：指已充值过的用户',
    options: [
      {
        label: 0,
        name:'不限制'
      }, {
        label: 1,
        name:'新用户'
      }, {
        label: 2,
        name:'老用户'
      },
    ],
    prop:'new_user'
  },
  is_all:{
    type: 'radio',
    label: '通用渠道',
    placeholder: '通用渠道',
    value: 1,
    options: [
       {
        label: 1,
        name:'是'
      }, {
        label: 2,
        name:'否'
      },
    ],
    prop:'is_all'
  },
  is_hot:{
    type: 'radio',
    label: '开启热门',
    placeholder: '开启热门',
    value: 1,
    options: [
       {
        label: 1,
        name:'开启'
      }, {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'is_hot'
  },
  start_level_id:{
    type: 'select',
    label: '开始等级',
    placeholder: '开始等级',
    value: 0,
    options:[ {label:'不限制',value:0}],
    prop:'start_level_id'
  },
  end_level_id:{
    type: 'select',
    label: '结束等级',
    placeholder: '结束等级',
    value: 0,
    options:[
      {label:'不限制',value:0}
    ],
    prop:'end_level_id'
  },
  min_amcount:{
    type: 'input',
    label: '最低充值',
    placeholder: '最低充值',
    value: '',
    prop:'min_amcount'
  },
  max_amcount:{
    type: 'input',
    label: '最高充值',
    placeholder: '最高充值',
    value: '',
    prop:'max_amcount'
  },
  bank_sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop:'bank_sort'
  },
  bank_status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
       {
        label: 0,
        name:'禁用'
      }, {
        label: 1,
        name:'启用'
      },
    ],
    prop:'bank_status'
  },
  bank_remarks:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop:'bank_remarks'
  },
}
const bankModel={
  pay_types:'',
  currency_id:'',
  icon:'',
  bank_name:'',
  bank_number:'',
  bank_khm:'',
  bank_open:'',
  agent_id:'',
  new_user:0,
  is_all:0,
  is_hot:0,
  start_level_id:0,
  end_level_id:0,
  min_amcount:'',
  max_amcount:'',
  bank_sort:0,
  bank_remarks:'',
  bank_status: 1,
  type: 0,
  pay_rebate:[],
}
//USDT
const usdtDialog={
  pay_types:{
    type: 'select',
    label: '支付类型',
    placeholder: '支付类型',
    value: '',
    options:[],
    prop:'pay_types'
  },
  currency_id:{
    type: 'select',
    label: '货币',
    placeholder: '货币',
    value: '',
    options:[],
    prop:'name'
  },
  bank_name:{
    type: 'select',
    label: '链接名称',
    placeholder: '链接名称',
    value: '',
    options:[],
    prop:'bank_name'
  },
  bank_number:{
    type: 'input',
    label: '收币地址',
    placeholder: '收币地址',
    value: '',
    prop:'bank_number'
  },
   bank_qrcode: {
    type: 'slot',
    name: 'upload',
    label: '收币二维码',
    prop: 'bank_qrcode',
    value: '',
  },
   icon: {
    type: 'slot',
    name: 'icon_upload',
    label: '图标',
    prop: 'icon',
    value: '',
  },
  agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
  },
   new_user:{
    type: 'radio',
    label: '新老用户',
    placeholder: '新老用户',
    value: 0,
    tip:'新用户：指未充值成功过的用户，老用户：指已充值过的用户',
    options: [
      {
        label: 0,
        name:'不限制'
      }, {
        label: 1,
        name:'新用户'
      }, {
        label: 2,
        name:'老用户'
      },
    ],
    prop:'new_user'
  },
  is_all:{
    type: 'radio',
    label: '通用渠道',
    placeholder: '通用渠道',
    value: 1,
    options: [
       {
        label: 1,
        name:'是'
      }, {
        label: 2,
        name:'否'
      },
    ],
    prop:'is_all'
  },
  start_level_id:{
    type: 'select',
    label: '开始等级',
    placeholder: '开始等级',
    value: 0,
    options:[ {label:'不限制',value:0}],
    prop:'start_level_id'
  },
  end_level_id:{
    type: 'select',
    label: '结束等级',
    placeholder: '结束等级',
    value: 0,
    options:[
      {label:'不限制',value:0}
    ],
    prop:'end_level_id'
  },
  min_amcount:{
    type: 'input',
    label: '最低充值',
    placeholder: '最低充值',
    value: '',
    prop:'min_amcount'
  },
  max_amcount:{
    type: 'input',
    label: '最高充值',
    placeholder: '最高充值',
    value: '',
    prop:'max_amcount'
  },
  bank_sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop:'bank_sort'
  },
  bank_status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
       {
        label: 0,
        name:'禁用'
      }, {
        label: 1,
        name:'启用'
      },
    ],
    prop:'bank_status'
  },
  bank_remarks:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop:'bank_remarks'
  },
}
const usdtModel={
  pay_types:'',
  bank_number:'',
  bank_qrcode:'',
  agent_id:'',
  new_user:0,
  is_all:0,
  start_level_id:0,
  end_level_id:0,
  min_amcount:'',
  icon:'',
  max_amcount:'',
  bank_sort:0,
  bank_remarks:'',
  bank_status: 1,
  type: 1,
  pay_rebate:[{ min: "", max: "", proportion: '' }],

}

//钱包
const walletDialog={
  pay_types:{
    type: 'select',
    label: '支付类型',
    placeholder: '支付类型',
    value: '',
    options:[],
    prop:'pay_types'
  },
  currency_id:{
    type: 'select',
    label: '货币',
    placeholder: '货币',
    value: '',
    options:[],
    prop:'name'
  },
  bank_name:{
    type: 'select',
    label: '名称',
    placeholder: '名称',
    value: '',
    options:[],
    prop:'bank_name'
  },
  bank_number:{
    type: 'input',
    label: '收款地址',
    placeholder: '收款地址',
    value: '',
    prop:'bank_number'
  },
   bank_qrcode: {
    type: 'slot',
    name: 'upload',
    label: '收币二维码',
    prop: 'bank_qrcode',
    value: '',
  },
  icon: {
    type: 'slot',
    name: 'icon_upload',
    label: '图标',
    prop: 'icon',
    value: '',
  },
  agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
  },
   new_user:{
    type: 'radio',
    label: '新老用户',
    placeholder: '新老用户',
    value: 0,
    tip:'新用户：指未充值成功过的用户，老用户：指已充值过的用户',
    options: [
      {
        label: 0,
        name:'不限制'
      }, {
        label: 1,
        name:'新用户'
      }, {
        label: 2,
        name:'老用户'
      },
    ],
    prop:'new_user'
  },
  is_all:{
    type: 'radio',
    label: '通用渠道',
    placeholder: '通用渠道',
    value: 1,
    options: [
       {
        label: 1,
        name:'是'
      }, {
        label: 2,
        name:'否'
      },
    ],
    prop:'is_all'
  },
  start_level_id:{
    type: 'select',
    label: '开始等级',
    placeholder: '开始等级',
    value: 0,
    options:[ {label:'不限制',value:0}],
    prop:'start_level_id'
  },
  end_level_id:{
    type: 'select',
    label: '结束等级',
    placeholder: '结束等级',
    value: 0,
    options:[
      {label:'不限制',value:0}
    ],
    prop:'end_level_id'
  },
  min_amcount:{
    type: 'input',
    label: '最低充值',
    placeholder: '最低充值',
    value: '',
    prop:'min_amcount'
  },
  max_amcount:{
    type: 'input',
    label: '最高充值',
    placeholder: '最高充值',
    value: '',
    prop:'max_amcount'
  },
  bank_sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop:'bank_sort'
  },
  bank_status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
       {
        label: 0,
        name:'禁用'
      }, {
        label: 1,
        name:'启用'
      },
    ],
    prop:'bank_status'
  },
  bank_remarks:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop:'bank_remarks'
  },
}
const walletModel={
  pay_types:'',
  bank_number:'',
  bank_qrcode:'',
  agent_id:'',
  new_user:0,
  is_all:0,
  start_level_id:0,
  end_level_id:0,
  min_amcount:'',
  icon:'',
  max_amcount:'',
  bank_sort:0,
  bank_remarks:'',
  bank_status: 1,
  pay_rebate:[{ min: "", max: "", proportion: '' }],

}
//pix
const pixDialog={
  pay_types:{
    type: 'select',
    label: '支付类型',
    placeholder: '支付类型',
    value: '',
    options:[],
    prop:'pay_types'
  },
   currency_id:{
    type: 'select',
    label: '货币',
    placeholder: '货币',
    value: '',
    options:[],
    prop:'name'
  },
  icon: {
    type: 'slot',
    name: 'icon_upload',
    label: '图标',
    prop: 'icon',
    value: '',
  },
  pix_type:{
    type: 'select',
    label: '类型',
    placeholder: '类型',
    value: '',
    options:[],
    prop:'pix_type'
  },
  bank_number:{
    type: 'input',
    label: '账号',
    placeholder: '账号',
    value: '',
    prop:'bank_number'
  },
   bank_khm:{
    type: 'input',
    label: '姓名',
    placeholder: '姓名',
    value: '',
    prop:'bank_khm'
  },
  financial:{
    type: 'input',
    label: '税号',
    placeholder: '税号',
    value: '',
    prop:'financial'
  },
   agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
  },
   new_user:{
    type: 'radio',
    label: '新老用户',
    placeholder: '新老用户',
    value: 0,
    tip:'新用户：指未充值成功过的用户，老用户：指已充值过的用户',
    options: [
      {
        label: 0,
        name:'不限制'
      }, {
        label: 1,
        name:'新用户'
      }, {
        label: 2,
        name:'老用户'
      },
    ],
    prop:'new_user'
  },
  is_all:{
    type: 'radio',
    label: '通用渠道',
    placeholder: '通用渠道',
    value: 1,
    options: [
       {
        label: 1,
        name:'是'
      }, {
        label: 2,
        name:'否'
      },
    ],
    prop:'is_all'
  },
  start_level_id:{
    type: 'select',
    label: '开始等级',
    placeholder: '开始等级',
    value: 0,
    options:[ {label:'不限制',value:0}],
    prop:'start_level_id'
  },
  end_level_id:{
    type: 'select',
    label: '结束等级',
    placeholder: '结束等级',
    value: 0,
    options:[
      {label:'不限制',value:0}
    ],
    prop:'end_level_id'
  },
  min_amcount:{
    type: 'input',
    label: '最低充值',
    placeholder: '最低充值',
    value: '',
    prop:'min_amcount'
  },
  max_amcount:{
    type: 'input',
    label: '最高充值',
    placeholder: '最高充值',
    value: '',
    prop:'max_amcount'
  },
  bank_sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop:'bank_sort'
  },
  bank_status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
       {
        label: 0,
        name:'禁用'
      }, {
        label: 1,
        name:'启用'
      },
    ],
    prop:'bank_status'
  },
  bank_remarks:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop:'bank_remarks'
  },
}
const pixModel={
  pay_types:'',
  currency_id:'',
  icon:'',
  pix_type:'',
  bank_number:'',
  bank_khm:'',
  financial:'',
  agent_id:'',
  new_user:0,
  is_all:0,
  start_level_id:0,
  end_level_id:0,
  min_amcount:'',
  max_amcount:'',
  bank_sort:0,
  bank_remarks:'',
  bank_status: 1,
  pay_rebate:[{ min: "", max: "", proportion: '' }],
}
const dialogList:any =bankDialog
const dialogModel:any =bankModel
const dialogModelBox = reactive({
  dialogModel
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })

init();
function init(query?: object) {
  bankSkList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    const ordinary_data = res.currency.ordinary_data
    const usdt_data = res.currency.usdt_data
    const usdtArr =[];
    let bank_name_arr=[]
    usdt_data.forEach(item => {
      usdtArr.push({label:item.country_code+'-' + transformI18n('充值汇率') + ':'+item.recharge_rate,value:item.id})
      bank_name_arr = item.link_name
    });
    const otherArr=[]
    ordinary_data.forEach(item => {
      otherArr.push({label:item.country_code+'-' + transformI18n('充值汇率') +':'+item.recharge_rate,value:item.id})
    })
    const vip = res.vip
    const vipArr = []
    vip.forEach(item=>{
      vipArr.push({label:item.level_name,value:item.id})
    })
    const pay_type = res.pay_types
    const pay_typeArr = []
    pay_type.forEach(item=>{
      pay_typeArr.push({label:item.name,value:item.id})
    })

    const pix_type = res.pix_type;
    const pixArr = []
    for(const k in pix_type){
      pixArr.push({label:k,value:pix_type[k]})
    }

    const usdtName =[]
    for(let i=0;i<bank_name_arr.length;i++){
      usdtName.push({label:bank_name_arr[i],value:bank_name_arr[i]})
    }
    usdtDialog.bank_name.options = usdtName;
    usdtDialog.pay_types.options = pay_typeArr

    bankDialog.currency_id.options =otherArr
    bankDialog.pay_types.options = pay_typeArr
    walletDialog.currency_id.options =otherArr
    walletDialog.pay_types.options = pay_typeArr
    pixDialog.currency_id.options =otherArr

    usdtDialog.currency_id.options = usdtArr
    pixDialog.pay_types.options = pay_typeArr
    pixDialog.pix_type.options = pixArr


    bankDialog.start_level_id.options =[{label:'不限制',value:0},...vipArr]
    bankDialog.end_level_id.options = [{label:'不限制',value:0},...vipArr]
    usdtDialog.start_level_id.options =[{label:'不限制',value:0},...vipArr]
    usdtDialog.end_level_id.options = [{label:'不限制',value:0},...vipArr]
    walletDialog.start_level_id.options =[{label:'不限制',value:0},...vipArr]
    walletDialog.end_level_id.options = [{label:'不限制',value:0},...vipArr]
    pixDialog.start_level_id.options =[{label:'不限制',value:0},...vipArr]
    pixDialog.end_level_id.options = [{label:'不限制',value:0},...vipArr]
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

const handleTab = (val) => {
    // list2Box.dialogList = {}
    // dialogModelBox.dialogModel = {}
    dialogModel['type'] = 0;
    if(val == 0){
        dialogModelBox.dialogModel = bankModel
        list2Box.dialogList = bankDialog
        noticeTitle.value = '银行卡参数设置'
    }else if(val == 1){
        list2Box.dialogList = usdtDialog
        dialogModelBox.dialogModel = usdtModel
        dialogModel['type'] = 1;
         noticeTitle.value = 'USDT参数设置'
    }else if(val ==2){
        list2Box.dialogList = walletDialog
        dialogModelBox.dialogModel = walletModel
        noticeTitle.value = '钱包参数设置'
    }else{
       dialogModelBox.dialogModel = pixModel
        list2Box.dialogList = pixDialog
        noticeTitle.value = 'PIX参数设置'
    }
    pagination.type = val
    init();
 }

const handleDialogChange = ({ value, index }) => {

      list2Box.dialogList[index].value = value;
      dialogModelBox.dialogModel[index] = value;
      dialogModel[index] = value;
}
const clickIndex = ref(1);
const eidtId = ref('');
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  bankSkEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in list2Box.dialogList) {
          list2Box.dialogList[key].value = res.data[key]
          dialogModelBox.dialogModel[key] = res.data[key]
          dialogModel[key] = res.data[key]
       }
      dialogModelBox.dialogModel.pay_rebate = res.data.pay_rebate
      // dialogModel.pay_rebate = res.data.pay_rebate
      eidtId.value = res.data.id;
      visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}


const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: {
        ...dialogModel,
        id:eidtId.value
      }
    }
    bankSkEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  } else {
     const query = {
      add: true,
      info: dialogModel
    }
    bankSkAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  }
}

//添加
const handleAdd = () => {
  for (const key in list2Box.dialogList) {
    if(list2Box.dialogList[key].type == 'radio'){
      if(key == 'is_all'){
          list2Box.dialogList[key].value = 1
         dialogModel[key] = 1
      }else{
        list2Box.dialogList[key].value = 0
          dialogModel[key] = 0
      }

    }else{
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }


    //  if (key == dialogList[key]?.prop) {
    //     if (dialogList[key].type == 'radio') {
    //       list2Box.dialogList[key].value = 0
    //       dialogModelBox.dialogModel[key] = 0
    //    } else {
    //      list2Box.dialogList[key].value = ''
    //    }

    //  }
    }
  // dialogModel.pay_rebate = [{ min: "", max: "", proportion: ''}]
  clickIndex.value = 2;
  visible.value = true;
}


//删除
let selectAll = [];
const handleDelet = () => {
  if (selectAll.length <= 0) {
      message(transformI18n('请选择'), { type: 'error' });
      return;
  }
   const arr = [];
   proxy.$confirm(transformI18n('确认删除吗？'), transformI18n('提示')).then(() => {
    selectAll.forEach(item => {
      arr.push(item.id);
    })
    deleteIds(arr.join(','))
  }).catch(() => {
    console.log('取消');
  })

}
const handleSelectionChange = (val) => {
  selectAll = val;
}

function deleteIds(id) {
  const query = {
    delete: true,
    id
  }
  bankSkDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(transformI18n(res.msg), { type: 'success' });
        init();
      } else {
        message(transformI18n(res.msg), { type: 'error' });
    }
      selectAll=[]
  })
}
const selectShow = ref(false);
const eidtUsername = (val) => {
  dialogModelBox.dialogModel.agent_id = val;
   list2Box.dialogList.agent_id.value = val;
}
const selectUser = () => {
    selectShow.value = true
 }

 //选择代理返回来的
const agenBackRow = (val) => {
  list2Box.dialogList.agent_id.value = val.uid
  dialogModelBox.dialogModel.agent_id = val.uid
  selectShow.value = false
}
//状态
// const handleStatus = (row,val) => {
//   proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
//     statusChage(row,val)
//   }).catch(() => {
//     console.log('取消');
//   })
// }
// function statusChage(row,status) {
//   let query = {
//     edit: true,
//     info: {
//       id: row.id,
//       status
//     }
//   }
//   serviceStatusEidt(query).then((res: any) => {
//     if (res.code == 1) {
//         message(res.msg, { type: 'success' });
//         init();
//       } else {
//         message(res.msg, { type: 'error' });
//     }
//   })
// }
//图片返回
const backImageData = (val) => {
  dialogModelBox.dialogModel.bank_qrcode = val.file[0];
  list2Box.dialogList['bank_qrcode'].value = val.file[0];
  dialogModel['bank_qrcode'] = val.file[0];
}
const iconbackImageData = (val) => {
  dialogModelBox.dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
  dialogModel['icon'] = val.file[0];
}



 //充值备注设置
 const noticeShow = ref(false)
 const noticeTyep = ref('');
 const noticeTitle=ref('银行卡参数设置');
 const noticeCol=[
  {
    label:'标题',
    slot:'title',
  },{
    label:'说明',
    slot:'remark',
  },{
    label:'是否必填（1-必填，2-非必填）',
    slot:'required',
  },{
    label:'操作',
    slot:'right',
  },
 ]
 const noticeList=[]
 const noticeDataBox = reactive({
  noticeList
 })
 const noticeSet=(name)=>{
  noticeTyep.value = name;
  const query={
    find:true,
    pay_type: name
  }
  bankSkBankSkSet(query).then((res:any)=>{
      if(res.code == 1){
        noticeDataBox.noticeList = res.data.set_content;
        noticeShow.value = true
      }else{
         message(res.msg, { type: 'error' });
      }
  })
 }
 //删除
 const noticeDelete=(index)=>{
    noticeDataBox.noticeList.splice(index,1)
 }
 const noticeAdd=()=>{
  noticeDataBox.noticeList.push({ title:'',remark:'',required: ''})
 }
 const noticeSave=()=>{
  const query={
    edit:true,
    info:{
      pay_type:noticeTyep.value,
      set_content: noticeDataBox.noticeList
    }
  }
  bankSkBankSkSet(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        noticeShow.value = false
      } else {
        message(res.msg, { type: 'error' });
    }
  })
 }

const rebate_col = [
  {
    label: transformI18n('最低充值'),
    slot: 'min'
  },
  {
    label: transformI18n('最高充值'),
    slot: 'max'
  },
  {
    label: transformI18n('返利比例'),
    slot: 'proportion'
  },
  {
    label: transformI18n('操作'),
    slot: 'right'
  }
]

 const payRebate = (index) => {
  dialogModelBox.dialogModel.pay_rebate.splice(index, 1)
}
const RebateAdd = () => {
  dialogModelBox.dialogModel.pay_rebate.push({ min: "", max: "", proportion: ''})
  console.log(dialogModelBox.dialogModel.pay_rebate)
}
</script>

<template>
  <div>
    <menuList />
    <el-dialog width="80%" v-model="noticeShow" :title="noticeTitle">
        <pure-table :border="true" :data="noticeDataBox.noticeList" width="100%"  :columns="noticeCol" >
            <template #right="{index}">
                <el-button  size="small" type="danger" @click="noticeDelete(index)">{{ $t('删除') }}</el-button>
            </template>
            <template #title="{row}">
                <el-input v-model="row.title" placeholder="" />
            </template>
            <template #remark="{row}">
                <el-input v-model="row.remark" placeholder="" />
            </template>
            <template #required="{row}">
                <el-input v-model="row.required" placeholder="" />
            </template>
        </pure-table>
          <el-button style="margin-bottom:30px;" type="primary" @click="noticeAdd">{{ $t('增加一条') }}</el-button> <br/>
          <el-button type="primary" @click="noticeSave">{{ $t('保存') }}</el-button>
    </el-dialog>
     <el-dialog width="80%" v-model="selectShow" title="选择">
          <div style="padding-bottom:30px;">
            <component :select="true" @select="agenBackRow" :is="defineAsyncComponent(()=> import('@/components/comm/agenReportList.vue'))"/>
          </div>
    </el-dialog>


    <el-dialog width="80%" v-model="visible" title="编辑">
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('基础信息')">
          <commForm title="保存" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList">
              <template v-slot:agent_id>
                  <div class="flex-fi user-box">
                    <el-input v-model="dialogModelBox.dialogModel.agent_id" @change="eidtUsername($event)" :placeholder="$t('用户')" />
                    <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
                  </div>
            </template>
            <template v-slot:upload>
                  <uploadImage @imageData="backImageData" :image="dialogModelBox.dialogModel.bank_qrcode" :limit="1" />
              </template>
            <template v-slot:icon_upload>
                  <uploadImage @imageData="iconbackImageData" :image="dialogModelBox.dialogModel.icon" :limit="1" />
              </template>
          </commForm>
        </el-tab-pane>

        
        <el-tab-pane :label="$t('充值返利')">
          <pure-table :border="true" :data="dialogModelBox.dialogModel.pay_rebate" width="100%" :columns="rebate_col" >
            
             <template #min="{ row }">
              <el-input :key="row.id" v-model="row.min" :placeholder="$t('最低充值')" />
            </template>
            <template #max="{ row }">
              <el-input :key="row.id" v-model="row.max" :placeholder="$t('最高充值')" />
            </template>
            <template #proportion="{ row }">
              <el-input  v-model="row.proportion" :placeholder="$t('返利比例')" />
            </template>
            <template #right="{ index }">
              <el-button size="small" type="danger" @click="payRebate(index)">{{ $t('删除') }}</el-button>
            </template>
          </pure-table>


          <el-button type="primary" style="margin-top:30px;" @click="RebateAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" style="margin-top:30px;" @click="handleSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>


         </el-tabs>
    </el-dialog>

    
    <!-- <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:agent_id>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModelBox.dialogModel.agent_id" @change="eidtUsername($event)" :placeholder="$t('用户')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
      </template>
       <template v-slot:upload>
            <uploadImage @imageData="backImageData" :image="dialogModelBox.dialogModel.bank_qrcode" :limit="1" />
        </template>
       <template v-slot:icon_upload>
            <uploadImage @imageData="iconbackImageData" :image="dialogModelBox.dialogModel.icon" :limit="1" />
        </template>
      </commDialog> -->

    <el-tabs type="border-card" @tab-change="handleTab">
      <el-tab-pane :label="$t('银行卡')">
        <div class="flex-fi" style="margin-bottom:20px;">
          <el-button type="danger" v-if="hasAuth('delete')" @click="handleDelet">{{ $t('删除') }}</el-button>
          <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{$t('添加')}}</el-button>
          <el-button type="primary" v-if="hasAuth('set')" @click="noticeSet('bank')">{{ $t('充值备注设置') }}</el-button>
        </div>
          <pure-table :data="tableData.dataList" width="100%" :columns="columns1" @selection-change="handleSelectionChange">
            <template #start_level_id="{row}">
                <div v-if="row.start_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.start_level_id - 1 }}</div>
                <div v-if="row.end_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.end_level_id - 1 }}</div>
            </template>
            <template #icon="{ row }">
              <el-image v-if="row.icon" style="width: 30px; height: 30px" :src="row.icon" />
            </template>
            <template #bank_status="{row}">
              <el-button size="small" type="primary"  v-if="row.bank_status == 1">{{$t('启用')}}</el-button>
              <el-button size="small" type="danger"  v-else >{{ $t('禁用') }}</el-button>
            </template>
            <template #is_all="{row}">
              <el-button size="small" type="primary"  v-if="row.is_all == 1">{{ $t('是') }}</el-button>
              <el-button size="small" type="danger"  v-else >{{$t('否')}}</el-button>
            </template>
            <template #is_hot="{row}">
              <el-button size="small" type="primary"  v-if="row.is_hot == 1">{{ $t('开启') }}</el-button>
              <el-button size="small" type="danger"  v-else >{{$t('关闭')}}</el-button>
            </template>
            <template #content="{ row }">
              <span v-html="row.reg_ip" />
            </template>
            <template #right="{row}">
              <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
            </template>
          </pure-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('USDT')">
        <div class="flex-fi" style="margin-bottom:20px;">
          <el-button type="danger" v-if="hasAuth('delete')" @click="handleDelet">{{ $t('删除') }}</el-button>
          <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" v-if="hasAuth('set')" @click="noticeSet('usdt')">{{ $t('充值备注设置') }}</el-button>
        </div>
          <pure-table :data="tableData.dataList" width="100%" :columns="columns2" @selection-change="handleSelectionChange">
            <template #start_level_id="{row}">
                <div v-if="row.start_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.start_level_id - 1 }}</div>
                <div v-if="row.end_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.end_level_id - 1 }}</div>
            </template>
            <template #icon="{ row }">
              <el-image v-if="row.icon" style="width: 30px; height: 30px" :src="row.icon" />
            </template>
            <template #bank_status="{row}">
              <el-button size="small" type="primary"  v-if="row.bank_status == 1">{{$t('启用')}}</el-button>
              <el-button size="small" type="danger"  v-else >{{ $t('禁用') }}</el-button>
            </template>
             <template #is_all="{row}">
              <el-button size="small" type="primary"  v-if="row.is_all == 1">{{ $t('是') }}</el-button>
              <el-button size="small" type="danger"  v-else >{{$t('否')}}</el-button>
            </template>
            <template #bank_qrcode="{row}">
              <el-image style="width: 100px; height: 100px" :src="row.bank_qrcode"  />
            </template>
            <template #right="{row}">
              <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
            </template>
          </pure-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('电子钱包')">
        <div class="flex-fi" style="margin-bottom:20px;">
          <el-button type="danger" v-if="hasAuth('delete')" @click="handleDelet">{{ $t('删除') }}</el-button>
          <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" v-if="hasAuth('set')" @click="noticeSet('wallet')">{{ $t('充值备注设置') }}</el-button>
        </div>
        <pure-table :data="tableData.dataList" width="100%" :columns="columns3" @selection-change="handleSelectionChange">
            <template #start_level_id="{row}">
                <div v-if="row.start_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.start_level_id - 1 }}</div>
                <div v-if="row.end_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.end_level_id - 1 }}</div>
            </template>
            <template #icon="{ row }">
              <el-image v-if="row.icon" style="width: 30px; height: 30px" :src="row.icon" />
            </template>
            <template #bank_status="{row}">
              <el-button size="small" type="primary"  v-if="row.bank_status == 1">{{$t('启用')}}</el-button>
              <el-button size="small" type="danger"  v-else >{{ $t('禁用') }}</el-button>
            </template>
             <template #is_all="{row}">
              <el-button size="small" type="primary"  v-if="row.is_all == 1">{{ $t('是') }}</el-button>
              <el-button size="small" type="danger"  v-else >{{$t('否')}}</el-button>
            </template>
            <template #bank_qrcode="{row}">
              <el-image style="width: 100px; height: 100px" :src="row.bank_qrcode"  />
            </template>
            <template #right="{row}">
              <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
            </template>
          </pure-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('PIX')">
        <div class="flex-fi" style="margin-bottom:20px;">
          <el-button type="danger" v-if="hasAuth('delete')" @click="handleDelet">{{ $t('删除') }}</el-button>
          <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" v-if="hasAuth('set')" @click="noticeSet('pix')">{{ $t('充值备注设置') }}</el-button>
        </div>
         <pure-table :data="tableData.dataList" width="100%" :columns="columns4" @selection-change="handleSelectionChange">
            <template #start_level_id="{row}">
                <div v-if="row.start_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.start_level_id - 1 }}</div>
                <div v-if="row.end_level_id == 0">{{ $t('不限制') }}</div>
                <div v-else>VIP{{ row.end_level_id - 1 }}</div>
            </template>
            <template #icon="{ row }">
              <el-image v-if="row.icon" style="width: 30px; height: 30px" :src="row.icon" />
            </template>
            <template #bank_status="{row}">
              <el-button size="small" type="primary"  v-if="row.bank_status == 1">{{$t('启用')}}</el-button>
              <el-button size="small" type="danger"  v-else >{{ $t('禁用') }}</el-button>
            </template>
             <template #is_all="{row}">
              <el-button size="small" type="primary"  v-if="row.is_all == 1">{{ $t('是') }}</el-button>
              <el-button size="small" type="danger"  v-else >{{$t('否')}}</el-button>
            </template>
            <template #bank_qrcode="{row}">
              <el-image style="width: 100px; height: 100px" :src="row.bank_qrcode"  />
            </template>
            <template #right="{row}">
              <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
            </template>
          </pure-table>
      </el-tab-pane>
    </el-tabs>

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
<style scoped>
.btmNav{
  padding-top:10px;
}
</style>
