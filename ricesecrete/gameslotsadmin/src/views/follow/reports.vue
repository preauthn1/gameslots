<script setup lang="tsx">
import { reactive, ref, getCurrentInstance } from "vue";
import { reports } from "@/api/user";
import { message } from "@/utils/message";
import seeData from "@/components/user/seeData.vue";
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import router from "@/router";
import { http } from '@/utils/http';
defineOptions({
  name: "reports"
});
const { t } = useI18n();
const { proxy } = getCurrentInstance();
const emit = defineEmits(['backSelect'])
const props = defineProps({
  back: Boolean,
  field: Number,
})
const columns = [
  {
    label: t("日期"),
    prop: "day",
    sortable: true
  },
  {
    label: t("电访接通人数"),
    prop: "televised_count",
    sortable: true
  },
  {
    label: t("赠金发放人数"),
    prop: "give_count",
    sortable: true
  },
  {
    label: t("赠金领取人数"),
    prop: "receive_count",
    sortable: true
  },
  {
    label: t("赠金领取总额"),
    prop: "give_price",
    sortable: true
  },
  {
    label: t("领取赠金后入金总人數"),
    prop: "cash_count",
    sortable: true
  },
  {
    label: t("领取赠金后出金总人數"),
    prop: "out_count",
    sortable: true
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
  date: {
    type: "time",
    placeholder: t("开始时间"),
    value: (): Array<string> => {
      return [];
    }
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
  date: '',
  username: '',
});

const pagination2 = reactive({
  page: 1,//页数
  limit: 10,//条数
  total: 0,//总数
  id: '',
  day: '',
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  reports(pagination).then((res: any) => {
    tableData.dataList = res.data;
  });
}

const onPageSizeChange = (size: number) => {
  init();
};
const onCurrentChange = (current: number) => {
  init();
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
  init();
};

const visibleUserInfo = ref(false);
const showUid = ref(0);
const showUserInfo = uid => {
  visibleUserInfo.value = true;
  showUid.value = uid;
};

</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach
      @search="handleSerch"
      @currentChange="handleCurrentChange"
      :list="searchListBox.searchList"
    />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >

    </pure-table>
<!--    <div class="btmNav">
      <el-pagination
        class="float-right"
        v-model:currentPage="pagination2.page"
        :page-size="pagination2.limit"
        :total="pagination2.total"
        :page-sizes="[12, 24, 36, 50, 100]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onCurrentChange"
      />
    </div> -->
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
