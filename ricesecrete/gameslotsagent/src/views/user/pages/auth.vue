<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
// @ts-ignore
import Dest from "@/components/user/Dest.vue";
import { userList, addUser,authUser } from "@/api/user";
import { message } from "@/utils/message";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { info } from "console";
defineOptions({
  name: "userList",
});
const { t } = useI18n();
//点击节流  用户编辑操作
const dataList: any = [];
const tableData = reactive({ dataList });
const columns = [//TableColumnList
  {
    label: transformI18n("UID"),
    prop: "id",
    fixed: "left"
  }, {
    label: t("用户账号"),
    prop: "username",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        {/* <p title={row.username} style="white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{row.username}</p> */}
        <div onClick={() => showUserInfo(row.id)}>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.phone}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.mail}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.mail}</p>
          </div>
        </div>
      </>
    )
  },
  // {
  //   label: t("标签信息"),
  //   width: 180,
  //   slot: 'tag'
  // },
  // {
  //   label: t("上级用户"),
  //   prop: "rec_name",
  //   width: 150,
  //   cellRenderer: ({ row }) => (
  //     <>
  //       <div class="el-link2" v-if={row.rec_id} onClick={() => showUserInfo(row.rec_id)}>
  //         {row.rec_name}
  //       </div>
  //     </>
  //   )
  // },
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
    label: t("积分"),
    prop: "integral",
    width: 100,
  },
  {
    label: t("充值状态"),
    slot: 'deposit_status'
  },
  {
    label: t("提现状态"),
    slot: 'withdrawal_status'
  },
  {
    label: t("下注状态"),
    slot: 'bet_status'
  },
  // {
  //   label: t("状态"),
  //   slot: 'status'
  // },
  {
    label: t("操作"),
    fixed: "right",
    width: 150,
    slot: 'right'
  }
];



//搜索的数据
const searchList = {
  username: {
    type: 'input',
    placeholder: t('精准:id/推广码/手机号/邮箱'),
    value: ''
  },
  name: {
    type: 'input',
    placeholder: t('模糊:手机号/邮箱'),
    value: ''
  },
  rec_id: {
    type: 'input',
    placeholder: t('上级uid/推广码'),
    value: ''
  },
  like_all_next: {
    type: 'select',
    placeholder: '包含下级会员',
    value: '',
    options: [
      {
        value: '0',
        label: '否',
      },
      {
        value: '1',
        label: '是',
      }
    ]
  },
  lebals: {
    type: 'select',
    placeholder: t('用户标签'),
    value: '',
    options: []
  },
  logins: {
    type: 'select',
    placeholder: t('所有用户'),
    value: '',
    options: [
      {
        value: '2',
        label: t('二天前登录'),
      }, {
        value: '7',
        label: t('七天前登录'),
      }, {
        value: '15',
        label: t('半月前登录'),
      },
    ]
  },
  level: {
    type: 'select',
    placeholder: t('VIP等级'),
    value: '',
    options: []
  },
  end_login_ip: {
    type: 'input',
    placeholder: t('登录/注册ip'),
    value: ''
  },
  login_time: {
    type: 'time',
    placeholder: t('注册时间'),
    value: (): Array<string> => {
      return []
    }
  },
  is_recharge: {
    type: 'select',
    placeholder: t('是否充值'),
    value: '',
    options: [
      {
        value: '1',
        label: t('是'),
      }, {
        value: '0',
        label: t('否'),
      },
    ]
  },
  first: {
    type: 'select',
    placeholder: t('充值类型'),
    value: '',
    options: [
      {
        value: '1',
        label: t('首充'),
      }, {
        value: '2',
        label: t('复充'),
      },
    ]
  },
  search: {
    type: 'button',
    value: t('搜索'),
    handle: 'search',
    prop: 'search',
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
  order: 'desc',//排序 desc 或 asc
  field: 'id',//排序字段 id 或 balance
  username: '',//id 推广码 用户名 精确搜索
  name: '',//用户名 手机号 邮箱 模糊搜索
  lebals: '',//用户标签
  level: '',//用户等级
  logins: '',
  is_recharge: '',//是否充值
  end_login_ip: '',//登录 注册ip
  rec_id: '',//代理id 推广码 用户名
  first: '',//充值类型
  like_all_next: '',//是否包含下级数据
  export: 0,
  login_time: ''//注册时间
});

//获取列表数据
init();
function init(query?: object) {
  userList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    searchListBox.searchList.level.options = res.user_level;
    searchListBox.searchList.lebals.options = res.tags;
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
const selectChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  pagination.username = searchListBox.searchList['username'].value + '';
  pagination.name = searchListBox.searchList['name'].value + '';
  pagination.rec_id = searchListBox.searchList['rec_id'].value + '';
  pagination.lebals = searchListBox.searchList['lebals'].value + '';
  pagination.logins = searchListBox.searchList['logins'].value + '';
  pagination.level = searchListBox.searchList['level'].value + '';
  pagination.end_login_ip = searchListBox.searchList['end_login_ip'].value + '';
  pagination.like_all_next = searchListBox.searchList['like_all_next'].value + '';
  if (searchListBox.searchList['login_time'].value === null) {
    searchListBox.searchList['login_time'].value = []
  }
  const starTime = searchListBox.searchList['login_time'].value[0] ? searchListBox.searchList['login_time'].value[0] : ''
  const endTime = searchListBox.searchList['login_time'].value[1] ? searchListBox.searchList['login_time'].value[1] : ''
  if (starTime) {
    pagination.login_time = starTime + ' - ' + endTime + '';
  } else {
    pagination.login_time = ''
  }
  pagination.is_recharge = searchListBox.searchList['is_recharge'].value;
  pagination.first = searchListBox.searchList['first'].value;
  init(pagination);
}

//导出
const handleExport = () => {
  pagination.export = 1;
  userList(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    }
  })
}

//按钮列表
const btnlist = [
  // {
  //   name: t('添加'),
  //   type: 'primary',
  //   ty:'add'
  // },
]

const dialogTableVisible = ref(false)

//点击添加这行得按钮
const currentTy = ref('');
const btnCurrent = ref(-1)
const handleBtnItem = (item, index) => {
  btnCurrent.value = index
  currentTy.value = item.ty;
  switch (item.ty) {
    case 'add':
      dialogTableVisible.value = true;
      break;
  }
}

//点击天机用户
const btnaddSave = (item) => {
  const { username, mail, phone, real_name, password, top_code, remark, agent, agent_type, userLabel, userStuts, rate } = item;//email,
  const query = {
    username,
    mail,
    phone,
    real_name,
    password,
    top_code,
    remark,
    rate,
    is_agent: agent ? 1 : 0,
    lebal: userLabel.value,
    status: userStuts.value,
    agent_type: agent_type.value
  }
  addUser(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      dialogTableVisible.value = false;
    }
  })

}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

const handleStatus1 = (row, key) => {
  const query = {
    edit: true,
    info: {
      id: row.id,
    }
  }
  query.info[key] = row[key];
  // console.log(query);
  authUser(query).then((res: any) => {
    console.log(res)
    if(res.code==1){
      message(res.msg, { type: 'success' });
      // init();
    }
    // init(pagination);
  })
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <!---添加用户弹出-->
    <component :is="Dest" @handleClose="dialogTableVisible = false" :title="t('添加用户')"
      :dialogTableVisible="dialogTableVisible" @btnSave="btnaddSave" />
    <commSerach @export="handleExport" @search="handleBtn" @currentChange="selectChange"
      :list="searchListBox.searchList" />
    <div class="btnlist">
      <el-button type="primary" :plain="btnCurrent == index ? false : true" v-for="(item, index) in btnlist"
        :key="index" @click="handleBtnItem(item, index)">{{ item.name }}</el-button>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #content="{ row }">
        <p>{{ row.add_time }}</p>
        <span v-html="$t(row.reg_ip)" />
      </template>
      <template #deposit_status="{ row }">
        <el-switch @click="handleStatus1(row,'deposit_status')"
                  size="large"
                    v-model="row.deposit_status"
                    :active-value="1"
                    :inactive-value="0"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('关闭')"
          />
      </template>
      <template #withdrawal_status="{ row }">
        <el-switch @click="handleStatus1(row,'withdrawal_status')"
                  size="large"
                    v-model="row.withdrawal_status"
                    :active-value="1"
                    :inactive-value="0"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('关闭')"
          />
      </template>
      <template #bet_status="{ row }">
        <el-switch @click="handleStatus1(row,'bet_status')"
                  size="large"
                    v-model="row.bet_status"
                    :active-value="1"
                    :inactive-value="0"
                    :inline-prompt="true"
                    :active-text="$t('开启')"
                    :inactive-text="$t('关闭')"
          />
      </template>
      <template #right="{ row }">
        <el-button size="small" type="warning" @click="showUserInfo(row.id)">
          {{ $t('资料') }}
        </el-button>
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
.userEidt {
  padding: 30px;

  .item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .name {
      width: 100px;
      text-align: right;
      margin-right: 20px;
    }
  }
}

.btmNav {
  padding-top: 10px;
}

.btnlist {
  display: flex;

  margin-bottom: 15px;
}
</style>
