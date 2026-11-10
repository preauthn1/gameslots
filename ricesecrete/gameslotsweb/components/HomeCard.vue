<template>
  <div class="card-wapper container">
    <div class="card-title-wapper">
      <div class="card-title">
        <img :src="props.iconSrc" class="title-icon">
        <span>{{ $t(props.title) }}</span>
        <span class="theme" v-if="props.subtitle">{{ $t(props.subtitle) }}</span>
      </div>
      <div class="title-ctr-wapper">
        <div class="triangle"></div>
        <van-button round size="mini" class="all-btn" v-if="props.num" @click="emit('tabAll')">
          <span>{{ $t("全部") }}</span>
          <!-- <span class="theme2" v-if="props.num">{{ props.num }}</span> -->
        </van-button>
        <div class="icon-wapper">
          <van-icon name="arrow-left" v-if="showLeft" class="left-icon" @click="emit('pre')" />
          <van-icon name="arrow" class="right-icon" v-if="showRight" @click="emit('next')" />
        </div>
      </div>
    </div>
    <div class="content-wapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { bool } from 'three/examples/jsm/nodes/Nodes.js';

const props = defineProps({
  title: String,
  num: Number,
  subtitle: String,
  iconSrc: String,
  showLeft: {
    type: Boolean,
    default: true
  },
  showRight: {
    type: Boolean,
    default: true
  },
});
const emit = defineEmits(["pre", "next", "tabAll"]);
</script>

<style scoped lang="less" src="@/assets/css/homeCard.less"></style>