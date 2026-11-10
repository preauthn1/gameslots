<script setup lang='ts'>
import { ref, reactive, defineAsyncComponent } from 'vue';
// @ts-ignore
import customTable from "./custorm-table.vue";
import { timeCycle } from '@/utils/global'
import { queryData, getMatch } from "@/api/user";
import { useI18n } from "vue-i18n";
import { hasAuth } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";

const {
  username,
} = useNav();
const { t } = useI18n();
const selected = ref(0);
const tabList = reactive(
  [
  {
    name:'数据总览',
    key:'1',
    num: 0,
    time:'',
    component: customTable,

    },
  //   {
  //   name:t('成交量预警'),
  //   key:'2',
  //   num: 123,
  //   component:defineAsyncComponent(()=> import('@/components/gui/index/volumewarning.vue')),
  //   list:[]
  // },{
  //   name:t('比赛时间更新'),
  //   key:'3',
  //   num: 0,
  //   component:defineAsyncComponent(()=> import('@/components/gui/index/gameupdate.vue')),
  //   list:[]
  // },{
  //   name:t('赛事异常通报'),
  //   key:'4',
  //   num: 0,
  //   component:defineAsyncComponent(()=> import('@/components/gui/index/abnormalevent.vue')),
  //   list:[]
  // },{
  //   name:t('超6小时无赛果的赛事'),
  //   key:'5',
  //   num: 0,
  //   component:defineAsyncComponent(()=> import('@/components/gui/index/outsixgame.vue')),
  //   list:[]
  // }
]
)

const list1 = reactive({
  "onlineUser": {
    "title": "在线人数", "num": 0, "tip": '当前在线人数', "idx": 1, loading: false
  },
  "TotalUser1": {
    "title": "注册人数", "num": 0, "tip": '新注册用户数量', "idx": 2, loading: false
  },
  "TotalUser2": {
    "title": "活跃人数", "num": 0, "tip": '登录过的用户数量', "idx": 3, loading: false
  },
  "ThirdsBalance": {
    "title": "三方余额", "num": 0, "idx": 5, loading: false
  },
  "ThirdsTotalBalance": {
    "title": "三方余额+盘口余额", "num": 0, "idx": 5, loading: false
  },
  // "TotalBalance": {
  //   "title": "盘口余额", "num": 0, "idx": 5, loading: false
  // },
  "TotalRechargeUser1": {
    "title": "充值人数", "num": 0, "idx": 5, loading: false
  },
  "RechargeCount": {
    "title": "充值笔数", "num": 0, "idx": 5, loading: false
  },
  "TotalRechargeUser2": {
    "title": "首充人数", "num": 0, "idx": 6, loading: false
  },
  // "RechargeUserAvgLifeTime": {
  //   "title": "充值用户平均生命周期(天)", "tip": ' SUM(用户最后充值时间 - 第一次充值时间) ÷ 总充值用户数', "num": 0, "idx": 51, loading: false
  // },
  // "ToMonthRechargeUserAvgLifeTime": {
  //   "title": "本月充值用户平均生命周期(天)", "tip": ' SUM(用户最后充值时间 - 第一次充值时间) ÷ 总充值用户数', "num": 0, "idx": 52, loading: false
  // },
  // "LastMonthRechargeUserAvgLifeTime": {
  //   "title": "上月充值用户平均生命周期(天)", "tip": ' SUM(用户最后充值时间 - 第一次充值时间) ÷ 总充值用户数', "num": 0, "idx": 53, loading: false
  // },
  // "RechargeUserAvgLifeTimeValue": {
  //   "title": "充值用户平均充值金额", "tip": '用户充值总额÷总充值用户数', "num": 0, "idx": 5, loading: false
  // },
  "TotalRechargeUser3": {
    "title": "首充外复充","tip": ' 充值人数-首充人数', "num": 0, "idx": 7, loading: false
  },
  // "TotalRechargeUser2_3": {
  //   "title": "多笔复充","tip": ' 多笔充值就算复充', "num": 0, "idx": 7, loading: false
  // },
  "TotalFirstRecharge": {
    "title": "首充金额", "num": 0, "idx": 29, loading: false
  },
  "TotalRecharge1": {
    "title": "线上充值", "num": 0, "idx": 8, loading: false
  },
  // "TotalRecharge2": {
  //   "title": "线下转帐", "num": 0, "idx": 9, loading: false
  // },
  // "TotalRecharge3": {
  //   "title": "USDT充值", "num": 0, "idx": 10, loading: false
  // },
  "TotalRecharge4": {
    "title": "充值总额", "num": 0, "idx": 11, loading: false
  },
  "TotalWithdraw1": {
    "title": "提现总额", "num": 0, "idx": 14, loading: false
  },
  // "TotalWithdraw2": {
  //   "title": "提现人数", "num": 0, "idx": 14, loading: false
  // },
  // "TotalWithdraw3": {
  //   "title": "提现笔数", "num": 0, "idx": 14, loading: false
  // },
  "TotalWithdrawFee1": {
    "title": "提现手续费", "num": 0, "idx": 17, loading: false
  },
  "RechargeWithdra": {
    "title": "存提差", "num": 0,"tip": '充值总额 - 提现总额', "idx": 17, loading: false
  },
  "AverageRecharge": {
    "title": "平均首充金额", "num": 0,"tip": '首充总金额/首充人数', "idx": 17, loading: false
  },
  "TotalGiveMoney": {
    "title": "赠送彩金", "num": 0, "tip": '包含赠送彩金,会员等级彩金,推广奖金,活动优惠,免费转盘,任务奖励,周月礼金,内部代理,领取码,签到,PDD转盘,五福', "idx": 25, loading: false
  },
  "TotalArtificialReduction": {
    "title": "人工减少", "num": 0, "idx": 25, loading: false
  },
  "TotalArtificialIncrease": {
    "title": "人工增加", "num": 0, "idx": 25, loading: false
  },
  "BetPeople": {
    "title": "投注人数", "num": 0, "idx": 26, loading: false
  },
  "BetNumber": {
    "title": "投注笔数", "num": 0, "idx": 27, loading: false
  },
  "BetTotal": {
    "title": "投注总额", "num": 0, "idx": 28, loading: false
  },
  // "Rate": {
  //   "title": "付费率", "num": 0, "tip": '首充人数/注册人数', "idx": 17, loading: false
  // },
  "Profitloss": {
    "title": "损益", "num": 0,"tip": '投注总额-派彩总额', "idx": 17, loading: false
  },
  "Customerprice": {
    "title": "客单价", "num": 0,"tip": '当天首充总额/首充人数', "idx": 17, loading: false
  },
  "Killrate": {
    "title": "杀率", "num": 0,"tip": '损益/投注总额', "idx": 17, loading: false
  },
});

function tabClick({ index }) {
  selected.value = index;
}
const backTime = ref('');
const timeBack = (val) => {
  backTime.value = val && val.length == 2 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '';
}
const onlineuserTime = ref('');
hasAuth('dataView') && init();

async function init() {
  for (const key in list1) {
    const query = {
      date: backTime.value,
      key,
      search: true,
    };
    list1[key].loading = true;
    handleSearchResult(key, query);
  }
}

async function handleSearchResult(key, query){
  const res:any = await queryData(query);
  if (res.code == 1) {
    list1[key].num = res.data
    list1[key].tip = res.tips
    list1[key].loading = false
  }
}
const handleSerch = () => {
  init();
}

// getData();
//获取剩下得
async function getData() {
  const res:any = await getMatch();
  if (res.code == 1) {
    // tabList[1].list = res.data.cjl
    // tabList[1].num = res.data.cjl.length
    // tabList[2].list = res.data.timeUpdate
    // tabList[2].num = res.data.timeUpdate.length
    // tabList[3].list = res.data.finishgame
    // tabList[3].num = res.data.finishgame.length
    // tabList[4].list = res.data.cancelgame
    // tabList[4].num = res.data.cancelgame.length
  }
}


const handleBack = () => {
  getData();
}
const hanldeBackData = ({len,index}) => {
  tabList[index].num =len
}
</script>
<template>
  <div>
   <el-tabs v-if="hasAuth('dataView')" @tab-click="tabClick" type="border-card">
      <template v-for="(item, index) of tabList" :key="item.key">
        <el-tab-pane :lazy="true">
          <template #label>
            <div class="flex-c">
              <span>{{ $t(item.name) }}</span>
              <el-button v-if="item.num > 0" class="num" type="primary">{{ item.num }}</el-button>
            </div>
          </template>
          <component v-if="selected == index && index == 0" :list="list1" @search="handleSerch"  @select="timeBack" :time="item.time" :is="item.component" />
          <!-- <component v-if="selected == index && index != 0" :list="item.list" @back="handleBack" @backdata="hanldeBackData" :is="item.component" /> -->
        </el-tab-pane>
      </template>
    </el-tabs>
    <el-row v-else :gutter="24">
      <el-col
        :xs="24"
        :sm="24"
        style="margin-bottom: 20px"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 200
          }
        }"
      >
        <el-card style="height: 360px">
          <template #header>
            <span style="font-size: 16px; font-weight: 500">{{ $t('管理后台') }}</span>
          </template>
            {{ username }} {{ $t('欢迎您访问') }}
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
 .num{
    padding: 0 10px;
    font-size: 12px;
    text-align: center;
    height: 20px;
    color: #fff;
    border-radius: 2px;
    margin-left: 10px;
  }
</style>
