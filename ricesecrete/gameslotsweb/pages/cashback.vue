<template>
  <div>
    <NavBar :leftText="$t('现金返还') + ` ${Math.max(...data?.level_json.map(item => item.proportion))}%`">
      <template #right>
        <div class="nav-right-wapper">
          <img src="@/assets/images/user.png" class="user-icon">
          <span>{{ system?.data.monetary_type }}{{ $numInit(userInfo?.balance) }}</span>
        </div>
      </template>
    </NavBar>
    <div class="container">
      <div class="header-wapper">
        <div class="h-title-wapper">
          <img src="@/assets/images/money-icon.png" class="money-icon">
          <span class="h-title">{{ $t("现金返还") }} {{ data?.cashback.proportion }}%</span>
          <span class="h-subtitle">{{ $t("上限") }}:{{ Math.max(...data?.level_json.map(item => item.proportion))
            }}%</span>
          <img src="@/assets/images/lv-icon.png" class="lv-icon">
          <div class="lv-label">{{ data?.cashback.level_name }}</div>
        </div>
        <van-progress :percentage="(data?.cashback.now_water || 0) / (data?.cashback.next_water || 0) * 100 || 0"
          class="progress" :stroke-width="14" />
        <div class="h-desc">{{ $numInit((data?.cashback.next_water || 0) - (data?.cashback.now_water || 0)) }} {{
          $t("投注至")
        }}
          {{ data?.cashback.next_level_name }}
        </div>
      </div>
      <div class="desc-wapper">
        <div class="d-top-wapper">
          <div class="d-top-content">
            <div class="top-content-title">{{ $t("您的每周现金返还") }}</div>
            <div class="top-content-subtitle">{{ $t("你会赢") }} <span class="num">{{ $numInit(data?.jyj_price) }}</span>
              {{
                $t("本周现金返还巴西雷亚尔。") }} </div>
          </div>
          <img src="@/assets/images/box-img.png" class="box-img">
        </div>
        <div class="d-time-wapper">{{ $t("期间") }} {{ data?.t_apply_start_time }} - {{ data?.t_apply_end_time }}</div>
        <van-button class="full d-btn" size="small" @click="apply" :loading="btnLoading">{{ $t("现在宣称") }}</van-button>
        <div class="d-bottom-title">{{ $t("理赔时间") }}</div>
        <div class="d-bottom-time">{{ data?.return_start_time }} - {{ data?.return_end_time }}</div>
      </div>
      <div class="tabel-wapper">
        <div class="tabel-title">{{ $t("VIP 返现状态") }}</div>
        <div class="tabel">

          <div v-if="data?.rebate_type == 1">
            <div class="tabel-header" style="color:var(--text-color1)">
              <div class="tabel-col">{{ $t("阶段") }}</div>
              <div class="tabel-col">{{ $t("赌注") }}</div>
              <div class="tabel-col">{{ $t("返现") }}</div>
            </div>
            <div class="tabel-body" v-for="item, index in data?.reg_json" :key="index">
              <div class="tabel-col">{{ item.level_name }}</div>
              <div class="tabel-col">
                <span>{{ item.min_reg }} - {{ item.max_reg }}</span>
              </div>
              <div class="tabel-col">{{ item.bl_or_amount }}{{ item.type == 2 ? '%' : '' }}</div>
            </div>
          </div>
          <div v-else>
            <div class="tabel-header" style="color:var(--text-color1)">
              <div class="tabel-col">{{ $t("贵宾") }}</div>
              <div class="tabel-col">{{ $t("赌注") }}</div>
              <div class="tabel-col">{{ $t("返现") }}</div>
            </div>
            <div class="tabel-body" v-for="item, index in data?.level_json" :key="index">
              <div class="tabel-col">{{ item.level_name }}</div>
              <div class="tabel-col">{{ system?.data.monetary_type }}{{ $numInit(item.water) }}+ </div>
              <div class="tabel-col">{{ item.proportion }}%</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rule-title">{{ $t("条款和规则") }}</div>
      <div class="rule html" v-html="data?.c_detail"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { v2_action_jyjdetail_api, v2_action_apply_api } from "@/api_v2/action";
import type { V2_action_jyjdetail_api_type } from "~/types/action";
const system = useSystem();
const userInfo = useUserInfo();
const { $t } = useNuxtApp();
const data: Ref<V2_action_jyjdetail_api_type | null> = ref(null);
const getData = async () => {
  const res = await v2_action_jyjdetail_api();
  if (res?.code == 1) {
    data.value = res?.data;
  }
};
await getData();

// 领取
const btnLoading = ref(false);
const apply = async () => {
  if (!data.value?.id) return;
  btnLoading.value = true;
  const res = await v2_action_apply_api({ action_id: data.value.id });
  btnLoading.value = false;
  if (res?.code == 1) {
    showToast($t("领取成功"));
    getData();
    updateUserInfo();
  }
};
</script>

<style scoped lang="less" src="@/assets/css/cashback.less"></style>