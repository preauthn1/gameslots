<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent, computed } from "vue";
import { redPacketDayList, redPacketDayEdit } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { Sign } from "crypto";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'redPacketDayList'
})

const props = defineProps({
  id: String,
})
const rId = computed(() => {
  return props.id ? props.id : 0;
})

const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("活动id"),
    prop: "rid",
  },
  {
    label: transformI18n("活动模式"),
    slot: "model",
  },
  {
    label: transformI18n("有效日"),
    prop: "week_str",
  },
  {
    label: transformI18n("有效时间段"),
    prop: "validity_time_str",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot: 'right'
  }
];

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {

}
const searchListBox = reactive({
  searchList
})


const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  rid: rId,//活动id
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  redPacketDayList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
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
}
//点击确定
const handleBtn = () => {
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  validity_time_str: {
    type: 'slot',
    label: '时间区间',
    placeholder: '时间区间',
    value: '',
    name: 'validity_time_str',
    prop: 'validity_time_str',
  }
}
const dialogModel = reactive({
  rid: '',
  week: 0,
  model:1,
  validity_time_str: "",
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}

const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id: row.id
  }
  clickIndex.value = 1;
  redPacketDayEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          dialogList[key].value = res.data[key]
          list2Box.dialogList[key].value = res.data[key]
        }
        dialogModel[key] = res.data[key]
        if(key == 'validity_time_str'){
          try {
            dialogModel[key] = res.data[key];
            const temp_json = JSON.parse(res.data[key]);
            TempJson.value = [];
            temp_json.forEach((item) => {
              TempJson.value.push({
                startTime: item.split("-")[0],
                endTime: item.split("-")[1]
              })
            })
            console.log(TempJson.value);
          }catch (error) {
            console.log(error);
          }
        }
      }
      visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    redPacketDayEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  }
}

const timeSetShow = ref(false);
const TempJson = ref([
  {
    startTime: '',
    endTime: '',
  }
]);
const startTime = ref('');
const addTime = () => {
  TempJson.value.push(
    {
    startTime: '',
    endTime: '',
  }
  )
}
const delTime = (index) => {
  TempJson.value.splice(index, 1);
}

const onStartTime = (val) => {
  const temp = [];
  TempJson.value.forEach((item) => {
    temp.push(item.startTime+"-"+item.endTime);
  })
  dialogModel['validity_time_str'] = JSON.stringify(temp);
  console.log(dialogModel['validity_time_str']);

}
const onEndTime = (val) => {
  const temp = [];
  TempJson.value.forEach((item) => {
    temp.push(item.startTime+"-"+item.endTime);
  })
  dialogModel['validity_time_str'] = JSON.stringify(temp);
  console.log(dialogModel['validity_time_str']);
}

//判断选择时间已经存在时间区间中
const isInTime = (val) => {
  let flag = false;
  TempJson.value.forEach((item) => {
    if (item.startTime == val || item.endTime == val) {
      flag = true;
    }
  })
  return flag;
}

</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->

    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template #validity_time_str>
        <div>
            <div class="flex-fi user-box bottom-2px" v-for="(item,index) in TempJson" :key="index">
              <el-time-select placeholder="起始时间" v-model="item.startTime" start="00:00" step="00:10" end="23:50" @change="onStartTime"/>
              <el-time-select placeholder="结束时间" v-model="item.endTime" start="00:00" step="00:10" end="23:50" @change="onEndTime" :minTime="item.startTime"/>
              <el-button style="margin-left: 20px" type="danger" @click="delTime(index)">{{ $t("删除") }}</el-button>
            </div>
            <div class="flex-fi user-box">
            <el-button style="margin-left: 20px" type="primary" @click="addTime()">{{ $t("添加区间") }}</el-button>
          </div>
        </div>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #model="{ row }">
        <el-tag size="small" type="success" v-if="row.model == 1">{{ $t('每日') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.model == 2">{{ $t('每周') }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('启用') }}</el-tag>
        <el-tag size="small" type="error" v-else-if="row.status == 2">{{ $t('禁用') }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑')
          }}</el-button>
      </template>
    </pure-table>
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
  padding-bottom: 10px;
}

.line-box {
  margin-bottom: 10px;
}
.bottom-2px{
  margin-bottom: 2px;
}

</style>
