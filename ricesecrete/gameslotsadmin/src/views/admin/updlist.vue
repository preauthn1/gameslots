<script setup lang="tsx">
import { reactive,ref, getCurrentInstance } from "vue";
import { systemUpdlist,systemUpdAdd, systemUpdEditStatus } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    label: transformI18n("开始时间"),
    prop: "start_time",
  },{
    label: transformI18n("结束时间"),
    prop: "end_time",
  }, {
    label: transformI18n("标题"),
    prop: "title",
  },{
    label: transformI18n("状态"),
    slot: "status",
  }, {
    label: transformI18n("最后更新"),
    prop: "admin_name",
  }
];

const handleEdit = (index,row) => {

}

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
  select:true
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  systemUpdlist(pagination).then((res:any) => {
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

//弹框写法
const visible = ref(false);
const dialogList = {
  start_time:{
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
  title:{
    type: 'input',
    label: '公告标题',
    placeholder: '公告标题',
    value: '',
    prop:'title'
  },
  content:{
    type: 'input',
    label: '公告内容',
    placeholder: '公告内容',
    value: '',
    ty:'textarea',
    prop:'content'
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
      {
        label: 1,
        name:'激活'
      }, {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'status'
  },

}
const dialogModel = reactive({
  start_time:'',
  end_time:'',
  title:'',
  content:'',
  status:0,
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

const handleSave = () => {
  const query = {
    add: true,
    info:dialogModel
  }
  systemUpdAdd(query).then((res:any)=>{
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
      init();
      } else {
      message(res.msg, { type: 'error' });
  }
  })
}
//添加
const handleAdd = () => {
  for (const key in dialogModel) {
     dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
        if (key == 'status') {
          list2Box.dialogList[key].value = 0
          dialogModel[key] = 0
       } else {
         list2Box.dialogList[key].value = ''
       }

     }
    }
  visible.value = true;
}

const handleStuats = (row,val) => {
  proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
    statusChage(row.id,val);
  }).catch(() => {
    console.log('取消');
  })
}
function statusChage(id,status) {
  const query = {
    edit: true,
    info: {
      id,
      status
    }
  }
  systemUpdEditStatus(query).then((res: any) => {
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
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>

        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>

    </div>
    <commDialog title="编辑" width="60%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
      <template #status="{ row }">
        <el-tooltip class="item" effect="dark" :content="$t('点击可修改状态')" placement="top">
          <el-tag size="small" type="success" v-if="row.status == 1" @click="handleStuats(row,0)">{{ $t('启用') }}</el-tag>
          <el-tag size="small" type="danger" v-else @click="handleStuats(row,1)">{{ $t('关闭') }}</el-tag>
        </el-tooltip>
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
</style>
