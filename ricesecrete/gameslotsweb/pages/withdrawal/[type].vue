<template>
  <div>
    <NavBar></NavBar>
    <div class="container">
      <van-form @submit="submit">
        <div v-for="item, index in formInputList" :key="index">
          <div class="input-label">{{ $t(item[type] || item.default) }} ：</div>
          <f-van-field v-if="item.type != 'select'" :placeholder="$t(`请输入${item[type] || item.default}`)"
            :border="false" class="left-icon" :clearable="true"
            :rules="item.rule && item.rule($t(`请输入${item[type] || item.default}`))" v-model="form[item.key]"
            :type="item.type || 'text'">
          </f-van-field>
          <!-- 横条选择 -->
          <!-- <div class="channel-list" v-else>
            <div class="channel-item" :class="{ 'channel-item-active': form[item.key] == j }" v-for="j, i in item.list"
              :key="i" @click="form[item.key] = j">{{ j }}</div>
          </div> -->
          <div v-else>
            <van-field v-model="bankName" right-icon="arrow" :readonly="true" :placeholder="$t('选择银行')"
              class="border-radius-22" @click="isNationSelectShown = true" />
          </div>
        </div>

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
        <van-button round class="btn" size="large" native-type="submit" :loading="btnLoading">{{ $t("立即提现")
          }}</van-button>
      </van-form>
      <div class="rule html" v-html="rule?.content" v-if="rule?.content"></div>
    </div>

    <van-action-sheet v-model:show="actionSheetIsShow" :actions="actions" :cancel-text="$t('取消')" @select="onSelect" />
    <WithdrawalQuestion ref="withdrawalQuestion" />

    <van-popup v-model:show="isNationSelectShown" position="bottom" round class="popup-container-style">
      <div class="ml-[10px] mr-[10px] mt-[10px]">
        <van-field :placeholder="$t('在这里查询银行')" v-model="keyWord" left-icon="search"
          @update:model-value="handleSearchNations(keyWord)" />
      </div>
      <van-picker :columns="columns" :confirm-button-text="$t('确认')" :cancel-button-text="$t('取消')"
        @cancel="handleCancel" @confirm="onConfirm" />
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import '@vant/touch-emulator';
import { v2_rule_index_detail_api } from "@/api_v2/rule";
import type { V2_rule_index_detail_api_type } from "~/types/rule";
import {
  v2_user_withdrawal_withdrawal_config_api,
  v2_user_withdrawal_apply_api,
} from "@/api_v2/recharge";
import type { V2_user_withdrawal_withdrawal_config_api_type } from "@/types/recharge";

const $route = useRoute();
const $router = useRouter();
const type = Number($route.params.type) as 0 | 1 | 2 | 3;
const { $t } = useNuxtApp();
const system = useSystem();
const userInfo = useUserInfo();

const isNationSelectShown: Ref<boolean> = ref(false);
const keyWord: Ref<string> = ref('');
const columns: Ref<any[]> = ref([]);
const bankName: Ref<string> = ref('');
//搜索银行信息
const handleSearchNations = (keyWord: string) => {
  const t: any = [];
  let a: any = [];
  a = formInputList.value.find((item: any) => item.type == 'select');
  a.list.forEach((item: { name: string }) => {
    if (item.name.indexOf(keyWord) > -1) {
      t.push(item);
    }
  });
  columns.value = t.map((item: { name: string }) => ({ text: item.name, value: item }));
};
// 选择银行点击确认
const onConfirm = (event: any) => {
  const { selectedOptions } = event;
  form.value.bank_name = selectedOptions[0].value.code;
  bankName.value = selectedOptions[0].text;

  isNationSelectShown.value = false;
  keyWord.value = "";
  let a: any = [];
  a = formInputList.value.find((item: any) => item.type == 'select');
  columns.value = a.list.map((item: { name: string }) => ({ text: item.name, value: item }));
};

// 选择银行点击取消
const handleCancel = () => {
  isNationSelectShown.value = false;
  keyWord.value = "";
  let a: any = [];
  a = formInputList.value.find((item: any) => item.type == 'select');
  columns.value = a.list.map((item: { name: string }) => ({ text: item.name, value: item }));
};

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

// 获取数据
const data: Ref<V2_user_withdrawal_withdrawal_config_api_type | null> =
  ref(null);
const getData = async () => {
  const res = await v2_user_withdrawal_withdrawal_config_api({
    bank_type: type,
  });
  if (res?.code == 1) {
    data.value = res.data;
  }
};
// 规则
const rule: Ref<V2_rule_index_detail_api_type | null> = ref(null);
const getRule = async () => {
  const res = await v2_rule_index_detail_api({ type: 13 });
  if (res?.code == 1) {
    rule.value = res.data;
  }
};
await Promise.all([getData(), getRule()]);

// 表单相关
// 每个字段根据type不同，展示的名字不同
const formInputList = computed(() => {
  // 找到需要展示的input类型
  if (!data.value) return [];

  // 根据queqy 寻找相应的type限制
  // 0 => ‘银行卡’,
  // 1 => ‘USDT’,
  // 2 => ‘电子钱包’,
  // 3 => ‘PIX’
  let activeType = data.value.bank_type;
  if (type == 0) activeType = data.value.bank_type;
  if (type == 1) activeType = data.value.usdt_type;
  if (type == 2) activeType = data.value.wallet_type;
  if (type == 3) activeType = data.value.pix_type;
  // 盘点bank_name  没有值默认第一个
  if (!form.value.bank_name) {
    form.value.bank_name = activeType[0].code;
    columns.value = activeType.map((item) => ({ text: item.name, value: item }));
    bankName.value = activeType[0].name;
  }
  // 寻找需要展示规则
  const field = (
    activeType.find((item) => item.code == form.value.bank_name) ||
    activeType[0]
  ).field;
  const list = [
    {
      type: "select",
      list: activeType,//activeType.map((item) => item.code),
      key: "bank_name",
      isShow: false,
      0: "银行名称",
      1: "USDT链接名",
      2: "钱包名称",
      3: "PIX类型",
    },
    {
      key: "bank_number",
      0: "银行卡号",
      1: "USDT收款地址",
      2: "收款地址",
      3: "PIX账号",
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
      3: "姓名",
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
      key: "w_price",
      type: "number",
      isShow: true,
      default: "提现金额",
      rule: () => [
        {
          required: true,
          validator: (v: string) => {
            return (
              Number(v) >= Number(data.value?.min_amount) &&
              Number(v) <= Number(data.value?.max_amount)
            );
          },
          message: $t('最低提现') + $t(
            "{monetary_type}{min}",
            {
              min: Number(data.value?.min_amount) || "",
              monetary_type: system.value?.data.monetary_type || "",
            }
          ) + " " + $t('最高提现') + $t('{monetary_type}{max}',
            {
              max: Number(data.value?.max_amount) || "",
              monetary_type: system.value?.data.monetary_type || "",
            }),
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
const form = ref({
  bank_type: type.toString(),
  bank_name: "",
  bank_number: "",
  bank_open: "",
  bank_hm: "",
  financial: "",
  province: "",
  city: "",
  remarks: "",
  w_price: "",
});
// 提交表单
const btnLoading = ref(false);
const submit = async () => {
  btnLoading.value = true;
  const res = await v2_user_withdrawal_apply_api(form.value);
  btnLoading.value = false;
  if (res?.code == 1) {
    $router.replace("/");
    showToast($t("提交成功，等待后台审核"));
    updateUserInfo();
  }
};
</script>

<style scoped lang="less" src="@/assets/css/withdrawal.less"></style>