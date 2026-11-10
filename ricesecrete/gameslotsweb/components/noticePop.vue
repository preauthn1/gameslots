<template>
    <van-popup v-model:show="isShowNoticePop" position="center" class="pop h-75vh !max-w-90% rounded-lg " z-index="2002"
        :close-on-click-overlay="false">
        <div class="bg-green-5 pt-35px h-65vh relative rounded-lg overflow-hidden shadow-md">
            <!-- 关闭按钮 -->
            <van-icon @click="closePop" color="white"
                class="!absolute right-12px top-12px bg-#ffffff22 ring-2px ring-white rounded-full p-3px"
                name="cross" />
            <!-- 公告轮播 -->
            <van-swipe v-if="noticeList?.length" ref="swp" class="h-full">
                <van-swipe-item v-for="(el, idx) in noticeList" :key="idx">
                    <!-- 标题 -->
                    <div class="mb-2% text-yellow text-18px truncate font-600 mx-35px">{{ el.title }}</div>
                    <!-- 内容 -->
                    <div v-if="!el.photo" class="h-85% overflow-y-scroll mx-35px text-white childImg"
                        v-html="el.content" @click="jumpTo(el.jump_url)">
                    </div>
                    <div v-else class="size-full pb-9% overflow-y-auto">
                        <van-image class="max-w-full h-auto" fit="cover" :src="el.photo"
                            @click="jumpTo(el.jump_url)"></van-image>
                    </div>
                </van-swipe-item>
                <template #indicator="{ active, total }">
                    <div class="absolute right-5px bottom-5px py-2px px-5px text-yellow-1 text-12px bg-#FFFFFF33">
                        {{ active + 1 }}/{{ total }}
                    </div>
                </template>
            </van-swipe>
            <!-- 空状态 -->
            <van-empty class="empty" v-else :description="$t('暂无公告')" />

            <!-- 切换按钮 -->
            <van-icon v-if="(noticeList?.length ?? 0) > 1" @click="preSwpItem" size="25px" color="white"
                class="!absolute top-50% left-0 bg-#FFFFFF33 active:bg-#FFFFFF99 rounded rounded-l-full p-3px"
                name="arrow-left" />
            <van-icon v-if="(noticeList?.length ?? 0) > 1" @click="nextSwpItem" size="25px" color="white"
                class="!absolute top-50% right-0 bg-#FFFFFF33 active:bg-#FFFFFF99 rounded rounded-r-full p-3px"
                name="arrow" />
        </div>
        <!-- 不再提醒 -->
        <div class="bg-#FFFFFF44 rounded-sm p-8px checkBox absolute bottom-0 inset-x-35px">
            <van-checkbox v-model="killNotice" icon-size="18px" shape="square" checked-color="#00cd4a">
                {{ $t("不再提醒") }}
            </van-checkbox>
        </div>
    </van-popup>
</template>

<script setup lang="ts">
import type {
    noticeListApiType
} from "~/types";
import {
    noticeListApi
} from "@/api";

const $router = useRouter();

// 获取弹窗公告
const noticeList: Ref<noticeListApiType | null> = ref(null);
const getNoticeList = async () => {
    const res = await noticeListApi({ type: 2, show_loca: 1 });
    if (res?.code == 1) {
        noticeList.value = res.data;
    }
};

await getNoticeList()

const isShowNoticePop = ref<boolean>(false);

onMounted(() => {
    const date: number = new Date().getTime()
    const endDate: number = JSON.parse(localStorage.getItem("noMore_notice") ?? "0")
    isShowNoticePop.value = (date > endDate) && noticeList.value?.length > 0;
});

// 轮播公告
const swp: Ref<null> = ref(null)
const preSwpItem = () => {
    swp.value?.prev()
}
const nextSwpItem = () => {
    swp.value?.next()
}

//路由跳转
const jumpTo = (path: string) => {
    // if (path)
    //     $router.push(path)

    if (path) {
        if (path.startsWith("http")) {
            window.open(path);
        } else {
            $router.push(path)
        }
    } else {
        $router.push(path)
    }
}

// 弹窗关闭
const closePop = () => {
    isShowNoticePop.value = false;
    if (killNotice.value) {
        noMoreNotice()
    }
}

const killNotice: Ref<boolean> = ref(false)
const noMoreNotice = () => {
    // 24小时不显示
    const noNotice_endDate = new Date().getTime() + 86400000
    localStorage.setItem("noMore_notice", JSON.stringify(noNotice_endDate));
};
</script>

<style lang="less" scoped>
.pop {
    --van-popup-background: transform;
    color: var(--page-bg-color);
}

.tabBg {
    // --van-tab-text-color: #04b445;
    // --van-tab-active-text-color: #00cd4a;
    --van-tabs-line-height: 40px;
    // --van-tabs-nav-background: #caf8d8;
}

.empty {
    --van-empty-description-color: #b4ffca;
    --van-empty-padding: 60px 32px;
    --van-empty-image-size: 150px;
    --van-empty-description-font-size: 18px;
}

.checkBox {
    --van-checkbox-label-color: white;
    --van-checkbox-border-color: rgb(226 232 240);
    font-size: 12px;
    text-align: center;
}

:deep(.childImg) {
    img {
        max-width: 100% !important;
        height: auto !important;
    }
}
</style>