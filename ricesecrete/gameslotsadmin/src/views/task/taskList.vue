<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { taskList,taskEdit,taskAdd,taskDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
import { storageLocal } from "@pureadmin/utils";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'taskList'
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
    label: transformI18n("任务名称"),
    prop: "task_title",
  },
  {
    label: transformI18n("周期"),
    slot: "type",
    width:150
  },
  {
    label: transformI18n("任务模式"),
    slot: "task_mode",
  },
  {
    label: transformI18n("阶段"),
    prop: "stage",
  },
  {
    label: transformI18n("任务条件"),
    slot: "task_condition",
  },
  {
    label: transformI18n("任务要求"),
    slot: "task_condition_value",
    width:200
  },
  {
    label: transformI18n("达成次数"),
    prop: "task_num",
    width:100
  },
  {
    label: transformI18n("奖励类型"),
    slot: "reward_type",
  },
  {
    label: transformI18n("奖励数值"),
    prop: "amount_or_integral",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
    width:100
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
    width:100
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
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
  type:{
    type: 'select',
    label:'周期',
    placeholder:'周期',
    prop:'type',
    options: [
      // {
      //   label: '单次任务',
      //   value: -1,
      // },
      {
        label: '每日任务',
        value: 0,
      },
      {
        label: '每周任务',
        value: 1,
      },
      {
        label: '一次性任务',
        value: 2,
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
        label: '单笔最低下注',
        value: 0,
      },{
        label: '单笔最低充值',
        value: 1,
      },{
        label: '最低倍数',
        value: 2,
      },{
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
      },{
        label: 'APP登录',
        value: 8,
      },{
        label: '添加银行卡',
        value: 9,
      }
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
  task_mode:{
    type: 'select',
    label:'任务模式',
    placeholder:'任务模式',
    prop: 'task_mode',
    value: '',
    options: [
      {
        label: '普通任务',
        value: 0,
      },{
        label: '阶段任务',
        value: 1,
      },
    ]
  },
  stage:{
    type: 'select',
    label:'任务阶段',
    placeholder:'任务阶段',
    prop: 'stage',
    value: '',
    options: []
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
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
        label: '开启',
        value: 1,
      },
    ]
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
  task_condition:'',//任务条件
  reward_type:'',//奖励类型
  task_mode: '',
  lang: storageLocal().getItem("i18n_locale"),//语言
  stage_id: stageId.value,//阶段任务id
  stage: '',//阶段
  status: '',//状态
});

const dataList: any = [];
const tableData = reactive({ dataList });
let stage_list = [];
//获取列表数据
init();
setStage();
//设置阶段
function setStage() {
  //阶段
    const stageArr = []
    for (let i = 1; i <= 10; i++){
      stageArr.push({ label: '第'+i+'阶段', value: i })
    }
    searchList.stage.options = [{ label: '无', value: 0 }].concat(stageArr)
}
const platformIds: any = ref({});
function init(query?: object) {
  taskList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    list2Box.dialogList.receive_tag_id.options = [{ label:'不限', value: 0 }].concat(res.tags)
    list2Box.dialogList.receive_level_id.options = [{ label:'不限', value: 0 }].concat(res.vip)
    list2Box.dialogList.task_type.options = [{ label:'无', value: 0 }].concat(res.task_type)
    list2Box.dialogList.cumulative_coding.options = [{ label:'全部', value: 0 }].concat(res.game_type)
    list2Box.dialogList.stage_id.options = [{ label: '无', value: 0 }].concat(res.stage_task_list)
    list2Box.dialogList.w_id.options = [{ label: '无', value: 0 }].concat(res.wufu)
    platformIds.value = res.gamesThird.filter(item => item.value != 0);
    stage_list = res.stage_list;
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
    label:'周期',
    placeholder:'周期',
    tip:'一次性任务不设置开始和结束时间即为现在之前时间',
    prop:'type',
    options: [
      // {
      //   label: -1,
      //   name: '单次任务'
      // },
      {
        label: 0,
        name:'每日任务'
      },
      {
        label: 1,
        name:'每周任务'
      },
      {
        label: 2,
        name:'一次性任务'
      },
    ]
  },
  start_time: {
    type: "time",
    label: "开始时间",
    placeholder: "开始时间",
    value: '',
    prop: "start_time",
    show: true
  },
  end_time: {
    type: "time",
    label: "结束时间",
    placeholder: "结束时间",
    value: '',
    prop: "end_time",
    show: true
  },
  task_mode:{
    type: 'radio',
    value: 0,
    label:'任务模式',
    placeholder:'任务模式',
    prop:'task_mode',
    options: [
      {
        label: 0,
        name:'普通任务'
      },
      {
        label: 1,
        name:'阶段任务'
      },
    ]
  },
  stage_id:{
    type: 'select',
    label: '绑定阶段任务',
    placeholder: '绑定阶段任务',
    options:[],
    value: 0,
    prop: 'stage_id',
    show: true
  },
  stage:{
    type: 'select',
    label: '绑定阶段',
    placeholder: '绑定阶段',
    tip:"绑定阶段任务后渲染阶段",
    options:[],
    value: 0,
    prop: 'stage',
    show: true
  },
  activity:{
    type: 'input',
    label: '奖励活跃度',
    placeholder: '奖励活跃度',
    value: 1,
    prop: 'activity',
    show: true
  },
  task_condition:{
    type: 'checkbox',
    value: [],
    label: '任务条件',
    placeholder: '任务条件',
    // tip: '在线时长和游戏时长优化中，请勿选择',
    prop:'task_condition',
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
   min_bet:{
    type: 'input',
    label: '单笔最低下注',
    placeholder: '单笔最低下注',
    value: '',
    prop: 'min_bet',
    show: true,
  },
   min_recharge:{
    type: 'input',
    label: '单笔最低充值',
    placeholder: '单笔最低充值',
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
   invite_people:{
    type: 'input',
    label: '邀请人数',
    placeholder: '邀请人数',
    value: '',
    prop: 'invite_people',
    show: true,
  },
   task_num:{
    type: 'input',
    label: '达成次数',
    placeholder: '达成次数',
    value: '',
    tip: '任务条件为累计充值，累计下注，邀请人数，APP登录，添加银行卡时达成次数只能为1',
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
      },{
        label: 2,
        name:'五福'
      },
    ]
  },
   amount_or_integral:{
    type: 'input',
    label: '奖励数值',
    placeholder: '奖励数值',
    value: '',
    show: false,
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
  water_type: {
    type: "radio",
    label: "流水倍数类型",
    placeholder: "流水倍数类型",
    value: "0",
    prop: "water_type",
    options: [
      { label: 0, name: "所有" },
      { label: 1, name: "指定平台" },
      { label: 2, name: "指定游戏" }
    ],
    show: false
  },
  platform_ids: {
    type: 'slot',
    value: [],
    label: '选择平台',
    placeholder: '选择平台',
    prop: 'platform_ids',
    name: 'platform_ids',
    options: [],
    show: true,
  },
  game_ids: {
    type: 'slot',
    label: '游戏ID',
    placeholder: '游戏ID',
    value: '',
    prop: 'game_ids',
    name: 'game_ids',
    show: true,
  },
  w_id:{
    type: 'select',
    value: 0,
    label: '五福',
    placeholder:'五福',
    prop:'w_id',
    show: true,
    options: []
  },
   w_count:{
    type: 'input',
    label: '奖励次数',
    placeholder: '奖励次数',
    value: 1,
    prop: 'w_count',
    show: true
  },
   sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort',
    tip:'排序：数字越大排序越靠前'
  },
  status: {
    type: 'radio',
    label: '状态',
    value: 1,
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
  }

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
  receive_agent_id: 0,
  receive_level_id: 0,
  receive_tag_id: 0,
  amount_or_integral: '',
  savings: 1,
  sort: '',
  cumulative_recharge: '',
  online_time: '',
  cumulative_bet: '',
  game_online_time: '',
  task_mode: 0,
  stage_id:0,
  stage:0,
  water_type: 0,
  platform_ids: [],
  game_ids: "",
  activity:1,
  w_id: 0,
  w_count:1,
  invite_people:1,
  start_time: '',
  end_time: '',
  status: 1,
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
      list2Box.dialogList[index].value = value?formaTime(value):'';
      dialogModel[index] = value?formaTime(value):'';
  } else {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
  }
  if(index == 'task_condition'){
    handleTaskCondition(value)
  }
  if(index == 'reward_type'){
    handleRewardType(value)
  }
  if(index == 'task_mode'){
    handleTaskMode(value)
  }
  if(index == 'stage_id'){
    handleTaskTip(value);
  }
  if(index == 'type'){
    handleTimeCondition(value);
  }
  if (index == 'water_type') {
    changeGameIdsOrPlatIds(value)
  }
}

//根据周期显示自定义时间
const handleTimeCondition = (value) => {
  if(value == 2){
    //自定义时间
    list2Box.dialogList['start_time'].show = false
    list2Box.dialogList['end_time'].show = false
  }else{
    list2Box.dialogList['start_time'].show = true
    list2Box.dialogList['end_time'].show = true
  }
}

//根据任务条件task_condition值显示隐藏最低下注、最低充值、倍数
const handleTaskCondition = (value) => {
  list2Box.dialogList['min_bet'].show = true
  list2Box.dialogList['min_recharge'].show = true
  list2Box.dialogList['multiple'].show = true
  list2Box.dialogList['cumulative_recharge'].show = true
  list2Box.dialogList['online_time'].show = true
  list2Box.dialogList['cumulative_bet'].show = true
  list2Box.dialogList['game_online_time'].show = true
  list2Box.dialogList['cumulative_coding'].show = true
  list2Box.dialogList['specified_game'].show = true
  list2Box.dialogList['invite_people'].show = true
  for(const i in value){
    if( value[i] == '单笔最低下注' ){
      list2Box.dialogList['min_bet'].show = false
    }else if( value[i] == '单笔最低充值' ){
      list2Box.dialogList['min_recharge'].show = false
    }else if( value[i] == '最低倍数' ){
      list2Box.dialogList['multiple'].show = false
    }else if( value[i] == '累计充值' ){
      list2Box.dialogList['cumulative_recharge'].show = false
    }else if( value[i] == '在线时长' ){
      list2Box.dialogList['online_time'].show = false
    }else if( value[i] == '累计下注' ){
      list2Box.dialogList['cumulative_bet'].show = false
    }else if( value[i] == '游戏时长' ){
      list2Box.dialogList['game_online_time'].show = false
    }else if( value[i] == '邀请人数' ){
      list2Box.dialogList['invite_people'].show = false
    }
  }
}

//根据奖励类型显示隐藏流水倍数
const handleRewardType = (value) => {
  if(value == 0){
    //余额，显示流水倍数
    list2Box.dialogList['amount_or_integral'].show = false
    list2Box.dialogList['savings'].show = false
    list2Box.dialogList['w_id'].show = true
    list2Box.dialogList['w_count'].show = true
  } else if (value == 1) { 
    //隐藏流水倍数，显示奖励数值
    list2Box.dialogList['amount_or_integral'].show = false
    list2Box.dialogList['savings'].show = true
    list2Box.dialogList['w_id'].show = true
    list2Box.dialogList['w_count'].show = true
  } else {
    //只显示五福奖励和次数
    list2Box.dialogList['amount_or_integral'].show = true
    list2Box.dialogList['savings'].show = true
    list2Box.dialogList['w_id'].show = false
    list2Box.dialogList['w_count'].show = false
  }
}

//根据任务模式显示/隐藏阶段任务配置
const handleTaskMode = (value) => {
  if(value == 1){
    //余额，显示流水倍数
    list2Box.dialogList['stage'].show = list2Box.dialogList['activity'].show = false
    list2Box.dialogList['stage_id'].show = list2Box.dialogList['stage_id'].show = false
  }else{
    list2Box.dialogList['stage'].show = list2Box.dialogList['activity'].show = true
    list2Box.dialogList['stage_id'].show = list2Box.dialogList['stage_id'].show = true
  }
}

//根据任务分类设置任务提示语
const handleTaskTip = (value) => {
  list2Box.dialogList['stage'].options = [];
  if(value == 0){
    list2Box.dialogList['stage'].tip = "绑定阶段任务后渲染阶段"
  }else{
    for(const key in stage_list){
      if (stage_list[key].stage_id == value){
        if (stage_list[key].stage.length != 0){
          list2Box.dialogList['stage'].tip = ""
          list2Box.dialogList['stage'].options = stage_list[key].stage;
          break
        }
      }
    }
  }
}

const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  taskEdit(query).then((res: any) => {
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
        handleTaskCondition(dialogModel['task_condition'])
        //处理奖励类型
        handleRewardType(dialogModel['reward_type'])
        //处理任务分类
        handleTaskTip(dialogModel['stage_id']);
        //处理阶段任务信息
       handleTaskMode(dialogModel['task_mode']);
       //处理自定义时间
       handleTimeCondition(dialogModel['type']);
       //指定流水
       
      changeGameIdsOrPlatIds(dialogModel['water_type'])
        visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  //判断选择条件数量
  if( dialogModel.task_condition.length >3 ){
    message('最多选择三个条件', { type: 'error' });
    return
  }
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    taskEdit(query).then((res: any) => {
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
    taskAdd(query).then((res: any) => {
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
    if (key == 'type' || key == 'reward_type' || key == 'task_mode' || key == 'w_id' || key == 'water_type') {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else if (key == 'savings' || key == 'w_count' || key == 'invite_people' || key == 'status') {
        list2Box.dialogList[key].value = 1
        dialogModel[key] = 1
     } else if (key == 'task_condition' || key == 'platform_ids') {
        list2Box.dialogList[key].value = []
        dialogModel[key] = []
     } else{
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  //处理任务条件
  handleTaskCondition(dialogModel['task_condition'])
  //处理奖励类型
  handleRewardType(dialogModel['reward_type'])
  //处理流水类型
  changeGameIdsOrPlatIds(dialogModel['water_type'])
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
  taskDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.background_img = val.file[0];
  list2Box.dialogList['background_img'].value = val.file[0];
}

///点击设置内容
const activeShow = ref(false);
const task_id = ref('');
const handleActive = (row) => {
  task_id.value = row.id
  activeShow.value = true;
}

//判断条件是否显示
const judgeTaskConditionIsShow = (task_condition, value) =>{
  if(task_condition){
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
  dialogList.receive_agent_id.value = val;
  dialogModel.receive_agent_id = val;
  selectShow.value = false;
};


function changeGameIdsOrPlatIds(water_type) {
  if (water_type == 1) {
    list2Box.dialogList['platform_ids'].show = false;
    dialogList['platform_ids'].show = false;
    list2Box.dialogList['game_ids'].show = true;
    dialogList['game_ids'].show = true;
  } else if (water_type == 2) {
    list2Box.dialogList['platform_ids'].show = true;
    dialogList['platform_ids'].show = true;
    list2Box.dialogList['game_ids'].show = false;
    dialogList['game_ids'].show = false;
  } else {
    list2Box.dialogList['platform_ids'].show = true;
    dialogList['platform_ids'].show = true;
    list2Box.dialogList['game_ids'].show = true;
    dialogList['game_ids'].show = true;
  }
}

//显示游戏
const gameSelectShow = ref(false);
const eidtGameIds = (val) => {
  dialogModel.game_ids = val;
  list2Box.dialogList.game_ids.value = val;
  gameSelectShow.value = false
  console.log(dialogModel)
}
const selectGame = () => {
  gameSelectShow.value = true
}
</script>

<template>
  <div>
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
     <el-dialog v-model="activeShow" :title="$t('设置内容')" width="80%">
        <component :id="task_id" :is="defineAsyncComponent(()=> import('@/views/task/content.vue'))"/>
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
    <el-dialog width="80%" v-model="gameSelectShow" :title="$t('选择')">
      <div style="padding-bottom:30px;">
        <component :back="true" @backSelect="eidtGameIds"
          :is="defineAsyncComponent(()=> import('@/views/threeGames/gameManage.vue'))" />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:upload>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.background_img"/>
      </template>
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
        <template #platform_ids>
          <el-checkbox-group v-model="dialogModel.platform_ids">
            <el-checkbox :label="item.label" v-for="item,index in platformIds" :key="index" :value="item.value" size="large" />
          </el-checkbox-group>
        </template>

        <template v-slot:game_ids>
          <div class="flex-fi user-box">
            <el-input v-model="dialogModel.game_ids" @change="eidtGameIds($event)" :placeholder="$t('游戏')" />
            <el-button style="margin-left: 20px;" type="primary" @click="selectGame">{{ $t('选择游戏') }}</el-button>
          </div>
        </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #type="{ row }">
         <el-tag size="small" type="success"  v-if="row.type == 0">{{ $t('每日任务') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.type == 1">{{ $t('每周任务') }}</el-tag>
         <!-- <el-tag size="small" type="success"  v-else-if="row.type == -1">{{ $t('单次任务') }}</el-tag> -->
         <el-tag size="small" type="success"  v-else-if="row.type == 2">{{ $t('一次性任务') }}</el-tag>
         <el-tag size="small" type="success"  v-if="row.type == 2">{{ row.start_time }}</el-tag>
         <el-tag size="small" type="success"  v-if="row.type == 2">{{ row.end_time }}</el-tag>
      </template>
      <template #task_condition="{ row }">
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('单笔最低下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('单笔最低充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '7')">{{ $t('邀请人数') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '8')">{{ $t('APP登录') }}</el-tag>
         <el-tag size="small" type="success" v-if="judgeTaskConditionIsShow(row.task_condition, '9')">{{ $t('添加银行卡') }}</el-tag>
      </template>
      <template #task_condition_value="{ row }">
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '0')">{{ $t('单笔最低下注') }}:{{ row.min_bet }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '1')">{{ $t('单笔最低充值') }}:{{ row.min_recharge }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '2')">{{ $t('最低倍数') }}:{{ row.multiple }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '3')">{{ $t('累计充值') }}:{{ row.cumulative_recharge }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '4')">{{ $t('在线时长') }}:{{ row.online_time }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '5')">{{ $t('累计下注') }}:{{ row.cumulative_bet }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '6')">{{ $t('游戏时长') }}:{{ row.game_online_time }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '7')">{{ $t('邀请人数') }}:{{ row.invite_people }}</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '8')">{{ $t('APP登录') }}:1</el-tag>
         <el-tag v-if="judgeTaskConditionIsShow(row.task_condition, '9')">{{ $t('添加银行卡') }}:1</el-tag>
      </template>
      <template #reward_type="{ row }">
         <el-tag size="small" type="success"  v-if="row.reward_type == 0">{{ $t('余额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.reward_type == 1">{{ $t('积分') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.reward_type == 2">{{ $t('五福') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('无') }}</el-tag>
      </template>
      <template #task_mode="{ row }">
         <el-tag size="small" type="success"  v-if="row.task_mode == 0">{{ $t('普通任务') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('阶段任务') }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
        <el-tag size="small" type="danger" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
          <el-button size="small" v-if="hasAuth('content')" type="primary" @click="handleActive(row)">{{ $t('设置内容 ') }}</el-button>
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
