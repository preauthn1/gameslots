<script setup lang="tsx">
import { reactive,ref ,getCurrentInstance} from "vue";
import { languageItems,languageTransltion,languageDelitem,languageEidtitem,languageUpdate, languageImport, languageExcel
 } from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
// @ts-ignore
import uploadFile from '@/components/comm/uploadFile.vue'
import { copyContent } from "@/utils/global";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: "languageItems",
});
const columns: any = [//TableColumnList
  {
    label: transformI18n("类目"),
    slot: "text",
  }

];
let langs = [];
const handleDelete = (index,row) => {
  proxy.$confirm('确认删除吗？', '提示').then(() => {
    languageDelitem({ id: row.id }).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        // init();
        tableData.dataList.splice(index,1)
      } else {
          message(res.msg, { type: 'error' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })
}
const handleLock = (lock, row) => {
  languageEidtitem({id:row.id,is_lock:lock}).then((res: any) => {
    if (res.code == 1) {
        row.is_lock = lock;
        message(res.msg, { type: 'success' });
      } else {
          message(res.msg, { type: 'error' });
      }
  })
}

const handlePublic = (is_public, row) => {
  languageEidtitem({id:row.id,is_public:is_public}).then((res: any) => {
    if (res.code == 1) {
        row.is_public = is_public;
        message(res.msg, { type: 'success' });
      } else {
          message(res.msg, { type: 'error' });
      }
  })
}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  title:{
    type: 'input',
    placeholder: '请输入类目',
    value: '',
    prop: 'title',
    span: 6
  },
  is_public:{
    type: 'select',
    label:'是否为公共类目',
    placeholder:'是否为公共类目',
    prop:'is_public',
    value: '',
    options: [
      {
        label: '否',
        value: 0,
      },{
        label: '是',
        value: 1,
      },
    ],
    span: 6
  },
  text: {
    type: 'input',
    placeholder: '请输入语言',
    value: '',
    prop:'text',
    span: 6
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
  title: '',
  text:'',
  is_public:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  languageItems(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    langs = res.langs;
    if (columns.length > 1) {
      return;
    }
    langs.forEach(item => {
      columns.push({
        label: item.title,
        cellRenderer: ({ row }) => (
          <>
            <el-input v-model={row["lang_text_" + item.id]} onChange={ ($event) => currentInput($event, row.id, item.id)} />
          </>
        )
      });
    });
    columns.push({
      label: transformI18n("操作"),
      align: 'center',
      slot: "operation"
    });
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
const currentInput = (event, item_id, lang_id) => {
  if (!hasAuth('edit')) {
    return;
  }
  const query = {
    item_id: item_id,
    lang_id: lang_id,
    value:event
  }
  languageTransltion(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        // init();
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}




//弹框写法
const visible = ref(false);
const isLoading = ref(false);
const dialogList = {
  title:{
    type: 'input',
    label: '添加语言类目',
    placeholder: '请输入',
    value: '',
    ty:'textarea',
    prop:'title'
  },
  is_public:{
      type: 'radio',
      label: '是否为公共类目',
      placeholder: '是否为公共类目',
      value: 0,
      options: [
        {
          label: 0,
          name:'否'
        },{
          label: 1,
          name:'是'
        }, 
      ],
      prop:'is_public'
  },
}
const dialogModel = reactive({
  title: '',
  is_public: 0,
})
const listRules = {
    title: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
}

const handleSave = () => {
  saveItem(dialogModel.title, null, dialogModel.is_public);
}

const saveItem = (title, id, is_public) => {
  const query = {
    title: title,
  }
  if ( is_public != -1 ) {
    query['is_public'] = is_public
  }
  
  if (id) {
    query['id'] = id;
  }
  languageEidtitem(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      visible.value = false;
      if (!id) {
        init();
      }
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//添加
const handleAdd = () => {
  dialogModel.title = ''
  list2Box.dialogList['title'].value = ''
  list2Box.dialogList['is_public'].value = 0
  visible.value = true;
}

const langUpdate = () => {
  //languageUpdate
  languageUpdate({}).then((res:any)=>{
   if (res.code == 1) {
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const langImport = (data) => {
  isLoading.value = true;
  languageImport(data).then((res:any)=>{
    isLoading.value = false;
   if (res.code == 1) {
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const langExport = (data) => {
  languageExcel(data).then((res:any)=>{
    if (res.code == 1) {
      window.location.href = res.data.url;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
 }

 //图片返回
const backImageData = (val) => {
  proxy.$alert("<p style='word-wrap: break-word;'>" + val.file[0] + "</p>", transformI18n('图片地址'), {
          confirmButtonText: transformI18n('复制'),
          dangerouslyUseHTMLString: true
        }).then((res: any) => {
    copyContent(val.file[0]);
  })
}

//视频返回
const backVideoData = (val) => {
  proxy.$alert("<p style='word-wrap: break-word;'>" + val.file + "</p>", transformI18n('图片地址'), {
          confirmButtonText: transformI18n('复制'),
          dangerouslyUseHTMLString: true
        }).then((res: any) => {
    copyContent(val.file);
  })
}

</script>

<template>
  <div>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div class="flex-fi">
        <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{ $t('添加') }}</el-button>
        <el-button type="primary" v-if="hasAuth('import')" @click="langExport">{{ $t('导出') }}</el-button>
        <!-- <el-button type="primary">{{ $t('导入') }}</el-button> -->
        <uploadFile :loading="isLoading" v-if="hasAuth('export')" @success="langImport" text="导入" style="margin:0 12px;" />
        <el-button type="primary" v-if="hasAuth('edit')" @click="langUpdate" style="margin-right: 12px;">{{ $t('更新语言包') }}</el-button>
        <!-- <el-button type="primary">{{ $t('上传图片') }}</el-button> -->
        <uploadImage v-if="hasAuth('edit')" :button="true" @imageData="backImageData" image="" :limit="1" />   
        <uploadFile v-if="hasAuth('edit')" :button="true" @success="backVideoData" :data="{'type':'video'}" text="上传视频"  :limit="1" />
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
     <commDialog title="添加" width="40%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
       <!-- <template v-slot:upload>
            <uploadImage @imageData="backImageData" :image="dialogModel.flag" :limit="1" ></uploadImage>
        </template> -->
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
        <template #text="{ row }">
          <el-input v-model="row.title" :disabled="!hasAuth('edit')" @change="saveItem($event, row.id, -1)"/>
        </template>
        <template #operation="{ index, row }">
          <el-button v-if="hasAuth('delete')" size="small" type="danger" @click="handleDelete(index, row)">
            {{ $t('删除') }}
          </el-button>
          <el-button v-if="row.is_lock == 1 && hasAuth('lock')" size="small" type="info" @click="handleLock(0, row)">
            {{ $t('解锁') }}
          </el-button>
          <el-button v-else-if="hasAuth('lock')" size="small" type="warning" @click="handleLock(1, row)">
            {{ $t('锁定') }}
          </el-button>
          <el-button v-if="row.is_public == 1" size="small" type="info" @click="handlePublic(0, row)">
            {{ $t('取消公共') }}
          </el-button>
          <el-button v-else size="small" type="warning" @click="handlePublic(1, row)">
            {{ $t('设置公共') }}
          </el-button>
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
