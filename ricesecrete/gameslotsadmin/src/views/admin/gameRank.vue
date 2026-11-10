<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { gameRankList, gameRankEdit, gameRankAdd, gameRankDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gameRank'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  // {
  //   label: transformI18n("数据键值"),
  //   prop: "key_val",
  // },
  {
    label: transformI18n("排行名称"),
    prop: "name",
  },
  {
    label: transformI18n("图标名称"),
    prop: "icon",
  },
  {
    label: transformI18n("图标地址"),
    width: 100,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={row.icon_url} alt="" />
      </div>
    )
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
    fixed: "right",
    slot: 'right'
  }
];
const handleEdit = (index, row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  type: {
    type: 'select',
    label: '类型',
    placeholder: '类型',
    prop: 'type',
    options: [
      {
        label: '热门',
        value: 1,
      },
      {
        label: '最佳',
        value: 2,
      },
      {
        label: '最新',
        value: 3,
      },
      {
        label: '内部',
        value: 4,
      }
    ]
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
  type: '',//类型
  mode: '',//型号
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  gameRankList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    console.log(tableData.dataList);
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
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  pagination[index] = value;
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
  type: {
    type: 'radio',
    value: 1,
    label: '排行类型',
    placeholder: '排行类型',
    prop: 'type',
    options: [
      {
        label: 1,
        name: '热门'
      },
      {
        label: 2,
        name: '最佳'
      },
      {
        label: 3,
        name: '最新'
      },
      {
        label: 4,
        name: '内部'
      },
    ]
  },
  // key_val: {
  //   type: 'input',
  //   label: '排行数据键值',
  //   placeholder: '输入数据键值',
  //   tip: '数据键值 例如：self，top，hot，new',
  //   value: '',
  //   prop: 'key_val'
  // },
  name: {
    type: 'input',
    label: '排行名称',
    placeholder: '输入排行名称',
    value: '',
    prop: 'name'
  },
  icon: {
    type: 'input',
    label: '排行图标名称',
    placeholder: '输入排行图标名称',
    value: '',
    prop: 'icon'
  },
  icon_url: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '排行图标',
    prop: 'icon_url'
  },
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '数值越小越靠前',
    value: '',
    prop: 'sort'
  },
  status: {
    type: 'radio',
    label: '状态',
    value: 1,
    prop: 'status',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  }
}
const dialogModel = reactive({
  type: 1,
  key_val: '',
  name: '',
  icon: '',
  icon_url: '',
  sort: '',
  status: 1,
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
  // console.log(row);
  clickIndex.value = 1;
  gameRankEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          list2Box.dialogList[key].value = res.data[key]
        }
        dialogModel[key] = res.data[key]
      }
      console.log(dialogModel);
      // console.log(dialogModel);
      visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.icon_url = val.file[0];
  list2Box.dialogList['icon_url'].value = val.file[0];
}

const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    gameRankEdit(query).then((res: any) => {
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
    gameRankAdd(query).then((res: any) => {
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
    console.log(key);

    // if (key == 'id') {
    //   dialogModel[key] = ''
    // } else if (key == 'type') {
    //   list2Box.dialogList[key].value = 1
    //   dialogModel[key] = 1
    // } else {
    //   list2Box.dialogList[key].value = ''
    //   dialogModel[key] = ''
    // }
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
  gameRankDelete(query).then((res: any) => {
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
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template v-slot:upload>
        <uploadImage @imageData="backImageData" :limit="1" :image="dialogModel.icon_url" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
        <el-tag size="small" type="danger" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #type="{ row }">
        <el-tag size="small" type="success" v-if="row.type == 1">{{ $t('热门') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.type == 2">{{ $t('最佳') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.type == 3">{{ $t('最新') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.type == 4">{{ $t('内部') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
      </template>
    </pure-table>
    <div class="btmNav">
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
  margin-bottom: 10px;
}
</style>
