<template>
  <div>
    <div>
      <el-upload
          class="avatar-uploader"
          :action=action
          :show-file-list="false"
          :headers="headers"
          name="files[]"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <el-button v-if="button" type="primary">{{ $t('上传图片') }}</el-button>
          <div v-else>
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <!-- 添加删除按钮 -->
            <el-button v-if="imageUrl" type="danger" @click.stop="handleRemove">{{ $t('删除图片') }}</el-button>
          </div>
        </el-upload>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { baseUrlApi } from '@/utils/http/configUrl'
import type { UploadProps } from 'element-plus'
import { getToken } from "@/utils/auth";
import { transformI18n } from '@/plugins/i18n';

const token = getToken('token');
const token_key = getToken('token_key');
const headers = reactive({
  "Authorization": "Bearer " + token,
})
const props = defineProps({
  limit: Number,
  image: String,
  button: Boolean,
  size: Number
})
const image = computed(() => {
  return props.image;
})
const imageUrl = ref(image.value)
watch(() => props.image, (value) => {
  imageUrl.value = value
})
const size = computed(() => {
  return props.size ? props.size : 1024 * 1024 * 2; // 默认2MB
})
const emit = defineEmits(['imageData'])
const action = baseUrlApi('/upload/upload_img');
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  if (response.code != 1) {
    ElMessage.error(response.msg)
    return false
  }
  emit('imageData', response.data)
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(rawFile.type)) {
    ElMessage.error(transformI18n('图片格式仅支持:PNG,JPG,WEBP,GIF'))
    return false
  }
  else if (rawFile.size > size.value) {
    ElMessage.error(transformI18n('上传图片不能超过') + convertByteUnit(size.value))
    return false
  }
  return true
}

const BYTE = 1;
const KB = BYTE * 1024;
const MB = KB * 1024;
const GB = MB * 1024;

function convertByteUnit(limit) {
  if (limit == null || isNaN(limit)) {
    return "N/A";
  }

  let size, unit;
  if (limit < KB) {
    size = limit;
    unit = "B";
  } else if (limit < MB) {
    size = limit / KB;
    unit = "KB";
  } else if (limit < GB) {
    size = limit / MB;
    unit = "MB";
  } else {
    size = limit / GB;
    unit = "GB";
  }

  const sizeStr = size.toFixed(2);
  if (sizeStr.endsWith(".00")) {
    return sizeStr.slice(0, -3) + unit;
  }
  return sizeStr + unit;
}

// 添加删除图片的方法
const handleRemove = () => {
  imageUrl.value = '';
  emit('imageData', { file:['']});
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
}
</style>