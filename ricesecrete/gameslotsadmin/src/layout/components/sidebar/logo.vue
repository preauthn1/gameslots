<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
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
        :to="getTopMenu()?.path ?? '/'"
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
        :to="getTopMenu()?.path ?? '/'"
      >
        <el-image style="width:110px;" :src="t('admin_logo')" fit="contain" >
          <template v-slot:error>
            <el-image style="height:50px;" :src="logo" fit="contain" />
          </template>
        </el-image>
        <!-- <img src="/logo.svg" alt="logo" /> -->
        <!-- <span class="sidebar-title">{{ title }}</span> -->
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;

    img {
      display: inline-block;
      height: 32px;
    }

    .sidebar-title {
      display: inline-block;
      height: 32px;
      margin: 2px 0 0 12px;
      overflow: hidden;
      font-size: 18px;
      font-weight: 600;
      line-height: 32px;
      color: $subMenuActiveText;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
