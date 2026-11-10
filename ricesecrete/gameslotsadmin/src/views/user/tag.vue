<script setup lang="tsx">
import { http } from "@/utils/http";
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

defineOptions({
  name: 'user_tag'
})
const { proxy } = getCurrentInstance();
const columns = [{
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
  },
  {
    label: transformI18n("用户信息"),
    prop: "username",
    cellRenderer: ({ row }) => (
      <>
        <div onClick={() => showUserInfo(row.uid)}>
          <p>UID:{row.uid}</p>
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
    label: transformI18n("标签"),
    prop: "tag_id",
    cellRenderer: ({ row }) => (
      <>
        <el-tag>{ transformI18n(row.tag) }</el-tag>
      </>
    )
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
      </>
    )
  },
];
//弹框写法
const visible = ref(false);
const dialogList = {
  tag_id: {
    type: 'select',
    label: '标签',
    placeholder: '请选择标签',
    value: '',
    options: [],
    prop: 'tag_id'
  },
  uid: {
    type: 'slot',
    label: '用户',
    placeholder: '用户',
    value: '',
    name: 'username',
    prop: 'uid'
  },
}
const dialogModel = reactive({
  id:'',
  tag_id:'',
  uid:'',
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
    id:row.id
  }
  http.post('/user_tag/add', {data: query}).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.id = res.data.id;
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
    if (dialogList[key].type == 'radio') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
    } else {
        list2Box.dialogList[key].value = ''
        dialogModel[key] = ''
    }
  }
  dialogModel.id = '';
  visible.value = true;
}

//保存
const handleSave = () => {
  http.post('/user_tag/add', {data: {
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
  username: {
    type: 'input',
    placeholder: '用户/邮箱/手机号',
    value: '',
    prop: 'username',
    span: 8
  },
  tag_id: {
    type: 'select',
    placeholder: '标签',
    value: '',
    prop: 'tag_id',
    options:[],
    span: 8
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
  username: '',
  tag_id: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  http.post('/user_tag/list', {data: pagination}).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.total
    list2Box.dialogList.tag_id.options = res.tags
    searchListBox.searchList.tag_id.options = res.tags
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
      arr.push(item.id);
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
    id
  }
  http.post('/user_tag/delete', {data: query}).then((res: any) => {
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

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
}

const eidtUsername = (val) => {
  dialogList.uid.value = val;
  dialogModel.uid = val;
  selectShow.value = false;
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <menuList />
    
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelete">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :is="defineAsyncComponent(()=> import('@/views/user/pages/list.vue'))" :back="true" :field="1" @backSelect="eidtUsername"/>
          </div>
    </el-dialog>
    <commDialog style="width: 50%;" title="用户标签" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template #username>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.uid" clearable :placeholder="$t('用户')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
        </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" @selection-change="handleSelectionChange"/>
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
</style>
