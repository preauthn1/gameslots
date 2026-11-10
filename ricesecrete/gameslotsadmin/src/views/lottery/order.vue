<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance } from "vue";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [
  {
    label: transformI18n("彩票类别"),
    prop: "lottery_name",
    width: "100"
  },
  {
    label: transformI18n("期数"),
    prop: "qishu",
    width: "120"
  },
  {
    label: transformI18n("用户信息"),
    prop: "uid",
    width: "200",
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.uid)}>
          <p>UID:{row.uid}</p>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
      </>
    )
  },
  {
    label: transformI18n("下注时间"),
    prop: "create_time",
    width: "160"
  },
  {
    label: transformI18n("玩法明细"),
    prop: "option_text",
  },
  {
    label: transformI18n("赔率"),
    prop: "odds",
    cellRenderer: ({row}) => (
      <el-tag>{ row.odds }</el-tag>
    )
  },
  {
    label: transformI18n("金额"),
    prop: "amount",
    cellRenderer: ({row}) => (
      <span>{ parseFloat(row.amount) }</span>
    )
  },
  {
    label: transformI18n("派彩"),
    prop: "win_amount",
    cellRenderer: ({row}) => (
      <span>{ row.win_amount < 0 ? 0 : parseFloat(row.win_amount) }</span>
    )
  },
  {
    label: transformI18n("开奖结果"),
    prop: "result",
  },
  // {
  //   label: transformI18n("前三/中三/后三"),
  //   prop: "three",
  //   width: 150,
  //   cellRenderer: ({row}) => (
  //     <span>{ row.three.join(' / ') }</span>
  //   )
  // },
  {
    label: transformI18n("结算"),
    slot: "status",
  },
  {
    label: transformI18n("输赢"),
    slot: "is_win",
  },
  // {
  //   label: transformI18n("操作"),
  //   cellRenderer: ({ index, row }) => (
  //     <>
  //       <el-button v-show={row.lottery_id > 0} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
  //     </>
  //   )
  // },
];

// 赔率设置
const optionVisible = ref(false);
const options = ref([]);
const options_text = ref([]);
const lottery: any = ref([]);
const lottery_odds: any = ref({});
const lottery_id = ref(0);

const handleSaveOdd = () => {
  http.post('/slottery/setodd', {
    data: {
      lottery_id: lottery_id.value,
      lottery_odds: lottery_odds.value,
    }
  }).then((res: any)=> {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      optionVisible.value = false;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//弹框写法
const visible = ref(false);
const dialogList = {
  name: {
    type: 'input',
    label: '彩种名称',
    placeholder: '彩种名称',
    value: '',
    prop: 'name',
    disable:true
  },
  qishu: {
    type: 'input',
    label: '期数',
    placeholder: '期数',
    value: '',
    prop: 'qishu'
  },
  result: {
    type: 'input',
    label: '开奖结果',
    placeholder: '开奖结果',
    tip: '多个球结果使用","分隔',
    value: '',
    prop: 'result'
  },
}
const dialogModel = reactive({
  id:'',
  lottery_id: '',
  name:'',
  qishu:'',
  result:'',
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}

const clickCurrentIndex = ref(1);
//编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    id:row.id
  }
  http.post('/slottery/result/preset', {data: query}).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.id = res.data.id;
      dialogModel.lottery_id = res.data.lottery_id;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//点击添加
const handleAdd = () => {
  clickCurrentIndex.value = 2
  list2Box.dialogList.name.value = lottery.value.name;
  dialogModel.name = lottery.value.name;
  dialogModel.lottery_id = lottery.value.id;
  visible.value = true;
}

//保存
const handleSave = () => {
  http.post('/slottery/result/preset', {data: {
      add: true,
      info: dialogModel
    }}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      }
  })
}
//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  lottery_id: {
    type: 'select',
    placeholder: '彩种名称',
    value: '',
    prop: 'lottery_id',
    options: [],
  },
  status: {
    type: 'select',
    placeholder: '状态',
    value: '',
    prop: 'status',
    options: [
      {label:'已结算', value: 1},
      {label:'未结算', value: 0},
    ],
  },
  qishu: {
    type: 'input',
    placeholder: '期数',
    value: '',
    prop: 'qishu',
  },
  username: {
    type: 'input',
    placeholder: '用户邮箱/手机号',
    value: '',
    prop: 'username',
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search',
    span: 8
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  lottery_id: '',
  status: '',
  username: '',
  qishu:'',
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/slottery/order', { data: pagination }).then((res: any) => {
    if (res.code == 1) {
      tableData.dataList = res.data
      pagination.total = res.total
      searchListBox.searchList.lottery_id.options = res.lotterys;
    }
  })
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

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  // console.log('点击');
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init();
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="primary" @click="handleAdd">{{ $t('预设开奖') }}</el-button> -->
      </div>
    </div>
    <commDialog title="彩种信息" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table class="table" :data="tableData.dataList" width="100%"  :columns="columns">
      <template #status="{ row }">
        <el-tag size="small" type="danger" v-if="row.status == 0">{{ $t('未结算') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('已结算') }}</el-tag>
      </template>
      <template #is_win="{ row }">
        <el-tag size="small" type="success" v-if="row.is_win == 1">{{ $t('赢') }}</el-tag>
        <el-tag size="small" type="danger" v-if="row.is_win == 2">{{ $t('输') }}</el-tag>
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
<style>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
}.ball {
    width: 23px;
    height: 23px;
    display: inline-block;
    text-align: center;
    margin-right: 2px;
    line-height: 23px;
    font-size: 12px;
    color: rgb(255, 255, 255);
    border-radius: 50%;
    background: linear-gradient(rgb(97, 156, 255) 0px, rgb(10, 94, 255));
}
</style>
