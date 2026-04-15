<template>
  <div class="app-container experiment-detail-page" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-left">
        <span class="student-name">学生: {{ studentName }}</span>
      </div>
      <div class="header-right">
        <el-button type="warning" :icon="Document" @click="loadTestData" aria-label="加载测试数据">模拟数据</el-button>
        <el-button :icon="Close" @click="handleBack" aria-label="关闭页面">关闭</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="page-content">
      <!-- 左侧：实验信息 -->
      <div class="left-panel">
        <!-- 实验缩略图 -->
        <div class="experiment-thumb">
          <el-image
            v-if="experimentInfo.thumbnail"
            :src="experimentInfo.thumbnail"
            fit="cover"
            class="thumb-image"
            :lazy="true"
          >
            <template #error>
              <div class="thumb-placeholder">
                <el-icon :size="48" aria-hidden="true"><Picture /></el-icon>
                <span>暂无缩略图</span>
              </div>
            </template>
          </el-image>
          <div v-else class="thumb-placeholder">
            <el-icon :size="48" aria-hidden="true"><Picture /></el-icon>
            <span>暂无缩略图</span>
          </div>
        </div>

        <!-- 实验信息 -->
        <div class="experiment-info">
          <div class="experiment-title">{{ experimentInfo.experimentName || '实验名称' }}</div>
          <div class="experiment-date">
            <el-icon aria-hidden="true"><Clock /></el-icon>
            <span>{{ experimentInfo.date || '-' }}</span>
          </div>
        </div>

        <!-- 统计指标 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-header">
              <el-icon class="stat-icon correct" aria-hidden="true"><Check /></el-icon>
              <span class="stat-label">正确率</span>
            </div>
            <div class="stat-value-row">
              <span class="stat-value">{{ experimentInfo.correctRate || 0 }}%</span>
              <el-progress
                :percentage="experimentInfo.correctRate || 0"
                :stroke-width="6"
                :show-text="false"
                class="stat-progress"
                :color="correctRateColor"
              />
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-header">
              <el-icon class="stat-icon primary" aria-hidden="true"><DataAnalysis /></el-icon>
              <span class="stat-label">完成度</span>
            </div>
            <div class="stat-value-row">
              <span class="stat-value completion-text">{{ completionInfo.completed }}/{{ completionInfo.total }}</span>
              <el-progress
                :percentage="experimentInfo.completionRate || 0"
                :stroke-width="6"
                :show-text="false"
                class="stat-progress"
                color="#2563EB"
              />
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-header">
              <el-icon class="stat-icon warning" aria-hidden="true"><Trophy /></el-icon>
              <span class="stat-label">掌握度</span>
            </div>
            <div class="stat-value-row">
              <span class="stat-value">{{ masteryRate }}%</span>
              <el-progress
                :percentage="masteryRate"
                :stroke-width="6"
                :show-text="false"
                class="stat-progress"
                :color="masteryRate >= 80 ? '#22C55E' : masteryRate >= 60 ? '#F59E0B' : '#EF4444'"
              />
            </div>
          </div>
        </div>

        <!-- 知识点 -->
        <div class="knowledge-section">
          <div class="section-title">知识点</div>
          <div class="knowledge-tags">
            <el-tag
              v-for="item in experimentInfo.knowledgePoints"
              :key="item"
              type="info"
              effect="plain"
              class="knowledge-tag"
            >
              {{ item }}
            </el-tag>
            <span v-if="!experimentInfo.knowledgePoints?.length" class="no-data">暂无知识点</span>
          </div>
        </div>
      </div>

      <!-- 右侧：步骤列表 -->
      <div class="right-panel">
        <div class="steps-header">
          实验步骤（共 {{ stepsData.length }} 步）
        </div>
        <div class="timeline-container">
          <div
            v-for="(step, index) in stepsData"
            :key="index"
            class="timeline-item"
            :class="{ 'has-error': step.result === 0 || step.subSteps?.some(s => s.result === 0) }"
          >
            <!-- 时间线节点 -->
            <div class="timeline-node">
              <div class="node-dot" :class="step.result === 1 ? 'success' : 'error'" :aria-label="step.result === 1 ? '步骤正确' : '步骤错误'">
                <el-icon v-if="step.result === 1" aria-hidden="true"><Check /></el-icon>
                <el-icon v-else aria-hidden="true"><Close /></el-icon>
              </div>
              <div v-if="index < stepsData.length - 1" class="node-line" :class="{ 'error-line': step.result === 0 }"></div>
            </div>

            <!-- 步骤内容 -->
            <div class="timeline-content">
              <div class="main-step">
                <span class="step-index">{{ step.stepNum || index + 1 }}</span>
                <span class="step-name">{{ step.stepName }}</span>
                <el-tag :type="step.result === 1 ? 'success' : 'danger'" size="small" class="step-tag">
                  {{ step.result === 1 ? '正确' : '错误' }}
                </el-tag>
              </div>

              <!-- 子步骤（二级） -->
              <div v-if="step.subSteps?.length" class="sub-steps">
                <template v-for="(subStep, subIndex) in step.subSteps" :key="subIndex">
                  <div
                    class="sub-step"
                    :class="{ 'sub-error': subStep.result === 0 }"
                  >
                    <span class="sub-step-branch" aria-hidden="true">{{ subIndex === step.subSteps.length - 1 ? '└─' : '├─' }}</span>
                    <span class="sub-step-num">{{ subStep.stepNum || (index + 1) + '.' + (subIndex + 1) }}</span>
                    <span class="sub-step-name">{{ subStep.stepName }}</span>
                    <span v-if="subStep.result === 1" class="sub-step-status correct" aria-label="正确">
                      <el-icon aria-hidden="true"><Check /></el-icon>
                    </span>
                    <div v-else class="sub-step-status error" aria-label="错误">
                      <el-icon aria-hidden="true"><Close /></el-icon>
                      <span v-if="subStep.errorMsg" class="error-msg">{{ subStep.errorMsg }}</span>
                    </div>
                  </div>

                  <!-- 三级子步骤 -->
                  <div v-if="subStep.subSteps?.length" class="third-step">
                    <template v-for="(thirdStep, thirdIndex) in subStep.subSteps" :key="thirdIndex">
                      <div
                        class="sub-step third-level"
                        :class="{ 'sub-error': thirdStep.result === 0 }"
                      >
                        <span class="sub-step-branch" aria-hidden="true">{{ thirdIndex === subStep.subSteps.length - 1 ? '└─' : '├─' }}</span>
                        <span class="sub-step-num">{{ thirdStep.stepNum || '' }}</span>
                        <span class="sub-step-name">{{ thirdStep.stepName }}</span>
                        <span v-if="thirdStep.result === 1" class="sub-step-status correct" aria-label="正确">
                          <el-icon aria-hidden="true"><Check /></el-icon>
                        </span>
                        <div v-else class="sub-step-status error" aria-label="错误">
                          <el-icon aria-hidden="true"><Close /></el-icon>
                          <span v-if="thirdStep.errorMsg" class="error-msg">{{ thirdStep.errorMsg }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div v-if="!stepsData.length" class="empty-steps">
            <el-empty description="暂无步骤数据" :image-size="60" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Picture, CircleCheck, CircleClose, Clock, Trophy, Check, DataAnalysis, Close, Document } from '@element-plus/icons-vue'
import { getStudentExperimentDetail } from '@/api/glxt/studentExperiment'

const route = useRoute()
const router = useRouter()

// 计算正确率对应的颜色
const correctRateColor = computed(() => {
  const rate = experimentInfo.value.correctRate || 0
  if (rate >= 80) return '#22C55E'
  if (rate >= 60) return '#F59E0B'
  return '#EF4444'
})

// 计算完成度（已完成步骤数/总步骤数）
const completionInfo = computed(() => {
  const total = stepsData.value.length
  const completed = stepsData.value.filter(s => s.result === 1).length
  return { completed, total }
})

// 计算掌握度百分比
const masteryRate = computed(() => {
  const level = experimentInfo.value.masteryLevel
  const rateMap = {
    '精通': 100,
    '熟练': 80,
    '一般': 60,
    '需加强': 40
  }
  return rateMap[level] || 0
})

// 学生姓名
const studentName = ref('学生')

// 加载状态
const loading = ref(false)

// 实验信息
const experimentInfo = ref({
  experimentName: '',
  date: '',
  thumbnail: '',
  correctRate: 0,
  completionRate: 0,
  masteryLevel: '',
  knowledgePoints: []
})

// 步骤数据
const stepsData = ref([])

// 返回
function handleBack() {
  router.back()
}

// 获取掌握度标签类型
function getMasteryType(level) {
  const typeMap = {
    '精通': 'success',
    '熟练': 'primary',
    '一般': 'warning',
    '需加强': 'danger'
  }
  return typeMap[level] || 'info'
}

// 解析URL参数
function parseParams() {
  const params = route.params.data || ''
  try {
    const decoded = decodeURIComponent(params)
    const paramArray = decoded.split('-')
    // 参数格式: userId-experimentId-studentExperimentId
    if (paramArray.length >= 3) {
      // 获取学生实验记录ID
      const studentExperimentId = paramArray[2]
      // 如果是 test 模式，使用模拟数据
      if (studentExperimentId === 'test') {
        loadTestData()
      } else {
        loadExperimentDetail(studentExperimentId)
      }
    }
  } catch (e) {
    console.error('解析参数失败', e)
  }
}

// 加载实验详情数据
async function loadExperimentDetail(id) {
  loading.value = true
  try {
    const res = await getStudentExperimentDetail(id)
    if (res.code === 200 && res.data) {
      const data = res.data

      // 设置学生姓名
      studentName.value = data.student?.userName || '学生'

      // 设置实验信息
      experimentInfo.value = {
        experimentName: data.experimentInfo?.experimentName || '',
        date: data.experimentInfo?.createTime ? formatDate(data.experimentInfo.createTime) : '',
        thumbnail: data.experimentInfo?.thumbnail || '',
        correctRate: data.correctRate || 0,
        completionRate: data.process ? (data.process.split('/')[0] / data.process.split('/')[1]) * 100 : 0,
        masteryLevel: data.masteryLevel || '',
        knowledgePoints: data.knowledgePoints || []
      }

      // 设置步骤数据
      stepsData.value = data.steps || []
    }
  } catch (e) {
    console.error('加载实验详情失败', e)
    ElMessage.error('加载实验详情失败，请重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 加载测试数据（保留作为备用）
function loadTestData() {
  studentName.value = '张三'

  experimentInfo.value = {
    experimentName: '氧气的制备',
    date: '2025-04-08 14:30',
    thumbnail: '',
    correctRate: 75,
    completionRate: 100,
    masteryLevel: '熟练',
    knowledgePoints: ['氧气的性质', '实验室制备方法', '气体的收集']
  }

  ElMessage.success('模拟数据已加载')

  // 三级步骤结构测试数据
  stepsData.value = [
    {
      id: 1,
      stepId: 1,
      stepNum: '1',
      stepName: '检查仪器',
      result: 1,
      score: 10,
      parentStepId: null,
      subSteps: [
        {
          id: 2,
          stepId: 2,
          stepNum: '1.1',
          stepName: '检查试管是否有裂纹',
          result: 1,
          score: 5,
          parentStepId: 1,
          subSteps: [
            {
              id: 3,
              stepId: 3,
              stepNum: '1.1.1',
              stepName: '用手电筒照射检查',
              result: 1,
              score: 2,
              parentStepId: 2,
              subSteps: []
            }
          ]
        },
        {
          id: 4,
          stepId: 4,
          stepNum: '1.2',
          stepName: '检查酒精灯',
          result: 1,
          score: 5,
          parentStepId: 1,
          subSteps: []
        }
      ]
    },
    {
      id: 5,
      stepId: 5,
      stepNum: '2',
      stepName: '组装装置',
      result: 1,
      score: 10,
      parentStepId: null,
      subSteps: [
        {
          id: 6,
          stepId: 6,
          stepNum: '2.1',
          stepName: '连接试管和导管',
          result: 1,
          score: 5,
          parentStepId: 5,
          subSteps: []
        },
        {
          id: 7,
          stepId: 7,
          stepNum: '2.2',
          stepName: '固定试管夹',
          result: 1,
          score: 5,
          parentStepId: 5,
          subSteps: []
        }
      ]
    },
    {
      id: 8,
      stepId: 8,
      stepNum: '3',
      stepName: '检查气密性',
      result: 0,
      score: 0,
      parentStepId: null,
      subSteps: [
        {
          id: 9,
          stepId: 9,
          stepNum: '3.1',
          stepName: '原理: 压强差',
          result: 1,
          score: 3,
          parentStepId: 8,
          subSteps: []
        },
        {
          id: 10,
          stepId: 10,
          stepNum: '3.2',
          stepName: '操作: 把手掌紧握试管口',
          result: 0,
          score: 0,
          parentStepId: 8,
          errorMsg: '错误: 应先用手握住试管底部',
          subSteps: [
            {
              id: 11,
              stepId: 11,
              stepNum: '3.2.1',
              stepName: '等待片刻观察',
              result: 0,
              score: 0,
              parentStepId: 10,
              errorMsg: '未观察到气泡',
              subSteps: []
            }
          ]
        }
      ]
    },
    {
      id: 12,
      stepId: 12,
      stepNum: '4',
      stepName: '添加药品',
      result: 1,
      score: 10,
      parentStepId: null,
      subSteps: [
        {
          id: 13,
          stepId: 13,
          stepNum: '4.1',
          stepName: '添加二氧化锰',
          result: 1,
          score: 5,
          parentStepId: 12,
          subSteps: []
        },
        {
          id: 14,
          stepId: 14,
          stepNum: '4.2',
          stepName: '添加过氧化氢溶液',
          result: 1,
          score: 5,
          parentStepId: 12,
          subSteps: []
        }
      ]
    }
  ]
}

onMounted(() => {
  parseParams()
})
</script>

<style scoped lang="scss">
.experiment-detail-page {
  padding: 0;
  background: #f8fafc;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  color: #1e293b;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .student-name {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.page-content {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin: 0 auto;
}

// 左侧面板
.left-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 16px;
  align-self: flex-start;
  max-height: calc(100vh - 116px);
  overflow-y: auto;
}

.experiment-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;

  .thumb-image {
    width: 100%;
    height: 100%;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #94a3b8;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
}

.experiment-info {
  text-align: center;
  padding: 4px 0;
}

.experiment-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  margin-bottom: 6px;
}

.experiment-date {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stats-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .stat-item {
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .stat-icon {
    font-size: 16px;
    padding: 4px;
    border-radius: 6px;

    &.correct {
      background: #dcfce7;
      color: #22C55E;
    }

    &.primary {
      background: #dbeafe;
      color: #2563EB;
    }

    &.warning {
      background: #fef3c7;
      color: #F59E0B;
    }
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
  }

  .stat-value-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #1e293b;
    font-family: 'Fira Code', monospace;
    min-width: 50px;
  }

  .stat-progress {
    flex: 1;
  }

  .mastery-tag {
    font-weight: 500;
  }

  :deep(.el-progress-bar__outer) {
    background-color: #f1f5f9;
  }
}

.knowledge-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;

    &::before {
      content: '';
      width: 3px;
      height: 14px;
      background: #2563EB;
      border-radius: 2px;
    }
  }

  .knowledge-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .knowledge-tag {
    font-size: 12px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    color: #475569;
  }

  .no-data {
    font-size: 13px;
    color: #94a3b8;
  }
}

// 右侧面板
.right-panel {
  flex: 1;
  min-width: 0;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.steps-header {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  background: #fafbfc;
}

.timeline-container {
  padding: 16px 20px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  gap: 12px;
  position: relative;

  &:last-child .node-line {
    display: none;
  }

  &.has-error {
    .node-line {
      background: #EF4444;
    }
  }
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.node-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;

  &.success {
    background: #dcfce7;
    color: #22C55E;
  }

  &.error {
    background: #fee2e2;
    color: #EF4444;
  }
}

.node-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: #22C55E;
  margin: 4px 0;

  &.error-line {
    background: #EF4444;
  }
}

.timeline-content {
  flex: 1;
  padding-bottom: 16px;

  &:hover {
    .main-step {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
    }
  }
}

.main-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #2563EB;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
}

.step-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.step-tag {
  font-size: 11px;
}

.sub-steps {
  margin-top: 10px;
  padding-left: 12px;
  border-left: 2px solid #e2e8f0;
}

.sub-step {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
  cursor: default;

  &:hover {
    background: #f1f5f9;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.sub-error {
    background: #fef2f2;
    color: #b91c1c;
  }

  &.third-level {
    margin-left: 24px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 400;
    background: #f8fafc;
    border-left: 2px solid #e2e8f0;
  }
}

.sub-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 18px;
  padding: 0 4px;
  background: #6366f1;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  flex-shrink: 0;
}

.third-step {
  margin-left: 12px;
  padding-left: 8px;
  border-left: 2px dashed #cbd5e1;
}

.sub-step-branch {
  color: #94a3b8;
  font-family: monospace;
  flex-shrink: 0;
}

.sub-step-name {
  flex: 1;
}

.sub-step-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  flex-shrink: 0;

  &.correct {
    color: #22C55E;
  }

  &.error {
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
}

.error-msg {
  font-size: 11px;
  color: #b91c1c;
  max-width: 180px;
  text-align: right;
}

.empty-steps {
  padding: 60px 0;
  color: #94a3b8;
}

// 响应式
@media (max-width: 1024px) {
  .page-content {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    position: static;
    max-height: none;
  }
}

// 自定义滚动条
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;

  &:hover {
    background: #94a3b8;
  }
}

// 减少动画偏好
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