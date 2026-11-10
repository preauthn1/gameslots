<template>
  <van-popup v-model:show="isShow" round :closeable="true" style="background: transparent;">
    <div class="wapper" v-if="step == 0">
      <img class="pdd_bg" src="https://slotsdny.s3.dualstack.ap-southeast-1.amazonaws.com/storage/images/pdd_bg.png"
        alt="">
      <div class="pdd_turntable">
        <Turntable @start="start" @finished="finished" :data="data" />
      </div>

      <div class="title-wapper">
        <img src="@/assets/images/money-icon.png" class="money-icon">
        <span>{{ $t(data?.title) }}</span>
      </div>

      <div class="pdd_tips_wrap">
        <div class="bottom-tip">{{ $t("免费旋转赚取真金白银") }}</div>
      </div>

      <img class="tiger_img" src="@/assets/images/pdd_tiger_img.png" alt="">
      <img class="rabbit_img" src="@/assets/images/pdd_rabbit_img.png" alt="">
    </div>
    <PddSuccess v-else :data="data" />

  </van-popup>
</template>

<script setup lang="ts">
import { pdd_getData_api, pdd_turntable_api } from "@/api/pdd";
import type { Pdd_getData_api_type } from "~/types/pdd";
const loginStatus = useLoginStatus();
const { $bus } = useNuxtApp();
const $router = useRouter();
const $route = useRoute();
const isShow: Ref<boolean> = ref(false);
const show = (isTestPddPage?: boolean) => {
  if (process.client) {
    if (
      data.value?.awarded_amount &&
      data.value.awarded_amount > 0 &&
      isTestPddPage
    ) {
      $router.push("/pdd");
    } else {
      isShow.value = true;
    }
  }

};

// 获取数据
const data: Ref<Pdd_getData_api_type | null> = ref(null);
const getData = async () => {
  const res = await pdd_getData_api();
  if (res?.code == 1) {
    data.value = res.data;
  }
};

//转盘相关
const step = ref(0);
const start = async (
  // eslint-disable-next-line no-unused-vars
  run: (data: { key: string | number; amount: number }) => void,
  stop: () => void
) => {
  // 验证登录
  if (!loginStatus.value) {
    $router.push("/login");
    stop();
    return;
  }
  // 验证数据
  if (!data.value) return;

  // 验证金额 金额大与0跳转pdd详情页
  if (data.value.awarded_amount > 0) {
    stop();
    $router.push("/pdd");
    isShow.value = false;
    return;
  }
  // 请求接口
  const res = await pdd_turntable_api({ id: data.value.id });
  if (res?.code == 1) {
    if (data.value.remain_turntable_count) {
      data.value.awarded_amount = res.data.amount;
      data.value.remain_turntable_count--;
      if (res.data.amount > 0) {
        run({
          key: res.data.type == 1 ? "?" : "?-bouns",
          amount: res.data.amount,
        });
      } else {
        run({
          key: 0,
          amount: res.data.amount,
        });
      }
    }
  }
};

const finished = () => {
  step.value++;
};

// 监听登录 获取数据 , 未登录展示一次后不在展示
watch(
  loginStatus,
  async (v) => {
    await getData();

    // 在客户端操作
    if (process.server) return;
    // 判断是否在首页
    if ($route.path != "/") return;
    // 判断是否有次数
    if (!data.value?.remain_turntable_count) {
      isShow.value = false;
      return;
    }
    // 判断是登录，登录有次数就一直提示
    if (v) {
      show();
      return;
    }
    // 判断是否登录，未登录只有首次提示
    if (!v) {
      show();
      // const pddFirstShow = localStorage.getItem("pddFirstShow");
      // if (!pddFirstShow) {
      //   show();
      //   if (!v) {
      //     localStorage.setItem("pddFirstShow", "true");
      //   }
      // }
    }
  },
  { immediate: true }
);

// 监听路由，离开首页隐藏
watch(
  () => $route.path,
  (v) => {
    if (v != "/") isShow.value = false;
  }
);

onMounted(() => {
  $bus.on("pddShow", () => {
    show(true);
  });
});
onUnmounted(() => {
  $bus.off("pddShow");
});
</script>

<style scoped lang="less" src="@/assets/css/PddPop.less"></style>