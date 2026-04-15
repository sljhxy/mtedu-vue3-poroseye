<template>
  <div class="app-container class-statistics-page">
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="学校类型">
          <el-select
            v-model="queryParams.schoolType"
            placeholder="请选择类型"
            clearable
            style="width: 140px"
            :disabled="isTeacher"
            @change="onSchoolTypeChange"
          >
            <el-option label="普教" value="1" />
            <el-option label="职教" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="学校">
          <el-select
            v-model="queryParams.schoolId"
            placeholder="请选择学校"
            clearable
            filterable
            style="width: 280px"
            :disabled="!queryParams.schoolType"
            @change="onSchoolChange"
          >
            <el-option
              v-for="school in schoolList"
              :key="school.id"
              :label="school.schoolName"
              :value="school.id"
            />
          </el-select>
        </el-form-item>

        <!-- 职教：院选择（仅学校有院时显示） -->
        <el-form-item label="院" v-show="showCollege">
          <el-select
            v-model="queryParams.collegeId"
            placeholder="请选择院"
            clearable
            style="width: 200px"
            :disabled="!queryParams.schoolId"
            @change="onCollegeChange"
          >
            <el-option
              v-for="college in collegeList"
              :key="college.id"
              :label="college.collegeName"
              :value="college.id"
            />
          </el-select>
        </el-form-item>

        <!-- 职教：系选择（仅学校有系时显示） -->
        <el-form-item label="系" v-show="showSystem">
          <el-select
            v-model="queryParams.systemId"
            placeholder="请选择系"
            clearable
            style="width: 200px"
            :disabled="!canSelectSystem"
            @change="onSystemChange"
          >
            <el-option
              v-for="system in systemList"
              :key="system.id"
              :label="system.systemName"
              :value="system.id"
            />
          </el-select>
        </el-form-item>

        <!-- 职教：专业选择 -->
        <el-form-item label="专业" v-show="queryParams.schoolType === '2'">
          <el-select
            v-model="queryParams.specialityId"
            placeholder="请选择专业"
            clearable
            style="width: 200px"
            :disabled="!canSelectSpeciality"
            @change="onSpecialityChange"
          >
            <el-option
              v-for="spec in specialityList"
              :key="spec.id"
              :label="spec.specialityName"
              :value="spec.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="年级">
          <el-select
            v-model="queryParams.gradeId"
            placeholder="请选择年级"
            clearable
            style="width: 180px"
            :disabled="!canSelectGrade"
            @change="onGradeChange"
          >
            <el-option
              v-for="grade in gradeList"
              :key="grade.gradeId"
              :label="grade.gradeName"
              :value="grade.gradeId"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Refresh" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 - 有数据时显示 -->
    <el-row v-if="classList.length > 0" :gutter="16" class="stats-row">
      <el-col :span="12">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="24"><School /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ classList.length }}</div>
              <div class="stat-label">班级总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalStudents }}</div>
              <div class="stat-label">年级数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态提示 - 选择年级后仍无班级时显示 -->
    <el-row v-else-if="queryParams.gradeId && !loading" :gutter="16" class="stats-row">
      <el-col :span="24">
        <el-empty :description="emptyText" :image-size="120">
          <template #image>
            <el-icon :size="80" color="#c0c4cc"><FolderOpened /></el-icon>
          </template>
        </el-empty>
      </el-col>
    </el-row>

    <!-- 班级列表 -->
    <el-card class="class-list-card" shadow="never">
      <template #header>
        <div class="list-header">
          <span class="list-title">班级列表</span>
          <el-tag v-if="selectedGradeName" type="info" size="large">
            {{ selectedSchoolName }} / {{ selectedCollegeName }}{{ selectedSystemName }}{{ selectedSpecialityName }}{{ selectedGradeName }}
          </el-tag>
        </div>
      </template>

      <div v-loading="loading" class="class-grid" :class="{ 'is-empty': classList.length === 0 }">
        <el-empty v-if="!loading && classList.length === 0" :description="emptyText" />

        <el-row :gutter="16" v-else>
          <el-col
            v-for="cls in classList"
            :key="cls.classId"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            class="class-col"
          >
            <div class="class-card" @click="handleCardClick(cls)">
              <div class="class-card-header">
                <div class="class-icon-wrapper">
                  <el-icon class="class-card-icon"><House /></el-icon>
                </div>
                <div class="class-info">
                  <div class="class-name">{{ cls.className }}</div>
                  <div class="class-meta">班级ID: {{ cls.classId }}</div>
                </div>
              </div>

              <div class="class-card-body">
                <div class="class-stat">
                  <el-icon class="stat-icon"><User /></el-icon>
                  <span class="stat-label">学生人数</span>
                  <span class="stat-value">{{ cls.studentCount }}</span>
                </div>
              </div>

              <div class="class-card-footer">
                <el-button type="primary" class="action-btn" @click.stop="handleClassDetail(cls)">
                  <el-icon><DataLine /></el-icon>
                  <span>班级情况</span>
                </el-button>
                <el-button type="success" class="action-btn" @click.stop="handleStudentDetail(cls)">
                  <el-icon><UserFilled /></el-icon>
                  <span>学生情况</span>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ClassStatistics'
}
</script>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  School, User, Refresh,
  House, DataLine, UserFilled
} from '@element-plus/icons-vue'
import { baseListSchool } from '@/api/glxt/base_school'
import { vocalListSchool } from '@/api/glxt/vocal_school'
import { listCollege } from '@/api/glxt/vocal_college'
import { listSystem } from '@/api/glxt/vocal_system'
import { listSpeciality } from '@/api/glxt/vocal_speciality'
import { getGrades, getClasses } from '@/api/statistics'
import { useTeacherInfo } from '@/store/modules/teacherInfo'

const router = useRouter()
const { isTeacher, schoolType: userSchoolType, schoolId: userSchoolId } = useTeacherInfo()

const loading = ref(false)
const schoolList = ref([])
const collegeList = ref([])
const systemList = ref([])
const specialityList = ref([])
const gradeList = ref([])
const classList = ref([])

const queryParams = ref({
  schoolType: null,
  schoolId: null,
  collegeId: null,
  systemId: null,
  specialityId: null,
  gradeId: null
})

// 教师用户自动填充学校类型和学校
onMounted(() => {
  if (isTeacher.value) {
    queryParams.value.schoolType = userSchoolType.value
    onSchoolTypeChange(userSchoolType.value).then(() => {
      if (userSchoolId.value) {
        queryParams.value.schoolId = userSchoolId.value
        onSchoolChange(userSchoolId.value)
      }
    })
  }
})

// 当前选中的学校对象
const selectedSchool = computed(() => {
  return schoolList.value.find(s => s.id === queryParams.value.schoolId)
})

// 辅助函数：检查是否为"是"值
function isYesValue(value) {
  return value === '1' || value === '是' || value === true || value === 1
}

// 是否显示院下拉框
const showCollege = computed(() => {
  if (!selectedSchool.value) return false
  return isYesValue(selectedSchool.value.isCollege)
})

// 是否显示系下拉框
const showSystem = computed(() => {
  if (!selectedSchool.value) return false
  return isYesValue(selectedSchool.value.isSystem)
})

// 是否可以选择系（有院时需先选院）
const canSelectSystem = computed(() => {
  if (!queryParams.value.schoolId) return false
  if (showCollege.value) {
    return queryParams.value.collegeId
  }
  return true
})

// 是否可以选择专业
const canSelectSpeciality = computed(() => {
  if (!queryParams.value.schoolId) return false
  if (showSystem.value) {
    return queryParams.value.systemId
  }
  return true
})

// 是否可以选择年级
const canSelectGrade = computed(() => {
  if (queryParams.value.schoolType === '1') {
    // 普教: 选了学校就可以选年级
    return queryParams.value.schoolId
  } else {
    // 职教: 必须选了专业才能选年级
    return queryParams.value.specialityId
  }
})

// 计算统计数据
const totalStudents = computed(() => {
  return classList.value.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
})

const selectedSchoolName = computed(() => {
  return selectedSchool.value?.schoolName || ''
})

const selectedCollegeName = computed(() => {
  const college = collegeList.value.find(c => c.id === queryParams.value.collegeId)
  return college ? college.collegeName + ' / ' : ''
})

const selectedSystemName = computed(() => {
  const system = systemList.value.find(s => s.id === queryParams.value.systemId)
  return system ? system.systemName + ' / ' : ''
})

const selectedSpecialityName = computed(() => {
  const spec = specialityList.value.find(s => s.id === queryParams.value.specialityId)
  return spec ? spec.specialityName + ' / ' : ''
})

const selectedGradeName = computed(() => {
  const grade = gradeList.value.find(g => g.gradeId === queryParams.value.gradeId)
  return grade?.gradeName || ''
})

const emptyText = computed(() => {
  if (!queryParams.value.schoolType) return '请先选择学校类型'
  if (!queryParams.value.schoolId) return '请选择学校'
  if (queryParams.value.schoolType === '2') {
    if (showCollege.value && !queryParams.value.collegeId) return '请选择院'
    if (showSystem.value && !queryParams.value.systemId) return '请选择系'
    if (!queryParams.value.specialityId) return '请选择专业'
  }
  if (!queryParams.value.gradeId) return '请选择年级'
  return '暂无班级数据'
})

// 重置筛选
function resetFilters() {
  console.log('🔄 [resetFilters] 重置所有筛选条件')
  queryParams.value = {
    schoolType: null,
    schoolId: null,
    collegeId: null,
    systemId: null,
    specialityId: null,
    gradeId: null
  }
  schoolList.value = []
  collegeList.value = []
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []
}

// 学校类型变更
async function onSchoolTypeChange(type) {
  console.log('🎯 [onSchoolTypeChange] 学校类型变更', { type })

  queryParams.value.schoolId = null
  queryParams.value.collegeId = null
  queryParams.value.systemId = null
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  schoolList.value = []
  collegeList.value = []
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []

  if (!type) return

  try {
    console.log('📋 [onSchoolTypeChange] 加载学校列表', { type })
    const res = type === '1'
      ? await baseListSchool({ pageNum: 1, pageSize: 10000 })
      : await vocalListSchool({ pageNum: 1, pageSize: 10000 })
    schoolList.value = res.rows || []
    console.log('✅ [onSchoolTypeChange] 学校列表加载完成', { count: schoolList.value.length })
  } catch (e) {
    console.error('❌ [onSchoolTypeChange] 加载学校列表失败', e)
  }
}

// 学校变更
async function onSchoolChange(schoolId) {
  console.log('🏫 [onSchoolChange] 学校变更', { schoolId, schoolType: queryParams.value.schoolType })

  queryParams.value.collegeId = null
  queryParams.value.systemId = null
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  collegeList.value = []
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []

  if (!schoolId) return

  const school = selectedSchool.value
  console.log('📊 [onSchoolChange] 学校配置', {
    schoolName: school?.schoolName,
    isCollege: school?.isCollege,
    isSystem: school?.isSystem,
    showCollege: showCollege.value,
    showSystem: showSystem.value
  })

  // 普教：直接加载年级列表
  if (queryParams.value.schoolType === '1') {
    console.log('📚 [onSchoolChange] 普教模式，加载年级列表')
    try {
      const res = await getGrades({
        schoolId,
        schoolType: '1'
      })
      gradeList.value = res.data || []
      console.log('✅ [onSchoolChange] 普教年级列表加载完成', { count: gradeList.value.length })
    } catch (e) {
      console.error('❌ [onSchoolChange] 加载年级列表失败', e)
    }
    return
  }

  // 职教：根据学校配置加载院或系
  if (school) {
    if (showCollege.value) {
      // 加载院列表
      console.log('🏛️ [onSchoolChange] 职教模式，加载院列表')
      try {
        const res = await listCollege({
          pageNum: 1,
          pageSize: 10000,
          vocalEduSchoolId: schoolId
        })
        collegeList.value = res.rows || []
        console.log('✅ [onSchoolChange] 院列表加载完成', { count: collegeList.value.length })
      } catch (e) {
        console.error('❌ [onSchoolChange] 加载院列表失败', e)
      }
    } else if (showSystem.value) {
      // 直接加载系的列表（系归属学校）
      console.log('🏢 [onSchoolChange] 职教模式，加载系列表（归属学校）')
      try {
        const res = await listSystem({
          pageNum: 1,
          pageSize: 10000,
          schoolOrCollegeId: schoolId
        })
        systemList.value = res.rows || []
        console.log('✅ [onSchoolChange] 系列表加载完成', { count: systemList.value.length })
      } catch (e) {
        console.error('❌ [onSchoolChange] 加载系列表失败', e)
      }
    } else {
      // 无院无系，直接加载专业列表
      console.log('📖 [onSchoolChange] 职教模式，无院无系，直接加载专业列表')
      await loadSpecialities(schoolId, null)
    }
  }
}

// 院变更
async function onCollegeChange(collegeId) {
  console.log('🏛️ [onCollegeChange] 院变更', { collegeId })

  queryParams.value.systemId = null
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []

  if (!collegeId) return

  // 加载该院下的系
  console.log('📋 [onCollegeChange] 加载该院下的系')
  try {
    const res = await listSystem({
      pageNum: 1,
      pageSize: 10000,
      schoolOrCollegeId: collegeId
    })
    systemList.value = res.rows || []
    console.log('✅ [onCollegeChange] 系列表加载完成', { count: systemList.value.length })
  } catch (e) {
    console.error('❌ [onCollegeChange] 加载系列表失败', e)
  }
}

// 系变更
async function onSystemChange(systemId) {
  console.log('🏢 [onSystemChange] 系变更', { systemId, showSystem: showSystem.value })

  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  specialityList.value = []
  gradeList.value = []
  classList.value = []

  if (!systemId) {
    // 无系时，如果学校配置显示系，说明有系但没有选择，不能加载专业
    // 如果学校配置不显示系，说明是无系学校，直接加载无系专业
    if (selectedSchool.value && !showSystem.value) {
      console.log('📖 [onSystemChange] 无系学校，加载无系专业')
      await loadSpecialities(queryParams.value.schoolId, null)
    } else {
      console.log('⏸️ [onSystemChange] 有系学校但未选择系，等待用户选择')
    }
    return
  }

  // 加载该系下的专业
  console.log('📖 [onSystemChange] 加载该系下的专业')
  await loadSpecialities(queryParams.value.schoolId, systemId)
}

// 加载专业列表
async function loadSpecialities(schoolId, systemId) {
  console.log('🔍 [loadSpecialities] 开始加载专业列表', { schoolId, systemId })

  try {
    const params = {
      pageNum: 1,
      pageSize: 10000,
      schoolId: schoolId  // 恢复学校ID过滤，确保只查询当前学校的专业
    }

    if (systemId != null) {
      // 有系：查询该系下的专业
      params.vocalEduSystemId = systemId
      console.log('📋 [loadSpecialities] 查询有系专业', { schoolId, systemId })
    } else {
      // 无系：查询无系的专业
      params.withoutSystem = true
      console.log('📋 [loadSpecialities] 查询无系专业', { schoolId })
    }

    const res = await listSpeciality(params)
    specialityList.value = res.rows || []
    console.log('✅ [loadSpecialities] 专业列表加载完成', { count: specialityList.value.length })
  } catch (e) {
    console.error('❌ [loadSpecialities] 加载专业列表失败', e)
  }
}

// 专业变更
async function onSpecialityChange() {
  const specialityId = queryParams.value.specialityId
  console.log('📖 [onSpecialityChange] 专业变更', {
    specialityId,
    schoolId: queryParams.value.schoolId,
    schoolType: queryParams.value.schoolType
  })

  queryParams.value.gradeId = null
  classList.value = []
  gradeList.value = []

  if (!specialityId) {
    console.log('⏸️ [onSpecialityChange] 未选择专业，跳过年级加载')
    return
  }

  // 职教：选择专业后，加载该专业下的年级
  console.log('📚 [onSpecialityChange] 加载该专业下的年级')
  try {
    const res = await getGrades({
      schoolId: queryParams.value.schoolId,
      schoolType: queryParams.value.schoolType,
      specialityId: specialityId
    })
    gradeList.value = res.data || []
    console.log('✅ [onSpecialityChange] 年级列表加载完成', { count: gradeList.value.length })
  } catch (e) {
    console.error('❌ [onSpecialityChange] 加载年级列表失败', e)
  }
}

// 年级变更
async function onGradeChange(gradeId) {
  console.log('📚 [onGradeChange] 年级变更', {
    gradeId,
    schoolId: queryParams.value.schoolId,
    schoolType: queryParams.value.schoolType,
    specialityId: queryParams.value.specialityId
  })

  classList.value = []

  if (!gradeId) {
    console.log('⏸️ [onGradeChange] 未选择年级，跳过班级加载')
    return
  }

  loading.value = true
  console.log('👥 [onGradeChange] 加载班级列表')
  try {
    const res = await getClasses({
      schoolId: queryParams.value.schoolId,
      gradeId,
      schoolType: queryParams.value.schoolType,
      specialityId: queryParams.value.specialityId
    })
    classList.value = res.data || []
    console.log('✅ [onGradeChange] 班级列表加载完成', { count: classList.value.length })
  } catch (e) {
    console.error('❌ [onGradeChange] 加载班级列表失败', e)
  } finally {
    loading.value = false
  }
}

// 跳转到班级情况详情页
function handleClassDetail(row) {
  console.log('📊 [handleClassDetail] 跳转到班级情况', row)

  // 构建参数：schoolType-schoolId-gradeId-classId-specialityId
  const params = [
    queryParams.value.schoolType || '',
    queryParams.value.schoolId || '',
    queryParams.value.gradeId || '',
    row.classId || '',
    queryParams.value.specialityId || ''
  ].join('-')

  console.log('🔗 [handleClassDetail] 跳转参数:', params)

  router.push({
    path: `/statistics/class-detail/${params}`
  })
}

// 跳转到学生情况详情页
function handleStudentDetail(row) {
  console.log('👥 [handleStudentDetail] 跳转到学生情况', row)

  // 构建参数：schoolType-schoolId-gradeId-classId-specialityId
  const params = [
    queryParams.value.schoolType || '',
    queryParams.value.schoolId || '',
    queryParams.value.gradeId || '',
    row.classId || '',
    queryParams.value.specialityId || ''
  ].join('-')

  console.log('🔗 [handleStudentDetail] 跳转参数:', params)

  router.push({
    path: `/statistics/student-detail/${params}`
  })
}

// 点击卡片
function handleCardClick(cls) {
  // 默认点击卡片打开班级情况
  handleClassDetail(cls)
}
</script>

<style scoped lang="scss">
.class-statistics-page {
  padding: 20px;
}

// 筛选卡片
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

// 统计卡片
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

// 班级列表卡片
.class-list-card {
  border-radius: 8px;
}

.class-list-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.class-list-card :deep(.el-card__body) {
  padding: 20px;
}

// 卡片网格
.class-grid {
  min-height: 200px;
}

.class-grid.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.class-col {
  margin-bottom: 16px;
}

// 班级卡片
.class-card {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.class-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.class-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.class-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.class-card-icon {
  font-size: 24px;
  color: white;
}

.class-info {
  flex: 1;
  min-width: 0;
}

.class-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.class-meta {
  font-size: 12px;
  color: #909399;
}

.class-card-body {
  flex: 1;
}

.class-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  color: #409eff;
  font-size: 16px;
}

.stat-label {
  font-size: 13px;
  color: #606266;
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.class-card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
}

.action-btn :deep(.el-icon) {
  margin-right: 4px;
}

// 响应式
@media (max-width: 768px) {
  .filter-form .el-form-item {
    width: 100%;
    margin-right: 0;
  }

  .filter-form .el-select {
    width: 100% !important;
  }

  .stats-row .el-col {
    margin-bottom: 12px;
  }
}
</style>
