<script setup lang="tsx">
 import { reactive,ref,getCurrentInstance  } from "vue";
import Dest from "@/components/user/Dest.vue";
import eidtSuper from "@/components/user/eidtSuper.vue";
import {userGetTopuser,userlevelList,addUser,editDetail,userEdit,userDetail,userRecedit} from "@/api/user";
import { message } from "@/utils/message";
import Eidit from "@/components/user/Eidit.vue";
import seeData from "@/components/user/seeData.vue";
// import { useRoute, useRouter } from "vue-router";
// import { getUid, removeUid } from "@/utils/route";
// const route = useRoute();
// const router = useRouter();
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const { proxy } = getCurrentInstance();

const props = defineProps({
  uid: String,
})

//点击节流  用户编辑操作
const UserItem = ref<object>({});
const dataList: any = [];
const tableData = reactive({ dataList });
const ajaxTrue = ref(false);
 const handleEdit = (index: number, row) => {
   if (ajaxTrue.value) return;
    ajaxTrue.value = true;
   editDetail({ id: row.id }).then((res:any) => {
     if (res.code == 1) {
       UserItem.value = res.data;
       eiditShow.value = true;
     }
      ajaxTrue.value = false;
    })
};
//修改上架打开控制
const eidtSuperShow = ref(false)
//修改上架
const eidtSuperId = ref('');
const eidtSuperIndex = ref(0);
const handleEidtSuper = (index:number,row) => {
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
      rec_id:value.top_code
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
//修改上架关闭
const eidtCloseSuper = () => {
   eidtSuperShow.value = false;
}
//资料控制开关
const seeDataShow = ref(false);
//资料数据
const seeDataInfo = ref<object>({});
//点击资料
const handleSeeData = (index: number, row) => {
  if (ajaxTrue.value) return;
    ajaxTrue.value = true;
  userDetail({id:row.id}).then((res: any) => {
    if (res.code == 1) {
      seeDataInfo.value = res.data;
      seeDataShow.value = true;
    }
     ajaxTrue.value = false;
  })

}
//资料点击保存
const seeDataSave = (item) => {
  console.log('点击保存');
  console.log(item)
}
//点击编辑获取用户数据
//点击启用用户
function statusEditfn(item) {
  const query = {
    status: item.status == 1 ? 0 : 1,
     id:item.id
  }
  userEdit(query).then((res:any) => {
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
    console.log('取消');
  })
}
const columns = [
    {
    headerRenderer: () => t("用户账号"),
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
      label: t("等级"),
      prop:'rec_level'
    },
    {
      label: t("推广码"),
      prop: "rec_code",
    },{
      label: t("推广用户"),
      prop: "top_name",
    },  {
      label: t("注册时间/注册ip"),
      // prop: "add_time",
      cellRenderer: ({ index, row }) => (
        <>
          <span>{row.add_time}/{ row.reg_ip }</span>
        </>
      )
    }, {
      label: t("登录时间/登录ip"),
      // prop: "add_time",
      cellRenderer: ({ index, row }) => (
        <>
          <span>{row.login_time}/{ row.end_login_ip }</span>
        </>
      )
    },{
      label: t("余额"),
      prop: "balance",
    },{
      label: t("状态"),
      prop: "status",
    },
    {
      label: t("操作"),
      fixed: "right",
      width: 150,
      cellRenderer: ({ index, row }) => (
        <>
          <el-button
            size="small"
            type="warning"
            onClick={() => handleSeeData(index + 1, row)}
          >
            { t('资料') }
          </el-button>
        </>
      )
    }
  ];



const height = window.innerHeight - 310;
//搜索的数据



const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',//排序字段 id 或 balance
  id:''

});
if (props?.uid) {
  pagination.id = props.uid
}
//获取列表数据
// if (getUid(route, 'top') != '') {
  init();
// }

function init() {
  userGetTopuser(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
  })

}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
 // init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
 //  init(pagination);
};


//导出
const handleExport = () => {

}

const dialogTableVisible = ref(false)
const eiditShow = ref(false)

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
    <!---添加用户弹出-->

    <!-- <component :is="Dest" @handleClose="dialogTableVisible = false" title="添加用户"  :dialogTableVisible="dialogTableVisible" @btnSave="btnaddSave" /> -->
    <!-- <Dest @handleClose="dialogTableVisible = false" title="添加用户"  :dialogTableVisible="dialogTableVisible" @btnSave="btnaddSave"></Dest> -->
    <!--用户编辑-->
    <!-- <component :is="Eidit" @handleClose="eiditShow = false" title="编辑用户" :item="UserItem"  :dialogTableVisible="eiditShow" @btnSave="EidtBtnaddSave" /> -->
    <!-- <Eidit @handleClose="eiditShow = false" title="编辑用户" :item="UserItem"  :dialogTableVisible="eiditShow" @btnSave="EidtBtnaddSave"></Eidit> -->
    <!--修改上级推广码-->
    <!-- <component :is="eidtSuper" title="编辑" :dialogTableVisible="eidtSuperShow" @btnSave="btnEidtSuperSave" @handleClose="eidtCloseSuper"/> -->
    <!-- <commSerach @export="handleExport" @search="handleBtn" @currentChange="selectChange"  :list="searchListBox.searchList"></commSerach> -->
    <!-- <component :is="userSelected" :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange" /> -->
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
   <!--资料-->
   <component :is="seeData" @handleClose="seeDataShow = false" :title="t('编辑')" :item="seeDataInfo"  :dialogTableVisible="seeDataShow" @btnSave="seeDataSave" />
    <!-- <div class="btnlist">
        <el-button type="primary" :plain="btnCurrent == index ? false:true" v-for="(item,index) in btnlist" :key="index" @click="handleBtnItem(item,index)">{{ item.name }}</el-button>
    </div> -->
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
       <template #content="{ row }">
        <span v-html="row.reg_ip" />
      </template>
       <template #status="{ row }">
          <el-button v-if="row.status == 1 " size="small" type="primary"  @click="useEnable(row)">{{ t('启用') }}</el-button>
          <el-button v-else type="danger" size="small"  @click="useEnable(row)">{{ t('禁用') }}</el-button>
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
    <!-- <addUser :dialogTableVisible="true"></addUser> -->
      <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped lang="scss">
.userEidt{
  padding:30px;
  .item{
    display: flex;
     align-items: center;
     margin-bottom: 20px;
    .name{
      width:100px;
      text-align: right;
      margin-right: 20px;
    }
  }
}
.btmNav{
  padding-top:10px;
}
.btnlist{
  display: flex;

  margin-bottom:15px;
}
</style>
