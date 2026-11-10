<script setup lang='tsx'>
import { reactive, ref } from 'vue';
import { message } from "@/utils/message";
import { runningWater, userWaterList, waterUpdate } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
const columns = [//TableColumnList
  {
    label: transformI18n("类型"),
    // prop: "title",
    slot: 'title'
  }, {
    label: transformI18n("完成流水"),
    prop: "total_price",
  }, {
    label: transformI18n("所需流水"),
    prop: "required_price",
  }
];
const columns1 = [//TableColumnList
  {
    label: transformI18n("类型"),
    // prop: "title",
    slot: 'title'
  }, {
    label: transformI18n("未结算"),
    prop: "unsettlement",
  }, {
    label: transformI18n("已结算"),
    prop: "settled",
  }, {
    label: transformI18n("总计"),
    prop: "total_price",
  }
];
const list1 = [];
const list2 = [];
const detailList = [];
const tableData = reactive({
  list1, list2, detailList
})
const props = defineProps({
  uid: String
})


//交易明细数据加载
const query = reactive({
  select: true,
  uid: '',
  set: 3,
  page: 1,
  limit: 12,
})
interface tabinfo {
  page: number,
  limit: number,
  total: number,
  uid: number
}
const pagination = ref<tabinfo>({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  uid: 0
});
if (props?.uid) {
  query.uid = props.uid ?? ""
  pagination.value.uid = Number(props.uid) ?? 0
}
const withdrawal_rules = ref(0)
const savings = ref(0);
const today_savings = ref(0);
toalInit(3)
toalInit(2)
function toalInit(val) {
  query.set = val
  runningWater(query).then((res: any) => {
    withdrawal_rules.value = res.withdrawal_rules
    savings.value = res.savings
    today_savings.value = res.today_savings
    // console.log(savings)
    if (val == 3) {
      tableData.list1 = res.data;
    } else {
      tableData.list2 = res.data;
    }
  })
}

const columnsDetail = [//TableColumnList
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.uid}</span>
      </div>
    )
  }, {
    label: transformI18n("添加时间"),
    prop: "create_time",
    width: 150
  },
  {
    label: transformI18n("原始金额"),
    width: 150,
    prop: 'amount'
  },
  {
    label: transformI18n("流水倍数"),
    prop: "multiple",
    width: 110,
  }, {
    label: transformI18n("流水金额"),
    width: 150,
    prop: "water"
  }, {
    label: transformI18n("备注"),
    prop: "remark",
    width: 150,
  },
];
const hnadleTab = (val) => {
  if (val == 1) {
    pagination.value.page = 1;
    init();
  }

}
//获取列表数据
const ajax = ref(false);
function init(query?: object) {
  userWaterList(pagination.value).then((res: any) => {
    tableData.detailList = res.data.data
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    ajax.value = false;
  })
}

//弹框写法
const visible = ref(false);
const dialogList = {
  // username: {
  //   type: 'slot',
  //   label: '用户UID',
  //   placeholder: '用户UID',
  //   value: '',
  //   name: 'username',
  //   prop: 'username'
  // },
  a_type: {
    type: 'select',
    label: '调整类型',
    placeholder: '调整类型',
    value: 8,
    options: [
      {
        label: '流水增加',
        value: 8,
      }, {
        label: '流水减少',
        value: 9,
      }
    ],
    prop: 'a_type'
  },
  price: {
    type: 'input',
    ty: 'number',
    label: '调整金额',
    placeholder: '调整金额',
    value: '',
    prop: 'price'
  },
  water: {
    type: 'input',
    label: '流水倍数',
    placeholder: '提现需要的流水倍数',
    value: '1',
    prop: 'water'
  },
  // mx_msg2: {
  //   type: 'select',
  //   label: '快捷备注',
  //   placeholder: '快捷备注',
  //   value: '',
  //   options: [
  //   ],
  //   prop: 'mx_msg2'
  // },
  mx_msg: {
    type: 'input',
    label: '明细备注',
    placeholder: '自定义备注',
    tip: '注：用户收益明细信息,不填默认',
    value: '',
    prop: 'mx_msg'
  },
}
const dialogModel = reactive({
  username: pagination.value.uid,
  price: '',
  mx_msg: '',
  mx_msg2: '',
  a_type: 8,
  water: '1',
  uid: ''
})
const listRules = {
  // username: [
  //   { required: true, message: '请输入用户UID', trigger: 'blur' },
  // ],
  // price: {
  //   required: true, message: '请输入金额', trigger: 'blur'
  // },
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
 
  list2Box.dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
  if (index == 'mx_msg2') {
    handleDialogChange({ value: value, index: 'mx_msg' })
  }
}
const manualRecharge = () => {
  visible.value = true
  dialogModel.a_type = 8;
}
const clearManualRecharge = () => {
  dialogModel.a_type = 10;
  dialogModel.price = '1';

  const query = {
    add: true,
    info: {
      ...dialogModel
    }
  }
  waterUpdate(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      toalInit(3);
    } else {
      message(res.msg, { type: 'error' });
    }
  })

}
const saveAdd = () => {
  const query = {
    add: true,
    info: {
      ...dialogModel
    }
  }
  waterUpdate(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      visible.value = false
      toalInit(3);
    } else {
      message(res.msg, { type: 'error' });
    }
  })

}

</script>

<template>
  <el-tabs type="border-card" class="demo-tabs" @tab-change="hnadleTab">
    <el-tab-pane :label="$t('流水总览')">
      <div>
        <div class="txt1">{{ $t('提现规则') }}：<span>{{ withdrawal_rules == 1 ? $t('单流水') : $t('总流水') }}</span>
          <template v-if="withdrawal_rules == 1">
            {{ $t('剩余流水') }}：<span>{{ savings }}</span>
            {{ $t('今日流水') }}：<span>{{ today_savings }}</span>
          </template>
        </div>
        <div>
          <el-button type="primary" @click="manualRecharge">{{ $t('手动调整') }}</el-button>
          <el-button type="primary" @click="clearManualRecharge">{{ $t('清除提款打码量') }}</el-button>
        </div>
        <commDialog title="添加" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules"
          @save="saveAdd" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
        <template v-if="tableData.list1.length > 0">
          <pure-table :border="true" header-cell-class-name="customHeaderStyle" :data="tableData.list1" width="100%"
            :columns="columns">
            <template #title="{ row }">
              {{ $t(row.title) }}
            </template>
          </pure-table>
        </template>
        <div style="height: 50px;"></div>
        <template v-if="tableData.list2.length > 0">
          <pure-table :border="true" header-cell-class-name="customHeaderStyle" :data="tableData.list2" width="100%"
            :columns="columns1">
            <template #title="{ row }">
              {{ $t(row.title) }}
            </template>
          </pure-table>
        </template>

      </div>
    </el-tab-pane>
    <el-tab-pane :label="$t('流水明细')">
      <div class="bankcard-box3">
        <pure-table :border="true" :data="tableData.detailList" width="100%" :columns="columnsDetail" />
      </div>
    </el-tab-pane>
  </el-tabs>

</template>

<style scoped lang="scss">
.top-box {
  margin-bottom: 20px;
}

.txt1 {
  margin-bottom: 5px;

  span {
    color: var(--el-color-danger);
  }

  span:first-child {
    margin-right: 30px;
  }
}

.txt2 {
  margin-bottom: 10px;
}
</style>
