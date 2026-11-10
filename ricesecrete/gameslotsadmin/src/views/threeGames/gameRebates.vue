<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent,getCurrentInstance } from "vue";
import { gameBack, gameRefused, gameSend, gameAllRefused, gameAllSend } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from "@/utils/global";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
const { proxy } = getCurrentInstance();
defineOptions({
  name: "gameRebates"
});
const columns = [
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("用户信息"),
    prop: "username",
    width: 200,
    fixed: "left",
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.sb_uid)}>
          <p>UID:{row.sb_uid}</p>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
      </>
    )
  },
  {
    label: transformI18n("返水日期"),
    prop: "sb_dt",
    width: "150px",
    fixed: "left"
  },
  {
    label: transformI18n("当前VIP"),
    prop: "sb_viplvl",
    width: "150px"
  },
  {
    label: transformI18n("游戏分类"),
    prop: "type_name",
    width: "150px"
  },
  {
    label: transformI18n("有效投注"),
    prop: "sb_backbase",
    width: "150px"
  },
  {
    label: transformI18n("返水比例"),
    prop: "sb_backrate",
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag size="small">
          {parseFloat(row.sb_backrate * 100).toFixed(4)}%
        </el-tag>
      </>
    ),
    width: "150px"
  },
  {
    label: transformI18n("应返金额"),
    prop: "sb_backmoney",
    width: "150px"
  },
  {
    label: transformI18n("统计时间"),
    prop: "sb_statstime",
    width: "150px"
  },
  {
    label: transformI18n("返水状态"),
    slot: "sb_payed",
    width: "150px"
  },
  {
    label: transformI18n("返水时间"),
    prop: "sb_paytime",
    width: "150px"
  },
  {
    label: transformI18n("操作"),
    width: "150px",
    fixed: "right",
    slot: "right"
  }
];
//编辑
//编辑
const handleEidt = (row, idx) => {
  // visible.value = true;
  const msg = idx == 1 ? "确认拒绝吗？" : "确认派发吗？";
  const query = {
    edit: true,
    id: row.sb_id
  };
  proxy
    .$confirm(msg, "提示")
    .then(() => {
      idx == 1 ? noSend(query) : send(query);
    })
    .catch(() => {
      console.log("取消");
    });
};
function noSend(query) {
  gameRefused(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: "success" });
      init();
    } else {
      message(res.msg, { type: "error" });
    }
  });
}
function send(query) {
  gameSend(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: "success" });
      init();
    } else {
      message(res.msg, { type: "error" });
    }
  });
}

const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = {
  username: {
    type: "input",
    placeholder: "用户ID/邮箱/手机号",
    value: "",
    prop: "username"
  },
  status: {
    type: "select",
    placeholder: "状态",
    value: "",
    prop: "status",
    options: [
      {
        value: 0,
        label: "无效"
      },
      {
        value: 1,
        label: "待处理"
      },
      {
        value: 2,
        label: "已派发"
      }
    ]
  },
  date: {
    type: "date",
    placeholder: "返水日期",
    value: (): Array<string> => {
      return [];
    },
    prop: "date"
  },
  date2: {
    type: "time",
    placeholder: "返水时间",
    value: (): Array<string> => {
      return [];
    },
    prop: "date2"
  },
  search: {
    type: "button",
    value: "搜索",
    handle: "search",
    prop: "search"
  },
  export: {
    type: "button",
    value: "导出",
    handle: "export",
    prop: "export"
  },
  delivery_tpye: {
    type: "select",
    placeholder: "派发类型",
    value: 1,
    prop: "delivery_tpye",
    options: [
      {
        value: 1,
        label: "有效派发"
      },
      {
        value: 0,
        label: "所有"
      },
    ]
  },
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1, //页数
  limit: 15, //条数
  total: 0, //总数
  username: "",
  date: "",
  date2: "",
  status: "",
  delivery_tpye: 1, //派发类型
  export: 0,
  total_water_num: 0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  gameBack(pagination).then((res: any) => {
    tableData.dataList = res.data;
    pagination.total = res.count;
    pagination.total_water_num = res.total_water_num;
    // pagination.page = res.data.current_page
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
//搜索
const handleSerch = () => {
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == "date" || key == "date2") {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + " - " + val[1] : "";
        pagination[key] = time;
      } else {
        pagination[key] = list[key].value;
      }
    }
  }
  init();
};
//导出
const handleExport = () => {
  pagination.export = 1;
  gameBack(pagination).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    } else {
      message(res.msg, { type: "error" });
    }
  });
};
//导出弹窗列表
const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};
//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
  list[index].value = value;
};

const visibleUserInfo = ref(false);
const showUid = ref(0);
const showUserInfo = uid => {
  visibleUserInfo.value = true;
  showUid.value = uid;
};
//选中删除
let selectAll = [];
const handleSelectionChange = (val) => {
  console.log(val)
  selectAll = val;
}
const getIds =()=>{
  const s_arr = [];
  console.log(selectAll)
  selectAll.forEach(item => {
    s_arr.push(item.sb_id)
  })
  return s_arr.join(',');
}
//获取当前时间
//点击btn
const batchPf = () => {
  if (selectAll.length <= 0) {
    message(transformI18n('请选择要派发的数据'), { type: 'error' });
    return;
  }
  selectAll.forEach(item => {
    //验证是否选择已处理的
    if ( item.sb_payed != 1 ) {
      message(transformI18n('不能选择已处理的数据'), { type: 'error' });
      throw new Error('不能选择已处理的数据');
    }
  })
  proxy.$confirm(transformI18n('是否一键派发'), transformI18n('提示')).then(() => {
    gameAllSend({id: getIds()}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })
}
//点击btn
const batchJj = () => {
  if (selectAll.length <= 0) {
    message(transformI18n('请选择要拒绝的数据'), { type: 'error' });
    return;
  }
  selectAll.forEach(item => {
    //验证是否选择已处理的
    if ( item.sb_payed != 1 ) {
      message(transformI18n('不能选择已处理的数据'), { type: 'error' });
      throw new Error('不能选择已处理的数据');
    }
  })
  proxy.$confirm(transformI18n('是否一键拒绝'), transformI18n('提示')).then(() => {
    gameAllRefused({id: getIds()}).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })
}
</script>

<template>
  <div>
    <userInfo
      v-if="visibleUserInfo"
      :id="showUid"
      :visible2="visibleUserInfo"
      @handleClose="visibleUserInfo = false"
    />
    <commSerach
      @export="handleExport"
      @search="handleSerch"
      @currentChange="handleCurrentChange"
      :list="listbox.list"
    />
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <div class="flex-bc line-box">
      <div>
        <div class="tip">
          {{ $t("返水比例:当前返水比例，根据VIP级别和各游戏设置") }}
        </div>
      </div>
      <div class="flex-fi" />
    </div>

    <div class="line-box">
      <div class="flex-bc flex-fi">
        <div style="margin-right: 20px; font-size: 14px">
          {{ $t("反水总额") }}：
          <el-tag type="warning" size="small">{{
            pagination.total_water_num
          }}</el-tag>
        </div>
      </div>
      
      <div class="line-box">
        <el-button v-if="hasAuth('edit')" type="primary" @click="batchPf()">{{ $t('一键派发') }}</el-button>
        <el-button v-if="hasAuth('edit')" type="primary" @click="batchJj()">{{ $t('一键拒绝') }}</el-button>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #sb_payed="{ row }">
        <el-tag size="small" type="info" v-if="row.sb_payed == 0">{{
          $t("无效")
        }}</el-tag>
        <el-tag size="small" type="danger" v-if="row.sb_payed == 1">{{
          $t("未派发")
        }}</el-tag>
        <el-tag size="small" type="success" v-if="row.sb_payed == 2">{{
          $t("已派发")
        }}</el-tag>
      </template>
      <!-- <template #right="{row}">
          <template v-if="row.sff_payed == 1">
              <el-button size="small" type="danger" @click="handleEidt(row,1)">{{ $t('拒绝') }}</el-button>
              <el-button size="small" type="primary" @click="handleEidt(row,2)">{{ $t('派发') }}</el-button>
          </template>
          <template v-else-if="row.sff_payed == 2">
              <el-button size="small" type="primary" >{{ $t('已派发') }}</el-button>
          </template>
          <template v-else>
              <el-button size="small" type="info" >{{ $t('无效') }}</el-button>
          </template>
      </template> -->
      <template #right="{ row }">
        <template v-if="row.sb_payed == 1">
          <el-button
            v-if="hasAuth('edit')"
            size="small"
            type="danger"
            @click="handleEidt(row, 1)"
            >{{ $t("拒绝") }}</el-button
          >
          <el-button
            v-if="hasAuth('edit')"
            size="small"
            type="primary"
            @click="handleEidt(row, 2)"
            >{{ $t("派发") }}</el-button
          >
        </template>
        <template v-else-if="row.sb_payed == 2">
          <el-tag size="small" type="success">{{ $t("已派发") }}</el-tag>
        </template>
        <template v-else>
          <el-tag size="small" type="danger">{{ $t("无效") }}</el-tag>
        </template>
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
<style scoped lang="scss">
.btmNav {
  padding-top: 10px;
}
.line-box {
  margin: 10px 0;
}
.tip {
  font-size: 14px;
  color: var(--el-color-danger);
}
</style>
