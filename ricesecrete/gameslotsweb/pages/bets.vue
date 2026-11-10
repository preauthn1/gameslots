<template>
  <div>
    <NavBar left-text="" title="我的游戏投注"></NavBar>
    <div class="flex justify-around gap-1 px-1 mb-1 flex-wrap">
      <select v-model="sports" name="" @change="resetFeach"
        class="flex-1 w-full h-32px rounded-8px  text-#058536 border-white  px-1 py-0.5 ">
        <option v-for="item in searchTypeOptions" :key="item.value" :value="item.value">{{ $t(item.label) }}</option>
      </select>

      <select v-model="settlement" name="" @change="resetFeach"
        class="flex-1 w-full h-32px rounded-8px  text-#058536 border-white  px-1 py-0.5 ">
        <option v-for="item in stateOptions" :key="item.value" :value="item.value">{{ $t(item.label) }}</option>
      </select>

      <div @click="timepicker = !timepicker" type="text"
        class=" flex items-center justify-between w-full h-32px rounded-8px bg-white  text-#058536 border-solid border border-white px-1 py-0.5 ">
        <span> {{ searchDate || $t('今日') }}</span>

        <span v-if="searchDate" @click.stop="clearDate" class=" text-12px underline-#058536">{{ $t('清除')
          }}</span>
      </div>
      <van-calendar @confirm="confirmDate" :title="$t('日期选择')" :confirm-text="$t('确认')"
        :confirm-disabled-text="$t('确认')" v-model:show="timepicker" type="range" switch-mode="year-month"
        :formatter="formatter" @panel-change="panelChange">
        <template #subtitle>
          {{ calendarSubtitle }}
        </template>
      </van-calendar>


    </div>
    <FEmpty v-if="finished && gameList.length == 0" />
    <van-list v-else v-model:loading="loading" :finished="finished" :finished-text="$t('没有更多了')"
      :loading-text="$t('加载中...')" @load="onLoad">
      <div class="tabel">
        <div class="tabel-header">
          <div class="tabel-col">{{ $t("游戏名称") }}</div>
          <div class="tabel-col">{{ $t("输赢金额") }}</div>
          <div class="tabel-col">{{ $t("下注金额") }}</div>
          <div class="tabel-col">{{ $t("状态") }}</div>
          <div class="tabel-col">{{ $t("下注时间") }}</div>

        </div>
        <div class="tabel-body" v-for="item in gameList" :key="item.uid">
          <div class="tabel-col">{{ item.game_name }}</div>
          <div class="tabel-col">{{ item.gb_otherwin }}</div>
          <div class="tabel-col">{{ item.gb_price }}</div>
          <div class="tabel-col">{{ $t(systatus[item.gb_winlose]) }}</div>
          <div class="tabel-col">{{ item.gb_overtime }}</div>

        </div>
      </div>
    </van-list>
    <div class="total-content">
      <div class="flex gap-2 w-full">
        <div class="flex gap-3 w-50%">
          <div>{{ $t('累积投注值') }}</div>
          <div>{{ system?.data.monetary_type }}{{ ganeTatal.bet_amount }}</div>
        </div>
        <div class="flex gap-3 w-50%">
          <div>{{ $t('有效投注值') }}</div>
          <div>{{ system?.data.monetary_type }}{{ ganeTatal.valid_bet_amount }}</div>
        </div>
      </div>
      <div class="flex gap-2 w-full">
        <div class="flex gap-3">
          <div class="">{{ $t('总V/D') }}</div>
          <div class="text-red">{{ system?.data.monetary_type }}{{ ganeTatal.bet_win }}/{{ system?.data.monetary_type
            }}{{ ganeTatal.bet_lose }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { game_orderlist_api } from "@/api/my";
import { ref, onActivated } from "vue";
const { $t } = useNuxtApp();


import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';
Locale.use('en-US', enUS);


const system = useSystem();
const timepicker = ref(false)
const searchTypeOptions = [
  {
    value: 0,
    label: '所有'
  },
  {
    value: 1,
    label: '体育'
  },
  {
    value: 2,
    label: '三方游戏'
  }
]

const stateOptions = [
  {
    value: 0,
    label: '所有'
  },
  {
    value: 1,
    label: '已结算'
  },
  {
    value: 2,
    label: '未结算'
  }
]

const clearDate = () => {
  searchDate.value = ""
  searchDateParams.value = ""
  resetFeach()
}
const loading = ref(false);
const finished = ref(false);
const onLoad = async () => {
  if (!finished.value) {
    await fetchHistoryList();
    loading.value = false;
  };
}

const systatus = ['无效', '未结算', '输', '赢', '平']
const settlement = ref(0)
const sports = ref(0)
const searchDate = ref("")
const searchDateParams = ref("")
const formatDate = (date: any) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const confirmDate = (date: any) => {
  const [start, end] = date;
  timepicker.value = false
  searchDateParams.value = `${formatDate(start)}|${formatDate(end)}`
  searchDate.value = `${formatDate(start)} - ${formatDate(end)}`
  resetFeach()
}

const formatterDateSub = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getFullYear()}`
}
const calendarSubtitle = ref(formatterDateSub(new Date()))

const panelChange = (date: any) => {
  calendarSubtitle.value = formatterDateSub(date.date)
}

const pageNum = ref(1)
const resetFeach = () => {
  pageNum.value = 1
  finished.value = false;
  gameList.value = [];
  fetchHistoryList();
}
const ganeTatal = ref<any>([])
const gameList = ref<any>([])
const fetchHistoryList = async () => {
  let params = {
    page: pageNum.value,
    limit: 10,
    settlement: settlement.value,
    isday: sports.value ? 1 : 0,
    sports: sports.value,
    date: searchDateParams.value

  }
  const res: any = await game_orderlist_api(params)
  if (res?.code == 1) {
    if (res.data.length < 10) {
      finished.value = true;
    } else {
      pageNum.value++;
    }
    ganeTatal.value = res?.all_total;
    if (pageNum.value == 1) {
      gameList.value = res.data;
    } else {
      gameList.value = [...gameList.value, ...res.data];
    }
  }
}

const formatter = (day: any) => {
  const date = day.date.getDate();
  if (date === 11) {
    day.text = $t('今天');
  }
  if (day.type === 'start') {
    day.bottomInfo = $t('开始');
  } else if (day.type === 'end') {
    day.bottomInfo = $t('结束');
  }
  return day;
}

onActivated(() => {
  resetFeach()
})

</script>

<style scoped lang="less">
.tabel {
  margin-top: -10px;
  font-size: 12px;
}

.tabel .tabel-header {
  color: #fff !important;
}

.tabel .tabel-body {
  color: #fff;
}

.total-content {
  position: fixed;
  width: 100%;
  bottom: 0;
  background: #65d27e;
  padding: 5px 10px 10px;
  font-size: 12px;
}

:deep(.van-list__loading),
:deep(.van-list__finished-text),
:deep(.van-list__error-text) {
  margin-bottom: 50px !important;
}
</style>