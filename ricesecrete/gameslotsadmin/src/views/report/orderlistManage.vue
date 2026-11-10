<script setup lang="tsx">
import { reactive,ref } from "vue";
import { chartCaiWulist } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { forIn } from "lodash-unified";
defineOptions({
  name: 'orderlistManage'
})
const searchList = {
  username: {
    type: 'input',
    placeholder: '代理账号用户名称',
    value: '',
    prop: 'username'
  },
  date: {
    type: 'time',
    placeholder: '时间',
    value: (): Array<string> => {
      return []
    },
    prop: 'date'
  },
  lebal: {
    type: 'select',
    placeholder: '用户标签',
    value: '',
    options: [
      {
        label: '一般用户',
        value: 1,
      }, {
        label: '测试用户',
        value: 2,
      },
    ],
    prop: 'lebal'
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
  username: '',
  date: '',
  lebal:''
});


const tableData = reactive({
  cz: {
    off_agent_money: 0,
    off_agent_num: 0,
    off_bank_money: 0,
    off_bank_num: 0,
    off_pix_money: 0,
    off_pix_num: 0,
    off_usdt_money: 0,
    off_usdt_num: 0,
    off_wallet_money: 0,
    off_wallet_num: 0,
    on_bank_money: 0,
    on_bank_num: 0,
    on_usdt_money: 0,
    on_usdt_num: 0,
    on_wallet_num:0
  },
  tx: {
    bank_money: 0,
    bank_num: 0,
    bank_poundage: 0,
    pix_money: 0,
    pix_num: 0,
    pix_poundage: 0,
    usdt_money: 0,
    usdt_num: 0,
    usdt_poundage: 0,
    wallet_money: 0,
    wallet_num: 0,
    wallet_poundage: 0,
  },
  c_to_t: {
    cz_num: 0,
    cz_price: 0,
    cz_people: 0,
    cz_succ: 0,
    tx_num: 0,
    tx_price: 0,
    tx_people: 0,
    tx_succ: 0
  },
  add: {
    active_num: 0,
    sc_money: 0,
    sc_num: 0,
    zc_num: 0,
    cz_money: 0,
    fc_money: 0,
    fc_num: 0,
    agent_reward: 0,
  },
  artificial: {
    add: 0,
    del: 0,
    giving: 0,

  },
  activity: {
    TaskRecor_price: 0,
    TaskRecor_integral: 0,
    TaskStageRecor_price: 0,
    TaskStageRecor_integral: 0,
    userLevel_week_price: 0,
    userLevel_the_price: 0,
    agentSell_price: 0,
    lottery_price: 0,
    thirdBack_price: 0,
    action_register_price: 0,
    action_restorage_price: 0,
    action_same_price: 0,
    action_game_price: 0,
    action_invite_reward: 0,
    action_invite_num: 0,
    vip_price: 0,
    sign_price: 0,
    action_register_num: 0,
    action_restorage_num: 0,
    action_same_num: 0,
    action_game_num: 0,
    pdd_price: 0,
    receive_code_price: 0,
    wufu_price: 0,
  },
  count: {
    no_settlement: 0,
    paragraph: 0,
    poundage: 0,
    profit_and_loss: 0,
    tx_all: 0,
    tz_money: 0,
    toale_TaskRecor_price: 0,
    toale_action_price: 0,

  },
  bet: {
    total_bet: 0,
    total_valid_bet: 0,
    total_count: 0,
    total_person_count: 0,
    total_bet_amount: 0,
    ks_amount: 0,
  },
})
//获取列表数据
init();
function init(query?: object) {
  chartCaiWulist({ info: pagination }).then((res: any) => {
    Object.assign(tableData, res.data)
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
    //搜索列表 有日期的写法

  for (const key in pagination) {
    if (key == searchList[key]?.prop) {
      if (key == 'date') {
        const val = searchList[key].value;
        const time = val && val.length > 0 ? val[0] + ' - ' + val[1] : '';
        pagination[key] =  time;
      } else {
        pagination[key] = searchList[key].value
      }
    }
  }
    pagination.page = 1;
    init(pagination);
}

</script>

<template>
  <div>
    <!-- <userSelected :list="searchListBox.searchList" @selectChange="selectChange" @handleBtn="handleBtn" @handleInput="handleInput" @selectDateChange="selectDateChange"></userSelected> -->
    <commSerach @search="handleBtn" @currentChange="handleCurrentChange"  :list="searchListBox.searchList"/>
    <div class="mian">
        <div class="item">
          <div class="title-box flex-fi">
            {{ $t('充值类型(成功)') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线下银行卡（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_bank_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线上银行卡渠道（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.on_bank_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线上USDT（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_usdt_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线下电子钱包（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_wallet_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线上电子钱包（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.on_wallet_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('PIX（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_pix_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('银商（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_agent_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线下银行卡（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_bank_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线上银行卡渠道（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.on_bank_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线上USDT（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.on_usdt_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线下USDT（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_usdt_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('线下电子钱包（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_wallet_money }}</div>
              </div>
               <div class="list-td">
                  <div class="list-td-name">{{ $t('PIX（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_pix_money }}</div>
              </div>
               <div class="list-td">
                  <div class="list-td-name">{{ $t('银商（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.cz.off_agent_money }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
            {{ $t('投注相关') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('总投注') }}</div>
                  <div class="list-td-num">{{ tableData.bet.total_bet }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('有效投注') }}</div>
                  <div class="list-td-num">{{ tableData.bet.total_valid_bet }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('投注笔数') }}</div>
                  <div class="list-td-num">{{ tableData.bet.total_count }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('投注人数') }}</div>
                  <div class="list-td-num">{{ tableData.bet.total_person_count }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('派彩金额') }}</div>
                  <div class="list-td-num">{{ tableData.bet.total_bet_amount }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('客损') }}</div>
                  <div class="list-td-num">{{ tableData.bet.ks_amount }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
              {{ $t('提现类型(成功)') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('银行卡（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.bank_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('USDT（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.usdt_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('电子钱包（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.wallet_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('PIX（笔数）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.pix_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('银行卡（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.bank_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('USDT（金额）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.usdt_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('PIX（金额') }}</div>
                  <div class="list-td-num">{{ tableData.tx.pix_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('银行卡（手续费）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.bank_poundage }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('USDT（手续费）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.usdt_poundage }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('电子钱包（手续费）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.wallet_poundage }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('PIX（手续费）') }}</div>
                  <div class="list-td-num">{{ tableData.tx.pix_poundage }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
              {{$t('充提统计')}}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('充值总笔数') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.cz_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('充值总金额') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.cz_price }}</div>
              </div>
               <div class="list-td">
                  <div class="list-td-name">{{ $t('充值人数(成功)') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.cz_people }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('充值笔数(成功)') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.cz_succ }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('提现总笔数') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.tx_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('提现总金额') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.tx_price }}</div>
              </div>
               <div class="list-td">
                  <div class="list-td-name">{{ $t('提现人数(成功)') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.tx_people }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('提现笔数(成功)') }}</div>
                  <div class="list-td-num">{{ tableData.c_to_t.tx_succ }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
              {{ $t('新增统计') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('充值金额') }}</div>
                  <div class="list-td-num">{{ tableData.add.cz_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('首充金额') }}</div>
                  <div class="list-td-num">{{ tableData.add.sc_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('首充人数') }}</div>
                  <div class="list-td-num">{{ tableData.add.sc_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('复充金额') }}</div>
                  <div class="list-td-num">{{ tableData.add.fc_money }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('复充人数') }}</div>
                  <div class="list-td-num">{{ tableData.add.fc_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('注册人数') }}</div>
                  <div class="list-td-num">{{ tableData.add.zc_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('活跃人数') }}</div>
                  <div class="list-td-num">{{ tableData.add.active_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('外部代理返佣') }}</div>
                  <div class="list-td-num">{{ tableData.add.agent_reward }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
              {{ $t('人工操作(金额)') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('人工增加') }}</div>
                  <div class="list-td-num">{{ tableData.artificial.add }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('人工减少') }} </div>
                  <div class="list-td-num">{{ tableData.artificial.del }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('赠送彩金') }}</div>
                  <div class="list-td-num">{{ tableData.artificial.giving }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
              {{ $t('活动统计') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('任务领取金额') }}</div>
                  <div class="list-td-num">{{ tableData.activity.TaskRecor_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('任务领取积分') }}</div>
                  <div class="list-td-num">{{ tableData.activity.TaskRecor_integral }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('阶段任务领取金额') }}</div>
                  <div class="list-td-num">{{ tableData.activity.TaskStageRecor_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('阶段任务领取积分') }}</div>
                  <div class="list-td-num">{{ tableData.activity.TaskStageRecor_integral }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('等级奖励(周)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.userLevel_week_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('等级奖励(月)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.userLevel_the_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('推广奖励') }}</div>
                  <div class="list-td-num">{{ tableData.activity.agentSell_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('转盘金额(免费)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.lottery_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('游戏返水') }}</div>
                  <div class="list-td-num">{{ tableData.activity.thirdBack_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(注册首存)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_register_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(注册首存人数)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_register_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(再存优惠)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_restorage_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(再存优惠人数)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_restorage_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(一般优惠)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_same_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(一般优惠人数)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_same_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(游戏救援金)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_game_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(游戏救援金人数)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_game_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(推荐奖励)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_invite_reward }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动(推荐奖励人数)') }}</div>
                  <div class="list-td-num">{{ tableData.activity.action_invite_num }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('VIP彩金') }}</div>
                  <div class="list-td-num">{{ tableData.activity.vip_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('签到金额') }}</div>
                  <div class="list-td-num">{{ tableData.activity.sign_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('PDD奖励') }}</div>
                  <div class="list-td-num">{{ tableData.activity.pdd_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('领取码奖励') }}</div>
                  <div class="list-td-num">{{ tableData.activity.receive_code_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('五福奖励') }}</div>
                  <div class="list-td-num">{{ tableData.activity.wufu_price }}</div>
              </div>
          </div>
        </div>
         <div class="item">
          <div class="title-box flex-fi">{{ $t('总计') }}</div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('提现总额') }}</div>
                  <div class="list-td-num">{{ tableData.count.tx_all }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('实际出款') }}</div>
                  <div class="list-td-num">{{ tableData.count.paragraph }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('等级奖励') }}</div>
                  <div class="list-td-num">{{ tableData.count.toale_TaskRecor_price }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('优惠活动') }}</div>
                  <div class="list-td-num">{{ tableData.count.toale_action_price }}</div>
              </div>
          </div>
        </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.btmNav{
  padding-top:10px;
}
.mian{

  .item{
     background-color: #fff;
    border-radius: 5px;
    margin-bottom: 20px;
  }
  .title-box{
    height: 42px;
    line-height: 42px;
    padding: 0 15px;
    border-bottom: 1px solid #f6f6f6;
    color: #333;
    font-size: 16px;
  }
  .list{
    flex-wrap: wrap;
    padding:20px;
    .list-td{
      width:215px;
      height: 80px;
      border-radius: 3px;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      font-size: 20px;
      padding: 10px 15px;
      background-color: #f8f8f8;
      margin-right: 10px;
      margin-bottom: 20px;
          .list-td-name{
          color: #999;
          font-size: 15px;
          text-align: center;
        }
        .list-td-num{
          color:var(--el-color-primary);
          text-align: center;
          font-size: 28px;
        }
    }
  // .list-td:nth-child(5n+5){
  //   margin-right: 0px;
  // }
  }
}
</style>
