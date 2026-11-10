<template>
  <svg class="af-svg" :class="props.hasHover?'af-svg-hover':''" focusable="false" aria-hidden="true" :style="svgStyle">
		<use :href="path" class="svg-use"></use>
	</svg>
</template>

<script setup lang="ts">
// 引用当时 名字，默认根据common.svg 里面的id填写
//<af-svg name="test-icon"></af-svg>

import { computed } from "vue";
const props = defineProps({
  name: String,
  path: String,
  color: {
    type: String,
    default: "currentColor", //继承字体颜色
  },
  size: {
    type: String,
    default: "1em", //继承字体大小
  },
});
const path = computed(() => {
  return `#icon-${props.name}`;
});
const svgStyle = computed(() => {
  return {
    width: props.size,
    height: props.size,
    fill: props.color,
  };
});
</script>