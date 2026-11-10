<script setup lang="tsx">
import { reactive, ref } from "vue";
import { agentReportLists } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from "@/utils/global";
import { transformI18n } from "@/plugins/i18n";
const columns = [
  //TableColumnList
  {
    label: transformI18n("用户名"),
    prop: "username",
    width: "150"
  },
  {
    label: transformI18n("推广码"),
    prop: "rec_code",
    width: "150"
  },
  {
    label: transformI18n("下级总人数"),
    prop: "count_pnumber",
    width: "150"
  },
  {
    label: transformI18n("新注册人数"),
    prop: "new_reg",
    width: "150"
  },
  {
    label: transformI18n("充值人数"),
    prop: "recharge_pnumber",
    width: "150"
  },
  {
    label: transformI18n("充值金额"),
    prop: "recharge_amount",
    width: "150"
  },
  {
    label: transformI18n("首充金额"),
    prop: "first_recharge_amount",
    width: "150"
  },
  {
    label: transformI18n("首充人数"),
    prop: "first_recharge_pnumber",
    width: "150"
  },
  {
    label: transformI18n("首充占比"),
    width: "150",
    cellRenderer: ({ index, row }) => (
      <>
        <span>{row.first_recharge_zb}%</span>
      </>
    )
  },
  {
    label: transformI18n("首充外复充人数"),
    width: "150",
    prop: "two_recharge_pnumber"
  },
  {
    label: transformI18n("首充外复充占比"),
    cellRenderer: ({ index, row }) => (
      <>
        <span>{row.two_recharge_zb}%</span>
      </>
    )
  },
  {
    label: transformI18n("多笔复充人数"),
    width: "150",
    prop: "two_recharge_pnumber2"
  },
  {
    label: transformI18n("多笔复充占比"),
    cellRenderer: ({ index, row }) => (
      <>
        <span>{row.two_recharge_zb2}%</span>
      </>
    )
  },
  {
    label: transformI18n("提现金额"),
    width: "150",
    prop: "withdrawal_amount"
  },
  {
    label: transformI18n("提现人数"),
    width: "150",
    prop: "withdrawal_pnumber"
  }
  // {
  //   label: transformI18n("操作"),
  //   cellRenderer: ({ index, row }) => (
  //     <>
  //       <el-button size="small" type="primary" onClick={() => handleEdit(index, row)}>
  //         编辑
  //       </el-button>
  //     </>
  //   )
  // }
];

const handleEdit = (index, row) => {};

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  username: {
    type: "input",
    placeholder: "UID/邮箱/手机号",
    value: "",
    prop: "username"
  },
  date: {
    type: "time",
    value: (): Array<string> => {
      return [];
    },
    prop: "date"
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
  username: "",
  date: ""
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  agentReportLists(pagination).then((res: any) => {
    tableData.dataList = res.data;
    pagination.total = res.count;
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
  // console.log('点击');
  //搜索列表 没有日期的写法
  //   for (var key in pagination) {
  //       if (key == searchList[key]?.prop) {
  //         pagination[key] = searchList[key].value;
  //       }
  // }
  //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == "date") {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
        pagination[key] = time;
      } else {
        pagination[key] = searchList[key].value;
      }
    }
  }
  pagination.page = 1;
  init(pagination);
};
</script>

<template>
  <div>
    <commSerach
      @search="handleBtn"
      @currentChange="handleCurrentChange"
      :list="searchListBox.searchList"
    />
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" />
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
.btmNav {
  padding-top: 10px;
}
</style>
