<template>
  <div class="student-dashboard">
    <!-- 顶部欢迎栏 -->
    <div class="welcome-section">
      <div class="welcome-left">
        <div class="avatar-wrap">
          <el-avatar :size="60" :src="user.avatar">
            {{ user.userName?.charAt(0) || '学' }}
          </el-avatar>
        </div>
        <div class="welcome-text">
          <div class="welcome-title">{{ user.userName }}同学，欢迎回来！</div>
          <div class="welcome-note">本周学习时长：{{ studyHours }}小时</div>
        </div>
      </div>
      <div class="welcome-right">
        <el-tag type="success" size="large"> {{ masteryLevel }} </el-tag>
      </div>
    </div>

    <!-- 顶部指标卡 -->
    <div class="stats-grid">
      <StatsCard
        title="我的实验"
        :value="statsData.experimentCount"
        suffix="次"
        icon="Notebook"
        type="success"
        :trend="statsData.experimentTrend"
      />
      <StatsCard
        title="掌握度"
        :value="statsData.masteryScore"
        suffix="分"
        icon="Trophy"
        type="warning"
      />
      <StatsCard
        title="班级排名"
        :value="statsData.classRank"
        suffix=""
        icon="Rank"
        type="primary"
      />
      <StatsCard
        title="积分"
        :value="statsData.points"
        suffix="分"
        icon="Coin"
        type="info"
      />
    </div>

    <!-- 第一行：我的掌握度趋势 + 待完成实验 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <LineChart
          title="我的掌握度趋势"
          :height="300"
          :option="masteryTrendOption"
        />
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="pending-experiments">
          <div class="chart-header">
            <h3 class="chart-title">
              <el-icon><Clock /></el-icon>
              待完成实验
            </h3>
          </div>
          <div class="experiment-list">
            <div
              v-for="item in pendingExperiments"
              :key="item.id"
              class="experiment-item"
              @click="goToExperiment(item.id)"
            >
              <div class="experiment-thumb">
                <img :src="item.thumbnail || defaultThumb" alt="" />
              </div>
              <div class="experiment-info">
                <div class="experiment-name">{{ item.name }}</div>
                <div class="experiment-meta">
                  <el-tag size="small" type="info">{{ item.subject }}</el-tag>
                  <span class="deadline">{{ item.deadline }}</span>
                </div>
              </div>
              <el-button type="primary" size="small" round>开始</el-button>
            </div>
            <el-empty v-if="pendingExperiments.length === 0" description="暂无待完成实验" :image-size="60" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：班级排行榜 + 推荐实验 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <StudentRanking :list="classRanking" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="recommend-experiments">
          <div class="chart-header">
            <h3 class="chart-title">
              <el-icon><Star /></el-icon>
              推荐实验
            </h3>
          </div>
          <div class="recommend-list">
            <div
              v-for="item in recommendedExperiments"
              :key="item.id"
              class="recommend-item"
              @click="goToExperiment(item.id)"
            >
              <div class="recommend-thumb">
                <img :src="item.thumbnail || defaultThumb" alt="" />
              </div>
              <div class="recommend-info">
                <div class="recommend-name">{{ item.name }}</div>
                <div class="recommend-desc">{{ item.description }}</div>
                <div class="recommend-tags">
                  <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import StatsCard from './StatsCard.vue'
import LineChart from './LineChart.vue'
import StudentRanking from './StudentRanking.vue'
import { Clock, Star, Trophy, Coin } from '@element-plus/icons-vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})

const defaultThumb = 'https://picsum.photos/400/225'

// 统计数据
const statsData = reactive({
  experimentCount: 15,
  experimentTrend: 20,
  masteryScore: 85,
  classRank: 3,
  points: 520
})

// 本周学习时长
const studyHours = ref(12)

// 掌握度等级
const masteryLevel = computed(() => {
  const score = statsData.masteryScore
  if (score >= 90) return '精通'
  if (score >= 75) return '熟练'
  if (score >= 60) return '掌握中'
  return '入门'
})

// 掌握度趋势图表配置
const masteryTrendOption = ref({})

// 待完成实验列表
const pendingExperiments = ref([
  { id: 1, name: '氢气制备实验', subject: '化学', thumbnail: '', deadline: '明天截止' },
  { id: 2, name: '酸碱中和滴定', subject: '化学', thumbnail: '', deadline: '3天后' },
  { id: 3, name: '氧化还原反应', subject: '化学', thumbnail: '', deadline: '本周内' }
])

// 班级排行榜
const classRanking = ref([
  { userId: 1, userName: '张三', className: '初三(1)班', masteryScore: 95, avatar: '' },
  { userId: 2, userName: '李四', className: '初三(1)班', masteryScore: 92, avatar: '' },
  { userId: 3, userName: '王五', className: '初三(1)班', masteryScore: 88, avatar: '' }
])

// 推荐实验列表
const recommendedExperiments = ref([
  {
    id: 1,
    name: '燃烧条件探究',
    description: '探究燃烧的三个必要条件',
    thumbnail: '',
    tags: ['基础实验', '必做']
  },
  {
    id: 2,
    name: '溶液配制',
    description: '掌握质量分数计算和溶液配制方法',
    thumbnail: '',
    tags: ['技能实验']
  },
  {
    id: 3,
    name: '金属活动性顺序',
    description: '验证金属与酸、金属与盐的反应',
    thumbnail: '',
    tags: ['探究实验', '必做']
  }
])

// 初始化图表
function initCharts() {
  masteryTrendOption.value = {
    xAxis: {
      data: getLast7Days()
    },
    series: [{
      name: '掌握度',
      type: 'line',
      smooth: true,
      data: [75, 78, 80, 82, 80, 85, 88],
      areaStyle: {
        color: 'rgba(103, 194, 58, 0.2)'
      },
      itemStyle: {
        color: '#67c23a'
      }
    }]
  }
}

// 获取最近N天日期
function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }))
  }
  return days
}

// 跳转实验
function goToExperiment(id) {
  console.log('跳转实验:', id)
}

onMounted(() => {
  initCharts()
})
</script>

<style lang="scss" scoped>
.student-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;

  .welcome-left {
    display: flex;
    align-items: center;
  }

  .avatar-wrap {
    margin-right: 16px;
    border: 3px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
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
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.chart-row {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  border-left: 4px solid #409EFF;
}

.pending-experiments,
.recommend-experiments {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.experiment-list {
  max-height: 280px;
  overflow-y: auto;
}

.experiment-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 12px;
    margin: 0 -12px;
  }

  &:last-child {
    border-bottom: none;
  }
}

.experiment-thumb {
  width: 80px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.experiment-info {
  flex: 1;
  min-width: 0;
}

.experiment-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.experiment-meta {
  display: flex;
  align-items: center;
  gap: 8px;

  .deadline {
    font-size: 12px;
    color: #909399;
  }
}

.recommend-list {
  max-height: 300px;
  overflow-y: auto;
}

.recommend-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 12px;
    margin: 0 -12px;
  }

  &:last-child {
    border-bottom: none;
  }
}

.recommend-thumb {
  width: 100px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.recommend-info {
  flex: 1;
  min-width: 0;
}

.recommend-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.recommend-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>