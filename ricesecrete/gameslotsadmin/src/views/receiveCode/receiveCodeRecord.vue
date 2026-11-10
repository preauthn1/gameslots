<script setup lang="tsx">
import { reactive,ref,defineAsyncComponent,getCurrentInstance, computed } from "vue";
import { receiveCodeRecordList } from "@/api/user";
import { storageLocal } from "@pureadmin/utils";
import menuList from "@/components/menu/menu.vue"

// @ts-ignore
import { transformI18n } from "@/plugins/i18n";
const { proxy } = getCurrentInstance();
const columns = [//TableColumnList

  {
    label: transformI18n("用户id"),
    prop: "uid",
  },
  {
    label: transformI18n("领取码"),
    prop: "code",
  },
  {
    label: transformI18n("关联标签"),
    prop: "tag_list",
    slot: 'tag'
  },
  {
    label: transformI18n("金额类型"),
    slot: "amount_type",
    width: 150,
  },
  {
    label: transformI18n("奖励金额"),
    prop: "reward_amount",
  },
  {
    label: transformI18n("IP"),
    prop: "ip",
  },
  {
    label: transformI18n("时间"),
    prop: "create_time",
  },
];


//搜索的数据，key 值 跟 pagination key 一样

const searchList = {
  code:{
    type: 'input',
    placeholder: '领取码',
    value: '',
    prop:'code'
  },
  time:{
    type: 'time',
    placeholder: '时间',
    idx:1,
    value: (): Array<string> => {
      return []
    }
  },
  ip:{
    type: 'input',
    placeholder: 'IP',
    value: '',
    prop:'ip'
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
  code: '',//领取码
  date: '',//时间
  ip: '',//IP
  // lang: storageLocal().getItem("i18n_locale"),//语言
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  receiveCodeRecordList(pagination).then((res:any) => {
    tableData.dataList = res.data.data
    pagination.total = res.data.total
    pagination.page = res.data.current_page
    countDataBox.value = res.statistics
    // list2Box.dialogList.lang.options = res.langs
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
  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      pagination[key] = searchList[key].value;
    }
  }
  pagination.page = 1;
  //时间转换
  const val = searchList['time'].value;
  console.log(val)
  const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
  pagination['date'] = time//时间
  init(pagination);
}
const countDataBox: any = ref({})
</script>

<template>
  <div style="padding-bottom: 40px;">
    <menuList />
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="flex-bc line-box">
      <div class="flex-bc" >
        <div style="margin-left:20px;font-size: 14px;" >
          <el-tag size="large">{{ $t('领取金额') }}:{{countDataBox.receive_amount}}</el-tag>
        </div>
      </div>
    </div>
    <pure-table :data="tableData.dataList" width="100%"   :columns="columns" >
        <template #amount_type="{ row }">
          <el-tag size="small" type="danger"  v-if="row.amount_type == 0">{{ $t('普通') }}</el-tag>
          <el-tag size="small" type="success"  v-if="row.amount_type == 1">{{ $t('累计') }}</el-tag>
      </template>


      <template #tag="{ row }">
        <div>
          <el-tag v-for="tag,idx in row.tag_list" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''" :type="tag.color ? '' : 'success'" :key="idx">
            {{ $t(tag.name) }}
          </el-tag>
        </div>
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

<style scoped>
.btmNav{
  padding-top:10px;
  padding-bottom: 30px;
}
</style>
