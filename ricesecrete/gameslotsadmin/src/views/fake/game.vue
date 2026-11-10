<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance } from "vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
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
    label: transformI18n("平台名称"),
    prop: "tc_name",
    width: "100"
  },
  {
    label: transformI18n("游戏名称"),
    prop: "game_name",
    width: "100"
  },
  {
    label: transformI18n("游戏图标"),
    slot: "game_icon",
    width: "100"
  },
  {
    label: transformI18n("随机金额"),
    slot: "amount",
  },
  {
    label: transformI18n("随机倍率"),
    slot: "rate",
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
  gid: {
    type: 'select',
    label: '游戏',
    placeholder: '请选择游戏',
    value: '',
    options: [],
    prop: 'gid'
  },
  min_amount: {
    type: 'input',
    label: '最小随机金额',
    placeholder: '最小随机金额',
    value: '100',
    prop: 'min_amount'
  },
  max_amount: {
    type: 'input',
    label: '最大随机金额',
    placeholder: '最大随机金额',
    value: '100',
    prop: 'max_amount'
  },
  min_rate: {
    type: 'input',
    label: '随机盈利最小倍数',
    placeholder: '随机盈利最小倍数',
    tip: '单位:%',
    value: '100',
    prop: 'min_rate'
  },
  max_rate: {
    type: 'input',
    label: '随机盈利最大倍数',
    placeholder: '随机盈利最大倍数',
    tip: '单位:%',
    value: '100',
    prop: 'max_rate'
  },
  status: {
    type: 'radio',
    label: '显示',
    placeholder: '显示',
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
  },
}
const dialogModel = reactive({
  id:'',
  gid:'',
  min_amount:'',
  max_amount:'',
  min_rate:'',
  max_rate:'',
  status:'',
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
  http.post('/fake/add', {data: query}).then((res: any) => {
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
  http.post('/fake/add', {data: {
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
    placeholder: '游戏名称',
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
  http.post('/fake/game', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    list2Box.dialogList.gid.options = res.games
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
  http.post('/fake/delete', {data: query}).then((res: any) => {
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
    <commDialog title="游戏假数据配置" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #game_icon="{ row }">
        <el-image v-if="row.game_icon" style="width:30px;" :src="row.game_icon" fit="contain" />
      </template>
      <template #amount="{ row }">
          {{ row.min_amount }}~{{ row.max_amount }}
      </template>
      <template #rate="{ row }">
          {{ row.min_rate }}%~{{ row.max_rate }}%
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
<style scoped>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
