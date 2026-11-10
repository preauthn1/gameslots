<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent } from "vue";
import { bangdanList,bangdanEidt,bangdanDelete,bangdanAdd } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { hasAuth } from '@/router/utils';
import { transformI18n } from "@/plugins/i18n";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left",
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <span style="margin-left: 10px">{row.id}</span>
      </div>
    )
  },
  {
    label: transformI18n("添加时间"),
    prop: "add_time",
  }, {
    label: transformI18n("期号"),
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.issue_number}
      </div>
    )
  }, {
    label: transformI18n("期号开始时间"),
    prop: "start_date",
  }, {
    label: transformI18n("期号结束时间"),
    prop: "end_date",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button>
      </>
    )
  }
];
const fcolumns = [
   {
    label: transformI18n("排名"),
    slot: "k",
  }, {
    label: transformI18n("名称"),
    prop: "name",
  }, {
    label: transformI18n("本金"),
    prop: "b_price",
  }, {
    label: transformI18n("获利率"),
    prop: "hll",
  }, {
    label: transformI18n("总获利"),
    prop: "zhl",
  },{
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="danger" onClick={() => handlePopDelete(index)}>
          { transformI18n('删除') }
        </el-button>
      </>
    )
  }
]


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
  limit: 12,//条数
  total: 0,//总数
  order: 'desc',//排序 desc 或 asc
  field: 'id',//排序字段 id 或 balance
  issue_number:''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  bangdanList(pagination).then((res:any) => {
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
  //搜索列表 没有日期的写法
    for (const key in pagination) {
        if (key == searchList[key]?.prop) {
          pagination[key] = searchList[key].value;
        }
  }
    //搜索列表 有日期的写法

  // for (var key in pagination) {
  //   if (key == list[key]?.prop) {
  //     if (key == 'date') {
  //       let val = list[key].value;
  //       const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  //       pagination[key] =  time;
  //     } else {
  //       pagination[key] = list[key].value
  //     }
  //   }
  // }
    pagination.page = 1;
    init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  issue_number: {
    type: 'input',
    label: '期号',
    placeholder: '期号',
    value: '',
    prop:'issue_number'
  },
  start_date: {
    type: 'time',
    label: '期号开始时间',
    placeholder: '期号开始时间',
    value: '',
    prop:'start_date'
  },
   end_date: {
    type: 'time',
    label: '期号结束日期',
    placeholder: '期号结束日期',
    value: '',
     prop: 'end_date',
    tip:'注：期号根据日期生成'
  },
   f_a_arr:{
    type: 'slot',
    label: '榜单账号',
    placeholder: '榜单账号',
    value: [],
    name:'f_a_arr',
    prop:'f_a_arr'
  },
}
const dialogModel = reactive({
  issue_number: '',
  start_date: '',
  end_date:'',
  f_a_arr:[],
  id:''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_date' || index == 'end_date') {
    list2Box.dialogList[index].value = value ? formaTime(value) : '';
    dialogModel[index] = value ? formaTime(value) : '';
  } else {
       list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
  }

}
const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  clickIndex.value = 1;
  bangdanEidt(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
            list2Box.dialogList[key].value = res.data[key]
         }
         dialogModel[key] = res.data[key]
       }
        visible.value = true;
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}

//清除缓存
const handleClear = () => {
  const query = {
    clear: true,
  }
  bangdanEidt(query).then((res: any) => {
     if (res.code == 1) {
      message(res.msg, { type: 'success' });
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
    bangdanEidt(query).then((res: any) => {
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
    bangdanAdd(query).then((res: any) => {
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
      if (key == 'type') {
        list2Box.dialogList[key].value = 0
        dialogModel[key] = 0
      } else if (key == 'f_a_arr') {
        list2Box.dialogList[key].value =[]
        dialogModel[key] = []
      } else {
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
  bangdanDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(transformI18n(res.msg), { type: 'success' });
        init();
      } else {
        message(transformI18n(res.msg), { type: 'error' });
    }
      selectAll=[]
  })
}

//弹框删除
const handlePopDelete = (index) => {
  dialogModel.f_a_arr.splice(index,1)
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
}
const backRow = (row) => {
  const { name,b_price,hll,zhl} = row
  dialogModel.f_a_arr.push({ name, b_price, hll, zhl })
  selectShow.value = false
}
</script>

<template>
  <div>
    <menuList />
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <el-button v-if="hasAuth('add')" type="danger" @click="handleClear">{{ $t('清除缓存') }}</el-button>
      </div>
      <div class="flex-fi">
        <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
      </div>
    </div>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
          <div style="padding-bottom:30px;">
            <component :select="true" @selet="backRow" :is="defineAsyncComponent(()=> import('@/views/falseaccout/list.vue'))"/>
          </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
          <template v-slot:f_a_arr>
              <pure-table :data="dialogModel.f_a_arr" width="100%" :border="true"  :columns="fcolumns" >
                  <template #k="{index}">
                      <span>{{ index+1 }}</span>
                  </template>
              </pure-table>
              <el-button type="primary" style="margin-bottom:30px;" @click="selectUser">{{ $t('选择假数据') }}</el-button>
          </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange"/>
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
}
</style>
