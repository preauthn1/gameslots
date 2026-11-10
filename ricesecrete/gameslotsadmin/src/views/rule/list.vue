<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { ruleList, ruleEdit, ruleAdd, ruleDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'ruleList'
})
const props = defineProps({
  id: Number
})
const gameId: any = computed(() => {
  return props.id;
})

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("类型"),
    prop: "type_text",
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot: 'right'
  }
];
const handleEdit = (index, row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  title: {
    type: 'input',
    placeholder: '标题',
    value: '',
    prop: 'title',
    span: 16
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  gameId: gameId
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  ruleList(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    const langs = res.langs;
    const arr = []
    langs.forEach(item => {
      arr.push({ label: item.lang, value: item.lang })
    })
    list2Box.dialogList.lang.options = arr
    const type = res.type;
    const arr1 = []
    for (let i = 0; i < type.length; i++) {
      arr1.push({ label: type[i], value: i })
    }
    list2Box.dialogList.type.options = arr1
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
const handleCurrentChange = ({ value, index }) => {
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
  type: {
    type: 'select',
    label: '规则类型',
    placeholder: '规则类型',
    value: 0,
    options: [],
    prop: 'type',
    show: gameId
  },
  lang: {
    type: 'select',
    label: '规则语种',
    placeholder: '规则语种',
    value: '',
    options: [],
    prop: 'lang'
  },
  content: {
    type: 'slot',
    label: '内容',
    placeholder: '内容',
    value: '',
    name: 'content',
    prop: 'content'
  },
}
const dialogModel = reactive({
  type: 0,
  lang: '',
  content: '',
  game_id: 0,
  id: ''
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
    id: row.id
  }
  clickIndex.value = 1;
  ruleEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key != 'game_id' && key == dialogList[key]?.prop) {
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

const editorEle = (val) => {
  list2Box.dialogList.content.value = val
  // dialogModel.gi_info = val
}
const handleSave = () => {
  dialogModel.content = list2Box.dialogList.content.value
  dialogModel.game_id = gameId
  if (dialogModel.game_id > 0) {
    dialogModel.type = 99
  }
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    ruleEdit(query).then((res: any) => {
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
    ruleAdd(query).then((res: any) => {
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
    if (key != 'game_id' && key == dialogList[key]?.prop) {
      if (key == 'type') {
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
  ruleDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
  })
}


</script>

<template>
  <div>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <!-- <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div> -->
    </div>

    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template v-slot:content>
        <component @chage="editorEle" :content="dialogModel.content"
          :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #right="{ row }">
        <el-button v-if="hasAuth('edit')" size="small" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
      </template>
    </pure-table>
    <div class="btmNav clearfix">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
}

.line-box {
  margin-bottom: 15px;
}
</style>
