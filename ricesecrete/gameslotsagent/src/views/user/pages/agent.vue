<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
// import userSelected from  '@/components/user/userSelected.vue'
import { agentList } from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import { copyContent } from "@/utils/global";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { http } from "@/utils/http";
defineOptions({
  name: 'agentList'
})
const { t } = useI18n();
const { proxy } = getCurrentInstance();

const columns = [//TableColumnList
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left",
    width: 60,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  }, {
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
  },
  {
    label: t("标签信息"),
    width: 200,
    cellRenderer: ({ index, row }) => (
      <>
        <div>{t('用户标签')}:{row.lebal == 1 ? t('一般') : t('测试')}</div>
        <div>{t('邀 请 码')}:{row.rec_code}</div>
        <div>{t('会员等级')}:{row.level_name}</div>
        <div>{t('级别')}:{row.tree_level}{t('级代理')}</div>
      </>
    )
  },
  {
    label: t("余额"),
    prop: "balance",
    width: 100,
  },
  {
    label: t("总充值"),
    prop: "recharge",
    width: 100,
  },
  {
    label: t("总提现"),
    prop: "withdraw",
    width: 100,
  },
  {
    label: t("推广链接"),
    slot: "rec_url",
    width: 250
  },
  {
    label: t("访问人数"),
    prop: "rec_click",
    width: 100
  },
  {
    label: t("代理类型"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag size="small" type="success">{row.type == 0 ? t('外部代理') : t('内部代理')}</el-tag>
        <el-tag v-show={row.type == 1} size="small" type="danger">{t('返佣比例')}:{row.rate}%</el-tag>
      </>
    )
  },  {
    label: t("客服链接"),
    prop: "service_url",
    width: 150
  },{
    label: t("状态"),
    slot: "status",
  },
  // == 1?'待审核':row.status == 2?'未通过':'已通过'
  {
    label: t("操作"),
    fixed: "right",
    slot: 'right',
  }
];

//搜索的数据
const searchList = {
  username: {
    type: 'input',
    placeholder: t('用户名/邮箱/手机号'),
    value: '',
    prop: 'username'
  },
  rec_code: {
    type: 'input',
    placeholder: t('推广码'),
    value: '',
    prop: 'rec_code'
  },
  rec_id: {
    type: 'input',
    placeholder: t('上级uid/推广码'),
    value: '',
    prop: 'rec_id'
  },
  // like_all_next: {
  //   type: 'select',
  //   placeholder: '包含下级会员',
  //   value: '',
  //   prop: 'like_all_next',
  //   options: [
  //     {
  //       value: '0',
  //       label: '否',
  //     },
  //     {
  //       value: '1',
  //       label: '是',
  //     }
  //   ]
  // },
  // type: {
  //   type: 'select',
  //   placeholder: '代理类型',
  //   value: '',
  //   prop: 'type',
  //   options: [
  //     {
  //       value: '0',
  //       label: '外部代理',
  //     },
  //     {
  //       value: '1',
  //       label: '内部代理',
  //     }
  //   ]
  // },
  status: {
    type: 'select',
    placeholder: t('审核状态'),
    value: '',
    prop: 'status',
    options: [
      {
        value: '1',
        label: t('待审核'),
      }, {
        value: '2',
        label: t('已审核'),
      }, {
        value: '3',
        label: t('已通过'),
      },
    ]
  },
  register_time: {
    type: 'time',
    placeholder: '注册时间',
    value: (): Array<string> => {
      return []
    }
  },
  search: {
    type: 'button',
    value: t('搜索'),
    handle: 'search',
    prop: 'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export',
  }
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username: '',//id 推广码 用户名 精确搜索
  rec_code: '',//用户名 手机号 邮箱 模糊搜索
  status: '',//用户标签
  rec_id: '',//代理id 推广码 用户名
  like_all_next: '',//是否包含下级数据
  register_time: '',//注册时间
  type: '',//代理类型
  export: 0,
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pagination.export = 0;
  agentList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
  })
}

//导出
const handleExport = () => {
  pagination.export = 1;
  agentList(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    }
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

//下拉选择返回的数据
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  pagination[index] = value
}

//点击确定
const handleSerch = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}

const handleEdit = (row) => {
  for (const key in dialogList) {
    list2Box.dialogList[key].value = row[key]
    list2Box.dialogList[key].show = true
    dialogModel[key] = row[key]
  }

  list2Box.dialogList.rate.show = false
  list2Box.dialogList.status.show = false
  list2Box.dialogList.service_url.show = false
  list2Box.dialogList.phone.show = false
  list2Box.dialogList.phone.disable = true
  list2Box.dialogList.mail.show = false
  list2Box.dialogList.mail.disable = true
  dialogModel.id = row.id
  visible.value = true;
};
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}


//弹框写法
const visible = ref(false);
const dialogList = {
  username: {
    type: 'input',
    label: t('代理账户'),
    placeholder: t('代理账户'),
    value: '',
    prop: 'username',
    disable: false,
    show: false,
  },
  password: {
    type: 'input',
    label: t('密码'),
    placeholder: t('密码'),
    value: '',
    prop: 'password',
    show: false,
  },
  qh: {
    type: 'input',
    label: t('区号'),
    placeholder: t('区号'),
    value: '',
    prop: 'qh',
    show: false,
  },
  phone: {
    type: 'input',
    label: t('手机号码'),
    placeholder: t('手机号码'),
    value: '',
    prop: 'phone',
    disable: false,
    show: false,
  },
  mail: {
    type: 'input',
    label: t('邮箱'),
    placeholder: t('邮箱'),
    value: '',
    prop: 'mail',
    disable: false,
    show: false,
  },
  real_name: {
    type: 'input',
    label: t('真实姓名'),
    placeholder: t('真实姓名'),
    value: '',
    prop: 'real_name',
    show: false,
  },
  rate: {
    type: 'input',
    label: t('返佣比例'),
    placeholder: t('返佣比例'),
    tip: '单位:百分比, 例如:50=50%',
    value: '',
    prop: 'rate',
    show: false,
  },
  service_url: {
    type: 'input',
    label: t('客服链接'),
    placeholder: t('客服链接'),
    value: '',
    prop: 'service_url',
    show: false,
  },
  status: {
    type: 'radio',
    value: 3,
    label: t('代理状态'),
    prop: 'status',
    show: false,
    options: [
      {
        label: 3,
        name: t('开启')
      },
      {
        label: 2,
        name: t('禁用')
      }
    ],
  },
}
const dialogModel = reactive({
  id: '',
  username: '',
  password: '',
  qh: '',
  phone: '',
  mail: '',
  real_name: '',
  status: '',
  service_url: '',
  rate: '',
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

//保存
const handleSave = () => {
  http.post(clickCurrentIndex.value == 2 ? '/user_agent/add' : '/user_agent/edit', {
    data: {
      add: true,
      info: dialogModel
    }
  }).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      visible.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const copy = (val) => {
  copyContent(val)
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <commDialog :title="t('编辑')" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="handleSave"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"
      :list="searchListBox.searchList" />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #content="{ row }">
        <span v-html="row.reg_ip" />
      </template>
      <template #rec_url="{ row }">
        <span>{{ row.rec_url }}</span>
        <span class="copy">
          <iconify-icon-online @click="copy(row.rec_url)" icon="material-symbols:content-copy-outline" />
        </span>
      </template>
      <template #status="{ row }">
        <el-tag size="small" v-if="row.status == 1" type='warning'>{{ t('待审核') }}</el-tag>
        <el-tag size="small" v-else-if="row.status == 2" type='danger'>{{ t('未通过') }}</el-tag>
        <el-tag size="small" v-else type='success'>{{ t('已通过') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" type="primary" @click="handleEdit(row)">{{ $t('编辑') }}</el-button>
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
<style scoped>
.btmNav {
  padding-top: 10px;
}

.line-box {
  margin-bottom: 10px;
}

.copy {
  display: inline-block;
  cursor: pointer;
  margin-left: 3px;
  color: blue;
}
</style>
