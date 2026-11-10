<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { forecastList,forecastEdit,forecastAdd,forecastDelete } from "@/api/user";
import { message } from "@/utils/message";
import { http } from '@/utils/http';
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'pddList'
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
  },
  {
    label: transformI18n("语言"),
    prop: "lang",
  },
  {
    label: transformI18n("banner"),
    prop: "banner_url",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={ row.banner_url } alt="" />
      </div>
    )
  },
  {
    label: transformI18n("邀请码"),
    prop: "invite_code",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  title:{
    type: 'input',
    label:'标题',
    placeholder:'标题',
    prop: 'title',
    value: '',
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
  export:{
    type: 'button',
    value:'导出',
    handle: 'export',
    prop: 'export',
  }
}
const searchListBox = reactive({
  searchList
})


const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  phone:'',//号码
  export: 0,//导出
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pagination.export = 0;
  forecastList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    list2Box.dialogList.lang.options = res.langs
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

//导出
const handleExport = () => {
  pagination.export = 1;
  forecastList(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}



//弹框写法
const visible = ref(false);
const dialogList = {
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '请选择语种',
    value: '',
    options: [],
    prop: 'lang'
  },
  banner_url:{
    type: 'slot',
    label: 'banner',
    placeholder: 'banner',
    value: '',
    prop: 'banner_url',
    name: 'upload',
  },
  invite_code:{
    type: 'input',
    label: '邀请码',
    placeholder: '邀请码',
    value: '',
    prop: 'invite_code',
  },
  introduce:{
    type: 'slot',
    label: '介绍',
    placeholder: '介绍',
    value: '',
    name: 'introduce',
    prop: 'introduce'
  },
}
const dialogModel = reactive({
  id: '',
  banner_url: '',
  introduce: '',
  invite_code: '',
  lang: '',
})

//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  list2Box.dialogList.introduce.value = val
}
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
  forecastEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
            dialogList[key].value = res.data[key]
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
  dialogModel.introduce = list2Box.dialogList.introduce.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    forecastEdit(query).then((res: any) => {
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
    forecastAdd(query).then((res: any) => {
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
  dialogModel.introduce = list2Box.dialogList.introduce.value;
  for (const key in dialogModel) {
    if( key == 'id' ){
      dialogModel[key] = ''
      continue;
    }
    list2Box.dialogList[key].value = ''
    dialogModel[key] = ''
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
  forecastDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.banner_url = val.file[0];
  list2Box.dialogList['banner_url'].value = val.file[0];
}
const forecastGameShow = ref(false);
const forecastId = ref("");
const forecastGameList = row => {
  forecastId.value = row.id;
  forecastGameShow.value = true;
};
</script>

<template>
  <div>
    <!-- <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/> -->
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
    <el-dialog v-model="forecastGameShow" :title="$t('游戏配置')" width="80%" heith="100%">
      <component
        :id="forecastId"
        :is="
          defineAsyncComponent(() =>
            import('@/views/threeGames/forecastGame.vue')
          )
        "
      />
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template v-slot:upload>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.banner_url"/>
      </template>  
      <template v-slot:introduce>
        <component @chage="editorEle" :content="dialogModel.introduce" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
          <el-button size="small" v-if="hasAuth('/threeGames/forecastGame')"  type="primary" @click="forecastGameList(row)">{{ $t('游戏配置') }}</el-button>
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
  padding-bottom:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
