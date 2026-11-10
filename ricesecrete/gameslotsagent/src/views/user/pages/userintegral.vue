<script setup lang="tsx">
import { reactive,ref} from "vue";
import {userIntegralMx,userEditSave} from "@/api/user";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import EiditScoreInfo from "@/components/user/EiditScoreInfo.vue";
import EiditScoreInfos from "@/components/user/EiditScoreInfos.vue"
const { t } = useI18n();
defineOptions({
  name: 'userIntegralmxList'
})

 const columns = [//TableColumnList
    {
      label: t("UID"),
      prop: "uid",
    },
    {
    headerRenderer: () => t("用户账号"),
    prop: "username",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        {/* <p title={row.username} style="white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{row.username}</p> */}
        <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2" >{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2" >{row.mail}</p>
          </div>
      </>
    )
  },
    {
      label: t("变动类型"),
      prop: "msg",
    },
    {
      label: t("变动积分"),
      prop: "integral",
    },
    {
      label: t("变动前积分"),
      prop: "old_integral",
    },
    {
      label: t("变动后积分"),
      prop: "new_integral",
    },
    {
      label: t("操作时间"),
      prop: "add_time",
    }
  ];
const props = defineProps({
    uid: String,
})
//搜索的数据
const searchList = {
  date: {
    type: 'time',
    placeholder: '时间',
    idx: 0,
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  username: {
    type: 'input',
    placeholder: '用户账号',
    idx: 1,
    prop: 'username',
    value: ''
  },
  search:{
    type: 'button',
    value: t('搜索'),
    handle: 'search',
    prop:'search'
  }
}
const searchListBox = reactive({
  searchList
})
// interface tabinfo {
//   page: number,
//   limit: number,
//   total: number,
//   key: string | '',
// }
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  date:'',
  username:'',
});
const dataList: any = [];
const tableData = reactive({ dataList });
const eiditScoreShow = ref(false)
const eiditScoresShow = ref(false)
//获取列表数据
init();
function init(query?: object) {
  userIntegralMx(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
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
const handleCurrentChange = ({value,index}) => {
  searchListBox.searchList[index].value = value;
}

//点击确定
const handleSerch = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
  pagination.page = 1;
   init(pagination);
}

//编辑保存
const EidtBtnScoreSave = (res) => {
  const { username, integral} = res;
  const query = {
    username,
    integral
  }
  // console.log(query);
  userEditSave(query).then((res: any) => {
    if (res.code == 1) {
      eiditScoreShow.value = false
      message(res.msg, { type: 'success' });
    }
  })
}
//编辑保存
const EidtBtnScoresSave = (res) => {
  const {integrals} = res;
  const query = {
    integrals
  }
  // console.log(query);
  userEditSave(query).then((res: any) => {
    if (res.code == 1) {
      eiditScoresShow.value = false
      message(res.msg, { type: 'success' });
    }
  })
}
</script>

<template>
  <div class="log-box">
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange" :list="searchListBox.searchList" :isAutoUpdate="false"/>
    <div class="btnlist">
        <el-button  @click="eiditScoreShow = true">{{ t('修改积分') }}</el-button>
        <el-button  @click="eiditScoresShow = true">{{ t('积分批量修改') }}</el-button>
    </div>
    <component :is="EiditScoreInfo" @handleClose="eiditScoreShow = false" :title="t('积分修改')"
    :dialogTableVisible="eiditScoreShow" @btnSave="EidtBtnScoreSave" />
    <component :is="EiditScoreInfos" @handleClose="eiditScoresShow = false" :title="t('积分批量修改')"
    :dialogTableVisible="eiditScoresShow" @btnSave="EidtBtnScoresSave" />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
       <template #content="{ row }">
        <span v-html="row.reg_ip" />
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
      <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
.log-box{
  position: relative;
}
.uidBtn{
   position: absolute;
  top:0;
  right:0;
  /* z-index: 100; */
}
</style>
