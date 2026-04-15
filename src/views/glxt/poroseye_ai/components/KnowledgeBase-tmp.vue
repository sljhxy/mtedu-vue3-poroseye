<template>
  <div class="knowledge-container">
    <!-- 头部区域 -->
    <div class="header">
      <div class="title-section">
        <h1 class="main-title">专题 <span class="count">{{ topics.length }}</span></h1>
      </div>
      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索专题..." 
            v-model="searchQuery"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>

    <!-- 专题网格 -->
    <div class="topics-grid">
      <!-- 创建专题卡片 -->
      <div class="topic-card create-card" @click="showCreateModal = true">
        <div class="create-content">
          <div class="plus-icon">+</div>
          <h3>创建专题</h3>
          <p>上传文件，收集内容</p>
        </div>
      </div>

      <!-- 专题卡片 -->
      <div 
        v-for="topic in filteredTopics" 
        :key="topic.id" 
        class="topic-card"
      >
        <!-- 卡片内容 -->
        <div class="card-content">
          <div class="topic-header">
            <span class="folder-icon">📁</span>
            <h3 class="topic-title">{{ topic.name }}</h3>
          </div>
          <div class="topic-stats">
            <span class="stats-text">文章 {{ topic.articles }} • 知识点 {{ topic.knowledge }}</span>
          </div>
          <div class="topic-count">{{ topic.count }}</div>
        </div>
        
        <!-- 底部信息区域 -->
        <div class="card-footer">
          <!-- 左下角：创建时间 -->
          <div class="creation-date">
            <span class="date-value">{{ topic.createdAt }}</span>
          </div>
          
          <!-- 右下角：操作按钮 -->
          <div class="action-buttons">
            <button 
              class="action-btn edit-btn" 
              @click.stop="editTopic(topic)"
              title="编辑专题"
            >
              <span class="action-icon"><el-icon><Edit /></el-icon></span>
            </button>
            <button 
              class="action-btn delete-btn" 
              @click.stop="confirmDeleteTopic(topic)"
              title="删除专题"
            >
              <span class="action-icon"><el-icon><Delete /></el-icon></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建专题模态框 -->
    <transition name="modal-fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
        <div class="modal-content create-modal">
          <div class="modal-header">
            <div class="header-content">
              <div class="modal-icon">➕</div>
              <h2>创建新专题</h2>
            </div>
            <button class="close-btn" @click="closeCreateModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="topic-name">专题名称</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="topic-name" 
                  v-model="newTopic.name" 
                  placeholder="输入专题名称"
                  class="styled-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="topic-description">专题描述</label>
              <div class="input-wrapper">
                <textarea 
                  id="topic-description" 
                  v-model="newTopic.description" 
                  placeholder="输入专题描述"
                  rows="4"
                  class="styled-input"
                ></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="action-btn secondary" @click="closeCreateModal">取消</button>
              <button 
                class="action-btn primary" 
                @click="createTopic" 
                :disabled="isCreating || !newTopic.name.trim()"
              >
                <span v-if="isCreating" class="loading-spinner"></span>
                {{ isCreating ? '创建中...' : '创建专题' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 编辑专题模态框 -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content edit-modal">
          <div class="modal-header">
            <div class="header-content">
              <div class="modal-icon">✏️</div>
              <h2>编辑专题</h2>
            </div>
            <button class="close-btn" @click="closeEditModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="edit-topic-name">专题名称</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="edit-topic-name" 
                  v-model="editingTopic.name" 
                  placeholder="输入专题名称"
                  class="styled-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="edit-topic-description">专题描述</label>
              <div class="input-wrapper">
                <textarea 
                  id="edit-topic-description" 
                  v-model="editingTopic.description" 
                  placeholder="输入专题描述"
                  rows="4"
                  class="styled-input"
                ></textarea>
              </div>
            </div>
            
            <div class="form-group">
              <label>专题统计</label>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ editingTopic.articles }}</div>
                  <div class="stat-label">文章</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ editingTopic.knowledge }}</div>
                  <div class="stat-label">知识点</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ editingTopic.count || 0 }}</div>
                  <div class="stat-label">总数</div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>创建时间</label>
              <div class="date-display">{{ editingTopic.createdAt }}</div>
            </div>
            
            <div class="form-actions">
              <button class="action-btn secondary" @click="closeEditModal">取消</button>
              <button 
                class="action-btn primary" 
                @click="updateTopic" 
                :disabled="isUpdating || !editingTopic.name.trim()"
              >
                <span v-if="isUpdating" class="loading-spinner"></span>
                {{ isUpdating ? '更新中...' : '保存更改' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 成功提示 -->
    <transition name="toast-fade">
      <div v-if="showSuccessMessage" class="success-toast">
        <div class="toast-content">
          <span class="success-icon">✓</span>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const searchQuery = ref('')
const showCreateModal = ref(false)
const isCreating = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 在现有的响应式数据后添加
const showEditModal = ref(false)
const editingTopic = ref({
  id: null,
  name: '',
  description: '',
  articles: 0,
  knowledge: 0,
  count: 0,
  createdAt: ''
})
const isUpdating = ref(false)

// 新专题数据
const newTopic = ref({
  name: '',
  description: ''
})

// 专题数据
const topics = ref([
  {
    id: 1,
    name: '工作',
    articles: 5,
    knowledge: 0,
    description: '工作相关的知识内容',
    count: 600,
    createdAt: '2023-05-15'
  },
  {
    id: 2,
    name: '学习',
    articles: 25,
    knowledge: 0,
    description: '学习相关的知识内容',
    count: 1200,
    createdAt: '2023-06-20'
  },
  {
    id: 3,
    name: '学习',
    articles: 8,
    knowledge: 0,
    description: '学习相关的知识内容',
    count: 450,
    createdAt: '2023-07-10'
  }
])

// 计算属性
const filteredTopics = computed(() => {
  if (!searchQuery.value) return topics.value
  
  return topics.value.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 关闭创建模态框
const closeCreateModal = () => {
  showCreateModal.value = false
  newTopic.value.name = ''
  newTopic.value.description = ''
}

const createTopic = async () => {
  if (!newTopic.value.name.trim()) return
  
  // 开始创建过程
  isCreating.value = true
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟随机的文章和知识数量
    const randomArticles = Math.floor(Math.random() * 10) + 1
    const randomKnowledge = Math.floor(Math.random() * 20) + 1
    const randomCount = Math.floor(Math.random() * 1000) + 100
    
    const topic = {
      id: Date.now(),
      name: newTopic.value.name,
      articles: randomArticles,
      knowledge: randomKnowledge,
      description: newTopic.value.description || `${newTopic.value.name}相关的知识内容`,
      count: randomCount,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    topics.value.unshift(topic) // 添加到开头
    
    // 显示成功消息
    successMessage.value = `专题"${newTopic.value.name}"创建成功！已生成 ${randomArticles} 篇文章和 ${randomKnowledge} 个知识点。`
    showSuccessMessage.value = true
    
    // 关闭创建模态框
    closeCreateModal()
    
    // 3秒后隐藏成功消息
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('创建专题失败:', error)
  } finally {
    isCreating.value = false
  }
}

// 编辑专题方法
const editTopic = (topic) => {
  editingTopic.value = { ...topic } // 创建副本避免直接修改原数据
  showEditModal.value = true
}

// 关闭编辑模态框
const closeEditModal = () => {
  showEditModal.value = false
}

// 更新专题方法
const updateTopic = async () => {
  if (!editingTopic.value.name.trim()) return
  
  isUpdating.value = true
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 找到并更新专题
    const index = topics.value.findIndex(t => t.id === editingTopic.value.id)
    if (index > -1) {
      topics.value[index] = { ...editingTopic.value }
    }
    
    // 显示成功消息
    successMessage.value = `专题"${editingTopic.value.name}"更新成功！`
    showSuccessMessage.value = true
    
    // 关闭编辑模态框
    closeEditModal()
    
    // 3秒后隐藏成功消息
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('更新专题失败:', error)
  } finally {
    isUpdating.value = false
  }
}

// 确认删除专题
const confirmDeleteTopic = (topic) => {
  if (confirm(`确定要删除专题「${topic.name}」吗？`)) {
    deleteTopic(topic)
  }
}

// 删除专题方法
const deleteTopic = (topic) => {
  const index = topics.value.findIndex(t => t.id === topic.id)
  if (index > -1) {
    topics.value.splice(index, 1)
    successMessage.value = `专题「${topic.name}」已成功删除`
    showSuccessMessage.value = true
    
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}
</script>

<style scoped>
.knowledge-container {
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部区域 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.count {
  font-size: 20px;
  color: #6b7280;
  font-weight: 400;
}

.search-section {
  flex-shrink: 0;
}

.search-box {
  position: relative;
  width: 280px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

/* 专题网格 */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 专题卡片相关样式 */
.topic-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  height: 140px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topic-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
  background: #f8fafc; /* 悬停时改变背景色 */
}

.card-content {
  padding: 20px 20px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 底部信息区域 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 16px;
  margin-top: auto;
}

/* 左下角：创建时间 */
.creation-date {
  font-size: 12px;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.2s;
}

.topic-card:hover .creation-date {
  opacity: 1;
}

.date-value {
  font-weight: 500;
}

/* 右下角：操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.topic-card:hover .action-buttons {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 12px;
}

.edit-btn {
  /* background: #3b82f6; */
  /* color: white; */
}

.edit-btn:hover {
  /* background: #2563eb; */
  transform: scale(1.1);
}

.delete-btn {
  /* background: #ef4444; */
  /* color: white; */
}

.delete-btn:hover {
  /* background: #dc2626; */
  transform: scale(1.1);
}

.action-icon {
  font-size: 12px;
}

/* 创建专题卡片 */
.create-card {
  border: 2px dashed #d1d5db;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.create-content {
  text-align: center;
}

.plus-icon {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 300;
  margin: 0 auto 12px;
}

.create-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.create-content p {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}

/* 专题卡片内容 */
.topic-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.folder-icon {
  font-size: 20px;
}

.topic-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-stats {
  margin-bottom: 10px;
}

.stats-text {
  color: #6b7280;
  font-size: 13px;
}

.topic-count {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #6b7280;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

/* 编辑模态框特殊样式 */
.edit-modal {
  max-width: 550px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 20px;
  background: #eff6ff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
}

/* 表单样式增强 */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.styled-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  background: #f9fafb;
}

.styled-input:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 8px;
}

.stat-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* 日期显示 */
.date-display {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  color: #6b7280;
  font-size: 15px;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.form-actions .action-btn {
  width: auto;
  height: auto;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}

.form-actions .action-btn.primary {
  background: #3b82f6;
  color: white;
}

.form-actions .action-btn.primary:hover {
  background: #2563eb;
}

.form-actions .action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.form-actions .action-btn.secondary:hover {
  background: #e5e7eb;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #10b981;
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 1001;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
}

.success-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

/* 动画效果 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 禁用按钮 */
.form-actions .action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .topics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .topics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .knowledge-container {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-section {
    width: 100%;
  }
  
  .search-box {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .topics-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .action-btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 创建模态框特殊样式 */
.create-modal {
  max-width: 550px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.create-modal .modal-icon {
  background: #dcfce7;
  color: #16a34a;
}
</style>