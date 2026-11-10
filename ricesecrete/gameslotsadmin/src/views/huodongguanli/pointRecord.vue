<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent } from 'vue';
import { integralRecord,integralSave } from "@/api/user";
// import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
defineOptions({
  name: 'pointRecord'
})
const columns = [
    {
      label: transformI18n("用户名"),
      prop: "username",
    },{
      label: transformI18n("用户标签"),
      slot: "lebal",

    },{
      label: transformI18n("類型"),
      slot: "type",
    },{
      label: transformI18n("调整积分"),
      prop: "integral",
    },{
      label: transformI18n("调整前"),
      prop: "old_integral",
    },{
      label: transformI18n("调整后"),
      prop: "new_integral",
    },{
      label: transformI18n("明细备注"),
      prop: "msg",
    },{
      label: transformI18n("操作人"),
      prop: "admin_name",
    },{
      label: transformI18n("操作时间"),
      prop: "add_time",
    }
];
  //编辑
const handleEidt = (index,row) => {
  visible.value = true;
}

const height = window.innerHeight - 290;
//以下是搜索框的数据
const list = {
  accurate: {
    type: 'select',
    placeholder: '模糊',
    value: 0,
    prop: 'accurate',
    options: [
      {
        value: 0,
        label: '模糊',
      }, {
        value: 1,
        label: '精准',
      }
    ]
  },
  username: {
    type: 'input',
    placeholder: '用户',
    value: '',
    prop: 'username'
  },
  date: {
    type: 'time',
    placeholder: '时间',
    idx: 2,
    value: (): Array<string> => {
      return []
    },
    prop: 'date'
  },
  lebal: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    prop: 'lebal',
    options: [
      {
        value: 1,
        label: '一般用户',
      }, {
        value: 2,
        label: '测试用户',
      }
    ]
  },
  type: {
    type: 'select',
    placeholder: '类型',
    value: '',
    prop: 'type',
    options: [
      {
        value: 1,
        label: '积分增加',
      }, {
        value: 2,
        label: '积分减少',
      }
    ]
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  username: '',
  type: '',
  date: '',
  accurate: 0,
  uid:'',
  lebal:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
const distribute_price = ref('')
const pending_price =ref('')
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  integralRecord(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    distribute_price.value = res.distribute_price
    pending_price.value = res.pending_price
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
//搜索
const handleSerch = () => {
  pagination.page = 1;
  // let time = list[2].value.length > 0 ? timeCycle(list[2].value[0]) + ' - ' + timeCycle(list[2].value[1]) : '';
  // pagination.username = list[0].value
  // pagination.type = list[1].value
  // pagination.date = time
  // pagination.is_fake = list[3].value
   for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
  init();
}
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
//积分增加减少
const handleIntegral=(val)=>{
  pagination.type = val;
  list.type.value = val;
  init();
}
//弹框写法
const visible = ref(false);
const dialogList = {
  username:{
    type: 'slot',
    label: '用户',
    placeholder: '用户',
    value: '',
    name:'username',
    prop:'username'
  },
   type:{
    type: 'select',
    label: '调整类型',
    placeholder: '调整类型',
    value: 1,
    options: [
       {
        value: 1,
        label: '积分增加',
      }, {
        value: 2,
        label: '积分减少',
      }
    ],
    prop:'type'
  },
  integral:{
    type: 'input',
    label: '调整积分',
    placeholder: '调整积分',
    value: '',
    prop:'integral'
  },
 mx_msg:{
    type: 'input',
    label: '明细备注',
    placeholder: '明细备注',
    value: '',
    prop: 'mx_msg',
    ty:'textarea'
  },
}
const dialogModel = reactive({
  username: '',
  type: 1,
  integral: '',
  mx_msg: '',
})
const listRules = {
   username: [
    { required: true, message: '请输入用户名', trigger: ['blur','change'] },
  ],
  prize_id: {
    required: true, message: '请选择奖品', trigger: ['blur','change']
  },
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}
const manualRecharge = () => {
  visible.value = true
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
}
//点击添加
const handleAdd = () => {
  visible.value = true;
  for (const key in dialogList) {
    if (key == 'type') {
      dialogList[key].value = 1
      dialogModel[key] = 1
    } else {
      dialogList[key].value = '';
       dialogModel[key] = ''
    }

  }
}
//用户改变
const eidtUsername = (val) => {
  dialogList.username.value = val;
  dialogModel.username = val;
  selectShow.value = false;
}
//保存
const saveAdd = () => {
  console.log(dialogModel);
  const query = {
    add: true,
    info: {
      ...dialogModel,
      uid:pagination.uid
    }
  }
  integralSave(query).then((res: any) => {
   if (res.code == 1) {
     message(res.msg, { type: 'success' });
      visible.value = false
      init();
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('调整') }}</el-button>
      </div>
      <div class="flex-fi">
          <el-button plain type="warning" @click="handleIntegral(1)">{{ $t('积分增加') }}:{{ pending_price }}</el-button>
          <el-button plain type="danger" @click="handleIntegral(2)">{{ $t('积分减少') }}:{{ distribute_price }}</el-button>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :is="defineAsyncComponent(()=> import('@/views/user/pages/list.vue'))" :back="true" @backSelect="eidtUsername"/>
          </div>
    </el-dialog>
    <commDialog title="手动添加" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" @save="saveAdd" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template #username>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.username" @change="eidtUsername($event)" :placeholder="$t('用户')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
        </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
     <template #lebal="{ row }">
          <el-tag size="small" type="success" v-if="row.lebal == 1">{{ $t('一般用户') }}</el-tag>
          <el-tag size="small" type="danger" v-if="row.lebal == 2">{{ $t('测试用户') }}</el-tag>
      </template>
      <template #type="{ row }">
          <el-tag size="small" type="success" v-if="row.lebal == 1">{{ $t('积分增加') }}</el-tag>
          <el-tag size="small" type="danger" v-if="row.lebal == 2">{{ $t('积分减少') }}</el-tag>
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
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
  margin-top:20px;
}
</style>
