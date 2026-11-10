<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { adminRoleList,adminGetdata,adminRoleEdit,adminRoleAdd,adminRoleDelete } from "@/api/user";
// import uploadImage from '@/components/comm/uploadImage.vue'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'adminRoleList'
})
const treeRef = ref<InstanceType<typeof ElTree>>()
const columns = [
  {
      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("ID"),
      prop: "id",
    },{
      label: transformI18n("角色名称"),
      prop: "role_name",
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit') && row.id > 1} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        </>
      )
    },
];


const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = [
  // {
  //   type: 'input',
  //   placeholder: '管理员名称',
  //   value: '',
  //   idx:0
  // },
  // {
  //   type: 'button',
  //   value: '搜索',
  //   handle: 'search',
  //   idx:1
  // }
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
  adminRoleList(pagination).then((res: any) => {
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
  // console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}

//弹框写法
const visible = ref(false);
const dialogList = {
  role_name: {
    type: 'input',
    label: '角色名称',
    placeholder: '请输入角色名称',
    value: '',
    prop:'role_name'
  },
   ztree: {
    type: 'slot',
    label: '权限列表',
    placeholder: '权限列表',
    value: [],
    prop: 'ztree',
    name:'ztree',
  },

}
const dialogModel = reactive({
  role_name:'',
  ztree:[],
  id:''
})
const roleSelect = []
const role_permission = reactive({
  roleSelect
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
let check_strictly = null;
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  check_strictly = true

  adminGetdata(query).then((res: any) => {
     if (res.code == 1) {

       dialogModel.ztree = res.data.node_data;
       list2Box.dialogList['ztree'].value = res.data.node_data;
       visible.value = true;

      } else {
        message(res.msg, { type: 'error' });
    }
  })
  adminRoleEdit(query).then((res1: any) => {
        list2Box.dialogList['role_name'].value = res1.data.role_name
        dialogModel['id'] = res1.data.id
       dialogModel['role_name'] = res1.data.role_name
      role_permission.roleSelect = res1.data.role_permission.split(',')
  })
}

const handleSave = () => {
  let ids = treeRef.value!.getCheckedKeys(false).join(',')
  const name = treeRef.value!.getCheckedNodes(false).map(item => item.title).join(',');
  const ids_f = treeRef.value.getHalfCheckedNodes().map(item => item.id).join(',')
  if(ids_f != ''){
    ids = ids + ',' + ids_f
  }
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: {
        id:dialogModel.id,
        role_name:dialogModel.role_name,
        role_permission: ids,
        permission_name: name
      }
    }
    adminRoleEdit(query).then((res: any) => {
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
        role_permission:ids,
        permission_name:name,
        role_name:dialogModel.role_name,
      }
    }
    adminRoleAdd(query).then((res: any) => {
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
  dialogModel['role_name'] = ''
  list2Box.dialogList['role_name'].value = ''
  role_permission.roleSelect = []
  clickIndex.value = 2;
  check_strictly = false
  adminGetdata().then((res: any) => {
     if (res.code == 1) {

       dialogModel.ztree = res.data.node_data;
       list2Box.dialogList['ztree'].value = res.data.node_data;
       visible.value = true;
       role_permission.roleSelect = res.data.role_permission.split(',')

      } else {
        message(res.msg, { type: 'error' });
    }
  })

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
    // console.log('取消');
  })

}
const handleSelectionChange = (val) => {
  selectAll = val;
}
// const loadNode = (node: Node, resolve: (data: Tree[]) => void) =>{
//   // dialogModel.ztree = node.data
//   setTimeout(()=>{
//   resolve(dialogModel.ztree)
//   }, 500)
// }

function deleteIds(id) {
  const query = {
    delete: true,
    id
  }
  adminRoleDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

const defaultProps = {
  label:'title'
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
        <!-- <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"></commSerach> -->
      </div>
    </div>
    <commDialog title="编辑" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:ztree>
            <el-tree
            ref="treeRef"
            :data="dialogModel.ztree"
            show-checkbox
            :check-strictly="check_strictly"
            auto-expand-parent
            :default-expand-all="false"
            node-key="id"
            :default-checked-keys="role_permission.roleSelect"
            highlight-current
            :props="defaultProps"
          />
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange"/>
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
