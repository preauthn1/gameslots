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
  name: "userAgentLangItems",
});
const columns: any = [//TableColumnList
  {
    label: transformI18n("类目"),
    slot: "text",
  }

];
let langs = [];

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  title:{
    type: 'input',
    placeholder: '请输入类目',
    value: '',
    prop: 'title',
    span: 8
  },
  text: {
    type: 'input',
    placeholder: '请输入语言',
    value: '',
    prop:'text',
    span: 8
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

</script>

<template>
  <div>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div class="flex-fi">
        <el-button type="primary" @click="langExport">{{ $t('导出') }}</el-button>
        <!-- <el-button type="primary">{{ $t('导入') }}</el-button> -->
        <uploadFile :loading="isLoading" @success="langImport" text="导入" style="margin:0 12px;" />
        <el-button type="primary" @click="langUpdate" style="margin-right: 12px;">{{ $t('更新语言包') }}</el-button>
        <!-- <el-button type="primary">{{ $t('上传图片') }}</el-button> -->
        <uploadImage :button="true" @imageData="backImageData" image="" :limit="1" />
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <div class="flex-bc line-box">
       <div class="tip">
        {{ $t('删除类目会以默认为准，刷新后会重新显示后台默认设置') }}<br/><br/>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
        <template #text="{ row }">
          <el-input v-model="row.title" :disabled="!hasAuth('edit')" @change="saveItem($event, row.id, -1)"/>
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
.tip{
  font-size: 14px;
  color:var(--el-color-danger);
}
</style>
