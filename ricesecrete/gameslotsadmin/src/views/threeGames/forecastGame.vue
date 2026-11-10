<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { forecastGameList,forecastGameEdit,forecastGameAdd,forecastGameDelete } from "@/api/user";
import { message } from "@/utils/message";
import { http } from '@/utils/http';
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'pddList'
})

const props = defineProps({
  id:String,
})
const forecastId = computed(() => {
  return props.id ? props.id : 0;
})
console.log(forecastId.value);

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
  },
  {
    label: transformI18n("平台名称"),
    prop: "platform_name",
  },
  {
    label: transformI18n("游戏名称"),
    prop: "game_name",
  },
  {
    label: transformI18n("游戏封面"),
    prop: "game_img",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={ row.game_img } alt="" />
      </div>
    )
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
  },
  {
    label: transformI18n("时间周期（单位：分钟）"),
    prop: "time",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  platform_name:{
    type: 'input',
    label:'平台名称',
    placeholder:'平台名称',
    prop: 'platform_name',
    value: '',
  },
  game_name:{
    type: 'input',
    label:'游戏名称',
    placeholder:'游戏名称',
    prop: 'game_name',
    value: '',
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
  sort: 0,//总数
  forecast_id: forecastId.value,//预测id
  game_name: '',//游戏名称
  platform_name: '',//游戏名称
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  forecastGameList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
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
  game_ids:{
    type: 'slot',
    label: '游戏ID',
    placeholder: '游戏ID',
    value: '',
    prop: 'game_ids',
    name: 'game_ids',
    show: false,
  },
  time:{
    type: 'input',
    label: '时间周期',
    placeholder: '时间周期',
    tip: '单位：分钟',
    value: '',
    prop: 'time',
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    tip: "排序：数字越大排序越靠前",
    value: 0,
    prop: 'sort',
    name: 'sort',
  },
}
const dialogModel = reactive({
  id: '',
  game_ids: '',
  forecast_id: forecastId.value,//预测id
  time: '',
  sort: 0,
})

const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}

const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  list2Box.dialogList['game_ids'].show = true
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  forecastGameEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
            dialogList[key].value = res.data[key]
            list2Box.dialogList[key].value = res.data[key]
          }
          dialogModel[key] = res.data[key]
       }
        console.log(list2Box.dialogList)
        console.log(dialogModel)
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
    forecastGameEdit(query).then((res: any) => {
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
    forecastGameAdd(query).then((res: any) => {
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
    if (key == 'forecast_id') {
      continue;
    }else if( key == 'id' ){
      dialogModel[key] = ''
      continue;
    }else if( key == 'sort' ){
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  list2Box.dialogList['game_ids'].show = false
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
  forecastGameDelete(query).then((res: any) => {
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
const eidtGameIds = (val) => {
  dialogModel.game_ids = val;
  list2Box.dialogList.game_ids.value = val;
  selectShow.value = false
    console.log(dialogModel)
}
const selectGame = () => {
    selectShow.value = true
}
</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
     <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :back="true" @backSelect="eidtGameIds" :is="defineAsyncComponent(()=> import('@/views/threeGames/gameManage.vue'))"/>
          </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
        <template v-slot:game_ids>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.game_ids" @change="eidtGameIds($event)" :placeholder="$t('游戏')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectGame">{{ $t('选择游戏') }}</el-button>
            </div>
        </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #right="{row}">
          <el-button size="small" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
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
  padding-bottom:20px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
