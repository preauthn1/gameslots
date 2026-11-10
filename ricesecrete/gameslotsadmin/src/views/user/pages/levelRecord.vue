<script setup lang="tsx">
import {
  reactive,
  ref,
  defineAsyncComponent,
  getCurrentInstance,
  computed
} from "vue";
import { levelRecordLists } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";
import menuList from "@/components/menu/menu.vue"

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [
  //TableColumnList

  {
    label: transformI18n("ID"),
    prop: "id",
    width: 50
  },
  {
    label: transformI18n("用户id"),
    prop: "uid"
  },
  {
    label: transformI18n("等级名称"),
    prop: "level_name"
  },
  {
    label: transformI18n("奖励类型"),
    slot: "reward_type"
  },
  {
    label: transformI18n("奖励金额"),
    prop: "reward_amount",
    width: 100
  },
  {
    label: transformI18n("时间"),
    prop: "create_time"
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
  title: {
    type: "input",
    placeholder: "等级名称",
    value: "",
    prop: "title"
  },
  reward_type: {
    type: "select",
    label: "奖励类型",
    placeholder: "奖励类型",
    prop: "reward_type",
    options: [
      {
        label: "按周奖励",
        value: 1
      },
      {
        label: "按月奖励",
        value: 2
      }
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
  title: "", //等级名称
  username: '',//用户
  reward_type: "" //奖励类型
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  console.log(123);
  levelRecordLists(pagination).then((res: any) => {
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
    <menuList />
    <commSerach
      @search="handleBtn"
      @currentChange="handleCurrentChange"
      :list="searchListBox.searchList"
    />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #reward_type="{ row }">
        <el-tag size="small" type="success" v-if="row.reward_type == 1">{{
          $t("按周奖励")
        }}</el-tag>
        <el-tag size="small" type="success" v-if="row.reward_type == 2">{{
          $t("按月奖励")
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
