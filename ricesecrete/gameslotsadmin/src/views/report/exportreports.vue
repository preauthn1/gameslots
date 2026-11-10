<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from "@/router/utils";
import { exportExportClear } from "@/api/user";



const { proxy } = getCurrentInstance();
const columns = [
{
    label: 'ID',
    prop: "er_id"
  },
  {
    label: transformI18n("用户账号"),
    prop: "username"
  },
  {
    label: transformI18n("日期"),
    prop: "er_intime"
  },
  {
    label: transformI18n("文件名"),
    prop: "er_filename"
  },
  {
    label: transformI18n("导出状态"),
    slot: "status"
  },
  {
    label: transformI18n("导出进度"),
    slot: "process"
  },
  {
    label: transformI18n("结束时间"),
    prop: "er_endtime"
  },
  {
    label: transformI18n("解压密码"),
    prop: "er_password"
  },
  {
    label: transformI18n("打包状态"),
    slot: "zustatus"
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button
          v-show={btnShowDownload(row)}
          size="small"
          type="primary"
          onClick={() => handleDownload(row)}
        >
          {transformI18n("下载")}
        </el-button>
        <el-button
          size="small"
          type="primary"
          onClick={() => handleClear(row)}
        >
          {transformI18n("清除缓存")}
        </el-button>
      </>
    )
  }
];

const handleClear = data => {
  exportExportClear({}).then((res: any) => {
    if (res.code == 1) {
       message(res.msg, { type: 'success' });
       init()
    }else{
       message(res.msg, { type: 'error' });
    }
  })
};

const handleDownload = data => {
  window.location.href=data.er_downloadurl;
};
const btnShowDownload = data => {
  //console.log(hasAuth("pay"))
  //console.log(data)
  return hasAuth("download") && data.er_downloadurl.length>0;
};

const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
};

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  name: {
    type: "input",
    placeholder: "名称或ID",
    value: "",
    prop: "name",
    span: 50
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
  name: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post("/report/get_export_reports_list", {
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
  //console.log(searchListBox.searchList)
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
    
    <div class="flex-bc line-box">
      
      <div class="flex-fi">
        <commSerach
          @search="handleBtn"
          @currentChange="handleCurrentChange"
          :list="searchListBox.searchList"
        />
      </div>
    </div>
    
    <pure-table
      :data="tableData.dataList"
      width="100%"
      :columns="columns"
    >
    <template #status="{row}">
          <el-tag size="small" v-if="row.er_started == 0" type="danger">{{ $t('排队中') }}</el-tag>
          <el-tag size="small" v-else-if="row.er_ended == 0" type="warning">{{ $t('正在导出') }}</el-tag>
          <el-tag size="small" v-else>{{ $t('导出完成') }}</el-tag>
      </template>
      <template #zustatus="{row}">
          <el-tag size="small" v-if="row.er_ended <= 1" type="danger">{{ $t('等待打包') }}</el-tag>
          <el-tag size="small" v-else-if="row.er_ended == 2" type="warning">{{ $t('打包完成') }}</el-tag>
          <el-tag size="small" v-else>{{ $t('上传完成') }}</el-tag>
      </template>
      <template #process="{row}">
          <div>{{row.bx_num}}</div>
          <div>{{$t('进度')}}:{{row.per}}%</div>
          <div>{{$t('数据')}}:{{row.er_process}}/{{ row.er_datacount }}</div>
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
}
.line-box {
  margin-bottom: 10px;
}
</style>
