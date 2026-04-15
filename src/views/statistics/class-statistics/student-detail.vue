<template>
  <div class="app-container student-detail-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-header-simple">
      <div class="header-left">
        <span class="page-title">学生情况</span>
        <el-tag v-if="statisticsData" type="info" class="info-tag">
          {{ statisticsData.className }}
        </el-tag>
        <el-tag v-if="statisticsData" type="success" class="info-tag">
          {{ statisticsData.students?.length || 0 }} 人
        </el-tag>
      </div>
      <div class="header-right">
        <el-button type="warning" :icon="Document" @click="loadTestData" aria-label="加载测试数据">测试数据</el-button>
        <el-button type="primary" :icon="Refresh" @click="loadStatistics" aria-label="刷新数据">刷新</el-button>
        <el-button :icon="Close" @click="handleClose" aria-label="关闭页面">关闭</el-button>
      </div>
    </div>

    <!-- ========== 统计条 + 榜单（横向布局）========== -->
    <div class="stats-overview" v-if="statisticsData">
      <!-- 左侧统计指标 -->
      <div class="stats-bar-left">
        <div class="stat-item">
          <div class="stat-icon-mini" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <el-icon :size="16" aria-hidden="true"><User /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value-simple">{{ statisticsData.students?.length || 0 }}</div>
            <div class="stat-label-simple">班级人数</div>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon-mini" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <el-icon :size="16" aria-hidden="true"><CircleCheck /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value-simple">{{ averageCorrectRate }}%</div>
            <div class="stat-label-simple">平均正确率</div>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon-mini" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <el-icon :size="16" aria-hidden="true"><TrendCharts /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value-simple">
              <span>{{ averageMasteryLevel }}</span>
              <span class="stat-value-suffix">({{ averageMasteryScore }}%)</span>
            </div>
            <div class="stat-label-simple">平均掌握度</div>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon-mini" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <el-icon :size="16" aria-hidden="true"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value-simple">{{ completionRate }}%</div>
            <div class="stat-label-simple">完成率</div>
          </div>
        </div>
      </div>

      <!-- 右侧榜单（学生数>5时显示前3名） -->
      <div class="stats-bar-right" v-if="showTopList">
        <!-- 正确率 Top3 -->
        <div class="rank-card">
          <div class="rank-card-header">
            <el-icon class="correct" aria-hidden="true"><Trophy /></el-icon>
            <span>正确率</span>
          </div>
          <div class="rank-card-list">
            <div
              v-for="(student, index) in topCorrectRateStudents.slice(0, 3)"
              :key="'cr-' + student.userId"
              class="rank-card-item"
              @click="goToStudentDetail(student)"
            >
              <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
              <span class="rank-name">{{ student.userName }}</span>
              <span class="rank-value">{{ calculateStudentCorrectRate(student) }}%</span>
            </div>
          </div>
        </div>

        <!-- 掌握度 Top3 -->
        <div class="rank-card">
          <div class="rank-card-header">
            <el-icon class="mastery" aria-hidden="true"><Star /></el-icon>
            <span>掌握度</span>
          </div>
          <div class="rank-card-list">
            <div
              v-for="(student, index) in topMasteryStudents.slice(0, 3)"
              :key="'mr-' + student.userId"
              class="rank-card-item"
              @click="goToStudentDetail(student)"
            >
              <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
              <span class="rank-name">{{ student.userName }}</span>
              <span class="rank-value">{{ getStudentMasteryLevel(student) }}</span>
            </div>
          </div>
        </div>

        <!-- 需关注学生 -->
        <div class="rank-card attention">
          <div class="rank-card-header">
            <el-icon class="attention" aria-hidden="true"><WarningFilled /></el-icon>
            <span>需关注</span>
          </div>
          <div class="rank-card-list">
            <div
              v-for="(student, index) in attentionNeededStudents.slice(0, 3)"
              :key="'ar-' + student.userId"
              class="rank-card-item"
              @click="goToStudentDetail(student)"
            >
              <span class="rank-num rank-attention">!</span>
              <span class="rank-name">{{ student.userName }}</span>
              <span class="rank-value attention-value">{{ getStudentMasteryLevel(student) }}</span>
            </div>
            <div v-if="attentionNeededStudents.length === 0" class="rank-card-empty">暂无</div>
          </div>
        </div>

        <!-- 练习积极 Top3 -->
        <div class="rank-card">
          <div class="rank-card-header">
            <el-icon class="progress" aria-hidden="true"><DataLine /></el-icon>
            <span>练习积极</span>
          </div>
          <div class="rank-card-list">
            <div
              v-for="(student, index) in activePracticeStudents.slice(0, 3)"
              :key="'pr-' + student.userId"
              class="rank-card-item"
              @click="goToStudentDetail(student)"
            >
              <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
              <span class="rank-name">{{ student.userName }}</span>
              <span class="rank-value">{{ getStudentTotalPracticeCount(student) }}次</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 搜索和排序 ========== -->
    <div class="filter-section" v-loading="loading">
      <div class="filter-row">
        <el-input
          v-model="searchText"
          placeholder="搜索学生姓名或学号"
          clearable
          :prefix-icon="Search"
          class="search-input"
          @input="handleSearch"
          aria-label="搜索学生"
        />
        <div class="sort-buttons">
          <span class="sort-label">排序：</span>
          <el-button
            :type="currentSort === 'correctRate' ? 'primary' : 'default'"
            size="small"
            @click="handleSort('correctRate')"
          >
            正确率
            <el-icon v-if="currentSort === 'correctRate'">
              <SortDown v-if="sortOrder === 'desc'" />
              <SortUp v-else />
            </el-icon>
          </el-button>
          <el-button
            :type="currentSort === 'masteryScore' ? 'primary' : 'default'"
            size="small"
            @click="handleSort('masteryScore')"
          >
            掌握度
            <el-icon v-if="currentSort === 'masteryScore'">
              <SortDown v-if="sortOrder === 'desc'" />
              <SortUp v-else />
            </el-icon>
          </el-button>
          <el-button
            :type="currentSort === 'practiceCount' ? 'primary' : 'default'"
            size="small"
            @click="handleSort('practiceCount')"
          >
            练习次数
            <el-icon v-if="currentSort === 'practiceCount'">
              <SortDown v-if="sortOrder === 'desc'" />
              <SortUp v-else />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ========== 学生列表表格 ========== -->
    <div class="table-section" v-loading="loading">
      <div class="table-header">
        <span class="table-title">学生列表</span>
      </div>
      <el-table
        :data="paginatedStudents"
        style="width: 100%"
        stripe
        @row-click="goToStudentDetail"
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="userNo" label="学号" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ formatSex(row.sex) }}
          </template>
        </el-table-column>
        <el-table-column label="实验次数" width="100" align="center">
          <template #default="{ row }">
            {{ getStudentTotalPracticeCount(row) }} 次
          </template>
        </el-table-column>
        <el-table-column label="最近练习" width="100" align="center">
          <template #default="{ row }">
            {{ getStudentLastPracticeTime(row) }}
          </template>
        </el-table-column>
        <el-table-column label="平均正确率" width="100" align="center">
          <template #default="{ row }">
            <span :class="getCorrectRateClass(calculateStudentCorrectRate(row))">
              {{ calculateStudentCorrectRate(row) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="掌握度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getMasteryLevelType(getStudentMasteryLevel(row))" size="small">
              {{ getStudentMasteryLevel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click.stop="goToStudentDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        :total="filteredStudents.length"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        @pagination="handlePagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Pagination from '@/components/Pagination'
import {
  Refresh, Close, Search, User,
  CircleCheck, TrendCharts, DataAnalysis, DataLine,
  Trophy, Star, WarningFilled,
  SortUp, SortDown, Document
} from '@element-plus/icons-vue'
import { getClassStatisticsByFilter } from '@/api/statistics'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

// ========== 响应式数据 ==========
const loading = ref(false)
const statisticsData = ref(null)
const classId = ref(null)
const schoolType = ref(null)
const schoolId = ref(null)
const gradeId = ref(null)
const searchText = ref('')
const currentSort = ref('masteryScore')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(20)
const searchInputRef = ref(null)

// ========== 页面初始化 ==========
onMounted(() => {
  parseParams()
  loadStatistics()
})

// ========== 解析URL参数 ==========
const parseParams = () => {
  const params = route.params.data || ''
  const paramArray = params.split('-')

  // 参数格式：schoolType-schoolId-gradeId-classId
  if (paramArray.length >= 4) {
    schoolType.value = paramArray[0]  // 学校类型
    schoolId.value = paramArray[1]    // 学校ID
    gradeId.value = paramArray[2]     // 年级ID
    classId.value = paramArray[3]    // 班级ID
  }
}

// ========== 加载统计数据 ==========
const loadStatistics = async () => {
  if (!classId.value) {
    proxy.$modal.msgError('班级ID不能为空')
    return
  }

  loading.value = true

  try {
    const queryParams = {
      classId: classId.value,
      schoolType: schoolType.value
    }

    const response = await getClassStatisticsByFilter(queryParams)

    if (response.code === 200) {
      statisticsData.value = response.data
      // 从返回数据中提取学校、年级信息
      if (response.data) {
        schoolId.value = response.data.schoolId
        gradeId.value = response.data.gradeId
        schoolType.value = response.data.schoolType || schoolType.value
      }
    } else {
      proxy.$modal.msgError(response.msg || '获取统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    proxy.$modal.msgError('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ========== 加载测试数据 ==========
const loadTestData = () => {
  const testData = {
    schoolId: 1,
    schoolName: '第一中学',
    gradeId: 1,
    gradeName: '初三',
    classId: 1,
    className: '初三(1)班',
    subjectId: '1',
    subjectName: '化学',
    educationStage: '0',
    students: [
      {
        userId: 1001,
        userName: '张三',
        userNo: '2024001',
        sex: '0',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-08', practiceCount: 28, correctRate: 0.95, masteryLevel: '精通', masteryScore: 98 },
          { experimentId: 2, experimentName: '二氧化碳制备', lastPracticeTime: '2025-04-07', practiceCount: 18, correctRate: 0.80, masteryLevel: '熟练', masteryScore: 82 },
          { experimentId: 3, experimentName: '酸碱中和', lastPracticeTime: '2025-04-06', practiceCount: 12, correctRate: 0.70, masteryLevel: '掌握', masteryScore: 68 }
        ]
      },
      {
        userId: 1002,
        userName: '李四',
        userNo: '2024002',
        sex: '1',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-08', practiceCount: 20, correctRate: 0.85, masteryLevel: '熟练', masteryScore: 85 },
          { experimentId: 2, experimentName: '二氧化碳制备', lastPracticeTime: '2025-04-07', practiceCount: 15, correctRate: 0.75, masteryLevel: '熟练', masteryScore: 78 },
          { experimentId: 4, experimentName: '金属活动性', lastPracticeTime: '2025-04-05', practiceCount: 8, correctRate: 0.60, masteryLevel: '掌握', masteryScore: 62 }
        ]
      },
      {
        userId: 1003,
        userName: '王五',
        userNo: '2024003',
        sex: '0',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-06', practiceCount: 10, correctRate: 0.65, masteryLevel: '掌握', masteryScore: 65 },
          { experimentId: 5, experimentName: '溶液配制', lastPracticeTime: '2025-04-04', practiceCount: 5, correctRate: 0.45, masteryLevel: '基础', masteryScore: 42 }
        ]
      },
      {
        userId: 1004,
        userName: '赵六',
        userNo: '2024004',
        sex: '1',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-08', practiceCount: 30, correctRate: 0.98, masteryLevel: '精通', masteryScore: 99 },
          { experimentId: 2, experimentName: '二氧化碳制备', lastPracticeTime: '2025-04-07', practiceCount: 25, correctRate: 0.92, masteryLevel: '精通', masteryScore: 95 },
          { experimentId: 3, experimentName: '酸碱中和', lastPracticeTime: '2025-04-06', practiceCount: 22, correctRate: 0.88, masteryLevel: '精通', masteryScore: 90 }
        ]
      },
      {
        userId: 1005,
        userName: '钱七',
        userNo: '2024005',
        sex: '0',
        experiments: [
          { experimentId: 4, experimentName: '金属活动性', lastPracticeTime: '2025-04-05', practiceCount: 3, correctRate: 0.35, masteryLevel: '基础', masteryScore: 28 },
          { experimentId: 5, experimentName: '溶液配制', lastPracticeTime: '2025-04-03', practiceCount: 2, correctRate: 0.30, masteryLevel: '基础', masteryScore: 22 }
        ]
      },
      {
        userId: 1006,
        userName: '孙八',
        userNo: '2024006',
        sex: '1',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-08', practiceCount: 15, correctRate: 0.78, masteryLevel: '熟练', masteryScore: 80 },
          { experimentId: 2, experimentName: '二氧化碳制备', lastPracticeTime: '2025-04-06', practiceCount: 10, correctRate: 0.68, masteryLevel: '掌握', masteryScore: 70 }
        ]
      },
      {
        userId: 1007,
        userName: '周九',
        userNo: '2024007',
        sex: '0',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-07', practiceCount: 8, correctRate: 0.55, masteryLevel: '基础', masteryScore: 48 },
          { experimentId: 2, experimentName: '二氧化碳制备', lastPracticeTime: '2025-04-05', practiceCount: 6, correctRate: 0.50, masteryLevel: '基础', masteryScore: 45 }
        ]
      },
      {
        userId: 1008,
        userName: '吴十',
        userNo: '2024008',
        sex: '1',
        experiments: [
          { experimentId: 1, experimentName: '氧气的制备', lastPracticeTime: '2025-04-08', practiceCount: 25, correctRate: 0.90, masteryLevel: '精通', masteryScore: 92 },
          { experimentId: 2, experimentName: '二氧化碳制备', lastPracticeTime: '2025-04-07', practiceCount: 20, correctRate: 0.85, masteryLevel: '熟练', masteryScore: 88 },
          { experimentId: 3, experimentName: '酸碱中和', lastPracticeTime: '2025-04-06', practiceCount: 18, correctRate: 0.82, masteryLevel: '熟练', masteryScore: 84 },
          { experimentId: 4, experimentName: '金属活动性', lastPracticeTime: '2025-04-04', practiceCount: 12, correctRate: 0.75, masteryLevel: '熟练', masteryScore: 76 }
        ]
      }
    ]
  }

  statisticsData.value = testData
  // 从测试数据中提取学校、年级信息
  schoolId.value = testData.schoolId
  gradeId.value = testData.gradeId
  schoolType.value = testData.educationStage || '0'
  proxy.$modal.msgSuccess('测试数据已加载')
}

// ========== 计算统计数据 ==========
const averageCorrectRate = computed(() => {
  if (!statisticsData.value?.students || statisticsData.value.students.length === 0) return 0

  const rates = statisticsData.value.students
    .map(s => calculateStudentCorrectRate(s))
    .filter(r => r > 0)

  if (rates.length === 0) return 0
  return (rates.reduce((sum, r) => sum + r, 0) / rates.length).toFixed(1)
})

const averageMasteryLevel = computed(() => {
  if (!statisticsData.value?.students || statisticsData.value.students.length === 0) return '-'

  const levelMap = { '精通': 4, '熟练': 3, '掌握': 2, '基础': 1 }
  const levels = statisticsData.value.students
    .map(s => levelMap[getStudentMasteryLevel(s)] || 0)
    .filter(l => l > 0)

  if (levels.length === 0) return '-'
  const avg = levels.reduce((sum, l) => sum + l, 0) / levels.length

  if (avg >= 3.5) return '精通'
  if (avg >= 2.5) return '熟练'
  if (avg >= 1.5) return '掌握'
  return '基础'
})

// 计算平均掌握度分数
const averageMasteryScore = computed(() => {
  if (!statisticsData.value?.students || statisticsData.value.students.length === 0) return 0

  const scores = statisticsData.value.students
    .map(s => getStudentMasteryScore(s))
    .filter(s => s > 0)

  if (scores.length === 0) return 0
  return (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(0)
})

const completionRate = computed(() => {
  if (!statisticsData.value?.students || statisticsData.value.students.length === 0) return 0

  const completed = statisticsData.value.students
    .filter(s => s.experiments && s.experiments.length > 0)
    .length

  return ((completed / statisticsData.value.students.length) * 100).toFixed(0)
})

// ========== 筛选和排序后的学生列表 ==========
const filteredStudents = computed(() => {
  if (!statisticsData.value?.students) return []

  let students = [...statisticsData.value.students]

  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    students = students.filter(s =>
      (s.userName && s.userName.toLowerCase().includes(keyword)) ||
      (s.userNo && s.userNo.toLowerCase().includes(keyword))
    )
  }

  // 排序
  students.sort((a, b) => {
    let valA, valB
    switch (currentSort.value) {
      case 'correctRate':
        valA = calculateStudentCorrectRate(a)
        valB = calculateStudentCorrectRate(b)
        break
      case 'masteryScore':
        valA = getStudentMasteryScore(a)
        valB = getStudentMasteryScore(b)
        break
      case 'practiceCount':
        valA = getStudentTotalPracticeCount(a)
        valB = getStudentTotalPracticeCount(b)
        break
      default:
        return 0
    }
    return sortOrder.value === 'desc' ? valB - valA : valA - valB
  })

  return students
})

// ========== 分页后的数据 ==========
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStudents.value.slice(start, end)
})

// ========== Top榜单数据 ==========
const topCorrectRateStudents = computed(() => {
  if (!statisticsData.value?.students) return []

  return [...statisticsData.value.students]
    .sort((a, b) => calculateStudentCorrectRate(b) - calculateStudentCorrectRate(a))
    .slice(0, 5)
})

const topMasteryStudents = computed(() => {
  if (!statisticsData.value?.students) return []

  const levelMap = { '精通': 4, '熟练': 3, '掌握': 2, '基础': 1 }

  return [...statisticsData.value.students]
    .sort((a, b) => {
      const scoreA = getStudentMasteryScore(a) || levelMap[getStudentMasteryLevel(a)] || 0
      const scoreB = getStudentMasteryScore(b) || levelMap[getStudentMasteryLevel(b)] || 0
      return scoreB - scoreA
    })
    .slice(0, 5)
})

const attentionNeededStudents = computed(() => {
  if (!statisticsData.value?.students) return []

  return statisticsData.value.students
    .filter(s => {
      const correctRate = calculateStudentCorrectRate(s)
      const masteryLevel = getStudentMasteryLevel(s)
      return correctRate < 60 || masteryLevel === '基础'
    })
    .slice(0, 5)
})

const activePracticeStudents = computed(() => {
  if (!statisticsData.value?.students) return []

  return [...statisticsData.value.students]
    .sort((a, b) => getStudentTotalPracticeCount(b) - getStudentTotalPracticeCount(a))
    .slice(0, 5)
})

// ========== 学生统计数据缓存（避免重复计算）==========
const studentStatsCache = computed(() => {
  if (!statisticsData.value?.students) return new Map()

  const cache = new Map()
  const levelMap = { '精通': 4, '熟练': 3, '掌握': 2, '基础': 1 }

  statisticsData.value.students.forEach(student => {
    const experiments = student.experiments || []

    // 计算平均正确率
    let correctRate = 0
    if (experiments.length > 0) {
      const totalRate = experiments.reduce((sum, exp) => sum + (exp.correctRate || 0) * 100, 0)
      correctRate = (totalRate / experiments.length).toFixed(1)
    }

    // 计算掌握度等级
    let masteryLevel = '-'
    let masteryScore = 0
    if (experiments.length > 0) {
      const total = experiments.reduce((sum, exp) => sum + (levelMap[exp.masteryLevel] || 0), 0)
      const avg = total / experiments.length
      if (avg >= 3.5) masteryLevel = '精通'
      else if (avg >= 2.5) masteryLevel = '熟练'
      else if (avg >= 1.5) masteryLevel = '掌握'
      else masteryLevel = '基础'

      const totalScore = experiments.reduce((sum, exp) => sum + (exp.masteryScore || 0), 0)
      masteryScore = (totalScore / experiments.length).toFixed(2)
    }

    // 计算练习次数
    const practiceCount = experiments.reduce((sum, exp) => sum + (exp.practiceCount || 0), 0)

    cache.set(student.userId, {
      correctRate: parseFloat(correctRate),
      masteryLevel,
      masteryScore: parseFloat(masteryScore),
      practiceCount
    })
  })

  return cache
})

// 是否显示 Top5 榜单（学生数量大于5人时显示）
const showTopList = computed(() => {
  return statisticsData.value?.students?.length > 5
})

// ========== 从缓存获取学生统计数据 ==========
const getStudentStats = (student) => {
  return studentStatsCache.value.get(student.userId) || {
    correctRate: 0,
    masteryLevel: '-',
    masteryScore: 0,
    practiceCount: 0
  }
}

// ========== 辅助方法（使用缓存）==========
const calculateStudentCorrectRate = (student) => {
  return getStudentStats(student).correctRate
}

const getStudentMasteryLevel = (student) => {
  return getStudentStats(student).masteryLevel
}

const getStudentMasteryScore = (student) => {
  return getStudentStats(student).masteryScore
}

const getStudentTotalPracticeCount = (student) => {
  return getStudentStats(student).practiceCount
}

// 获取学生最近练习时间
const getStudentLastPracticeTime = (student) => {
  const experiments = student.experiments || []
  if (experiments.length === 0) return '-'
  // 找到最近的时间
  const times = experiments
    .map(exp => exp.lastPracticeTime)
    .filter(time => time)
    .sort((a, b) => new Date(b) - new Date(a))
  if (times.length === 0) return '-'
  return formatDate(times[0])
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

// ========== 样式方法 ==========
const getCorrectRateClass = (rate) => {
  if (rate >= 90) return 'correct-excellent'
  if (rate >= 75) return 'correct-good'
  if (rate >= 60) return 'correct-average'
  return 'correct-poor'
}

const getMasteryLevelType = (level) => {
  const typeMap = {
    '精通': 'success',
    '熟练': 'primary',
    '掌握': 'warning',
    '基础': 'info',
    '-': 'info'
  }
  return typeMap[level] || 'info'
}

const formatSex = (sex) => {
  const sexMap = { '0': '男', '1': '女', '2': '未知' }
  return sexMap[sex] || '-'
}

// ========== 事件处理（搜索防抖）==========
let searchTimer = null

const handleSearch = () => {
  // 防抖处理，300ms 后执行
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const handleSort = (sortKey) => {
  if (currentSort.value === sortKey) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    currentSort.value = sortKey
    sortOrder.value = 'desc'
  }
}

const handlePagination = ({ page, limit }) => {
  currentPage.value = page
  pageSize.value = limit
}

// ========== 跳转学生详情 ==========
const goToStudentDetail = (student) => {
  // 参数格式：schoolType-schoolId-gradeId-classId-specialityId-userId-educationStage
  const params = `${schoolType.value || '0'}-${schoolId.value || 1}-${gradeId.value || 1}-${classId.value}-0-${student.userId}-${schoolType.value || '0'}`
  router.push({
    path: `/statistics/student-experiment-detail/${params}`
  })
}

// ========== 关闭页面 ==========
const handleClose = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.student-detail-page {
  padding: 20px;
  min-height: calc(100vh - 84px);
}

// ========== 页面头部（无边框）==========
.page-header-simple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-tag {
  margin-left: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
}

// ========== 统计概览（左侧统计 + 右侧榜单）==========
.stats-overview {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.stats-bar-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.stats-bar-right {
  display: flex;
  gap: 16px;
  padding-left: 24px;
  border-left: 1px solid #e4e7ed;
  margin-left: 24px;
  flex-shrink: 0;
  overflow-x: auto;
}

.rank-card {
  min-width: 120px;
  background: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  flex-shrink: 0;
}

.rank-card-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;

  .el-icon {
    font-size: 12px;

    &.correct { color: #e6a23c; }
    &.mastery { color: #409eff; }
    &.attention { color: #f56c6c; }
    &.progress { color: #67c23a; }
  }
}

.rank-card.attention .rank-card-header {
  border-bottom-color: rgba(245, 108, 108, 0.2);
}

.rank-card-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-card-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;

  &:hover {
    background: #f5f7fa;
  }
}

.rank-num {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;

  &.rank-1 { background: linear-gradient(135deg, #ffd700, #ffb900); }
  &.rank-2 { background: linear-gradient(135deg, #c0c0c0, #a8a8a8); }
  &.rank-3 { background: linear-gradient(135deg, #cd7f32, #b87333); }
  &.rank-attention { background: #f56c6c; }
}

.rank-name {
  flex: 1;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-value {
  color: #909399;
  font-size: 11px;
  flex-shrink: 0;
}

.attention-value {
  color: #f56c6c;
}

.rank-card-empty {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 8px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  flex: 1;
}

.stat-icon-mini {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-text {
  flex: 1;
}

.stat-value-simple {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-value-suffix {
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  margin-left: 4px;
}

.stat-label-simple {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e4e7ed;
  flex-shrink: 0;
}

// ========== 筛选区域 ==========
.filter-section {
  padding: 16px 0;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e4e7ed inset;
}

.sort-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-buttons .el-button {
  height: 32px;
}

.sort-label {
  color: #606266;
  font-size: 14px;
}

// ========== 表格区域 ==========
.table-section {
  background: #fff;
  padding: 0;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #ebeef5;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

// 正确率样式
.correct-excellent { color: #67c23a; font-weight: 600; }
.correct-good { color: #409eff; }
.correct-average { color: #e6a23c; }
.correct-poor { color: #f56c6c; }

// 分页
.pagination-container {
  border-top: 1px solid #ebeef5;
}

// 表格行点击
:deep(.el-table__row) {
  cursor: pointer;
}

// ========== 响应式 ==========
@media (max-width: 1200px) {
  .top-list-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-overview {
    flex-direction: column;
  }

  .stats-bar-left {
    flex-direction: column;
    width: 100%;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .stats-bar-right {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    padding-top: 12px;
    border-top: 1px solid #e4e7ed;
    margin-top: 12px;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .rank-card {
    min-width: 100px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}

// ========== 减少动画偏好 ==========
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}
</style>