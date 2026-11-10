<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
// @ts-ignore
import eidtSuper from "@/components/user/eidtSuper.vue";
import Eidit from "@/components/user/Eidit.vue";
import EiditRemark from "@/components/user/EiditRemark.vue";
import EiditScore from "@/components/user/EiditScore.vue";
import Dest from "@/components/user/Dest.vue";
import { userList, addUser, editDetail, userEditSave, userRecedit } from "@/api/user";
import { message } from "@/utils/message";
import { useI18n } from "vue-i18n";
import { $t, transformI18n } from "@/plugins/i18n";
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
    fixed: "left",
    width: 50,
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
  {
    label: t("上级用户"),
    prop: "rec_name",
    width: 150,
    cellRenderer: ({ row }) => (
      <>
        <div class="flex items-center" v-show={row.rec_id} onClick={() => handleEidtSuper(row)}>
          <div class="el-link2"  >
            {row.rec_name}
          </div>
          <iconify-icon-online icon="material-symbols:edit-outline-sharp" />
        </div>
      </>
    )
  },
  {
    label: t("标签信息"),
    width: 180,
    slot: 'tag'
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
    label: t("注册时间/注册ip"),
    width: 200,
    slot: "content"
  }, {
    label: t("登录时间/登录ip"),
    width: 200,
    slot: "login"
  },
  // {
  //   label: t("基金余额"),
  //   prop: "live_fund_money"
  // },
  {
    label: t("积分"),
    prop: "integral",
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <div class="flex items-center" onClick={() => handleEditScore(index, row)}>
          <el-link type="primary" v-if={row.id} >
            {row.integral}
          </el-link>
          <iconify-icon-online icon="material-symbols:edit-outline-sharp" />
        </div>
      </>
    )
  },
  {
    label: t("备注"),
    prop: "remark",
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <div class="flex items-center" onClick={() => handleEditRemark(index, row)}>
          <el-link type="primary" v-if={row.id} >
            {row.remark != '' ? row.remark : $t("添加备注")}
          </el-link>
          <iconify-icon-online icon="material-symbols:edit-outline-sharp" />
        </div>
      </>
    )
  },
  {
    label: t("状态"),
    slot: 'status'
  },
  {
    label: t("操作"),
    fixed: "right",
    width: 150,
    slot: 'right'
  }
];



//搜索的数据
const searchList = {
  login_time: {
    type: 'time',
    placeholder: t('注册时间'),
    value: (): Array<string> => {
      return []
    }
  },
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
const eiditShow = ref(false)
const eiditRemarkShow = ref(false)
const eiditScoreShow = ref(false)
const eidt_index = ref(0)

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

//点击节流  用户编辑操作
const UserItem = ref<object>({});
const ajaxTrue = ref(false);
const handleEdit = (index: number, row) => {
  if (ajaxTrue.value) return;
  ajaxTrue.value = true;
  editDetail({ id: row.id }).then((res: any) => {
    if (res.code == 1) {
      UserItem.value = res.data;
      eiditShow.value = true;
    }
    ajaxTrue.value = false;
  })
};

const handleEditRemark = (index, row) => {

  UserItem.value = row;
  eiditRemarkShow.value = true;
  eidt_index.value = index;
};

const handleEditScore = (index, row) => {
  UserItem.value = row;
  eiditScoreShow.value = true;
  eidt_index.value = index;
};

//编辑保存
const EidtBtnaddSave = (res) => {
  const { qh, phone, is_check_phone, mail, real_name, limit_min, limit_max, id, limit_sum_max, level_id, remark, userTagIds } = res;
  const query = {
    id,
    new_password: res.password,
    withdrawal_pwd: res.withdrawal_psd,
    is_check_phone,
    phone,
    qh,
    mail,
    real_name,
    limit_min,
    limit_max,
    limit_sum_max,
    lebal: res.userLabel.value,
    level_id,
    status: res.userStuts.value,
    remark,
    userTagIds,
    sc_date: res.account.value

  }
  userEditSave(query).then((res: any) => {
    if (res.code == 1) {
      eiditShow.value = false
      init()
      message(res.msg, { type: 'success' });
    }
  })
}
//编辑保存
const EidtBtnScoreSave = (res) => {
  const { id, integral } = res;
  const query = {
    id,
    integral
  }
  userEditSave(query).then((res: any) => {
    if (res.code == 1) {
      eiditScoreShow.value = false
      tableData.dataList[eidt_index.value].integral = integral
      message(res.msg, { type: 'success' });
    }
  })
}

//编辑保存
const EidtBtnRemarkSave = (res) => {
  const { id, remark } = res;
  const query = {
    id,
    remark
  }
  userEditSave(query).then((res: any) => {
    if (res.code == 1) {
      eiditRemarkShow.value = false
      tableData.dataList[eidt_index.value].remark = remark
      message(res.msg, { type: 'success' });
    }
  })
}

//修改上级打开控制
const eidtSuperShow = ref(false)
//修改上级
const eidtSuperId = ref('');
const handleEidtSuper = (row) => {
  eidtSuperShow.value = true;
  eidtSuperId.value = row.id;
}
//修改上级 保存
const btnEidtSuperSave = (value) => {
  const query = {
    edit: true,
    info: {
      id: eidtSuperId.value,
      rec_id: value.top_code
    }
  }
  userRecedit(query).then((res: any) => {
    if (res.code == 1) {
      eidtSuperShow.value = false
      message(res.msg, { type: 'success' });
    }
  })
}
//修改上级关闭
const eidtCloseSuper = () => {
  eidtSuperShow.value = false;
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <!---添加用户弹出-->
    <component :is="Dest" @handleClose="dialogTableVisible = false" :title="t('添加用户')"
      :dialogTableVisible="dialogTableVisible" @btnSave="btnaddSave" />
    <!--修改上级推广码-->
    <component :is="eidtSuper" :title="t('编辑')" :dialogTableVisible="eidtSuperShow" @btnSave="btnEidtSuperSave"
      @handleClose="eidtCloseSuper" />
    <!--用户编辑-->
    <component :is="Eidit" @handleClose="eiditShow = false" :title="t('编辑用户')" :item="UserItem"
      :dialogTableVisible="eiditShow" @btnSave="EidtBtnaddSave" />

    <component :is="EiditRemark" @handleClose="eiditRemarkShow = false" :title="t('编辑备注')" :item="UserItem"
      :dialogTableVisible="eiditRemarkShow" @btnSave="EidtBtnRemarkSave" />

    <component :is="EiditScore" @handleClose="eiditScoreShow = false" :title="t('积分修改')" :item="UserItem"
      :dialogTableVisible="eiditScoreShow" @btnSave="EidtBtnScoreSave" />

    <commSerach @export="handleExport" @search="handleBtn" @currentChange="selectChange"
      :list="searchListBox.searchList" />
    <div class="btnlist">
      <el-button type="primary" :plain="btnCurrent == index ? false : true" v-for="(item, index) in btnlist"
        :key="index" @click="handleBtnItem(item, index)">{{ item.name }}</el-button>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #content="{ row }">
        <p>{{ row.add_time }}</p>
        <div>{{ row.reg_ip }} - {{ t(row.reg_area) }}</div>
      </template>
      <template #login="{ row }">
        <p>{{ row.login_time }}</p>
        <div>{{ row.end_login_ip }} - {{ t(row.end_login_area) }}</div>
      </template>
      <template #tag="{ row }">
        <div>{{ t("标签") }}:
          <el-tag size="small" :type="row.lebal === 1 ? 'success' : 'danger'" effect="plain">
            {{ t(row.lebal === 1 ? "一般" : "测试") }}
          </el-tag>
          <el-tag v-for="tag, idx in row.tags" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''"
            :type="tag.color ? '' : 'success'" :key="idx">
            {{ t(tag.name) }}
          </el-tag>
        </div>
        <div>{{ t('邀请码') }}:{{ row.rec_code }}</div>
        <div>{{ t('会员等级') }}:{{ row.level_name }}</div>
        <div>{{ t('级别') }}:{{ row.tree_level }}{{ t('级代理') }}</div>
      </template>
      <template #status="{ row }">
        <el-tag v-if="row.status == 1" size="small" type="success">{{ t('启用') }}</el-tag>
        <el-tag v-else type="danger" size="small">{{ t('禁用') }}</el-tag>
      </template>
      <template #right="{ index, row }">
        <el-button type="primary" size="small" @click="handleEdit(index, row)">
          {{ t('修改') }}
        </el-button>
        <el-button size="small" type="warning" @click="showUserInfo(row.id)">
          {{ t('资料') }}
        </el-button>
        <el-button style="margin-top:10px" size="small" type="success" @click="handleEidtSuper(row)">
          {{ t('修改上级') }}
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
