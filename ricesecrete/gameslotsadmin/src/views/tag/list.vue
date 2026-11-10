<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

defineOptions({
  name: 'tag_list'
})
const { proxy } = getCurrentInstance();
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
  },
  {
    label: transformI18n("标签"),
    prop: "name",
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag color={row.color} style={row.color ? 'color:#FFF' : ''} type={row.color ? '' : 'success'}>{ row.name }</el-tag>
      </>
    )
  },
  {
    label: transformI18n("提现限制"),
    slot: "is_withdraw",
  },
  {
    label: transformI18n("充值限制"),
    slot: "is_recharge",
  },
  {
    label: transformI18n("优惠活动限制"),
    slot: "is_activity",
  },
  {
    label: transformI18n("游戏限制"),
    slot: "is_game",
  },
  {
    label: transformI18n("推广奖励限制"),
    slot: "is_reward",
  },
  {
    label: transformI18n("任务限制"),
    slot: "is_task",
  },
  {
    label: transformI18n("备注"),
    prop: "remark",
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
  name: {
    type: 'input',
    label: '标签',
    placeholder: '标签名称',
    value: '',
    prop: 'name'
  },
  color: {
    type: 'color',
    label: '标签颜色',
    placeholder: '标签颜色',
    value: '',
    prop: 'color',
  },
  is_withdraw: {
    type: 'select',
    label: '提现限制',
    placeholder: '提现限制',
    value: 0,
    prop: 'is_withdraw',
    options: [
      { label: '禁止提现', value: -1 },
      { label: '无限制', value: 0 },
    ],
  },
  is_recharge: {
    type: 'select',
    label: '充值限制',
    placeholder: '充值限制',
    value: 0,
    prop: 'is_recharge',
    options: [
      { label: '禁止充值', value: -1 },
      { label: '无限制', value: 0 },
    ],
  },
  is_activity: {
    type: 'select',
    label: '优惠活动',
    placeholder: '优惠活动',
    value: 0,
    prop: 'is_activity',
    options: [
      { label: '禁止参与', value: -1 },
      { label: '无限制', value: 0 },
    ],
  },
  is_game: {
    type: 'select',
    label: '玩游戏',
    placeholder: '玩游戏',
    value: 0,
    prop: 'is_game',
    options: [
      { label: '禁止参与', value: -1 },
      { label: '无限制', value: 0 },
    ],
  },
  is_reward: {
    type: 'select',
    label: '推广奖励',
    placeholder: '推广奖励',
    value: 0,
    prop: 'is_reward',
    options: [
      { label: '禁止参与', value: -1 },
      { label: '无限制', value: 0 },
    ],
  },
  is_task: {
    type: 'select',
    label: '任务中心',
    placeholder: '任务中心',
    value: 0,
    prop: 'is_task',
    options: [
      { label: '禁止参与', value: -1 },
      { label: '无限制', value: 0 },
    ],
  },
  remark: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop: 'remark'
  },
}
const dialogModel = reactive({
  id:'',
  name: '',
  is_recharge: '',
  is_withdraw: '',
  remark:'',
  color:'',
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
  http.post('/tag/add', {data: query}).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
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
    if (dialogList[key].type == 'select') {
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
  http.post('/tag/add', {data: {
      add: true,
      info: dialogModel
    }}).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  name: {
    type: 'input',
    placeholder: '标签',
    value: '',
    prop: 'name',
    span: 16
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search',
    span: 8
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  name:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/tag/list', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    list2Box.dialogList.is_recharge.options = [
      { label: '禁止充值', value: -1 },
      { label: '无限制', value: 0 },
    ].concat(res.recharge)
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
  // console.log('点击');
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init();
}

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
    id
  }
  http.post('/tag/delete', {data: query}).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

</script>
<template>
  <div>
    <menuList />
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <commDialog style="width: 50%;" title="标签" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #is_withdraw="{ row }">
        <el-tag v-if="row.is_withdraw == -1" type="danger">{{ $t('禁止提现') }}</el-tag>
        <el-tag v-else type="success">{{ $t('无限制') }}</el-tag>
      </template>
      <template #is_recharge="{ row }">
        <el-tag v-if="row.is_recharge == -1" type="danger">{{ $t('禁止充值') }}</el-tag>
        <el-tag v-else-if="row.is_recharge == 0" type="success">{{ $t('无限制') }}</el-tag>
        <el-tag v-else type="warning">{{ row.recharge }}</el-tag>
      </template>
      <template #is_activity="{ row }">
        <el-tag v-if="row.is_activity == -1" type="danger">{{ $t('禁止参与') }}</el-tag>
        <el-tag v-else type="success">{{ $t('无限制') }}</el-tag>
      </template>
      <template #is_game="{ row }">
        <el-tag v-if="row.is_game == -1" type="danger">{{ $t('禁止参与') }}</el-tag>
        <el-tag v-else type="success">{{ $t('无限制') }}</el-tag>
      </template>
      <template #is_reward="{ row }">
        <el-tag v-if="row.is_reward == -1" type="danger">{{ $t('禁止参与') }}</el-tag>
        <el-tag v-else type="success">{{ $t('无限制') }}</el-tag>
      </template>
      <template #is_task="{ row }">
        <el-tag v-if="row.is_task == -1" type="danger">{{ $t('禁止参与') }}</el-tag>
        <el-tag v-else type="success">{{ $t('无限制') }}</el-tag>
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
}
.line-box{
  margin-bottom: 10px;
}
</style>
