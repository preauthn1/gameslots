<template>
  <audio id="audio" ref="audio">
    <source src="@/assets/notify.mp3"/>
  </audio>
  <el-dropdown ref="dropdownDom" trigger="click" placement="bottom-end" :label="$t('待办事项')">
    <span class="dropdown-badge navbar-bg-hover">
      <el-badge :value="noticesNum" :hidden="noticesNum <= 0" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline icon="bell" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu class ="message-box">
        <a v-for="item in notices" :key="item.key" @click="countClick(item.name)">
            <span class="message-item">{{ $t(item.title) }}(<el-label class="message-count">{{item.count}}</el-label>)</span>
        </a>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref,reactive } from "vue";
import { todoMessage } from "@/api/user";
import { noticesData } from "./data";
import { router } from "@/router";

// @ts-ignore
import NoticeList from "./noticeList.vue";
import { templateRef } from "@vueuse/core";
import { Tabs, TabPane } from "@pureadmin/components";

const dropdownDom = templateRef<ElRef | null>("dropdownDom", null);
const activeName = ref(noticesData[0].name);
const notices = ref(noticesData);
const noticesNum = ref(0);


getMessageCount();
function getMessageCount(){
  todoMessage().then((res: any) => {
    if (res.code == 1) {
      let data = res.data;
      let messageCount = 0;
      notices.value.forEach(notice => {
          notice.count = data[notice.name]
          messageCount += notice.count * 1;
      });
      noticesNum.value = messageCount;
      if(data.ismsg == 1){
        (audio as any).play();
      }
      setTimeout(() => {
        getMessageCount()
      }, 10000);
    }
  })
}

function countClick(name) {
  let url = '';
  if(name == "offlin"){
    url = "/offline/useroffline";
  } else if(name == "withdrawal"){
    url = "/offline/userwithdrawal";
  }else if(name == "action"){
    url = "/huodongguanli/applyManage";
  }
  router.push(url)
  //(dropdownDom as any).value.handleOpen();
}
</script>

<style>
.message-box{
  width: 200px;
  padding: 5px 0 !important;
}
.message-item{
  padding: 5px 15px;
  display: block;
}

.message-count{
  padding: 0px 5px;
  color: #ff0000;
}

.ant-tabs-dropdown {
  z-index: 2900 !important;
}
</style>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 60px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  width: 336px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  border-radius: 4px;

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-scroll) {
    display: flex;
    justify-content: center;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.noticeList-container) {
    padding: 15px 24px 0 24px;
  }
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>
