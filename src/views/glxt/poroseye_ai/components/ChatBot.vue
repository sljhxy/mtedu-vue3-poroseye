<template>
  <div class="chat-container">
    <!-- 聊天区域 -->
    <!-- {{ state }} -->
    <div class="chat-main-area">
      <div class="chat-area">
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
        <button class="add-btn" @click="createNewChat" title="清空历史，清空后不可撤回"><el-icon><Delete /></el-icon></button>
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

  // 清空输入框

  currentMessage.value = ''

  // 模拟AI回复  正常会调用 ai接口
  setTimeout(() => {
  const aiMessage = {
  id: Date.now() + 1,
  content: `感谢您的问题："${message}"。我正在为您准备详细的教学建议和资源。`,
  isUser: false,
  timestamp: new Date()
  }
  messages.value.push(aiMessage)
  aiUserHistoryForm.value.userId = state.user.userId;
  aiUserHistoryForm.value.title = message;
  aiUserHistoryForm.value.answer = aiMessage.content;
  addAiUserHistory(aiUserHistoryForm.value).then(response => {
        // proxy.$modal.msgSuccess("新增成功");
        getAiUserHistoryList();
  });

  }, 1000)


  // aiUserHistoryForm.value.userId = 1;
  // aiUserHistoryForm.value.title = message;
  // aiUserHistoryForm.value.answer = aiMessage.content;
  // addAiUserHistory(aiUserHistoryForm.value).then(response => {
  //       proxy.$modal.msgSuccess("新增成功");
  //       getAiUserHistoryList();
  // });

}

// 获取历史搜索列表
const queryAiUserHistoryParams = ref({
  pageNum: 1,
  pageSize: 10
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

const createNewChat = () => {
  console.log('清空历史记录')
  // 实现创建新聊天的逻辑
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
  height: 100%;
  width: 100%;
}

.chat-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.chat-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 70px;
  height: 70px;
  /* background: linear-gradient(135deg, #fbbf24, #f59e0b); */
  background: linear-gradient(135deg, #ceccc9, #a3d3d8);
  /* background-image: url("../assets/images/aichat.png"); */
  border-radius: 50%;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.greeting {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
  text-align: center;
}

.subtitle-text {
  color: #6b7280;
  margin-bottom: 16px;
  text-align: center;
}

.description {
  color: #374151;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 24px;
  max-width: 600px;
  font-size: 14px;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 30px;
}

.suggestion-card {
  /* background: #f8f9fa; */
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.suggestion-card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Chat Messages */
.chat-messages {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 10px;
  flex: 1;
  overflow-y: auto;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  align-items: flex-end;
}

.ai-message {
  align-items: flex-start;
}

.message-content {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  word-wrap: break-word;
}

.user-message .message-content {
  background: #3b82f6;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 8px;
}

/* Chat Input */
.chat-input-area {
  padding: 16px;
  /* border-top: 1px solid #e5e7eb; */
  background: white;
  margin-top: 100px;
}

.chat-input-container {
  position: relative;
  margin-bottom: 100px;
}

.chat-input {
  width: 100%;
  padding: 14px 120px 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chat-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.input-actions {
  position: absolute;
  right: 8px;
  top: 30%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  font-size: 14px;
}

.action-btn:hover {
  background: #e5e7eb;
}

.send-btn {
  background: #3b82f6;
  color: white;
}

.send-btn:hover {
  background: #2563eb;
}

.disclaimer {
  /* margin-bottom: 100px; */
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

/* 历史搜索侧边栏样式 */
.history-sidebar {
  width: 280px;
  /* background-color: #f9fafb; */
  display: flex;
  flex-direction: column;
  /* border-left: 1px solid #ebebe5; */
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.add-btn {
  width: 28px;
  height: 28px;
  border-radius: 40%;
  /* background: #3b82f6; */
  /* color: white; */
  border: none;
  /* font-size: 18px; */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
  transition: background-color 0.2s;
  margin-bottom: 4px;
  border: 1px solid #f3f3f3;
}

.history-item:hover {
  background-color: #f3f4f6;
}

.history-icon {
  margin-right: 12px;
  font-size: 16px;
}

.history-text {
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }
  
  .history-sidebar {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid #e5e7eb;
  }
  
  .chat-area {
    padding: 15px;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  .greeting {
    font-size: 20px;
  }
  
  .description {
    font-size: 13px;
    margin-bottom: 20px;
  }
  
  .suggestion-grid {
    grid-template-columns: 1fr;
  }
  
  .chat-input {
    padding: 12px 110px 12px 14px;
  }
}

@media (max-width: 480px) {
  .chat-area {
    padding: 12px;
  }
  
  .message-content {
    max-width: 90%;
    font-size: 14px;
    padding: 10px 14px;
  }
  
  .chat-input-area {
    padding: 12px;
  }
  
  .chat-input {
    padding: 10px 100px 10px 12px;
    font-size: 14px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>
