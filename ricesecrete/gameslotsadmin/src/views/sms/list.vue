<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, getCurrentInstance } from "vue";
import { smsList, smsEdit, smsDelete, smsAdd } from "@/api/user";
// @ts-ignore
import commForm from '@/components/comm/comm-form.vue'
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'smslist'
})
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    width: "100"
  },
  {
    label: transformI18n("名称"),
    prop: "sms_name",
    width: "100"
  },
  {
    label: transformI18n("标识"),
    prop: "sms_iden",
    width: "100"
  },
  {
    label: transformI18n("发送区号"),
    prop: "sms_qh",
    width: "100"
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
      </>
    )
  },
];
//弹框写法
const visible = ref(false);
const dialogList = {
  sms_name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'sms_name'
  },
  sms_iden: {
    type: 'input',
    value: '',
    label: '标识',
    placeholder: '标识',
    tip: '短信标识,添加后不可修改',
    prop: 'sms_iden'
  },
  sms_qh: {
    type: 'input',
    value: '',
    label: '发送区号',
    placeholder: '发送区号',
    tip: '发送区号多个请用“,”隔开,格式：255,99,256',
    prop: 'sms_qh'
  },
  sms_status: {
    type: 'radio',
    label: '状态',
    value: 0,
    prop: 'sms_status',
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
  id:'',
  sms_name:'',
  sms_iden:'',
  sms_qh:'',
  sms_status:'',
  sms_content: [{key_name: "", key_value: ""}],
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
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}

const clickCurrentIndex = ref(1);
//编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    id:row.id
  }
  smsEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.sms_content = res.data.sms_content;
      dialogModel.id = res.data.id;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//点击添加
const handleAdd = () => {
  clickCurrentIndex.value = 2
  for (const key in dialogList) {
    if (dialogList[key].type == 'radio') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }

    }
    dialogModel.id = '';
    visible.value = true;
}


//保存
const handleSave = () => {
  let query = {};
  let api = smsEdit;
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
    api = smsAdd;
  }
  api(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  smsList(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    pagination.page = res.current_page
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

//删除
let selectAll = [];
const handleDelete = () => {
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
  smsDelete(query).then((res: any) => {
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

const sms_content_col=[
  {
    label:'键',
    // prop: 'key_name',
    slot:'key_name'
  },
  {
    label: '值',
    slot:'key_value'
    // prop:'key_value'
  },
  {
    label:'操作',
    slot:'right'
  },
]

const delSmsParam=(index)=>{
  dialogModel.sms_content.splice(index,1)
}
const addSmsParam=()=>{
  dialogModel.sms_content.push({key_name: "", key_value: ""})
}
</script>
<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <el-dialog width="60%" v-model="visible" :title="$t('编辑')">
        <el-tabs type="border-card">
          <el-tab-pane :label="$t('基础信息')">
            <commForm title="保存" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" />
          </el-tab-pane>
          <el-tab-pane :label="$t('参数设置')">
            <pure-table :border="true" :data="dialogModel.sms_content" width="100%"  :columns="sms_content_col" >
              <template #key_name="{row}">
                <el-input v-model="row.key_name" :placeholder="$t('请输入键')" />
              </template>
              <template #key_value="{row}">
                <el-input v-model="row.key_value" :placeholder="$t('请输请输入值入键')" />
              </template>
              <template #right="{index}">
                <el-button size="small" type="danger" @click="delSmsParam(index)">{{ $t('删除') }}</el-button>
              </template>
            </pure-table>
            <el-button type="primary" style="margin-top:30px;" @click="addSmsParam">{{ $t('添加') }}</el-button>
          </el-tab-pane>
        </el-tabs>
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="danger" v-if="row.sms_status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.sms_status == 1">{{ $t('开启') }}</el-tag>
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
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
