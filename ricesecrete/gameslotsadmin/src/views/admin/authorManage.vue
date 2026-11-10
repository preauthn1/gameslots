<script setup lang='ts'>
import { reactive, ref, toRaw ,getCurrentInstance} from 'vue'
import { VXETable, VxeTableInstance } from 'vxe-table'
import { adminNodelist,adminNodeEidt,adminNodeAdd,adminNodeDelete,adminSetSort } from "@/api/user";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { transformI18n } from '@/plugins/i18n';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'authorManage'
})
//首次加载数据
const list = reactive({ tableData: [] })
init();
function init() {
  adminNodelist().then((res: any) => {
    if (res.code == 1) {
      list.tableData = res.data.data
      const special = res.data.special;
      const arr=[]
      for(const key in special){
        arr.push({label:special[key],value:special[key]})
      }
      list2Box.dialogList['special_menu'].options = arr;
    }
    // permiseInit()
  })
}

//点击节点下的名称
const xTree = ref<VxeTableInstance>()
const toggleExpandChangeEvent = (params: any) => {
  const $table = xTree.value
  const { row, expanded } = params
  // console.log('节点展开事件', expanded, '获取父节点：', $table.getParentRow(row))
}

// const getTreeExpansionEvent = () => {
//   const $table = xTree.value
//   const treeExpandRecords = $table.getTreeExpandRecords()
//   VXETable.modal.alert(treeExpandRecords.length)
// }
//排序数据改变
const handleSortInput = (val,row) => {
  const query = {
    id: row.id,
    sort:val
  }
  adminSetSort(query).then((res: any) => {
   if (res.code == 1) {
        message(res.msg, { type: 'success' });

      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
//编辑子权限
const eidtChild = (row) => {

}

//删除
const handleDelete = (row) => {
   proxy.$confirm(transformI18n('确认删除吗？'), transformI18n('提示')).then(() => {
    deleteIds(row.id)
  }).catch(() => {
    // console.log('取消');
  })
}

//弹框写法
const visible = ref(false);
const dialogList = {
  parentName: {
    type: 'input',
    label: '父节点名称',
    placeholder: '父节点名称',
    show: true,
    value: '',
    disable:true,
    prop: 'node_name'
  },
  node_name:{
    type: 'input',
    label: '节点名称',
    placeholder: '节点名称',
    value: '',
    prop:'node_name'
  },
  path:{
    type: 'input',
    label: '节点路径',
    placeholder: '节点路径',
    value: '',
    prop:'path'
  },
  name:{
    type: 'input',
    label: '节点标识',
    placeholder: '节点标识',
    value: '',
    prop:'name'
  },
  icon: {
    type: 'input',
    label: '图标',
    placeholder: '图标',
    prop: 'icon',
    value: '',
  },
  special_menu:{
    type: 'select',
    label: '特殊权限',
    placeholder: '特殊权限',
    value: '',
    options:[],
    tip:'如果不用在配置文件中控制某个系列菜单,该项选择默认即可',
    prop:'special_menu'
  },
  sort:{
    type: 'input',
    label: '排序',
    placeholder: '数值越小越靠前',
    value: '',
    prop:'sort'
  },
  is_menu: {
    type: 'radio',
    label: '菜单',
    value: 0,
    prop: 'is_menu',
    options: [
      {
        label: 1,
        name: '否'
      }, {
        label: 0,
        name: '是'
      },
    ]
  },
  status: {
    type: 'radio',
    label: '状态',
    value: 0,
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
  node_name:'',
  path:'',
  name:'',
  icon:'',
  special_menu:'special_menu',
  sort:'',
  status:'',
  is_menu:'',
  id:''
})
const pid = ref('');
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
  adminNodeEidt(query).then((res: any) => {
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
    adminNodeEidt(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  } else if (clickIndex.value == 2) {
      const query = {
      add: true,
      info: dialogModel
    }
    adminNodeAdd(query).then((res: any) => {
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
         ...dialogModel,
        pid:pid.value
       }
    }
    adminNodeAdd(query).then((res: any) => {
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
        if (key == 'special_menu') {
          list2Box.dialogList[key].value = 'normal'
          dialogModel[key] = 'normal'
       } else {
         list2Box.dialogList[key].value = ''
       }

     }
  }
  list2Box.dialogList.parentName.show = true;
  list2Box.dialogList.parentName.value = '';
  pid.value = '';
  clickIndex.value = 2;
  visible.value = true;
}

//添加子权限
const addChild = (row) => {
  for (const key in dialogModel) {
     dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
        if (key == 'special_menu') {
          list2Box.dialogList[key].value = 'normal'
          dialogModel[key] = 'normal'
       } else {
         list2Box.dialogList[key].value = ''
       }

     }
    }
  list2Box.dialogList.parentName.show = false;
  list2Box.dialogList.parentName.value = row.node_name;
  pid.value = row.id
  clickIndex.value = 3;
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
  adminNodeDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        // init();
        list.tableData = list.tableData.filter((row) => {
          return id != row.id
        });
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
</script>

<template>
  <div>
    <div class="line-box">
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button type="primary" @click="handleAdd">{{ transformI18n('添加') }}</el-button>
    </div>
    <div>
      <commDialog title="编辑" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
       <!-- <vxe-toolbar>
          <template #buttons>
            <vxe-button @click="getTreeExpansionEvent">{{ $t('获取已展开') }}</vxe-button>
            <vxe-button @click="$refs.xTree.setAllTreeExpand(true)">{{ $t('展开所有') }}</vxe-button>
            <vxe-button @click="$refs.xTree.clearTreeExpand()">{{ $t('关闭所有') }}</vxe-button>
          </template>
        </vxe-toolbar> -->

        <vxe-table
          border="inner"
          ref="xTree"
          :column-config="{resizable: true}"
          :tree-config="{transform: true, rowField: 'id', parentField: 'pid'}"
          :data="list.tableData"
          @toggle-tree-expand="toggleExpandChangeEvent">
          <vxe-column width="100" field="id" title="ID" />
          <vxe-column field="node_name" :title="transformI18n('节点名称')" tree-node/>
          <vxe-column field="path" :title="transformI18n('节点路径')"/>
          <vxe-column field="icon" :title="transformI18n('图标')">
            <template #default="{ row }">
              <component
                :is="useRenderIcon(toRaw(row.icon))"
              />
            </template>
          </vxe-column>
          <vxe-column field="sort" width="100" :title="transformI18n('排序')">
            <template #default="{ row }">
              <el-input v-model="row.sort" @change="handleSortInput($event,row)" placeholder="" />
            </template>
          </vxe-column>
          <vxe-column field="special_menu" :title="transformI18n('特殊权限')"/>
          <vxe-column field="status" width="100" :title="transformI18n('状态')">
            <template #default="{ row }">
              <el-tag size="small" type="danger" v-if="row.status == 0">{{ $t('关闭') }}</el-tag>
              <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
            </template>
          </vxe-column>
          <vxe-column max-width="300" :title="transformI18n('操作')" >
            <template #default="{ row }">
                <el-button size="small" type="primary" @click="addChild(row)">{{ transformI18n('添加子权限') }}</el-button>
                <el-button size="small" type="primary" @click="handleEidt(row)">{{ transformI18n('编辑') }}</el-button>
                <el-button size="small" type="danger" v-if="!row.cid" @click="handleDelete(row)">{{ transformI18n('删除') }}</el-button>
            </template>
          </vxe-column>
        </vxe-table>
    </div>
  </div>
</template>

<style scoped>
  .line-box{
    margin-bottom: 10px;
  }
</style>
