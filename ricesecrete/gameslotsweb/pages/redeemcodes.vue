<template>
    <div>
        <NavBar leftText="" :title="$t('促销码')"></NavBar>
        <div class="container01">
            <div class="p-2">
                <div>{{ $t("兑换促销代码") }}</div>
                <input type="text" v-model="redemptionCode" class="mt-2 pl-2 pr-2" :placeholder="$t('输入促销代码')">
                <van-button round class="btn" size="large" @click="subRedemption" :loading="btnLoading">{{ $t("兑换")
                    }}</van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { showToast } from "vant";
import { code_receive } from "~/api_v2/action";
import { useRouter } from "vue-router";
const $router = useRouter()
const redemptionCode = ref()
const btnLoading = ref(false)
const nuxtApp = useNuxtApp();
const subRedemption = async () => {
    btnLoading.value = true
    if (redemptionCode.value) {
        const res = await code_receive({ code: redemptionCode.value })
        btnLoading.value = false
        if (res.code === 1) {
            showToast(
                nuxtApp.$t("兑换成功"),
            )
            setTimeout(() => {
                $router.push("/")
            }, 200);
        }
    }

}
</script>

<style scoped lang="less">
input {
    background: var(--bg-color1);
    width: 100%;
    height: 35px;
    border: none;
    border-radius: 10px;
}

.btn {
    margin-top: 20px;
}
</style>