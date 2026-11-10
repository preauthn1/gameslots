<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance, h } from "vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { copyContent } from "@/utils/global";
import Report from "./report.vue";
import { addDialog } from "@/components/ReDialog";
defineOptions({
  name: 'adsList'
})
const { proxy } = getCurrentInstance();
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    headerRenderer: () => transformI18n("ID"),
    prop: "ac_id",
    width: 50
  },
  {
    headerRenderer: () => transformI18n("广告商"),
    prop: "ac_adtype",
  },
  {
    headerRenderer: () => transformI18n("渠道名称"),
    prop: "ac_name",
  },
  {
    headerRenderer: () => transformI18n("渠道代码"),
    prop: "ac_code",
  },
  {
    headerRenderer: () => transformI18n("绑定代理邀请码"),
    prop: "ac_share_code",
  },
  {
    headerRenderer: () => transformI18n("渠道链接"),
    slot: "channel_url",
    width: 250
  },
  {
    headerRenderer: () => transformI18n("状态"),
    slot: "ac_state",
  },
  {
    headerRenderer: () => transformI18n("注册用户数"),
    prop: "ac_user",
  },
  {
    headerRenderer: () => transformI18n("最近注册时间"),
    prop: "ac_reg_time",
  },
  {
    headerRenderer: () => transformI18n("备注"),
    prop: "ac_remark",
  },
  {
    headerRenderer: () => transformI18n("操作"),
    width: 200,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        <el-button v-show={hasAuth('report')} size="small" type="danger" onClick={() => handleReport(row)}>{ transformI18n('报表') }</el-button>
      </>
    )
  },
];
//弹框写法
const visible = ref(false);
const dialogList = {
  ac_name: {
    type: 'input',
    label: '渠道名称',
    placeholder: '渠道名称',
    value: '',
    prop: 'ac_name'
  },
  ac_adtype: {
    type: 'select',
    label: '广告商',
    placeholder: '广告商',
    value: '',
    prop: 'ac_adtype',
    options: [],
  },
  ac_code: {
    type: 'input',
    label: '像素代码',
    placeholder: '像素代码',
    value: '',
    prop: 'ac_code'
  },
  ac_token: {
    type: 'input',
    label: 'Token',
    placeholder: 'Token',
    tip: '填充Token后该广告渠道只用于服务器端发送事件',
    value: '',
    prop: 'ac_token'
  },
  ac_test_event_code: {
    type: 'input',
    label: 'test_event_code',
    placeholder: 'test_event_code',
    tip: '测试用,对接完后请删除',
    value: '',
    prop: 'ac_test_event_code'
  },
  ac_share_code: {
    type: 'input',
    label: '绑定代理邀请码',
    placeholder: '绑定代理邀请码',
    value: '',
    prop: 'ac_share_code'
  },
  ac_url: {
    type: 'input',
    label: '渠道绑定域名',
    placeholder: '渠道绑定域名',
    value: '',
    prop: 'ac_url'
  },
  ac_remark: {
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop: 'ac_remark'
  },
  ac_state: {
    type: 'select',
    label: '状态',
    placeholder: '状态',
    value: 1,
    prop: 'ac_state',
    options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ],
  },
}
const dialogModel = reactive({
  ac_id:'',
  ac_name: '',
  ac_adtype: '',
  ac_code: '',
  ac_share_code: '',
  ac_url: '',
  ac_state: '',
  ac_remark: '',
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}

const clickCurrentIndex = ref(1);
//编辑
const handleEidt = (row) => {
  clickCurrentIndex.value = 1
  const query = {
    find: true,
    ac_id:row.ac_id
  }
  http.post('/ads/channel_add', {data: query}).then((res: any) => {
    if (res.code == 1) {
      console.log(dialogList, res.data)
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.ac_id = res.data.ac_id;
      visible.value = true;
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
//点击添加
const handleAdd = () => {
  clickCurrentIndex.value = 2
  for (const key in dialogList) {
    if (dialogList[key].type == 'select') {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }
  }
  dialogModel.ac_id = '';
  visible.value = true;
}

//保存
const handleSave = () => {
  http.post('/ads/channel_add', {data: {
      add: true,
      info: dialogModel
    }}).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  name: {
    type: 'input',
    placeholder: '名称',
    value: '',
    prop: 'name',
    span: 16
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search',
    span: 8
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  name:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/ads/channel', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    list2Box.dialogList.ac_adtype.options = res.ad_type
  })
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
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
}
//点击确定
const handleBtn = () => {
  // console.log('点击');
  //搜索列表 没有日期的写法
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  init();
}

//删除
let selectAll = [];
const handleDelete = () => {
  if (selectAll.length <= 0) {
    message('请选择', { type: 'error' });
    return;
  }
  const arr = [];
  proxy.$confirm('确认删除吗？', '提示').then(() => {
    selectAll.forEach(item => {
      arr.push(item.ac_id);
    })
    deleteIds(arr.join(','))
  }).catch(() => {
  })

}
const handleSelectionChange = (val) => {
  selectAll = val;
}
function deleteIds(id) {
  const query = {
    ac_id:id
  }
  http.post('/ads/channel_delete', {data: query}).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        handleBtn();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
const copy = (val) => {
  copyContent(val)
}
const handleReport = (row) => {
  addDialog({
    title: "渠道["+row.ac_name+"]报表",
    hideFooter: true,
    fullscreen: true,
    contentRenderer: () => h(Report, { channel: row })
  });
}
</script>
<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <commDialog style="width: 50%;" title="广告渠道配置" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange">
      <template #ac_state="{ row }">
        <el-tag v-if="row.ac_state == 0" type="danger">{{ $t('停用') }}</el-tag>
        <el-tag v-else type="success">{{ $t('启用') }}</el-tag>
      </template>
      <template #channel_url="{ row }">
        <span>{{ row.channel_url }}</span>
        <span class="copy">
          <iconify-icon-online @click="copy(row.channel_url)" icon="material-symbols:content-copy-outline" />
        </span>
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
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 10px;
}
.copy {
  display: inline-block;
  cursor: pointer;
  margin-left: 3px;
  color: blue;
}
</style>
