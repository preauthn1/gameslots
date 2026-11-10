<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { gamebetList } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
import { http } from '@/utils/http';
import { useI18n } from "vue-i18n";
defineOptions({
  name: 'betspage'
})
const { t } = useI18n();
const columns = [
    {
      label: transformI18n("UID"),
      prop: "id",
    },
    {
      label: transformI18n("用户名"),
      prop: "username",
      width:200,
      cellRenderer: ({ row }) => (
        <>
        <div onClick={() => showUserInfo(row.id)}>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2">{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2">{row.mail}</p>
          </div>
        </div>
        </>
      )
    },{
      label: transformI18n("所属层级"),
      prop: "rec_level",
    },
    // {
    //   label: transformI18n("推广码"),
    //   prop: "rec_code",
    // },
    {
      label: transformI18n("推广用户"),
      prop: "rec_name",
    },{
      label: transformI18n("投注总额"),
      prop: "zd_price",
    },{
      label: transformI18n("投注笔数"),
      prop: "zd_number",
    },{
      label: transformI18n("有效投注"),
      prop: "bet_valid_amount",
    },{
      label: transformI18n("总派彩"),
      prop: "win_price",
    }
];


const statColumns = [
  {
    label: transformI18n("投注人数"),
    prop: "zd_number",
  },
  {
    label: transformI18n("投注总额"),
    prop: "zd_price",
  },
  {
    label: transformI18n("投注笔数"),
    prop: "zd_count",
  },
  {
    label: transformI18n("有效投注"),
    prop: "bet_valid_amount",
  },
  {
    label: transformI18n("总派彩"),
    prop: "order_win",
  },
  {
    label: transformI18n("投注盈亏"),
    prop: "order_loss",
  },
];

//以下是搜索框的数据
const list = {
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号',
    value: '',
    prop: 'username'
  },
  date: {
    type: 'time',
    placeholder: '开始时间',
    prop: 'date',
    value: (): Array<string> => {
      return []
    }
  },
  rec_id:{
    type: 'input',
    placeholder: t('上级uid/推广码'),
    prop: 'rec_id',
    value: ''
  },
  like_all_next:{
    type: 'select',
    placeholder: '包含下级会员',
    value: '',
    prop: 'like_all_next',
    options: [
      {
        value: '0',
        label: '否',
      },
      {
        value: '1',
        label: '是',
      }
    ]
  },
  rec_level: {
    type: 'select',
    placeholder: '所属层级',
    value: '',
    prop: 'rec_level',
    options: []
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  date: '',
  username: '',
  rec_id: '',//代理id 推广码 用户名
  like_all_next: '',//是否包含下级数据
  rec_level: '',
});
const dataList: any = [];
const tableData = reactive({ dataList });
const statDataList: any = [];
const tableStatData = reactive({ statDataList });
//首次需要加载的接口
 init();
function init() {
  http.post('/agent_report/userzhudan', {
    data: pagination
  }).then((res: any) => {
    if (res.code == 1) {
      tableData.dataList = res.data.data
      pagination.total = res.data.total
      if (pagination.page == 1) {
        const arr = [];
        for (let i = 1; i <= res.max_level; i++) {
          arr.push({ label: i, value:i })
        }
        listbox.list.rec_level.options = arr
        tableStatData.statDataList = res.stat
      }
    }
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
//搜索
const handleSerch = () => {
  pagination.page = 1;
   for (const key in pagination) {
    if (key == list[key]?.prop) {
      if (key == 'date') {
        const val = list[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = list[key].value
      }
    }
  }
  init();
}
//导出
const handleExport = () => {
  gamebetList(pagination).then((res: any) => {
    if (res.code == 1) {
      window.location.href = res.data;
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
//当前某个发生变化
const handleCurrentChange = ({value,index }) => {
  list[index].value = value;
}
//弹框写法

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    
    <el-table :data="tableStatData.statDataList" style="width: 100%; margin-bottom: 15px;">
      <el-table-column align="center" v-for="(col, index) in statColumns" :key="index" :prop="col.prop" :label="col.label"/>
    </el-table>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns" >
      <template #gb_winlose="{ row }">
        <el-tag size="small" type="info"  v-if="row.gb_winlose == 0">{{ $t('无效') }}</el-tag>
        <el-tag size="small" type="warning"  v-if="row.gb_winlose == 1">{{ $t('未结算') }}</el-tag>
        <el-tag size="small" type="danger"  v-if="row.gb_winlose == 2">{{ $t('输') }}</el-tag>
        <el-tag size="small" type="success"  v-if="row.gb_winlose == 3">{{ $t('赢') }}</el-tag>
        <el-tag size="small"  v-if="row.gb_winlose == 4">{{ $t('平') }}</el-tag>
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
