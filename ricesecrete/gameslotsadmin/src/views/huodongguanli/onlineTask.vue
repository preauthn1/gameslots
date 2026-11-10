<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { lotteryTaskList,lotteryTaskEdit,lotteryTaskAdd,lotteryTaskDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'signList'
})

const props = defineProps({
  id:String,
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
    width:50
  },
  {
    label: transformI18n("语言"),
    prop: "lang",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("时长（单位：分钟）"),
    prop: "time",
  },
  {
    label: transformI18n("赠送次数"),
    prop: "lottery_num",
  },
  {
    label: transformI18n("可参与次数"),
    prop: "join_num",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  lang:{
    type: 'select',
    label:'语种',
    placeholder:'语种',
    prop: 'lang',
    options: [],
    value: '',
  },
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: '按天',
        value: 0,
      },
      {
        label: '按周',
        value: 1,
      },
      {
        label: '按月',
        value: 2,
      },
    ]
  },
  status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: '禁用',
        value: 0,
      },{
        label: '启用',
        value: 1,
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
  type:'',//类型
  status: '',//状态
  lang: '',//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  lotteryTaskList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    list2Box.dialogList.tag_id.options = [{ label: "不限", value: 0 }].concat(
      res.tags
    );
    list2Box.dialogList.level_id.options = res.vip;
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
const handleCurrentChange = ({ value,index }) => {
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
  type:{
    type: 'radio',
    value: 0,
    label:'类型',
    placeholder:'类型',
    prop:'sign_condition',
    options: [
      {
        label: 0,
        name:'按天'
      },
      {
        label: 1,
        name:'按周'
      },
      {
        label: 2,
        name:'按月'
      },
    ]
  },
  time:{
    type: 'input',
    label: '时长',
    placeholder: '时长',
    tip: '时长（单位：分钟）',
    value: '10',
    prop: 'time',
  },
  lottery_num:{
    type: 'input',
    label: '赠送次数',
    placeholder: '赠送次数',
    value: '',
    prop: 'lottery_num',
  },
  join_num:{
    type: 'input',
    label: '可参与次数',
    placeholder: '可参与次数',
    value: '',
    prop: 'join_num',
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
  level_id: {
    type: "select",
    label: "申请资格等级",
    placeholder: "申请资格等级",
    value: 0,
    options: [],
    prop: "level_id",
    show: false
  },
  status:{
    type: 'radio',
    value: 0,
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: 0,
        name:'禁用'
      },
      {
        label: 1,
        name:'启用'
      },
    ]
  },
}
const dialogModel = reactive({
  id: '',
  lang: '',
  type: 0,
  time: '10',
  lottery_num: 1,
  agent_id: 0,
  tag_id: 0,
  level_id: 0,
  join_num: 1,
  status: 1,
})

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
  lotteryTaskEdit(query).then((res: any) => {
     if (res.code == 1) {
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
    lotteryTaskEdit(query).then((res: any) => {
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
    lotteryTaskAdd(query).then((res: any) => {
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
    if( key == 'id' ){
      dialogModel[key] = ''
      continue;
    }
    if ( key == 'lottery_num' || key == 'join_num' || key == 'status' ) {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else if ( key == 'type' ) {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    }else if ( key == 'time' ) {
      list2Box.dialogList[key].value = '10'
      dialogModel[key] = '10'
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
  lotteryTaskDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  if (val.toString().indexOf(",") !== -1) {
    message("代理线只支持选择一个代理", { type: "error" });
    return;
  }
  dialogList.agent_id.value = val;
  dialogModel.agent_id = val;
  selectShow.value = false;
};
</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
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
        <component
          :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          "
          :back="true"
          :field="1"
          @backSelect="eidtUsername"
        />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input
              v-model="dialogModel.agent_id"
              clearable
              :placeholder="$t('用户/代理')"
            />
            <el-button
              style="margin-left: 20px"
              type="primary"
              @click="selectUser"
              >{{ $t("选择用户") }}</el-button
            >
          </div>
          <div>{{ $t("限制某代理线下面用户才能参与") }}</div>
        </div>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('按天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('按周') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 2">{{ $t('按月') }}</el-tag>
      </template>
      <template #status="{ row }">
         <el-tag size="small" type="success"  v-if="row.status == 1">{{ $t('启用') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
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
  padding-bottom:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
