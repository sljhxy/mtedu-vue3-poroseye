<template>
  <div class="stats-card" :class="[`stats-card--${type}`]">
    <div class="stats-card__icon">
      <el-icon :size="32">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stats-card__content">
      <div class="stats-card__title">{{ title }}</div>
      <div class="stats-card__value">
        <span class="value">{{ formatNumber(value) }}</span>
        <span v-if="suffix" class="suffix">{{ suffix }}</span>
      </div>
      <div v-if="extra" class="stats-card__extra">{{ extra }}</div>
      <div v-if="trend !== undefined" class="stats-card__trend" :class="trendClass">
        <el-icon v-if="trend >= 0" :size="14"><TrendCharts /></el-icon>
        <el-icon v-else :size="14"><Bottom /></el-icon>
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendCharts, Bottom, User, Notebook, Reading, DataAnalysis, Trophy, Coin, Rank } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: 0
  },
  suffix: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'User'
  },
  type: {
    type: String,
    default: 'primary' // primary, success, warning, danger, info
  },
  trend: {
    type: Number,
    default: undefined
  },
  extra: {
    type: String,
    default: ''
  }
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'trend-up' : 'trend-down'
})

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num?.toLocaleString() || '0'
}
</script>

<style lang="scss" scoped>
.stats-card {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
  }

  &--primary .stats-card__icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  &--success .stats-card__icon {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: #fff;
  }

  &--warning .stats-card__icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
  }

  &--info .stats-card__icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  &__value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: baseline;

    .value {
      margin-right: 4px;
    }

    .suffix {
      font-size: 14px;
      color: #909399;
      font-weight: normal;
    }
  }

  &__extra {
    font-size: 13px;
    color: #606266;
    margin-top: 4px;
    line-height: 1.4;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    margin-top: 8px;

    &.trend-up {
      color: #67c23a;
    }

    &.trend-down {
      color: #f56c6c;
    }
  }
}
</style>