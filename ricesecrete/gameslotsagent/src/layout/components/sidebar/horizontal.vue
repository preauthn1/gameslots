<script setup lang="ts">
// @ts-ignore
import Search from "../search/index.vue";
// @ts-ignore
import Notice from "../notice/index.vue";
import { ref, watch, nextTick } from "vue";
// @ts-ignore
import SidebarItem from "./sidebarItem.vue";
import { useNav } from "@/layout/hooks/useNav";
import { useTranslationLang } from "../../hooks/useTranslationLang";
import { usePermissionStoreHook } from "@/store/modules/permission";
import globalization from "@/assets/svg/globalization.svg?component";
import logo from "@/assets/logo/logo.png";
const menuRef = ref();

const { t, route, locale, translation, locales } = useTranslationLang(menuRef);
const {
  title,
  routers,
  logout,
  backHome,
  onPanel,
  menuSelect,
  username,
  avatarsStyle,
  getDropdownItemStyle,
  getDropdownItemClass
} = useNav();

nextTick(() => {
  menuRef.value?.handleResize();
});

watch(
  () => route.path,
  () => {
    menuSelect(route.path, routers);
  }
);
</script>

<template>
  <div class="horizontal-header">
    <div class="horizontal-header-left" @click="backHome">
      <el-image style="width:100px;" :src="t('admin_logo')" fit="contain" >
        <template v-slot:error>
          <el-image style="height:50px;" :src="logo" fit="contain" />
        </template>
      </el-image>
      <!-- <FontIcon icon="team-iconlogo" svg style="width: 35px; height: 35px" />
      <h4>{{ title }}</h4> -->
    </div>
    <el-menu
      router
      ref="menuRef"
      mode="horizontal"
      class="horizontal-header-menu"
      :default-active="route.path"
      @select="indexPath => menuSelect(indexPath, routers)"
    >
      <sidebar-item
        v-for="route in usePermissionStoreHook().wholeMenus"
        :key="route.path"
        :item="route"
        :base-path="route.path"
      />
    </el-menu>
    <div class="horizontal-header-right">
      <!-- 菜单搜索 -->
      <!-- <Search /> -->
      <!-- 通知 -->
      <!-- <Notice id="header-notice" /> -->
      <!-- 国际化 -->
      <el-dropdown id="header-translation" trigger="click">
        <globalization
          class="navbar-bg-hover w-[40px] h-[48px] p-[11px] cursor-pointer outline-none"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              v-for="(item, index) in locales()" :key="index"
              :style="getDropdownItemStyle(locale, item.value)"
              :class="['dark:!text-white', getDropdownItemClass(locale, item.value)]"
              @click="translation(item.value)"
            >
              <IconifyIconOffline
                class="check-zh"
                v-show="locale === item.value"
                icon="check"
              />
              <el-image :src="item.icon" style="width:16px; margin-right: 6px;" />{{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover">
          <img
            src="@/assets/avatars.jpg"
            :style="avatarsStyle"
          />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline
                icon="logout-circle-r-line"
                style="margin: 5px"
              />
              {{ t("退出系统") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        :title="t('打开项目配置')"
        @click="onPanel"
      >
        <IconifyIconOffline icon="setting" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    min-width: 100%;
    display: inline-flex;
    flex-wrap: wrap;
  }
}
</style>
