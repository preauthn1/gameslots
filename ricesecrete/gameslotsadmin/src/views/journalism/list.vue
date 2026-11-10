<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, getCurrentInstance } from "vue";
import { journalismList, journalismEdit, journalismDelete, journalismAdd } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'journalismList'
})
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    width: "100"
  },
  {
    label: transformI18n("分类"),
    prop: "type_id",
    width: "100"
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
    width: "100"
  },
  {
    label: transformI18n("标题"),
    prop: "title",
  },
  {
    label: transformI18n("封面图"),
    slot: "pic",
  },
  {
    label: transformI18n("时间"),
    prop: "addtime",
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
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
      </>
    )
  },
];
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
  type_id: {
    type: 'select',
    label: '新闻分类',
    placeholder: '请选择新闻分类',
    value: '',
    options: [],
    prop: 'type_id'
  },
  title: {
    type: 'input',
    label: '标题',
    placeholder: '标题',
    value: '',
    prop: 'title'
  },
  pic: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '封面图',
    prop: 'pic'
  },
  status: {
    type: 'radio',
    label: '显示',
    placeholder: '显示',
    value: 0,
    prop: 'status',
    options: [
      {
        label: 1,
        name: '是'
      }, {
        label: 0,
        name: '否'
      },
    ]
  },
  brief: {
    type: 'input',
    label: '简介',
    placeholder: '简介',
    value: '',
    prop: 'brief'
  },
  content: {
    type: 'slot',
    label: '内容',
    placeholder: '内容',
    value: '',
    name: 'content',
    prop: 'content'
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
  amount: {
    type: 'input',
    label: '赛事奖金',
    placeholder: '赛事奖金',
    value: '',
    prop: 'amount'
  },
  game_ids:{
    type: 'slot',
    label: '游戏ID',
    placeholder: '游戏ID',
    value: '',
    prop: 'game_ids',
    name:'game_ids'
  },
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort'
  },
}
const dialogModel = reactive({
  id:'',
  type_id:'',
  title:'',
  pic:'',
  brief:'',
  content:'',
  game_ids:'',
  start_time:'',
  end_time:'',
  amount:'',
  sort:'',
  status:'',
  lang:'',
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
    list2Box.dialogList[index].value = value ? formaTime(value) : '';
    dialogModel[index] = value ? formaTime(value) : '';
  } else {
dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
  }
  
}


//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  list2Box.dialogList.content.value = val
}
const clickCurrentIndex = ref(1);
//编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    id:row.id
  }
  journalismEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.id = res.data.id;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//点击添加
const handleAdd = () => {
  clickCurrentIndex.value = 2
  for (const key in dialogList) {
    if (dialogList[key].type == 'radio') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }
  }
  dialogModel.id = '';
  visible.value = true;
}

//图片返回
const backImageData1 = (val) => {
  dialogModel.pic = val.file[0];
  list2Box.dialogList['pic'].value = val.file[0];
}

//保存
const handleSave = () => {
  let query = {};
  dialogModel.content = list2Box.dialogList.content.value
  let api = journalismEdit;
  if (clickCurrentIndex.value == 1) {
    query = {
      edit: true,
      info: dialogModel
    }

  } else {
    query = {
      add: true,
      info: dialogModel
    }
    api = journalismAdd;
  }
  api(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  title: {
    type: 'input',
    placeholder: '标题',
    value: '',
    prop: 'title',
    span: 8
  },
  type: {
    type: 'select',
    placeholder: '分类',
    value: '',
    prop: 'type',
    options: [],
    span: 8
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search',
    span: 8
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  title:'',
  type:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  journalismList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    list2Box.dialogList.lang.options = res.langs
    list2Box.dialogList.type_id.options = res.type
    searchListBox.searchList.type.options = res.type
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
  // console.log('点击');
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}

//删除
let selectAll = [];
const handleDelete = () => {
  if (selectAll.length <= 0) {
    message('请选择', { type: 'error' });
    return;
  }
  const arr = [];
  proxy.$confirm('确认删除吗？', '提示').then(() => {
    selectAll.forEach(item => {
      arr.push(item.id);
    })
    deleteIds(arr.join(','))
  }).catch(() => {
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
  journalismDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
const selectShow = ref(false);
const eidtGameIds = (val) => {
  dialogModel.game_ids = val;
  list2Box.dialogList.game_ids.value = val;
  selectShow.value = false
    console.log(dialogModel)
}
const selectGame = () => {
    selectShow.value = true
}
</script>
<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
     <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :back="true" @backSelect="eidtGameIds" :is="defineAsyncComponent(()=> import('@/views/threeGames/gameManage.vue'))"/>
          </div>
    </el-dialog>
    <commDialog title="新闻" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage @imageData="backImageData1" :image="dialogModel.pic" :limit="1" />
        </template>
        <template v-slot:game_ids>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.game_ids" @change="eidtGameIds($event)" :placeholder="$t('游戏')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectGame">{{ $t('选择游戏') }}</el-button>
            </div>
        </template>
        <template v-slot:content>
            <component @chage="editorEle" :content="dialogModel.content" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #pic="{ row }">
            <el-image style="width:60px;" :src="row.pic" fit="contain" />
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="danger" v-if="row.status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
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
