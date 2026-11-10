<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { musicList,musicEdit,musicAdd,musicDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'musicList'
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
    label: transformI18n("大小(KB)"),
    prop: "size",
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
    fixed: "right",
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  name:{
    type: 'input',
    placeholder: '名称',
    value: '',
    prop:'name'
  },
  status: {
    type: 'select',
    label: '状态',
    placeholder: '状态',
    prop: 'status',
    options: [
      {
        label: '禁用',
        value: 0,
      }, {
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
  name:'',
  status:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  musicList(pagination).then((res:any) => {
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
  name: {
    type: 'fileNameInput',
    filetype: 'video',
    label: '上传文件`',
    placeholder: '上传文件',
    value: '',
    prop: 'name'
  },
  status: {
    type: 'radio',
    value: 1,
    label: '状态',
    placeholder: '状态',
    prop: 'status',
    options: [
      {
        label: 0,
        name: '禁用'
      },
      {
        label: 1,
        name: '启用'
      },
    ]
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序（越大越靠前）',
    value: 1,
    prop:'sort'
  },

}
const dialogModel = reactive({
  name: '',
  file: '',
  size: '',
  sort: 1,
  status: 1,
  id:''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if( index == 'name' ){
    if(value.name){
      list2Box.dialogList['name'].value = value.name;
      dialogModel['name'] = value.name;
      dialogModel['file'] = value.file;
      dialogModel['size'] = value.size;
    }else{
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
    }
  }else{
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
  musicEdit(query).then((res: any) => {
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
    musicEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  } else {
    //判断是否上传文件
    if(!dialogModel['file']){
        message('请先上传文件', { type: 'error' });
        return false
    }
     const query = {
      add: true,
      info: dialogModel
    }
    musicAdd(query).then((res: any) => {
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
     if (key =='sort' || key =='status') { 
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
     }else if (key == dialogList[key]?.prop) {
       list2Box.dialogList[key].value = ''
       dialogModel[key] = ''
     } else {
      dialogModel[key] = ''
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
  musicDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//首充图片返回
const backImage = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
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
      </div>
    </div>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      
      <template v-slot:icon>
          <uploadImage @imageData="backImage" :image="dialogModel.icon" :limit="1" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('启用') }}</el-tag>
        <el-tag size="small" type="danger" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
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
}
.line-box{
  margin-bottom: 10px;
}
</style>
