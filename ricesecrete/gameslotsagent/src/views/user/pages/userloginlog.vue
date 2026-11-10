<script setup lang="tsx">
import { reactive,ref } from "vue";
import {userloginlog} from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle, formaTime } from '@/utils/global'
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineOptions({
  name: 'userloginlogList'
})

 const columns = [//TableColumnList
    {
      label: t("UID"),
      prop: "uid",
    },
    {
      label: t("用户名"),
      prop: "username",
    },
    {
      label: t("邮箱"),
      prop: "mail",
    },
    {
      label: t("手机号"),
      prop: "phone",
    },
    {
      label: t("登录ip"),
      prop: "login_ip",
    },
    {
      label: t("登录时间"),
      prop: "login_time",
    },{
      label: t("登录设备"),
      prop: "device",
    }
  ];
const props = defineProps({
    uid: String,
})
//搜索的数据
const searchList = {
  key: {
    type: 'input',
    placeholder: t('IP/邮箱/手机号/用户名'),
    value: '',
    prop:'key'
  },
  date:{
    type: 'time',
    placeholder: '时间',
    value: (): Array<string> => {
      return []
    },
    prop:'date'
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
  key: '',
  date:'',
  uid:''
});
if (props?.uid) {
    pagination.uid = props.uid
}
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  userloginlog(pagination).then((res:any) => {
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
const selectChange = ({value,index}) => {
  searchListBox.searchList[index].value = value;
}

//输入框的数据
const handleInput = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  pagination.key = searchListBox.searchList[0].value + '';
  init(pagination);
}
//点击清楚uid
// const handleRemoveUid = () => {
//   removeUid('bank');
//   router.replace({ path: '/user/pages/userloginlog' })
//   pagination.key = '';
//   pagination.page = 1;
//   pagination.uid = '';
//   init();
// }
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
</script>

<template>
  <div class="log-box">
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange" :list="searchListBox.searchList"/>
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
