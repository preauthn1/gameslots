<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { usermsgList, usermsgEdit, usermsgAdd, usermsgDelete } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { useI18n } from "vue-i18n";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { t } = useI18n();
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'usermsgList'
})
//TableColumnList
const columns = [
  {
    type:"selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
  },
  {
    label: transformI18n("时间"),
    prop: "add_time",
  },{
    label: transformI18n("用户名"),
    prop: "username",
  },{
    label: transformI18n("标题"),
    prop: "title",
  },{
    label: transformI18n("类型"),
    prop: "type",
  },{
    label: transformI18n("已读"),
    slot: "read",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  username:{
    type: 'input',
    placeholder: t('手机号')+"/"+t('邮箱'),
    value: '',
    prop: 'username',
  },
  title:{
    type: 'input',
    placeholder: t('标题'),
    value: '',
    prop: 'title',
  },
  search:{
    type: 'button',
    value: t('搜索'),
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
  title:'',
  username:"",
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  usermsgList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    list2Box.dialogList.lang.options = res.langs
    // list2Box.dialogList.action_id.options = res.Action
    // list2Box.dialogList.tag_id.options = res.tags
    pagination.page = res.data.current_page
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
  console.log('点击');
  //搜索列表 没有日期的写法
    for (const key in pagination) {
        if (key == searchList[key]?.prop) {
          pagination[key] = searchList[key].value;
        }
  }
    //搜索列表 有日期的写法

  // for (var key in pagination) {
  //   if (key == list[key]?.prop) {
  //     if (key == 'date') {
  //       let val = list[key].value;
  //       const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  //       pagination[key] =  time;
  //     } else {
  //       pagination[key] = list[key].value
  //     }
  //   }
  // }
    pagination.page = 1;
    init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  lang:{
    type: 'select',
    label: t('语种'),
    placeholder: t('语种'),
    value: '',
    options:[],
    prop:'lang'
  },
  title: {
    type: 'input',
    label: t('标题'),
    placeholder: t('请输入标题'),
    value: '',
    prop:'title'
  },
  send_type: {
    type: 'select',
    label: t('发送对象'),
    placeholder: t('发送对象'),
    value: 0,
    options: [
      {
        label: t('个人'),
        value:0,
      },{
        label: t('代理线'),
        value:1,
      },
    ],
    prop:'send_type'
  },
   id:{
    type: 'slot',
    label: t('用户|代理id'),
     placeholder: t('用户id或代理id'),
    tip: t('用户可以多选，代理每次只能选一个'),
    value: '',
    name: 'username',
    prop:'id'
  },
  // tag_id:{
  //   type: 'select',
  //   label: t('用户标签'),
  //   placeholder: t('用户标签'),
  //   tip: '发送对象为“个人”时有效',
  //   value: '',
  //   options:[],
  //   show: false,
  //   prop:'tag_id'
  // },
  // action_id:{
  //   type: 'select',
  //   label: t('活动ID'),
  //   placeholder: t('活动ID'),
  //   value: 0,
  //   options:[],
  //   prop:'action_id'
  // },
  // link_title:{
  //   type: 'input',
  //   label: t('链接名称'),
  //   placeholder: t('链接名称'),
  //   tip:t('系统消息专用'),
  //   value: '',
  //   prop:'link_title'
  // },
  // link:{
  //   type: 'input',
  //   label: t('跳转链接'),
  //   placeholder: t('跳转链接'),
  //   tip:t('系统消息专用'),
  //   value: '',
  //   prop:'link'
  // },
  img:{
    type: 'slot',
    name: 'upload',
    value: '',
    label: t('封面图'),
    prop: 'img'
  },
  content: {
    type: 'slot',
    label: t('内容'),
    placeholder: t('请输入内容'),
    value: '',
    name:'content',
    prop:'content'
  },
}
const dialogModel = reactive({
  lang:'',
  title:'',
  content:'',
  send_type:0,
  id:'',
  action_id: '',
  img: '',
  link_title: '',
  link: '',
  msg_id: 0
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
  usermsgEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
         if (key == 'msg_id') {
            dialogModel[key] = res.data['id']
         } else if (key == 'id') {
            list2Box.dialogList[key].value = res.data['uid']
            dialogModel[key] = res.data['uid']
         }
         list2Box.dialogList['send_type'].show = true;
        //  dialogList['tag_id'].show = true;
       }
       console.log(dialogModel)
        visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

const editorEle = (val) => {
  list2Box.dialogList.content.value = val
  // dialogModel.gi_info = val
}

//图片返回
const backImageData1 = (val) => {
  dialogModel.img = val.file[0];
  list2Box.dialogList['img'].value = val.file[0];
}

const handleSave = () => {
  dialogModel.content = list2Box.dialogList.content.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    usermsgEdit(query).then((res: any) => {
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
    usermsgAdd(query).then((res: any) => {
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
  list2Box.dialogList['send_type'].show = false;
  // dialogList['tag_id'].show = false;
  for (const key in dialogModel) {
     dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
       if (key == 'send_type') {
         list2Box.dialogList[key].value = 0
         dialogModel[key] = 0
       } else {
         list2Box.dialogList[key].value  = ''
       }
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
  usermsgDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}


//用户改变


//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
}

const eidtUsername = (val) => {
  if (dialogModel.send_type == 1 && val.toString().indexOf(',') !== -1) {
    message('代理线只支持选择一个代理', { type: 'error' });
    return;
  }
  console.log(dialogModel.send_type)
  dialogList.id.value = val;
  dialogModel.id = val;
  selectShow.value = false;
}
</script>

<template>
  <div>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div>
        <el-button  type="danger" @click="handleDelet">{{ t('删除') }}</el-button>
        <el-button  type="primary" @click="handleAdd">{{ t('添加') }}</el-button>
      </div>
    </div>

    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :is="defineAsyncComponent(()=> import('@/views/user/pages/user.vue'))" :back="true" :field="1" @backSelect="eidtUsername"/>
          </div>
    </el-dialog>
    <commDialog :title="t('编辑')" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:upload>
            <uploadImage @imageData="backImageData1" :image="dialogModel.img" :limit="1" />
        </template>
        <template v-slot:content>
            <component @chage="editorEle" :content="dialogModel.content" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
        </template>
        <template #username>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.id" clearable :placeholder="$t('用户/代理')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
        </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #read="{row}">
          <div>{{ $t(row.read) }}</div>
      </template>
      <template #right="{row}">
          <el-button size="small" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
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
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
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
