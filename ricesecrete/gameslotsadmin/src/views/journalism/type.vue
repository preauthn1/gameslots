<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
import { journalismTypeList, journalismTypeEdit, journalismTypeDelete, journalismTypeAdd } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'journalismType'
})
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    width: "100"
  },
  {
    label: transformI18n("名称"),
    prop: "name",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
      </>
    )
  },
];
//弹框写法
const visible = ref(false);
const dialogList = {
  name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name'
  },
  status: {
    type: 'radio',
    label: '显示',
    placeholder: '显示',
    value: 0,
    prop: 'status',
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
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort'
  },
}
const dialogModel = reactive({
  id:'',
  name:'',
  sort:'',
  status:'',
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
  journalismTypeEdit(query).then((res: any) => {
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
  let api = journalismTypeEdit;
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
    api = journalismTypeAdd;
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
const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  journalismTypeList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
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

//点击确定
const handleBtn = () => {
  pagination.page = 1;
  init(pagination);
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
      arr.push(item.id);
    })
    deleteIds(arr.join(','))
  }).catch(() => {
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
  journalismTypeDelete(query).then((res: any) => {
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
</script>
<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi"/>
    </div>
    <commDialog title="新闻" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="danger" v-if="row.status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
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
