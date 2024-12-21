<template>
  <div class="basic-info-container">

    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">

      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs 
          v-model="activeTab" 
          class="custom-tabs" 
          @tab-click="handleTabClick"
        >
          <el-tab-pane name="basicInfo">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>实验信息</span>
              </div>
            </template>
            <el-form :model="basicForm" label-width="90px" :rules="rules" ref="basicFormRef" class="compact-form">
              <!-- 缩略图行 -->
              <el-row class="thumbnail-row" :gutter="20">
                <el-col :span="24">
                  <el-form-item label="缩略图" prop="thumbnail">
                    <el-upload
                      class="avatar-uploader"
                      action="/api/upload"
                      :show-file-list="false"
                      :on-success="handleThumbnailSuccess"
                      :before-upload="beforeThumbnailUpload">
                      <div class="upload-area">
                        <img v-if="basicForm.thumbnail" :src="basicForm.thumbnail" class="thumbnail" />
                        <div v-else class="upload-placeholder">
                          <el-icon class="upload-icon"><Plus /></el-icon>
                          <span>点击上传缩略图</span>
                        </div>
                      </div>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 表单主体 -->
              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- 实验名称 -->
                  <el-form-item label="实验名称" prop="name">
                    <el-input v-model="basicForm.name" placeholder="请输入实验名称"/>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <!-- 属性 -->
                  <el-form-item label="属性" prop="properties">
                    <el-select v-model="basicForm.properties" placeholder="请选择属性" class="full-width">
                      <el-option label="虚拟" value="virtual" />
                      <el-option label="实物" value="real" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- 类型 -->
                  <el-form-item label="类型" prop="type">
                    <el-select v-model="basicForm.type" placeholder="请选择类型" class="full-width">
                      <el-option label="普教" value="general" />
                      <el-option label="职教" value="vocational" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <!-- 学段 -->
                  <el-form-item label="学段" prop="educationLevel">
                    <el-select v-model="basicForm.educationLevel" placeholder="请选择学段" class="full-width">
                      <el-option label="小学" value="primary" />
                      <el-option label="初中" value="junior" />
                      <el-option label="高中" value="senior" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- 开发者 -->
                  <el-form-item label="开发者" prop="developer">
                    <el-select v-model="basicForm.developer" placeholder="请选择开发者" class="full-width">
                      <el-option label="MT" value="MT" />
                      <el-option label="其他开发者" value="other" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <!-- 版本教材 -->
                  <el-form-item label="版本教材" prop="textbook">
                    <el-select v-model="basicForm.textbook" placeholder="请选择版本教材" class="full-width">
                      <el-option
                        v-for="item in textbookOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 科目和知识点并排显示 -->
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="科目" prop="subjects">
                    <el-select
                      v-model="basicForm.subjects"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      placeholder="请选择科目"
                      class="full-width"
                    >
                      <el-option
                        v-for="item in subjectOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="知识点" prop="knowledgePoints">
                    <el-cascader
                      v-model="basicForm.knowledgePoints"
                      :options="knowledgePointOptions"
                      :props="{ multiple: true }"
                      placeholder="请选择知识点"
                      class="full-width"
                      collapse-tags
                      collapse-tags-tooltip
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 实验简介 -->
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="实验简介" prop="description">
                    <el-input
                      v-model="basicForm.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入实验简介"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 备注 -->
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="备注" prop="remarks">
                    <el-input
                      v-model="basicForm.remarks"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入备注"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

            </el-form>
          </el-tab-pane>

          <!-- 实验说明标签页 -->
          <el-tab-pane name="experimentDesc">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Edit /></el-icon>
                <span>实验说明</span>
              </div>
            </template>
            <!-- 实验说明内容 -->
            <div v-if="!experimentId" class="empty-tip">
              <el-empty description="请先添加并保存实验基础信息">
                <template #description>
                  <p>请先添加并保存实验基础信息</p>
                  <p class="sub-tip">完成实验信息保存后即可进行实验说明编辑</p>
                </template>
              </el-empty>
            </div>
            <div v-else class="experiment-desc">
              <div v-if="!descForm.descriptions.length" class="toolbar">
                <el-button type="primary" @click="addDescription">
                  <el-icon><Plus /></el-icon>添加说明
                </el-button>
              </div>
              <div v-else class="editor-container">
                <el-form :model="descForm">
                  <div v-for="(item, index) in descForm.descriptions" :key="index" class="desc-item">
                    <div class="desc-header">
                      <el-form-item :label="`标题 ${index + 1}`" class="title-input">
                        <el-input v-model="item.title" placeholder="请输入标题"/>
                      </el-form-item>
                      <el-button type="danger" @click="removeDescription(index)" class="delete-btn">
                        删除
                      </el-button>
                    </div>
                    <el-form-item class="editor-wrapper">
                      <Tinymce v-model="item.content" :height="260"/>
                    </el-form-item>
                  </div>
                </el-form>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus, ArrowLeft, ArrowRight, Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import Tinymce from "@/components/Tinymce/index.vue"

const router = useRouter()
const activeStep = ref(0)

// 处理标签页点击
const handleTabClick = (tab) => {
  if (tab.props.name === 'experimentDesc' && !experimentId.value) {
    ElMessage.warning('请先添加并保存实验基础信息后再进行实验说明编辑')
    activeTab.value = 'basicInfo' // 强制切回基础信息标签
  }
}

// 标签页激活状态
const activeTab = ref('basicInfo')

// 表单引用
const basicFormRef = ref(null)

// 基础信息表单数据
const basicForm = reactive({
  thumbnail: '',
  name: '',
  description: '',
  properties: 'virtual',
  type: 'general',
  educationLevel: '',
  subjects: [],
  developer: 'MT',
  textbook: '',
  knowledgePoints: [],
  remarks: ''
})

// 实验说明表单数据
const descForm = reactive({
  descriptions: []
})

// 科目选项
const subjectOptions = [
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '生物', value: 'biology' },
  // 更多科目...
]

// 教材版本选项
const textbookOptions = [
  { label: '人教版', value: 'renjiao' },
  { label: '北师大版', value: 'beishida' },
  // 更多版本...
]

// 知识点项
const knowledgePointOptions = [
  {
    value: 'physics',
    label: '物理',
    children: [
      {
        value: 'mechanics',
        label: '力学',
        children: [
          { value: 'kinematics', label: '运动学' },
          { value: 'dynamics', label: '动力学' }
        ]
      }
    ]
  }
  // 更多知识点...
]

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入实验名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入实验简介', trigger: 'blur' }],
  // 其他验证规则...
}

// 缩略图上传相关方法
const handleThumbnailSuccess = (res, file) => {
  basicForm.thumbnail = URL.createObjectURL(file.raw)
  ElMessage.success('上传成功')
}

const beforeThumbnailUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 添加实验说明
const addDescription = () => {
  descForm.descriptions.push({
    title: '',
    content: ''
  })
}

// 删除实验说明
const removeDescription = (index) => {
  descForm.descriptions.splice(index, 1)
}

// 新增实验ID
const experimentId = ref('')

// 添加 emit 定义
const emit = defineEmits(['update:experimentName', 'canSave'])

// 监听实验名称变化
watch(() => basicForm.name, (newName) => {
  emit('update:experimentName', newName)
})

// 修改表单验证方法
const validateForm = async () => {
  if (!basicFormRef.value) return false
  try {
    await basicFormRef.value.validate()
    emit('canSave', true)
    return true
  } catch (error) {
    emit('canSave', false)
    return false
  }
}

// 监听表单变化
watch(basicForm, async () => {
  await validateForm()
}, { deep: true })

// 修改 handleSubmit 方法
const handleSubmit = async () => {
  if (activeTab.value === 'basicInfo') {
    const isValid = await validateForm()
    if (isValid) {
      try {
        const response = await saveBasicInfo(basicForm)
        if (response.data?.id) {
          experimentId.value = response.data.id
          ElMessage.success('基础信息保存成功')
          activeStep.value = 1
        } else {
          throw new Error('保存失败')
        }
      } catch (error) {
        ElMessage.error({
          message: '保存失败，请检查网络连接后重试',
          duration: 3000
        })
      }
    }
  } else {
    // 保存实验说明
    try {
      await saveExperimentDesc({
        experimentId: experimentId.value,
        descriptions: descForm.descriptions
      })
      ElMessage.success('实验说明保存成功')
    } catch (error) {
      ElMessage.error({
        message: '保存失败，请检查网络连接后重试',
        duration: 3000
      })
    }
  }
}


// 暴露 activeTab 给父组件
defineExpose({
  activeTab,
  handleSubmit
})

</script>

<style scoped>
.basic-info-container {
  min-height: calc(100vh - 520px);
  /* padding: 24px; */
  position: relative;
  /* background-color: #f8fafa; */
}

.full-height-tabs {
  background: white;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.compact-form {
  padding: 24px;
  height: auto;
  min-height: 500px;
  overflow-y: visible;
}

/* 美化上传区域 */
.upload-area {
  width: 180px;
  height: 140px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  background: #fafafa;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #409EFF;
  background: #f5f7fa;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #909399;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

/* 表单操作按钮组 */
.form-actions {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.right-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

/* 美化表单控件 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3; /* 加深背景色 */
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 6px 8px 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

.full-width {
  width: 100%;
}

/* 自定义滚动条 */
.compact-form::-webkit-scrollbar {
  width: 6px;
}

.compact-form::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.compact-form::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 美化按钮样式 */
.custom-button {
  min-width: 100px;
  height: 36px;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-button {
  border-color: #dcdfe6;
  color: #606266;
}

.cancel-button:hover {
  border-color: #c0c4cc;
  color: #909399;
}

.submit-button {
  background: #409EFF;
  border-color: #409EFF;
}

.submit-button:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

/* 空状态提示样式 */
.empty-tip {
  padding: 40px 0;
  text-align: center;
}

.sub-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 确保知识点和版本教材对齐 */
:deep(.el-cascader) {
  width: 100%;
  line-height: 32px;
}

:deep(.el-cascader .el-input__wrapper) {
  height: 32px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  height: 32px;
}

/* 更新步骤条样式 */
.custom-steps {
  margin: 0 0 40px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-step__title) {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-step__title.is-success) {
  color: #67c23a;
}

:deep(.el-step__title.is-process) {
  color: #409EFF;
  font-weight: 600;
}

:deep(.el-step__icon) {
  background: #edf2fc;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  line-height: 36px;
  transition: all 0.3s;
}

:deep(.el-step.is-process .el-step__icon) {
  background: #409EFF;
  transform: scale(1.1);
}

/* 更新底部导航按钮样式 */
.steps-action {
  /* margin-top: 40px; */
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 12px;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
}

.nav-button {
  padding: 12px 24px;
  font-size: 15px;
  border-radius: 8px;
  margin: 0 12px;
  transition: all 0.3s;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-button .el-icon {
  margin: 0 6px;
  font-size: 16px;
}

/* 确保备注显示正常 */
.compact-form {
  padding: 24px;
  height: auto;
  min-height: 500px;
  overflow-y: visible;
}

/* 更新表单控件样式 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 添加教育主题相关的装饰元素 */
.basic-info-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  /* background: linear-gradient(90deg, #409EFF, #67c23a); */
  opacity: 0.6;
}

/* 顶部操作栏样式重新设计 */
.top-actions {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-area,
.right-area {
  flex: 0 0 200px; /* 固定宽度，确保居中标题有足够空间 */
  display: flex;
  align-items: center;
}

.left-area {
  justify-content: flex-start;
}

.right-area {
  justify-content: flex-end;
}

.center-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  position: relative;
}

/* 标题包装器样式 */
.title-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 40px;
  background: linear-gradient(to right, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  border-radius: 8px;
}

/* 标题前缀样式 */
.title-prefix {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: normal;
  letter-spacing: 2px;
}

/* 实验标题样式优化 */
.experiment-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 600px;
  position: relative;
  padding: 0 10px;
  letter-spacing: 1px;
}

/* 标题装饰元素 */
.title-decoration {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(64, 158, 255, 0.2), 
    rgba(103, 194, 58, 0.2)
  );
  border-radius: 2px;
}

/* 标题包装器悬浮效果 */
.title-wrapper:hover .title-decoration {
  background: linear-gradient(90deg, 
    rgba(64, 158, 255, 0.4), 
    rgba(103, 194, 58, 0.4)
  );
  transition: background 0.3s ease;
}

/* 标题两侧装饰 */
.title-wrapper::before,
.title-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409EFF;
  opacity: 0.6;
}

.title-wrapper::before {
  left: 20px;
}

.title-wrapper::after {
  right: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .left-area,
  .right-area {
    flex: 0 0 120px; /* 在小屏幕上减少按钮区域的宽度 */
  }

  .title-wrapper {
    padding: 6px 30px;
  }

  .experiment-title {
    font-size: 20px;
    max-width: 300px;
  }

  .title-prefix {
    font-size: 12px;
  }
}

/* 顶部操作栏背景优化 */
.top-actions {
  background: linear-gradient(to bottom, #f5f7fa, #ffffff);
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 24px;
}

/* 按钮样式微调 */
.action-button {
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.submit-button {
  background: linear-gradient(to right, #409EFF, #67c23a);
  border: none;
}

.submit-button:hover {
  opacity: 0.9;
  background: linear-gradient(to right, #66b1ff, #85ce61);
}

/* 移除原有的表单操作按钮样式 */
.form-actions {
  display: none;
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
  background: #e8edf3; /* 加深背景色 */
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

.custom-tab-label .el-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* 移除默认的底部条 */
:deep(.el-tabs__active-bar) {
  display: none;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 24px;
}

/* 确保内容区域样式正确 */
.compact-form {
  max-width: 1200px;
  margin: 0 auto;
}

/* 移除多余的边框和阴影 */
:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

/* 添加动画效果 */
:deep(.el-tabs__item) {
  position: relative;
  overflow: hidden;
}

:deep(.el-tabs__item)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--el-color-primary);
  transition: all 0.3s;
  transform: translateX(-50%);
}

:deep(.el-tabs__item.is-active)::before {
  width: 100%;
}

/* 实验说明编辑器样式 */
.experiment-desc {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.desc-item {
  margin-bottom: 30px;
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.title-input {
  flex: 1;
}

.editor-wrapper {
  margin-bottom: 24px;
}

/* 提交按钮样式 */
.submit-button {
  min-width: 140px; /* 确保按钮文字能够完整显示 */
}

/* 主内容区域包装器 */
.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

/* 步骤条样式 */
.custom-steps {
  padding: 24px;
  border-bottom: 1px solid #e4e7ed;
}

/* 标签页容器样式 */
.tabs-wrapper {
  border-radius: 0;
  border: none;
}

/* 底部导航按钮样式 */
.steps-action {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  gap: 12px;
  background: #f8fafc;
}

/* 导航按钮样式 */
.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
}

/* 错误消息样式 */
:deep(.el-message-box__message) {
  color: #f56c6c;
  font-size: 14px;
  line-height: 1.4;
}

/* 移除tabs-wrapper的重复边框 */
:deep(.el-tabs__header) {
  border-radius: 0;
}

/* 确保内容区域没有重复的边框和圆角 */
:deep(.el-tab-pane) {
  border-radius: 0;
}
</style>

