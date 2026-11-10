<script setup lang="tsx">
import { onMounted, reactive, ref } from "vue";
import { http } from "@/utils/http";
import { message } from "@/utils/message";
import { formaTime, timeCycleFull } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import * as echarts from 'echarts'
import { nullable } from "vue-types";
defineOptions({
  name: 'report_finactive'
})

const rdatas={
  d:[],
  dt:[],
  w:[],
  wt:[],
  m:[],
  mt:[]
}

const defaultrange={
  d:null,
  w:null,
  m:null
}

const searchList = {
  s:{
    type: 'date',
    placeholder: '开始日期',
    value: [],
    prop: 's'
  },
  proxyid:{
      type:'input',
      placeholder:'代理用户名、手机号、EMAIL、推广码',
      value:'',
      prop:'proxyid'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListWeek = {
  s:{
    type: 'select',
    placeholder: '开始周数',
    value: '',
    options:[],
    prop: 's'
  },
  e:{
    type: 'select',
    placeholder: '结束周数',
    value: '',
    options:[],
    prop: 'e'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListMonth = {
  s:{
    type: 'select',
    placeholder: '开始月份',
    value: '',
    options:[],
    prop: 's'
  },
  e:{
    type: 'select',
    placeholder: '结束月份',
    value: '',
    options:[],
    prop: 'e'
  },
  search:{
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop:'search'
  },
}
const searchListBox = reactive({
  searchList,
  searchListWeek,
  searchListMonth
})

const pagination = reactive({
  s:'',
  proxyid:'',
  type:'d',
  field:'*',
  fieldsum:['suv_winprice','suv_loseprice','suv_pwinprice','suv_payin','suv_payinnum','suv_payinprice','suv_withraw','suv_withrawnum','suv_withrawprice','suv_playprice','suv_ppwc']
});
const paginationWeek = reactive({
  s:'',
  e:'',
  type:'w',
  field:'*',
  fieldsum:['suv_winprice','suv_loseprice','suv_pwinprice','suv_payin','suv_payinnum','suv_payinprice','suv_withraw','suv_withrawnum','suv_withrawprice','suv_playprice','suv_ppwc']
});
const paginationMonth = reactive({
  s:'',
  e:'',
  type:'m',
  field:'*',
  fieldsum:['suv_winprice','suv_loseprice','suv_pwinprice','suv_payin','suv_payinnum','suv_payinprice','suv_withraw','suv_withrawnum','suv_withrawprice','suv_playprice','suv_ppwc']
});
const dataList: any ={};
const tableData = reactive({ dataList });
//initlist();
const m=[]
    const me=[]
    const w=[]
    const we=[]
function initlist(){
  http.post('/report/get_active_report_range', {}).then((res:any) => {
    tableData.dataList = res.data
    
    tableData.dataList.m.forEach(el => {
      //console.log(el)
      m.push({
        label:el.toString().substring(0,4)+'年'+el.toString().substring(4,6)+'月',
        value:el
      })
      me.push({
        label:el.toString().substring(0,4)+'年'+el.toString().substring(4,6)+'月',
        value:el
      })
    });
    searchListMonth.s.options=m
    searchListMonth.e.options=me.reverse()
    
    tableData.dataList.w.forEach(el => {
      //console.log(el)
      w.push({
        label:el.toString().substring(0,4)+'年第'+el.toString().substring(4,6)+'周',
        value:el
      })
      we.push({
        label:el.toString().substring(0,4)+'年第'+el.toString().substring(4,6)+'周',
        value:el
      })
    });
    searchListWeek.s.options=w
    searchListWeek.e.options=we.reverse()
    //初始化数据参数
    //最近30天
    defaultrange.d=tableData.dataList.d.e==null?null:(timeCycleFull((new Date(tableData.dataList.d.e)).getTime()-30*86400*1000) + ' - ' + tableData.dataList.d.e)
    pagination.s=defaultrange.d
    //初始化日期选择框数值
    searchListBox.searchList.s.value=[
    timeCycleFull((new Date(tableData.dataList.d.e)).getTime()-30*86400*1000),
    tableData.dataList.d.e
    ]
    //最近12周
    defaultrange.w={
      sweek:we.length>0?(we[we.length>11?11:we.length-1].value):null,
      eweek:we.length>0?we[0].value:null
    }
    paginationWeek.e=defaultrange.w.eweek
    paginationWeek.s=defaultrange.w.sweek
    //最近12月
    defaultrange.m={
      smonth:me.length>0?(me[me.length>11?11:me.length-1].value):null,
      emonth:me.length>0?me[0].value:null
    }
    paginationMonth.e=defaultrange.m.emonth
    paginationMonth.s=defaultrange.m.smonth
    init()
  initWeek()
  initMonth()
  })
  
}


// 绘制图表

const option_daytarget_game={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户游戏(累计)报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const daytarget_game=ref(null)//用户游戏报表
let myecharts_daytarget_game=null
const option_daytarget_payinsum={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户充提(累计)报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const daytarget_payinsum=ref(null)//用户游戏报表
let myecharts_daytarget_payinsum=null
const option_daytarget_gameprice={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户游戏报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const daytarget_gameprice=ref(null)//用户游戏报表
let myecharts_daytarget_gameprice=null
const option_daytarget_payin={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center',selected:{"用户余额":false}},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户充值提现报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const daytarget_payin=ref(null)//用户充值报表
let myecharts_daytarget_payin=null


const option_weektarget_game={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户游戏(累计)报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const weektarget_game=ref(null)//用户游戏报表
let myecharts_weektarget_game=null
const option_weektarget_payinsum={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户充提(累计)报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const weektarget_payinsum=ref(null)//用户游戏报表
let myecharts_weektarget_payinsum=null
const option_weektarget_gameprice={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户周游戏报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const weektarget_gameprice=ref(null)//用户游戏报表
let myecharts_weektarget_gameprice=null
const option_weektarget_payin={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户周充值提现报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const weektarget_payin=ref(null)//用户充值报表
let myecharts_weektarget_payin=null

const option_monthtarget_game={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户游戏(累计)报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const monthtarget_game=ref(null)//用户游戏报表
let myecharts_monthtarget_game=null
const option_monthtarget_payinsum={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户充提(累计)报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: {type:'value',name:'金额'},series: []};
const monthtarget_payinsum=ref(null)//用户游戏报表
let myecharts_monthtarget_payinsum=null
const option_monthtarget_gameprice={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户月游戏报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const monthtarget_gameprice=ref(null)//用户游戏报表
let myecharts_monthtarget_gameprice=null
const option_monthtarget_payin={legend:{type:'scroll',left:'right',rigth:'10',orient:'vertical',top:'center'},backgroundColor:'#fff',tooltip:{show:true,trigger:'axis'},title: {left:'center',text: '用户月充值提现报表'},xAxis: {axisLabel:{interval:0,rotate:45},data:[]},
  yAxis: [{type:'value',name:'金额'},{type:'value',name:'金额'}],series: []};
const monthtarget_payin=ref(null)//用户充值报表
let myecharts_monthtarget_payin=null


function getdatalistfromarray(d,f){
  const td=[];
  d.forEach((el)=>{
    td.push(el[f])
  })
  return td;
}

let tmpyear=null
let tmpyearw=null
let tmpyearm=null


//获取列表数据
//init();
function init() {
  console.log('init')
  http.post('/report/get_active_report_data', {data: pagination}).then((res:any) => {
    rdatas.d = res.data
    rdatas.dt=rdatas.d.reduce((a,b,i)=>{
    if (i==1){
      if (a.dt.toString().substring(0,6)==b.dt.toString().substring(0,6)){
        tmpyear=a.dt.toString().substring(0,6)
        b.dt=b.dt.toString().substring(6,8)
      }
      return [a.dt,b.dt]
    }else{
      if (b.dt.toString().substring(0,6)==tmpyear){
        a.push(b.dt.toString().substring(6,8))
      }else{
        tmpyear=b.dt.toString().substring(0,6)
        a.push(b.dt)
      }
      
      return a
    }
  })




  myecharts_daytarget_game=echarts.init(daytarget_game.value)
  option_daytarget_game.xAxis.data=rdatas.dt
  option_daytarget_game.series=[
  {type:"line",name:'投注金额',stack:'x',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_playpricesum')},
  {type:"line",name:'平台赢金额',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_pwinpricesum')}
  ]
  myecharts_daytarget_game.setOption(option_daytarget_game)

  myecharts_daytarget_payinsum=echarts.init(daytarget_payinsum.value)
  option_daytarget_payinsum.xAxis.data=rdatas.dt
  option_daytarget_payinsum.series=[
  {type:"line",name:'充值额',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_payinpricesum')},
  {type:"line",name:'提现额',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_withrawpricesum')},
  {type:"line",name:'充提差额',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_ppwcsum')}
  ]
  myecharts_daytarget_payinsum.setOption(option_daytarget_payinsum)

  myecharts_daytarget_gameprice=echarts.init(daytarget_gameprice.value)
  option_daytarget_gameprice.xAxis.data=rdatas.dt
  option_daytarget_gameprice.series=[
  {type:"bar",name:'投注金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_playprice')},
  {type:"bar",name:'平台输赢',yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.d,'suv_pwinprice')},
  {type:"line",name:'平台累计输赢',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.d,'suv_pwinpricesum')}
  ]
  myecharts_daytarget_gameprice.setOption(option_daytarget_gameprice)

  myecharts_daytarget_payin=echarts.init(daytarget_payin.value)
  option_daytarget_payin.xAxis.data=rdatas.dt
  option_daytarget_payin.series=[
  {type:"bar",name:'充值金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_payinprice')},
  {type:"bar",name:'提现金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.d,'suv_withrawprice')},
  {type:"bar",name:'充提差额',yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.d,'suv_ppwc')},
  {type:"line",name:'累计充提差额',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.d,'suv_ppwcsum')},
  {type:"line",name:'用户余额',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.d,'suv_balance')}
  ]
  myecharts_daytarget_payin.setOption(option_daytarget_payin)




  })
  
}
//initWeek();
function initWeek() {
  http.post('/report/get_active_report_data', {data: paginationWeek}).then((res:any) => {
    rdatas.w = res.data
    rdatas.wt=rdatas.w.reduce((a,b,i)=>{
    if (i==1){
      if (a.dt.toString().substring(0,4)==b.dt.toString().substring(0,4)){
        tmpyearw=a.dt.toString().substring(0,4)
        b.dt=b.dt.toString().substring(4,6)
      }
      return [a.dt,b.dt]
    }else{
      if (b.dt.toString().substring(0,4)==tmpyearw){
        a.push(b.dt.toString().substring(4,6))
      }else{
        tmpyearw=b.dt.toString().substring(0,4)
        a.push(b.dt)
      }
      
      return a
    }
  })


  myecharts_weektarget_game=echarts.init(weektarget_game.value)
  option_weektarget_game.xAxis.data=rdatas.wt
  option_weektarget_game.series=[
  {type:"line",name:'投注金额',stack:'x',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_playpricesum')},
  {type:"line",name:'平台赢金额',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_pwinpricesum')}
  ]
  myecharts_weektarget_game.setOption(option_weektarget_game)

  myecharts_weektarget_payinsum=echarts.init(weektarget_payinsum.value)
  option_weektarget_payinsum.xAxis.data=rdatas.wt
  option_weektarget_payinsum.series=[
  {type:"line",name:'充值额',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_payinpricesum')},
  {type:"line",name:'提现额',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_withrawpricesum')},
  {type:"line",name:'充提差额',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_ppwcsum')}
  ]
  myecharts_weektarget_payinsum.setOption(option_weektarget_payinsum)

  myecharts_weektarget_gameprice=echarts.init(weektarget_gameprice.value)
  option_weektarget_gameprice.xAxis.data=rdatas.wt
  option_weektarget_gameprice.series=[
  {type:"bar",name:'投注金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_playprice')},
  {type:"bar",name:'平台输赢',yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.w,'suv_pwinprice')},
  {type:"line",name:'平台累计输赢',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.w,'suv_pwinpricesum')}
  ]
  myecharts_weektarget_gameprice.setOption(option_weektarget_gameprice)

  myecharts_weektarget_payin=echarts.init(weektarget_payin.value)
  option_weektarget_payin.xAxis.data=rdatas.wt
  option_weektarget_payin.series=[
  {type:"bar",name:'充值金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_payinprice')},
  {type:"bar",name:'提现金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.w,'suv_withrawprice')},
  {type:"bar",name:'充提差额',yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.w,'suv_ppwc')},
  {type:"line",name:'累计充提差额',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.w,'suv_ppwcsum')},
  {type:"line",name:'用户余额',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.w,'suv_balance')}
  ]
  myecharts_weektarget_payin.setOption(option_weektarget_payin)







  })
}
//initMonth();
function initMonth() {
  http.post('/report/get_active_report_data', {data: paginationMonth}).then((res:any) => {
    rdatas.m = res.data
    rdatas.mt=rdatas.m.reduce((a,b,i)=>{
    if (i==1){
      if (a.dt.toString().substring(0,4)==b.dt.toString().substring(0,4)){
        tmpyearm=a.dt.toString().substring(0,4)
        b.dt=b.dt.toString().substring(4,6)
      }
      return [a.dt,b.dt]
    }else{
      if (b.dt.toString().substring(0,4)==tmpyearm){
        a.push(b.dt.toString().substring(4,6))
      }else{
        tmpyearm=b.dt.toString().substring(0,4)
        a.push(b.dt)
      }
      
      return a
    }
  })


  myecharts_monthtarget_game=echarts.init(monthtarget_game.value)
  option_monthtarget_game.xAxis.data=rdatas.mt
  option_monthtarget_game.series=[
  {type:"line",name:'投注金额',stack:'x',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_playpricesum')},
  {type:"line",name:'平台赢金额',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_pwinpricesum')}
  ]
  myecharts_monthtarget_game.setOption(option_monthtarget_game)

  myecharts_monthtarget_payinsum=echarts.init(monthtarget_payinsum.value)
  option_monthtarget_payinsum.xAxis.data=rdatas.mt
  option_monthtarget_payinsum.series=[
  {type:"line",name:'充值额',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_payinpricesum')},
  {type:"line",name:'提现额',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_withrawpricesum')},
  {type:"line",name:'充提差额',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_ppwcsum')}
  ]
  myecharts_monthtarget_payinsum.setOption(option_monthtarget_payinsum)


  myecharts_monthtarget_gameprice=echarts.init(monthtarget_gameprice.value)
  option_monthtarget_gameprice.xAxis.data=rdatas.mt
  option_monthtarget_gameprice.series=[
  {type:"bar",name:'投注金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_playprice')},
  {type:"bar",name:'平台输赢',yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.m,'suv_pwinprice')},
  {type:"line",name:'平台累计输赢',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.m,'suv_pwinpricesum')}
  ]
  myecharts_monthtarget_gameprice.setOption(option_monthtarget_gameprice)

  myecharts_monthtarget_payin=echarts.init(monthtarget_payin.value)
  option_monthtarget_payin.xAxis.data=rdatas.mt
  option_monthtarget_payin.series=[
  {type:"bar",name:'充值金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_payinprice')},
  {type:"bar",name:'提现金额',yAxisIndex:0,stack:'x',smooth:true,data:getdatalistfromarray(rdatas.m,'suv_withrawprice')},
  {type:"bar",name:'充提差额',yAxisIndex:0,smooth:true,data:getdatalistfromarray(rdatas.m,'suv_ppwc')},
  {type:"line",name:'累计充提差额',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.m,'suv_ppwcsum')},
  {type:"line",name:'用户余额',yAxisIndex:1,smooth:true,data:getdatalistfromarray(rdatas.m,'suv_balance')}
  ]
  myecharts_monthtarget_payin.setOption(option_monthtarget_payin)


  })
}


//输入框的数据
const handleCurrentChange = ({ value,index }) => {
  searchListBox.searchList[index].value = value;
  //console.log(searchListBox.searchList)
}
const handleCurrentChangeWeek = ({ value,index }) => {
  searchListBox.searchListWeek[index].value = value;
  //console.log(searchListBox.searchListWeek)
}
const handleCurrentChangeMonth = ({ value,index }) => {
  searchListBox.searchListMonth[index].value = value;
  //console.log(searchListBox.searchListMonth)
}
//点击确定
const handleBtn = () => {
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 's') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? timeCycleFull(val[0]) + ' - ' + timeCycleFull(val[1]) : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
  if (pagination.s==""){
    pagination.s=defaultrange.d
  }
  init();
}
const handleBtnWeek = () => {
  for (const key in paginationWeek) {
    if (key == searchListWeek[key]?.prop) {
      
        paginationWeek[key] = searchListWeek[key].value
      
    }
  }
  if (paginationWeek.s=="" && paginationWeek.e==""){
    paginationWeek.s=defaultrange.w.sweek
    paginationWeek.e=defaultrange.w.eweek
  }
  if (paginationWeek.s==""){
    paginationWeek.s=w[0].value
  }
  if (paginationWeek.e==""){
    paginationWeek.e=we[0].value
  }
  initWeek();
}
const handleBtnMonth = () => {
  for (const key in paginationMonth) {
    if (key == searchListMonth[key]?.prop) {
      
        paginationMonth[key] = searchListMonth[key].value
      
    }
  }
  if (paginationMonth.s=="" && paginationMonth.e==""){
    paginationMonth.s=defaultrange.m.smonth
    paginationMonth.e=defaultrange.m.emonth
  }
  if (paginationMonth.s==""){
    paginationMonth.s=m[0].value
  }
  if (paginationMonth.e==""){
    paginationMonth.e=me[0].value
  }
  initMonth();
}
onMounted(()=>{
  initlist()
})


</script>

<template>
  <div>
  <div>
    
    <el-text style="font-weight: bold; font-size: 150%; color:red;">日报表</el-text>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
   

    
   <div style="height:25rem; margin: 5px;" ref="daytarget_gameprice"/>
   <div style="height:25rem; margin: 5px;" ref="daytarget_payin"/>
   <div style="height:25rem; margin: 5px;" ref="daytarget_game"/>
    <div style="height:25rem; margin: 5px;" ref="daytarget_payinsum"/>
    
  </div>
  <div>
    
    <el-text style="font-weight: bold; font-size: 150%; color:red;">周报表</el-text>
    <commSerach @search="handleBtnWeek" @currentChange="handleCurrentChangeWeek"  :list="searchListBox.searchListWeek"/>
 
    <div class="list flex-fi">
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="weektarget_gameprice"/>
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="weektarget_payin"/>
    </div>
    <div class="list flex-fi">
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="weektarget_game"/>
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="weektarget_payinsum"/>
    </div>
   
    
  </div>
  <div>
    
    <el-text style="font-weight: bold; font-size: 150%; color:red;">月报表</el-text>
    <commSerach @search="handleBtnMonth" @currentChange="handleCurrentChangeMonth"  :list="searchListBox.searchListMonth"/>

    <div class="list flex-fi">
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="monthtarget_gameprice"/>
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="monthtarget_payin"/>
    </div>
    <div class="list flex-fi">
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="monthtarget_game"/>
      <div class="list-td" style="width:50%;height:25rem; margin: 5px;" ref="monthtarget_payinsum"/>
    </div>
   
    
  </div>
</div>
</template>
<style scoped>
.btmNav{
  padding:30px 0;
}
</style>
