<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
    <audio id="audioDown" ref="audioDown">
      <source src="@/assets/down.mp3"/>
    </audio>
    <audio id="audioUp" ref="audioUp">
      <source src="@/assets/up.mp3"/>
    </audio>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider, ElMessageBox, ElNotification } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import en from "element-plus/lib/locale/lang/en";
import { useUserStoreHook } from "@/store/modules/user";
import { parseMsg } from "./utils/global";
import { ReDialog } from "@/components/ReDialog";
// import { useGlobal } from "@pureadmin/utils";
// const { $storage } = useGlobal<GlobalPropertiesApi>();

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  computed: {
    currentLocale() {
      return this.$storage.locale?.locale === "cn" ? zhCn : en;
    }
  },
  mounted() {
    useUserStoreHook().initSocket(this.receiveMessage)
  },
  methods: {
    playDownAudio() {
      this.$refs.audioDown.play()
      // (this.audioDom as any).play();
      // if ((audioDom.value)?.paused) {
      // }
    },
    playUpAudio() {
      this.$refs.audioUp.play()
      // (this.audioDom as any).play();
      // if ((audioDom.value)?.paused) {
      // }
    },
    // 消息接收
    receiveMessage(e: any) {
      // console.log('LineOpenState',this.$storage.configure.LineOpenState);
      // console.log('offLineOpenState',this.$storage.configure.offLineOpenState);
      // console.log('WithdrawalOpenState',this.$storage.configure.WithdrawalOpenState);
    

      if (e) {
        const params = parseMsg(e.data);
        // console.log(params);
        if (params["order"] == "msg") {
          params["title"] = decodeURIComponent(params["title"]);
          params["msg"] = decodeURIComponent(params["msg"]);
          if((this.$storage.configure.LineOpenState) && (params['type'] == 1)){
            //线下充值
            this.playUpAudio()
          }
          if((this.$storage.configure.offLineOpenState) && (params['type'] == 2)){
            //线上充值
            this.playUpAudio()
          }
          if((this.$storage.configure.WithdrawalOpenState) && (params['type'] == 3)){
            //提现
            this.playDownAudio()
          }
          switch (params["mode"]) {
            case "toast":
              ElNotification({
                title: params["title"],
                message: params["msg"],
                type: "info"
              });
              break;
            case "pop":
              ElMessageBox.alert(params["msg"], params["title"]);
              break;
          }
        }
      }
    },
  }
});
</script>
<style>
::selection {
  background: rgb(59 130 246 / 0.8);
  color: #FFF;
}
</style>
