<template>
  <div>
    <div :data-isLoad="isShowLoad ? 't' : 'f'"
      class="w-full data-[isLoad=t]:bg-#002607 data-[isLoad=f]:bg-transparent pointer-events-none">
      <!-- wap-home -->
      <van-icon class="pointer-events-auto z-999 p-6px rounded-full bg-gradient-to-r bg-#00000066" name="arrow-left"
        size="25" @click="backIndex" />

    </div>
    <iframe :src="url" v-if="url" frameborder="0" class="iframe" @load="isLoad()"></iframe>
    <iframe :srcdoc="srcDoc" v-else frameborder="0" class="iframe" @load="isLoad()"></iframe>

    <!-- <van-overlay :show="isShowLoad" class="center">
      <van-loading vertical>
        <template #icon>
          <van-icon name="star-o" size="30" />
        </template>
{{ $t("游戏跳转中，请稍后...") }}
</van-loading>
</van-overlay> -->

    <van-dialog v-model:show="backDialog" :title="$t('确认退出游戏？')" theme="round-button" show-cancel-button
      :confirm-button-text="$t('确认')" :cancel-button-text="$t('取消')" @confirm="confirmBack">
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { game_login_game_api } from "~/api";
const $router = useRouter();
const $route = useRoute();
const url: Ref<string | null> = ref(null);
const srcDoc: Ref<string> = ref("");
const tc_id = $route.params.id.toString().split("-")[1];
const { $t } = useNuxtApp();

const getUrl = async () => {
  const res = await game_login_game_api({
    gid: $route.params.id.toString().split("-")[0],
    platform: "1",
  });
  if (res?.code == 1) {
    if (res.data.startsWith("http")) {
      url.value = res.data;
    } else {
      srcDoc.value = res.data;
    }
  }
};
if (process.server) {
  await getUrl();
}
onActivated(() => {
  if (process.client) {
    getUrl();
  }
})

const isShowLoad: Ref<boolean> = ref(true)
const loadCount: Ref<number> = ref(0)
const iframeRef = ref<HTMLIFrameElement | null>(null)
function isLoad() {
  loadCount.value++
  // if (loadCount.value === 2) {
  //   isShowLoad.value = false
  // }
}
// window.addEventListener('message', (e) => {
//   if (e.data === 'goBack') {
//     $router.back();
//   }
// })
// 回到首页
const backDialog: Ref<boolean> = ref(false)
function backIndex() {
  backDialog.value = true
}
function confirmBack() {
  // showToast('确认退出游戏' + backDialog.value);
  // isCanBack.value = true;
  const routerUrl = localStorage.getItem("gameUrl") || "";
  console.log('routerUrl' + routerUrl);
  $router.replace(routerUrl);
  // $router.push('/');

}
import jsBridge from "~/composables/jsBridge";
jsBridge.sendMessage("enterGame");


// const handleBackButton = (event: Event) => {
//   showToast('handleBackButton' + '-' + loadCount.value);
//   event.preventDefault();
//   backDialog.value = true;
// };

// onMounted(() => {
//   window.addEventListener('popstate', handleBackButton);
//   window.addEventListener('beforeunload', handleBackButton);
//   document.addEventListener('backbutton', handleBackButton, false);
// });

// onUnmounted(() => {
//   window.removeEventListener('popstate', handleBackButton);
//   window.removeEventListener('beforeunload', handleBackButton);
//   document.removeEventListener('backbutton', handleBackButton);
// });

// const isCanBack = ref(false);
// onBeforeRouteLeave((to, from, next) => {
//   showToast('onBeforeRouteLeave');
//   if (isCanBack.value) {
//     next();
//   } else {
//     next(false);
//   }
//   next(false); // 阻止导航
// });
// onActivated(() => {
//   isCanBack.value = false;
// });
</script>

<style scoped lang="less">
.iframe {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>