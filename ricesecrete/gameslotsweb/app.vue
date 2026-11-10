<template>
  <div id="app" :class="lang.locale?.value">

    <ClientOnly>
      <WindowBg />
      <GamePop />
      <ChangeLang />
    </ClientOnly>
    <PddPop />

    <van-overlay :show="isFullLoading" class="center">
      <van-loading vertical>
        <template #icon>
          <van-icon name="star-o" size="30" />
        </template>
      </van-loading>
    </van-overlay>

    <NuxtLoadingIndicator color="var(--text-color5)" />
    <NuxtPage id="app-page" :keepalive="{ max: 10 }"></NuxtPage>
    <Tabbar />
    <CookiePop />

  </div>
</template>


<script setup lang="ts">
import "@/assets/css/base.less";
import "@/assets/css/theme.less";
import lang from "@/utils/lang";
import { ref } from "vue";
import { systemInfoNewApi } from "@/api";
import { v2_index_menu_list_api, v2_system_info_api } from "@/api_v2";

const nuxtApp = useNuxtApp()

// 是否加载
const isFullLoading = ref(true)

nuxtApp.hook("page:start", () => {
  isFullLoading.value = true
})

nuxtApp.hook("page:finish", () => {
  isFullLoading.value = false
})

const system = useSystem();
const loginStatus = useLoginStatus();
const menuList = useMenuList();
// const Rollout = isRollout()
const $route = useRoute();
const isShow = ref(false)


// 获取系统配置
const getSystemInfo = async () => {
  const [res, systemInfoRes] = await Promise.all([
    v2_system_info_api(),
    systemInfoNewApi(),
  ]);

  if (res?.code == 1 && systemInfoRes?.code == 1) {
    res.data = { ...res.data, ...systemInfoRes.site };
    for (const key in res.lang) {
      res.lang[key] = { ...res.lang[key], ...systemInfoRes.lang[key] };
    }
    system.value = { ...systemInfoRes, ...res };
    if (localStorage.getItem("locale") == null) {
      localStorage.setItem("locale", system.value.locale ?? "PHP");

    }
  }
};

// 获取菜单配置相关
const getMenuLst = async () => {
  const res = await v2_index_menu_list_api();
  if (res?.code == 1) {
    menuList.value = res.data;
  }
};

await getSystemInfo();
// 初始化多语言
system.value && lang.init(system.value);

// 获取菜单配置
getMenuLst();

// 初始化head 标签内容 关键字内容等可以使用翻译进行多语言翻译，seo使用默认语言
useHead({
  title: system.value?.site.website_name || system.value?.data.web_name,
  link: [
    {
      rel: "manifest",
      href: "/manifest.json",
    },
    {
      rel: "icon",
      href: system.value?.site.website_favicon || system.value?.data.favicon,
    },
    {
      rel: "apple-touch-icon-precomposed",
      href: system.value?.site.website_desktop_logo,
    },
    {
      rel: "apple-touch-icon",
      href: system.value?.site.website_desktop_logo,
    },
  ],
  meta: [
    { name: "description", content: system.value?.data.seo_intro },
    {
      name: "keywords",
      content: system.value?.data.seo_keyword,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "og:type", content: "website" },
    { name: "og:url", content: system.value?.data.web_url },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, Maximum-scale=1, user-scalable=0",
    },
  ],
  script: [{ src: "/pwa.js" }],
});

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let timeId: NodeJS.Timeout | null = null;
// 监听登录 获取用户信息
watch(
  loginStatus,
  async (v) => {
    if (v) {
      // 更新用户信息
      await updateUserInfo();
      isShow.value = true;
      if (process.client) {
        timeId = setInterval(() => {
          updateUserInfo();
        }, 5000);
      }
    } else {
      timeId && clearInterval(timeId);
    }
  },
  { immediate: true }
);

const setDeviceAttribute = () => {
  const isDesktop = window.innerWidth >= 450;
  const htmlElement = document.documentElement;
  if (!isDesktop) {
    htmlElement.removeAttribute("data-device-nodesktop");
  } else {
    htmlElement.setAttribute("data-device-nodesktop", "1");
  }
}

watch(
  () => $route.query,
  (newVal) => {
    if (newVal.share_code) {
      console.log(newVal.share_code, '1222111');
      localStorage.setItem("share_code", newVal.share_code as string);
    }
  },
  { deep: true }
);

onMounted(async () => {
  // 设置邀请码
  const shareCode = $route.query.share_code;
  const acid = $route.query.acid;
  if (shareCode) {
    console.log(shareCode, 'Initial share_code');
    localStorage.setItem("share_code", shareCode as string);
  }
  if (acid) {
    console.log(acid, 'Initial acid');
    localStorage.setItem("acid", acid as string);
  }

  const loadingOverlay: any = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    // 隐藏 loading-overlay
    loadingOverlay.style.display = 'none';
  }
  const locale = ref(localStorage.getItem('locale'));//useCookie("locale");
  locale.value = locale.value || system.value?.locale || null;
  setDeviceAttribute()
  window.addEventListener("resize", setDeviceAttribute);
});

onBeforeMount(() => {
  window.removeEventListener("resize", setDeviceAttribute);
});
</script>

<style>
/* html[data-device-nodesktop="1"] {
  background: #505050;
  font-size: 60px !important;
  font-size: calc(351.9490254872564px /(750 / var(100, 100))) !important;
  margin: 0 auto;
  max-width: 450px;
  max-width: 351.9490254872564px;
} */
input::-webkit-input-placeholder {
  color: #fff !important;
}

input::-moz-placeholder {
  color: #fff !important;
}

.van-tab {
  color: var(--text-color4) !important;
}

.van-tab--active {
  color: var(--van-tab-active-text-color) !important;
}
</style>