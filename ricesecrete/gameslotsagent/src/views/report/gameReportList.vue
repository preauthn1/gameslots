<script setup lang="tsx">
import { reactive,ref } from "vue";
import { gameAgentReport } from "@/api/user";
import { message } from "@/utils/message";
import { timeCycle } from '@/utils/global'
import { forIn } from "lodash-unified";
defineOptions({
  name: 'orderlistManage'
})
const searchList = {
  date: {
    type: 'time',
    placeholder: '时间',
    value: (): Array<string> => {
      return []
    },
    prop: 'date'
  },
  // lebal: {
  //   type: 'select',
  //   placeholder: '用户标签',
  //   value: '',
  //   options: [
  //     {
  //       label: '一般用户',
  //       value: 1,
  //     }, {
  //       label: '测试用户',
  //       value: 2,
  //     },
  //   ],
  //   prop: 'lebal'
  // },
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
  date: '',
  // lebal:''
});


const tableData = reactive({
  recharge: {
    recharge_total_amount: 0,
    first_amount: 0,
    recharge_amount: 0,
    first_person_count: 0,
    recharge_person_count: 0,
    withdrawal_total_amount: 0,
    withdrawal_person_count: 0,
  },
  bet: {
    total_bet: 0,
    total_valid_bet: 0,
    total_count: 0,
    total_person_count: 0,
    total_bet_amount: 0,
    ks_amount: 0,
  },
  bonus: {
    bonus: 0,
    free_lottery_price: 0,
    action_apply: 0,
    promotional_rebates: 0,
    task_reward: 0,
    task_stage_reward: 0,
    level_reward: 0,
  }
})
//获取列表数据
init();
function init(query?: object) {
  gameAgentReport(pagination).then((res: any) => {
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
              {{ $t('充值提现(成功)') }}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('总充值') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.recharge_total_amount }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('首充金额') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.first_amount }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('复冲金额') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.recharge_amount }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('首充人数') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.first_person_count }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('复冲人数') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.recharge_person_count }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('提现金额') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.withdrawal_total_amount }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('提现人数') }}</div>
                  <div class="list-td-num">{{ tableData.recharge.withdrawal_person_count }}</div>
              </div>
          </div>
        </div>
        <div class="item">
          <div class="title-box flex-fi">
              {{$t('优惠金额')}}
          </div>
          <div class="list flex-fi">
              <div class="list-td">
                  <div class="list-td-name">{{ $t('赠送彩金（人工赠送+等级彩金）') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.bonus }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('转盘奖励') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.free_lottery_price }}</div>
              </div>
               <div class="list-td">
                  <div class="list-td-name">{{ $t('活动优惠') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.action_apply }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('推广奖励') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.promotional_rebates }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('任务奖励') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.task_reward }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('阶段任务奖励') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.task_stage_reward }}</div>
              </div>
              <div class="list-td">
                  <div class="list-td-name">{{ $t('VIP彩金') }}</div>
                  <div class="list-td-num">{{ tableData.bonus.level_reward }}</div>
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
  .list-td:nth-child(5n+5){
    margin-right: 0px;
  }
  }
}
</style>
