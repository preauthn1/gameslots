<script setup lang="tsx">
import { reactive, ref, getCurrentInstance, defineAsyncComponent } from "vue";
import { indexMenuList, indexMenuEdit, indexMenuAdd, indexMenuDelete } from "@/api/user";
import { message } from "@/utils/message";
// import { formaTime } from '@/utils/global'
import { transformI18n } from "@/plugins/i18n";
import { hasAuth } from '@/router/utils';
import uploadImage from '@/components/comm/uploadImage.vue'
import { useDataLoad } from "@/components/table/dataLoad";
const {
  loading,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onInitList,
  onSizeChange,
  onCurrentChange,
  dataList
} = useDataLoad('/indexMenu/lists');
const { proxy } = getCurrentInstance();
defineOptions({
  name: 'indexMenu'
})
const columns = [//TableColumnList
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  {
    label: transformI18n("排序"),
    prop: "sort",
  },
  {
    label: transformI18n("语种"),
    prop: "lang",
  },
  {
    label: transformI18n("显示区域"),
    slot: "area",
  },
  {
    label: transformI18n("名称"),
    prop: "name",
  },
  {
    label: transformI18n("链接"),
    prop: "href",
  },
  {
    label: transformI18n("图标名称"),
    prop: "icon",
  },
  {
    label: transformI18n("默认图标"),
    width: 100,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={row.icon_url} alt="" />
      </div>
    )
  },
  {
    label: transformI18n("选中图标"),
    width: 100,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={row.select_icon_url} alt="" />
      </div>
    )
  },
  {
    label: transformI18n("LOGO"),
    width: 100,
    cellRenderer: ({ row }) => (
      <div style="display: flex; align-items: center">
        <img src={row.logo} alt="" />
      </div>
    )
  },
  {
    label: transformI18n("状态"),
    slot: "status",
  },
  {
    label: transformI18n("操作"),
    width: 200,
    fixed: "right",
    slot: 'right'
  }
];
const handleEdit = (index, row) => {

}


let area_list = {};
//搜索的数据，key 值 跟 pagination key 一样
const searchList = {
  area: {
    type: 'select',
    label: '显示区域',
    placeholder: '显示区域',
    prop: 'area',
    options: []
  },
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '语种',
    prop: 'lang',
    options: []
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
}
const searchListBox = reactive({
  searchList
})

const queryParams = reactive({
  type: '',
  lang: '',
});

const tableData = reactive({ dataList });
//获取列表数据
init();
function init() {
  pagination.currentPage = 1;
  onInitList(queryParams, (res) => {
    if (res.code == 1) {
      dialogList.lang.options = res.lang_arr;
      dialogList.area.options =  res.menu_type_arr;
      dialogList.quick_link.options =  res.url;
      area_list = res.menu_type;
      searchList.lang.options = res.lang_arr;
      searchList.area.options = res.menu_type_arr;
    }
  })
}


// 搜索输入框数据变动时触发
const searchChange = ({ value, index }) => {
  searchListBox.searchList[index].value = value;
  if (searchListBox.searchList[index].type == 'date' || searchListBox.searchList[index].type == 'time') {
    const time = value && value.length > 0 ? value[0] + ' - ' + value[1] : '';
    value = time;
  }
  queryParams[index] = value
}
//点击确定
const handleBtn = () => {
  init();
}


//上传成功后的图片
const backImageData = (prop, val) => {
  dialogModel[prop] = val.file[0];
  list2Box.dialogList[prop].value = val.file[0];
}
//上传成功后的图片
const backLogoImageData = (prop, val) => {
  dialogModel[prop] = val.file[0];
  list2Box.dialogList[prop].value = val.file[0];
}



//弹框写法
const visible = ref(false);
var dialogList = {
  lang: {
    type: 'select',
    label: '语种',
    placeholder: '语种',
    prop: 'lang',
    value: "",
    show: false,
    options: []
  },
  area: {
    type: 'select',
    label: '显示区域',
    placeholder: '显示区域',
    prop: 'area',
    value: "",
    show: false,
    options: []
  },
  pid: {
    type: 'select',
    label: '父菜单',
    placeholder: '父菜单',
    prop: 'pid',
    show: true,
    value: 0
  },
  name: {
    type: 'input',
    label: '名称',
    placeholder: '名称',
    value: '',
    prop: 'name'
  },
  agent_id: {
    type: "slot",
    label: "代理线",
    placeholder: "代理id",
    tip: "限制某个代理下面的用户才能参与",
    value: "",
    name: "username",
    prop: "id"
  },
  quick_link: {
    type: 'select',
    label: '快捷链接',
    value: '',
    prop: 'quick_link',
    options: [],
  },
  href: {
    type: 'input',
    label: '链接',
    placeholder: '请输入链接',
    value: '',
    prop: 'href'
  },
  icon: {
    type: 'input',
    label: '图标名称',
    placeholder: '图标名称',
    value: '',
    prop: 'icon'
  },
  icon_url: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '默认图标',
    prop: 'icon_url'
  },
  select_icon_url: {
    type: 'slot',
    name: 'upload',
    value: '',
    label: '选中图标',
    prop: 'select_icon_url'
  },
  logo: {
    type: 'slot',
    name: 'logo_upload',
    value: '',
    label: 'logo',
    prop: 'logo'
  },
  sort: {
    type: 'input',
    label: '排序',
    placeholder: '数值越小越靠前',
    value: '',
    prop: 'sort'
  },
  extra: {
    type: 'input',
    label: '扩展信息',
    placeholder: '扩展信息',
    value: '',
    prop: 'extra'
  },
  is_img: {
    type: 'radio',
    label: '图片菜单',
    value: 0,
    prop: 'is_img',
    options: [
      {
        label: 0,
        name: '否'
      }, {
        label: 1,
        name: '是'
      },
    ]
  },
  status: {
    type: 'radio',
    label: '状态',
    value: 1,
    prop: 'status',
    options: [
      {
        label: 1,
        name: '开启'
      }, {
        label: 0,
        name: '关闭'
      },
    ]
  }
}
const dialogModel = reactive({
  lang: '',
  area: '',
  name: '',
  href: '',
  icon: '',
  icon_url: '',
  select_icon_url:'',
  logo: '',
  sort: '',
  pid: 0,
  agent_id: '',
  is_img: '',
  extra: '',
  status: 1,
  id: ''
})
const listRules = {
  //  name: { required: true, message: '请输入', trigger: ['blur','change'] },

}
const list2Box = reactive({ dialogList })
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  if (index == 'quick_link') {
    list2Box.dialogList['href'].value = value;
    dialogModel['href'] = value;
  } else {
    dialogModel[index] = value;
  }
}
const clickIndex = ref(1);
//编辑
const handleEidt = (row) => {
  const query = {
    find: true,
    id: row.id
  }
  clickIndex.value = 1;
  indexMenuEdit(query).then((res: any) => {
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

const handleSave = () => {
  if (clickIndex.value == 1) {
    const query = {
      edit: true,
      info: dialogModel
    }
    console.log(dialogModel);
    indexMenuEdit(query).then((res: any) => {
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
    indexMenuAdd(query).then((res: any) => {
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
const dialogTitle = ref('添加/编辑');
//添加
const handleAdd = (parent, $event) => {
  const zreoArr = ['type', 'is_img', 'pid', 'status'];
  for (const key in dialogModel) {
    if (typeof dialogModel[key] === 'undefined' && key == 'id') {
      continue;
    }
    const val = zreoArr.includes(key) ? (key == 'status' ? 1 : 0) : '';
    if (key != 'id') {
      list2Box.dialogList[key].value = val
    }
    dialogModel[key] = val
  }
  if ( parent ) {
    list2Box.dialogList['pid'].value = parent.id
    dialogModel['pid'] = parent.id
    list2Box.dialogList['area'].value = parent.area
    list2Box.dialogList['area'].show = true
    dialogModel['area'] = parent.area
    list2Box.dialogList['lang'].value = parent.lang
    list2Box.dialogList['lang'].show = true
    dialogModel['lang'] = parent.lang
    dialogTitle.value = "添加["+ parent.name +"]的下级菜单";
  } else {
    list2Box.dialogList['area'].show = false
    list2Box.dialogList['lang'].show = false
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
  indexMenuDelete(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
      init();
    } else {
      message(res.msg, { type: 'error' });
    }
    selectAll = []
  })
}
//点击选择用户
const selectShow = ref(false);
const selectUser = () => {
  selectShow.value = true;
};

const eidtUsername = val => {
  dialogList.agent_id.value = val;
  dialogModel.agent_id = val;
  selectShow.value = false;
};
</script>

<template>
  <div>
    <commSerach @search="init" @currentChange="searchChange"  :list="searchListBox.searchList"/>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <div class="flex-bc line-box">
      <div>
        <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button>
        <el-button v-if="hasAuth('add')" type="primary" @click="handleAdd(null)">{{ $t('添加') }}</el-button>
      </div>
    </div>
    <commDialog :title="dialogTitle" width="80%" @save="handleSave" :dialogObj="dialogModel" @currentChage="handleDialogChange"
      :listRules="listRules" :list="list2Box.dialogList" :visible="visible" @close="visible = false">
      <template v-slot:upload="{data}">
          <uploadImage @imageData="backImageData(data.prop, $event)"  :limit="1" :image="dialogModel[data.prop]"/>
      </template>
      <template v-slot:logo_upload="{data}">
          <uploadImage @imageData="backLogoImageData(data.prop, $event)"  :limit="1" :image="dialogModel[data.prop]"/>
      </template>
      <template #username>
        <div>
          <div class="flex-fi user-box">
            <el-input
              v-model="dialogModel.agent_id"
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
          <div>{{ $t("限制某代理线下面用户才能看到此菜单") }}</div>
        </div>
      </template>
    </commDialog>
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
    <pure-table
      row-key="id" 
      :loading="loading"
      :loading-config="loadingConfig"
      adaptive
      :adaptiveConfig="adaptiveConfig"
      :pagination="pagination"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
      @selection-change="handleSelectionChange"
     :data="tableData.dataList" width="100%" :columns="columns"
     :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
     >
     <template #status="{ row }">
        <el-tag size="small" type="success" v-if="row.status == 1">{{ $t('开启') }}</el-tag>
        <el-tag size="small" type="danger" v-else-if="row.status == 0">{{ $t('禁用') }}</el-tag>
      </template>
      <template #area="{ row }">
        <el-tag size="small" type="success">{{ area_list[row.area] }}</el-tag>
      </template>
      <template #right="{ row }">
        <el-button size="small" v-if="row.pid == 0 && hasAuth('add')" type="warning" @click="handleAdd(row)">{{ $t('添加下级菜单') }}</el-button>
        <el-button size="small" v-if="hasAuth('edit')" type="primary" @click="handleEidt(row)">{{ $t('编辑') }}</el-button>
      </template>
    </pure-table>
  </div>
</template>
<style scoped>
.line-box {
  margin-bottom: 10px;
}
</style>