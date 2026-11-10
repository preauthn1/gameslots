<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import logo from "@/assets/logo/logo.png";
import logo_mini from "@/assets/logo/logo_mini.png";
import { useTranslationLang } from "../../hooks/useTranslationLang";
const { t } = useTranslationLang();
const props = defineProps({
  collapse: Boolean
});

const { title } = useNav();
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: props.collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="props.collapse"
        key="props.collapse"
        :title="title"
        class="sidebar-logo-link"
        to="/"
      >
        <!-- <FontIcon icon="team-iconlogo" svg style="width: 35px; height: 35px" /> -->
        <el-image style="height:50px;" :src="logo_mini" fit="contain" />
        <!-- <span class="sidebar-title">{{ title }}</span> -->
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        to="/"
      >
        <el-image style="width:110px;" :src="t('admin_logo')" fit="contain" >
          <template v-slot:error>
            <el-image style="height:50px;" :src="logo" fit="contain" />
          </template>
        </el-image>
        <!-- <FontIcon icon="team-iconlogo" svg style="width: 35px; height: 35px" /> -->
        <!-- <span class="sidebar-title">{{ title }}</span> -->
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 58px;
  text-align: center;
  overflow: hidden;

  .sidebar-logo-link {
    height: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-top: 5px;

    .sidebar-title {
      display: block;
      width: 160px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      color: #1890ff;
      font-weight: 600;
      font-size: 20px;
      margin-top: 10px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      padding-bottom:20px;
    }
  }

  .collapses {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>
