<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { userVerifyList, userVerifyEdit, userVerifyAdd, userVerifyDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'userVerify'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("UID"),
    prop: "id",
    width: 80,
  }, {
    headerRenderer: () => transformI18n("用户账号"),
    prop: "username",

  },
  {
    headerRenderer: () => transformI18n("标签信息"),

    slot: 'tag'
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
const handleEdit = (index, row) => {

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  username: {
    type: 'input',
    placeholder: '精准:id/推广码/手机号/邮箱',
    value: ''
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
}
const searchListBox = reactive({
  searchList
})

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username: '',//用户名
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  userVerifyList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    console.log(tableData.dataList);
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
  pagination[index] = value;
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
  uid: {
    type: 'slot',
    label: '用户',
    placeholder: '用户',
    value: '',
    show: true,
    name: 'username',
    prop: 'uid'
  },
  content_json: {
    type: "slot",
    label: '认证数据',
    placeholder: '',
    value: '',
    name:"content_json",
    prop: 'content_json'
  },
  //认证状态  0未认证 1认证中  2认证通过 3认证失败
  status: {
    type: 'radio',
    label: '状态',
    value: 1,
    prop: 'status',
    options: [
      {
        label: 0,
        name: '未认证'
      }, {
        label: 1,
        name: '认证中'
      }, {
        label: 2,
        name: '认证通过'
      },
      {
        label: 3,
        name: '认证失败'
      }
    ]
  }
}
const dialogModel = reactive({
  content_json: [],
  status: 1,
  uid:'',
  id: ''
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
  // console.log(row);
  clickIndex.value = 1;
  userVerifyEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogModel) {
        if (key == dialogList[key]?.prop) {
          list2Box.dialogList[key].value = res.data[key]
        }
        dialogModel[key] = res.data[key]
      }
      // console.log(dialogModel);
      // console.log(dialogModel);
      list2Box.dialogList['uid'].show = true
      visible.value = true;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

//上传成功后的图片
const backImageData = (val) => {

}

const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    userVerifyEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })

  } else {
    const query = {
      add: true,
      info: dialogModel
    }
    userVerifyAdd(query).then((res: any) => {
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

//添加
const handleAdd = () => {
  //显示选择用户
  list2Box.dialogList['uid'].show = false
  for (const key in dialogModel) {
    if(key == 'id'){
      continue;
    }
    if( key == 'status' ){
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    }else{
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
  userVerifyDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
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
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange" :list="searchListBox.searchList" />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template #content_json>
        <div>
          <div class="block" v-for="(item,index) in dialogModel.content_json" :key="index" v-if="dialogModel.content_json">
            <div class="demonstration">{{ item.name }}</div>
            <el-image v-if="item.type=='img'" style="width: 200px;" :src="item.value" fit="fit"/>
            <div v-if="item.type=='text'">{{item.value}}</div>
          </div>
            <div v-else>无</div>
        </div>
      </template>
      <template #username>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.uid" clearable :placeholder="$t('用户')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
        </template>
    </commDialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :is="defineAsyncComponent(()=> import('@/views/user/pages/list.vue'))" :back="true" :field="1" @backSelect="eidtUsername"/>
          </div>
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag size="small" type="info" v-if="row.status == 0">{{ $t('未认证') }}</el-tag>
        <el-tag size="small" type="warning" v-else-if="row.status == 1">{{ $t('认证中') }}</el-tag>
        <el-tag size="small" type="success" v-else-if="row.status == 2">{{ $t('认证通过') }}</el-tag>
        <el-tag size="small" type="danger" v-else-if="row.status == 3">{{ $t('认证失败') }}</el-tag>
      </template>
      <template #tag="{ row }">
        <div>{{ $t("标签") }}:
          <el-tag size="small" :type="row.lebal === 1 ? 'success' : 'danger'" effect="plain">
            {{ $t(row.lebal === 1 ? "一般" : "测试") }}
          </el-tag>
          <el-tag v-for="tag, idx in row.tags" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''"
            :type="tag.color ? '' : 'success'" :key="idx">
            {{ $t(tag.name) }}
          </el-tag>
        </div>
        <div>{{ $t('邀 请 码') }}:{{ row.rec_code }}</div>
        <div>{{ $t('会员等级') }}:{{ row.level_name }}</div>
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
}

.line-box {
  margin-bottom: 10px;
}
</style>
