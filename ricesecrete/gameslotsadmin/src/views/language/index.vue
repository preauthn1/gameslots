<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import {languageIndex,languageEdit,languageAdd,languageDelete,languageSetSatus,languageUpdate} from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
defineOptions({
  name: "languageIndex",
});
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
    label: transformI18n("语言"),
    prop: "title",
  }, {
    label: transformI18n("标识"),
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.lang}
      </div>
    )
  }, {
    label: transformI18n("默认语言"),
    slot: "is_default",
  }, {
    label: transformI18n("后台状态"),
    slot: "status",
  }, {
    label: transformI18n("前台状态"),
    slot: "web_status",
  }, {
    label: transformI18n("排序"),
    prop: "sort"
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    align:'center',
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" style="margin-top:10px;" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button><br/>
        <el-button v-show={hasAuth('edit')} size="small" type="primary"  style="margin:10px 0;" onClick={() => langUpdate(row)}>
          { transformI18n('更新语言包') }
        </el-button><br/>
        <el-button v-show={hasAuth('delete')}
          size="small"
          type="danger"
          onClick={() => handleDelet(row)}
        >
          { transformI18n('删除') }
        </el-button>
      </>
    )
  }
];
const langUpdate = (row) => {
  //languageUpdate
  languageUpdate({id:row.id}).then((res:any)=>{
   if (res.code == 1) {
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
    }
  })
 }
const height = window.innerHeight - 260;
//搜索的数据

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
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  languageIndex(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    const currency = res.currency;
    const arr = [];
    for(const key in currency){
      arr.push({label:currency[key],value:key})
    }
    list2Box.dialogList.lang.options =arr
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
  lang:{
    type: 'select',
    label: '选择语种',
    placeholder: '选择语种',
    value: '',
    options:[],
    prop:'lang'
  },
  flag: {
    type: 'slot',
    name: 'upload',
    label: 'ICON',
    prop: 'flag',
    value: '',
  },
  is_default:{
    type: 'radio',
    label: '是否默认',
    placeholder: '是否默认',
    value: 0,
    options: [
      {
        label: 1,
        name:'是'
      }, {
        label: 0,
        name:'否'
      },
    ],
    prop:'is_default'
  },
  status:{
      type: 'radio',
      label: '后台状态',
      placeholder: '后台状态',
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
  web_status:{
      type: 'radio',
      label: '前端状态',
      placeholder: '前端状态',
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
      prop:'web_status'
  },
    sort:{
      type: 'input',
      ty:'number',
      label: '排序',
      placeholder: '排序',
      tip:'排序从大到小，数字越大越靠前',
      value: 1,
      prop:'sort'
    },
}
const dialogModel = reactive({
  lang:'',
  flag:'',
  is_default:'',
  status:0,
  web_status:0,
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
  languageEdit(query).then((res: any) => {
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
    languageEdit(query).then((res: any) => {
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
    languageAdd(query).then((res: any) => {
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
        if (dialogList[key].type == 'radio') {
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
const handleDelet = (row) => {
   proxy.$confirm('确认删除吗？', '提示').then(() => {
    deleteIds(row.id)
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
  languageDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//状态
const handleStatus = (row) => {
 statusChage(row)
}
const handleWebStatus = (row) => {
 statusChageWeb(row)
}
function statusChage(row) {
  const query = {
    edit: true,
    info: {
      id: row.id,
      status:row.status
    }
  }
  languageSetSatus(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}
function statusChageWeb(row) {
  const query = {
    edit: true,
    info: {
      id: row.id,
      web_status:row.web_status
    }
  }
  languageSetSatus(query).then((res: any) => {
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
  dialogModel.flag = val.file[0];
  list2Box.dialogList['flag'].value = val.file[0];
}
</script>

<template>
  <div>
     <div class="flex-bc line-box">
      <div class="flex-fi">
        <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{ $t('添加') }}</el-button>
        <span class="tip">{{ $t('只能存在一个默认语言') }}</span>
      </div>
    </div>
    <commDialog title="编辑" width="60%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
       <template v-slot:upload>
            <uploadImage @imageData="backImageData" :image="dialogModel.flag" :limit="1" />
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
         <template #is_default="{ row }">
          <el-button size="small" type="danger"  v-if="row.is_default == 0">{{ $t('否') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.is_default == 1">{{ $t('是') }}</el-button>
        </template>
        <template #status="{ row }">
          <el-switch
              @click="handleStatus(row)"
                    size="large"
                    v-model="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('禁用')"
          />
        </template>
        <template #web_status="{ row }">
          <el-switch
              @click="handleWebStatus(row)"
                    size="large"
                    v-model="row.web_status"
                    :active-value="1"
                    :inactive-value="0"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('禁用')"
          />
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
.tip{
  color:var(--el-color-danger);
  margin-left:20px;
  font-size: 14px;
  font-weight: bold;
}
</style>
