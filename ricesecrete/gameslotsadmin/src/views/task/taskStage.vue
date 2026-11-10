<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, getCurrentInstance } from "vue";
import { taskStageList, taskStageEdit, taskStageAdd, taskStageDelete } from "@/api/user";
// import commFrom2 from '@/components/comm/comm-form2.vue'
import { message } from "@/utils/message";
// @ts-ignore
import { formaTime, timeCycle } from "@/utils/global";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: "taskStafe"
});
const columns = [
  {
    type: "selection",
    align: "left",
    fixed: "left"
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left"
  },
  {
    label: transformI18n("名称"),
    prop: "name",
  },
  {
    label: transformI18n("类型"),
    slot: "type"
  },
  {
    label: transformI18n("状态"),
    slot: "status"
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot: "right",
  }
];

//条件数据
const pagination = reactive({
  page: 1, //页数
  limit: 15, //条数
  total: 0, //总数
  name: '', //名称
  type: '', //类型
  status: '', //状态
});
const dataList: any = [];
const tableData = reactive({ dataList });

const action = reactive({
  list: []
});
const nunber = reactive({
  value: ""
});

const gametype: any = ref({});
const level: any = ref({});
//首次需要加载的接口
init();
function init() {
  taskStageList(pagination).then((res: any) => {
    // console.log('xxx',res);
    tableData.dataList = res.data.data;
    pagination.total = res.data.current_page;
    pagination.page = res.data.current_page;
    list2Box.dialogList.lang.options = res.langs;
    list2Box.dialogList.receive_level_id.options = [{ label:'不限', value: 0 }].concat(res.vip);
    list2Box.dialogList.receive_tag_id.options = [{ label:'不限', value: 0 }].concat(res.tags);
    list2Box.dialogList.type_id.options = [{ label:'无', value: 0 }].concat(res.type)
  });
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
//点击确定
// const handleSerach = () => {
//   for (const key in pagination) {
//     if (key == searchList[key]?.prop) {
//       if (key == "show_date" || key == "apply_date") {
//         const val = searchList[key].value;
//         const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
//         pagination[key] = time;
//       } else {
//         pagination[key] = searchList[key].value;
//       }
//     }
//   }
//   pagination.page = 1;
//   init();
// };
//弹框写法
const visible = ref(false);
const dialogList = {
  name: {
    type: "input",
    label: "名称",
    placeholder: "名称",
    tip:"仅用于绑定阶段任务时展示，客户端不展示",
    value: '',
    prop: "name",
    show: false
  },
  lang: {
    type: "select",
    label: "语言",
    placeholder: "语言",
    options: [],
    value: 0,
    prop: "lang",
    show: false
  },
  type:{
    type: 'radio',
    value: 0,
    label:'类型',
    placeholder:'类型',
    prop:'type',
    options: [
      {
        label: 0,
        name:'每日任务'
      },
      {
        label: 1,
        name:'每周任务'
      },
    ]
  },
  type_id: {
    type: 'select',
    label: '任务分类',
    placeholder: '任务分类',
    value: 0,
    options: [],
    prop: 'type_id',
  },
  receive_agent_id: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "id"
  },
  receive_level_id: {
    type: "select",
    label: "VIP等级限制",
    placeholder: "VIP等级限制",
    options: [],
    value: 0,
    prop: "receive_level_id",
    show: false
  },
  receive_tag_id: {
    type: "select",
    label: "领取标签限制",
    placeholder: "领取标签限制",
    options: [],
    value: 0,
    prop: "receive_tag_id",
    show: false
  },
  status: {
    type: "radio",
    label: "是否开启奖励",
    placeholder: "是否开启奖励",
    options: [
      {
        label: 0,
        name:'禁用'
      },
      {
        label: 1,
        name:'启用'
      },
    ],
    prop: "status",
    show: false,
    value: 1
  }
};
const dialogModel = reactive({
  lang: "",
  type: 0,
  type_id: 0,
  receive_agent_id: "",
  receive_level_id: "",
  receive_tag_id: "",
  base_type: 1,
  reg_json: [],
  status: 1,
  name:'',
  id:'',
});
const bind = true;
const list2Box = reactive({ dialogList });
const handleDialogChange = ({ value, index }: any) => {
  if (index == "base_type") {
    changeBaseType(value);
  }
  dialogList[index].value = value;
  dialogModel[index] = value;
};

const changeBaseType = value => {
  for (const key in dialogList) {
    list2Box.dialogList[key].show = false;
  }
};
const clickIndex = ref(1);
//点击添加
const handleAdd = () => {

  for (const key in dialogModel) {
    if( key == 'id' || key == 'reg_json' || key == 'base_type' ){
      // dialogModel[key] = ''
      continue;
    } else if ( key == 'type' ) {
      // dialogList[key].value = 0
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else if ( key == 'status' ) {
      // dialogList[key].value = 1
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    } else {
      // dialogList[key].value = ''
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  dialogModel.base_type = 1;
  dialogModel.reg_json = [
    {
      stage:1,
      min_activity: "0",
      max_activity: "0",
      bl_or_amount: "0",
      integral_amount: "0",
    }
  ];
  clickIndex.value = 2;
  visible.value = true;
  // init();
  // changeBaseType(dialogModel)
};

//编辑
const handleEidt = (row) => {
  clickIndex.value = 1;
  taskStageEdit({ find: true, id: row.id }).then((res: any) => {
    for (const key in dialogModel) {
      if (key == dialogList[key]?.prop) {
        list2Box.dialogList[key].value = res.data[key]
      }
      dialogModel[key] = res.data[key]
    }
    dialogModel.id = res.data.id;
    dialogModel.reg_json = res.data.reg_json;
    dialogModel.base_type = 1;
    console.log(res);
    changeBaseType(dialogModel.base_type);

  });
  visible.value = true;
};
//奖励设置数据
const awardColmuns = [
  {
    label: transformI18n("阶段"),
    slot: "stage",
    width: "60x"
  },
  {
    label: transformI18n("最低活跃度"),
    slot: "min",
    width: "150x"
  },
  {
    label: transformI18n("最高活跃度"),
    slot: "max",
    width: "150x"
  },
  {
    label: transformI18n("奖金"),
    slot: "zan",
    width: "150x"
  },
  {
    label: transformI18n("流水倍数"),
    slot: "savings",
    width: "150x"
  },
  {
    label: transformI18n("积分"),
    slot: "integral",
    width: "150x"
  },
  {
    label: transformI18n("操作"),
    slot: "right",
    width: "150x"
  }
];
const handleAddRegjson = () => {
  if(dialogModel.reg_json.length == 10){
    message("最多只能添加10个阶段", { type: "warning" });
    return false;
  }
  const query = {
    stage: dialogModel.reg_json.length + 1,
    min_activity: 0,
    max_activity: 0,
    bl_or_amount: 0,
    savings: 1,
    integral_amount: 0,
  };
  dialogModel.reg_json.push(query);
};
//删除
const handleDeletRegjson = index => {
  dialogModel.reg_json.splice(index, 1);
  let i = 0;
  for(const key in dialogModel.reg_json){
    dialogModel.reg_json[key].stage = i+=1;
  }
};
//保存
const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    };
    taskStageEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: "error" });
      }
    });
  } else {
    const query = {
      add: true,
      info: dialogModel
    };
    taskStageAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: "error" });
      }
    });
  }
};

//选中删除
let selectAll = [];
const handleSelectionChange = val => {
  selectAll = val;
};
const handleDelete = () => {
  if (selectAll.length > 0) {
    deleteCurrent(getIds());
  } else {
    message("请选择用户", { type: "warning" });
  }
};
const getIds = () => {
  const s_arr = [];
  selectAll.forEach(item => {
    s_arr.push(item.id);
  });
  return s_arr.join(",");
};
const deleteCurrent = id => {
  proxy
    .$confirm("确认删除吗？", "提示")
    .then(() => {
      selectDelete(id);
    })
    .catch(() => {
      console.log("取消");
    });
};
function selectDelete(id) {
  const queryDelte = {
    delete: true,
    id
  };
  taskStageDelete(queryDelte).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: "success" });
      init();
    } else {
      message(res.msg, { type: "error" });
    }
  });
}

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

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  name: {
    type: "input",
    label: "名称",
    placeholder: "名称",
    value: '',
    prop: "name",
  },
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
    value: '',
    options: [
      {
        label: '每日任务',
        value: 0,
      },
      {
        label: '每周任务',
        value: 1,
      },
    ]
  },
  status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop: 'status',
    value: '',
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

const taskShow = ref(false);
const taskStageId = ref("");
const handleTaskList = row => {
  taskStageId.value = row.id;
  taskShow.value = true;
};

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
  dialogList.receive_agent_id.value = val;
  dialogModel.receive_agent_id = val;
  selectShow.value = false;
};
</script>

<template>
  <div>
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div>
        <el-button
          v-if="hasAuth('delete')"
          type="danger"
          @click="handleDelete"
        >{{ $t("删除") }}</el-button
        >
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{
            $t("添加")
          }}</el-button>
      </div>
    </div>
    <el-dialog v-model="taskShow" :title="$t('任务列表')" width="80%" heith="100%">
      <component
        :id="taskStageId"
        :is="
          defineAsyncComponent(() =>
            import('@/views/task/taskList.vue')
          )
        "
      />
    </el-dialog>
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
    <el-dialog v-model="visible" :title="$t('编辑')" width="60%">
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('基本设置')">
          <component
            @save="handleSave"
            :dialogObj="dialogModel"
            @currentChage="handleDialogChange"
            :list="list2Box.dialogList"
            :is="
              defineAsyncComponent(() =>
                import('@/components/comm/comm-form2.vue')
              )
            ">
            <template #username>
              <div>
                <div class="flex-fi user-box">
                  <el-input
                    v-model="dialogModel.receive_agent_id"
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
          </component>
        </el-tab-pane>
        <el-tab-pane v-if="dialogModel.base_type != 5" :label="$t('奖励设置')">
          <template
            v-if="dialogModel.base_type == 1 || dialogModel.base_type == 2"
          >
            <el-button type="primary" @click="handleAddRegjson">{{
                $t("添加")
              }}</el-button>
            <pure-table
              :data="dialogModel.reg_json"
              width="100%"
              :columns="awardColmuns"
            >
              <template #stage="{ row }">
                <span>{{row.stage}}</span>
              </template>
              <template #min="{ row }">
                <el-input v-model="row.min_activity" placeholder="" />
              </template>
              <template #max="{ row }">
                <el-input v-model="row.max_activity" placeholder="" />
              </template>
              <template #zan="{ row }">
                <el-input v-model="row.bl_or_amount" placeholder="" />
              </template>
              <template #savings="{ row }">
                <el-input v-model="row.savings" placeholder="" />
              </template>
              <template #integral="{ row }">
                <el-input v-model="row.integral_amount" placeholder="" />
              </template>
              <template #right="{ index }">
                <el-button
                  type="primary"
                  @click="handleDeletRegjson(index)"
                  v-if="dialogModel.reg_json.length > 1"
                >{{ $t("删除") }}</el-button
                >
              </template>
            </pure-table>
          </template>

          <el-button type="primary" @click="handleSave">{{
              $t("保存")
            }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <pure-table
      :data="tableData.dataList"
      width="100%"
      :columns="columns"
      @selection-change="handleSelectionChange"
    >
      <template #type="{ row }">
        <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('每日任务') }}</el-tag>
        <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('每周任务') }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="success"  v-if="row.status == 0">{{ $t('禁用') }}</el-tag>
        <el-tag size="small" type="success"  v-else-if="row.status == 1">{{ $t('正常') }}</el-tag>
      </template>
      <template #right="{row}">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
        <el-button size="small"  type="primary" @click="handleTaskList(row)">{{ $t('任务列表') }}</el-button>
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
.btmNav {
  padding-top: 10px;
}
.line-box {
  margin: 10px 0;
}
</style>
