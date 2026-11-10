<script setup lang='ts'>
// @ts-ignore
import commForm from '@/components/comm/comm-form2.vue'
import { reactive,ref,defineAsyncComponent } from 'vue';
import { walletEdit } from "@/api/user";
import { message } from "@/utils/message";
defineOptions({
  name: 'walletSystem'
})
//基础设置
const  wallet = {
  wallet_type:{
    type: 'radio',
    label: '钱包类型',
    placeholder: '钱包类型',
    value: '0',
    options: [
      {
        label: '0',
        name:'单钱包'
      },
      {
        label: '1',
        name:'双钱包'
      },
    ],
    prop:'wallet_type'
  },
  game_type:{
    type: 'radio',
    label: '游戏类型',
    placeholder: '游戏类型',
    value: '0',
    options: [
      {
        label: '0',
        name:'双钱包支持'
      },
      {
        label: '1',
        name:'仅现金钱包'
      },
      {
        label: '2',
        name:'仅彩金钱包'
      },
    ],
    prop:'game_type'
  },
  // game_type_ids:{
  //   type: 'slot',
  //   value: [],
  //   options: [],
  //   label: '选择平台',
  //   placeholder: '选择平台',
  //   prop:'game_type_ids',
  //   name:'game_type_ids',
  // },
  withdrawal_is_clear_cjbalance:{
    type: 'radio',
    label: '清除彩金',
    placeholder: '清除彩金',
    tip: '提现是否清除彩金和彩金流水',
    value: '0',
    options: [
      {
        label: '0',
        name:'否'
      },
      {
        label: '1',
        name:'是'
      },
    ],
    prop:'withdrawal_is_clear_cjbalance'
  },
}
const walletRules = {

}
const walletBox = reactive({ wallet })
//基础设置变化
const walletChange = ({value,index}) => {
     walletBox.wallet[index].value = value;
     boxObj.walletModel[index] = value;
}
//基础数据变化
const walletModel = {
    wallet_type: '0',
    game_type: '0',
    game_type_ids: [],
    withdrawal_is_clear_cjbalance: '0',
}

const boxObj = reactive({
  walletModel,
})
const platformIds: any = ref({});
init();
function init() {
  walletEdit({ find: true }).then((res: any) => {
    if (res.code == 1) {
      platformIds.value = res.data['gamesThird']
      assginMent(walletModel, 'walletModel', res.data)
    }
  })
}
//赋值
function assginMent(list, name, data) {
  for (const key in list) {
    console.log(key)
    boxObj[name][key] = data[key]
    walletBox.wallet[key].value = data[key]
  }
  console.log(walletModel)
}

const handleSave = () => {
  const query = {
    edit: true,
    info: {
      ...boxObj.walletModel,
    }
  }
  walletEdit(query).then((res: any) => {
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
      <commForm title="保存" @save="handleSave" :dialogObj="boxObj.walletModel" @currentChage="walletChange" :listRules="walletRules" :list="walletBox.wallet">
            <template #game_type_ids>
              <el-checkbox-group v-model="boxObj.walletModel.game_type_ids"> 
                <el-checkbox :label="item.label" v-for="item in platformIds" :key="item.value" :value="item.label" size="large"/>
              </el-checkbox-group>
            </template>
      </commForm>
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
