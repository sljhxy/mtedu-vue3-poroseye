<template>
  <div class="class-detail-page">
    <!-- ========== 页面头部 ========== -->
    <el-card class="header-card" shadow="never">
      <div class="page-header">
        <div class="header-left">
          <span class="page-title">班级情况</span>
          <div class="class-info-tags" v-if="statisticsData">
            <el-tag size="small" type="info">{{ statisticsData.schoolName || '-' }}</el-tag>
            <el-tag size="small" type="info">{{ statisticsData.gradeName || '-' }}</el-tag>
            <el-tag size="small" type="info">{{ statisticsData.className || '-' }}</el-tag>
            <el-tag size="small">{{ statisticsData.students?.length || 0 }} 人</el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button type="success" :icon="Document" @click="loadTestData" v-if="!isProduction">测试数据</el-button>
          <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
          <el-button :icon="Close" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </el-card>

    <!-- ========== 筛选条件 ========== -->
    <div class="filter-section">
      <el-form :model="filterForm" label-width="80px">
        <el-row :gutter="20" align="bottom">
          <el-col :span="6">
            <el-form-item label="科目">
              <el-select
                v-model="filterForm.subjectId"
                placeholder="请选择科目"
                clearable
                :loading="loadingSubjects"
                @change="handleSubjectChange"
                style="width: 100%"
              >
                <el-option
                  v-for="subject in subjectOptions"
                  :key="subject.value"
                  :label="subject.label"
                  :value="subject.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验内容">
              <el-select
                v-model="filterForm.experimentIds"
                placeholder="请选择实验内容"
                multiple
                clearable
                collapse-tags
                :loading="loadingExperiments"
                :disabled="!filterForm.subjectId"
                style="width: 100%"
              >
                <el-option
                  v-for="exp in experimentOptions"
                  :key="exp.value"
                  :label="exp.label"
                  :value="exp.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label=" ">
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" @click="handleFilter">查询</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- ========== 图表展示 ========== -->
    <el-card class="chart-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">统计分布</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-wrapper">
            <div class="chart-title">正确率分布</div>
            <div ref="correctRateChartRef" style="width: 100%; height: 350px"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-wrapper">
            <div class="chart-title">等级分布</div>
            <div ref="masteryLevelChartRef" style="width: 100%; height: 350px"></div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- ========== 学生列表 ========== -->
    <el-card class="table-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">学生明细数据</span>
          <div class="summary-info">
            <span class="summary-item">班级平均正确率: <strong>{{ calculateAverageCorrect() }}%</strong></span>
            <span class="summary-item">平均掌握度: <strong>{{ calculateAverageMastery() }}</strong></span>
          </div>
        </div>
      </template>
      <el-table
        :data="statisticsData?.students || []"
        style="width: 100%"
        stripe
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="userNo" label="学号" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ formatSex(row.sex) }}
          </template>
        </el-table-column>
        <el-table-column label="实验数量" width="100">
          <template #default="{ row }">
            {{ row.experiments?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="平均正确率" width="120">
          <template #default="{ row }">
            <span :class="getCorrectRateClass(calculateAverageCorrectRate(row))">
              {{ calculateAverageCorrectRate(row) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="掌握度等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getMasteryLevelType(getAverageMasteryLevel(row))">
              {{ getAverageMasteryLevel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button
              plain
              type="success"
              size="small"
              @click="handleViewStudentDetail(row)"
            >
              学生详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="ClassDetail">
import { ref, onMounted, getCurrentInstance, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Refresh, Close, Document } from '@element-plus/icons-vue'
import { getClassStatisticsByFilter, getSubjectList, getExperimentList } from '@/api/statistics'
import * as echarts from 'echarts'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

// ========== 响应式数据 ==========
const loading = ref(false)
const statisticsData = ref(null)

// 判断是否生产环境（用于控制测试按钮显示）
const isProduction = import.meta.env.PROD

// ========== 测试数据加载函数 ==========
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
    educationStage: '初中',
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
      }
    ],
    charts: {
      correctRateDistribution: {
        type: '正确率分布',
        data: [
          { name: '90%以上', value: 8 },
          { name: '75%-90%', value: 12 },
          { name: '60%-75%', value: 10 },
          { name: '60%以下', value: 5 }
        ]
      },
      masteryLevelDistribution: {
        type: '掌握度等级分布',
        data: [
          { name: '精通', value: 10 },
          { name: '熟练', value: 15 },
          { name: '掌握', value: 8 },
          { name: '基础', value: 2 }
        ]
      }
    }
  }

  statisticsData.value = testData
  nextTick(() => {
    renderCharts()
  })
  proxy.$modal.msgSuccess('测试数据已加载')
}

const classId = ref(null)
const schoolType = ref(null)
const schoolId = ref(null)
const gradeId = ref(null)
const specialityId = ref(null)

// 筛选表单
const filterForm = ref({
  subjectId: '',
  experimentIds: [],
  dateRange: []
})

// 选项数据（从后端加载）
const subjectOptions = ref([])
const experimentOptions = ref([])
const loadingSubjects = ref(false)
const loadingExperiments = ref(false)

// 图表引用
const correctRateChartRef = ref(null)
const masteryLevelChartRef = ref(null)
let correctRateChart = null
let masteryLevelChart = null

// ========== 页面初始化 ==========
onMounted(() => {
  parseParams()
  loadStatistics()  // 先加载统计数据获取 educationStage，然后加载科目列表
})

// ========== 监听科目变化，加载实验列表 ==========
watch(() => filterForm.value.subjectId, (newSubjectId) => {
  if (newSubjectId) {
    loadExperiments(newSubjectId)
  } else {
    experimentOptions.value = []
  }
})

// ========== 解析URL参数 ==========
const parseParams = () => {
  const params = route.params.data || ''
  const paramArray = params.split('-')

  // 参数格式：schoolType-schoolId-gradeId-classId-specialityId
  if (paramArray.length >= 5) {
    schoolType.value = paramArray[0]   // 学校类型：1=普教，2=职教
    schoolId.value = paramArray[1]     // 学校ID
    gradeId.value = paramArray[2]       // 年级ID
    classId.value = paramArray[3]      // 班级ID
    specialityId.value = paramArray[4] // 专业ID（职教用）
    console.log('📋 班级详情页参数:', {
      schoolType: schoolType.value,
      schoolId: schoolId.value,
      gradeId: gradeId.value,
      classId: classId.value,
      specialityId: specialityId.value
    })
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
    // 构建查询参数
    const queryParams = {
      classId: classId.value,
      schoolType: schoolType.value,  // 添加学校类型参数
      subjectId: filterForm.value.subjectId || undefined,
      experimentIds: filterForm.value.experimentIds.length > 0 ? filterForm.value.experimentIds : undefined,
      startTime: filterForm.value.dateRange?.[0] || undefined,
      endTime: filterForm.value.dateRange?.[1] || undefined
    }

    console.log('🔍 查询参数:', queryParams)

    // 调用筛选统计接口
    const response = await getClassStatisticsByFilter(queryParams)

    if (response.code === 200) {
      statisticsData.value = response.data
      console.log('📊 统计数据:', response.data)

      // 加载科目列表（需要 educationStage）
      await loadSubjects()

      // 渲染图表
      await nextTick()
      renderCharts()
    } else {
      proxy.$modal.msgError(response.msg || '获取统计数据失败')
    }
  } catch (error) {
    console.error('❌ 加载统计数据失败:', error)
    proxy.$modal.msgError('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ========== 获取学段信息 ==========
const getEducationStage = () => {
  return statisticsData.value?.educationStage || null
}

// ========== 渲染图表 ==========
const renderCharts = () => {
  if (!statisticsData.value?.charts) return

  const { charts } = statisticsData.value

  // 渲染正确率分布图
  if (correctRateChartRef.value && charts.correctRateDistribution) {
    if (!correctRateChart) {
      correctRateChart = echarts.init(correctRateChartRef.value)
    }
    const chartData = charts.correctRateDistribution.data?.map(item => ({
      name: item.name,
      value: item.value
    })) || []

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    correctRateChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)'
      },
      legend: {
        show: true,
        orient: 'horizontal',
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 12
        },
        formatter: function(name) {
          const item = chartData.find(d => d.name === name)
          if (item) {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
            // return `${name} ${item.value}人 ${percent}%`
            return `${item.value}人`
          }
          return name
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true
          },
          data: chartData
        }
      ]
    })
  }

  // 渲染等级分布图
  if (masteryLevelChartRef.value && charts.masteryLevelDistribution) {
    if (!masteryLevelChart) {
      masteryLevelChart = echarts.init(masteryLevelChartRef.value)
    }
    const chartData = charts.masteryLevelDistribution.data?.map(item => ({
      name: item.name,
      value: item.value
    })) || []

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    masteryLevelChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)'
      },
      legend: {
        show: true,
        orient: 'horizontal',
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 12
        },
        formatter: function(name) {
          const item = chartData.find(d => d.name === name)
          if (item) {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
            return `${item.value}人`
          }
          return name
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true
          },
          data: chartData
        }
      ]
    })
  }
}

// ========== 计算班级平均正确率 ==========
const calculateAverageCorrect = () => {
  if (!statisticsData.value?.students || statisticsData.value.students.length === 0) return 0

  const studentRates = statisticsData.value.students.map(student => {
    if (!student.experiments || student.experiments.length === 0) return 0
    const total = student.experiments.reduce((sum, exp) => sum + (exp.correctRate || 0) * 100, 0)
    return total / student.experiments.length
  }).filter(rate => rate > 0)

  if (studentRates.length === 0) return 0
  return (studentRates.reduce((sum, rate) => sum + rate, 0) / studentRates.length).toFixed(1)
}

// ========== 计算班级平均掌握度 ==========
const calculateAverageMastery = () => {
  if (!statisticsData.value?.students || statisticsData.value.students.length === 0) return '-'

  const levelMap = { '精通': 4, '熟练': 3, '掌握': 2, '基础': 1 }
  const studentLevels = statisticsData.value.students.map(student => {
    if (!student.experiments || student.experiments.length === 0) return 0
    const total = student.experiments.reduce((sum, exp) => sum + (levelMap[exp.masteryLevel] || 0), 0)
    return total / student.experiments.length
  }).filter(avg => avg > 0)

  if (studentLevels.length === 0) return '-'
  const avg = studentLevels.reduce((sum, level) => sum + level, 0) / studentLevels.length

  if (avg >= 3.5) return '精通'
  if (avg >= 2.5) return '熟练'
  if (avg >= 1.5) return '掌握'
  return '基础'
}

// ========== 计算学生平均正确率 ==========
const calculateAverageCorrectRate = (student) => {
  if (!student.experiments || student.experiments.length === 0) return 0

  const total = student.experiments.reduce((sum, exp) => {
    return sum + (exp.correctRate || 0) * 100
  }, 0)

  return (total / student.experiments.length).toFixed(1)
}

// ========== 获取平均掌握度等级 ==========
const getAverageMasteryLevel = (student) => {
  if (!student.experiments || student.experiments.length === 0) return '-'

  const levelMap = { '精通': 4, '熟练': 3, '掌握': 2, '基础': 1 }
  const total = student.experiments.reduce((sum, exp) => {
    return sum + (levelMap[exp.masteryLevel] || 0)
  }, 0)

  const avg = total / student.experiments.length

  if (avg >= 3.5) return '精通'
  if (avg >= 2.5) return '熟练'
  if (avg >= 1.5) return '掌握'
  return '基础'
}

// ========== 获取正确率样式类 ==========
const getCorrectRateClass = (rate) => {
  if (rate >= 90) return 'correct-excellent'
  if (rate >= 75) return 'correct-good'
  if (rate >= 60) return 'correct-average'
  return 'correct-poor'
}

// ========== 获取掌握度等级标签类型 ==========
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

// ========== 格式化性别显示 ==========
const formatSex = (sex) => {
  const sexMap = {
    '0': '男',
    '1': '女',
    '2': '未知'
  }
  return sexMap[sex] || '-'
}

// ========== 查看学生学习情况 ==========
const handleViewStudentDetail = (student) => {
  // 参数格式：schoolType-schoolId-gradeId-classId-specialityId-userId-educationStage
  const params = [
    schoolType.value || '',
    schoolId.value || '',
    gradeId.value || '',
    classId.value || '',
    specialityId.value || '',
    student.userId || '',
    getEducationStage() || ''  // 学段信息
  ].join('-')

  console.log('🔗 [handleViewStudentDetail] 跳转参数:', params)

  router.push({
    path: `/statistics/student-experiment-detail/${params}`
  })
}

// ========== 科目变化处理 ==========
const handleSubjectChange = () => {
  // 清空已选择的实验
  filterForm.value.experimentIds = []
}

// ========== 查询按钮点击 ==========
const handleFilter = () => {
  loadStatistics()
}

// ========== 重置按钮点击 ==========
const handleReset = () => {
  filterForm.value = {
    subjectId: '',
    experimentIds: [],
    dateRange: []
  }
  loadStatistics()
}

// ========== 加载科目列表 ==========
const loadSubjects = async () => {
  loadingSubjects.value = true
  try {
    const educationStage = getEducationStage()
    const params = {
      schoolType: schoolType.value,
      educationStageType: educationStage
    }
    console.log('📚 加载科目参数:', params)

    const response = await getSubjectList(params)
    if (response.code === 200) {
      // 转换为下拉选项格式，使用 subjectName 作为显示文本
      subjectOptions.value = (response.rows || []).map(item => ({
        label: item.subjectName || item.subjectType,  // 优先使用 subjectName
        value: item.id
      }))
      console.log('✅ 科目列表加载完成:', subjectOptions.value)
    }
  } catch (error) {
    console.error('❌ 加载科目列表失败:', error)
    proxy.$modal.msgError('加载科目列表失败')
  } finally {
    loadingSubjects.value = false
  }
}

// ========== 加载实验列表 ==========
const loadExperiments = async (subjectId) => {
  loadingExperiments.value = true
  try {
    const educationStage = getEducationStage()
    const params = {
      schoolType: schoolType.value,
      academicStageType: educationStage,
      pageNum: 1,
      pageSize: 1000
    }
    console.log('🔬 加载实验参数:', params)

    const response = await getExperimentList(params)
    if (response.code === 200) {
      // 转换为下拉选项格式
      experimentOptions.value = (response.rows || []).map(item => ({
        label: item.experimentName,
        value: item.id
      }))
      console.log('✅ 实验列表加载完成:', experimentOptions.value)
    }
  } catch (error) {
    console.error('❌ 加载实验列表失败:', error)
    proxy.$modal.msgError('加载实验列表失败')
  } finally {
    loadingExperiments.value = false
  }
}

// ========== 刷新按钮点击 ==========
const handleRefresh = () => {
  loadStatistics()
}

// ========== 关闭页面返回 ==========
const handleClose = () => {
  router.back()
}

// ========== 组件销毁时清理图表 ==========
onBeforeUnmount(() => {
  if (correctRateChart) {
    correctRateChart.dispose()
    correctRateChart = null
  }
  if (masteryLevelChart) {
    masteryLevelChart.dispose()
    masteryLevelChart = null
  }
})
</script>

<style scoped lang="scss">
.class-detail-page {
  padding: 20px;
}

.header-card,
.chart-card,
.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.class-info-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 8px;
}

// 筛选区域（去掉卡片包装）
.filter-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.summary-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #606266;

  .summary-item {
    strong {
      color: #303133;
      margin-left: 4px;
    }
  }
}

.chart-wrapper {
  .chart-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    text-align: center;
  }
}

// 正确率样式
.correct-excellent { color: #67c23a; font-weight: 600; }
.correct-good { color: #409eff; }
.correct-average { color: #e6a23c; }
.correct-poor { color: #f56c6c; }

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
  }

  .class-info-tags {
    flex-wrap: wrap;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
