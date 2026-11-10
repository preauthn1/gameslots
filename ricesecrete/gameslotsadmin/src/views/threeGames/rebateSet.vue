<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { gameAgentList,gameAgentEidt,gameAgentsetAdd } from "@/api/user";

import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
defineOptions({
  name: 'rebateSet'
})
const columns = [
    {
      label: transformI18n("ID"),
      prop: "tfc_id",
    },
    {
      label: transformI18n("盈利金额"),
      prop: "tfc_amount",
    },{
      label: transformI18n("有效客户数"),
      prop: "tfc_validusers",
    },
    {
      label: transformI18n("分佣比例"),
      prop: "tfc_rate",
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        </>
      )
    },
];


const height = window.innerHeight - 250;
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '联赛名称',
    value: '',
    idx:0
  },
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
  order: '',//排序 desc 或 asc
  field:'',
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
  gameAgentList(pagination).then((res:any) => {
    tableData.dataList = res.data

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
  tfc_amount:{
    type: 'input',
    label: '盈利金额',
    placeholder: '盈利金额',
    value: '',
    prop:'tfc_amount'
  },
  tfc_validusers:{
    type: 'input',
    label: '有效客户数',
    placeholder: '有效客户数',
    tip:'直属下级用户，包含自己',
    value: '',
    prop:'tfc_validusers'
  },
  tfc_rate:{
    type: 'input',
    label: '分佣比例',
    placeholder: '分佣比例',
    value: '',
    tip:'如分佣比例是 1%，请填写0.01',
    prop:'tfc_rate'
  }
}
const dialogModel = reactive({
  tfc_amount: '',
  tfc_validusers: '',
  tfc_rate: '',
})
const listRules = {
   name: [
    { required: true, message: '分类名称', trigger: 'blur' },
    { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}
const showTitle=ref('添加');
  //编辑
let EidtRow = {
  tfc_type:'',
  tfc_id:''
};
const handleAdd=()=>{
  visible.value = true;
  for(const key in dialogList){
    list2Box.dialogList[key].value = ''
    dialogModel[key] = ''
  }
  showTitle.value = '添加'
  EidtRow = {
    tfc_type:'',
    tfc_id:''
  };
}

const handleEidt = (row) => {
  EidtRow = row;
  visible.value = true;
    showTitle.value = '编辑'
  for(const key in dialogList){
    dialogList[key].value = row[key]
    dialogModel[key] = row[key]
  }
}
const handleSave=()=>{
  let query={}
  if(showTitle.value == '编辑'){
    query={
    edit:true,
    info:{
      tfc_id:EidtRow.tfc_id,
      tfc_amount:dialogModel.tfc_amount,
      tfc_rate:dialogModel.tfc_rate,
      tfc_type:EidtRow.tfc_type,
      tfc_validusers:dialogModel.tfc_validusers
      }

    }
  gameAgentEidt(query).then((res:any)=>{
    if(res.code == 1){
      message(res.msg, { type: 'success' });
        visible.value = false;
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  })
  }else{
    query={
    add:true,
    info:{
      tfc_amount:dialogModel.tfc_amount,
      tfc_rate:dialogModel.tfc_rate,
      tfc_type:'2',
      tfc_validusers:dialogModel.tfc_validusers
    }
    }
  gameAgentsetAdd(query).then((res:any)=>{
    if(res.code == 1){
      message(res.msg, { type: 'success' });
        visible.value = false;
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  })
  }


}
</script>

<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <commDialog :title="showTitle" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
        <template #state="{ row }">
          <el-button size="small" type="danger"  v-if="row.state == 0">{{ $t('关闭') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.state == 1">{{ $t('开启') }}</el-button>
      </template>
      <template #icon="{ row }">
          <el-image :src="row.icon" fit="contain" />
      </template>
    </pure-table>
    <!-- <div class="btmNav">
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
    </div> -->

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
