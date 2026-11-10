<script setup lang="ts">
import { computed } from "vue";
import MyUploadAdapter from "@/utils/MyUploadAdapter";
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { EventInfo } from '@ckeditor/ckeditor5-utils';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Link, AutoLink } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Font } from '@ckeditor/ckeditor5-font';
import { Image, ImageUpload, AutoImage, ImageToolbar, ImageCaption, ImageStyle, ImageTextAlternative, PictureEditing, ImageResize, ImageResizeEditing, ImageResizeButtons } from '@ckeditor/ckeditor5-image';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Heading, Title } from '@ckeditor/ckeditor5-heading';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { StandardEditingMode } from '@ckeditor/ckeditor5-restricted-editing';
import { SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersText } from '@ckeditor/ckeditor5-special-characters';
import { Style } from '@ckeditor/ckeditor5-style';
import { Table, TableToolbar, TableCaption } from '@ckeditor/ckeditor5-table';
import { List } from '@ckeditor/ckeditor5-list';

defineOptions({
  name: "Editor"
});
const emit = defineEmits(['chage'])
const props = defineProps({
  content:String
})
const editorData = computed(() => {
  return props.content
})
function SpecialCharactersEmoji( editor ) {
    editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emoji', [
        { title: 'smiley face', character: '😊' },
        { title: 'rocket', character: '🚀' },
        { title: 'wind blowing face', character: '🌬️' },
        { title: 'floppy disk', character: '💾' },
        { title: 'heart', character: '❤️' }
    ], { label: 'Emoticons' } );
}
const editorConfig2 = {
  plugins: [
    Table, TableToolbar, TableCaption, Image, Font, Essentials, Bold, Italic, GeneralHtmlSupport, SourceEditing,
    Link, AutoLink, Alignment, BlockQuote, HtmlEmbed, ImageToolbar, ImageCaption, StandardEditingMode,
    ImageResizeEditing, ImageResizeButtons,
    Paragraph, ImageUpload, AutoImage, Autoformat, FindAndReplace, ImageStyle, ImageTextAlternative,
    PictureEditing, ImageResize, Indent, IndentBlock, Heading, MediaEmbed, PageBreak, RemoveFormat,
    SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersText, SpecialCharactersEmoji, Style, List
  ],
  toolbar: {
    items: [
      'undo', 'redo', 'selectAll',
      '|', 'heading', 'alignment', 'insertTable',
      '|', 'link', 'uploadImage', 'mediaEmbed', 'imageTextAlternative', 
      '|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', 'bold', 'italic', 'blockQuote', 
      '|', 'bulletedList', 'numberedList', 'outdent', 'indent', 'strikethrough', 'specialCharacters', 'pageBreak', 'removeFormat', 'restrictedEditingException',
      '|', 'todoList', 'findAndReplace', "sourceEditing",
      "htmlEmbed", "toggleImageCaption", "imageResize",
      '|', "imageStyle:inline", "imageStyle:block", "imageStyle:side", "imageStyle:wrapText", "imageStyle:breakText"
    ],
    shouldNotGroupWhenFull: true
  },
  table: {
    contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption' ]
  },
  fontSize: {
    options: [
      9, 11, 13, 'default', 17, 19, 21, 23, 25, 27, 29, 31, 33
    ]
  },
  image: {
    resizeUnit: 'px',
    resizeOptions: [
          {
              name: 'resizeImage:original',
              label: 'Original',
              value: null
          },
          {
              name: 'resizeImage:25',
              label: '25px',
              value: '25'
          },
          {
              name: 'resizeImage:50',
              label: '50px',
              value: '50'
          },
          {
              name: 'resizeImage:100',
              label: '100px',
              value: '100'
          },
          {
              name: 'resizeImage:200',
              label: '200px',
              value: '200'
          },
          {
              name: 'resizeImage:300',
              label: '300px',
              value: '300'
          },
          {
              name: 'resizeImage:400',
              label: '400px',
              value: '400'
          },
          {
              name: 'resizeImage:500',
              label: '500px',
              value: '500'
          }
    ]
  },
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        // attributes: true,
        classes: true,
        // styles: true
      }
    ]
  },

}

const onReady = (editor) => {
  // console.log( Array.from( editor.ui.componentFactory.names() ) );
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    return new MyUploadAdapter(loader);
  };
}
function onFocus( event: EventInfo, editor: ClassicEditor ) {
	// console.log( 'Editor focused.', { event, editor } );
}

function onBlur( event: EventInfo, editor: ClassicEditor ) {
	// console.log( 'Editor blurred.', { event, editor } );
}

function onInput( data: string, event: EventInfo, editor: ClassicEditor ) {
	// console.log( 'Editor data input.', { event, editor, data } );
  emit('chage', data);
}

function onDestroy( editor: ClassicEditor ) {
	// console.log( 'Editor destroyed.', { editor } );
}
</script>

<template>
  <div class="wangeditor" style="min-height:500px; width: 100%;">
    <ckeditor :editor="ClassicEditor" v-model="editorData" :config="editorConfig2"
      @ready="onReady"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @destroy="onDestroy"
    />
    </div>
</template>
<style scoped>
.wangeditor ::v-deep .el-card__body {
  padding: 0;
}
</style>
<style>
.ck-editor__editable[role="textbox"] {
  /* editing area */
  min-height: 450px;
}
:root {
  --ck-z-default: 99999999;
}
</style>