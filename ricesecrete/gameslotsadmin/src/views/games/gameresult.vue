<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { liansaiScResList,liansaiScJiesuan,liansaiOrderback} from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    label: transformI18n("赛程时间"),
    prop: "sc_time",
    width:'150px',
  },{
    label: transformI18n("联赛"),
    prop: "ls_name",
    width:'150px',
  },{
    label: transformI18n("主队"),
    prop: "ls_team_zname",
    width:'150px',
  },{
    label: transformI18n("客队"),
    prop: "ls_team_kname",
    width:'150px',
  },{
    label: transformI18n("总注单数"),
    prop: "count_zhudan_number",
    width:'150px',
  },{
    label: transformI18n("总的注单金额"),
    prop: "count_zhudan_amount",
    width:'150px',
  },{
    label: transformI18n("赛事结果比分"),
    slot: "ssbf",
    width:'150px',
  },{
    label: transformI18n("输赢"),
    slot: "win_lose",
    width:'150px',
  }, {
    label: transformI18n("结算状态"),
    width:'150px',
    slot: "res_status",
  }, {
    label: transformI18n("赛事状态"),
    prop: "statusText",
    width:'150px',
  },
  {
    label: transformI18n("操作"),
    width:'180px',
    fixed:'right',
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleEdit(row)}>
          结算
        </el-button>
        <el-button size="small" type="danger" onClick={() => handleback(row)}>
          退回注单
        </el-button>
      </>
    )
  }
];

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
   sc_time: {
    type: 'time',
    placeholder: '时间',
    prop: 'sc_time',
    idx: 8,
    value: (): Array<string> => {
      return []
    }
  },
   ls_team_zname: {
    type: 'input',
    placeholder: '主队名称',
    value: '',
    prop: 'ls_team_zname'
  },
  ls_team_kname: {
    type: 'input',
    placeholder: '客队名称',
    value: '',
    prop: 'ls_team_kname'
  },
   res_status: {
    type: 'select',
    placeholder: '是否结算',
    value: '',
    prop: 'res_status',
    options: [
      {
        label: '已结算',
        value: 1,
      }, {
        label: '未结算',
        value: 2,
      }, {
        label: '结算中',
        value: 3,
      }
    ]
  },
  is_result: {
    type: 'select',
    placeholder: '赛事状态',
    value: '',
    prop: 'is_result',
    options: [
      {
        label: '未开始',
        value: 0,
      },
      {
        label: '进行中',
        value: 1,
      }, {
        label: '结束',
        value: 2,
      }, {
        label: '点球大战',
        value: 4,
      }, {
        label: '加时赛',
        value: 8,
      }, {
        label: '推迟',
        value: 11,
      }, {
        label: '取消',
        value: 13,
      }, {
        label: '暂停',
        value: 14,
      }, {
        label: '中断',
        value: 15,
      }, {
        label: '待定',
        value: 16,
      }, {
        label: '上半场',
        value: 17,
      }, {
        label: '下半场',
        value: 18,
      }, {
        label: '中场休息',
        value: 19,
      }, {
        label: '异常',
        value: 20,
      }
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

const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  select: true,
  sc_time:'',
  ls_team_zname: '',
  ls_team_kname: '',
  res_status: '',
  is_result: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  liansaiScResList(pagination).then((res:any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    backSelectBox.backselect = res.tournament_notes
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
  console.log('点击');
  //搜索列表 没有日期的写法

    //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'sc_time') {
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

//结算谭宽
const jieusnaCol=[
  {
    label: transformI18n("比分"),
    slot: "score",
  },{
    label: transformI18n("注单数"),
    prop: "zhudan_number",
  },{
    label: transformI18n("投注金额"),
    prop: "zhudan_amount",
  },{
    label: transformI18n("测试账号注单数"),
    prop: "test_zhudan_number",
  },{
    label: transformI18n("测试账号投注金额"),
    prop: "test_zhudan_amount",
  },
]
const jiesuanShow= ref(false);
let jiesuanRow = {

}
let jiesuanBacKData={}
const jiesuanList=[];
const bdsetList2 = {
  ls_name: '',
  ls_team_kname:'',
  ls_team_zname:''
};
const jiesuanData = reactive({jiesuanList,bdsetList2})

const handleEdit = (row) => {
    jiesuanShow.value = true;
    jiesuanRow = row
    jiesuanDatafn(row.id)
    yuguInit(row);
}
function jiesuanDatafn(id){
  const query={
    find:true,
    id
  }
  liansaiScJiesuan(query).then((res:any)=>{
    if(res.code == 1){
      jiesuanBacKData = res.data;
      jiesuanData.jiesuanList = res.data.bd;
      jiesuanInput.zd = res.data.ls_res_zd_fs
      jiesuanInput.ke = res.data.ls_res_kd_fs

        jiesuanData.bdsetList2.ls_name = res.data.ls_name
     jiesuanData.bdsetList2.ls_team_kname = res.data.ls_team_kname
     jiesuanData.bdsetList2.ls_team_zname = res.data.ls_team_zname
      // ls_res_zd_fs.value = res.data.ls_res_zd_fs;
      // ls_res_kd_fs.value =res.datals_res_kd_fs;
    }
  })
}

const remark = ref('');
const remarkShow = ref(false);
let remarkCurrentRow = {
  id:''
};
const handleback = (row) => {
  remarkCurrentRow  = row;
  remarkShow.value = true
}
const remackC=()=>{
  if(backSelectValue.value ==''){
    message('请选择', { type: 'error' });
    return;
  }
  const query={

      id:remarkCurrentRow.id,
      remarks:backSelectValue.value

  }
  liansaiOrderback(query).then((res:any)=>{
    if(res.code == 1){
       remarkShow.value = false
      message(res.msg, { type: 'success' });
      init();
    }
  })
}


const jiesuanInput=reactive({
  zd:0,
  ke:0
})

const yuguCol=[
   {
    label: transformI18n("预估结算比分"),
    slot: "ls_res_zd_fs",
    align:'center'
  }, {
    label: transformI18n("正波胆-平台赢"),
    align:'center',
    // prop: "ls_res_zd_fs",
     cellRenderer: ({ row }) => (
      <div>{row.zp_y?row.zp_y:0}</div>
    )
  }, {
    label: transformI18n("正波胆-平台输"),
     align:'center',
    // prop: "ls_res_zd_fs",
     cellRenderer: ({ row }) => (
      <div>{row.zp_s?row.zp_s:0}</div>
    )
  }, {
    label: transformI18n("反波胆-平台赢"),
     align:'center',
    // prop: "ls_res_zd_fs",
     cellRenderer: ({ row }) => (
      <div>{row.fb_y?row.fb_y:0}</div>
    )
  }, {
    label: transformI18n("反波胆-平台输"),
     align:'center',
    // prop: "ls_res_zd_fs",
     cellRenderer: ({ row }) => (
      <div>{row.fb_s?row.fb_s:0}</div>
    )
  },
]
const yuegulist = [
];
const yuguData = reactive({
  yuegulist
})
const ls_res_zd_fs =ref('');
const ls_res_kd_fs =ref('');
function yuguInit(row){
  const query={
      yg:true,
      info:{
        sc_id:row.id,
        kf:row.ls_res_kd_fs,
        zf:row.ls_res_zd_fs
      }
  }
  liansaiScJiesuan(query).then((res:any)=>{

     if(res.code == 1){
      yuguData.yuegulist = [res.data]
     }
  })
}
//确认就散

const sureJiesuan=()=>{

  const obj={};
  for(const key in jiesuanBacKData){
    if(key != 'bd' && key != 'ls_res_zd_fs' && key != 'ls_res_kd_fs'){
      obj[key] = jiesuanBacKData[key]
    }
  }
 proxy.$confirm('确认设置比赛比分'+jiesuanInput.zd+':'+jiesuanInput.ke, '提示').then(() => {
        // selectDelete(id);
        jieusanSubmit(obj);
        }).catch(() => {
          console.log('取消');
    })
}
//确认提交
function jieusanSubmit(obj){
  const query={
    again:true,
    info:{
      ...obj,
      ls_res_kd_fs:jiesuanInput.ke,
      ls_res_zd_fs:jiesuanInput.zd
    }
  }
   liansaiScJiesuan(query).then((res:any)=>{

     if(res.code == 1){
      jiesuanShow.value = false
       message(res.msg, { type: 'success' });
       init();
     }else{
       message(res.msg, { type: 'error' });
     }
  })
}

const backselect = [];
const backSelectBox=reactive({  backselect })
const backSelectValue = ref('');
const remakSelect=(val)=>{
  backSelectValue.value = val
}

</script>

<template>
  <div>
    <el-dialog v-model="remarkShow" width="40%" title="设置注销备注">
       <el-select v-model="backSelectValue" class="m-2" @change="remakSelect" placeholder="Select" size="large">
        <el-option
          v-for="item in backSelectBox.backselect"
          :key="item.value"
          :label="item.value"
          :value="item.value"
        />
      </el-select>
      <div style="height: 20px;"/>
       <div class="flex-bc">
        <div/>
        <div>
          <el-button type="primary" @click="remackC">{{ $t('确认') }}</el-button>
          <el-button @click="remarkShow = false">{{ $t('取消') }}</el-button>
        </div>
       </div>
    </el-dialog>
    <el-dialog v-model="jiesuanShow" width="80%" title="编辑">
       <div class="jieuanBox">
          <div style="margin-bottom:15px;">温馨提示：{{ jiesuanData.bdsetList2.ls_name }}  {{ jiesuanData.bdsetList2.ls_team_zname }}-{{ jiesuanData.bdsetList2.ls_team_kname }}</div>
        <el-form :inline="true"  class="demo-form-inline">
          <el-form-item   :label="$t('赛程波胆')">
              <div style="width:800px">
                   <pure-table :data="jiesuanData.jiesuanList" width="100%" :border="true" :columns="jieusnaCol" >
                    <template #score="{ row }">
                    <div>{{ row.zd }}-{{ row.kd  }}</div>
              </template>
                </pure-table>
              </div>
            </el-form-item>

          <div style="height:20px;"/>
          <div class="flex-fi">

                <el-form-item :label="$t('比赛结束的主队比分')">
                  <el-input v-model="jiesuanInput.zd" placeholder="" />
                </el-form-item>
                <el-form-item :label="$t('比赛结束的客队比分')">
                  <el-input v-model="jiesuanInput.ke" placeholder="" />
                </el-form-item>

          </div>
          <el-form-item :label="$t('预估获利')">
            <div style="width:800px">
                  <pure-table :data="yuguData.yuegulist" width="100%"  :columns="yuguCol" >
                   <template #ls_res_zd_fs="{ row }">
                          <div>{{ jiesuanInput.zd }}-{{ jiesuanInput.ke  }}</div>
                    </template>
                  </pure-table>
                   </div>
          </el-form-item>
          </el-form>
           <!-- <pure-table :data="jiesuanData.jiesuanList" width="100%" :border="true" :columns="jieusnaCol" >
              <template #score="{ row }">
                    <div>{{ row.zd }}-{{ row.kd  }}</div>
              </template>
          </pure-table> -->
          <el-form-item label="">
            <div class="tip">{{ $t('注：赢=下注金额、输=(下注金额*赔率)') }}</div><br/>

          </el-form-item>
          <el-form-item label="">

            <el-button  @click="sureJiesuan" type="primary">{{ $t('确认结算') }}</el-button>
          </el-form-item>
       </div>
    </el-dialog>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <pure-table :data="tableData.dataList" width="100%"  :columns="columns" >
      <template #ssbf="{row}">
          <el-tag size="small" v-if="row.is_cancel == 1" type="primary">{{ $t('手动取消') }}</el-tag>
          <template v-else>
            <el-tag size="small" v-if="row.is_result != 2 && row.res_status == 1">{{ $t('等待赛果') }}</el-tag>
            <el-tag size="small" v-else-if="row.is_result == 2 && row.res_status == 1" type="warning">{{ $t('结算中') }}</el-tag>
            <div v-else>{{ row.ls_res_zd_fs }}-{{ row.ls_res_kd_fs }}</div>
          </template>
      </template>
      <template #res_status="{row}">
          <el-tag size="small" v-if="row.is_result != 2 && row.res_status == 1" type="danger">{{ $t('未结算') }}</el-tag>
          <el-tag size="small" v-else-if="row.is_result == 2 && row.is_result == 1" type="warning">{{ $t('结算中') }}</el-tag>
          <el-tag size="small" v-else>{{ $t('已结算') }}</el-tag>
      </template>
      <template #win_lose="{row}">
          <el-tag size="small" v-if="row.is_result != 2 && row.res_status == 1">{{ $t('等待结算') }}</el-tag>
          <el-tag size="small" v-else-if="row.is_result == 2 && row.res_status == 1">{{ $t('结算中') }}</el-tag>
          <div v-else>
            <div>{{ $t('平台赢') }}：{{ row.y_price }}</div>
            <div>{{ $t('平台输') }}：{{ row.s_price }}</div>
          </div>
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
.jieuanBox{
  padding:50px;
  padding-top:0px;
}
.tip{
  color:var(--el-color-danger)
}
</style>
