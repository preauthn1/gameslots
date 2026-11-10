<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent, computed } from "vue";
import { rtpLists,rtpEdit,rtpAdd } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
defineOptions({
  name: 'rtpList'
})

const props = defineProps({
  id:String,
})
const tcid = computed(() => {
  return props.id ? props.id : 0;
})

const columns = [//TableColumnList
  {
    label: transformI18n("用户账号"),
    prop: "username",
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
    label: transformI18n("rtp"),
    prop: "ut_rtp",
    sortable: true
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  username:{
    type: 'input',
    label:'uid/用户名/邮箱/号码',
    placeholder:'uid/用户名/邮箱/号码',
    prop: 'username',
    value: '',
  },
  rtp:{
    type: 'input',
    label:'rtp',
    placeholder:'支持范围搜索: 0-10',
    prop: 'rtp',
    value: '',
    with: '500'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListBox = reactive({
  searchList
})


const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  tcid: tcid,//平台id
  username: '',//用户名
  rtp: '',//RTP
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  rtpLists(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    // pagination.page = res.data.current_page
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

//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  userIds: {
    type: "slot",
    label: "选择用户",
    placeholder: "选择用户",
    tip:'选择的用户必须要进入游戏，否则设置不会生效',
    value: "",
    name: "username",
    prop: "userIds",
    show: false,
  },
  ut_rtp:{
    type: 'input',
    label: 'RTP',
    placeholder: 'RTP',
    tip: '该参数必须根据三方平台的要求设定',
    value: 0,
    prop: 'ut_rtp',
  },
}
const dialogModel = reactive({
  tcid: tcid.value,
  userIds: '',
  ut_rtp: 0,
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}

const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    tcid:tcid.value,
    uid:row.id
  }
  clickIndex.value = 1;
  rtpEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if( key == 'tcid' ){
            continue;
          }
          if( key == 'userIds' ){
            dialogList[key].value = res.data['ut_uid']
            list2Box.dialogList[key].value = res.data['ut_uid']
            dialogModel[key] = res.data['ut_uid']
          }else if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
            // dialogList[key].value = res.data[key]
            dialogModel[key] = res.data[key]
            console.log(dialogList)
            console.log(list2Box.dialogList)
            console.log(dialogModel)
          }
        }
        list2Box.dialogList['userIds'].show = true;
        dialogList['userIds'].show = true;
        visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    rtpEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  } else {
     const query = {
      add: true,
      info: dialogModel
    }
    rtpAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  }
}

//添加
const handleAdd = () => {
  for (const key in dialogModel) {
    if( key == 'tcid'){
      continue;
    }
    if ( key == 'ut_rtp' ) {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  clickIndex.value = 2;
  list2Box.dialogList['userIds'].show = false;
  dialogList['userIds'].show = false;
  visible.value = true;
}

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}


//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.userIds.value = val;
  dialogModel.userIds = val;
  selectShow.value = false;
};
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div>
        <el-button type="primary" @click="handleAdd">{{ $t('批量设置') }}</el-button>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component
          :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          "
          :back="true"
          :field="1"
          @backSelect="eidtUsername"
        />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input
              v-model="dialogModel.userIds"
              clearable
              :placeholder="$t('选择用户')"
            />
            <el-button
              style="margin-left: 20px"
              type="primary"
              @click="selectUser"
              >{{ $t("选择用户") }}</el-button
            >
          </div>
          <div>{{ $t("选择的用户必须要进入游戏，否则设置不会生效") }}</div>
        </div>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns">
      <template #right="{row}">
          <el-button size="small" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
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
.btmNav{
  padding-top:10px;
  padding-bottom:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
