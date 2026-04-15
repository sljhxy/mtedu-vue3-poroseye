<template>
  <div class="chat-container">
    <!-- 聊天区域 -->
    {{ state.user.teacherId?state.user.teacherId:0 }}---- {{ selectedOptions.length }}
    <!-- ===={{ state.user }} -->
     ======={{ state.user?.userId }}
    <div class="chat-main-area">
      <div class="chat-area" ref="chatAreaRef">
        <div class="chat-header">
          <!-- <div class="avatar">🐱</div> -->
           <div class="avatar"><img src="@/assets/images/aichat.png" style="width: 40px;"></div>
          <h1 class="greeting">{{ greeting }}</h1>
          <p class="subtitle-text">{{ subtitle }}</p>
          <p class="description" >{{ selectedOptions.length === 0 ? description : '你好！您现在正在基于知识库提问，您可以向我提问知识库相关的问题，你的问题越具体，我的回答就会越好。我今天能如何帮助你？' }}</p>
        </div>
        
        <div class="suggestion-grid" v-if="!messages.length && !selectedOptions.length">
          <div 
            v-for="tag in promptResult.tags" 
            :key="tag.id"
            class="suggestion-card"
            @click="selectSuggestion(tag.tagName)"
          >
            {{ tag.tagName }}
          </div>
        </div>
    
        <!-- Chat Messages -->
        <div v-if="messages.length > 0" class="chat-messages">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message"
            :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
          >
            <!-- <div class="message-content">{{ message.content }}</div> -->
            <!-- <div class="message-content" v-if="!message.isUser" v-html="renderMarkdown(message.content)"></div> -->
            <!-- <div class="message-content" v-html="renderMarkdown(message.content)"></div> -->
            <div 
              class="message-content" 
              v-if="!message.isUser"
            >
              <template v-if="message.loading">
                <span class="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </template>
              <template v-else-if="message.stopped">
                <span class="ai-stopped-tip">已停止</span>
              </template>
              <template v-else>
                <div v-html="renderMarkdown(message.content)"></div>
              </template>
            </div>
            <div class="message-content" v-else>
              {{ message.content }}
            </div>
            <!-- <div class="message-content" v-else>{{ message.content }}</div> -->
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
    
      <div class="chat-input-area">

        <div class="chat-input-container">
          <input 
            v-model="currentMessage"
            type="text" 
            class="chat-input" 
             ref="fsRef"
            :placeholder="inputPlaceholder"
            @keypress.enter="sendMessage"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
          >
          <div class="input-actions">--

            <!-- <el-icon><Folder /></el-icon>
            <el-icon class="el-icon--right"><arrow-down /></el-icon> 
            -->
             <el-dropdown trigger="click" :hide-on-click="false"  @command="fallbackknoledge" placement="top-start">
             <el-button class="action-btn-zsk" type="primary" @click="getKnoledgeList" title="知识库">知识库
               <el-icon class="el-icon--right" v-if="flag"><arrow-down /></el-icon> 
               <el-icon class="el-icon--right" v-else><arrow-up /></el-icon> 
             </el-button>


             <template #dropdown>
              <el-dropdown-menu>
                <!-- <el-checkbox style="margin-left: 15px;" v-model="selectedOptions">
                  <el-dropdown-item :command="item.id">{{ item.classifyName }}</el-dropdown-item>
                </el-checkbox> -->

                <el-dropdown-item v-for="item in aiClassifyList" :key="item.id" :command="item.id">
                  <!-- <label> -->
                    <input type="checkbox" v-model="selectedOptions" :value="item.id">
                    {{ item.classifyName }}
                  <!-- </label> -->

                 </el-dropdown-item>
                
              </el-dropdown-menu>
            </template>
           
          
            </el-dropdown>
           
            <!-- <button class="action-btn-zsk" @click="getKnoledgeList" title="知识库">知识库</button> -->
            <button class="action-btn" @click="attachFile" title="附加文件"><el-icon><Link /></el-icon></button>
            <button class="action-btn" @click="toggleVoice" title="语音输入"><el-icon><Microphone /></el-icon></button>
             <!-- <n-dropdown
              class="action-btn"
              trigger="hover"
              :options="drOption"
              @select="handleSelectASR"
            >
              <div class="relative; w-[22px]" style="margin: 0 25px">
                <div
                  class="absolute bottom-[14px] left-[31px]"
                  v-if="st.micStart"
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
                <el-icon><Microphone /></el-icon>
              </div>
            </n-dropdown>
            <n-tooltip trigger="hover">
            <template #trigger>
              <SvgIcon
                icon="line-md:uploading-loop"
                class="absolute bottom-[10px] left-[8px] cursor-pointer"
                v-if="st.isLoad == 1"
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
              v-if="1==1"
              v-html="$t('mj.upPdf')"
            />
            <div v-else v-html="$t('mj.upImg')" />
          </n-tooltip> -->
          
            <!-- <button class="action-btn" @click="pasteContent" title="粘贴内容">📋</button> -->
            <!-- <button class="action-btn" @click="searchContent" title="搜索内容"><el-icon><Search /></el-icon></button> -->
             <!-- v-if="currentMessage.trim()" -->
            <button 
              class="action-btn send-btn" 
              @click="sendMessage"
              title="发送消息"
            >
              ➤
            </button>
            <!-- 新增停止按钮 -->
            <button v-if="aiReplying" class="action-btn stop-btn" @click="stopAIReply" title="停止AI回复">⏹ 停止</button>
          </div>
          <p class="disclaimer">{{ disclaimer }}000</p>
        </div>
        <!-- <p class="disclaimer">{{ disclaimer }}</p> -->





          <!-- 20250717 新代码 开始 -->

            <!-- <div class="chat-input-container" :class="footerClass"> -->
            
               <!-- <footer :class="footerClass" class="footer-content">
                 <div class="w-full max-w-[1100px] m-auto">
                222
                <aiGptInput />
                     
              </div>

 
               </footer>
              <div class="w-full max-w-[1100px] m-auto">
                222
                     
              </div> -->


            <!-- </div> -->
          <!--20250717 新代码 结束 -->
      </div>

      <!-- Main Content -->
      <!-- <div class="main-content" v-if="currentComponent"> -->
        <!-- 根据activeNav动态切换组件 -->
        <!-- <component :is="currentComponent" ref="activeComponent"></component> -->
      <!-- </div> -->

    </div>







    <!-- 历史搜索区域 (放在最右边) -->
    <div class="history-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">历史搜索</h2>
        <el-button 
          type="primary" 
          class="new-chat-btn" 
          circle 
          @click="createNewChat" 
          title="新建会话"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      
      <div class="history-list">
        <div 
          v-for="item in aiUserHistoryList" 
          :key="item.id"
          class="history-item"
          @click="loadHistoryItem(item)"
          v-hasPermi="['glxt:aiUserHistory:list']"
        >
        <el-tooltip
        class="box-item"
        effect="dark"
        :content="item.title"
        placement="top-start"
      ></el-tooltip>
          <!-- <span class="history-icon">{{ item.icon }}</span> -->
          <span class="history-text">{{ item.title }}</span>
          <el-button type="danger" circle class="add-btn" @click="deleteHistory(item)" title="删除会话"><el-icon><Delete /></el-icon></el-button>
        </div>
        
      </div>
    </div>
  </div>
</template>



<script setup>
// 保持脚本部分不变
import { ref, computed, onMounted } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useBasicLayout } from "@/hooks/useBasicLayout"
const { isMobile } = useBasicLayout()

//  引入推荐标签API
import { listAiRecommend, getAiRecommend, delAiRecommend, addAiRecommend, updateAiRecommend } from "@/api/glxt/aiRecommend";

// 引入历史搜索API
import { listAiUserHistory, getAiUserHistory, delAiUserHistory, addAiUserHistory, updateAiUserHistory } from "@/api/glxt/aiUserHistory";

// 引入分类API
import { listAiClassify} from "@/api/glxt/aiClassify";


//引入会话API
import { listSession, getSession, delSession, addSession, updateSession } from "@/api/glxt/aiSession";


//引入提示词API
import { selectPromptByUserId } from "@/api/glxt/prompt";


import { marked } from 'marked'


import { Recognition } from "@/api/Recognition";


// 引入输入组件
import aiGptInput from "../../mj/aiGptInput"

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



const { proxy } = getCurrentInstance();
// 响应式数据
const currentMessage = ref('')
const isInputFocused = ref(false)
const messages = ref([])


// 新增停止按钮相关的响应式数据
const currentReader = ref(null)
const aiReplying = ref(false)

// 新增会话相关的响应式数据
const currentSession = ref({
  id: null,
  userId: null,
  messages: []
})

// 修改 aiUserHistoryForm
const aiUserHistoryForm = ref({
  userId: null,
  title: "",
  answer: "",
  aiUserSessionId: null  // 新增会话ID字段
})

//获取用户信息
import { getUserProfile } from "@/api/system/user";


const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
});


async function getUser() {
  try {
    const response = await getUserProfile();
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;

      // 根据角色设置type
    queryAiClassifyParams.value.type = isAdmin.value ? 1 : 2;


    selectedOptions.value = []//清空知识库选项
  } catch (error) {
    proxy.$modal.msgError("获取用户信息失败");
  }
};



getUser();


// 添加判断是否为管理员的计算属性
const isAdmin = computed(() => {
  // return state.roleGroup && state.roleGroup.includes('超级管理员')
  // 判断是否为教师  如果Id 存在则为教师
  return (state.user && state.roleGroup) && (state.user.teacherId && !state.roleGroup.includes('超级管理员') )
})


// 静态数据
const suggestions = ref([
{ id: 1, text: '适合六年级学生的数学趣味游戏' },
{ id: 2, text: '有效激励不感兴趣的学生' },
{ id: 3, text: '利用学校花园进行科学课程' },
{ id: 4, text: '公平全面的科学马测试创意' }
])

const historyItems = ref([
{ id: 1, icon: '💡', title: 'Photosynthesis Lesson Ideas' },
{ id: 2, icon: '💻', title: 'Coding basics intro' },
{ id: 3, icon: '📚', title: 'Best apps for teaching history' },
{ id: 4, icon: '📐', title: 'Geometry hands-on activity s...' },
{ id: 5, icon: '🎵', title: 'Integrating Music into Fractio...' },
{ id: 6, icon: '📊', title: 'Geometry hands-on activity...' },
{ id: 7, icon: '🎯', title: 'Motivating Disinterested Stud...' }
])

// 计算属性
const greeting = computed(() => '您好！我是您的智能助手')
const subtitle = computed(() => '专为教师设计')
const description = computed(() => // 如果promptResult.value.prompt为空，则使用默认值
// '你好！我叫XXX，是你的AI教学助手。你可以向我何与教学最佳实践或学校工作相关的问题，同时我会尽量课堂上的创意、教育学最佳实践的研究、行为管理策略或任一般性建议！你的问题越具体，我的回答就会越好。我今天能如何帮助你？'
  promptResult.value.prompt?promptResult.value.prompt:'你好！我叫小智，是你的AI教学助手。你可以向我何与教学最佳实践或学校工作相关的问题，同时我会尽量课堂上的创意、教育学最佳实践的研究、行为管理策略或任一般性建议！你的问题越具体，我的回答就会越好。我今天能如何帮助你？'
)

const knowledgePormpt = computed(() => // 如果promptResult.value.prompt为空，则使用默认值
  promptResult.value.prompt?promptResult.value.prompt:'你好！您现在正在基于知识库提问，您可以向我提问知识库相关的问题，你的问题越具体，我的回答就会越好。我今天能如何帮助你？'
)
const inputPlaceholder = computed(() => '可以向我咨询任何问题哦...')
const disclaimer = computed(() => '始终审查内容的准确性和适宜性。使用即表示同意我们的学校政策。')


//获取推荐标签列表
/** 查询ai推荐标签列表 */
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})
const total = ref(0);
const aiRecommendList = ref([]);
function getAiRecommendList() {
  listAiRecommend(queryParams.value).then(response => {
    aiRecommendList.value = response.rows;
    total.value = response.total;
  });
}

//getAiRecommendList()app-VoACD2wsWa9cUguDd7LePmGO


// 点击标签发送消息
const selectSuggestion = (text) => {
  currentMessage.value = text
  sendMessage()//发送会话请求
}

const chatAreaRef = ref(null);

const scrollToBottom = () => {
  if (chatAreaRef.value) {
    setTimeout(() => {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }, 100);
  }
};

// 初始化新会话
const initNewSession = async () => {
  try {
    // 确保有用户ID才创建会话
    if (!state.user?.userId) {
      proxy.$modal.msgError("用户信息未加载，请稍后重试");
      return;
    }
    // 创建新会话
    const response = await addSession({
      userId: state.user.userId
    });
    currentSession.value = {
      id: response.data,
      userId: state.user.userId,
      messages: []
    };
    messages.value = []; // 清空当前显示的消息
  } catch (error) {
    proxy.$modal.msgError("创建新会话失败");
  }
}

// 清空当前会话
const clearCurrentSession = () => {
  messages.value = [];
  currentSession.value = {
    id: null,
    userId: state.user.userId,
    messages: []
  };
}

const buildDifyParams = (question) => {
  return {
    inputs: {
      userId: state.user.teacherId + '' || 0 + '',
      // isKnowledge: '否', // 默认不启用知识库
      isKnowledge: selectedOptions.value.length > 0 ? '是' : '否', // 根据选项是否为空来判断是否启用知识库
      // user_input: question,
      // isAdmin: isAdmin.value ? '1' : '2',
      isAdmin: '1',
      user_type: isAdmin.value ? 'mtedu_glxt_admin' : 'mtedu_glxt_teacher',
      classfiy_id: 'selectedOptions.value'

    },
    query: question,
    response_mode: "streaming",
    user: state.user.teacherId ? String(state.user.teacherId) : "0"
  }
}


 // 去除所有 <think>...</think> 标签及内容
const filterThinkTag = (content) => {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// 渲染 markdown 内容
const renderMarkdown = (content) => {
  // 过滤 think 标签后再渲染
  const filtered = filterThinkTag(content);
  return marked.parse(filtered);
}


const fsRef = ref();

// import { useIconRender } from "@/hooks/useIconRender";

// const { iconRender } = useIconRender();
const drOption = [
  {
    label: 'Whisper语音识别',
    key: "whisper",
    // icon: iconRender({ icon: "ri:openai-fill" }),
  },
  {
    label: '即时识别',
    // icon: iconRender({ icon: "ri:chrome-line" }),
    key: "asr",
  },
];

const st = ref({
   fileBase64: [],
    isLoad: 0,
    isShow: false,
    showMic: false,
    micStart: false,
    chatType: false,
});

//语音识别ASR
const goASR = () => {
  console.log("触发语音识别");

  // const olod = mvalue.value;
  const rec = new Recognition();
  console.log("🚀 ~ goASR ~ rec:", rec);
  let rz = "";
  rec
    .setListener((r) => {
      //mlog('result ', r  );
      rz = r;
      mvalue.value = r;
      console.log("mvalue.value1111", mvalue.value);
      st.value.micStart = true;
    })
    .setOnEnd(() => {
      //mlog('rec end');
      // mvalue.value = olod + rz;
      // console.log("mvalue.value", mvalue.value);

      // ms.info('录音已结束');
      console.log('录音已结束');
      st.value.micStart = false;
    })
    .setOpt({
      timeOut: 3000,
      onStart: () => {
        // ms.info('开始录音,请说话！2秒内无声音将自动关闭');
        console.log('开始录音,请说话！2秒内无声音将自动关闭');
        st.value.micStart = true;
      },
    })
    .start();
};
const handleSelectASR = (key) => {
  if (key == "asr") goASR();
  if (key == "whisper") st.value.showMic = true;
};





//发送消息
const sendMessage = async () => {
  const message = currentMessage.value.trim()
  if (!message) return

  if (!currentSession.value?.id) {
    await initNewSession();
    if (!currentSession.value?.id) {
      proxy.$modal.msgError("创建会话失败，请重试");
      return;
    }
  }


  //用户基于知识库提问
  // if(selectedOptions.value.length) {

  // } else {
    
  // }

  const userMessage = {
    id: Date.now(),
    content: message,
    isUser: true,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  currentMessage.value = ''
  scrollToBottom();

  const aiMessage = {
    id: Date.now() + 1,
    content: '',
    isUser: false,
    timestamp: new Date(),
    loading: true, // 新增
    stopped: false // 新增
  }
  messages.value.push(aiMessage)
  scrollToBottom();

  try {
    const params = buildDifyParams(message)
    console.log('请求参数:', params)
    aiReplying.value = true//停止按钮显示
    // const response = await fetch('http://192.168.1.30/v1/workflows/run', {
    const response = await fetch('http://192.168.1.30/v1/chat-messages', {//对话型
      method: 'POST',
      headers: {
        // 'Authorization': 'Bearer app-U1hVUsVL0f6JELkEPePcg3bC', //教师ai教育助手
        // 'Authorization': 'Bearer app-REApXmCfgdyXbRIygjxAsRvd',//教师ai教育助手-copy
        // 'Authorization': 'Bearer app-SCgYSVNf8jfnSfDHvw2jihWu',//教师AI教育助手-new-dsl
        'Authorization': 'Bearer app-C11WhBgMIIPeGgTf22FbuI2Z',//教师AI教育助手-new-dsl
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    console.log('response:', response)
    if (!response.body) {
      throw new Error('无流式响应')
    }

    const reader = response.body.getReader()
    currentReader.value = reader
    const decoder = new TextDecoder('utf-8')
    let aiContent = ''
    //     用状态机思路处理流式内容
    // 维护一个"是否在think标签内"的状态，逐步拼接内容时判断：
    // 如果遇到 <think>，进入"屏蔽模式"，不显示内容。
    // 如果遇到 </think>，退出"屏蔽模式"，后续内容正常显示。
    // 屏蔽模式下的内容全部丢弃
    let displayContent = ''
    let inThinkTag = false
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      if (value) {
        // const chunk = decoder.decode(value)
        // console.log('收到chunk:', chunk)
        // const lines = chunk.split('\n')
        // for (const line of lines) {
        //   if (line.startsWith('data:')) {
        //     try {
        //       const jsonStr = line.replace(/^data:\s*/, '')
        //       if (!jsonStr || jsonStr === '[DONE]') continue
        //       const eventObj = JSON.parse(jsonStr)
        //       if (eventObj.event === 'text_chunk' && eventObj.data?.text) {
        //         aiContent += eventObj.data.text
        //         aiMessage.content = filterThinkTag(aiContent)
        //         messages.value = [...messages.value]
        //         scrollToBottom()
        //       }
        //     } catch (e) {
        //       console.error('解析失败:', e, line)
        //     }
        //   }
        // }


        const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '')
          if (!jsonStr || jsonStr === '[DONE]') continue
          const eventObj = JSON.parse(jsonStr)
          if (eventObj.event === 'text_chunk' && eventObj.data?.text) {
            aiContent += eventObj.data.text

            // 处理流式内容，过滤think标签
            let text = eventObj.data.text
            let temp = ''
            let i = 0
            while (i < text.length) {
              if (!inThinkTag) {
                // 检查是否遇到think开始标签
                const startIdx = text.indexOf('<think>', i)
                if (startIdx === -1) {
                  // 没有think标签，全部加入
                  temp += text.slice(i)
                  break
                } else {
                  // 有think标签，先加前面的
                  temp += text.slice(i, startIdx)
                  i = startIdx + 7 // 跳过<think>
                  inThinkTag = true
                }
              } else {
                // 检查是否遇到think结束标签
                const endIdx = text.indexOf('</think>', i)
                if (endIdx === -1) {
                  // 还没遇到结束标签，全部丢弃
                  break
                } else {
                  // 跳过结束标签
                  i = endIdx + 8 // 跳过</think>
                  inThinkTag = false
                }
              }
            }
            aiReplying.value = false//停止按钮隐藏
            currentReader.value = null
            displayContent += temp
            aiMessage.content = displayContent
            aiMessage.loading = false // 只要有内容就不再loading
            messages.value = [...messages.value]
            scrollToBottom()
          }
        } catch (e) {
          aiReplying.value = false
          currentReader.value = null
              console.error('解析失败:', e, line)
            }
          }
        }
      }
    }

    aiUserHistoryForm.value = {
      userId: state.user.userId,
      title: message,
      // answer: filterThinkTag(aiMessage.content), // 过滤后保存
      answer: displayContent, // 过滤后保存
      // answer: aiMessage.content,
      aiUserSessionId: currentSession.value.id
    }
    await addAiUserHistory(aiUserHistoryForm.value)
    await getAiUserHistoryList()

  } catch (error) {
    console.error('AI 回答失败', error)
    proxy.$modal.msgError("AI 回答失败")
    aiMessage.content = 'AI 回答失败，请重试'
    messages.value = [...messages.value]
  }
}

// 停止AI回复
const stopAIReply = () => {
  if (currentReader.value) {
    currentReader.value.cancel()
    currentReader.value = null
    aiReplying.value = false
    // 标记AI消息已停止
    const lastAI = messages.value.slice().reverse().find(m => !m.isUser && m.loading)
    if (lastAI) {
      lastAI.loading = false
      lastAI.stopped = true
    }
    messages.value = [...messages.value]
  }
}

// 获取历史搜索列表
const queryAiUserHistoryParams = ref({
  pageNum: 1,
  pageSize: 100,
  userId: state.user.userId
})

const aiUserHistoryList = ref([]);
const aiUserHistoryTotal = ref(0);
function getAiUserHistoryList() {
  // 确保有用户ID才获取历史记录
  // if (!state.user?.userId) {
  //   proxy.$modal.msgError("用户信息未加载，请稍后重试");
  //   return;
  // }
  // 确保查询参数中包含最新的用户ID
  queryAiUserHistoryParams.value.userId = state.user.userId;
  listAiUserHistory(queryAiUserHistoryParams.value).then(response => {
    aiUserHistoryList.value = response.rows;
    aiUserHistoryTotal.value = response.total;
  });
}

getAiUserHistoryList();


// 获取分类搜索列表
const queryAiClassifyParams = ref({
  pageNum: 1,
  pageSize: 100,
  classifyName: '',
  userId: '',
  type: null  // 添加type参数
})

const aiClassifyList = ref([]);
const aiClassifyTotal = ref(0);
function getAiClassifyList() {
  // 确保有 userId 才进行查询
  if (state.user.userId) {
    queryAiClassifyParams.value.userId = state.user.userId;
    // 如果是管理员，不传userId，查看所有数据
    if (isAdmin.value) {
      queryAiClassifyParams.value.userId = '';
    }
    listAiClassify(queryAiClassifyParams.value).then(response => {
      aiClassifyList.value = response.rows;
      aiClassifyTotal.value = response.total;
      console.log('分类列表', response.rows)
    });
  }
}

const selectedOptions = ref([])

const fallbackknoledge = (value) => {
   // 根据选择的结果，更新选中的选项
      if (!selectedOptions.value.includes(value)) {
        selectedOptions.value.push(value);
      } else {
        selectedOptions.value = selectedOptions.value.filter(
          option => option !== value
        );
      }
  console.log('回调了' + value)
  console.log('回调了' + selectedOptions.value)

}

const flag = ref(false)
const getKnoledgeList = () => { 
  console.log('获取知识库列表')
  flag.value = !flag.value
  getAiClassifyList()
}

getKnoledgeList()
const attachFile = () => {
console.log('附加文件功能')
}

const toggleVoice = () => {
console.log('语音输入功能')
}

const pasteContent = () => {
navigator.clipboard.readText().then(text => {
currentMessage.value = text
}).catch(err => {
console.log('粘贴失败:', err)
})
}

const searchContent = () => {
console.log('搜索内容功能')
}

//新建会话
const createNewChat = async () => {
  clearCurrentSession();
  await initNewSession();
}

//删除会话
const deleteHistory = (item) => {

  ElMessageBox.confirm(
    `确定要删除会话 ${item.title} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    delAiUserHistory(item.id, item.aiUserSessionId).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getAiUserHistoryList();
      } else {
        ElMessage.error('删除失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}




//加载某一次会话中的历史记录
const loadHistoryItem = async (item) => {
  try {
    // 设置当前会话ID
    currentSession.value = {
      id: item.aiUserSessionId,
      userId: state.user.userId,
      messages: []
    };

    const response = await getAiUserHistory(item.aiUserSessionId);
    if (response.code === 200) {
      const historyData = response.data;
      
      // 清空现有消息
      messages.value = [];
      
      // 转换历史对话记录为消息格式
      historyData.forEach((record) => {
        // 添加用户问题
        messages.value.push({
          id: Date.now() + messages.value.length,
          content: record.title,
          isUser: true,
          timestamp: new Date(record.createTime || Date.now())
        });
        
        // 添加AI回答
        messages.value.push({
          id: Date.now() + messages.value.length + 1,
          content: record.answer,
          isUser: false,
          timestamp: new Date(record.createTime || Date.now())
        });
      });
      
      scrollToBottom();
    } else {
      proxy.$modal.msgError(response.msg || "加载历史对话失败");
    }
  } catch (error) {
    proxy.$modal.msgError("加载历史对话失败");
  }
}

const formatTime = (timestamp) => {
return timestamp.toLocaleTimeString('zh-CN', { 
hour: '2-digit', 
minute: '2-digit' 
})
}

// 向父组件暴露方法
defineExpose({
clearMessages: () => {
messages.value = []
}
})

// 组件挂载时只获取用户信息和历史记录
onMounted(async () => {
  await getUser();
  // 只有在成功获取用户信息后才获取历史记录
  if (state.user?.userId) {
    console.log('进来了啊')
    getPromptByUserId();
    console.log('走出去了哦')
    getAiUserHistoryList();
  }
});

// 获取提示词和标签
const promptResult = ref([]);
const getPromptByUserId = async () => {
  console.log(state.user.teacherId + '教师 Id')
  console.log(state.user.teacherId + '教师 Id')
  const response = await selectPromptByUserId({ userId: state.user.teacherId });
  if (response.code === 200) {
    promptResult.value = response.data;
  } else {
    proxy.$modal.msgError("获取提示词和标签失败");
  }
}



const footerClass = computed(() => {
  let classes = ["p-4"]
  if (isMobile.value)
    classes = ["sticky", "left-0", "bottom-0", "right-0", "p-2", "pr-3"] //, 'overflow-hidden'
  return classes
})


</script>





<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 0 1px;
}

.chat-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #ffffff;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow-y: auto;
  margin-bottom: 120px;
  scroll-behavior: smooth;
}

.chat-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: #ffffff;
}

.avatar {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  position: relative;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 添加装饰性星星效果 */
.avatar::before,
.avatar::after {
  content: '✦';
  position: absolute;
  color: #3b82f6;
  font-size: 12px;
  opacity: 0.6;
}

.avatar::before {
  top: -10px;
  right: -5px;
}

.avatar::after {
  bottom: 0;
  left: -10px;
}

.greeting {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle-text {
  color: #6B7280;
  font-size: 16px;
  margin-bottom: 12px;
}

.description {
  color: #6B7280;
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
  font-size: 14px;
  margin-bottom: 32px;
}

/* 建议卡片网格 */
.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.suggestion-card {
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.suggestion-card:hover {
  background: #EBF5FF;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

/* 消息样式 */
.chat-messages {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  max-width: 85%;
  animation: fadeIn 0.3s ease-out;
}

.user-message {
  align-self: flex-end;
  text-align: right;
}

.ai-message {
  align-self: flex-start;
  text-align: left;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  display: inline-block;
}
.message-content h1, .message-content h2, .message-content h3 {
  font-weight: bold;
  margin: 8px 0 4px 0;
}
.message-content pre {
  background: #f6f8fa;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
.message-content code {
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 2px;
}
.message-content ul, .message-content ol {
  margin-left: 20px;
}
.message-content strong {
  font-weight: bold;
}

/* 用户消息渐变背景 */
.user-message .message-content {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  border-bottom-right-radius: 4px;
  max-width: fit-content;
}

/* 根据内容长度调整背景色 */
.user-message .message-content:nth-child(3n+1) {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
}

.user-message .message-content:nth-child(3n+2) {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.user-message .message-content:nth-child(3n+3) {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.ai-message .message-content {
  /* background: #F3F4F6; */
  color: #374151;
  border-bottom-left-radius: 4px;
  max-width: fit-content;
}

.message-time {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
  padding: 0 4px;
}

.user-message .message-time {
  text-align: right;
}

.ai-message .message-time {
  text-align: left;
}

/* 输入区域 */
.chat-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 40px 12px;
  background: #ffffff;
  border-top: 1px solid #E5E7EB;
  z-index: 100;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
}

.chat-input-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 8px;
}

.chat-input {
  width: 100%;
  height: 48px;
  padding: 0 120px 0 20px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #1f2937;
  line-height: 48px;
}

.chat-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-actions {
  position: absolute;
  right: 12px;
  top: 35%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 4px;
  background: transparent;
}

.action-btn-zsk{
  width: 82px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: #F3F4F6;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: #F3F4F6;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #E5E7EB;
  /* color: #3b82f6; */
  transform: scale(1.05);
}

.send-btn {
  background: #3b82f6;
  color: white;
}

.send-btn:hover {
  background: #9fceff;
}

/* 历史记录侧边栏 */
.history-sidebar {
  width: 290px;
  background: #ffffff;
  border-left: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  background: #ffffff;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 新建会话按钮样式 */
.new-chat-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  /* border-radius: 8px; */
  /* background: #F3F4F6; */
  /* color: #3b82f6; */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.new-chat-btn:hover {
  /* background: #E5E7EB; */
  transform: scale(1.05);
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  position: relative;
  background: #F9FAFB;
}

.history-item:hover {
  background: #F3F4F6;
}

.history-text {
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  padding-right: 32px;
}

.add-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  /* background: transparent; */
  padding: 4px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.history-item:hover .add-btn {
  /* opacity: 1; */
  /* background: #F3F4F6; */
}

.add-btn:hover {
  /* background: #E5E7EB !important; */
  opacity: 1;
  color: #EF4444;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }
  
  .history-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .chat-input-area {
    left: 0;
    padding: 12px 20px 8px;
  }
  
  .suggestion-grid {
    grid-template-columns: 1fr;
  }
  
  .message {
    max-width: 90%;
  }
  
  .chat-container {
    padding: 0 12px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
  
  .chat-input {
    padding-right: 110px;
  }
  
  .disclaimer {
    font-size: 11px;
  }
}

/* 添加一些微妙的动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.disclaimer {
  text-align: center;
  color: #9CA3AF;
  font-size: 12px;
  padding: 4px 0;
  max-width: 800px;
  margin: 0 auto;
}


.loading-dots span {
  animation: blink 1.4s infinite both;
  font-size: 22px;
  color: #bbb;
  margin-right: 2px;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
.stop-btn {
  margin-left: 10px;
  background: #f87171;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 14px;
}
.stop-btn:hover {
  background: #ef4444;
}
.ai-stopped-tip {
  color: #f87171;
  font-size: 12px;
  margin-top: 4px;
}
</style>

