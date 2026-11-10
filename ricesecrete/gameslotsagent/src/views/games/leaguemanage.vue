<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { liansaiList,liansaiAdd,liansaiDelete,liansaiEdit } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
const { proxy } = getCurrentInstance();
const columns = [
  {
      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("添加时间"),
      prop: "add_time",
    },
    {
      label: transformI18n("联赛名称"),
      prop: "name",
    },{
      label: transformI18n("狀態"),
      slot: "status",
    },
    {
      label: transformI18n("操作"),
      slot:'right'
    }
  ];

const emit = defineEmits(['select'])
const props = defineProps({
  backSelect: Boolean
})
console.log('展示'+emit);
const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '联赛名称',
    value: '',
    idx:0
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:2
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
  name: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  pagination.value.page = 1;
  pagination.value.name = list[0].value
  init();
}

//首次需要加载的接口
init();
function init() {
  liansaiList(pagination.value).then((res:any) => {
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
const currentStatus = ref(1);
//添加
const handleAdd = () => {
  visible.value = true
  currentStatus.value = 1;
}
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

//编辑点击确定
const handleSave = () => {
  if (currentStatus.value == 1) {
    const query = {
      add: true,
      info: {
        ...dialogModel,
      }
    }
    liansaiAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false
      }
    })
  } else {
     const query = {
      eidt: true,
      info: {
        ...dialogModel,
      }
    }
    liansaiEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false
      }
    })
  }
}
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
  liansaiDelete(queryDelte).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
       init();
    }
  })
}
//点击对付管理
const handleManage = (index,row) => {

}
//点击编辑
const handleEdit = (row) => {
    //liansaiEdit
    currentStatus.value = 2;
  for (const key in row) {
     console.log(key);
    if (key == dialogList[key]?.prop) {

      dialogList[key].value = row[key]
      dialogModel[key] = row[key]
    }
  }
  visible.value = true
}
</script>

<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
        <template #status="{ row }">
          <el-button size="small" type="primary"  v-if="row.status == 0">{{ $t('不显示') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.status == 1">{{ $t('显示') }}</el-button>
      </template>
      <template #right="{ row }">
        <!-- <el-button type="primary" size="small" @click="handleManage(index,row)">
            队伍管理
          </el-button> -->
          <el-button v-if="backSelect"
            size="small"
            type="primary"
            @click="emit('select',row);"
          >{{ $t('选择联赛') }}</el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(row)"
                   >{{ $t('编辑') }}</el-button>
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
    <commDialog title="编辑" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
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
