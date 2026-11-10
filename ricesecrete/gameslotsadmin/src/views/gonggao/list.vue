<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { gonggaoList,gonggaoEdit,gonggaoAdd,gonggaoStatusEdit,gonggaoDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import uploadImage from '@/components/comm/uploadImage.vue'
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gonggaoList'
})
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
    label: transformI18n("标题"),
    prop: "title",
    width: 150,
  },
  {
    label: transformI18n("时间"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.start_time} <br/>
        {row.end_time}
      </div>
    )
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
    width: 150,
  },
  {
    label: transformI18n("位置"),
    slot: "show_loca",
    width: 150,
  },
  {
    label: transformI18n("类型"),
    slot: "show_type",
    width: 150,
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
    width: 150,
  },
  {
    label: transformI18n("状态"),
    slot: "status",
    width: 150,
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: 150,
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  title:{
    type: 'input',
    placeholder: '标题',
    value: '',
    prop:'title'
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
  title:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  gonggaoList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    const langs = res.langs;
    const arr = []
    langs.forEach(item => {
      arr.push({ label:item.lang, value:item.lang})
    })
    list2Box.dialogList.lang.options = arr
    list2Box.dialogList.type_id.options = res.type_list
    list2Box.dialogList.jump_url.options = res.url
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
  title:{
    type: 'input',
    label: '标题',
    placeholder: '标题',
    value: '',
    prop:'title'
  },
  type_id:{
    type: 'select',
    label: '类型',
    placeholder: '类型',
    value: '',
    options:[],
    prop:'type_id'
  },
  lang:{
    type: 'select',
    label: '公告语种',
    placeholder: '公告语种',
    value: '',
    options:[],
    prop:'lang'
  },
  show_type:{
    type: 'radio',
    label: '类型',
    placeholder: '类型',
    value: 1,
    options: [
      {
        label: 1,
        name:'跑马灯'
      }, {
        label: 2,
        name:'弹窗'
      }, {
        label: 3,
        name:'顶部广告'
      },
    ],
    prop:'show_type'
  },
  agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
  },
  start_time: {
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
   content:{
    type: 'slot',
    label: '内容',
    placeholder: '内容',
    value: '',
    ty:'textarea',
    name:'content',
    prop:'content'
  },
  photo:{
    type: 'slot',
    name: 'photo',
    label: '展示图片',
    placeholder: '展示图片',
    value: '',
    prop:'photo'
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '数值越大越靠前',
    value: '',
    prop:'sort'
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 0,
    options: [
      {
        label: 1,
        name:'启用'
      }, {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'status'
  },
   show_loca:{
    type: 'radio',
    label: '显示位置',
    placeholder: '显示位置',
    value: 1,
    options: [
      {
        label: 1,
        name:'首页'
      }, {
        label: 2,
        name:'代理'
      },
    ],
    prop:'show_loca'
  },
   is_show_time:{
    type: 'radio',
    label: '前端是否显示添加时间',
    placeholder: '前端是否显示添加时间',
    value: 0,
    options: [
      {
        label: 1,
        name:'开启'
      }, {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'is_show_time'
  },
  jump_url: {
    type: 'select',
    label: '关联功能',
    placeholder: '关联功能',
    value: '',
    prop: 'jump_url',
    options: [],
  },

}
const dialogModel = reactive({
  title:'',
  type_id:'',
  lang:'',
  agent_id:'',
  start_time:'',
  end_time:'',
  content:'',
  photo:'',
  jump_url:'',
  sort:'',
  status:0,
  show_type:1,
  show_loca:1,
  is_show_time:0,
  id:''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  console.log(index, value)
  if (index == 'start_time' || index == 'end_time') {
      list2Box.dialogList[index].value = value?formaTime(value):'';
      dialogModel[index] = value?formaTime(value):'';
  } else {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
  }
  if (index == 'show_type') {
    changeContentType(value)
  }
}

const changeContentType = (type) => {
    if (type == 1) {
      list2Box.dialogList['content'].type = 'input';
    } else {
      list2Box.dialogList['content'].type = 'slot';
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
  gonggaoEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
       }

        changeContentType(dialogModel['show_type'])
        visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const editorEle = (val) => {
  list2Box.dialogList.content.value = val
  // dialogModel.gi_info = val
}
const handleSave = () => {
  dialogModel.content = list2Box.dialogList.content.value
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    gonggaoEdit(query).then((res: any) => {
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
    gonggaoAdd(query).then((res: any) => {
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

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.photo = val.file[0];
  list2Box.dialogList['photo'].value = val.file[0];
}

//添加
const handleAdd = () => {
   for (const key in dialogModel) {
     if (key == dialogList[key]?.prop) {
        if (key == 'status' || key == 'show_type' || key == 'is_show_time') {
          list2Box.dialogList[key].value = 1
       } else if (key == 'show_loca') {
         list2Box.dialogList[key].value = 1
        } else {
         list2Box.dialogList[key].value = ''
       }

     }
     if (key == 'status' || key == 'show_type' || key == 'is_show_time') {
       dialogModel[key] = 1
     } else if (key == 'show_loca') {
       dialogModel[key] = 1
     } else {
      dialogModel[key] = ''
     }

    }
  changeContentType(dialogModel['show_type'])
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
  gonggaoDelete(query).then((res: any) => {
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
const eidtUsername = (val) => {
  dialogModel.agent_id = val;
   list2Box.dialogList.agent_id.value = val;
}
const selectUser = () => {
    selectShow.value = true
 }

 //选择代理返回来的
const agenBackRow = (val) => {
  list2Box.dialogList.agent_id.value = val.uid
  dialogModel.agent_id = val.uid
  selectShow.value = false
}
//状态
const handleStatus = (row, val) => {
  if (!hasAuth('edit')) {
    return;
  }
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
  gonggaoStatusEdit(query).then((res: any) => {
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
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
     <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component @select="agenBackRow" :select="true" :is="defineAsyncComponent(()=> import('@/components/comm/agenReportList.vue'))"/>
          </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:agent_id>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.agent_id" @change="eidtUsername($event)" :placeholder="$t('用户')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
      </template>
      <template v-slot:content>
            <component @chage="editorEle" :content="dialogModel.content" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
        </template>
        <template v-slot:photo>
        <div>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.photo"/>
          <p>{{ $t('请上传图片') }}</p>
        </div>
      </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
        <template #status="{ row }">
          <el-tag size="small" type="danger"  v-if="row.status == 0" @click="handleStatus(row,1)">{{ $t('关闭') }}</el-tag>
          <el-tag size="small" type="success"  v-if="row.status == 1"  @click="handleStatus(row,0)">{{ $t('开启') }}</el-tag>
      </template>
      <template #show_type="{ row }">
          <el-tag size="small" type="success"  v-if="row.show_type == 1">{{ $t('跑马灯') }}</el-tag>
          <el-tag size="small" type="success"  v-else-if="row.show_type == 2">{{ $t('弹窗') }}</el-tag>
          <el-tag size="small" type="success"  v-else>{{ $t('顶部广告') }}</el-tag>
      </template>
      <template #show_loca="{ row }">
          <el-tag size="small" type="success"  v-if="row.show_loca == 1">{{ $t('首页') }}</el-tag>
          <el-tag size="small" type="success"  v-else>{{ $t('代理') }}</el-tag>
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
