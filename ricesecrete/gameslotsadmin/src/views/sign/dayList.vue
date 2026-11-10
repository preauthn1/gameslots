<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { signDayList,signDayEdit,signDayAdd,signDayDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { Sign } from "crypto";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'signDayList'
})

const props = defineProps({
  id:String,
})
const signId = computed(() => {
  return props.id ? props.id : 0;
})

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("天数"),
    prop: "day",
  },
  {
    label: transformI18n("奖励模式"),
    slot: "reward_mode",
  },
  {
    label: transformI18n("奖励类型"),
    slot: "reward_type",
  },
  {
    label: transformI18n("奖励金额"),
    prop: "reward_amount",
  },
  {
    label: transformI18n("奖励积分"),
    prop: "reward_integral",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  day:{
    type: 'input',
    label:'天数',
    placeholder:'天数',
    prop: 'day',
    value: '',
  },
  reward_mode:{
    type: 'select',
    label:'奖励模式',
    placeholder:'奖励模式',
    prop:'reward_mode',
    options: [
      {
        label: '每日领取',
        value: 0,
      },
      {
        label: '累计领取',
        value: 1,
      },
    ]
  },
  reward_type:{
    type: 'select',
    label:'奖励类型',
    placeholder:'奖励类型',
    prop:'reward_type',
    options: [
      {
        label: '固定金额',
        value: 0,
      },{
        label: '奖励占比%',
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
  day:'',//天数
  reward_mode:'',//奖励模式
  reward_type:'',//奖励类型
  sign_id: signId,//签到id
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  signDayList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
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
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  day:{
    type: 'input',
    label: '天数',
    placeholder: '天数',
    value: '',
    prop: 'day',
  },
  reward_mode:{
    type: 'radio',
    value: 0,
    label:'奖励模式',
    placeholder:'奖励模式',
    prop: 'reward_mode',
    show: false,
    options: [
      {
        label: 0,
        name:'每日领取'
      },
      {
        label: 1,
        name:'累计领取'
      },
    ]
  },
  reward_type:{
    type: 'radio',
    value: 0,
    label:'奖励类型',
    placeholder:'奖励类型',
    prop:'reward_type',
    show: false,
    options: [
      {
        label: 0,
        name:'固定金额'
      },
      {
        label: 1,
        name:'奖励占比%'
      },
    ]
  },
  reward_amount:{
    type: 'input',
    label: '奖励金额',
    placeholder: '奖励金额',
    value: '',
    show: false,
    prop: 'reward_amount',
  },
  savings:{
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: 1,
    show: false,
    prop: 'savings',
  },
  reward_integral:{
    type: 'input',
    label: '奖励积分',
    placeholder: '奖励积分',
    value: '',
    show: false,
    prop: 'reward_integral',
  },
}
const dialogModel = reactive({
  id: '',
  sign_id: signId.value,
  day: '',
  reward_mode: 0,
  reward_type: 0,
  reward_amount: 0,
  reward_integral: 0,
  savings: 1,
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'sign_id') {
    return;
  }
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}

const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  signDayEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
            dialogList[key].value = res.data[key]
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

const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    signDayEdit(query).then((res: any) => {
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
    signDayAdd(query).then((res: any) => {
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
  console.log(dialogModel)
  for (const key in dialogModel) {
    if( key == 'id' ){
      dialogModel[key] = ''
      continue;
    }
    if ( key == 'sign_id' ) { 
      continue;
    }
    if ( key == 'savings' ) {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else if ( key == 'reward_mode' || key == 'reward_type' ) {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  console.log(dialogModel)
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
  signDayDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #reward_mode="{ row }">
         <el-tag size="small" type="success"  v-if="row.reward_mode == 0">{{ $t('每日领取') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.reward_mode == 1">{{ $t('累计领取') }}</el-tag>
      </template>
      <template #reward_type="{ row }">
         <el-tag size="small" type="success"  v-if="row.reward_type == 0">{{ $t('固定金额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.reward_type == 1">{{ $t('奖励占比%') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
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
  padding-bottom:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
