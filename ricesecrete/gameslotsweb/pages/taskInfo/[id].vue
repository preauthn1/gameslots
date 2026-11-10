<template>
    <div>
        <NavBar leftText="" :title="actionDetail?.title"></NavBar>
        <div class="container">
            <!-- <img :src="actionDetail?.c_img" class="cover"> -->
            <div v-if="actionDetail.is_finsh == 0">
                <van-button round size="large" class="btn01">{{ $t("未完成") }}</van-button>
            </div>
            <div v-else>
                <van-button round size="large" class="btn02" v-if="actionDetail?.is_receive == 0"
                    @click="receiveAction">{{
                        $t("领取") }}</van-button>
                <van-button round size="large" class="btn01" v-else>{{ $t("已领取") }}</van-button>
            </div>
            <div class="html mt-[10px]" v-html="actionDetail?.content"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { task_list_api_type } from "~/types/action";
import { task_detail_api } from "@/api/action";
import { task_receive_api } from "@/api/action";
const { $t } = useNuxtApp();
const actionDetail: Ref<any> = ref(null);
const getData = async () => {
    const res = await task_detail_api({
        id: useRoute().params.id as string,
    });
    if (res?.code == 1) {
        actionDetail.value = res.data.details;
    }
};
await getData();
const receiveAction = async () => {
    const res = await task_receive_api({
        task_id: actionDetail.value?.id ?? '',
    });
    if (res?.code == 1) {
        showToast($t("领取成功"));
        getData();
    }
}
</script>

<style scoped lang="less" src="@/assets/css/activityInfo.less"></style>