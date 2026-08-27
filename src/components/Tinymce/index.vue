<template>
  <div class="tinymce-wrap">
    <div class="tinymce-wrap__editor">
      <editor
          v-model="myValue"
          :init="init"
          :enabled="enabled"
          :id="tinymceId"
      ></editor>
    </div>
    <div v-if="formulaPreview" class="formula-preview">
      <div class="formula-preview__header">
        <span class="formula-preview__title">公式预览（实时）</span>
        <span class="formula-preview__hint">编辑区保持 $...$ 原文，此处为渲染效果</span>
        <span class="formula-preview__close" @click="formulaPreview = false">收起</span>
      </div>
      <div class="formula-preview__body" v-html="previewHtml" v-katex></div>
    </div>
  </div>
</template>

<script setup>
import {computed, reactive, watch, ref, nextTick, onMounted} from "vue"; //全屏
import '../../../public/tinymce/formulas'  //公式编辑
import tinymce from "tinymce/tinymce";
// import "tinymce/skins/content/default/content.css";
import Editor from "@tinymce/tinymce-vue";
import request from "@/utils/request";
import "tinymce/icons/default/icons";
import "tinymce/models/dom"; // 一定要引入
import "tinymce/themes/silver"; // 界面UI主题
import "tinymce/plugins/image";
import "tinymce/plugins/table";
import "tinymce/plugins/lists"; // 列表插件
import "tinymce/plugins/wordcount"; // 文字计数
import "tinymce/plugins/preview"; // 预览
import "tinymce/plugins/emoticons"; // emoji表情
import "tinymce/plugins/emoticons/js/emojis.js"; //必须引入这个文件才有表情图库
import "tinymce/plugins/code"; // 编辑源码
import "tinymce/plugins/link"; // 链接插件
import "tinymce/plugins/advlist"; //高级列表
import "tinymce/plugins/codesample"; //代码示例
import "tinymce/plugins/autoresize"; // 自动调整编辑器大小
import "tinymce/plugins/quickbars"; // 光标处快捷提示
import "tinymce/plugins/nonbreaking"; //插入不间断空格
import "tinymce/plugins/searchreplace"; //查找替换
import "tinymce/plugins/autolink"; //自动链接
import "tinymce/plugins/directionality"; //文字方向
import "tinymce/plugins/visualblocks"; //显示元素范围
import "tinymce/plugins/visualchars"; //显示不可见字符
import "tinymce/plugins/charmap"; // 特殊符号
import "tinymce/plugins/nonbreaking"; //插入不间断空格
import "tinymce/plugins/insertdatetime"; //插入日期时间
import "tinymce/plugins/importcss"; //引入自定义样式的css文件
import "tinymce/plugins/accordion"; // 可折叠数据手风琴模式
import "tinymce/plugins/anchor"; //锚点
import "tinymce/plugins/fullscreen";


const emits = defineEmits(["update:modelValue", "setHtml"]);
//这里我选择将数据定义在props里面，方便在不同的页面也可以配置出不同的编辑器，当然也可以直接在组件中直接定义
const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  baseUrl: {
    type: String,
    default: "",
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  // 编辑器初始可编辑状态
  editable_root: {
    type: Boolean,
    default: true,
  },
  plugins: {
    type: [String, Array],
    default:
        "importcss autoresize searchreplace autolink directionality code visualblocks visualchars fullscreen image link codesample table charmap nonbreaking anchor insertdatetime advlist lists wordcount charmap quickbars emoticons accordion kityformula-editor gapfilling",
  },
  knwlgId: {
    type: String,
  },
  toolbar: {
    type: [String, Array, Boolean],
    default: "undo redo | accordion accordionremove | blocks fontfamily fontsize| bold italic underline strikethrough ltr rtl  | align numlist bullist | link image | table | lineheight outdent indent| forecolor  removeformat | charmap  anchor codesample kityformula-editor gapfilling | latexblock latexinline latexpreview",
    // default: "undo redo | accordion accordionremove | blocks fontfamily fontsize| bold italic underline strikethrough ltr rtl  | align numlist bullist | link image | table | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | anchor codesample kityformula-editor gapfilling",
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  minHeight: {
    type: Number,
    default: 630,
  },
});
const loading = ref(false);
const tinymceId = ref(
    "vue-tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + "")
);
// 公式实时预览：编辑区保持 $...$ 原文，预览面板用 KaTeX 实时渲染
const formulaPreview = ref(false);
const previewHtml = ref('');


//定义一个对象 init初始化
const init = reactive({
  selector: "#" + tinymceId.value, //富文本编辑器的id,
  language_url: "/langs/zh_CN.js", // 语言包的路径，具体路径看自己的项目
  language: "zh_CN",
  skin_url: "/tinymce/skins/ui/oxide", // skin路径，具体路径看自己的项目
  editable_root: props.editable_root,
  height: 600,
  branding: false, // 是否禁用"Powered by TinyMCE"
  promotion: false, //去掉 upgrade
  // toolbar_sticky: true,
  // toolbar_sticky_offset: 100,
  menubar: "edit view insert format tools table",
  paste_data_images: true, //允许粘贴图像
  image_dimensions: false, //去除宽高属性
  plugins: props.plugins, //这里的数据是在props里面就定义好了的
  toolbar: props.toolbar, //这里的数据是在props里面就定义好了的
  // 取消图片资源路径转换
  convert_urls: false,
  // table边框位0是否展示网格线
  // visual: false,
  // 超链接默认打开方式
  link_default_target: "_blank",
  link_context_toolbar: true,
  // 默认快捷菜单
  quickbars_insert_toolbar: "image codesample table",
  // 选中图片的快捷提示
  quickbars_image_toolbar: "alignleft aligncenter alignright | rotateleft rotateright | imageoptions",
  editimage_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
  // 文字样式
  font_family_formats:
      "Arial=arial,helvetica,sans-serif; 宋体=SimSun; 微软雅黑=Microsoft Yahei; Impact=impact,chicago;", //字体
  font_size_formats: "11px 12px 14px 16px 18px 24px 36px 48px 64px 72px", //文字大小
  image_caption: true,
  editimage_cors_hosts: ["picsum.photos"],
  noneditable_class: "mceNonEditable",
  toolbar_mode: "wrap", // 工具栏模式 floating / sliding / scrolling / wrap
  // 默认样式
  content_style: `
    body { font-family:Helvetica,Arial,sans-serif; font-size:16px }
    p { margin:3px; line-height:24px; }
    .gapfilling-span {
      display: inline-block;
      min-width: 40px;
      text-align: center;
      padding: 0 5px;
      background-color: #f0f0f0;
      border: 1px dashed #999;
      border-radius: 3px;
      cursor: default;
    }
  `,
  image_advtab: true,
  importcss_append: true,
  paste_webkit_styles: "all",
  paste_merge_formats: true,
  nonbreaking_force_tab: false,
  paste_auto_cleanup_on_paste: false,
  file_picker_types: "file",
  // 选中文字的快捷提示
  quickbars_selection_toolbar:
      "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
  // 编辑器高度自适应
  autoresize_bottom_margin: 20,
  // autoresize_overflow_padding: 16,
  min_height: props.minHeight,
  content_css: "/tinymce/skins/content/default/content.css", //以css文件方式自定义可编辑区域的css样式，css文件需自己创建并引入
  // setup: function (editor) {
  // },
  //图片上传：用项目统一 request（自动带 /dev-api 前缀 + token）POST /file/upload
  images_upload_handler: function (blobInfo, progress) {
    return new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      if (file.size / 1024 / 1024 > 200) {
        reject({
          message: "上传失败，图片大小请控制在 200M 以内",
          remove: true,
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      request({
        url: "/file/upload",
        method: "post",
        headers: { "Content-Type": "multipart/form-data" },
        data: formData,
        onUploadProgress: (progressEvent) => {
          progress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      }).then((res) => {
        // request 响应拦截器返回 body：{ code, data: { url } }
        resolve(res.data.url);
      }).catch((err) => reject(err));
    });
  },
  setup: function (editor) {
    editor.ui.registry.addButton('gapfilling', {
      text: '插入填空',
      onAction: function () {
        const uuid = 'gap_' + new Date().getTime();
        const count = editor.getContent().match(/<span class="gapfilling-span/g)?.length || 0;
        const number = count + 1;
        editor.insertContent(`<span class="gapfilling-span ${uuid}">${number}</span>`);
      }
    });
    // 插入 LaTeX 定界符对：有选区则包裹成公式，无选区则插入空对并把光标定位到中间
    const insertLatex = (left, right) => {
      const sel = editor.selection.getContent({ format: 'text' });
      if (sel) {
        editor.insertContent(left + sel + right);
      } else {
        editor.insertContent(left);
        const rng = editor.selection.getRng();   // 记下光标（此刻在 left 之后）
        editor.insertContent(right);
        editor.selection.setRng(rng);            // 还原到 left 与 right 之间
      }
      editor.focus();
    };
    editor.ui.registry.addButton('latexblock', {
      text: '整行公式',
      tooltip: '插入独占一行的公式（用 $$...$$ 包裹）：适合化学方程式、带上下条件的长公式',
      onAction: () => insertLatex('$$', '$$')
    });
    editor.ui.registry.addButton('latexinline', {
      text: '行内公式',
      tooltip: '插入跟文字排在一起的公式（用 $...$ 包裹）：如 H₂O、x>0',
      onAction: () => insertLatex('$', '$')
    });
    // ===== 公式实时预览 =====
    let previewTimer = null;
    const syncPreview = () => {
      if (formulaPreview.value) previewHtml.value = editor.getContent();
    };
    editor.ui.registry.addButton('latexpreview', {
      text: '预览公式',
      tooltip: '展开/收起公式实时预览（LaTeX 渲染）',
      onAction: () => {
        formulaPreview.value = !formulaPreview.value;
        syncPreview();
      }
    });
    editor.on('input', () => {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(syncPreview, 200);
    });
    editor.on('SetContent', syncPreview);
  },
   // 添加外部插件路径
  external_plugins: {
    gapfilling: '/tinymce/plugins/gapfilling/plugin.js'
  },
});

// 外部传递进来的数据变化
const myValue = computed({
  get() {
    return props.modelValue || props.value || '';
  },
  set(val) {
    emits("update:modelValue", val);
  },
});

//监听富文本中的数据变化
watch(
    () => myValue.value,
    () => {
      emits(
          "setHtml",
          tinymce.activeEditor.getContent({format: "text"}),
          myValue.value
      );
    }
);

// 设置编辑器只读模式
watch(
    () => props.readonly,
    (newValue, oldValue) => {
      nextTick(() => {
        tinymce.activeEditor.mode.set(newValue ? "readonly" : "design");
        let iframeDom = document.querySelector("iframe");
        iframeDom &&
        (iframeDom.contentWindow.document.body.style.margin = newValue
            ? 0
            : "16px");
      });
    },
    {immediate: true}
);

//初始化编辑器
onMounted(() => {
  tinymce.init({});
});

// 设置值
const handleSetContent = (content) => {
  tinymce.activeEditor.setContent(content);
};

// 获取值
const handleGetContent = () => {
  return tinymce.activeEditor.getContent();
};

defineExpose({
  handleSetContent,
  handleGetContent,
});
</script>

<style lang="scss" scoped>
:deep(.tox-tinymce) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .tox-statusbar {
    display: none;
  }
}

.tinymce-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.tinymce-wrap__editor {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.formula-preview {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  max-height: 300px;
  border: 1px solid #dcdfe6;
  border-top: none;
  background: #fafafa;
}
.formula-preview__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: #f0f2f5;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}
.formula-preview__title {
  font-weight: 600;
  color: #303133;
}
.formula-preview__hint {
  color: #909399;
  font-size: 12px;
}
.formula-preview__close {
  margin-left: auto;
  color: #409eff;
  cursor: pointer;
}
.formula-preview__body {
  padding: 12px 16px;
  overflow: auto;
  line-height: 1.8;
  color: #303133;
}
</style>