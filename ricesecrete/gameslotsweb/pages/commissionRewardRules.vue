<template>
  <div>
    <NavBar left-text="佣金奖励规则"></NavBar>
    <div class="container">
      <div class="tabel">
        <div class="tabel-header">
          <div class="tabel-col">{{ $t("代理级别") }}</div>
          <div class="tabel-col">{{ $t("有效投注") }}</div>
          <div class="tabel-col">{{ $t("委员会") }}</div>
        </div>
        <div class="tabel-body" v-for="item,index in 6" :key="index">
          <div class="tabel-col">1</div>
          <div class="tabel-col">0{{ $t("万") }}+</div>
          <div class="tabel-col">
            <span style="color:var(--text-color8)">160</span>/{{ $t("万") }}
          </div>
        </div>
      </div>
      <div class="tip">{{ $t("有效投注取决于不同的游戏") }}</div>
      <div class="card card1">
        <van-icon name="warning" class="warning-icon" />
        <span>{{ $t("崩溃类型和虚拟游戏将不被视为有效投注") }}</span>
      </div>
      <div class="card">
        <div class="num-wapper">
          <span class="card-num">100%</span>
          <span>{{ $t("的投注") }}</span>
        </div>
        <div>
          <span style="color:var(--text-color6)">{{ $t("游戏") }}:</span>
          <span>{{ $t("真人娱乐场、第三方") }}</span>
        </div>
      </div>
      <div class="card">
        <div class="num-wapper">
          <span class="card-num">100%</span>
          <span>{{ $t("的投注") }}</span>
        </div>
        <div>
          <span style="color:var(--text-color6)">{{ $t("游戏") }}:</span>
          <span>{{ $t("其他原创游戏") }}</span>
        </div>
      </div>
      <div class="card card3" @click="$router.push('/commissionCalculationRules')">
        <span>{{ $t("佣金计算规则") }}</span>
        <van-icon name="arrow" />
      </div>
      <div class="tip">{{ $t("佣金可以随时提取到我们的仪表板钱包中。") }}</div>
      <div class="tip">{{ $t("系统每3分钟计算一次佣金。") }}</div>
      <div class="tip">{{ $t("每日最高佣金：10000 BRL") }}</div>
      <div class="tip">{{ $t("同一IP或设备不会计入佣金，故意的营业额膨胀也不会计入佣金。") }}</div>

    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="less" src="@/assets/css/commissionRewardRules.less"></style>