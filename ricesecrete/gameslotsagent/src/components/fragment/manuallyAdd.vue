<script setup lang='tsx'>
import { ref, reactive } from 'vue';
import { artificialList } from "@/api/user";
import { timeCycle } from '@/utils/global'
import { string } from 'vue-types';
import { transformI18n } from '@/plugins/i18n';

const columns = [//TableColumnList  summaryTitle
  {
    label: transformI18n("用户信息"),
    prop: "username",
    width:200,
    cellRenderer: ({ row }) => (
      <>
        <p>UID:{row.uid}</p>
        <div v-show={row.phone} class="flex items-center">
          <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
          <p class="ml-[3px]">{row.phone}</p>
        </div>
        <div v-show={row.mail} class="flex items-center">
          <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
          <p class="ml-[3px]">{row.mail}</p>
        </div>
      </>
    )
  },
  {
      label: transformI18n("用户标签"),
      slot: "lebal",
    }, {
      label: transformI18n("类型"),
      slot: "a_type",
    }, {
      label: transformI18n("调整金额"),
      prop: "price"
    }, {
      label: transformI18n("流水倍数"),
      prop: "water",
    }, {
      label: transformI18n("明细备注"),
      prop: "msg",
    },{
      label: transformI18n("操作人"),
      prop: "admin_name"
    },{
      label: transformI18n("操作时间"),
      prop: "add_time"
    }
];
const dataList = [];
const tableData = reactive({
  dataList
})

//以下是搜索框的数据
const list = {
  username:{
    type: 'input',
    placeholder: '用户名',
    value: '',
    prop:'username'
  },
  date: {
    type: 'time',
    placeholder: '时间',
    prop:'date',
    value: ():Array<string> => {
      return []
    }
  },
   lebal:{
    type: 'select',
    placeholder: '标签',
    value: '',
    prop:'lebal',
    options: [
      {
        value: 1,
        label: '普通用户',
      },{
        value: 2,
        label: '测试用户',
      }
    ]
  },
  a_type:{
    type: 'select',
    placeholder: '类型',
    value: '',
    prop:'a_type',
    options: [
      {
        value: 1,
        label: '人工增加',
      },{
        value: 2,
        label: '人工减少',
      },{
        value: 3,
        label: '赠送彩金',
      },{
        value: 4,
        label: 'VIP等级彩金',
      },{
        value: 5,
        label: '充值返利',
      }
    ]
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox = reactive({ list });

const props = defineProps({
  uid: String,
  summaryTitle:String
})

const pagination = reactive({
  uid: '',
  page: 1,
  limit: 12,
  total:0,
  a_type: -1,
  zd_number: '',
  username: '',
  date: '',
  lebal:''
})
const countList = reactive({
  pending_price: '',
  distribute_price: '',
  refuse_price: '',
  level_price: '',
  rebate_price:'',
})
if (props?.uid) {
  pagination.uid = props.uid
}
if (props?.summaryTitle && props.summaryTitle == '人工增加总额') {
    pagination.a_type = 1
}
 if (props?.summaryTitle && props.summaryTitle == '人工赠送彩金总额') {
    pagination.a_type = 3
}
if (props?.summaryTitle && props.summaryTitle == '人工减少总额') {
    pagination.a_type = 2
 }
function init() {
  artificialList(pagination).then((res: any) => {
    if (res.code == 1) {
      countList.pending_price = res.pending_price
      countList.distribute_price = res.distribute_price
      countList.refuse_price = res.refuse_price
      countList.level_price = res.level_price
      countList.rebate_price = res.rebate_price
      tableData.dataList = res.data.data;
      pagination.total = res.data.current_page
      pagination.page = res.data.current_page
    }
  })
}
init();
const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
   init();
};
//搜索
const handleSerch = () => {
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }

    }
  }
  init();
}
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
//点击btn
const btnCurrent = ref(0);
const handleBtn = (val) => {
  btnCurrent.value = val;
  pagination.a_type = val;
  init();
 }
</script>

<template>
  <div>
      <div class="title" v-if="summaryTitle">{{ summaryTitle }}</div>
      <div class="bankcard-box1">

           <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
      </div>
      <div class="bankcard-box2 flex-bc">
          <div>
            <el-button type="warning" :plain="btnCurrent == 1?false:true" @click="handleBtn(1)">{{ $t('人工增加') }}{{ countList.pending_price }}</el-button>
            <el-button type="primary" :plain="btnCurrent == 2?false:true" @click="handleBtn(2)">{{ $t('人工减少') }}{{ countList.distribute_price }}</el-button>
            <el-button type="danger" :plain="btnCurrent == 3?false:true" @click="handleBtn(3)">{{ $t('赠送彩金') }}{{ countList.refuse_price }}</el-button>
            <el-button type="danger" :plain="btnCurrent == 4?false:true" @click="handleBtn(4)">{{ $t('VIP等级彩金') }}{{ countList.level_price }}</el-button>
            <el-button type="danger" :plain="btnCurrent == 5?false:true" @click="handleBtn(5)">{{ $t('充值返利') }}{{ countList.rebate_price }}</el-button>
          </div>
          <div>
            <!-- <el-button type="primary">{{ $t('导出') }}</el-button>
            <el-button type="primary">{{ $t('添加') }}</el-button>
            <el-button type="primary">{{ $t('导入') }}</el-button> -->
          </div>
      </div>
      <div class="bankcard-box3">
          <pure-table :border="true" :data="tableData.dataList" width="100%" :height="400"  :columns="columns" >
              <template #a_type="{ row }">
                  <el-tag type="warning" size="small" v-if="row.a_type == 1">{{ $t('人工增加') }}</el-tag>
                  <el-tag size="small" v-if="row.a_type == 2">{{ $t('人工减少') }}</el-tag>
                  <el-tag type="danger" size="small" v-if="row.a_type == 3">{{ $t('赠送彩金') }}</el-tag>
                  <el-tag type="danger" size="small" v-if="row.a_type == 4">{{ $t('VIP等级彩金') }}</el-tag>
                  <el-tag type="danger" size="small" v-if="row.a_type == 5">{{ $t('充值返利') }}</el-tag>
              </template>
              <template #lebal="{ row }">
                <el-tag size="small" plain v-if="row.lebal == 1">{{ $t('一般用户') }}</el-tag>
                <el-tag size="small" plain v-if="row.lebal == 2">{{ $t('测试用户') }}</el-tag>
            </template>
          </pure-table>
      </div>
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

<style scoped lang="scss">
.title{
  font-size: 16px;
  font-weight: bold;
  margin-top:20px;
  margin-bottom:10px;
  color:var(--el-color-primary);
}
  .bankcard-box1{
    display: flex;
    flex-wrap: wrap;
    .item{
      margin-right: 5px;
      margin-bottom: 10px;
    }
  }
  .bankcard-box2{
    margin:10px 0;
    margin-top:20px;
   color:var(--el-color-danger);
  }
  .autoFefresh{

  }
  .top-box{
      margin-bottom:20px;
    }
</style>
