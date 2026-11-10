<script setup lang="tsx">
import { onMounted, reactive, ref } from "vue";
import { http } from "@/utils/http";
import { message } from "@/utils/message";
import { formaTime, timeCycleFull } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import * as echarts from 'echarts'
import { nullable } from "vue-types";
import { forEach } from "lodash";
import { pa } from "element-plus/es/locale";
defineOptions({
  name: 'report_uservalue'
})

const rdatas={
  types:[],
  datas:[],
  parts:[],
  procdatas:[],
  refresh:false,
  datascycle:{},
  refreshcycle:false,
  partscycle:[]
}

const defaultrange={
  s:null,
  e:null,
  d:null
}

const searchList = {
  
  rtype:{
    type: 'select',
    placeholder: '主指标',
    value: '',
    options:[],
    prop: 'rtype',
    span:7
  },
  stype:{
    type: 'select',
    placeholder: '副指标',
    value: '',
    options:[],
    prop: 'stype'
  },
  s:{
    type: 'dateonly',
    placeholder: '选择日期',
    value: '',
    prop: 's'
  },
  search:{
    type: 'button',
    value: '查看报表',
    handle: 'search',
    prop:'search'
  },
  sadd:{
    type: 'button',
    value: '增加对比日期',
    handle: 'addsearch',
    prop:'sadd'
  },
}

const searchListCycle = {
  s:{
    type: 'date',
    placeholder: '开始日期',
    value: [],
    prop: 's',
    span:6
  },
  rtype:{
    type: 'select',
    placeholder: '主指标',
    value: '',
    options:[],
    prop: 'rtype',
    span:4
  },
  stype:{
    type: 'select',
    placeholder: '副指标',
    value: '',
    options:[],
    prop: 'stype',
    span:3
  },
  tag:{
    type: 'select',
    placeholder: '数据',
    value: '',
    options:[],
    prop: 'tag',
    span:2
  },
  
  search:{
    type: 'button',
    value: '查看报表',
    handle: 'search',
    prop:'search'
  }
}

const searchListBox = reactive({
  searchList,
  searchListCycle
})

const pagination = reactive({
  s:[],
  typestr:'',
  ptype:'',
  stype:''
});

const paginationcycle = reactive({
  s:null,
  e:null,
  typestr:'',
  ptype:'',
  stype:'',
  cycle:true
});

const dataList: any ={};
const tableData = reactive({ dataList });
//initlist();

function initlist(){
  http.post('/report/get_active_report_range', {}).then((res:any) => {
    defaultrange.s=res.data.d.s;
    defaultrange.e=res.data.d.e;
    searchListBox.searchList.s.value =defaultrange.e;
    pagination.s=[defaultrange.e]
      //最近30天
    defaultrange.d=defaultrange.e==null?null:(timeCycleFull((new Date(defaultrange.e)).getTime()-30*86400*1000) + ' - ' + defaultrange.e)
    paginationcycle.s=defaultrange.d
    //console.log(defaultrange)
    searchListBox.searchListCycle.s.value=[
    timeCycleFull((new Date(defaultrange.e)).getTime()-30*86400*1000),
    defaultrange.e
    ]
    //console.log(searchListCycle)
    http.post('/report/get_distribution_reports_class', {}).then((res:any) => {
    rdatas.types = res.data
    const pt=[];
    const st=[];
    for(const key in rdatas.types){
      pt.push({label:rdatas.types[key].title,value:rdatas.types[key].title})
    }
    searchListBox.searchList.rtype.options=pt
    searchListBox.searchList.rtype.value=pt[0].value
    for(const key in rdatas.types[0].subtype){
      st.push({label:rdatas.types[0].subtype[key].title,value:rdatas.types[0].subtype[key].title})
    }
    searchListBox.searchList.stype.options=st
    searchListBox.searchList.stype.value=st[0].value
    pagination.typestr=pt[0].value+":"+st[0].value
    pagination.ptype=pt[0].value
    pagination.stype=st[0].value
    init()
    searchListBox.searchListCycle.rtype.options=pt
    searchListBox.searchListCycle.rtype.value=pt[0].value
    searchListBox.searchListCycle.stype.options=st
    searchListBox.searchListCycle.stype.value=st[0].value
    paginationcycle.typestr=pt[0].value+":"+st[0].value
    paginationcycle.ptype=pt[0].value
    paginationcycle.stype=st[0].value
    searchListBox.searchListCycle.tag.options=[
    {label:rdatas.types[0].unit,value:rdatas.types[0].unit},
    {label:rdatas.types[0].subtype[0].unit,value:rdatas.types[0].subtype[0].unit}
    ]
    searchListBox.searchListCycle.tag.value=rdatas.types[0].unit
    initcycle()

  })

  })

  
  
}


// 绘制图表


const option_target_value={legend:{type:'scroll',orient:'horizontal'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'left',text: '生命周期:平均贡献'},xAxis: {name:"",nameLocation:"center",nameGap:45,axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const target_value=ref(null)//用户游戏报表
let myecharts_target_value=null

const option_target_value_cycle={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'left',text: '生命周期:平均贡献'},xAxis: {name:"",nameLocation:"center",nameGap:45,axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const target_value_cycle=ref(null)//用户游戏报表
let myecharts_target_value_cycle=null




function getdatalistfromarray(d,f){
  const td=[];
  const keys=['a','b','c','d','e','f','g','h','i','j'];
  keys.forEach((el)=>{
    td.push(d['sd_interval_'+el+f])
  })
  return td;
}

function getdatalistfromarrayCycle(d,f){
  const td=[];
  d.forEach((el)=>{
    td.push(el[f])
  })
  return td;
}


//获取列表数据
//init();
function init() {
  //console.log('init')
  http.post('/report/get_distribution_reports_data', {data: pagination}).then((res:any) => {
    rdatas.datas = res.data
    if (rdatas.datas[0].length==0){
      message('所选日期没有数据，请等待数据统计建立后再查询', { type: 'info' });
      return;
    }
//处理数据结构
//X轴
//console.log(pagination)
rdatas.parts=rdatas.datas[0][pagination.ptype].info.parts
//Y轴
option_target_value.yAxis=[{type:'value',name:rdatas.datas[0][pagination.ptype].info.unit},{type:'value',name:rdatas.datas[0][pagination.ptype].data[pagination.stype].info.subtype.unit}];
//处理数据结构
rdatas.procdatas=[]
for(const p in rdatas.datas){
  //console.log(p)
  for(const d in rdatas.datas[p][pagination.ptype].data[pagination.stype].data){
    const tmpdt=rdatas.datas[p][pagination.ptype].data[pagination.stype].data[d];
    const tmpday=rdatas.datas[p][pagination.ptype].data[pagination.stype].data[d].sd_dt;
    rdatas.procdatas[tmpday]=tmpdt
  }
}
//console.log(rdatas.procdatas)
option_target_value.series=[]
for(const key in rdatas.procdatas){
 //主指标
 option_target_value.series.push({type:"bar",name:key+rdatas.datas[0][pagination.ptype].info.unit,yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.procdatas[key],'')});
 //副指标
 option_target_value.series.push( {type:"line",name:key+rdatas.datas[0][pagination.ptype].data[pagination.stype].info.subtype.unit,yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.procdatas[key],'v')});
  }
  //console.log(option_target_value.series)
//处理数据结构END


  myecharts_target_value=echarts.init(target_value.value)
  if(rdatas.refresh){
     myecharts_target_value.clear()
     rdatas.refresh=false
  }
  option_target_value.xAxis.data=rdatas.parts
  option_target_value.xAxis.name='主指标说明：'+rdatas.datas[0][pagination.ptype].info.info+'        '+'副指标说明：'+rdatas.datas[0][pagination.ptype].data[pagination.stype].info.subtype.info
  option_target_value.title.text=rdatas.datas[0][pagination.ptype].info.title+':'+rdatas.datas[0][pagination.ptype].data[pagination.stype].info.subtype.title
  
  myecharts_target_value.setOption(option_target_value)






  })
  
}

//获取列表数据
//init();
function initcycle() {
  //console.log('init')
  http.post('/report/get_distribution_reports_data', {data: paginationcycle}).then((res:any) => {
    rdatas.datascycle = res.data[paginationcycle.ptype]
    const datas=rdatas.datascycle.data[paginationcycle.stype].data
    if (datas.length==0){
      message('所选日期没有数据，请等待数据统计建立后再查询', { type: 'info' });
      return;
    }
//处理数据结构
//X轴
//console.log(pagination)
let tmpyear
const dt=getdatalistfromarrayCycle(datas,'sd_dt')
rdatas.partscycle=dt.reduce((a,b,i)=>{
    if (i==1){
      if (a.toString().substring(0,6)==b.toString().substring(0,6)){
        tmpyear=a.toString().substring(0,6)
        b=b.toString().substring(6,8)
      }
      return [a,b]
    }else{
      if (b.toString().substring(0,6)==tmpyear){
        a.push(b.toString().substring(6,8))
      }else{
        tmpyear=b.toString().substring(0,6)
        a.push(b)
      }
      
      return a
    }
  })
  //console.log(dt)
//Y轴
if (searchListCycle.tag.value==rdatas.datascycle.info.unit){
  option_target_value_cycle.yAxis={type:'value',name:rdatas.datascycle.info.unit}
}else{
  option_target_value_cycle.yAxis={type:'value',name:rdatas.datascycle.data[paginationcycle.stype].info.subtype.unit}
}

option_target_value_cycle.series=[]
const parts=rdatas.datascycle.info.parts
//console.log(parts)
let tags=[];
if (searchListCycle.tag.value==rdatas.datascycle.info.unit){
  tags=['a','b','c','d','e','f','g','h','i','j'];
}
else{
  tags=['av','bv','cv','dv','ev','fv','gv','hv','iv','jv'];
}
for(const key in parts){
 //主指标
 option_target_value_cycle.series.push({type:"line",name:parts[key],smooth:true,data:getdatalistfromarrayCycle(datas,'sd_interval_'+tags[key])});
 }
  //console.log(option_target_value.series)
//处理数据结构END


  myecharts_target_value_cycle=echarts.init(target_value_cycle.value)
  if(rdatas.refreshcycle){
     myecharts_target_value_cycle.clear()
     rdatas.refreshcycle=false
  }
  option_target_value_cycle.xAxis.data=rdatas.partscycle
  option_target_value_cycle.xAxis.name='主指标说明：'+rdatas.datascycle.info.info+'        '+'副指标说明：'+rdatas.datascycle.data[paginationcycle.stype].info.subtype.info
  option_target_value_cycle.title.text=rdatas.datascycle.info.title+':'+rdatas.datascycle.data[paginationcycle.stype].info.subtype.title+':'+searchListCycle.tag.value+' 周期变化图'
  
  myecharts_target_value_cycle.setOption(option_target_value_cycle)

  })
  
}


//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
  if (index=='rtype'){
    //console.log(searchListBox.searchList)
    //console.log([value,index])
    //console.log(rdatas)
    for(const key in rdatas.types){
      if (rdatas.types[key].title==value){
        const st=[];
    for(const keysub in rdatas.types[key].subtype){
      st.push({label:rdatas.types[key].subtype[keysub].title,value:rdatas.types[key].subtype[keysub].title})
    }
    searchListBox.searchList.stype.options=st
    searchListBox.searchList.stype.value=st[0].value
        break;
      }
    }
  }
  if (index=='s'){
    if (value>defaultrange.e) {
      searchListBox.searchList.s.value=defaultrange.e
      message('所选日期没有数据，自动选择最新日期', { type: 'info' });
    }
    if (value<defaultrange.s) {
      searchListBox.searchList.s.value=defaultrange.s
      message('所选日期没有数据，自动选择最早日期', { type: 'info' });
    }
  }
  //console.log(searchListBox.searchList)
}

//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    //console.log(key)
  
      if (key == 's') {
        if (searchList[key].value==null){
          message('请选择日期', { type: 'error' });
          return;
        }
        pagination[key] = [searchList[key].value]
      } else if(key=='typestr') {
        //console.log(key)
        if (searchList.rtype.value=='') {
          message('请选择主指标', { type: 'error' });
          return;
        }
        if (searchList.stype.value=='') {
          message('请选择副指标', { type: 'error' });
          return;
        }
        pagination[key] = searchList.rtype.value+":"+searchList.stype.value
        if ((pagination['ptype']!=searchList.rtype.value || pagination['stype']!=searchList.stype.value) && pagination['ptype']!="" && pagination['stype']!=""){
          rdatas.refresh=true
        }
        pagination['ptype'] = searchList.rtype.value
        pagination['stype'] = searchList.stype.value
      }
   
  }
  init();
}

const handleAddsearch=()=>{
  if (pagination.typestr==""){
    message('请首先执行查询报表操作', { type: 'error' });
    return;
  }
  if (searchList.s.value==null){
          message('请选择日期', { type: 'error' });
          return;
  }
  if (pagination.s.indexOf(searchList.s.value)>=0){
    message('所选日期已经在报表中', { type: 'info' });
          return;
  }
  if (pagination.s.length>=3){
    message('比较指标日期超过3个，自动排除第一个新增日期', { type: 'info' });
    for(let i=1;i<pagination.s.length-1;i++){
      pagination.s[i]=pagination.s[i+1]
    }
    pagination.s[2]=searchList.s.value
  }else{
    pagination.s.push(searchList.s.value)
  }
  //console.log(pagination)
  init();
}

//点击确定
const handleBtnCycle = () => {
  for (const key in paginationcycle) {
    //console.log(key)
  
    if (key == 's') {
        const val = searchListCycle[key].value;
        const time = val && val.length > 0 ? timeCycleFull(val[0]) + ' - ' + timeCycleFull(val[1]) : '';
        paginationcycle[key] =  time;
      } else if(key=='typestr') {
        //console.log(key)
        if (searchListCycle.rtype.value=='') {
          message('请选择主指标', { type: 'error' });
          return;
        }
        if (searchListCycle.stype.value=='') {
          message('请选择副指标', { type: 'error' });
          return;
        }
        paginationcycle[key] = searchListCycle.rtype.value+":"+searchListCycle.stype.value
        if ((paginationcycle['ptype']!=searchListCycle.rtype.value || paginationcycle['stype']!=searchListCycle.stype.value) && paginationcycle['ptype']!="" && paginationcycle['stype']!=""){
          rdatas.refreshcycle=true
        }
        paginationcycle['ptype'] = searchListCycle.rtype.value
        paginationcycle['stype'] = searchListCycle.stype.value
      }
   
  }
  initcycle();
}

//输入框的数据
const handleCurrentChangeCycle = ({ value,index }) => {
  searchListBox.searchListCycle[index].value = value;
  if (index=='rtype'){
    //console.log(searchListBox.searchListCycle)
    //console.log([value,index])
    //console.log(rdatas)
    for(const key in rdatas.types){
      if (rdatas.types[key].title==value){
        const st=[];
    for(const keysub in rdatas.types[key].subtype){
      st.push({label:rdatas.types[key].subtype[keysub].title,value:rdatas.types[key].subtype[keysub].title})
      if (keysub=='0'){
        const tt=[
        {label:rdatas.types[key].unit,value:rdatas.types[key].unit},
        {label:rdatas.types[key].subtype[0].unit,value:rdatas.types[key].subtype[0].unit}
        ]
        searchListBox.searchListCycle.tag.options=tt
        searchListBox.searchListCycle.tag.value=tt[0].value
      }
    }
    searchListBox.searchListCycle.stype.options=st
    searchListBox.searchListCycle.stype.value=st[0].value
        break;
      }
    }
  }
  if (index=='stype'){
    for(const key in rdatas.types){
      if (rdatas.types[key].title==searchListBox.searchListCycle['rtype'].value){
        const st=[{label:rdatas.types[key].unit,value:rdatas.types[key].unit}];
    for(const keysub in rdatas.types[key].subtype){
      if (rdatas.types[key].subtype[keysub].title==value){
      st.push({label:rdatas.types[key].subtype[keysub].unit,value:rdatas.types[key].subtype[keysub].unit})
      }
    }
    searchListBox.searchListCycle.tag.options=st
    searchListBox.searchListCycle.tag.value=st[0].value
        break;
      }
    }
  }
  
  //console.log(searchListBox.searchList)
}




onMounted(()=>{
  initlist()
})


</script>

<template>
  <div>
    <div>
    
    <el-text style="font-weight: bold; font-size: 150%; color:red;">用户价值图表</el-text>
    <commSerach @search="handleBtn" @addsearch="handleAddsearch" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
   

    
   <div style="height:40rem; margin: 5px;" ref="target_value"/>
    
  </div>

  <div>
    
    <el-text style="font-weight: bold; font-size: 150%; color:red;">用户价值图表分段周期图</el-text>
    <commSerach @search="handleBtnCycle" @currentChange="handleCurrentChangeCycle"  :list="searchListBox.searchListCycle"/>
   

    
   <div style="height:40rem; margin: 5px;" ref="target_value_cycle"/>
    
  </div>

  
</div>
</template>
<style scoped>
.btmNav{
  padding:30px 0;
}
</style>
