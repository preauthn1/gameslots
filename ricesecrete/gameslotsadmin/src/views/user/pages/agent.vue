<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent ,getCurrentInstance } from "vue";
import { agentStatusEdit,systemEdit } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import router from "@/router";
import { useDataLoad } from "@/components/table/dataLoad";
import commForm from '@/components/comm/comm-form3.vue'

defineOptions({
  name: 'agentList'
})
const { proxy } = getCurrentInstance();
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/user_agent/list');
const columns: TableColumnList = [
  {
    headerRenderer: () => transformI18n("用户名"),
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
      </>
    )
  },
  {
    headerRenderer: () => transformI18n("标签信息"),
    width: 180,
    slot: 'tag'
  },
  {
    headerRenderer: () => transformI18n("上级代理"),
    prop: "rec_name",
    cellRenderer: ({ row }) => (
      <>
        <div v-show={row.rec_id > 0} onClick={() => showUserInfo(row.rec_id)}>
          <p class="el-link2">UID:{row.rec_id}</p>
        </div>
      </>
    )
  },
  {
    headerRenderer: () => transformI18n("代理类型"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag size="small" type="success">{row.type == 0 ? transformI18n('外部代理') : transformI18n('内部代理')}</el-tag>
        <el-tag v-show={row.type == 1} size="small" type="danger">{transformI18n('返佣比例')}:{row.rate}%</el-tag>
      </>
    )
  },
  {
    headerRenderer: () => transformI18n("注册时间/注册ip"),
    cellRenderer: ({ index, row }) => (
      <>
        <div>{row.apply_time}</div>
        <div>{row.apply_ip}</div>
      </>
    )
  },
  {
    headerRenderer: () => transformI18n("推广链接"),
    slot: "rec_url",
    width: 250
  },
  {
    headerRenderer: () => transformI18n("状态"),
    slot: "status"
  },
  {
    headerRenderer: () => transformI18n("站点权限"),
    slot: "website_auth"
  },
  {
    headerRenderer: () => transformI18n("域名"),
    prop: "domain",
  },
  {
    headerRenderer: () => transformI18n("操作"),
    fixed: "right",
    slot: 'right',
  }
];

//站点配置显示或隐藏
const webConfig = ref(false);


//搜索的数据

const searchList = {
  username: {
    type: 'input',
    placeholder: 'UID/邮箱/手机号/推广码',
    value: '',
    prop: 'username'
  },
  rec_id: {
    type: 'input',
    placeholder: '上级代理uid/邮箱/手机号/推广码',
    value: '',
    prop: 'rec_id'
  },
  like_all_next: {
    type: 'select',
    placeholder: '包含下级代理',
    value: '',
    prop: 'like_all_next',
    options: [
      {
        value: '0',
        label: '否',
      },
      {
        value: '1',
        label: '是',
      }
    ]
  },
  type: {
    type: 'select',
    placeholder: '代理类型',
    value: '',
    prop: 'type',
    options: [
      {
        value: '0',
        label: '外部代理',
      }, {
        value: '1',
        label: '内部代理',
      }
    ]
  },
  status: {
    type: 'select',
    placeholder: '审核状态',
    value: '',
    prop: 'status',
    options: [
      {
        value: '1',
        label: '待审核',
      }, {
        value: '2',
        label: '已审核',
      }, {
        value: '3',
        label: '已通过',
      },
    ]
  },
  website_auth: {
    type: 'select',
    placeholder: '站点权限',
    value: '',
    prop: 'website_auth',
    options: [
      {
        value: '1',
        label: '开启',
      }, {
        value: '0',
        label: '关闭',
      },
    ]
  },
  domain: {
    type: 'input',
    placeholder: '域名模糊搜索',
    value: '',
    prop: 'domain'
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export:{
    type: 'button',
    value:'导出',
    handle: 'export',
    prop: 'export',
  }
}

const searchListBox = reactive({
  searchList
})

const queryParams = reactive({
  username: '',//id 推广码 用户名 精确搜索
  rec_code: '',//用户名 手机号 邮箱 模糊搜索
  status: '',//用户标签
  type: '',//用户等级
  rec_id: '',
  like_all_next: '0',
  website_auth: '', //站点权限
  export:0,
  domain: '',//域名
});
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  pagination.currentPage = 1;
  onInitList(queryParams)
}

//下拉选择返回的数据
const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
}

//点击确定
const handleSerch = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  init();
}
//导出
const handleExport = () => {
  queryParams.export = 1;
  onInitList(queryParams,function (res) {
    console.log(res)
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
    queryParams.export = 0;
  });
  queryParams.export = 0;
}
//导出弹窗列表
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};


//弹框写法
const visible = ref(false);

const dialogList = {
  username: {
    type: 'input',
    label: '代理账户',
    placeholder: '代理账户',
    disable: true,
    value: '',
    prop: 'username',
  },
  rate: {
    type: 'input',
    label: '返佣比例',
    placeholder: '返佣比例',
    tip: '单位:百分比, 例如:50=50%',
    value: '',
    prop: 'rate',
    show: false,
  },
  status: {
    type: 'radio',
    value: '',
    label: '代理状态',
    prop: 'status',
    options: [
      {
        label: 1,
        name: '待审核'
      },
      {
        label: 2,
        name: '未通过'
      },
      {
        label: 3,
        name: '通过'
      },
    ],
  },
  service_url:{
    type: 'input',
    label: '客服链接',
    placeholder: '客服链接',
    value: '',
    prop: 'service_url',
    show: false,
  },
  website_auth: {
    type: 'radio',
    value: '',
    label: '站点权限',
    prop: 'website_auth',
    options: [
      {
        label: 1,
        name: '开启'
      },
      {
        label: 0,
        name: '关闭'
      },
    ],
  },
  //  website_name:{
  //   type: 'input',
  //   label: '网站名称',
  //   placeholder: '网站名称',
  //   show: webConfig,
  //   value: '',
  //   prop:'website_name'
  // },
  // website_web_url:{
  //   type: 'input',
  //   label: '网站域名',
  //   placeholder: '网站域名',
  //   tip: '必须绑定域名后下面功能才能使用，多个英文逗号隔开，例：https://test.com,https://test1.com',
  //   value: '',
  //   show: webConfig,
  //   prop:'website_web_url'
  // },
  // website_favicon:{
  //   type: 'fileInput',
  //   label: '浏览器icon',
  //   placeholder: '浏览器icon',
  //   tip: '浏览器icon（32*32）',
  //   value: '',
  //   show: webConfig,
  //   prop:'website_favicon'
  // },
  // website_pc_logo:{
  //   type: 'fileInput',
  //   label: 'PC端 LOGO',
  //   placeholder: 'PC端 LOGO',
  //   tip: 'PC端 LOGO（284*70）',
  //   value: '',
  //   show: webConfig,
  //   prop:'website_pc_logo'
  // },
  // website_desktop_logo:{
  //   type: 'fileInput',
  //   label: '桌面 LOGO',
  //   placeholder: '桌面 LOGO',
  //   tip: '移动端保存到桌面的LOGO（1024*1024）',
  //   value: '',
  //   show: webConfig,
  //   prop:'website_desktop_logo'
  // },
  // website_mobile_logo:{
  //   type: 'fileInput',
  //   label: '移动端 LOGO',
  //   placeholder: '移动端 LOGO',
  //   tip: '移动端 LOGO（100*100）',
  //   value: '',
  //   show: webConfig,
  //   prop:'website_mobile_logo'
  // },
  // android_download_url:{
  //   type: 'fileInput',
  //   label: '安卓下载链接',
  //   placeholder: '安卓下载链接',
  //   value: '',
  //   show: webConfig,
  //   prop:'android_download_url'
  // },
  // ios_download_url:{
  //   type: 'fileInput',
  //   label: 'iOS下载链接',
  //   placeholder: 'iOS下载链接',
  //   value: '',
  //   show: webConfig,
  //   prop:'ios_download_url'
  // },
  // pc_service_url:{
  //   type: 'input',
  //   label: 'pc端客服链接',
  //   placeholder: 'pc端客服链接',
  //   value: '',
  //   show: webConfig,
  //   prop:'pc_service_url'
  // },
  // mobile_service_url:{
  //   type: 'input',
  //   label: '移动端客服链接',
  //   placeholder: '移动端客服链接',
  //   value: '',
  //   show: webConfig,
  //   prop:'mobile_service_url'
  // },
  // quick_recharge:{
  //   type: 'input',
  //   label: '快捷银行充值金额',
  //   placeholder: '快捷银行充值金额',
  //   tip: '快捷银行充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
  //   value: '',
  //   show: webConfig,
  //   prop:'quick_recharge'
  // },
  // usdt_quick_recharge:{
  //   type: 'input',
  //   label: '快捷USDT充值金额',
  //   placeholder: '快捷USDT充值金额',
  //   tip: '快捷usdt充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
  //   value: '',
  //   show: webConfig,
  //   prop:'usdt_quick_recharge'
  // },
  // quick_withdrawal:{
  //   type: 'input',
  //   label: '快捷银行提现金额',
  //   placeholder: '快捷银行提现金额',
  //   tip: '快捷银行提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
  //   value: '',
  //   show: webConfig,
  //   prop:'quick_withdrawal'
  // },
  // usdt_quick_withdrawal:{
  //   type: 'input',
  //   label: '快捷USDT提现金额',
  //   placeholder: '快捷USDT提现金额',
  //   tip: '快捷usdt提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
  //   value: '',
  //   show: webConfig,
  //   prop:'usdt_quick_withdrawal'
  // },
  // phone_bind:{
  //   type: 'radio',
  //   label: '注册账号类型',
  //   placeholder: '注册账号类型',
  //   value: 3,
  //   options: [
  //     {
  //       label: 1,
  //       name:'手机'
  //     },
  //     {
  //       label: 2,
  //       name:'邮箱'
  //     },
  //     {
  //       label: 3,
  //       name:'同时开启'
  //     },
  //   ],
  //   show: webConfig,
  //   prop:'phone_bind'
  // },
  // is_reg_type:{
  //   type: 'radio',
  //   label: '需要额外填信息',
  //   placeholder: '需要额外填信息',
  //   tip: '当注册类型选择单个类型时是否需要另外填写[手机/邮箱]资料',
  //   value: 0,
  //   options: [
  //     {
  //       label: 1,
  //       name:'手机'
  //     },
  //     {
  //       label: 2,
  //       name:'邮箱'
  //     },
  //     {
  //       label: 0,
  //       name:'否'
  //     },
  //   ],
  //   show: webConfig,
  //   prop:'is_reg_type'
  // },
  // phone_check:{
  //   type: 'radio',
  //   label: '注册验证码',
  //   placeholder: '注册验证码',
  //   value: 0,
  //   options: [
  //     {
  //       label: 1,
  //       name:'开启'
  //     },
  //     {
  //       label: 0,
  //       name:'关闭'
  //     },
  //   ],
  //   show: webConfig,
  //   prop:'phone_check'
  // },
  // parent_allot:{
  //   type: 'radio',
  //   label: '上级随机',
  //   placeholder: '上级随机',
  //   tip: '开启后使用上面域名注册的用户，注册的用户上级为该代理的子代理（平均分配）',
  //   value: 0,
  //   options: [
  //     {
  //       label: 1,
  //       name:'开启'
  //     },
  //     {
  //       label: 0,
  //       name:'关闭'
  //     },
  //   ],
  //   show: webConfig,
  //   prop:'parent_allot'
  // },
}
const dialogModel = reactive({
  username: '',
  rate: '',
  status: '',
  id: '',
  service_url:"",
  website_auth: '',
  
  website_name: '',
  website_web_url: '',
  website_favicon: '',
  website_pc_logo: '',
  website_desktop_logo: '',
  website_mobile_logo: '',
  website_status: 0,
  android_download_url: '',
  ios_download_url: '',
  pc_service_url: '',
  mobile_service_url: '',
  
  quick_recharge: '',
  quick_withdrawal: '',
  usdt_quick_recharge: '',
  usdt_quick_withdrawal: '',
  phone_bind: '',
  is_reg_type: '',
  phone_check: '',
  parent_allot: '',
})
const webSite = reactive({
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
//当前选中的index
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if(index === 'website_auth'){
    if(value == 1){
      webConfig.value = false;
    }else{
      webConfig.value = true;
    }
  }
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}
const handleEdit = (row) => {
  for (const key in dialogList) {
    list2Box.dialogList[key].value = row[key]
    dialogModel[key] = row[key]
  }

  list2Box.dialogList.rate.show = row.type == 0
  dialogModel.id = row.id
  //判断站点权限
  if(row.website_auth == 1){
      webConfig.value = false;
  }else{
      webConfig.value = true;
  }
  visible.value = true;
};
//编辑点击确定
const handleSave = () => {
  const query = {
    edit: true,
    info: dialogModel
  }
  proxy.$confirm(transformI18n('确认修改代理信息？'), transformI18n('信息')).then(() => {
    agentStatusEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      }
    })
  }).catch(() => {
  })
}
const handleReport = (row) => {
  router.push('/weishang/reportdetail?username=' + row.uid)
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

// 设置 - 配置
const systemDialog = ref(false)
const systemSeting = {
  tg_condition: {
    type: 'input',
    ty: 'number',
    label: '推广有效条件',
    placeholder: '输入数字，充值金额',
    tip: '设置充值金额，如设置：100，推广进来的用户充值了100，才算有效推广用户，0 不限制',
    value: '',
    prop: 'tg_condition'
  },
  tg_condition_valid_bet: {
    type: 'input',
    ty: 'number',
    label: '推广有效有效流水',
    placeholder: '输入数字',
    tip: '设置有效流水，如设置：100，推广进来的用户有效下注100，才算有效推广用户，0 不限制',
    value: '',
    prop: 'tg_condition_valid_bet'
  },
  vip_upgrade: {
    type: 'radio',
    label: 'VIP升级',
    placeholder: 'VIP升级',
    value: '',
    tip: '用户VIP升级条件设置（设置后请尽快到用户管理  会员等级 设置相关参数，有效充值：根据用户充值自动升级VIP等级，有效推广会员数：跟直推用户数，团队用户数自动升级VIP等级，要满足上面的推广条件,推广会员数：跟直推用户数，团队用户数自动升级VIP等级，有效(推广会员+充值)：用户充值(累计)+有效直推用户数，团队用户数自动升级VIP等级',
    options: [
      {
        label: 0,
        name: '有效充值'
      }, {
        label: 1,
        name: '有效推广会员数'
      }, {
        label: 2,
        name: '推广会员数'
      }, {
        label: 3,
        name: '有效(推广会员+充值)'
      }
    ],
    prop: 'vip_upgrade'
  },
  agent_apply_verify: {
    type: 'radio',
    label: '成为代理',
    placeholder: '成为代理',
    value: '',
    options: [
      {
        label: 0,
        name: '手动申请，需审核'
      }, {
        label: 1,
        name: '手动申请，无需审核'
      }, {
        label: 2,
        name: '注册即为代理'
      },
    ],
    prop: 'agent_apply_verify'
  },
  agent_apply_rate: {
    type: 'input',
    ty: 'number',
    label: '成为内部代理分佣比例',
    placeholder: '输入数字',
    tip: '成为内部代理分佣比例 10 表示10%',
    value: '',
    prop: 'agent_apply_rate'
  },
  same_phone_register: {
    type: 'radio',
    label: '相同号码注册',
    placeholder: '相同号码注册',
    tip: '开启后使用不同代理不同的域名的相同号码可以注册',
    value: '0',
    options: [
      {
        label: '0',
        name: '关闭'
      }, {
        label: '1',
        name: '开启'
      },
    ],
    prop: 'same_phone_register'
  },
  agent_recharge: {
    type: 'input',
    ty: 'number',
    label: '成为代理充值金额',
    placeholder: '成为代理充值金额',
    tip: '诺设置注册即为代理，则此规则无效',
    value: '',
    prop: 'agent_recharge',
    show: true,
  },
  agent_water: {
    type: 'input',
    label: '成为代理流水金额',
    placeholder: '成为代理流水金额',
    tip: '诺设置注册即为代理，则此规则无效',
    value: '',
    prop: 'agent_water',
    show: true,
  },
  fyfy_type: {
    type: 'radio',
    label: '返佣类型',
    placeholder: '返佣类型',
    tip: '设置充值返佣，下级必须有充值才有返佣',
    value: 'all',
    options: [
      {
        label: 'all',
        name: '全部返佣'
      }, {
        label: 'bypayin',
        name: '充值返佣'
      },
    ],
    prop: 'fyfy_type'
  },
  fyfy_cycle: {
    type: 'radio',
    label: '返佣周期',
    placeholder: '返佣周期',
    tip: '返佣周期充值为计算返佣周期内的充值，如返佣周期为周时，计算的时这周时间内充值充值累计',
    value: 'his',
    show: true,
    options: [
      {
        label: 'his',
        name: '所有充值'
      }, {
        label: 'sametopay',
        name: '返佣周期充值'
      },
    ],
    prop: 'fyfy_cycle'
  },
  fyfy_recharge_condition: {
    type: 'input',
    label: '充值金额',
    placeholder: '充值金额',
    tip: '设置后必须下级充值大于等于该值才会有返佣，0为不限制',
    value: '',
    show: true,
    prop: 'fyfy_recharge_condition',
  },
}

const systemSetModel = {
  tg_condition: '',
  tg_condition_valid_bet: '',
  vip_upgrade: '',
  agent_apply_verify: '',
  agent_apply_rate:0,
  same_phone_register: '0',
  agent_recharge: '',
  agent_water: '',
  fyfy_type: 'all', //返佣类型
  fyfy_cycle: 'his', //返佣周期
  fyfy_recharge_condition: '0', //返佣充值金额条件
}

const systemBoxObj = reactive({
  systemSetModel,
});

const systemSetBox = reactive({ systemSeting })
const systemSetChange = ({ value, index }) => {
  systemSetBox.systemSeting[index].value = value;
  systemBoxObj.systemSetModel[index] = value;
  if(index == 'fyfy_type'){
    judgefyfyShow(value)
  }
}

function judgefyfyShow(type){
  systemSetBox.systemSeting['fyfy_cycle'].show = true;
  systemSetBox.systemSeting['fyfy_recharge_condition'].show = true;
  if(type == 'bypayin'){
    systemSetBox.systemSeting['fyfy_cycle'].show = false;
    systemSetBox.systemSeting['fyfy_recharge_condition'].show = false;
  }
}

function assginMent(list, name, data, val) {
    for (const key in list) {
      if(key == 'fyfy_type'){
        judgefyfyShow(data[key])
      }
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
  
  systemEdit(rQuery).then((res: any) => {
      if (res.code == 1) {
          message(res.msg, { type: 'success' });
      } else {
          message(res.msg, { type: 'error' });
      }
  });
}
const tranSetRules = {}
</script>
<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <el-dialog  v-model="systemDialog" :title="$t('代理设置')" width="70%" >
      <commForm title="保存" @save="settingSave" :dialogObj="systemBoxObj.systemSetModel" @currentChage="systemSetChange"
          :listRules="tranSetRules" :list="systemSetBox.systemSeting" />
    </el-dialog>
    <commDialog :title="$t('编辑')" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="searchChange"
      :list="searchListBox.searchList" />
      <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <div class=" line-box">
      <div class="flex-bc flex-fi m-2.5" >
        <el-button v-if="hasAuth('setting')" type="primary" @click="settingSystem">{{ $t('设置') }}</el-button>
      </div>
    </div>
    <pure-table :loading="loading" :loading-config="loadingConfig" adaptive :adaptiveConfig="adaptiveConfig"
      :pagination="pagination" @page-size-change="onSizeChange" @page-current-change="onCurrentChange"
      :data="tableData.dataList" width="100%" :columns="columns">
      <template #content="{ row }">
        <span v-html="row.reg_ip" />
      </template>
      <template #rec_url="{ row }">
        <span>{{ row.rec_url }}</span>
        <span class="copy">
          <iconify-icon-online @click="copy(row.rec_url)" icon="material-symbols:content-copy-outline" />
        </span>
      </template>
      <template #status="{ row }">
        <el-tag size="small" v-if="row.status == 1" type='warning'>{{ $t('待审核') }}</el-tag>
        <el-tag size="small" v-else-if="row.status == 2" type='danger'>{{ $t('未通过') }}</el-tag>
        <el-tag size="small" v-else type='success'>{{ $t('已通过') }}</el-tag>
        <!-- <el-button size="small" type={ ()=> row.status == 2?'danger':'primary' }>{ row.status == 1?'待审核':row.status == 2?'未通过':'已通过' }</el-button> -->
      </template>
      <template #website_auth="{ row }">
        <el-tag size="small" v-if="row.website_auth == 1" type='warning'>{{ $t('开启') }}</el-tag>
        <el-tag size="small" v-else type='danger'>{{ $t('关闭') }}</el-tag>
      </template>
      <template #tag="{ row }">
        <div>{{ $t("标签") }}:
          <el-tag size="small"
            :type="row.lebal === 1 ? 'success' : 'danger' "
            effect="plain"
          >
            {{ $t(row.lebal === 1 ? "一般" : "测试") }}
          </el-tag>
          <el-tag v-for="tag,idx in row.tags" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''" :type="tag.color ? '' : 'success'" :key="idx">
            {{ $t(tag.name) }}
          </el-tag>
        </div>
        <div>{{ $t('邀 请 码') }}:{{ row.rec_code }}</div>
        <div>{{ $t('会员等级') }}:{{ row.level_name }}</div>
      </template>
      <!--资料-->

      <template #right="{ row }">
        <template v-if="hasAuth('edit')">
          <el-button size="small" type="primary" @click="handleEdit(row)">{{ $t('编辑') }}</el-button>
        </template>
        <el-button v-if="hasAuth('profile')" size="small" type="danger" @click="handleReport(row)">{{ $t('报表') }}
        </el-button>
      </template>

    </pure-table>
  </div>
</template>