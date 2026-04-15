<template>
    <div class="knowledge-management">
      <!-- 顶部导航栏 -->
      <header class="app-header">
        <div class="header-container">
          <div class="brand-section">
            <h1 class="app-title">知识管理</h1>
          </div>
          
          <nav class="nav-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.key"
              :class="['nav-tab', { active: activeTab === tab.key }]"
              @click="switchTab(tab.key)"
            >
              <component :is="tab.icon" class="tab-icon" />
              <span>{{ tab.label }}</span>
            </button>
          </nav>
          
          <div class="header-tools">
            <div class="search-container">
              <Search class="search-icon" />
              <input 
                v-model="searchQuery"
                :placeholder="activeTab === 'knowledge' ? '搜索知识库' : '搜索文章'"
                class="search-input"
              />
            </div>
            <el-button class="c1reate-button" type="primary"plain icon="Plus" @click="handleCreate">
              <!-- <Plus class="button-icon" /> -->
              {{ activeTab === 'knowledge' ? '新建知识库' : '新建文章' }}
            </el-button>
          </div>
        </div>
      </header>
  
      <!-- 主要内容区域 -->
      <main class="app-main">
        <div class="main-container">
          <!-- 知识库内容 -->
          <section v-if="activeTab === 'knowledge'" class="content-section">
            <!-- 知识库列表 -->
            <div v-if="currentView === 'list'" class="list-view">
              <div class="view-header">
                <div class="view-info">
                  <h2 class="view-title">知识库</h2>
                  <span class="item-counter">{{ filteredKnowledge.length }} 项</span>
                </div>
              </div>
              
              <div class="content-grid">
                <article 
                  v-for="item in filteredKnowledge" 
                  :key="item.id"
                  class="content-card knowledge-item"
                >
                  <div class="card-main">
                    <div class="card-header">
                      <div class="item-avatar knowledge-avatar">
                        <FolderOpened />
                      </div>
                      <button class="card-menu" @click="showKnowledgeMenu(item, $event)">
                        <MoreHorizontal />
                      </button>
                    </div>
                    
                    <div class="card-body">
                      <h3 class="item-name">{{ item.name }}</h3>
                      <p class="item-description">{{ item.description || '暂无描述' }}</p>
                    </div>
                    
                    <div class="card-footer">
                      <div class="item-metrics">
                        <span class="metric">
                          <FileText class="metric-icon" />
                          {{ item.files }}
                        </span>
                        <span class="metric">
                          <HardDrive class="metric-icon" />
                          {{ item.size }}
                        </span>
                      </div>
                      <time class="item-date">{{ formatDate(item.createdAt) }}</time>
                    </div>
                  </div>
                </article>
              </div>
            </div>
  
            <!-- 文件上传视图 -->
            <div v-if="currentView === 'upload'" class="upload-view">
              <div class="view-header">
                <button class="back-button" @click="backToList">
                  <ArrowLeft class="button-icon" />
                  返回
                </button>
                <div class="view-info">
                  <h2 class="view-title">{{ selectedKnowledge?.name }}</h2>
                  <span class="view-subtitle">文件上传</span>
                </div>
              </div>
  
              <div class="upload-workspace">
                <div class="upload-zone">
                  <div class="zone-content">
                    <Upload class="zone-icon" />
                    <h3 class="zone-title">上传文件</h3>
                    <p class="zone-description">
                      拖拽文件到此处，或点击选择文件<br>
                      支持 PDF、Word、Excel、TXT 等格式
                    </p>
                    <input 
                      ref="fileInput"
                      type="file" 
                      multiple 
                      @change="handleFileSelect"
                      class="file-input"
                    />
                    <button class="zone-button" @click="$refs.fileInput.click()">
                      选择文件
                    </button>
                  </div>
                </div>
  
                <div v-if="fileList.length > 0" class="file-preview">
                  <h3 class="preview-title">待上传文件</h3>
                  <div class="file-list">
                    <div 
                      v-for="(file, index) in fileList" 
                      :key="index"
                      class="file-item"
                    >
                      <div class="file-info">
                        <FileText class="file-icon" />
                        <div class="file-details">
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                      </div>
                      <button class="remove-file" @click="removeFile(index)">
                        <X />
                      </button>
                    </div>
                  </div>
                  
                  <div class="upload-controls">
                    <button class="control-button secondary" @click="clearFiles">
                      清空
                    </button>
                    <button 
                      class="control-button primary" 
                      @click="submitUpload"
                      :disabled="isUploading"
                    >
                      <span v-if="isUploading">上传中...</span>
                      <span v-else>开始上传</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
  
          <!-- 文章内容 -->
          <section v-if="activeTab === 'articles'" class="content-section">
            <div class="list-view">
              <div class="view-header">
                <div class="view-info">
                  <h2 class="view-title">文章</h2>
                  <span class="item-counter">{{ filteredArticles.length }} 篇</span>
                </div>
              </div>
              
              <div class="content-grid">
                <article 
                  v-for="item in filteredArticles" 
                  :key="item.id"
                  class="content-card article-item"
                  @click="editArticle(item)"
                >
                  <div class="card-main">
                    <div class="card-header">
                      <div class="item-avatar article-avatar">
                        <FileText />
                      </div>
                      <button class="card-menu" @click.stop="showArticleMenu(item, $event)">
                        <MoreHorizontal />
                      </button>
                    </div>
                    
                    <div class="card-body">
                      <h3 class="item-name">{{ item.title }}</h3>
                      <p class="item-description">{{ item.excerpt }}</p>
                    </div>
                    
                    <div class="card-footer">
                      <div class="item-metrics">
                        <span class="metric">
                          <Clock class="metric-icon" />
                          {{ formatDate(item.updatedAt) }}
                        </span>
                        <span class="metric">
                          <Type class="metric-icon" />
                          {{ item.wordCount.toLocaleString() }}字
                        </span>
                      </div>
                      <div class="item-tags">
                        <span 
                          v-for="tag in item.tags.slice(0, 2)" 
                          :key="tag"
                          class="tag"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </main>
  
      <!-- 创建知识库对话框 -->
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">创建知识库</h3>
            <button class="modal-close" @click="closeCreateModal">
              <X />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">名称</label>
              <input 
                v-model="createForm.name"
                class="form-input"
                placeholder="输入知识库名称"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea 
                v-model="createForm.description"
                class="form-textarea"
                placeholder="输入知识库描述（可选）"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input 
                  type="checkbox" 
                  v-model="createForm.isPublic"
                  class="checkbox-input"
                />
                <span class="checkbox-label">公开知识库</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="modal-button secondary" @click="closeCreateModal">
              取消
            </button>
            <button class="modal-button primary" @click="submitCreateKnowledge">
              创建
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, reactive } from 'vue'
//   import { 
//     Search, Plus, FolderOpened, FileText, MoreHorizontal, 
//     Upload, ArrowLeft, Clock, Type, HardDrive, X
//   } from '@element-plus/icons-vue'
  
  // 标签配置
  const tabs = [
    { key: 'knowledge', label: '知识库', icon: 'FolderOpened' },
    { key: 'articles', label: '文章', icon: 'Document' }
  ]
  
  // 响应式数据
  const activeTab = ref('knowledge')
  const currentView = ref('list')
  const selectedKnowledge = ref(null)
  const searchQuery = ref('')
  const fileList = ref([])
  const isUploading = ref(false)
  const showCreateModal = ref(false)
  
  const createForm = reactive({
    name: '',
    description: '',
    isPublic: false
  })
  
  // 模拟数据
  const knowledgeList = ref([
    {
      id: 1,
      code: 'KB001',
      name: 'Vue.js 开发指南',
      description: 'Vue.js 框架的完整学习资料和最佳实践',
      files: 24,
      size: '15.2MB',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      code: 'KB002', 
      name: 'JavaScript 核心概念',
      description: 'JavaScript 语言核心概念和高级特性详解',
      files: 18,
      size: '12.8MB',
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      code: 'KB003',
      name: '前端工程化实践',
      description: '现代前端开发工具链和工程化解决方案',
      files: 31,
      size: '28.5MB',
      createdAt: '2024-01-25'
    },
    {
      id: 4,
      code: 'KB004',
      name: 'TypeScript 进阶',
      description: 'TypeScript 类型系统和高级用法',
      files: 16,
      size: '9.7MB',
      createdAt: '2024-02-01'
    }
  ])
  
  const articlesList = ref([
    {
      id: 1,
      title: 'Vue 3 Composition API 深度解析',
      excerpt: '详细介绍 Vue 3 Composition API 的设计理念、使用方法和最佳实践，帮助开发者更好地理解和应用这一新特性。',
      wordCount: 3200,
      updatedAt: '2024-02-05',
      tags: ['Vue.js', 'Composition API', '前端']
    },
    {
      id: 2,
      title: 'JavaScript 异步编程完全指南',
      excerpt: '从回调函数到 Promise，再到 async/await，全面讲解 JavaScript 异步编程的演进历程和实际应用。',
      wordCount: 4100,
      updatedAt: '2024-02-03',
      tags: ['JavaScript', '异步编程', 'Promise']
    },
    {
      id: 3,
      title: '现代 CSS 布局技术对比',
      excerpt: '对比分析 Flexbox、Grid、以及传统布局方法的优缺点，提供实际项目中的选择建议。',
      wordCount: 2800,
      updatedAt: '2024-02-01',
      tags: ['CSS', '布局', 'Flexbox', 'Grid']
    }
  ])
  
  // 计算属性
  const filteredKnowledge = computed(() => {
    if (!searchQuery.value) return knowledgeList.value
    return knowledgeList.value.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  
  const filteredArticles = computed(() => {
    if (!searchQuery.value) return articlesList.value
    return articlesList.value.filter(item => 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  
  // 方法
  const switchTab = (tab) => {
    activeTab.value = tab
    currentView.value = 'list'
    searchQuery.value = ''
  }
  
  const handleCreate = () => {
    if (activeTab.value === 'knowledge') {
      showCreateModal.value = true
    } else {
      console.log('创建文章')
    }
  }
  
  const showKnowledgeMenu = (item, event) => {
    console.log('显示知识库菜单', item)
  }
  
  const showArticleMenu = (item, event) => {
    console.log('显示文章菜单', item)
  }
  
  const goToUpload = (knowledge) => {
    selectedKnowledge.value = knowledge
    currentView.value = 'upload'
  }
  
  const backToList = () => {
    currentView.value = 'list'
    selectedKnowledge.value = null
    fileList.value = []
  }
  
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    fileList.value = [...fileList.value, ...files]
  }
  
  const removeFile = (index) => {
    fileList.value.splice(index, 1)
  }
  
  const clearFiles = () => {
    fileList.value = []
  }
  
  const submitUpload = async () => {
    isUploading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('上传成功')
      backToList()
    } finally {
      isUploading.value = false
    }
  }
  
  const editArticle = (article) => {
    console.log('编辑文章', article)
  }
  
  const closeCreateModal = () => {
    showCreateModal.value = false
    Object.assign(createForm, { name: '', description: '', isPublic: false })
  }
  
  const submitCreateKnowledge = () => {
    if (!createForm.name.trim()) return
    
    const newKnowledge = {
      id: Date.now(),
      code: `KB${String(knowledgeList.value.length + 1).padStart(3, '0')}`,
      name: createForm.name,
      description: createForm.description,
      files: 0,
      size: '0MB',
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    knowledgeList.value.unshift(newKnowledge)
    closeCreateModal()
  }
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
    return date.toLocaleDateString('zh-CN')
  }
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  </script>
  
  <style scoped>
  * {
    box-sizing: border-box;
  }
  
  .knowledge-management {
    min-height: 100vh;
    background: #fafbfc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }
  
  /* 顶部导航 */
  .app-header {
    background: white;
    border-bottom: 1px solid #e1e5e9;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-container {
    /* max-width: 1400px; */
    margin: 0 auto;
    padding: 0 24px;
    height: 93px;
    display: flex;
    align-items: center;
    gap: 32px;
  }
  
  .brand-section {
    flex-shrink: 0;
  }
  
  .app-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .nav-tabs {
    display: flex;
    gap: 4px;
    background: #f6f8fa;
    padding: 4px;
    border-radius: 8px;
  }
  
  .nav-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    background: none;
    border-radius: 6px;
    color: #656d76;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .nav-tab:hover {
    color: #1a1a1a;
    background: rgba(255, 255, 255, 0.7);
  }
  
  .nav-tab.active {
    color: #1a1a1a;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .tab-icon {
    width: 16px;
    height: 16px;
  }
  
  .header-tools {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
  }
  
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: #656d76;
  }
  
  .search-input {
    width: 280px;
    height: 34px;
    padding: 0 12px 0 36px;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    transition: border-color 0.2s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  .create-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #1f883d;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .create-button:hover {
    background: #1a6499;
  }
  
  .button-icon {
    width: 16px;
    height: 16px;
  }
  
  /* 主要内容 */
  .app-main {
    /* padding: 10px; */
    margin-left: -200px;
  }
  
  .main-container {
    /* max-width: 1400px; */
    margin: 0 auto;
  }
  
  .content-section {
    background: white;
    /* border-radius: 12px; */
    /* border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px; */
    overflow: hidden;
    border: 1px solid #d1d9e0;
    overflow: hidden;
  }
  
  /* 视图头部 */
  .view-header {
    padding: 24px 32px;
    border-bottom: 1px solid #d1d9e0;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: none;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    color: #656d76;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .back-button:hover {
    background: #f6f8fa;
    border-color: #8c959f;
  }
  
  .view-info {
    flex: 1;
  }
  
  .view-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .view-subtitle {
    color: #656d76;
    font-size: 14px;
  }
  
  .item-counter {
    color: #656d76;
    font-size: 14px;
    background: #f6f8fa;
    padding: 2px 8px;
    border-radius: 12px;
    margin-left: 12px;
  }
  
  /* 内容网格 */
  .content-grid {
    padding: 22px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 10px;
  }
  
  .content-card {
    border: 1px solid #d1d9e0;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .content-card:hover {
    border-color: #8c959f;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  }
  
  .card-main {
    padding: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .knowledge-avatar {
    background: #0969da;
  }
  
  .article-avatar {
    background: #8250df;
  }
  
  .card-menu {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    border-radius: 6px;
    color: #656d76;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .card-menu:hover {
    background: #f6f8fa;
    color: #1a1a1a;
  }
  
  .card-body {
    margin-bottom: 16px;
  }
  
  .item-name {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    line-height: 1.4;
  }
  
  .item-description {
    color: #656d76;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f6f8fa;
  }
  
  .item-metrics {
    display: flex;
    gap: 16px;
  }
  
  .metric {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #656d76;
    font-size: 12px;
  }
  
  .metric-icon {
    width: 14px;
    height: 14px;
  }
  
  .item-date {
    color: #8c959f;
    font-size: 12px;
  }
  
  .item-tags {
    display: flex;
    gap: 6px;
  }
  
  .tag {
    background: #ddf4ff;
    color: #0969da;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }
  
  /* 上传区域 */
  .upload-workspace {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .upload-zone {
    border: 2px dashed #d1d9e0;
    border-radius: 8px;
    padding: 48px 32px;
    text-align: center;
    transition: border-color 0.2s ease;
  }
  
  .upload-zone:hover {
    border-color: #8c959f;
  }
  
  .zone-content {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .zone-icon {
    width: 48px;
    height: 48px;
    color: #656d76;
    margin: 0 auto 16px;
  }
  
  .zone-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  .zone-description {
    color: #656d76;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 24px 0;
  }
  
  .file-input {
    display: none;
  }
  
  .zone-button {
    padding: 8px 16px;
    background: #0969da;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .zone-button:hover {
    background: #0860ca;
  }
  
  .file-preview {
    border: 1px solid #d1d9e0;
    border-radius: 8px;
    padding: 24px;
  }
  
  .preview-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 16px 0;
  }
  
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f6f8fa;
    border-radius: 6px;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .file-icon {
    width: 20px;
    height: 20px;
    color: #656d76;
  }
  
  .file-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
  }
  
  .file-size {
    font-size: 12px;
    color: #656d76;
  }
  
  .remove-file {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    border-radius: 4px;
    color: #656d76;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .remove-file:hover {
    background: #ffebe9;
    color: #d1242f;
  }
  
  .upload-controls {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #d1d9e0;
  }
  
  .control-button {
    padding: 8px 16px;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .control-button.secondary {
    background: white;
    color: #656d76;
  }
  
  .control-button.secondary:hover {
    background: #f6f8fa;
    border-color: #8c959f;
  }
  
  .control-button.primary {
    background: #1f883d;
    color: white;
    border-color: #1f883d;
  }
  
  .control-button.primary:hover {
    background: #1a7f37;
  }
  
  .control-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* 模态框 */
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
    border-radius: 8px;
    width: 100%;
    max-width: 480px;
    margin: 24px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #d1d9e0;
  }
  
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    border-radius: 6px;
    color: #656d76;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .modal-close:hover {
    background: #f6f8fa;
    color: #1a1a1a;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 6px;
  }
  
  .form-input,
  .form-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }
  
  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #0969da;
  }
  
  .form-textarea {
    resize: vertical;
    font-family: inherit;
  }
  
  .form-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .checkbox-input {
    margin: 0;
  }
  
  .checkbox-label {
    font-size: 14px;
    color: #1a1a1a;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #d1d9e0;
  }
  
  .modal-button {
    padding: 8px 16px;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .modal-button.secondary {
    background: white;
    color: #656d76;
  }
  
  .modal-button.secondary:hover {
    background: #f6f8fa;
    border-color: #8c959f;
  }
  
  .modal-button.primary {
    background: #1f883d;
    color: white;
    border-color: #1f883d;
  }
  
  .modal-button.primary:hover {
    background: #1a7f37;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      height: auto;
      padding: 16px;
      gap: 16px;
    }
    
    .header-tools {
      width: 100%;
      margin-left: 0;
    }
    
    .search-input {
      flex: 1;
      width: auto;
    }
    
    .content-grid {
      grid-template-columns: 1fr;
      padding: 16px;
    }
    
    .view-header {
      padding: 16px;
    }
    
    .upload-workspace {
      padding: 16px;
    }
  }
  </style>