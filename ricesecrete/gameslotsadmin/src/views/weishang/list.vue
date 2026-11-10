<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { angentRakeList,agentReject,agentSell,angentDistribute,angentRefused,angentListCount } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
    selectable: (row,index) => {
      if (row.status == 1) {
        return true;
      } else {
        return false;
      }
    }
  },
  {
    label: transformI18n("用户账号"),
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
  },{
    label: transformI18n("代理返佣"),
    prop: "money",
  }, {
    label: transformI18n("注单编号"),
    prop: "zd_number",
  }, {
    label: transformI18n("状态"),
    slot: "status",
  }, {
    label: transformI18n("备注"),
    prop: "remark",
  }, {
    label: transformI18n("生成时间"),
    prop: "create_time",
  }, {
    label: transformI18n("派发时间"),
    prop: "update_time",
  },
  {
    label: transformI18n("操作"),
    slot:'right'
    // cellRenderer: ({ index, row }) => (
    //   <>
    //     <el-button size="small" type="danger" onClick={() => handleEidt(row,1)}>
    //       拒绝
    //     </el-button>
    //     <el-button size="small" type="primary" onClick={() => handleEidt(row,2)}>
    //       派发
    //     </el-button>
    //   </>
    // )
  }
];
  //编辑
const handleEidt = (row,idx) => {
  // visible.value = true;
  const msg = idx == 1?'确认拒绝吗？':'确认派发吗？';
  const query={
    edit:true,
    id:row.sb_id
  }
   proxy.$confirm(msg, '提示').then(() => {
       idx==1?noSend(query): send(query);
        }).catch(() => {
          console.log('取消');
    })
}
function noSend(query){
   agentReject(query).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  });
}
function send(query){
  agentSell(query).then((res:any)=>{
    if(res.code == 1){
       message(res.msg, { type: 'success' });
       init();
    }else{
       message(res.msg, { type: 'error' });
    }
  });
}


const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  zd_number:{
    type: 'input',
    placeholder: '注单号',
    value: '',
    prop:'zd_number'
  },
   username:{
    type: 'input',
    placeholder: 'UID/邮箱/手机号',
    value: '',
    prop:'username'
  },
  date:{
    type: 'time',
    placeholder: '注册时间',
    value: ():Array<string> => {
      return []
    },
    prop:'date'
  },
   status:{
    type: 'select',
    placeholder: '状态',
     value: '',
     options: [
       {
         label: '待处理',
        value:1,
       },{
         label: '拒绝',
        value:2,
       },{
         label: '派发',
        value:3,
       },{
         label: '手动派发',
        value:4,
       },
    ],
    prop:'status'
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
  zd_number:'',
  username:'',
  date:'',
  status:'',

});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取数量数据
getCount();
const countObj: any = reactive({ obj: {} })
async function getCount() {
  const res:any = await angentListCount();
  if (res.code == 1) {
    countObj.obj = res
  }
}
//获取列表数据
init();
function init(query?: object) {
  angentRakeList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
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


//删除
let selectAll = [];
const handleDelet = (bool) => {
  if (selectAll.length <= 0) {
      message('请选择', { type: 'error' });
      return;
  }
   const arr = [];
   proxy.$confirm(bool?'是否一键派发':'是否一键拒绝', '提示').then(() => {
    selectAll.forEach(item => {
      arr.push(item.id);
    })
    deleteIds(arr,bool)
  }).catch(() => {
    console.log('取消');
  })

}
const handleSelectionChange = (val) => {
  selectAll = val;
}
function deleteIds(id,bool) {
  const query = {
    id
  }
  const fun = bool ? angentDistribute : angentRefused;
  fun(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
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

     <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button type="primary" v-if="hasAuth('edit')" @click="handleDelet(true)">{{ $t('一键派发') }}</el-button>
        <el-button type="danger" v-if="hasAuth('edit')" @click="handleDelet(false)">{{ $t('一键拒绝') }}</el-button>
      </div>
      <div class="flex-fi">
        <el-button type="warning">{{ $t('待处理') }}{{ countObj.obj.pending_price }}</el-button>
        <el-button type="primary">{{ $t('派发') }}{{ countObj.obj.distribute_price }}</el-button>
        <el-button type="danger">{{ $t('拒绝') }}{{ countObj.obj.refuse_price }}</el-button>
        <el-button type="primary">{{ $t('手动派发') }}{{ countObj.obj.manual_price }}</el-button>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #right="{row}">
        <template  v-if="row.status == 1">
             <el-button size="small" v-if="hasAuth('edit')" type="danger" @click="handleEidt(row,1)" >{{ $t('拒绝') }}</el-button>
              <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row,2)">{{ $t('派发') }}</el-button>
        </template>
        <template v-else>
              <el-button size="small" type="info">{{ $t('拒绝') }}</el-button>
              <el-button size="small" type="info">{{ $t('派发') }}</el-button>
        </template>

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
  margin-top: 20px;
}
</style>
