<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { overtimeMatch,liansaiScJiesuan,liansaiOrderback,indexCanceMatch} from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";

const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    label: transformI18n("联赛名称"),
    prop: "ls_name",
  },{
    label: transformI18n("赛程时间"),
    prop: "sc_time",
  },{
    label: transformI18n("主队"),
    prop: "zd_name",
  },{
    label: transformI18n("客队"),
    prop: "kd_name",
  },{
    label: transformI18n("注单金额"),
    prop: "zhudan_amount",
  },
  {
    label: transformI18n("操作"),
    fixed:'right',
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleEdit(row)}>
          { transformI18n('结算') }
        </el-button>
        <el-button size="small" type="danger" onClick={() => handleback(row)}>
          { transformI18n('取消赛事并退回所有投注') }
        </el-button>
      </>
    )
  }
];
const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样
const emit = defineEmits(['backdata'])
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  overtimeMatch(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    backSelectBox.backselect = res.tournament_notes
    // pagination.page = res.data.current_page
    emit('backdata', {len:res.data.total,index:4})
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
  // console.log(row);
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
  indexCanceMatch(query).then((res:any)=>{
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
        kf:0,
        zf:0
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
    <el-dialog v-model="remarkShow" width="40%" :title="$t('设置注销备注')">
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
    <el-dialog v-model="jiesuanShow" width="80%" :title="$t('编辑')">
       <div class="jieuanBox">
          <div style="margin-bottom:15px;">{{ $t('温馨提示') }}：{{ jiesuanData.bdsetList2.ls_name }}  {{ jiesuanData.bdsetList2.ls_team_zname }}-{{ jiesuanData.bdsetList2.ls_team_kname }}</div>
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
                  <pure-table :border="true" :data="yuguData.yuegulist" width="100%"  :columns="yuguCol" >
                   <template #ls_res_zd_fs>
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
            <div class="tip">注：赢=下注金额、输=(下注金额*赔率)</div><br/>

          </el-form-item>
          <el-form-item label="">

            <el-button  @click="sureJiesuan" type="primary">{{ $t('确认结算') }}</el-button>
          </el-form-item>
       </div>
    </el-dialog>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <!-- <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"></commSerach> -->
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" />
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
