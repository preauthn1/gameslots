<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { gameConfigList,backconfigEidt,backconfigAdd,backconfigDelete } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
const { proxy } = getCurrentInstance();

const columns = [
   {
      type: "selection",
      align: "left",
      fixed: "left",
    },
    {
      label: transformI18n("VIP等级"),
      prop: "gbc_viplvl",
    },{
      label: transformI18n("返水比例"),
      prop: "gbc_rate",
      cellRenderer: ({ index, row }) => (
        <>
          <el-tag size="small">{ parseFloat(row.gbc_rate * 100).toFixed(2) }%</el-tag>
        </>
      )
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" type="primary" onClick={() => handleEidt(row)}>{ transformI18n('编辑') }</el-button>
        </>
      )
    },
];


const height = window.innerHeight - 250;
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '联赛名称',
    value: '',
    idx:0
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search',
    idx:2
  }
];
const listbox = reactive({ list });
const props = defineProps({
    id: Number,
})
//条件数据
const pagination = reactive({
  select: true,
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  id:-1
});
if (props?.id) {
    pagination.id = props.id
}
const dataList: any = [];
const tableData = reactive({ dataList });

//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  gameConfigList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    const leveList = [];
    res.level.forEach(item => {
      leveList.push({
        label: item.level_name,
        value:item.id,
       })
    })
    list2Box.dialogList.gbc_viplvl.options = leveList
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

//弹框写法
const visible = ref(false);
const dialogList = {

    gbc_viplvl:{
    type: 'select',
    label: 'VIP等级',
    placeholder: 'VIP等级',
    value: '',
    options: [
      // {
      //   label: 0,
      //   name:'关闭'
      // },
    ],
    prop:'gbc_viplvl'
  },
   gbc_rate:{
    type: 'input',
    label: '返水比例',
     placeholder: '返水比例',
    tip:'返水比例，精准到后六位，例如：1=100%',
    value: '',
    prop:'gbc_rate'
  },

}
const dialogModel = reactive({
  gbc_viplvl: '',
  gbc_rate: '',
  gbc_id: '',
  gbc_gtid:'',
})
const listRules = {
  //  gbc_viplvl: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}
const dialogIndex = ref(1);
  //编辑
let eidtCurrentRow = {}
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.gbc_id
  }
  dialogIndex.value = 1;
  backconfigEidt(query).then((res: any) => {
    if (res.code == 1) {
      visible.value = true;
      eidtCurrentRow = res.data;

      for (const key in dialogList) {
        list2Box.dialogList[key].value = row[key]
        dialogModel[key] = row[key]
      }
      dialogModel.gbc_id = res.data.gbc_id
      dialogModel.gbc_gtid = res.data.gbc_gtid
      dialogModel.gbc_viplvl = res.data.gbc_viplvl
    } else {
       message(res.msg, { type: 'error' });
    }
  })
  // visible.value = true;
  // eidtCurrentRow = row;
  // for(var key in dialogList){
  //   dialogList[key].value = row[key]
  //   dialogModel[key] = row[key]
  // }
}
//返水设置
const handleSet = (index,row) => {

}


const handleSave = () => {
  if (dialogIndex.value == 1) {
    const query = {
      edit: true,
      info: {
        ...dialogModel
      }
    }
    // console.log(query);
    backconfigEidt(query).then((res: any) => {
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
      info: {
        gbc_gtid: pagination.id,
        gbc_rate: dialogModel.gbc_rate,
        gbc_viplvl:dialogModel.gbc_viplvl
      }
    }
    backconfigAdd(query).then((res: any) => {
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
  for (const key in dialogList) {
    list2Box.dialogList[key].value = ''
    dialogModel[key] = ''
  }
  dialogIndex.value = 2;
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
      arr.push(item.gbc_id);
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
  backconfigDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}
</script>

<template>
  <div>
    <div class="flex-bc line-box">
      <div>
        <el-button type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <commDialog title="编辑" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
        <template #state="{ row }">
          <el-button size="small" type="danger"  v-if="row.state == 0">{{ $t('关闭') }}</el-button>
          <el-button size="small" type="primary"  v-if="row.state == 1">{{ $t('开启') }}</el-button>
      </template>
      <template #icon="{ row }">
          <el-image :src="row.icon" fit="contain" />
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
