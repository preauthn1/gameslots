<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { serviceUrlStatistics } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'urlList'
})


const props = defineProps({
  url:String,
})
const serviceUrl = computed(() => {
  return props.url ? props.url : 0;
})


const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("UID"),
    prop: "uid",
  },
  {
    label: transformI18n("IP"),
    prop: "ip",
  },
  {
    label: transformI18n("地区"),
    prop: "address",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];
const handleEdit = (index,row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  ip:{
    type: 'input',
    placeholder: 'IP',
    value: '',
    prop:'ip'
  },
  address:{
    type: 'input',
    placeholder: '地区',
    value: '',
    prop:'address'
  },
  time:{
    type: 'time',
    placeholder: '时间',
    idx:1,
    value: (): Array<string> => {
      return []
    }
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  url: serviceUrl.value,//serviceUrl_id
  address: '',//地区
  ip: '',//ip
  date: '',//时间
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  serviceUrlStatistics(pagination).then((res:any) => {
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
const handleCurrentChange = ({ value,index }) => {
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
  //时间转换
  const val = searchList['time'].value;
  console.log(val)
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination['date'] = time//时间
  init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  url:{
    type: 'input',
    label: '链接',
    placeholder: '链接',
    value: '',
    prop:'url'
  },
}
const dialogModel = reactive({
  url: '',
  id:''
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
    id:row.id
  }
  clickIndex.value = 1;
  // telegramEdit(query).then((res: any) => {
  //    if (res.code == 1) {
  //      for (const key in dialogModel) {
  //        if (key == dialogList[key]?.prop) {
  //           list2Box.dialogList[key].value = res.data[key]
  //        }
  //        dialogModel[key] = res.data[key]
  //      }
  //       visible.value = true;
  //     } else {
  //       message(res.msg, { type: 'error' });
  //   }
  // })
}

const handleSave = () => {
  // if (clickIndex.value == 1) {
  //   const query = {
  //     edit: true,
  //     info: dialogModel
  //   }
  //   telegramEdit(query).then((res: any) => {
  //     if (res.code == 1) {
  //       message(res.msg, { type: 'success' });
  //       visible.value = false;
  //       init();
  //     } else {
  //       message(res.msg, { type: 'error' });
  //     }
  //   })

  // } else {
  //    const query = {
  //     add: true,
  //     info: dialogModel
  //   }
  //   telegramAdd(query).then((res: any) => {
  //     if (res.code == 1) {
  //       message(res.msg, { type: 'success' });
  //       visible.value = false;
  //       init();
  //     } else {
  //       message(res.msg, { type: 'error' });
  //     }
  //   })
  // }
}

//添加
const handleAdd = () => {
  for (const key in dialogModel) {
    if (key == 'id') {
      dialogModel[key] = ''
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
    }
  }
  clickIndex.value = 2;
  visible.value = true;
}


//删除
let selectAll = [];
const handleDelet = () => {
  if (selectAll.length <= 0) {
      message(transformI18n('请选择'), { type: 'error' });
      return;
  }
   const arr = [];
   proxy.$confirm(transformI18n('确认删除吗？'), transformI18n('提示')).then(() => {
    selectAll.forEach(item => {
      arr.push(item.id);
    })
    deleteIds(arr.join(','))
  }).catch(() => {
    console.log('取消');
  })

}
const handleSelectionChange = (val) => {
  selectAll = val;
}
function deleteIds(id) {
  const query = {
    delete: true,
    id
  }
  // telegramDelete(query).then((res: any) => {
  //   if (res.code == 1) {
  //       message(res.msg, { type: 'success' });
  //       init();
  //     } else {
  //       message(res.msg, { type: 'error' });
  //   }
  //     selectAll=[]
  // })
}
</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <!-- <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div> -->
    <!-- <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" /> -->
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange" />
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
.btmNav{
  padding-top:10px;
  padding-bottom:20px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
