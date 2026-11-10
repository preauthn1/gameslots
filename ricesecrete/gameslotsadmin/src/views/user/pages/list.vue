<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
// @ts-ignore
import Dest from "@/components/user/Dest.vue";
import EiditRemark from "@/components/user/EiditRemark.vue";
import EiditScore from "@/components/user/EiditScore.vue";
// @ts-ignore
import eidtSuper from "@/components/user/eidtSuper.vue";
import { userList, addUser, editDetail, userEdit, userStatus, userRecedit, userRemoveWater, userVipEdit, resetVip } from "@/api/user";
import { message } from "@/utils/message";
import { hasAuth } from "@/router/utils";
// @ts-ignore
import Eidit from "@/components/user/Eidit.vue";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { useDataLoad } from "@/components/table/dataLoad";
defineOptions({
  name: "userList",
});
const { t } = useI18n();
const { proxy } = getCurrentInstance();
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/user/list');
const emit = defineEmits(['backSelect'])
const props = defineProps({
  back: Boolean,
  field: Number,
})
//点击节流  用户编辑操作
const UserItem = ref<object>({});
const tableData = reactive({ dataList });
const ajaxTrue = ref(false);

const eiditRemarkShow = ref(false)
const eiditScoreShow = ref(false)
const eidt_index = ref(0)
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
//修改上级打开控制
const eidtSuperShow = ref(false)
//修改上级
const eidtSuperId = ref('');
const eidtSuperIndex = ref(0);
const handleEidtSuper = (index: number, row) => {
  eidtSuperShow.value = true;
  eidtSuperId.value = row.id;
  eidtSuperIndex.value = index;
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
    // console.log(res);
    if (res.code == 1) {
      // dataList[eidtSuperIndex.value].rec_name =
      eidtSuperShow.value = false
      message(res.msg, { type: 'success' });
    }
  })
}
//修改上级关闭
const eidtCloseSuper = () => {
  eidtSuperShow.value = false;
}
//点击编辑获取用户数据
//点击启用用户
function statusEditfn(item) {
  const query = {
    status: item.status == 1 ? 0 : 1,
    id: item.id
  }
  userEdit(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      item.status = query.status
    }
  })
}
const useEnable = (item) => {
  // console.log(item);
  proxy.$confirm(t('确认设置吗？'), t('信息')).then(() => {
    statusEditfn(item);
  }).catch(() => {

  })
}
const columns: TableColumnList = [
  {

    type: "selection",
    align: "left",
    fixed: "left",

  },
  {
    label: transformI18n("UID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  }, {
    headerRenderer: () => transformI18n("用户账号"),
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
    headerRenderer: () => transformI18n("标签信息"),
    width: 180,
    slot: 'tag'
  },
  {
    headerRenderer: () => transformI18n("代理"),
    prop: "rec_id",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        <div v-show={row.rec_top_user_id} >
          {transformI18n("总代")}: <span class="el-link2" onClick={() => showUserInfo(row.rec_top_user_id)}>{row.rec_top_user}</span>
        </div>
        <div v-show={row.rec_id} >
          {transformI18n("上级")}: <span class="el-link2" onClick={() => showUserInfo(row.rec_id)}>{row.rec_name}</span>
        </div>
      </>
    )
  },
  {
    headerRenderer: () => transformI18n("三方余额"),
    prop: "thirds_balance",
    width: 120,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("余额"),
    prop: "balance",
    width: 100,
    sortable: true
  },
  {
    headerRenderer: () => transformI18n("总充值"),
    prop: "recharge",
    width: 100,
  },
  {
    headerRenderer: () => transformI18n("总提现"),
    prop: "withdraw",
    width: 100,
  },
  {
    label: t("积分"),
    prop: "integral",
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <el-link type="primary" v-if={row.id} onClick={() => handleEditScore(index, row)}>
          {row.integral}
        </el-link>
      </>
    )
  },
  {
    label: t("备注"),
    prop: "remark",
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <el-link type="primary" v-if={row.id} onClick={() => handleEditRemark(index, row)}>
          {row.remark != '' ? row.remark : t("添加备注")}
        </el-link>
      </>
    )
  },
  {
    headerRenderer: () => transformI18n("注册时间/注册ip"),
    width: 200,
    slot: "content"
  }, {
    headerRenderer: () => transformI18n("登录时间/登录ip"),
    width: 200,
    slot: "login"
  },
  {
    headerRenderer: () => transformI18n("状态"),
    slot: 'status'
  },
  {
    headerRenderer: () => transformI18n("操作"),
    fixed: "right",
    width: 150,
    slot: 'right'
  }
];

//搜索的数据
const searchList = {
  username: {
    type: 'input',
    placeholder: '精准:id/推广码/手机号/邮箱',
    value: ''
  },
  name: {
    type: 'input',
    placeholder: '模糊:手机号/邮箱',
    value: ''
  },
  rec_id: {
    type: 'input',
    placeholder: '上级uid/推广码',
    value: ''
  },
  has_line_id: {
    type: 'select',
    placeholder: '有无lineID',
    value: '',
    options: [
      {
        value: '0',
        label: '无',
      },
      {
        value: '1',
        label: '有',
      }
    ]
  },
  phone_bind_status: {
    type: 'select',
    placeholder: '号码状态',
    value: '',
    options: [
      {
        value: '0',
        label: '无',
      },
      {
        value: '1',
        label: '已验证',
      },
      {
        value: '2',
        label: '未验证',
      }
    ]
  },
  mail_bind_status: {
    type: 'select',
    placeholder: '邮箱状态',
    value: '',
    options: [
      {
        value: '0',
        label: '无',
      },
      {
        value: '1',
        label: '已验证',
      },
      {
        value: '2',
        label: '未验证',
      }
    ]
  },
  line_id: {
    type: 'input',
    placeholder: 'line_id',
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
  rec_top_id: {
    type: 'input',
    placeholder: '总代uid/推广码',
    value: ''
  },
  lebals: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    options: []
  },
  logins: {
    type: 'select',
    placeholder: '所有用户',
    value: '',
    options: [
      {
        value: '2',
        label: '二天前登录',
      }, {
        value: '7',
        label: '七天前登录',
      }, {
        value: '10',
        label: '十天前登录',
      }, {
        value: '15',
        label: '半月前登录',
      },
    ]
  },
  level: {
    type: 'select',
    placeholder: 'VIP等级',
    value: '',
    options: []
  },
  end_login_ip: {
    type: 'input',
    placeholder: '登录/注册ip',
    value: ''
  },
  end_ip_count: {
    type: 'input',
    placeholder: '登录ip数量，支持区间',
    value: ''
  },
  login_time: {
    type: 'time',
    placeholder: '注册时间',
    value: (): Array<string> => {
      return []
    }
  },
  is_recharge: {
    type: 'select',
    placeholder: '是否充值',
    value: '',
    options: [
      {
        value: '1',
        label: '是',
      }, {
        value: '0',
        label: '否',
      },
    ]
  },
  is_withdrawal: {
    type: 'select',
    placeholder: '是否提现',
    value: '',
    options: [
      {
        value: '1',
        label: '是',
      }, {
        value: '0',
        label: '否',
      },
    ]
  },
  first: {
    type: 'select',
    placeholder: '充值类型',
    value: '',
    options: [
      {
        value: '1',
        label: '首充',
      }, {
        value: '2',
        label: '复充',
      },
    ]
  },
  min_recharge: {
    type: 'input',
    placeholder: '最低充值',
    value: '',
    prop: 'min_recharge'
  },
  max_recharge: {
    type: 'input',
    placeholder: '最高充值',
    value: '',
    prop: 'max_recharge'
  },
  is_join_activity: {
    type: 'select',
    placeholder: '是否参与活动',
    value: '',
    options: [
      {
        value: '1',
        label: '是',
      }, {
        value: '0',
        label: '否',
      },
    ]
  },
  activity_type: {
    type: 'select',
    placeholder: '活动类型',
    value: '',
    options: []
  },
  search: {
    type: 'button',
    value: '搜索',
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

const queryParams = reactive({
  username: '',//id 推广码 用户名 精确搜索
  name: '',//用户名 手机号 邮箱 模糊搜索
  lebals: '',//用户标签
  level: '',//用户等级
  logins: '',
  end_login_ip: '',//登录 注册ip
  rec_id: '',//代理id 推广码 用户名
  like_all_next: '0',
  login_time: '',//注册时间
  first: '',//充值类型
  export: 0,
  rec_top_id: '',
  order: '',//排序 desc 或 asc
  end_ip_count: '',//登录ip数量
  field: '',
  select_all_user: '',//是否是选择所有用户
  is_join_activity: '',//是否参与活动
  activity_type: '',//活动类型
  min_recharge: '',//最低充值
  max_recharge: '',//最高充值
  is_recharge: '',//是否充值
  is_withdrawal: '',//是否提现
  has_line_id: '',//有无lineID
  line_id: '',
  phone_bind_status: '',//号码状态
  mail_bind_status: '',//邮箱状态
});
const addUserItem = ref<object>({});
//获取列表数据
init();
// 列表回调处理数据
function callback(res) {
  if (queryParams.select_all_user !== '') {
    //选择所有用户
    backSelect(res.data.toString());
  } else {
    searchListBox.searchList.level.options = res.user_level;
    vipList2Box.vipDialogList.vip_id.options = res.user_level;
    searchListBox.searchList.lebals.options = res.tags;
    addUserItem.value = { "checkbox_tags": res.checkbox_tags }
    searchListBox.searchList.activity_type.options = res.activity_type;
  }
}
function init() {
  queryParams.export = 0;
  pagination.currentPage = 1;
  onInitList(queryParams, callback)
}

// 搜索输入框数据变动时触发
const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
  queryParams['select_all_user'] = ''
}

//导出
const handleExport = () => {
  queryParams.export = 1;
  userList(queryParams).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    }
  })
}
//按钮列表
const btnlist = !props.back ? [{
  name: t('添加'),
  type: 'primary',
  ty: 'add'
},
{
  name: t('批量清零流水'),
  type: 'primary',
  ty: 'water'
},
{
  name: t('封禁用户'),
  type: 'danger',
  ty: 'blocked'
},
{
  name: t('解封用户'),
  type: 'primary',
  ty: 'relieve'
},
] :
  [{
    name: t('选择勾选用户'),
    type: 'primary',
    ty: 'back'
  }, {
    name: t('选择所有用户'),
    type: 'primary',
    ty: 'selectAllUser'
  }]

const btnlist2 = btnlist.filter(item => {

  return props.back || hasAuth(item.ty)
})

const dialogTableVisible = ref(false)
const eiditShow = ref(false)

//点击添加这行得按钮
const currentTy = ref('');
const btnCurrent = ref(-1)
const handleBtnItem = (item, index) => {
  btnCurrent.value = index
  currentTy.value = item.ty;
  const username = [];
  switch (item.ty) {
    case 'add':
      dialogTableVisible.value = true;
      break;
    case 'batch':
      selectAll.length > 0 ? selectShow.value = true : message(t('请选择会员'), { type: 'warning' });
      break;
    case 'water':
      handleUserRemoveWater();
      break;
    case 'blocked':
      //封禁用户
      handleUserBlocked();
      break;
    case 'relieve':
      //封禁用户
      handleUserRelieve();
      break;
    case 'back':
      if (selectAll.length <= 0) {
        message(t('请选择会员'), { type: 'warning' });
        return;
      }
      selectAll.forEach((item) => {
        username.push(props.field == 1 ? item.id : item.username);
      })
      backSelect(username.toString());
      break;
    case 'selectAllUser':
      queryParams.select_all_user = props.field == 1 ? 'id' : 'username';//所有用户
      init()
      break;
  }
}

//点击添加用户
const btnaddSave = (item) => {
  const { username, mail, qh, phone, real_name, password, top_code, remark, agent, agent_type, userLabel, userStuts, rate, website_auth, userTagIds } = item;//email,
  const query = {
    username,
    mail,
    qh,
    phone,
    real_name,
    password,
    top_code,
    remark,
    rate,
    is_agent: agent ? 1 : 0,
    lebal: userLabel.value,
    status: userStuts.value,
    website_auth: website_auth.value,
    agent_type: agent_type.value,
    userTagIds,
  }
  addUser(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      dialogTableVisible.value = false;
      init()
    }
  })

}

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
  userEdit(query).then((res: any) => {
    if (res.code == 1) {
      eiditShow.value = false
      init()
      message(res.msg, { type: 'success' });
    }
  })
}

//选择
const selectShow = ref(false)
let selectAll = reactive([])
const handleSelectionChange = (val) => {
  selectAll = val;
}

//批量清零流水
const handleUserRemoveWater = () => {
  if (selectAll.length <= 0) {
    message(t('请选择会员'), { type: 'error' });
    return;
  }
  const s_arr = [];
  selectAll.forEach(item => {
    s_arr.push(item.id)
  })
  const waterQuery = {
    ids: s_arr.join(',')
  }
  userRemoveWater(waterQuery).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
    }
  })
}

//批量禁用用户
const handleUserBlocked = () => {
  proxy.$confirm('确认要批量封禁用户吗？', transformI18n('提示')).then(() => {
    if (selectAll.length <= 0) {
      message(t('请选择会员'), { type: 'error' });
      return;
    }
    const s_arr = [];
    selectAll.forEach(item => {
      s_arr.push(item.id)
    })
    const statusQuery = {
      ids: s_arr,
      status: 0
    }
    userStatus(statusQuery).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })
}
//批量解封用户
const handleUserRelieve = () => {
  proxy.$confirm('确认要批量解封用户吗？', transformI18n('提示')).then(() => {
    if (selectAll.length <= 0) {
      message(t('请选择会员'), { type: 'error' });
      return;
    }
    const s_arr = [];
    selectAll.forEach(item => {
      s_arr.push(item.id)
    })
    const statusQuery = {
      ids: s_arr,
      status: 1
    }
    userStatus(statusQuery).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });

      }
    })
  }).catch(() => {
    console.log('取消');
  })
}
const backSelect = (username) => {
  if (username) {
    emit('backSelect', username);
  } else {
    message(t('请选择会员'), { type: 'error' });
  }
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
const sortChange = (res) => {
  queryParams.field = res.prop;
  if (res.order) {
    queryParams.order = res.order == 'descending' ? 'DESC' : 'ASC';
  } else {
    queryParams.order = '';
  }
  init()
  return false;
}

//修改VIP打开控制
const eidtVipShow = ref(false)
//修改VIP
const handleEidtVip = (row) => {
  vipDialogList['vip_id'].value = row.level_id;
  vipDialogModel.vip_id = row.level_id;
  eidtVipShow.value = true;
  vipDialogModel.id = row.id;
}
//修改VIP保存
const btnEidtVipSave = () => {
  const query = {
    edit: true,
    info: vipDialogModel
  }
  userVipEdit(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      eidtVipShow.value = false;
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//修改VIP
const vipDialogModel = reactive({
  id: '',
  vip_id: '',
})
const vipDialogList = {
  vip_id: {
    type: "select",
    label: "新等级",
    placeholder: "新等级",
    value: '',
    options: [],
    prop: "vip_id",
    show: false
  },
}
const vipList2Box = reactive({ vipDialogList })
const vipHandleDialogChange = ({ value, index }) => {
  vipList2Box.vipDialogList[index].value = value;
  vipDialogModel[index] = value;
}
const vipListRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
//还原VIP
const handleResetVip = (row) => {
  const msg = transformI18n('确认还原VIP到') + row.original_vip_name + '，' + transformI18n('还原后会检测用户升级条件，是否达到下一等级');
  proxy.$confirm(msg, transformI18n('提示')).then(() => {
    const query = {
      id: row.id
    }
    resetVip(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
      selectAll = []
    })
  }).catch(() => {
    console.log('取消');
  })

}

const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
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
const EidtBtnScoreSave = (res) => {
  const { id, integral } = res;
  const query = {
    id,
    integral
  }
  userEdit(query).then((res: any) => {
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
  userEdit(query).then((res: any) => {
    if (res.code == 1) {
      eiditRemarkShow.value = false
      tableData.dataList[eidt_index.value].remark = remark
      message(res.msg, { type: 'success' });
    }
  })
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo = false" />
    <!---添加用户弹出-->
    <component :is="Dest" @handleClose="dialogTableVisible = false" :title="t('添加用户')" :item="addUserItem"
      :dialogTableVisible="dialogTableVisible" @btnSave="btnaddSave" />

    <component :is="EiditRemark" @handleClose="eiditRemarkShow = false" :title="t('编辑备注')" :item="UserItem"
      :dialogTableVisible="eiditRemarkShow" @btnSave="EidtBtnRemarkSave" />

    <component :is="EiditScore" @handleClose="eiditScoreShow = false" :title="t('积分修改')" :item="UserItem"
      :dialogTableVisible="eiditScoreShow" @btnSave="EidtBtnScoreSave" />
    <!--用户编辑-->
    <component :is="Eidit" @handleClose="eiditShow = false" :title="t('编辑用户')" :item="UserItem"
      :dialogTableVisible="eiditShow" @btnSave="EidtBtnaddSave" />
    <!--修改上级推广码-->
    <component :is="eidtSuper" :title="t('编辑')" :dialogTableVisible="eidtSuperShow" @btnSave="btnEidtSuperSave"
      @handleClose="eidtCloseSuper" />
    <commDialog title="编辑" width="80%" @save="btnEidtVipSave" :dialogObj="vipDialogModel"
      @currentChage="vipHandleDialogChange" :listRules="vipListRules" :list="vipList2Box.vipDialogList"
      :visible="eidtVipShow" @close="eidtVipShow = false" />
    <commSerach @export="handleExport" @search="init" @currentChange="searchChange" :list="searchListBox.searchList" />

    <el-dialog v-model="downloadListShow" :title="t('下载列表')" width="80%" heith="100%">
      <component :is="defineAsyncComponent(() =>
        import('@/views/report/exportreports.vue')
      )
        " />
    </el-dialog>
    <div class="btnlist">
      <el-button :type="item.type" :plain="btnCurrent == index ? false : true" v-for="(item, index) in btnlist2"
        :key="index" @click="handleBtnItem(item, index)">{{ item.name }}</el-button>
    </div>
    <pure-table :loading="loading" :loading-config="loadingConfig" adaptive :adaptiveConfig="adaptiveConfig"
      :pagination="pagination" @page-size-change="onSizeChange" @page-current-change="onCurrentChange"
      :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <template #content="{ row }">
        <p>{{ row.add_time }}</p>
        <div>{{ row.reg_ip }} - {{ row.reg_area }}</div>
      </template>
      <template #login="{ row }">
        <p>{{ row.login_time }}</p>
        <div>{{ row.end_login_ip }} - {{ row.end_login_area }}</div>
      </template>
      <template #tag="{ row }">
        <div>{{ $t("标签") }}:
          <el-tag size="small" :type="row.lebal === 1 ? 'success' : 'danger'" effect="plain">
            {{ $t(row.lebal === 1 ? "一般" : "测试") }}
          </el-tag>
          <el-tag v-for="tag, idx in row.tags" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''"
            :type="tag.color ? '' : 'success'" :key="idx">
            {{ $t(tag.name) }}
          </el-tag>
        </div>
        <div>{{ $t('邀 请 码') }}:{{ row.rec_code }}</div>
        <div>{{ $t('会员等级') }}:{{ row.level_name }}</div>
      </template>
      <template #status="{ row }">
        <template v-if="hasAuth('edit')">
          <el-button v-if="row.status == 1" size="small" type="primary" @click="useEnable(row)">{{ t('启用')
          }}</el-button>
          <el-button v-else type="danger" size="small" @click="useEnable(row)">{{ t('禁用') }}</el-button>
        </template>
        <template v-else>
          <el-tag v-if="row.status == 1" size="small" type="success">{{ t('启用') }}</el-tag>
          <el-tag v-else type="danger" size="small">{{ t('禁用') }}</el-tag>
        </template>
      </template>
      <template #right="{ index, row }">
        <template v-if="!props.back">
          <el-button v-if="hasAuth('edit')" type="primary" size="small" @click="handleEdit(index, row)">
            {{ t('修改') }}
          </el-button>
          <el-button size="small" type="warning" v-if="hasAuth('profile')" @click="showUserInfo(row.id)">
            {{ t('资料') }}
          </el-button>
          <el-button v-if="row.count_pnumber <= 0 && hasAuth('edit_super')" style="margin-top:10px" size="small"
            type="success" @click="handleEidtSuper(index + 1, row)">
            {{ t('修改上级') }}
          </el-button>
          <el-button v-if="row.original_level_id == 0 && hasAuth('vip_edit')" style="margin-top:10px" size="small"
            type="success" @click="handleEidtVip(row)">
            {{ t('修改VIP') }}
          </el-button>
          <el-button v-if="row.original_level_id != 0 && hasAuth('vip_reset')" style="margin-top:10px" size="small"
            type="success" @click="handleResetVip(row)">
            {{ t('还原VIP') }}
          </el-button>
        </template>
        <el-button v-else size="small" type="success" @click="backSelect(props.field == 1 ? row.id : row.username)">
          {{ t('选择当前用户') }}
        </el-button>
      </template>
    </pure-table>
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
