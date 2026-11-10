<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,computed } from "vue";
import { taskList } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { storageLocal } from "@pureadmin/utils";
const emit = defineEmits(['select'])
defineOptions({
  name: 'taskList'
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
    label: transformI18n("任务名称"),
    prop: "task_title",
  },
  {
    label: transformI18n("类型"),
    slot: "type",
  },
  {
    label: transformI18n("任务要求"),
    slot: "task_condition_value",
    width:200
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  type:{
    type: 'select',
    label:'类型',
    placeholder:'类型',
    prop:'type',
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
  task_condition:{
    type: 'select',
    label:'任务条件',
    placeholder:'任务条件',
    prop:'task_condition',
    options: [
      {
        label: '最低下注',
        value: 0,
      },{
        label: '最低充值',
        value: 1,
      },{
        label: '最低倍数',
        value: 2,
      },{
        label: '累计充值',
        value: 3,
      },{
        label: '在线时长',
        value: 4,
      },{
        label: '累计下注',
        value: 5,
      },{
        label: '游戏时长',
        value: 6,
      },{
        label: '累积打码',
        value: 7,
      },
    ]
  },
  reward_type:{
    type: 'select',
    label:'奖励类型',
    placeholder:'奖励类型',
    prop:'reward_type',
    options: [
      {
        label: '余额',
        value: 0,
      },{
        label: '积分',
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

const props = defineProps({
  bind:Boolean,
  reg_json:Object,
})
const stage_bind = computed(() => {
  return props.bind;
})
const reg_json = computed(() => {
  return props.reg_json;
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  type:'',//类型
  task_condition:'',//任务条件
  reward_type:'',//奖励类型
  lang: storageLocal().getItem("i18n_locale"),//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  taskList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    list2Box.dialogList.receive_tag_id.options = [{ label:'不限', value: 0 }].concat(res.tags)
    list2Box.dialogList.receive_level_id.options = [{ label:'不限', value: 0 }].concat(res.vip)
    list2Box.dialogList.task_type.options = [{ label:'无', value: 0 }].concat(res.task_type)
    list2Box.dialogList.cumulative_coding.options = [{ label:'全部', value: 0 }].concat(res.game_type)
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
  background_img: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: '背景图',
    placeholder: '背景图',
    prop:'background_img'
  },
  task_type: {
    type: 'select',
    label: '任务分类',
    placeholder: '任务分类',
    value: 0,
    options: [],
    prop: 'task_type',
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
  task_condition:{
    type: 'checkbox',
    value: [],
    label: '任务条件',
    placeholder: '任务条件',
    tip: '在线时长和游戏时长优化中，请勿选择',
    prop:'task_condition',
    options: [
      '最低下注',
      '最低充值',
      '最低倍数',
      '累计充值',
      '在线时长(弃用)',
      '累计下注',
      '游戏时长(弃用)',
      // '累积打码',
    ]
  },
   min_bet:{
    type: 'input',
    label: '最低下注',
    placeholder: '最低下注',
    value: '',
    prop: 'min_bet',
    show: true,
  },
   min_recharge:{
    type: 'input',
    label: '最低充值',
    placeholder: '最低充值',
    value: '',
    prop: 'min_recharge',
    show: true,
  },
   multiple:{
    type: 'input',
    label: '最低倍数',
    placeholder: '最低倍数',
    value: '',
    prop: 'multiple',
    show: true,
  },
   cumulative_recharge:{
    type: 'input',
    label: '累计充值',
    placeholder: '累计充值',
    value: '',
    prop: 'cumulative_recharge',
    show: true,
  },
   online_time:{
    type: 'input',
    label: '在线时长（单位：分钟）',
    placeholder: '在线时长（单位：分钟）',
    value: '',
    prop: 'online_time',
    show: true,
  },
   cumulative_bet:{
    type: 'input',
    label: '累计下注',
    placeholder: '累计下注',
    value: '',
    prop: 'cumulative_bet',
    show: true,
  },
   game_online_time:{
    type: 'input',
    label: '游戏时长（单位：分钟）',
    placeholder: '游戏时长（单位：分钟）',
    value: '',
    prop: 'game_online_time',
    show: true,
  },
   task_num:{
    type: 'input',
    label: '达成次数',
    placeholder: '达成次数',
    value: '',
    tip: '任务条件为累计充值，在线时长，累计下注，游戏时长时达成次数只能为1',
    prop: 'task_num',
  },
  cumulative_coding:{
    type: 'select',
    label: '指定分类',
    placeholder: '指定分类',
    value: 0,
    options: [
      { label:'全部', value: 0 }
    ],
    prop: 'cumulative_coding',
    show: true,
  },
  specified_game:{
    type: 'select',
    label: '指定游戏',
    placeholder: '指定游戏',
    value: 0,
    options: [
      { label:'全部', value: 0 }
    ],
    prop: 'specified_game',
    show: true,
  },
  receive_level_id: {
    type: 'select',
    label: 'VIP限制',
    placeholder: 'VIP限制',
    tip: '限制用户VIP等级才能领取',
    value: 0,
    options: [
      { label:'不限', value: 0 }
    ],
    prop: 'receive_level_id',
    show: false
  },
  receive_tag_id:{
    type: 'select',
    label: '标签限制',
    placeholder: '标签限制',
    tip: '限制用户标签用户才能领取',
    value: '',
    options: [
      { label:'不限', value: 0 }
    ],
    prop:'receive_tag_id'
  },
  reward_type:{
    type: 'radio',
    value: 0,
    label: '奖励类型',
    placeholder:'奖励类型',
    prop:'reward_type',
    options: [
      {
        label: 0,
        name:'余额'
      },{
        label: 1,
        name:'积分'
      },
    ]
  },
   amount_or_integral:{
    type: 'input',
    label: '奖励数值',
    placeholder: '奖励数值',
    value: '',
    prop: 'amount_or_integral',
  },
   savings:{
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: 1,
    prop: 'savings',
    show: true
  },
  activity:{
    type: 'input',
    label: '活跃度',
    placeholder: '完成任务后获得活跃度',
    value: '',
    prop: 'sort'
  },
   sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort',
    tip:'排序：数字越大排序越靠前'
  },

}
const dialogModel = reactive({
  id: '',
  background_img: '',
  type: 0,
  task_type: 0,
  task_condition: [],
  min_bet: '',
  min_recharge: '',
  multiple: 1,
  task_num: '',
  reward_type: 0,
  receive_level_id: 0,
  receive_tag_id: 0,
  amount_or_integral: '',
  savings: 1,
  sort: '',
  cumulative_recharge: '',
  online_time: '',
  cumulative_bet: '',
  game_online_time: '',
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })

const clickIndex = ref(1);
//删除
let selectAll = [];
const handleBind = () => {
  // console.log(reg_json.value);
  if (selectAll.length <= 0) {
      message(transformI18n('请选择'), { type: 'error' });
      return;
  }
  const arr = [];
  selectAll.forEach(item => {
    arr.push(item.id);
  })
  emit('select',arr);
}
const handleSelectionChange = (val) => {
  selectAll = val;
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.background_img = val.file[0];
  list2Box.dialogList['background_img'].value = val.file[0];
}

const task_id = ref('');

//判断条件是否显示
const judgeTaskConditionIsShow = (task_condition, value) =>{
  if(task_condition){
    return task_condition.includes(value)
  }
  return false
}

</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button type="primary" @click="handleBind">{{ $t('绑定') }}</el-button>
      </div>
    </div>
    <pure-table :data="tableData.dataList" ref="tData" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('每日任务') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('每周任务') }}</el-tag>
      </template>
      <template #task_condition="{ row }">
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('最低下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('最低充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '7')">{{ $t('累积打码') }}</el-tag>
      </template>
      <template #task_condition_value="{ row }">
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('最低下注') }}:{{ row.min_bet }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('最低充值') }}:{{ row.min_recharge }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数') }}:{{ row.multiple }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值') }}:{{ row.cumulative_recharge }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长') }}:{{ row.online_time }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注') }}:{{ row.cumulative_bet }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长') }}:{{ row.game_online_time }}</el-tag>
      </template>
      <template #reward_type="{ row }">
         <el-tag size="small" type="success"  v-if="row.reward_type == 0">{{ $t('余额') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('积分') }}</el-tag>
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
