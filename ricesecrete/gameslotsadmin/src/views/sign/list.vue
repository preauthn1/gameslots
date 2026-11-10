<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { signList,signEdit,signAdd,signDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

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
    label: transformI18n("签到天数"),
    prop: "sign_day",
  },
  {
    label: transformI18n("参与条件"),
    slot: "sign_condition",
  },
  {
    label: transformI18n("条件时间"),
    slot: "condition_date_type",
  },
  {
    label: transformI18n("每周补签次数"),
    prop: "week_sign_count",
  },
  {
    label: transformI18n("可参与次数"),
    prop: "join_count",
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
  sign_day:{
    type: 'input',
    label:'签到天数',
    placeholder:'签到天数',
    prop: 'sign_day',
    value: '',
  },
  sign_condition:{
    type: 'select',
    label:'参与条件',
    placeholder:'参与条件',
    prop:'sign_condition',
    options: [
      {
        label: '首充金额',
        value: 1,
      },
      {
        label: '单笔金额',
        value: 2,
      },
      {
        label: '累计金额',
        value: 3,
      },
      {
        label: '指定签到',
        value: 4,
      },
    ]
  },
  condition_date_type:{
    type: 'select',
    label:'条件时间',
    placeholder:'条件时间',
    prop:'condition_date_type',
    options: [
      {
        label: '所有',
        value: 0,
      },{
        label: '上月',
        value: 1,
      },{
        label: '本月',
        value: 2,
      },{
        label: '昨天',
        value: 3,
      },{
        label: '今天',
        value: 4,
      },{
        label: '本周',
        value: 5,
      },{
        label: '七天内',
        value: 6,
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
  sign_day:'',//签到天数
  sign_condition:'',//签到条件
  condition_date_type:'',//条件时间
  status: '',//状态
  lang: '',//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  signList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    list2Box.dialogList.tag_id.options = [{ label: "不限", value: 0 }].concat(
      res.tags
    );
    list2Box.dialogList.vip_id.options = res.vip;
    list2Box.dialogList.sign_id.options = res.sign;
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
    clearable:true,
    options: [],
    prop: 'lang'
  },
  sign_day:{
    type: 'input',
    label: '签到天数',
    placeholder: '签到天数',
    value: '',
    prop: 'sign_day',
  },
  sign_condition:{
    type: 'radio',
    value: 1,
    label:'参与条件',
    placeholder:'参与条件',
    prop:'sign_condition',
    options: [
      {
        label: 1,
        name:'首充金额'
      },
      {
        label: 2,
        name:'单笔金额'
      },
      {
        label: 3,
        name:'累计金额'
      },
      {
        label: 4,
        name:'指定签到'
      },
    ]
  },
  condition_date_type:{
    type: 'radio',
    value: 0,
    label:'条件时间',
    placeholder:'条件时间',
    prop:'condition_date_type',
    options: [
      {
        label: 0,
        name:'所有'
      },
      {
        label: 1,
        name:'上月'
      },
      {
        label: 2,
        name:'本月'
      },
      {
        label: 3,
        name:'昨天'
      },
      {
        label: 4,
        name:'今天'
      },
      {
        label: 5,
        name:'本周'
      },
      {
        label: 6,
        name:'七天内'
      },
    ]
  },
  recharge_amount:{
    type: 'input',
    label: '对应金额',
    placeholder: '对应金额',
    value: '',
    prop: 'recharge_amount',
    show: false,
  },
  sign_id:{
    type: 'select',
    label: '对应签到',
    placeholder: '对应签到',
    value: 0,
    options: [],
    prop: 'sign_id',
    show: false,
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
  week_sign_count:{
    type: 'input',
    label: '每周补签次数',
    placeholder: '每周补签次数',
    value: '',
    prop: 'week_sign_count',
  },
  join_count:{
    type: 'input',
    label: '可参与次数',
    placeholder: '可参与次数',
    value: '',
    prop: 'join_count',
    tip: '以下为每天初始化数据,添加后不能从这里修改',
  },

  //以下为每天初始化数据,添加后不能从这里修改
  reward_mode:{
    type: 'radio',
    value: 0,
    label:'奖励模式',
    placeholder:'奖励模式',
    prop: 'reward_mode',
    show: false,
    options: [
      {
        label: 0,
        name:'每日领取'
      },
      {
        label: 1,
        name:'累计领取'
      },
    ]
  },
  reward_type:{
    type: 'radio',
    value: 0,
    label:'奖励类型',
    placeholder:'奖励类型',
    prop:'reward_type',
    show: false,
    options: [
      {
        label: 0,
        name:'固定金额'
      },
      {
        label: 1,
        name:'奖励占比%'
      },
    ]
  },
  reward_amount:{
    type: 'input',
    label: '奖励金额',
    placeholder: '奖励金额',
    value: '',
    show: false,
    prop: 'reward_amount',
  },
  savings:{
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: '',
    show: false,
    prop: 'savings',
  },
  reward_integral:{
    type: 'input',
    label: '奖励积分',
    placeholder: '奖励积分',
    value: '',
    show: false,
    prop: 'reward_integral',
  },
  min_recharge:{
    type: 'input',
    label: '当日最低充值',
    placeholder: '当日最低充值',
    value: '',
    prop: 'min_recharge',
    show: false,
  },
  min_bet:{
    type: 'input',
    label: '当日最低下注',
    placeholder: '当日最低下注',
    value: '',
    prop: 'min_bet',
    show: false,
  },
  // introduce: {
  //   type: 'slot',
  //   label: '签到规则',
  //   placeholder: '签到规则',
  //   value: '',
  //   name:'introduce',
  //   prop: 'introduce'
  // },
}
const dialogModel = reactive({
  id: '',
  lang: '',
  sign_day: '',
  sign_condition: 1,
  recharge_amount: 0,
  sign_id: 0,
  condition_date_type: 0,
  agent_id: 0,
  tag_id: 0,
  vip_id: 0,
  week_sign_count: 0,
  join_count: 0,
  reward_mode: 0,
  reward_type: 0,
  reward_amount: 0,
  reward_integral: 0,
  min_recharge: 0,
  min_bet: 0,
  savings: 1,
  status: 1,
  // introduce: '',
})

//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  // list2Box.dialogList.introduce.value = val
}
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
  if (index == 'sign_condition') {
    showAmountByCondition(dialogModel['sign_condition']);
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
  signEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
            dialogList[key].value = res.data[key]
            list2Box.dialogList[key].value = res.data[key]
          }
          dialogModel[key] = res.data[key]
        }
        showAmountByCondition(dialogModel['sign_condition']);
        list2Box.dialogList['join_count'].tip = '';
        list2Box.dialogList['reward_mode'].show = true;
        list2Box.dialogList['reward_type'].show = true;
        list2Box.dialogList['reward_amount'].show = true;
        list2Box.dialogList['reward_integral'].show = true;
        list2Box.dialogList['savings'].show = true;
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
    signEdit(query).then((res: any) => {
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
    signAdd(query).then((res: any) => {
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
    if ( key == 'sign_condition' || key == 'savings' || key == 'status' ) {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else if ( key == 'condition_date_type' || key == 'reward_mode' || key == 'reward_type' ) {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    }else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  list2Box.dialogList['reward_mode'].show = false;
  list2Box.dialogList['reward_type'].show = false;
  list2Box.dialogList['reward_amount'].show = false;
  list2Box.dialogList['reward_integral'].show = false;
  list2Box.dialogList['savings'].show = false;
  showAmountByCondition(dialogModel['sign_condition']);
  clickIndex.value = 2;
  visible.value = true;
}

//根据条件显示对应金额
function showAmountByCondition(condition) {
  list2Box.dialogList['recharge_amount'].show = true;
  list2Box.dialogList['sign_id'].show = true;
  if ( condition == 4 ) {
    list2Box.dialogList['sign_id'].show = false;
    list2Box.dialogList['recharge_amount'].show = true;
  } else {
    list2Box.dialogList['sign_id'].show = true;
    list2Box.dialogList['recharge_amount'].show = false;
  }
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
  signDelete(query).then((res: any) => {
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
  dialogList.agent_id.value = val;
  dialogModel.agent_id = val;
  selectShow.value = false;
};

const signDayShow = ref(false);
const signId = ref("");
const handleDayList = row => {
  signId.value = row.id;
  signDayShow.value = true;
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
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
    <el-dialog v-model="signDayShow" :title="$t('天数列表')" width="80%" heith="100%">
      <component
        :id="signId"
        :is="
          defineAsyncComponent(() =>
            import('@/views/sign/dayList.vue')
          )
        "
      />
    </el-dialog>
    <el-dialog v-model="activeShow" :title="$t('设置规则')" width="80%">
        <component :id="task_id" :is="defineAsyncComponent(()=> import('@/views/sign/content.vue'))"/>
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
      <template v-slot:introduce>
          <component @chage="editorEle" :content="dialogModel.introduce" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #sign_condition="{ row }">
         <el-tag size="small" type="success"  v-if="row.sign_condition == 1">{{ $t('首充金额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.sign_condition == 2">{{ $t('单笔金额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.sign_condition == 3">{{ $t('累计金额') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.sign_condition == 4">{{ $t('指定任务') }}</el-tag>
      </template>
      <template #status="{ row }">
         <el-tag size="small" type="success"  v-if="row.status == 1">{{ $t('启用') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #condition_date_type="{ row }">
         <el-tag size="small" type="success"  v-if="row.condition_date_type == 0">{{ $t('所有') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 1">{{ $t('上月') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 2">{{ $t('本月') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 3">{{ $t('昨天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 4">{{ $t('今天') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 5">{{ $t('本周') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.condition_date_type == 6">{{ $t('七天内') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
          <el-button size="small" v-if="hasAuth('content')" type="primary" @click="handleActive(row)">{{ $t('设置规则 ') }}</el-button>
          <el-button size="small" v-if="hasAuth('dayList')"  type="primary" @click="handleDayList(row)">{{ $t('天数列表') }}</el-button>
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
