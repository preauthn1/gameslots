<template>
  <div>
    <NavBar :left-text="data?.calculate_title"></NavBar>
    <div class="container">
      <div class="html" v-html="data?.calculate_text"></div>
      <!-- <div class="top-wapper">
        <div class="top-title">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label">A</div>
          </div>
          <div>{{ $t("C3 功能强大，还具有") }}<span class="num">110</span>/{{ $t("万") }}</div>
        </div>
        <div class="top-desc">
          <div>{{ $t("总业绩331万，总代理奖金") }} <span class="num">2500</span> </div>
          <div>{{ $t("下属绩效180K，贡献") }} <span class="num">1980</span> </div>
          <div>{{ $t("其他表现313M，贡献") }} <span class="num">520</span> </div>
        </div>
      </div>
      <div class="line-box1">
        <img src="@/assets/images/line1.png" class="line-img1">
        <div class="txt1">
          {{ $t("B1的贡献") }}<span class="num">1320</span>
        </div>
        <div class="txt2">
          {{ $t("C1和C2的贡献") }}<span class="num">520</span>
        </div>
        <div class="txt3">
          {{ $t("B3的贡献") }}<span class="num">220</span>
        </div>
        <div class="txt4">
          {{ $t("c3的其他贡献") }}<span class="num">0</span>
        </div>
        <div class="txt5">
          {{ $t("贡献A") }}:<span class="num">0</span>
        </div>
      </div>
      <div class="user-list">
        <div class="user-wapper">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label avatar-label2">B1</div>
          </div>
          <div class="user-desc">
            <div>{{ $t("子代理的收入，通常是") }}<span class="num">70</span>/10K</div>
          </div>
          <div class="user-bottom">
            <span>{{ $t("有效投注") }}120K</span>
          </div>
        </div>
        <div class="user-wapper">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label avatar-label2">B2</div>
          </div>
          <div class="user-desc">
            <div>{{ $t("B2没有下属，所以没有利润") }}</div>
          </div>
          <div class="user-bottom">
            <span>{{ $t("有效投注") }}40K</span>
          </div>
        </div>
        <div class="user-wapper">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label avatar-label2">B3</div>
          </div>
          <div class="user-desc">
            <div>{{ $t("非常好的副代理，赢了") }}<span class="num">110</span>/10K</div>
          </div>
          <div class="user-bottom">
            <span>{{ $t("有效投注") }}20K</span>
          </div>
        </div>
      </div>
      <img src="@/assets/images/line2.png" class="line2">
      <div class="user-text-list">
        <div class="user-text-item">
          {{$t("为 A 做出贡献")}}: <br> <span class="num">400</span> <br>
          {{$t("为 B1 做出贡献")}}: <br> <span class="num">700</span>
        </div>
        <div class="user-text-item">
          {{$t("为 A 做出贡献")}}: <br> <span class="num">120</span> <br>
          {{$t("为 B1 做出贡献")}}: <br> <span class="num">210</span>
        </div>
        <div class="user-text-item">
          {{$t("为 A 做出贡献")}}: <br> <span class="num">0</span> <br>
          {{$t("为 B3 做出贡献")}}: <br> <span class="num">33000</span>
        </div>
      </div>
      <div class="user-list">
        <div class="user-wapper">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label avatar-label3">C1</div>
          </div>
          <div class="user-desc">
            <div>{{ $t("C1没有下属，所以没有利润") }}</div>
          </div>
          <div class="user-bottom">
            <span>{{ $t("有效投注") }}100K</span>
          </div>
        </div>
        <div class="user-wapper">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label avatar-label3">C2</div>
          </div>
          <div class="user-desc">
            <div>{{ $t("C2没有下属，所以没有利润") }}</div>
          </div>
          <div class="user-bottom">
            <span>{{ $t("有效投注") }}30K</span>
          </div>
        </div>
        <div class="user-wapper">
          <div class="avatar-wapper">
            <img src="@/assets/images/avatar1.png" class="avatar">
            <div class="avatar-label avatar-label3">C3</div>
          </div>
          <div class="user-desc">
            <div>{{ $t("C3没有下属，所以没有利润") }}</div>
          </div>
          <div class="user-bottom">
            <span>{{ $t("有效投注") }}3000K</span>
          </div>
        </div>
      </div>
      <div class="rule html">
        {{ $t("例如") }} <br>
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
        例如，如果投注额为10-200000，则相应的奖金率为70/10000，如果投注额大于3000000，则代理奖金为110/10000。
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { v2_affiliate_course_api } from "~/api_v2/affiliate";
import type { V2_affiliate_course_api_type } from "~/types/affiliate";
const data: Ref<V2_affiliate_course_api_type | null> = ref(null);
const getData = async () => {
  const res = await v2_affiliate_course_api();
  if (res?.code == 1) {
    data.value = res.data;
  }
};
await getData();
</script>
<style scoped lang="less" src="@/assets/css/commissionCalculationRules.less"></style>