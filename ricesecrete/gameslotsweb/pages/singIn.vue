<template>
    <div>
        <NavBar left-text="" title="签到"></NavBar>
        <div class="singTop rounded m-1">
            <div class="text-center p-1">
                <div>{{ $t("累计已签到天数") }} ：{{ singInList?.sign_day }}</div>
                <div>{{ $t("累计签到奖励") }} ：{{ singInList?.reward_total_amount }}</div>
            </div>
        </div>
        <div class="singTop rounded m-1 p-1 grid grid-cols-3 grid-auto-cols-1 gap-2">
            <div class="center flex-col item" v-for="item in singInList.day_list" :key="item.day">
                <div class="border-2 border-black text-center mb-1">
                    <img src="../assets/images/img_qdbx1.png" width="65px" height="65px" alt="">
                    <div class="text-center bonus mb-1 pb-1">{{ system?.data.monetary_type }}{{ item?.reward_amount }}
                    </div>
                    <div class="singinTitle" v-if="item?.day !== singInList?.current_day">
                        <div v-if="item.status == 0">{{ item?.day }}{{ $t("天") }}</div>
                        <van-button size="small" class="btn01" v-else>{{ $t("已领取") }}</van-button>
                    </div>
                    <template v-else>
                        <van-button size="small" class="btn" v-if="item.status == 0" @click="getsingIn">{{
                            $t("领取") }}</van-button>
                        <van-button size="small" class="btn01" v-else>{{ $t("已领取") }}</van-button>
                    </template>
                </div>
            </div>
        </div>
        <div class="singTop rounded m-1" v-if="singInList?.introduce">
            <div class="p-1">
                <span class="text-[14px]" v-html="singInList?.introduce"></span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { singinData, singin } from '~/api/singIn';
const { $t } = useNuxtApp();
const system = useSystem();
interface SingInList {
    current_day?: number;
    reward_total_amount?: number;
    day_list?: Array<{ day: number; reward_amount: number; status: number }>;
    introduce?: string;
    id?: number;
    sign_day: number;
}

const singInList = ref<SingInList>({});
const data = async () => {
    const res = await singinData();
    if (res?.code === 1) {
        singInList.value = res?.data as SingInList;
    }
};

const getsingIn = async () => {
    const res = await singin({ sign_id: singInList.value?.id ?? 0, day: singInList.value?.current_day ?? 0 })
    if (res?.code === 1) {
        showToast($t("签到成功"));
        data();
    }
}
onActivated(() => {
    data();
});
</script>

<style lang="less" scoped>
.singTop {
    background-color: var(--bg-color4);
}

.item {
    border: 1px solid #999;
    border-radius: 10px;
}

.bonus {
    color: #FFAA09;
    border-bottom: 1px solid #999;
}

.singinTitle {
    color: #999;
}

.btn {
    width: 100%;
    height: 20px;
    border-radius: 5px;
}

.btn01 {
    width: 100%;
    height: 20px;
    border-radius: 5px;
    background: #999;
}
</style>