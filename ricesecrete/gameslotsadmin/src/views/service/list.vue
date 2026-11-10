<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { serviceList,serviceEidt,serviceAdd,serviceStatusEidt,serviceDelete } from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'serviceList'
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
    width: 150,
  },
  {
    label: transformI18n("图标"),
    width: 150,
    cellRenderer: ({ row }) => (
      <>
        <el-image style="width: 100px; height: 100px" src={row.img} fit="contain" />
      </>
    )
  },
  {
    label: transformI18n("链接"),
    prop: "link",
    width: 150,
  },
  {
    label: transformI18n("代理线"),
    prop: "agent_id",
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
    slot:'right'
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  title:{
    type: 'input',
    placeholder: '名称',
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
  serviceList(pagination).then((res:any) => {
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
    prop:'name'
  },
  img: {
    type: 'slot',
    name: 'upload',
    label: '图标',
    prop: 'upload',
    value: '',
  },
  introduce:{
    type: 'input',
    label: '介绍',
    placeholder: '介绍',
    value: '',
    ty:'textarea',
    prop:'introduce'
  },
  link:{
    type: 'input',
    label: '链接',
    placeholder: '链接',
    tip: '多个链接用逗号隔开，前端将随机获取一个链接',
    value: '',
    prop: 'link',
  },
   agent_id:{
    type: 'slot',
    label: '代理线',
    placeholder: '代理id',
    value: '',
    prop: 'agent_id',
    name:'agent_id'
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
    value: 1,
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

}
const dialogModel = reactive({
  name:'',
  img:'',
  introduce:'',
  link:'',
  agent_id:'',
  sort:'',
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
  serviceEidt(query).then((res: any) => {
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
    serviceEidt(query).then((res: any) => {
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
    serviceAdd(query).then((res: any) => {
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
  serviceDelete(query).then((res: any) => {
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
  serviceStatusEidt(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}
//图片返回
const backImageData = (val) => {
  dialogModel.img = val.file[0];
  list2Box.dialogList['img'].value = val.file[0];
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
    <el-dialog width="80%" v-model="selectShow" title="选择">
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
       <template v-slot:upload>
            <uploadImage @imageData="backImageData" :image="dialogModel.img" :limit="1" />
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="danger"  v-if="row.status == 0" @click="handleStatus(row,1)">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success"  v-if="row.status == 1"  @click="handleStatus(row,0)">{{ $t('开启') }}</el-tag>
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
