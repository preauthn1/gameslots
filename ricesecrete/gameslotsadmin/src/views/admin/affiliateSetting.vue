<script setup lang='ts'>
// @ts-ignore
import commForm from '@/components/comm/comm-form2.vue'
import commFormS from '@/components/comm/comm-forms.vue'
import { reactive, ref, defineAsyncComponent } from 'vue';
import { affiliateEdit } from "@/api/user";
import { Delete, Plus } from '@element-plus/icons-vue'
import { message } from "@/utils/message";
import { http } from '@/utils/http';
defineOptions({
  name: 'systemSetting'
})

const lang = {
  lang: {
    type: 'select',
    label: '语种类型',
    placeholder: '语种类型',
    prop: 'lang',
    options: [
      {
        label: 'Facebook',
        value: 'Facebook',
      },
      {
        label: 'WhatsApp',
        value: 'WhatsApp',
      },
      {
        label: 'Telegram',
        value: 'Telegram',
      },
      {
        label: 'Twitter',
        value: 'Twitter',
      },
      {
        label: 'Email',
        value: 'Email',
      },
    ]
  }
}
const langRules = {

}
const langBox = reactive({ lang })
//控制面板设置变化
const langChange = ({ value, index }) => {
  langBox.lang[index].value = value;
  boxObj.langModel[index] = value;
  init();
}
//基础数据变化
const langModel = {
  lang: ''
}

//控制面板
const summary = {
  today_tip: {
    type: 'slot',
    label: '今日-数据提示说明',
    placeholder: '今日-数据提示说明',
    value: '',
    name: 'today_tip',
    prop: 'today_tip'
  },
  all_tip: {
    type: 'slot',
    label: '全部-数据提示说明',
    placeholder: '全部-数据提示说明',
    value: '',
    name: 'all_tip',
    prop: 'all_tip'
  },
  team_url: {
    type: 'input',
    label: '团队-数据提示说明链接地址',
    placeholder: '团队-数据提示说明链接地址',
    value: '',
    prop: 'team_url'
  }
}
const summaryRules = {

}
const summaryBox = reactive({ summary })
//控制面板设置变化
const summaryChange = ({ value, index }) => {
  summaryBox.summary[index].value = value;
  boxObj.summaryModel[index] = value;
}
//基础数据变化
const summaryModel = {
  today_tip: '',
  all_tip: '',
  team_url: ''
}

//分享信息
const share = {
  share_title: {
    type: 'input',
    label: '分享信息标题',
    placeholder: '分享信息标题',
    value: '',
    prop: 'share_title'
  },
  share_intro: {
    type: 'input',
    label: '分享信息说明',
    placeholder: '分享信息说明',
    value: '',
    prop: 'share_intro'
  },
  share_platform: {
    type: 'select',
    label: '类型',
    placeholder: '类型',
    prop: 'share_platform',
    multiple: true,
    options: [
      {
        label: 'Facebook',
        value: 'Facebook',
      },
      {
        label: 'WhatsApp',
        value: 'WhatsApp',
      },
      {
        label: 'Telegram',
        value: 'Telegram',
      },
      {
        label: 'Twitter',
        value: 'Twitter',
      },
      {
        label: 'Email',
        value: 'Email',
      },
    ]
  }
};
const shareBox = reactive({ share })
const shareRules = {}
const shareChange = ({ value, index }) => {
  shareBox.share[index].value = value;
  boxObj.shareModel[index] = value;
}
const shareModel = {
  share_title: '',
  share_intro: '',
  share_platform: []
}


//平台服务信息
const service = {
  service_title: {
    type: 'input',
    label: '服务群聊标题',
    placeholder: '服务群聊标题',
    value: '',
    prop: 'service_title'
  },
  service_info: {
    type: 'input',
    label: '服务群聊简介',
    placeholder: '服务群聊简介',
    value: '',
    prop: 'service_info'
  },
  service_tip: {
    type: 'input',
    label: '提示信息',
    placeholder: '提示信息',
    value: '',
    prop: 'service_tip'
  },
  service_contact: {
    type: 'input',
    label: '联系方式',
    placeholder: '联系方式',
    value: '',
    prop: 'service_contact'
  },
  service_platform: {
    type: 'select',
    label: '类型',
    placeholder: '类型',
    prop: 'share_platform',
    options: [
      {
        label: 'Facebook',
        value: 'Facebook',
      },
      {
        label: 'WhatsApp',
        value: 'WhatsApp',
      },
      {
        label: 'Telegram',
        value: 'Telegram',
      },
      {
        label: 'Twitter',
        value: 'Twitter',
      },
      {
        label: 'Email',
        value: 'Email',
      },
    ]
  }
};
const serviceBox = reactive({ service })
const serviceRules = {}
const serviceChange = ({ value, index }) => {
  serviceBox.service[index].value = value;
  boxObj.serviceModel[index] = value;
}
const serviceModel = {
  service_title: '',
  service_info: '',
  service_tip: '',
  service_contact: '',
  service_platform: ''
}


//常问问题
const issues = {
  issues_list: {
    type: 'select',
    label: '常问问题',
    placeholder: '常问问题',
    prop: 'share_platform',
    multiple: true,
    options: [
      {
        label: 'Facebook',
        value: 'Facebook',
      },
      {
        label: 'WhatsApp',
        value: 'WhatsApp',
      },
      {
        label: 'Telegram',
        value: 'Telegram',
      },
      {
        label: 'Twitter',
        value: 'Twitter',
      },
      {
        label: 'Email',
        value: 'Email',
      },
    ]
  }
};
const issuesBox = reactive({ issues })
const issuesRules = {}
const issuesChange = ({ value, index }) => {
  issuesBox.issues[index].value = value;
  boxObj.issuesModel[index] = value;
}
const issuesModel = {
  issues_list: []
}


//佣金奖励规则
const rule = {
  rule_title: {
    type: 'input',
    label: '佣金奖励规则标题',
    placeholder: '佣金奖励规则标题',
    value: '',
    prop: 'title'
  },
  rule_info: {
    type: 'input',
    label: '佣金奖励规则说明',
    placeholder: '佣金奖励规则说明',
    value: '',
    prop: 'info'
  },
  brokerage_min: {
    type: 'input',
    ty: 'number',
    label: '规则区间最小值',
    placeholder: '规则区间最小值',
    value: '',
    prop: 'brokerage_min'
  },
  brokerage_max: {
    type: 'input',
    ty: 'number',
    label: '规则区间最大值',
    placeholder: '规则区间最大值',
    value: '',
    prop: 'brokerage_max'
  },
  brokerage_ratio: {
    type: 'input',
    ty: 'number',
    label: '规则区间比例',
    placeholder: '规则区间比例',
    value: '',
    prop: 'brokerage_ratio'
  },
  pop_info: {
    type: 'slot',
    label: '奖励规则说明',
    placeholder: '奖励规则说明',
    value: '',
    name: 'pop_info',
    prop: 'pop_info'
  },
  pop_explain: {
    type: 'slot',
    label: '奖励规则补充',
    placeholder: '奖励规则补充',
    value: '',
    name: 'pop_explain',
    prop: 'pop_explain'
  }
};
const ruleBox = reactive({ rule })
const ruleRules = {}
const ruleChange = ({ value, index }) => {
  ruleBox.rule[index].value = value;
  boxObj.ruleModel[index] = value;
}
const ruleModel = {
  rule_title: '',
  rule_info: '',
  brokerage_min: 10,
  brokerage_max: 10000,
  brokerage_ratio: 50,
  pop_info: '',
  pop_explain: ''
}

//佣金计算规则
const course = {
  calculate_title: {
    type: 'input',
    label: '佣金计算规则标题',
    placeholder: '佣金计算规则标题',
    value: '',
    prop: 'calculate_title'
  },
  calculate_text: {
    type: 'slot',
    label: '佣金计算规则',
    placeholder: '佣金计算规则',
    value: '',
    name: 'calculate_text',
    prop: 'calculate_text'
  }
};
const courseBox = reactive({ course })
const courseRules = {}
const courseChange = ({ value, index }) => {
  courseBox.course[index].value = value;
  boxObj.courseModel[index] = value;
}
const courseModel = {
  calculate_title: '',
  calculate_text: ''
}


const boxObj = reactive({
  langModel,
  summaryModel,
  shareModel,
  serviceModel,
  issuesModel,
  ruleModel,
  courseModel
})


init();
function init() {
  affiliateEdit({ find: true, lang: langModel.lang }).then((res: any) => {
    if (res.code == 1) {
      // assginMent();
      assginMent(langModel, 'langModel', res.data, 'lang');
      assginMent(summaryModel, 'summaryModel', res.data, 'summary')
      assginMent(shareModel, 'shareModel', res.data, 'share')
      assginMent(serviceModel, 'serviceModel', res.data, 'service')
      assginMent(issuesModel, 'issuesModel', res.data, 'issues')
      assginMent(ruleModel, 'ruleModel', res.data, 'rule')
      assginMent(courseModel, 'courseModel', res.data, 'course')
    }
  })
}
//赋值
function assginMent(list, name, data, val) {
  for (const key in list) {
    boxObj[name][key] = data[key]
    if (val == 'lang') {
      lang.lang.options = data['langs']
      langBox.lang[key].value = data[key]
    }
    boxObj[name][key] = data[key]
    if (val == 'summary') {
      summaryBox.summary[key].value = data[key]
    }
    if (val == 'share') {
      share.share_platform.options = data['platform_list_arr']
      shareBox.share[key].value = data[key]
    }
    if (val == 'service') {
      service.service_platform.options = data['platform_list_arr']
      serviceBox.service[key].value = data[key]
    }
    if (val == 'issues') {
      issues.issues_list.options = data['issues_list_arr']
      issuesBox.issues[key].value = data[key]
    }
    if (val == 'rule') {
      ruleBox.rule[key].value = data[key]
    }
    if (val == 'course') {
      courseBox.course[key].value = data[key]

    }
  }
}

const handleSave = () => {
  const query = {
    edit: true,
    info: {
      ...boxObj.langModel,
      ...boxObj.summaryModel,
      ...boxObj.shareModel,
      ...boxObj.serviceModel,
      ...boxObj.issuesModel,
      ...boxObj.ruleModel,
      ...boxObj.courseModel
    }
  }
  affiliateEdit(query).then((res: any) => {
    if (res.code == 1) {
      message(res.msg, { type: 'success' });
    } else {
      message(res.msg, { type: 'error' });
    }
  })
}

const editorEleDayTip = (val) => {
  summaryModel.today_tip = val
  // dialogModel.gi_info = val
}

const editorEleAllTip = (val) => {
  summaryModel.all_tip = val
  // dialogModel.gi_info = val
}

const editorElePopInfo = (val) => {
  ruleModel.pop_info = val
  // dialogModel.gi_info = val
}

const editorElePopExplain = (val) => {
  ruleModel.pop_explain = val
  // dialogModel.gi_info = val
}


const editorEleCalculateText = (val) => {
  courseModel.calculate_text = val
  // dialogModel.gi_info = val
}

</script>

<template>
  <div>
    <div class=" line-box">
      <div class="flex-bc flex-fi">
        <div>
          <commFormS title="保存" @save="handleSave" :dialogObj="boxObj.langModel" @currentChage="langChange"
            :listRules="langRules" :list="langBox.lang"/>
        </div>
        <div>
          <el-button type="primary" @click="handleSave">{{ $t('保存') }}</el-button>
        </div>
      </div>
    </div>
    <el-tabs type="border-card" class="systemFrom">
      <el-tab-pane :label="$t('控制面板')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.summaryModel" @currentChage="summaryChange"
          :listRules="summaryRules" :list="summaryBox.summary">
          <template v-slot:today_tip>
            <component @chage="editorEleDayTip" :content="summaryBox.summary.today_tip.value"
              :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
          </template>
          <template v-slot:all_tip>
            <component @chage="editorEleAllTip" :content="summaryBox.summary.all_tip.value"
              :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
          </template>
        </commForm>
      </el-tab-pane>
      <el-tab-pane :label="$t('分享信息')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.shareModel" @currentChage="shareChange"
          :listRules="shareRules" :list="shareBox.share" />
      </el-tab-pane>
      <el-tab-pane :label="$t('平台服务信息')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.serviceModel" @currentChage="serviceChange"
          :listRules="serviceRules" :list="serviceBox.service" />
      </el-tab-pane>
      <el-tab-pane :label="$t('常问问题')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.issuesModel" @currentChage="issuesChange"
          :listRules="issuesRules" :list="issuesBox.issues" />
      </el-tab-pane>
      <el-tab-pane :label="$t('奖励规则')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.ruleModel" @currentChage="ruleChange"
          :listRules="ruleRules" :list="ruleBox.rule">
          <template v-slot:pop_info>
            <component @chage="editorElePopInfo" :content="ruleBox.rule.pop_info.value"
              :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
          </template>
          <template v-slot:pop_explain>
            <component @chage="editorElePopExplain" :content="ruleBox.rule.pop_explain.value"
              :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
          </template>
        </commForm>
      </el-tab-pane>
      <el-tab-pane :label="$t('计算规则')">
        <commForm title="保存" @save="handleSave" :dialogObj="boxObj.courseModel" @currentChage="courseChange"
          :listRules="courseRules" :list="courseBox.course">
          <template v-slot:calculate_text>
            <component @chage="editorEleCalculateText" :content="courseBox.course.calculate_text.value"
              :is="defineAsyncComponent(()=> import('@/views/editor/index.vue'))" />
          </template>
        </commForm>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.input-item {
  width: 50%;
  margin-bottom: 15px;
  margin-right: 15px;
}

.input-item-box {
  flex-wrap: wrap;
}

.input-item-btn {
  margin-bottom: 30px;
}

.line-box {
  margin-bottom: 15px;
}

.systemFrom ::v-deep .el-form-item__content>div {
  width: 80%;
}
</style>
