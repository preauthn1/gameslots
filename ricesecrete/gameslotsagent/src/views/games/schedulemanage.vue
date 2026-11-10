<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent } from 'vue';
import { liansaiSclist, liansaiSatusEdit, liansaiEditDetail, integralDataRecord,liansaiEditSave,liansaiBdUpdate,liansaibdSet } from '@/api/user';
import { timeCycle } from '@/utils/global'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';


const columns = [
    {
      label: transformI18n("赛程ID"),
      prop: "id",
    },
    {
      label: transformI18n("热门联赛"),
      slot: "is_hot",
    },{
      label: transformI18n("投注时间"),
      prop: "tz_time",
    },{
      label: transformI18n("赛程时间"),
      prop: "sc_time",
    },{
      label: transformI18n("状态"),
      slot: "status",
    },{
      label: transformI18n("联赛"),
      prop: "ls_name",
    },{
      label: transformI18n("主隊"),
      prop: "ls_team_zname",
    },{
      label: transformI18n("客隊"),
      prop: "ls_team_kname",
    },{
      label: transformI18n("结算状态"),
      slot: "res_status",
    },
    {
      label: transformI18n("操作"),
      slot: "right",
      width:'180px',
      fixed:'right'
    }
  ];

const height = window.innerHeight - 320;
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '赛程ID',
    value: '',
    idx:0
  },{
    type: 'input',
    placeholder: '联赛名称',
    value: '',
    idx:1
  },{
    type: 'input',
    placeholder: '主隊名称',
    value: '',
    idx:2
  },{
    type: 'input',
    placeholder: '客隊名称',
    value: '',
    idx:3
  },{
    type: 'time',
    placeholder: '赛程日期',
    idx:4,
    value: (): Array<string> => {
      return []
    }
  },{
    type: 'select',
    placeholder: '是否热门',
    value: '',
    idx:5,
    options: [
      {
        label: '热门',
        value: 1,
      }, {
        label: '一般',
        value: 0,
      }
    ]
  },{
    type: 'select',
    placeholder: '状态',
    value: '',
    idx:6,
    options: [
      {
        label: '显示',
        value: 1,
      }, {
        label: '不显示',
        value: 0,
      }
    ]
  },{
    type: 'select',
    placeholder: '结算状态',
    value: '',
    idx:7,
    options: [
      {
        label: '为结算',
        value: 1,
      }, {
        label: '已结算',
        value: 2,
      }, {
        label: '结算中',
        value: 3,
      }
    ]
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:8
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = ref<any>({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field:'',
  sc_id: '',//赛程ID
  league_name: '',
  localteam_name: '',
  visitorteam_name: '',
  sc_time: '',
  status: '',
  is_hot: '',
  res_status:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  //时间转换
  const time = list[4].value.length > 0 ? timeCycle(list[4].value[0]) + ' - ' + timeCycle(list[4].value[1]) : '';
  pagination.value.page = 1;
  pagination.value.sc_id = list[0].value
  pagination.value.league_name = list[1].value
  pagination.value.localteam_name = list[2].value
  pagination.value.visitorteam_name = list[3].value
  pagination.value.sc_time = time
  pagination.value.status = list[6].value
  pagination.value.is_hot = list[5].value
  pagination.value.res_status = list[7].value
  init();
}

//首次需要加载的接口
init();
function init() {
  liansaiSclist(pagination.value).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
  })
}
const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
   init();
};
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}

//热门开关
const swithChange = (val, row) => {
  const query = {
    edit: true,
    info: {
      is_hot: val,
      id: row.id
    }
  }
  liansaiSatusEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
     }
  })
}

//显示状态开关
const statusChange = (status,row) => {
  const query = {
    edit: true,
    info: {
      status,
      id: row.id
    }
  }
  liansaiSatusEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
     }
  })
}




//当前某个发生变化

const currentStatus = ref(1);

//弹框写法
const visible = ref(false);

const dialogList = {

  name:{
    type: 'input',
    label: '联赛名称',
    placeholder: '联赛名称',
    value: '',
    prop:'name'
  },
  status: {
     type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: '',
    options: [
      {
        label: 1,
        name:'启用'
      },{
        label: 0,
        name:'禁用'
      },
    ],
    prop:'status'
  }
}
const dialogModel = reactive({
  // level_name: '',
  name: '',
  status:''
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
  dialogModel[index] = value;
}

const handleSave = () => {

}

//基本设置
const basicSet = reactive({
  ls_name: {
    show:true,
    type:'ls_name',
    value: '',
    label:'联赛',
    prop: 'ls_name',
    placeholder:'请输入联赛名称'
  },
  ls_team_zname: {
    show:false,
    type:'ls_team_zname',
    value: '',
    label:'主队',
    prop: 'ls_team_zname',
    placeholder:'请输入主队'
  },
  ls_team_kname: {
    show:false,
    type:'ls_team_kname',
    value: '',
    label:'客队',
    prop: 'ls_team_kname',
    placeholder:'请输入客队'
  },
  tz_time: {
     show:true,
     type:'time',
    value: '',
    label:'投注时间',
    prop: 'tz_time',
    placeholder:'投注时间'
  },
  sc_time: {
     show:true,
     type:'time',
    value: '',
    label:'赛程日期',
    prop: 'sc_time',
    placeholder:'赛程日期'
  },
  is_hot: {
     show:true,
    type:'switch',
    value: 0,
    label:'是否热门',
    prop: 'is_hot',
    placeholder:'是否热门'
  },
  status: {
     show:true,
    type:'radio',
    value: 0,
    label:'状态',
    prop: 'status',
    placeholder: '状态',
    options: [
      {
        label: 1,
        name:'显示'
      },{
        label: 0,
        name:'不显示'
      },
    ]
  }
})
const basicModel = reactive({
  ls_name: '',
  ls_team_zname: '',
  ls_team_kname: '',
  tz_time: '',
  sc_time: '',
  is_hot: 0,
  status:1
})
//添加
const handleAdd = () => {
  visible.value = true
  currentStatus.value = 1;
  bdBox.bdList = [{kd: 0,zd:0}];
  for (const key in basicSet) {
    if (key == 'is_hot' || key == 'status') {
      basicSet[key].value = 0
      basicModel[key] = 0
    } else {
      basicSet[key].value = ''
      basicModel[key] = ''
    }
  }

     basicSet.ls_team_kname.show = false
    basicSet.ls_team_zname.show = false
    currentRow.id = ''
    currentRow.ls_id = ''

}
const rulesRules = {

}
const setCurrentChange = (value,index) => {
  basicSet[index].value = value;
  basicModel[index] = value;
}
const selectShow = ref(false);
const selectTemaShow = ref(false)
const currentRow = {
  ls_id: '',
  id:''
}
//点击选择主队
const temaCurrentIndex = ref(1);
const selectTema = (val) => {
  selectTemaShow.value = true;
  temaCurrentIndex.value = val;
}
//点击选择联赛
const selectLiansai = () => {
  selectShow.value = true;
}
//穿回来的的联赛
const liansaiSelect = (val) => {
  basicSet.ls_name.value = val.name
  basicModel.ls_name = val.name
  selectShow.value = false
  if (currentStatus.value == 1) {
     basicSet.ls_team_kname.show = true
    basicSet.ls_team_zname.show = true
    // console.log('联赛返回');
    // console.log(val);
    currentRow.id = val.id
    currentRow.ls_id = val.id
  }
}
//点击编辑
const eidtShow = (row) => {
  currentRow.ls_id = row.ls_id;
  currentRow.id = row.id
  visible.value = true
  getEidtDeatil(row.id);
  currentStatus.value = 2;
  for (const key in row) {
    if (key == basicSet[key]?.prop) {
      basicSet[key].value = row[key]
      basicModel[key] = row[key]
    }
  }
}
//获取 波胆的设置数据
const bdList = [];
const bdBox = reactive({
  bdList
})

//点击编辑获取额数据
function getEidtDeatil(id) {
  const query = {
    find: true,
    id
  }
  liansaiEditDetail(query).then((res: any) => {
    if (res.code == 1) {
      bdBox.bdList = res.data.bd;
    }
  })
}
//团队返回的
const temaSelect = (row) => {
  if (temaCurrentIndex.value == 1) {//主队复制
    basicSet.ls_team_zname.value = row.t_name;
    basicModel.ls_team_zname = row.t_name;
  } else { //客队复制
    basicSet.ls_team_kname.value = row.t_name;
     basicModel.ls_team_kname = row.t_name;
  }
  selectTemaShow.value = false;
}

//编辑点击保存
const eidtSave = () => {
  const query = {
    edit: true,
    info: {
      ...basicModel,
      id:currentRow.id,
      bd:bdBox.bdList
    }
  }
  liansaiEditSave(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
       visible.value = false
    }
  })
}

//这里展示波胆的数据
const bdColumns = [
   {
      label: transformI18n("主队"),
      slot: "zd",
    }, {
      label: transformI18n("客队"),
      slot: "kd",
  }, {
    label: '操作',
    slot:'bdright'
  }
]
const bdInput = (val, row,idx) => {
  if (idx == 1) {
    row.zd = val;
  } else {
    row.kd = val
  }
}
//添加波胆
const addbd = () => {
  const obj = {
    kd: 0,
    zd:0
  }
  bdBox.bdList.push(obj);
}
//删除波胆
const dbDelete = (index) => {
  // console.log(index);
  bdBox.bdList.splice(index,1)
}
//点击波胆更新
const updataBD = (row) => {
  const query = {
    league_id: row.league_id,
    sc_id:row.id
  }
  liansaiBdUpdate(query).then((res: any) => {
    if (res.code == 1) {
       message(res.msg, { type: 'success' });
    }
  })
}



//波胆赔率设定
const bdShow = ref(false);
const bdSelectIndex = ref(0);
const bdComp = defineAsyncComponent(() => import('@/views/games/bdselect.vue'))
const selectValue = ref('');
const bdColums1 = [
  {
    label: '比分',
    slot:'score',
  },{
    label: '注单数',
    prop:'zhudan_number',
  },{
    label: '投注金额',
    prop:'zhudan_amount',
  }, {
    width:'300px',
    // label: '比分',
    // prop:'name',
     headerRenderer: () => (
      <div class="flex-fi">
        <div>原始获利*倍率=获利</div>
         <el-select v-model={ selectValue.value } onChange={ (val)=>selectAllValue(val) }>
            <el-option value={ 1.5 } >1.5</el-option>
              <el-option value="1.45" >1.45</el-option>
              <el-option value="1.4" >1.4</el-option>
              <el-option value="1.35" >1.35</el-option>
              <el-option value="1.3" >1.3</el-option>
              <el-option value="1.25" >1.25</el-option>
              <el-option value="1.2" >1.2</el-option>
              <el-option value="1.15" >1.15</el-option>
              <el-option value="1.1" >1.1</el-option>
              <el-option value="1.05" >1.05</el-option>
              <el-option value="1">1</el-option>
              <el-option value="0.95" >0.95</el-option>
              <el-option value="0.9" >0.9</el-option>
              <el-option value="0.85" >0.85</el-option>
              <el-option value="0.8" >0.8</el-option>
              <el-option value="0.75" >0.75</el-option>
              <el-option value="0.7" >0.7</el-option>
              <el-option value="0.65" >0.65</el-option>
              <el-option value="0.6" >0.6</el-option>
              <el-option value="0.55" >0.55</el-option>
              <el-option value="0.5" >0.5</el-option>
              <el-option value="0.45" >0.45</el-option>
              <el-option value="0.4" >0.4</el-option>
              <el-option value="0.35" >0.35</el-option>
              <el-option value="0.3" >0.3</el-option>
              <el-option value="0.25" >0.25</el-option>
              <el-option value="0.2" >0.2</el-option>
              <el-option value="0.15" >0.15</el-option>
              <el-option value="0.1" >0.1</el-option>
          </el-select>
        </div>
    ),
      slot:'huoli'
  },{
    label: '正波胆赔率',
    slot:'zbd_pl',
  },{
    label: '波胆状态',
    slot:'status',
  },{
    label: '包赔',
    slot:'indemnity',
  },{
    label: '流水倍数',
    slot:'water',
  },{
    label: '推荐',
    slot:'recommend',
  }
]
const bdColums2 = [
   {
    label: '比分',
    slot:'score',
  }, {
    label: '虚拟交易量',
    slot:'trading',
  }, {
    label: '单注最低',
    slot:'danzhu_zd',
  }, {
    label: '单注最高',
    slot:'danzhu_zg',
  }, {
    label: '单项最高',
    slot:'danxiang_zg',
  },
]
const bdsetList1 = [];
const bdsetList2 = {
  ls_name: '',
  ls_team_kname:'',
  ls_team_zname:''
};
const bdsetListBox = reactive({ bdsetList1, bdsetList2 })

//获取波胆数据
const bdCurrentId = ref('');
function getbdData(id) {
  const query = {
    find: true,
    id
  }
  liansaibdSet(query).then((res: any) => {
    if (res.code == 1) {
      bdsetListBox.bdsetList1 = res.data.bd;
      bdsetListBox.bdsetList2.ls_name = res.data.ls_name
     bdsetListBox.bdsetList2.ls_team_kname = res.data.ls_team_kname
     bdsetListBox.bdsetList2.ls_team_zname = res.data.ls_team_zname
    }
    bdShow.value = true;
  })
}
const bdhandleShow = (row) => {
  bdCurrentId.value = row.id
  getbdData(row.id);

}

//批量修改
const selectAllValue = (val) => {
  selectValue.value = val;
  bdsetListBox.bdsetList1.forEach(item => {
    item.yshl_bs = val;
    item.yshl_pl = (val*item.yshl_bfb).toFixed(4)
  })
}
//输入
const handleSetInput=(val,row)=>{
    row.yshl_pl = (val*row.yshl_bs).toFixed(4)
}
const handleSetSelect=(val,row)=>{
  row.yshl_pl = (val*row.yshl_bfb).toFixed(4)
}
//保存
const bdSave = () => {
  const query = {
    edit: true,
    info: {
      id: bdCurrentId.value,
      ls_name: bdsetList2.ls_name,
      ls_team_kname: bdsetList2.ls_team_kname,
      ls_team_zname:bdsetList2.ls_team_zname,
      bd:bdsetListBox.bdsetList1
    }

  }
  liansaibdSet(query).then((res: any) => {
    if (res.code == 1) {
       bdShow.value = false;
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
   })
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi"/>
    </div>
    <!---波胆设定-->
    <el-dialog v-model="bdShow" width="80%" :title="$t('波胆赔率设定')">
      <div style="margin-bottom:15px;">温馨提示：{{ bdsetListBox.bdsetList2.ls_name }}  {{ bdsetListBox.bdsetList2.ls_team_zname }}-{{ bdsetListBox.bdsetList2.ls_team_kname }}</div>
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('波胆设置')">

              <pure-table :data="bdsetListBox.bdsetList1" width="100%"   :columns="bdColums1">
              <template #score="{ row }">
                  <div>{{ row.zd }}-{{ row.kd  }}</div>
              </template>
              <template #huoli="{ row }">
                  <div class="flex-fi">
                    <el-input type="number" v-model="row.yshl_bfb" placeholder="" @change="handleSetInput($event,row)" />%
                    <el-select v-model="row.yshl_bs" @change="handleSetSelect($event,row)">
                          <el-option value="1.5" >1.5</el-option>
                          <el-option value="1.45" >1.45</el-option>
                          <el-option value="1.4" >1.4</el-option>
                          <el-option value="1.35" >1.35</el-option>
                          <el-option value="1.3" >1.3</el-option>
                          <el-option value="1.25" >1.25</el-option>
                          <el-option value="1.2" >1.2</el-option>
                          <el-option value="1.15" >1.15</el-option>
                          <el-option value="1.1" >1.1</el-option>
                          <el-option value="1.05" >1.05</el-option>
                          <el-option value="1">1</el-option>
                          <el-option value="0.95" >0.95</el-option>
                          <el-option value="0.9" >0.9</el-option>
                          <el-option value="0.85" >0.85</el-option>
                          <el-option value="0.8" >0.8</el-option>
                          <el-option value="0.75" >0.75</el-option>
                          <el-option value="0.7" >0.7</el-option>
                          <el-option value="0.65" >0.65</el-option>
                          <el-option value="0.6" >0.6</el-option>
                          <el-option value="0.55" >0.55</el-option>
                          <el-option value="0.5" >0.5</el-option>
                          <el-option value="0.45" >0.45</el-option>
                          <el-option value="0.4" >0.4</el-option>
                          <el-option value="0.35" >0.35</el-option>
                          <el-option value="0.3" >0.3</el-option>
                          <el-option value="0.25" >0.25</el-option>
                          <el-option value="0.2" >0.2</el-option>
                          <el-option value="0.15" >0.15</el-option>
                          <el-option value="0.1" >0.1</el-option>
                      </el-select>
                      <div style="width:160px;text-align: center;"> ={{ row.yshl_pl }}%</div>
                  </div>
              </template>
              <template #zbd_pl="{row}">
                  <el-input type="number" v-model="row.zbd_pl" placeholder="" />
              </template>
              <template #status="{row}">
                  <el-select v-model="row.status">
                      <el-option  :value="0" :label="$t('关闭')" />
                      <el-option :value="1" :label="$t('售停')"/>
                      <el-option :value="2" :label="$t('开启')"/>
                  </el-select>
              </template>
              <template #indemnity="{row}">
                  <el-select v-model="row.indemnity">
                      <el-option  :value="0" :label="$t('关闭')" />
                      <el-option :value="1" :label="$t('开启')"/>
                  </el-select>
              </template>
              <template #water="{row}">
                  <el-input type="number" v-model="row.water" placeholder="" />
              </template>
              <template #recommend="{row}">
                  <el-select v-model="row.recommend">
                      <el-option  :value="0" :label="$t('否')" />
                      <el-option :value="1" :label="$t('是')"/>
                  </el-select>
              </template>
          </pure-table>

           <el-button style="margin-top:20px;" type="primary" @click="bdSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>
        <el-tab-pane label="水位/注额设置">
          <pure-table :data="bdsetListBox.bdsetList1" width="100%"   :columns="bdColums2">
              <template #score="{ row }">
                  <div>{{ row.zd }}-{{ row.kd  }}</div>
              </template>
              <template #trading="{row}">
                  <el-input type="number" v-model="row.trading" placeholder="" />
              </template>
              <template #danzhu_zd="{row}">
                  <el-input type="number" v-model="row.danzhu_zd" placeholder="" />
              </template>
              <template #danzhu_zg="{row}">
                  <el-input type="number" v-model="row.danzhu_zg" placeholder="" />
              </template>
              <template #danxiang_zg="{row}">
                  <el-input type="number" v-model="row.danxiang_zg" placeholder="" />
              </template>
          </pure-table>
           <el-button  style="margin-top:20px;" type="primary" @click="bdSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>
      </el-tabs>

    </el-dialog>

    <el-dialog v-model="visible" width="80%" :title="$t('添加')">
         <el-tabs type="border-card">
          <el-tab-pane :label="$t('基本设置')">
              <el-form
                ref="ruleFormRef"
                :model="basicSet"
                status-icon
                :rules="rulesRules"
                :inline="true"
                label-width="120px"
                class="demo-ruleForm"
              >
                <el-form-item :label="item.label" :prop="item.prop" v-for="item,index in basicSet" :key="index" v-show="item.show">
                  <template v-if="item.type == 'ls_name'">
                      <div class="flex-fi">
                          <el-input v-model="item.value" @change="setCurrentChange($event,index)" :placeholder="item.placeholder" />
                          <el-button style="margin-left: 20px;" type="primary" @click="selectLiansai">{{ $t('选择联赛') }}</el-button>
                      </div>
                  </template>
                  <template v-if="item.type == 'ls_team_zname'">
                      <div class="flex-fi">
                          <el-input v-model="item.value" @change="setCurrentChange($event,index)" :placeholder="item.placeholder" />
                          <el-button style="margin-left: 20px;" type="primary" @click="selectTema(1)">{{ $t('选择主队') }}</el-button>
                      </div>
                  </template>
                  <template v-if="item.type == 'ls_team_kname'">
                      <div class="flex-fi">
                          <el-input v-model="item.value" @change="setCurrentChange($event,index)" :placeholder="item.placeholder" />
                          <el-button style="margin-left: 20px;" type="primary" @click="selectTema(2)">{{ $t('选择客队') }}</el-button>
                      </div>
                  </template>
                  <template v-if="item.type == 'switch'">
                       <div>
                        <el-switch
                          @change="setCurrentChange($event,index)"
                          v-model="item.value"
                          :active-value="1"
                          :inactive-value="0"
                          inline-prompt
                          :active-text="$t('热门')"
                          :inactive-text="$t('一般')"
                        />
                      </div>
                  </template>
                  <template v-if="item.type  == 'radio'">
                     <div class="flex-fi">
                           <el-radio-group    v-model="item.value"  @change="setCurrentChange($event,index)" >
                              <el-radio :label="1" size="large">{{ $t('显示') }}</el-radio>
                              <el-radio :label="0" size="large">{{ $t('不显示') }}</el-radio>
                          </el-radio-group>
                     </div>
                  </template>
                  <template v-if="item.type == 'time'">
                      <el-date-picker
                          v-model="item.value"
                          type="datetime"
                          :placeholder="item.placeholder"
                          @change="setCurrentChange($event,index)"
                        />
                  </template>
                  <template v-if="item.type == 'input'">
                    <el-input  v-model="item.value" :placeholder="item.placeholder"  @change="setCurrentChange($event,index)" />
                    <!-- <div v-if="item.tip">{{ item.tip }}</div> -->
                  </template>

                </el-form-item>
                <div style="margin-left:120px">
                  <el-button type="primary" @click="eidtSave">{{ $t('保存') }}</el-button>
                </div>
              </el-form>
          </el-tab-pane>
          <el-tab-pane :label="$t('波胆设置')">
               <pure-table :data="bdBox.bdList" width="100%"   :columns="bdColumns" >
                <template #bdright="{index}">
                      <el-button size="small" type="danger" @click="dbDelete(index)">{{ $t('删除') }}</el-button>
                  </template>
                  <template #zd="{row}">
                      <el-input v-model="row.zd" @change="bdInput($event,row,1)" :placeholder="$t('主队')" />
                  </template>
                  <template #kd="{row}">
                      <el-input v-model="row.kd" @change="bdInput($event,row,2)" :placeholder="$t('客队')" />
                  </template>
              </pure-table>
              <el-button style="margin-top:20px;" type="primary" size="large" @click="addbd">{{ $t('添加波胆') }}</el-button>
          </el-tab-pane>
        </el-tabs>
    </el-dialog>
    <el-dialog width="80%" v-model="selectTemaShow" :title="$t('选择联赛')">
          <div style="padding-bottom:30px;" v-if="currentRow.ls_id">
            <component @select="temaSelect" :ls_id="currentRow.ls_id" :backSelect="true" :is="defineAsyncComponent(()=> import('@/views/games/team.vue'))"/>
          </div>
    </el-dialog>
     <el-dialog width="80%" v-model="selectShow" :title="$t('选择联赛')">
          <div style="padding-bottom:30px;">
            <component @select="liansaiSelect" :backSelect="true" :is="defineAsyncComponent(()=> import('@/views/games/leaguemanage.vue'))"/>
          </div>
    </el-dialog>
     <!-- <commDialog title="编辑" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >

    </commDialog> -->
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
     <template #status="{ row }">
          <el-button size="small" type="danger"  v-if="row.status == 0" @click="statusChange(1,row)">{{ $t('不显示') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.status == 1" @click="statusChange(0,row)">{{ $t('显示') }}</el-button>
      </template>
    <template #is_hot="{ row }">
          <!-- <el-button size="small" type="primary" plain v-if="row.is_hot == 0">{{ $t('一般') }}</el-button>
          <el-button size="small" type="primary" plain v-if="row.is_hot == 1">{{ $t('热门') }}</el-button> -->
          <el-switch
            @change="swithChange($event,row)"
            v-model="row.is_hot"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
            :active-text="$t('热门')"
            :inactive-text="$t('一般')"
          />
      </template>
    <template #res_status="{ row }">
          <el-button size="small" type="danger"  v-if="row.res_status == 1">{{ $t('未结算') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.res_status == 2">{{ $t('已结算') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.res_status == 3">{{ $t('结算中') }}</el-button>
      </template>
       <template #right="{ row }">
          <el-button size="small" type="primary" @click="eidtShow(row)">{{ $t('编辑') }}</el-button>
          <el-button size="small" type="primary" @click="bdhandleShow(row)">{{ $t('波胆赔率设定') }}</el-button>
          <el-button size="small" type="primary" @click="updataBD(row)">{{ $t('更新波胆') }}</el-button>
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
</style>
