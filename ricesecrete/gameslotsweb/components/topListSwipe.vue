<template>
    <!-- topList -->
    <div class="flex my-10px">
        <van-swipe class="h-170px w-100%" :autoplay="6000" vertical :show-indicators="false"
            v-if="fakeDataList?.high_win.length">
            <van-swipe-item v-for="item, index in showDataIdx" :key="index">
                <template #default>
                    <!-- first -->
                    <div class="flex gap-x-3% h-95% my-2px">
                        <div class="relative w-31%">
                            <FImg :src="fakeDataList?.high_win[item].game_icon"
                                class="w-100% h-76% block object-cover rounded-t-10px overflow-hidden" fit="cover" />
                            <div class="absolute bottom-0 left-0 right-0 h-24% bg-gradient-to-tr from-yellow
                 to-lime-5 text-white flex flex-col items-center rounded-b-10px
                 overflow-hidden">
                                <div class="text-[12px]">{{ fakeDataList?.high_win[item].username }}</div>
                                <div class="text-green-8 bg-green/50 rounded pl-[8px] pr-[8px]">
                                    <span class="text-[12px]">₱ {{
                                        fakeDataList?.high_win[item].gb_winprice
                                        }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- second -->
                        <div class="relative w-31%">
                            <FImg :src="fakeDataList?.high_win[backShowIndex(item + 1)].game_icon"
                                class="w-100% h-76% block object-cover rounded-t-10px overflow-hidden" fit="cover" />
                            <div class="absolute bottom-0 left-0 right-0 h-24% bg-gradient-to-tr from-yellow
                 to-lime-5 text-white flex flex-col items-center rounded-b-10px
                 overflow-hidden">
                                <div class="text-[12px]">{{ fakeDataList?.high_win[backShowIndex(item + 1)].username }}
                                </div>
                                <div class="text-green-8 bg-green/50 rounded pl-[8px] pr-[8px]">
                                    <span class="text-[12px]">₱ {{ fakeDataList?.high_win[backShowIndex(item +
                                        1)].gb_winprice }}</span>

                                </div>
                            </div>
                        </div>
                        <!-- third -->
                        <div class="relative w-31%">
                            <FImg :src="fakeDataList?.high_win[backShowIndex(item + 2)].game_icon"
                                class="w-100% h-76% block object-cover rounded-t-10px overflow-hidden" fit="cover" />
                            <div class="absolute bottom-0 left-0 right-0 h-24% bg-gradient-to-tr from-yellow
                 to-lime-5 text-white flex flex-col items-center rounded-b-10px
                 overflow-hidden">
                                <div class="text-[12px]">{{ fakeDataList?.high_win[backShowIndex(item + 2)].username }}
                                </div>
                                <div class="text-green-8 bg-green/50 rounded pl-[8px] pr-[8px]">
                                    <span class="text-[12px]">₱ {{ fakeDataList?.high_win[backShowIndex(item +
                                        2)].gb_winprice }}</span>

                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </van-swipe-item>
        </van-swipe>
    </div>
</template>
<script setup lang="ts">
import type {
    fakeDataListApiType
} from "~/types";

const props = defineProps({
    dataList: {
        type: Object as unknown as PropType<fakeDataListApiType | null>,
        default: null
    }
}
)
const fakeDataList: Ref<fakeDataListApiType | null> = toRef(props, "dataList");

const showDataIdx = computed(() => {
    return fakeDataList?.value?.high_win.reduce((acc: number[], _, index) => {
        if (index % 3 === 0) {
            acc.push(index);
        }
        return acc;
    }, []);
})
const backShowIndex = (idx: number) => {
    return idx + 1 < (fakeDataList?.value?.high_win?.length ?? idx) ? idx : idx - (fakeDataList.value?.high_win?.length ?? idx)
}
</script>