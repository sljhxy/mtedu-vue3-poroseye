<template>
  <div class="experiment-steps">
    <div class="top-actions">
      <div class="left-area"/>
      <div class="center-area">
        <div class="title-wrapper">
          <span class="title-prefix">实验名称{{ currentExperimentId }}</span>
          <h2 class="experiment-title">
            {{ experimentName || '新建实验' }}
          </h2>
          <div class="title-decoration"></div>
        </div>
      </div>

      <div class="right-area"/>
    </div>
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

  
    <div class="steps-content">
      <component
        ref="currentComponentRef" 
        :is="currentComponent"
        @addExperimentInfoId="handleAddExperimentInfoId"
        :toEexperimentInfoId="toEexperimentInfoId"
        :experimentName="experimentName"
        :experimentId="currentExperimentId"
        @currentId="updateExperimentId"
      ></component>
    
    </div>

    <div class="page-footer">
      <div class="footer-content">
        <div class="button-group">
          <el-button 
            class="nav-button prev-button" 
            v-if="activeStep == 0" 
            @click="handleBackList"
          >
          <el-icon><ArrowLeft /></el-icon>
            返回列表            
          </el-button>
          <el-button 
            class="nav-button prev-button" 
            v-if="activeStep > 0" 
            @click="prev"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <div class="button-divider"></div>
          <el-button 
            class="nav-button next-button" 
            type="primary" 
            @click="next"
            v-if="activeStep < 5"
          >
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button 
            class="nav-button next-button" 
            type="primary" 
            @click="submit"
            v-if="activeStep === 5"
          >
            完成
            <el-icon><Check /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

        <!-- 添加新的悬浮返回按钮 -->
    <div class="floating-return">
      <div class="return-content" @click="handleBackList">
        <div class="return-arrow"></div>
        <span class="return-text">返回列表</span>
      </div>
    </div>
  </div>




</template>

<script setup>
import { ref, computed, defineProps, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BasicInfoManagement from './components/BasicInfo-management.vue'
import ExtendInfoManagement from './components/ExtendInfo-management.vue'
import QuestionMaterialManagement from './components/QuestionMaterial-management.vue'
import StepsSettingManagement from './components/StepsSetting-management.vue'
import DataUploadManagement from './components/DataUpload-management.vue'
import AuditManagement from './components/Audit-management.vue'
// 导入inject
import { inject } from 'vue';

// 注入刷新事件,这里括号中的参数要对应上前面provide中的第一个参数
const goRefresh = inject('reload');

//导入实验基本信息api 
import {getExperimentInfo} from '@/api/glxt/experimentInfo'

// const props = defineProps({
//   experimentName: {
//     type: String,
//     default: '新建实验'
//   }
// })
const route = useRoute()
const experiment = ref({})
//获取实验信息
const getExperimentInfoData = async (experimentId) => {
  const response = await getExperimentInfo(experimentId)
  if (response.code === 200) {
    experimentName.value = response.data.experimentName
    // currentExperimentId.value = experimentId
  } else {
    ElMessage.error('获取实验信息失败')
  }
}

// 修改 onMounted 钩子
onMounted(async () => {
  // 从路由参数判断操作类型和实验ID
  const { type, id } = route.query
  
  if (type === 'edit' && id) {
    getExperimentInfoData(id)
  } 


  // debugger
  // if(type === 'add' && currentExperimentId.value) {
  //   console.log(currentExperimentId)
  //   getExperimentInfoData(currentExperimentId.value)
  // }
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




//返回列表
const handleBackList = () => {
  router.push({
    path: '/glxt/experiment/experiment_list',
    query: { 
      _t: new Date().getTime() // 添加时间戳参数强制刷新列表
    }
  })
}

// 监听路由变化后刷新
// router.beforeEach((to, from, next) => {
//   console.log('路由变化', to, from);
//   // debugger
//   if (to.name === 'experimentList') {
//     next(); // 先完成路由跳转
//       // 强制重新加载当前路由
//     // next({ ...to, force: true });
//     // 在需要执行的地方调用方法
//     // goRefresh();
//     setTimeout(() => {
//       window.location.reload(false); // 使用 true 强制从服务器重新加载，而不是从缓存
//     }, 0);
//   } else {
//     next();
//   }
// })


//传向实验组件的数据
const toEexperimentInfoId = ref(null)
//新增完实验后传过来的学校id
const handleAddExperimentInfoId = (experimentInfoId) => {
  toEexperimentInfoId.value = experimentInfoId
  console.log('接收到最新的实验id为:' + experimentInfoId)
  getExperimentInfoData(experimentInfoId)
}
//上一步
const prev = () => {
  if (activeStep.value > 0) {

    if(activeStep.value === 1) {
      getExperimentInfoData(currentExperimentId.value)
    }

    activeStep.value--
    canSave.value = false// 进入上一步时，保存按钮状态重置为false
  }
}

const submit = () => {
  // 提交逻辑
  router.push({
    path: '/glxt/experiment/experiment_list',
    query: { 
      _t: new Date().getTime() // 添加时间戳参数强制刷新列表
    }
  })
  // ElMessage.success('提交成功')
}

// 实验名称响应式变量
const experimentName = ref('')
// 保存按钮状态
const canSave = ref(false)

// 更新保存按钮状态
const updateExperimentId = (value) => {
  currentExperimentId.value = value
}


// Add experimentId ref
const currentExperimentId = ref()


const currentComponentRef = ref(null)
// Update the next method to include experimentId handling
const next = async () => {
  if (activeStep.value < 5) {
    // debugger
    // Check if current component has validation method
    if (currentComponentRef.value && currentComponentRef.value.validateForm) {
      try {
        // Attempt to validate the current form
        await currentComponentRef.value.validateForm()
        
        // If validation passes, handle experimentId for first step
        if (activeStep.value === 0) {
          if (currentComponentRef.value.experimentId) {
            currentExperimentId.value = currentComponentRef.value.experimentId
          }
        }
        
        // Proceed to next step
        activeStep.value++
        canSave.value = false
      } catch (error) {
        // Show validation error message
        ElMessage.warning('请完成必填项后再进行下一步')
        return
      }
    } else {
      // If no validation method exists, proceed as normal
      if (activeStep.value === 0) {
        if (currentComponentRef.value?.experimentId) {
          currentExperimentId.value = currentComponentRef.value.experimentId
        }
      }
      activeStep.value++
      canSave.value = false
    }
  }
}

// 添加返回方法
// const handleBack = () => {
//   router.go(-1)
// }
</script>

<style lang="scss" scoped>
.experiment-steps {
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 8px;
  // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  max-width: 75%;
  margin: 0 auto;
  padding-bottom: 100px;

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
    margin-top: 0;
    min-height: 400px;
    padding: 0 20px;
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

/* 底部导航样式 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-top: 2px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 32px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-left: 292px;//居中对齐
}

.button-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(64, 158, 255, 0.2),
    transparent
  );
}

.nav-button {
  min-width: 120px;
  height: 40px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 24px;
}

.prev-button {
  background-color: #f8faff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #409EFF;
  
  &:hover {
    background-color: #fff;
    border-color: #409EFF;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    
    .el-icon {
      transform: translateX(-3px);
    }
  }
}

.next-button {
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  color: #ffffff;
  
  &:hover {
    background: linear-gradient(135deg, #66b1ff, #409EFF);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
    
    .el-icon {
      transform: translateX(3px);
    }
  }
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  .footer-content {
    padding: 16px;
  }

  .button-group {
    gap: 16px;
  }

  .nav-button {
    min-width: 100px;
    height: 36px;
    font-size: 14px;
    padding: 0 16px;
  }
}
/* 新的悬浮返回按钮样式 */
.floating-return {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;

  .return-content {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 10px 15px 10px 10px;
    background: #f4f4f5;
    border-radius: 20px 0 0 20px;
    transition: all 0.3s ease;

    &:hover {
      background: #4facfe;
      padding-right: 85px;

      .return-text {
        opacity: 1;
        visibility: visible;
      }
    }

    .return-arrow {
      width: 12px;
      height: 12px;
      border-top: 2px solid #909399;
      border-right: 2px solid #909399;
      transform: rotate(225deg);
      margin-right: 5px;
    }

    .return-text {
      position: absolute;
      right: 15px;
      color: #fff;
      opacity: 0;
      visibility: hidden;
      white-space: nowrap;
      transition: all 0.3s ease;
    }

    &:hover {
      .return-arrow {
        border-color: #fff;
      }
    }
  }
}
</style>
