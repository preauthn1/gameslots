<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { liansaiTeamList,liansaiTeamAdd,liansaiDelete,liansaiTeamEdit,uploadImgApi,teamStatusEdit } from "@/api/user";
import { message } from "@/utils/message";
import type { UploadInstance } from 'element-plus'
import { transformI18n } from '@/plugins/i18n';

const uploadRef = ref<UploadInstance>()
const { proxy } = getCurrentInstance();

const columns = [
    {
      label: transformI18n("队伍名称"),
      prop: "t_name",
    },
    {
      label: transformI18n("队伍logo"),
      slot: "logo",
    },{
      label: transformI18n("狀態"),
      slot: "status",
    },
    {
      label: transformI18n("操作"),
      slot:'right'
    }
  ];

const emit = defineEmits(['select'])
const props = defineProps({
  backSelect: Boolean,
  ls_id:String
})
console.log('展示'+emit);
const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = {
  t_name: {
    type: 'input',
    placeholder: '队伍名称',
    value: '',
    prop: 't_name'
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  select:true,
  ls_id:'',
  t_name: ''
});
if (props?.ls_id) {
  pagination.ls_id = props.ls_id
}
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  pagination.page = 1;
  pagination.t_name = list['t_name'].value
  init();
}

//首次需要加载的接口
init();
function init() {
  liansaiTeamList(pagination).then((res:any) => {
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
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
const currentStatus = ref(1);
//添加
const handleAdd = () => {
  visible.value = true
  currentStatus.value = 1;
}
//弹框写法
const visible = ref(false);

const dialogList = {

  t_name:{
    type: 'input',
    label: '联赛名称',
    placeholder: '联赛名称',
    value: '',
    prop:'t_name'
  },
  logo: {
    type: 'slot',
    label: '',
    value:'',
    prop: 'logo',
    name:'logo'
  },
  status: {
     type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
      {
        label: 1,
        name:'启用'
      },{
        label: 0,
        name:'禁用'
      },
    ],
    prop:'status'
  }
}
const dialogModel = reactive({
  // level_name: '',
  t_name: '',
  status: 1,
  logo:''
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}

const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  dialogModel[index] = value;
}

//点击启用用户
const handleStatus = (row) => {
  const query = {
    edit:true,
    info: {
      id: row.id,
      status:row.status==1?0:1
    }
  }
    proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
      teamStatusEdit(query).then((res: any) => {
        if (res.code == 1) {
          message(res.msg, { type: 'success' });
          init();
        }
      })
        }).catch(() => {
          console.log('取消');
    })
 }

//编辑点击确定
const handleSave = () => {
  if (currentStatus.value == 1) {
    const query = {
      add: true,
      info: {
        ls_id: pagination.ls_id,
        status: dialogModel.status,
        t_name:dialogModel.t_name
      }
    }
    liansaiTeamAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false
         init();
      }
    })
  } else {
     const query = {
      eidt: true,
      info: {
        ...dialogModel,
      }
    }
    liansaiTeamEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false
      }
    })
  }
}
let selectAll = [];
const handleSelectionChange = (val) => {
  selectAll = val;
}
const handleDelete = () => {
  if (selectAll.length > 0) {
    deleteCurrent(getIds());
  } else {
    message('请选择用户', { type: 'warning' });
  }
}
const getIds =()=>{
      const s_arr = [];
      selectAll.forEach(item => {
        s_arr.push(item.id)
      })
  return s_arr.join(',');
}
const deleteCurrent = (id) => {
      proxy.$confirm('确认删除吗？', '提示').then(() => {
        selectDelete(id);
        }).catch(() => {
          console.log('取消');
    })
}
function selectDelete(id) {
  const queryDelte = {
    delete: true,
    id
  }
  liansaiDelete(queryDelte).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
       init();
    }
  })
}
//点击对付管理
const handleManage = (index,row) => {

}
//点击编辑
const handleEdit = (row) => {
    //liansaiEdit
    currentStatus.value = 2;
  for (const key in row) {
    if (key == dialogList[key]?.prop) {

      dialogList[key].value = row[key]
      dialogModel[key] = row[key]
    }
  }
  visible.value = true
}


//上传图片  uploadImgApi
const handleChangeImage = (e) => {
  console.log('该拜年');
   console.log(e);
  // let query = {
  //   'files[]':e.raw
  // }
  // uploadImgApi(query).then((res: any) => {

  // })
}

</script>

<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger" @click="handleDelete">{{ $t('删除') }}</el-button> -->
        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
        <template #status="{ row }">
          <el-button size="small" type="danger"  v-if="row.status == 0" @click="handleStatus(row)">{{ $t('关闭') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.status == 1" @click="handleStatus(row)">{{ $t('启用') }}}</el-button>
      </template>
       <template #logo="{ row }">
          <el-image style="width: 100px; height: 100px" :src="row.logo" fit="contain" />
      </template>
      <template #right="{ row }">
        <!-- <el-button type="primary" size="small" @click="handleManage(index,row)">
            队伍管理
          </el-button> -->
          <el-button v-if="backSelect"
            size="small"
            type="primary"
            @click="emit('select',row);"
          >
            选择联赛
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(row)"
                   >
            编辑
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
    <commDialog title="编辑" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
         <template #logo v-if="currentStatus == 2">

                 <el-upload
                    ref="uploadRef"
                    :auto-upload="false"
                    :on-change="handleChangeImage"
                  >
                    <template #trigger>
                        <el-image style="width: 100px; height: 100px" :src="dialogList.logo.value" fit="contain" />
                    </template>
                  </el-upload>
            </template>
      </commDialog>
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
