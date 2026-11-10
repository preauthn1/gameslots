<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent,getCurrentInstance } from 'vue';
import { gamesetType,gameTypeSetEdit,gameTypeAdd,gamesetTypeDelete } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
const { proxy } = getCurrentInstance();
// @ts-ignore
import { hasAuth } from '@/router/utils';

defineOptions({
  name: 'gameCategory'
})
const columns = [
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
      label: transformI18n("名称"),
      slot: "name",
    },
    {
      label: transformI18n("选中图标"),
      slot: "icon",
    },
    {
      label: transformI18n("默认图标"),
      slot: "default_icon",
    },
    {
      label: transformI18n("排序"),
      prop: "sort",
    },{
      label: transformI18n("状态"),
      slot: "state",
    },{
      label: transformI18n("添加时间"),
      prop: "create_time",
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
          <el-button v-show={hasAuth('back')} size="small" type="warning"  onClick={ ()=> handleSet(index,row)}>{ transformI18n('返水设置') }</el-button>
        </>
      )
    },
];

//以下是搜索框的数据

const searchList = {
  keyword:{
    type: 'input',
    placeholder: '名称',
    value: '',
    prop: 'keyword',
    span: 8
  },
  state: {
    type: 'select',
    placeholder: '状态',
    value: '',
    options: [
      {
        label: '开启',
        value: 1,
      }, {
        label: '关闭',
        value: 2,
      },
    ],
    prop: 'state',
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
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  keyword: '',
  state: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.value.page = 1;
//   pagination.value.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  gamesetType(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
  })
}
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
   init();
};

//弹框写法
const visible = ref(false);
const dialogList = {
  name:{
    type: 'input',
    label: '分类名称',
    placeholder: '分类名称',
    value: '',
    prop:'name'
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop:'sort'
  },
  min_amount: {
    type: 'input',
    label: '最低金额',
    placeholder: '最低金额',
    tip:'进入游戏最低本金限制',
    value: '',
    prop:'min_amount'
  },
  max_amount:{
    type: 'input',
    label: '最高金额',
    placeholder: '最高金额',
    tip:'进入游戏最高本金限制',
    value: '',
    prop:'max_amount'
  },
  icon: {
    type: 'slot',
    name: 'icon',
    value:'',
    label: '选中图标',
    prop:'icon'
  },
  default_icon: {
    type: 'slot',
    name: 'default_icon',
    value:'',
    label: '默认图标',
    prop:'default_icon'
  },
  state:{
    type: 'radio',
    value: 1,
    label:'是否开启',
    prop:'state',
    options: [
      {
        label: 1,
        name:'开启'
      },{
        label: 2,
        name:'关闭'
      },
    ]
  }
}
const dialogModel = reactive({
  name: '',
  sort: '',
  min_amount: '',
  max_amount:'',
  icon:'',
  default_icon: '',
  state: '',
  id:''
})
const listRules = {
   name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}
const dialogIndex = ref(1);
  //编辑
let eidtCurrentRow = {}
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  dialogIndex.value = 1;
  gameTypeSetEdit(query).then((res: any) => {
    if (res.code == 1) {
      visible.value = true;
      eidtCurrentRow = res.data;
      dialogModel.id = res.data.id
      for (const key in dialogList) {
        list2Box.dialogList[key].value = row[key]
        dialogModel[key] = row[key]
      }
    } else {
       message(res.msg, { type: 'error' });
    }
  })
  // visible.value = true;
  // eidtCurrentRow = row;
  // for(var key in dialogList){
  //   dialogList[key].value = row[key]
  //   dialogModel[key] = row[key]
  // }
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}

//上传成功后的图片
const backDefaultImageData = (val) => {
  dialogModel.default_icon = val.file[0];
  list2Box.dialogList['default_icon'].value = val.file[0];
}

const handleSave = () => {
  if (dialogIndex.value == 1) {
    const query = {
      edit: true,
      info: {
        ...dialogModel
      }
    }
    gameTypeSetEdit(query).then((res: any) => {
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
      info: {
        ...dialogModel
      }
    }
    gameTypeAdd(query).then((res: any) => {
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
  for (const key in dialogList) {
    list2Box.dialogList[key].value = ''
    dialogModel[key] = ''
  }
  dialogIndex.value = 2;
  visible.value = true;
}
const selectShow = ref(false);
const selectId = ref(-1);
//返水设置
const handleSet = (index,row) => {
  selectShow.value = true
  selectId.value = row.id
}

//删除
let selectAll = [];
const handleDelet = () => {
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
    console.log('取消');
  })

}
const handleSelectionChange = (val) => {
  console.log(val);
  selectAll = val;
}
function deleteIds(id) {
  const query = {
    delete: true,
    id
  }
  gamesetTypeDelete(query).then((res: any) => {
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

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value
    }
  }
  pagination.page = 1;
  init();
}

</script>

<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('返水设置')">
          <div style="padding-bottom:30px;">
            <component :id="selectId" :is="defineAsyncComponent(()=> import('@/views/threeGames/returnWater.vue'))" />
          </div>
    </el-dialog>
    <commDialog title="编辑" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:icon>
        <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.icon" />
      </template>
      <template v-slot:default_icon>
        <uploadImage @imageData="backDefaultImageData"  :limit="1" :image="dialogModel.default_icon" />
      </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #state="{ row }">
          <el-tag size="small" type="danger" v-if="row.state == 2">{{ $t('关闭') }}</el-tag>
          <el-tag size="small" type="success" v-else>{{ $t('开启') }}</el-tag>
      </template>
      <template #icon="{ row }">
          <el-image v-if="row.icon" style="width: 30px; height: 30px" :src="row.icon" fit="contain" />
      </template>
      <template #default_icon="{ row }">
          <el-image v-if="row.default_icon" style="width: 30px; height: 30px" :src="row.default_icon" fit="contain" />
      </template>
      <template #name="{ row }">
          {{$t(row.name)}}
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
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
</style>
