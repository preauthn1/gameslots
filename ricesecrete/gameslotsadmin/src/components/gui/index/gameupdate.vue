<script setup lang="tsx">
import { reactive,ref } from "vue";
import { indexCanceMatch } from "@/api/user";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";

const columns = [//TableColumnList

  {
    label: transformI18n("联赛名称"),
    prop: "name",
  }, {
    label: transformI18n("主队"),
    prop: "zd_name",
  },
   {
    label: transformI18n("客队"),
    prop: "kd_name",
  },
  {
    label: transformI18n("原赛程日期"),
    prop: "old_sc_time",
  },
   {
    label: transformI18n("更新时间"),
    prop: "sc_time",
  },

  {
    label: transformI18n("操作"),
    cellRenderer: ({ index, row }) => (
      <>
        <el-button size="small" type="primary" onClick={() => handleEdit(index, row)}>
         取消赛事并退回所有投注
        </el-button>
      </>
    )
  }
];

const handleEdit = (index,row) => {
  //indexCanceMatch
  dialogModel.id = row.id
  visible.value = true
}

const height = window.innerHeight - 260;
const props = defineProps({
  list:[]
})


const emit = defineEmits(['back'])


//弹框写法
const visible = ref(false);
const dialogList = {
  remarks:{
    type: 'input',
    label: '备注',
    placeholder: '备注',
    value: '',
    prop:'remarks'
  },
}
const dialogModel = reactive({
  remarks: '',
  id:''
})
const listRules = {
    // remarks: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
      list2Box.dialogList[index].value = value;
      dialogModel[index] = value;
}
const handleSave =async () => {
  const res:any = await indexCanceMatch(dialogModel);
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
     <commDialog title="取消赛事并退回所有投注" width="60%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" />
    <pure-table :data="list" width="100%" :columns="columns" />
  </div>
</template>
<style scoped>
.btmNav{
  padding-top:10px;
}
</style>
