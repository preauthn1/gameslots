<script setup lang="tsx">
import { reactive, ref,defineAsyncComponent } from 'vue';
import { lotteryRecord, lotteryFakercode } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
defineOptions({
  name: 'lotteryRecord'
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
      label: transformI18n("转盘名称"),
      prop: "lottery_name",
      align:'center'
    },
  {
      label: transformI18n("奖品名称"),
      prop: "title",
      align:'center'
    },{
      label: transformI18n("奖品类型"),
      prop: "prize_type",
      align:'center'
    },{
      label: transformI18n("消费金额/积分"),
      align:'center',
    // prop: "type",
      cellRenderer: ({ index, row }) => (
        <>
          <span>{row.price}/{ row.integral}</span>
        </>
      )
    },{
      label: transformI18n("奖品金额"),
      prop: "prize_price",
      align:'center'
    },{
      label: transformI18n("是否免费"),
      prop: "is_free",
      align:'center'
    },{
      label: transformI18n("是否假数据"),
      slot: "is_fake",
      align:'center'
    },{
      label: transformI18n("抽奖时间"),
      prop: "time",
    align: 'center',
      width: 180
    },
];
  //编辑
const handleEidt = (index,row) => {
  visible.value = true;
}

const height = window.innerHeight - 270;
//以下是搜索框的数据
const list = {
  lottery_id: {
    type: 'select',
    placeholder: '转盘名称',
    value: '',
    prop: 'lottery_id',
    options: [
      
    ]
  },
  username: {
    type: 'input',
    placeholder: '用户',
    value: '',
    prop: 'username'
  },
  type: {
    type: 'select',
    placeholder: '奖品类型',
    value: '',
    prop: 'type',
    options: [
      {
        value: 1,
        label: '金额红包',
      }, {
        value: 2,
        label: '实体物品',
      }, {
        value: 3,
        label: '谢谢参与',
      }
    ]
  },
  date: {
    type: 'time',
    placeholder: '时间',
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  is_fake: {
    type: 'select',
    placeholder: '是否假数据',
    value: '',
    prop: 'is_fake',
    options: [
      {
        value: 0,
        label: '否',
      }, {
        value: 1,
        label: '是',
      }
    ]
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  lottery_id:'',
  username: '',
  type: '',
  date: '',
  is_fake: '',
  lottery_fakerecord_data:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
const total_integral = ref('');
const total_price = ref('');
const total_prize_price = ref('');
const lottery_fakerecord_data = reactive([])
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  lotteryRecord(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    total_integral.value = res.total_integral
    total_price.value = res.total_price
    total_prize_price.value = res.total_prize_price
    list.lottery_id.options = res.lottery
    dialogList.lottery_id.options = res.lottery
    res.lottery_fakerecord_data.forEach((item) => {
      lottery_fakerecord_data.push({
        value: item.id,
        label:item.title
      })
    })
  dialogList.prize_id.options = lottery_fakerecord_data
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
//弹框写法
//弹框写法
const visible = ref(false);
const dialogList = {
  lottery_id:{
    type: 'select',
    label: '转盘名称',
    placeholder: '转盘名称',
    value: '',
    options: [
      // {
      //   label: 0,
      //   name:'关闭'
      // },
    ],
    prop:'lottery_id'
  },
  username:{
    type: 'slot',
    label: '用户',
    placeholder: '用户',
    value: '',
    name:'username',
    prop:'username'
  },
   prize_id:{
    type: 'select',
    label: '奖品',
    placeholder: '选择奖品',
    value: '',
    options: [
      // {
      //   label: 0,
      //   name:'关闭'
      // },
    ],
    prop:'prize_id'
  },
  is_pay:{
    type: 'radio',
    label: '入单金额',
    placeholder: '入单金额',
    value: 1,
    prop: 'is_pay',
    options: [
      {
        label: 1,
        name:'积分'
      },{
        label: 2,
        name:'金额'
      },
    ]
  },

}
const dialogModel = reactive({
  username: '',
  lottery_id:'',
  prize_id: '',
  is_pay: 1,
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
    if (key == 'is_pay'||key=='lottery_id') {
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
      ...dialogModel
    }
  }
  lotteryFakercode(query).then((res: any) => {
   if (res.code == 1) {
     message(res.msg, { type: 'success' });
      visible.value = false
      init();
    } else {
       message(res.msg, { type: 'error' });
    }
  })
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

    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
   <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加假数据') }}</el-button>
      </div>
      <div class="flex-fi">
          <el-tag plain type="success" @click="handleAdd">{{ $t('消费总额') }}:{{ total_price }}</el-tag>
          <el-tag plain type="warning" @click="handleAdd">{{ $t('消耗总积分') }}:{{ total_integral }}</el-tag>
          <el-tag plain type="danger" @click="handleAdd">{{ $t('中奖总额') }}:{{ total_prize_price }}</el-tag>
      </div>
    </div>
    <!-- <commDialog title="基础信息" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage :limit="1"></uploadImage>
        </template>
      </commDialog> -->
    <el-dialog width="80%" v-model="selectShow" title="选择">
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
        <template #is_fake="{row}">
            <el-tag type="danger" v-if="row.is_fake == 1">{{ $t('是') }}</el-tag>
            <el-tag type="success" v-else>{{ $t('否') }}</el-tag>
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
.el-tag{
  margin-left: 5px;
}
</style>
