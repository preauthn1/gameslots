<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { transformI18n } from '@/plugins/i18n';
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { loginRules } from "./utils/rule";
import { initRouter } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";
import { message } from "@pureadmin/components";
import type { FormInstance } from "element-plus";
// import { transformI18n } from "@/plugins/i18n";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { loginCaptcha } from "@/api/user";
// import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
// import { ReImageVerify } from "@/components/ReImageVerify";
import { ref, reactive, toRaw, onMounted, onBeforeUnmount } from "vue";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import globalization from "@/assets/svg/globalization.svg?component";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

// const { t } = useI18n();
const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translation, locales } = useTranslationLang();

const ruleForm = reactive({
  username: "",
  password: "",
  code: "",
  code_key: "",
  google_code: ""
});

//获取验证码
const captchaImg = ref("");
captcha();
function captcha() {
  loginCaptcha().then((res: any) => {
    if (res.code == 1) {
      captchaImg.value = res.data.base64;
      ruleForm.code_key = res.data.key;
    }
  });
}
const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl || ruleForm.code_key == "") return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername(ruleForm)
        .then(res => {
          if (res.code == 1) {
            // useUserStoreHook().initSocket();
            // 获取后端路由
            initRouter().then(() => {
              message.success(transformI18n("登录成功"));
              // console.log('登录陈工了');
              // console.log(router);
              router.push("/");
            });
          } else {
            ruleForm.code = "";
            captcha();
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      return fields;
    }
  });
};

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div>
    <div class="absolute flex-c right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
      <!-- 国际化 -->
      <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              v-for="(item, index) in locales()" :key="index"
              :style="getDropdownItemStyle(locale, item.value)"
              :class="['dark:!text-white', getDropdownItemClass(locale, item.value)]"
              @click="translation(item.value)"
            >
              <IconifyIconOffline
                class="check-zh"
                v-show="locale === item.value"
                icon="check"
              />
              <el-image :src="item.icon" style="width:16px; margin-right: 6px;" />{{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="login-page">
      <div class="login-page-lt hidden-sm-and-down">
        <div class="txt2">&nbsp;</div>
        <div class="txt2">&nbsp;</div>
        <div class="txt2">{{ $t('超越极限，创造辉煌') }}</div>
        <div class="txt3">
          {{ $t('无限可能，拒绝设限，创造辉煌人生') }}
        </div>
      </div>
      <div class="login-container">
        <!-- <div class="img">
        <component :is="toRaw(illustration)" />
      </div> -->
        <div class="login-box">
          <div class="login-form">
            <!-- <avatar class="avatar" /> -->
            <!-- <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion> -->
            <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="loginRules"
              size="large"
            >
              <el-form-item>
                <h1 class="login-title">{{ $t('代理登录') }}</h1>
              </el-form-item>
              <Motion :delay="100">
                <el-form-item
                  class="login-item"
                  size="large"
                  :rules="[
                    {
                      required: true,
                      message: $t('请输入账号'),
                      trigger: 'blur'
                    }
                  ]"
                  prop="username"
                >
                  <el-input
                    clearable
                    :input-style="{ height: '50px' }"
                    v-model="ruleForm.username"
                    :placeholder="$t('账号')"
                    :prefix-icon="useRenderIcon('user')"
                  />
                </el-form-item>
              </Motion>

              <Motion :delay="150">
                <el-form-item prop="password" class="login-item">
                  <el-input
                    :input-style="{ height: '50px' }"
                    clearable
                    show-password
                    v-model="ruleForm.password"
                    :placeholder="$t('密码')"
                    :prefix-icon="useRenderIcon('lock')"
                  />
                </el-form-item>
              </Motion>

              <Motion :delay="200">
                <el-form-item
                  prop="code"
                  class="login-item"
                  :rules="[
                    {
                      required: true,
                      message: $t('请输入验证码'),
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input
                    :input-style="{ height: '50px' }"
                    clearable
                    v-model="ruleForm.code"
                    :placeholder="$t('请输入验证码')"
                    :prefix-icon="useRenderIcon('ri:shield-keyhole-line')"
                  >
                    <template #append>
                      <div class="captchaImg-box" @click="captcha">
                        <img :src="captchaImg" alt="" />
                      </div>
                    </template>
                  </el-input>
                </el-form-item>
              </Motion>
              <!-- <Motion :delay="150">
                <el-form-item prop="google_code" class="login-item">
                  <el-input
                    :input-style="{ height: '50px' }"
                    clearable
                    v-model="ruleForm.google_code"
                    :placeholder="$t('谷歌验证码 (未绑定不填)')"
                    :prefix-icon="useRenderIcon('lock')"
                  />
                </el-form-item>
              </Motion> -->
              <Motion :delay="250">
                <el-button
                  class="w-full mt-4 loginBtn"
                  size="large"
                  type="primary"
                  :loading="loading"
                  @click="onLogin(ruleFormRef)"
                >
                  {{ $t("登录") }}
                </el-button>
              </Motion>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
// .select-none{
//   background-image: url(@/assets/login/login_bg2.webp);
//   background-repeat: no-repeat;
//   background-size: cover;
//   width:100%;height: 100vh;
// }

.login-page-lt {
  width: 60%;
  background-image: linear-gradient(
      90deg,
      rgba(3, 18, 43, 0.75) 0%,
      rgba(3, 18, 43, 0) 100%
    ),
    url(@/assets/login/login_bg3.webp);
  background-position: center;
  background-size: cover;
  padding: 4.5rem;
  color: #fff;
  .txt1 {
    font-size: 42px;
    font-weight: 500;
    margin-bottom: 30px;
  }
  .txt2 {
    font-size: 57px;
    line-height: 65px;
    font-weight: 600;
  }
  .txt3 {
    margin-top: 20px;
    font-size: 27px;
  }
}
.login-item {
  padding: 8px 0;
  margin-bottom: 20px;
}
.login-title {
  font-size: 2.2rem;
  font-weight: 500;
  margin-bottom: 40px;
}
.login-page {
  display: flex;
  justify-content: space-between;
}

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
.captchaImg-box {
  background-color: #fff;
  cursor: pointer;
  img {
    height: 100%;
    width: 100%;
  }
}
.loginBtn {
  height: 50px;
}
</style>
