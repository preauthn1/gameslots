<script setup lang='tsx'>
import { ref,reactive,defineAsyncComponent } from "vue";
import {userbankList,userbankEidt} from "@/api/user";
import bankTop from "@/components/user/bankTop.vue";
import { transformI18n } from "@/plugins/i18n";

const columns1 = [//TableColumnList
    {

      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("ID"),
      prop: "id",
      fixed: "left",
      width: 100,
    }, {
      label: transformI18n("添加时间"),
      prop: "add_time",
      width: 150
    },
    {
      label: transformI18n("货币"),
      prop:'country_code',
      width: 150
    },
    {
      label: transformI18n("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    }, {
      label: transformI18n("用户名"),
      width: 150,
      prop: "username"
    }, {
      label: transformI18n("银行名称"),
       prop: "bank_name",
      width: 150,
    }, {
      label: transformI18n("银行卡号"),
      prop: "bank_number",
      width: 150
    }, {
      label: transformI18n("开户者姓名"),
      prop: "bank_hm"
    },{
      label: transformI18n("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" onClick={() => handleEidt(index, row)} type="primary">{ transformI18n('修改') }</el-button>
        </>
      )
    },
];
const columns2 = [//TableColumnList
    {

      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("ID"),
      prop: "id",
      fixed: "left",
      cellRenderer: ({ row }) => (
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{row.id}</span>
        </div>
      )
    }, {
      label: transformI18n("添加时间"),
      prop: "add_time",
      width: 150
    },
    {
      label: transformI18n("货币"),
      width: 150,
      prop:'country_code'
    },
    {
      label: transformI18n("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    }, {
      label: transformI18n("用户名"),
      width: 150,
      prop: "username"
    }, {
      label: transformI18n("USDT链接名"),
       prop: "bank_name",
      width: 150,
    }, {
      label: transformI18n("UST收款地址"),
      prop: "bank_number",
      width: 150
    }, {
      label: transformI18n("UST收款二维码"),
      prop: "bank_open"
    },{
      label: transformI18n("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" onClick={() => handleEidt(index,row) } type="primary">{ transformI18n('修改') }</el-button>
        </>
      )
    },
];
const columns3 = [//TableColumnList
    {

      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("ID"),
      prop: "id",
      fixed: "left",
      cellRenderer: ({ row }) => (
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{row.id}</span>
        </div>
      )
    }, {
      label: transformI18n("添加时间"),
      prop: "add_time",
      width: 150
    },
    {
      label: transformI18n("货币"),
      width: 150,
      prop:'country_code'
    },
    {
      label: transformI18n("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    }, {
      label: transformI18n("用户名"),
      width: 150,
      prop: "username"
    }, {
      label: transformI18n("钱包名称"),
       prop: "bank_name",
      width: 150,
    }, {
      label: transformI18n("钱包收款地址"),
      prop: "bank_number",
      width: 150
    }, {
      label: transformI18n("钱包收款二维码"),
      prop: "bank_open"
    },{
      label: transformI18n("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" onClick={() => handleEidt(index,row) } type="primary">{ transformI18n('修改') }</el-button>
        </>
      )
    },
];
const columns4 = [//TableColumnList
    {

      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("ID"),
      prop: "id",
      fixed: "left",
      cellRenderer: ({ row }) => (
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{row.id}</span>
        </div>
      )
    }, {
      label: transformI18n("添加时间"),
      prop: "add_time",
      width: 150
    },
    {
      label: transformI18n("货币"),
      width: 150,
      prop:'country_code'
    },
    {
      label: transformI18n("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    }, {
      label: transformI18n("用户名"),
      width: 150,
      prop: "username"
    }, {
      label: transformI18n("类型"),
       prop: "bank_name",
      width: 150,
    }, {
      label: transformI18n("账号"),
      prop: "bank_number",
      width: 150
    }, {
      label: transformI18n("姓名"),
      prop: "bank_hm"
    },{
      label: transformI18n("税号"),
      prop: "financial"
    },{
      label: transformI18n("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" onClick={() => handleEidt(index,row) } type="primary">{ transformI18n('修改') }</el-button>
        </>
      )
    },
];
//点击修改的时候
const dialogTableVisible = ref(false);
const handleEidt = (index,row) => {
  dialogTableVisible.value = true;
}
// const tableData = [
//   {
//     id: '1',
//     time: '2321',
//     lebal: '标签',
//     rec_name: '提现汇率',
//     username: '用户名',
//     bank: '银行名称',
//     bankcode:'银行卡号',
//     userBank:'开户者姓名'
//   }
// ]

const ID = ref('');
const keyword = ref('');


const searchList = [
  {
    type: 'input',
    placeholder: '银行名称、银行卡号、开户支行、开户者姓名、用户名称',
    value: ''
  }, {
    type: 'button',
    value:'搜索'
  }
]
const height = window.innerHeight - 340;
const searchListBox = reactive({
  searchList
})
interface tabinfo {
  page: number,
  limit: number,
  total: number,
  keyword: string | '',
  type: number,
  id: string
}
const pagination = ref<tabinfo>({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  keyword: '',
  type: 0,
  id:''
});
const ajax = ref(false);
const dataList: any = [];
const tableData = reactive({ dataList });
let huobiData = {};
const huobiNum = ref(1);
//获取货币数据
function getHuobi() {
  userbankEidt({ currency: "true" }).then((res: any) => {
    if (res.code == 1) {
      huobiData = res.data;
      // dialogList['currency_id'].options = []
    }
  })
}
//获取列表数据
init();
function init(query?: object) {
  userbankList(pagination.value).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    ajax.value = false;
    if (huobiNum.value == 1) {
      getHuobi();
    }
    huobiNum.value = 2;
  })
}

const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init(pagination.value);
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
   init(pagination.value);
};

const hnadleTab = (val) => {
  pagination.value.type = val;
  pagination.value.page = 1;
  pagination.value.id = '';
  pagination.value.keyword = '';
  init();
}
//

const bankSerch = ({ id,keyword}) => {
  pagination.value.id = id;
  pagination.value.keyword = keyword;
  pagination.value.page = 1;
  if (ajax.value) return;
  ajax.value = true
   init();
}



//弹框写法
const visible = ref(false);

const dialogList = {
  level_name:{
    type: 'input',
    label: '等级名称',
    placeholder: '等级名称',
    value: '',
    prop: 'level_name',
    disable:false
  },
  currency_id:{
    type: 'select',
    value: '',
    label: '货币',
    placeholder: '请选择',
    prop:'currency_id',
    options: [
      // {
      //   label: 0,
      //   name:'累计充值'
      // },{
      //   label: 1,
      //   name:'单次充值'
      // },
    ]
  },
  bank_open:{
    type: 'input',
    label: '开户支行',
    placeholder: '开户支行',
    value: '',
    prop:'bank_open'
  },
  bank_name:{
    type: 'input',
    label: '银行名称',
    placeholder: '银行名称',
    value: '',
    prop:'bank_name'
  },
  bank_number:{
    type: 'bank_number',
    label: '银行卡号',
    placeholder: '银行卡号',
    value: '',
    prop:'bank_number'
  },
  bank_hm:{
    type: 'input',
    label: '开户者姓名',
    placeholder: '开户者姓名',
    value: '',
    prop:'bank_hm'
  }
}
const dialogModel = reactive({
  level_name: '',
  currency_id: '',
  bank_open:'',
  bank_name: '',
  bank_number: '',
  bank_hm: ''
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
//当前选中的row
let currentRow = {
  id:''
};
//当前是添加还是编辑
const currentType = ref(0);//0 是添加  1 是编辑
//当前选中的index
let currentIndex = -1;
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  dialogModel[index] = value;
}
const handleEdit = (row,index) => {
  currentIndex = index;
  currentRow = row;
  currentType.value = 1;
  for (const key in dialogModel) {
    dialogModel[key] = row[key]
    dialogList[key].value = row[key]
  }
   visible.value = true;
};
//编辑点击确定
const handleSave = () => {

    // let query = {
    //   edit: true,
    //   info: {
    //     id: currentRow.id,
    //     ...dialogModel,
    //   }
    // }
    // userlevelEdit(query).then((res: any) => {
    //   if (res.code == 1) {

    //   }
    // })

}
</script>

<template>
  <div class="bank-box">

    <el-tabs type="border-card" class="demo-tabs" @tab-change="hnadleTab">
      <el-tab-pane :label="$t('银行卡')">
          <bankTop :ID="ID" :keyword="keyword" @search="bankSerch" placeholder="银行卡、银行卡号、开户支行、用户名称"/>
          <div class="bankcard-box3">
              <pure-table :border="true" :data="tableData.dataList" width="100%" :columns="columns1" />
          </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('USDT')">
          <bankTop :ID="ID" :keyword="keyword" placeholder="USDT收款地址、USDT链接名、用户名称"/>
          <div class="bankcard-box3">
              <pure-table  :border="true" :data="tableData.dataList" width="100%" :columns="columns2" />
          </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('电子钱包')">
          <bankTop :ID="ID" :keyword="keyword" placeholder="钱包名称、钱包收款地址、用户名称"/>
          <div class="bankcard-box3">
              <pure-table  :border="true" :data="tableData.dataList" width="100%" :columns="columns2" />
          </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('PIX钱包')">
          <bankTop :ID="ID" :keyword="keyword" placeholder="钱包名称、钱包收款地址、用户名称"/>
          <div class="bankcard-box3">
              <pure-table  :border="true" :data="tableData.dataList" width="100%" :columns="columns2" />
          </div>
      </el-tab-pane>
  </el-tabs>
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
    <commDialog title="编辑" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <!---点击修改-->
    <!-- <component :dialogTableVisible="dialogTableVisible" title="修改" @handleClose="dialogTableVisible = false" :is="defineAsyncComponent(()=> import('@/components/user/bankEidt.vue'))" /> -->
  </div>
</template>

<style scoped lang="scss">
.bank-box{
  position: relative;
}
.uidBtn{
  position: absolute;
  top:0;
  right:0;
}

</style>
