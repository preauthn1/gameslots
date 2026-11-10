<script setup lang="tsx">
import { computed, reactive, ref } from 'vue';
import { adminLogList } from "@/api/user";
// @ts-ignore
 import uploadImage from '@/components/comm/uploadImage.vue'
// import { useRoute, useRouter } from "vue-router";
// import { getUid, removeUid } from "@/utils/route";
 import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';
defineOptions({
  name: 'adminLogList'
})
// const route = useRoute();
// const router = useRouter();

const columns = [//TableColumnList
  {
    label: transformI18n("操作时间"),
    prop: "add_time",
  },
  {
    label: transformI18n("管理员名称"),
    prop: "admin_name"
  },
  {
    label: transformI18n("管理员账号"),
    prop: "admin_account",
  },
  {
    label: transformI18n("操作类型"),
    prop: "handle_name"
  },
  {
    label: transformI18n("操作前数据"),
    slot: "forward_data",
  },
  {
    label: transformI18n("操作后数据"),
    slot: "rear_data",
  },
];
  //编辑
const handleEidt = (index,row) => {
  visible.value = true;
}
const props = defineProps({
    uid: String,
})
const uid = computed(() => {
  return props.uid
})

const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = {
  admin_name:{
    type: 'input',
    placeholder: transformI18n('管理员账号'),
    value: '',
    prop:'admin_name'
  },
  handle_name:{
    type: 'input',
    placeholder: transformI18n('操作名称/操作数据'),
    value: '',
    prop:'handle_name'
  },
  date:{
    type: 'time',
    placeholder: transformI18n('注册时间'),
    prop:'date',
    value: ():Array<string> => {
      return []
    }
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  handle_name: '',//id 推广码 用户名 精确搜索
  admin_name: '',//管理员账号
  date: '',
  uid:uid
});

const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  adminLogList(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    // pagination.page = res.data.current_page
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
  // pagination.username = list[0].value
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
//弹框写法
const visible = ref(false);
const dialogList = [
  {
    type: 'input',
    label: '平台名称',
    placeholder: '平台名称',
    value: '',
    prop:'tc_name'
  },{
    type: 'input',
    label: '平台代号',
    placeholder: '平台代号',
    tip:'三方平台代号，用于代码继承规则，全大写无特殊字符,技术员修改',
    value: '',
    prop:'tc_code'
  }, {
    type: 'input',
    label: 'API前缀',
    placeholder: 'API前缀',
    tip:'三方平台API前缀',
    value: '',
    prop:'tc_api_urlpre'
  },{
    type: 'input',
    label: '平台私钥',
    placeholder: '平台私钥',
    tip:'三方平台私钥',
    value: '',
    prop:'tc_api_prikey'
  },{
    type: 'input',
    label: '签名密钥',
    placeholder: '签名密钥',
    tip:'三方平台签名密钥，有些平台签名密钥为独立的',
    value: '',
    prop:'tc_api_signkey'
  },{
    type: 'input',
    label: '平台唯一标识',
    placeholder: '平台唯一标识',
    tip:'本平台在三方平台的唯一标识，比如商户号',
    value: '',
    prop:'tc_tag'
  }, {
    type: 'input',
    label: 'TOKEN',
    placeholder: 'TOKEN',
    tip:'三方平台API验证TOKEN',
    value: '',
    prop:'tc_token'
  },{
    type: 'input',
    label: 'TOKEN有效期',
    placeholder: 'TOKEN有效期',
    tip:'三方平台token有效时间（秒）',
    value: '',
    prop:'tc_tokentime'
  },{
    type: 'input',
    label: '分佣规则',
    placeholder: '分佣规则',
    tip:'json，代理分佣规则设置,由分佣方法使用',
    value: '',
    prop:'max_amount'
  }, {
    type: 'input',
    label: '货币',
    placeholder: '货币',
    tip:'三方平台货币单位，必须填写，请填写与三方平台接口要求的货币字估完全一致的字符串，区分大小写',
    value: '',
    prop:'max_amount'
  }, {
    type: 'input',
    label: '汇率',
    placeholder: '汇率',
    tip:'本平台与三方平台的币值汇率，以本平台为1',
    value: '',
    prop:'max_amount'
  }, {
    type: 'input',
    label: '最低投注',
    placeholder: '最低投注',
    tip:'三方游戏最低投注',
    value: '',
    prop:'max_amount'
  }, {
    type: 'input',
    label: '最高投注',
    placeholder: '最高投注',
    tip:'三方游戏最高投注',
    value: '',
    prop:'max_amount'
  },{
    type: 'radio',
    value: 1,
    label:'狀態',
    options: [
      {
        label: 1,
        name:'开启'
      },{
        label: 0,
        name:'关闭'
      },
    ]
  },  {
    type: 'slot',
    name: 'upload',
    label: '平台图标图标',
    prop:'upload'
  },{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    tip:'排序，越大排越前面',
    value: '',
    prop:'max_amount'
  },
]
const dialogModel = reactive({
  username: '',
  sort: '',
  min_amount: '',
  max_amount:''
})
const listRules = {
   name: [
    { required: true, message: '分类名称', trigger: 'blur' },
    { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}

//点击添加
const handleAdd = () => {
  visible.value = true;
}

//点击清楚uid
// const handleRemoveUid = () => {
//   removeUid('log');
//   router.replace({ path: '/admin/logList' })
//   pagination.handle_name = '';
//   pagination.page = 1;
//   pagination.date = ''
//   pagination.uid = '';
//   init();
// }
</script>

<template>
  <div class="">
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <commDialog title="基础信息" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage :limit="1"/>
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
      <template #forward_data="{ row }">
        <el-input type="textarea" :value="row.forward_data"/>
      </template>
      <template #rear_data="{ row }">
        <el-input type="textarea" :value="row.rear_data"/>
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
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
</style>
