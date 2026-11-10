<template>
    <div>
        <NavBar left-text="" title="推荐好友开奖品箱"></NavBar>
        <div class="shinklink m-1 rounded">
            <div class="p-1">{{ $t("促销信息") }}</div>
            <div class="p-1 line">
                <div class="qrcode">
                    <Qrcode :value="data?.share.url" class="qcord-img" width="65" height="65"></Qrcode>
                    <div class="code-save-btn">{{ $t("保存") }}</div>
                </div>
                <div class="link">
                    <div class="pb-5px">{{ $t("我的链接") }}</div>
                    <div class="flex items-center pr-4px">
                        <div class="link-wapper">
                            <span>{{ data?.share.url }}</span>
                            <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(data?.share.url)">
                        </div>
                    </div>
                    <div class="flex items-center pt-1">
                        <span>{{ $t("邀请码") }}：{{ shareCode }}</span>
                        <img src="@/assets/images/copy-icon.png" class="copy-icon" @click="$copy(data?.share.url)">
                    </div>
                </div>

            </div>
            <div class="pt-0 pb-1 pl-1 pr-1 share-type gap-2">
                <div class="text-center" v-for="item, index in data?.share.platform" :key="index" @click="share(item.name === 'Facebook' ? 'Facebook' : item.name === 'WhatsApp' ? 'WhatsApp' : item.name === 'Telegram' ? 'Telegram' : item.name === 'Twitter' ?
                    'Twitter' : item.name === 'Facebook' ? 'Facebook' : item.name === 'Tiktok' ? 'Tiktok' : 'Email')">
                    <img :src="item?.icon" width="35" height="35" alt="">
                    <div>{{ item.name }}</div>
                </div>
            </div>
            <div class="line p-1">
                {{ $t("已推广人数") }} ：{{ !taskList?.people ? 0 : taskList?.people }}
            </div>
        </div>
        <div class="shinklink m-1 rounded">
            <div class="p-1">
                <div class="pt-1 flex flex-wrap gap-link gap-10px items-center justify-start">
                    <div v-for="(item, index) in taskList?.list" class="pt-1" :key="item?.id">
                        <div class="flex items-center">
                            <div class="flex flex-col">
                                <div :class="['back flex', item?.is_standard == 1 && item?.is_play == 1 ? 'backactive' : item?.is_standard == 1 && item?.is_play == 2 ? 'backopen' : '']"
                                    @click="receiveInviteRebate(item?.id)">
                                    <span class="num">{{ item?.stratum_number }}</span>
                                </div>
                                <div class="text-center">
                                    <span>{{ item.stratum_bonus }}</span>
                                </div>
                            </div>
                            <div class="arrow" v-if="taskList?.list.length - 1 !== index">>></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <div class="shinklink m-1 rounded p-1" v-html="rule?.content" v-if="rule?.content"></div>
        <!-- <div class="shinklink m-1 rounded p-1">
            <span>Instruções Do Evento:</span>
            <p>1. Convide amigos e abra o baú do tesouro. Completar diferentes números de convites resultará em
                recompensas correspondentes no baú do tesouro. Quanto mais você se desenvolve, maiores serão as
                recompensas;</p>
            <p>2. Este evento é um presente adicional para a plataforma, podendo também usufruir de outras recompensas e
                comissões dos agentes, ou seja, poderá usufruir diretamente de vários momentos felizes;</p>
            <p>3. As recompensas só podem ser reivindicadas manualmente em iOS, Android, H5 e PC e serão emitidas
                automaticamente após a expiração;</p>
            <p>4. Esta atividade está limitada às operações humanas normais do proprietário da conta. É proibida a
                participação por meios técnicos como leasing, utilização de plug-ins, robôs, jogos com contas diversas,
                escovação mútua, arbitragem, interfaces, protocolos, exploração de vulnerabilidades, controle de grupo e
                outros meios técnicos. Congelar ou recompensar ou mesmo colocar na lista negra;</p>
            <p>5. Para evitar diferenças na compreensão do texto, a plataforma reserva-se o direito de interpretação
                final deste evento.</p>
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { InviteRebate, popularize } from '~/api/share';
import { v2_affiliate_summary_api } from "@/api_v2/affiliate";
import type { V2_affiliate_summary_api_type } from "~/types/affiliate";
const shareCode = ref();
const taskList = ref([]);
const { $t } = useNuxtApp();
const link = async () => {
    const res = await popularize();
    if (res?.code === 1) {
        taskList.value = res?.data;
    }
}
const data: Ref<V2_affiliate_summary_api_type | null> = ref(null);
const getData = async () => {
    const res = await v2_affiliate_summary_api();
    if (res?.code == 1) {
        data.value = res.data;
        const url = new URL(res.data.share.url);
        shareCode.value = url.searchParams.get('share_code');
    }
};
const shareText = $t("加入我们,免费获得100BRL,无条件即可PIX提款");
const share = (
    type: "Facebook" | "WhatsApp" | "Telegram" | "Twitter" | "Email" | "Tiktok"
) => {
    const shareLinkData = {
        Facebook: `https://m.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            data.value?.share.url as string
        )}&t=${encodeURIComponent(shareText)}`,
        WhatsApp: `https://api.whatsapp.com/send/?text=${encodeURIComponent(
            shareText + data.value?.share.url
        )}&via=lopscoop`,
        Telegram: `https://t.me/share/url?url=${encodeURIComponent(
            data.value?.share.url as string
        )}&text=${encodeURIComponent(shareText)}`,
        Twitter: `https://twitter.com/intent/tweet?text${encodeURIComponent(
            shareText
        )}&url=${data.value?.share.url}`,
        Email: `mailto:?body=${encodeURIComponent(
            shareText + data.value?.share.url
        )}`,
        Tiktok: `https://www.tiktok.com`
    };

    window.open(shareLinkData[type]);
};
// 领取推广奖励
const receiveInviteRebate = async (id: string | number) => {
    const res = await InviteRebate({ id: id })
    if (res?.code === 0) {
        link();
    }

};
onActivated(() => {
    link();
    getData();
})
import { v2_rule_index_detail_api } from "@/api_v2/rule";
import type { V2_rule_index_detail_api_type } from "~/types/rule";
// 规则
const rule: Ref<V2_rule_index_detail_api_type | null> = ref(null);
const getRule = async () => {
    const res = await v2_rule_index_detail_api({ type: 14 });
    if (res?.code == 1) {
        rule.value = res.data;
    }
};
getRule()
</script>

<style lang="less" scoped>
.shinklink {
    background: var(--bg-color4);
    /* color: #999; */
    font-size: 13px;
}

.line {
    display: flex;
    /* justify-content: space-between; */
    border-top: 1px solid #999;
}

/* .gap-link {
    gap: 0.4rem;
} */

.qcord-img {
    background: #fff;
    padding: 4px 4px 0 4px;
    border-radius: 8px 8px 0 0;
}

.qrcode {
    padding-right: 10px;
}

.arrow {
    padding-left: 8px;
    font-size: 15px;
}

.num-p {

    @media (min-width:769px) {
        // margin-left: 0.8rem;
    }
}

.code-save-btn {
    background: #FEB705;
    text-align: center;
    margin-top: -4px;
    border-radius: 0px 0px 8px 8px;
    padding: 3px 0px;
    font-size: 15px;
    color: #000;
    cursor: pointer;
    user-select: none;
}

.share-type {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
}

.back {
    width: 2rem;
    height: 2rem;
    background-position: 0px 0px;
    background-image: url("@/assets/images/status.png");
    background-size: 100% 100%;
    position: relative;
    pointer-events: none;

    @media (min-width:769px) {
        width: 2.5rem;
        height: 2.5rem;
    }
}

.backactive {
    background-position: 0px 0px;
    background-image: url("@/assets/images/active.png");
    background-size: 100% 100%;
    position: relative;
    pointer-events: all;
}

.backopen {
    background-position: 0px 0px;
    background-image: url("@/assets/images/open.png");
    background-size: 100% 100%;
    position: relative;
    pointer-events: none;
    color: #fff;
}

.num {
    position: absolute;
    bottom: 10px;
    width: 100%;
    // left: 40%;
    text-align: center;
    font-size: 15px;


}

// @media (min-width:769px) {
//         bottom: 15px;
//         left: 38%;
//     }

.link-wapper {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--text-color4);
    white-space: wrap;
    border-radius: 100vh;
    background-color: var(--page-bg-color);
    justify-content: space-between;
    padding: 9px 12px;
    line-height: 1;

    span {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.copy-icon {
    width: 16px;
    height: 16px;
    margin-left: 10px;
    flex-shrink: 0;
}
</style>