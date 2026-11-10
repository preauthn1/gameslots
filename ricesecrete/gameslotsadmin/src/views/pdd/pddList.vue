<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { pddList, pddEdit, pddAdd, pddDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'pddList'
})

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    width: 50
  },
  {
    label: transformI18n("语言"),
    prop: "lang",
  },
  {
    label: transformI18n("初始金额"),
    prop: "init_amount",
  },
  {
    label: transformI18n("赠送金额"),
    prop: "amount",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("最低邀请人数"),
    prop: "min_invite_people",
  },
  {
    label: transformI18n("时间限制"),
    prop: "time",
  },
  {
    label: transformI18n("中奖几率（%）"),
    prop: "odds_of_winning",
  },
  {
    label: transformI18n("最低金额次数"),
    prop: "minimum_amount",
  },
  {
    label: transformI18n("个人参与上限"),
    prop: "people_num",
  },
  {
    label: transformI18n("时间"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.start_time} <br />
        {row.end_time}
      </div>
    )
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot: 'right'
  }
];
const handleEdit = (index, row) => {

}

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '语种',
    prop: 'lang',
    options: [],
    value: '',
  },
  status: {
    type: 'select',
    label: '状态',
    placeholder: '状态',
    prop: 'status',
    options: [
      {
        label: '禁用',
        value: 0,
      }, {
        label: '启用',
        value: 1,
      },
    ]
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
}
const searchListBox = reactive({
  searchList
})


const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  status: '',//状态
  lang: '',//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pddList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    list2Box.dialogList.lang.options = res.langs
    searchListBox.searchList.lang.options = res.langs
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
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  //搜索列表 没有日期的写法
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
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '请选择语种',
    value: '',
    clearable:true,
    options: [],
    prop: 'lang'
  },
  agent_id: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "id"
  },
  amount: {
    type: 'input',
    label: '赠送金额',
    placeholder: '赠送金额',
    value: '',
    prop: 'amount',
  },
  start_give_count: {
    type: 'input',
    label: '开始赠送次数',
    placeholder: '开始赠送次数',
    value: 1,
    prop: 'start_give_count',
  },
  savings: {
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: '1',
    prop: 'savings',
  },
  init_amount: {
    type: 'input',
    label: '初始金额',
    placeholder: '初始金额',
    value: '',
    tip: '用户第一次抽奖金额，固定金额填写金额，范围中间用-隔开，例如：50-60，支持两位小数',
    prop: 'init_amount',
  },
  min_invite_people: {
    type: 'input',
    label: '最低邀请人数',
    placeholder: '最低邀请人数',
    value: '',
    prop: 'min_invite_people',
  },
  time: {
    type: 'input',
    label: '时间限制',
    placeholder: '时间限制（单位：小时）',
    value: '',
    prop: 'time',
  },
  odds_of_winning: {
    type: 'input',
    label: '中奖几率（%）',
    placeholder: '中奖几率（%）',
    value: '',
    prop: 'odds_of_winning',
  },
  minimum_amount: {
    type: 'input',
    label: '最低金额次数',
    placeholder: '最低金额次数',
    value: '',
    tip: '如填写10，用户抽奖后面的10次中奖金额都为0.01，且必须要邀请有效充值用户才会中奖，如果在用户完成有效充值之前抽奖，中奖则会累计到下次',
    prop: 'minimum_amount',
  },
  people_num: {
    type: 'input',
    label: '个人参与上限',
    placeholder: '个人参与上限',
    value: '',
    prop: 'people_num',
  },
  amount_range: {
    type: 'input',
    label: '随机赠送金额',
    placeholder: '随机赠送金额',
    tip: '该余额为赠送到用户钱包，使用随机可用-隔开，例：9-10领取金额为随机9-10之间的金额',
    value: '',
    prop: 'amount_range',
  },
  give_savings: {
    type: 'input',
    label: '随机赠送流水倍数',
    placeholder: '随机赠送流水倍数',
    value: '1',
    prop: 'give_savings',
  },
  amount_odds: {
    type: 'input',
    label: '赠送金额几率%',
    placeholder: '赠送金额几率%',
    tip: '若设置5，用户则有5%几率中奖上方设置的赠送金额，95%为转盘金额',
    value: 0,
    prop: 'amount_odds',
  },
  register_day_show: {
    type: 'input',
    label: '会员注册n天后不显示',
    placeholder: '会员注册n天后不显示',
    value: '',
    prop: 'register_day_show',
  },
  count_type: {
    type: 'radio',
    value: 0,
    label: '次数类型',
    placeholder: '次数类型',
    tip: '',
    prop: 'count_type',
    options: [
      {
        label: 0,
        name: '下级注册赠送'
      },
      {
        label: 1,
        name: '下级充值赠送'
      },
      {
        label: 2,
        name: '充值赠送（自己和下级充值都会赠送）'
      },
    ]
  },
  start_time: {
    type: 'time',
    label: '开始时间',
    placeholder: '开始时间',
    value: '',
    prop: 'start_time'
  },
  end_time: {
    type: 'time',
    label: '结束时间',
    placeholder: '结束时间',
    value: '',
    prop: 'end_time'
  },
  status: {
    type: 'radio',
    value: 0,
    label: '状态',
    placeholder: '状态',
    prop: 'status',
    options: [
      {
        label: 0,
        name: '禁用'
      },
      {
        label: 1,
        name: '启用'
      },
    ]
  },
  // introduce: {
  //   type: 'slot',
  //   label: '规则',
  //   placeholder: '规则',
  //   value: '',
  //   name: 'introduce',
  //   prop: 'introduce'
  // },
}
const dialogModel = reactive({
  id: '',
  lang: '',
  init_amount: '',
  amount: '',
  start_give_count: 1,
  savings: 1,
  min_invite_people: '',
  time: '',
  odds_of_winning: '',
  minimum_amount: '',
  people_num: '',
  status: 1,
  // introduce: '',
  count_type: 0,
  amount_range: '',
  give_savings: 1,
  amount_odds: 0,
  agent_id: '',
  start_time: '',
  end_time: '',
})

//富文本
// const editorRef = ref(null);

// const editorEle = (val) => {
//   list2Box.dialogList.introduce.value = val
// }
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
    list2Box.dialogList[index].value = value ? formaTime(value) : '';
    dialogModel[index] = value ? formaTime(value) : '';
  } else {
    list2Box.dialogList[index].value = value;
    dialogModel[index] = value;
  }
}

const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id: row.id
  }
  clickIndex.value = 1;
  pddEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          list2Box.dialogList[key].value = res.data[key]
          dialogList[key].value = res.data[key]
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
  // dialogModel.introduce = list2Box.dialogList.introduce.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    pddEdit(query).then((res: any) => {
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
    pddAdd(query).then((res: any) => {
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
    if (key == 'id') {
      dialogModel[key] = ''
      continue;
    }
    if (key == 'savings' || key == 'status' || key == 'start_give_count') {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    } else if (key == 'count_type' || key == 'amount_odds') {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
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
  pddDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
  })
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.agent_id.value = val;
  dialogModel.agent_id = val;
  selectShow.value = false;
};

//点击设置内容
const activeShow = ref(false);
const task_id = ref('');
const handleActive = (row) => {
  task_id.value = row.id
  activeShow.value = true;
}
</script>

<template>
  <div>
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          " :back="true" :field="1" @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <el-dialog v-model="activeShow" :title="$t('设置内容')" width="80%">
        <component :id="task_id" :is="defineAsyncComponent(()=> import('@/views/pdd/content.vue'))"/>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input v-model="dialogModel.agent_id" clearable :placeholder="$t('用户/代理')" />
            <el-button style="margin-left: 20px" type="primary" @click="selectUser">{{ $t("选择用户") }}</el-button>
          </div>
          <div>{{ $t("限制某代理线下面用户才能参与") }}</div>
        </div>
      </template>
      <!-- <template v-slot:introduce>
        <component @chage="editorEle" :content="dialogModel.introduce"
          :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
      </template> -->
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('启用') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
        <el-button size="small" v-if="hasAuth('content')" type="primary" @click="handleActive(row)">{{ $t('设置规则 ') }}</el-button>
      </template>
    </pure-table>
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
  padding-bottom: 10px;
}

.line-box {
  margin-bottom: 10px;
}
</style>
