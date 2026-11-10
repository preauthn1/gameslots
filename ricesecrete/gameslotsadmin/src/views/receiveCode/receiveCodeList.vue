<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { receiveCodeList,receiveCodeEdit,receiveCodeAdd,receiveCodeDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gonggaoList'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
    width: 150,
  },
  {
    label: transformI18n("标题"),
    prop: "title",
    width: 150,
  },
  {
    label: transformI18n("领取码"),
    prop: "code",
    width: 150,
  },
    {
    label: transformI18n("关联标签"),
    prop: "tag_list",
    width: 150,
    slot: 'tag'
  },
  {
    label: transformI18n("可领取次数"),
    prop: "receive_num",
    width: 150,
  },
  {
    label: transformI18n("每人限领次数"),
    prop: "everyone_receive_num",
    width: 150,
  },
  {
    label: transformI18n("每人每天限领次数"),
    prop: "per_person_per_day_receive_num",
    width: 150,
  },
  {
    label: transformI18n("相同ip领取数量"),
    prop: "receive_ip_num",
    width: 150,
  },
  {
    label: transformI18n("参与条件"),
    slot: "receive_condition",
  },
  {
    label: transformI18n("条件时间"),
    slot: "condition_date_type",
  },
  {
    label: transformI18n("金额类型"),
    slot: "amount_type",
    width: 150,
  },
  {
    label: transformI18n("奖励金额"),
    prop: "reward_amount",
    width: 150,
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
    width: 150,
  },
  {
    label: transformI18n("时间"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.start_time} <br/>
        {row.end_time}
      </div>
    )
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
    width: 150,
  },
  {
    label: transformI18n("状态"),
    slot: "status",
    width: 150,
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: 150,
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  title:{
    type: 'input',
    placeholder: '标题',
    value: '',
    prop:'title'
  },
  code:{
    type: 'input',
    placeholder: '领取码',
    value: '',
    prop:'code'
  },
  receive_condition:{
    type: 'select',
    label:'参与条件',
    placeholder:'参与条件',
    prop:'receive_condition',
    options: [
      {
        label: '首充金额',
        value: 1,
      },
      {
        label: '单笔金额',
        value: 2,
      },
      {
        label: '累计金额',
        value: 3,
      },
    ]
  },
  condition_date_type:{
    type: 'select',
    label:'条件时间',
    placeholder:'条件时间',
    prop:'condition_date_type',
    options: [
      {
        label: '所有',
        value: 0,
      },{
        label: '上月',
        value: 1,
      },{
        label: '本月',
        value: 2,
      },{
        label: '昨天',
        value: 3,
      },{
        label: '今天',
        value: 4,
      },{
        label: '本周',
        value: 5,
      },{
        label: '七天内',
        value: 6,
      },
    ]
  },
  amount_type:{
    type: 'select',
    label:'金额类型',
    placeholder:'金额类型',
    prop:'amount_type',
    options: [
      {
        label: '普通',
        value: 0,
      },{
        label: '累计',
        value: 1,
      },
    ]
  },
  status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: '禁用',
        value: 0,
      },{
        label: '启用',
        value: 1,
      },
    ]
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

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  title:'',//标题
  code:'',//领取码
  receive_condition:'',//领取条件
  condition_date_type:'',//条件时间
  amount_type:'',//金额类型
  status:'',//状态
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  receiveCodeList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    list2Box.dialogList.lang.options = res.langs
    list2Box.dialogList.level_id.options = [{ label: "不限", value: 0 }].concat(res.vip)
    list2Box.dialogList.tag_id.options = [{ label: "不限", value: 0 }].concat(res.tags)
    // const tags = res.tags
    // const tags2 = {}
    // for(const i in tags){
    //     tags2[tags[i]['value']] = tags[i]['label']
    // }
    // console.log(tags2)
    // list2Box.dialogList.tag_list.options = tags2
    list2Box.dialogList.tag_list.options = res.tags
    // pagination.page = res.data.current_page
  })
}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init(pagination);
};

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  console.log('点击');
  //搜索列表 没有日期的写法
    for (const key in pagination) {
        if (key == searchList[key]?.prop) {
          pagination[key] = searchList[key].value;
        }
  }
    //搜索列表 有日期的写法

  // for (var key in pagination) {
  //   if (key == list[key]?.prop) {
  //     if (key == 'date') {
  //       let val = list[key].value;
  //       const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  //       pagination[key] =  time;
  //     } else {
  //       pagination[key] = list[key].value
  //     }
  //   }
  // }
    pagination.page = 1;
    init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  title:{
    type: 'input',
    label: '标题',
    placeholder: '标题',
    value: '',
    prop:'title'
  },
  // introduce:{
  //   type: 'input',
  //   label: '简介',
  //   placeholder: '简介',
  //   value: '',
  //   prop:'introduce'
  // },
  lang:{
    type: 'select',
    label: '公告语种',
    placeholder: '公告语种',
    value: '',
    clearable:true,
    options:[],
    prop:'lang'
  },
  //  image: {
  //   type: 'slot',
  //   name: 'image',
  //   value: '',
  //   label: '封面',
  //   prop: 'image'
  // },
  //  content:{
  //   type: 'slot',
  //   label: '内容',
  //   placeholder: '内容',
  //   value: '',
  //   name:'content',
  //   prop:'content'
  // },
  receive_condition:{
    type: 'radio',
    value: 1,
    label:'参与条件',
    placeholder:'参与条件',
    prop:'receive_condition',
    options: [
      {
        label: 1,
        name:'首充金额'
      },
      {
        label: 2,
        name:'单笔金额'
      },
      {
        label: 3,
        name:'累计金额'
      },
    ]
  },
  condition_date_type:{
    type: 'radio',
    value: 0,
    label:'条件时间',
    placeholder:'条件时间',
    prop:'condition_date_type',
    options: [
      {
        label: 0,
        name:'所有'
      },
      {
        label: 1,
        name:'上月'
      },
      {
        label: 2,
        name:'本月'
      },
      {
        label: 3,
        name:'昨天'
      },
      {
        label: 4,
        name:'今天'
      },
      {
        label: 5,
        name:'本周'
      },
      {
        label: 6,
        name:'七天内'
      },
    ]
  },
  recharge_amount:{
    type: 'input',
    label: '对应金额',
    placeholder: '对应金额',
    value: '',
    prop: 'recharge_amount',
    show: false,
  },
  agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
  },
  start_time: {
    type: 'time',
    label: '开始时间',
    placeholder: '开始时间',
    value: '',
    prop:'start_time'
  },
  end_time:{
    type: 'time',
    label: '结束时间',
    placeholder: '结束时间',
    value: '',
    prop:'end_time'
  },
  receive_num:{
    type: 'input',
    label: '可领取次数',
    placeholder: '可领取次数',
    value: '',
    prop:'receive_num'
  },
  everyone_receive_num:{
    type: 'input',
    label: '每人限领次数',
    placeholder: '每人限领次数',
    value: '',
    prop:'everyone_receive_num'
  },
  per_person_per_day_receive_num:{
    type: 'input',
    label: '每人每天限领次数',
    placeholder: '每人每天限领次数',
    tip: '0为不限制',
    value: '',
    prop:'per_person_per_day_receive_num'
  },
  level_id:{
    type: 'select',
    label: '可领取等级',
    placeholder: '可领取等级',
    value: 0,
    options:[],
    prop:'level_id'
  },
  tag_id:{
    type: 'select',
    label: '可领取标签',
    placeholder: '可领取标签',
    value: 0,
    options:[],
    prop:'tag_id'
  },
  receive_savings:{
    type: 'input',
    label: '流水限制',
    placeholder: '流水限制',
    tip: '设置后达到该流水后才能领取',
    value: '',
    prop:'receive_savings'
  },
  amount_type:{
    type: 'radio',
    label: '金额类型',
    placeholder: '金额类型',
    tip: '普通为所有人领取都是一样的金额，累计为所有领取的总金额',
    value: 0,
    options: [
      {
        label: 0,
        name:'普通'
      },{
        label: 1,
        name:'累计'
      }
    ],
    prop:'amount_type'
  },
  reward_amount:{
    type: 'input',
    label: '奖励金额',
    placeholder: '奖励金额',
    tip: '使用随机可用-隔开，例：9-10领取金额为随机9-10之间的金额',
    value: '',
    prop:'reward_amount'
  },
  receive_ip_num:{
    type: 'input',
    label: '相同ip领取数量',
    placeholder: '相同ip领取数量',
    tip: '为0不限制',
    value: '',
    prop:'receive_ip_num'
  },
  savings:{
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: '',
    prop:'savings'
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '数值越大越靠前',
    value: '',
    prop:'sort'
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 0,
    options: [
      {
        label: 1,
        name:'启用'
      }, {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'status'
  },
  tag_list:{
    type: 'checkbox2',
    label: '关联标签',
    placeholder: '关联标签',
    value: [],
    options: {},
    prop:'tag_list'
  },
  is_auto:{
    type: 'radio',
    label:'是否自动领取',
    placeholder:'是否自动领取',
    tip: '开启后满足条件会自动领取',
    prop:'is_auto',
    value: 0,
    options: [
      {
        label: 0,
        name:'手动领取'
      },{
        label: 1,
        name:'自动领取'
      },
    ]
  },

}
const dialogModel = reactive({
  title:'',
  // introduce:'',
  // image:'',
  lang:'',
  receive_condition: 0,
  recharge_amount: 0,
  condition_date_type: 0,
  agent_id: 0,
  start_time:'',
  end_time:'',
  // content:'',
  sort:'',
  status:0,
  receive_savings: 0,
  amount_type:0,
  reward_amount: 0,
  savings: 1,
  level_id: 0,
  tag_id: 0,
  receive_num:1,
  everyone_receive_num:1,
  receive_ip_num:0,
  id:'',
  is_auto:0,
  per_person_per_day_receive_num: 0,
  tag_list: [],
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
      list2Box.dialogList[index].value = value?formaTime(value):'';
      dialogModel[index] = value?formaTime(value):'';
  } else {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
  }
}
const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  receiveCodeEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
       }
        visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const editorEle = (val) => {
  // list2Box.dialogList.content.value = val
}
const handleSave = () => {
  // dialogModel.content = list2Box.dialogList.content.value
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    receiveCodeEdit(query).then((res: any) => {
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
    receiveCodeAdd(query).then((res: any) => {
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
  for (const key in dialogModel) {
    if (key == 'id') {
      dialogModel[key] = ''
      continue;
    }
    if (key == dialogList[key]?.prop) {
      if (key == 'status' || key == 'receive_num' || key == 'savings' || key == 'everyone_receive_num' || key == 'receive_condition' ) {
        list2Box.dialogList[key].value = 1
        dialogModel[key] = 1
      } else if (key == 'receive_savings' || key == 'level_id' || key == 'tag_id' || key == 'receive_ip_num' || key == 'status'|| key == 'is_auto' || key == 'amount_type' || key == 'condition_date_type' || key == 'recharge_amount' || key == 'agent_id' || key == 'per_person_per_day_receive_num') { 
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
      }else if(key == 'tag_list'){
        list2Box.dialogList[key].value = []
        dialogModel[key] = []
      } else{
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
      }
    }
  }
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
  receiveCodeDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
const selectShow = ref(false);
const eidtUsername = (val) => {
  dialogModel.agent_id = val;
   list2Box.dialogList.agent_id.value = val;
}
const selectUser = () => {
    selectShow.value = true
 }

 //选择代理返回来的
const agenBackRow = (val) => {
  list2Box.dialogList.agent_id.value = val.uid
  dialogModel.agent_id = val.uid
  selectShow.value = false
}
//状态
const handleStatus = (row, val) => {
  if (!hasAuth('edit')) {
    return;
  }
  proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
    statusChage(row,val)
  }).catch(() => {
    console.log('取消');
  })
}
function statusChage(row,status) {
  const query = {
    edit: true,
    info: {
      id: row.id,
      status
    }
  }
  // gonggaoStatusEdit(query).then((res: any) => {
  //   if (res.code == 1) {
  //       message(res.msg, { type: 'success' });
  //       init();
  //     } else {
  //       message(res.msg, { type: 'error' });
  //   }
  // })
}
//图片返回
// const backImageData = (val) => {
//   dialogModel.image = val.file[0];
//   list2Box.dialogList['image'].value = val.file[0];
// }
</script>

<template>
  <div>
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
     <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component @select="agenBackRow" :select="true" :is="defineAsyncComponent(()=> import('@/components/comm/agenReportList.vue'))"/>
          </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:agent_id>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.agent_id" @change="eidtUsername($event)" :placeholder="$t('用户')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
      </template>
      <!-- <template v-slot:image>
            <uploadImage @imageData="backImageData" :image="dialogModel.image" :limit="1" />
        </template>
      <template v-slot:content>
            <component @chage="editorEle" :content="dialogModel.content" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
        </template> -->
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
        <template #status="{ row }">
          <el-tag size="small" type="danger"  v-if="row.status == 0">{{ $t('关闭') }}</el-tag>
          <el-tag size="small" type="success"  v-if="row.status == 1">{{ $t('开启') }}</el-tag>
      </template>
        <template #amount_type="{ row }">
          <el-tag size="small" type="danger"  v-if="row.amount_type == 0">{{ $t('普通') }}</el-tag>
          <el-tag size="small" type="success"  v-if="row.amount_type == 1">{{ $t('累计') }}</el-tag>
      </template>
      
      <template #receive_condition="{ row }">
         <el-tag size="small" type="success"  v-if="row.receive_condition == 1">{{ $t('首充金额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.receive_condition == 2">{{ $t('单笔金额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.receive_condition == 3">{{ $t('累计金额') }}</el-tag>
      </template>
      <template #condition_date_type="{ row }">
         <el-tag size="small" type="success"  v-if="row.condition_date_type == 0">{{ $t('所有') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 1">{{ $t('上月') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 2">{{ $t('本月') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 3">{{ $t('昨天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 4">{{ $t('今天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 5">{{ $t('本周') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 6">{{ $t('七天内') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
      </template>


      <template #tag="{ row }">
        <div>
          <el-tag v-for="tag,idx in row.tag_list" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''" :type="tag.color ? '' : 'success'" :key="idx">
            {{ $t(tag.name) }}
          </el-tag>
        </div>
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
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
