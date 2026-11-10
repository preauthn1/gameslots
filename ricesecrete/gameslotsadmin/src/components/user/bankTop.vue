<script setup lang='ts'>
import { hasAuth } from "@/router/utils";
import { ref, computed } from "vue";
const props = defineProps<{
  placeholder: string,
  recycle_bin: number,
  currency: any
}>();
const emit = defineEmits(['search','delete','back','backstation', 'export'])
const handleSerch = () => {
  emit('search', {id:id.value, keyword:keyword.value, currency_id:currency_id.value,bank_type:bank_type})
}
const handleExport = () => {
  emit('export', {id:id.value, keyword:keyword.value, currency_id:currency_id.value,bank_type:bank_type})
}
const currency = computed(() => {
  return props.currency
});
const id = ref('');
const keyword = ref('');
const bank_type = ref('');
const currency_id = ref('')
</script>


<template>
  <div>
      <el-row :gutter="15">
        <el-col :span="4">
          <el-select clearable  v-model="currency_id" :placeholder="$t('货币')">
            <el-option v-for="(cell,idx) in currency" :key="idx" :label="cell.label" :value="cell.value" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-model="id" placeholder="ID" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="bank_type" placeholder="类型" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="keyword" :placeholder="$t(placeholder)" />
        </el-col>
        <el-col :span="2">
          <el-button class="bankcard-box1-btn" @click="handleSerch" type="primary">{{ $t('搜索') }}</el-button>
        </el-col>
        <el-col :span="1">
          <el-button class="bankcard-box1-btn" @click="handleExport" type="primary">{{ $t('导出') }}</el-button>
        </el-col>
      </el-row>
      <div class="bankcard-box2">
        <template v-if="recycle_bin !=1">
          <el-button v-if="hasAuth('delete')" class="bankcard-box2-btn" type="danger" @click="emit('delete')">{{ $t('删除') }}</el-button>
          <el-button v-if="hasAuth('recycle_bin')" class="bankcard-box2-btn" type="primary" @click="emit('backstation')">{{ $t('回收站') }}</el-button>
        </template>
        <template v-else>
          <el-button class="bankcard-box2-btn" type="primary" @click="emit('back')">{{ $t('返回') }}</el-button>
        </template>
      </div>
  </div>
</template>

<style scoped lang="scss">
.bankcard-box2{
  margin:20px 0;
}
</style>
