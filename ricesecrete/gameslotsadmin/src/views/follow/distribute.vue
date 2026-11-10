<script setup lang="tsx">
import { reactive, ref, getCurrentInstance,defineAsyncComponent } from "vue";
import { distributesave,distribute, agentStatusEdit, userDetail } from "@/api/user";
import { message } from "@/utils/message";
import seeData from "@/components/user/seeData.vue";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import router from "@/router";
import { http } from '@/utils/http';
defineOptions({
  name: "distribute"
});
const { t } = useI18n();
const { proxy } = getCurrentInstance();

const columns = [
  {

    type: "selection",
    align: "left",
    fixed: "left",
    selectable: (row) => {
      return row.status2 == 0 && row.give_status != 2
    }
  },
  {
    label: t("用户信息"),
    prop: "username",
    width: 300,
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.uid)}>
          <p >UID:{row.uid}</p>
          <p>{t("用户名")} <el-tag size="small">{row.username}</el-tag></p>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
        <div v-show={row.rec_id} >
         {transformI18n("上级")}: <span class="el-link2" onClick={() => showUserInfo(row.rec_id)}>UID:{row.rec_id}</span>
        </div>
         <p>{t("会员等级")} <el-tag type="success" size="small">{row.level}</el-tag></p>
      </>
    )
  },
  {
    label: t("状态信息"),
    prop: "televised_status",
    width: 340,
    cellRenderer: ({ row }) => (
      <>
        <div>
        <p>
          <span>{t("电访进度")}:
           <el-tag size="small" v-show={row.televised_status == 0}>{t('未安排')}</el-tag>
           <el-tag size="small" type="warning" v-show={row.televised_status == 1}>{t('待电访')} <span v-show={row.status_show == 1}>({t('已超时')})</span></el-tag>
           <el-tag size="small" type="success"  v-show={row.televised_status == 2}>{t('已电访')} <span v-show={row.status_show == 2}>({t('未回归')})</span></el-tag>
           <el-tag size="small" type="danger" v-show={row.televised_status == 3}>{t('已电访2次以上')}</el-tag>
          </span>
           <span style="margin-left:10px;">{t("电访状态")}:
           <el-tag size="small" v-show={row.is_connected == 0}>{t("未安排")}</el-tag>
           <el-tag size="small" type="danger" v-show={row.is_connected == 1}>{t('未接通')}</el-tag>
           <el-tag size="small" type="success"  v-show={row.is_connected == 2}>{t('已接通')}</el-tag>
           </span>
           </p>
           <p>
           <span>{t("会员状态")}:
           <el-tag size="small" v-show={row.status == 0}>{t("禁用")}</el-tag>
           <el-tag size="small" type="success" v-show={row.status == 1}>{t('正常')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("代理状态")}:
           <el-tag size="small" v-show={row.agent_status == 0}>{t("未申请")}</el-tag>
           <el-tag size="small" type="success" v-show={row.agent_status == 1}>{t('已申请')}</el-tag>
           </span>
            </p>
            <p>
            <span>{t("是否要领取赠金")}:
            <el-tag size="small" v-show={row.is_distribution == 0}>{t("未处理")}</el-tag>
            <el-tag size="small" type="warning" v-show={row.is_distribution == 1}>{t('否')}</el-tag>
            <el-tag size="small" type="success" v-show={row.is_distribution == 2}>{t('是')}</el-tag>
            </span>
            <span style="margin-left:10px;">{t("赠金领取状态")}:
             <el-tag size="small" type="warning" v-show={row.give_status == 0}>{t('未领取')}</el-tag>
             <el-tag size="small" type="success"  v-show={row.give_status == 1}>{t('已领取')}</el-tag>
             <el-tag size="small" type="danger"  v-show={row.give_status == 2}>{t('已失效')}</el-tag>
            </span>
            </p>
            <p>
            <span>{t("客户意向")}:
             <el-tag size="small" v-show={row.intention_status == 0}>{t("未评估")}</el-tag>
             <el-tag size="small" type="danger" v-show={row.intention_status == 1}>{t('低')}</el-tag>
             <el-tag size="small" type="warning"  v-show={row.intention_status == 2}>{t('中')}</el-tag>
             <el-tag size="small" type="success" v-show={row.intention_status == 3}>{t('高')}</el-tag>
            </span>
            </p>
        </div>
      </>
    )
  },
  {
    label: t("派发金额"),
    width: 160,
    prop: "price",
    sortable: true
  },
  {
    label: t("流水倍数"),
    width: 100,
    prop: "water",
  },
  {
    label: t("派发类型"),
    slot: "type",
    width: 150,
  },
  {
    label: t("审核状态"),
    slot: "status2",
    width: 150,
  },
  {
    label: t("用户时间信息"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("注册时间")}: {row.reg_time}</span></p>
          <p><span>{t("首存时间")}: {row.first_deposit_time}</span></p>
          <p><span>{t("最近登陆时间")}: {row.login_time}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("赠金时间"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("派发时间")}: {row.add_time}</span></p>
          <p><span>{t("领取时间")}: {row.give_time}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("出入金时间"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("最近入金时间")}: {row.recent_deposit_money_time}</span></p>
          <p><span>{t("最近出金时间")}: {row.recent_withdraw_money_time}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("电访信息"),
    prop: "reg_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("电访时间")}: {row.televised}</span></p>
          <p><span>{t("短信发送时间")}: {row.sms_time}</span></p>
          <p><span>{t("电访组别")}: {row.admin_group}</span></p>
          <p><span>{t("电访人员")}: {row.admin_name}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("反馈"),
    prop: "feedback",
  },
  {
    label: t("备注"),
    prop: "remark",
  },
  {
    label: t("操作人"),
    prop: "admin",
    width: 150
  },
];

//搜索的数据
const searchList = {
  username: {
    type: "input",
    placeholder: t("UID/邮箱/手机号/用户名"),
    value: "",
    prop: "username"
  },
  televised: {
    type: "time",
    placeholder: t("电访时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  assign_time: {
    type: "time",
    placeholder: t("电访派发时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  add_time: {
    type: "time",
    placeholder: t("赠金派发时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  role_id: {
    type: 'select',
    placeholder: '电访组别',
    value: '',
    prop: 'role_id',
    options: []
  },
  give_status:{
    type: 'select',
    placeholder: t('赠金领取状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未领取'),
      },{
        value: '1',
        label: t('已领取'),
      },{
        value: '2',
        label: t('已失效'),
      }
    ]
  },
  status:{
    type: 'select',
    placeholder: t('审核状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('待审核'),
      },{
        value: '1',
        label: t('通过'),
      },{
        value: '2',
        label: t('自动通过'),
      },{
        value: '3',
        label: t('拒绝'),
      }
    ]
  },
  search: {
    type: "button",
    value: t("搜索"),
    handle: "search",
    prop: "search"
  },
  export: {
    type: "button",
    value: t("导出"),
    handle: "export",
    prop: "export"
  }
};
const searchListBox = reactive({
  searchList
});

const pagination = reactive({
  page: 1, //页数
  limit: 12, //条数
  total: 0, //总数
  username: "", //id 推广码 用户名 精确搜索
  export: 0,
  televised:'',
  assign_time:'',
  role_id:'',
  give_status:'',
  status:'',
  add_time:'',
  field: '',
  order: '',//排序 desc 或 asc
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pagination.export = 0;
  distribute(pagination).then((res: any) => {
    tableData.dataList = res.data;
    pagination.total = res.total;
    searchList.role_id.options = res.admin_role
    // console.log(res)
    // pagination.page = res.data.current_page
  });
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
};

const selectDateChange = ({ starTime, endTime, index }) => {
  searchListBox.searchList[index].value[0] = new Date(starTime);
  searchListBox.searchList[index].value[1] = new Date(endTime);
};

//点击确定
const handleSerch = () => {
  for (const key in pagination) {
    if (searchListBox.searchList[key]) {
      if (
        searchListBox.searchList[key].type == "date" ||
        searchListBox.searchList[key].type == "time"
      ) {
        const val = searchListBox.searchList[key].value;
        const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
        pagination[key] = time;
      } else {
        pagination[key] = searchListBox.searchList[key].value;
      }
    }
  }
  pagination.page = 1;
  init(pagination);
};

const visibleUserInfo = ref(false);
const showUid = ref(0);
const showUserInfo = uid => {
  visibleUserInfo.value = true;
  showUid.value = uid;
};

//弹框写法
const visible = ref(false);
const dialogList = {
  status: {
    type: 'radio',
    label: '审核状态',
    placeholder: '审核状态',
    value: 1,
    prop: 'status',
    options: [
      {
        label: 1,
        name: '通过'
      },
      {
        label: 3,
        name: '拒绝'
      }
    ]
  },
  price:{
    type: 'input',
    ty:'number',
    label: '派发金额',
    placeholder: '派发金额',
    tip: '自定义派发金额，不填则按原派发金额',
    value: '',
    prop:'price'
  },
  water:{
    type: 'input',
    ty:'number',
    label: '流水倍数',
    placeholder: '提现需要的流水倍数',
    tip: '自定义流水倍数，不填则按原流水倍数',
    value: '',
    prop:'water'
  }
}

const dialogModel = reactive({
  status:1,
  price: '',
  water:'',
  ids:''
})


const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}

const manualRecharge = () => {
  if(selectAll.length <= 0){
    message("请选择用户", { type: "warning" });
    return;
  }
  visible.value = true
}

const saveAdd = () => {
  const query = {
    info: {
      ...dialogModel
    }
  }
  distributesave(query).then((res: any) => {
    if (res.code == 1) {
      visible.value = false
       message(res.msg, { type: 'success' });
       init();
    }
  })
}

const sortChange2 = (res) => {
  pagination.field = res.prop;
  if (res.order) {
    pagination.order = res.order == 'descending' ? 'DESC' : 'ASC';
  } else {
    pagination.order = '';
  }
  init()
  return false;
}

//选中数据
let selectAll = [];
const sortChange = val => {
  selectAll = val;
  const arr = []
  for (const key in selectAll) {
    arr.push(selectAll[key].id)
  }
  dialogModel.ids = arr
};


</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />

  <commDialog title="批量审核" :dialogObj="dialogModel" @currentChage="handleDialogChange" @save="saveAdd" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >



    </commDialog>
   <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :is="defineAsyncComponent(()=> import('@/views/follow/userreport.vue'))" :back="true" field="1" @backSelect="eidtUsername"/>
          </div>
    </el-dialog>
   <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('distributesave')" type="primary" @click="manualRecharge">{{ $t('批量审核') }}</el-button>
      </div>
    </div>


    <pure-table :data="tableData.dataList" width="100%" :columns="columns"   @selection-change="sortChange" @sort-change="sortChange2">

    <template #type="{ row }">
          <el-tag size="small" plain v-if="row.type == 0">{{ $t('手动') }}</el-tag>
          <el-tag size="small" plain v-else-if="row.type == 1">{{ $t('自动') }}</el-tag>
    </template>
    <template #status2="{ row }">
          <el-tag size="small" plain v-if="row.status2 == 0">{{ $t('待审核') }}</el-tag>
          <el-tag size="small" type="success" v-else-if="row.status2 == 1">{{ $t('通过') }}</el-tag>
          <el-tag size="small" type="success" v-else-if="row.status2 == 2">{{ $t('自动通过') }}</el-tag>
          <el-tag size="small" type="danger" v-else-if="row.status2 == 3">{{ $t('拒绝') }}</el-tag>
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
<style scoped>
.btmNav {
  padding-top: 10px;
}
.line-box{
  margin:10px 0;
}
.user-box-input{
  width: 300px;
}
</style>
