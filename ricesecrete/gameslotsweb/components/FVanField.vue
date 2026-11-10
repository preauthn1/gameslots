<template>
  <div>
    <van-field class="input" v-bind="$attrs" @end-validate="validate" @input="change">
      <template v-for="slotName in Object.keys($slots)" v-slot:[slotName]>
        <slot :name="slotName" />
      </template>
    </van-field>
    <div class="msg" v-if="msg">{{msg}}</div>
  </div>
</template>

<script setup lang="ts">
const msg: Ref<string> = ref("");
const validate = (v: { message: string }) => {
  msg.value = v.message;
};
const change = () => {
  msg.value = "";
};
</script>

<style scoped lang="less">
.msg {
  width: 100%;
  padding: 0 10px;
  line-height: 1.4;
  color: red;
  font-size: 12px;
  margin-top: 6px;
}
</style>