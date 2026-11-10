<template>
    <div>
        <NavBar></NavBar>
        <div class="container">
            <van-form @submit="submit">
                <div v-for="item, index in formInputList" :key="index">
                    <div class="input-label">{{ $t(item[key] || item.default) }} ：</div>
                    <f-van-field v-if="item.type != 'select'" :placeholder="$t(`请输入${item[key] || item.default}`)"
                        :border="false" class="left-icon" :clearable="true"
                        :rules="item.rule && item.rule($t(`请输入${item[key] || item.default}`))" v-model="form[item.key]"
                        :type="item.type || 'text'">
                    </f-van-field>
                    <div v-else>
                        <van-field v-model="bankName" right-icon="arrow" :readonly="true" :placeholder="$t('选择银行')"
                            class="border-radius-22" @click="isNationSelectShown = true" />
                    </div>
                </div>
                <van-button round class="btn" size="large" native-type="submit" :loading="btnLoading">{{ $t("提交")
                    }}</van-button>
            </van-form>
            <van-popup v-model:show="isNationSelectShown" position="bottom" round class="popup-container-style">
                <div class="ml-[10px] mr-[10px] mt-[10px]">
                    <van-field :placeholder="$t('在这里查询银行')" v-model="keyWord" left-icon="search"
                        @update:model-value="handleSearchNations(keyWord)" />
                </div>
                <van-picker :columns="columns" :confirm-button-text="$t('确认')" :cancel-button-text="$t('取消')"
                    @cancel="handleCancel" @confirm="onConfirm" />
            </van-popup>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Bank_List_Paytype_Type, Bank_List_Type } from "@/types/recharge";
import { user_bank_list_api, user_bank_add_api } from "@/api_v2/recharge";
const $route = useRoute();
const $router = useRouter();
const { $t } = useNuxtApp();
// 从查询参数中提取并解析数组数据

const isNationSelectShown: Ref<boolean> = ref(false);
const keyWord: Ref<string> = ref('');
const columns: Ref<any[]> = ref([]);
const bankName: Ref<string> = ref('');

//搜索银行信息
const handleSearchNations = (keyWord: string) => {
    const t: any = [];
    let a: any = [];
    a = formInputList.value.find((item: any) => item.type == 'select');
    a.list.forEach((item: { bank_name: string }) => {
        if (item.bank_name.indexOf(keyWord) > -1) {
            t.push(item);
        }
    });
    columns.value = t.map((item: { bank_name: string }) => ({ text: item.bank_name, value: item }));
};
// 选择银行点击确认
const onConfirm = (event: any) => {
    const { selectedOptions } = event;
    console.log(selectedOptions);
    form.value.bank_name = selectedOptions[0].value.bank_code;
    bankName.value = selectedOptions[0].text;
    isNationSelectShown.value = false;
    keyWord.value = "";
    let a: any = [];
    a = formInputList.value.find((item: any) => item.type == 'select');
    columns.value = a.list.map((item: { bank_name: string }) => ({ text: item.bank_name, value: item }));
};

// 选择银行点击取消
const handleCancel = () => {
    isNationSelectShown.value = false;
    keyWord.value = "";
    let a: any = [];
    a = formInputList.value.find((item: any) => item.type == 'select');
    columns.value = a.list.map((item: { bank_name: string }) => ({ text: item.bank_name, value: item }));
};

const key = Number($route.params.key) as 0 | 1 | 2 | 3;
// 获取数据
const data: Ref<Bank_List_Type | null> =
    ref(null);
const getData = async () => {
    const res = await user_bank_list_api();
    if (res?.code == 1) {
        data.value = res.data;
    }
};
await Promise.all([getData()]);

const form = ref({
    bank_type: key.toString(),
    bank_name: "",
    bank_number: "",
    bank_open: "",
    bank_hm: "",
    financial: "",
    province: "",
    city: "",
    remarks: "",
    currency_id: "",
});
// 表单相关
// 每个字段根据type不同，展示的名字不同
const formInputList = computed(() => {
    // 找到需要展示的input类型
    if (!data.value) return [];
    // 0 => ‘银行卡’,
    // 1 => ‘USDT’,
    // 2 => ‘电子钱包’,
    // 3 => ‘PIX’
    let activeType = data.value.paytype.find((item) => item.key == key)?.list;
    // 盘点bank_name  没有值默认第一个
    if (!form.value.bank_name) {
        if (activeType && activeType.length > 0) {
            form.value.bank_name = activeType[0].bank_code || "";
            bankName.value = activeType[0].bank_name || "";
            columns.value = activeType.map((item) => ({ text: item.bank_name, value: item }));
        }
    }
    // 寻找需要展示规则
    let field = (
        activeType?.find((item) => item.bank_code == form.value.bank_name) ||
        activeType?.[0]
    )?.bank_field;
    // if (key != 0) {
    //     field = ['bank_number', 'bank_hm'];
    // }
    const list = [
        {
            type: "select",
            list: activeType,//activeType.map((item) => item.code),
            key: "bank_name",
            isShow: false,
            0: "银行名称",
            1: "USDT链接名",
            2: "钱包名称",
            3: "钱包名称",
        },
        {
            key: "bank_number",
            0: "银行卡号",
            1: "USDT收款地址",
            2: "收款地址",
            3: "收款地址",
            rule: (msg: string) => [
                {
                    required: true,
                    message: msg,
                },
            ],
        },
        {
            key: "bank_open",
            0: "支行信息",
            default: "二维码链接",
            rule: (msg: string) => [
                {
                    required: true,
                    message: msg,
                },
            ],
        },
        {
            key: "bank_hm",
            0: "开户名",
            1: "USDT链接名",
            2: "钱包名称",
            3: "钱包名称",
            rule: (msg: string) => [
                {
                    required: true,
                    message: msg,
                },
            ],
        },
        {
            key: "financial",
            default: "金融编码",
            rule: (msg: string) => [
                {
                    required: true,
                    message: msg,
                },
            ],
        },
        {
            key: "province",
            default: "开户省",
            isRequire: true, //是验证强制输入内容
        },
        {
            key: "city",
            default: "开户市",
            rule: (msg: string) => [
                {
                    required: true,
                    message: msg,
                },
            ],
        },
        {
            key: "remarks",
            default: "备注",
            isRequire: false, //是验证强制输入内容
        },
    ];
    return list.filter((item) => field.includes(item.key) || item.isShow);
});
// 提交表单
const btnLoading = ref(false);
const submit = async () => {
    btnLoading.value = true;
    const res = await user_bank_add_api(form.value);
    btnLoading.value = false;
    if (res?.code == 1) {
        $router.go(-1);
        showToast($t("提交成功，等待后台审核"));
    }
};
</script>
<style scoped lang="less" src="@/assets/css/withdrawal.less"></style>