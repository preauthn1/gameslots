<script setup lang='ts'>
// @ts-ignore
import commForm from '@/components/comm/comm-form2.vue'
import { reactive,ref,defineAsyncComponent } from 'vue';
import { systemEdit } from "@/api/user";
 import { Delete,Plus} from '@element-plus/icons-vue'
import { message } from "@/utils/message";
import { http } from '@/utils/http';
defineOptions({
  name: 'websiteSetting'
})
//基础设置
const  website = {
   website_name:{
    type: 'input',
    label: '网站名称',
    placeholder: '网站名称',
    value: '',
    prop:'website_name'
  },
  website_web_url:{
    type: 'input',
    label: '网站域名',
    placeholder: '网站域名',
    tip: '域名，多个英文逗号隔开，例：https://test.com,https://test1.com',
    value: '',
    prop:'website_web_url'
  },
  website_favicon:{
    type: 'file',
    label: '浏览器icon',
    placeholder: '浏览器icon',
    tip: '浏览器icon（32*32）',
    value: '',
    prop:'website_favicon'
  },
  website_pc_logo:{
    type: 'file',
    label: 'PC端 LOGO',
    placeholder: 'PC端 LOGO',
    tip: 'PC端 LOGO（284*70）',
    value: '',
    prop:'website_pc_logo'
  },
  website_desktop_logo:{
    type: 'file',
    label: '桌面 LOGO',
    placeholder: '桌面 LOGO',
    tip: '移动端保存到桌面的LOGO（1024*1024）',
    value: '',
    prop:'website_desktop_logo'
  },
  website_mobile_logo:{
    type: 'file',
    label: '移动端 LOGO',
    placeholder: '移动端 LOGO',
    tip: '移动端 LOGO（100*100）',
    value: '',
    prop:'website_mobile_logo'
  },
  android_download_url:{
    type: 'file',
    label: '安卓下载链接',
    placeholder: '安卓下载链接',
    value: '',
    prop:'android_download_url'
  },
  ios_download_url:{
    type: 'file',
    label: 'iOS下载链接',
    placeholder: 'iOS下载链接',
    value: '',
    prop:'ios_download_url'
  },
  pc_service_url:{
    type: 'input',
    label: 'pc端客服链接',
    placeholder: 'pc端客服链接',
    value: '',
    prop:'pc_service_url'
  },
  mobile_service_url:{
    type: 'input',
    label: '移动端客服链接',
    placeholder: '移动端客服链接',
    value: '',
    prop:'mobile_service_url'
  },
  quick_recharge:{
    type: 'input',
    label: '快捷银行充值金额',
    placeholder: '快捷银行充值金额',
    tip: '快捷银行充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop:'quick_recharge'
  },
  usdt_quick_recharge:{
    type: 'input',
    label: '快捷USDT充值金额',
    placeholder: '快捷USDT充值金额',
    tip: '快捷usdt充值金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop:'usdt_quick_recharge'
  },
  quick_withdrawal:{
    type: 'input',
    label: '快捷银行提现金额',
    placeholder: '快捷银行提现金额',
    tip: '快捷银行提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop:'quick_withdrawal'
  },
  usdt_quick_withdrawal:{
    type: 'input',
    label: '快捷USDT提现金额',
    placeholder: '快捷USDT提现金额',
    tip: '快捷usdt提现金额设置，每个数字以英文“,”隔开,格式：1000,5000,10000',
    value: '',
    prop:'usdt_quick_withdrawal'
  },
  phone_bind:{
    type: 'radio',
    label: '注册账号类型',
    placeholder: '注册账号类型',
    value: 3,
    options: [
      {
        label: 1,
        name:'手机'
      },
      {
        label: 2,
        name:'邮箱'
      },
      {
        label: 3,
        name:'同时开启'
      },
    ],
    prop:'phone_bind'
  },
  is_reg_type:{
    type: 'radio',
    label: '需要额外填信息',
    placeholder: '需要额外填信息',
    tip: '当注册类型选择单个类型时是否需要另外填写[手机/邮箱]资料',
    value: 0,
    options: [
      {
        label: 1,
        name:'手机'
      },
      {
        label: 2,
        name:'邮箱'
      },
      {
        label: 0,
        name:'否'
      },
    ],
    prop:'is_reg_type'
  },
  phone_check:{
    type: 'radio',
    label: '注册验证码',
    placeholder: '注册验证码',
    value: 0,
    options: [
      {
        label: 1,
        name:'开启'
      },
      {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'phone_check'
  },
  parent_allot:{
    type: 'radio',
    label: '上级随机',
    placeholder: '上级随机',
    tip: '开启后使用上面域名注册的用户，注册的用户上级为该代理的子代理（平均分配）',
    value: 0,
    options: [
      {
        label: 1,
        name:'开启'
      },
      {
        label: 0,
        name:'关闭'
      },
    ],
    prop:'parent_allot'
  },
  website_status:{
    type: 'radio',
    label: '状态',
    placeholder: '状态',
    tip: '开启后所有域名及类目才会生效',
    value: 0,
    options: [
      {
        label: 1,
        name:'启用'
      },
      {
        label: 0,
        name:'禁用'
      },
    ],
    prop:'website_status'
  },
}
const websiteRules = {

}
const websiteBox = reactive({ website })
//基础设置变化
const websiteChange = ({value,index}) => {
     websiteBox.website[index].value = value;
     boxObj.websiteModel[index] = value;
}
//基础数据变化
const websiteModel = {
    website_name: '',
    website_web_url: '',
    website_favicon: '',
    website_pc_logo: '',
    website_desktop_logo: '',
    website_mobile_logo: '',
    website_status: 0,
    android_download_url: '',
    ios_download_url: '',
    pc_service_url: '',
    mobile_service_url: '',
    
    quick_recharge: '',
    quick_withdrawal: '',
    usdt_quick_recharge: '',
    usdt_quick_withdrawal: '',
    phone_bind: '',
    is_reg_type: '',
    phone_check: '',
    parent_allot: '',
}

const boxObj = reactive({
  websiteModel,
})
init();
function init() {
  systemEdit({ find: true }).then((res: any) => {
    if (res.code == 1) {
      // assginMent();
      assginMent(websiteModel, 'websiteModel', res.data, 'website')
    }
  })
}
//赋值
function assginMent(list, name, data, val) {
  for (const key in list) {
    boxObj[name][key] = data[key]
    websiteBox.website[key].value = data[key]
  }
}

const handleSave = () => {
  const query = {
    edit: true,
    info: {
      ...boxObj.websiteModel,
    }
  }
  systemEdit(query).then((res: any) => {
    if (res.code == 1) {
        message(res.msg, { type: 'success' });
      } else {
        message(res.msg, { type: 'error' });
      }
  })
}
const isclear = ref(false);
const clearCache = () => {
  if (isclear.value) {
    return
  }
  isclear.value = true;
  http.get("/system/clear_cache").then((res: any) => {
    isclear.value = false;
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}
</script>

<template>
  <div>
    <div class=" line-box">
       <div class="flex-bc flex-fi" >
        <!-- <div>
          <el-button type="primary" @click="handleSave">{{ $t('保存') }}</el-button>
          <el-button :loading="isclear" type="primary" @click="clearCache">{{ $t('清除缓存') }}</el-button>
        </div> -->
      </div>
    </div>
    <el-tabs type="border-card" class="systemFrom">
      <commForm title="保存" @save="handleSave" :dialogObj="boxObj.websiteModel" @currentChage="websiteChange" :listRules="websiteRules" :list="websiteBox.website" />
    </el-tabs>
  </div>
</template>

<style scoped>
  .input-item{
    width:50%;
    margin-bottom:15px;
    margin-right: 15px;
  }
  .input-item-box{
    flex-wrap: wrap;
  }
  .input-item-btn{
    margin-bottom:30px;
  }
  .line-box{
    margin-bottom: 15px;
  }
  .systemFrom ::v-deep .el-form-item__content > div {
    width:80%;
  }
</style>
