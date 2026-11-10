<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, getCurrentInstance } from "vue";
import { actionlist, actionEdit, actionAdd, actionDelete } from "@/api/user";
// import commFrom2 from '@/components/comm/comm-form2.vue'
import { message } from "@/utils/message";
// @ts-ignore
import uploadImage from "@/components/comm/uploadImage.vue";
import { formaTime, timeCycle } from "@/utils/global";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import { http } from "@/utils/http";
import { copyContent } from "@/utils/global";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: "offerManage"
});
const columns = [
  {
    type: "selection",
    align: "left",
    fixed: "left"
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left"
  },
  {
    label: transformI18n("排序"),
    prop: "sort"
  },
  // {
  //     label: transformI18n("优惠类型"),
  //     prop: "base_type_text",
  //   },
  {
    label: transformI18n("活动信息"),
    slot: "detail",
    width: 300
  },
  //   {
  //     label: transformI18n("优惠代码"),
  //     prop: "dis_code",
  //     width:'150px',
  // },
  // {
  //   label: transformI18n("申请时间"),
  //   width:'160px',
  //   // prop: "tc_api_prikey",
  //   cellRenderer: ({ index, row }) => (
  //     <>
  //       <span>{row.t_apply_start_time_date} <br/> { row.t_apply_end_time_date }</span>
  //     </>
  //   )
  // },
  // {
  //   label: transformI18n("显示时间"),
  //   width:'160px',
  //   // prop: "tc_api_signkey",
  //   cellRenderer: ({ index, row }) => (
  //     <>
  //       <span>{row.t_show_start_time_date} <br/> { row.t_show_end_time_date }</span>
  //     </>
  //   )
  // },
  {
    label: transformI18n("总名额"),
    prop: "base_apply_number_max"
  },
  {
    label: transformI18n("已申请"),
    prop: "base_y_apply_dr"
  },
  {
    label: transformI18n("申请状态"),
    slot: "t_apply_start_time"
  },
  {
    label: transformI18n("显示状态"),
    slot: "t_show_start_time"
  },
  {
    label: transformI18n("自动参与"),
    slot: "auto_apply"
  },
  {
    label: transformI18n("自动审核"),
    slot: "auto_review"
  },
  {
    label: transformI18n("热门"),
    slot: "is_hot"
  },
  {
    label: transformI18n("代理id"),
    prop: "agent_id"
  },
  {
    label: transformI18n("创建时间"),
    prop: "add_time",
    width: "160x"
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: "150x",
    cellRenderer: ({ index, row }) => (
      <>
        <el-button
          v-show={hasAuth("edit")}
          style="margin-bottom:15px;"
          size="small"
          type="primary"
          onClick={() => handleEidt(index, row)}
        >
          {transformI18n("编辑")}
        </el-button>
        <br />
        <el-button
          v-show={hasAuth("active")}
          size="small"
          type="primary"
          onClick={() => handleActive(row)}
        >
          {transformI18n("设置活动内容")}
        </el-button>
        <el-button v-show={hasAuth('export')} size="small" type="danger" onClick={() => handleExport(row)}>{transformI18n('导出')}</el-button>
      </>
    )
  }
];

//以下是搜索框的数据
const searchList = {
  type: {
    type: "select",
    placeholder: "优惠类型",
    value: "",
    prop: "type",
    options: []
  },
  dis_code: {
    type: "input",
    placeholder: "优惠代码",
    prop: "dis_code",
    value: ""
  },
  agent_id: {
    type: "input",
    placeholder: "代理id",
    prop: "agent_id",
    value: ""
  },
  type_id: {
    type: "select",
    placeholder: "活动类型",
    value: "",
    prop: "type_id",
    options: []
  },
  auto_review: {
    type: "select",
    placeholder: "自动审核",
    value: "",
    options: [
      {
        label: "是",
        value: 1
      },
      {
        label: "否",
        value: 0
      }
    ],
    prop: "auto_review"
  },
  auto_apply: {
    type: "select",
    placeholder: "自动参与",
    value: "",
    options: [
      {
        label: "是",
        value: 1
      },
      {
        label: "否",
        value: 0
      }
    ],
    prop: "auto_apply"
  },
  apply_date: {
    type: "time",
    placeholder: "申请时间",
    prop: "apply_date",
    value: (): Array<string> => {
      return [];
    }
  },
  show_date: {
    type: "time",
    placeholder: "显示时间",
    prop: "show_date",
    value: (): Array<string> => {
      return [];
    }
  },
  search: {
    type: "button",
    value: "搜索",
    handle: "search",
    prop: "search"
  }
};
const searchListBox = reactive({
  searchList
});
//条件数据
const pagination = reactive({
  page: 1, //页数
  limit: 15, //条数
  total: 0, //总数
  order: "", //排序 desc 或 asc
  field: "",
  base_name: "",
  dis_code: "",
  show_date: "",
  apply_date: "",
  auto_review: "",
  auto_apply: "",
  type: "",
  type_id: "",
  agent_id: "",
});
const dataList: any = [];
const tableData = reactive({ dataList });

const action = reactive({
  list: []
});
const nunber = reactive({
  value: ""
});

const vip: any = ref({});
const gametype: any = ref({});
const platformIds: any = ref({});
const level: any = ref({});
//首次需要加载的接口
init();
function init() {
  actionlist(pagination).then((res: any) => {
    // console.log('xxx',res);
    tableData.dataList = res.data.data;
    pagination.total = res.data.total;
    pagination.page = res.data.current_page;
    list2Box.dialogList.base_type.options = res.type;
    searchListBox.searchList.type.options = res.type;
    list2Box.dialogList.type_id.options = res.action_type;
    searchListBox.searchList.type_id.options = res.action_type;
    list2Box.dialogList.base_show_level.options = res.vip;
    list2Box.dialogList.zg_level.options = res.vip;
    list2Box.dialogList.jump_url.options = res.url;
    action.list = res.action;
    list2Box.dialogList.tag_id.options = [{ label: "不限", value: 0 }].concat(
      res.tags
    );
    vip.value = res.vip.filter(item => item.value != 0);
    gametype.value = res.gamesType.filter(item => item.value != 0);
    platformIds.value = res.gamesThird.filter(item => item.value != 0);
    level.value = res.level;
    nunber.value = "";
  });
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

//输入框的数据
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
};
//点击确定
const handleSerach = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == "show_date" || key == "apply_date") {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
        pagination[key] = time;
      } else {
        pagination[key] = searchList[key].value;
      }
    }
  }
  pagination.page = 1;
  init();
};

//导出
const handleExport = (row) => {
  http.post('/action/export', { data: { id: row.id } }).then((res: any) => {
    if (res.code == 1) {
      const data = res.data.data
      proxy.$alert("<textarea style='width:100%;' rows='5'>" + data + "</textarea>", transformI18n('导出'), {
        confirmButtonText: transformI18n('复制'),
        dangerouslyUseHTMLString: true
      }).then(() => {
        copyContent(data)
      })
    } else {
      message(res.msg, { type: 'error' });
    }
  })
};
//导入
const visibleImport = ref(false);
const importData = ref('');
const handleImport = (type) => {
  if (type == 1) {
    http.post('/action/import', { data: { data: importData.value } }).then((res: any) => {
      if (res.code == 1) {
        visibleImport.value = false
        init();
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
      }
      importData.value = "";
    })
  } else {
    visibleImport.value = true
  }
}
//弹框写法
const visible = ref(false);
const dialogList = {
  base_type: {
    type: "select",
    label: "优惠类型",
    placeholder: "优惠类型",
    tip: "",
    value: 1,
    options: [],
    prop: "base_type",
    show: false
  },
  type_id: {
    type: "select",
    label: "活动类型",
    placeholder: "活动类型",
    value: 1,
    options: [],
    prop: "type_id",
    show: false
  },
  agent_id: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "id"
  },
  tag_id: {
    type: "select",
    label: "用户标签",
    placeholder: "用户标签",
    tip: "限制用户标签用户才能参与",
    value: "",
    options: [{ label: "不限", value: 0 }],
    prop: "tag_id"
  },
  user_type: {
    type: "select",
    label: "用户类型",
    placeholder: "用户类型",
    tip: "新用户为活动申请开始时间之后注册的用户，老用户为之前注册的用户",
    value: 0,
    options: [
      { label: "不限", value: 0 },
      { label: "新用户", value: 1 },
      { label: "老用户", value: 2 }
    ],
    prop: "user_type"
  },
  base_show_level: {
    type: "select",
    label: "前端显示会员等级",
    placeholder: "前端显示会员等级",
    value: 0,
    prop: "base_show_level",
    options: [],
    show: false
  },
  cumulative_days: {
    type: "input",
    label: "累积充值天数",
    placeholder: "累积充值天数",
    value: 1,
    prop: "cumulative_days",
    show: true
  },
  day_recharge_amount: {
    type: "input",
    label: "每日最低充值金额",
    placeholder: "每日最低充值金额",
    value: 1,
    prop: "day_recharge_amount",
    show: false
  },
  base_apply_number_max: {
    type: "input",
    label: "申请上限",
    placeholder: "申请上限",
    value: 0,
    prop: "base_apply_number_max",
    show: false
  },
  base_apply_dr_max: {
    type: "input",
    label: "个人上限",
    placeholder: "个人申请上限",
    value: 0,
    prop: "base_apply_dr_max",
    show: false
  },
  base_y_apply_dr: {
    type: "input",
    label: "已申请人数",
    placeholder: "已申请人数",
    value: 0,
    prop: "base_y_apply_dr",
    show: false
  },
  everyday_person_num: {
    type: "input",
    label: "每人每日领取上限",
    placeholder: "每人每日领取上限",
    tip: "0为不限制",
    value: 0,
    prop: "everyday_person_num",
    show: false
  },
  t_apply_start_end_time: {
    type: "time",
    label: "申请开始/结束时间",
    placeholder: "申请开始/结束时间",
    value: [],
    prop: "t_apply_start_end_time",
    show: false
  },
  t_show_start_end_time: {
    type: "time",
    label: "显示开始/结束时间",
    placeholder: "显示开始/结束时间",
    value: [],
    prop: "t_show_start_end_time",
    show: false
  },
  zg_level: {
    type: "select",
    label: "申请资格等级",
    placeholder: "申请资格等级",
    value: 0,
    options: [],
    prop: "zg_level",
    show: false
  },
  zg_cz_type: {
    type: "select",
    label: "充值要求",
    placeholder: "充值要求",
    value: "all",
    tip: "单笔,上周,昨日充值只对再存优惠活动有效(领取活动时取充值最大数额)，注册首存活动强制要求用户必须充值",
    prop: "zg_cz_type",
    options: [
      { label: transformI18n("不限"), value: "all" },
      { label: transformI18n("累计充值"), value: 1 },
      { label: transformI18n("单笔充值"), value: 2 },
      { label: transformI18n("上周充值"), value: 3 },
      { label: transformI18n("昨日充值"), value: 4 },
      { label: transformI18n("今日累计充值"), value: 5 },
      { label: transformI18n("今日单笔充值"), value: 6 },
      { label: transformI18n("昨日累计充值（含首充）"), value: 7 },
    ],
    show: false
  },
  water: {
    type: "input",
    label: "流水倍数",
    placeholder: "流水倍数",
    value: "",
    prop: "water",
    show: false
  },
  water_type: {
    type: "radio",
    label: "流水倍数类型",
    placeholder: "流水倍数类型",
    value: "0",
    prop: "water_type",
    options: [
      { label: 0, name: "所有" },
      { label: 1, name: "指定平台" },
      { label: 2, name: "指定游戏" }
    ],
    show: false
  },
  platform_ids: {
    type: 'slot',
    value: [],
    label: '选择平台',
    placeholder: '选择平台',
    prop: 'platform_ids',
    name: 'platform_ids',
    options: [],
    show: true,
  },
  game_ids: {
    type: 'slot',
    label: '游戏ID',
    placeholder: '游戏ID',
    value: '',
    prop: 'game_ids',
    name: 'game_ids',
    show: true,
  },
  jump_url: {
    type: "select",
    label: "关联功能",
    placeholder: "关联功能",
    value: "",
    prop: "jump_url",
    options: [],
    show: false
  },
  auto_apply: {
    type: "radio",
    label: "是否自动参与",
    placeholder: "是否自动参与",
    tip: "用户是否自动参与",
    value: 0,
    prop: "auto_apply",
    options: [
      { label: 0, name: "否" },
      { label: 1, name: "是" }
    ],
    show: false
  },
  auto_review: {
    type: "radio",
    label: "是否自动审核",
    placeholder: "是否自动审核",
    tip: "如设置是，会员申请活动则会自动审核派送",
    value: 0,
    prop: "auto_review",
    options: [
      { label: 0, name: "否" },
      { label: 1, name: "是" }
    ],
    show: false
  },
  is_first_tomorrow_join: {
    type: "radio",
    label: "首充第二天后参与",
    placeholder: "首充第二天后参与",
    tip: "如设置是，再存优惠和首充奖励不会同时发放，再存优惠会在首充第二天发放",
    value: 0,
    prop: "is_first_tomorrow_join",
    options: [
      { label: 0, name: "否" },
      { label: 1, name: "是" }
    ],
    show: false
  },
  is_hot: {
    type: "radio",
    label: "热门",
    placeholder: "热门",
    value: 0,
    prop: "is_hot",
    options: [
      { label: 0, name: "否" },
      { label: 1, name: "是" }
    ]
  },
  sort: {
    type: "input",
    label: "排序",
    placeholder: "排序",
    value: 0,
    prop: "sort",
    show: false
  },
  mutually_exclusive_id: {
    type: "select",
    label: "互斥活动",
    placeholder: "互斥活动",
    value: "",
    prop: "mutually_exclusive_id",
    options: []
  },
  previous_action_id: {
    type: "select",
    label: "昨天活动",
    placeholder: "昨天活动",
    tip: "若设置该参数，必须昨天前参与选择的活动才能参与该活动",
    value: "",
    prop: "previous_action_id",
    options: []
  },
  game_type: {
    type: "slot",
    label: "游戏分类",
    placeholder: "游戏分类",
    tip: "限制游戏分类",
    value: "",
    name: "gametype",
    prop: "game_type",
    show: true
  },
  date_type: {
    type: "radio",
    label: "日期类型",
    placeholder: "日期类型",
    tip: "当类型按照 本周 时，本周最近一次有效的数据会覆盖之前的数据。本周结束会，数据将重新按照当前周计算",
    value: 1,
    prop: "date_type",
    options: [
      { label: 1, name: "昨日" },
      { label: 2, name: "本周" }
    ],
    show: true
  },
  is_consist: {
    type: "radio",
    label: "是否排除",
    placeholder: "是否排除",
    tip: "设置为否时则只对设定的代理线和用户标签才能参与，设置为是时除了设定的代理线和用户标签其他的都能参与",
    value: 2,
    prop: "is_consist",
    options: [
      { label: 2, name: "否" },
      { label: 1, name: "是" }
    ],
    show: true
  },
  reward_max: {
    type: "input",
    label: "奖励上限",
    placeholder: "奖励上限",
    value: 0,
    prop: "reward_max",
    show: true
  },
};
const dialogModel = reactive({
  base_type: 1,
  agent_id: "",
  tag_id: "",
  base_show_level: 0,
  base_apply_number_max: 0,
  base_apply_dr_max: 0,
  base_y_apply_dr: 0,
  t_apply_start_end_time: "",
  t_show_start_end_time: "",
  zg_level: 0,
  zg_cz_type: "",
  water: "",
  water_type: 0,
  platform_ids: [],
  game_ids: "",
  auto_review: 0,
  is_first_tomorrow_join: 0,
  everyday_person_num: 0,
  auto_apply: 1,
  is_hot: 1,
  reg_json: [],
  id: "",
  t_apply_start_time: "",
  t_apply_end_time: "",
  t_show_end_time: "",
  t_show_start_time: "",
  jl_type: 2,
  jl_ck_or_level_e: "",
  jl_ck_or_level_s: "",
  jl_bl_price: "",
  base_ty_ts: "",
  jump_url: "",
  type_id: 0,
  mutually_exclusive_id: 0,
  date_type: 1,
  user_type: 0,
  is_consist: 2,
  game_type: [],
  level_json: [],
  cumulative_days: 0,
  day_recharge_amount: 0,
  month_activity: [],
  rebate_type: "0",
  reward_max: '',
});
const listRules = {
  t_apply_start_end_time: {
    required: true,
    message: "请选择申请时间",
    trigger: ["blur", "change"]
  },
  t_show_start_end_time: {
    required: true,
    message: "请选择显示时间",
    trigger: ["blur", "change"]
  }
};
const list2Box = reactive({ dialogList });
const handleDialogChange = ({ value, index }: any) => {
  if (index == "t_apply_start_end_time") {
    const time = value
      ? value.length > 0
        ? formaTime(value[0]) + " - " + formaTime(value[1])
        : ""
      : "";
    dialogModel.t_apply_start_time = value
      ? new Date(value[0]).getTime() + ""
      : "";
    dialogModel.t_apply_end_time = value
      ? new Date(value[1]).getTime() + ""
      : "";

    dialogModel.t_apply_start_end_time = time;
  } else if (index == "t_show_start_end_time") {
    const time = value
      ? value.length > 0
        ? formaTime(value[0]) + " - " + formaTime(value[1])
        : ""
      : "";
    dialogModel.t_show_start_end_time = time;
    dialogModel.t_show_start_time = value
      ? new Date(value[0]).getTime() + ""
      : "";
    dialogModel.t_show_end_time = value
      ? new Date(value[1]).getTime() + ""
      : "";
  } else {
    if (index == "base_type") {
      changeBaseType(value);
    }
    dialogList[index].value = value;
    dialogModel[index] = value;
  }
  if (index == 'water_type') {
    changeGameIdsOrPlatIds(value)
  }
};

function changeGameIdsOrPlatIds(water_type) {
  if (water_type == 1) {
    list2Box.dialogList['platform_ids'].show = false;
    dialogList['platform_ids'].show = false;
    list2Box.dialogList['game_ids'].show = true;
    dialogList['game_ids'].show = true;
  } else if (water_type == 2) {
    list2Box.dialogList['platform_ids'].show = true;
    dialogList['platform_ids'].show = true;
    list2Box.dialogList['game_ids'].show = false;
    dialogList['game_ids'].show = false;
  } else {
    list2Box.dialogList['platform_ids'].show = true;
    dialogList['platform_ids'].show = true;
    list2Box.dialogList['game_ids'].show = true;
    dialogList['game_ids'].show = true;
  }
}

const changeBaseType = value => {
  const keys = [
    "base_type",
    "base_show_level",
    "agent_id",
    "tag_id",
    "t_apply_start_end_time",
    "t_show_start_end_time",
    "is_hot",
    "sort",
    "jump_url",
    "type_id",
  ];
  const keys2 = [
    "base_type",
    "type_id",
    "agent_id",
    "tag_id",
    "t_apply_start_end_time",
    "t_show_start_end_time",
    "is_hot",
    "sort",
    "water",
    'water_type',
    "auto_apply",
    "date_type",
    "is_consist",
    "game_type",
    "jump_url",
    "auto_review",
    "is_first_tomorrow_join",
    "reward_max",
  ];
  const keys3 = [
    "base_type",
    'type_id',
    'agent_id',
    'tag_id',
    't_apply_start_end_time',
    't_show_start_end_time',
    'is_hot',
    'auto_apply',
    'auto_review',
    'water',
    'water_type',
    "sort",
    "jump_url",
    "base_apply_number_max",
    "base_apply_dr_max",
    "everyday_person_num",
  ];
  const six_hide = [
    "date_type",
    "is_consist",
    "game_type",
    "cumulative_days",
    "day_recharge_amount",
    "platform_ids",
    "game_ids",
    "reward_max",
  ];
  list2Box.dialogList.base_type.tip = "";
  if (value == 5) {
    for (const key in dialogList) {
      if (!keys.includes(key)) {
        list2Box.dialogList[key].show = true;
      } else {
        list2Box.dialogList[key].show = false;
      }
    }
  } else if (value == 6) {
    for (const key in dialogList) {
      if (keys2.includes(key)) {
        list2Box.dialogList[key].show = false;
      } else {
        list2Box.dialogList[key].show = true;
      }
    }
  } else if (value == 7) {
    list2Box.dialogList.base_type.tip = "该奖励发放给直属上级";
    for (const key in dialogList) {
      if (keys3.includes(key)) {
        list2Box.dialogList[key].show = false;
      } else {
        list2Box.dialogList[key].show = true;
      }
    }
  } else {
    for (const key in dialogList) {
      if (six_hide.includes(key)) {
        list2Box.dialogList[key].show = true;
      } else {
        list2Box.dialogList[key].show = false;
      }
    }
  }
};
//获取当前时间
const currentTime = new Date().getTime() / 1000;
const clickIndex = ref(1);
//点击添加
const handleAdd = () => {
  clickIndex.value = 2;
  for (const key in dialogModel) {
    if (key == dialogList[key]?.prop) {
      if (key == "base_type") {
        list2Box.dialogList[key].value = 1;
      } else if (
        key == "base_show_level" ||
        key == "zg_level" ||
        key == "base_apply_number_max" ||
        key == "base_apply_dr_max" ||
        key == "base_y_apply_dr" ||
        key == "auto_review" ||
        key == "auto_apply" ||
        key == "everyday_person_num" ||
        key == "is_hot" ||
        key == "water_type" ||
        key == "is_first_tomorrow_join"
      ) {
        list2Box.dialogList[key].value = 0;
      } else if (key == "zg_cz_type") {
        list2Box.dialogList[key].value = "all";
      } else if (key == "jl_type") {
        list2Box.dialogList[key].value = 2;
      } else if (key == "date_type") {
        list2Box.dialogList[key].value = 1;
      } else if (key == "is_consist") {
        list2Box.dialogList[key].value = 2;
      } else if (key == "platform_ids") {
        list2Box.dialogList[key].value = [];
      } else {
        list2Box.dialogList[key].value = "";
      }
    }
    dialogModel[key] = "";
  }

  dialogModel.base_apply_number_max = 0;
  dialogModel.rebate_type = "0";
  dialogModel.base_apply_dr_max = 0;
  dialogModel.base_y_apply_dr = 0;
  dialogModel.auto_review = 0;
  dialogModel.is_hot = 0;
  dialogModel.base_type = 1;
  dialogModel.date_type = 1;
  dialogModel.is_consist = 2;
  dialogModel.jl_type = 2;
  dialogModel.base_show_level = 0;
  dialogModel.zg_level = 0;
  dialogModel.zg_cz_type = "all";
  dialogModel.water_type = 0;
  dialogModel.platform_ids = [];
  dialogModel.reg_json = [
    {
      type: "1",
      min_reg: "1",
      max_reg: "1",
      bl_or_amount: "1",
      integral_amount: "1"
    }
  ];
  dialogModel.month_activity = [
    {
      type: "1",
      day: 0,
      money: 0,
      bonus: 1
    }
  ];
  visible.value = true;
  list2Box.dialogList.mutually_exclusive_id.options = action.list;
  list2Box.dialogList.previous_action_id.options = action.list;
  init();
  changeBaseType(dialogModel)
};

//编辑
const handleEidt = (index, row) => {
  clickIndex.value = 1;
  actionEdit({ find: true, id: row.id }).then((res: any) => {
    for (const key in dialogModel) {
      if (key == "base_show_level" || key == "zg_level") {
        list2Box.dialogList[key].value =
          res.data[key] == "all" ? 0 : parseInt(res.data[key]);
        dialogModel[key] = res.data[key] == "all" ? 0 : parseInt(res.data[key]);
      } else if (key == "zg_cz_type") {
        list2Box.dialogList[key].value =
          res.data[key] == "all" ? "all" : parseInt(res.data[key]);
        dialogModel[key] =
          res.data[key] == "all" ? "all" : parseInt(res.data[key]);
      } else if (key != "date") {
        if (list2Box.dialogList[key]) {
          list2Box.dialogList[key].value = res.data[key];
        }
        dialogModel[key] =
          key == "jl_ck_or_level_s" || key == "jl_ck_or_level_e"
            ? parseInt(res.data[key])
            : res.data[key];
      }
    }
    changeBaseType(dialogModel.base_type);

    changeGameIdsOrPlatIds(dialogModel.water_type)
    dialogModel.t_apply_start_time = res.data.t_apply_start_time;
    dialogModel.t_apply_end_time = res.data.t_apply_end_time;
    dialogModel.t_show_end_time = res.data.t_show_end_time;
    dialogModel.t_show_start_time = res.data.t_show_start_time;
    dialogModel.rebate_type = dialogModel.rebate_type.toString();
    dialogModel.id = res.data.id;
    dialogModel.reg_json = res.data.reg_json;
    dialogModel.month_activity = res.data.month_activity;
    level.value = res.data.level_json
    dialogModel.platform_ids = res.data.platform_ids;
    list2Box.dialogList.t_apply_start_end_time.value = [
      new Date(res.data.t_apply_start_time * 1000),
      new Date(res.data.t_apply_end_time * 1000)
    ];
    list2Box.dialogList.t_show_start_end_time.value = [
      new Date(res.data.t_show_start_time * 1000),
      new Date(res.data.t_show_end_time * 1000)
    ];
    list2Box.dialogList.mutually_exclusive_id.options = res.data.action;
    list2Box.dialogList.previous_action_id.options = res.data.action;
  });
  visible.value = true;
};
//奖励设置数据
const awardColmuns = [
  {
    label: transformI18n("奖励类型"),
    slot: "type",
    width: "150x"
  },
  {
    label: transformI18n("最低充值"),
    slot: "min",
    width: "150x"
  },
  {
    label: transformI18n("最高充值"),
    slot: "max",
    width: "150x"
  },
  {
    label: transformI18n("奖金/占比%"),
    slot: "zan",
    width: "150x"
  },
  {
    label: transformI18n("积分/占比%"),
    slot: "integral",
    width: "150x"
  },
  {
    label: transformI18n("操作"),
    slot: "right",
    width: "150x"
  }
];
//奖励设置数据
const awardColmuns1 = [
  {
    label: transformI18n("奖励类型"),
    slot: "type",
    width: "150x"
  },
  {
    label: transformI18n("最低金额"),
    slot: "min",
    width: "150x"
  },
  {
    label: transformI18n("最高金额"),
    slot: "max",
    width: "150x"
  },
  {
    label: transformI18n("奖金/占比%"),
    slot: "zan",
    width: "150x"
  },
  {
    label: transformI18n("操作"),
    slot: "right",
    width: "150x"
  }
];

// 月活动奖励
const mActivityBonus = [
  {
    label: transformI18n("奖励类型"),
    slot: "type",
    width: "150x"
  },
  {
    label: transformI18n("累计充值天数"),
    slot: "day",
    width: "150x"
  },
  {
    label: transformI18n("每日最低充值金额"),
    slot: "money",
    width: "150x"
  },
  {
    label: transformI18n("奖金"),
    slot: "bonus",
    width: "150x"
  },
  {
    label: transformI18n("操作"),
    slot: "right",
    width: "150x"
  }
];
const handleAddRegjson = () => {
  const query = {
    type: "1",
    min_reg: 1,
    max_reg: 1,
    bl_or_amount: 1,
    integral_amount: 1
  };
  dialogModel.reg_json.push(query);
};
//删除
const handleDeletRegjson = index => {
  dialogModel.reg_json.splice(index, 1);
};

const handleAddMonth = () => {
  const query = {
    type: "1",
    day: 0,
    money: 0,
    bonus: 1,
  };
  dialogModel.month_activity.push(query);
};
//删除
const handleDeletMonth = index => {
  dialogModel.month_activity.splice(index, 1);
};

//监听输入框
const handlerChange = e => {
  for (const item in level.value) {
    level.value[item].proportion = e
  }
};

//保存
const handleSave = () => {
  if (dialogModel.base_type == 6) {
    dialogModel.level_json = level.value
  }
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    };
    actionEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: "error" });
      }
    });
  } else {
    const query = {
      add: true,
      info: dialogModel
    };
    actionAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: "error" });
      }
    });
  }
};

///点击设置活动内容
const activeShow = ref(false);
const activeId = ref("");
const base_type = ref("");
const handleActive = row => {
  activeId.value = row.id;
  base_type.value = row.base_type;
  activeShow.value = true;
};

//选中删除
let selectAll = [];
const handleSelectionChange = val => {
  selectAll = val;
};
const handleDelete = () => {
  if (selectAll.length > 0) {
    deleteCurrent(getIds());
  } else {
    message("请选择用户", { type: "warning" });
  }
};
const getIds = () => {
  const s_arr = [];
  selectAll.forEach(item => {
    s_arr.push(item.id);
  });
  return s_arr.join(",");
};
const deleteCurrent = id => {
  proxy
    .$confirm("确认删除吗？", "提示")
    .then(() => {
      selectDelete(id);
    })
    .catch(() => {
      console.log("取消");
    });
};
function selectDelete(id) {
  const queryDelte = {
    delete: true,
    id
  };
  actionDelete(queryDelte).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: "success" });
      init();
    } else {
      message(res.msg, { type: "error" });
    }
  });
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.agent_id.value = val;
  dialogModel.agent_id = val;
  selectShow.value = false;
};

const gameSelectShow = ref(false);
const eidtGameIds = (val) => {
  dialogModel.game_ids = val;
  list2Box.dialogList.game_ids.value = val;
  gameSelectShow.value = false
  console.log(dialogModel)
}
const selectGame = () => {
  gameSelectShow.value = true
}
</script>

<template>
  <div>
    <menuList />
    <commSerach @export="handleExport" @search="handleSerach" @currentChange="handleCurrentChange"
      :list="searchListBox.searchList" />
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t("删除") }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{
          $t("添加")
        }}</el-button>
        <el-button v-if="hasAuth('import')" type="danger" @click="handleImport">{{ $t('导入') }}</el-button>
      </div>
    </div>
    <el-dialog width="50%" v-model="visibleImport" :title="$t('导入')">
      <el-form ref="ruleFormRef">
        <el-form-item label-width="120">
          <template v-slot:label>{{ $t('数据') }}</template>
          <el-input type="textarea" rows="6" v-model="importData" />
        </el-form-item>
        <el-form-item label-width="120">
          <el-button type="primary" @click="handleImport(1)">{{ $t('导入') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-model="activeShow" :title="$t('设置活动内容')" width="80%">
      <component :id="activeId" :base_type="base_type" :is="
          defineAsyncComponent(() =>
            import('@/views/huodongguanli/content.vue')
          )
        " />
    </el-dialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          " :back="true" :field="1" @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <el-dialog width="80%" v-model="gameSelectShow" :title="$t('选择')">
      <div style="padding-bottom:30px;">
        <component :back="true" @backSelect="eidtGameIds"
          :is="defineAsyncComponent(()=> import('@/views/threeGames/gameManage.vue'))" />
      </div>
    </el-dialog>
    <el-dialog v-model="visible" :title="$t('编辑')" width="60%">
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('基本设置')">
          <component @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules"
            :list="list2Box.dialogList" :is="
              defineAsyncComponent(() =>
                import('@/components/comm/comm-form2.vue')
              )
            ">
            <template #username>
              <div>
                <div class="flex-fi user-box">
                  <el-input v-model="dialogModel.agent_id" clearable :placeholder="$t('用户/代理')" />
                  <el-button style="margin-left: 20px" type="primary" @click="selectUser">{{ $t("选择用户") }}</el-button>
                </div>
                <div>{{ $t("限制某代理线下面用户才能参与") }}</div>
              </div>
            </template>
            <template #platform_ids>
              <el-checkbox-group v-model="dialogModel.platform_ids">
                <el-checkbox :label="item.label" v-for="item in platformIds" :key="item.value" :value="item.value"
                  size="large" />
              </el-checkbox-group>
            </template>

            <template v-slot:game_ids>
              <div class="flex-fi user-box">
                <el-input v-model="dialogModel.game_ids" @change="eidtGameIds($event)" :placeholder="$t('游戏')" />
                <el-button style="margin-left: 20px;" type="primary" @click="selectGame">{{ $t('选择游戏') }}</el-button>
              </div>
            </template>

            <template #gametype>
              <div>
                <div class="flex-fi user-box">
                  <el-select v-model="dialogModel.game_type" multiple placeholder="请选择">
                    <el-option v-for="item in gametype" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </template>

          </component>
        </el-tab-pane>
        <el-tab-pane v-if="dialogModel.base_type != 5" :label="$t('奖励设置')">
          <template v-if="dialogModel.base_type == 1 || dialogModel.base_type == 2">
            <el-button type="primary" @click="handleAddRegjson">{{
              $t("添加")
            }}</el-button>
            <pure-table :data="dialogModel.reg_json" width="100%" :columns="awardColmuns">
              <template #type="{ row }">
                <el-radio-group v-model="row.type" class="ml-4">
                  <el-radio label="1" size="large">{{
                    $t("固定奖金")
                  }}</el-radio>
                  <el-radio label="2" size="large">{{
                    $t("奖励占比%")
                  }}</el-radio>
                </el-radio-group>
              </template>
              <template #min="{ row }">
                <el-input v-model="row.min_reg" placeholder="" />
              </template>
              <template #max="{ row }">
                <el-input v-model="row.max_reg" placeholder="" />
              </template>
              <template #zan="{ row }">
                <el-input v-model="row.bl_or_amount" placeholder="" />
              </template>
              <template #integral="{ row }">
                <el-input v-model="row.integral_amount" placeholder="" />
              </template>
              <template #right="{ index }">
                <el-button type="primary" @click="handleDeletRegjson(index)" v-if="dialogModel.reg_json.length > 1">{{
                  $t("删除") }}</el-button>
              </template>
            </pure-table>
          </template>
          <template v-if="dialogModel.base_type == 3 || dialogModel.base_type == 4">
            <el-form-item :label="$t('奖励类型')" label-width="240">
              <el-select :disabled="true" v-model="dialogModel.jl_type">
                <el-option :label="$t('存款比例')" :value="1" />
                <el-option :label="$t('固定奖励')" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('领取的资格vip等级区间')" label-width="240">
              <el-select v-model="dialogModel.jl_ck_or_level_s">
                <el-option v-for="row in vip" :key="row.label" :label="row.label" :value="row.value" />
              </el-select>
              ~
              <el-select v-model="dialogModel.jl_ck_or_level_e">
                <el-option v-for="row in vip" :key="row.label" :label="row.label" :value="row.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t(dialogModel.base_type == 3 ? '固定奖金' : '体验金')" label-width="240">
              <el-input v-model="dialogModel.jl_bl_price" />
            </el-form-item>
            <el-form-item v-if="dialogModel.base_type == 4" :label="$t('体验金天数')" label-width="240">
              <el-input v-model="dialogModel.base_ty_ts" />
            </el-form-item>
          </template>


          <template v-if="dialogModel.base_type == 6">
            <div>
              <el-radio-group v-model="dialogModel.rebate_type" class="ml-4">
                <el-radio label="0" size="large">{{
                  $t("VIP区间")
                }}</el-radio>
                <el-radio label="1" size="large">{{
                  $t("金额区间")
                }}</el-radio>
              </el-radio-group>
            </div>
            <template v-if="dialogModel.rebate_type == 0">
              <div style="display: flex;align-items:center;">
                <div style="color: #808080;margin-left:30px;font-size:14px;font-weight: 600;">等级</div>
                <div style="color: #808080;margin-left:150px;font-size:14px;font-weight: 600;">比例(1=1%)</div>
                <el-input v-model.number="nunber.value" type="number" :min="0" :max="100"
                  style="width: 130px;margin-left:190px;" @input="handlerChange" />
              </div>
              <hr style="color: #e3e3e3;margin: 10px 0;" />

              <div class="input-item" v-for="item in level">
                <el-form-item :label="item.level_name" label-width="70">
                  <el-input v-model.number="item.proportion" type="number" :min="0" :max="100" class="ml-2"
                    style="width: 300px" />
                </el-form-item>
              </div>
            </template>
            <template v-else>
              <el-button type="primary" @click="handleAddRegjson">{{
                $t("添加")
              }}</el-button>
              <pure-table :data="dialogModel.reg_json" width="100%" :columns="awardColmuns1">
                <template #type="{ row }">
                  <el-radio-group v-model="row.type" class="ml-4">
                    <el-radio label="1" size="large">{{
                      $t("固定奖金")
                    }}</el-radio>
                    <el-radio label="2" size="large">{{
                      $t("奖励占比%")
                    }}</el-radio>
                  </el-radio-group>
                </template>
                <template #min="{ row }">
                  <el-input v-model="row.min_reg" placeholder="" />
                </template>
                <template #max="{ row }">
                  <el-input v-model="row.max_reg" placeholder="" />
                </template>
                <template #zan="{ row }">
                  <el-input v-model="row.bl_or_amount" placeholder="" />
                </template>
                <template #right="{ index }">
                  <el-button type="primary" @click="handleDeletRegjson(index)" v-if="dialogModel.reg_json.length > 1">{{
                    $t("删除") }}</el-button>
                </template>
              </pure-table>
            </template>


          </template>

          <template v-if="dialogModel.base_type == 7">
            <el-button type="primary" @click="handleAddMonth">{{
              $t("添加")
            }}</el-button>
            <pure-table :data="dialogModel.month_activity" width="100%" :columns="mActivityBonus">
              <template #type="{ row }">
                <el-radio-group v-model="row.type" class="ml-4">
                  <el-radio label="1" size="large">{{
                    $t("固定奖金")
                  }}</el-radio>
                  <!-- <el-radio label="2" size="large">{{
                    $t("奖励占比%")
                  }}</el-radio> -->
                </el-radio-group>
              </template>
              <template #day="{ row }">
                <el-input v-model="row.day" placeholder="" />
              </template>
              <template #money="{ row }">
                <el-input v-model="row.money" placeholder="" />
              </template>
              <template #bonus="{ row }">
                <el-input v-model="row.bonus" placeholder="" />
              </template>
              <template #right="{ index }">
                <el-button type="primary" @click="handleDeletMonth(index)" v-if="dialogModel.month_activity.length > 1">{{
                  $t("删除") }}</el-button>
              </template>
            </pure-table>
          </template>

          <el-button type="primary" @click="handleSave">{{
            $t("保存")
          }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- <commDialog :title="$t('基础信息')" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage :limit="1"></uploadImage>
        </template>
      </commDialog> -->
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #t_apply_start_time="{ row }">
        <el-tag size="small" type="success" v-if="row.t_apply_end_time > currentTime &&
          currentTime > row.t_apply_start_time
          ">{{ $t("进行中") }}</el-tag>
        <el-tag size="small" type="danger" v-else>{{
          $t("结束/未开始")
        }}</el-tag>
      </template>
      <template #t_show_start_time="{ row }">
        <el-tag size="small" type="success" v-if="row.t_show_end_time > currentTime &&
          currentTime > row.t_show_start_time
          ">{{ $t("显示中") }}</el-tag>
        <el-tag size="small" type="danger" v-else>{{ $t("未显示") }}</el-tag>
      </template>
      <template #auto_review="{ row }">
        <el-tag size="small" type="success" v-if="row.auto_review == 1">{{
          $t("是")
        }}</el-tag>
        <el-tag size="small" type="danger" v-else>{{ $t("否") }}</el-tag>
      </template>
      <template #auto_apply="{ row }">
        <el-tag size="small" type="success" v-if="row.auto_apply == 1">{{
          $t("是")
        }}</el-tag>
        <el-tag size="small" type="danger" v-else>{{ $t("否") }}</el-tag>
      </template>
      <template #is_hot="{ row }">
        <el-tag size="small" type="success" v-if="row.is_hot == 1">{{
          $t("是")
        }}</el-tag>
        <el-tag size="small" type="danger" v-else>{{ $t("否") }}</el-tag>
      </template>
      <template #detail="{ row }">
        <p v-if="row.action_type_name">
          {{ $t("活动类别") }}: {{ $t(row.action_type_name) }}
        </p>
        <p v-if="row.base_type_text">
          {{ $t("优惠类型") }}: {{ $t(row.base_type_text) }}
        </p>
        <p>
          {{ $t("优惠代码") }}:
          <el-tag type="danger">{{ row.dis_code }}</el-tag>
        </p>
        <el-tooltip :content="`${$t('开始时间')}:${row.t_show_start_time_date} - ${row.t_show_end_time_date
          }`">
          <p>
            {{ $t("开始时间") }}: {{ row.t_show_start_time_date2 }} -
            {{ row.t_show_end_time_date2 }}
          </p>
        </el-tooltip>
        <el-tooltip :content="`${$t('申请时间')}:${row.t_apply_start_time_date} - ${row.t_apply_end_time_date
          }`">
          <p>
            {{ $t("申请时间") }}: {{ row.t_apply_start_time_date2 }} -
            {{ row.t_apply_end_time_date2 }}
          </p>
        </el-tooltip>
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
