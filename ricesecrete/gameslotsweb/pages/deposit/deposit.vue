<template>
  <div>
    <NavBar></NavBar>
    <div class="container">
      <!-- <img src="@/assets/images/pix-icon.png" class="pix-icon"> -->
      <!-- <div class="channel-list">
        <div class="channel-item channel-item-active">PIX</div>
        <div class="channel-item">PIX</div>
        <div class="channel-item">PIX</div>
        <div class="channel-item">PIX</div>
      </div> -->
      <van-form @submit="submit">
        <div class="grid grid-cols-3 gap-[5px]">
          <div class="flex flex-col" v-for="(item, index) in recharge?.pay_types || []" :key="index"
            @click="changeChannelTitle(item)">
            <div class="sign-back-borderview h-[60px] flex relative"
              :class="{ 'sign-back-signed': payTypeId == item.id.toString() }">
              <div class="w-full flex flex-col justify-center items-center rounded-[4px] pt-[10px] pb-[10px]">
                <div class="flex items-center">
                  <img :src="item.icon" class="w-[24px] h-[24px] rounded-[4px]" v-if="item.icon">
                  <span class="ml-[5px] text-[11px] whitespace-nowrap">{{ item?.name }}</span>
                </div>
                <span v-if="item.cashback > 0" class="absolute top-[42px] text-[10px] text-[#FF0000]">{{
                  $t("Cashback") }} {{
                    item.cashback
                  }}%</span>
                <img v-if="item.cashback > 0" src="@/assets/images/recommend.png" class="recomm-icon">
              </div>
            </div>
          </div>
        </div>
        <div class="input-label">{{ $t("充值渠道选择") }}</div>
        <div class="grid grid-cols-3 gap-[5px]">
          <div class="flex flex-col" v-for="(item, index) in payTypeData || []" :key="index"
            @click="changeChannel(item.id.toString(), 'online', item)">
            <div class="sign-back-borderview relative" :class="{ 'sign-back-signed': id == item.id.toString() }">
              <div class="flex flex-col justify-around items-center rounded-[4px] p-[10px]">
                <img :src="item.icon" class="icon" v-if="item.icon">
                <span class="text-[11px] whitespace-nowrap">{{ item?.pay_name }}</span>
              </div>
              <img v-if="item.is_hot" src="@/assets/images/recommend.png" class="recomm-icon">
            </div>
          </div>
        </div>
        <div>
          <div class="input-label">{{ $t("金额：") }}</div>
          <div class="num-list">
            <div :class="['num-item', index == avtiveNum ? 'num-item-active' : '']"
              @click="changeActiveNum(index, item.value)" v-for="item, index in numList" :key="index">
              <div class="num-wapper">
                <span class="unit">{{ system?.data.monetary_type }}</span>
                <span class="num">{{ item.value }}</span>
              </div>
              <span class="bonus" v-if="computedBouns(item.value)">+{{ system?.data.monetary_type }}{{
                $numInit(computedBouns(item.value)) }}</span>
              <img src="@/assets/images/hot-icon2.png" class="hot-icon" v-if="item.isHot">
            </div>
          </div>
          <f-van-field :rules="rule" type="number" :placeholder="$t('请输入金额')" :border="false" class="input"
            :clearable="true" v-model="form.apply_price">
            <template #right-icon>
              <span class="input-bonus" v-if="computedBouns(form.apply_price)">+{{ system?.data.monetary_type }}{{
                $numInit(computedBouns(form.apply_price)) }}</span>
            </template>
          </f-van-field>
        </div>
        <!-- <div v-else class="num-code">
          <div v-if="qrcodeAddress.length > 0" class="w-full flex flex-col items-center">
            <div class="flex justify-center">
              <span class="text-[11px]">{{ qrcodeAddress }}</span>
              <img src="@/assets/images/copy-icon.png" class="ml-[10px] w-[16px] h-[16px] "
                @click="$copy(qrcodeAddress)">
            </div>
            <div class="mt-[10px] w-[120px] h-[120px] bg-[#FFFFFF] flex justify-center items-center rounded-[10px]">
              <Qrcode :value="qrcodeAddress" width="130" height="130"></Qrcode>
            </div>
          </div>
        </div> -->

        <div class="input-label">{{ $t("存款奖金") }}</div>
        <div class="action-box">
          <van-radio-group v-model="actionActive">
            <div class="action-item-box" :class="{ 'action-item-box-active': actionActive == index }"
              v-for="item, index in recharge?.action_list" :key="index" @click="changeAction(index)">
              <div class="action-item">
                <van-radio class="radio-icon" icon-size="14" :name="index"></van-radio>
                <div class="action-item-name">{{ item.news_title }}</div>
                <van-icon name="arrow-down" class="right-icon" :class="{ 'right-icon-ac': actionActive == index }" />
              </div>
              <div class="action-item-tips" v-if="actionActive == index">
                <div v-for="i, index in item.reg_json" :key="index">
                  {{
                    $t("充值{min}-{max}，赠送{bouns}", {
                      min: i.min_reg, max: i.max_reg, bouns: i.type == '1' ? i.bl_or_amount
                        :
                        `${i.bl_or_amount}%`
                    })
                  }}</div>
              </div>

            </div>

          </van-radio-group>
        </div>

        <div class="tips">
          <span v-if="activeChannel?.currencyApi.recharge_rate != '1'">{{ $t("今日汇率") }}
            {{ activeChannel?.currencyApi.currency_symbol }}1 ≈
            {{ system?.data.monetary_type }}{{ Number(activeChannel?.currencyApi.recharge_rate) }}</span>
          <br>
          {{ $t("您的私人账户中有") }} <span class="tip-num">{{ system?.data.monetary_type }}{{
            $numInit(Number(form.apply_price)
              +
              computedBouns(form.apply_price)) }}</span>
        </div>
        <van-button round class="btn" size="large" native-type="submit" :loading="btnLoading">{{
          $t("立即存款")
          }}</van-button>
      </van-form>
      <div class="rule html" v-html="pageRule?.content" v-if="pageRule?.content"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Offline, Online, PayTypes } from "~/types/recharge";
import { v2_user_offline_apply_api, v2_user_offline_get_recharge_config_api } from "~/api_v2/recharge";
import { v2_rule_index_detail_api } from "@/api_v2/rule";
import type { V2_rule_index_detail_api_type } from "~/types/rule";
import { onActivated } from "vue"
import jsBridge from "~/composables/jsBridge";
const { $t, $openLink } = useNuxtApp();
const $route = useRoute();
const $router = useRouter();
const recharge = useRecharge();
const system = useSystem();

const payTypeData: Ref<Online[]> = ref([]);
let type = $route.query.type as string || 'online';
let id = '';
let payTypeId = '';

watch(recharge, (newVal) => {
  if (newVal) {
    id = (newVal.pay_types[0].online_list[0]?.id.toString() || '');
    payTypeId = (newVal.pay_types[0].id.toString() || '');
    payTypeData.value = newVal.pay_types[0].online_list;
    if (newVal.pay_types[0].name == 'USDT') {
      showQRCode.value = true;
      qrcodeAddress.value = payTypeData.value[0].address;
    } else {
      showQRCode.value = false;
    }
    getNumListData();
  }
}, { immediate: true });
// 选中的渠道
const activeChannel: Ref<Online | Offline | null> = ref(null);
const initChannel = () => {
  type = type.replace(/\//g, "");
  if (!recharge.value) {
    return;
  }

  if (type == "online") {
    activeChannel.value =
      recharge.value.pay_types.find((item) => item.id.toString() == payTypeId)?.online_list.find((item) => item.id.toString() == id) || null;
  }

  if (type == "offline") {
    activeChannel.value =
      recharge.value.offline.find((item) => item.id.toString() == id) || null;
  }
};

const changeChannel = (idIndex: string, typeIndex: string, item: Online) => {
  id = idIndex;
  type = typeIndex;
  console.log(id + type);
  qrcodeAddress.value = item.address;
  initChannel();
}
const showQRCode = ref(false);
const qrcodeAddress = ref('');
const changeChannelTitle = (paytype: PayTypes) => {
  if (paytype.name == 'USDT') {
    showQRCode.value = true;
    qrcodeAddress.value = paytype.online_list[0].address;
  } else {
    showQRCode.value = false;
  }
  getNumListData();
  payTypeId = paytype.id.toString();
  id = paytype.online_list[0].id.toString();
  payTypeData.value = paytype.online_list;
  initChannel();
}

// 效验规则
const initRule = () => {
  if (!activeChannel.value) return;
  const max =
    "pay_max_amout" in activeChannel.value
      ? activeChannel.value.pay_max_amout
      : activeChannel.value.max_amcount;
  const min =
    "pay_min_amout" in activeChannel.value
      ? activeChannel.value.pay_min_amout
      : activeChannel.value.min_amcount;
  return [
    {
      required: true,
      validator: (v: string) => {
        return Number(v) >= Number(min) && Number(v) <= Number(max);
      },
      message: $t(
        "最低充值{monetary_type}{min}，最高充值{monetary_type}{max}",
        {
          min: Number(min) || "",
          max: Number(max) || "",
          monetary_type: system.value?.data.monetary_type || "",
        }
      ),
    },
  ];
};
const rule = initRule();

//充值快捷数字输入列表
const numList = ref<{ value: string; isHot: boolean | undefined }[]>([]);
// = computed(() => {
//   if (!recharge.value) return [];
//   return recharge.value.recharge_amount_sitting.bank_recharge_list.map(
//     (item) => {
//       return {
//         value: item,
//         isHot:
//           recharge.value?.recharge_amount_sitting.hot_bank_recharge_list.includes(
//             item
//           ),
//       };
//     }
//   );
// });

const getNumListData = () => {
  if (!recharge.value) return [];
  if (showQRCode.value) {
    numList.value = recharge.value.recharge_amount_sitting.usdt_recharge_list.map(
      (item) => {
        return {
          value: item,
          isHot: recharge.value?.recharge_amount_sitting.hot_bank_recharge_list.includes(
            item
          ),
        };
      }
    );
  } else {
    numList.value = recharge.value.recharge_amount_sitting.bank_recharge_list.map(
      (item) => {
        return {
          value: item,
          isHot:
            recharge.value?.recharge_amount_sitting.hot_bank_recharge_list.includes(
              item
            ),
        };
      }
    );
  }
}

// 选中的活动
const actionActive: Ref<number | null> = ref(null);
const actionActiveData = computed(() => {
  if (!recharge.value) return null;
  return actionActive.value != null
    ? recharge.value.action_list[actionActive.value]
    : null;
});
const changeAction = (index: number) => {
  actionActive.value = actionActive.value == index ? null : index;
};

// 表单相关
const form = ref({
  apply_price: "",
});
const avtiveNum: Ref<number | null> = ref(null);
watch(
  () => form.value.apply_price,
  (v) => {
    const index = numList.value.findIndex((item) => item.value == v);
    avtiveNum.value = index;
  },
  {
    immediate: true,
  }
);
const changeActiveNum = (index: number, num: string) => {
  avtiveNum.value = index;
  form.value.apply_price = num;
};

const computedBouns = (num: number | string): number => {
  // 找到使用的道具
  if (!actionActiveData.value) return 0;
  const reg = actionActiveData.value.reg_json.find((item) => {
    return (
      Number(item.min_reg) <= Number(num) && Number(item.max_reg) >= Number(num)
    );
  });

  if (!reg) return 0;
  return (
    (reg.type == "1"
      ? Number(reg.bl_or_amount)
      : (Number(reg.bl_or_amount) * Number(num)) / 100) || 0
  );
};

// 提交充值
const btnLoading = ref(false);
const submit = async () => {
  if (!activeChannel.value) return;
  jsBridge.sendMessage("rechargeClick");
  // 整理参数
  const params = {
    type: activeChannel.value.pay_type,
    apply_price:
      Number(form.value.apply_price) /
      Number(activeChannel.value.currencyApi.recharge_rate),
    bank_sk_id: activeChannel.value.id,
    usdt_type:
      "usdt_type" in activeChannel.value ? activeChannel.value.usdt_type : "",
    not_auto_action: actionActiveData.value?.id || 0,
  };
  // type 0 3 4 6 需要去上传充值凭证
  if (
    params.type == 0 ||
    params.type == 3 ||
    params.type == 4 ||
    params.type == 6
  ) {
    $router.push(
      `/rechargeVoucher?data=${JSON.stringify(
        params
      )}&activeChannel=${JSON.stringify(activeChannel.value)}&price=${form.value.apply_price
      }`
    );
    return;
  }
  btnLoading.value = true;
  const res = await v2_user_offline_apply_api(params);
  btnLoading.value = false;
  if (res?.code == 1) {
    if (res.data.is_qrcode == 1) {
      $router.push(
        `/depositCode?data=${JSON.stringify(
          res.data
        )}&activeChannel=${JSON.stringify(activeChannel.value)}&price=${params.apply_price
        }`
      );
    } else if (res.data.handle_type == "navto") {
      $openLink(res.data.pay_url);
    } else {
      showToast($t("提交成功，等待后台审核"));
      $router.replace("/");
    }
  }
};
onActivated(() => {
  initChannel();
  getRecharge();
});
// 规则
const pageRule: Ref<V2_rule_index_detail_api_type | null> = ref(null);
const getRule = async () => {
  const res = await v2_rule_index_detail_api({ type: 12 });
  if (res?.code == 1) {
    pageRule.value = res.data;
  }
};
const getRecharge = async () => {
  const res = await v2_user_offline_get_recharge_config_api();
  if (res?.code == 1) {
    const data = res.data;
    if (data) {
      if (data.success != 0) {
        if (data.isFirst == 1) {
          jsBridge.sendMessage("firstrecharge", data);
        } else {
          jsBridge.sendMessage("recharge", data);
        }
      }
    }
  }
};


// 更新充值数据
await Promise.all(recharge.value ? [getRule()] : [updateRecharge(), getRule()]);

</script>

<style scoped lang="less" src="@/assets/css/deposit.less"></style>