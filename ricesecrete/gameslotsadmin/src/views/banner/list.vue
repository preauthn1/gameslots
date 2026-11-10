<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { bannerList, bannerEdit, bannerAdd, bannerDelete, bannerStatusEdit } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { formaTime } from '@/utils/global'
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { useDataLoad } from "@/components/table/dataLoad";
import { http } from "@/utils/http";
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'bannerList'
})
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/banner/list');
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  },
  {
    label: transformI18n("封面"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <a href={ row.img } target="_blank"><img src={ row.img } /></a>
      </div>
    )
  },
  {
    label: transformI18n("手机端封面"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center" v-show={row.mobile_img}>
        <a href={ row.mobile_img } target="_blank"><img src={ row.mobile_img } /></a>
      </div>
    )
  },
  {
    label: transformI18n("超链接"),
    prop: "url",
    width: 150,
  },
  {
    label: transformI18n("代理id"),
    prop: "agent_id"
  },
  {
    label: transformI18n("时间"),
    width: 150,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.start_time} <br/>
        {row.end_time}
      </div>
    )
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
    width: 150,
  },
  // {
  //   label: transformI18n("类型"),
  //   slot: "type",
  //   width: 150,
  // },
  {
    label: transformI18n("状态"),
    slot: "status",
    width: 150,
  },
  {
    label: transformI18n("显示位置"),
    slot: "show_position",
    width: 150,
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
    width: 150,
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} type="primary" size="small" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button>
      </>
    )
  }
];


//搜索的数据

const searchList = {
  agent_id: {
    type: "input",
    placeholder: "代理id",
    prop: "agent_id",
    value: ""
  },
  // type:{
  //   type: 'select',
  //   value: '',
  //   placeholder:'类型',
  //   prop:'type',
  //   options: [
  //     {
  //       value: 1,
  //       label:'手机端'
  //     },
  //     {
  //       value: 0,
  //       label:'PC端'
  //     },
  //   ]
  // },
  status:{
    type: 'select',
    value: '',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        value: 1,
        label:'启用'
      },{
        value: 0,
        label:'关闭'
      },
    ]
  },
  show_position:{
    type: 'select',
    value: '',
    placeholder:'显示位置',
    prop:'show_position',
    options: [
      {
        value: 1,
        label:'首页'
      },
      {
        value: 2,
        label:'游戏'
      },
      {
        value: 3,
        label:'体育'
      },
    ]
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

// 搜索输入框数据变动时触发
const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
}

const tableData = reactive({ dataList });

const queryParams = reactive({
  agent_id:'',
  status:'',
  show_position:''
});
//获取列表数据
init();
function init() {
  pagination.currentPage = 1;
  onInitList(queryParams, (res) => {
    if (res.code == 1) {
      list2Box.dialogList.lang.options = res.langs
      list2Box.dialogList.jump_url.options = res.url
    }
  })
}

//弹框写法
const visible = ref(false);
const dialogList = {
  url:{
    type: 'input',
    label: '超链接',
    placeholder: '超链接',
    value: '',
    prop:'url'
  },
  agent_id: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "id"
  },
  lang: {
    type: 'select',
    value: '',
    label: '公告语种',
    placeholder: '公告语种',
    prop: 'lang',
    options:[]
  },
  start_time:{
    type: 'time',
    label: '开始时间',
    placeholder: '开始时间',
    value: '',
    prop:'start_time'
  },
  end_time:{
    type: 'time',
    label: '结束时间',
    placeholder: '结束时间',
    value: '',
    prop:'end_time'
  },
  jump_url: {
    type: 'select',
    label: '关联功能',
    placeholder: '关联功能',
    value: '',
    prop: 'jump_url',
    options: [],
  },
   img: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: 'PC端图片',
    prop:'img'
  },
   mobile_img: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: '手机端图片',
    prop:'mobile_img'
  },
  // type:{
  //   type: 'radio',
  //   value: 1,
  //   label:'类型',
  //   prop:'type',
  //   options: [
  //     {
  //       label: 1,
  //       name:'手机端'
  //     },{
  //       label: 0,
  //       name:'PC端'
  //     },
  //   ]
  // },
  status:{
    type: 'radio',
    value: -1,
    label:'是否开启',
    prop:'status',
    options: [
      {
        label: 1,
        name:'启用'
      },{
        label: 0,
        name:'关闭'
      },
    ]
  },
  show_position:{
    type: 'radio',
    value: 1,
    label:'显示位置',
    prop:'show_position',
    options: [
      {
        label: 1,
        name:'首页'
      },
      {
        label: 2,
        name:'游戏'
      },
      {
        label: 3,
        name:'体育'
      },
    ]
  },
   sort:{
    type: 'input',
    label: '排序',
    placeholder: '排序',
    value: '',
    prop: 'sort',
    tip:'排序：数字越大排序越靠前'
  },
}
const dialogModel = reactive({
  url:'',
  lang:'',
  start_time:'',
  end_time:'',
  img:'',
  type:'',
  jump_url: '',
  status:'',
  show_position:'',
  sort:'',
  agent_id: 0,
  id:''
})
const listRules = {
   name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
      list2Box.dialogList[index].value = value?formaTime(value):'';
      dialogModel[index] = value?formaTime(value):'';
  } else {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
  }

}
const dialogIndex = ref(1);
  //编辑
let eidtCurrentRow = {}
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  dialogIndex.value = 1;
  bannerEdit(query).then((res: any) => {
    if (res.code == 1) {
      visible.value = true;
      eidtCurrentRow = res.data;
      dialogModel.id = res.data.id
      for (const key in dialogList) {
        list2Box.dialogList[key].value = row[key]
        dialogModel[key] = row[key]
      }
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}

//上传成功后的图片
const backImageData = (prop, val) => {
  dialogModel[prop] = val.file[0];
  list2Box.dialogList[prop].value = val.file[0];
}

const handleSave = () => {
  if (dialogIndex.value == 1) {
    const query = {
      edit: true,
      info: {
        ...dialogModel
      }
    }
    bannerEdit(query).then((res: any) => {
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
      info: {
        ...dialogModel
      }
    }
    bannerAdd(query).then((res: any) => {
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
  for (const key in dialogList) {
    list2Box.dialogList[key].value = ''
    dialogModel[key] = ''
  }
  dialogIndex.value = 2;
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
  console.log(val);
  selectAll = val;
}
function deleteIds(id) {
  const query = {
    delete: true,
    id
  }
  bannerDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

const handleStuats = (row,val) => {
  proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
    statusChage(row.id,val);
  }).catch(() => {
    console.log('取消');
  })
}
function statusChage(id,status) {
  const query = {
    edit: true,
    info: {
      id,
      status
    }
  }
  bannerStatusEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}
//bannerStatusEdit

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.agent_id.value = val;
  dialogModel.agent_id = val;
  selectShow.value = false;
};
</script>

<template>
  <div>
    <commSerach @search="init" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component
          :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          "
          :back="true"
          :field="1"
          @backSelect="eidtUsername"
        />
      </div>
    </el-dialog>
   <commDialog title="编辑" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload="{data}">
            <uploadImage @imageData="backImageData(data.prop, $event)"  :limit="1" :image="dialogModel[data.prop]"/>
        </template>
        <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input
              v-model="dialogModel.agent_id"
              clearable
              :placeholder="$t('用户/代理')"
            />
            <el-button
              style="margin-left: 20px"
              type="primary"
              @click="selectUser"
              >{{ $t("选择用户") }}</el-button
            >
          </div>
          <div>{{ $t("限制某代理线下面用户才能参与") }}</div>
        </div>
      </template>
      </commDialog>

    <pure-table
      :loading="loading"
      :loading-config="loadingConfig"
      adaptive
      :adaptiveConfig="adaptiveConfig"
      :pagination="pagination"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
      @selection-change="handleSelectionChange"
     :data="tableData.dataList" width="100%" :columns="columns">
     <template #show_position="{ row }">
         <el-tag size="small" type="success"  v-if="row.show_position == 1">{{ $t('首页') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.show_position == 3">{{ $t('体育') }}</el-tag>
         <el-tag size="small" type="success"  v-else>{{ $t('游戏') }}</el-tag>
      </template>
      <template #status="{ row }">
         <el-tag size="small" type="success" v-if="row.status == 1" @click="handleStuats(row,0)">{{ $t('启用') }}</el-tag>
         <el-tag size="small" type="danger" v-else @click="handleStuats(row,1)">{{ $t('关闭') }}</el-tag>
      </template>
    </pure-table>
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
.line-box{
  margin-bottom: 20px;
}
</style>
