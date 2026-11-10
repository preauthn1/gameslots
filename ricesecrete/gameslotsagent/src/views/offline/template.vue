
<script setup lang='ts'>
import { reactive, ref } from 'vue';
//以下是搜索框的数据
const list = [
  {
    type: 'input',
    placeholder: '用户名',
    value: ''
  },
  {
    type: 'input',
    placeholder: '订单ID',
    value: ''
  }, {
    type: 'input',
    placeholder: '订单号',
    value: ''
  }, {
    type: 'input',
    placeholder: '代理用户名',
    value: ''
  }, {
    type: 'select',
    placeholder: '审核状态',
    value: '',
    options: [
      {
        label: '待审核',
        value: 1,
      }, {
        label: '未通过',
        value: 2,
      }, {
        label: '已通过',
        value: 3,
      }, {
        label: '手动出款',
        value: 4,
      }, {
        label: '进行中',
        value: 5,
      }
    ]
  }, {
    type: 'select',
    placeholder: '数据来源',
    value: '',
    options: [
      {
        label: 'USDT',
        value: 1,
      }
    ]
  }, {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    options: [
      {
        label: '一般用户',
        value: 1,
      }, {
        label: '测试用户',
        value: 1,
      }
    ]
  }, {
    type: 'time',
    placeholder: '时间',
    value: (): Array<string> => {
      return []
    }
  }, {
    type: 'input',
    placeholder: '最小金额',
    value: ''
  }, {
    type: 'input',
    placeholder: '最大金额',
    value: ''
  }, {
    type: 'select',
    placeholder: '时间类型',
    value: '',
    options: [
      {
        label: '下单时间',
        value: 1,
      }, {
        label: '审核时间',
        value: 2,
      }
    ]
  }, {
    type: 'select',
    placeholder: '代付渠道',
    value: '',
    options: [
      {
        label: 'usldpay',
        value: 1,
      }
    ]
  },
  {
    type: 'button',
    value: '搜索',
    handle: 'search'
  }, {
    type: 'button',
    value: '导出',
    handle: 'export'
  }
];
const listbox = reactive({list});
//搜索
const handleSerch = () => {
  console.log('点击搜索');
  console.log(list);
}
//导出
const handleExport = () => {
  console.log('点击搜索');
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
//以下是表格的数据集


//弹框写法
const visible = ref(false);
const dialogList = [
  {
    type: 'input',
    label: '用户名',
    placeholder: '请输入用户名',
    value: '',
    prop:'username'
  }, {
    type: 'custom',
    label: '自定义',
  }
]
const dialogModel = reactive({
  username: '',
})
const listRules = {
   username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  ],
}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  dialogList[index].value = value;
  const prop = dialogList[index].prop;
  dialogModel[prop] = value;
}
</script>

<template>
  <div>
      <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>

      <el-button type="primary" @click="visible = true">{{ $t('添加') }}</el-button>
      <commDialog title="编辑" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
        <el-button type="primary">{{ $t('测试的插槽') }}</el-button>
      </commDialog>
  </div>
</template>

<style scoped>

</style>
