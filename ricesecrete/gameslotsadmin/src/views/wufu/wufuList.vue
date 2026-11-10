<script setup lang="tsx">
import { reactive,ref,getCurrentInstance,defineAsyncComponent, computed } from "vue";
import { wufuList,wufuEdit,wufuAdd,wufuDelete } from "@/api/user";
import { message } from "@/utils/message";
import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import uploadImage from '@/components/comm/uploadImage.vue'
import { hasAuth } from '@/router/utils';
import menuList from "@/components/menu/menu.vue"

const { proxy } = getCurrentInstance();
defineOptions({
  name: 'wufuList'
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
    width:50
  },
  {
    label: transformI18n("语言"),
    prop: "lang",
  },
  {
    label: transformI18n("名称"),
    prop: "name",
  },
  {
    label: transformI18n("时间"),
    width: 200,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        {row.start_time} <br/>
        {row.end_time}
      </div>
    )
  },
  {
    label: transformI18n("奖励金额"),
    prop: "amount",
  },
  {
    label: transformI18n("流水倍数"),
    prop: "savings",
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
  {
    label: transformI18n("操作"),
    fixed: "right",
    slot:'right'
  }
];
const handleEdit = (index,row) => {

}

//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  lang:{
    type: 'select',
    label:'语种',
    placeholder:'语种',
    prop: 'lang',
    options: [],
    value: '',
  },
  name:{
    type: 'input',
    label:'名称',
    placeholder:'名称',
    prop: 'name',
    value: '',
  },
  status:{
    type: 'select',
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: '禁用',
        value: 0,
      },{
        label: '启用',
        value: 1,
      },
    ]
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
  name:'',//名称
  status: '',//状态
  lang: '',//语言
});

const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  wufuList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    // pagination.page = res.data.current_page
    list2Box.dialogList.lang.options = res.langs
    searchListBox.searchList.lang.options = res.langs
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
  pagination.page = 1;
  init(pagination);
}



//弹框写法
const visible = ref(false);
const dialogList = {
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '请选择语种',
    clearable:true,
    value: '',
    options: [],
    prop: 'lang'
  },
  name:{
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name',
  },
  image: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: '封面',
    placeholder: '封面',
    prop:'image'
  },
  losing_lottery_img: {
    type: 'slot',
    name: 'losing_upload',
    value: '',
    label: '未中奖',
    placeholder: '未中奖',
    prop: 'losing_lottery_img'
  },
  intro:{
    type: 'input',
    label: '简介',
    placeholder: '简介',
    value: '',
    prop: 'intro',
  },
  agent_ids: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "id"
  },
  start_time: {
    type: 'time',
    label: '开始时间',
    placeholder: '开始时间',
    value: '',
    prop:'start_time'
  },
  end_time:{
    type: 'time',
    label: '结束时间',
    placeholder: '结束时间',
    value: '',
    prop:'end_time'
  },
  amount:{
    type: 'input',
    label: '奖励金额',
    placeholder: '奖励金额',
    value: '',
    prop: 'amount',
  },
  savings:{
    type: 'input',
    label: '流水倍数',
    placeholder: '流水倍数',
    value: '',
    prop: 'savings',
  },
  register_give_count:{
    type: 'input',
    label: '注册赠送次数',
    placeholder: '注册赠送次数',
    tip: '新用户为注册赠送，老用户为登录就送（之前赠送过的,及时后面增加赠送次数用户登录不会加）',
    value: 1,
    prop: 'register_give_count',
  },
  status:{
    type: 'radio',
    value: 0,
    label:'状态',
    placeholder:'状态',
    prop:'status',
    options: [
      {
        label: 0,
        name:'禁用'
      },
      {
        label: 1,
        name:'启用'
      },
    ]
  },
  introduce: {
    type: 'slot',
    label: '规则',
    placeholder: '规则',
    value: '',
    name:'introduce',
    prop: 'introduce'
  },
}
const dialogModel = reactive({
  id: '',
  lang: '',
  name: '',
  image: '',
  losing_lottery_img: '',
  intro: '',
  agent_ids: '',
  start_time: '',
  end_time: '',
  amount: '',
  savings: 1,
  register_give_count: 1,
  status: 1,
  introduce: '',
})

//富文本
const editorRef = ref(null);

const editorEle = (val) => {
  list2Box.dialogList.introduce.value = val
}
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  if (index == 'start_time' || index == 'end_time') {
      list2Box.dialogList[index].value = value?formaTime(value):'';
      dialogModel[index] = value?formaTime(value):'';
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
  wufuEdit(query).then((res: any) => {
     if (res.code == 1) {
        for (const key in dialogModel) {
          if (key == dialogList[key]?.prop) {
            dialogList[key].value = res.data[key]
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

const handleSave = () => {
  dialogModel.introduce = list2Box.dialogList.introduce.value;
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    wufuEdit(query).then((res: any) => {
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
    wufuAdd(query).then((res: any) => {
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
    if( key == 'id' ){
      dialogModel[key] = ''
      continue;
    }
    if ( key == 'savings' || key == 'status' || key == 'register_give_count' ) {
      list2Box.dialogList[key].value = 1
      dialogModel[key] = 1
    } else {
      list2Box.dialogList[key].value = ''
      dialogModel[key] = ''
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
  wufuDelete(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
        init();
      } else {
        message(res.msg, { type: 'error' });
    }
      selectAll=[]
  })
}

//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.agent_ids.value = val;
  dialogModel.agent_ids = val;
  selectShow.value = false;
};

const cardsShow = ref(false);
const t_id = ref("");
const handleCardList = row => {
  t_id.value = row.id;
  cardsShow.value = true;
};


//上传成功后的图片
const backImageData = (val) => {
  dialogModel.image = val.file[0];
  list2Box.dialogList['image'].value = val.file[0];
}


//上传成功后的图片
const backlosingLotteryImgData = (val) => {
  dialogModel.losing_lottery_img = val.file[0];
  list2Box.dialogList['losing_lottery_img'].value = val.file[0];
}
//点击设置内容
const activeShow = ref(false);
const w_id = ref('');
const handleActive = (row) => {
  w_id.value = row.id
  activeShow.value = true;
}
</script>

<template>
  <div>
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd">{{ $t('添加') }}</el-button>
        <!-- <el-button v-if="bind" type="primary" @click="handleAdd">{{ $t('绑定') }}</el-button> -->
      </div>
    </div>
    <el-dialog v-model="cardsShow" :title="$t('卡片列表')" width="80%" heith="100%">
      <component
        :id="t_id"
        :is="
          defineAsyncComponent(() =>
            import('@/views/wufu/wufuCards.vue')
          )
        "
      />
    </el-dialog>
    <el-dialog v-model="activeShow" :title="$t('设置内容')" width="80%">
        <component :id="w_id" :is="defineAsyncComponent(()=> import('@/views/wufu/wufuContent.vue'))"/>
    </el-dialog>
    <el-dialog width="80%" v-model="selectShow" :title="$t('选择')">
      <div style="padding-bottom: 30px">
        <component
          :is="
            defineAsyncComponent(() => import('@/views/user/pages/list.vue'))
          "
          :back="true"
          :field="1"
          @backSelect="eidtUsername"
        />
      </div>
    </el-dialog>
    <commDialog title="编辑" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange" :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false" >
      <template v-slot:upload>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.image"/>
      </template>
      <template v-slot:losing_upload>
            <uploadImage @imageData="backlosingLotteryImgData"  :limit="1" :image="dialogModel.losing_lottery_img"/>
        </template>
      <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input
              v-model="dialogModel.agent_ids"
              clearable
              :placeholder="$t('用户/代理')"
            />
            <el-button
              style="margin-left: 20px"
              type="primary"
              @click="selectUser"
              >{{ $t("选择用户") }}</el-button
            >
          </div>
          <div>{{ $t("限制某代理线下面用户才能参与") }}</div>
        </div>
      </template>
      <template v-slot:introduce>
          <component @chage="editorEle" :content="dialogModel.introduce" :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" @selection-change="handleSelectionChange">
      <template #status="{ row }">
         <el-tag size="small" type="success"  v-if="row.status == 1">{{ $t('启用') }}</el-tag>
         <el-tag size="small" type="success"  v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #right="{row}">
          <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
          <el-button size="small" v-if="hasAuth('wufuCards')"  type="primary" @click="handleCardList(row)">{{ $t('卡片列表') }}</el-button>
          <el-button size="small" v-if="hasAuth('content')" type="primary" @click="handleActive(row)">{{ $t('设置内容') }}</el-button>
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
  padding-bottom:10px;
}
.line-box{
  margin-bottom: 10px;
}
</style>
