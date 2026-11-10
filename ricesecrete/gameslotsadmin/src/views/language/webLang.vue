<script setup lang="tsx">
import { h, reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { webLangList,webLangEdit,webLangAdd,webLangDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
import { addDialog } from "@/components/ReDialog";
import batchForm from "./batchForm.vue";
import { http } from "@/utils/http";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'webLang'
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
    label: transformI18n("标题"),
    prop: "title",
  },
  {
    label: transformI18n("类目"),
    prop: "key",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("代理"),
    prop: "agent_ids",
  },
  {
    label: transformI18n("值"),
    prop: "text",
    slot:'value'
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
  lang:{
    type: 'select',
    label:'语种',
    placeholder:'语种',
    prop: 'lang',
    options: [],
    value: '',
  },
  title:{
    type: 'input',
    placeholder: '标题',
    value: '',
    prop:'title'
  },
  key:{
    type: 'input',
    placeholder: '类目',
    value: '',
    prop:'key'
  },
  text:{
    type: 'input',
    placeholder: '值',
    value: '',
    prop:'text'
  },
  agent_id:{
    type: 'input',
    placeholder: '代理id',
    value: '',
    prop:'agent_id'
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
  lang: '',//语言
  title:'',
  key:'',
  text:'',
  type:'',
  agent_id:'',
});
const dataList: any = [];
let defaultList: any = [];
const tableData = reactive({ dataList });
const batchData = reactive({ defaultList });
//获取列表数据
init();
function init(query?: object) {
  webLangList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    list2Box.dialogList.lang.options = res.langs
    searchListBox.searchList.lang.options = res.langs
    batchData.defaultList = res.default_func_switch
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
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '请选择语种',
    value: '',
    options: [],
    prop: 'lang'
  },
  title:{
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop:'title'
  },
  key:{
    type: 'input',
    label: '类目',
    placeholder: '类目',
    value: '',
    prop:'key'
  },
  agent_ids: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "agent_ids"
  },
  type:{
    type: 'radio',
    value: 0,
    label:'类型',
    placeholder:'类型',
    prop: 'type',
    options: [
      {
        label: 0,
        name:'图片'
      },
      {
        label: 1,
        name:'文本'
      },
      {
        label: 2,
        name:'富文本'
      },
    ]
  },
   image: {
    type: 'slot',
    name: 'image',
    value: '',
    label: '图片',
    prop: 'image',
    show: false,
  },
  text:{
    type: 'input',
    label: '文本',
    placeholder: '文本',
    value: '',
    prop:'text',
    show: false
  },
  content: {
    type: 'slot',
    label: '内容',
    placeholder: '内容',
    value: '',
    name:'content',
    prop: 'content',
    show: false
  },

}
const dialogModel = reactive({
  lang: '',
  title: '',
  key: '',
  image: '',
  type: 1,
  text: '',
  content: '',
  agent_ids: '',
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
  if(index == 'type'){
    changeTextBytype(value)
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
  webLangEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
              list2Box.dialogList[key].value = res.data[key]
          }
          dialogModel[key] = res.data[key]
        }
        changeTextBytype(dialogModel['type'])
        visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  dialogModel.content = list2Box.dialogList.content.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    webLangEdit(query).then((res: any) => {
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
    webLangAdd(query).then((res: any) => {
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
    if(key == 'id'){
      continue;
    }
     if (key =='type') { 
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
     }else{
       list2Box.dialogList[key].value = ''
       dialogModel[key] = ''
     }
    }
    changeTextBytype(dialogModel['type'])
  clickIndex.value = 2;
  visible.value = true;
}

function changeTextBytype(type){
    list2Box.dialogList['image'].show = true;
    list2Box.dialogList['text'].show = true;
    list2Box.dialogList['content'].show = true;
  if(type == 0){
    //图片
    list2Box.dialogList['image'].show = false;
  }else if(type == 1){
    //文本
    list2Box.dialogList['text'].show = false;
  }else if (type == 2){
    list2Box.dialogList['content'].show = false;
  }

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
  webLangDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//图片返回
const backImage = (val) => {
  dialogModel.image = val.file[0];
  list2Box.dialogList['image'].value = val.file[0];
}
//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  list2Box.dialogList.content.value = val
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.agent_ids.value = val;
  dialogModel.agent_ids = val;
  selectShow.value = false;
};

const handleBatchDefault = () => {
  addDialog({
    width: "30%",
    title: "批量添加功能参数",
    contentRenderer: () =>  h(batchForm, {
        list: batchData.defaultList
    }),
    beforeSure: (done, { options, index }) => {
      http.post('/system_lang/batch', { data: {list: batchData.defaultList} }).then((res: any) => {
        if (res.code == 1) {
          message(transformI18n("保存成功"), { type: 'success' });
          done(); // 需要关闭把注释解开即可
        } else {
          message(transformI18n("出错了"), { type: 'error' });
        }
      });
    }
  });
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
        <el-button v-if="hasAuth('add')" type="warning" @click="handleBatchDefault">{{ $t('批量添加功能参数') }}</el-button>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component
          :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          "
          :back="true"
          :field="1"
          @backSelect="eidtUsername"
        />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input
              v-model="dialogModel.agent_ids"
              clearable
              :placeholder="$t('用户/代理')"
            />
            <el-button
              style="margin-left: 20px"
              type="primary"
              @click="selectUser"
              >{{ $t("选择用户") }}</el-button
            >
          </div>
          <div>{{ $t("限制某代理线下面用户才有效") }}</div>
        </div>
      </template>
      <template v-slot:image>
          <uploadImage @imageData="backImage" :image="dialogModel.image" :limit="1" />
      </template>
      <template v-slot:content>
          <component @chage="editorEle" :content="dialogModel.content" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
      </template>
      <template #type="{ row }">
         <el-tag size="small" type="success" v-if="row.type == 0">{{ $t('图片') }}</el-tag>
         <el-tag size="small" type="warning" v-else-if="row.type == 1">{{ $t('文本') }}</el-tag>
         <el-tag size="small" type="info" v-else-if="row.type == 2">{{ $t('富文本') }}</el-tag>
      </template>
      <template #value="{ row }">
        <span v-if="row.type == 0"><a :href="row.text" class="el-link" target="_blank"> {{ $t('查看') }}</a></span>
        <span v-else-if="row.type == 1">{{ row.text }}</span>
        <span v-else-if="row.type == 2">-</span>
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
