<template>
  <div class="app-container">
    <!-- Left Sidebar -->
    <div class="sidebar">
      
      <div class="logo">
        <!-- <span class="subtitle">FREE</span> -->
        <h1>MAGIC-SCHOOL</h1>
        
      </div>
      
      <nav class="nav-menu">
        <a 
          v-for="item in navItems" 

          :key="item.id"
          href="#" 
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          @click.prevent="setActiveNav(item.id)"
        >
          <span class="icon">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </nav>

      <!-- <button class="upgrade-btn">免费</button> -->

     

      <!-- <div class="user-section">
        <div class="user-avatar">{{ userInitials }}</div>
        <span>⚙️</span>
      </div> -->
    </div>

    <!-- Right Content Area (包含主内容和右侧边栏) -->
    <div class="right-content-area">
      <!-- Main Content -->
      <div class="main-content">
        <!-- 根据activeNav动态切换组件 -->
        <!-- <component :is="currentComponent" ref="activeComponent"></component> -->

        <!-- 修改后 -->
        <component 
          :is="currentComponent" 
          ref="activeComponent"
          @back-to-knowledge-base="handleBackToKnowledgeBase"
          :topicId="currentTopicId"
          :topicName="currentTopicName"
        ></component>
      </div>

      <!-- Right Sidebar -->
      <!-- <div class="right-sidebar"> -->
        <!-- <div class="sidebar-header">
          <h2 class="sidebar-title">历史搜索</h2>
          <button class="add-btn" @click="createNewChat">+</button>
        </div>
         -->
        <!-- <div class="history-list">
          <div 
            v-for="item in historyItems" 
            :key="item.id"
            class="history-item"
            @click="loadHistoryItem(item)"
          >
            <span class="history-icon">{{ item.icon }}</span>
            <span class="history-text">{{ item.title }}</span>
          </div>
        </div> -->
      <!-- </div> -->
    </div>
  </div>
</template>

<script setup>
// import { ref, reactive, computed, onMounted, markRaw, shallowRef } from 'vue'
import { ref, reactive, computed, onMounted, markRaw, shallowRef, provide } from 'vue'
// 导入组件
import ChatBot from './components/ChatBot.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'
import OutputHistory from './components/OutputHistory.vue'
import TopicUpload from './components/TopicUpload.vue'

// 响应式数据
const activeNav = ref('raina')
const activeComponent = ref(null)
const currentTopicId = ref(null)
const currentTopicName = ref('')
const showTopicUpload = ref(false)
// 在其他响应式变量附近添加
const currentTopicData = ref(null)
// 使用shallowRef避免组件对象被深度响应式转换
const componentMap = shallowRef({
  'raina': markRaw(ChatBot),
  'tools': markRaw(KnowledgeBase),
  'history': markRaw(OutputHistory),
  'topicUpload': markRaw(TopicUpload)
})

// 计算当前应该显示的组件
const currentComponent = computed(() => {
  // return componentMap.value[activeNav.value] || componentMap.value['raina']
  if (activeNav.value === 'tools' && showTopicUpload.value) {
    return componentMap.value['topicUpload']
  }
  return componentMap.value[activeNav.value] || componentMap.value['raina']
})

// 静态数据
const navItems = [
  { id: 'raina', icon: '🤖', label: 'Poroseye (聊天机器人)' },
  { id: 'tools', icon: '🪄', label: '知识库' },
  // { id: 'history', icon: '📋', label: '输出历史' },
  // { id: 'student', icon: '🎓', label: 'MagicStudent' },
  // { id: 'lab', icon: '🧪', label: 'MagicSchool 实验室' },
  // { id: 'favorites', icon: '❤️', label: '喜欢' },
  // { id: 'resources', icon: '📚', label: '资源' },
  // { id: 'share', icon: '✨', label: '分享魔力' },
  // { id: 'literacy', icon: '🎯', label: '学生AI素养' },
  // { id: 'upgrade', icon: '⬆️', label: '升级' }
]

const historyItems = ref([
  { id: 1, icon: '💡', title: 'Photosynthesis Lesson Ideas' },
  { id: 2, icon: '💻', title: 'Coding basics intro' },
  { id: 3, icon: '📚', title: 'Best apps for teaching history' },
  { id: 4, icon: '📐', title: 'Geometry hands-on activity s...' },
  { id: 5, icon: '🎵', title: 'Integrating Music into Fractio...' },
  { id: 6, icon: '📊', title: 'Geometry hands-on activity...' },
  { id: 7, icon: '🎯', title: 'Motivating Disinterested Stud...' }
])

// 方法
const setActiveNav = (navId) => {
  // activeNav.value = navId
  activeNav.value = navId
  // 如果从上传页面切换到其他导航，则重置上传页面状态
  if (navId !== 'tools') {
    showTopicUpload.value = false
  } else if (showTopicUpload.value) {
    // 如果是在知识库导航内切换回知识库列表
    showTopicUpload.value = false
  }
}

// 处理导航到上传组件
const handleNavigateToUpload = (event) => {
  if (activeNav.value !== 'tools') {
    activeNav.value = 'tools'
  }
  // currentTopicId.value = event.detail.classifyId
  // currentTopicName.value = event.detail.classifyName
  currentTopicData.value = event.detail.topic  // 添加存储完整 topic 对象
  showTopicUpload.value = true
  console.log('============================:' + event)
  console.log(event)
  console.log('============================:' + event)

  
}


// 提供给子组件的属性和方法
provide('topicData', {
  // topicId: currentTopicId,
  // topicName: currentTopicName,
  opicObject: currentTopicData  // 添加完整的 topic 对象
})


// 处理返回知识库列表
const handleBackToKnowledgeBase = () => {
  showTopicUpload.value = false
}



const createNewChat = () => {
  // 如果当前是聊天组件，则清空聊天记录
  if (activeNav.value === 'raina' && activeComponent.value) {
    activeComponent.value.clearMessages && activeComponent.value.clearMessages()
  }
  console.log('创建新对话')
}

const loadHistoryItem = (item) => {
  console.log('加载历史项目:', item.title)
  // 切换到聊天组件
  activeNav.value = 'raina'
}

// 生命周期
onMounted(() => {
  console.log('Magic School AI 组件已挂载')
  // 监听导航到上传组件的事件
  window.addEventListener('navigate-to-upload', handleNavigateToUpload)
})

// 在组件卸载前移除事件监听
onUnmounted(() => {
  window.removeEventListener('navigate-to-upload', handleNavigateToUpload)
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 90%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  /* background-color: #f8f9fa; */
  padding: 0;
  
}

/* 新增：右侧内容区域（包含主内容和右侧边栏） */
.right-content-area {
  display: flex;
  flex: 1;
  height: 100vh;
}

/* Left Sidebar */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  flex-shrink: 0;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.logo h1 {
  color: #3b82f6; /* 从 #6366f1 改为蓝色 */
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  line-height: 1.2;
}

.logo .subtitle {
  background: #3b82f6; /* 从 #6366f1 改为蓝色 */
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;
}

.nav-menu {
  z-index: 999;
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #374151;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
  
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item.active {
  background-color: #dbeafe; /* 从 #ede9fe 改为浅蓝色背景 */
  color: #2563eb; /* 从 #6366f1 改为深蓝色文字 */
}

.nav-item .icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  font-size: 16px;
}

.upgrade-btn {
  margin: 16px 20px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upgrade-btn:hover {
  background: #e5e7eb;
}

.bottom-branding {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.bottom-branding h2 {
  color: #3b82f6; /* 从 #6366f1 改为蓝色 */
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #3b82f6; /* 从 #6366f1 改为蓝色 */
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0; /* 防止flex子项溢出 */
}

.chat-area {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 800px;
  margin: 0 auto;
  overflow-y: auto;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.greeting {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  text-align: center;
}

.subtitle-text {
  color: #6b7280;
  margin-bottom: 24px;
  text-align: center;
}

.description {
  color: #374151;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 32px;
  max-width: 600px;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
}

.suggestion-card {
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Chat Messages */
.chat-messages {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
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
  background: #3b82f6; /* 从 #6366f1 改为蓝色 */
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
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.chat-input-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.chat-input {
  width: 100%;
  padding: 16px 140px 16px 20px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #3b82f6; /* 从 #6366f1 改为蓝色 */
}

.input-actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 36px;
  height: 36px;
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
  background: #3b82f6; /* 从 #6366f1 改为蓝色 */
  color: white;
}

.send-btn:hover {
  background: #2563eb; /* 从 #5856eb 改为深蓝色 */
}

.disclaimer {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  margin-top: 12px;
}


</style>