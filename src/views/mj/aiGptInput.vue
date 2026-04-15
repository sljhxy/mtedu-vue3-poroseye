




<script setup>
import { ref, computed, watch } from "vue";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import {
  NInput,
  NButton,
  useMessage,
  NImage,
  NTooltip,
  NAutoComplete,
  NTag,
  NPopover,
  NModal,
  NDropdown,
} from "naive-ui";

import SvgIcon from "@/components/SvgIcon/index.vue";
import PromptStore from "@/components/PromptStore/index.vue";
import {
  canVisionModel,
  GptUploader,
  mlog,
  upImg,
  getFileFromClipboard,
  isFileMp3,
  countTokens,
  checkDisableGpt4,
  Recognition,
  chatSetting,
} from "@/api";
// import { gptConfigStore, homeStore, useChatStore } from "@/store";
// import { AutoCompleteOptions } from "naive-ui/es/auto-complete/src/interface";
// import { RenderLabel } from "naive-ui/es/_internal/select-menu/src/interface";
import { useRoute } from "vue-router";
import aiModel from "@/views/mj/aiModel.vue";
import AiMic from "./aiMic.vue";
import { useIconRender } from "@/hooks/useIconRender";

// Props 定义
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  searchOptions: {
    type: Object
  },
  renderOption: {
    type: Function
  }
});

// Emits 定义
const emit = defineEmits([
  "update:modelValue",
  "update:chatType",
  "export",
  "handleClear",
]);

// 组合式 API 引入
const { iconRender } = useIconRender();
const route = useRoute();
// const chatStore = useChatStore();
// const ms = useMessage();

// 响应式状态
const fsRef = ref();
const st = ref({
  fileBase64: [],
  isLoad: 0,
  isShow: false,
  showMic: false,
  micStart: false,
  chatType: false,
});

const myToken = ref({ remain: 0, modelTokens: "4k" });
const { isMobile } = useBasicLayout();

// 计算属性
const placeholder = computed(() => {
  return isMobile.value ? '$t("chat.placeholderMobile")' : '可输入说点什么，也可贴截图或拖拽文件（Shift + Enter = 换行）';
});

const uuid = computed(() => route.params);
// const uuid1 = chatStore.active;
// const chatSet = new chatSetting(uuid1 ?? 1002);
const chatSet = new chatSetting(1001 ?? 1002);
// const nGptStore = ref(chatSet.getGptConfig());
const dataSources = computed(() => chatStore.getChatByUuid(+uuid));

const mvalue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const acceptData = computed(() => {
  // if (canVisionModel(gptConfigStore.myData.model)) return "*/*";
  return "image/jpeg, image/jpg, image/png, image/gif, .mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm";
});

// 监听器
// watch(
//   () => gptConfigStore.myData,
//   () => (nGptStore.value = chatSet.getGptConfig()),
//   { deep: true }
// );

// watch(
//   () => homeStore.myData.act,
//   (n) => n == "saveChat" && (nGptStore.value = chatSet.getGptConfig()),
//   { deep: true }
// );

// watch(() => mvalue.value, funt);
// watch(() => dataSources.value, funt);
// watch(() => gptConfigStore.myData, funt, { deep: true });
// watch(() => homeStore.myData.isLoader, funt, { deep: true });

// 方法定义
const handleSubmit = () => {
  if (!mvalue.value) return;
  
  // if (checkDisableGpt4(gptConfigStore.myData.model)) {
  //   ms.error(t("mj.disableGpt4"));
  //   return false;
  // }
  
  // if (homeStore.myData.isLoader) return;

  const obj = {
    prompt: mvalue.value,
    fileBase64: st.value.fileBase64,
    chatType: st.value.chatType ? 1 : 0,
    appId:'111111111111111'
    // appId: gptConfigStore.myData.gpts?.id ?? "",
  };
  
  // homeStore.setMyData({ act: "gpt.submit", actData: obj });
  mvalue.value = "";
  st.value.fileBase64 = [];
};

// const funt = async () => {
//   const d = await countTokens(
//     dataSources.value,
//     mvalue.value,
//     chatStore.active ?? 1002
//   );
//   myToken.value = d;
//   return d;
// };

const upFile = (file) => {
  // if (!canVisionModel(gptConfigStore.myData.model)) {
  if (1==1) {
    if (isFileMp3(file.name)) {
      mlog("mp3", file);
      // homeStore.setMyData({
      //   act: "gpt.whisper",
      //   actData: { file, prompt: "whisper" },
      // });
      return;
    }
    
    upImg(file)
      .then((uploadResult) => {
        fsRef.value.value = "";
        const imageUrl = uploadResult.url;
        
        if (st.value.fileBase64.includes(imageUrl)) {
          // ms.error($t("mj.noReUpload"));
          return;
        }
        
        st.value.fileBase64.push(imageUrl);
      })
      // .catch((e) => ms.error(e));
      .catch((e) => console.log(e));
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  // ms.info($t("mj.uploading"));
  st.value.isLoad = 1;
  
  GptUploader("/chat/upload", formData)
    .then((r) => {
      st.value.isLoad = 0;
      if (r.url) {
        // ms.info($t("mj.uploadSuccess"));
        st.value.fileBase64.push(r.url.startsWith("http") ? r.url : `${location.origin}${r.url}`);
      } else if (r.error) {
        // ms.error(r.error);
      }
    })
    .catch((e) => {
      st.value.isLoad = 0;
      // ms.error($t("mj.uploadFail") + (e.message ?? JSON.stringify(e)));
    });
};

const handleEnter = (event) => {
  if (!isMobile.value && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  } else if (isMobile.value && event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const selectFile = (input) => {
  const file = input.target.files[0];
  upFile(file);
};

const drop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!e.dataTransfer?.files.length) return;
  upFile(e.dataTransfer.files[0]);
};

const paste = (e) => {
  const files = getFileFromClipboard(e);
  if (files.length > 0) upFile(files[0]);
};

const sendMic = (e) => {
  mlog("sendMic", e);
  st.value.showMic = false;
  const file = new File([e.blob], "whisper.wav", { type: "audio/wav" });
  // homeStore.setMyData({
  //   act: "gpt.whisper",
  //   actData: { file, prompt: "whisper", duration: e.stat?.duration },
  // });
};

const goASR = () => {
  console.log("触发语音识别");
  const olod = mvalue.value;
};

// 初始化
// funt();
</script>

<template>
  <div v-if="st.showMic" class="myinputs flex justify-center items-center">
    <AiMic @cancel="st.showMic = false" @send="sendMic" />
  </div>
  <div v-else>
    <!-- 文件预览区域 -->
    <div
      class="flex items-base justify-start pb-1 flex-wrap-reverse"
      v-if="st.fileBase64.length > 0"
      style="margin: 0 40px"
    >
      <div
        v-for="(v, ii) in st.fileBase64"
        class="w-[60px] h-[60px] rounded-sm bg-slate-50 mr-1 mt-1 text-red-300 relative group"
      >
        <NImage :src="v" object-fit="cover" class="w-full h-full">
          <template #placeholder>
            <a
              class="w-full h-full flex items-center justify-center text-neutral-500"
              :href="v"
              target="_blank"
            >
              <SvgIcon icon="mdi:download" />{{ $t("mj.attr1") }} {{ ii + 1 }}
            </a>
          </template>
        </NImage>
        <SvgIcon
          icon="mdi:close"
          class="hidden group-hover:block absolute top-[-5px] right-[-5px] rounded-full bg-red-300 text-white cursor-pointer"
          @click="st.fileBase64.splice(ii, 1)"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <div
      class="myinputs"
      :class="{ 'chat-footer': !isMobile }"
      @drop="drop"
      @paste="paste"
    >
      <input
        type="file"
        id="fileInput"
        ref="fsRef"
        class="hidden"
        :accept="acceptData"
        @change="selectFile"
      />

    <!-- 手机端 -->
      <div class="w-full relative">
        <div class="absolute bottom-0 right-0 z-1" v-if="isMobile">
          <NPopover trigger="hover">
            <template #trigger>
              <NTag
                type="info"
                round
                size="small"
                style="cursor: pointer"
                :bordered="false"
              >
                <div class="opacity-60 flex">
                  <SvgIcon icon="material-symbols:token-outline" />
                  {{ $t("mj.remain") }}{{ myToken.remain }}/{{
                    myToken.modelTokens
                  }}
                </div>
              </NTag>
            </template>
            <div class="w-[300px]">
              {{ $t("mj.tokenInfo1") }}
              <p class="py-1" v-text="$t('mj.tokenInfo2')"></p>
              <p class="text-right">
                <NButton @click="st.isShow = true" type="info" size="small">{{
                  $t("setting.setting")
                }}</NButton>
              </p>
            </div>
          </NPopover>
        </div>
      </div>
      <NAutoComplete
        v-model:value="mvalue"
        :options="searchOptions"
        :render-label="renderOption"
        :class="[!isMobile ? 'chat-input' : '']"
      >
        <template #default="{ handleInput, handleBlur, handleFocus }">
          <NInput
            ref="inputRef"
            v-model:value="mvalue"
            type="textarea"
            :placeholder="placeholder"
            rows="3"
            :autosize="{ minRows: 3, maxRows: 5 }"
            :theme-overrides="
              !isMobile
                ? {
                    border: '0',
                    borderHover: '#FFF',
                    borderFocus: '#FFF',
                    boxShadowFocus: '#FFF',
                  }
                : {}
            "
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @keypress="handleEnter"
          >
            <template #prefix v-if="isMobile">
              <div class="relative; w-[22px]">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <SvgIcon
                      icon="line-md:uploading-loop"
                      class="absolute bottom-[10px] left-[8px] cursor-pointer"
                      v-if="1 == 1"
                    ></SvgIcon>
                    <SvgIcon
                      icon="ri:attachment-line"
                      class="absolute bottom-[10px] left-[8px] cursor-pointer"
                      @click="fsRef.click()"
                      v-else
                    ></SvgIcon>
                  </template>
                  <div
                    v-if="canVisionModel(gptConfigStore.myData.model)"
                    v-html="$t('mj.upPdf')"
                  ></div>
                  <div v-else v-html="$t('mj.upImg')"></div>
                </n-tooltip>
              </div>

              <n-dropdown
                trigger="hover"
                :options="drOption"
                @select="handleSelectASR"
              >
                <div class="relative; w-[22px]">
                  <div
                    class="absolute bottom-[14px] left-[31px]"
                    v-if="1==1"
                  >
                    <span class="relative flex h-3 w-3">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
                      ></span>
                      <span
                        class="relative inline-flex rounded-full h-3 w-3 bg-red-400"
                      ></span>
                    </span>
                  </div>

                  <SvgIcon
                    icon="bi:mic"
                    class="absolute bottom-[10px] left-[30px] cursor-pointer"
                  ></SvgIcon>
                </div>
              </n-dropdown>
            </template>
            <template #suffix v-if="isMobile">
              <div class="relative; w-[40px]">
                <div class="absolute bottom-[-3px] right-[0px]">
                  <NButton
                    type="primary"
                    :disabled="disabled || homeStore.myData.isLoader"
                    @click="handleSubmit"
                  >
                    <template #icon>
                      <span class="dark:text-black">
                        <SvgIcon
                          icon="ri:stop-circle-line"
                          v-if="homeStore.myData.isLoader"
                        />
                        <SvgIcon icon="ri:send-plane-fill" v-else />
                      </span>
                    </template>
                  </NButton>
                </div>
              </div>
            </template>
          </NInput>
        </template>
      </NAutoComplete>

      <!-- PC端 -->
      <div class="top-bar" v-if="!isMobile">
        <div class="left" v-if="st">
          <div
            class="chage-model-select"
            @click="st.isShow = true"
          >
            <template v-if="1==1">
              <SvgIcon icon="ri:apps-fill" />
              <span class="line-clamp-1 overflow-hidden">hahaha</span>
            </template>
            <template v-else>
              <SvgIcon icon="heroicons:sparkles" />
              <span
                >模型:{{
                  nGptStore.modelLabel
                    ? truncateText(nGptStore.modelLabel, 20)
                    : "deepseek/deepseek-r1"
                }}
                {{
                  nGptStore.kid
                    ? "知识库:" + truncateText(nGptStore.kName, 10)
                    : ""
                }}</span
              >
            </template>
            <SvgIcon icon="icon-park-outline:right" />
          </div>
          <n-dropdown
            trigger="hover"
            :options="drOption"
            @select="handleSelectASR"
          >
            <div class="relative; w-[22px]" style="margin: 0 25px">
              <div
                class="absolute bottom-[14px] left-[31px]"
                v-if="1==1"
              >
                <span class="relative flex h-3 w-3">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-3 w-3 bg-red-400"
                  ></span>
                </span>
              </div>
              <IconSvg icon="voice" width="19px" height="19px"></IconSvg>
            </div>
          </n-dropdown>
          <n-tooltip trigger="hover">
            <template #trigger>
              <SvgIcon
                icon="line-md:uploading-loop"
                class="absolute bottom-[10px] left-[8px] cursor-pointer"
                v-if="1== 1"
              />
              <IconSvg
                icon="upload"
                @click="fsRef.click()"
                v-else
                width="19px"
                height="19px"
              />
            </template>
            <div
              v-if="canVisionModel(gptConfigStore.myData.model)"
              v-html="$t('mj.upPdf')"
            />
            <div v-else v-html="$t('mj.upImg')" />
          </n-tooltip>
          <IconSvg
            @click="handleExport"
            icon="screenshot"
            width="19px"
            height="19px"/>
          <IconSvg
            @click="handleClear"
            class="right"
            icon="clear"
            width="19px"
            height="19px"/>
        </div>
        <div class="send" @click="handleSubmit">
          <IconSvg
            icon="send"
            style="margin-right: 0px !important"
            class="right"
            width="29px"
            height="19px"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 设置对话框 -->
  <NModal
    v-model:show="st.isShow"
    preset="card"
    :title="$t('mjchat.modelChange')"
    class="!max-w-[620px]"
    @close="st.isShow = false"
  >
    <aiModel @close="st.isShow = false" />
  </NModal>
</template>

<style>
.myinputs .n-input .n-input-wrapper {
  display: flex;
  align-items: stretch;
  background: var(--n-color) !important;
}

html.dark .myinputs .n-input .n-input-wrapper,
body.dark .myinputs .n-input .n-input-wrapper {
  background: #232627 !important;
}
</style>
