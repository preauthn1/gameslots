<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { redPacketList, redPacketEdit, redPacketAdd, redPacketDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'redPacket'
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
    label: transformI18n("举办模式"),
    prop: "model",
  },
  {
    label: transformI18n("限制条件"),
    prop: "condition_str",
  },
  {
    label: transformI18n("参与金额"),
    slot: "condition_value",
  },
  {
    label: transformI18n("总金额限制"),
    prop: "award_limit",
  },
  {
    label: transformI18n("总人数限制"),
    prop: "people_limit",
  },
  {
    label: transformI18n("用户数限制"),
    prop: "user_limit",
  },
  {
    label: transformI18n("总用户次数限制"),
    prop: "total_user_limit",
  },
  {
    label: transformI18n("领取IP限制"),
    prop: "ip_limit",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
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
    clearable:true,
    prop: 'lang',
    options: [],
    value: '',
  },
  name: {
    type: 'input',
    label: '活动名称',
    placeholder: '活动名称',
    prop: 'name',
    value: '',
  },
  date: {
    type: 'time',
    placeholder: '开始时间',
    value: (): Array<string> => {
      return []
    }
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
  date: '',//时间
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  redPacketList(pagination).then((res: any) => {
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
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  pagination[index] = value
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
    clearable:true,
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
  model: {
    type: 'radio',
    value: 1,
    label: '举办模式',
    placeholder: '举办模式',
    prop: 'model',
    options: [
      {
        label: 1,
        name: '每日'
      },
      {
        label: 2,
        name: '每周'
      }
    ]
  },
  model_day: {
    type: 'checkbox',
    value: [1,2,3],
    label: '允许天数据 ',
    placeholder: '允许天数据',
    prop: 'model_day',
    options: [
      '周一',
      '周二',
      '周三',
      '周四',
      '周五',
      '周六',
      '周日'
    ],
    show:true
  },
  // validity_time:{
  //   type: 'slot',
  //   label: '开启时间区间',
  //   placeholder: '开启时间区间',
  //   tip:"如10:10-22:30 就是10:10点到22:30点可参与",
  //   prop: 'validity_time',
  //   name: 'validity_time',
  //   value: '',
  // },
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
        name: '当日有存款'
      },
      // {
      //   label: 3,
      //   name: '当天/累计完成流水要求'
      // },
      // {
      //   label: 4,
      //   name: '手机/银行卡号/个人信息（KYC验证）'
      // }
    ]
  },
  condition_value: {
    type: 'input',
    label: '门槛金额',
    placeholder: '门槛金额',
    prop: 'condition_value',
    tip: "当日有存款用户(设定参与金额门槛,>=可以参加)",
    value: '',
  },
  award_type: {
    type: 'radio',
    value: 1,
    label: '奖励模式',
    placeholder: '奖励模式',
    prop: 'award_type',
    tip:'该值不能修改,如果设置错误，需删掉重新添加',
    options: [
    {
        label: 1,
        name: '范围'
      },
      {
        label: 2,
        name: '固定金额'
      },
      {
        label: 3,
        name: '输赢阶梯随机'
      },
    ]
  },
  award: {
    type: "slot",
    label: '奖励模式条件',
    placeholder: '奖励模式条件',
    prop: 'award',
    name: 'award',
    value: '',
  },
  award_limit: {
    type: 'input',
    label: '总金额限制',
    placeholder: '总金额限制',
    prop: 'award_limit',
    value: '',
  },
  people_limit: {
    type: 'input',
    label: '总人数限制',
    placeholder: '总人数限制',
    prop: 'people_limit',
  },
  ip_limit: {
    type: 'input',
    label: '领取IP限制',
    placeholder: '领取IP限制',
    tip: '每日限制',
    prop: 'ip_limit',
  },
  user_limit: {
    type: 'input',
    label: '用户次数限制',
    placeholder: '用户次数限制',
    tip:'每日/每周用户次数限制，只对单个时间段有效，多个时间段不重复计算',
    prop: 'user_limit',
  },
  total_user_limit: {
    type: 'input',
    label: '总用户次数限制',
    placeholder: '总用户次数限制',
    tip:'单个用户总参与次数限制',
    prop: 'total_user_limit',
  },
  max_award: {
    type: 'input',
    label: '最高可得奖励',
    placeholder: '最高可得奖励',
    tip:"前端显示每人最高领取金额，仅展示",
    prop: 'max_award',
  },
  receive_savings:{
    type: 'input',
    label: '流水限制',
    placeholder: '流水限制',
    value: '',
    prop: 'receive_savings',
  },
  savings: {
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: '',
    prop: 'savings',
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
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort',
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
  //   label: '活动说明',
  //   placeholder: '活动说明',
  //   value: '',
  //   name: 'introduce',
  //   prop: 'introduce'
  // },
}
const dialogModel = reactive({
  id: '',
  lang: '',
  name: '',
  model:1,
  model_day:[],
  // validity_time:'',
  condition: 0,
  condition_value: 0,
  award_type: 1,
  award:'{}',
  award_limit: '',
  people_limit: '',
  ip_limit: '',
  user_limit: '',
  total_user_limit: 0,
  max_award:'',
  savings: 0,
  receive_savings:0,
  agent_id: 0,
  tag_id: 0,
  vip_id: 0,
  start_time: 0,
  end_time: 0,
  status: 1,
  sort:0,
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
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
  if(index=='model'){
    handleModelx(value)
  }
  if(index=='model_day'){
    handleModelDay(value);
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
  redPacketEdit(query).then((res: any) => {
    if (res.code == 1) {
      
      for (const key in dialogModel) {
        // console.log(key);
        if (key == dialogList[key]?.prop) {
          dialogList[key].value = res.data[key]
          list2Box.dialogList[key].value = res.data[key]
        }
        dialogModel[key] = res.data[key];
      }
      console.log(dialogList);
      //处理任务条件
      handleModelx(dialogModel['model'])
      visible.value = true
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//根据任务条件task_condition值显示隐藏最低下注、最低充值、倍数
const handleModelx = (value) => {
  if(value == 1){
    list2Box.dialogList['model_day'].show = true;
    list2Box.dialogList['model_day'].value = [];
    dialogModel['model_day'] = [];
  }else if(value == 2){
      list2Box.dialogList['model_day'].show = false
  }
}
const handleModelDay = (value) => {
  const day = [];
  if(Array.isArray(value)){
    value.forEach((item)=>{
      day.push(item);
    })
  }
  dialogModel['model_day'] = day;
}

const handleSave = () => {
  // dialogModel.introduce = list2Box.dialogList.introduce.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    redPacketEdit(query).then((res: any) => {
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
    redPacketAdd(query).then((res: any) => {
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
    if (key == 'savings' || key == 'status'||key=='award_type'||key=='model') {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else if (key == 'condition'||key=='sort'||key == 'receive_savings' || key == 'total_user_limit') {
     
     list2Box.dialogList[key].value = 0
     dialogModel[key] = 0
   }else if(key == 'model_day'){
     list2Box.dialogList[key].value = []
     dialogModel[key] = []
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
  redPacketDelete(query).then((res: any) => {
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

const awardShow = ref(false);
const TempJson = ref([
{
  type: 1,
    min: '',
    max:'',
    award:''
}
]);
 
const awardList = val => {
  awardShow.value = true;
  try {
      TempJson.value = JSON.parse(dialogModel.award);
    } catch (error) {
      TempJson.value = [
        {
          type: 1,
            min: '',
            max:'',
            award:''
        }
      ]
    }
};
const awardColmuns = [
  {
    label: transformI18n("奖励类型"),
    slot: "type",
    width: "150x"
  },
  {
    label: transformI18n("最低输赢"),
    slot: "min",
    width: "150x"
  },
  {
    label: transformI18n("最高输赢"),
    slot: "max",
    width: "150x"
  },
  {
    label: transformI18n("奖金/占比%"),
    slot: "award",
    width: "150x"
  },
  {
    label: transformI18n("操作"),
    slot: "right",
    width: "250x"
  }
];

function handleAddJson() {
  const temp_data = {
    type: 1,
    min: '',
    max:'',
    award:''
  }
  TempJson.value.push(temp_data);
}

function handleDeletJson(index) {
  TempJson.value.splice(index, 1);
}

function handleAddJsonSave() {
  if (TempJson.value.length <= 0) {
    message(transformI18n('请添加奖励规则'), { type: 'error' });
    return;
  }
  awardShow.value = false;
  dialogModel.award = JSON.stringify(TempJson.value);
}
const dayShow = ref(false);
const t_id = ref("");
const redPacketDayList = row => {
  t_id.value = row.id;
  dayShow.value = true;
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
    <el-dialog v-model="dayShow" :title="$t('时间区间设置')" width="80%" heith="100%">
      <component
        :id="t_id"
        :is="
          defineAsyncComponent(() =>
            import('@/views/huodongguanli/redPacketDayList.vue')
          )
        "
      />
    </el-dialog>
    <el-dialog v-model="awardShow" :title="$t('奖励规则设置')" width="80%" heith="100%" >
      <div style="padding-bottom: 30px">
        <el-button type="primary" @click="handleAddJsonSave">{{
              $t("确定")
            }}</el-button>
        <el-button type="primary" @click="handleAddJson">{{
              $t("添加")
            }}</el-button>
            <el-tag>奖金/占比% :设置数据如果是区间值 例如 5-9</el-tag>
            <el-tag>固定奖金与奖励占比都可设置区间值</el-tag>
            <pure-table :data="TempJson" width="100%" :columns="awardColmuns">
              <template #type="{ row }">
                <el-radio-group v-model="row.type" class="ml-4">
                  <el-radio :label="1" size="large">{{
                    $t("固定奖金")
                  }}</el-radio>
                  <el-radio :label="2" size="large">{{
                    $t("奖励占比%")
                  }}</el-radio>
                </el-radio-group>
              </template>
              <template #min="{ row }">
                <el-input v-model="row.min" placeholder="" />
              </template>
              <template #max="{ row }">
                <el-input v-model="row.max" placeholder="" />
              </template>
              <template #award="{ row }">
                <el-input v-model="row.award" placeholder="" />
              </template>
              <template #right="{ index }">
                <el-button type="primary" @click="handleDeletJson(index)" v-if="TempJson.length > 1">{{
                  $t("删除") }}</el-button>
              </template>
            </pure-table>
      </div>
    </el-dialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          " :back="true" :field="1" @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" v-if="visible" :visible='visible' @close="visible = false">
      <template #award>
        <div>
          <div class="flex-fi user-box">
            <el-input v-model="dialogModel.award" clearable :placeholder="$t('奖励金额')" />
            <el-button style="margin-left: 20px" type="primary" v-if="dialogModel.award_type==3" @click="awardList">{{ $t("设置阶梯奖励") }}</el-button>
          </div>
          <div v-if="dialogModel.award_type==1">{{ $t("范围数据  示例  10-20") }}</div>
          <div v-if="dialogModel.award_type==2">{{ $t("固定数据  示例  10") }}</div>
          <div v-if="dialogModel.award_type==3">{{ $t("请点击 设置阶梯奖励 设置") }}</div>
        </div>
      </template>
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
      <template #condition="{ row }">
        <el-tag size="small" type="success" v-if="row.condition == 1">{{ $t('完成首充') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.condition == 2">{{ $t('完成复充') }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('启用') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #condition_value="{ row }">
        <el-tag size="small" type="success" v-if="row.condition == 0">-</el-tag>
        <el-tag size="small" type="success" v-else>{{ row.condition_value }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑')
          }}</el-button>
          <el-button size="small" v-if="hasAuth('edit')"  type="primary" @click="redPacketDayList(row)">{{ $t('时间区间') }}</el-button>
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
