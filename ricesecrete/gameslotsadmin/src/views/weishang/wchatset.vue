<script setup lang="tsx">
import uploadImage from '@/components/comm/uploadImage.vue'
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { agentSettingList,agentSettingEdit,agentSettingAdd,agentSettingDelete } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("阶层"),
    prop: "stratum",
  }, {
    label: transformI18n("名称"),
    prop: "name",
  }, {
    label: transformI18n("累积推广人数"),
    prop: "stratum_number",
  }, {
    label: transformI18n("领取奖金"),
    prop: "stratum_bonus",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEdit(row)}>
          { transformI18n('编辑') }
        </el-button>
      </>
    )
  }
];


const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  issue_number:{
    type: 'input',
    placeholder: '期号',
    value: '',
    prop:'issue_number'
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
  limit: 1000,//条数
  total: 0,//总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  agentSettingList(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
  })
}

const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  // init(pagination);
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
  //   for (var key in pagination) {
  //       if (key == searchList[key]?.prop) {
  //         pagination[key] = searchList[key].value;
  //       }
  // }
    //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
    pagination.page = 1;
    init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
    stratum: {
      type: 'input',
      label: '阶层',
      ty:'number',
      placeholder: '阶层',
      value: '',
      prop: 'stratum',
      disable:true
  },
  name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name',
  },
   icon: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: '图标',
    prop:'icon'
  },
  stratum_number: {
      type: 'input',
      label: '推广人数',
      ty:'number',
      placeholder: '推广人数',
      value: '',
      prop:'stratum_number'
  },
  stratum_bonus: {
      type: 'input',
      label: '领取奖金',
      ty:'number',
      placeholder: '领取奖金',
      value: '',
      prop:'stratum_bonus'
  },
  is_check:{
    type: 'radio',
    label:'后台审核',
    placeholder:'后台审核',
    prop:'is_check',
    value: 1,
    options: [
      {
        name: '不需要',
        label: 0,
      },{
        name: '需要',
        label: 1,
      },
    ]
  },
  receive_agent_type:{
    type: 'radio',
    label:'可领取代理',
    placeholder:'可领取代理',
    prop:'receive_agent_type',
    value: 0,
    options: [
      {
        name: '所有',
        label: 0,
      },{
        name: '内部代理',
        label: 1,
      },{
        name: '外部代理',
        label: 2,
      },
    ]
  },
  agent_type:{
    type: 'radio',
    label:'代理类型',
    placeholder:'代理类型',
    prop:'agent_type',
    value:0,
    options: [
      {
        name: '指定代理线不能参与',
        label: 0,
      },{
        name: '指定代理线才能参与',
        label: 1,
      }
    ]
  },
  agent_id: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    value: "",
    name: "username",
    prop: "id"
  },
  start_time: {
    type: 'time',
    label: '开始时间',
    placeholder: '开始时间',
    value: '',
    prop:'start_time'
  },
  reward_type:{
    type: 'radio',
    label:'奖励类型',
    placeholder:'奖励类型',
    prop: 'reward_type',
    value: 0,
    tip: '总数奖励：达成条件后奖励仅可领取一次。单次奖励：达成条件后每多加一次便可在领取一次',
    options: [
      {
        name: '总数奖励',
        label: 0,
      },{
        name: '单次奖励',
        label: 1,
      }
    ]
  },
  savings: {
      type: 'input',
      label: '流水倍数',
      ty:'number',
      placeholder: '流水倍数',
      value: 0,
      prop:'savings'
  },
}
const dialogModel = reactive({
  stratum: '',
  name: '',
  icon: '',
  stratum_number: '',
  stratum_bonus: '',
  start_time: '',
  is_check: 0,
  receive_agent_type: 0,
  savings: 0,
  agent_id: '',
  reward_type: 0,
  id:''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

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
const clickIndex = ref(1);
//编辑
const handleEdit = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  agentSettingEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
       }
       console.log(list2Box.dialogList['reward_type'])
       console.log(dialogModel['reward_type'])
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
    agentSettingEdit(query).then((res: any) => {
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
    agentSettingAdd(query).then((res: any) => {
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
  for (const key in dialogModel) {
     dialogModel[key] = ''
     if (key == dialogList[key]?.prop) {
       if (key == 'stratum') {
         list2Box.dialogList[key].value = tableData.dataList.length>0?tableData.dataList.length+1:1;
         dialogModel[key] = tableData.dataList.length>0?tableData.dataList.length+1:1;
       }else if(key == 'is_check' || key == 'receive_agent_type' || key == 'agent_type'){
         list2Box.dialogList[key].value = 0;
         dialogModel[key] = 0;

       }else {
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
  agentSettingDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}


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
    <menuList />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
      <div class="flex-fi">
        <!-- <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"></commSerach> -->
      </div>
    </div>
      <commDialog title="编辑" width="50%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
        <template v-slot:upload>
           <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.icon"/>
        </template>
        <template #username>
              <div>
                <div class="flex-fi user-box">
                  <el-input v-model="dialogModel.agent_id" clearable :placeholder="$t('用户/代理')" />
                  <el-button style="margin-left: 20px" type="primary" @click="selectUser">{{ $t("选择用户") }}</el-button>
                </div>
                <!-- <div>{{ $t("限制某代理线下面用户才能参与") }}</div> -->
              </div>
            </template>
      </commDialog>
      <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          " :back="true" :field="1" @backSelect="eidtUsername" />
      </div>
    </el-dialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange"/>
    <div class="btmNav">
      <!-- <el-pagination
        class="float-right"
        v-model:currentPage="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[12, 24, 36, 50, 100]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onCurrentChange"
      /> -->
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
