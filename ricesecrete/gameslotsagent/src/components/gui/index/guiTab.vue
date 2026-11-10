<script setup lang='ts'>
import { ref, reactive, defineAsyncComponent } from 'vue';
// @ts-ignore
import customTable from "./custorm-table.vue";
import { timeCycle } from '@/utils/global'
import { queryData, getMatch } from "@/api/user";
import { useI18n } from "vue-i18n";
import { useNav } from "@/layout/hooks/useNav";
import Bar from "./Bar.vue";
import Line from "./Line.vue";
import { http } from '@/utils/http';
import { httpResponse } from '@/layout/types';
import { CopyDocument, Download } from '@element-plus/icons-vue'
import { copyContent } from "@/utils/global";
import QRCode from 'qrcode'

const {
  username,
} = useNav();
const { t } = useI18n();
const list1 = reactive({
  "TotalUser1": {
    "title": "新用户人数", "num": 0, "idx": 2, loading: false
  },
  "TotalUser2": {
    "title": "活跃人数", "num": 0, "idx": 3, loading: false
  },
  "TotalRechargeUser1": {
    "title": "充值人数", "num": 0, "idx": 5, loading: false
  },
  "TotalRechargeUser2": {
    "title": "首充人数", "num": 0, "idx": 6, loading: false
  },
  "TotalRechargeUser3": {
    "title": "复充人数", "num": 0, "idx": 7, loading: false
  },
  "totalUserBalance": {
    "title": "用户余额", "num": 0, "idx": 8, loading: false
  },
  "TotalFirstRecharge": {
    "title": "首充金额", "num": 0, "idx": 29, loading: false
  },
  "TotalRecharge4": {
    "title": "充值总额", "num": 0, "idx": 11, loading: false
  },
  "TotalWithdraw1": {
    "title": "提现总额", "num": 0, "idx": 14, loading: false
  },
  "TotalWithdrawFee1": {
    "title": "提现手续费", "num": 0, "idx": 17, loading: false
  },
  "TotalProfitAndLoss1": {
    "title": "客损", "num": 0, "tip": '根据返佣结算时间计算', "idx": 20, loading: false
  },
  "TotalAgentCommission1": {
    "title": "收益", "num": 0, "tip": '根据返佣结算时间计算', "idx": 23, loading: false
  },
  "TotalGiveMoney": {
    "title": "优惠成本", "num": 0, "tip": '根据返佣结算时间计算：包含赠送彩金,活动优惠,免费转盘', "idx": 25, loading: false
  },
  "BetTotal": {
    "title": "投注总额", "num": 0, "idx": 28, loading: false
  },
  "BetUsersTotal": {
    "title": "投注人数", "num": 0, "idx": 29, loading: false
  }
});

const backTime = ref('');
const timeBack = (val) => {
  backTime.value = val && val.length == 2 ? timeCycle(val[0]) + ' - ' + timeCycle(val[1]) : '';
}
const qrCodeImage = ref('')
const userInfo: any = ref({})
const getUser = () => {
  http.get('/user/my').then((res: httpResponse) => {
    if (res.code == 1) {
      userInfo.value = res.data as any
      generateQRCode(userInfo.value.rec_url)
    }
    console.log(userInfo.value)
  })
}
getUser()
// init();
async function init() {
  for (const key in list1) {
    const query = {
      date: backTime.value,
      key,
      search:true
    }
    list1[key].loading = true
    const res:any = await queryData(query);
    if (res.code == 1) {
      list1[key].num = res.data
      list1[key].loading = false
    }
  }
}
const handleSerch = () => {
  init();
}
const generateQRCode = async (text) => {
  try {
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.92,
      margin: 3,
      scale: 6,
      color: {
        dark: '#000000ff',
        light: '#ffffffff'
      }
    }
    const imageData = await QRCode.toDataURL(text, opts)
    qrCodeImage.value = imageData
  } catch (error) {
    console.error(error)
  }
}

const downloadIamge = (name) => {
  if (!qrCodeImage.value) {
    return
  }
  const image = new Image()
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous')
  image.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    const url = canvas.toDataURL('image/png') // 得到图片的base64编码数据
    const a = document.createElement('a') // 生成一个a元素
    const event = new MouseEvent('click') // 创建一个单击事件
    a.download = name || 'qrcode' // 设置图片名称
    a.href = url // 将生成的URL设置为a.href属性
    a.dispatchEvent(event) // 触发a的单击事件
  }
  image.src = qrCodeImage.value
}

const loading = ref(false)
</script>
<template>
  <div>
    <el-row :gutter="16">
      <el-col :xs="24" :sm="24">
        <div class="agent-overview-left" style="margin-bottom: 16px;">
          <div class="agent-profile-card">
            <div class="profile-account">
              <div class="profile-account-items">
                <div class="profile-account-item">
                  <span class="item-icon account"/>
                  <span class="item-content">
                    <div class="min-title">{{ $t('帐号') }}</div>
                    <div class="content-text" v-if="userInfo.phone">{{ userInfo.phone }}</div>
                    <div class="content-text" v-else-if="userInfo.mail">{{ userInfo.mail }}</div>
                    <div class="content-text" v-else-if="userInfo.username">{{ userInfo.username }}</div>
                  </span>
                </div>
                <div class="profile-account-item">
                  <span class="item-icon balance"/>
                  <span class="item-content">
                    <div class="min-title">{{ $t('余额') }}</div>
                    <div class="content-text">{{ userInfo.balance }}</div>
                  </span>
                </div>
              </div>
              <!-- <div class="profile-account-btns">
                <el-button type="primary" class="profile-account-btn deposit ant-btn">
                  <span>{{ $t('钱包') }}</span>
                </el-button>
              </div> -->
            </div>
            <div class="profile-account-referral">
              <div class="referral-content">
                <h5 class="min-title">{{ $t('推荐码') }}</h5>
                <p class="referral-code">{{ userInfo.rec_code }}</p>
                <div class="referral-btn-group">
                  <el-button type="primary" class="btn-copy" @click="copyContent(userInfo.rec_code)">
                    <el-icon><CopyDocument /></el-icon>
                    <span>{{ $t('复制') }}</span>
                  </el-button>
                  <el-button type="info" class="btn-download" @click="downloadIamge($t('推荐码'))">
                    <el-icon><Download /></el-icon>
                    <span>{{ $t('下载') }}</span>
                  </el-button>
                </div>
                <div style="margin-top: 10px;">
                  <el-input
                    v-model="userInfo.rec_url"
                    placeholder="Please input"
                    class="input-with-select"
                  >
                    <template #append>
                      <el-button type="primary" class="btn-copy" @click="copyContent(userInfo.rec_url)">
                        <el-icon><CopyDocument /></el-icon>
                        <span>{{ $t('复制') }}</span>
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </div>
              <div class="agent-qrcode">
                <img v-if="qrCodeImage" :src="qrCodeImage" style="width: 200px;"/>
              </div>
            </div>
            <div class="referral-teams" v-if="userInfo.stat">
              <div class="referral-teams-title">
                <div class="team-img agent"/>
                <h5 class="item-text">{{ $t('代理') }}</h5>
              </div>
              <div class="referral-teams-total">
                <div class="item-number">{{ userInfo.stat.total_agent_users }}</div>
                <div class="item-text">{{ $t('总数') }}</div>
              </div>
              <div class="referral-teams-count">
                <div class="item-content">
                  <div class="item-number">{{ userInfo.stat.rec_agent_users }}</div>
                  <div class="item-text">{{ $t('直属') }}</div>
                </div>
                <div class="item-content">
                  <div class="item-number">{{ userInfo.stat.rec2_agent_users }}</div>
                  <div class="item-text">{{ $t('下线') }}</div>
                </div>
              </div>
            </div>
            <div class="referral-teams" v-if="userInfo.stat">
              <div class="referral-teams-title">
                <div class="team-img member"/>
                <h5 class="item-text">{{ $t('会员') }}</h5>
              </div>
              <div class="referral-teams-total">
                <div class="item-number">{{ userInfo.stat.total_users }}</div>
                <div class="item-text">{{ $t('总数') }}</div>
              </div>
              <div class="referral-teams-count">
                <div class="item-content">
                  <div class="item-number">{{ userInfo.stat.rec_users }}</div>
                  <div class="item-text">{{ $t('直属') }}</div>
                </div>
                <div class="item-content">
                  <div class="item-number">{{ userInfo.stat.rec2_users }}</div>
                  <div class="item-text">{{ $t('下线') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <!-- <el-col :xs="24" :sm="16">
        <el-card class="box-card">
          <component :list="list1" @search="handleSerch"  @select="timeBack" :is="customTable" />
        </el-card>
      </el-col> -->
    </el-row>
    <!-- <el-row :gutter="16" style="margin-top: 16px;">
      <el-col style="margin-bottom: 16px;"
        :xs="24"
        :sm="24"
        :md="12"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card>
          <template #header>
            <span style="font-size: 16px; font-weight: 500">
              {{ $t('最近7天充值') }}
            </span>
          </template>
          <el-skeleton animated :rows="7" :loading="loading">
            <template #default>
              <Line />
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col style="margin-bottom: 16px;"
        :xs="24"
        :sm="24"
        :md="12"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card>
          <template #header>
            <span style="font-size: 16px; font-weight: 500">
              {{ $t('最近7天留存率') }}
            </span>
          </template>
          <el-skeleton animated :rows="7" :loading="loading">
            <template #default>
              <Bar />
            </template>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row> -->
  </div>
</template>

<style scoped>
 .num{
    padding: 0 10px;
    font-size: 12px;
    text-align: center;
    height: 20px;
    color: #fff;
    border-radius: 2px;
    margin-left: 10px;
  }

.agent-profile-card {
    width: 100%;
    border-radius: 5px;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: 1px 1px 3px 0rgba(0,0,0,.2);
    overflow: hidden
}

@media (max-width: 480px) {
    .agent-profile-card {
        border-radius:0
    }
}

.agent-profile-card .profile-account {
    display: flex;
    color: #fff;
    padding: 25px;
    box-sizing: border-box;
    background-image: url(//mcdn.pybydl.com/okb/packs/media/assets/images/user_msg_bg_2-aef5199c517009278c78c5b9df159e22.png),url(//mcdn.pybydl.com/okb/packs/media/assets/images/user_msg_bg-fa46ca5155a00ba7798a317dfc3cf70b.png),linear-gradient(45deg,#492a84 10%,#200657);
    ;background-position: 100% 100%,0 0,50%;
    background-repeat: no-repeat;
    background-size: cover,auto 70%,cover
}

@media (max-width: 480px) {
    .agent-profile-card .profile-account {
        padding:15px
    }
}

.agent-profile-card .profile-account-items {
    flex: 1 1
}

.agent-profile-card .profile-account-item {
    display: flex;
    font-size: 13px
}

.agent-profile-card .profile-account-item+.profile-account-item {
    padding-top: 1em
}

.agent-profile-card .profile-account-item .item-icon {
    display: inline-block;
    width: 43px;
    height: 50px;
    margin-right: 1em;
    vertical-align: middle;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: 50%
}

@media (max-width: 480px) {
    .agent-profile-card .profile-account-item .item-icon {
        width:30px;
        height: 30px
    }
}

.agent-profile-card .profile-account-item .item-icon.account {
    background-image: url(//mcdn.pybydl.com/okb/packs/media/assets/images/icon_user-27ae768b6f7b44cf5f2e4c7d152926e7.png)
}

.agent-profile-card .profile-account-item .item-icon.balance {
    background-image: url(//mcdn.pybydl.com/okb/packs/media/assets/images/icon_balance-7dcd5daf90614bf7b2a2004b74d17851.png)
}

.agent-profile-card .profile-account-item .item-content {
    display: inline-block;
    vertical-align: middle
}

.agent-profile-card .profile-account-item .min-title {
    color: hsla(0,0%,100%,.6)
}

@media (max-width: 480px) {
    .agent-profile-card .profile-account-item .min-title {
        display:none
    }
}

.agent-profile-card .profile-account-item .content-text {
    font-size: 1.7em
}

@media (max-width: 480px) {
    .agent-profile-card .profile-account-item .content-text {
        font-size:1.5em
    }
}

.agent-profile-card .profile-account-btns {
    display: flex;
    align-self: flex-end;
    margin-left: auto
}

@media (max-width: 320px),(min-width:769px) and (max-width:1500px) {
    .agent-profile-card .profile-account-btns {
        width:30%;
        flex-wrap: wrap
    }
}

.agent-profile-card .profile-account-btn {
    padding: 0 8px;
    box-sizing: border-box;
    margin: 4px;
    color: #fff;
    border: none
}

@media (max-width: 320px),(min-width:769px) and (max-width:1500px) {
    .agent-profile-card .profile-account-btn {
        width:100%
    }
}

.agent-profile-card .profile-account-btn.deposit {
    background-color: #ee6124
}

.agent-profile-card .profile-account-btn.deposit:hover {
    background-color: #f17945
}

.agent-profile-card .profile-account-btn.transfer {
    background-color: #6c4aaf
}

.agent-profile-card .profile-account-btn.transfer:hover {
    background-color: #7f61bc
}

.agent-profile-card .profile-account-referral {
    display: flex;
    align-items: center;
    padding: 0 0 0 20px;
    box-sizing: border-box
}

@media (max-width: 1440px) {
    .agent-profile-card .profile-account-referral .ant-btn {
        width:100%
    }

    .agent-profile-card .profile-account-referral .ant-btn+.ant-btn {
        margin-top: 10px
    }
}


.agent-profile-card .profile-account-referral .referral-code {
    font-size: 2em;
    color: #222
}

@media (max-width: 480px) {
    .agent-profile-card .profile-account-referral .referral-code {
        line-height:1
    }
}

.agent-profile-card .profile-account-referral .agent-qrcode {
    margin-left: auto
}

.agent-profile-card .referral-teams {
    display: flex;
    position: relative;
    padding: 20px;
    text-align: center;
    font-size: 12px
}

@media (min-width: 769px) {
    .agent-profile-card .referral-teams {
        font-size:14px
    }
}

.agent-profile-card .referral-teams:before {
    content: "";
    position: absolute;
    top: 0;
    left: 20px;
    width: calc(100% - 40px);
    height: 1px;
    background-color: #efefef
}

.agent-profile-card .referral-teams .item-text {
    font-size: 1em;
    color: #707070;
    margin-top: 5px;
    margin-bottom: 5px
}

.agent-profile-card .referral-teams .item-number {
    color: #222;
    font-size: 1.9em;
    line-height: 1.5
}

.agent-profile-card .referral-teams-title {
    box-sizing: border-box
}

@media (min-width: 769px) {
    .agent-profile-card .referral-teams-title {
        padding:8px 0
    }
}

.agent-profile-card .referral-teams-title .team-img {
    width: 38px;
    height: 38px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: 50%
}

@media (min-width: 769px) {
    .agent-profile-card .referral-teams-title .team-img {
        width:44px;
        height: 44px
    }
}

.agent-profile-card .referral-teams-title .team-img.agent {
    background-image: url(//mcdn.pybydl.com/okb/packs/media/assets/images/team_agent-7867fe954e4a47fd082e5f16ea7e8e92.svg)
}

.agent-profile-card .referral-teams-title .team-img.member {
    background-image: url(//mcdn.pybydl.com/okb/packs/media/assets/images/team_user-088db815fb3d0c532a53eed893da63f5.svg)
}

.agent-profile-card .referral-teams-total {
    margin: 0 auto;
    box-sizing: border-box
}

@media (min-width: 769px) {
    .agent-profile-card .referral-teams-total {
        padding:8px 0
    }
}

.agent-profile-card .referral-teams-total .item-number {
    font-size: 2em;
    font-weight: 700
}

.agent-profile-card .referral-teams-count {
    display: flex;
    align-items: center;
    width: 45%;
    box-sizing: border-box;
    border-radius: 5px;
    background-color: #edf1f8;
    margin-left: auto
}

@media (min-width: 769px) {
    .agent-profile-card .referral-teams-count {
        padding:8px 0
    }
}

.agent-profile-card .referral-teams-count .item-content {
    flex: 1 1
}

.agent-profile-card .referral-teams-count .item-content+.item-content {
    border-left: 1px solid #fff
}
</style>
