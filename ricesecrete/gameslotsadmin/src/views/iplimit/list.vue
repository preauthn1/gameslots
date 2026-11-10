<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { ipLimitList, ipLimitAdd, ipLimitEdit, ipLimitDelete } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'iplimitList'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("添加时间"),
    prop: "add_time",
  },
  {
    label: transformI18n("更新时间"),
    prop: "update_time",
  },
  {
    label: transformI18n("ip"),
    prop: "ip",
  },
  {
    label: transformI18n("后台状态"),
    slot: "admin_status",
  },
  {
    label: transformI18n("前端状态"),
    slot: "api_status",
  },
  {
    label: transformI18n("备注"),
    prop: "remarks",
  },
  {
    label: transformI18n("最后更新"),
    prop: "admin_name",

  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button>
      </>
    )
  }
];

//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: 'ip',
    value: '',
    idx: 0,
    span: 16
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:1
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  ip:''
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
  ipLimitList(pagination).then((res: any) => {
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
  pagination.ip = list[0].value
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
  ip:{
    type: 'input',
    label: 'IP地址',
    placeholder: 'IP地址',
    value: '',
    prop:'ip'
  },
  remarks:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    ty:'textarea',
    prop:'remarks'
  },
  admin_status:{
    type: 'radio',
    label: '后台状态',
    placeholder: '后台状态',
    tip:'<div>限制访问: 设置后该IP不能访问后台</div><div>允许访问: 设置后只允许该IP能访问后台</div><div>不限制: IP为前端限制时选择该项</div><div>后台和前端只能限制一个</div>',
    value: -1,
    options: [
      {
        label: -1,
        name:'不限制'
      },
      {
        label: 1,
        name:'限制访问'
      }, {
        label: 0,
        name:'允许访问'
      },
    ],
    prop:'admin_status'
  },
  api_status:{
    type: 'radio',
    label: '前端状态',
    placeholder: '前端状态',
    tip:'不限制: IP为后台限制时选择该项',
    value: -1,
    options: [
      {
        label: -1,
        name:'不限制'
      },
      {
        label: 1,
        name:'限制访问'
      }, {
        label: 0,
        name:'允许访问'
      },
    ],
    prop:'api_status'
  },

}
const dialogModel = reactive({
  ip: '',
  remarks: '',
  admin_status: -1,
  api_status:-1,
  id:''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index === 'admin_status' && value != -1) {
    handleDialogChange({value: -1, index: 'api_status'})
  } else if (index === 'api_status' && value != -1) {
    handleDialogChange({value: -1, index: 'admin_status'})
  }
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
  ipLimitEdit(query).then((res: any) => {
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
    ipLimitEdit(query).then((res: any) => {
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
    ipLimitAdd(query).then((res: any) => {
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
          list2Box.dialogList[key].value = -1
          dialogModel[key] = -1
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
  ipLimitDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
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
    <commDialog title="基础信息" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
        <template #admin_status="{ row }">
          <el-tag size="small" type="danger" v-if="row.admin_status == 1">{{ $t('限制访问') }}</el-tag>
          <el-tag size="small" type="info" v-else-if="row.admin_status == -1">{{ $t('不限制') }}</el-tag>
          <el-tag size="small" type="success" v-else>{{ $t('允许访问') }}</el-tag>
      </template>
      <template #api_status="{ row }">
          <el-tag size="small" type="danger" v-if="row.api_status == 1">{{ $t('限制访问') }}</el-tag>
          <el-tag size="small" type="info" v-else-if="row.api_status == -1">{{ $t('不限制') }}</el-tag>
          <el-tag size="small" type="success"  v-else>{{ $t('允许访问') }}</el-tag>
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
