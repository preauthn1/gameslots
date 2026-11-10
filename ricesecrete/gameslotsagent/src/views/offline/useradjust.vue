<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent } from 'vue';
import { timeCycle } from '@/utils/global'
import { userArtificial,usersetWater,userArtificialAdd } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
defineOptions({
  name: 'useradjust'
})
 const columns = [
    {
      label: transformI18n("用户信息"),
      prop: "username",
      width:200,
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
      label: transformI18n("用户标签"),
      slot: "lebal",
      width: 150,
    },{
      label: transformI18n("類型"),
      slot: "a_type",
      width: 150,
    },
    {
      label: transformI18n("调整金额"),
      prop: "price",
      width: 150,
    }, {
      label: transformI18n("流水倍数"),
      width: 150,
      slot: "water",
    }, {
      label: transformI18n("明细备注"),
      prop: "msg",
    }, {
      label: transformI18n("操作人"),
      prop: "admin_name",
      width: 150,

    }, {
      label: transformI18n("操作时间"),
      prop: "add_time",
      sortable: true
   }
  ];

const height = window.innerHeight - 390;
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    idx:0
  },{
    type: 'time',
    placeholder: '时间',
    idx:1,
    value: (): Array<string> => {
      return []
    }
  },
  {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    idx:2,
    options: [
      {
        label: '一般用户',
        value: 1,
      }, {
        label: '测试用户',
        value: 2,
      }
    ]
  },
    {
    type: 'select',
    placeholder: '类型',
    value: '',
    idx:3,
    options: [
      {
        label: '人工增加',
        value: 1,
      }, {
        label: '人工减少',
        value: 2,
      }, {
        label: '赠送彩金',
        value: 3,
      }, {
        label: 'VIP等级',
        value: 4,
      }
    ]
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:4
  }, {
    type: 'button',
    value: '导出',
    handle: 'export',
    idx:5
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = ref<any>({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field:'',
  username: '',
  date: '',
  lebals: '',
  a_type:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  //时间转换
  const val = list[1].value;
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination.value.page = 1;
  pagination.value.lebals = list[2].value
  pagination.value.a_type = list[3].value
  pagination.value.date = time//时间
  pagination.value.username = list[0].value
  init();
}

//首次需要加载的接口
init();
function init() {
  userArtificial(pagination.value).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    const msgList = res.detail_notes;
    const arr = []
    msgList.forEach((item:any, index) => {
      arr.push({ label:item.value,value:item.value })
    })
    dialogList.mx_msg2.options = arr;
  })
  // userlevelList().then((res: any) => {
  //   let list2 = res.data;
  //   let arr = [];
  //   list2.forEach(item => {
  //      let obj = {
  //       value: item.id,
  //       label: item.level_name,
  //      }
  //     arr.push(obj);
  //   });
  //   list[14].options = arr;
  // })
}
const onPageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1;
  init();
};
const onCurrentChange = (current: number) => {
  pagination.value.page = current;
   init();
};
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
//流水改变

const handleWaterChange = (val,id) => {
  usersetWater({ water: val, id }).then((res: any) => {
    if (res.code == 1) {
       message(res.msg, { type: 'success' });
    }
  })
}



//弹框写法
const visible = ref(false);
const dialogList = {
  username:{
    type: 'slot',
    label: '用户UID',
    placeholder: '用户UID',
    value: '',
    name:'username',
    prop:'username'
  },
  a_type:{
    type: 'select',
    label: '调整类型',
    placeholder: '调整类型',
    value: 1,
    options: [
      {
        label: '人工增加',
        value:1
      },{
        label: '人工减少',
        value:2
      },{
        label: '赠送彩金',
        value:3
      },
    ],
    prop:'a_type'
  },
  price:{
    type: 'input',
    ty:'number',
    label: '调整金额',
    placeholder: '调整金额',
    value: '',
    prop:'price'
  },
  water:{
    type: 'input',
    label: '流水倍数',
    placeholder: '提现需要的流水倍数',
    value: '',
    prop:'water'
  },
  mx_msg2:{
    type: 'select',
    label: '快捷备注',
    placeholder: '快捷备注',
    value: '',
    options: [
    ],
    prop:'mx_msg2'
  },
  mx_msg:{
    type: 'input',
    label: '明细备注',
    placeholder: '自定义备注',
    tip:'注：用户收益明细信息,不填默认',
    value: '',
    prop:'mx_msg'
  },
}
const dialogModel = reactive({
  username: '',
  price: '',
  mx_msg: '',
  mx_msg2: '',
  a_type: 1,
  water:'',
  uid:''
})
const listRules = {
   username: [
    { required: true, message: '请输入用户UID', trigger: 'blur' },
  ],
  price: {
    required: true, message: '请输入金额', trigger: 'blur'
  },
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
  if (index == 'mx_msg2') {
    handleDialogChange({value: value, index: 'mx_msg'})
  }
}
const manualRecharge = () => {
  visible.value = true
}
const saveAdd = () => {
  const query = {
    add: true,
    info: {
      ...dialogModel
    }
  }
  userArtificialAdd(query).then((res: any) => {
    if (res.code == 1) {
      visible.value = false
       message(res.msg, { type: 'success' });
    }
  })
}
//用户改变
const eidtUsername = (val) => {
  dialogList.username.value = val;
  dialogModel.username = val;
  selectShow.value = false;
}
//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
}
//点击保存

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
    <commDialog title="添加" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" @save="saveAdd" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template #username>
            <div class="flex-fi user-box">
               <el-input v-model="dialogModel.username" @change="eidtUsername($event)" :placeholder="$t('用户UID')" />
               <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
            </div>
        </template>
    </commDialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :is="defineAsyncComponent(()=> import('@/views/user/pages/list.vue'))" :back="true" field="1" @backSelect="eidtUsername"/>
          </div>
    </el-dialog>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('add')" type="primary" @click="manualRecharge">{{ $t('手动出款') }}</el-button>
      </div>
      <div class="flex-fi">
        <!-- <div style="margin-right:20px;">银行卡：<el-button type="warning"  plain>{{ $t('未审核') }}</el-button><el-button type="danger"  plain>{{ $t('未通过') }}</el-button><el-button type="primary"  plain>{{ $t('已通过') }}</el-button></div> -->
        <!-- <div>
          <el-button type="warning"  plain>人工增减2200</el-button>
          <el-button type="primary"  plain>人工减少0.00</el-button>
          <el-button type="danger"  plain>赠送彩金000</el-button>
          <el-button type="danger"  plain>VIP等级彩金00</el-button>
          <el-button type="danger"  plain>充值返利899</el-button>
        </div> -->
        <!-- <div>银商：<el-button type="primary"  plain>{{ $t('已通过') }}</el-button></div> -->
      </div>

    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
       <template #lebal="{ row }">
          <el-tag size="small" plain v-if="row.lebal == 1">{{ $t('一般用户') }}</el-tag>
          <el-tag size="small" plain v-if="row.lebal == 2">{{ $t('测试用户') }}</el-tag>
      </template>
      <template #water="{ row }">
           <el-input v-model="row.water" :placeholder="$t('流水')"  @change="handleWaterChange($event,row.id)"/>
      </template>
      <template #a_type="{ row }">
          <el-tag size="small" plain v-if="row.a_type == 1">{{ $t('人工增加') }}</el-tag>
          <el-tag size="small" plain v-else-if="row.a_type == 2">{{ $t('人工减少') }}</el-tag>
          <el-tag size="small" plain v-else-if="row.a_type == 3">{{ $t('赠送彩金') }}</el-tag>
          <el-tag size="small" plain v-else-if="row.a_type == 4">{{ $t('VIP等级') }}</el-tag>
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
}
</style>
