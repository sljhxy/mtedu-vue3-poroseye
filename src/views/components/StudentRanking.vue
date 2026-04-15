<template>
  <div class="ranking-container">
    <div class="ranking-header">
      <h3 class="ranking-title">
        <el-icon><Trophy /></el-icon>
        正确率排行
      </h3>
    </div>
    <div class="ranking-list" v-if="list.length > 0">
      <div
        v-for="(item, index) in list"
        :key="item.userId"
        class="ranking-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="ranking-index" :class="`rank-${index + 1}`">
          <span v-if="index < 3" class="medal">{{ getMedal(index) }}</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="ranking-avatar">
          <el-avatar :size="40" :src="item.avatar">
            {{ item.userName?.charAt(0) || '学' }}
          </el-avatar>
        </div>
        <div class="ranking-info">
          <div class="ranking-name">{{ item.userName }}</div>
          <div class="ranking-class">{{ item.className }}</div>
        </div>
        <div class="ranking-score">
          <el-progress
            :percentage="item.correctRate"
            :stroke-width="8"
            :show-text="false"
            :color="getProgressColor(item.correctRate)"
          />
          <span class="score-text">{{ item.correctRate }}分</span>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无排行数据" :image-size="80" />
  </div>
</template>

<script setup>
import { Trophy } from '@element-plus/icons-vue'

defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

function getMedal(index) {
  return ['🥇', '🥈', '🥉'][index]
}

function getProgressColor(score) {
  if (score >= 90) return '#67c23a'
  if (score >= 75) return '#409eff'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style lang="scss" scoped>
.ranking-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.ranking-header {
  margin-bottom: 16px;
}

.ranking-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ranking-list {
  max-height: 360px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;

  &:last-child {
    border-bottom: none;
  }

  &.top-three {
    background: linear-gradient(90deg, rgba(64, 158, 255, 0.05) 0%, rgba(64, 158, 255, 0) 100%);
    margin: 0 -20px;
    padding: 12px 20px;
    border-radius: 8px;
  }
}

.ranking-index {
  width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  margin-right: 12px;

  .medal {
    font-size: 20px;
  }

  &.rank-1 {
    color: #ff9f7f;
  }

  &.rank-2 {
    color: #b1b1b1;
  }

  &.rank-3 {
    color: #d48265;
  }
}

.ranking-avatar {
  margin-right: 12px;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.ranking-class {
  font-size: 12px;
  color: #909399;
}

.ranking-score {
  width: 100px;
  text-align: right;

  .score-text {
    font-size: 12px;
    color: #606266;
    font-weight: 500;
  }
}
</style>