<template>
  <div class="extend-info-container">
    <div class="main-content-wrapper">

      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs 
          v-model="activeTab" 
          class="custom-tabs" 
          @tab-click="handleTabClick"
        >
          <!-- 实验原理 -->
          <el-tab-pane name="principle">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Notebook /></el-icon>
                <span>实验原理</span>
              </div>
            </template>
            <div v-if="activeTab === 'principle'" class="tab-content">
              <Tinymce v-model="formData.principle" :height="400" />
            </div>
          </el-tab-pane>

          <!-- 实验目标 -->
          <el-tab-pane name="target">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Aim /></el-icon>
                <span>实验目标</span>
              </div>
            </template>
            <div v-if="activeTab === 'target'" class="tab-content">
              <Tinymce v-model="formData.target" :height="400" />
            </div>
          </el-tab-pane>

          <!-- 实验器具 -->
          <el-tab-pane name="equipment">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Tools /></el-icon>
                <span>实验器具</span>
              </div>
            </template>
            <div v-if="activeTab === 'equipment'" class="tab-content">
              <Tinymce v-model="formData.equipment" :height="400" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Tinymce from "@/components/Tinymce/index.vue"

const route = useRoute()
const router = useRouter()
const experimentId = ref(route.params.experimentId)
const activeTab = ref('principle')
const experimentData = ref(null)

// 表单数据
const formData = reactive({
  principle: '',
  target: '',
  equipment: ''
})

// 计算当前标签页名称
const getActiveTabName = computed(() => {
  const tabNames = {
    principle: '实验原理',
    target: '实验目标',
    equipment: '实验器具'
  }
  return tabNames[activeTab.value]
})

// 获取实验数据
const fetchExperimentData = async () => {
  try {
    // 调用API获取实验数据
    const response = await getExperimentById(experimentId.value)
    experimentData.value = response.data
    // 填充表单数据
    Object.assign(formData, response.data.extendInfo || {})
  } catch (error) {
    ElMessage.error('获取实验数据失败')
  }
}

// 保存数据
const handleSubmit = async () => {
  try {
    await saveExtendInfo({
      experimentId: experimentId.value,
      type: activeTab.value,
      content: formData[activeTab.value]
    })
    ElMessage.success(`${getActiveTabName.value}保存成功`)
  } catch (error) {
    ElMessage.error('保存失败，请稍后重试')
  }
}

// 处理标签页点击
const handleTabClick = (tab) => {
  activeTab.value = tab.name
}

onMounted(() => {
  if (experimentId.value) {
    fetchExperimentData()
  }
})

// 暴露 activeTab 给父组件
defineExpose({
  activeTab,
  handleSubmit
})
</script>

<style scoped>
/* 复用 BasicInfo-management 的主要样式 */
.extend-info-container {
  min-height: calc(100vh - 520px);
  padding: 24px;
  position: relative;
}

/* 主内容区域包装器 */
.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

/* 标签页容器样式 */
.tabs-wrapper {
  border-radius: 0;
  border: none;
}

/* 自定义标签页样式 */
.custom-tabs {
  background: white;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 0;
  padding: 6px 8px 0;
}

/* 自定义标签标题样式 */
.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
}

:deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  padding: 0 !important;
  font-size: 14px;
  color: #909399;
  position: relative;
  transition: all 0.3s;
  border-radius: 6px 6px 0 0;
  margin: 0 4px;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 24px;
}

/* Tinymce编辑器容器样式 */
.tab-content {
  padding: 20px;
  background: white;
}
</style>