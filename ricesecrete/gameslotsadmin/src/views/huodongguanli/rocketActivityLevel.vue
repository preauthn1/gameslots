<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { rocketActivityLevelList, rocketActivityLevelEdit, rocketActivityLevelAdd, rocketActivityLevelDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { Sign } from "crypto";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'rocketActivityLevelList'
})

const props = defineProps({
  id: String,
})
const rid = computed(() => {
  return props.id ? props.id : 0;
})

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("区间级别"),
    prop: "level",
  },
  {
    label: transformI18n("区间最小值"),
    prop: "sec_mileage_min",
  },
  {
    label: transformI18n("区间最大值"),
    prop: "sec_mileage_max",
  },
  {
    label: transformI18n("区间里程单位"),
    prop: "mileage_unit",
  },
  
  {
    label: transformI18n("奖励数量"),
    prop: "award_value",
  },
  {
    label: transformI18n("奖励类型"),
    slot: "award_type",
  },
  {
    label: transformI18n("燃料转换比例"),
    prop: "transf_ratio",
  },
  {
    label: transformI18n("每次燃料消耗"),
    prop: "use_fuel_num",
  },
  {
    label: transformI18n("每次前进公里数"),
    prop: "use_fuel_mil",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot: 'right'
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  award_type: {
    type: 'select',
    label: '奖励类型',
    placeholder: '奖励类型',
    prop: 'award_type',
    options: [
      {
        label: '余额',
        value: 1,
      },
      {
        label: '积分',
        value: 2,
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
  award_type: '',//奖励类型
  rid: rid,//签到id
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  rocketActivityLevelList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
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
  level: {
    type: 'input',
    label: '区间级别',
    placeholder: '区间级别 整数  1 ',
    value: '',
    prop: 'level',
  },
  sec_mileage_min: {
    type: 'input',
    label: '里程区间最小值',
    placeholder: '里程区间最小值 整数 ',
    value: '',
    prop: 'sec_mileage_min',
  },
  sec_mileage_max: {
    type: 'input',
    label: '里程区间最大值',
    placeholder: '里程区间最大值 整数 ',
    value: '',
    prop: 'sec_mileage_max',
  },
  mileage_unit:{
    type: 'input',
    label: '里程区间单位',
    placeholder: '里程区间单位 (KM)',
    value: '',
    prop: 'mileage_unit',
  },
  award_value: {
    type: 'input',
    label: '奖励数量',
    placeholder: '奖励数量',
    value: '',
    prop: 'award_value',
  },
  award_type: {
    type: 'radio',
    value: 0,
    label: '奖励类型',
    placeholder: '奖励类型',
    prop: 'award_type',
    options: [
      {
        label: 1,
        name: '余额'
      },
      {
        label: 2,
        name: '积分'
      },
    ]
  },
  transf_ratio: {
    type: 'input',
    label: '燃料转化比例',
    placeholder: '燃料转化比例',
    value: '',
    prop: 'transf_ratio',
  },
  use_fuel_num: {
    type: 'input',
    label: '每次消耗的燃料',
    placeholder: '每次消耗的燃料数量区间',
    tip: "例如 100-155",
    value: '',
    prop: 'use_fuel_num',
  },
  use_fuel_mil: {
    type: 'input',
    label: '消耗一次燃料行驶里程',
    placeholder: '消耗一次燃料行驶里程区间',
    tip: "例如 10-15",
    value: '',
    prop: 'use_fuel_mil',
  }
}
const dialogModel = reactive({
  id: '',
  rid: rid.value,
  level: 1,
  mileage_unit: 'KM',
  sec_mileage_min: 0,
  sec_mileage_max: 0,
  award_value: '',
  award_type: 1,
  transf_ratio: 1,
  use_fuel_num: '',
  use_fuel_mil: '',
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'rid') {
    return;
  }
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
  rocketActivityLevelEdit(query).then((res: any) => {
    if (res.code == 1) {
      console.log(res.data)
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          dialogList[key].value = res.data[key]
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
    rocketActivityLevelEdit(query).then((res: any) => {
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
    rocketActivityLevelAdd(query).then((res: any) => {
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
    if (key == 'rid') {
      continue;
    }
    if (key == 'award_type' || key == 'transf_ratio') {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
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
  rocketActivityLevelDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
  })
}
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
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #award_type="{ row }">
        <el-tag size="small" type="success" v-if="row.award_type == 1">{{ $t('奖励余额') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.award_type == 2">{{ $t('奖励积分') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑')
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
