<template>
  <div class="app-container operation-statistics-page">
    <!-- 顶部筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="学校类型">
          <el-select
            v-model="queryParams.schoolType"
            placeholder="请选择类型"
            clearable
            style="width: 80px"
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
            style="width: 100px"
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

        <!-- 职教：院选择 -->
        <el-form-item label="院" v-show="showCollege">
          <el-select
            v-model="queryParams.collegeId"
            placeholder="请选择院"
            clearable
            style="width: 150px"
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

        <!-- 职教：系选择 -->
        <el-form-item label="系" v-show="showSystem">
          <el-select
            v-model="queryParams.systemId"
            placeholder="请选择系"
            clearable
            style="width: 150px"
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
            style="width: 180px"
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
            style="width: 100px"
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

        <el-form-item label="班级">
          <el-select
            v-model="queryParams.classId"
            placeholder="请选择班级"
            clearable
            filterable
            style="width: 100px"
            :disabled="!canSelectClass"
            @change="onClassChange"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.classId"
              :label="cls.className"
              :value="cls.classId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="实验内容">
          <el-select
            v-model="queryParams.experimentId"
            placeholder="请选择实验"
            clearable
            filterable
            style="width: 200px"
            :disabled="!queryParams.classId"
          >
            <el-option
              v-for="exp in experimentList"
              :key="exp.id"
              :label="exp.experimentName"
              :value="exp.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学生学习情况主卡片（整合图表） -->
    <el-card class="student-overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Reading /></el-icon>
            <span>学生学习情况</span>
          </div>
          <div class="header-right">
            <el-tag v-if="currentFilterText" type="info">
              {{ currentFilterText }}
            </el-tag>
            <el-button v-if="!isProduction" type="success" :icon="Document" @click="loadTestData">测试数据</el-button>
          </div>
        </div>
      </template>

      <!-- 统计图表区域 -->
      <el-row :gutter="20">
        <el-col :xs="24" :lg="15">
          <div class="chart-section">
            <div class="chart-title">
              <el-icon><DataAnalysis /></el-icon>
              <span>步骤正确率/错误率对比</span>
            </div>
            <div v-loading="chartLoading">
              <div ref="stepChartRef" style="height: 280px;"></div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="9">
          <div class="chart-section">
            <div class="chart-title">
              <el-icon class="correct"><SuccessFilled /></el-icon>
              <span>整体正确率分布</span>
            </div>
            <div v-loading="chartLoading">
              <div ref="pieChartRef" style="height: 280px;"></div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-box">
          <div class="stat-value">{{ statistics.totalStudents }}</div>
          <div class="stat-label">学生总数</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ statistics.totalAttempts }}</div>
          <div class="stat-label">操作次数</div>
        </div>
        <div class="stat-box">
          <div class="stat-value correct">{{ statistics.correctRate }}%</div>
          <div class="stat-label">整体正确率</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ statistics.correctCount }}</div>
          <div class="stat-label">正确次数</div>
        </div>
        <div class="stat-box">
          <div class="stat-value error">{{ statistics.errorCount }}</div>
          <div class="stat-label">错误次数</div>
        </div>
      </div>
    </el-card>

    <!-- 学生列表 -->
    <el-card class="student-list-card" shadow="never">
      <template #header>
        <div class="list-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>学生操作详情</span>
          </div>
        </div>
      </template>

      <div v-loading="tableLoading" class="table-container">
        <el-table
          :data="studentList"
          stripe
          border
          style="width: 100%"
          :max-height="500"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="userName" label="学生姓名" width="100" align="center" />
          <el-table-column prop="userNo" label="学号" width="120" align="center" />
          <el-table-column prop="sex" label="性别" width="60" align="center">
            <template #default="{ row }">
              <el-tag :type="row.sex === '0' ? 'primary' : 'danger'" size="small">
                {{ row.sex === '0' ? '男' : '女' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="gradeName" label="年级" width="100" align="center" />
          <el-table-column prop="className" label="班级" width="120" align="center" />
          <!-- 职教额外显示学院/系/专业 -->
          <el-table-column
            v-if="queryParams.schoolType === '2'"
            prop="collegeName"
            label="学院"
            width="120"
            align="center"
          />
          <el-table-column
            v-if="queryParams.schoolType === '2'"
            prop="systemName"
            label="系"
            width="100"
            align="center"
          />
          <el-table-column
            v-if="queryParams.schoolType === '2'"
            prop="specialityName"
            label="专业"
            width="120"
            align="center"
          />
          <el-table-column prop="experimentName" label="实验名称" min-width="150" align="center" />
          <el-table-column prop="correctRate" label="正确率" width="100" align="center">
            <template #default="{ row }">
              <div class="rate-cell">
                <el-progress
                  :percentage="row.correctRate || 0"
                  :color="getRateColor(row.correctRate)"
                  :stroke-width="8"
                  :show-text="false"
                />
                <span class="rate-text">{{ row.correctRate || 0 }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="completionRate" label="完成度" width="100" align="center">
            <template #default="{ row }">
              <div class="rate-cell">
                <el-progress
                  :percentage="row.completionRate || 0"
                  :color="getCompletionColor(row.completionRate)"
                  :stroke-width="8"
                  :show-text="false"
                />
                <span class="rate-text">{{ row.completionRate || 0 }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="lastOperationTime" label="最后操作时间" width="160" align="center">
            <template #default="{ row }">
              {{ row.lastOperationTime ? formatDate(row.lastOperationTime) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDetail(row)">
                <el-icon><View /></el-icon>
                操作详情
              </el-button>
            
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="studentTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getStudentList"
            @current-change="getStudentList"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Refresh, Reading, School, EditPen,
  DataLine, SuccessFilled, WarningFilled, List, View, DataAnalysis, Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useTeacherInfo } from '@/store/modules/teacherInfo'
import { baseListSchool } from '@/api/glxt/base_school'
import { vocalListSchool } from '@/api/glxt/vocal_school'
import { listCollege } from '@/api/glxt/vocal_college'
import { listSystem } from '@/api/glxt/vocal_system'
import { listSpeciality } from '@/api/glxt/vocal_speciality'
import { getGrades, getClasses, getExperimentList, getContentOperationStatistics, getContentOperationStudents } from '@/api/statistics'

// 教师用户信息
const { isTeacher, schoolType: userSchoolType, schoolId: userSchoolId } = useTeacherInfo()

// 获取 proxy 和 router
const { proxy } = getCurrentInstance()
const router = useRouter()

// 判断是否生产环境（用于控制测试按钮显示）
const isProduction = import.meta.env.PROD

// 加载状态
const loading = ref(false)
const chartLoading = ref(false)
const tableLoading = ref(false)

// 图表实例
const stepChart = ref(null)
const pieChart = ref(null)
const stepChartRef = ref(null)
const pieChartRef = ref(null)

// 选项数据
const schoolList = ref([])
const collegeList = ref([])
const systemList = ref([])
const specialityList = ref([])
const gradeList = ref([])
const classList = ref([])
const experimentList = ref([])

// 查询参数
const queryParams = ref({
  schoolType: null,
  schoolId: null,
  collegeId: null,
  systemId: null,
  specialityId: null,
  gradeId: null,
  classId: null,
  experimentId: null,
  startTime: null,
  endTime: null,
  pageNum: 1,
  pageSize: 10
})

// 日期范围
const dateRange = ref([])

// 统计数据
const statistics = ref({
  totalStudents: 0,
  totalAttempts: 0,
  correctCount: 0,
  errorCount: 0,
  correctRate: 0
})

// 学生列表
const studentList = ref([])
const studentTotal = ref(0)

// 图表数据
const stepChartData = ref([])  // 步骤对比数据（包含正确率和错误率）
const overallRateData = ref([])  // 整体正确率分布（饼图数据）

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

// 是否可以选择系
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
    return queryParams.value.schoolId
  } else {
    return queryParams.value.specialityId
  }
})

// 是否可以选择班级
const canSelectClass = computed(() => {
  return queryParams.value.gradeId
})

// 计算属性
const selectedSchoolName = computed(() => {
  return selectedSchool.value?.schoolName || ''
})

const selectedCollegeName = computed(() => {
  const college = collegeList.value.find(c => c.id === queryParams.value.collegeId)
  return college ? college.collegeName : ''
})

const selectedSystemName = computed(() => {
  const system = systemList.value.find(s => s.id === queryParams.value.systemId)
  return system ? system.systemName : ''
})

const selectedSpecialityName = computed(() => {
  const spec = specialityList.value.find(s => s.id === queryParams.value.specialityId)
  return spec ? spec.specialityName : ''
})

const selectedGradeName = computed(() => {
  const grade = gradeList.value.find(g => g.gradeId === queryParams.value.gradeId)
  return grade?.gradeName || ''
})

const selectedClassName = computed(() => {
  const cls = classList.value.find(c => c.classId === queryParams.value.classId)
  return cls?.className || ''
})

const selectedExperimentName = computed(() => {
  const exp = experimentList.value.find(e => e.id === queryParams.value.experimentId)
  return exp?.experimentName || ''
})

const dateRangeText = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) return ''
  return `${dateRange.value[0]} ~ ${dateRange.value[1]}`
})

const currentFilterText = computed(() => {
  const parts = []
  if (selectedSchoolName.value) parts.push(selectedSchoolName.value)
  if (selectedCollegeName.value) parts.push(selectedCollegeName.value)
  if (selectedSystemName.value) parts.push(selectedSystemName.value)
  if (selectedSpecialityName.value) parts.push(selectedSpecialityName.value)
  if (selectedGradeName.value) parts.push(selectedGradeName.value)
  if (selectedClassName.value) parts.push(selectedClassName.value)
  return parts.join(' / ')
})

// 重置筛选
function resetFilters() {
  queryParams.value = {
    schoolType: null,
    schoolId: null,
    collegeId: null,
    systemId: null,
    specialityId: null,
    gradeId: null,
    classId: null,
    experimentId: null,
    startTime: null,
    endTime: null,
    pageNum: 1,
    pageSize: 10
  }
  dateRange.value = []
  schoolList.value = []
  collegeList.value = []
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []
  experimentList.value = []
  studentList.value = []
  studentTotal.value = 0
  statistics.value = { totalStudents: 0, totalAttempts: 0, correctCount: 0, errorCount: 0, correctRate: 0 }
  stepChartData.value = []
  overallRateData.value = []
  updateCharts()
}

// 学校类型变更
async function onSchoolTypeChange(type) {
  queryParams.value.schoolId = null
  queryParams.value.collegeId = null
  queryParams.value.systemId = null
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  queryParams.value.classId = null
  schoolList.value = []
  collegeList.value = []
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []
  experimentList.value = []

  if (!type) return

  try {
    const res = type === '1'
      ? await baseListSchool({ pageNum: 1, pageSize: 10000 })
      : await vocalListSchool({ pageNum: 1, pageSize: 10000 })
    schoolList.value = res.rows || []
  } catch (e) {
    console.error('加载学校失败', e)
  }
}

// 学校变更
async function onSchoolChange() {
  queryParams.value.collegeId = null
  queryParams.value.systemId = null
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  queryParams.value.classId = null
  collegeList.value = []
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []
  experimentList.value = []

  const school = selectedSchool.value

  // 普教：直接加载年级列表
  if (queryParams.value.schoolType === '1' && school) {
    try {
      const res = await getGrades({ schoolId: school.id, schoolType: '1' })
      gradeList.value = res.data || []
    } catch (e) {
      console.error('加载年级列表失败', e)
    }
    return
  }

  // 职教：根据学校配置加载院或系
  if (school) {
    if (showCollege.value) {
      try {
        const res = await listCollege({ pageNum: 1, pageSize: 10000, vocalEduSchoolId: school.id })
        collegeList.value = res.rows || []
      } catch (e) {
        console.error('加载院列表失败', e)
      }
    } else if (showSystem.value) {
      try {
        const res = await listSystem({ pageNum: 1, pageSize: 10000, schoolOrCollegeId: school.id })
        systemList.value = res.rows || []
      } catch (e) {
        console.error('加载系列表失败', e)
      }
    } else {
      await loadSpecialities(school.id, null)
    }
  }
}

// 院变更
async function onCollegeChange() {
  queryParams.value.systemId = null
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  queryParams.value.classId = null
  systemList.value = []
  specialityList.value = []
  gradeList.value = []
  classList.value = []

  if (!queryParams.value.collegeId) return

  try {
    const res = await listSystem({ pageNum: 1, pageSize: 10000, schoolOrCollegeId: queryParams.value.collegeId })
    systemList.value = res.rows || []
  } catch (e) {
    console.error('加载系列表失败', e)
  }
}

// 系变更
async function onSystemChange() {
  queryParams.value.specialityId = null
  queryParams.value.gradeId = null
  queryParams.value.classId = null
  specialityList.value = []
  gradeList.value = []
  classList.value = []

  if (!queryParams.value.systemId) {
    if (selectedSchool.value && !showSystem.value) {
      await loadSpecialities(queryParams.value.schoolId, null)
    }
    return
  }

  await loadSpecialities(queryParams.value.schoolId, queryParams.value.systemId)
}

// 加载专业列表
async function loadSpecialities(schoolId, systemId) {
  try {
    const params = { pageNum: 1, pageSize: 10000, schoolId }
    if (systemId != null) {
      params.vocalEduSystemId = systemId
    } else {
      params.withoutSystem = true
    }
    const res = await listSpeciality(params)
    specialityList.value = res.rows || []
  } catch (e) {
    console.error('加载专业列表失败', e)
  }
}

// 专业变更
async function onSpecialityChange() {
  queryParams.value.gradeId = null
  queryParams.value.classId = null
  gradeList.value = []
  classList.value = []

  if (!queryParams.value.specialityId) return

  try {
    const res = await getGrades({
      schoolId: queryParams.value.schoolId,
      schoolType: queryParams.value.schoolType,
      specialityId: queryParams.value.specialityId
    })
    gradeList.value = res.data || []
  } catch (e) {
    console.error('加载年级列表失败', e)
  }
}

// 年级变更
async function onGradeChange() {
  queryParams.value.classId = null
  classList.value = []

  if (!queryParams.value.gradeId) return

  loading.value = true
  try {
    const res = await getClasses({
      schoolId: queryParams.value.schoolId,
      gradeId: queryParams.value.gradeId,
      schoolType: queryParams.value.schoolType,
      specialityId: queryParams.value.specialityId
    })
    classList.value = res.data || []
  } catch (e) {
    console.error('加载班级列表失败', e)
  } finally {
    loading.value = false
  }
}

// 班级变更
async function onClassChange() {
  experimentList.value = []
  queryParams.value.experimentId = null
  await loadExperiments()
  await handleSearch()
}

// 加载实验列表
async function loadExperiments() {
  if (!queryParams.value.classId) return

  try {
    const res = await getExperimentList({
      pageNum: 1,
      pageSize: 1000,
      classId: queryParams.value.classId
    })
    experimentList.value = res.rows || []
  } catch (e) {
    console.error('加载实验列表失败', e)
  }
}

// 查询
async function handleSearch() {
  queryParams.value.pageNum = 1
  // 设置时间范围
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.value.startTime = dateRange.value[0]
    queryParams.value.endTime = dateRange.value[1]
  } else {
    queryParams.value.startTime = null
    queryParams.value.endTime = null
  }
  await Promise.all([getStatistics(), getStudentList()])
}

// 获取统计数据
async function getStatistics() {
  chartLoading.value = true
  try {
    const res = await getContentOperationStatistics(queryParams.value)
    const data = res.data || {}

    statistics.value = {
      totalStudents: data.overall?.totalStudents || 0,
      totalAttempts: data.overall?.totalAttempts || 0,
      correctCount: data.overall?.correctCount || 0,
      errorCount: (data.overall?.totalAttempts || 0) - (data.overall?.correctCount || 0),
      correctRate: data.overall?.correctRate || 0
    }

    // 整合步骤数据（正确率 + 错误率）
    const correctData = data.correctTop10 || []
    const errorData = data.errorTop10 || []
    const stepNames = [...new Set([
      ...correctData.map(item => item.stepName),
      ...errorData.map(item => item.stepName)
    ])]

    stepChartData.value = stepNames.map(name => {
      const correctItem = correctData.find(c => c.stepName === name)
      const errorItem = errorData.find(e => e.stepName === name)
      return {
        stepName: name,
        correctRate: correctItem?.rate || 0,
        errorRate: errorItem?.rate || 0
      }
    }).slice(0, 10) // 最多10条

    // 饼图数据：整体正确率分布（使用后端返回的区间分布）
    const distribution = data.correctRateDistribution?.data || []
    overallRateData.value = distribution.map(item => ({
      name: item.name,
      value: item.value
    }))

    chartLoading.value = false
    nextTick(() => {
      updateCharts()
    })
  } catch (e) {
    console.error('获取统计数据失败', e)
    chartLoading.value = false
  }
}

// 获取学生列表
async function getStudentList() {
  tableLoading.value = true
  try {
    const res = await getContentOperationStudents(queryParams.value)
    const data = res.data || {}
    studentList.value = data.rows || []
    studentTotal.value = data.total || 0
    tableLoading.value = false
  } catch (e) {
    console.error('获取学生列表失败', e)
    tableLoading.value = false
  }
}

// 初始化图表
function initCharts() {
  // 确保 DOM 元素存在
  if (!stepChartRef.value || !pieChartRef.value) {
    console.warn('图表容器 DOM 元素未就绪，延迟初始化...')
    setTimeout(() => initCharts(), 100)
    return
  }
  stepChart.value = echarts.init(stepChartRef.value)
  pieChart.value = echarts.init(pieChartRef.value)
  updateCharts()

  window.addEventListener('resize', () => {
    stepChart.value?.resize()
    pieChart.value?.resize()
  })
}

// 更新图表
function updateCharts() {
  // 判断是否有数据
  const hasStepData = stepChartData.value.length > 0
  const hasPieData = overallRateData.value.length > 0

  console.log('updateCharts - stepChart:', stepChart.value, 'pieChart:', pieChart.value)
  console.log('updateCharts - hasStepData:', hasStepData, 'hasPieData:', hasPieData)

  // 分组柱状图：步骤正确率 vs 错误率
  stepChart.value?.setOption({
    backgroundColor: 'transparent',
    notMerge: true,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const correctRate = params[0]?.value || 0
        const errorRate = params[1]?.value || 0
        return `${params[0].name}<br/>正确率: ${correctRate}%<br/>错误率: ${errorRate}%`
      }
    },
    legend: {
      data: ['正确率', '错误率'],
      bottom: 0,
      textStyle: { fontSize: 12 },
      show: hasStepData
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      show: hasStepData,
      axisLabel: { formatter: '{value}%' }
    },
    yAxis: {
      type: 'category',
      data: stepChartData.value.map(item => item.stepName).reverse(),
      inverse: true,
      show: hasStepData
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        data: stepChartData.value.map(item => item.correctRate).reverse(),
        itemStyle: { color: '#67c23a', borderRadius: [0, 4, 4, 0] },
        barWidth: '35%',
        label: { show: true, position: 'right', formatter: '{c}%', color: '#67c23a', fontWeight: 600, fontSize: 11 }
      },
      {
        name: '错误率',
        type: 'bar',
        data: stepChartData.value.map(item => item.errorRate).reverse(),
        itemStyle: { color: '#f56c6c', borderRadius: [0, 4, 4, 0] },
        barWidth: '35%',
        label: { show: true, position: 'right', formatter: '{c}%', color: '#f56c6c', fontWeight: 600, fontSize: 11 }
      }
    ],
    animationDuration: 500
  })

  // 饼图：整体正确率分布
  const pieData = overallRateData.value

  // 正确率区间对应的颜色（从低到高：红->橙->黄->绿）
  const rangeColors = {
    '0-60%': '#f56c6c',    // 红色 - 需加强
    '60-70%': '#e6a23c',   // 橙色 - 待提升
    '70-80%': '#ebb563',   // 黄色 - 一般
    '80-90%': '#85ce61',   // 浅绿 - 良好
    '90-100%': '#67c23a'   // 绿色 - 优秀
  }

  pieChart.value?.setOption({
    backgroundColor: 'transparent',
    notMerge: true,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      show: hasPieData,
      orient: 'horizontal',
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 12 },
      formatter: (name) => {
        const item = pieData.find(d => d.name === name)
        if (item) {
          return `${name} ${item.value}人`
        }
        return name
      }
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          fontSize: 14,
          fontWeight: 600
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 15
        },
        data: pieData.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            // color: rangeColors[item.name] || '#409eff'
            shadowBlur: 0,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }))
      }
    ]
  })
}

function getRateColor(rate) {
  if (rate >= 90) return '#67c23a'
  if (rate >= 70) return '#e6a23c'
  return '#f56c6c'
}

function getCompletionColor(rate) {
  if (rate >= 90) return '#409eff'
  if (rate >= 70) return '#e6a23c'
  return '#f56c6c'
}

// 查看操作详情
function handleDetail(row) {
  // 参数格式：userId-experimentId-studentExperimentId
  const userId = row.userId || '0'
  const experimentId = row.experimentId || '0'
  const studentExperimentId = row.id || row.studentExperimentId || '0'

  const params = `${userId}-${experimentId}-${studentExperimentId}`
  const path = `/statistics/operation-statistics/experiment-detail/${encodeURIComponent(params)}`

  router.push(path)
}

// 测试：查看三级步骤实验详情（使用模拟数据）
function handleTestExperimentDetail(row) {
  // 参数格式：userId-experimentId-studentExperimentId-test
  // 添加 test 标记表示使用模拟数据
  const userId = row.userId || '1'
  const experimentId = row.experimentId || '1'
  const studentExperimentId = 'test'

  const params = `${userId}-${experimentId}-${studentExperimentId}`
  const path = `/statistics/operation-statistics/experiment-detail/${encodeURIComponent(params)}`

  router.push(path)
}

function formatDate(date) {
  if (!date) return '-'
  // 处理 Date 对象
  if (date instanceof Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  // 处理字符串
  return date.substring(0, 19).replace('T', ' ')
}

// 加载测试数据
function loadTestData() {
  // 模拟接口返回的原始数据结构
  const mockApiData = {
    overall: {
      totalStudents: 45,
      totalAttempts: 892,
      correctCount: 756,
      correctRate: 84.8
    },
    correctTop10: [
      { stepName: '步骤1: 检查仪器', count: 45, totalCount: 45, rate: 100.0 },
      { stepName: '步骤2: 组装装置', count: 43, totalCount: 45, rate: 95.56 },
      { stepName: '步骤3: 检查气密性', count: 40, totalCount: 45, rate: 88.89 },
      { stepName: '步骤4: 添加药品', count: 41, totalCount: 45, rate: 91.11 },
      { stepName: '步骤5: 加热反应', count: 37, totalCount: 45, rate: 82.22 },
      { stepName: '步骤6: 收集气体', count: 35, totalCount: 45, rate: 77.78 },
      { stepName: '步骤7: 检验气体', count: 31, totalCount: 45, rate: 68.89 },
      { stepName: '步骤8: 停止加热', count: 33, totalCount: 45, rate: 73.33 },
      { stepName: '步骤9: 整理仪器', count: 25, totalCount: 45, rate: 55.56 },
      { stepName: '步骤10: 填写报告', count: 15, totalCount: 45, rate: 33.33 }
    ],
    errorTop10: [
      { stepName: '步骤10: 填写报告', count: 30, totalCount: 45, rate: 66.67 },
      { stepName: '步骤9: 整理仪器', count: 20, totalCount: 45, rate: 44.44 },
      { stepName: '步骤8: 停止加热', count: 12, totalCount: 45, rate: 26.67 },
      { stepName: '步骤7: 检验气体', count: 14, totalCount: 45, rate: 31.11 },
      { stepName: '步骤6: 收集气体', count: 10, totalCount: 45, rate: 22.22 },
      { stepName: '步骤5: 加热反应', count: 8, totalCount: 45, rate: 17.78 },
      { stepName: '步骤4: 添加药品', count: 4, totalCount: 45, rate: 8.89 },
      { stepName: '步骤3: 检查气密性', count: 5, totalCount: 45, rate: 11.11 },
      { stepName: '步骤2: 组装装置', count: 2, totalCount: 45, rate: 4.44 },
      { stepName: '步骤1: 检查仪器', count: 0, totalCount: 45, rate: 0 }
    ],
    correctRateDistribution: {
      type: 'pie',
      data: [
        { name: '90-100%', value: 12 },
        { name: '80-90%', value: 15 },
        { name: '70-80%', value: 10 },
        { name: '60-70%', value: 5 },
        { name: '0-60%', value: 3 }
      ]
    }
  }

  const data = mockApiData

  // 模拟统计数据
  statistics.value = {
    totalStudents: data.overall?.totalStudents || 0,
    totalAttempts: data.overall?.totalAttempts || 0,
    correctCount: data.overall?.correctCount || 0,
    errorCount: (data.overall?.totalAttempts || 0) - (data.overall?.correctCount || 0),
    correctRate: data.overall?.correctRate || 0
  }

  // 整合步骤数据（正确率 + 错误率）- 与getStatisticsData保持一致
  const correctData = data.correctTop10 || []
  const errorData = data.errorTop10 || []
  const stepNames = [...new Set([
    ...correctData.map(item => item.stepName),
    ...errorData.map(item => item.stepName)
  ])]

  stepChartData.value = stepNames.map(name => {
    const correctItem = correctData.find(c => c.stepName === name)
    const errorItem = errorData.find(e => e.stepName === name)
    return {
      stepName: name,
      correctRate: correctItem?.rate || 0,
      errorRate: errorItem?.rate || 0
    }
  }).slice(0, 10) // 最多10条

  // 饼图数据：整体正确率分布（使用后端返回的区间分布）
  const distribution = data.correctRateDistribution?.data || []
  overallRateData.value = distribution.map(item => ({
    name: item.name,
    value: item.value
  }))

  // 模拟学生列表数据（超过10条用于测试分页）
  const studentNames = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '钱十一', '陈十二', '刘十三', '杨十四', '黄十五', '林十六', '徐十七']
  const experimentNames = ['氧气的制备', '二氧化碳制备', '氢气制备', '酸碱中和', '燃烧条件探究']

  studentList.value = studentNames.map((name, index) => ({
    userId: 1000 + index,
    userName: name,
    userNo: `2024${String(index + 1).padStart(3, '0')}`,
    sex: index % 2 === 0 ? '0' : '1',
    gradeName: '高一',
    className: '高一(1)班',
    experimentName: experimentNames[index % experimentNames.length],
    correctRate: Math.round((70 + Math.random() * 30) * 10) / 10,
    completionRate: Math.round((80 + Math.random() * 20) * 10) / 10,
    lastOperationTime: new Date(2025, 3, 8 - index)
  }))

  studentTotal.value = studentList.value.length

  // 关闭加载状态
  chartLoading.value = false

  nextTick(() => {
    updateCharts()
  })

  proxy.$message.success('测试数据已加载')
}

onMounted(async () => {
  nextTick(() => {
    initCharts()
  })
  // 教师用户自动填充学校类型和学校
  if (isTeacher.value) {
    queryParams.value.schoolType = userSchoolType.value
    await onSchoolTypeChange(userSchoolType.value)
    if (userSchoolId.value) {
      queryParams.value.schoolId = userSchoolId.value
      await onSchoolChange()
    }
  }
})
</script>

<style scoped lang="scss">
.operation-statistics-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.filter-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-form .el-form-item {
  margin-bottom: 12px;
  margin-right: 12px;
}

/* 学生学习情况主卡片 */
.student-overview-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.student-overview-card :deep(.el-card__header) {
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

/* 学生信息区块 */
.student-info-section {
  padding: 16px 0;
}

.info-block {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  border: 1px solid #ebeef5;

  .block-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed #ebeef5;

    .el-icon {
      font-size: 16px;
      color: #409eff;
    }
  }

  .block-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-label {
      font-size: 13px;
      color: #909399;
    }

    .info-value {
      font-size: 13px;
      color: #303133;
      font-weight: 500;

      &.highlight {
        color: #409eff;
        font-weight: 600;
      }

      &.date-value {
        font-size: 12px;
        color: #606266;
      }
    }
  }

  /* 统计区块样式 */
  &.stats-info-block {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .block-header {
      border-bottom-color: rgba(255, 255, 255, 0.2);
      color: white;

      .el-icon {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      text-align: center;
    }

    .stat-item {
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: white;
        line-height: 1.2;

        &.correct {
          color: #a8e6cf;
        }

        &.error {
          color: #ff8b94;
        }
      }

      .stat-text {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 4px;
      }
    }
  }
}

/* 图表区域 */
.chart-row {
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .chart-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;

    .chart-icon {
      font-size: 18px;

      &.correct {
        color: #67c23a;
      }

      &.error {
        color: #f56c6c;
      }
    }
  }

  .chart-container {
    height: 320px;
    padding: 8px 0;
  }

  .chart-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 学生列表 */
.student-list-card {
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .table-container {
    min-height: 200px;
  }

  .rate-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-progress {
      flex: 1;
    }

    .rate-text {
      font-size: 12px;
      font-weight: 600;
      color: #606266;
      min-width: 36px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-form {
    .el-form-item {
      width: 100%;
      margin-right: 0;
    }

    .el-select {
      width: 100% !important;
    }
  }

  .info-block {
    margin-bottom: 12px;
  }

  .stats-info-block {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .stat-item .stat-number {
      font-size: 18px;
    }
  }

  .chart-card .chart-container {
    height: 280px;
  }
}

/* 空状态样式 */
.chart-empty {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
}

.empty-tip {
  padding: 40px 0;
  background: #fafafa;
  border-radius: 8px;
  margin: 16px 0;
}

/* 图表区域样式 */
.chart-section {
  padding: 8px 0;

  .chart-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #409eff;

    .correct {
      color: #67c23a;
    }
  }
}

/* 统计概览区域 */
.stats-overview {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  margin-top: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid #ebeef5;

  .stat-box {
    text-align: center;
    padding: 12px 24px;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;

      &.correct {
        color: #67c23a;
      }

      &.error {
        color: #f56c6c;
      }
    }

    .stat-label {
      font-size: 13px;
      color: #909399;
      margin-top: 6px;
    }
  }
}
</style>