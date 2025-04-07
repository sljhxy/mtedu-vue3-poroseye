<template>
  <div class="add-school-container">
    <div class="steps-wrapper">
      <el-steps 
        simple
        :active="currentStep" 
        finish-status="success" 
        class="steps" 
        align-center
      >
        <el-step
          v-for="(step, index) in stepsList"
          :key="index"
          @click="handleStepClick(index)"
          :title="step.title"
          :description="step.description"
          :icon="step.icon"
        />
      </el-steps>
    </div>
    <!-- 根据步骤显示不同的内容 -->
    <!-- 创建学校 -->
    <school-management
      v-if="currentStep === 0"
      ref="schoolFormRef"
      @addSchoolId="handleAddSchoolId"
      :toSchoolMagentSchooId="toSchoolMagentSchooId"
      @next-step="handleSchoolNext"
    />

    <!-- 创建学院 - 只在本科时显示 -->
    <college-management
      v-if="currentStep === 1 && schoolInfo.isCollege === '1'" 
      :schoolInfo="schoolInfo"
      @prev-step="handlePrevStep"
      @next-step="handleCollegeNext"
    />

    <!-- 系管理 - 根据学校类型调整显示位置 -->
    <!-- v-if="(schoolInfo.isCollege === '1' && currentStep === 2) || 
    (schoolInfo.isCollege !== '1' && currentStep === 1)" -->
    <system-management
    v-if="(schoolInfo.isCollege === '1' && schoolInfo.isSystem === '1' && currentStep === 2) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '1' && currentStep === 1)"
      :schoolInfo="schoolInfo"
      :colleges="collegesData"
      @prev-step="handlePrevStep"
      @next-step="handleSystemNext"
    />

    <!-- 创建专业 -->
    <speciality-management 
    v-if="(schoolInfo.isCollege === '1' && schoolInfo.isSystem === '1' && currentStep === 3) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '1' && currentStep === 2) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '0' && currentStep === 1)"
      :school-info="schoolInfo"
      :systems="systems"
      @prev-step="handlePrevStep"
      @next-step="handleSpecialityNext"
    />

    <!-- 创建年级 -->
    <grade-management 
            v-if="(schoolInfo.isCollege === '1' && schoolInfo.isSystem === '1' && currentStep === 4) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '1' && currentStep === 3) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '0' && currentStep === 2)"
      :school-info="schoolInfo" 
      :specialities="specialities"
      @prev-step="handlePrevStep"
      @next-step="handleGradeNext"
    />

    <!-- 创建班级 -->
    <class-management 
    v-if="(schoolInfo.isCollege === '1' && schoolInfo.isSystem === '1' && currentStep === 5) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '1' && currentStep === 4) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '0' && currentStep === 3)"
      :grades="grades"
      :schoolInfo="schoolInfo"
      :specialities="specialities"
      @prev-step="handlePrevStep"
      @next-step="handleClassNext"
    />

    <!-- 创建科目课程 -->
    <course-management 
    v-if="(schoolInfo.isCollege === '1' && schoolInfo.isSystem === '1' && currentStep === 6) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '1' && currentStep === 5) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '0' && currentStep === 4)"
      :grades="grades"
      :schoolInfo="schoolInfo"
      :specialities="specialities"
      @prev-step="handlePrevStep"
      @next-step="handleCourseNext"
    />

    <!-- 设备激活 -->
    <device-management 
    v-if="(schoolInfo.isCollege === '1' && schoolInfo.isSystem === '1' && currentStep === 7) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '1' && currentStep === 6) || 
            (schoolInfo.isCollege === '0' && schoolInfo.isSystem === '0' && currentStep === 5)"
      :schoolInfo="schoolInfo"
      @prev-step="handlePrevStep"
    />

    <!-- 添加新的悬浮返回按钮 -->
    <div class="floating-return">
      <div class="return-content" @click="handleBack">
        <div class="return-arrow"></div>
        <span class="return-text">返回列表</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SchoolManagement from './components/school-management.vue'//学校
import CollegeManagement from './components/college-management.vue'//学院
import SystemManagement from './components/system-management.vue'//系
import SpecialityManagement from './components/speciality-management.vue'//专业
import GradeManagement from './components/grade-management.vue'//年级
import ClassManagement from './components/class-management.vue'//班级
import CourseManagement from './components/course-management.vue'//课程
import DeviceManagement from './components/device-management.vue'//设备

//引入accets中的图标
import { School, GoldMedal, Pear, Reading, Monitor, Collection, OfficeBuilding, CollectionTag } from '@element-plus/icons-vue'

//引入学校相关接口
import {getSchool} from "@/api/glxt/vocal_school";

const currentStep = ref(0)
const schoolFormRef = ref(null)
const route = useRoute()
const grades = ref([])
const collegesData = ref([])
const systems = ref([])
const specialities = ref([])

// 在顶层作用域初始化 router
const router = useRouter()

// 步骤配置数据
const stepsList = computed(() => {
  // 基础步骤配置
  const baseSteps = [
    { title: '创建学校', description: '填写学校基本信息', icon: School },
    { title: '创建专业', description: '创建学校专业信息', icon: CollectionTag },
    { title: '创建年级', description: '创建学校年级信息', icon: GoldMedal },
    { title: '创建班级', description: '创建班级基础信息', icon: Pear },
    { title: '科目课程', description: '配置教学科目', icon: Reading },
    { title: '设备激活', description: '激活教学设备', icon: Monitor }
  ]

  // 如果是本科(isCollege === '1')，在第二个位置插入学院和系
  // console.log(schoolInfo.value.isCollege + '<-学段')
  if (schoolInfo.value?.isCollege === '1' && schoolInfo.value?.isSystem === '1') {
    baseSteps.splice(1, 0, 
      { title: '创建学院', description: '填写学院基本信息', icon: OfficeBuilding },
      { title: '创建系', description: '填写系基本信息', icon: Collection }
    )
  } else 
  if (schoolInfo.value?.isCollege == '0' && schoolInfo.value?.isSystem == '0'){
    baseSteps.splice(1, 0, 
    // { title: '创建学院', description: '填写学院基本信息', icon: OfficeBuilding },
    // { title: '创建系', description: '填写系基本信息', icon: Collection }
    )
  } else if (schoolInfo.value?.isCollege == '0' && schoolInfo.value?.isSystem == '1'){
    baseSteps.splice(1, 0, 
    
    { title: '创建系', description: '填写系基本信息', icon: Collection }
    )
  }else{
    // 如果是专科或中专(isCollege === '2' || '3')，只在第二个位置插入系
    baseSteps.splice(1, 0, 
      { title: '创建系', description: '填写系基本信息', icon: Collection }
    )
  }

  return baseSteps
})

// 初始化表单数据
const initForms = () => {
  const isAdd = route.query.type === 'add'
  // console.log(isAdd + '<-新增')
  if (isAdd) {
    // 如果是新增操作，重置所有表单数据
    if (schoolFormRef.value?.formData) {
      schoolFormRef.value.formData.schoolName = ''
      schoolFormRef.value.formData.province = ''
      schoolFormRef.value.formData.city = ''
      schoolFormRef.value.formData.district = ''
      schoolFormRef.value.formData.detailAddress = ''
      schoolFormRef.value.formData.contactName = ''
      schoolFormRef.value.formData.contactPhone = ''
      schoolFormRef.value.formData.website = ''
      schoolFormRef.value.formData.educationLevel = ''
      schoolFormRef.value.formData.isCollege = ''
      schoolFormRef.value.formData.isSystem = ''
      schoolFormRef.value.formData.isActive = true
    }
  } else {
    // 如果是编辑操作，根据 id 加载数据
    const schoolId = route.query.id
    // console.log(schoolId + '<-编辑')
    //获取当前学校数据  主要是为了拿到学段，区分是否有学院
    getSchoolData(schoolId)
  }
}

//获取当前学校数据
const getSchoolData = async (id) => {
  try {
    const response = await getSchool(id);
    schoolInfo.value = {...response.data};
    // console.log(schoolInfo.value.isCollege + '<-学校数据')
  } catch (error) {
    ElMessage.error('获取学校数据失败');
  }
}


onMounted(() => {
  initForms()
})

// 将 schoolInfo 改为 ref 而不是 computed
const schoolInfo = ref({})

// 修改处理学校表单提交的函数
const handleSchoolNext = (schoolData) => {
  // 保存完整的学校信息
  schoolInfo.value = {
    id: schoolData.id,
    name: schoolData.schoolName,
    educationLevel: schoolData.educationLevel,
    educationLevelName: schoolData.educationLevelName,//学校类型 1-普教 2-职教
    isCollege: schoolData.isCollege,//是否有学院
    isSystem: schoolData.isSystem,//是否有系
    // 添加其他可能需要的学校信息
    address: schoolData.address,
    detailAddress: schoolData.detailAddress,
    contactName: schoolData.contactName,
    contactPhone: schoolData.contactPhone,
    website: schoolData.website,
    isActive: schoolData.isActive
  }
  currentStep.value++
}

//传向学校组件的数据
const toSchoolMagentSchooId = ref(null)
//新增完学校后传过来的学校id
const handleAddSchoolId = (schoolId) => {
  toSchoolMagentSchooId.value = schoolId
}

// 处理学院管理的下一步
const handleCollegeNext = (collegeData) => {


  collegesData.value = collegeData
  currentStep.value++
}

// 处理系管理的下一步
const handleSystemNext = (systemData) => {
  systems.value = systemData
  currentStep.value++
}

// 处理专业管理的下一步
const handleSpecialityNext = (specialityData) => {
  specialities.value = specialityData
  currentStep.value++
}

// 处理年级管理的下一步
const handleGradeNext = (gradeData) => {
  grades.value = gradeData
  currentStep.value++
}

// 处理班级管理的下一步
const handleClassNext = (classData) => {
  currentStep.value++
}

// 处理科目课程管理的下一步
const handleCourseNext = (courseData) => {
  currentStep.value++
}

// 处理返回上一步
const handlePrevStep = () => {
  currentStep.value--
}

const handleStepClick = (index) => {
  currentStep.value = index
}

// 添加返回方法
const handleBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.add-school-container {
  padding: 1px;
}

.steps-wrapper {
  margin: 10px auto;
  max-width: 1600px;
  width: 95%;
}

.steps {
  margin: 20px 0 15px;
  padding: 10px 20px;
  background: linear-gradient(to right, rgba(73, 126, 172, 0.05), rgba(40, 199, 111, 0.05));
  border-radius: 12px;
  
  :deep(.el-step) {
    .el-step__title {
      font-size: 16px;
      font-weight: 500;
      margin-top: 8px;
      
      &.is-success {
        color: #28c76f;
        font-weight: 500;
      }
      &.is-process {
        color: #4facfe;
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
        color: #28c76f;
        border-color: #28c76f;
        
        .el-step__icon {
          background: #f0f9eb;
        }
      }
      &.is-process {
        color: #4facfe;
        border-color: #4facfe;
        
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
    
    &:hover {
      .el-step__head:not(.is-process) .el-step__icon {
        transform: translateY(-2px);
      }
    }
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
