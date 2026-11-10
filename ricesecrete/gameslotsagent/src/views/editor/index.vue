<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
// import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { onBeforeUnmount, ref, shallowRef } from "vue";
import { baseUrlApi } from '@/utils/http/configUrl'
import { getToken } from "@/utils/auth";
const token = getToken('token');
const token_key = getToken('token_key');
defineOptions({
  name: "Editor"
});
const valueHtml = ref("");
const emit = defineEmits(['chage'])
const props = defineProps({
  content:String
})
if (props?.content) {
  valueHtml.value = props.content
}
const mode = "default";
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML


// // 模拟 ajax 异步获取内容
// onMounted(() => {
//   setTimeout(() => {
//     valueHtml.value = "<p>模拟 Ajax 异步设置内容</p>";
//   }, 1500);
// });
// type InsertFnType = (url: string, alt: string, href: string) => void
const toolbarConfig: any = { excludeKeys: "" };
const editorConfig = {
  placeholder: "请输入内容...",

  MENU_CONF: {
    uploadImage: {
       server: baseUrlApi('/upload/upload_img'),
        // form-data fieldName ，默认值 'wangeditor-uploaded-image'
        fieldName: 'files[]',

        // 单个文件的最大体积限制，默认为 2M
        maxFileSize: 1 * 1024 * 1024, // 1M

        // 最多可上传几个文件，默认为 100
        maxNumberOfFiles: 10,

        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ['image/*'],

        // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
        // meta: {
        //     token: 'xxx',
        //     otherKey: 'yyy'
        // },

        // 将 meta 拼接到 url 参数中，默认 false
        metaWithUrl: false,

        // 自定义增加 http  header
        headers: {
          "Authorization": "Bearer " + token,
        },

        // 跨域是否传递 cookie ，默认为 false
        // withCredentials: true,

        // 超时时间，默认为 10 秒
      timeout: 6 * 1000, // 5 秒
      customInsert(res: any, insertFn:any) {  // TS 语法
        // customInsert(res, insertFn) {                  // JS 语法
            // res 即服务端的返回结果
          // console.log(res.data.file[0])
            // 从 res 中找到 url alt href ，然后插入图片
            insertFn(res.data.file[0], '图片', res.data.file[0])
        },
    }
  }
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
    editorRef.value = editor
    // console.log('created', editor)
}
const handleChange = (editor) => {
  //console.log('change:', editor.children)
  emit('chage',valueHtml.value);
 }
// const handleDestroyed = (editor) => { console.log('destroyed', editor) }
// const handleFocus = (editor) => { console.log('focus', editor) }
// const handleBlur = (editor) => { console.log('blur', editor) }
// const customAlert = (info, type) => { alert(`【自定义提示】${type} - ${info}`) }
// const customPaste = (editor, event, callback) => {
//     console.log('ClipboardEvent 粘贴事件对象', event)
//     // const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
//     // const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
//     // const rtf = event.clipboardData.getData('text/rtf') // 获取 rtf 数据（如从 word wsp 复制粘贴）

//     // 自定义插入内容
//     editor.insertText('xxx')

//     // 返回 false ，阻止默认粘贴行为
//     event.preventDefault()
//     callback(false) // 返回值（注意，vue 事件的返回值，不能用 return）

//     // 返回 true ，继续默认的粘贴行为
//     // callback(true)
// }

</script>

<template>
  <el-card class="wangeditor">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 150px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
        @onChange="handleChange"
    />
  </el-card>
</template>
<style scoped>
.wangeditor ::v-deep .el-card__body {
  padding: 0;
}
</style>
