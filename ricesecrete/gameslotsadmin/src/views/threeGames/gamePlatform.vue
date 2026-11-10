<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from 'vue';
import { gameThird, gameThireEdit, gameThireAdd } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
// import uploadImages from '@/components/comm/uploadImages.vue'
import { message } from "@/utils/message";
import { copyContent } from "@/utils/global";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gamePlatform'
})
const columns = [
  {
    label: transformI18n("ID"),
    prop: "tc_id",
  },
  {
    label: transformI18n("平台图标"),
    slot: "icon",
  },
  {
    label: transformI18n("LOGO"),
    slot: "simple_icon",
  },
  {
    label: transformI18n("平台名称"),
    prop: "tc_name",
  },
  {
    label: transformI18n("平台代码"),
    prop: "tc_code",
  },
  //   {
  //     label: transformI18n("API前缀"),
  //     prop: "tc_api_urlpre",
  //   },{
  //     label: transformI18n("平台私钥"),
  //     prop: "tc_api_prikey",
  //   },{
  //     label: transformI18n("签名密钥"),
  //     prop: "tc_api_signkey",
  //   },{
  //     label: transformI18n("平台唯一标识"),
  //     prop: "tc_tag",
  // },
  {
    label: transformI18n("状态"),
    slot: "tc_status",
  },
  {
    label: transformI18n("操作"),
    width: 300,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        <el-button v-show={hasAuth('export')} size="small" type="danger" onClick={() => handleExport(row)}>{ transformI18n('导出') }</el-button>
        <el-button v-show={hasAuth('config')} size="small" type="warning" onClick={() => showApi(row.tc_id)}>{ transformI18n('API配置') }</el-button>
        <el-button v-show={rtpShow(row)} size="small" type="warning" onClick={() => showRtp(row)}>{ transformI18n('RTP配置') }</el-button>
      </>
    )
  },
];

const rtpShow = row => {
  return hasAuth('rtp') && row.is_has_rtp;
}

const searchList = {
  keyword:{
    type: 'input',
    placeholder: '平台名称/代码',
    value: '',
    prop: 'keyword',
    span: 8
  },
  state: {
    type: 'select',
    placeholder: '状态',
    value: '',
    options: [
      {
        label: '所有',
        value: '',
      },{
        label: '开启',
        value: 1,
      }, {
        label: '关闭',
        value: 0,
      },
    ],
    prop: 'state',
    span: 8
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListBox = reactive({
  searchList
})
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  state: '',
  keyword:''
});
const dataList: any = [];
const tableData = reactive({ dataList });

//首次需要加载的接口
init();
function init() {
  gameThird(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    list2Box.dialogList['country']['options'] = res.nation
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
//导出
const handleExport = (row) => {
  http.post('/game/third_export', { data: { tc_id: row.tc_id } }).then((res: any) => {
    if (res.code == 1) {
      const data = res.data
      proxy.$alert("<textarea style='width:100%;' rows='5'>" + data + "</textarea>", transformI18n('导出'), {
        confirmButtonText: transformI18n('复制'),
        dangerouslyUseHTMLString: true
      }).then(() => {
        copyContent(data)
      })
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const visibleImport = ref(false);
const importData = ref('');
const handleImport = (type) => {
  if (type == 1) {
    http.post('/game/third_import', { data: { data: importData.value } }).then((res: any) => {
      if (res.code == 1) {
        visibleImport.value = false
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  } else {
    visibleImport.value = true
  }
}

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value
    }
  }
  pagination.page = 1;
  init();
}

//弹框写法
const visible = ref(false);
const dialogList = {
  tc_name: {
    type: 'input',
    label: '平台名称',
    placeholder: '平台名称',
    value: '',
    prop: 'tc_name'
  },
  tc_code: {
    type: 'input',
    label: '平台代号',
    placeholder: '平台代号',
    tip: '三方平台代号，用于代码继承规则，全大写无特殊字符,技术员修改',
    value: '',
    prop: 'tc_code'
  },
  tc_set_code: {
    type: 'input',
    label: '集合名',
    placeholder: '集合名',
    value: '',
    prop: 'tc_set_code'
  },
  tc_api_urlpre: {
    type: 'input',
    label: 'API前缀',
    placeholder: 'API前缀',
    tip: '三方平台API前缀',
    value: '',
    prop: 'tc_api_urlpre'
  },
  tc_api_prikey: {
    type: 'input',
    label: '平台私钥',
    placeholder: '平台私钥',
    tip: '三方平台私钥',
    value: '',
    prop: 'tc_api_prikey'
  },
  tc_api_signkey: {
    type: 'input',
    label: '签名密钥',
    placeholder: '签名密钥',
    tip: '三方平台签名密钥，有些平台签名密钥为独立的',
    value: '',
    prop: 'tc_api_signkey'
  },
  tc_tag: {
    type: 'input',
    label: '平台唯一标识',
    placeholder: '平台唯一标识',
    tip: '本平台在三方平台的唯一标识，比如商户号',
    value: '',
    prop: 'tc_tag'
  },
  tc_token: {
    type: 'input',
    label: 'TOKEN',
    placeholder: 'TOKEN',
    tip: '三方平台API验证TOKEN',
    value: '',
    prop: 'tc_token'
  },
  tc_tokentime: {
    type: 'input',
    label: 'TOKEN有效期',
    placeholder: 'TOKEN有效期',
    tip: '三方平台token有效时间（秒）',
    value: '',
    prop: 'tc_tokentime'
  },
  // tc_proxyconfig: {
  //   type: 'input',
  //   label: '分佣规则',
  //   placeholder: '分佣规则',
  //   tip: 'json，代理分佣规则设置,由分佣方法使用',
  //   value: '',
  //   prop: 'tc_proxyconfig'
  // },
  tc_langmap: {
    type: 'input',
    label: '三方语言',
    placeholder: '三方语言',
    tip: '三方语言对应关系表 {"本地lang标识":"三方lang标识",....}',
    value: '',
    prop: 'tc_langmap'
  },
  tc_currency: {
    type: 'input',
    label: '货币',
    placeholder: '货币',
    tip: '三方平台货币单位，必须填写，请填写与三方平台接口要求的货币字估完全一致的字符串，区分大小写',
    value: '',
    prop: 'tc_currency'
  },
  tc_exchangerate: {
    type: 'input',
    label: '汇率',
    placeholder: '汇率',
    tip: '本平台与三方平台的币值汇率，以本平台为1',
    value: '',
    prop: 'tc_exchangerate'
  },
  tc_min_bet: {
    type: 'input',
    label: '最低投注',
    placeholder: '最低投注',
    tip: '三方游戏最低投注',
    value: '',
    prop: 'tc_min_bet'
  },
  tc_max_bet: {
    type: 'input',
    label: '最高投注',
    placeholder: '最高投注',
    tip: '三方游戏最高投注',
    value: '',
    prop: 'tc_max_bet'
  },
  tc_status: {
    type: 'radio',
    value: 1,
    label: '狀態',
    prop: 'tc_status',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  },
  is_new_tab: {
    type: 'radio',
    value: 0,
    label: '新标签页打开',
    prop: 'is_new_tab',
    options: [
      {
        label: 1,
        name: '是'
      }, {
        label: 0,
        name: '否'
      },
    ]
  },
  tc_exchangeint: {
    type: 'radio',
    value: 0,
    label: '是否整数提现',
    prop: 'tc_exchangeint',
    options: [
      {
        label: 1,
        name: '是'
      }, {
        label: 0,
        name: '否'
      },
    ]
  },
  simple_icon: {
    type: 'slot',
    name: 'simple_upload',
    tip: '请上传正方形',
    value: '',
    label: '平台简标',
    prop: 'simple_icon'
  },
  icon: {
    type: 'slot',
    name: 'upload',
    tip: '图片尺寸400*200',
    value: '',
    label: '平台图标',
    prop: 'icon'
  },
  // pc_photos: {
  //   type: 'slot',
  //   name: 'pc_photos',
  //   tip: '图片尺寸xxx*xxxx',
  //   value: '',
  //   label: 'pc展示图集',
  //   prop: 'pc_photos'
  // },
  
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    tip: '排序，越大排越前面',
    value: '',
    prop: 'sort'
  },
  tc_timezone: {
    type: 'input',
    label: '对账时区',
    placeholder: '对账时区',
    tip: '三方后台对账的时区',
    value: '',
    prop: 'tc_timezone'
  },
  country: {
    type: 'checkbox',
    value: [],
    label:'限制地区',
    prop:'country',
    options: []
  }
}
const dialogModel = reactive({
  tc_name:'',
  tc_code:'',
  tc_set_code:'',
  tc_api_urlpre:'',
  tc_api_prikey:'',
  tc_api_signkey:'',
  tc_tag:'',
  tc_token:'',
  tc_tokentime:'',
  tc_proxyconfig:'',
  tc_currency:'',
  tc_exchangerate:'',
  tc_min_bet:'',
  tc_max_bet:'',
  tc_status: 1,
  simple_icon:'',
  icon:'',
  // pc_photos:'',
  sort: '',
  tc_id: '',
  tc_timezone: '',
  is_new_tab: 0,
  tc_exchangeint: 0,
  country:[]
})
const listRules = {
  tc_name: {
    required: true, message: '请输入平台名称', trigger: ['blur','change']
  },
  tc_code: {
    required: true, message: '请输入平台代号', trigger: ['blur','change']
  },
  // tc_api_urlpre: {
  //   required: true, message: '请输入API前缀', trigger: ['blur','change']
  // },
  //  tc_api_prikey: {
  //   required: true, message: '请输入平台私钥', trigger: ['blur','change']
  // },
  //  tc_api_signkey: {
  //   required: true, message: '请输入签名密钥', trigger: ['blur','change']
  // },
  // tc_tag: {
  //   required: true, message: '请输入平台唯一标识', trigger: ['blur','change']
  // },
  // tc_token: {
  //   required: true, message: '请输入TOKEN', trigger: ['blur','change']
  // },
  //  tc_tokentime: {
  //   required: true, message: '请输入TOKEN有效期', trigger: ['blur','change']
  // },
  //  tc_proxyconfig: {
  //   required: true, message: '请输入分佣规则', trigger: ['blur','change']
  // },
  //  tc_currency: {
  //   required: true, message: '请输入货币', trigger: ['blur','change']
  // },
  //  tc_exchangerate: {
  //   required: true, message: '请输入汇率', trigger: ['blur','change']
  // },
  //  tc_min_bet: {
  //   required: true, message: '请输入最低投注', trigger: ['blur','change']
  // },
  //  tc_max_bet: {
  //   required: true, message: '请输入最大投注', trigger: ['blur','change']
  // },
  tc_status: {
    required: true, message: '请选择狀態', trigger: ['blur','change']
  },
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}
const clickCurrentIndex = ref(1);


  //编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  gameThireEdit({ find: true, id: row.tc_id }).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel['tc_id'] = res.data.tc_id
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//上传成功后的图片
const backImageData = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}


// const backPcPhotosData = (val) => {
//   dialogModel.pc_photos = val.file;
//   list2Box.dialogList['pc_photos'].value = val.file;
// }

//上传成功后的简标
const backSimpleImageData = (val) => {
  dialogModel.simple_icon = val.file[0];
  list2Box.dialogList['simple_icon'].value = val.file[0];
}
//添加
const handleAdd = () => {
  for (const key in dialogList) {
    if(key == 'country'){
      list2Box.dialogList[key].value = []
      dialogModel[key] = []
    }else if(key == 'is_new_tab' || key == 'tc_exchangeint'){
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    }else if(key == 'tc_status'){
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else{
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  dialogModel['tc_id'] = ''
  clickCurrentIndex.value = 2
  visible.value = true;
}
//保存
const handleSave = () => {
  let query = {}
  let api = gameThireEdit;
  if (clickCurrentIndex.value == 1) {
    query = {
      edit: true,
      info: dialogModel
    }
  } else {
    query = {
      add: true,
      info: dialogModel
    }
    api = gameThireAdd;
  }
  api(query).then((res: any) => {
    if (res.code == 1) {
      // message(res.msg, { type: 'success' });
      visible.value = false;
      init();
    } else {
      // message(res.msg, { type: 'error' });
    }
  })
}
const currentTcid = ref(0)
const apiShow = ref(false)
const showApi = (tc_id) => {
  apiShow.value = true;
  currentTcid.value = tc_id
  http.post('/game/apis', { data: { tc_id: tc_id } }).then((res: any) => {
    apiTableData.apiList = res.data
  });
}

const apiColumns = [
  {
    label: transformI18n("功能模块"),
    prop: "ga_func",
    width: 120
  },
  {
    label: transformI18n("流程类型"),
    prop: "ga_type",
    width: 100
  },
  {
    label: transformI18n("API路由"),
    prop: "ga_route",
    width: 150
  },
  {
    label: transformI18n("访问方式"),
    slot: 'ga_rtype',
    width: 100
  },
  {
    label: transformI18n("请求参数"),
    slot: "params",
  },
  {
    label: transformI18n("返回结果"),
    slot: "result",
  },
  {
    label: transformI18n("操作"),
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleApiEidt(row)}>{ transformI18n('编辑') }</el-button>
      </>
    )
  },
];
const apiList: any = [];
const apiTableData = reactive({ apiList });

//弹框写法
const apiVisible = ref(false);
const apiDialogList = {
  ga_func: {
    type: 'input',
    label: '功能模块',
    placeholder: '功能模块',
    tip:'固定模块: REGISTER, GETUSERURL, WITHDRAW, DEPOSIT, GETAUTH, GETBALANCE, GETBETLIST, GETBETLISTDETAIL, GETGAMELIST, GETBETDETAIL, GETONEUSERRTP, SETUSERRTP',
    value: '',
    prop: 'ga_func'
  },
  ga_route: {
    type: 'input',
    label: '路由地址',
    placeholder: '路由地址',
    value: '',
    prop: 'ga_route'
  },
  ga_rtype: {
    type: 'select',
    value: '',
    label: '请求方式',
    placeholder: '请求方式',
    prop: 'ga_rtype',
    options: [
      {
        label: 'post',
        value: 'post'
      },
      {
        label: 'get',
        value: 'get'
      },
    ]
  },
  ga_type: {
    type: 'select',
    label: '流程类型',
    placeholder: '流程类型',
    tip: '流程类型 getauthtoken 获取三方访问TOKEN reg 单独注册 first隐式注册 other其它，task任务类API，用于用户第一次与第三方游戏对接数据，reg优先',
    value: '',
    prop: 'ga_type',
    options: [
      {
        label: 'getauthtoken',
        value: 'getauthtoken'
      },
      {
        label: 'reg',
        value: 'reg'
      },
      {
        label: 'first',
        value: 'first'
      },
      {
        label: 'other',
        value: 'other'
      },
      {
        label: 'task',
        value: 'task'
      },
    ]
  },
  ga_gparam: {
    type: 'input',
    label: 'GET参数部分',
    placeholder: 'GET参数部分:a=1&b=2',
    tip: 'api GET 参数部分｛标识元数据｝',
    value: '',
    prop: 'ga_gparam'
  },
  ga_hparam: {
    type: 'input',
    label: 'api Header参数数据{标识元数据}',
    placeholder: 'json格式:{"a":"b"}',
    tip: 'api Header参数数据{标识元数据}',
    value: '',
    prop: 'ga_hparam'
  },
  ga_pparam: {
    type: 'input',
    label: 'api POST参数',
    placeholder: 'json格式:{"a":"b"}',
    tip: 'api POST参数数据{标识元数据}',
    value: '',
    prop: 'ga_pparam'
  },
  ga_keyfield: {
    type: 'input',
    label: '接口返回关键字段与元数据的对应关系',
    placeholder: '接口返回关键字段与元数据的对应关系',
    tip: "接口返回关键字段与元数据的对应关系 JSON",
    value: '',
    prop: 'ga_keyfield'
  },
  ga_rltfield: {
    type: 'input',
    label: '接口返回结果字段对应表',
    placeholder: '接口返回结果字段对应表',
    tip: "接口返回结果字段对应表 JSON {f:{n:'名字',vkv:{k:1,v:'输',t:int time date...}}，f:{f:'名字...}}",
    value: '',
    prop: 'ga_rltfield'
  },
  ga_needsign: {
    type: 'radio',
    value: '',
    label: '否需要签名',
    placeholder: '否需要签名',
    tip: '接口数据是否需要签名 0 传送和接收都不需要 1传送需要 2接收需要 3双向需要',
    prop: 'ga_needsign',
    options: [
      { label: 0, name: '0-不需要' },
      { label: 1, name: '1-传送需要' },
      { label: 2, name: '2-接收需要' },
      { label: 3, name: '3-双向需要' },
    ]
  },
  ga_rate: {
    type: 'input',
    label: '接口请求频率',
    placeholder: '接口请求频率',
    value: '',
    prop: 'ga_rate'
  },
  ga_urlpre: {
    type: 'input',
    label: '特别的接口地址',
    placeholder: '特别的接口地址',
    tip: '特别的接口地址，优先级高于三方平台中的配置',
    value: '',
    prop: 'ga_urlpre'
  }
}
const apiDialogModel = reactive({
  ga_id:'',
  ga_tcid:0,
  ga_gid:0,
  ga_func:'',
  ga_route:'',
  ga_rtype:'',
  ga_gparam:'',
  ga_hparam:'',
  ga_pparam:'',
  ga_type:'',
  ga_rltfield:'',
  ga_keyfield:'',
  ga_rate:'',
  ga_needsign:'',
  ga_taskcfg:'',
  ga_taskvalue:'',
  ga_urlpre: '',
})
const apiListRules = {
  ga_func: {
    required: true, message: '请输入功能模块', trigger: ['blur','change']
  },
  //部分三方不需要路由
  //ga_route: {
  //  required: true, message: '请输入路由地址', trigger: ['blur','change']
  //},
  ga_rtype: {
    required: true, message: '请求方式必须', trigger: ['blur','change']
  },
  ga_type: {
    required: true, message: '请选择流程类型', trigger: ['blur','change']
  },
}
const apiList2Box = reactive({ apiDialogList })
const apiHandleDialogChange = ({ value, index }) => {
  console.log(value, index)
  apiList2Box.apiDialogList[index].value = value;
  apiDialogModel[index] = value;
}
//添加
const handleApiAdd = (e) => {
  try {
    for (const key in apiDialogModel) {
      if (key == 'ga_id' || key == 'ga_tcid') {
        continue
      }
      apiList2Box.apiDialogList[key].value = typeof apiList2Box.apiDialogList[key].value == 'string' ? '' : 0;
      apiDialogModel[key] = (typeof apiDialogModel[key]) == 'string' ? '' : 0;
    }

  } catch (e) {
    console.log(e)
  }
  apiDialogModel.ga_id = ''
  apiDialogModel.ga_tcid = currentTcid.value
  apiVisible.value = true;
}

  //编辑
const handleApiEidt = (row) => {
  http.post('/game/apis_add', {data: { find: true, id: row.ga_id }}).then((res: any) => {
    if (res.code == 1) {
      for (const key in apiDialogList) {
        if (key == 'ga_id' || key == 'ga_tcid') {
          continue
        }
        apiList2Box.apiDialogList[key].value = typeof apiList2Box.apiDialogList[key].value == 'string' ? (res.data[key] ? res.data[key] : '') : parseInt(res.data[key])
        apiDialogModel[key] = typeof apiDialogModel[key] == 'string' ? (res.data[key] ? res.data[key] : '') : parseInt(res.data[key])
      }
      apiDialogModel['ga_id'] = res.data.ga_id
      apiDialogModel['ga_tcid'] = res.data.ga_tcid
      apiVisible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//保存
const handleApiSave = () => {
  http.post('/game/apis_add', {data: { add: true, info: apiDialogModel }}).then((res: any) => {
    if (res.code == 1) {
      // message(res.msg, { type: 'success' });
      apiVisible.value = false;
      showApi(apiDialogModel.ga_tcid);
    } else {
      // message(res.msg, { type: 'error' });
    }
  })
}

const rtpShowVisible = ref(false);
const tcid = ref("");
const showRtp = row => {
  tcid.value = row.tc_id;
  rtpShowVisible.value = true;
};
</script>

<template>
  <div>
   <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <el-button v-if="hasAuth('import')" type="danger" @click="handleImport">{{ $t('导入') }}</el-button>
      </div>
      <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    </div>
    <el-dialog v-model="rtpShowVisible" :title="$t('RTP配置')" width="80%" heith="100%">
      <component
        :id="tcid"
        :is="
          defineAsyncComponent(() =>
            import('@/views/threeGames/gameRtp.vue')
          )
        "
      />
    </el-dialog>
    <commDialog title="基础信息" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:upload>
        <div>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.icon"/>
          <p>{{ $t('图片尺寸400x200') }}</p>
        </div>
      </template>
      <!-- <template v-slot:pc_photos>
        <div>
          <uploadImages @imageData="backPcPhotosData"  :limit="1" :image="dialogModel.pc_photos"/>
          <p>{{ $t('图片尺寸400x200') }}</p>
        </div>
      </template> -->
      <template v-slot:simple_upload>
        <div>
          <uploadImage @imageData="backSimpleImageData"  :limit="1" :image="dialogModel.simple_icon"/>
          <p>{{ $t('请上传正方形图片') }}</p>
        </div>
      </template>
    </commDialog>

    <el-dialog width="50%" v-model="visibleImport" :title="$t('导入')">
         <el-form ref="ruleFormRef">
            <el-form-item label-width="120">
              <template v-slot:label>{{ $t('数据') }}</template>
                <el-input type="textarea" rows="6" v-model="importData" />
            </el-form-item>
          <el-form-item label-width="120">
            <el-button type="primary" @click="handleImport(1)">{{ $t('导入') }}</el-button>
          </el-form-item>
        </el-form>
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
      <template #tc_status="{ row }">
        <el-tag size="small" type="danger"  v-if="row.tc_status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success"  v-if="row.tc_status == 1">{{ $t('开启') }}</el-tag>
      </template>
      <template #icon="{ row }">
        <img v-if="row.icon" style="height:40px;" :src="row.icon"/>
      </template>
      <template #simple_icon="{ row }">
        <img v-if="row.simple_icon" style="height:40px;" :src="row.simple_icon"/>
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

    <el-dialog v-model="apiShow" :title="$t('API配置')" width="80%">
      <div class="flex-bc line-box">
        <div>
          <el-button type="primary" @click="handleApiAdd">{{ $t('添加') }}</el-button>
        </div>
      </div>
      <el-alert title="非技术请勿随意修改" type="error" show-icon :closable="false" />
      <pure-table :data="apiTableData.apiList" width="100%" :columns="apiColumns">
        <template #params="{ row }">
          <template v-if="row.ga_hparam">
              <h2>Headers</h2>
              <p v-for="val, key in row.ga_hparam" :key="key">
                <el-tag type="success">{{ key }}</el-tag>: <el-tag type="danger">{{ val }}</el-tag>
              </p>
          </template>
          <template v-if="row.ga_rtype == 'post'">
              <h2>Post Body</h2>
              <p v-for="val, key in row.ga_pparam" :key="key">
                <el-tag type="success">{{ key }}</el-tag>: <el-tag type="danger">{{ val }}</el-tag>
              </p>
          </template>
          <template v-else>
              <h2>Get Query String</h2>
              <code>{{ row.ga_gparam }}</code>
          </template>
        </template>
        <template #result="{ row }">
          <p v-for="val, key in row.ga_keyfield" :key="key">
            <el-tag type="success">{{ key }}</el-tag>: <el-tag type="danger">{{ val }}</el-tag>
          </p>
        </template>
        <template #ga_rtype="{ row }">
          <el-tag v-if="row.ga_rtype == 'post'" type="warning" size="small">{{ row.ga_rtype }}</el-tag>
          <el-tag v-else type="danger" size="small">{{ row.ga_rtype }}</el-tag>
        </template>
      </pure-table>
    </el-dialog>
    <commDialog title="Api信息" :dialogObj="apiDialogModel" @save="handleApiSave" @currentChage="apiHandleDialogChange" :listRules="apiListRules" :list="apiList2Box.apiDialogList" :visible="apiVisible" @close="apiVisible = false" >
      <template v-slot:upload>
        <div>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.icon"/>
          <p>{{ $t('图片尺寸400x200') }}</p>
        </div>
      </template>
      <template v-slot:simple_upload>
        <div>
          <uploadImage @imageData="backSimpleImageData"  :limit="1" :image="dialogModel.simple_icon"/>
          <p>{{ $t('请上传正方形图片') }}</p>
        </div>
      </template>
    </commDialog>
  </div>
</template>
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
</style>
