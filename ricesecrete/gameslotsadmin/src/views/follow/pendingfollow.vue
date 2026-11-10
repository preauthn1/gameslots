<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
import { pendsave,pendingfollow, agentStatusEdit, userDetail } from "@/api/user";
import { message } from "@/utils/message";
import seeData from "@/components/user/seeData.vue";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import router from "@/router";
import { http } from '@/utils/http';
defineOptions({
  name: "pendingfollow"
});
const { t } = useI18n();
const { proxy } = getCurrentInstance();

const columns = [
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
    width: 320,
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
           <span>{t("短信状态")}:
           <el-tag size="small" v-show={row.sms_status == 0}>{t("未发送")}</el-tag>
           <el-tag size="small" type="success" v-show={row.sms_status == 1}>{t('已发送')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("客户意向")}:
            <el-tag size="small" v-show={row.intention_status == 0}>{t("未评估")}</el-tag>
            <el-tag size="small" type="danger" v-show={row.intention_status == 1}>{t('低')}</el-tag>
            <el-tag size="small" type="warning"  v-show={row.intention_status == 2}>{t('中')}</el-tag>
            <el-tag size="small" type="success" v-show={row.intention_status == 3}>{t('高')}</el-tag>
           </span>
            </p>
             <p>
           <span>{t("代理状态")}:
           <el-tag size="small" v-show={row.agent_status == 0}>{t("未申请")}</el-tag>
           <el-tag size="small" type="success" v-show={row.agent_status == 1}>{t('已申请')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("手机验证状态")}:
           <el-tag size="small" v-show={row.phone_status == 0}>{t("未完成")}</el-tag>
           <el-tag size="small" type="success" v-show={row.phone_status == 1}>{t('已完成')}</el-tag>
           </span>
           </p>
            <p>
           <span>{t("会员状态")}:
           <el-tag size="small" v-show={row.status == 0}>{t("禁用")}</el-tag>
           <el-tag size="small" type="success" v-show={row.status == 1}>{t('正常')}</el-tag>
           </span>
           <span style="margin-left:10px;">{t("赠金领取状态")}:
            <el-tag size="small" v-show={row.give_status == 0}>{t("未派发")}</el-tag>
            <el-tag size="small" type="warning" v-show={row.give_status == 1}>{t('未领取')} </el-tag>
            <el-tag size="small" type="success"  v-show={row.give_status == 2}>{t('已领取')} </el-tag>
            <el-tag size="small" type="danger"  v-show={row.give_status == 3}>{t('已失效')}</el-tag>
           </span>
            </p>
            <p>
            <span>{t("是否要领取赠金")}:
            <el-tag size="small" v-show={row.is_distribution == 0}>{t("未处理")}</el-tag>
            <el-tag size="small" type="warning" v-show={row.is_distribution == 1}>{t('否')}</el-tag>
            <el-tag size="small" type="success" v-show={row.is_distribution == 2}>{t('是')}</el-tag>
            </span>
            </p>
        </div>
      </>
    )
  },
  {
    label: t("赠金时间"),
    prop: "distribution_time",
    width: 260,
    cellRenderer: ({ row }) => (
      <>
        <div>
          <p><span>{t("派发时间")}: {row.distribution_time}</span></p>
          <p><span>{t("领取时间")}: {row.give_time}</span></p>
        </div>
      </>
    )
  },
  {
    label: t("注册时间"),
    width: 160,
    prop: "reg_time",
    sortable: true
  },
  {
    label: t("最近登陆时间"),
     width: 160,
    prop: "login_time",
    sortable: true
  },
  {
    label: t("电访时间"),
    width: 160,
    prop: "televised",
    sortable: true
  },
  {
    label: t("短信发送时间"),
    width: 160,
    prop: "sms_time",
    sortable: true
  },
  {
    label: t("回访派发时间"),
    width: 160,
    prop: "add_time",
    sortable: true
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
    label: t("操作"),
    fixed: "right",
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('save')} size="small" type="primary" onClick={() => handleEidt(row)}>{ t('编辑') }</el-button>
      </>
    )
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
  add_time: {
    type: "time",
    placeholder: t("回访派发时间"),
    value: (): Array<string> => {
      return [];
    }
  },
  televised_status:{
    type: 'select',
    placeholder: t('电访进度'),
    value: '',
    options: [
      {
        value: '1',
        label: t('待电访'),
      },{
        value: '4',
        label: t('待电访(已超时)'),
      },{
        value: '2',
        label: t('已电访'),
      },{
        value: '5',
        label: t('已电访(未回归)'),
      },{
        value: '3',
        label: t('电访2次以上'),
      },
    ]
  },
  role_id: {
    type: 'select',
    placeholder: '电访组别',
    value: '',
    prop: 'role_id',
    options: []
  },
  is_connected:{
    type: 'select',
    placeholder: t('电访状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未安排'),
      },{
        value: '1',
        label: t('未接通'),
      },{
        value: '2',
        label: t('已接通'),
      }
    ]
  },
  sms_status:{
    type: 'select',
    placeholder: t('短信发送状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未发送'),
      },{
        value: '1',
        label: t('已发送'),
      }
    ]
  },
  give_status:{
    type: 'select',
    placeholder: t('赠金领取状态'),
    value: '',
    options: [
    {
        value: '0',
        label: t('未派发'),
      },{
        value: '1',
        label: t('未领取'),
      },{
        value: '2',
        label: t('已领取'),
      },{
        value: '3',
        label: t('已失效'),
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
  televised_status:'',//电访进度
  televised:'',
  add_time:'',
  role_id:'',
  is_connected:'',
  sms_status:'',
  give_status:'',
  field: '',
  order: '',//排序 desc 或 asc
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  pagination.export = 0;
  pendingfollow(pagination).then((res: any) => {
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


//弹框写法
const visible = ref(false);
const dialogList = {
  televised_status: {
     type: 'radio',
     label: '电访进度',
     placeholder: '电访进度',
     value: 1,
     prop: 'televised_status',
     options: [
       {
         label: 1,
         name: '待电访'
       },
       {
         label: 2,
         name: '已电访'
       },
       {
         label: 3,
         name: '电访2次以上'
       }
     ]
   },
  is_connected: {
    type: 'radio',
    label: '电访是否接通',
    placeholder: '电访是否接通',
    value: 1,
    prop: 'is_connected',
    options: [
      {
        label: 1,
        name: '未接通'
      },
      {
        label: 2,
        name: '已接通'
      }
    ]
  },
 sms_status: {
    type: 'radio',
    label: '短信发送状态',
    placeholder: '短信发送状态',
    value: 0,
    prop: 'sms_status',
    options: [
      {
        label: 0,
        name: '未发送'
      },
      {
        label: 1,
        name: '已发送'
      }
    ]
  },
 intention_status: {
    type: 'radio',
    label: '客户意向',
    placeholder: '客户意向',
    value: 1,
    prop: 'intention_status',
    options: [
      {
        label: 1,
        name: '低'
      },
      {
        label: 2,
        name: '中'
      },
      {
        label: 3,
        name: '高'
      }
    ]
  },
  is_distribution: {
    type: 'radio',
    label: '是否要领取赠金',
    placeholder: '是否要领取赠金',
    value: 1,
    prop: 'is_distribution',
    options: [
      {
        label: 1,
        name: '否'
      }, {
        label: 2,
        name: '是'
      },
    ]
  },
  feedback: {
   type: 'input',
   label: '反馈内容',
   placeholder: '反馈内容',
   value: '',
   prop: 'feedback'
  },
  remark: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop: 'remark'
  },
  type:{
    type: 'select',
    label: '赠金派发类型',
    placeholder: '派发类型',
    value: 0,
    options: [
      {
        label: '手动',
        value:0
      },{
        label: '自动',
        value:1
      }
    ],
    prop:'type'
  },
  price:{
    type: 'input',
    ty:'number',
    label: '派发金额',
    placeholder: '派发金额',
    value: '',
    prop:'price'
  },
  water:{
    type: 'input',
    ty:'number',
    label: '流水倍数',
    placeholder: '提现需要的流水倍数',
    value: '',
    prop:'water'
  }
}
const dialogModel = reactive({
  is_connected:1,
  sms_status:0,
  intention_status:1,
  is_distribution:1,
  televised_status:1,
  feedback:'',
  remark:'',
  type:0,
  price:0,
  water:0,
  uid:''
})
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
  if(index == 'is_distribution'){
    handleRewardType(value)
  }
}
const list2Box = reactive({ dialogList })
const clickCurrentIndex = ref(1);
//编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    id:row.uid
  }
  pendsave(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      handleRewardType(dialogModel['is_distribution'])
      dialogModel.uid = res.data.uid;
      dialogModel.type = 0;
      dialogModel.price = 0;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}

//保存
const handleSave = () => {
  let query = {};
  if (clickCurrentIndex.value == 1) {
    query = {
      edit: true,
      info: dialogModel
    }
  } else {
    query = {
      add: true,
      info: dialogModel
    }
  }
  pendsave(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}


const visibleUserInfo = ref(false);
const showUid = ref(0);
const showUserInfo = uid => {
  visibleUserInfo.value = true;
  showUid.value = uid;
};

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

const handleRewardType = (value) => {
  if(value == 2){
    list2Box.dialogList['type'].show = list2Box.dialogList['price'].show = list2Box.dialogList['water'].show = false
    list2Box.dialogList['type'].value = 0
    list2Box.dialogList['price'].value = 0
  }else{
    list2Box.dialogList['type'].show = list2Box.dialogList['price'].show = list2Box.dialogList['water'].show = true
  }
}

</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />

    <commDialog title="编辑" width="50%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />

    <pure-table :data="tableData.dataList" width="100%" :columns="columns"   @selection-change="sortChange" @sort-change="sortChange2"/>

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
</style>
