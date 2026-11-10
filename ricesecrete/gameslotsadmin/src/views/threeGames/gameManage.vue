<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent, getCurrentInstance } from 'vue';
import { gameLists,gameSwitchGame, gameEdit } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { http } from '@/utils/http';
import { hasAuth } from '@/router/utils';
import { useI18n } from "vue-i18n";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gameManage'
})
const { t } = useI18n();
const columns = [
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "g_id",
  },
  {
    label: transformI18n("游戏名称"),
    prop: "gi_name",
  },
  {
      label: transformI18n("游戏图标"),
      slot: "g_icon",
  },
  {
      label: transformI18n("平台名称"),
      prop: "tc_name",
    }, {
      label: transformI18n("前端平台名称"),
      prop: "name_web",
    },{
      label: transformI18n("游戏分类"),
      slot: "type_name",
    },{
      label: transformI18n("游戏代码"),
      prop: "g_code",
    },{
      label: transformI18n("三方代码"),
      prop: "g_tag",
    },{
      label: transformI18n("标签"),
      slot: "g_hot"
    },{
      label: transformI18n("狀態"),
      slot: "g_state",

    },{
      label: transformI18n("显示状态"),
      slot: "g_show",

    },{
      label: transformI18n("锁定"),
      slot: "g_lock",

    },{
      label: transformI18n("排序"),
      prop: "g_sort",
      sortable: true
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        </>
      )
    },
];

const height = window.innerHeight - 260;
//以下是搜索框的数据
const list = {
  game_name: {
    type: 'input',
    placeholder: '游戏名称/代码',
    value: '',
    prop: 'game_name'
  },
  id: {
    type: 'input',
    placeholder: '游戏ID',
    value: '',
    prop: 'id'
  },
  thirds: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'thirds',
    options: []
  },
  thirds_web: {
    type: 'select',
    placeholder: '前端游戏平台',
    value: '',
    prop: 'thirds_web',
    options: []
  },
  game_type: {
    type: 'select',
    placeholder: '游戏分类',
    value: '',
    prop: 'game_type',
    options: []
  },
  status: {
    type: 'select',
    placeholder: '状态',
    value: '',
    prop: 'status',
    options: [
      {
        value: 1,
        label: '开启'
      },
      {
        value: 2,
        label: '维护'
      },
      {
        value: 0,
        label: '关闭'
      },
    ]
  },
  show_status: {
    type: 'select',
    placeholder: '显示状态',
    value: '',
    prop: 'show_status',
    options: [
      {
        value: 1,
        label: '显示'
      },
      {
        value: 0,
        label: '不显示'
      },
    ]
  },
  hot: {
    type: 'select',
    placeholder: '热门游戏',
    value: '',
    prop: 'hot',
    options: [
      {
        value: '0',
        label: '否',
      }, {
        value: '1',
        label: '是',
      },
    ]
  },
  new: {
    type: 'select',
    placeholder: '最新游戏',
    value: '',
    prop: 'new',
    options: [
      {
        value: '0',
        label: '否',
      }, {
        value: '1',
        label: '是',
      },
    ]
  },
  top: {
    type: 'select',
    placeholder: '最佳',
    value: '',
    prop: 'top',
    options: [
      {
        value: '0',
        label: '否',
      }, {
        value: '1',
        label: '是',
      },
    ]
  },
  is_self: {
    type: 'select',
    placeholder: '自营',
    value: '',
    prop: 'is_self',
    options: [
      {
        value: '0',
        label: '否',
      }, {
        value: '1',
        label: '是',
      },
    ]
  },
  // sports: {
  //   type: 'select',
  //   placeholder: '体育游戏',
  //   value: '',
  //   prop: 'sports',
  //   options: [
  //     {
  //       value: '0',
  //       label: '否',
  //     }, {
  //       value: '1',
  //       label: '是',
  //     },
  //   ]
  // },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  id: '',
  game_name: '',
  thirds: '',
  thirds_web:'',
  game_type: '',
  show_status: '',
  hot: '',
  new: '',
  top: '',
  sports: '',
  status: '',
  is_self: '',
  order: '',//排序 desc 或 asc
  select_all_user: 0,//是否是选择所有用户
  field: '',
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
function init(select_all_user = 0) {
  pagination.select_all_user = select_all_user
  gameLists(pagination).then((res: any) => {
    if ( pagination.select_all_user == 1 ) {
      //选择所有游戏
      backSelect(res.data.toString());
      return
    }
    tableData.dataList = res.data
    pagination.total = res.count
    const arr = []
    const arr_web = []
    const typeArr = []
    const gameType = res.game_type;
    for (const key in gameType) {
      typeArr.push({label:gameType[key],value:parseInt(key)})
    }
    // gameType.forEach((item,index) => {
    //   console.log(item);
    // })
    res.thirds.forEach(item => {
      arr.push({label:item.tc_name,value:item.tc_id})
    })
    res.thirds_web.forEach(item => {
      arr_web.push({label:item.tc_name,value:item.tc_id})
    })
    list.thirds.options = arr
    list.thirds_web.options = arr_web
    list.game_type.options = typeArr
    list2Box.dialogList.g_tcid.options = arr
    list2Box.dialogList.g_web_tcid.options = arr_web
    list2Box.dialogList.g_type.options = typeArr
    list3Box.dialogBatchList.g_tcid.options = arr
    list4Box.dialogIEList.g_tcid.options = arr
    list4Box.dialogIEList.g_web_tcid.options = arr
    list4Box.dialogIEList.g_type.options = typeArr
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
//弹框写法
const visible = ref(false);
const dialogList = {
  g_tcid: {
    type: 'select',
    label: '游戏平台',
    placeholder: '游戏平台',
    value: '',
    options: [],
    prop: 'g_tcid'
  },
  g_web_tcid: {
    type: 'select',
    label: '前端游戏平台',
    placeholder: '前端游戏平台',
    value: '',
    options: [],
    prop: 'g_web_tcid'
  },
  g_type: {
    type: 'select',
    label: '游戏分类',
    placeholder: '请选择游戏分类',
    value: '',
    options: [],
    prop: 'g_type'
  },
  g_code: {
    type: 'input',
    label: '游戏代码',
    placeholder: '游戏代码',
    value: '',
    prop: 'g_code'
  },
  g_tag: {
    type: 'input',
    label: '三方代码',
    placeholder: '三方代码',
    tip: '游戏在第三方平台的代码',
    value: '',
    prop: 'g_tag'
  },
  gi_name: {
    type: 'input',
    label: '游戏名称',
    placeholder: '游戏名称',
    value: '',
    prop: 'gi_name'
  },
  g_sort: {
    type: 'input',
    label: '游戏排序',
    placeholder: '游戏排序',
    value: '',
    prop: 'g_sort'
  },
  g_state: {
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 0,
    prop: 'g_state',
    options: [
      {
        label: 1,
        name: '开启'
      },
      {
        label: 2,
        name: '维护'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  },
  g_lock: {
    type: 'radio',
    label: '锁定状态',
    placeholder: '锁定后批量状态不生效',
    value: 0,
    prop: 'g_lock',
    options: [
      {
        label: 1,
        name: '锁定'
      },
     {
        label: 0,
        name: '解锁'
      },
    ]
  },
  g_show: {
    type: 'radio',
    label: '显示状态',
    placeholder: '显示状态',
    value: 1,
    prop: 'g_show',
    options: [
      {
        label: 1,
        name: '显示'
      },
     {
        label: 0,
        name: '不显示'
      },
    ]
  },
  g_cj:{
    type: 'radio',
    label: '是否支持彩金投注',
    placeholder: '是否支持彩金投注',
    value: 0,
    options: [
      {
        label: 0,
        name:'双钱包支持'
      },
      {
        label: 1,
        name:'仅现金钱包'
      },
      {
        label: 2,
        name:'仅彩金钱包'
      },
    ],
    prop:'g_cj'
  },
  g_backstatus: {
    type: 'radio',
    label: '参与返水',
    placeholder: '参与返水',
    value: 0,
    prop: 'g_backstatus',
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
  g_fystatus: {
    type: 'radio',
    label: '参与返佣',
    placeholder: '参与返佣',
    value: 0,
    prop: 'g_fystatus',
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
  g_icon: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '游戏图标',
    prop: 'g_icon'
  },
  gi_headimg: {
    type: 'slot',
    name: 'upload2',
    value: '',
    label: '游戏主图',
    prop: 'gi_headimg'
  },
  g_hot: {
    type: 'radio',
    label: '热门',
    placeholder: '热门',
    value: 0,
    prop: 'g_hot',
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
  g_is_new: {
    type: 'radio',
    label: '最新',
    placeholder: '最新',
    value: 0,
    prop: 'g_is_new',
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
  g_is_optimum: {
    type: 'radio',
    label: '最佳',
    placeholder: '最佳',
    value: 0,
    prop: 'g_is_optimum',
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
  g_is_self: {
    type: 'radio',
    label: '自营游戏',
    placeholder: '自营游戏',
    value: 0,
    prop: 'g_is_self',
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
  g_sports: {
    type: 'radio',
    label: '体育',
    placeholder: '体育',
    value: 0,
    prop: 'g_sports',
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
  g_rtp: {
    type: 'input',
    label: '获胜率',
    placeholder: '获胜率',
    tip: '', // 获胜率数值 范围外无效
    value: '',
    prop: 'g_rtp'
  },
  gi_thirdlang: {
    type: 'input',
    label: '语言标识',
    placeholder: '语言标识',
    tip: '第三方平台语言标识',
    value: '',
    prop: 'gi_thirdlang'
  },
  g_keyword: {
    type: 'input',
    label: '搜索关键字',
    placeholder: '搜索关键字',
    tip: '',
    value: '',
    prop: 'g_keyword'
  },
  // gi_content: {
  //   type: 'slot',
  //   label: '游戏简介',
  //   placeholder: '游戏简介',
  //   value: '',
  //   name: 'gi_content',
  //   prop: 'gi_content'
  // },
  gi_info: {
    type: 'input',
    label: '游戏说明',
    placeholder: '游戏说明',
    value: '',
    prop: 'gi_info'
  },
  g_exfield: {
    type: 'input',
    label: '特殊标识',
    placeholder: '特殊标识',
    value: '',
    prop: 'g_exfield'
  },
}
const dialogModel = reactive({
  g_tcid:'',
  g_web_tcid:'',
  g_type:'',
  g_code:'',
  g_tag:'',
  g_rtp:'',
  g_icon:'',
  g_hot:'',
  g_is_new:'',
  g_is_optimum:'',
  g_is_self:'',
  g_sports:'',
  g_state:'',
  g_lock:'',
  g_keyword:'',
  g_cj:0,
  g_show:0,
  g_backstatus:'',
  g_fystatus:'',
  gi_name:'',
  gi_thirdlang:'',
  gi_info:'',
  gi_headimg:'',
  gi_content:'',
  g_sort: '',
  g_exfield:'',
  g_id:''
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}


//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  // list2Box.dialogList.gi_content.value = val
  // dialogModel.gi_info = val
}
const clickCurrentIndex = ref(1);
  //编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    id:row.g_id
  }
  gameEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.g_id = res.data.g_id;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//点击添加
const handleAdd = () => {
  clickCurrentIndex.value = 2
  for (const key in dialogList) {
    if( key == 'g_show'){
        list2Box.dialogList[key].value = 1
        dialogModel[key] = 1
    }else if (dialogList[key].type == 'radio' || dialogList[key].type == 'g_cj') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }

    }
    dialogModel.g_id = '';
    visible.value = true;
}
//图片返回
const backImageData1 = (val) => {
  dialogModel.g_icon = val.file[0];
  list2Box.dialogList['g_icon'].value = val.file[0];
}
//图片返回
const backImageData2 = (val) => {
  dialogModel.gi_headimg = val.file[0];
  list2Box.dialogList['gi_headimg'].value = val.file[0];
}
//保存
const handleSave = () => {
  let query = {};
  // dialogModel.gi_content = list2Box.dialogList.gi_content.value
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
  }
  gameEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
// 批量修改状态
const batchVisible = ref(false);
const handleBatch = () => {
  batchVisible.value = true;
}
const handleBatchSave = () => {
  http.post('/game/batch_status', { data: dialogBatchModel }).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      batchVisible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const dialogBatchList = {
  g_tcid: {
    type: 'select',
    label: '游戏平台',
    placeholder: '游戏平台',
    tip: '根据平台批量修改所有游戏状态',
    value: '',
    options: [],
    prop: 'g_tcid'
  },
  g_state: {
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: '',
    prop: 'g_state',
    options: [
      {
        label: 1,
        name: '开启'
      },
      {
        label: 2,
        name: '维护'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  },
  g_show: {
    type: 'radio',
    label: '显示状态',
    placeholder: '显示状态',
    value: '',
    prop: 'g_show',
    options: [
      {
        label: 1,
        name: '显示'
      },{
        label: 0,
        name: '不显示'
      },
    ]
  },
}
const dialogBatchModel = reactive({
  g_tcid:'',
  g_state:'',
  g_show:'',
})
const list3Box = reactive({ dialogBatchList })
const handleBatchDialogChange = ({ value, index }) => {
  dialogBatchList[index].value = value;
  const prop = dialogBatchList[index].prop;
  dialogBatchModel[prop] = value;
}
// 导入导出
const ieVisible = ref(false)
const ieType = ref(0)
const dialogIEList = {
  g_tcid: {
    type: 'select',
    label: '游戏平台',
    placeholder: '游戏平台',
    value: '',
    options: [],
    prop: 'g_tcid'
  },
  g_web_tcid: {
    type: 'select',
    label: '前端游戏平台',
    placeholder: '前端游戏平台',
    tip: '不选择默认和游戏平台一致',
    value: '',
    show: true,
    options: [],
    prop: 'g_web_tcid'
  },
  g_type: {
    type: 'select',
    label: '游戏分类',
    placeholder: '请选择游戏分类',
    value: '',
    options: [],
    prop: 'g_type'
  },
  file: {
    type: 'file',
    label: '导入文件',
    placeholder: '选择导入文件',
    value: '',
    prop: 'file',
    show: true
  },
}
const dialogIEModel = reactive({
  g_tcid:'',
  g_web_tcid:'',
  g_type: '',
  file: ''
})

const list4Box = reactive({ dialogIEList })
const handleIEDialogChange = ({ value, index }) => {
  dialogIEList[index].value = value;
  const prop = dialogIEList[index].prop;
  dialogIEModel[prop] = value;
}
//导出
const handleExport = (show) => {
  list4Box.dialogIEList.file.show = show
  list4Box.dialogIEList.g_web_tcid.show = show ? true : false
  ieType.value  = show ? 1 : 0 // 1 导出，0导入
  ieVisible.value = true
}
const handleIESave = () => {
  http.post(ieType.value === 1 ? '/game/export' : '/game/import', { data: dialogIEModel }).then((res: any) => {
    if (res.code == 1) {
      if (ieType.value === 1) {
        window.location.href = res.data.url;
      }
      message(res.msg, { type: 'success' });
      ieVisible.value = false;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//删除
let selectAll = [];
const handleDelete = () => {
  if (selectAll.length <= 0) {
      message('请选择', { type: 'error' });
      return;
  }
   const arr = [];
   proxy.$confirm('确认删除吗？', '提示').then(() => {
    selectAll.forEach(item => {
      arr.push(item.g_id);
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
  http.post('/game/delete', { data: query }).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
const props = defineProps({
  back: Boolean,
})
const handleSelectGame = (is_all = 0) => {
  const arr = [];
  if( is_all == 1){
    init(1)
  }else{
    if (selectAll.length <= 0) {
      message(t('请选择游戏'), { type: 'warning' });
      return;
    }
    selectAll.forEach(item => {
      arr.push(item.g_id);
    })
    backSelect(arr.toString());
  }
}
const emit = defineEmits(['backSelect'])
const backSelect = (gameData) => {
  if (gameData) {
    emit('backSelect', gameData);
  } else {
    message(t('请选择游戏'), { type: 'error' });
  }
}
//批量改变状态
const switchGame = (state) => {
  if (selectAll.length <= 0) {
      message('请选择', { type: 'error' });
      return;
  }
  
   let str = "关闭";
   if(state==1){
    str = "开启";
   }
   if(state==2){
    str = "维护";
   }
   const arr = [];

   proxy.$confirm("是否要批量操作"+str, '提示').then(() => {
    selectAll.forEach(item => {
      arr.push(item.g_id);
    })
    const temp = {
      id:arr,
      state:state
    };
    gameSwitchGame(temp).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
    });
  }).catch(() => {
    console.log('取消');
  })
}
const sortChange = (res) => {
  pagination.field = res.prop;
  if (res.order) {
    pagination.order = res.order == 'descending' ? 'DESC' : 'ASC';
  } else {
    pagination.order = '';
  }
  init()
  return false;
}
</script>

<template>
  <div>
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
   <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete') && !props.back" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add') && !props.back" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <el-button v-if="hasAuth('add') && !props.back" type="primary" @click="switchGame(1)">{{ $t('开启') }}</el-button>
        <el-button v-if="hasAuth('add') && !props.back" type="danger" @click="switchGame(0)">{{ $t('关闭') }}</el-button>
        <!-- <el-button v-if="hasAuth('add') && !props.back" type="info" @click="switchGame(2)">{{ $t('维护') }}</el-button> -->
        <el-button v-if="hasAuth('batch') && !props.back" type="danger" @click="handleBatch">{{ $t('批量修改状态') }}</el-button>
        <el-button v-if="hasAuth('export') && !props.back" type="success" @click="handleExport(true)">{{ $t('导出') }}</el-button>
        <el-button v-if="hasAuth('import') && !props.back" type="info" @click="handleExport(false)">{{ $t('导入') }}</el-button>
        <el-button v-if="props.back" type="primary" @click="handleSelectGame">{{ $t('选择勾选游戏') }}</el-button>
        <el-button v-if="props.back" type="primary" @click="handleSelectGame(1)">{{ $t('选择所有游戏') }}</el-button>
      </div>
    </div>
    <commDialog title="导入/导出" btn="确认" width="50%" @save="handleIESave" :dialogObj="dialogIEModel" @currentChage="handleIEDialogChange" :list="list4Box.dialogIEList" :visible="ieVisible" @close="ieVisible = false" />
    <commDialog title="批量修改状态" width="50%" @save="handleBatchSave" :dialogObj="dialogBatchModel" @currentChage="handleBatchDialogChange" :list="list3Box.dialogBatchList" :visible="batchVisible" @close="batchVisible = false" />
    <commDialog title="基础信息" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage @imageData="backImageData1" :image="dialogModel.g_icon" :limit="1" :size="1024*1024*2" />
        </template>
        <template v-slot:upload2>
            <uploadImage @imageData="backImageData2" :image="dialogModel.gi_headimg" :limit="1" :size="1024*1024*2"/>
        </template>
        <template v-slot:gi_content>
            <component @chage="editorEle" :content="dialogModel.gi_content" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <template #g_state="{ row }">
          <el-tag size="small" type="danger"  v-if="row.g_state == 0">{{ $t('关闭') }}</el-tag>
          <el-tag size="small" type="success"  v-else-if="row.g_state == 1">{{ $t('开启') }}</el-tag>
          <el-tag size="small" type="warning"  v-else-if="row.g_state == 2">{{ $t('维护') }}</el-tag>
      </template>
      <template #g_lock="{ row }">
          <el-tag size="small" type="danger"  v-if="row.g_lock == 1">{{ $t('锁定') }}</el-tag>
          <el-tag size="small" type="success"  v-else-if="row.g_lock == 0">{{ $t('解锁') }}</el-tag>
      </template>
      <template #g_show="{ row }">
          <el-tag size="small" type="success"  v-if="row.g_show == 1">{{ $t('显示') }}</el-tag>
          <el-tag size="small" type="danger"  v-else-if="row.g_show == 0">{{ $t('不显示') }}</el-tag>
      </template>
      <template #g_hot="{ row }">
        <template v-if="row.g_hot == 1 || row.g_is_new == 1 || row.g_is_optimum == 1 || row.g_sports == 1">
          <el-tag size="small" type="danger" v-if="row.g_hot == 1">{{ $t('热门') }}</el-tag>
          <el-tag size="small" type="success" v-if="row.g_is_new == 1">{{ $t('最新') }}</el-tag>
          <el-tag size="small" v-if="row.g_is_optimum == 1">{{ $t('最佳') }}</el-tag>
          <el-tag size="small" type="warning" v-if="row.g_sports == 1">{{ $t('体育') }}</el-tag>
        </template>
        <span v-else>-</span>
      </template>
      <template #g_icon="{ row }">
        <a :href="row.g_icon" target="_blank"><el-image style="width:30px;" :src="row.g_icon" fit="contain" /></a>
      </template>
      <template #type_name="{ row }">
        {{$t(row.type_name)}}
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
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
.el-tag {
  margin-right: 3px;
}
</style>
