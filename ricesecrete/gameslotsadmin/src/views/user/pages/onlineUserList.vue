<script setup lang="tsx">
import {
  reactive,
  ref,
  defineAsyncComponent,
  getCurrentInstance,
  computed
} from "vue";
import { userOnlineList } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [
  //TableColumnList
  {
    label: transformI18n("用户id"),
    width: 100,
    prop: "uo_uid"
  },
  {
    headerRenderer: () => transformI18n("用户账号"),
    prop: "username",
    width: 200,
    cellRenderer: ({ row }) => (
      <>
        {/* <p title={row.username} style="white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{row.username}</p> */}
        <div >
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2" >{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2" >{row.mail}</p>
          </div>
        </div>
      </>
    )
  },
  {
    label: transformI18n("上线时间"),
    prop: "uo_stime"
  },
  {
    label: transformI18n("下线时间"),
    prop: "uo_etime"
  },
  {
    label: transformI18n("在线时长（秒）"),
    prop: "uo_ontime",
    width: 150
  },
  {
    label: transformI18n("总在线时长（秒）"),
    prop: "uo_ontimecntreal",
    width: 150
  },
  {
    label: transformI18n("状态"),
    slot: "status"
  },
  {
    label: transformI18n("时间"),
    prop: "uo_intime"
  }
];

//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  username:{
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'username'
  },
  online_time:{
    type: 'time',
    placeholder: '上线时间',
    value: ():Array<string> => {
      return []
    }
  },
  offline_time:{
    type: 'time',
    placeholder: '下线时间',
    value: ():Array<string> => {
      return []
    }
  },
  status:{
    type: 'select',
    placeholder: '状态',
    value: '',
    options: [
      {
        value: '2',
        label: '疑似下线',
      },{
        value: '1',
        label: '在线',
      },{
        value: '0',
        label: '离线',
      },
    ]
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

const pagination = reactive({
  page: 1, //页数
  limit: 12, //条数
  total: 0, //总数
  username: '',//用户
  online_time: "", //上线时间
  offline_time: "", //下线时间
  status: "", //状态
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  userOnlineList(pagination).then((res: any) => {
    console.log(res);
    tableData.dataList = res.data.data;
    pagination.total = res.data.total;
    pagination.page = res.data.current_page;
    // list2Box.dialogList.lang.options = res.langs
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

//输入框的数据
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  pagination[index] = value
};
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
};
</script>

<template>
  <div style="padding-bottom: 40px">
    <commSerach
      @search="handleBtn"
      @currentChange="handleCurrentChange"
      :list="searchListBox.searchList"
    />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.uo_onstate == 2">{{
          $t("疑似下线")
        }}</el-tag>
        <el-tag size="small" type="success" v-if="row.uo_onstate == 1">{{
          $t("在线")
        }}</el-tag>
        <el-tag size="small" type="danger" v-else-if="row.uo_onstate == 0">{{
          $t("离线")
        }}</el-tag>
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
  padding-bottom: 30px;
}
</style>
