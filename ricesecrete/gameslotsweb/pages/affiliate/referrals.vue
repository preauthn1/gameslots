<template>
  <div>
    <van-form>
      <f-van-field class="input" :readonly="true" @click="calendarIsShow = true" :placeholder="$t('选择日期')"
        :border="false" :clearable="true" v-model="date">
        <template #right-icon>
          <img src="@/assets/images/date-icon.png" alt="" class="date-icon">
        </template>
      </f-van-field>
    </van-form>
    <div class="tabel" v-if="true">
      <div class="tabel-header">
        <div class="tabel-col">{{ $t("账户") }}</div>
        <div class="tabel-col">{{ $t("赌注") }}(₱)</div>
        <div class="tabel-col">{{ $t("团队投注") }}(₱)</div>
        <div class="tabel-col">{{ $t("委员会") }}(₱)</div>
      </div>
      <div class="tabel-body" v-for="item, index in 5" :key="index">
        <div class="tabel-col">1</div>
        <div class="tabel-col">0+ PHP</div>
        <div class="tabel-col">13%</div>
        <div class="tabel-col">13%</div>
      </div>
    </div>
    <FEmpty v-else />
    <div class="bottom-list">
      <div class="list-item">
        <div class="num">₱0</div>
        <span class="itme-title">{{ $t("投注对球队有效") }}</span>
      </div>
      <div class="list-item">
        <div class="num">₱0</div>
        <span class="itme-title">{{ $t("委员会") }}</span>
      </div>
    </div>
    <van-calendar v-model:show="calendarIsShow" :min-date="new Date(2023, 1, 1)" :max-date="new Date()"
      @confirm="onConfirm" />
  </div>
</template>

<script setup lang="ts">
const calendarIsShow: Ref<boolean> = ref(false);
const date: Ref<string> = ref("");
const onConfirm = (e: string) => {
  calendarIsShow.value = false;
  date.value = e;
};
</script>

<style scoped lang="less" src="@/assets/css/referrals.less"></style>