<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from 'vue';
import { gameThirdWeb, gameThireWebEdit, gameThireWebAdd,gameThireWebDelete } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
// import uploadImages from '@/components/comm/uploadImages.vue'
import { message } from "@/utils/message";
import { copyContent } from "@/utils/global";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
import { http } from '@/utils/http';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'gamePlatformWeb'
})
const columns = [
{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "tc_id",
  },
  {
    label: transformI18n("平台图标"),
    slot: "icon",
  },
  {
    label: transformI18n("LOGO"),
    slot: "simple_icon",
  },
  {
    label: transformI18n("平台名称"),
    prop: "tc_name",
  },
  {
    label: transformI18n("状态"),
    slot: "tc_status",
  },
  {
    label: transformI18n("操作"),
    width: 300,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
      </>
    )
  },
];

const rtpShow = row => {
  return hasAuth('rtp') && row.is_has_rtp;
}

const searchList = {
  keyword:{
    type: 'input',
    placeholder: '平台名称',
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
        label: '所有',
        value: '',
      },{
        label: '开启',
        value: 1,
      }, {
        label: '关闭',
        value: 0,
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
  state: '',
  keyword:''
});
const dataList: any = [];
const tableData = reactive({ dataList });

//首次需要加载的接口
init();
function init() {
  gameThirdWeb(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
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

//弹框写法
const visible = ref(false);
const dialogList = {
  tc_name: {
    type: 'input',
    label: '平台名称',
    placeholder: '平台名称',
    value: '',
    prop: 'tc_name'
  },
  tc_status: {
    type: 'radio',
    value: 1,
    label: '狀態',
    prop: 'tc_status',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  },
  simple_icon: {
    type: 'slot',
    name: 'simple_upload',
    tip: '请上传正方形',
    value: '',
    label: '平台简标',
    prop: 'simple_icon'
  },
  icon: {
    type: 'slot',
    name: 'upload',
    tip: '图片尺寸400*200',
    value: '',
    label: '平台图标',
    prop: 'icon'
  },
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    tip: '排序，越大排越前面',
    value: '',
    prop: 'sort'
  }
}
const dialogModel = reactive({
  tc_name:'',
  tc_status: 1,
  simple_icon:'',
  icon:'',
  sort: '',
  tc_id: ''
})
const listRules = {
  tc_name: {
    required: true, message: '请输入平台名称', trigger: ['blur','change']
  },
  tc_status: {
    required: true, message: '请选择狀態', trigger: ['blur','change']
  }
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}
const clickCurrentIndex = ref(1);

//删除
let selectAll = [];
const handleDelet = () => {
  if (selectAll.length <= 0) {
      message(transformI18n('请选择'), { type: 'error' });
      return;
  }
  console.log(selectAll);
   const arr = [];
   proxy.$confirm(transformI18n('确认删除吗？'), transformI18n('提示')).then(() => {
    selectAll.forEach(item => {
      arr.push(item.tc_id);
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
  gameThireWebDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
  //编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  gameThireWebEdit({ find: true, id: row.tc_id }).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel['tc_id'] = res.data.tc_id
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//上传成功后的图片
const backImageData = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}


// const backPcPhotosData = (val) => {
//   dialogModel.pc_photos = val.file;
//   list2Box.dialogList['pc_photos'].value = val.file;
// }

//上传成功后的简标
const backSimpleImageData = (val) => {
  dialogModel.simple_icon = val.file[0];
  list2Box.dialogList['simple_icon'].value = val.file[0];
}
//添加
const handleAdd = () => {
  for (const key in dialogList) {
  if(key == 'tc_status'){
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else{
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  dialogModel['tc_id'] = ''
  clickCurrentIndex.value = 2
  visible.value = true;
}
//保存
const handleSave = () => {
  let query = {}
  let api = gameThireWebEdit;
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
    api = gameThireWebAdd;
  }
  api(query).then((res: any) => {
    if (res.code == 1) {
      // message(res.msg, { type: 'success' });
      visible.value = false;
      init();
    } else {
      // message(res.msg, { type: 'error' });
    }
  })
}

</script>

<template>
  <div>
   <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('add')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    </div>
    <commDialog title="基础信息" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:upload>
        <div>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.icon"/>
          <p>{{ $t('图片尺寸400x200') }}</p>
        </div>
      </template>
      <!-- <template v-slot:pc_photos>
        <div>
          <uploadImages @imageData="backPcPhotosData"  :limit="1" :image="dialogModel.pc_photos"/>
          <p>{{ $t('图片尺寸400x200') }}</p>
        </div>
      </template> -->
      <template v-slot:simple_upload>
        <div>
          <uploadImage @imageData="backSimpleImageData"  :limit="1" :image="dialogModel.simple_icon"/>
          <p>{{ $t('请上传正方形图片') }}</p>
        </div>
      </template>
    </commDialog>

   
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #tc_status="{ row }">
        <el-tag size="small" type="danger"  v-if="row.tc_status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success"  v-if="row.tc_status == 1">{{ $t('开启') }}</el-tag>
      </template>
      <template #icon="{ row }">
        <img v-if="row.icon" style="height:40px;" :src="row.icon"/>
      </template>
      <template #simple_icon="{ row }">
        <img v-if="row.simple_icon" style="height:40px;" :src="row.simple_icon"/>
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
