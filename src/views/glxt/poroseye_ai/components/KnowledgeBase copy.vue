<template>
  <div class="knowledge-management">
    <!-- Tab 导航栏 -->
    <div class="tab-navigation">
      <div class="tab-header">
        <h1 class="main-title">知识管理</h1>
        <div class="tab-buttons">
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'knowledge' }"
            @click="switchTab('knowledge')"
          >
            <span class="tab-icon">📚</span>
            知识库
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'articles' }"
            @click="switchTab('articles')"
          >
            <span class="tab-icon">📝</span>
            文章
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 内容区域 -->
    <div class="tab-content">
      <!-- 知识库 Tab -->
      <div v-if="activeTab === 'knowledge'" class="knowledge-tab">
        <!-- 知识库列表视图 -->
        <div v-if="currentView === 'list'" class="knowledge-list">
          <div class="list-header">
            <button class="create-btn" @click="createKnowledge">
              <span class="btn-icon">+</span>
              创建知识库
            </button>
            <div class="search-section">
              <div class="search-box">
                <input 
                  type="text" 
                  class="search-input" 
                  placeholder="搜索知识库..." 
                  v-model="knowledgeSearchQuery"
                />
                <span class="search-icon">🔍</span>
              </div>
            </div>
          </div>

          <div class="knowledge-table">
            <div class="table-header">
              <div class="table-col col-id">编号</div>
              <div class="table-col col-name">知识名称</div>
              <div class="table-col col-desc">知识描述</div>
              <div class="table-col col-actions">操作</div>
            </div>
            
            <div class="table-body">
              <div 
                v-for="knowledge in filteredKnowledge" 
                :key="knowledge.id"
                class="table-row"
              >
                <div class="table-col col-id">{{ knowledge.code }}</div>
                <div class="table-col col-name">{{ knowledge.name }}</div>
                <div class="table-col col-desc">{{ knowledge.description }}</div>
                <div class="table-col col-actions">
                  <button 
                    class="action-btn delete-btn" 
                    @click="confirmDeleteKnowledge(knowledge)"
                  >
                    删除
                  </button>
                   <!-- <el-button plain type="danger" icon="Delete" @click="removeFile(index)">删除</el-button> -->
                  <button 
                    class="action-btn attachment-btn" 
                    @click="goToUpload(knowledge)"
                  >
                    附件
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件管理界面 -->
        <div v-if="currentView === 'upload'" class="attachment-view">
          <div class="attachment-container">
            <div class="attachment-header">
              <button class="back-button" @click="backToList">
                <span class="back-icon">←</span>
                <span>返回</span>
              </button>
              <button class="upload-btn" @click="showUploadModal = true">
                上传附件
              </button>
            </div>

            <div class="attachment-table">
              <div class="table-header">
                <div class="table-col col-doc-id">文档编号</div>
                <div class="table-col col-doc-name">文档名称</div>
                <div class="table-col col-doc-type">文档类型</div>
                <div class="table-col col-doc-actions">操作</div>
              </div>
              
              <div class="table-body">
                <div 
                  v-for="attachment in attachmentList" 
                  :key="attachment.id"
                  class="table-row"
                >
                  <div class="table-col col-doc-id">{{ attachment.docId }}</div>
                  <div class="table-col col-doc-name">{{ attachment.name }}</div>
                  <div class="table-col col-doc-type">{{ attachment.type }}</div>
                  <div class="table-col col-doc-actions">
                    <button 
                      class="action-btn delete-attachment-btn" 
                      @click="confirmDeleteAttachment(attachment)"
                    >
                      删除附件
                    </button>
                    <button 
                      class="action-btn knowledge-fragment-btn" 
                      @click="viewKnowledgeFragment(attachment)"
                    >
                      知识片段
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <div class="pagination-info">
                <button 
                  class="page-btn" 
                  :class="{ active: currentPage === 1 }"
                  @click="currentPage = 1"
                >
                  1
                </button>
                <span class="page-separator">></span>
                <span class="page-size">{{ pageSize }} / 页</span>
              </div>
            </div>
          </div>

        </div>

        <!-- 知识片段界面 -->
        <div v-if="currentView === 'fragments'" class="fragments-view">
          <div class="fragments-container">
            <div class="fragments-header">
              <button class="back-button" @click="backToAttachments">
                <span class="back-icon">←</span>
                <span>返回</span>
              </button>
            </div>

            <div class="fragments-table">
              <div class="table-header">
                <div class="table-col col-fragment-id">片段编号</div>
                <div class="table-col col-fragment-content">片段内容</div>
              </div>
              
              <div class="table-body">
                <div 
                  v-for="fragment in fragmentList" 
                  :key="fragment.id"
                  class="table-row"
                >
                  <div class="table-col col-fragment-id">{{ fragment.fragmentId }}</div>
                  <div class="table-col col-fragment-content">{{ fragment.content }}</div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <div class="pagination-info">
                <button 
                  class="page-btn" 
                  :class="{ active: currentPage === 1 }"
                  @click="currentPage = 1"
                >
                  1
                </button>
                <span class="page-separator">></span>
                <span class="page-size">{{ pageSize }} / 页</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章 Tab -->
      <div v-if="activeTab === 'articles'" class="articles-tab">
        <div class="articles-header">
          <h2>我的文章</h2>
          <button class="btn primary" @click="createArticle">
            <span class="btn-icon">✏️</span>
            新建文章
          </button>
        </div>

        <div class="articles-grid">
          <div 
            v-for="article in filteredArticles" 
            :key="article.id"
            class="article-card"
            @click="editArticle(article)"
          >
            <div class="article-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-excerpt">{{ article.excerpt }}</p>
              <div class="article-meta">
                <span class="article-date">{{ article.updatedAt }}</span>
                <span class="article-words">{{ article.wordCount }} 字</span>
              </div>
            </div>
            
            <div class="article-actions">
              <button 
                class="action-btn edit-btn" 
                @click.stop="editArticle(article)"
                title="编辑文章"
              >
                <span class="action-icon">✏️</span>
              </button>
              <button 
                class="action-btn delete-btn" 
                @click.stop="confirmDeleteArticle(article)"
                title="删除文章"
              >
                <span class="action-icon">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <transition name="toast-fade">
      <div v-if="showSuccessMessage" class="success-toast">
        <div class="toast-content">
          <span class="success-icon">✓</span>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </transition>

    <!-- 上传模态框 -->
    <transition name="modal-fade">
      <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
        <div class="modal-content upload-modal">
          <div class="modal-header">
            <div class="header-content">
              <!-- <div class="modal-icon info-icon">ℹ️</div> -->
              <h2>上传附件</h2>
            </div>
            <button class="close-btn" @click="closeUploadModal">×</button>
          </div>
          <div class="modal-body">
            <div class="upload-section">
              <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent>
                <input 
                  ref="fileInput" 
                  type="file" 
                  multiple 
                  accept=".md,.pdf,.docx,.txt,.csv,.doc,.xls,.xlsx"
                  @change="handleFileChange" 
                  style="display: none"
                />
                <div class="upload-icon">📤</div>
                <div class="upload-text">请上传一个10MB以内的文件</div>
                <div class="upload-formats">已支持 md、pdf、docx、txt、csv 等文件格式</div>
              </div>
            </div>

            <div class="upload-notes">
              <div class="notes-header">annex.uploadNotes</div>
              <div class="notes-content">
                <div class="reminder-title">温馨提醒：</div>
                <div class="reminder-list">
                  <div class="reminder-item">
                    <span class="item-number">1.</span>
                    <span class="item-text">如果文件较大，上传时间可能较长，请耐心等待。</span>
                  </div>
                  <div class="reminder-item">
                    <span class="item-number">2.</span>
                    <span class="item-text">上传txt文本，请使用UTF8格式，以避免乱码。</span>
                  </div>
                  <div class="reminder-item">
                    <span class="item-number">3.</span>
                    <span class="item-text">单次上传字数建议5万以下，解析1万字大约需要10秒。</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="file-list" v-if="fileList.length > 0">
              <h3 class="section-title">已选择文件</h3>
              
              <div class="file-table">
                <div class="file-header">
                  <div class="file-col">文件名</div>
                  <div class="file-col">大小</div>
                  <div class="file-col">类型</div>
                  <div class="file-col">操作</div>
                </div>
                <div 
                  v-for="(file, index) in fileList" 
                  :key="index"
                  class="file-row"
                >
                  <div class="file-col">{{ file.name }}</div>
                  <div class="file-col">{{ formatFileSize(file.size) }}</div>
                  <div class="file-col">{{ getFileType(file.name) }}</div>
                  <div class="file-col">
                    <button class="remove-btn" @click="removeFile(index)">删除</button>
                   
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn secondary" @click="closeUploadModal">取消</button>
              <button 
                class="btn primary" 
                @click="submitUpload" 
                :disabled="isUploading || fileList.length === 0"
              >
                <span v-if="isUploading" class="loading-spinner"></span>
                {{ isUploading ? '上传中...' : '开始上传' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 创建知识库侧边面板 -->
    <transition name="slide-fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
        <div class="side-panel">
          <div class="panel-header">
            <h2 class="panel-title">创建知识库</h2>
            <button class="close-btn" @click="closeCreateModal">×</button>
          </div>
          
          <div class="panel-body">
            <div class="form-grid">
              <!-- 知识库名称 -->
              <div class="form-group">
                <label class="form-label required">知识库名称</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="请输入知识库名称"
                  v-model="createForm.name"
                />
              </div>
              
              <!-- 分隔符 -->
              <div class="form-group">
                <label class="form-label">分隔符</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="请输入知识分隔符"
                  v-model="createForm.separator"
                />
              </div>
              
              <!-- 检索条数 -->
              <div class="form-group">
                <label class="form-label required">检索条数</label>
                <div class="number-input">
                  <button class="number-btn" @click="createForm.searchCount = Math.max(1, createForm.searchCount - 1)">−</button>
                  <input 
                    type="number" 
                    class="number-field" 
                    v-model.number="createForm.searchCount"
                    min="1"
                  />
                  <button class="number-btn" @click="createForm.searchCount++">+</button>
                </div>
              </div>
              
              <!-- 文本块大小 -->
              <div class="form-group">
                <label class="form-label required">文本块大小</label>
                <div class="number-input">
                  <button class="number-btn" @click="createForm.textBlockSize = Math.max(100, createForm.textBlockSize - 50)">−</button>
                  <input 
                    type="number" 
                    class="number-field" 
                    v-model.number="createForm.textBlockSize"
                    min="100"
                    step="50"
                  />
                  <button class="number-btn" @click="createForm.textBlockSize += 50">+</button>
                </div>
              </div>
              
              <!-- 重叠字符 -->
              <div class="form-group">
                <label class="form-label">重叠字符</label>
                <div class="number-input">
                  <button class="number-btn" @click="createForm.overlapChars = Math.max(0, createForm.overlapChars - 10)">−</button>
                  <input 
                    type="number" 
                    class="number-field" 
                    v-model.number="createForm.overlapChars"
                    min="0"
                    step="10"
                  />
                  <button class="number-btn" @click="createForm.overlapChars += 10">+</button>
                </div>
              </div>
              
              <!-- 向量库 -->
              <div class="form-group">
                <label class="form-label required">向量库</label>
                <select class="form-select" v-model="createForm.vectorDatabase">
                  <option value="weaviate">weaviate</option>
                  <option value="pinecone">pinecone</option>
                  <option value="chroma">chroma</option>
                </select>
              </div>
              
              <!-- 提问分割符 -->
              <div class="form-group">
                <label class="form-label">提问分割符</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="请输入提问分割符"
                  v-model="createForm.questionSeparator"
                />
              </div>
              
              <!-- 向量模型 -->
              <div class="form-group">
                <label class="form-label required">向量模型</label>
                <select class="form-select" v-model="createForm.vectorModel">
                  <option value="baai/bge-m3">baai/bge-m3</option>
                  <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                  <option value="sentence-transformers/all-MiniLM-L6-v2">sentence-transformers/all-MiniLM-L6-v2</option>
                </select>
              </div>
            </div>
            
            <!-- 知识描述 -->
            <div class="form-group full-width">
              <label class="form-label">知识描述</label>
              <textarea 
                class="form-textarea" 
                placeholder="输入知识描述"
                v-model="createForm.description"
                maxlength="1000"
              ></textarea>
              <div class="char-count">{{ createForm.description.length }} / 1000</div>
            </div>
            
            <!-- 是否公开 -->
            <div class="form-group full-width">
              <div class="toggle-group">
                <label class="form-label">是否公开</label>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    class="toggle-input" 
                    v-model="createForm.isPublic"
                    id="isPublic"
                  />
                  <label for="isPublic" class="toggle-label">
                    <span class="toggle-text">{{ createForm.isPublic ? '是' : '否' }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="panel-footer">
            <button class="btn secondary" @click="closeCreateModal">取消</button>
            <button class="btn primary" @click="submitCreateKnowledge">添加</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

// 当前激活的 Tab
const activeTab = ref('knowledge')

// 当前视图（list: 列表, upload: 上传, fragments: 知识片段）
const currentView = ref('list')

// 选中的知识库
const selectedKnowledge = ref(null)

// 选中的附件
const selectedAttachment = ref(null)

// 搜索查询
const knowledgeSearchQuery = ref('')

// 文件列表
const fileList = ref([])

/** 新增文章弹框开关 */
const open = ref(false);

// 上传选项
const uploadOptions = reactive({
  segmentMethod: 'auto',
  extractKnowledge: true
})

// 上传状态
const isUploading = ref(false)

// 成功消息
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 知识库数据
const knowledgeList = ref([
  {
    id: 1,
    code: 'lv4PnxDt4H',
    name: '123',
    description: '',
    files: 15,
    size: '25.6MB',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    code: 'Znp8rUa8QE',
    name: '1212',
    description: '',
    files: 8,
    size: '12.3MB',
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    code: 'hVxeRjesdN',
    name: '测试',
    description: '测试',
    files: 22,
    size: '45.8MB',
    createdAt: '2024-01-25'
  },
  {
    id: 4,
    code: 'OSAyCjZwlq',
    name: '林大侠测试',
    description: '林大侠测试',
    files: 5,
    size: '8.2MB',
    createdAt: '2024-01-28'
  },
  {
    id: 5,
    code: 'EYuRz9nxxM',
    name: '1231313111',
    description: '',
    files: 12,
    size: '18.5MB',
    createdAt: '2024-01-30'
  }
])






// 文章数据
const articlesList = ref([
  {
    id: 1,
    title: 'Vue 3 组件开发最佳实践',
    excerpt: '本文介绍了 Vue 3 组件开发的最佳实践，包括组合式 API 的使用、响应式数据管理等内容...',
    wordCount: 2500,
    updatedAt: '2024-01-28',
    content: '文章完整内容...'
  },
  {
    id: 2,
    title: 'JavaScript 异步编程详解',
    excerpt: '深入探讨 JavaScript 中的异步编程模式，包括 Promise、async/await 等...',
    wordCount: 3200,
    updatedAt: '2024-01-26',
    content: '文章完整内容...'
  },
  {
    id: 3,
    title: 'CSS Grid 布局完全指南',
    excerpt: 'CSS Grid 是现代网页布局的强大工具，本文将详细介绍其使用方法和技巧...',
    wordCount: 1800,
    updatedAt: '2024-01-24',
    content: '文章完整内容...'
  }
])






// 附件相关数据
const showUploadModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 附件列表数据
const attachmentList = ref([
  {
    id: 1,
    docId: 'lKgmoRhqja',
    name: '测试.docx',
    type: 'docx',
    size: '2.5MB',
    uploadDate: '2024-01-28'
  }
])

// 知识片段列表数据
const fragmentList = ref([
  {
    id: 1,
    fragmentId: '6B8pu4MDmG',
    content: 'WebSocket对接支持 12232131 21321312 787654332 官方的',
    attachmentId: 1
  },
  {
    id: 2,
    fragmentId: 'A9Kx2NpQwE',
    content: '这是另一个知识片段的内容，包含了重要的技术信息和实现细节',
    attachmentId: 1
  },
  {
    id: 3,
    fragmentId: 'M5Rt8VbLzX',
    content: '第三个知识片段展示了系统架构设计的核心理念和最佳实践方法',
    attachmentId: 1
  }
])

// 创建知识库模态框
const showCreateModal = ref(false)

// 创建知识库表单数据
const createForm = reactive({
  name: '',
  separator: '',
  searchCount: 3,
  textBlockSize: 500,
  overlapChars: 50,
  vectorDatabase: 'weaviate',
  questionSeparator: '',
  vectorModel: 'baai/bge-m3',
  description: '',
  isPublic: false
})

// 计算属性
const filteredKnowledge = computed(() => {
  if (!knowledgeSearchQuery.value) return knowledgeList.value
  return knowledgeList.value.filter(knowledge => 
    knowledge.name.toLowerCase().includes(knowledgeSearchQuery.value.toLowerCase()) ||
    knowledge.description.toLowerCase().includes(knowledgeSearchQuery.value.toLowerCase())
  )
})

const filteredArticles = computed(() => {
  return articlesList.value
})

// 方法
const switchTab = (tab) => {
  activeTab.value = tab
  currentView.value = 'list'
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

const backToAttachments = () => {
  currentView.value = 'upload'
  selectedAttachment.value = null
}

const confirmDeleteKnowledge = (knowledge) => {
  if (confirm(`确定要删除知识库「${knowledge.name}」吗？`)) {
    const index = knowledgeList.value.findIndex(k => k.id === knowledge.id)
    if (index > -1) {
      knowledgeList.value.splice(index, 1)
      showSuccess(`知识库「${knowledge.name}」已删除`)
    }
  }
}

const triggerFileInput = () => {
  document.querySelector('input[type="file"]').click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  fileList.value = [...fileList.value, ...files]
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  fileList.value = [...fileList.value, ...files]
}

const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const types = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    txt: 'Text',
    md: 'Markdown'
  }
  return types[ext] || '未知'
}

const submitUpload = async () => {
  if (fileList.value.length === 0) {
    alert('请至少选择一个文件')
    return
  }

  isUploading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    showSuccess(`成功上传 ${fileList.value.length} 个文件到「${selectedKnowledge.value.name}」`)
    backToList()
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
  }
}

const createArticle = () => {
  console.log('创建新文章')
  open.value = true
  // 这里可以跳转到文章编辑器
}

const editArticle = (article) => {
  console.log('编辑文章:', article.title)
  // 这里可以跳转到文章编辑器
}

const confirmDeleteArticle = (article) => {
  if (confirm(`确定要删除文章「${article.title}」吗？`)) {
    const index = articlesList.value.findIndex(a => a.id === article.id)
    if (index > -1) {
      articlesList.value.splice(index, 1)
      showSuccess(`文章「${article.title}」已删除`)
    }
  }
}

const showSuccess = (message) => {
  successMessage.value = message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const createKnowledge = () => {
  showCreateModal.value = true
}

// 附件相关方法
const closeUploadModal = () => {
  showUploadModal.value = false
  fileList.value = []
}

const confirmDeleteAttachment = (attachment) => {
  if (confirm(`确定要删除附件「${attachment.name}」吗？`)) {
    const index = attachmentList.value.findIndex(a => a.id === attachment.id)
    if (index > -1) {
      attachmentList.value.splice(index, 1)
      showSuccess(`附件「${attachment.name}」已删除`)
    }
  }
}

const viewKnowledgeFragment = (attachment) => {
  selectedAttachment.value = attachment
  currentView.value = 'fragments'
}

const closeCreateModal = () => {
  showCreateModal.value = false
  // 重置表单
  Object.assign(createForm, {
    name: '',
    separator: '',
    searchCount: 3,
    textBlockSize: 500,
    overlapChars: 50,
    vectorDatabase: 'weaviate',
    questionSeparator: '',
    vectorModel: 'baai/bge-m3',
    description: '',
    isPublic: false
  })
}

const submitCreateKnowledge = () => {
  if (!createForm.name.trim()) {
    alert('请输入知识库名称')
    return
  }
  
  // 生成新的知识库ID和编码
  const newId = knowledgeList.value.length + 1
  const newCode = Math.random().toString(36).substring(2, 12)
  
  const newKnowledge = {
    id: newId,
    code: newCode,
    name: createForm.name,
    description: createForm.description,
    files: 0,
    size: '0MB',
    createdAt: new Date().toISOString().split('T')[0]
  }
  
  knowledgeList.value.unshift(newKnowledge)
  showSuccess(`知识库「${createForm.name}」创建成功`)
  closeCreateModal()
}
</script>

<style scoped>
.knowledge-management {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Tab 导航栏 */
.tab-navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
}

.tab-header {
  /* max-width: 1200px; */
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.main-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.tab-buttons {
  display: flex;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
  font-weight: 500;
}

.tab-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.tab-btn.active {
  background: #3b82f6;
  color: white;
}

.tab-icon {
  font-size: 16px;
}

/* Tab 内容区域 */
.tab-content {
  /* max-width: 1200px; */
  margin: 0 auto;
  /* padding: 24px; */
}

/* 列表头部 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #059669;
}

.btn-icon {
  font-size: 16px;
  font-weight: 300;
}

/* 知识库表格 */
.knowledge-table {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 120px 1fr 1fr 140px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr 140px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.table-col {
  padding: 16px 12px;
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
}

.table-header .table-col {
  font-weight: 600;
  color: #1f2937;
  background: #f9fafb;
}

.col-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.col-name {
  font-weight: 500;
}

.col-desc {
  color: #6b7280;
}

.col-actions {
  gap: 8px;
  justify-content: flex-start;
}

/* 操作按钮 */
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.delete-btn {
  background: #ced5e0;
  color: #f63b3e;
}

.delete-btn:hover {
  background: #bfdbfe;
}

.attachment-btn {
  background: #dcfce7;
  color: #16a34a;
}

.attachment-btn:hover {
  background: #bbf7d0;
}

.knowledge-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
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
  color: #9ca3af;
}

/* 附件管理界面 */
.attachment-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.attachment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 0;
}

.back-button:hover {
  color: #374151;
}

.back-icon {
  font-size: 16px;
}

.upload-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #059669;
}

/* 附件表格 */
.attachment-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.attachment-table .table-header {
  display: grid;
  grid-template-columns: 150px 1fr 120px 200px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.attachment-table .table-row {
  display: grid;
  grid-template-columns: 150px 1fr 120px 200px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.attachment-table .table-row:hover {
  background: #f8fafc;
}

.attachment-table .table-row:last-child {
  border-bottom: none;
}

.col-doc-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.col-doc-name {
  font-weight: 500;
}

.col-doc-type {
  color: #6b7280;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
}

.col-doc-actions {
  gap: 8px;
  justify-content: flex-start;
}

.delete-attachment-btn {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.delete-attachment-btn:hover {
  background: #fde68a;
}

.knowledge-fragment-btn {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.knowledge-fragment-btn:hover {
  background: #bbf7d0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-separator {
  color: #9ca3af;
}

.page-size {
  color: #6b7280;
}

/* 知识片段界面 */
.fragments-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.fragments-header {
  margin-bottom: 24px;
}

/* 知识片段表格 */
.fragments-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.fragments-table .table-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.fragments-table .table-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.fragments-table .table-row:hover {
  background: #f8fafc;
}

.fragments-table .table-row:last-child {
  border-bottom: none;
}

.col-fragment-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  font-weight: 500;
}

.col-fragment-content {
  color: #374151;
  line-height: 1.5;
  word-break: break-all;
}

/* 上传模态框优化样式 */
.upload-modal {
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 10000;
}

.upload-modal .modal-icon.info-icon {
  background: #e0f2fe;
  color: #0284c7;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.upload-modal .upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.upload-modal .upload-area:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.upload-modal .upload-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #3b82f6;
}

.upload-modal .upload-text {
  color: #374151;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.upload-modal .upload-formats {
  color: #6b7280;
  font-size: 14px;
}

/* 上传说明样式 */
.upload-notes {
  margin: 24px 0;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  overflow: hidden;
}

.notes-header {
  background: #fbbf24;
  color: #92400e;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}

.notes-content {
  padding: 16px;
}

.reminder-title {
  color: #d97706;
  font-weight: 500;
  margin-bottom: 12px;
  font-size: 14px;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.item-number {
  color: #d97706;
  font-weight: 500;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
}

/* 模态框遮罩层 */
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
  z-index: 9999;
  padding: 20px;
}

/* 模态框内容 */
.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  border-radius: 12px 12px 0 0;
}

/* 模态框主体 */
.modal-body {
  padding: 24px;
  background: white;
  border-radius: 0 0 12px 12px;
}

/* 关闭按钮 */
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

/* 确保模态框在最顶层 */
.upload-modal {
  z-index: 10000;
}

/* 模态框动画优化 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 侧边面板样式 */
.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 10001;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.panel-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.char-count {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
  margin-top: 4px;
}

/* 数字输入框 */
.number-input {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.number-btn {
  width: 32px;
  height: 38px;
  border: none;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.number-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.number-field {
  flex: 1;
  border: none;
  padding: 10px 12px;
  text-align: center;
  font-size: 14px;
  background: white;
}

.number-field:focus {
  outline: none;
}

/* 切换开关 */
.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-switch {
  position: relative;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: block;
  width: 60px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.toggle-label::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-label {
  background: #10b981;
}

.toggle-input:checked + .toggle-label::before {
  transform: translateX(28px);
}

.toggle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  pointer-events: none;
}

.toggle-input:checked + .toggle-label .toggle-text {
  color: white;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: #10b981;
  color: white;
}

.btn.primary:hover {
  background: #059669;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background: #e5e7eb;
}

/* 滑入动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
}

.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from .side-panel,
.slide-fade-leave-to .side-panel {
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .side-panel {
    width: 100vw;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>