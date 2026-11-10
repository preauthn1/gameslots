<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { rocketActivityList, rocketActivityEdit, rocketActivityAdd, rocketActivityDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'rocketActivityList'
})

const props = defineProps({
  id: String,
})
const stageId = computed(() => {
  return props.id ? props.id : 0;
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
    label: transformI18n("活动名称"),
    prop: "name",
  },
  {
    label: transformI18n("起点(km)"),
    prop: "all_mileage_min",
  },
  {
    label: transformI18n("最大里程(km)"),
    prop: "all_mileage_max",
  },
  {
    label: transformI18n("开始时间"),
    prop: "start_time",
  },
  {
    label: transformI18n("结束时间"),
    prop: "end_time",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("修改时间"),
    prop: "update_time",
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
  name: {
    type: 'input',
    label: '活动名称',
    placeholder: '活动名称或者简介',
    prop: 'name',
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
  name: '',//名称
  status: '',//状态
  lang: '',//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  rocketActivityList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    list2Box.dialogList.tag_id.options = [{ label: "不限", value: 0 }].concat(
      res.tags
    );
    list2Box.dialogList.vip_id.options = res.vip;
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
    options: [],
    prop: 'lang'
  },
  name: {
    type: 'input',
    label: '活动名称',
    placeholder: '活动名称',
    prop: 'name',
    value: '',
  },
  condition: {
    type: 'radio',
    value: 1,
    label: '参与条件',
    placeholder: '参与条件',
    prop: 'condition',
    options: [
    {
        label: 0,
        name: '不限制'
      },
      {
        label: 1,
        name: '完成首充'
      },
      {
        label: 2,
        name: '完成复充'
      }
    ]
  },
  all_mileage_min: {
    type: 'input',
    label: '起点',
    placeholder: '起点',
    prop: 'all_mileage_min',
    tip: "单位（KM）",
    value: '',
  },
  all_mileage_max: {
    type: 'input',
    label: '最大里程',
    placeholder: '最大里程',
    prop: 'all_mileage_max',
    tip: "单位（KM）",
    value: '',
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
  tag_id: {
    type: "select",
    label: "用户标签",
    placeholder: "用户标签",
    tip: "限制用户标签用户才能参与",
    value: "",
    options: [{ label: "不限", value: 0 }],
    prop: "tag_id"
  },
  vip_id: {
    type: "select",
    label: "申请资格等级",
    placeholder: "申请资格等级",
    value: 0,
    options: [],
    prop: "vip_id",
    show: false
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
  savings: {
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: '',
    show: false,
    prop: 'savings',
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
  introduce: {
    type: 'slot',
    label: '活动说明',
    placeholder: '活动说明',
    value: '',
    name: 'introduce',
    prop: 'introduce'
  },
}
const dialogModel = reactive({
  id: '',
  lang: '',
  name: '',
  condition: 0,
  all_mileage_min: 0,
  all_mileage_max: 0,
  savings: 0,
  agent_id: 0,
  tag_id: 0,
  vip_id: 0,
  status: 1,
  start_time: 0,
  end_time: 0,
  introduce: "",
})

//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  list2Box.dialogList.introduce.value = val
}
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
    id: row.id
  }
  clickIndex.value = 1;
  rocketActivityEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          dialogModel[key].value = res.data[key]
          list2Box.dialogList[key].value = res.data[key]
        }
      }
      // console.log(list2Box.dialogList);
      visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  dialogModel.introduce = list2Box.dialogList.introduce.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    rocketActivityEdit(query).then((res: any) => {
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
    rocketActivityAdd(query).then((res: any) => {
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
    
    if (key == 'condition' || key == 'savings' || key == 'status') {
     
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else {
    
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
  rocketActivityDelete(query).then((res: any) => {
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

const rocketActivityLevelShow = ref(false);
const rocketActivityId = ref("");
const roandleLevelList = row => {
  rocketActivityId.value = row.id;
  rocketActivityLevelShow.value = true;
};
</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
    <el-dialog v-model="rocketActivityLevelShow" :title="$t('区间列表')" width="80%" heith="100%">
      <component :id="rocketActivityId" :is="
          defineAsyncComponent(() =>
            import('@/views/huodongguanli/rocketActivityLevel.vue')
          )
        " />
    </el-dialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          " :back="true" :field="1" @backSelect="eidtUsername" />
      </div>
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
      <template v-slot:introduce>
        <component @chage="editorEle" :content="dialogModel.introduce"
          :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #condition="{ row }">
        <el-tag size="small" type="success" v-if="row.condition == 1">{{ $t('完成首充') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.condition == 2">{{ $t('完成复充') }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('启用') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑')
          }}</el-button>
        <el-button size="small" v-if="hasAuth('rocketActivityLevel')" type="primary" @click="roandleLevelList(row)">{{ $t('区间列表')
          }}</el-button>
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
