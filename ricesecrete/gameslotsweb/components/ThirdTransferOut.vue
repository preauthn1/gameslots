<template>
  <van-popup v-model:show="thirdBalance" position="bottom" round>
    <div class="content">
      <h1>{{ $t('信息') }}</h1>
      <div class="custom-dialog-body">
        <div class="tip-content">
          <span>{{ $t('您还有余额在游戏中,是否转出?') }}</span>
        </div>
        <div class="confirm">
          <van-button style="cursor: not-allowed" round class="btn" @click="dialogComfirm">{{ $t('确定') }}</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { game_user_transout_api } from "@/api/cybSports";
import { computed, } from "vue";
const loginStatus = useLoginStatus();
const userInfo = useUserInfo();
const Rollout = isRollout()

const thirdBalance = computed(() => {
  return userInfo && loginStatus ? userInfo.value?.third_balance > 0 : false;
})

const dialogComfirm = async () => {
  Rollout.value = false
  const res = await game_user_transout_api(0)
}
</script>

<style scoped lang="less">
.content {
  padding: 30px;
}

.tip-content {
  margin-top: 10px;
  margin-left: 10px;
}

.btn {
  background: #3d89d6 !important;
  // cursor: no-drop !important;
}

.confirm {
  display: flex;
  justify-content: flex-end;
}
</style>
