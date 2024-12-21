<template>
  <div class="experiment-steps">
    <!-- Top Action Bar -->
    <div class="top-actions">
      <div class="left-area">
        <el-button 
          @click="$emit('cancel')"
          class="action-button cancel-button"
          v-show="canSave"
        >
          <el-icon><Close /></el-icon>
          取消
        </el-button>
      </div>
      
      <div class="center-area">
        <div class="title-wrapper">
          <span class="title-prefix">实验名称</span>
          <h2 class="experiment-title">
            {{ experimentName || '新建实验' }}
          </h2>
          <div class="title-decoration"></div>
        </div>
      </div>

      <div class="right-area">
        <el-button 
          type="primary" 
          @click="handleSave"
          :disabled="!canSave"
          v-show="canSave"
        >
          <el-icon><Check /></el-icon>
          {{ saveButtonText }}
        </el-button>
      </div>
    </div>

    <!-- Steps -->
    <el-steps 
      simple
      :active="activeStep" 
      finish-status="success" 
      align-center
      class="custom-steps"
    >
      <el-step title="基础信息" icon="Document" />
        <el-step title="扩展信息" icon="Edit" />
        <el-step title="题库素材" icon="Collection" />
        <el-step title="步骤设置" icon="SetUp" />
        <el-step title="数据表上传" icon="Upload" />
        <el-step title="审核提交" icon="Check" />
    </el-steps>

    <!-- Steps Content -->
    <div class="steps-content">
      <component 
        :is="currentComponent"
        v-model:experimentName="experimentName"
        @canSave="updateCanSave"
      ></component>
    </div>

    <!-- Bottom Action Buttons -->
    <div class="steps-action">
      <el-button 
        v-if="activeStep === 0" 
        @click="go_back"
      >返回列表</el-button>
      <el-button 
        v-if="activeStep > 0" 
        @click="prev"
      >上一步</el-button>
      <el-button 
        type="primary" 
        @click="next"
        v-if="activeStep < 5"
      >下一步</el-button>
      <el-button 
        type="primary" 
        @click="submit"
        v-if="activeStep === 5"
      >提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close, Check } from '@element-plus/icons-vue'
import BasicInfoManagement from './components/BasicInfo-management.vue'
import ExtendInfoManagement from './components/ExtendInfo-management.vue'
import QuestionMaterialManagement from './components/QuestionMaterial-management.vue'
import StepsSettingManagement from './components/StepsSetting-management.vue'
import DataUploadManagement from './components/DataUpload-management.vue'
import AuditManagement from './components/Audit-management.vue'

const props = defineProps({
  experimentName: {
    type: String,
    default: '新建实验'
  }
})

const router = useRouter()
const activeStep = ref(0)

// 各步骤对应的组件名称
const steps = [
  BasicInfoManagement,//基础信息
  ExtendInfoManagement,//扩展信息
  QuestionMaterialManagement,//题库素材
  StepsSettingManagement,//步骤设置
  DataUploadManagement,//数据表上传
  AuditManagement//审核
]

const currentComponent = computed(() => {
  return steps[activeStep.value]
})

const next = () => {
  if (activeStep.value < 5) {
    activeStep.value++
    canSave.value = false// 进入下一步时，保存按钮状态重置为false
  }
}

const go_back = () => {
  router.push('/glxt/experiment/experiment_list')
}

const prev = () => {
  if (activeStep.value > 0) {
    activeStep.value--
    canSave.value = false// 进入上一步时，保存按钮状态重置为false
  }
}

const submit = () => {
  // 提交逻辑
  ElMessage.success('提交成功')
}

// 实验名称响应式变量
const experimentName = ref('')
// 保存按钮状态
const canSave = ref(false)

// 更新保存按钮状态
const updateCanSave = (value) => {
  canSave.value = value
}

// 保存按钮文本计算属性
const saveButtonText = computed(() => {
  // 获取当前组件实例
  const currentComponent = steps[activeStep.value]
  
  // 基础信息步骤
  if (activeStep.value === 0) {
    // 假设 BasicInfoManagement 组件暴露了 activeTab
    return currentComponent?.exposed?.activeTab === 'basicInfo' 
      ? '保存实验信息' 
      : '保存实验说明'
  }
  
  // 扩展信息步骤
  if (activeStep.value === 1) {
    // 假设 ExtendInfoManagement 组件暴露了 activeTab
    const extendTab = currentComponent?.exposed?.activeTab
    switch (extendTab) {
      case 'principle':
        return '保存实验原理'
      case 'objective':
        return '保存实验目标'
      case 'equipment':
        return '保存实验器具'
      default:
        return '保存扩展信息'
    }
  }
  
  // 其他步骤保持不变
  switch (activeStep.value) {
    case 2:
      return '保存题库素材'
    case 3:
      return '保存步骤设置'
    case 4:
      return '保存数据表'
    case 5:
      return '提交审核'
    default:
      return '保存'
  }
})

// 修改处理保存按钮点击方法
const handleSave = async () => {
  const currentComponentInstance = steps[activeStep.value]
  
  try {
    if (currentComponentInstance?.exposed?.handleSubmit) {
      await currentComponentInstance.exposed.handleSubmit()
      
      // 根据不同步骤和标签页显示不同的成功消息
      let successMessage = ''
      
      // 基础信息步骤
      if (activeStep.value === 0) {
        successMessage = currentComponentInstance?.exposed?.activeTab === 'basicInfo'
          ? '实验信息保存成功'
          : '实验说明保存成功'
      }
      // 扩展信息步骤
      else if (activeStep.value === 1) {
        const extendTab = currentComponentInstance?.exposed?.activeTab
        switch (extendTab) {
          case 'principle':
            successMessage = '实验原理保存成功'
            break
          case 'objective':
            successMessage = '实验目标保存成功'
            break
          case 'equipment':
            successMessage = '实验器具保存成功'
            break
          default:
            successMessage = '扩展信息保存成功'
        }
      }
      // 其他步骤
      else {
        const successMessages = {
          2: '题库素材保存成功',
          3: '步骤设置保存成功',
          4: '数据表保存成功',
          5: '已提交审核'
        }
        successMessage = successMessages[activeStep.value]
      }
      
      ElMessage.success(successMessage)
      
      // 如果不是最后一步，且当前标签页是最后一个，则自动进入下一步
      if (activeStep.value < 5 && isLastTab(currentComponentInstance)) {
        next()
      }
    }
  } catch (error) {
    ElMessage.error({
      message: '保存失败，请检查数据后重试',
      duration: 3000
    })
  }
}

// 判断是否是当前步骤的最后一个标签页
const isLastTab = (componentInstance) => {
  if (activeStep.value === 0) {
    return componentInstance?.exposed?.activeTab === 'experimentDesc'
  }
  if (activeStep.value === 1) {
    return componentInstance?.exposed?.activeTab === 'equipment'
  }
  return true
}
</script>

<style lang="scss" scoped>
.experiment-steps {
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  max-width: 99%;
  margin: 0 auto;

  .custom-steps {
    margin: 20px 0 15px;
    padding: 10px 20px;
    background: linear-gradient(to right, rgba(64, 158, 255, 0.05), rgba(103, 194, 58, 0.05));
    border-radius: 12px;
    
    // 自定义 el-steps 组件样式
    :deep(.el-step) {
      .el-step__title {
        font-size: 16px;
        font-weight: 500;
        margin-top: 8px;
        
        &.is-success {
          color: #67c23a;
          font-weight: 500;
        }
        &.is-process {
          color: #409eff;
          font-weight: 600;
        }
        &.is-wait {
          color: #909399;
        }
      }

      .el-step__head {
        .el-step__icon {
          width: 40px;
          height: 40px;
          font-size: 20px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          
          &.is-text {
            border-style: solid;
            border-width: 2px;
          }
        }
        
        &.is-success {
          color: #67c23a;
          border-color: #67c23a;
          
          .el-step__icon {
            background: #f0f9eb;
          }
        }
        &.is-process {
          color: #409eff;
          border-color: #409eff;
          
          .el-step__icon {
            background: #ecf5ff;
            transform: scale(1.1);
          }
        }
      }

      .el-step__line {
        background-color: #e4e7ed;
        height: 2px;
      }
      
      // 添加hover效果
      &:hover {
        .el-step__head:not(.is-process) .el-step__icon {
          transform: translateY(-2px);
        }
      }
    }
  }

  
  .steps-content {
    margin-top: 20px;
    min-height: 400px;
    padding: 20px;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }

  .steps-action {
    margin-top: 30px;
    text-align: center;
    
    .el-button {
      margin: 0 12px;
      padding: 12px 25px;
      font-size: 14px;
    }
  }

  .action-button {
    transition: all 0.3s ease;
    min-width: 120px; // 确保按钮宽度统一
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 8px;
  }

  .action-button:hover {
    transform: translateY(-1px);
  }

  .cancel-button {
    background: linear-gradient(to right, #7d9da3, #cfe4df);
    color: #fff;

    &:hover {
      opacity: 0.9;
      background: linear-gradient(to right, #c9b8b8, #cfe4df);
    }
  }

  .submit-button {
    background: linear-gradient(to right, #409EFF, #67c23a);
    border: none;

    &:hover {
      opacity: 0.9;
      background: linear-gradient(to right, #66b1ff, #85ce61);
    }
  }

  .el-button.is-disabled {
    background: #a0cfff !important;
    border-color: #a0cfff !important;
    color: #fff !important;
    cursor: not-allowed;
  }
}

// Include styles from BasicInfo-management.vue for consistency
.top-actions {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background: linear-gradient(to bottom, #f5f7fa, #ffffff);
  border-bottom: 1px solid #e4e7ed;
  padding: 5px 2px;
}

.left-area,
.right-area {
  flex: 0 0 200px;
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

.title-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 40px;
  background: linear-gradient(to right, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  border-radius: 8px;
}

.title-prefix {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: normal;
  letter-spacing: 2px;
}

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

.title-decoration {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2), rgba(103, 194, 58, 0.2));
  border-radius: 2px;
}

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

/* 添加禁用按钮样式 */
.el-button.is-disabled {
  background: #a0cfff !important;
  border-color: #a0cfff !important;
  color: #fff !important;
  cursor: not-allowed;
}

/* 更新保存按钮样式 */
.right-area {
  .el-button {
    min-width: 120px; // 确保按钮宽度统一
    
    &.el-button--primary {
      background: linear-gradient(to right, #409EFF, #67c23a);
      border: none;
      padding: 10px 20px;
      
      &:hover {
        opacity: 0.9;
        background: linear-gradient(to right, #66b1ff, #85ce61);
      }
      
      &.is-disabled {
        background: #a0cfff !important;
        border-color: #a0cfff !important;
        opacity: 0.6;
      }
    }
  }
}
</style>
