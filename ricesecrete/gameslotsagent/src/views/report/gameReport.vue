<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { gameReport } from "@/api/user";
import { timeCycle } from '@/utils/global'
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
defineOptions({
  name: 'gameReport'
})
const columns = [
    {
      label: transformI18n("时间日期"),
      prop:'time'
    },
    {
      label: transformI18n("投注总额"),
      prop: "tz_price",
    },{
      label: transformI18n("有效投注总额"),
      prop: "bet_valid_amount",
    },{
      label: transformI18n("投注人數"),
      prop: "tz_number",
    },{
      label: transformI18n("投注笔数"),
      prop: "tz_num",
    },{
      label: transformI18n("用户赢"),
      prop: "tz_win",
    },{
      label: transformI18n("用户输"),
      prop: "tz_loss",
    },{
      label: transformI18n("平台盈亏"),
      prop: "tz_ptsy",
    },
    // {
    //   label: transformI18n("清除缓存"),
    //   cellRenderer: ({ index, row }) => (
    //     <>
    //       <el-button size="small" type="primary" onClick={() => handleClear(index, row)}>{ transformI18n('清除') }</el-button>
    //     </>
    //   )
    // }
];
//点击清除
const handleClear = (index,row) => {

}

const height = window.innerHeight - 320;
//以下是搜索框的数据
const list = {
  game_name: {
    type: 'input',
    placeholder: '游戏名称',
    value: '',
    prop: 'game_name'
  },
  agent_name: {
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    prop: 'agent_name'
  },
  tc_id: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'tc_id',
    options: []
  },
  type: {
    type: 'select',
    placeholder: '游戏分类',
    value: '',
    prop: 'type',
    options: [
    ]
  },
  time_type: {
    type: 'select',
    placeholder: '时间类型',
    value: 1,
    prop: 'time_type',
    options: [
      {
        label: '下注时间',
        value: 1,
      }, {
        label: '结算时间',
        value: 2,
      }
    ]
  },
  date: {
    type: 'date',
    placeholder: '日期',
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
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
  limit: 15,//条数
  total: 0,//总数
  game_name: '',
  agent_name: '',
  lebal: '',
  tc_id: '',
  type: '',
  date: '',
  time_zone: '',
  time_type: '',
  export: 0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
const handleSerch = () => {
  //时间转换
   for (const key in pagination) {
      if (key == list[key]?.prop) {
        if (key == 'date') {
          const val = list[key].value;
          const time = val?val.length > 0 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '':'';
          pagination[key] =  time;
        } else {
          pagination[key] = list[key].value
        }
      }
    }
    pagination.page = 1;
  init();
}

//首次需要加载的接口
init();
function init() {
  gameReport({info: pagination}).then((res: any) => {
    const list = res.data;
    const arr = [];
    for (const key in list) {
      list[key].time = key;
      arr.push(list[key]);
    }
    tableData.dataList = arr
    const game_type = res.game_type;
    const typeArr = [];
    game_type.forEach(item => {
      typeArr.push({label:item.name,value:item.id})
    })
    listbox.list.type.options = typeArr
    const thirds = res.thirds;
    const thirdArr = []
    for (const key in thirds) {
      thirdArr.push({label:thirds[key],value:key})
    }
    listbox.list.tc_id.options = thirdArr
    //  pagination.total = res.data.total
      // pagination.page = res.data.current_page
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

//导出
const handleExport = () => {
  pagination.export = 1;
  gameReport(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" />
    <!-- <div class="btmNav">
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
    </div> -->

  </div>
</template>
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
.tip{
  color:var(--el-color-danger);
  margin:10px 0;
  font-size: 14px;
}
</style>
