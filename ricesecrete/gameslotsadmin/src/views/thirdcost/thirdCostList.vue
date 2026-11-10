<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";



const { proxy } = getCurrentInstance();
const columns = [
  {
    label: transformI18n("时间"),
    prop: "tcl_intime"
  },
  {
    label: transformI18n("原分值"),
    prop: "tcl_old"
  },
  {
    label: transformI18n("改变分值"),
    prop: "tcl_change"
  },
  {
    label: transformI18n("新分值"),
    prop: "tcl_new"
  },
  {
    label: transformI18n("操作类型"),
    slot: "tcltype"
  },
  {
    label: transformI18n("操作人"),
    prop: "tcl_opstaff"
  }
];

const nowcost = reactive({
  cost: 0,
  money: 0,
  rate: 0.05
});

//弹框写法
const visibleAddbox = ref(false); //上分弹框

const dialogAddboxList = reactive({
  info: {
    type: "text",
    label: "上分兑换比例",
    value: "",
    prop: "info",
    tip: ""
  },
  price: {
    type: "input",
    label: "上分金额",
    placeholder: "请输入上分金额，自动按比例转换为分值",
    value: "",
    prop: "price"
  },
  monthclear: {
    type: "radio",
    value: 0,
    label: transformI18n("是否月清"),
    prop: "monthclear",
    options: [
      {
        label: 1,
        name: "是"
      },
      {
        label: 0,
        name: "否"
      }
    ]
  },
  fen: {
    type: "text",
    label: "上分值",
    value: "",
    prop: "fen",
    tip: ""
  },
});
const dialogAddboxModel = reactive({
  rate: 1,
  price: 0,
  monthclear: 0
});
const handleDialogChange = ({ value, index }) => {
  console.log(index)
  dialogAddboxModel[index] = value;
  if (index == "price") {
    dialogAddboxList.fen.tip = (value / dialogAddboxModel["rate"]).toFixed(2);
  }
  console.log(dialogAddboxModel)
};
//上分保存
const handleAddbxSave = () => {
  console.log(dialogAddboxModel)
  http
    .post("/thirdcost/upcost", {
      data: {
        ...dialogAddboxModel
      }
    })
    .then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        visibleAddbox.value = false;
        handleBtn();
        getcost();
      } else {
        message(res.msg, { type: "error" });
      }
    });
};
const handleAddbox = data => {
  console.log(data);
  visibleAddbox.value = true;
  dialogAddboxModel["rate"] = data.rate;
  dialogAddboxList.info.tip = data.rate;
};



const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
};

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  type: {
    type: "select",
    placeholder: "类型",
    value: "all",
    prop: "type",
    span: 8,
    options: [
      {
        value: 0,
        label: '节点'
      },
      {
        value: 1,
        label: '上分'
      },
      {
        value: 2,
        label: '月清'
      }
      ,
      {
        value: 'all',
        label: '全部'
      }
    ]
  },
  search: {
    type: "button",
    value: "搜索",
    handle: "search",
    prop: "search",
    span: 8
  }
};
const searchListBox = reactive({
  searchList
});

const pagination = reactive({
  page: 1, //页数
  limit: 12, //条数
  total: 0, //总数
  type: null
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取当前分值
getcost();
function getcost() {
  http.get('/thirdcost/status').then((res: any) => {
    console.log(res);
    console.log(nowcost.cost);
    nowcost.cost = res.data.cost;
    nowcost.money = res.data.money;
    nowcost.rate = res.data.rate;
    console.log(nowcost.cost);
  });
}
//获取列表数据
init();
function init() {
  http.post("/thirdcost/list", {
    data: {
      ...pagination
    }
  }).then((res: any) => {
    tableData.dataList = res.data;
    pagination.total = res.total;
  });

}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init();
};

//输入框的数据
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  console.log(searchListBox.searchList)
};
//点击确定
const handleBtn = () => {
  // console.log('点击');
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
    //console.log(pagination)
  }
  pagination.page = 1;
  init();
};



</script>
<template>
  <div style="margin-top: 10px;">
    <div>
      <div>当前剩余分值：<span style="color: red;">{{ nowcost.cost }}</span>[转换金额：{{ nowcost["money"] }}] 当前分值兑换比率：<span
          style="color:blue;">{{ nowcost["rate"] }}</span>
        <el-button size="small" type="primary" v-on:click="handleAddbox(nowcost)" v-if="hasAuth('upscore')">
          {{ $t('上分') }}
        </el-button>
      </div>
    </div>
    <div class="flex-bc line-box">

      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
      </div>
    </div>

    <commDialog style="width: 50%" title="三方平台服务费上分" width="40%" @save="handleAddbxSave" :dialogObj="dialogAddboxModel"
      @currentChage="handleDialogChange" :listRules="listRules" :list="dialogAddboxList" :visible="visibleAddbox"
      @close="visibleAddbox = false" />

    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #tcltype="{ row }">
        <el-tag size="small" v-if="row.tcl_type == 0" type="danger">{{ $t('节点') }}</el-tag>
        <el-tag size="small" v-else-if="row.tcl_type == 1" type="warning">{{ $t('上分') }}</el-tag>
        <el-tag size="small" v-else>{{ $t('月清') }}</el-tag>
      </template>

    </pure-table>
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
}

.line-box {
  margin-bottom: 10px;
}
</style>
