<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { defaultHeadImgList, defaultHeadImgEdit, defaultHeadImgAdd, defaultHeadImgDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'defaultHeadImg'
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
  },
  {
    label: transformI18n("头像"),
    width: 100,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={row.url} alt="" />
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
  name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name'
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
  defaultHeadImgList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
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


//上传成功后的图片
const backImageData = (val) => {
  dialogModel.url = val.file[0];
  list2Box.dialogList['url'].value = val.file[0];
}


//弹框写法
const visible = ref(false);
const dialogList = {
  name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name'
  },
  url: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '头像',
    prop: 'url'
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
  name: '',
  url: '',
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
  clickIndex.value = 1;
  defaultHeadImgEdit(query).then((res: any) => {
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
    defaultHeadImgEdit(query).then((res: any) => {
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
    defaultHeadImgAdd(query).then((res: any) => {
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
    if (key == 'id') {
      dialogModel[key] = ''
    } else if (key == 'type' || key == 'mode') {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
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
  defaultHeadImgDelete(query).then((res: any) => {
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
      <template #area="{ row }">
        <el-tag size="small" type="success">{{ area_list[row.area] }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑')
          }}</el-button>
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
