<template>
  <div class="steps-setting">
    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">
      <!-- 标签页容器 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane name="steps">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>步骤设置</span>
              </div>
            </template>
            
            <!-- 步骤设置内容 -->
            <div class="action-buttons">
              <el-button type="primary" plain @click="addStep(null)">
                <el-icon><Plus /></el-icon>新建步骤
              </el-button>
              <el-button type="success" plain @click="previewSteps" :disabled="steps.length === 0">
                <el-icon><View /></el-icon>预览步骤
              </el-button>
            </div>

            <div class="steps-content">
              <el-empty v-if="steps.length === 0" description="暂无数据" />
              <el-tree
                v-else
                :data="steps"
                :props="defaultProps"
                node-key="id"
                default-expand-all
                @node-click="handleNodeClick"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span class="node-content">
                      <span class="step-index">{{ getStepNumber(node) }}</span>
                      <span class="step-line"></span>
                      <span :class="['step-label', { 'first-level': getLevel(node) === 1 }]">
                        {{ data.label }}
                      </span>
                      <el-tag size="small" type="success" class="ml-2">
                        得分：{{ data.score }}
                      </el-tag>
                    </span>
                    <span class="operation-buttons">
                      <el-button 
                        type="primary"
                        link
                        @click.stop="handleOperation(data)"
                      >
                        关联操作
                      </el-button>
                      <el-button 
                        v-if="getLevel(node) < 5"
                        link 
                        type="primary" 
                        @click.stop="addStep(data)"
                      >
                        添加子步骤
                      </el-button>
                      <el-button link type="primary" @click.stop="editStep(data)">
                        编辑
                      </el-button>
                      <el-button link type="danger" @click.stop="deleteStep(node, data)">
                        删除
                      </el-button>
                    </span>
                  </span>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>

          <el-tab-pane name="buttons">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Edit /></el-icon>
                <span>按钮定义</span>
              </div>
            </template>
            <!-- 按钮定义内容 -->
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 预览步骤对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="步骤预览"
      width="600px"
    >
      <div class="preview-content">
        <div v-for="(step) in flattenSteps" :key="step.id" 
             :style="{ paddingLeft: `${step.level * 20}px` }"
             class="preview-step">
          <span class="preview-index">{{ step.number }}</span>
          <span class="preview-label">{{ step.label }}</span>
          <span class="preview-score">得分：{{ step.score }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑步骤的对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增步骤' : '编辑步骤'"
      width="500px"
    >
      <el-form :model="stepForm" label-width="100px">
        <el-form-item label="步骤名称">
          <el-input v-model="stepForm.label" placeholder="请输入步骤名称" />
        </el-form-item>
        <el-form-item label="得分权重">
          <el-input-number v-model="stepForm.score" :min="0" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleStepSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关联操作弹框 -->
    <el-dialog
      v-model="operationDialogVisible"
      title="关联操作"
      width="600px"
    >
      <el-form :model="operationForm" label-width="120px">
        <el-form-item label="步骤名称">
          <span>{{ currentStep?.label }}</span>
        </el-form-item>
        
        <el-form-item label="操作详情">
          <el-input
            v-model="operationForm.details"
            type="textarea"
            :rows="3"
            placeholder="请输入操作详情"
          />
        </el-form-item>
        
        <el-form-item label="语音讲解">
          <el-input
            v-model="operationForm.voiceGuide"
            type="textarea"
            :rows="3"
            placeholder="请输入语音讲解内容"
          />
        </el-form-item>
        
        <el-form-item label="特效说明">
          <el-input
            v-model="operationForm.effectDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入特效说明"
          />
        </el-form-item>
        
        <el-form-item label="关联页面">
          <el-select
            v-model="operationForm.relatedPage"
            placeholder="请选择关联页面"
          >
            <el-option
              v-for="item in pageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作观察要点">
          <el-cascader
            v-model="operationForm.observationPoints"
            :options="observationOptions"
            :props="{
              multiple: true,
              checkStrictly: true
            }"
            clearable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择操作观察要点"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleOperationSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, View, Document, Edit } from '@element-plus/icons-vue'

const activeTab = ref('steps')
const steps = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const currentParentNode = ref(null)
const currentEditNode = ref(null)
const previewDialogVisible = ref(false)

const stepForm = ref({
  label: '',
  score: 0,
  operation: ''
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

// 关联操作相关数据
const operationDialogVisible = ref(false)
const currentStep = ref(null)
const operationForm = reactive({
  details: '',
  voiceGuide: '',
  effectDesc: '',
  relatedPage: '',
  observationPoints: []
})

// 模拟页面选项数据
const pageOptions = [
  { value: 'page1', label: '页面1' },
  { value: 'page2', label: '页面2' },
  // ... 更多页面选项
]

// 模拟观察要点级联数据
const observationOptions = [
  {
    value: 'point1',
    label: '观察要点1',
    children: [
      {
        value: 'point1-1',
        label: '子要点1-1',
        children: [
          { value: 'point1-1-1', label: '细节1-1-1' },
          { value: 'point1-1-2', label: '细节1-1-2' }
        ]
      }
    ]
  },
  // ... 更多观察要点
]

// 获取节点层级
const getLevel = (node) => {
  let level = 1
  let parent = node.parent
  while (parent && parent.level !== 0) {
    level++
    parent = parent.parent
  }
  return level
}

// 获取步骤编号
const getStepNumber = (node) => {
  const level = getLevel(node)
  let numbers = []
  let currentNode = node
  
  while (currentNode.parent && currentNode.parent.level !== undefined) {
    const siblings = currentNode.parent.childNodes
    const index = siblings.findIndex(n => n === currentNode) + 1
    numbers.unshift(index)
    currentNode = currentNode.parent
  }
  
  return numbers.join('.')
}

// 添加步骤
const addStep = (parentNode) => {
  dialogType.value = 'add'
  currentParentNode.value = parentNode
  stepForm.value = {
    label: '',
    score: 0,
    operation: ''
  }
  dialogVisible.value = true
}

// 编辑步骤
const editStep = (node) => {
  dialogType.value = 'edit'
  currentEditNode.value = node
  stepForm.value = {
    label: node.label,
    score: node.score,
    operation: node.operation
  }
  dialogVisible.value = true
}

// 处理步骤提交
const handleStepSubmit = () => {
  const newStep = {
    id: Date.now(),
    label: stepForm.value.label,
    score: stepForm.value.score,
    children: []
  }

  if (dialogType.value === 'add') {
    if (currentParentNode.value === null) {
      steps.value.push(newStep)
    } else {
      if (!currentParentNode.value.children) {
        currentParentNode.value.children = []
      }
      currentParentNode.value.children.push(newStep)
    }
  } else {
    // 编辑模式
    Object.assign(currentEditNode.value, {
      label: stepForm.value.label,
      score: stepForm.value.score,
      operation: stepForm.value.operation
    })
  }

  dialogVisible.value = false
  ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
}

// 删除步骤
const deleteStep = (node, data) => {
  ElMessageBox.confirm('确认删除该步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const parent = node.parent
    const children = parent.data.children || parent.data
    const index = children.findIndex(d => d.id === data.id)
    children.splice(index, 1)
    ElMessage.success('删除成功')
  })
}

const handleNodeClick = (data) => {
  console.log(data)
}

// 扁平化处理步骤数据，用于预览
const flattenSteps = computed(() => {
  const result = []
  
  const flatten = (nodes, level = 1, parentNumber = '') => {
    nodes.forEach((node, index) => {
      const currentNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`
      result.push({
        ...node,
        level,
        number: currentNumber
      })
      
      if (node.children && node.children.length) {
        flatten(node.children, level + 1, currentNumber)
      }
    })
  }
  
  flatten(steps.value)
  return result
})

// 预览步骤
const previewSteps = () => {
  previewDialogVisible.value = true
}

// 处理关联操作按钮点击
const handleOperation = (step) => {
  currentStep.value = step
  // 如果已有数据，加载已有数据
  if (step.operation) {
    operationForm.details = step.operation.details || ''
    operationForm.voiceGuide = step.operation.voiceGuide || ''
    operationForm.effectDesc = step.operation.effectDesc || ''
    operationForm.relatedPage = step.operation.relatedPage || ''
    operationForm.observationPoints = step.operation.observationPoints || []
  } else {
    // 重置表单
    operationForm.details = ''
    operationForm.voiceGuide = ''
    operationForm.effectDesc = ''
    operationForm.relatedPage = ''
    operationForm.observationPoints = []
  }
  operationDialogVisible.value = true
}

// 处理关联操作提交
const handleOperationSubmit = async () => {
  try {
    // 这里添加你的提交逻辑，可以调用API
    const params = {
      experimentId: props.experimentId, // 假设通过props传入
      stepId: currentStep.value.id,
      ...operationForm
    }
    // await submitOperation(params)
    
    // 更新本地数据
    currentStep.value.operation = { ...operationForm }
    
    ElMessage.success('保存成功')
    operationDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.steps-setting {
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
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

/* 自定义标签页样式 */
.custom-tabs {
  background: white;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 6px 8px 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
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

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

:deep(.el-tabs__item.is-active .custom-tab-label) {
  color: var(--el-color-primary);
}

/* 内容区域样式 */
.action-buttons {
  padding: 24px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.steps-content {
  padding: 24px;
}

/* 其他现有样式（树节点、对话框等）保持不变... */

/* 移除tabs-wrapper的重复边框 */
:deep(.el-tabs__header) {
  border-radius: 0;
}

/* 确保内容区域没有重复的边框和圆角 */
:deep(.el-tab-pane) {
  border-radius: 0;
}

/* 确保内容区域样式正确 */
.compact-form {
  max-width: 1200px;
  margin: 0 auto;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 24px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 18px;
}

.step-index {
  background: #b0b4b8;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
}

/* 步骤线 */
.step-line {
  border-top: 1px dashed #909399;
  width: 100px;
  margin: 0 8px;
}

.step-label {
  font-size: 14px;
}

.first-level {
  font-weight: bold;
  font-size: 16px;
}

.el-tag--small {
    margin-left: 20px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-step {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.preview-index {
  background: #a0a3a5;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 12px;
  font-size: 12px;
}

.preview-label {
  flex: 1;
}

.preview-score {
  color: #3ace26;
  margin-left: 12px;
}

/* 按钮悬停效果 */
.el-button {
  transition: all 0.3s;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
</style>