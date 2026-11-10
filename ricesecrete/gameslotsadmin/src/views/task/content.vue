<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { taskContentLists,taskContentEdit,taskContentAdd,taskContentDelete } from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
  },{
    label: transformI18n("标题"),
    prop: "title",
  },  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button>
      </>
    )
  }
];


const props = defineProps({
  id:String,
})
const task_id = computed(() => {
  return props.id;
})

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  issue_number:{
    type: 'input',
    placeholder: '期号',
    value: '',
    prop:'issue_number'
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
  task_id: task_id.value,
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  taskContentLists(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    list2Box.dialogList.lang.options = res.langs
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
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '请选择语种',
    value: '',
    options: [],
    prop: 'lang'
  },
  title: {
    type: 'input',
    label: '标题',
    placeholder: '标题',
    value: '',
    prop: 'title'
  },
  introduce: {
    type: 'input',
    label: '简介',
    placeholder: '简介',
    value: '',
    prop: 'introduce'
  },

}
const dialogModel = reactive({
  title: '',
  lang: '',
  introduce: '',
  task_id: task_id.value,
  id:''
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

const clickCurrentIndex = ref(1);
  //编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    id:row.id
  }
  taskContentEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.id = res.data.id;
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
    if (dialogList[key].type == 'radio') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }

  }
  dialogModel.id = '';
  visible.value = true;
}

//保存
const handleSave = () => {
  let query = {};
  let api = taskContentEdit;
  if (clickCurrentIndex.value == 1) {
    query = {
      edit: true,
      info: dialogModel
    }
  } else {
    query = {
      add: true,
      info: {
        task_id: task_id.value,
        lang: dialogModel.lang,
        title: dialogModel.title,
        introduce: dialogModel.introduce,
      }
    }
    api = taskContentAdd
  }

  api(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      visible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })

}

//选中删除
let selectAll = [];
const handleSelectionChange = (val) => {
  selectAll = val;
}
const handleDelete = () => {
  if (selectAll.length > 0) {
    deleteCurrent(getIds());
  } else {
    message('请选择用户', { type: 'warning' });
  }
}
const getIds =()=>{
      const s_arr = [];
      selectAll.forEach(item => {
        s_arr.push(item.id)
      })
  return s_arr.join(',');
}
const deleteCurrent = (id) => {
      proxy.$confirm('确认删除吗？', '提示').then(() => {
        selectDelete(id);
        }).catch(() => {
          console.log('取消');
    })
}
function selectDelete(id) {
  const queryDelte = {
    delete: true,
    id
  }
  taskContentDelete(queryDelte).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
       init();
    }
  })
}
</script>

<template>
  <div style="padding-bottom: 40px;">
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <!-- <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"></commSerach> -->
      </div>
    </div>
    <commDialog title="基础信息" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >

      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange"/>
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
  padding-bottom: 30px;
}
</style>
