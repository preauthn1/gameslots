<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { falseAccoutList,falseAccoutEdit,falseAccoutDelete,falseAccoutAdd,falseAccoutStatusEdit } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
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
    label: transformI18n("名称"),
    prop: "name",
    width: 200,
  }, {
    label: transformI18n("本金"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.b_price}
      </div>
    )
  }, {
    label: transformI18n("获利率"),
    prop: "hll",
  }, {
    label: transformI18n("总获利"),
    prop: "zhl",
  }, {
    label: transformI18n("状态"),
    slot: "status",
  }, {
    label: transformI18n("备注"),
    prop: "remarks",
  },
  {
    label: transformI18n("操作"),
    slot: 'right',
    width: '150px',
    fixed:'right'
  }
];

const emit = defineEmits(['selet'])
const props = defineProps({
  select:Boolean
})
const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  name:{
    type: 'input',
    placeholder: '期号',
    value: '',
    prop:'name'
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
  name:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  falseAccoutList(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
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
  name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop:'name'
  },
   b_price: {
    type: 'input',
    label: '本金',
    placeholder: '本金',
    value: '',
    prop:'b_price'
  },
   hll: {
    type: 'input',
    label: '获利率',
    placeholder: '获利率',
    value: '',
    prop:'hll'
  },
  zhl: {
    type: 'input',
    label: '总获利',
    placeholder: '总获利',
    value: '',
    prop:'zhl'
  },
  remarks: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    ty:'textarea',
    value: '',
    prop:'remarks'
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
      {
        label: 0,
        name:'关闭'
      },{
        label: 1,
        name:'开启'
      },
    ],
    prop:'status'
  },
}
const dialogModel = reactive({
  name: '',
  b_price: '',
  hll: '',
  zhl: '',
  remarks: '',
  status:1,
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
  falseAccoutEdit(query).then((res: any) => {
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
    falseAccoutEdit(query).then((res: any) => {
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
    falseAccoutAdd(query).then((res: any) => {
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
       } else {
         list2Box.dialogList[key].value  = ''
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
  falseAccoutDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

const selectRow = (row) => {
  emit('selet',row)
}
//状态
const handleStatus = (row,val) => {
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
  falseAccoutStatusEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}
</script>

<template>
  <div>
    <menuList />
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button> 
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
         <template #status="{ row }">
          <el-button size="small" type="danger"  v-if="row.status == 0"  @click="handleStatus(row,1)">{{ $t('关闭') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.status == 1"  @click="handleStatus(row,0)">{{ $t('开启') }}</el-button>
        </template>
        <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
          <el-button size="small" type="primary" v-if="select" @click="selectRow(row)">{{ $t('选择账号') }}</el-button>
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
<style scoped>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
