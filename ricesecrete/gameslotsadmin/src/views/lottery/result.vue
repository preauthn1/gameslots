<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance } from "vue";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
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
    label: transformI18n("开奖时间"),
    prop: "open_time",
    width: "160"
  },
  {
    label: transformI18n("第一球"),
    prop: "ball_1",
    cellRenderer: ({row}) => (
      <span class="ball">{ row.ball_1 }</span>
    )
  },
  {
    label: transformI18n("第二球"),
    prop: "ball_2",
    cellRenderer: ({row}) => (
      <span class="ball">{ row.ball_2 }</span>
    )
  },
  {
    label: transformI18n("第三球"),
    prop: "ball_3",
    cellRenderer: ({row}) => (
      <span class="ball">{ row.ball_3 }</span>
    )
  },
  {
    label: transformI18n("第四球"),
    prop: "ball_4",
    cellRenderer: ({row}) => (
      <span class="ball">{ row.ball_4 }</span>
    )
  },
  {
    label: transformI18n("第五球"),
    prop: "ball_5",
    cellRenderer: ({row}) => (
      <span class="ball">{ row.ball_5 }</span>
    )
  },
  {
    label: transformI18n("总和,龙虎"),
    prop: "sum",
    width: 150,
    cellRenderer: ({row}) => (
      <span>{ row.sum.join(' / ') }</span>
    )
  },
  {
    label: transformI18n("前三/中三/后三"),
    prop: "three",
    width: 150,
    cellRenderer: ({row}) => (
      <span>{ row.three.join(' / ') }</span>
    )
  },
  {
    label: transformI18n("结算"),
    slot: "status",
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
  qishu: {
    type: 'input',
    placeholder: '期数',
    value: '',
    prop: 'qishu',
    span: 8
  },
  lottery_id: {
    type: 'select',
    placeholder: '彩种名称',
    value: 0,
    prop: 'lottery_id',
    options: [],
    span: 8
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
  qishu: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/slottery/result', { data: pagination }).then((res: any) => {
    if (res.code == 1) {
      tableData.dataList = res.data
      pagination.total = res.total
      searchListBox.searchList.lottery_id.options = res.lotterys;
      if (searchListBox.searchList.lottery_id.value == 0) {
        searchListBox.searchList.lottery_id.value = res.lotterys[0].value;
      }
      lottery.value = res.lottery;
      options.value = res.options;
      options_text.value = res.options_text;
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

</script>
<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('预设开奖') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <commDialog title="彩种信息" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table class="table" :data="tableData.dataList" width="100%"  :columns="columns">
      <template #icon="{ row }">
        <el-image v-if="row.icon" style="width:30px;" :src="row.icon" fit="contain" />
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="danger" v-if="row.status == 0">{{ $t('未结算') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('已结算') }}</el-tag>
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
