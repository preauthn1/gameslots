<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { payAgentLists,payAgentDelete,payAgentAdd,payAgentRecord,payAgentEdit } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'payagentList'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("银商ID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  },
  {
    label: transformI18n("真实姓名"),
    prop: "realname",
  }, {
    label: transformI18n("账号"),
    prop: "username",
  },{
    label: transformI18n("昵称"),
    prop: "nickname",
  },{
    label: transformI18n("余额"),
    prop: "balance",
  },{
    label: transformI18n("银商状态"),
    slot: "status",
  },{
    label: transformI18n("工作状态"),
    slot: "isopen",
  },{
    label: transformI18n("排序"),
    prop: "sort",
  },
  {
    label: transformI18n("操作"),
    width:'150px',
    fixed:'right',
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button>
        <el-button v-show={hasAuth('record')} size="small" type="primary" onClick={() => handleMinxi(row)}>
          { transformI18n('明细') }
        </el-button>
      </>
    )
  }
];

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
  order: 'desc',//排序 desc 或 asc
  field: 'id',//排序字段 id 或 balance
  issue_number:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  payAgentLists(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
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
  pagination.page = 1;
  init(pagination);
}

//弹框写法
const visible = ref(false);
const dialogList = {
  realname:{
    type: 'input',
    label: '真实姓名',
    placeholder: '真实姓名',
    value: '',
    prop:'realname'
  },
  nickname:{
    type: 'input',
    label: '昵称',
    placeholder: '昵称',
    value: '',
    prop:'nickname'
  },
  username:{
    type: 'input',
    label: '账号',
    placeholder: '账号',
    value: '',
    prop: 'username',
    tip: '确认不可修改'
  },
  password:{
    type: 'input',
    label: '密码',
    placeholder: '密码',
    value: '',
    prop:'password'
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
      {
        label: 1,
        name:'启用'
      }, {
        label: 0,
        name:'禁止'
      },
    ],
    prop:'status'
  },
   sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
     value: 0,
    ty:'number',
    prop: 'sort'
  },
}
const dialogModel = reactive({
  realname:'',
  nickname:'',
  username:'',
  password:'',
  status:1,
  sort:0,
  id:''
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
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  payAgentEdit(query).then((res: any) => {
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


const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    payAgentEdit(query).then((res: any) => {
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
    payAgentAdd(query).then((res: any) => {
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
     dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
        if (key == 'status') {
          list2Box.dialogList[key].value = 1
          dialogModel[key] = 1
        } else if (key == 'sort') {
          list2Box.dialogList[key].value = 0
          dialogModel[key] = 0
        } else {
         list2Box.dialogList[key].value = ''
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
  payAgentDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}


const minxiShow = ref(false);
const minxiId = ref('');
const handleMinxi = (row) => {
  minxiId.value = row.id
  minxiShow.value = true
}
</script>

<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button type="danger" v-if="hasAuth('delete')" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <el-dialog width="80%" v-model="minxiShow" :title="$t('明细')">
          <div style="padding-bottom:30px;">
            <component :id="minxiId" :is="defineAsyncComponent(()=> import('@/views/payset/details.vue'))"/>
          </div>
    </el-dialog>
    <commDialog title="编辑" width="50%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{row}">
        <el-tag size="small" v-if="row.status ==1" type="success">{{ $t('开启') }}</el-tag>
        <el-tag size="small" v-else type="danger">{{ $t('禁止') }}</el-tag>
      </template>
      <template #isopen="{row}">
        <el-tag size="small" v-if="row.isopen ==1" type="success">{{ $t('开启') }}</el-tag>
        <el-tag size="small" v-else type="danger">{{ $t('关闭') }}</el-tag>
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
