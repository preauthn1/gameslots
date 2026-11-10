<script setup lang="ts">
import { ref } from "vue";
import { useVModel } from "@vueuse/core";

// 声明 props 默认值
// 推荐阅读：https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props
const props = defineProps({
  list: Array as any
})

// vue 规定所有的 prop 都遵循着单向绑定原则，直接修改 prop 时，Vue 会抛出警告。此处的写法仅仅是为了消除警告。
// 因为对一个 reactive 对象执行 ref，返回 Ref 对象的 value 值仍为传入的 reactive 对象，
// 即 newFormInline === props.formInline 为 true，所以此处代码的实际效果，仍是直接修改 props.formInline。
// 但该写法仅适用于 props.formInline 是一个对象类型的情况，原始类型需抛出事件
// 推荐阅读：https://cn.vuejs.org/guide/components/props.html#one-way-data-flow
const emit = defineEmits(["update:data"]);
const data = useVModel(props, "list", emit);
</script>

<template>
  <el-form label-position="top">
    <el-form-item v-for="(item,index) in list" :label="item.label">
      <el-input type="text"
      v-model="data[index].value"
        class="!w-[220px]"
      />
    </el-form-item>
  </el-form>
</template>