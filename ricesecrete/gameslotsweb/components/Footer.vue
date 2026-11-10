<template>
  <div class="footer">
    <div class="nav-wapper">
      <div class="nav-item" v-for="item, index in menuList?.index_about" :key="index" @click="$openLink(item.href)">{{
        $t(item.name) }}</div>
    </div>
    <div class="icon-wapper">
      <img :src="item.icon_url" class="foot-icon" v-for="item, index in menuList?.index_help" :key="index"
        @click="$openLink(item.href, true)">
    </div>
    <div class="hlep-text">{{ $t("我可以帮你吗？") }}</div>
    <div class="desc-text">{{ $t("本站将为您解答所有问题。使用以下方法之一取得联系。") }}</div>
    <div class="icon-wapper2">
      <img :src="item.icon_url" class="foot-icon2" v-for="item, index in menuList?.index_icon" :key="index"
        @click="$openLink(item.href)">
    </div>
    <div class="nav-wapper2">
      <div class="nav-item2" v-for="item, index in menuList?.index_rule" :key="index" @click="$openLink(item.href)">{{
        $t(item.name) }}</div>
    </div>
    <div class="license-title"></div>
    <img src="@/assets/images/18+-icon.png" class="bottom-icon">
    <div class="license-desc">
      {{ $t("本站由本公司运营，公司注册号为 142919，注册地址为 Zuikertuintjeweg Z/N（Zuikertuin Tower）库拉索岛，并获得库拉索岛政府许可和授权。本站根据博彩服务提供商的主许可证运营，内华达州许可证号：") }}
      <span>{{ $t("GLH-OCCHKTW0705152022") }}</span>
    </div>
    <div class="license-desc2">
      <span>{{ $t("1.本产品仅供18岁以上用户使用，仅供娱乐用途。") }}</span>
      <span>{{ $t("2.本游戏包含应用内购买。") }}</span>
      <span>{{ $t("3. 玩家在社交博彩游戏中玩或获胜的事实并不意味着他将来会在真钱博彩及相关游戏中获胜。") }}</span>
    </div>
    <div class="back-top" @click="backTop">
      <FSvg name="backTop" />
      <div>Top</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const backTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const menuList = useMenuList();
</script>

<style scoped lang="less" src="@/assets/css/footer.less"></style>