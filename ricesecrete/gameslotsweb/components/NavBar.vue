<template>
  <van-nav-bar :left-text="$t(props.leftText)" :left-arrow="leftArrow" class="nav" @click-left="backView" :fixed="true"
    :placeholder="true" :style="background" z-index="99" @click-right="$router.push('/')">
    <template #title>
      <slot name="title">
        <div class="absolute inset-x-11% inset-y-24% !w-78% truncate pointer-events-none">
          {{ $t(props.title) }}
        </div>
      </slot>
    </template>
    <template #right>
      <slot name="right">
        <van-icon name="wap-home-o" class="home-icon" />
      </slot>
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
const $router = useRouter();
const props = defineProps({
  leftArrow: {
    type: Boolean,
    default: true,
  },
  leftText: {
    type: String,
    default: "返回",
  },
  title: {
    type: String,
    default: "",
  },
  isTransparent: {
    type: Boolean,
    default: false,
  },
  isGameList: {
    type: Boolean,
    default: false,
  }
});

const backView = () => {
  if (props.isGameList) {
    $router.replace('/');
  } else {
    $router.back();
  }
}

// 计算透明度
const background = computed((): string => {
  return props.isTransparent
    ? `--van-nav-bar-background:rgba(20,20,20,${navBgOpacity.value})`
    : "";
});
const navBgOpacity: Ref<number> = ref(0);
const scroll = () => {
  const num: number = 1 - (100 - document.documentElement.scrollTop) / 100;
  navBgOpacity.value = num > 1 ? 1 : num;
};
onMounted(() => {
  if (props.isTransparent) {
    window.addEventListener("scroll", scroll);
  }
});
onUnmounted(() => {
  if (props.isTransparent) {
    window.removeEventListener("scroll", scroll);
  }
});
</script>

<style scoped lang="less">
.nav {
  --van-border-width: 0;
}

.home-icon {
  font-size: 20px;
}
</style>