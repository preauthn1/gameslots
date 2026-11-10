<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { nationList,nationEdit,nationAdd ,nationDelete,nationStateEdit} from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
defineOptions({
  name: "nationList",
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
    label: transformI18n("国家名称"),
    prop: "name",
  },
  {
    label: transformI18n("国旗"),
    width: 150,
    slot:'flag',
    // cellRenderer: ({ row }) => (

    //   <img src={ row.flag } alt="" />

    // )
  },
  {
    label: transformI18n("语种"),
    slot:'langs',
  },
  {
    label: transformI18n("状态"),
    slot: "state",

  }, {
    label: transformI18n("默认国家"),
     slot: "is_defa"
  }, {
    label: transformI18n("排序"),
    prop: "sort"
  }, {
    label: transformI18n("添加时间"),
    prop: "create_time"
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: 150,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} type="primary" size="small" onClick={() => handleEidt(row)}>
          {transformI18n('编辑')}
        </el-button>
        <el-button v-show={hasAuth('delete')} type="danger" onClick={ ()=>handleDelet(row)}  size="small" >
          {transformI18n('删除')}
        </el-button>
      </>
    )
  }
];

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
  name:''
});
const dataList = [];
const tableData = reactive({ dataList });
const defaultLang = []
//获取列表数据
init();
function init(query?: object) {
  nationList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    const currency = res.currency;
    const langs = res.langs
    const arr1=[]
    for (const key in currency) {
      arr1.push({ label:currency[key],value:key })
    }
    langs.forEach(item=>{
      if (item.is_default == 1) {
        defaultLang.push(item.lang)
      }
    })
    list2Box.dialogList['name'].options = arr1
    list2Box.dialogList['lang'].options =  res.langs
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
  name:{
    type: 'select',
    label: '国家名称',
    placeholder: '国家名称',
    value: '',
    options:[],
    prop:'name'
  },
  lang:{
    type: 'slot',
    label: '语种标识',
    placeholder: '语种标识',
    value: [],
    options: [],
    name:'lang',
    prop:'lang'
  },
  flag: {
    type: 'slot',
    name: 'flag',
    label: '国旗',
    prop: 'flag',
    value: '',
  },
  state:{
    type: 'switch',
    label: '状态',
    placeholder: '状态',
    value: 0,
    prop: 'state',
    inlinePrompt: true,
    activeText: '开启',
    inactiveText:'关闭'
  },
  is_defa:{
    type: 'switch',
    label: '默认国家',
    placeholder: '默认国家',
    value: 0,
    prop: 'is_defa',
    inlinePrompt: true,
    activeText: '开启',
    inactiveText:'关闭'
  },

  sort:{
    type: 'input',
    label: '排序',
    placeholder: '数值越大越靠前',
    value: '',
    tip:'排序从大到小，数字越大越靠前',
    prop:'sort'
  },
}
const dialogModel = reactive({
  name:'',
  lang:[],
  flag:'',
  state:0,
  is_defa:0,
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
  nationEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
       }
       const list = list2Box.dialogList['lang'].options;
       const values = list2Box.dialogList['lang'].value;
       const arr2 = [];
       list.forEach((item) => {
         for (let i = 0; i < values.length; i++) {
          if (item.id == values[i]) {
            arr2.push(item.lang);
          }
         }

       })
       list2Box.dialogList['lang'].value = arr2
       dialogModel['lang'] = arr2
      //  list.map(item=>item.)
      //  for (var i = 0; i < values.length; i++) {
      //     if()
      //  }
        visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

function langIds() {
  const list = list2Box.dialogList['lang'].options;
       const values = dialogModel.lang;
       const arr2 = [];
       list.forEach((item) => {
         for (let i = 0; i < values.length; i++) {
      if (item.lang == values[i]) {
        arr2.push(item.id);
      }
      }

    })
    return arr2
}
const handleSave = () => {
  dialogModel.lang = langIds();
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    nationEdit(query).then((res: any) => {
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
    nationAdd(query).then((res: any) => {
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
    //  dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
        if (key == 'lang') {
          list2Box.dialogList[key].value = defaultLang
          dialogModel[key] = defaultLang
        } else if (key == 'state' || key == 'is_defa' || key == 'sort') {
           list2Box.dialogList[key].value = 0
           dialogModel[key] = 0
        } else {
          list2Box.dialogList[key].value = ''
          dialogModel[key] = ''
       }

    }
      dialogModel['id'] = ''
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
  nationDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
const clickSwitch = ref(false);
const handleStatus2 = (row, key) => {
   const query = {
    edit: true,
    info: {
      id: row.id,
      state:row.state
    }
  }
  statusChage(query)
}
const handleStatus1 = (row, key) => {
  const query = {
    edit: true,
    info: {
      id: row.id,
      is_defa:row.is_defa
    }
  }
   statusChage(query)
}
//状态
// const handleStatus = (row, val, key) => {
//   console.log(row)
// //  statusChage(row,val,key)
// }
function statusChage(query) {


  nationStateEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
    } else {
        init();
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
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <span class="tip">{{ $t('只能存在一个默认国家') }}</span>
      </div>
    </div>
     <commDialog title="编辑" width="60%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:lang>
          <el-checkbox-group v-model="dialogModel.lang" size="large">
            <el-checkbox  :label="item.lang" border  :checked="item.is_default==1?true:false" v-for="item,index in list2Box.dialogList['lang'].options" :key="index"/>
          </el-checkbox-group>
      </template>
       <template v-slot:flag>
            <uploadImage @imageData="backImageData" :image="dialogModel.flag" :limit="1" />
        </template>
      </commDialog>

    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >

       <template #is_defa="{ row }">
          <el-switch @click="handleStatus1(row,'is_defa')"
                    size="large"
                    v-model="row.is_defa"
                    :active-value="1"
                    :inactive-value="2"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('关闭')"
                    :disabled="!hasAuth('edit')"
          />
        </template>
         <template #state="{ row }">
          <el-switch
          @click="handleStatus2(row,'state')"
                    size="large"
                    v-model="row.state"
                    :active-value="1"
                    :inactive-value="2"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('禁用')"
                    :disabled="!hasAuth('edit')"
          />
        </template>
        <template #flag="{row}">
          <el-image style="width: 30px; height: 30px" :src="row.flag"  fit="contain"/>
        </template>
        <template #langs="{row}">
            <span v-for="cell,idx in row.langs" :key="idx">{{ cell }}</span>
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
