<template>
  <div class="turntable-wapper">
    <!-- <img src="@/assets/images/t-border.png" class="t-border"> -->
    <div class="border2"></div>
    <img src="@/assets/images/pdd-active.png" class="active-icon" v-show="isEnd">

    <div class="content" :style="`transform: rotate(${rotateDeg}deg)`" @transitionend="transitionend">
      <!-- 内容 -->
      <div class="list">
        <div class="list-item" v-for="item, index in list" :key="index"
          :style="`transform: translateX(-50%) rotate(${360 / list.length * index}deg);`">
          <FSvg name="xiaolian" v-if="item == 0" size="1.5em" />
          <template v-else>
            <span class="num" v-if="item == '?' || item == '?-bouns'">?</span>
            <span class="num" v-else>{{ item }}</span>
            <img src="@/assets/images/money-icon.png" v-if="item == '?'" class="money-icon">
            <img src="@/assets/images/jb-pdd.png" v-if="item == '?-bouns'" class="money-icon">
          </template>
        </div>
      </div>
    </div>
    <div class="btn" :class="{ 'btn-disabled': isRun }" @click="start">
      <img src="@/assets/images/turntable-btn-img.png">
      <div class="btn-text">
        <div v-if="!isEnd">
          <span class="num">{{ props.data?.remain_turntable_count || 0 }}</span>
          <!-- <span class="unit">{{ $t("次") }}</span> -->
        </div>
        <div class="btn-tip" v-if="!isEnd">{{ $t("抽奖") }}</div>
        <div v-if="isEnd" class="amount-box">
          {{ system?.data.monetary_type }}<count-up :end-val="amount" :decimalPlaces="2"
            @finished="finished"></count-up>
        </div>

      </div>

    </div>
    <div class="circular-box" v-for="item, index in circularNum" :key="index"
      :style="`transform: rotate(${360 / circularNum * index}deg);`">
      <div class="circular"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CountUp from "vue-countup-v3";
import type { Pdd_getData_api_type } from "~/types/pdd";
const system = useSystem();
const props = defineProps<{
  data: Pdd_getData_api_type | null;
}>();

const circularNum: number = 20;
const list = ["?", "?-bouns", 10, 100, 20, 1, 80, 0];
// 计算中间渐变别景色
const turnBgColor = (num: number): string => {
  const bgArr = [];
  for (let i = 0; i < num; i++) {
    bgArr.push(
      `${i % 2 == 0 ? `var(--color${(i % 3) + 1})` : `var(--color${(i % 3) + 1})`
      } ${(360 / num) * i}deg`
    );
    bgArr.push(
      `${i % 2 == 0 ? `var(--color${(i % 3) + 1})` : `var(--color${(i % 3) + 1})`
      } ${(360 / num) * (i + 1)}deg`
    );
  }
  return bgArr.join(",");
};

// 旋转的角度
const rotateDeg: Ref<number> = ref(0);

// 是否旋转
const isRun: Ref<boolean> = ref(false);

// 基础旋转圈数
const runNum: number = 18;

// 中奖金额
const amount = ref(0);

// 旋转
const run = (data: { key: string | number; amount: number }) => {
  amount.value = data.amount;
  const deg: number =
    (360 / list.length) * list.findIndex((item) => item == data.key);
  rotateDeg.value =
    runNum * 360 + (rotateDeg.value - (rotateDeg.value % 360)) - deg;
};

const isEnd = ref(false);

// 旋转结束
const transitionend = () => {
  isEnd.value = true;
  emit("end");
};
// 及时结束
const finished = () => {
  isRun.value = false;
  emit("finished");
};

// 点击按钮
const start = () => {
  isRun.value = true;
  isEnd.value = false;
  emit("start", run, stop);
};
// 结束抽奖
const stop = () => {
  isRun.value = false;
};
const emit = defineEmits(["end", "start", "finished"]);
defineExpose({ run, isRun });
</script>

<style scoped lang="less" src="@/assets/css/turntable.less"></style>