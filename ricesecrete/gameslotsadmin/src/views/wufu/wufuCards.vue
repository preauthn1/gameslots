<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { wufuCardsList,wufuCardsEdit,wufuCardsAdd,wufuCardsDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import uploadImage from '@/components/comm/uploadImage.vue'
import { hasAuth } from '@/router/utils';
import { Sign } from "crypto";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'wufuCardsList'
})

const props = defineProps({
  id:String,
})
const wId = computed(() => {
  return props.id ? props.id : 0;
})

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("名称"),
    prop: "name",
  },
  {
    label: transformI18n("封面"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={ row.image } alt="" />
      </div>
    )
  },
  {
    label: transformI18n("奖励金额"),
    prop: "amount",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("注册赠送"),
    slot: "is_register_give",
  },
  {
    label: transformI18n("几率（%）"),
    prop: "odds",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  name:{
    type: 'input',
    label:'名称',
    placeholder:'名称',
    prop: 'name',
    value: '',
  },
  is_register_give:{
    type: 'select',
    label:'是否注册赠送',
    placeholder:'是否注册赠送',
    prop:'is_register_give',
    options: [
      {
        label: '否',
        value: 0,
      },
      {
        label: '是',
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
  name:'',//名称
  is_register_give:'',//是否注册赠送
  w_id: wId,//签到id
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  wufuCardsList(pagination).then((res:any) => {
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
  name:{
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name',
  },
  image: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: '封面',
    placeholder: '封面',
    prop:'image'
  },
  amount:{
    type: 'input',
    label: '奖励金额',
    placeholder: '奖励金额',
    value: '',
    prop: 'amount',
  },
  savings:{
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: 1,
    prop: 'savings',
  },
  is_register_give:{
    type: 'radio',
    value: 0,
    label:'注册赠送',
    placeholder:'注册赠送',
    tip:'注册赠送是百分百赠送，和下面几率无关',
    prop:'is_register_give',
    options: [
      {
        label: 0,
        name:'否'
      },
      {
        label: 1,
        name:'是'
      },
    ]
  },
  type:{
    type: 'radio',
    value: 0,
    label:'卡片类型',
    placeholder:'卡片类型',
    prop:'type',
    options: [
      {
        label: 0,
        name:'普通卡片'
      },
      {
        label: 1,
        name:'关键卡片'
      },
    ]
  },
  people_condition:{
    type: 'input',
    label: '邀请人数条件',
    placeholder: '邀请人数条件',
    tip: '邀请有效人数达到后，下次抽奖必中该卡片，如果通过中奖几率中奖该卡片，后续也不会赠送',
    value: 0,
    show: true,
    prop: 'people_condition',
  },
  odds:{
    type: 'input',
    label: '中奖几率（%）',
    placeholder: '中奖几率（%）',
    tip: '不支持小数点',
    value: '',
    prop: 'odds',
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    tip: '越大越往前',
    value: 0,
    prop: 'sort',
  },
}
const dialogModel = reactive({
  id: '',
  w_id: wId.value,
  name: '',
  image: '',
  amount: '',
  savings: 1,
  is_register_give: 0,
  people_condition: 0,
  odds: '',
  sort: 0,
  type: 0,
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'w_id') {
    return;
  }
  if (index == 'type') {
    handleType(value)
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
  wufuCardsEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
            dialogList[key].value = res.data[key]
          }
          dialogModel[key] = res.data[key]
       }
       
        handleType(res.data.type)
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
    wufuCardsEdit(query).then((res: any) => {
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
    wufuCardsAdd(query).then((res: any) => {
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
    if( key == 'id' ){
      dialogModel[key] = ''
      continue;
    }
    if ( key == 'w_id' ) { 
      continue;
    }
    if ( key == 'savings' || key == 'is_register_give' ) {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else if ( key == 'sort' || key == 'people_condition' || key == 'type' ) {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  clickIndex.value = 2;
  visible.value = true;
}

const handleType = (type) => {
  if (type == '0') {
    //普通卡片
      list2Box.dialogList['people_condition'].show = true
  } else {
    //关键卡片
      list2Box.dialogList['people_condition'].show = false
  }

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
  wufuCardsDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.image = val.file[0];
  list2Box.dialogList['image'].value = val.file[0];
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
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template v-slot:upload>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.image"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #is_register_give="{ row }">
         <el-tag size="small" type="success"  v-if="row.is_register_give == 0">{{ $t('否') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.is_register_give == 1">{{ $t('是') }}</el-tag>
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
