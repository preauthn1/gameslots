<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { paySetList, paySetAdd, paySetEdit, paySetDelete } from "@/api/user";
import { message } from "@/utils/message";
// @ts-ignore
import commForm from '@/components/comm/comm-form.vue'
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import { http } from "@/utils/http";
import { copyContent } from "@/utils/global";
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'paysetList'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("ID"),
    prop: "id",
    fixed: "left"
  },
  {
    label: transformI18n("渠道类型"),
    prop: "pay_type_name",
  },
  {
    label: transformI18n("支付类型"),
    prop: "pay_types_name",
  },
  {
    label: transformI18n("货币"),
    prop: "country_code",
  },
  {
    label: transformI18n("充值汇率"),
    slot: "currency_recharge_rate",
  },
  {
    label: transformI18n("支付标识"),
    prop: "pay_sys_sign",
  },
  {
    label: transformI18n("图标"),
    slot: "icon",
  },
  {
    label: transformI18n("支付名称"),
    prop: "pay_name",
    width: 150,
  },
  {
    label: transformI18n("备注"),
    prop: "remarks",
    width: 150,
  },
  {
    label: transformI18n("链接名称"),
    slot: "usdt_type",
  },
  {
    label: transformI18n("代理线"),
    prop: "agent_name",
  },
  {
    label: transformI18n("等级限制"),
    slot: "start_level_id",
    width: 150,
  },
  {
    label: transformI18n("充值状态"),
    slot: "status",
  },
  {
    label: transformI18n("代付状态"),
    slot: "is_withdra",
  },
  {
    label: transformI18n("热门状态"),
    slot: "is_hot",
  },
  {
    label: transformI18n("通用渠道"),
    slot: "is_all",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    cellRenderer: ({ index, row }) => (
      <>
        <el-button v-show={hasAuth('edit')} size="small" type="primary" onClick={() => handleEidt(row)}>
          {transformI18n('编辑')}
        </el-button>
        <el-button v-show={hasAuth('export')} size="small" type="danger" onClick={() => handleExport(row)}>{transformI18n('导出')}</el-button>
      </>
    )
  }
];


//搜索
//以下是搜索框的数据
const list = {
  pay_sys_sign: {
    type: 'input',
    placeholder: transformI18n('支付标识/名称/备注'),
    value: '',
    prop: 'pay_sys_sign',
  },
  pay_status: {
    type: 'select',
    placeholder: transformI18n('充值状态'),
    value: '',
    prop: 'pay_status',
    options: [
      {
        value: '1',
        label: transformI18n('开启'),
      }, {
        value: '0',
        label: transformI18n('关闭'),
      }
    ]
  },
  is_withdra: {
    type: 'select',
    placeholder: transformI18n('代付状态'),
    value: '',
    prop: 'is_withdra',
    options: [
      {
        value: '1',
        label: transformI18n('开启'),
      }, {
        value: '0',
        label: transformI18n('关闭'),
      }
    ]
  },
  is_hot: {
    type: 'select',
    placeholder: transformI18n('热门'),
    value: '',
    prop: 'is_hot',
    options: [
      {
        value: '1',
        label: transformI18n('开启'),
      }, {
        value: '0',
        label: transformI18n('关闭'),
      }
    ]
  },
  search: {
    type: 'button',
    value: transformI18n('搜索'),
    handle: 'search',
    prop: 'search'
  },
  // export: {
  //   type: 'button',
  //   value: '导出',
  //   handle: 'export',
  //   prop: 'export'
  // }
};
const listbox = reactive({ list });
const handleSerch = () => {
  pagination.page = 1;
  for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] = time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
  init();
}
//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
  list[index].value = value;
}
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  pay_sys_sign: '',
  pay_status: '',
  is_withdra: '',
  is_hot: '',
});
const dataList: any = [];
const tableData = reactive({ dataList });
let usdtOptions = []
let bankOptions = []
//获取列表数据
init();
function init(query?: object) {
  paySetList(pagination).then((res: any) => {
    tableData.dataList = res.data
    pagination.total = res.count
    list2Box.dialogList.pay_type.options = res.paytype
    const vip = res.vip
    const vipArr = []
    vip.forEach(item => {
      vipArr.push({ label: item.level_name, value: item.id })
    })
    const pay_types = res.pay_types
      const pay_typesArr = []
      pay_types.forEach(item=>{
        pay_typesArr.push({label:item.name,value:item.id})
      })
      // console.log(pay_typesArr);
    list2Box.dialogList.pay_types.options = pay_typesArr
    list2Box.dialogList.start_level_id.options = [{ label: transformI18n('不限制'), value: 0 }, ...vipArr]
    list2Box.dialogList.end_level_id.options = [{ label: transformI18n('不限制'), value: 0 }, ...vipArr]
    const ordinary_data = res.currency.ordinary_data
    const usdt_data = res.currency.usdt_data
    const usdtArr = [];
    let bank_name_arr = []
    usdt_data.forEach(item => {
      usdtArr.push({ label: item.country_code + '-充值汇率' + ':' + item.recharge_rate, value: item.id })
      bank_name_arr = item.link_name
    });
    usdtOptions = usdtArr
    const otherArr = []
    ordinary_data.forEach(item => {
      otherArr.push({ label: item.country_code + '-充值汇率' + ':' + item.recharge_rate, value: item.id })
    })
    bankOptions = otherArr
    const usdtName = []
    for (let i = 0; i < bank_name_arr.length; i++) {
      usdtName.push({ label: bank_name_arr[i], value: bank_name_arr[i] })
    }
    list2Box.dialogList.usdt_type.options = usdtName;
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




//弹框写法
const visible = ref(false);
const dialogList = {
  pay_types:{
    type: 'select',
    label: transformI18n('支付类型'),
    placeholder: transformI18n('支付类型'),
    value: '',
    options:[],
    prop:'pay_types'
  },
  pay_type: {
    type: 'select',
    label: transformI18n('渠道类型'),
    placeholder: transformI18n('渠道类型'),
    value: '',
    options: [],
    prop: 'pay_type'
  },
  currency_id: {
    type: 'select',
    label: transformI18n('货币'),
    placeholder: transformI18n('货币'),
    value: '',
    options: [],
    prop: 'name',
  },
  usdt_type: {
    type: 'select',
    label: transformI18n('链接名称'),
    placeholder: transformI18n('链接名称'),
    value: '',
    options: [],
    prop: 'usdt_type',
    show: true,
  },
  pay_sys_sign: {
    type: 'input',
    label: transformI18n('支付标识'),
    placeholder: transformI18n('支付标识'),
    value: '',
    prop: 'pay_sys_sign'
  },
  icon: {
    type: 'slot',
    name: 'upload',
    label: transformI18n('图标'),
    prop: 'icon',
    value: '',
  },
  pay_name: {
    type: 'input',
    label: transformI18n('支付名称'),
    placeholder: transformI18n('支付名称'),
    value: '',
    prop: 'pay_name'
  },
  remarks: {
    type: 'input',
    label: transformI18n('备注'),
    placeholder: transformI18n('备注'),
    value: '',
    prop: 'remarks'
  },
  pay_min_amout: {
    type: 'input',
    label: transformI18n('最低充值'),
    placeholder: transformI18n('最低充值'),
    value: '',
    prop: 'pay_min_amout'
  },
  pay_max_amout: {
    type: 'input',
    label: transformI18n('最高充值'),
    placeholder: transformI18n('最高充值'),
    value: '',
    prop: 'pay_max_amout'
  },
  sort: {
    type: 'input',
    label: transformI18n('排序'),
    placeholder: transformI18n('排序'),
    value: '',
    prop: 'sort'
  },

  agent_id: {
    type: 'slot',
    label: transformI18n('代理线'),
    placeholder: transformI18n('代理id'),
    value: '',
    prop: 'agent_id',
    name: 'agent_id'
  },
  new_user: {
    type: 'radio',
    label: transformI18n('新老用户'),
    placeholder: transformI18n('新老用户'),
    value: 0,
    tip: transformI18n('新用户：指未充值成功过的用户，老用户：指已充值过的用户'),
    options: [
      {
        label: 0,
        name: '不限制'
      }, {
        label: 1,
        name: '新用户'
      }, {
        label: 2,
        name: '老用户'
      },
    ],
    prop: 'new_user'
  },
  start_level_id: {
    type: 'select',
    label: transformI18n('开始等级'),
    placeholder: transformI18n('开始等级'),
    value: 0,
    options: [{ label: transformI18n('不限制'), value: 0 }],
    prop: 'start_level_id'
  },
  end_level_id: {
    type: 'select',
    label: transformI18n('结束等级'),
    placeholder: transformI18n('结束等级'),
    value: 0,
    options: [
      { label: transformI18n('不限制'), value: 0 }
    ],
    prop: 'end_level_id'
  },

  pay_status: {
    type: 'radio',
    label: transformI18n('开启充值'),
    placeholder: transformI18n('开启充值'),
    value: 1,
    options: [
      {
        label: 1,
        name: transformI18n('开启')
      }, {
        label: 0,
        name: transformI18n('关闭')
      },
    ],
    prop: 'pay_status'
  },
  is_withdra: {
    type: 'radio',
    label: transformI18n('开启代付'),
    placeholder: transformI18n('开启代付'),
    value: 1,
    options: [
      {
        label: 1,
        name: transformI18n('开启')
      }, {
        label: 0,
        name: transformI18n('关闭')
      },
    ],
    prop: 'is_withdra'
  },
  is_hot: {
    type: 'radio',
    label: transformI18n('开启热门'),
    placeholder: transformI18n('开启热门'),
    value: 1,
    options: [
      {
        label: 1,
        name: transformI18n('开启')
      }, {
        label: 0,
        name: transformI18n('关闭')
      },
    ],
    prop: 'is_hot'
  },
  is_all: {
    type: 'radio',
    label: transformI18n('通用渠道'),
    placeholder: transformI18n('通用渠道'),
    value: 1,
    show: true,
    options: [
      {
        label: 1,
        name: transformI18n('是')
      }, {
        label: 2,
        name: transformI18n('否')
      },
    ],
    prop: 'is_all'
  },
}
const dialogModel = reactive({
  pay_types:'',
  currency_id: '',
  usdt_type: '',
  pay_sys_sign: '',
  pay_name: '',
  pay_min_amout: '',
  pay_max_amout: '',
  sort: 0,
  agent_id: 0,
  new_user: 0,
  start_level_id: 0,
  end_level_id: 0,
  pay_status: 0,
  is_withdra: 0,
  is_hot: 0,
  pay_param: [{ key_name: "", key_value: "" }],
  pay_bank: [{ bank_name: "", bank_code: "", bank_field: '', orderby: 0 }],
  pay_rebate:[{ min: "", max: "", proportion: '' }],
  recharge_rate: 1,
  withdrawal_rate: 1,
  is_all: 1,
  remarks: '',
  icon: '',
  id: ''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'pay_type') {
    console.log(value);
    list2Box.dialogList['currency_id'].value = ''
    list2Box.dialogList['currency_id'].options = value == 1 ? usdtOptions : bankOptions
    list2Box.dialogList['usdt_type'].show = value == 1 ? false : true;
    list2Box.dialogList['is_all'].show = value == 1 ? false : true;
  }

  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
}
const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id: row.id
  }
  clickIndex.value = 1;
  list2Box.dialogList['usdt_type'].show = row.pay_type == 1 ? false : true;
  list2Box.dialogList['is_all'].show = row.pay_type == 1 ? false : true;

  list2Box.dialogList['currency_id'].options = row.pay_type == 1 ? usdtOptions : bankOptions
  paySetEdit(query).then((res: any) => {
    if (res.code == 1) {
      for (const key in dialogList) {
        list2Box.dialogList[key].value = res.data[key]
        dialogModel[key] = res.data[key]
      }
      dialogModel.pay_param = res.data.pay_param
      dialogModel.pay_bank = res.data.pay_bank
      dialogModel.pay_rebate = res.data.pay_rebate
      dialogModel.recharge_rate = res.data.recharge_rate
      dialogModel.id = res.data.id;
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
    paySetEdit(query).then((res: any) => {
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
    paySetAdd(query).then((res: any) => {
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
    dialogModel[key] = ''
    if (dialogList[key].type == 'radio') {
      list2Box.dialogList[key].value = 0
      dialogModel[key] = 0
    } else {
      list2Box.dialogList[key].value = ''
    }
  }
  dialogModel.pay_param = [{ key_name: "", key_value: "" }],
  dialogModel.pay_bank = [{ bank_name: "", bank_code: "", bank_field: '', orderby: 0 }],
  dialogModel.pay_rebate = [{ min: "", max: "", proportion: ''}],
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
  paySetDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
  })
}
const selectShow = ref(false);
const eidtUsername = (val) => {
  dialogModel.agent_id = val;
  list2Box.dialogList.agent_id.value = val;
}
const selectUser = () => {
  selectShow.value = true
}

//选择代理返回来的
const agenBackRow = (val) => {
  list2Box.dialogList.agent_id.value = val.uid
  dialogModel.agent_id = val.uid
  selectShow.value = false
}
//图片返回
const backImageData = (val) => {
  dialogModel.icon = val.file[0];
  list2Box.dialogList['icon'].value = val.file[0];
}


const pay_param_col = [
  {
    label: transformI18n('键'),
    // prop: 'key_name',
    slot: 'key_name'
  },
  {
    label: transformI18n('值'),
    slot: 'key_value'
    // prop:'key_value'
  },
  {
    label: transformI18n('操作'),
    slot: 'right'
  },
]
const pay_bank_col = [
  {
    label: transformI18n('排序'),
    slot: 'orderby'
  },
  {
    label: transformI18n('银行名称'),
    slot: 'bank_name'
  },
  {
    label: transformI18n('银行编码'),
    slot: 'bank_code'
  },
  {
    label: transformI18n('绑卡必填字段'),
    slot: 'bank_field'
  },
  {
    label: transformI18n('操作'),
    slot: 'right'
  }
]
const rebate_col = [
  {
    label: transformI18n('最低充值'),
    slot: 'min'
  },
  {
    label: transformI18n('最高充值'),
    slot: 'max'
  },
  {
    label: transformI18n('返利比例'),
    slot: 'proportion'
  },
  {
    label: transformI18n('操作'),
    slot: 'right'
  }
]

const payParam = (index) => {
  dialogModel.pay_param.splice(index, 1)
}
const payBank = (index) => {
  dialogModel.pay_bank.splice(index, 1)
}
const payRebate = (index) => {
  dialogModel.pay_rebate.splice(index, 1)
}
const payparamAdd = () => {
  dialogModel.pay_param.push({ key_name: "", key_value: "" })
}
const paybankAdd = () => {
  dialogModel.pay_bank.push({ bank_name: "", bank_code: "", bank_field: '', orderby: 0 })
}
const RebateAdd = () => {
  dialogModel.pay_rebate.push({ min: "", max: "", proportion: ''})
}

//导出
const handleExport = (row) => {
  http.post('/pay_set/export', { data: { id: row.id } }).then((res: any) => {
    if (res.code == 1) {
      const data = res.data
      proxy.$alert("<textarea style='width:100%;' rows='5'>" + data + "</textarea>", transformI18n('导出'), {
        confirmButtonText: transformI18n('复制'),
        dangerouslyUseHTMLString: true
      }).then(() => {
        copyContent(data)
      })
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const visibleImport = ref(false);
const importData = ref('');
const handleImport = (type) => {
  if (type == 1) {
    http.post('/pay_set/import', { data: { data: importData.value } }).then((res: any) => {
      if (res.code == 1) {
        visibleImport.value = false
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
      }
    })
  } else {
    visibleImport.value = true
  }
}
</script>

<template>
  <div>
    <menuList />
    <commSerach @search="handleSerch" @currentChange="handleCurrentChange" :list="listbox.list" />
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <el-button type="info" @click="init">{{ $t('刷新') }}</el-button>
        <el-button v-if="hasAuth('import')" type="danger" @click="handleImport">{{ $t('导入') }}</el-button>
      </div>
      <div class="flex-fi" />
    </div>
    <div style="height: 20px;" />
    <el-dialog width="50%" v-model="visibleImport" :title="$t('导入')">
      <el-form ref="ruleFormRef">
        <el-form-item label-width="120">
          <template v-slot:label>{{ $t('数据') }}</template>
          <el-input type="textarea" rows="6" v-model="importData" />
        </el-form-item>
        <el-form-item label-width="120">
          <el-button type="primary" @click="handleImport(1)">{{ $t('导入') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog width="60%" v-model="visible" title="编辑">
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('基础信息')">
          <commForm title="保存" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
            :listRules="listRules" :list="list2Box.dialogList">
            <template v-slot:agent_id>
              <div class="flex-fi user-box">
                <el-input v-model="dialogModel.agent_id" @change="eidtUsername($event)" :placeholder="$t('用户')" />
                <el-button style="margin-left: 20px;" type="primary" @click="selectUser">{{ $t('选择用户') }}</el-button>
              </div>
            </template>
            <template v-slot:upload>
              <uploadImage @imageData="backImageData" :image="dialogModel.icon" :limit="1" />
            </template>
          </commForm>
        </el-tab-pane>
        <el-tab-pane :label="$t('参数设置')">
          <pure-table :border="true" :data="dialogModel.pay_param" width="100%" :columns="pay_param_col">
            <template #key_name="{ row }">
              <el-input v-model="row.key_name" :placeholder="$t('请输入键')" />
            </template>
            <template #key_value="{ row }">
              <el-input v-model="row.key_value" :placeholder="$t('请输入值')" />
            </template>
            <template #right="{ index }">
              <el-button size="small" type="danger" @click="payParam(index)">{{ $t('删除') }}</el-button>
            </template>
          </pure-table>
          <el-button type="primary" style="margin-top:30px;" @click="payparamAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" style="margin-top:30px;" @click="handleSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>
        <el-tab-pane :label="$t('银行提现')">
            
          <pure-table :border="true" :data="dialogModel.pay_bank" width="100%" :columns="pay_bank_col">
            <template #bank_name="{ row }">
              <el-input v-model="row.bank_name" :placeholder="$t('请输入银行名称')" />
            </template>
            <template #bank_code="{ row }">
              <el-input v-model="row.bank_code" :placeholder="$t('请输入银行编码')" />
            </template>
            <template #bank_field="{ row }">
              <el-input v-model="row.bank_field" :placeholder="$t('请输入银行绑卡必填字段')" />
            </template>
            <template #orderby="{ row }">
              <el-input v-model="row.orderby" :placeholder="$t('请输入排序')" />
            </template>
            <template #right="{ index }">
              <el-button size="small" type="danger" @click="payBank(index)">{{ $t('删除') }}</el-button>
            </template>
          </pure-table>
          <el-button type="primary" style="margin-top:30px;" @click="paybankAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" style="margin-top:30px;" @click="handleSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>


         <el-tab-pane :label="$t('充值返利')">
          <pure-table :border="true" :data="dialogModel.pay_rebate" width="100%" :columns="rebate_col">
             <template #min="{ row }">
              <el-input v-model="row.min" :placeholder="$t('最低充值')" />
            </template>
            <template #max="{ row }">
              <el-input v-model="row.max" :placeholder="$t('最高充值')" />
            </template>
            <template #proportion="{ row }">
              <el-input v-model="row.proportion" :placeholder="$t('返利比例')" />
            </template>
            <template #right="{ index }">
              <el-button size="small" type="danger" @click="payRebate(index)">{{ $t('删除') }}</el-button>
            </template>
          </pure-table>
          <el-button type="primary" style="margin-top:30px;" @click="RebateAdd">{{ $t('添加') }}</el-button>
          <el-button type="primary" style="margin-top:30px;" @click="handleSave">{{ $t('保存') }}</el-button>
        </el-tab-pane>

        
      </el-tabs>
    </el-dialog>
    <el-dialog width="80%" v-model="selectShow" title="选择">
      <div style="padding-bottom:30px;">
        <component @select="agenBackRow" :select="true"
          :is="defineAsyncComponent(()=> import('@/components/comm/agenReportList.vue'))" />
      </div>
    </el-dialog>

    <pure-table :data="tableData.dataList" width="100%" :columns="columns" @selection-change="handleSelectionChange">
      <template #start_level_id="{ row }">
        <el-tag v-if="row.start_level_id == 0" type="success" size="small">{{ $t('不限制') }}</el-tag>
        <el-tag v-else type="danger" size="small">{{ row.start_level_id - 1 }}</el-tag>
        -
        <el-tag v-if="row.start_level_id == 0" type="success" size="small">{{ $t('不限制') }}</el-tag>
        <el-tag v-else type="danger" size="small">{{ row.start_level_id - 1 }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag v-if="row.pay_status == 1" type="success" size="small">{{ $t('开启') }}</el-tag>
        <el-tag v-else type="danger" size="small">{{ $t('关闭') }}</el-tag>
      </template>
      <template #is_withdra="{ row }">
        <el-tag v-if="row.is_withdra == 1" type="success" size="small">{{ $t('开启') }}</el-tag>
        <el-tag v-else type="danger" size="small">{{ $t('关闭') }}</el-tag>
      </template>
      <template #is_hot="{ row }">
        <el-tag v-if="row.is_hot == 1" type="success" size="small">{{ $t('开启') }}</el-tag>
        <el-tag v-else type="danger" size="small">{{ $t('关闭') }}</el-tag>
      </template>
      <template #usdt_type="{ row }">
        <el-tag v-if="row.pay_type == 1" type="success" size="small">{{ row.usdt_type }}</el-tag>
      </template>
      <template #is_all="{ row }">
        <el-tag v-if="row.is_all != 1 && row.is_all == 1" type="success" size="small">{{ $t('是') }}</el-tag>
        <el-tag v-else-if="row.is_all != 1 && row.is_all == 2" type="danger" size="small">{{ $t('否') }}</el-tag>
      </template>
      <template #currency_recharge_rate="{ row }">
        <el-tag type="warning" size="small">{{ parseFloat(row.currency_recharge_rate) }}</el-tag>
      </template>
      <template #icon="{ row }">
        <el-image v-if="row.icon" style="width: 30px; height: 30px" :src="row.icon" />
      </template>

    </pure-table>
    <div class="btmNav">
      <el-pagination class="float-right" v-model:currentPage="pagination.page" :page-size="pagination.limit"
        :total="pagination.total" :page-sizes="[12, 24, 36, 50, 100]" :background="true"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onPageSizeChange"
        @current-change="onCurrentChange" />
    </div>
    <!-- <commTable  @handleSelectionChange="handleSelectionChange"  :columns="columns"  :data="tableDataMore" ></commTable> -->
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
}
</style>
