<template>
  <div class="chat-container">
    <!-- 聊天区域 -->
    <!-- {{ state }} -->
    <div class="chat-main-area">
      <div class="chat-area" ref="chatAreaRef">
        <div class="chat-header">
          <!-- <div class="avatar">🐱</div> -->
           <div class="avatar"><img src="@/assets/images/aichat.png" style="width: 40px;"></div>
          <h1 class="greeting">{{ greeting }}</h1>
          <p class="subtitle-text">{{ subtitle }}</p>
          <p class="description">{{ description }}</p>
        </div>
        
        <div class="suggestion-grid" v-if="!messages.length">
          <div 
            v-for="aiRecommend in aiRecommendList" 
            :key="aiRecommend.id"
            class="suggestion-card"
            @click="selectSuggestion(aiRecommend.name)"
          >
            {{ aiRecommend.name }}
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
            <div class="message-content">{{ message.content }}</div>
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
            :placeholder="inputPlaceholder"
            @keypress.enter="sendMessage"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
          >
          <div class="input-actions">
            <button class="action-btn" @click="attachFile" title="附加文件"><el-icon><Link /></el-icon></button>
            <button class="action-btn" @click="toggleVoice" title="语音输入"><el-icon><Microphone /></el-icon></button>
            <!-- <button class="action-btn" @click="pasteContent" title="粘贴内容">📋</button> -->
            <button class="action-btn" @click="searchContent" title="搜索内容"><el-icon><Search /></el-icon></button>
            <button 
              v-if="currentMessage.trim()"
              class="action-btn send-btn" 
              @click="sendMessage"
              title="发送消息"
            >
              ➤
            </button>
          </div>
          <p class="disclaimer">{{ disclaimer }}</p>
        </div>
        <!-- <p class="disclaimer">{{ disclaimer }}</p> -->
      </div>

      <!-- Main Content -->
      <div class="main-content" v-if="currentComponent">
        <!-- 根据activeNav动态切换组件 -->
        <component :is="currentComponent" ref="activeComponent"></component>
      </div>
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
        >
        <el-tooltip
        class="box-item"
        effect="dark"
        :content="item.title"
        placement="top-start"
      ></el-tooltip>
          <!-- <span class="history-icon">{{ item.icon }}</span> -->
          <span class="history-text">{{ item.title }}</span>
          <el-button type="danger" circle class="add-btn" @click="deleteHistory(item.id)" title="删除会话"><el-icon><Delete /></el-icon></el-button>
        </div>
        
      </div>
    </div>
  </div>
</template>



<script setup>
// 保持脚本部分不变
import { ref, computed } from 'vue'

//  引入推荐标签API
import { listAiRecommend, getAiRecommend, delAiRecommend, addAiRecommend, updateAiRecommend } from "@/api/glxt/aiRecommend";

// 引入历史搜索API
import { listAiUserHistory, getAiUserHistory, delAiUserHistory, addAiUserHistory, updateAiUserHistory } from "@/api/glxt/aiUserHistory";

const { proxy } = getCurrentInstance();
// 响应式数据
const currentMessage = ref('')
const isInputFocused = ref(false)
const messages = ref([])

//获取用户信息
import { getUserProfile } from "@/api/system/user";


const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
});


function getUser() {
  getUserProfile().then(response => {
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;
  });
};

getUser();


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
const greeting = computed(() => '你好！我是您的智能管家。')
const subtitle = computed(() => '专为学校设计')
const description = computed(() => 
'你好！我叫XXX，是你的AI教学助手。你可以向我何与教学最佳实践或学校工作相关的问题，同时我会尽量课堂上的创意、教育学最佳实践的研究、行为管理策略或任一般性建议！你的问题越具体，我的回答就会越好。我今天能如何帮助你？'
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

getAiRecommendList()


// 方法
const selectSuggestion = (text) => {
currentMessage.value = text
}

const aiUserHistoryForm = ref({
  "userId": state.user.userId,
  "title":"",
  "answer":""
})

const chatAreaRef = ref(null);

const scrollToBottom = () => {
  if (chatAreaRef.value) {
    setTimeout(() => {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }, 100);
  }
};

const sendMessage = () => {
  const message = currentMessage.value.trim()
  if (!message) return

  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    content: message,
    isUser: true,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  currentMessage.value = ''
  scrollToBottom();

  // 模拟AI回复
  setTimeout(() => {
    const aiMessage = {
      id: Date.now() + 1,
      content: `感谢您的问题："${message}"。我正在为您准备详细的教学建议和资源。`,
      isUser: false,
      timestamp: new Date()
    }
    messages.value.push(aiMessage)
    scrollToBottom();
    
    aiUserHistoryForm.value.userId = state.user.userId;
    aiUserHistoryForm.value.title = message;
    aiUserHistoryForm.value.answer = aiMessage.content;
    addAiUserHistory(aiUserHistoryForm.value).then(response => {
      getAiUserHistoryList();
    });
  }, 1000)
}

// 获取历史搜索列表
const queryAiUserHistoryParams = ref({
  pageNum: 1,
  pageSize: 100
})

const aiUserHistoryList = ref([]);
const aiUserHistoryTotal = ref(0);
function getAiUserHistoryList() {
  listAiUserHistory(queryAiUserHistoryParams.value).then(response => {
    aiUserHistoryList.value = response.rows;
    aiUserHistoryTotal.value = response.total;
  });
}

getAiUserHistoryList();

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
const createNewChat = () => {
  console.log('新建会话')
  // 实现创建新聊天的逻辑
}

//删除会话
const deleteHistory = (id) => {
  console.log('删除会话', id)
  // 实现删除会话的逻辑
}





const loadHistoryItem = (item) => {
  console.log('加载历史项目', item)
  // 实现加载历史聊天的逻辑
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
  background: #F3F4F6;
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
  top: 33%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 4px;
  background: transparent;
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
</style>

