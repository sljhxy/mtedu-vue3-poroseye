<template>
  <div class="knowledge-container">
    <!-- 头部区域 -->

    <!-- {{ state }} -->
    <div class="header"> 
      <div class="title-section">
        <h1 class="main-title">知识库类别<span class="count">{{ aiClassifyTotal }}</span></h1>
      </div>
      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索知识库..." 
            v-model="queryAiClassifyParams.classifyName"
            @input="getAiClassifyList"
            v-hasPermi="['glxt:aiClassify:list']"
          />
          <span class="search-icon">
            <el-icon><Search /></el-icon>
          </span>
        </div>
        <el-icon class="refresh-icon" @click="refreshList" v-hasPermi="['glxt:aiClassify:list']"><Refresh /></el-icon>
      </div>
    </div>

    <!-- 知识库网格 -->
    <div class="topics-grid">
      <!-- 创建知识库卡片 -->
      <div class="topic-card create-card" @click="showCreateModal = true">
        <div class="create-content">
          <div class="plus-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <h3>创建知识库分类</h3>
          <p>上传文件，收集内容</p>
        </div>
      </div>

      <!-- 知识库卡片 -->
      <div 
        v-for="topic in aiClassifyList" 
        :key="topic.id" 
        class="topic-card"
        @click="navigateToTopicUpload(topic)"
        v-hasPermi="['glxt:aiClassify:list']"
      >
        <!-- 卡片内容 -->
        <div class="card-content">
          <div class="topic-header">
            <span class="folder-icon">
              <img src="@/assets/images/files.png" style="width: 20px"/>
            </span>
            <h3 class="topic-title">{{ topic.classifyName }}</h3>
          </div>
          <div class="topic-stats">
            <span class="stats-text">文章 {{topic.articleCount}} • 知识点 {{topic.knowledgeCount}}</span>
          </div>
          <!-- <div class="topic-count">111</div> -->
        </div>
        
        <!-- 底部信息区域 -->
        <div class="card-footer">
          <!-- 左下角：创建时间 -->
          <div class="creation-date">
            <span class="date-value">{{ topic.createTime }}</span>
          </div>
          
          <!-- 右下角：操作按钮 -->
          <div class="action-buttons">
            <button 
              class="action-btn edit-btn" 
              @click.stop="editTopic(topic)"
              title="编辑知识库"
              v-hasPermi="['glxt:aiClassify:edit']"
            >
              <span class="action-icon">
                <el-icon><Edit /></el-icon>
              </span>
            </button>
            <button 
              class="action-btn delete-btn" 
              @click.stop="confirmDeleteTopic(topic)"
              title="删除知识库"
              v-hasPermi="['glxt:aiClassify:remove']"
            >
              <span class="action-icon">
                <el-icon><Delete /></el-icon>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建知识库模态框 -->
    <transition name="modal-fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal" v-hasPermi="['glxt:aiClassify:add']">
        <div class="modal-content create-modal">
          <div class="modal-header">
            <div class="header-content">
              <div class="modal-icon">
                <el-icon><Plus /></el-icon>
              </div>
              <h2>创建分类</h2>
            </div>
            <button class="close-btn" @click="closeCreateModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="topic-name">分类名称</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="topic-name" 
                  v-model="aiClassifyForm.classifyName" 
                  placeholder="输入分类名称"
                  class="styled-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="topic-description">分类描述</label>
              <div class="input-wrapper">
                <textarea 
                  id="topic-description" 
                  v-model="aiClassifyForm.classifyDesc" 
                  placeholder="输入分类描述"
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
                :disabled="isCreating"
              >
              <!-- :disabled="isCreating || !aiClassifyForm.classifyName.trim()" -->
                <span v-if="isCreating" class="loading-spinner"></span>
                {{ isCreating ? '创建中...' : '创建' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 编辑知识库模态框 -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal" v-hasPermi="['glxt:aiClassify:edit']">
        <div class="modal-content edit-modal">
          <div class="modal-header">
            <div class="header-content">
              <div class="modal-icon">
                <el-icon><Edit /></el-icon>
              </div>
              <h2>编辑分类</h2>
            </div>
            <button class="close-btn" @click="closeEditModal" v-hasPermi="['glxt:aiClassify:edit']">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="edit-topic-name">分类名称</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="edit-topic-name" 
                  v-model="aiClassifyForm.classifyName" 
                  placeholder="输入分类名称"
                  class="styled-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="edit-topic-description">分类描述</label>
              <div class="input-wrapper">
                <textarea 
                  id="edit-topic-description" 
                  v-model="aiClassifyForm.classifyDesc" 
                  placeholder="输入分类描述"
                  rows="4"
                  class="styled-input"
                ></textarea>
              </div>
            </div>
            
            <div class="form-group">
              <label>知识库统计</label>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{aiClassifyForm.articleCount}}</div>
                  <div class="stat-label">文章</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{aiClassifyForm.knowledgeCount}}</div>
                  <div class="stat-label">知识点</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{aiClassifyForm.count || 0 }}</div>
                  <div class="stat-label">总数</div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>创建时间</label>
              <div class="date-display">{{ aiClassifyForm.createTime }}</div>
            </div>
            
            <div class="form-actions">
              <button class="action-btn secondary" @click="closeEditModal">取消</button>
              <button 
                class="action-btn primary" 
                @click="updateTopic" 
                :disabled="isUpdating || !aiClassifyForm.classifyName.trim()"
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
import { ref, reactive, computed, provide, onMounted} from 'vue'

const { proxy } = getCurrentInstance();
import { ElMessageBox, ElMessage } from 'element-plus'

// 提供给子组件的数据
const topicObject = ref(null)
provide('topicData', { topicObject: topicObject })
// 引入分类API
import { listAiClassify, getAiClassify, delAiClassify, addAiClassify, updateAiClassify } from "@/api/glxt/aiClassify";

//引入会话API
import { listSession, getSession, delSession, addSession, updateSession } from "@/api/glxt/aiSession";

// 响应式数据
const searchQuery = ref('')
const showCreateModal = ref(false)
const isCreating = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')
const emit = defineEmits(['to_topic_upload'])
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

// 新知识库数据
const newTopic = ref({
  name: '',
  description: ''
})


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
    // 根据角色设置type
    queryAiClassifyParams.value.type = isAdmin.value ? 1 : 2;
    // 在获取到用户信息后再获取分类列表
    getAiClassifyList();
  });
};

onMounted(() => {
  getUser();
})







// 添加导航到上传组件的方法
const navigateToTopicUpload = (topic) => {
  // 设置当前选中的分类数据
  topicObject.value = topic
  // 使用路由导航到 TopicUpload 组件
  proxy.$router.push({
    path: `/glxt/poroseye_ai/topic-upload/${topic.id}`,
    query: {
      classifyName: topic.classifyName
    }
  })
}


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

// 添加判断是否为管理员的计算属性
const isAdmin = computed(() => {
  // return state.roleGroup && state.roleGroup.includes('超级管理员')
  // 判断是否为教师  如果Id 存在则为教师
  return (state.user && state.roleGroup) && (state.user.teacherId && !state.roleGroup.includes('超级管理员') )
})

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
    });
  }
}

// 关闭创建模态框
const closeCreateModal = () => {
  showCreateModal.value = false
  resetAiClsaaifyForm()
}




//创建分类表单
const aiClassifyForm = ref({
  userId: state.user.userId,
  classifyName: "",
  classifyDesc: "",
  articleCount: 0,
  knowledgeCount: 0,
  count: 0,
  type: null  // 添加type字段
})



//重置表单
const resetAiClsaaifyForm  = () => {
  aiClassifyForm.value = {
    id: null,
    classifyDesc: null,
    classifyName: null,
    userId: state.user.userId,
    type: isAdmin.value ? 1 : 2  // 根据角色设置type
  }
}


const createTopic = async () => {
  isCreating.value = true
  
  try {
    aiClassifyForm.value.userId = state.user.userId;
    aiClassifyForm.value.type = isAdmin.value ? 1 : 2;  // 设置type
    addAiClassify(aiClassifyForm.value).then(response => {
      proxy.$modal.msgSuccess("创建成功");
      getAiClassifyList();
    });
    
    closeCreateModal()
    
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 1500)
    
  } catch (error) {
    console.error('创建知识库失败:', error)
  } finally {
    isCreating.value = false
  }
}


// 编辑知识库方法
const editTopic = (topic) => {
  // editingTopic.value = { ...topic } // 创建副本避免直接修改原数据
  resetAiClsaaifyForm()
  // 获取评价维度详情
   getAiClassify(topic.id).then(response => {
    if (response.code === 200) {
      // 设置当前维度数据
      aiClassifyForm.value = response.data;
      aiClassifyForm.value.count = response.data.articleCount + response.data.knowledgeCount;
      // 打开对话框
      showEditModal.value = true
    } else {
      ElMessage.error('获取分类详情失败');
      showEditModal.value = false
    }
  });
  
}

// 关闭编辑模态框
const closeEditModal = () => {
  showEditModal.value = false
  resetAiClsaaifyForm()
}

// 更新知识库方法
const updateTopic = async () => {
  if (!aiClassifyForm.value.classifyName.trim()) return
  
  isUpdating.value = true
  
  try {

    updateAiClassify(aiClassifyForm.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
         // 显示成功消息
        // successMessage.value = `修改成功！`
        // showSuccessMessage.value = true
        getAiClassifyList();
    });
    
    // 关闭编辑模态框
    closeEditModal()
    
    // 1秒后隐藏成功消息
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 1500)
    
  } catch (error) {
    console.error('更新知识库失败:', error)
  } finally {
    isUpdating.value = false
  }
}

// 确认删除知识库
const confirmDeleteTopic = (topic) => {
    proxy.$modal.confirm('是否确认删除该数据？').then(function() {
    return delAiClassify(topic.id);
  }).then(() => {
    getAiClassifyList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 刷新知识库列表
const refreshList = () => {
  // 重置搜索条件
  queryAiClassifyParams.value.classifyName = '';
  // 重新获取列表
  getAiClassifyList();
  // 显示成功消息
  ElMessage.success('刷新成功');
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


.search-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-icon {
  cursor: pointer;
  color: #9ca3af;
  font-size: 20px;
  transition: all 0.2s;
}

.refresh-icon:hover {
  color: #3b82f6;
  transform: rotate(180deg);
}

/* 知识库网格 */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 知识库卡片相关样式 */
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
  /* background: #ef4444;
  color: white; */
}

.delete-btn:hover {
  /* background: #dc2626; */
  transform: scale(1.1);
}

.action-icon {
  font-size: 12px;
}

/* 创建知识库卡片 */
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

/* 知识库卡片内容 */
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
  /* background: #dcfce7;
  color: #16a34a; */
}
</style>