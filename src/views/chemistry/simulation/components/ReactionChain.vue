<template>
  <div class="reaction-chain">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Operation /></el-icon>
            反应历程
          </span>
          <el-tag v-if="reactionChain && reactionChain.length > 0" type="info" size="small">
            共 {{ reactionChain.length }} 个阶段
          </el-tag>
        </div>
      </template>

      <div v-if="!reactionChain || reactionChain.length === 0" class="empty-state">
        <el-empty description="暂无反应历程数据" :image-size="80" />
      </div>

      <div v-else class="chain-content">
        <el-timeline>
          <el-timeline-item
            v-for="(stage, index) in reactionChain"
            :key="stage.id || index"
            :timestamp="stage.timestamp || `阶段 ${index + 1}`"
            placement="top"
            :type="getStageType(stage.type)"
            :color="getStageColor(stage.type)"
            :size="index === 0 ? 'large' : 'normal'"
          >
            <div class="stage-card">
              <div class="stage-header">
                <span class="stage-type">{{ getStageLabel(stage.type) }}</span>
                <el-tag v-if="stage.duration" size="small" type="info">
                  {{ stage.duration }}
                </el-tag>
              </div>

              <div v-if="stage.description" class="stage-description">
                {{ stage.description }}
              </div>

              <div v-if="stage.equation" class="stage-equation" v-html="formatEquation(stage.equation)"></div>

              <div v-if="stage.conditions" class="stage-conditions">
                <el-space wrap>
                  <el-tag v-if="stage.conditions.temperature" size="small">
                    {{ stage.conditions.temperature }}°C
                  </el-tag>
                  <el-tag v-if="stage.conditions.catalyst" size="small" type="warning">
                    <el-icon><MagicStick /></el-icon>
                    {{ stage.conditions.catalyst }}
                  </el-tag>
                  <el-tag v-if="stage.conditions.energy" size="small" :type="stage.conditions.energy > 0 ? 'danger' : 'primary'">
                    <el-icon><Lightning /></el-icon>
                    {{ stage.conditions.energy > 0 ? '+' : '' }}{{ stage.conditions.energy }} kJ
                  </el-tag>
                </el-space>
              </div>

              <div v-if="stage.intermediates && stage.intermediates.length > 0" class="stage-intermediates">
                <div class="intermediate-title">中间产物：</div>
                <el-space wrap>
                  <el-tag
                    v-for="item in stage.intermediates"
                    :key="item.formula"
                    size="small"
                    type="info"
                  >
                    {{ item.formula }}
                  </el-tag>
                </el-space>
              </div>

              <div v-if="stage.rate" class="stage-rate">
                <span class="label">反应速率：</span>
                <span class="value">{{ stage.rate }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <!-- 二级反应 -->
        <el-collapse v-if="secondaryReactions && secondaryReactions.length > 0" class="secondary-reactions">
          <el-collapse-item name="secondary">
            <template #title>
              <div class="secondary-title">
                <el-icon><Right /></el-icon>
                <span>副反应 ({{ secondaryReactions.length }})</span>
              </div>
            </template>
            <div class="secondary-list">
              <div
                v-for="(reaction, idx) in secondaryReactions"
                :key="idx"
                class="secondary-item"
              >
                <div class="secondary-equation" v-html="formatEquation(reaction.equation)"></div>
                <div class="secondary-info">
                  <el-tag size="small" type="warning">{{ reaction.type }}</el-tag>
                  <span v-if="reaction.probability" class="probability">
                    概率：{{ (reaction.probability * 100).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Operation, MagicStick, Lightning, Right } from '@element-plus/icons-vue'

const props = defineProps({
  reactionChain: {
    type: Array,
    default: () => []
  },
  secondaryReactions: {
    type: Array,
    default: () => []
  }
})

function getStageType(type) {
  const types = {
    initiation: 'primary',
    propagation: 'success',
    termination: 'info',
    intermediate: 'warning',
    rate_limiting: 'danger'
  }
  return types[type] || 'primary'
}

function getStageColor(type) {
  const colors = {
    initiation: '#409EFF',
    propagation: '#67C23A',
    termination: '#909399',
    intermediate: '#E6A23C',
    rate_limiting: '#F56C6C'
  }
  return colors[type] || '#409EFF'
}

function getStageLabel(type) {
  const labels = {
    initiation: '引发阶段',
    propagation: '增长阶段',
    termination: '终止阶段',
    intermediate: '中间步骤',
    rate_limiting: '决速步骤',
    activation: '活化阶段',
    formation: '形成阶段',
    conversion: '转化阶段',
    equilibrium: '平衡阶段'
  }
  return labels[type] || type
}

function formatEquation(equation) {
  if (!equation) return ''

  let formatted = equation

  // 格式化下标数字
  formatted = formatted.replace(/(\d+)/g, '<sub>$1</sub>')

  // 格式化箭头
  formatted = formatted.replace(/->|→/g, '<span class="arrow">→</span>')

  return formatted
}
</script>

<style scoped lang="scss">
.reaction-chain {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
  }

  .empty-state {
    padding: 20px 0;
  }

  .chain-content {
    :deep(.el-timeline-item__timestamp) {
      font-weight: 500;
    }

    .stage-card {
      padding: 15px;
      background-color: var(--el-fill-color-light);
      border-radius: 8px;
      margin-left: 10px;

      .stage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .stage-type {
          font-weight: 500;
          color: var(--el-color-primary);
        }
      }

      .stage-description {
        color: var(--el-text-color-regular);
        line-height: 1.6;
        margin-bottom: 10px;
      }

      .stage-equation {
        font-family: 'Times New Roman', serif;
        font-size: 16px;
        text-align: center;
        padding: 10px;
        background-color: var(--el-bg-color);
        border-radius: 4px;
        margin-bottom: 10px;

        :deep(sub) {
          font-size: 0.7em;
          vertical-align: sub;
        }

        :deep(.arrow) {
          margin: 0 10px;
          color: var(--el-color-primary);
        }
      }

      .stage-conditions {
        margin-bottom: 10px;

        :deep(.el-tag) {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      }

      .stage-intermediates {
        margin-bottom: 10px;

        .intermediate-title {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }
      }

      .stage-rate {
        font-size: 13px;
        color: var(--el-text-color-secondary);

        .label {
          margin-right: 8px;
        }

        .value {
          color: var(--el-color-primary);
          font-weight: 500;
        }
      }
    }

    .secondary-reactions {
      margin-top: 20px;

      .secondary-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .secondary-list {
        padding: 15px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 8px;

        .secondary-item {
          padding: 12px;
          background-color: var(--el-bg-color);
          border-radius: 6px;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .secondary-equation {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            text-align: center;
            margin-bottom: 8px;

            :deep(sub) {
              font-size: 0.7em;
              vertical-align: sub;
            }

            :deep(.arrow) {
              margin: 0 8px;
            }
          }

          .secondary-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;

            .probability {
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }
  }
}
</style>
