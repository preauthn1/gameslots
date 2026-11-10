<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent, getCurrentInstance, computed } from "vue";
import { rocketActivityRecordList } from "@/api/user";
import { message } from "@/utils/message";
import { hasAuth } from '@/router/utils';
import { storageLocal } from "@pureadmin/utils";

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("ID"),
    prop: "id",
    width: 50
  },
  {
    label: transformI18n("用户id"),
    prop: "uid",
  },
  {
    label: transformI18n("活动名称"),
    prop: "r_name",
  },
  {
    label: transformI18n("当前总里程"),
    prop: "now_mileage",
  },
  {
    label: transformI18n("当前高度区间"),
    prop: "now_level",
  },
  {
    label: transformI18n("当前领取的宝箱区间"),
    prop: "now_get_level",
  },
  {
    label: transformI18n("参与时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("最近一次加注时间"),
    prop: "update_time",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot: 'right'
  }
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  uid: {
    type: 'input',
    placeholder: 'UID',
    value: '',
    prop: 'uid'
  },
  now_level: {
    type: 'input',
    label: '当前高度区间',
    placeholder: '当前高度区间',
    prop: 'now_level',
    value: '',
  },
 date: {
    type: 'time',
    placeholder: '开始时间',
    value: (): Array<string> => {
      return []
    }
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export:{
    type: 'button',
    value:'导出',
    handle: 'export',
    prop: 'export',
  }
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  export:0,//导出
  now_level: '',//区间
  uid: '',//用户uid
  date: '',//时间
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  rocketActivityRecordList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    countDataBox.value = res.statistics
    // list2Box.dialogList.lang.options = res.langs
  })
}
//导出
const handleExport = () => {
  pagination.export = 1;
  rocketActivityRecordList(pagination).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    }else {
      message(res.msg, { type: 'error' });
    }
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
const handleCurrentChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  pagination[index] = value
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  //时间转换
  const val = searchList['date'].value;
  // console.log(val)
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination['date'] = time//时间
  init(pagination);
}
const countDataBox: any = ref({})

const boxShow = ref(false);
const rid = ref("");
const uid = ref("");
const handleBoxList = row => {
  rid.value = row.rid;
  uid.value = row.uid;
  boxShow.value = true;
};

const fuelShow = ref(false);
const frid = ref("");
const fuid = ref("");
const handleFuelList = row => {
  frid.value = row.rid;
  fuid.value = row.uid;
  fuelShow.value = true;
};

const downloadListShow = ref(false);
function handleDownloadList() {
  downloadListShow.value = true;
};

</script>

<template>
  <div style="padding-bottom: 40px;">
    <commSerach @export="handleExport" @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList"  />
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
    <el-dialog v-model="boxShow" :title="$t('宝箱记录')" width="80%" heith="100%">
      <component :uid="uid" :rid="rid" :is="
          defineAsyncComponent(() =>
            import('@/views/huodongguanli/rocketActivityBox.vue')
          )
        " />
    </el-dialog>
    <el-dialog v-model="fuelShow" :title="$t('加注燃料记录')" width="80%" heith="100%">
      <component :uid="fuid" :rid="frid" :is="
          defineAsyncComponent(() =>
            import('@/views/huodongguanli/rocketActivityFuel.vue')
          )
        " />
    </el-dialog>
    <div class="flex-bc line-box">
      <div class="flex-bc">
        <div style="margin-left:20px;font-size: 14px;">
          <el-tag size="large">{{ $t('参与用户') }}:{{ countDataBox.user_count }}</el-tag>
          <el-tag size="large">{{ $t('加注过燃料的用户') }}:{{ countDataBox.now_mileage }}</el-tag>
          <el-tag size="large">{{ $t('总里程') }}:{{ countDataBox.now_mileage }}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('rocketActivityBox')" type="primary" @click="handleBoxList(row)">{{ $t('宝箱记录')
          }}</el-button>
        <el-button size="small" v-if="hasAuth('rocketActivityFuel')" type="primary" @click="handleFuelList(row)">{{ $t('燃料加注记录')
          }}</el-button>
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
  padding-bottom: 30px;
}
</style>
