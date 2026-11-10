<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { adminList,adminDelete,adminAdd,adminEdit,adminStatusEdit,adminRand_char } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'adminLists'
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
      label: transformI18n("管理员名称"),
      prop: "name",
    },{
      label: transformI18n("账号"),
      prop: "username",
    },
    {
      label: transformI18n("角色名称"),
      prop: "role_name",
    },{
      label: transformI18n("状态"),
      slot: "status",
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n("编辑") }</el-button>
        </>
      )
    },
];

const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = {
  name: {
    type: 'input',
    placeholder: '管理员名称',
    value: '',
    prop: 'name',
    span: 16
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
  limit: 15,//条数
  total: 0,//总数
  name: '',
  role:true
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
  adminList(pagination).then((res: any) => {
    console.log(res.data);
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    const roleArr = []
    const roleData = res.admin_role_data;
    roleData.forEach(item => {
      roleArr.push({ label:item.role_name,value:item.id })
    })
    dialogList.role_id.options = roleArr
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
//搜索
const handleSerch = () => {
  pagination.page = 1;
    for (const key in pagination) {
      if (key == list[key]?.prop) {
        pagination[key] = list[key].value;
      }
  }
  init();
}
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}


//弹框写法
const visible = ref(false);
const dialogList = {
  name: {
    type: 'input',
    label: '管理员姓名',
    placeholder: '请输入管理员姓名',
    value: '',
    prop:'name'
  },
   username: {
    type: 'input',
    label: '管理员账号',
    placeholder: '管理员账号',
    value: '',
    prop:'username'
  },
   password: {
    type: 'slot',
    label: '管理员密码',
    placeholder: '管理员密码',
    value: '',
     prop: 'password',
    name:'password',
    tip:'密码随机生成，不可自行设置，点击保存之前，先保存密码'
  },
  role_id: {
    type: 'select',
    label: '系统角色',
    placeholder: '系统角色',
    value: '',
    options: [

    ],
    prop:'role_id'
  },
  limit_ip: {
    type: 'input',
    label: '登录IP限制',
    placeholder: '登录IP限制，多个IP以英文“,”隔开',
    value: '',
    prop:'limit_ip'
  },
  google_check:{
    type: 'radio',
    label: '验证',
    placeholder: '验证',
    value: 1,
    options: [
      {
        label: 0,
        name:'关闭'
      },{
        label: 1,
        name:'开启'
      },
    ],
    prop:'google_check'
  },
   reset_google:{
    type: 'radio',
    label: '重置google密钥',
    placeholder: '重置google密钥',
    value: 0,
    options: [
      {
        label: 0,
        name:'关闭'
      },{
        label: 1,
        name:'开启'
      },
    ],
    prop:'reset_google'
  },
  status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    value: 1,
    options: [
      {
        label: 0,
        name:'禁用'
      },{
        label: 1,
        name:'开启'
      },
    ],
    prop:'status'
  },
}
const dialogModel = reactive({
  name:'',
  username:'',
  password:'',
  role_id:'',
  limit_ip:'',
  google_check:0,
  reset_google:0,
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
  adminEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         if (key == 'reset_google') {
            dialogModel[key] = 0
            list2Box.dialogList[key].value = 0
         } else {
           dialogModel[key] = res.data[key]
         }

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
    adminEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  } else {
    const { name,
  username,
  password,
  role_id,
  limit_ip,
  google_check,
  status,
  } = dialogModel
     const query = {
      add: true,
       info: {name,username,password,role_id,limit_ip,google_check,status,parent_id:''}
    }
    adminAdd(query).then((res: any) => {
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
       if (dialogList[key].type == 'radio') {
         list2Box.dialogList[key].value = 0
         dialogModel[key] = 0
       } else {
         list2Box.dialogList[key].value  = ''
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
  adminDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}


//状态
const handleStatus = (row,val) => {
  // proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
    statusChage(row,val)
  // }).catch(() => {
  //   console.log('取消');
  // })
}
function statusChage(row,status) {
  const query = {
    edit: true,
    info: {
      id: row.id,
      status
    }
  }
  adminStatusEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const eidtUsername = (val) => {
  dialogModel.password = val;
   list2Box.dialogList.password.value = val;
}
const generatePwd = () => {
  adminRand_char().then((res:any)=>{
    if (res.code == 1) {
        dialogModel.password = res.data;
        list2Box.dialogList.password.value = res.data;
    }
  })
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
        <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
      </div>
    </div>
    <commDialog title="编辑" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:password>
            <div class="flex-fi user-box">
               <el-input  v-model="dialogModel.password" />
               <el-button style="margin-left: 20px;" type="primary" @click="generatePwd">{{ $t('生成密码') }}</el-button>
            </div>
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
        <template #status="{ row }">
          <!-- <el-button size="small" type="danger"  v-if="row.status == 0">{{ $t('关闭') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.status == 1">{{ $t('开启') }}</el-button> -->
           <el-switch @change="handleStatus(row,$event)"
              v-model="row.status"
              :disabled="!hasAuth('edit') || row.id <= 2"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              :active-text="$t('开启')"
              :inactive-text="$t('禁用')"
              size="large"
            />
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
