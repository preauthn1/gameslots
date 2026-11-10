<script setup lang="tsx">
import { reactive, ref,getCurrentInstance } from 'vue';
import { lotteryPrize,lotteryPrizeDelete ,lotteryPrizeSave} from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { message } from "@/utils/message";
import { transformI18n } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'prizeList'
})
const columns = [
    {
      label: transformI18n("转盘名称"),
      prop: "lottery_name",
    },
    {
      label: transformI18n("奖品类型"),
      prop: "type",
    },{
      label: transformI18n("奖品名称"),
      prop: "title",
    },
    {
      label: transformI18n("图片"),
      // prop: "pic",
      width:'150px',
       cellRenderer: ({ index, row }) => (
        <>
           <el-image style="width:30px" fit="contain" src={row.pic } />
        </>
      )
    },{
      label: transformI18n("金额"),
      prop: "amount",
      width:'150px',
    },{
      label: transformI18n("流水倍数"),
      prop: "water",
      width:'150px',
    },{
      label: transformI18n("库存"),
      prop: "stock",
    },{
      label: transformI18n("中奖几率(%)"),
      prop: "probability",
    },{
      label: transformI18n("排序"),
      prop: "sort",
    },{
      label: transformI18n("操作"),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(index, row)}>{ transformI18n('编辑') }</el-button>
          <el-button v-show={hasAuth('delete')} size="small" type="danger" onClick={() => handleDelete(index, row)}>{ transformI18n('删除') }</el-button>
        </>
      )
    },
];

//删除
const handleDelete = (index, row) => {
   proxy.$confirm(transformI18n('确认删除吗？'), transformI18n('提示')).then(() => {
        // selectDelete(id);
        deleteCurrent(index,row);
        }).catch(() => {
         console.log('取消');
    })
}
function deleteCurrent(index, row) {
  const query = {
    delete: true,
    id:row.id
  }
  lotteryPrizeDelete(query).then((res: any) => {
      if (res.code == 1) {
       message(res.msg, { type: 'success' });
       tableData.dataList.splice(index,1)
    } else {
       message(res.msg, { type: 'error' });
    }
  })
}

const height = window.innerHeight - 240;
//以下是搜索框的数据
const list = [

  {
    type: 'input',
    placeholder: transformI18n('奖品名称'),
    value: '',
    idx:0
  },{
    type: 'select',
    placeholder: transformI18n('奖品类型'),
    value: '',
    idx: 2,
    options: [
      {
        value: '',
        label: transformI18n('请选择')
      },
      {
        value: 1,
        label: transformI18n('金额红包'),
      },{
        value: 2,
        label: transformI18n('实体物品'),
      },{
        value: 3,
        label: transformI18n('谢谢参与'),
      }
    ]
  },
  {
    type: 'select',
    placeholder: transformI18n('转盘名称'),
    value: '',
    idx: 3,
    options: [
    ]
  },
  {
    type: 'button',
    value: transformI18n('搜索'),
    handle: 'search',
    idx:1
  }
];
const listbox = reactive({ list });
//条件数据
const pagination = ref<any>({
  page: 1,//页数
  limit: 15,//条数
  total: 0,//总数
  order: '',//排序 desc 或 asc
  field: '',
  title: '',
  type:'',
  lottery_id:'',
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.value.page = 1;
//   pagination.value.name = list[0].value
//   init();
// }

//首次需要加载的接口
init();
function init() {
  lotteryPrize(pagination.value).then((res: any) => {
    // console.log(res.data);
    tableData.dataList = res.data.data
    pagination.value.total = res.data.total
    list[2].options = res.lottery
    dialogList['lottery_id'].options = res.lottery
    console.log(list)
    // pagination.value.page = res.data.current_page
  })
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
//搜索
const handleSerch = () => {
  pagination.value.page = 1;
  pagination.value.title = list[0].value
  pagination.value.type = list[1].value
  pagination.value.lottery_id = list[2].value
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
const visible = ref(false);
const dialogList = {
  lottery_id: {
    type: 'select',
    value: '',
    label: transformI18n('转盘名称'),
    prop: 'lottery_id',
    options: [
    
    ]
  },
  type: {
    type: 'radio',
    value: 1,
    label: transformI18n('奖品类型'),
    prop: 'type',
    options: [
      
      {
        label: 1,
        name: transformI18n('金额红包')
      }, {
        label: 2,
        name: transformI18n('实体物品')
      },
      {
        label: 3,
        name: transformI18n('谢谢参与')
      },
    ]
  },
  pic: {
    type: 'slot',
    name: 'upload',
    label: transformI18n('平台图标图标'),
    prop: 'pic',
    value:''
  },
  title: {
    type: 'input',
    label: transformI18n('名称'),
    placeholder: transformI18n('名称'),
    value: '',
    prop: 'title'
  },
  amount: {
    type: 'input',
    ty:'number',
    label: transformI18n('金额'),
    placeholder: transformI18n('金额'),
    value: '',
    prop: 'amount'
  },
  water: {
    type: 'input',
    ty:'number',
    label: transformI18n('流水倍数'),
    placeholder: transformI18n('流水倍数'),
    value: 0,
    prop: 'amount'
  },
  stock: {
    type: 'input',
    label: transformI18n('库存'),
    placeholder: transformI18n('库存'),
    tip:transformI18n('奖品数量，-1为无限'),
    value: '',
    prop: 'stock'
  },
  probability: {
    type: 'input',
    label: transformI18n('中奖几率'),
    placeholder: transformI18n('中奖几率'),
    value: '',
    prop: 'probability'
  },
  sort: {
    type: 'input',
    label: transformI18n('排序'),
    placeholder: transformI18n('排序'),
    tip:transformI18n('数值越大越靠前'),
    value: '',
    prop: 'sort'
  },
}
const dialogModel = reactive({
  lottery_id:'',
  type: 1,
  pic: '',
  title: '',
  amount: '',
  stock: '',
  probability: '',
  sort: '',
  id:''
})
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
}
const dialogchage = {}
const list2Box = reactive({ dialogList,dialogchage })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  dialogModel[index] = value;
}

//点击添加
const handleAdd = () => {
  for (const key in dialogModel) {
    if (key == dialogList[key]?.prop) {
      if (key == 'type') {
        dialogModel[key] = 1
        list2Box.dialogList[key].value = 1
      } else {
        dialogModel[key] = ''
        list2Box.dialogList[key].value = ''
      }

    }
  }
   clickIndex.value = 2
  visible.value = true;
}
//图片返回
const backImageData = (val) => {
  dialogModel.pic = val.file[0];
  list2Box.dialogList['pic'].value = val.file[0];
}
const clickIndex = ref(1);
  //编辑
const handleEidt = (index,row) => {
  //
  clickIndex.value = 1
  const query = {
    find: true,
    id:row.id
  }
  lotteryPrizeSave(query).then((res: any) => {
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

//报尺寸
const handleSave = () => {
  // if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }

  // } else {

  // }
   lotteryPrizeSave(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
        init();
      } else {
        message(res.msg, { type: 'error' });
      }
    })
}
</script>

<template>
  <div>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <div class="flex-bc line-box">
      <div>
        <!-- <el-button type="danger">{{ $t('删除') }}</el-button> -->
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加奖品') }}</el-button>
      </div>
    </div>
    <commDialog :title="$t('基础信息')" :dialogObj="dialogModel" @save="handleSave" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:upload>
            <uploadImage @imageData="backImageData" :image="dialogModel.pic" :limit="1" />
        </template>
      </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
      <template #tc_status="{ row }">
        <el-tag size="small" type="danger" v-if="row.tc_status == 0">{{ $t('关闭') }}</el-tag>
        <el-tag size="small" type="success" v-if="row.tc_status == 1">{{ $t('开启') }}</el-tag>
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
