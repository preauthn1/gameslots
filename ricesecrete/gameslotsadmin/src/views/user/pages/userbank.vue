<script setup lang='tsx'>
import { ref,reactive,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { userbankList, userbankEidt, userbankEidtDetail, userbankDelete } from "@/api/user";
// @ts-ignore
import bankTop from "@/components/user/bankTop.vue";
import { message } from "@/utils/message";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
const { t } = useI18n();
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'userbankList'
})
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
    }, {
      label: t("添加时间"),
      prop: "add_time",
      width: 180
    },
    {
      label: t("货币"),
      prop:'country_code',
      width: 150
    },
    {
      label: t("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    },  {
    label: t("用户名"),
    prop: "username",
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
  },  {
      label: t("银行名称"),
       prop: "bank_name",
      width: 150,
    }, {
      label: t("银行卡号"),
      prop: "bank_number",
      width: 150
    }, {
      label: t("开户者姓名"),
      prop: "bank_hm",
      width: 150
    },{
      label: t("金融编码"),
      prop: "financial",
      width: 150
    },{
      label: t("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" onClick={() => handleEidt(index, row)} type="primary">{ t('修改') }</el-button>
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
      label: t("添加时间"),
      prop: "add_time",
      width: 180
    },
    {
      label: t("货币"),
      width: 150,
      prop:'country_code'
    },
    {
      label: t("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    },  {
    label: t("用户名"),
    prop: "username",
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
  },  {
      label: t("USDT链接名"),
       prop: "bank_name",
      width: 150,
    }, {
      label: t("UST收款地址"),
      prop: "bank_number",
      width: 150
    }, {
      label: t("UST收款二维码"),
      prop: "bank_open"
    },{
      label: t("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" onClick={() => handleEidt(index, row)} type="primary">{ t('修改') }</el-button>
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
      label: t("添加时间"),
      prop: "add_time",
      width: 180
    },
    {
      label: t("货币"),
      width: 150,
      prop:'country_code'
    },
    {
      label: t("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    },  {
    label: t("用户名"),
    prop: "username",
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
  }, {
      label: t("钱包名称"),
       prop: "bank_name",
      width: 150,
    }, {
      label: t("钱包收款地址"),
      prop: "bank_number",
      width: 150
    }, {
      label: t("钱包收款二维码"),
      prop: "bank_open"
    },{
      label: t("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" onClick={() => handleEidt(index, row)} type="primary">{ t('修改') }</el-button>
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
    },  {
    label: t("用户名"),
    prop: "username",
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
  }, {
      label: t("添加时间"),
      prop: "add_time",
      width: 180
    },
    {
      label: t("货币"),
      width: 150,
      prop:'country_code'
    },
    {
      label: t("提现汇率"),
      prop: "currency_withdrawal_rate",
      width: 110,
    }, {
      label: t("类型"),
       prop: "bank_name",
      width: 150,
    }, {
      label: t("账号"),
      prop: "bank_number",
      width: 150
    }, {
      label: t("姓名"),
      prop: "bank_hm"
    },{
      label: t("税号"),
      prop: "financial"
    },{
      label: t("操作"),
      width: 100,
      fixed: "right",
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" onClick={() => handleEidt(index, row)} type="primary">{ t('修改') }</el-button>
        </>
      )
    },
];

const ID = ref('');
const keyword = ref('');

const props = defineProps({
    height: Number,
    uid: String,
})
const uid = computed(() => {
  return props.uid
});
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  keyword: '',
  type: 0,
  bank_id: '',
  uid: uid,
  recycle_bin: -1,
  export: 0,
  currency_id: '',
  bank_type: '',
});

const ajax = ref(false);
const dataList: any = [];
const tableData = reactive({ dataList });
const currencyData = ref([]);
const huobiNum = ref(1);
//获取货币数据
function getHuobi() {
  userbankEidtDetail({ currency: "true",id:'' }).then((res: any) => {
    if (res.code == 1) {
      const ordinary_data = res.currency.ordinary_data;
      const arr = [];
      ordinary_data.forEach(item => {
        arr.push({ value:item.id, label:item.name + '('+ item.country_code +')' +'-'+t('提现汇率')+'：'+item.withdrawal_rate })
      })
      dialogList['currency_id'].options = arr
      currencyData.value = arr;
    }
  })
}
//点击修改获取数据

//获取列表数据
init();
function init(query?: object) {
  userbankList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    ajax.value = false;
    if (huobiNum.value == 1) {
      getHuobi();
    }
    huobiNum.value = 2;
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

const hnadleTab = (val) => {
  pagination.type = val;
  pagination.page = 1;
  pagination.bank_id = '';
  pagination.keyword = '';
  pagination.currency_id = '';
  pagination.export = 0;
  init();
}
//

const bankSerch = ({ id,keyword, currency_id, bank_type}) => {
  pagination.bank_id = id;
  pagination.keyword = keyword;
  pagination.bank_type = bank_type;
  pagination.currency_id = currency_id;
  pagination.export = 0;
  pagination.page = 1;
  if (ajax.value) return;
  ajax.value = true
  init();
}

//导出
const handleExport = ({ id,keyword, currency_id, bank_type}) => {
  pagination.bank_id = id;
  pagination.keyword = keyword;
  pagination.bank_type = bank_type;
  pagination.currency_id = currency_id;
  pagination.export = 1;
  pagination.page = 1;
  if (ajax.value) return;
  ajax.value = true
  userbankList(pagination).then((res:any) => {
    ajax.value = false;
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}



//弹框写法
const visible = ref(false);

const dialogList = {
  currency_id:{
    type: 'select',
    value: '',
    label: t('货币'),
    placeholder: t('请选择'),
    prop:'currency_id',
    options: []
  },
  bank_open:{
    type: 'input',
    label: t('开户支行'),
    placeholder: t('开户支行'),
    value: '',
    prop:'bank_open'
  },
  bank_name:{
    type: 'input',
    label: t('银行名称'),
    placeholder: t('银行名称'),
    value: '',
    prop:'bank_name'
  },
  bank_number:{
    type: 'input',
    label: t('银行卡号'),
    placeholder: t('银行卡号'),
    value: '',
    prop:'bank_number'
  },
  bank_hm:{
    type: 'input',
    label: t('开户者姓名'),
    placeholder: t('开户者姓名'),
    value: '',
    prop:'bank_hm'
  },
  financial: {
    type: 'input',
    label: t('金融编码'),
    placeholder: t('金融编码'),
    value: '',
    prop:'financial'
  },
}
const dialogModel = reactive({
  currency_id: '',
  bank_open:'',
  bank_name: '',
  bank_number: '',
  bank_hm: '',
  financial:''
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
//当前选中的row
const currentRow = reactive({
  id: '',
  uid:''
})
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  dialogModel[index] = value;
}
const handleEidt = (index,row) => {
  currentRow.id = row.id;
  currentRow.uid = row.uid;
  visible.value = true;
  for (const key in row) {
    if (key == dialogList[key]?.prop) {
      dialogList[key].value = row[key]
      dialogModel[key] = row[key];
    }
  }
}
//编辑点击确定
const handleSave = () => {
    const query = {
      edit: true,
      info: {
        id: currentRow.id,
        uid:currentRow.uid,
        ...dialogModel,
      }
    }
    userbankEidt(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      }
    })

}
let selectAll = reactive([])
function getIds() {
  const s_arr = [];
  selectAll.forEach(item => {
    s_arr.push(item.id)
  })
  return s_arr;
  // selectModel.ids = s_arr.join(',');
}
const handleSelectionChange = (val) => {
  selectAll = val;
}
const deleteId = (id) => {
      proxy.$confirm(t('确认删除吗？'), t('提示')).then(() => {
        deleteBank(id);
        }).catch(() => {
        //  console.log('取消');
    })
}
function deleteBank(id) {
  const queryDelte = {
    delete: true,
    id
  }
  userbankDelete(queryDelte).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    }
  })
}
//删除
const handleDelete = () => {
  if (selectAll.length > 0) {
    const ids = getIds();
    deleteId(ids.join(','));
  } else {
    message(t('请勾选用户'), { type: 'warning' });
  }
}
//回收站
const backStation = () => {
  pagination.recycle_bin = 1;
  init();
}
const handleBack = () => {
  pagination.recycle_bin = -1;
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
  <div class="bank-box">
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
     <!-- <div><el-button  class="uidBtn" type="danger" @click="handleRemoveUid" v-if="pagination.uid!=''">当前是{{ pagination.uid }}用户页面，点击可清除</el-button></div> -->
    <el-tabs type="border-card" class="demo-tabs" @tab-change="hnadleTab">
      <el-tab-pane :label="t('银行卡')">
          <bankTop :ID="ID" :currency="currencyData" :keyword="keyword" @search="bankSerch" @export="handleExport" :recycle_bin="pagination.recycle_bin" @backstation="backStation"  @delete="handleDelete" @back="handleBack" placeholder="用户账号、银行卡、银行卡号、开户支行、开户者姓名"/>
          <div class="bankcard-box3">
              <pure-table :border="true" :data="tableData.dataList" width="100%" :columns="columns1" @selection-change="handleSelectionChange"/>
          </div>
      </el-tab-pane>
      <el-tab-pane :label="t('USDT')">
          <bankTop @search="bankSerch" @export="handleExport" :currency="currencyData" :recycle_bin="pagination.recycle_bin" @backstation="backStation"  @delete="handleDelete" @back="handleBack" :ID="ID" :keyword="keyword" placeholder="用户账号、USDT收款地址、USDT链接名、开户者姓名"/>
          <div class="bankcard-box3">
              <pure-table :border="true" :data="tableData.dataList" width="100%" :columns="columns2" @selection-change="handleSelectionChange"/>
          </div>
      </el-tab-pane>
      <el-tab-pane :label="t('电子钱包')">
          <bankTop @search="bankSerch" @export="handleExport" :currency="currencyData" :recycle_bin="pagination.recycle_bin" @backstation="backStation"  @delete="handleDelete" @back="handleBack" :ID="ID" :keyword="keyword" placeholder="用户账号、钱包名称、钱包收款地址、开户者姓名"/>
          <div class="bankcard-box3">
              <pure-table  :border="true" :data="tableData.dataList" width="100%" :columns="columns3" @selection-change="handleSelectionChange"/>
          </div>
      </el-tab-pane>
      <el-tab-pane :label="t('PIX钱包')">
          <bankTop @search="bankSerch" @export="handleExport" :currency="currencyData" :recycle_bin="pagination.recycle_bin" @backstation="backStation"  @delete="handleDelete" @back="handleBack" :ID="ID" :keyword="keyword" placeholder="用户账号、钱包名称、钱包收款地址、开户者姓名"/>
          <div class="bankcard-box3">
              <pure-table  :border="true" :data="tableData.dataList" width="100%" :columns="columns4" @selection-change="handleSelectionChange"/>
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
    <commDialog :title="t('编辑')" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
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
  z-index: 100;
}

</style>
