<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { thirdLogLists, thirdLogEdit } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";
import { hasAuth } from '@/router/utils';
import { message } from "@/utils/message";

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("ID"),
    prop: "ubtl_id",
    width:50
  },
  {
    label: transformI18n("转账类型"),
    slot: "ubtl_type",
    width:160
  },
  {
    label: transformI18n("平台ID"),
    prop: "ubtl_tcid",
  },
  {
    label: transformI18n("UID"),
    prop: "ubtl_uid",
  },
  {
    label: transformI18n("平台旧余额"),
    prop: "ubtl_oldban",
  },
  {
    label: transformI18n("平台新余额"),
    prop: "ubtl_newban",
  },
  {
    label: transformI18n("转账金额"),
    prop: "ubtl_amount",
  },
  {
    label: transformI18n("转账时间"),
    prop: "ubtl_intime",
  },
  {
    label: transformI18n("状态"),
    slot: "ubtl_status",
    width:160
  },
  {
    label: transformI18n("处理时间"),
    prop: "ubtl_errproc",
  },
  {
    label: transformI18n("备注"),
    prop: "ubtl_errprocinfo",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  ubtl_uid:{
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'ubtl_uid'
  },
  ubtl_tcid:{
    type: 'input',
    label:'平台ID',
    placeholder:'平台ID',
    prop: 'ubtl_tcid',
    value: '',
  },
  ubtl_type:{
    type: 'select',
    label:'转账类型',
    placeholder:'转账类型',
    prop:'ubtl_type',
    options: [
      {
        label: '空置',
        value: 0,
      },
      {
        label: '充值',
        value: 1,
      },
      {
        label: '提现',
        value: 2,
      },
      {
        label: '平台转游戏',
        value: 3,
      },
      {
        label: '游戏转平台',
        value: 4,
      },
    ]
  },
  ubtl_status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop:'ubtl_status',
    options: [
      {
        label: '空置',
        value: 0,
      },
      {
        label: '准备执行',
        value: 1,
      },
      {
        label: '失败',
        value: 2,
      },
      {
        label: '成功',
        value: 3,
      },
      {
        label: '处理成功并返回余额',
        value: 4,
      },
      {
        label: '处理成功未返回余额',
        value: 5,
      },
    ]
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

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  ubtl_tcid:'',//平台id
  ubtl_type:'',//转账类型
  ubtl_status:'',//状态
  ubtl_uid: '',//用户uid
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  thirdLogLists(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    // list2Box.dialogList.lang.options = res.langs
  })
}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init(pagination);
};

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}

//弹框写法
const visible = ref(false);
const dialogList = {
  ubtl_uid:{
    type: 'input',
    label: 'UID',
    placeholder: 'UID',
    value: '',
    prop: 'ubtl_uid',
  },
  ubtl_tcid:{
    type: 'input',
    label: '平台ID',
    placeholder: '平台ID',
    value: '',
    prop: 'ubtl_tcid',
  },
  ubtl_oldban:{
    type: 'input',
    label: '平台旧余额',
    placeholder: '平台旧余额',
    value: '',
    prop: 'ubtl_oldban',
  },
  ubtl_newban:{
    type: 'input',
    label: '平台新余额',
    placeholder: '平台新余额',
    value: '',
    prop: 'ubtl_newban',
  },
  third_balance:{
    type: 'input',
    label: '三方余额',
    placeholder: '三方余额',
    value: '',
    prop: 'third_balance',
  },
  ubtl_amount:{
    type: 'input',
    label: '转账金额',
    placeholder: '转账金额',
    value: '',
    prop: 'ubtl_amount',
    tip: '以上数据修改也不会生效，仅供查看',
  },
  is_restart:{
    type: 'radio',
    value: 1,
    label:'退回余额',
    placeholder:'退回余额',
    prop: 'is_restart',
    options: [
      {
        label: 1,
        name:'是'
      },
      {
        label: 0,
        name:'否'
      },
    ]
  },
  ubtl_errprocinfo:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop: 'ubtl_errprocinfo',
    show: false,
  },
}
const dialogModel = reactive({
  ubtl_id: '',
  ubtl_uid: '',
  ubtl_tcid: '',
  ubtl_oldban: '',
  ubtl_newban: '',
  ubtl_amount: '',
  third_balance: '',
  is_restart: 1,
  ubtl_errprocinfo: '',
})

const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}

//重新处理
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.ubtl_id
  }
  thirdLogEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if ( key == 'is_restart' ) {
           continue;
         }
         if (key == dialogList[key]?.prop) {
           dialogList[key].value = res.data[key]
           list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
       }
       console.log(dialogModel)
       visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  const query = {
    edit: true,
    info: dialogModel
  }
  thirdLogEdit(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      visible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
</script>

<template>
  <div style="padding-bottom: 40px;">
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
      <template #ubtl_type="{ row }">
         <el-tag size="small" type="success"  v-if="row.ubtl_type == 0">{{ $t('空置') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_type == 1">{{ $t('充值') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_type == 2">{{ $t('提现') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_type == 3">{{ $t('平台转游戏') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_type == 4">{{ $t('游戏转平台') }}</el-tag>
      </template>
       <template #ubtl_status="{ row }">
         <el-tag size="small" type="warning"  v-if="row.ubtl_status == 0">{{ $t('空置') }}</el-tag>
         <el-tag size="small" type="warning"  v-else-if="row.ubtl_status == 1">{{ $t('准备执行') }}</el-tag>
         <el-tag size="small" type="danger"  v-else-if="row.ubtl_status == 2">{{ $t('失败') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_status == 3">{{ $t('成功') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_status == 4">{{ $t('处理成功并返回余额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.ubtl_status == 5">{{ $t('处理成功未返回余额') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('handle') && (row.ubtl_type == 3 || row.ubtl_type == 4) && (row.ubtl_status == 1 || row.ubtl_status == 2)" type="primary" @click="handleEidt(row)">{{ $t('重新处理') }}</el-button>
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
<style scoped>
.btmNav{
  padding-top:10px;
  padding-bottom: 30px;
}
</style>
