<template>
  <van-popup v-model:show="isShow" position="bottom" class="pop" :closeable="true">
    <div class="wapper">
      <div class="card">
        <div class="title">{{ $t("1.邀请朋友前来帮忙") }}</div>
        <div class="icon-wapper">
          <div class="icon-item" @click="share('facebook')">
            <img src="@/assets/images/facebook.png" class="icon-item-icon">
            <span class="icon-name">Facebook</span>
          </div>
          <div class="icon-item" @click="share('whatsApp')">
            <img src="@/assets/images/whatsapp.png" class="icon-item-icon">
            <span class="icon-name">WhatsApp</span>
          </div>
          <div class="icon-item" @click="share('telegram')">
            <img src="@/assets/images/tel2.png" class="icon-item-icon">
            <span class="icon-name">Telegram</span>
          </div>
          <!-- <div class="icon-item" @click="share('twitter')">
            <img src="@/assets/images/tuite.png" class="icon-item-icon">
            <span class="icon-name">Twitter</span>
          </div>
          <div class="icon-item" @click="share('email')">
            <img src="@/assets/images/email.png" class="icon-item-icon">
            <span class="icon-name">Email</span>
          </div> -->
        </div>
        <div class="link-title">{{ $t("与您的朋友共享此推荐链接") }}</div>
        <div class="link-wapper">
          <span class="link-txt">{{ data?.invite_url }}</span>
          <img src="@/assets/images/copy-icon.png" class="pdd-copy" @click="$copy(data?.invite_url)">
        </div>
      </div>
      <!-- <div class="card">
        <div class="title" v-if="data?.phone_list?.length">{{ $t("2.向随机玩家发送帮助邀请") }}</div>
        <div class="number-list">
          <span v-for="item, i in data?.phone_list" :key="item" :class="curNum >= i ? 'acNum' : ''">{{ item }}</span>
        </div>
      </div> -->

      <!-- <div class="bottom-btn-wapper" v-if="data?.phone_list?.length">
        <van-button class="bottom-btn-item" round @click="whatsAppSend">
          <div class="bottom-btn-content">
            <span>{{ $t("发送消息") }}</span>
            <span>WhatsAPP</span>
          </div>
          <img src="@/assets/images/whatsapp2.png" alt="">
        </van-button>
        <van-button class="bottom-btn-item" round @click="groupMsgSend">
          <div class="bottom-btn-content">
            <span>{{ $t("发送消息") }}</span>
            <span>SMS</span>
          </div>
          <img src="@/assets/images/SMS.png" alt="">
        </van-button>
      </div> -->
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { Pdd_getData_api_type } from "~/types/pdd";
const { $t } = useNuxtApp();
const isShow = ref(false);
const show = () => {
  isShow.value = true;
};
const props = defineProps<{
  data: Pdd_getData_api_type | null;
}>();
const shareText = $t("加入我们,免费获得100BRL,无条件即可PIX提款");
const share = (
  type: "facebook" | "whatsApp" | "telegram" | "twitter" | "email" | "Tiktok"
) => {
  const shareLinkData = {
    facebook: `https://m.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      props.data?.invite_url as string
    )}&t=${encodeURIComponent(shareText)}`,
    whatsApp: `https://api.whatsapp.com/send/?text=${encodeURIComponent(
      shareText + props.data?.invite_url
    )}&via=lopscoop`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      props.data?.invite_url as string
    )}&text=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text${encodeURIComponent(
      shareText
    )}&url=${props.data?.invite_url}`,
    email: `mailto:?body=${encodeURIComponent(
      shareText + props.data?.invite_url
    )}`,
    Tiktok: `https://www.tiktok.com`
  };
  location.href = shareLinkData[type];
};

const curNum = ref(-1);
const whatsAppSend = () => {
  if (!props.data) return;
  curNum.value++;
  if (curNum.value >= props.data.phone_list.length) curNum.value = 0;
  location.href = `whatsapp://send?phone=${props.data.phone_list[curNum.value]
    }&text=${encodeURIComponent(shareText + props.data.invite_url)}&via=lopscoop`;
};
const groupMsgSend = () => {
  if (!props.data) return;
  location.href = `sms:/open?addresses=${props.data.phone_list.join(
    ","
  )}&body=${encodeURIComponent(shareText + props.data.invite_url)}`;
};
defineExpose({ show });
</script>

<style scoped lang="less" src="@/assets/css/pddShare.less"></style>