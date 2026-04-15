<template>
  <div class="dashboard-container">
    <!-- 管理员/教师仪表盘 -->
    <div v-if="dashboardType !== 'student'">
      <!-- 顶部欢迎栏 -->
      <div class="welcome-section">
        <div class="welcome-left">
          <img class="welcome-img" :src="headerSvg" alt="" />
          <div class="welcome-text">
            <div class="welcome-title">{{ state.user.userName }}，欢迎回来！</div>
            <div class="welcome-note">今天是 {{ currentDate }}</div>
          </div>
        </div>
        <div class="welcome-right">
          <!-- 超级管理员：普教/职教 Tab + 学校选择 -->
          <template v-if="dashboardType === 'super_admin'">
            <el-segmented v-model="selectedSchoolType" :options="schoolTypeOptions" size="default" @change="handleSchoolTypeChange" />
            <el-select v-model="selectedSchoolId" placeholder="全部学校" clearable @change="handleSchoolChange" size="default" style="width: 200px">
              <el-option v-for="school in filteredSchools" :key="school.id" :label="school.schoolName" :value="school.id" />
            </el-select>
          </template>
          <!-- 教师：班级选择 -->
          <template v-if="dashboardType === 'teacher'">
            <el-select v-model="selectedClassId" placeholder="全部班级" clearable @change="handleClassChange" size="default" style="width: 200px">
              <el-option v-for="cls in teacherClasses" :key="cls.id" :label="cls.className" :value="cls.id" />
            </el-select>
          </template>
          <el-dropdown trigger="click" @command="handleQuickEntry">
            <el-button type="primary" round>
              <el-icon><Plus /></el-icon>快捷入口
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="/glxt/experiment/experiment_list">
                  <el-icon><Notebook /></el-icon>实验管理
                </el-dropdown-item>
                <el-dropdown-item command="/statistics/class-statistics">
                  <el-icon><DataAnalysis /></el-icon>班级统计
                </el-dropdown-item>
                <el-dropdown-item command="/statistics/operation-statistics">
                  <el-icon><TrendCharts /></el-icon>内容统计
                </el-dropdown-item>
                <el-dropdown-item v-if="dashboardType === 'super_admin'" command="/glxt/base_school/base_school" divided>
                  <el-icon><School /></el-icon>普教学校管理
                </el-dropdown-item>
                <el-dropdown-item v-if="dashboardType === 'super_admin'" command="/glxt/vocal_school/vocal_school">
                  <el-icon><OfficeBuilding /></el-icon>职教学校管理
                </el-dropdown-item>
                <el-dropdown-item command="/glxt/device/device" divided>
                  <el-icon><Monitor /></el-icon>设备管理
                </el-dropdown-item>
                <el-dropdown-item command="/glxt/question/question">
                  <el-icon><Document /></el-icon>题库管理
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 指标卡区域 -->
      <div class="stats-grid stats-grid--three">
        <template v-if="overview.viewType === 'platform'">
          <!-- 平台维度：3张卡 -->
          <StatsCard
            title="学校总数"
            :value="overview.baseSchoolCount + overview.vocationalSchoolCount"
            suffix="所"
            icon="School"
            type="primary"
            :extra="`普教 ${overview.baseSchoolCount || 0}所 / 职教 ${overview.vocationalSchoolCount || 0}所`"
          />
          <StatsCard
            title="设备总数"
            :value="overview.baseDeviceCount + overview.vocationalDeviceCount"
            suffix="台"
            icon="Monitor"
            type="info"
            :extra="`普教 ${overview.baseDeviceCount || 0}台 / 职教 ${overview.vocationalDeviceCount || 0}台`"
          />
          <StatsCard
            title="今日活跃"
            :value="overview.todayActiveUsers"
            suffix="人"
            icon="UserFilled"
            type="success"
          />
        </template>
        <template v-else-if="overview.viewType === 'class'">
          <!-- 班级维度：6张卡 -->
          <StatsCard :title="(overview.className || '班级') + '学生'" :value="overview.studentCount" suffix="人" icon="User" type="primary" />
          <StatsCard :title="(overview.className || '班级') + '实验'" :value="overview.experimentCount" suffix="次" icon="Notebook" type="success" />
          <StatsCard title="学科数" :value="overview.subjectCount" suffix="个" icon="Reading" type="warning" />
          <StatsCard title="平均掌握度" :value="formatMastery(overview.avgMastery)" suffix="%" icon="TrendCharts" type="info" />
          <StatsCard title="完成率" :value="formatMastery(overview.completionRate)" suffix="%" icon="CircleCheck" type="success" />
          <StatsCard title="设备总数" :value="overview.deviceCount" suffix="台" icon="Monitor" type="info" />
        </template>
        <template v-else>
          <!-- 学校维度：5张卡 -->
          <StatsCard :title="(overview.schoolName || '学校') + '学生'" :value="overview.studentCount" suffix="人" icon="User" type="primary" />
          <StatsCard :title="(overview.schoolName || '学校') + '实验'" :value="overview.experimentCount" suffix="次" icon="Notebook" type="success" />
          <StatsCard title="学科数" :value="overview.subjectCount" suffix="个" icon="Reading" type="warning" />
          <StatsCard title="平均掌握度" :value="formatMastery(overview.avgMastery)" suffix="%" icon="TrendCharts" type="info" />
          <StatsCard title="设备总数" :value="overview.deviceCount" suffix="台" icon="Monitor" type="info" />
        </template>
      </div>

      <!-- 第一行：登录趋势 + 学校/班级实验对比 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :lg="12">
          <LineChart title="登录趋势（近15天）" :height="320" :option="loginTrendOption" />
        </el-col>
        <el-col :xs="24" :lg="12">
          <BarChart :title="comparisonTitle" :height="320" :option="comparisonOption" />
        </el-col>
      </el-row>

      <!-- 第二行：正确率分布 + 实验提交趋势 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :lg="12">
          <PieChart title="正确率分布" :height="300" :option="distributionOption" />
        </el-col>
        <el-col :xs="24" :lg="12">
          <LineChart title="实验提交趋势" :height="300" :option="trendOption">
            <template #actions>
              <el-radio-group v-model="trendDays" size="small" @change="loadTrendChart">
                <el-radio-button :value="7">近7天</el-radio-button>
                <el-radio-button :value="30">近30天</el-radio-button>
              </el-radio-group>
            </template>
          </LineChart>
        </el-col>
      </el-row>

      <!-- 第三行：最近学习动态 + 正确率排行 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :lg="12">
          <ActivityList
            :list="recentOperations"
            title="最近学习动态"
            :dashboardType="dashboardType"
            :selectedSchoolId="selectedSchoolId"
          />
        </el-col>
        <el-col :xs="24" :lg="12">
          <StudentRanking :list="topStudents" />
        </el-col>
      </el-row>
    </div>

    <!-- 学生仪表盘 -->
    <StudentDashboard v-else :user="state.user" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile } from '@/api/system/user'
import {
  getDashboardSchools,
  getDashboardTeacherClasses,
  getDashboardOverview,
  getDashboardComparisonChart,
  getDashboardDistributionChart,
  getDashboardTrendChart,
  getDashboardTopStudents,
  getDashboardRecentExperimentActivities,
  getDashboardLoginTrend
} from '@/api/dashboard'
import StatsCard from './components/StatsCard.vue'
import BarChart from './components/BarChart.vue'
import PieChart from './components/PieChart.vue'
import LineChart from './components/LineChart.vue'
import ActivityList from './components/ActivityList.vue'
import StudentDashboard from './components/StudentDashboard.vue'
import StudentRanking from './components/StudentRanking.vue'
import headerSvg from '@/assets/dashboard/header-1.svg'
import { Plus, Notebook, DataAnalysis, TrendCharts, School, OfficeBuilding, Monitor, Document } from '@element-plus/icons-vue'

// ==================== 状态 ====================

const router = useRouter()
const state = reactive({ user: {} })
const dashboardType = ref('admin')

// 普教/职教选择（超级管理员）
const selectedSchoolType = ref('1')
const schoolTypeOptions = [
  { label: '普教', value: '1' },
  { label: '职教', value: '2' }
]

// 学校/班级选择
const selectedSchoolId = ref(null)
const selectedClassId = ref(null)
const schools = ref([])
const teacherClasses = ref([])
const trendDays = ref(7)

// 概览数据
const overview = reactive({
  viewType: 'platform',
  schoolName: null,
  className: null,
  baseSchoolCount: 0,
  baseDeviceCount: 0,
  vocationalSchoolCount: 0,
  vocationalDeviceCount: 0,
  todayActiveUsers: 0,
  studentCount: 0,
  experimentCount: 0,
  subjectCount: 0,
  deviceCount: 0,
  avgMastery: 0,
  completionRate: 0
})

// 图表数据
const comparisonOption = ref({})
const distributionOption = ref({})
const trendOption = ref({})
const loginTrendOption = ref({})
const recentOperations = ref([])
const topStudents = ref([])

// ==================== 计算属性 ====================

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })
})

const platformCards = computed(() => {
  if (overview.viewType === 'platform') return 3
  if (overview.viewType === 'class') return 6
  return 5
})

/** 按当前选择的 schoolType 过滤学校列表 */
const filteredSchools = computed(() => {
  if (!selectedSchoolType.value) return schools.value
  return schools.value.filter(s => s.schoolType === selectedSchoolType.value)
})

/** 对比柱状图标题 */
const comparisonTitle = computed(() => {
  if (dashboardType.value === 'teacher') return '各班级实验次数对比'
  if (selectedSchoolId.value) return '各班级实验次数对比'
  return '各学校实验次数对比'
})

/** 加载登录趋势 */
async function loadLoginTrend() {
  try {
    const res = await getDashboardLoginTrend(15)
    const data = res.data || {}
    const colorMap = { '管理员': '#409eff', '教师': '#67c23a', '学生': '#e6a23c' }
    loginTrendOption.value = {
      legend: { top: 0 },
      xAxis: { data: data.categories || [] },
      series: (data.series || []).map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        itemStyle: { color: colorMap[s.name] || '#909399' }
      }))
    }
  } catch (e) {
    console.error('加载登录趋势失败', e)
  }
}

// ==================== 公共参数 ====================

/** 构建所有图表接口的公共参数 */
function buildParams() {
  const params = {}
  if (dashboardType.value === 'super_admin') {
    params.schoolType = selectedSchoolType.value
    if (selectedSchoolId.value) params.schoolId = selectedSchoolId.value
  }
  if (dashboardType.value === 'teacher') {
    // 教师的 schoolType 和 schoolId 由后端自动注入，前端不用传
    if (selectedClassId.value) params.classId = selectedClassId.value
  }
  return params
}

// ==================== 数据加载 ====================

/** 加载总览数据 */
async function loadOverview() {
  try {
    const res = await getDashboardOverview(buildParams())
    const data = res.data || {}
    Object.assign(overview, {
      viewType: 'platform', schoolName: null, className: null,
      baseSchoolCount: 0, baseDeviceCount: 0,
      vocationalSchoolCount: 0, vocationalDeviceCount: 0,
      todayActiveUsers: 0,
      studentCount: 0, experimentCount: 0, subjectCount: 0,
      deviceCount: 0,
      avgMastery: 0, completionRate: 0,
      ...data
    })
  } catch (e) {
    console.error('加载总览数据失败', e)
  }
}

/** 加载对比柱状图 */
async function loadComparisonChart() {
  try {
    const res = await getDashboardComparisonChart(buildParams())
    const data = res.data || {}
    const categories = data.categories || []
    const series = data.series || []
    comparisonOption.value = {
      xAxis: { data: categories },
      series: series.map(s => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]
          }
        }
      }))
    }
  } catch (e) {
    console.error('加载对比柱状图失败', e)
  }
}

/** 加载掌握度分布饼图 */
async function loadDistributionChart() {
  try {
    const res = await getDashboardDistributionChart(buildParams())
    const data = res.data || {}
    const categories = data.categories || []
    const series = data.series || []
    const colorMap = { '优秀(≥90%)': '#67c23a', '良好(70-90%)': '#409eff', '及格(50-70%)': '#e6a23c', '不及格(<50%)': '#f56c6c' }
    distributionOption.value = {
      series: [{
        name: '正确率分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: categories.map((name, i) => ({
          name,
          value: series[0]?.data?.[i] || 0,
          itemStyle: { color: colorMap[name] || '#909399' }
        })),
        label: {
          formatter: '{b}: {c}人 ({d}%)'
        }
      }]
    }
  } catch (e) {
    console.error('加载分布饼图失败', e)
  }
}

/** 加载趋势折线图 */
async function loadTrendChart() {
  try {
    const params = { ...buildParams(), days: trendDays.value }
    const res = await getDashboardTrendChart(params)
    const data = res.data || {}
    trendOption.value = {
      xAxis: { data: data.categories || [] },
      series: (data.series || []).map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        areaStyle: { color: 'rgba(64, 158, 255, 0.1)' },
        itemStyle: { color: '#409eff' }
      }))
    }
  } catch (e) {
    console.error('加载趋势图失败', e)
  }
}

/** 加载最近学习动态（学生实验完成情况） */
async function loadRecentOperations() {
  try {
    const params = { limit: 8 }
    // 管理员选了学校后，可以查看该校的动态；教师自动注入 schoolId
    if (selectedSchoolId.value) params.schoolId = selectedSchoolId.value
    // 选中班级后，只查看该班级的动态
    if (selectedClassId.value) params.classId = selectedClassId.value
    const res = await getDashboardRecentExperimentActivities(params)
    recentOperations.value = (res.data || []).map(item => ({
      ...item,
      createTime: item.operTime
    }))
  } catch (e) {
    console.error('加载最近学习动态失败', e)
  }
}

/** 加载Top学生 */
async function loadTopStudents() {
  try {
    const params = { ...buildParams(), limit: 10 }
    const res = await getDashboardTopStudents(params)
    topStudents.value = (res.data || []).map(item => ({
      ...item,
      // 后端返回 0~1，前端展示为百分比
      correctRate: item.correctRate != null ? Math.round(item.correctRate * 100) : 0
    }))
  } catch (e) {
    console.error('加载Top学生失败', e)
  }
}

/** 加载全部数据 */
function loadAll() {
  loadOverview()
  loadComparisonChart()
  loadDistributionChart()
  loadTrendChart()
  loadRecentOperations()
  loadTopStudents()
  loadLoginTrend()
}

// ==================== 事件处理 ====================

/** 普教/职教切换 */
function handleSchoolTypeChange() {
  selectedSchoolId.value = null
  loadSchoolList()
  loadAll()
}

/** 学校切换 */
function handleSchoolChange() {
  loadAll()
}

/** 班级切换（教师） */
function handleClassChange() {
  loadAll()
}

/** 快捷入口跳转 */
function handleQuickEntry(path) {
  router.push(path)
}

// ==================== 初始化 ====================

/** 加载学校列表（超级管理员） */
async function loadSchoolList() {
  try {
    const res = await getDashboardSchools(selectedSchoolType.value)
    schools.value = res.data || []
  } catch (e) {
    console.error('加载学校列表失败', e)
  }
}

/** 加载教师班级列表 */
async function loadTeacherClassList() {
  try {
    const res = await getDashboardTeacherClasses()
    teacherClasses.value = res.data || []
  } catch (e) {
    console.error('加载班级列表失败', e)
  }
}

/** 判断用户角色 */
function determineDashboardType(user) {
  if (user.userType === '00' || user.roleKey === 'super_admin') return 'super_admin'
  const roleKeys = user.roles?.map(r => r.roleKey) || []
  if (roleKeys.includes('base_school') || roleKeys.includes('vocal_school')) return 'teacher'
  if (user.admin === true || roleKeys.includes('admin')) return 'admin'
  return 'student'
}

/** 掌握度格式化：0~1 转百分比 */
function formatMastery(val) {
  if (val == null) return 0
  return Math.round(val * 100)
}

/** 初始化 */
async function init() {
  try {
    const res = await getUserProfile()
    state.user = res.data || {}
    dashboardType.value = determineDashboardType(state.user)
  } catch (e) {
    console.error('获取用户信息失败', e)
    state.user = { userName: '管理员', roleKey: 'super_admin', roles: ['super_admin'] }
    dashboardType.value = 'super_admin'
  }

  // 根据角色加载不同的初始数据
  if (dashboardType.value === 'super_admin') {
    await loadSchoolList()
  } else if (dashboardType.value === 'teacher') {
    await loadTeacherClassList()
  }

  loadAll()
}

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;

  .welcome-left {
    display: flex;
    align-items: center;
  }

  .welcome-img {
    height: 60px;
    margin-right: 16px;
  }

  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .welcome-note {
    font-size: 14px;
    opacity: 0.9;
  }

  .welcome-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  // 普教/职教 Tab 在横幅内的样式
  :deep(.el-segmented) {
    --el-segmented-bg-color: rgba(255, 255, 255, 0.2);
    --el-segmented-item-selected-color: #667eea;
    --el-segmented-item-selected-bg-color: #fff;
    --el-segmented-item-color: #fff;

    .el-segmented__item-selected {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }

  // 横幅内的下拉框样式
  :deep(.el-select) {
    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .el-input__inner {
      color: #fff;
    }
    .el-input__suffix .el-select__caret {
      color: #fff;
    }
  }
  :deep(.el-select:hover .el-input__wrapper) {
    background: rgba(255, 255, 255, 0.3);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  &--three {
    grid-template-columns: repeat(3, 1fr);
  }

  &--six {
    grid-template-columns: repeat(6, 1fr);
  }
  &--five {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (max-width: 1400px) {
    &.stats-grid--six {
      grid-template-columns: repeat(3, 1fr);
    }
    &.stats-grid--three {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    &.stats-grid--six {
      grid-template-columns: repeat(2, 1fr);
    }
    &.stats-grid--five {
      grid-template-columns: repeat(2, 1fr);
    }
    &.stats-grid--three {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    &.stats-grid--six,
    &.stats-grid--five,
    &.stats-grid--three {
      grid-template-columns: 1fr;
    }
  }
}

.chart-row {
  margin-bottom: 20px;
}
</style>
