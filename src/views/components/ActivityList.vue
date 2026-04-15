<template>
  <div class="activity-container">
    <div class="activity-header">
      <h3 class="activity-title">
        <el-icon><Clock /></el-icon>
        {{ title }}
      </h3>
    </div>
    <div class="activity-list" v-if="list.length > 0">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="activity-item"
      >
        <div class="activity-icon" :class="getTypeClass(item.businessType)">
          <el-icon>
            <component :is="getTypeIcon(item.businessType)" />
          </el-icon>
        </div>
        <div class="activity-content">
          <div class="activity-text">{{ item.title }}</div>
          <div class="activity-meta">
            <span class="activity-user">{{ formatUserName(item) }}</span>
            <span class="activity-time">{{ formatTime(item.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无操作记录" :image-size="80" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, User, Document, Setting, DataAnalysis, Warning } from '@element-plus/icons-vue'

/**
 * ActivityList 组件属性
 */
const props = defineProps({
  /** 操作列表数据 */
  list: {
    type: Array,
    default: () => []
  },
  /** 组件标题 */
  title: {
    type: String,
    default: '最近操作'
  },
  /**
   * 仪表盘类型
   * @type {'admin' | 'teacher' | 'super_admin'}
   * 用于决定用户名显示格式
   */
  dashboardType: {
    type: String,
    default: 'admin'
  },
  /**
   * 选中的学校ID
   * @description 管理员选中学校后，用户名不再显示学校信息
   */
  selectedSchoolId: {
    type: [Number, null],
    default: null
  }
})

/**
 * 格式化用户名显示
 * 管理员全局：显示"用户名（学校-班级）"
 * 管理员选中学校或教师：显示"用户名（班级）"
 */
function formatUserName(item) {
  const user = item.userName || '未知用户'
  const school = item.schoolName
  const cls = item.className

  // 没有班级信息，直接返回用户名
  if (!cls) return user

  // 管理员且未选学校：显示"用户名（学校-班级）"
  if (props.dashboardType === 'admin' && !props.selectedSchoolId && school) {
    return `${user}（${school}-${cls}）`
  }

  // 其他情况：显示"用户名（班级）"
  return `${user}（${cls}）`
}

function getTypeClass(type) {
  const map = {
    1: 'type-info',
    2: 'type-success',
    3: 'type-warning',
    4: 'type-danger'
  }
  return map[type] || 'type-info'
}

function getTypeIcon(type) {
  const map = {
    1: 'User',
    2: 'Document',
    3: 'Setting',
    4: 'Warning'
  }
  return map[type] || 'User'
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time.split('T')[0]
}
</script>

<style lang="scss" scoped>
.activity-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.activity-header {
  margin-bottom: 16px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-list {
  max-height: 320px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;

  &:last-child {
    border-bottom: none;
  }
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;

  &.type-info {
    background: #ecf5ff;
    color: #409eff;
  }

  &.type-success {
    background: #f0f9ff;
    color: #67c23a;
  }

  &.type-warning {
    background: #fdf6ec;
    color: #e6a23c;
  }

  &.type-danger {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.activity-user {
  color: #409eff;
}
</style>