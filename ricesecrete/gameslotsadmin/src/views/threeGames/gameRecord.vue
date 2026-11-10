<script setup lang="tsx">
import { reactive, ref, defineAsyncComponent } from 'vue';
import { gamebetList } from "@/api/user";
// @ts-ignore
import uploadImage from '@/components/comm/uploadImage.vue'
import { timeCycle } from '@/utils/global'
import { forEach } from 'lodash-unified';
import { transformI18n } from '@/plugins/i18n';
import { message } from '@/utils/message';
import { http } from '@/utils/http';
import moment from 'moment'
defineOptions({
  name: 'gameRecord'
})
const columns = [
    {
      label: transformI18n("ID"),
      prop: "gb_id",
    },
    {
      label: transformI18n("游戏名称"),
      prop: "game_sys_sign",
    },{
      label: transformI18n("游戏平台"),
      prop: "game_third",
    },{
      label: transformI18n("游戏分类"),
      prop: "type_name",
    },{
      label: transformI18n("游戏用户"),
      prop: "username",
      width:200,
      cellRenderer: ({ row }) => (
        <>
        <div onClick={() => showUserInfo(row.gb_uid)}>
          <p>UID:{row.gb_uid}</p>
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
      label: transformI18n("注单号"),
      prop: "gb_sn",
    },{
      label: transformI18n("投注时间"),
      prop: "gb_bettime",
    },{
      label: transformI18n("结算时间"),
      prop: "gb_overtime",
    },{
      label: transformI18n("投注金額"),
      prop: "gb_price",
    },{
      label: transformI18n("有效投注"),
      prop: "gb_validwater",
    },{
      label: transformI18n("输赢"),
      slot: "gb_otherwin",
    },{
      label: transformI18n("狀態"),
      slot: "gb_winlose",
    },{
      label: transformI18n("操作"),
      slot: "right",
    }
];
  //编辑
const height = window.innerHeight - 300;
//以下是搜索框的数据
const list = {
  game_sys_sign: {
    type: 'input',
    placeholder: '游戏名称',
    value: '',
    prop: 'game_sys_sign',
  },
  username: {
    type: 'input',
    placeholder: '用户名/邮箱/手机号/邀请码',
    value: '',
    prop: 'username'
  },
  date: {
    type: 'time',
    placeholder: '投注时间',
    prop: 'date',
    value: [moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')]
  },
  tc_id: {
    type: 'select',
    placeholder: '游戏平台',
    value: '',
    prop: 'tc_id',
    options: []
  },
  game_type_id: {
    type: 'select',
    placeholder: '游戏分类',
    value: '',
    prop: 'game_type_id',
    options: []
  },
  user_level: {
    type: 'select',
    placeholder: '会员级别',
    value: '',
    prop: 'user_level',
    options: []
  },
  lebal: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    prop: 'lebal',
    options: [
      {
        value: '1',
        label: '一般用户',
      }, {
        value: '2',
        label: '测试用户',
      }
    ]
  },
  agent_name: {
    type: 'input',
    placeholder: '代理用户名',
    value: '',
    prop: 'agent_name'
  },
  status: {
    type: 'select',
    placeholder: '游戏状态',
    value: '',
    prop: 'status',
    options: [
      {
        value: '0',
        label: '无效',
      }, {
        value: '1',
        label: '未结算',
      }, {
        value: '2',
        label: '已结算',
      },
    ]
  },
  gb_sn: {
    type: 'input',
    placeholder: '游戏注单号',
    value: '',
    prop: 'gb_sn'
  },
  min_amount: {
    type: 'input',
    placeholder: '投注最低金额',
    value: '',
    prop: 'min_amount',
    disabled: false
  },
  max_amount: {
    type: 'input',
    placeholder: '投注最高金额',
    value: '',
    prop: 'max_amount',
    disabled: false
  },
  min_win_amount: {
    type: 'input',
    placeholder: '结算最低金额',
    value: '',
    prop: 'min_win_amount',
    disabled: false
  },
  max_win_amount: {
    type: 'input',
    placeholder: '结算最高金额',
    value: '',
    prop: 'max_win_amount',
    disabled: false
  },
  time_zone: {
    type: 'select',
    placeholder: '选择时区',
    value:'',
    prop: 'time_zone',
    options: [
      { label: '+0', value: '+0', },
      { label: '+1', value: '+1', },
      { label: '+2', value: '+2', },
      { label: '+3', value: '+3', },
      { label: '+4', value: '+4', },
      { label: '+5', value: '+5', },
      { label: '+6', value: '+6', },
      { label: '+7', value: '+7', },
      { label: '+8', value: '+8', },
      { label: '+9', value: '+9', },
      { label: '+10', value: '+10', },
      { label: '+11', value: '+11', },
      { label: '+12', value: '+12', },
      { label: '-1', value: '-1', },
      { label: '-2', value: '-2', },
      { label: '-3', value: '-3', },
      { label: '-4', value: '-4', },
      { label: '-5', value: '-5', },
      { label: '-6', value: '-6', },
      { label: '-7', value: '-7', },
      { label: '-8', value: '-8', },
      { label: '-9', value: '-9', },
      { label: '-10', value: '-10', },
      { label: '-11', value: '-11', },
      { label: '-12', value: '-12', },
    ]
  },
  search: {
    type: 'button',
    value: '搜索',
    handle: 'search',
    prop: 'search'
  },
  export: {
    type: 'button',
    value: '导出',
    handle: 'export',
    prop: 'export'
  }
};
const listbox = reactive({ list });
//条件数据
const pagination = reactive({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  game_sys_sign:'',
  lebal: '',
  tc_id: '',
  status: '',
  date: '',
  username: '',
  min_amount: '',
  max_amount: '',
  min_win_amount: '',
  max_win_amount: '',
  user_level: '',
  gb_sn: '',
  time_zone:'',
  game_type_id:'',
  export: 0
});
const dataList: any = [];
const tableData = reactive({ dataList });
//搜索
// const handleSerch = () => {
//   pagination.page = 1;
//   pagination.name = list[0].value
//   init();
// }
const total_amount = ref(0)
const total_win_amount = ref(0)
// const total_win_amount = ref(0)
const loading = ref(false)
const loadingText = ref('')
const loadingTexts = [
  '数据比较大,请耐心等待...',
  '如果可以提供账号和游戏名称，数据引擎将更快为您查询数据！',
  '正在为您查找玩家的游戏记录，请稍等片刻...',
]
const total_bets_num = ref(0)
const total_bets_money = ref(0)
const total_bets_validwater = ref(0)
const total_bets_gb_otherwin = ref(0)
const total_bets_gb_winprice = ref(0)

//首次需要加载的接口
init();
function init() {
  if (loading.value) {
    return
  }
  loadingText.value = loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
  loading.value = true
  pagination.export = 0;
  gamebetList(pagination).then((res: any) => {
    loading.value = false
    if (res.code == 1) {
      tableData.dataList = res.data
      pagination.total = res.total
      total_amount.value = res.total_amount;
      total_bets_num.value = res.total;
      total_bets_money.value = res.total_bets_money;
      total_bets_validwater.value = res.total_bets_validwater;
      total_win_amount.value = res.total_win_amount;
      total_bets_gb_otherwin.value = res.total_bets_gb_otherwin;
      total_bets_gb_winprice.value = res.total_bets_gb_winprice;
      const game_third = res.game_third
      listbox.list.game_type_id.options = res.game_type
      const arr = [];
      for (const key in game_third) {
        arr.push({ label: game_third[key],value:key })
      }
      listbox.list.tc_id.options = arr
      listbox.list.user_level.options = res.user_level
      // pagination.page = res.data.current_page
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
  pagination.export = 1;
  gamebetList(pagination).then((res: any) => {
    if (res.code == 1) {
      handleDownloadList()
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
const visibleDetail = ref(false)
const loadingDetail = ref(false)
const detailUrl = ref('')
const betInfo: any = ref({})
const hanldeDetail = (row) => {
  if (visibleDetail.value) {
    return;
  }

  detailUrl.value = '';
  betInfo.value = row
  visibleDetail.value = true
  loadingDetail.value = true;
  http.post("/game_bets/detail", { data: { gb_id: row.gb_id } }).then((res: any) => {
    loadingDetail.value = false;
    if (res.code == 1) {
      detailUrl.value = res.data;
    }
  });
}
//当前某个发生变化
const handleCurrentChange = ({ value, index }) => {
  // if (index == 'date' && value) {
  //   const isBefore = moment(value[0]).isBefore(moment().startOf('day'));
  //   listbox.list.max_amount.disabled = isBefore
  //   listbox.list.min_amount.disabled = isBefore
  //   listbox.list.max_win_amount.disabled = isBefore
  //   listbox.list.min_win_amount.disabled = isBefore
  // }
  list[index].value = value;
}
const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}


const downloadListShow = ref(false);
const handleDownloadList = row => {
  downloadListShow.value = true;
};

//判断是否是数组
const isArray = value => {
  return Array.isArray(value);
}
</script>

<template>
  <div>
    <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>

    <commSerach @export="handleExport" @search="handleSerch" @currentChange="handleCurrentChange"  :list="listbox.list"/>
    <el-alert :title="$t('为了更快查询数据,请尽量使用会员名称或游戏名称查询的游戏记录,默认只查询当天数据')" type="error" />
    <el-alert :title="$t('投注金额、结束仅支持一日内数据查询')" type="warning" />

    <div class="flex-bc flex-fi" >
        <div style="margin-right:20px;font-size: 14px;" >
          <el-tag size="large" style="margin-right:5px">{{ $t('投注笔数') }}:{{total_bets_num}}</el-tag>
          <el-tag size="large" style="margin-right:5px">{{ $t('投注金额') }}:{{total_bets_money}}</el-tag>
          <el-tag size="large" style="margin-right:5px">{{ $t('有效流水') }}:{{total_bets_validwater}}</el-tag>
          <el-tag type="warning" size="large" style="margin-right:5px">{{ $t('派彩金额') }}:{{total_bets_gb_winprice}}</el-tag>
          <el-tag type="danger" size="large" style="margin-right:5px">{{ $t('输赢') }}:{{total_bets_gb_otherwin}}</el-tag>
          <!-- <el-tag size="large">{{ $t('笔数') }}:{{ row.count }}</el-tag> -->
          <!-- <el-tag size="large">{{ $t('人数') }}:{{ row.people }}</el-tag> -->
          <!-- <el-tag type="warning" size="large">{{ $t('未审核') }}:{{ row.stay }}</el-tag> -->
          <!-- <el-tag type="danger" size="large">{{ $t('未通过') }}:{{ row.no }}</el-tag> -->
        </div>
    </div>

    <div v-loading="loading" :element-loading-text="loadingText">
      <pure-table :data="tableData.dataList" width="100%" :columns="columns">
        <template #gb_winlose="{ row }">
          <el-tag size="small" type="info"  v-if="row.gb_winlose == 0">{{ $t('无效') }}</el-tag>
          <el-tag size="small" type="warning" v-else-if="row.gb_winlose == 1">{{ $t('未结算') }}</el-tag>
          <el-tag size="small" type="success" v-else>{{ $t('已结算') }}</el-tag>
        </template>
        <template #gb_otherwin="{ row }">
          <span class="red" v-if="row.gb_otherwin >= 0">{{ row.gb_otherwin }}</span>
          <span class="green" v-else>{{ row.gb_otherwin }}</span>
        </template>
        <template #right="{ row }">
          <el-button type="primary" size="small" @click="hanldeDetail(row)">{{ $t('详情') }}</el-button>
        </template>
      </pure-table>
    </div>
    <el-dialog v-model="downloadListShow" :title="$t('下载列表')" width="80%" heith="100%">
      <component
        :is="
          defineAsyncComponent(() =>
            import('@/views/report/exportreports.vue')
          )
        "
      />
    </el-dialog>
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
    <el-dialog v-model="visibleDetail" :title="$t('游戏详情')" width="600" center>
      <div class="game-body-box">
          <div class="game-body-row">
              <span>UID</span> <span>{{ betInfo.gb_uid }}</span>
          </div>
          <div class="game-body-row">
              <span>{{ $t('注单编号') }}</span> 
              <span>{{ betInfo.gb_sn }}</span>
          </div>
          <div class="game-body-row" v-if="betInfo.gb_trans_no">
              <span>{{ $t('交易号') }}</span> <span>{{ betInfo.gb_trans_no }}</span>
          </div>
          <div>
            <div class="game-body-row">
              <span>{{ $t('游戏平台') }}</span> <span>{{ betInfo.game_third }}</span>
            </div>
            <div class="game-body-row">
              <span>{{ $t('游戏名称') }}</span> <span>{{ betInfo.game_sys_sign }}</span>
            </div>
            <div class="game-body-row">
                <span>{{ $t('结算状态') }}</span> <span>
                  <el-tag size="small" type="info"  v-if="betInfo.gb_winlose == 0">{{ $t('无效') }}</el-tag>
                  <el-tag size="small" type="warning" v-else-if="betInfo.gb_winlose == 1">{{ $t('未结算') }}</el-tag>
                  <el-tag size="small" type="success" v-else>{{ $t('已结算') }}</el-tag>
                </span>
            </div>
            <div class="game-body-row">
              <span>{{ $t('投注时间') }}</span> <span>{{ betInfo.gb_bettime }}</span>
            </div>
            <div class="game-body-row">
              <span>{{ $t('结算时间') }}</span> <span>{{ betInfo.gb_overtime }}</span>
            </div>
            <div class="game-body-row">
              <span>{{ $t('投注金额') }}</span> <span>{{ betInfo.gb_price }}</span>
            </div>
            <div class="game-body-row">
              <span>{{ $t('有效投注') }}</span> <span>{{ betInfo.gb_validwater }}</span>
            </div>
            <div class="game-body-row">
              <span>{{ $t('输赢') }}</span> <span>{{ betInfo.gb_otherwin }}</span>
            </div>
            <div class="game-body-row" v-if="detailUrl">
                <span>{{ $t('游戏结果') }}</span>
                <span v-loading="loadingDetail">
                  <div v-if="detailUrl">
                    <div v-if="isArray(detailUrl)">
                      <div class="game-body-row" v-for="item in detailUrl">
                        <span>{{ item.name }}</span> <span>{{ item.value }}</span>
                      </div>
                    </div>
                    <a v-else style="color: #409eff" target="_blank" :href="detailUrl">{{ $t('点击查看') }}</a>
                  </div>
                  <div v-else>
                    <a style="color: red">{{ $t('查询失败') }}</a>
                  </div>
                </span>
            </div>
        </div>
    </div>
  </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.line-box{
  margin:10px 0;
}
.game-body-box {
  border-right: 1px solid #ebeef5;
  border-top: 1px solid #ebeef5
}
.game-body-box .game-body-row {
  border-bottom: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
  display: flex
}
.game-body-box .game-body-row > span:first-child {
  display: inline-block;
  font-size: 13px;
  line-height: 24px;
  min-height: 34px;
  overflow: hidden;
  padding: 6px 15px;
  text-align: right;
  vertical-align: middle;
  width: 30%
}
.game-body-box .game-body-row > span:last-child {
  border-left: 1px solid #ebeef5;
  display: inline-block;
  font-size: 13px;
  line-height: 24px;
  min-height: 34px;
  padding: 6px 14px;
  text-align: left;
  vertical-align: middle;
  width: 70%
}
.game-body-box .game-body-row > span:last-child a {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline
}
.game-body-box .game-body-row .game-content-info {
  display: inline-block;
  font-style: normal;
  height: 24px;
  line-height: 24px;
  margin-right: 10px
}
.game-body-box .game-body-row .game-row-content {
  line-height: 24px;
  margin: 0;
  padding: 0
}
.game-body-box .game-body-content {
  max-height: 210px;
  overflow-y: auto
}
.game-body-box .game-body-result p {
  line-height: 24px;
  margin: 0;
  text-align: left
}
.game-body-box .game-body-result .spaceWord {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-height: 120px;
  word-spacing: 15px
}
.game-body-box .game-body-result .spaceWord .col_i {
  display: inline-block;
  font-style: normal;
  min-width: 60px;
  padding: 5px;
  text-align: center
}
.game-body-box .game-body-content {
  scrollbar-color: #e1ebf5 #fff;
  scrollbar-width: thin
}
.game-body-box .game-body-content::-webkit-scrollbar {
  background-color: #fff;
  height: 6px;
  width: 6px
}
.game-body-box .game-body-content::-webkit-scrollbar-track {
  background-color: #fff;
  border-radius: 3px
}
.game-body-box .game-body-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px
}
.game-body-box .game-content-list {
  border-bottom: 1px solid #ccc;
  margin-bottom: 12px;
  padding-bottom: 12px
}

.game-body-box .game-content-list:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0
}

</style>
