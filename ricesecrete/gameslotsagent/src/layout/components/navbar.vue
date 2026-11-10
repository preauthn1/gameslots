<script setup lang="ts">
// @ts-ignore
import Search from "./search/index.vue";
// @ts-ignore
import Notice from "./notice/index.vue";
// @ts-ignore
import mixNav from "./sidebar/mixNav.vue";
import { useNav } from "@/layout/hooks/useNav";
// @ts-ignore
import Breadcrumb from "./sidebar/breadCrumb.vue";
// @ts-ignore
import topCollapse from "./sidebar/topCollapse.vue";
import { useTranslationLang } from "../hooks/useTranslationLang";
import globalization from "@/assets/svg/globalization.svg?component";

const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  avatarsStyle,
  toggleSideBar,
  getDropdownItemStyle,
  getDropdownItemClass
} = useNav();

const { t, locale, translation, locales } = useTranslationLang();

</script>

<template>
  <div
    class="navbar bg-[#fff] shadow-sm shadow-[rgba(0, 21, 41, 0.08)] dark:shadow-[#0d0d0d]"
  >
    <topCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <Breadcrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <mixNav v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
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
              {{ t("安全退出") }}
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
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    line-height: 48px;
    height: 100%;
    float: left;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    min-width: 280px;
    height: 48px;
    align-items: center;
    color: #000000d9;
    justify-content: flex-end;

    .el-dropdown-link {
      height: 48px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      color: #000000d9;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

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
/*定义一个名字叫robotAnimate的动画，实现心形图的放大以及旋转效果*/
@keyframes robotAnimate{
    0%,100%{transform:scale(1) rotate(0);}                       /*0%,100%时保持图形的原大小且不旋转*/
    10%,30%{transform: scale(0.9) rotate(3deg);}                  /*10%,30%时图形缩小成0.9倍，并且顺时针旋转3度*/
    20%,40%,60%,80%{transform:scale(1.1) rotate(-3deg);}         /*20%,40%,60%,80%时图形扩大成1.1倍，并且逆时针旋转3度*/
    50%,70%{ transform:scale(1.1) rotate(3deg);}                 /*50%,70%时图形扩大成1.1倍，并且顺时针旋转3度*/
}
@-webkit-keyframes robotAnimate{
    0%,100%{-webkit-transform: scale(1) rotate(0);}
    10%,30%{-webkit-transform:scale(0.9) rotate(3deg);}
    20%,40%,60%,80%{-webkit-transform: scale(1.1) rotate(-3deg);}
    50%,70%{-webkit-transform: scale(1.1) rotate(3deg);}
}
@-moz-keyframes robotAnimate{
    0%,100%{-moz-transform:scale(1) rotate(0);}
    10%,30%{-moz-transform: scale(0.9) rotate(3deg);}
    20%,40%,60%,80%{-moz-transform:scale(1.1) rotate(-3deg);}
    50%,70%{ -moz-transform:scale(1.1) rotate(3deg);}
}
@-o-keyframes robotAnimate{
    0%,100%{-o-transform:scale(1) rotate(0);}
    10%,30%{-o-transform: scale(0.9) rotate(3deg);}
    20%,40%,60%,80%{-o-transform:scale(1.1) rotate(-3deg);}
    50%,70%{ -o-transform:scale(1.1) rotate(3deg);}
}
@-ms-keyframes robotAnimate{
    0%,100%{-ms-transform:scale(1) rotate(0);}
    10%,30%{-ms-transform: scale(0.9) rotate(3deg);}
    20%,40%,60%,80%{-ms-transform:scale(1.1) rotate(-3deg);}
    50%,70%{ -ms-transform:scale(1.1) rotate(3deg);}
}
.robot{
    -webkit-animation: robotAnimate 1s ease infinite;    /*调用名称为robotAnimate的动画，全程1s，速度曲线是ease，无限循环播放*/
    -moz-animation: robotAnimate 1s ease infinite;
    -o-animation: robotAnimate 1s ease infinite;
    -ms-animation: robotAnimate 1s ease infinite;
    animation: robotAnimate 1s ease infinite;
}
</style>
