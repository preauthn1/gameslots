<template>
 <el-dialog v-model="visible2" width="80%" @close="emit('handleClose')">
  <template #header="{ titleId, titleClass }">
    <div class="flex-bc">
      <h4 :id="titleId" :class="titleClass">{{ $t('会员信息') }}</h4>
    </div>
  </template>
  <div v-if="loading" v-loading="loading" style="height: 250px;"/>
  <el-tabs v-else type="border-card">
    <el-tab-pane v-if="!loading" :label="t('基本资料')">
        <el-descriptions>
          <el-descriptions-item :label="$t('UID')">{{ dataInfo.id }}
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.id)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.mail" :label="$t('邮箱')">{{ dataInfo.mail }}
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.mail)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.phone" :label="$t('手机号')">
            <template v-if="dataInfo.qh">+ {{ dataInfo.qh }} - </template>
            {{ dataInfo.phone }}
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.phone)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('用户名')">{{ dataInfo.username }}
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.username)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.real_name" :label="$t('用户昵称')">{{ dataInfo.real_name }}</el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.level_name" :label="$t('会员等级')">
            <el-tag size="small">{{ dataInfo.level_name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('推广码')"><el-tag size="small">{{ dataInfo.rec_code }}</el-tag>
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.rec_code)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('餘額')"><el-tag size="small">{{ dataInfo.balance }}</el-tag></el-descriptions-item>
          <el-descriptions-item :label="$t('三方余额')"><el-tag size="small">{{ dataInfo.third_balance }}</el-tag></el-descriptions-item>
          <el-descriptions-item :label="$t('积分')"><el-tag size="small">{{ dataInfo.integral }}</el-tag></el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.remark" :label="$t('备注')">{{ dataInfo.remark }}</el-descriptions-item>
          <el-descriptions-item :label="$t('注册时间/ip')">{{ dataInfo.add_time }} / {{ dataInfo.reg_ip }}
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.reg_ip)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.end_login_ip" :label="$t('登录时间/ip')">
            {{ dataInfo.login_time }} / {{ dataInfo.end_login_ip }}
            <span class="copy">
              <iconify-icon-online @click="copy(dataInfo.end_login_ip)" icon="material-symbols:content-copy-outline" />
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('用户类型')">
            <el-tag size="small" type="success" v-if="dataInfo.lebal == 1">{{ $t('一般用户') }}</el-tag>
            <el-tag size="small" v-else type="danger">{{ $t('测试用户') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('设备类型')">
            <div>{{ dataInfo.device }}</div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('用户状态')">
            <el-tag size="small" type="success" v-if="dataInfo.status == 1">{{ $t('正常') }}</el-tag>
            <el-tag size="small" v-else type="danger">{{ $t('禁用') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('用户标签')">
            <el-tag v-for="tag,idx in dataInfo.tags" size="small" :color="tag.color" :style="tag.color ? 'color:#FFF;' : ''" :type="tag.color ? '' : 'success'" :key="idx">
              {{ $t(tag.name) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="dataInfo.rec_id > 0" :label="$t('上级代理')">
            <div v-for="(row, idx) in dataInfo.tree_users" :key="idx">
              {{ idx + 1 }} {{ $t('级') }}: 
              <span class="mr-[10px]">UID:{{ row.id }} <span class="copy"><iconify-icon-online @click="copy(row.id)" icon="material-symbols:content-copy-outline" /></span></span>
              <span class="mr-[10px]" v-if="row.mail">{{ $t('邮箱') }}:{{ row.mail }} <span class="copy"><iconify-icon-online @click="copy(row.mail)" icon="material-symbols:content-copy-outline" /></span></span>
              <span class="mr-[10px]" v-if="row.phone">{{ $t('手机号') }}:{{ row.phone }} <span class="copy"><iconify-icon-online @click="copy(row.phone)" icon="material-symbols:content-copy-outline" /></span></span>
              <!-- <span v-if="row.username">用户名:{{ row.username }} <span class="copy"><iconify-icon-online @click="copy(row.username)" icon="material-symbols:content-copy-outline" /></span></span> -->
            </div>
          </el-descriptions-item>
        </el-descriptions>
    </el-tab-pane>
    <el-tab-pane v-if="!loading" :label="t('数据概括')">
      <div class="listTab">
        <el-button :plain="btnCurrentIndex == index ?false:true" type="primary" class="listTab-item" size="large" v-for="item,index in summaryData" :key="index" @click="handleTopBtn(item,index)">{{ item.name }}</el-button>
      </div>
      <template v-if="contentShow">
        <div>
          <pure-table :border="true" header-row-class-name="headerClass" :data="dataSummary.summaryList" width="100%"  :columns="columns" />
          <div style="margin-top:20px;">
            <component :summaryTitle="summaryTitle" :uid="dataInfo.id" :is="summaryCompent"/>
          </div>
        </div>
      </template>
      <template v-else>
          <div class="content-box">
            <component :height="300" :uid="dataInfo.id" :is="content"/>
          </div>
      </template>
    </el-tab-pane>
  </el-tabs>
</el-dialog>

</template>

<script lang="tsx" setup>
import { copyContent } from "@/utils/global";
import { ref, reactive, defineAsyncComponent, computed  } from 'vue'
import { router } from "@/router";
import { useI18n } from "vue-i18n";
import { userDetail } from '@/api/user';
const { t } = useI18n();
const props = defineProps<{
  visible2: Boolean,
  id: Number
}>();

const visible2 = computed(() => {
  return props.visible2;
})
const uid = computed(() => {
  return props.id;
})
const dataInfo: any = ref({});
const emit = defineEmits(['handleClose']);
//银行卡组件
const bankCard = defineAsyncComponent(()=> import('@/views/user/pages/userbank.vue'))
const loginLog = defineAsyncComponent(()=> import('@/views/user/pages/userloginlog.vue'))
const recordOperation = defineAsyncComponent(() => import('@/components/user/userAdminLog.vue'))
const earningDetail = defineAsyncComponent(() => import('@/components/fragment/earningDetail.vue'))
const orderRecord = defineAsyncComponent(() => import('@/views/games/betmanage.vue'))
const rechargeRecord = defineAsyncComponent(() => import('@/views/offline/useroffline.vue'))
const withdrawalRecord = defineAsyncComponent(() => import('@/views/offline/userwithdrawal.vue'))
const superiorMember = defineAsyncComponent(() => import('@/views/user/pages/seniorMember.vue'))
const flowToal = defineAsyncComponent(() => import('@/components/fragment/flowToal.vue'))
const userReportData = defineAsyncComponent(() => import('@/views/user/pages/userreport.vue'))

//表格数据
 const columns = [//TableColumnList
    {
      label: t("充值总额"),
      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={() => handleTdNum('充值总额')}>{ row.total_recharge }</span>
        </>
      )
    },{
      label: t("提现总额"),
      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('提现总额')}>{ row.total_withdraw }</span>
        </>
      )
    },{
      label: t("总输赢"),
     cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('总输赢')}>{ row.total_profit }</span>
        </>
      )
    },{
      label: t("总有效投注"),
      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('总有效投注')}>{ row.total_betslip }</span>
        </>
      )
    },{
      label: t("代理返佣总额"),

      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('代理总额')}>{ row.total_agentrebate }</span>
        </>
      )
    },{
      label: t("人工增加总额"),

      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('人工总额')}>{ row.total_increase }</span>
        </>
      )
    },{
      label: t("人工赠送彩金总额"),

      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('赠送总额')}>{ row.total_jackpot }</span>
        </>
      )
    },{
      label: t("人工减少总额"),
      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('减少总额')}>{ row.total_reduce }</span>
        </>
      )
    },{
      label: t("活动奖励总额"),
      cellRenderer: ({ index, row }) => (
        <>
          <span style="color: #409eff;cursor:pointer" onClick={ ()=> handleTdNum('奖励总额')}>{ row.total_activityaward }</span>
        </>
      )
    },
];
//数据概括td 点击事件
const summaryCompent = ref(null);
const summaryTitle = ref<string>('');
//概括数据显示
const handleTdNum = (value) => {
  switch (value) {
    case '代理总额':
      summaryCompent.value = defineAsyncComponent(() => import('@/components/fragment/agencyAmount.vue'))
      summaryTitle.value = t('代理返佣总额')
      break
    case '人工总额':
      summaryTitle.value = t('人工增加总额')
      summaryCompent.value = defineAsyncComponent(() => import('@/components/fragment/manuallyAdd.vue'))
      break
    case '赠送总额':
      summaryTitle.value = t('人工赠送彩金总额')
      summaryCompent.value = defineAsyncComponent(() => import('@/components/fragment/manuallyAdd.vue'))
      break
    case '减少总额':
      summaryTitle.value = t('人工减少总额')
      summaryCompent.value = defineAsyncComponent(() => import('@/components/fragment/manuallyAdd.vue'))
      break
    case '奖励总额':
      summaryTitle.value = t('活动奖励总额')
      summaryCompent.value = defineAsyncComponent(() => import('@/views/huodongguanli/applyManage.vue'))
      break
  }
}
//数据概括数据
const contentShow = ref(true);
const content = ref(null);
const btnCurrentIndex = ref(-1);
const handleTopBtn = (item, index) => {
  btnCurrentIndex.value = index;
  item.name == t('数据概括') ? contentShow.value = true : contentShow.value = false;
  // if (item.name != t('数据概括')) {
  //   content.value = item.component;
  // }
  if (item?.url) {
    // $router.push('/');
    router.push({path:item?.url, query: {uid: dataInfo.value.id}});
  }
  if (item.name != t('数据概括') && !item?.url) {
    content.value = item.component;
  }

}
const summaryData = [
  {
    name: t('数据概括'),
  },
  {
    name: t('银行卡'),
     component: bankCard,
  //  height: 300,
   // url:'/user/pages/userbank'
  }, {
    name: t('登录日志'),
   // url:'/user/pages/userloginlog'
     component:loginLog
  }, {
    name: t('操作记录'),
   // url:'/admin/logList'
     component:recordOperation
  }, {
    name: t('账户资金明细'),
    component:earningDetail
  // }, {
  //   name: t('订单记录'),
  //  // url:'/games/betmanage'
  //  component:orderRecord
  }, {
    name: t('充值记录'),
  //  url:'/offline/useroffline'
    component:rechargeRecord
  }, {
    name: t('提现记录'),
  // url:'/offline/userwithdrawal'
    component:withdrawalRecord
  }, {
    name: t('上级会员'),
   // url:'/user/pages/seniorMember'
    component:superiorMember
  }, {
    name: t('流水总计'),
    component:flowToal
  },{
    name: t('会员数据总览'),
    component:userReportData
  }, 
]

const summaryList: any = {}
const dataSummary = reactive({
  summaryList
})
const loading = ref(true)
handleSeeData()
function handleSeeData() {
  userDetail({id:uid.value}).then((res: any) => {
    if (res.code == 1) {
      dataInfo.value = res.data;
      dataSummary.summaryList = [res.data.data]
      loading.value = false
    }
  })
}
const copy = (val) => {
  copyContent(val)
}
</script>
<style scoped lang="scss">
.listTab{
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-bottom:15px;
  &-item{
    margin-left:0px;
    margin-right: 12px;
    margin-bottom: 10px;
  }
}
.headerClass{
  background-color:#f2f2f2;
}
.frame-iframe{
  width:100%;
  height: 400px;
}
.copy {
  display: inline-block;
  cursor: pointer;
  margin-left: 3px;
}
</style>
