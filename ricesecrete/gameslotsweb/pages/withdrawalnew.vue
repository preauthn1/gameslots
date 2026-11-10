<template>
    <div>
        <NavBar></NavBar>
        <div class="container">

            <div>
                <van-tabs v-model:active="backTabActive" class="van-tab-btn" @change="changeTab">
                    <van-tab v-for="item, index in data?.paytype" :key="index">
                        <!-- 卡分类 -->
                        <template #title>
                            <div class="flex items-center">
                                <img v-if="item.icon.length > 0" :src="item.icon"
                                    class="w-[20px] h-[20px] rounded-[4px]">
                                <span class="ml-[3px]">{{ $t(item.name) }}</span>
                            </div>
                        </template>
                        <!-- 卡列表 -->
                        <div class="mt-[10px]">
                            <span>{{ $t('我的银行账户') }} ({{ bankData.length }}/5)</span>
                            <div class="w-full h-[150px] mt-[10px]" v-if="bankData.length > 0">
                                <van-swipe class="mt-[10px]" indicator-color="white" @change="bankDataChange">
                                    <van-swipe-item v-for="(item, index) in bankData" :key="index">
                                        <div class="back-crad-content flex flex-col">

                                            <span class="text-[17px] font-semibold pt-[18px] ml-[10px]">{{
                                                item.bank_name
                                                }}</span>
                                            <div class="flex items-center gap-3">
                                                <span class="text-[20px] font-medium ml-[10px] mt-[20px]">{{
                                                    item.bank_number }}</span>
                                            </div>
                                            <span class="text-[13px] font-medium ml-[10px] mt-[24px] mb-[16px]">{{
                                                item.bank_hm }}</span>
                                        </div>
                                    </van-swipe-item>
                                </van-swipe>
                            </div>
                            <div v-else class="mt-[30px]">
                                <div class="w-full h-[125px] flex flex-col justify-center items-center">
                                    <img src="https://www.vvjl.org/mobile/mc/no_cards.b073c0ab.png"
                                        class="ml-[10px] mr-[10px] h-full" alt="">
                                    <span>{{ $t('账户信息为空') }}</span>
                                </div>
                            </div>
                            <div class="flex justify-end mt-[10px]">
                                <van-button type="primary" icon="plus" @click="addBankCard"></van-button>
                            </div>
                        </div>

                    </van-tab>
                </van-tabs>

            </div>

            <van-form>

                <div class="input-label">{{ $t('提现金额') }} ：</div>
                <f-van-field :placeholder="data?.limit.min_amount + ' ~ ' + data?.limit.max_amount" :border="false"
                    class="left-icon" :clearable="true" :rules="$t('提现金额')" v-model="form.w_price" type="number"
                    :min="Number(data?.limit.min_amount)" :max="Number(data?.limit.max_amount)"
                    :maxlength="data?.limit.max_amount.length">
                </f-van-field>

                <div class="tip-list">
                    <div class="tip-item">
                        <span>{{ $t("可提款") }}</span>
                        <span class="num">{{ system?.data.monetary_type }}{{ $numInit(userInfo?.balance) }}</span>
                    </div>
                    <div class="tip-item">
                        <span>{{ $t("总赎回价值") }}</span>
                        <span class="num">{{ system?.data.monetary_type }}{{ $numInit(Number(userInfo?.balance) +
                            Number(userInfo?.cjbalance)) }}</span>
                        <van-icon name="question" color="var(--text-color6)" class="question-icon" size="16"
                            @click="withdrawalQuestionShow" />
                    </div>
                    <div class="tip-item">
                        <span>{{ $t("要增加您的可用余额") }}，</span>
                        <span class="num" @click="$router.push('/gameListOld/0/0/0')">{{ $t("请立即投注") }}</span>
                    </div>
                </div>
                <van-button round class="btn" size="large" @click="submit">{{ $t("立即提现")
                }}</van-button>
            </van-form>
            <div class="rule html" v-html="rule?.content" v-if="rule?.content"></div>
        </div>

        <van-action-sheet v-model:show="actionSheetIsShow" :actions="actions" :cancel-text="$t('取消')"
            @select="onSelect" />
        <WithdrawalQuestion ref="withdrawalQuestion" />

    </div>
</template>

<script setup lang="ts">
import '@vant/touch-emulator';
import { v2_rule_index_detail_api } from "@/api_v2/rule";
import type { V2_rule_index_detail_api_type } from "~/types/rule";
import {
    user_bank_list_api,
    user_bank_my_api,
    v2_user_withdrawal_apply_api,
} from "@/api_v2/recharge";
import type { V2_user_withdrawal_withdrawal_config_api_type, Bank_List_Type, Bank_My_Type } from "@/types/recharge";
import jsBridge from "~/composables/jsBridge";
const $route = useRoute();
const $router = useRouter();
// const type = Number($route.params.type) as 0 | 1 | 2 | 3;
const { $t } = useNuxtApp();
const system = useSystem();
const userInfo = useUserInfo();

const isNationSelectShown: Ref<boolean> = ref(false);
const keyWord: Ref<string> = ref('');
const columns: Ref<any[]> = ref([]);
const bankName: Ref<string> = ref('');

const backTabActive = ref(0);

// 选择框
const actionSheetIsShow: Ref<boolean> = ref(false);
const actions: Ref<{ name: string }[]> = ref([]);
let changeKeyName: keyof typeof form.value;
const showActions = (list: string[], keyName: keyof typeof form.value) => {
    actions.value = list.map((item) => ({ name: item }));
    actionSheetIsShow.value = true;
    changeKeyName = keyName;
};
const onSelect = (data: { name: string }) => {
    form.value[changeKeyName] = data.name;
    actionSheetIsShow.value = false;
};

// 流水弹窗
const withdrawalQuestion = ref();
const withdrawalQuestionShow = () => {
    withdrawalQuestion.value.show(data.value?.water_progress);
};
const changeTab = (v: number) => {
    console.log(v);
    if (data.value) {
        const type = data.value.paytype[v].key;
        getBankData(type);
    }
}
const bankDataChange = (v: number) => {
    const back = bankData.value[v];
    // form.value.bank_name = back.bank_name;
    // form.value.bank_number = back.bank_number;
    // form.value.bank_open = back.bank_open;
    // form.value.bank_hm = back.bank_hm;
    form.value.bank_id = back.id;
}
const addBankCard = () => {
    if (data.value) {
        const key = data.value.paytype[backTabActive.value].key;
        $router.push(`addcard/${key}`);
    }
}

// 获取数据
const data: Ref<Bank_List_Type | null> =
    ref(null);
const getData = async () => {
    const res = await user_bank_list_api();
    if (res?.code == 1) {
        data.value = res.data;
        backTabActive.value = 0;
        const type = data.value.paytype[0].key;
        getBankData(type);
    }
};
const bankData: Ref<Bank_My_Type[]> = ref([]);
const getBankData = async (bankType: number) => {
    const res = await user_bank_my_api({ bank_type: bankType });
    if (res?.code == 1) {
        bankData.value = res.data;
        if (bankData.value.length > 0) {
            const back = bankData.value[0];
            // form.value.bank_type = bankType.toString();
            // form.value.bank_name = back.bank_name;
            // form.value.bank_number = back.bank_number;
            // form.value.bank_open = back.bank_open;
            // form.value.bank_hm = back.bank_hm;
            form.value.bank_id = back.id;
        } else {
            form.value.bank_id = '';
        }
    } else {
        bankData.value = [];
    }
}
// 规则
const rule: Ref<V2_rule_index_detail_api_type | null> = ref(null);
const getRule = async () => {
    const res = await v2_rule_index_detail_api({ type: 13 });
    if (res?.code == 1) {
        rule.value = res.data;
    }
};
await Promise.all([getData(), getRule()]);

const form = ref({
    bank_type: '0',
    bank_name: "",
    bank_number: "",
    bank_open: "",
    bank_hm: "",
    financial: "",
    province: "",
    city: "",
    remarks: "",
    w_price: "",
    bank_id: "",
});
// 提交表单
const btnLoading = ref(false);
const submit = async () => {
    if (form.value.bank_id.length <= 0) {
        showToast($t('请选择提现账户'));
        return;
    }
    if (Number(form.value.w_price) <= 0) {
        showToast($t('请输入金额'));
        return;
    }
    jsBridge.sendMessage("withdrawClick");
    btnLoading.value = true;
    const res = await v2_user_withdrawal_apply_api(form.value);
    btnLoading.value = false;
    if (res?.code == 1) {
        showToast($t("提交成功，等待后台审核"));
        jsBridge.sendMessage("withdrawOrderSuccess", { amount: form.value.w_price, currency: 'PHP', success: 1 });
        updateUserInfo();
        $router.replace("/");
    }
};
onActivated(() => {
    const type = data.value ? data.value.paytype[backTabActive.value].key : 0;
    getBankData(type);
});
</script>

<style scoped lang="less" src="@/assets/css/withdrawal.less"></style>