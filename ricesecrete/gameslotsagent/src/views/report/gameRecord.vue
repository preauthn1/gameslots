<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { gamebetList } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { timeCycle } from '@/utils/global'
import { forEach } from 'lodash-unified';
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
defineOptions({
  name: 'gameRecord'
})
const columns = [
  {
    label: transformI18n("ID"),
    prop: "gb_id",
  },
  {
    label: transformI18n("游戏名称"),
    prop: "game_sys_sign",
  }, {
    label: transformI18n("游戏平台"),
    prop: "game_third",
  }, {
    label: transformI18n("游戏用户"),
    prop: "username",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.gb_uid)}>
          <p>UID:{row.gb_uid}</p>
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
    label: transformI18n("投注金额"),
    prop: "gb_price",
  }, {
    label: transformI18n("注单号"),
    prop: "gb_sn",
  }, {
    label: transformI18n("投注时间"),
    prop: "gb_bettime",
  }, {
    label: transformI18n("结算金额"),
    prop: "gb_winprice",

  }, {
    label: transformI18n("结算时间"),
    prop: "gb_overtime",
  }, {
    label: transformI18n("状态"),
    slot: "gb_winlose",
  }
];
//编辑

const height = window.innerHeight - 300;
//以下是搜索框的数据
const list = {
  date: {
    type: 'time',
    placeholder: '投注时间',
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  game_sys_sign: {
    type: 'input',
    placeholder: '游戏名称',
    value: '',
    prop: 'game_sys_sign',
  },
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  user_level: {
    type: 'select',
    placeholder: '会员级别',
    value: '',
    prop: 'user_level',
    options: []
  },
  lebal: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    prop: 'lebal',
    options: [
      {
        value: '1',
        label: '一般用户',
      }, {
        value: '2',
        label: '测试用户',
      }
    ]
  },
  agent_name: {
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    prop: 'agent_name'
  },
  tc_id: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'tc_id',
    options: []
  },
  status: {
    type: 'select',
    placeholder: '游戏状态',
    value: '',
    prop: 'status',
    options: [
      {
        value: '0',
        label: '无效',
      }, {
        value: '1',
        label: '未结算',
      }, {
        value: '2',
        label: '输',
      }, {
        value: '3',
        label: '赢',
      }, {
        value: '4',
        label: '平',
      },
    ]
  },
  gb_sn: {
    type: 'input',
    placeholder: '游戏注单号',
    value: '',
    prop: 'gb_sn'
  },
  min_amount: {
    type: 'input',
    placeholder: '投注最低金额',
    value: '',
    prop: 'min_amount'
  },
  max_amount: {
    type: 'input',
    placeholder: '投注最高金额',
    value: '',
    prop: 'max_amount'
  },
  min_win_amount: {
    type: 'input',
    placeholder: '结算最低金额',
    value: '',
    prop: 'min_win_amount'
  },
  max_win_amount: {
    type: 'input',
    placeholder: '结算最高金额',
    value: '',
    prop: 'max_win_amount'
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  game_sys_sign: '',
  lebal: '',
  tc_id: '',
  status: '',
  date: '',
  username: '',
  min_amount: '',
  max_amount: '',
  min_win_amount: '',
  max_win_amount: '',
  user_level: '',
  gb_sn: '',
  export: 0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }
const total_amount = ref(0)
const total_win_amount = ref(0)
//首次需要加载的接口
init();
function init() {
  pagination.export = 0;
  gamebetList(pagination).then((res: any) => {
    // console.log(res,"----------------")
    if (res.code == 1) {
      tableData.dataList = res.data
      pagination.total = res.total
      total_amount.value = res.total_bets_money;
      total_win_amount.value = res.total_bets_gb_winprice;
      const game_third = res.game_third
      const arr = [];
      for (const key in game_third) {
        arr.push({ label: game_third[key], value: key })
      }
      listbox.list.tc_id.options = arr
      listbox.list.user_level.options = res.user_level
      // pagination.page = res.data.current_page
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
//搜索
const handleSerch = () => {
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] = time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
  init();
}
//导出
const handleExport = () => {
  pagination.export = 1;
  gamebetList(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
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
    prop: 'tc_name'
  }, {
    type: 'input',
    label: '平台代号',
    placeholder: '平台代号',
    tip: '三方平台代号，用于代码继承规则，全大写无特殊字符,技术员修改',
    value: '',
    prop: 'tc_code'
  }, {
    type: 'input',
    label: 'API前缀',
    placeholder: 'API前缀',
    tip: '三方平台API前缀',
    value: '',
    prop: 'tc_api_urlpre'
  }, {
    type: 'input',
    label: '平台私钥',
    placeholder: '平台私钥',
    tip: '三方平台私钥',
    value: '',
    prop: 'tc_api_prikey'
  }, {
    type: 'input',
    label: '签名密钥',
    placeholder: '签名密钥',
    tip: '三方平台签名密钥，有些平台签名密钥为独立的',
    value: '',
    prop: 'tc_api_signkey'
  }, {
    type: 'input',
    label: '平台唯一标识',
    placeholder: '平台唯一标识',
    tip: '本平台在三方平台的唯一标识，比如商户号',
    value: '',
    prop: 'tc_tag'
  }, {
    type: 'input',
    label: 'TOKEN',
    placeholder: 'TOKEN',
    tip: '三方平台API验证TOKEN',
    value: '',
    prop: 'tc_token'
  }, {
    type: 'input',
    label: 'TOKEN有效期',
    placeholder: 'TOKEN有效期',
    tip: '三方平台token有效时间（秒）',
    value: '',
    prop: 'tc_tokentime'
  }, {
    type: 'input',
    label: '分佣规则',
    placeholder: '分佣规则',
    tip: 'json，代理分佣规则设置,由分佣方法使用',
    value: '',
    prop: 'max_amount'
  }, {
    type: 'input',
    label: '货币',
    placeholder: '货币',
    tip: '三方平台货币单位，必须填写，请填写与三方平台接口要求的货币字估完全一致的字符串，区分大小写',
    value: '',
    prop: 'max_amount'
  }, {
    type: 'input',
    label: '汇率',
    placeholder: '汇率',
    tip: '本平台与三方平台的币值汇率，以本平台为1',
    value: '',
    prop: 'max_amount'
  }, {
    type: 'input',
    label: '最低投注',
    placeholder: '最低投注',
    tip: '三方游戏最低投注',
    value: '',
    prop: 'max_amount'
  }, {
    type: 'input',
    label: '最高投注',
    placeholder: '最高投注',
    tip: '三方游戏最高投注',
    value: '',
    prop: 'max_amount'
  }, {
    type: 'radio',
    value: 1,
    label: '狀態',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  }, {
    type: 'slot',
    name: 'upload',
    label: '平台图标图标',
    prop: 'upload'
  }, {
    type: 'input',
    label: '排序',
    placeholder: '排序',
    tip: '排序，越大排越前面',
    value: '',
    prop: 'max_amount'
  },
]
const dialogModel = reactive({
  username: '',
  sort: '',
  min_amount: '',
  max_amount: ''
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
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />

    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"
      :list="listbox.list" />
    <div class="flex-bc line-box">
      <div>
        <el-tag type="success">{{ $t('总投注') }}: {{ total_amount }}</el-tag>
        <el-tag type="danger">{{ $t('总结算') }}: {{ total_win_amount }}</el-tag>
      </div>
      <div class="flex-fi" />
    </div>
    <commDialog title="基础信息" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules"
      :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template v-slot:upload>
        <uploadImage :limit="1" />
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #gb_winlose="{ row }">
        <el-tag size="small" type="info" v-if="row.gb_winlose == 0">{{ $t('无效') }}</el-tag>
        <el-tag size="small" type="warning" v-if="row.gb_winlose == 1">{{ $t('未结算') }}</el-tag>
        <el-tag size="small" type="danger" v-if="row.gb_winlose == 2">{{ $t('输') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.gb_winlose == 3">{{ $t('赢') }}</el-tag>
        <el-tag size="small" v-if="row.gb_winlose == 4">{{ $t('平') }}</el-tag>
      </template>
    </pure-table>
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>

  </div>
</template>
<style scoped lang="scss">
.btmNav {
  padding-top: 10px;
}

.line-box {
  margin: 10px 0;
}
</style>
