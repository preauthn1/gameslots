<script setup lang="tsx">
import { reactive, ref ,getCurrentInstance} from 'vue';
import { thirdSetList, thirdEidt, thirdAdd } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'thirdsetList'
})
const columns = [
  {
    label: transformI18n("ID"),
    prop:'id'
  },
  {
    label: transformI18n("封面"),
    slot:'icon'
  },
  {
    label: transformI18n("名称"),
    prop: "name",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
  }, {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        </>
      )
  }
];

const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = [
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:2
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  thirdSetList(pagination).then((res: any) => {
    console.log(res.data);
    tableData.dataList = res.data
    pagination.total = res.count
    // pagination.page = res.data.current_page
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

//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}



//弹框写法
const visible = ref(false);
const dialogList = {
  third_sys_sign:{
    type: 'input',
    label: '标识',
    placeholder: '标识',
    value: '',
    prop:'third_sys_sign'
  },
  name:{
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop:'name'
  },
  appid:{
    type: 'input',
    label: 'appid',
    placeholder: 'appid',
    value: '',
    prop:'appid'
  },
   secretkey:{
    type: 'input',
    label: 'secretkey',
    placeholder: 'secretkey',
    value: '',
    prop:'secretkey'
  },
  callback:{
    type: 'input',
    label: '回调',
    placeholder: '回调',
    value: '',
    prop:'callback'
  },

  sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    ty:'number',
    prop:'sort'
  },
  icon: {
    type: 'slot',
    name: 'upload',
    label: '封面',
    prop: 'icon',
    value: '',
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 0,
    options: [
      {
        label: 1,
        name:'启用'
      }, {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'status'
  },

}
const dialogModel = reactive({
  third_sys_sign:'',
  name:'',
  appid:'',
  secretkey:'',
  callback:'',
  sort:'',
  icon:'',
  status:0,
  id:''
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
    id:row.id
  }
  clickIndex.value = 1;
  thirdEidt(query).then((res: any) => {
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
    thirdEidt(query).then((res: any) => {
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
    thirdAdd(query).then((res: any) => {
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
     if (key == dialogList[key]?.prop) {
        if (key == 'status') {
          list2Box.dialogList[key].value = 1
          dialogModel[key] = 1
       } else {
         list2Box.dialogList[key].value = ''
       }

     }
    }
  clickIndex.value = 2;
  visible.value = true;
}

//图片返回
const backImageData = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}

</script>

<template>
  <div>
   <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <commDialog title="基础信息" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage @imageData="backImageData" :image="dialogModel.icon" :limit="1" />
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
      <template #icon="{ row }">
          <el-image style="width:32px;" :src="row.icon"/>
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
