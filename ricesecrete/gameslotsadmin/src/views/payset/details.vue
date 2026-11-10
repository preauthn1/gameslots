<script setup lang="tsx">
import { computed, reactive,ref } from "vue";
import { payAgentRecord,payAgentRecharge } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';

const columns = [//TableColumnList
  {
    label: transformI18n("记录ID"),
    prop: "id",
    fixed: "left",
  },
  {
    label: transformI18n("银商ID"),
    prop: "agent_id",
  }, {
    label: transformI18n("操作金额"),
    prop:'money',
  }, {
    label: transformI18n("操作前金额"),
    prop: "before_money",
  }, {
    label: transformI18n("备注"),
    prop: "remark",
  }, {
    label: transformI18n("操作地址"),
    prop: "ip",
  }, {
    label: transformI18n("操作时间"),
    prop: "create_time",
  }
];

const props = defineProps({
  id:String
})
const id = computed(() => {
  return props.id
})
const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  issue_number:{
    type: 'input',
    placeholder: '期号',
    value: '',
    prop:'issue_number'
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
  id:id
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  payAgentRecord(pagination).then((res:any) => {
    tableData.dataList = res.data
    // pagination.total = res.data.total
    // pagination.page = res.data.current_page
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
  console.log('点击');
  //搜索列表 没有日期的写法
    for (const key in pagination) {
        if (key == searchList[key]?.prop) {
          pagination[key] = searchList[key].value;
        }
  }
    //搜索列表 有日期的写法

  // for (var key in pagination) {
  //   if (key == list[key]?.prop) {
  //     if (key == 'date') {
  //       let val = list[key].value;
  //       const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  //       pagination[key] =  time;
  //     } else {
  //       pagination[key] = list[key].value
  //     }
  //   }
  // }
    pagination.page = 1;
    init(pagination);
}


//弹框写法
const visible = ref(false);
const dialogList = {
  money:{
    type: 'input',
    label: '充值金额',
    placeholder: '充值金额',
    value: '',
    ty:'number',
    prop:'money'
  },
  remark:{
      type: 'input',
      label: '备注',
      placeholder: '备注',
      value: '',
      prop:'remark'
    },
}
const dialogModel = reactive({
  money:'',
  remark:'',
})
const listRules = {

  money: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {

      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
}
const clickIndex = ref(1);


const handleSave = () => {

     const query = {
      add: true,
       info: {
         ...dialogModel,
        id:pagination.id
       }
    }
    payAgentRecharge(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

}

//添加
const handleAdd = () => {
  for (const key in dialogModel) {
     dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
        list2Box.dialogList[key].value = ''
     }
    }
  clickIndex.value = 2;
  visible.value = true;
}
</script>

<template>
  <div>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button v-if="hasAuth('recharge')" type="primary" @click="handleAdd">{{ $t('充值') }}</el-button>
      </div>
      <div class="flex-fi">
        <!-- <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"></commSerach> -->
      </div>
    </div>
    <commDialog title="添加" width="60%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
    <!-- <div class="btmNav">
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
    </div> -->
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
</style>
