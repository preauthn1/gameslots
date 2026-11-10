<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    width: "100"
  },
  {
    label: transformI18n("彩种名称"),
    prop: "name",
    width: "100"
  },
  {
    label: transformI18n("图标"),
    slot: "icon",
    width: "100"
  },
  {
    label: transformI18n("彩种类型"),
    prop: "lottery_type",
  },
  {
    label: transformI18n("彩种期数"),
    prop: "lottery_th",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    width: "250",
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        <el-button v-show={hasAuth('edit')} size="small" type="warning"  onClick={() => handleRule(row)}>{ transformI18n('规则') }</el-button>
        <el-button v-show={hasAuth('odds')} size="small" type="danger" onClick={() => handleOddSet(row)}>{ transformI18n('玩法设置') }</el-button>
      </>
    )
  },
];

// 赔率设置
const optionVisible = ref(false);
const options = ref([]);
const options_text = ref([]);
const lottery_type = ref('');
const lottery_odds: any = ref({});
const lottery_id = ref(0);
const setOdd = ($event, group, option) => {
  console.log($event, group, option, lottery_odds.value)
};
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
    prop: 'name'
  },
  icon: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '图标',
    prop: 'icon'
  },
  lottery_type: {
    type: 'select',
    label: '彩种类型',
    placeholder: '彩种类型',
    value: '',
    prop: 'lottery_type',
    options: [],
  },
  draw_type: {
    type: 'select',
    label: '开奖类型',
    placeholder: '开奖类型',
    value: 0,
    prop: 'draw_type',
    options: [
      {label: '随机', value: 0},
      {label: '庄家赢_最多', value: 1},
      {label: '庄家赢_最少', value: 2},
      {label: '庄家赢_随机', value: 3},
      {label: '庄家输_最多', value: 4},
      {label: '庄家输_最少', value: 5},
      {label: '庄家输_随机', value: 6},
    ],
  },
  draw_rate: {
    type: 'input',
    label: '概率',
    tip: '说明: 1 = 100%, 0.7 = 70%',
    placeholder: '概率',
    value: '',
    prop: 'draw_rate'
  },
  lottery_th: {
    type: 'input',
    label: '彩种期数',
    placeholder: '彩种期数',
    value: '',
    prop: 'lottery_th'
  },
  game_id: {
    type: 'input',
    label: '游戏ID',
    placeholder: '游戏ID',
    tip: '对应三方游戏->游戏管理列表ID',
    value: '',
    prop: 'game_id'
  },
  quick_amount: {
    type: 'input',
    label: '快捷金额',
    placeholder: '快捷金额',
    tip:'多个金额使用","分隔',
    value: '',
    prop: 'quick_amount'
  },
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort'
  },
  status: {
    type: 'radio',
    label: '显示',
    placeholder: '显示',
    value: 0,
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
  },
}
const dialogModel = reactive({
  id: '',
  game_id:'',
  name:'',
  icon:'',
  lottery_type:'',
  lottery_th: '',
  sort:'',
  status: '',
  setting: '',
  quick_amount: '',
  draw_type: ''
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
  http.post('/slottery/add', {data: query}).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.id = res.data.id;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//点击添加
const handleAdd = () => {
  clickCurrentIndex.value = 2
  for (const key in dialogList) {
    if (dialogList[key].type == 'radio') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }
  }
  dialogModel.id = '';
  visible.value = true;
}
const handleOddSet = (row) => {
  lottery_type.value = row.lottery_type
  lottery_id.value = row.id
  optionVisible.value = true
  http.post('/slottery/getodd', {
    data: {
      lottery_id: lottery_id.value,
    }
  }).then((res: any)=> {
    lottery_odds.value = res.code == 1 ? res.odds : {};
  })
}
//图片返回
const backImageData1 = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}

//保存
const handleSave = () => {
  http.post('/slottery/add', {data: {
      add: true,
      info: dialogModel
    }}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  name: {
    type: 'input',
    placeholder: '彩种名称',
    value: '',
    prop: 'name',
    span: 16
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
  name:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/slottery/list', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    list2Box.dialogList.lottery_type.options = res.type;
    options.value = res.options;
    options_text.value = res.options_text;
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

//删除
let selectAll = [];
const handleDelete = () => {
  if (selectAll.length <= 0) {
    message('请选择', { type: 'error' });
    return;
  }
  const arr = [];
  proxy.$confirm('确认删除吗？', '提示').then(() => {
    selectAll.forEach(item => {
      arr.push(item.id);
    })
    deleteIds(arr.join(','))
  }).catch(() => {
  })

}
const handleSelectionChange = (val) => {
  selectAll = val;
}
function deleteIds(id) {
  const query = {
    id
  }
  http.post('/slottery/delete', {data: query}).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}


///点击设置活动内容
const ruleShow = ref(false);
const lotteryId = ref('');
const handleRule = (row) => {
  lotteryId.value = row.id
  ruleShow.value = true;
}
</script>
<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>

    <el-dialog v-model="ruleShow" :title="$t('游戏规则')" width="80%">
      <component :id="lotteryId"  :is="defineAsyncComponent(()=> import('@/views/rule/list.vue'))"/>
    </el-dialog>
    <el-dialog v-model="optionVisible" :title="$t('玩法配置')" width="60%">
         <el-tabs type="border-card">
            <el-tab-pane v-for="opt,index in options[lottery_type]" :key="index" :label="$t(options_text[lottery_type][index])">
              <el-row :gutter="10">
                <el-col :xs="8" :sm="6" :md="4" :lg="3" v-for="item,idx in opt" :key="idx">
                  <div class="flex-bc">
                    <el-tag v-if="options_text[lottery_type][item]">{{ $t(options_text[lottery_type][item]) }}</el-tag>
                    <el-tag v-else>{{ item }}</el-tag>
                    <el-input type="text" v-model="lottery_odds[index + '___' + item]" @input="setOdd($event, index, item)" />
                  </div>
                </el-col>
              </el-row>
              <el-button type="primary" @click="handleSaveOdd">{{ $t('保存') }}</el-button>
            </el-tab-pane>
          </el-tabs>
    </el-dialog>
    <commDialog title="彩种信息" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:upload>
          <uploadImage @imageData="backImageData1" :image="dialogModel.icon" :limit="1" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #icon="{ row }">
        <el-image v-if="row.icon" style="width:30px;" :src="row.icon" fit="contain" />
      </template>
      <template #amount="{ row }">
          {{ row.min_amount }}~{{ row.max_amount }}
      </template>
      <template #rate="{ row }">
          {{ row.min_rate }}%~{{ row.max_rate }}%
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="danger" v-if="row.status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
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
