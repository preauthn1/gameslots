<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { currencyList,currencyEdit,currencyAdd,currencySet } from "@/api/user";
import { message } from "@/utils/message";
import { useNav } from "@/layout/hooks/useNav";
// @ts-ignore
import commForm from '@/components/comm/comm-form2.vue'
import uploadImage from '@/components/comm/uploadImage.vue'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';

const { username } = useNav();
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'currencyList'
})
const columns = [//TableColumnList
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left",
  },
  {
    label: transformI18n("货币名称"),
    prop: "name",
  },
  {
    label: transformI18n("货币代码"),
    prop: "currency_code",
  },
  {
    label: transformI18n("货币符号"),
    prop: "symbol",
    cellRenderer: ({ index, row }) => (
      <>
        <span>{ row.symbol }</span>
      </>
    )
  },
  {
    label: transformI18n("货币类型"),
    prop: "text",
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag size="small" type="success">
          { transformI18n(row.type.text) }
        </el-tag>
      </>
    )
  }, {
    label: transformI18n("国家代码"),
    prop: "country_code",
  }, {
    label: transformI18n("充值汇率"),
    prop: "recharge_rate",
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag size="small" type="warning">
          { parseFloat(row.recharge_rate) }
        </el-tag>
      </>
    )
  }, {
    label: transformI18n("提现汇率"),
    prop: "withdrawal_rate",
    cellRenderer: ({ index, row }) => (
      <>
        <el-tag size="small" type="warning">
          { parseFloat(row.withdrawal_rate) }
        </el-tag>
      </>
    )
  }, {
    label: transformI18n("链接名称"),
    prop: "link_name",
  }, {
    label: transformI18n("状态"),
    slot: "state",
  }, {
    label: transformI18n("默认币种"),
    slot: "is_defa",
  }, {
    label: transformI18n("添加时间"),
    prop: "create_time",
  }, {
    label: transformI18n("修改时间"),
    prop: "update_time",
  },
  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>
          { transformI18n('编辑') }
        </el-button>
      </>
    )
  }
];

const searchList = {
  name:{
    type: 'input',
    placeholder: '货币名称/国家代码',
    value: '',
    prop:'name'
  },
  state: {
    type: 'select',
    placeholder: '状态',
    value: '',
    options: [
      {
        label: '开启',
        value: 1,
      }, {
        label: '禁用',
        value: 2,
      },
    ],
    prop: 'state'
  },
  is_defa: {
    type: 'select',
    placeholder: '状态',
    value: '',
    options: [
      {
        label: '开启',
        value: 1,
      }, {
        label: '禁用',
        value: 2,
      },
    ],
    prop: 'is_defa'
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
  name:'',
  state: '',
  is_defa: ''
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  currencyList(pagination).then((res: any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    const country = res.country
    const arr = [];
    for (const key in country) {
      arr.push({ label: country[key], value: key })
    }
    list2Box.dialogList['country_code'].options = arr;
    list2Box.dialogList.link_name.options = res.usdt_type;
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
  name:{
    type: 'input',
    label: '货币名称',
    placeholder: '货币名称',
    value: '',
    prop:'name'
  },
  currency_code:{
    type: 'input',
    label: '货币字母代码',
    placeholder: '货币字母代码',
    value: '',
    prop:'currency_code'
  },
  symbol:{
    type: 'input',
    label: '货币符号',
    placeholder: '货币符号',
    value: '',
    prop:'symbol'
  },
  symbol_img: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: '货币符号图片',
    prop:'symbol_img'
  },
  type:{
    type: 'radio',
    label: '货币类型',
    placeholder: '货币类型',
    value: 2,
    tip:'货币类型添加完成后不可修改',
    options: [
      {
        label: 2,
        name:'法币'
      }, {
        label: 1,
        name:'USDT'
      },
    ],
    prop:'type'
  },
  country_code:{
    type: 'select',
    label: '国家代码',
    show:false,
    placeholder: '国家代码',
    value: '',
    options:[],
    prop:'country_code',
  },
  recharge_rate:{
    type: 'input',
    label: '充值汇率',
    placeholder: '充值汇率',
    value: '',
    prop:'recharge_rate'
  },
  withdrawal_rate:{
    type: 'input',
    label: '提现汇率',
    placeholder: '提现汇率',
    value: '',
    prop:'withdrawal_rate'
  },
  link_name:{
    type: 'slot',
    label: '链接名称',
    placeholder: '链接名称',
    show:true,
    value: [],
    options: [],
    name:'link_name',
    prop:'link_name'
  },
   state:{
    type: 'switch',
    label: '状态',
    placeholder: '状态',
    value: 2,
    prop: 'state',
    inlinePrompt: true,
    activeValue: 1,
    inactiveValue:2,
    activeText: '开启',
    inactiveText:'禁用'
  },
   is_defa:{
    type: 'switch',
    label: '默认币种',
    placeholder: '默认币种',
    value: 2,
    show: true,
    prop: 'is_defa',
    inlinePrompt: true,
    activeValue: 1,
    inactiveValue:2,
    activeText: '开启',
    inactiveText:'禁用'
  },
}
const dialogModel = reactive({
    id:"",
    name:"",
    currency_code:"",
    country_code:"",
    recharge_rate:"",
    withdrawal_rate:"",
    symbol:"",
    symbol_img:"",
    link_name:[],
    state:1,
    type:0,
    is_defa:2
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'type') {
    if (value == 1) {
      list2Box.dialogList['country_code'].show = true;
      list2Box.dialogList['link_name'].show = false;
    } else {
      list2Box.dialogList['country_code'].show = false;
      list2Box.dialogList['link_name'].show = true;
    }
  }
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}
const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id:row.id
  }
  list2Box.dialogList.is_defa.show = username.value != 'manage'
  clickIndex.value = 1;
  currencyEdit(query).then((res: any) => {
     if (res.code == 1) {
       for (const key in dialogModel) {
         if (key == dialogList[key]?.prop) {
           if (key == 'type') {
              list2Box.dialogList[key].value = res.data[key].val
           } else {
             list2Box.dialogList[key].value = res.data[key]
           }
         }
         if (key == 'type') {
             dialogModel[key] = res.data[key].val
         } else {
           dialogModel[key] = res.data[key]
         }
       }
       if (res.data.type.val == 1) {
         list2Box.dialogList['country_code'].show = true;
         list2Box.dialogList['link_name'].show = false;
       } else {
          list2Box.dialogList['country_code'].show = false;
         list2Box.dialogList['link_name'].show = true;
       }
        visible.value = true;
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
    currencyEdit(query).then((res: any) => {
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
    currencyAdd(query).then((res: any) => {
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
        if (key == 'state') {
          list2Box.dialogList[key].value = 1
          dialogModel[key] = 1
        } else if (key == 'type') {
          list2Box.dialogList[key].value = 2
          dialogModel[key] = 2
        } else if (key == 'is_defa') {
          list2Box.dialogList[key].value = 2
          dialogModel[key] = 2
        } else if (key == 'link_name') {
          list2Box.dialogList[key].value = []
          dialogModel[key] = []
        } else {
         list2Box.dialogList[key].value = ''
       }

     }
  }
  list2Box.dialogList['country_code'].show = false;
  list2Box.dialogList['link_name'].show = true;
  list2Box.dialogList.is_defa.show = username.value != 'manage'
  clickIndex.value = 2;
  visible.value = true;
}



const setShow = ref(false)

const setList = {
  auto_rate: {
    type: 'radio',
    value: 0,
    label: '实时汇率',
    placeholder: '',
    options: [
      {
        label: 0,
        name:'关闭'
      }, {
        label: 1,
        name:'开启'
      }
    ],
    prop:'auto_rate'
  },
  auto_time: {
    type: 'input',
    value: 1,
    label: '时间间隔',
    placeholder: '',
    ty: 'number',
    prop:'auto_time'
  }
};
const setListBox = reactive({setList})
const setModel = reactive({
  auto_rate: 0,
  auto_time: 1,
  id: 1
})
const setRules = {}
const setSave = () => {
  const query = {
    edit: true,
    info:setModel
  }
  currencySet(query).then((res: any) => {
     if (res.code == 1) {
       message(res.msg, { type: 'success' });
        setShow.value = false
      } else {
        message(res.msg, { type: 'error' });
    }
  })
}
const handleSet = () => {
  const query = {
    find: true,
    id: "1"
  }

  currencySet(query).then((res: any) => {
    if (res.code == 1) {
      let key = '0';
      for (key in setList) {
         setListBox.setList[key].value = res.data[key]
      }
      setModel[key] = res.data[key]
      setShow.value = true
    }
  })

}
const setChange = ({ value, index }) => {
      setListBox.setList[index].value = value;
      setModel[index] = value;
}

//上传成功后的图片
const backImageData = (prop, val) => {
  dialogModel[prop] = val.file[0];
  list2Box.dialogList[prop].value = val.file[0];
}
</script>

<template>
  <div>
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <el-button v-if="hasAuth('set')" type="primary" @click="handleSet">{{ $t('设置') }}</el-button>
      </div>
    </div>
    <el-dialog width="60%" v-model="setShow" :title="$t('编辑')">
        <commForm title="保存" @save="setSave" :dialogObj="setModel" @currentChage="setChange" :listRules="setRules" :list="setListBox.setList"/>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <template v-slot:link_name>
          <el-checkbox-group v-model="dialogModel.link_name" size="large">
            <el-checkbox  :label="item" border  v-for="item,index in list2Box.dialogList['link_name'].options" :key="index"/>
          </el-checkbox-group>
      </template>
      <template v-slot:upload="{data}">
        <uploadImage @imageData="backImageData(data.prop, $event)"  :limit="1" :image="dialogModel[data.prop]"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
        <template #state="{row}">
          <el-tag type="success" v-if="row.state == 1">{{ $t("开启") }}</el-tag>
          <el-tag type="danger" v-else>{{ $t("禁用") }}</el-tag>
        </template>
        <template #is_defa="{row}">
          <el-tag type="success" v-if="row.is_defa == 1">{{ $t("是") }}</el-tag>
          <el-tag type="danger" v-else>{{ $t("否") }}</el-tag>
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
}
</style>
