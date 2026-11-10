<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { urlList,urlEdit,urlAdd,urlDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'urlList'
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
    label: transformI18n("链接"),
    prop: "url",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
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
  name:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  urlList(pagination).then((res:any) => {
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
    options:[],
    prop:'name'
  },
  url:{
    type: 'input',
    label: '链接',
    placeholder: '链接',
    tip: 'https://www.cyberlive.club/#/activity-hall的链接为/activity-hall',
    value: '',
    prop:'url'
  },
  is_menu:{
    type: 'radio',
    value: 0,
    label:'是否菜单',
    placeholder:'是否菜单',
    prop: 'is_menu',
    tip: '该功能需要开启自定义菜单才会生效',
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
   icon: {
    type: 'slot',
    name: 'icon',
    value: '',
    label: '菜单图标',
    prop: 'icon',
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序（越大越靠前）',
    value: '',
    prop:'sort'
  },

}
const dialogModel = reactive({
  name: '',
  url: '',
  icon: '',
  sort: '',
  is_menu: 0,
  id:''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
      list2Box.dialogList[index].value = value?formaTime(value):'';
      dialogModel[index] = value?formaTime(value):'';
  }else {
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
  urlEdit(query).then((res: any) => {
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
    urlEdit(query).then((res: any) => {
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
    urlAdd(query).then((res: any) => {
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
     if (key =='is_menu') { 
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
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
  urlDelete(query).then((res: any) => {
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
