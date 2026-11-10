<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { lotteryConfigList, lotteryConfigEdit, lotteryConfigAdd, lotteryConfigDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
import { storageLocal } from "@pureadmin/utils";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name:'lotteryConfig'
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
    label: transformI18n("转盘名称"),
    prop: "title",
  },
  {
    label: transformI18n("最高奖励"),
    prop: "max_award",
  },
  {
    label: transformI18n("周期"),
    slot: "time_type",
    width: 200
  },
  {
    label: transformI18n("用户免费次数"),
    prop: "free_count",
  },
  {
    label: transformI18n("用户每天抽奖次数"),
    prop: 'limit_count'
  },
  {
    label: transformI18n("消耗金额"),
    prop: "required_balance",
  },
  {
    label: transformI18n("消耗积分"),
    prop: "required_integral",
  },
  {
    label: transformI18n("任务条件"),
    slot: "task_condition",
  },
  {
    label: transformI18n("任务要求"),
    slot: "task_condition_value",
    width: 200
  },
  {
    label: transformI18n("主题类型"),
    slot: "theme_type",
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
  task_condition: {
    type: 'select',
    label: '任务条件',
    placeholder: '任务条件',
    prop: 'task_condition',
    options: [
      {
        label: '单笔最低下注',
        value: 0,
      }, {
        label: '单笔最低充值',
        value: 1,
      }, {
        label: '最低倍数',
        value: 2,
      }, {
        label: '累计充值',
        value: 3,
      },
      // {
      //   label: '在线时长',
      //   value: 4,
      // },
      {
        label: '累计下注',
        value: 5,
      },
      // {
      //   label: '游戏时长',
      //   value: 6,
      // },
      {
        label: '邀请人数',
        value: 7,
      }, {
        label: 'APP登录',
        value: 8,
      }, {
        label: '添加银行卡',
        value: 9,
      }
    ]
  },
  theme_type: {
    type: 'select',
    label: '主题类型',
    placeholder: '主题类型',
    prop: 'theme_type',
    options: [
      {
        label: '银色',
        value: 'silver',
      }, {
        label: '金色',
        value: 'golden',
      }, {
        label: '紫色',
        value: 'violet',
      }
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
  // type:'',//类型
  task_condition: '',//任务条件
  theme_type: '',//主题类型
  // lang: storageLocal().getItem("i18n_locale"),//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
// let stage_list = [];
//获取列表数据
init();
// setStage();
//设置阶段
// function setStage() {
//   //阶段
//     const stageArr = []
//     for (let i = 1; i <= 10; i++){
//       stageArr.push({ label: '第'+i+'阶段', value: i })
//     }
//     searchList.stage.options = [{ label: '无', value: 0 }].concat(stageArr)
// }
function init(query?: object) {
  lotteryConfigList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    list2Box.dialogList.lang.options = res.langs
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
    clearable :true,
    label: '语种',
    tip:"语言为空时 表示不限制语言",
    placeholder: '请选择语种',
    value: '',
    options: [],
    prop: 'lang'
  },
  title: {
    type: 'input',
    label: '转盘标题',
    placeholder: '转盘标题',
    value: '',
    prop: 'title',
  },
  theme_type: {
    type: 'select',
    label: '主题类型',
    placeholder: '主题类型',
    value: '',
    options: [
      {
        label: '银色',
        value: 'silver',
      }, {
        label: '金色',
        value: 'golden',
      }, {
        label: '紫色',
        value: 'violet',
      }
    ],
    prop: 'theme_type',
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
  task_condition: {
    type: 'checkbox',
    value: [],
    label: '任务条件',
    placeholder: '任务条件',
    tip: '完成所有条件可以领取免费抽奖次数',
    prop: 'task_condition',
    options: [
      '单笔最低下注',
      '单笔最低充值',
      '最低倍数',
      '累计充值',
      // '在线时长(弃用)',
      '累计下注',
      // '游戏时长(弃用)',
      '邀请人数',
      'APP登录',
      '添加银行卡',
    ]
  },
  min_bet: {
    type: 'input',
    label: '单笔最低下注',
    placeholder: '单笔最低下注',
    value: '',
    prop: 'min_bet',
    show: true,
  },
  min_recharge: {
    type: 'input',
    label: '单笔最低充值',
    placeholder: '单笔最低充值',
    value: '',
    prop: 'min_recharge',
    show: true,
  },
  multiple: {
    type: 'input',
    label: '最低倍数',
    placeholder: '最低倍数',
    value: '',
    prop: 'multiple',
    show: true,
  },
  cumulative_recharge: {
    type: 'input',
    label: '累计充值',
    placeholder: '累计充值',
    value: '',
    prop: 'cumulative_recharge',
    show: true,
  },
  cumulative_bet: {
    type: 'input',
    label: '累计下注',
    placeholder: '累计下注',
    value: '',
    prop: 'cumulative_bet',
    show: true,
  },
  invite_people: {
    type: 'input',
    label: '邀请人数',
    placeholder: '邀请人数',
    value: '',
    prop: 'invite_people',
    show: true,
  },
  reward_free_count: {
    type: 'input',
    label: '奖励次数',
    placeholder: '奖励次数',
    tip: '完成所有任务条件奖励的抽奖次数',
    value: 1,
    prop: 'reward_free_count',
  },
  condition_finish_count: {
    type: 'input',
    label: '可完成次数',
    placeholder: '可完成次数',
    tip: '任务可完成次数，-1无限',
    value: 1,
    prop: 'condition_finish_count',
  },
  starttime: {
    type: 'time',
    label: '抽奖开始时间',
    placeholder: '抽奖开始时间',
    value: [],
    prop: 'starttime'
  },
  endtime: {
    type: 'time',
    label: '抽奖结束时间',
    placeholder: '抽奖结束时间',
    value: [],
    prop: 'endtime'
  },
  img: {
    type: 'slot',
    name: 'upload',
    label: '活动图片',
    prop: 'upload',
    value: '',
  },
  max_award: {
    type: 'input',
    label: '最高奖励',
    placeholder: '最高奖励',
    value: '',
    prop: 'max_award',
    idx: 2,
  },
  free_count: {
    type: 'input',
    label: '免费次数',
    placeholder: '免费次数',
    tip: '用户免费次数，-1为无限',
    value: '',
    prop: 'free_count',
    idx: 3,
  },
  free_time: {
    type: 'input',
    label: '免费间隔',
    placeholder: '免费间隔',
    tip: '免费间隔时间设置，大于0的时候免费次数无效，单位/秒',
    value: '',
    prop: 'free_time',
    idx: 4,
  },
  required_balance: {
    type: 'input',
    label: '消耗金额',
    placeholder: '消耗金额',
    tip: '抽奖一次所消耗的金额，0为免费',
    value: '',
    prop: 'required_balance',
    idx: 5,
  },
  required_integral: {
    type: 'input',
    label: '消耗积分',
    placeholder: '消耗积分',
    tip: '抽奖一次所消耗的积分，如果设为0，则使用金额进行抽奖',
    value: '',
    prop: 'required_integral',
    idx: 6,
  },
  limit_count: {
    type: 'input',
    label: '抽奖次数',
    placeholder: '抽奖次数',
    tip: '用户每天抽奖次数，-1为不限制',
    value: '',
    prop: 'limit_count',
    idx: 7,
  },
  uprice: {
    type: 'input',
    label: '充值U金额',
    placeholder: '充值U金额',
    tip: '用户通过usdt支付充值的金额',
    value: '',
    prop: 'uprice',
    idx: 8,
  },
  integral: {
    type: 'input',
    label: '赠送积分',
    placeholder: '赠送积分',
    tip: '充值多少U金额赠送的积分',
    value: '',
    prop: 'integral',
    idx: 9,
  },
  status: {
    type: 'switch',
    label: '状态',
    placeholder: '状态',
    value: '0',
    prop: 'status',
    activeText: '开启',
    inactiveText: '关闭',
    inlinePrompt: true,
    size: 'large',
    cssItem: 'aligenCenter',
    idx: 0,
  },

}
const dialogModel = reactive({
  id: '',
  lang: '',
  title: '',
  theme_type: '',
  task_condition: [],
  min_bet: '',
  min_recharge: '',
  multiple: 1,
  cumulative_recharge: '',
  cumulative_bet: '',
  invite_people: 1,
  condition_finish_count: 1,
  reward_free_count: 1,
  starttime: '',
  endtime:'',
  img: '',
  max_award: '',
  free_count: '',
  free_time: '',
  required_balance: '',
  required_integral: '',
  limit_count: '',
  uprice: '',
  agent_id: '',
  integral: '',
  status: '0',
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'starttime'||index=='endtime') {
    dialogList[index].value = value;
    dialogModel[index] = value;
  } else {
    list2Box.dialogList[index].value = value;
    dialogModel[index] = value;
  }
  if (index == 'task_condition') {
    handleTaskCondition(value)
  }
}

//根据任务条件task_condition值显示隐藏最低下注、最低充值、倍数
const handleTaskCondition = (value) => {
  list2Box.dialogList['min_bet'].show = true
  list2Box.dialogList['min_recharge'].show = true
  list2Box.dialogList['multiple'].show = true
  list2Box.dialogList['cumulative_recharge'].show = true
  // list2Box.dialogList['online_time'].show = true
  list2Box.dialogList['cumulative_bet'].show = true
  // list2Box.dialogList['game_online_time'].show = true
  // list2Box.dialogList['cumulative_coding'].show = true
  // list2Box.dialogList['specified_game'].show = true
  list2Box.dialogList['invite_people'].show = true
  for (const i in value) {
    if (value[i] == '单笔最低下注') {
      list2Box.dialogList['min_bet'].show = false
    } else if (value[i] == '单笔最低充值') {
      list2Box.dialogList['min_recharge'].show = false
    } else if (value[i] == '最低倍数') {
      list2Box.dialogList['multiple'].show = false
    } else if (value[i] == '累计充值') {
      list2Box.dialogList['cumulative_recharge'].show = false
    }else if (value[i] == '累计下注') {
      list2Box.dialogList['cumulative_bet'].show = false
    }else if (value[i] == '邀请人数') {
      list2Box.dialogList['invite_people'].show = false
    }
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
  lotteryConfigEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          dialogList[key].value = res.data[key]
          list2Box.dialogList[key].value = res.data[key]
        }
        dialogModel[key] = res.data[key]
      }
       console.log(dialogModel)
       console.log(list2Box.dialogList)
      //处理任务条件
      handleTaskCondition(dialogModel['task_condition']);
      visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  //判断选择条件数量
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    lotteryConfigEdit(query).then((res: any) => {
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
    lotteryConfigAdd(query).then((res: any) => {
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
    if (key == 'invite_people') {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    } else if (key == 'task_condition') {
      list2Box.dialogList[key].value = []
      dialogModel[key] = []
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  //处理任务条件
  handleTaskCondition(dialogModel['task_condition']);
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
const selectGameChange = (val) => {
  console.log(val);
}
const handleSelectionChange = (val) => {
  selectAll = val;
}
function deleteIds(id) {
  const query = {
    delete: true,
    id
  }
  lotteryConfigDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
  })
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.img = val.file[0];
  list2Box.dialogList['img'].value = val.file[0];
}

///点击设置内容
const activeShow = ref(false);
const task_id = ref('');
const handleActive = (row) => {
  task_id.value = row.id
  activeShow.value = true;
}

//判断条件是否显示
const judgeTaskConditionIsShow = (task_condition, value) => {
  if (task_condition) {
    return task_condition.includes(value)
  }
  return false
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
      </div>
    </div>
    <el-dialog v-model="activeShow" :title="$t('设置内容')" width="80%">
      <component :id="task_id" :is="defineAsyncComponent(()=> import('@/views/huodongguanli/lotcontent.vue'))" />
    </el-dialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          " :back="true" :field="1" @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" v-if="visible" :dialogObj="dialogModel" @currentChage="handleDialogChange"
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
      <template v-slot:upload>
        <uploadImage @imageData="backImageData" :limit="1" :image="dialogModel.img" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #theme_type="{ row }">
        <el-tag size="small" type="success" v-if="row.theme_type == 'silver'">{{ $t('银色') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.theme_type == 'golden'">{{ $t('金色') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.theme_type == 'violet'">{{ $t('紫色') }}</el-tag>
      </template>
      <template #time_type="{ row }">
        <el-tag size="small" type="success">{{ $t('开始时间：') }}{{ row.starttime }}</el-tag>
        <el-tag size="small" type="success">{{ $t('截止时间：') }}{{ row.endtime }}</el-tag>
      </template>
      <template #task_condition="{ row }">
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('单笔最低下注')
          }}</el-tag>
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('单笔最低充值')
          }}</el-tag>
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数')
          }}</el-tag>
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值')
          }}</el-tag>
        <!-- <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长')
          }}</el-tag> -->
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注')
          }}</el-tag>
        <!-- <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长')
          }}</el-tag> -->
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '7')">{{ $t('邀请人数')
          }}</el-tag>
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '8')">{{ $t('APP登录')
          }}</el-tag>
        <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '9')">{{ $t('添加银行卡')
          }}</el-tag>
      </template>
      <template #task_condition_value="{ row }">
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('单笔最低下注') }}:{{ row.min_bet }}</el-tag>
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('单笔最低充值') }}:{{ row.min_recharge
          }}</el-tag>
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数') }}:{{ row.multiple }}</el-tag>
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值') }}:{{ row.cumulative_recharge
          }}</el-tag>
        <!-- <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长') }}:{{ row.online_time }}</el-tag> -->
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注') }}:{{ row.cumulative_bet
          }}</el-tag>
        <!-- <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长') }}:{{ row.game_online_time
          }}</el-tag> -->
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '7')">{{ $t('邀请人数') }}:{{ row.invite_people
          }}</el-tag>
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '8')">{{ $t('APP登录') }}:1</el-tag>
        <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '9')">{{ $t('添加银行卡') }}:1</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="warning" v-if="row.status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success" v-else>{{ $t('开启') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑')
          }}</el-button>
        <el-button size="small" v-if="hasAuth('content')" type="primary" @click="handleActive(row)">{{ $t('设置内容 ')
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
