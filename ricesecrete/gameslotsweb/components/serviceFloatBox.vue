<template>
    <div class="fixed right-10px bottom-90px z-98 animate-pulse-alt">
        <div class="relative cursor-pointer select-none;" v-for="(item, index) in serviceList" :key="index">
            <div v-if="index < 2" class="relative cursor-pointer select-none" @click="$openLink(item?.link, true)">
                <img :src="item.img" class="size-55px object-contain">
                <!-- <van-icon @click.stop="remove(index)"
                    class="!absolute right--2px top--2px bg-#ffffff22 ring-2px ring-white rounded-full p-2px"
                    name="cross" size="12px" /> -->
            </div>
        </div>
    </div>
    <div class="fixed right-10px bottom-160px z-98" v-if="is_showLink">
        <div @click="$router.push('/shinklink')">
            <img src="@/assets/images/open.png" class="w-55px" alt="">
            <van-icon @click.stop="is_showLink = false"
                class="!absolute z-10 right--2px top--12px bg-#ffffff22 ring-2px ring-white rounded-full p-2px"
                name="cross" size="12px" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    serviceListType
} from "~/types";
import {
    serviceList as serviceListApi
} from "@/api";
import { useRouter } from "vue-router";
const $router = useRouter();
const is_showLink = ref(true)
// 获取客服列表
const serviceList: Ref<serviceListType | null> = ref(null);
const getServiceList = async () => {
    const res = await serviceListApi();
    if (res?.code == 1) {
        serviceList.value = res.data;
    }
    console.log(serviceList);
};

onMounted(() => {
    getServiceList()
});

const remove = (index: number,) => {
    serviceList?.value?.splice(index, 1);
};
</script>