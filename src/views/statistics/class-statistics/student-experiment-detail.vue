<template>
  <div class="app-container student-experiment-detail-page">
    <!-- ========== 主信息卡片（标题+学生信息+按钮同一行） ========== -->
    <el-card class="main-info-card" shadow="never">
      <div class="main-info-row" v-if="studentInfo">
        <!-- 左侧：标题 + 学生信息 -->
        <div class="main-info-left">
          <div class="title-section">
            <el-icon class="header-icon"><School /></el-icon>
            <span class="page-title">学生学习情况</span>
          </div>

          <div class="student-info-inline">
            <span class="info-tag">
              <el-icon><User /></el-icon>
              {{ studentInfo.userName || '-' }}
            </span>
            <span class="info-divider">|</span>
            <span class="info-tag">
              <el-icon><Ticket /></el-icon>
              学号: {{ studentInfo.userNo || '-' }}
            </span>
            <span class="info-divider">|</span>
            <span class="info-tag">
              <el-icon><Avatar /></el-icon>
              {{ studentInfo.sex || '-' }}
            </span>
            <span class="info-divider">|</span>
            <span class="info-tag highlight">
              <el-icon><Collection /></el-icon>
              实验: {{ experimentList.length }}个
            </span>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="header-right">
          <el-button type="success" :icon="Document" @click="loadTestData" v-if="!isProduction">测试数据</el-button>
          <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
          <el-button :icon="Close" @click="handleClose">关闭</el-button>
        </div>
      </div>

      <!-- 无数据时 -->
      <div class="main-info-row" v-else>
        <div class="main-info-left">
          <el-icon class="header-icon"><School /></el-icon>
          <span class="page-title">学生学习情况</span>
        </div>
        <div class="header-right">
          <el-button :icon="Close" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </el-card>

    <!-- ========== 筛选条件 ========== -->
    <el-card class="filter-card" shadow="never">
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
    </el-card>

    <!-- ========== 统计概览卡片 ========== -->
    <div class="statistics-cards" v-if="experimentList.length > 0">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #409eff, #66b1ff)">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.avgCorrectRate.toFixed(1) }}%</div>
                <div class="stat-label">平均正确率</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #67c23a, #85ce61)">
                <el-icon><Coin /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.avgMasteryScore.toFixed(1) }}</div>
                <div class="stat-label">平均掌握度</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #e6a23c, #ebb563)">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.totalPracticeCount }}</div>
                <div class="stat-label">总练习次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #909399, #b1b3b8)">
                <el-icon><Collection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.experimentCount }}</div>
                <div class="stat-label">实验数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <!-- 掌握度等级分布 -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="24">
          <el-card class="level-distribution-card" shadow="hover">
            <div class="level-title">掌握度等级分布</div>
            <div class="level-tags">
              <el-tag type="success" size="large">
                精通 {{ statisticsData.masteryLevelCounts['精通'] }} 个
              </el-tag>
              <el-tag type="primary" size="large">
                熟练 {{ statisticsData.masteryLevelCounts['熟练'] }} 个
              </el-tag>
              <el-tag type="warning" size="large">
                掌握 {{ statisticsData.masteryLevelCounts['掌握'] }} 个
              </el-tag>
              <el-tag type="info" size="large">
                基础 {{ statisticsData.masteryLevelCounts['基础'] }} 个
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- ========== 数据展示Tab区域 ========== -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" class="data-tabs" @tab-change="handleTabChange">
        <!-- ========== Tab 1: 正确率 ========== -->
        <el-tab-pane label="正确率" name="correctRate">
          <div class="tab-content">
            <!-- 空数据提示 -->
            <el-empty v-if="experimentList.length === 0 && !loading" description="暂无实验数据" :image-size="120" />
            <template v-else>
              <div class="chart-wrapper">
                <div class="chart-title">各实验正确率统计</div>
                <div ref="correctRateChartRef" class="chart" style="width: 100%; height: 400px"></div>
              </div>
              <el-divider />
              <div class="table-wrapper">
                <div class="section-title">详细数据</div>
                <el-table :data="experimentList" style="width: 100%" v-loading="loading">
                  <el-table-column type="index" label="序号" width="60" />
                  <el-table-column prop="experimentName" label="实验名称" />
                  <el-table-column label="正确率" width="150">
                    <template #default="{ row }">
                      <el-progress
                        :percentage="Math.round((row.correctRate || 0) * 100)"
                        :color="getProgressColor((row.correctRate || 0) * 100)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="最后练习时间" width="180">
                    <template #default="{ row }">
                      {{ formatDate(row.lastPracticeTime) }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </div>
        </el-tab-pane>

        <!-- ========== Tab 2: 掌握度 ========== -->
        <el-tab-pane label="掌握度" name="mastery">
          <div class="tab-content">
            <!-- 空数据提示 -->
            <el-empty v-if="experimentList.length === 0 && !loading" description="暂无实验数据" :image-size="120" />
            <template v-else>
              <!-- 饼图：掌握度等级分布 -->
              <div class="chart-row">
                <el-card class="pie-chart-card" shadow="hover">
                  <div class="chart-title">掌握度等级分布</div>
                  <div ref="masteryScoreChartRef" class="chart" style="width: 100%; height: 350px"></div>
                </el-card>
              </div>
              <el-divider />
              <div class="table-wrapper">
                <div class="section-title">详细数据</div>
                <el-table :data="experimentList" style="width: 100%" v-loading="loading">
                  <el-table-column type="index" label="序号" width="60" />
                  <el-table-column prop="experimentName" label="实验名称" />
                  <el-table-column label="掌握度分数" width="150">
                    <template #default="{ row }">
                      <span :style="{ color: getMasteryScoreColor(row.masteryScore) }">
                        {{ row.masteryScore?.toFixed(1) || 0 }} 分
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="掌握度等级" width="120">
                    <template #default="{ row }">
                      <el-tag :type="getMasteryLevelType(row.masteryLevel)">
                        {{ row.masteryLevel || '-' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="练习次数" width="100">
                    <template #default="{ row }">
                      {{ row.practiceCount || 0 }} 次
                    </template>
                  </el-table-column>
                  <el-table-column label="最后练习时间" width="180">
                    <template #default="{ row }">
                      {{ formatDate(row.lastPracticeTime) }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </div>
        </el-tab-pane>

        <!-- ========== Tab 3: 知识点 ========== -->
        <el-tab-pane label="知识点" name="knowledgePoints">
          <div class="tab-content">
            <!-- 空数据提示 -->
            <el-empty v-if="experimentList.length === 0 && !loading" description="暂无知识点数据" :image-size="120" />
            <template v-else>
              <!-- 雷达图：知识点掌握度概览 -->
              <div class="chart-row">
                <el-card class="radar-chart-card" shadow="hover">
                  <div class="chart-title">
                    知识点掌握度雷达图
                    <span class="chart-subtitle">（显示掌握度最高的8个知识点）</span>
                  </div>
                  <div ref="knowledgeChartRef" class="chart" style="width: 100%; height: 400px"></div>
                  <!-- 知识点掌握度统计摘要 -->
                  <div class="knowledge-summary" v-if="knowledgePointsSummary.highest.length > 0">
                    <div class="summary-item">
                      <span class="summary-label">掌握最好的知识点：</span>
                      <span class="summary-tags">
                        <el-tag v-for="kp in knowledgePointsSummary.highest" :key="kp.name" type="success" size="small" class="summary-tag">
                          {{ kp.name }}({{ kp.value }}%)
                        </el-tag>
                      </span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">需要加强的知识点：</span>
                      <span class="summary-tags">
                        <el-tag v-for="kp in knowledgePointsSummary.lowest" :key="kp.name" type="danger" size="small" class="summary-tag">
                          {{ kp.name }}({{ kp.value }}%)
                        </el-tag>
                      </span>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-divider />
              <!-- 详细知识点列表 -->
              <div class="knowledge-wrapper">
              <el-collapse v-model="activeCollapses" accordion>
                <el-collapse-item
                  v-for="(exp, index) in experimentList"
                  :key="exp.experimentId"
                  :name="index"
                >
                  <template #title>
                    <div class="collapse-title">
                      <span class="experiment-name">{{ exp.experimentName }}</span>
                      <el-tag size="small" type="info">
                        {{ exp.knowledgePoints?.length || 0 }} 个知识点
                      </el-tag>
                    </div>
                  </template>
                  <div class="knowledge-content">
                    <el-table
                      :data="exp.knowledgePoints || []"
                      style="width: 100%"
                      :show-header="true"
                    >
                      <el-table-column type="index" label="序号" width="60" />
                      <el-table-column prop="knowledgeName" label="知识点名称" />
                      <el-table-column label="占比" width="120">
                        <template #default="{ row }">
                          {{ ((row.ratio || 0) * 100).toFixed(1) }}%
                        </template>
                      </el-table-column>
                      <el-table-column label="掌握度分数" width="150">
                        <template #default="{ row }">
                          <span :style="{ color: getMasteryScoreColor(row.masteryScore) }">
                            {{ row.masteryScore?.toFixed(1) || 0 }} 分
                          </span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
            </template>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="StudentExperimentDetail">
import { ref, onMounted, getCurrentInstance, nextTick, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Refresh, Close, School, User, Ticket, Avatar, Collection, TrendCharts, Coin, Timer, Document } from '@element-plus/icons-vue'
import { getStudentExperiments, getSubjectList, getExperimentList } from '@/api/statistics'
import * as echarts from 'echarts'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

// ========== URL参数 ==========
const schoolType = ref(null)
const schoolId = ref(null)
const gradeId = ref(null)
const classId = ref(null)
const specialityId = ref(null)
const userId = ref(null)
const educationStage = ref(null)  // 学段信息（从URL参数获取）

// ========== 响应式数据 ==========
const loading = ref(false)
const studentInfo = ref(null)
const experimentList = ref([])

// 判断是否生产环境（用于控制测试按钮显示）
const isProduction = import.meta.env.PROD

// ========== 测试数据加载函数 ==========
const loadTestData = () => {
  // 设置学生基本信息
  studentInfo.value = {
    userId: 1001,
    userName: '张三',
    userNo: '2024001001',
    sex: '0'
  }

  // 设置实验列表（详细测试数据）
  // 知识点分数差异大：15-98分
  experimentList.value = [
    {
      experimentId: 1,
      experimentName: '氧气的制备与性质',
      correctRate: 0.95,
      masteryScore: 98,
      masteryLevel: '精通',
      practiceCount: 35,
      lastPracticeTime: '2025-04-08 14:30:00',
      knowledgePoints: [
        { knowledgeName: '燃烧条件', ratio: 0.25, masteryScore: 98 },   // 高
        { knowledgeName: '氧化反应', ratio: 0.20, masteryScore: 92 },  // 高
        { knowledgeName: '催化剂', ratio: 0.15, masteryScore: 85 },     // 中高
        { knowledgeName: '分解反应', ratio: 0.20, masteryScore: 95 }    // 高
      ]
    },
    {
      experimentId: 2,
      experimentName: '二氧化碳的制备',
      correctRate: 0.80,
      masteryScore: 75,
      masteryLevel: '熟练',
      practiceCount: 20,
      lastPracticeTime: '2025-04-07 10:15:00',
      knowledgePoints: [
        { knowledgeName: '酸碱反应', ratio: 0.30, masteryScore: 72 },    // 中
        { knowledgeName: '气体制备', ratio: 0.25, masteryScore: 68 },    // 中
        { knowledgeName: '燃烧条件', ratio: 0.15, masteryScore: 45 }    // 低（和实验1的平均：(98+45)/2=71.5）
      ]
    },
    {
      experimentId: 3,
      experimentName: '酸碱中和反应',
      correctRate: 0.70,
      masteryScore: 65,
      masteryLevel: '掌握',
      practiceCount: 12,
      lastPracticeTime: '2025-04-06 16:45:00',
      knowledgePoints: [
        { knowledgeName: '酸碱指示剂', ratio: 0.20, masteryScore: 58 },  // 中低
        { knowledgeName: '中和反应', ratio: 0.30, masteryScore: 42 },   // 低
        { knowledgeName: '盐的性质', ratio: 0.20, masteryScore: 35 }    // 低
      ]
    },
    {
      experimentId: 4,
      experimentName: '金属活动性顺序',
      correctRate: 0.55,
      masteryScore: 48,
      masteryLevel: '基础',
      practiceCount: 6,
      lastPracticeTime: '2025-04-05 09:20:00',
      knowledgePoints: [
        { knowledgeName: '金属性质', ratio: 0.35, masteryScore: 55 },     // 中低
        { knowledgeName: '置换反应', ratio: 0.30, masteryScore: 28 },   // 很低
        { knowledgeName: '氧化还原', ratio: 0.15, masteryScore: 22 }   // 很低
      ]
    },
    {
      experimentId: 5,
      experimentName: '溶液配制',
      correctRate: 0.40,
      masteryScore: 32,
      masteryLevel: '基础',
      practiceCount: 3,
      lastPracticeTime: '2025-04-04 11:30:00',
      knowledgePoints: [
        { knowledgeName: '溶解度', ratio: 0.25, masteryScore: 38 },      // 低
        { knowledgeName: '浓度计算', ratio: 0.30, masteryScore: 15 },   // 很低
        { knowledgeName: '溶液混合', ratio: 0.15, masteryScore: 20 }    // 很低
      ]
    },
    {
      experimentId: 6,
      experimentName: '常见离子检验',
      correctRate: 0.35,
      masteryScore: 25,
      masteryLevel: '基础',
      practiceCount: 2,
      lastPracticeTime: '2025-04-03 14:10:00',
      knowledgePoints: [
        { knowledgeName: '离子鉴定', ratio: 0.40, masteryScore: 28 },     // 很低
        { knowledgeName: '特征反应', ratio: 0.30, masteryScore: 18 }    // 很低
      ]
    }
  ]

  // 渲染图表
  nextTick(() => {
    renderCharts()
  })

  proxy.$modal.msgSuccess('测试数据已加载')
}

// ========== 计算统计数据 ==========
const statisticsData = computed(() => {
  const list = experimentList.value
  if (list.length === 0) {
    return {
      avgCorrectRate: 0,
      avgMasteryScore: 0,
      totalPracticeCount: 0,
      experimentCount: 0,
      masteryLevelCounts: { '精通': 0, '熟练': 0, '掌握': 0, '基础': 0 }
    }
  }

  const totalCorrectRate = list.reduce((sum, exp) => sum + (exp.correctRate || 0), 0)
  const totalMasteryScore = list.reduce((sum, exp) => sum + (exp.masteryScore || 0), 0)
  const totalPracticeCount = list.reduce((sum, exp) => sum + (exp.practiceCount || 0), 0)

  // 统计掌握度等级分布
  const masteryLevelCounts = { '精通': 0, '熟练': 0, '掌握': 0, '基础': 0 }
  list.forEach(exp => {
    const level = exp.masteryLevel
    if (masteryLevelCounts.hasOwnProperty(level)) {
      masteryLevelCounts[level]++
    }
  })

  return {
    avgCorrectRate: (totalCorrectRate / list.length) * 100,
    avgMasteryScore: totalMasteryScore / list.length,
    totalPracticeCount,
    experimentCount: list.length,
    masteryLevelCounts
  }
})

// ========== 计算知识点统计 ==========
const knowledgePointsSummary = computed(() => {
  const list = experimentList.value
  if (list.length === 0) {
    return { highest: [], lowest: [] }
  }

  // 收集所有知识点
  const knowledgeMap = new Map()
  list.forEach(exp => {
    const kps = exp.knowledgePoints || []
    kps.forEach(kp => {
      if (kp.knowledgeName) {
        if (knowledgeMap.has(kp.knowledgeName)) {
          const existing = knowledgeMap.get(kp.knowledgeName)
          if (!existing.experimentNames.includes(exp.experimentName)) {
            existing.experimentNames.push(exp.experimentName)
            existing.count++
          }
          existing.totalScore += kp.masteryScore || 0
        } else {
          knowledgeMap.set(kp.knowledgeName, {
            count: 1,
            totalScore: kp.masteryScore || 0,
            experimentNames: [exp.experimentName]
          })
        }
      }
    })
  })

  const allKnowledge = Array.from(knowledgeMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      experimentNames: data.experimentNames,
      count: data.count
    }))
    .sort((a, b) => b.value - a.value)

  return {
    highest: allKnowledge.slice(0, 5),  // 掌握度最高的5个
    lowest: allKnowledge.slice(-5).reverse()  // 掌握度最低的5个
  }
})

// 筛选表单
const filterForm = ref({
  subjectId: '',
  experimentIds: [],
  dateRange: []
})

// 选项数据
const subjectOptions = ref([])
const experimentOptions = ref([])
const loadingSubjects = ref(false)
const loadingExperiments = ref(false)

// Tab切换
const activeTab = ref('correctRate')

// 折叠面板
const activeCollapses = ref([])

// 图表引用
const correctRateChartRef = ref(null)
const masteryScoreChartRef = ref(null)
const knowledgeChartRef = ref(null)
let correctRateChart = null
let masteryScoreChart = null
let knowledgeChart = null

// ========== 页面初始化 ==========
onMounted(() => {
  parseParams()
  // educationStage已从URL参数获取，直接加载科目列表和学生数据
  loadSubjects()
  loadStudentData()
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

  // 参数格式：schoolType-schoolId-gradeId-classId-specialityId-userId-educationStage
  if (paramArray.length >= 7) {
    schoolType.value = paramArray[0]    // 学校类型：1=普教，2=职教
    schoolId.value = paramArray[1]       // 学校ID
    gradeId.value = paramArray[2]        // 年级ID
    classId.value = paramArray[3]        // 班级ID
    specialityId.value = paramArray[4]  // 专业ID
    userId.value = paramArray[5]         // 用户ID
    educationStage.value = paramArray[6]  // 学段信息

    console.log('📋 学生学习情况页参数:', {
      schoolType: schoolType.value,
      schoolId: schoolId.value,
      gradeId: gradeId.value,
      classId: classId.value,
      specialityId: specialityId.value,
      userId: userId.value,
      educationStage: educationStage.value
    })
  }
}

// ========== 加载科目列表 ==========
const loadSubjects = async () => {
  loadingSubjects.value = true
  try {
    // 使用URL参数中的educationStage
    const params = {
      schoolType: schoolType.value,
      educationStageType: educationStage.value
    }

    console.log('📚 加载科目参数:', params)

    const response = await getSubjectList(params)
    if (response.code === 200) {
      subjectOptions.value = (response.rows || []).map(item => ({
        label: item.subjectName || item.subjectType,
        value: item.id
      }))
      console.log('✅ 科目列表加载完成:', subjectOptions.value)
    }
  } catch (error) {
    console.error('❌ 加载科目列表失败:', error)
  } finally {
    loadingSubjects.value = false
  }
}

// ========== 加载实验列表 ==========
const loadExperiments = async (subjectId) => {
  loadingExperiments.value = true
  try {
    const params = {
      schoolType: schoolType.value,
      academicStageType: '初中',
      pageNum: 1,
      pageSize: 1000
    }

    const response = await getExperimentList(params)
    if (response.code === 200) {
      experimentOptions.value = (response.rows || []).map(item => ({
        label: item.experimentName,
        value: item.id
      }))
      console.log('✅ 实验列表加载完成:', experimentOptions.value)
    }
  } catch (error) {
    console.error('❌ 加载实验列表失败:', error)
  } finally {
    loadingExperiments.value = false
  }
}

// ========== 科目变化处理 ==========
const handleSubjectChange = () => {
  filterForm.value.experimentIds = []
}

// ========== 筛选查询 ==========
const handleFilter = () => {
  loadStudentData()
}

// ========== 重置筛选 ==========
const handleReset = () => {
  filterForm.value = {
    subjectId: '',
    experimentIds: [],
    dateRange: []
  }
  experimentOptions.value = []
  loadStudentData()
}

// ========== 加载学生实验数据 ==========
const loadStudentData = async () => {
  if (!userId.value) {
    proxy.$modal.msgError('学生ID不能为空')
    return
  }

  loading.value = true

  try {
    // 构建查询参数
    const query = {
      userId: userId.value,
      schoolType: schoolType.value,
      experimentIds: filterForm.value.experimentIds.length > 0 ? filterForm.value.experimentIds : undefined,
      startTime: filterForm.value.dateRange?.[0] || null,
      endTime: filterForm.value.dateRange?.[1] || null
    }

    console.log('📊 查询学生实验数据:', query)

    // 调用学生实验掌握度接口（支持筛选）
    const response = await getStudentExperiments(query)

    if (response.code === 200) {
      // 新格式：response.data 包含学生信息和实验列表
      const data = response.data || {}
      experimentList.value = data.experiments || []

      // 设置学生基本信息（从返回数据中获取）
      if (data.userId) {
        studentInfo.value = {
          userId: data.userId,
          userName: data.userName || '-',
          userNo: data.userNo || '-',
          sex: data.sex === '0' ? '男' : data.sex === '1' ? '女' : '未知'
        }
      }

      console.log('📊 学生实验数据:', data)

      // 渲染图表
      await nextTick()
      renderCharts()
    } else {
      proxy.$modal.msgError(response.msg || '获取学生数据失败')
    }
  } catch (error) {
    console.error('❌ 加载学生数据失败:', error)
    proxy.$modal.msgError('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ========== 渲染图表 ==========
const renderCharts = () => {
  if (activeTab.value === 'correctRate') {
    renderCorrectRateChart()
  } else if (activeTab.value === 'mastery') {
    renderMasteryScoreChart()
  } else if (activeTab.value === 'knowledgePoints') {
    renderKnowledgePointsChart()
  }
}

// ========== 渲染正确率图表 ==========
const renderCorrectRateChart = () => {
  if (!correctRateChartRef.value || experimentList.value.length === 0) return

  if (!correctRateChart) {
    correctRateChart = echarts.init(correctRateChartRef.value)
  }

  const data = experimentList.value.map(exp => ({
    name: exp.experimentName,
    value: Math.round((exp.correctRate || 0) * 100)
  }))

  correctRateChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: experimentList.value.map(exp => exp.experimentName),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        barWidth: 'auto',
        barMinWidth: 20,
        barMaxWidth: 60,
        data: data.map(item => item.value),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params) => {
            const value = params.value
            if (value >= 90) return '#67c23a'
            if (value >= 75) return '#409eff'
            if (value >= 60) return '#e6a23c'
            return '#f56c6c'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  })
}

// ========== 渲染掌握度饼图（等级分布） ==========
const renderMasteryScoreChart = () => {
  if (!masteryScoreChartRef.value || experimentList.value.length === 0) return

  if (!masteryScoreChart) {
    masteryScoreChart = echarts.init(masteryScoreChartRef.value)
  }

  const total = experimentList.value.length

  // 统计掌握度等级分布
  const levelCounts = { '精通': 0, '熟练': 0, '掌握': 0, '基础': 0 }
  const levelRanges = {
    '精通': '≥90分',
    '熟练': '75-90分',
    '掌握': '60-75分',
    '基础': '<60分'
  }
  experimentList.value.forEach(exp => {
    const level = exp.masteryLevel
    if (levelCounts.hasOwnProperty(level)) {
      levelCounts[level]++
    }
  })

  const pieData = [
    { value: levelCounts['精通'], name: '精通', itemStyle: { color: '#67c23a' }, range: levelRanges['精通'] },
    { value: levelCounts['熟练'], name: '熟练', itemStyle: { color: '#409eff' }, range: levelRanges['熟练'] },
    { value: levelCounts['掌握'], name: '掌握', itemStyle: { color: '#e6a23c' }, range: levelRanges['掌握'] },
    { value: levelCounts['基础'], name: '基础', itemStyle: { color: '#909399' }, range: levelRanges['基础'] }
  ].filter(item => item.value > 0)

  masteryScoreChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const item = params.data
        return `<div style="text-align: left;">
          <b style="font-size: 14px">${item.name}</b><br/>
          <span style="color: #909399">数量:</span> ${item.value} 个<br/>
          <span style="color: #909399">占比:</span> ${params.percent.toFixed(1)}%<br/>
          <span style="color: #909399">分数区间:</span> ${item.range}
        </div>`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      itemWidth: 20,
      itemHeight: 12,
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: '掌握度等级',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}个 ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        data: pieData
      }
    ]
  })
}

// ========== 渲染知识点雷达图 ==========
const renderKnowledgePointsChart = () => {
  if (!knowledgeChartRef.value) return

  // 收集所有知识点的数据（包含实验名称）
  const knowledgeMap = new Map()
  experimentList.value.forEach(exp => {
    const kps = exp.knowledgePoints || []
    kps.forEach(kp => {
      if (kp.knowledgeName) {
        if (knowledgeMap.has(kp.knowledgeName)) {
          const existing = knowledgeMap.get(kp.knowledgeName)
          // 如果是新的实验来源，才添加
          if (!existing.experimentNames.includes(exp.experimentName)) {
            existing.experimentNames.push(exp.experimentName)
            existing.count++  // 只在新实验时+1
          }
          existing.totalScore += kp.masteryScore || 0
        } else {
          knowledgeMap.set(kp.knowledgeName, {
            count: 1,
            totalScore: kp.masteryScore || 0,
            experimentNames: [exp.experimentName]
          })
        }
      }
    })
  })

  // 构建雷达图数据（取前8个知识点，避免太拥挤）
  const sortedKnowledge = Array.from(knowledgeMap.entries())
    .map(([name, data]) => ({
      name,
      nameWithCount: `${name}(${data.count})`,
      value: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      experimentNames: data.experimentNames,
      count: data.count
    }))
    .sort((a, b) => b.value - a.value)  // 从高到低排序（掌握度高的显示在前）
    .slice(0, 8)

  console.log('知识点数据:', JSON.stringify(sortedKnowledge, null, 2));

  if (sortedKnowledge.length === 0) return

  if (!knowledgeChart) {
    knowledgeChart = echarts.init(knowledgeChartRef.value)
  }

  knowledgeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        // 从 params.name 获取知识点名称（可能包含括号中的数字）
        const nameWithCount = params.name
        if (!nameWithCount) return ''

        // 从名称中提取知识点名称
        const knowledgeName = nameWithCount.replace(/\(\d+\)$/, '').trim()

        // 从 sortedKnowledge 中查找对应的知识点
        const item = sortedKnowledge.find(k => k.name === knowledgeName || k.nameWithCount === nameWithCount)
        if (!item) return ''

        const experiments = item.experimentNames.map((n, i) => `${i + 1}. ${n}`).join('<br/>')
        return `<div style="text-align: left; max-width: 280px">
          <b style="font-size: 15px; color: #303133">${item.name}</b><br/>
          <span style="color: #67c23a; font-size: 18px; font-weight: bold">${item.value}%</span><br/>
          <span style="color: #909399">来自 ${item.count} 个实验:</span><br/>
          ${experiments}
        </div>`
      }
    },
    radar: {
      indicator: sortedKnowledge.map(item => ({
        name: item.nameWithCount,
        max: 100
      })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#606266',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(238, 238, 238, 0.8)'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)']
        }
      }
    },
    series: [
      {
        name: '知识点掌握度',
        type: 'radar',
        data: [
          {
            value: sortedKnowledge.map(item => item.value),
            name: '掌握度',
            // 把知识点详细信息附加到data对象上
            knowledgeData: sortedKnowledge,
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409eff',
              width: 2
            },
            itemStyle: {
              color: '#409eff'
            }
          }
        ]
      }
    ]
  })

  // 重新设置tooltip，使用formatter函数
  knowledgeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        // params.value 是数组，当前悬停点的值在 params.value 中
        // 由于雷达图只有一个 series，params.value 是所有值的数组
        // 需要找出当前悬停对应的是哪个值
        const currentValue = params.value
        if (!currentValue || !Array.isArray(currentValue)) return ''

        // 方法：从 value 数组中找到当前值的索引
        // 注意：雷达图 tooltip 显示的值就是 value 数组
        const knowledgeData = params.data?.knowledgeData
        if (!knowledgeData) return ''

        // 由于不知道具体的索引，我们遍历找到第一个匹配的（简单处理）
        // 更准确的方式需要知道当前悬停的是哪个维度
        const idx = knowledgeData.findIndex(k => k.value === currentValue)
        const item = knowledgeData[idx !== -1 ? idx : 0]
        if (!item) return ''

        const experiments = item.experimentNames.map((n, i) => `${i + 1}. ${n}`).join('<br/>')
        return `<div style="text-align: left; max-width: 280px">
          <b style="font-size: 15px; color: #303133">${item.name}</b><br/>
          <span style="color: #67c23a; font-size: 18px; font-weight: bold">${item.value}%</span><br/>
          <span style="color: #909399">来自 ${item.count} 个实验:</span><br/>
          ${experiments}
        </div>`
      }
    }
  })
}

// ========== 监听Tab切换，渲染对应图表 ==========
const handleTabChange = (tabName) => {
  nextTick(() => {
    renderCharts()
  })
}

// ========== 获取进度条颜色 ==========
const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 75) return '#409eff'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// ========== 获取掌握度分数颜色 ==========
const getMasteryScoreColor = (score) => {
  if (!score) return '#909399'
  if (score >= 85) return '#67c23a'
  if (score >= 70) return '#409eff'
  if (score >= 55) return '#e6a23c'
  return '#f56c6c'
}

// ========== 获取掌握度等级标签类型 ==========
const getMasteryLevelType = (level) => {
  const typeMap = {
    '精通': 'success',
    '熟练': 'primary',
    '掌握': 'warning',
    '基础': 'info'
  }
  return typeMap[level] || 'info'
}

// ========== 格式化日期 ==========
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ========== 刷新按钮点击 ==========
const handleRefresh = () => {
  loadStudentData()
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
  if (masteryScoreChart) {
    masteryScoreChart.dispose()
    masteryScoreChart = null
  }
  if (knowledgeChart) {
    knowledgeChart.dispose()
    knowledgeChart = null
  }
})
</script>

<style scoped lang="scss">
.student-experiment-detail-page {
  padding: 20px;
  min-height: calc(100vh - 84px);
}

// 主信息卡片（标题+学生信息+按钮同一行）
.main-info-card {
  margin-bottom: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

// 同一行布局：左侧标题+信息，右侧按钮
.main-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.main-info-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
  min-width: 0;

  // 标题区域
  .title-section {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .header-icon {
      font-size: 22px;
      color: #3b82f6;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
  }

  // 学生信息（内联紧凑展示）
  .student-info-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .info-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: #ffffff;
    border-radius: 6px;
    font-size: 13px;
    color: #475569;
    border: 1px solid #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;

    .el-icon {
      font-size: 14px;
      color: #64748b;
    }

    &.highlight {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
      font-weight: 500;

      .el-icon {
        color: #3b82f6;
      }
    }
  }

  .info-divider {
    color: #cbd5e1;
    font-size: 12px;
    flex-shrink: 0;
  }
}

// 右侧按钮
.header-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

// ========== 统计卡片样式 ==========
.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    padding: 16px;
  }
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
  flex-shrink: 0;

  .el-icon {
    font-size: 28px;
    color: #fff;
  }
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.level-distribution-card {
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.level-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.level-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .el-tag {
    font-weight: 500;
  }
}

.tab-card {
  margin-bottom: 20px;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.chart-row {
  margin-bottom: 16px;
}

.pie-chart-card,
.radar-chart-card {
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.data-tabs {
  :deep(.el-tabs__content) {
    padding: 20px 0;
  }
}

.tab-content {
  .chart-wrapper,
  .table-wrapper,
  .knowledge-wrapper {
    margin-bottom: 20px;
  }

  .chart-title,
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }

  .chart-title .chart-subtitle {
    font-size: 13px;
    font-weight: 400;
    color: #909399;
    margin-left: 8px;
  }

  .knowledge-summary {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }

  .summary-item {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .summary-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

  .summary-tags {
    margin-left: 8px;
  }

  .summary-tag {
    margin-right: 6px;
  }

  .chart {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
  }
}

.knowledge-wrapper {
  .collapse-title {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .experiment-name {
      font-weight: 600;
      color: #303133;
    }
  }

  .knowledge-content {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }
}

:deep(.el-collapse-item__header) {
  font-size: 15px;
  font-weight: 500;
}
</style>
