<template>
  <el-upload
    :action=action
    :show-file-list="false"
    :headers="headers"
    name="file"
    :on-success="handleSuccess"
    :on-error="handleError"
    :before-upload="beforeUpload"
    :disabled="loading"
    :data="data"
  >
    <el-button :loading="loading" type="primary">{{ $t(text) }}</el-button>
  </el-upload>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
// import { ElMessage } from 'element-plus'
import { baseUrlApi } from '@/utils/http/configUrl'
import type { UploadFile, UploadFiles, UploadProps } from 'element-plus'
import { getToken } from "@/utils/auth";
import { message } from '@/utils/message';
import { computed } from 'vue';
import { transformI18n } from '@/plugins/i18n';

const props = defineProps({
  text: {
    type: String,
    default: '上传'
  },
  loading: Boolean,
  data: Object
})

const token = getToken();
const headers = reactive({
     "usertoken": token.token,
     "usertokenkey": token.token_key
})
const data = computed(() => {
  return props.data
})
const emit = defineEmits(['success'])
const action = baseUrlApi('/upload/upload_file');
const handleSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  if (response.code == 0) {
    message(response.msg, {type: 'error'})
    return
  }
  emit('success',response.data)
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
  //   ElMessage.error('请上传图片格式 !')
  //   return false
  // }
  // else if (rawFile.size / 1024 / 1024 > 3) {
  //   ElMessage.error('上传图片不超过 3MB!')
  //   return false
  // }
  return true
}
const handleError = (error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  message(transformI18n('上传文件出错了'), {type: 'error'})
}
</script>
