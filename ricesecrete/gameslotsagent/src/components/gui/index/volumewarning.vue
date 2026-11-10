<script setup lang="tsx">
import { reactive,ref,getCurrentInstance } from "vue";
import { indexCjlset,indexCjlignore } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("联赛名称"),
    prop: "name",
  },{
    label: transformI18n("赛程时间"),
    prop: "sc_time",
  }, {
    label: transformI18n("主队"),
    prop: "zd_name",
  },
   {
    label: transformI18n("客队"),
    prop: "kd_name",
  },
   {
    label: transformI18n("波胆"),
    //  prop: "zd_name",
    cellRenderer: ({ index, row }) => (
      <>
       <span>{row.zd_bd}-{row.kd_bd}</span>
      </>
    )
  },
   {
    label: transformI18n("注单金额"),
    prop: "zhudan_amount",
  },
   {
    label: transformI18n("单项最高"),
    prop: "danxiang_zg",
  },
   {
    label: transformI18n("水位比例"),
    // prop: "bfb",
    cellRenderer: ({ index, row }) => (
      <>
       <span>{row.bfb}%</span>
      </>
    )
  },

  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleSet(row)}>
          设置水位
        </el-button>
        <el-button size="small" type="primary" onClick={() => handleEdit(row)}>
          忽略
        </el-button>
      </>
    )
  }
];
const handleSet = (row) => {
  dialogModel.bd_id = row.bd_id
  visible.value = true
}
const handleEdit = (row) => {
  proxy.$confirm(transformI18n('确认设置吗？'), transformI18n('提示')).then(() => {
     indexCjlignore({ bd_id: row.bd_id }).then((res: any) => {
      if (res.code == 1) {
          message(res.msg, { type: 'success' });
          emit('back')
        } else {
        message(res.msg, { type: 'error' });
      }
    })
  }).catch(() => {
    console.log('取消');
  })

}

const height = window.innerHeight - 260;
//搜索的数据，key 值 跟 pagination key 一样
const props = defineProps({
  list:[]
})


const emit = defineEmits(['back'])

//弹框写法
const visible = ref(false);
const dialogList = {
  water_value:{
    type: 'input',
    label: '新的水位值',
    placeholder: '新的水位值',
    value: '',
    prop:'water_value'
  },
}
const dialogModel = reactive({
  water_value: '',
  bd_id:''
})
const listRules = {
    water_value: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
}


const handleSave =async () => {
  const res:any = await indexCjlset(dialogModel);
  if (res.code == 1) {
        message(res.msg, { type: 'success' });
        visible.value = false;
      emit('back')
      } else {
    message(res.msg, { type: 'error' });
  }
}
</script>

<template>
  <div>
    <commDialog title="设置水位" width="60%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="list" width="100%" :columns="columns" />
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
</style>
