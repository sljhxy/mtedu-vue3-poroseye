<template>
  <div class="phenomenon-card">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><View /></el-icon>
            反应现象
          </span>
        </div>
      </template>

      <div v-if="!phenomena || Object.keys(phenomena).length === 0" class="empty-state">
        <el-empty description="暂无现象数据" :image-size="80" />
      </div>

      <div v-else class="phenomena-content">
        <div class="phenomenon-grid">
          <div v-if="phenomena.colorChange" class="phenomenon-item color">
            <div class="item-header">
              <el-icon color="#409EFF"><Brush /></el-icon>
              <span>颜色变化</span>
            </div>
            <div class="color-display">
              <div
                v-if="phenomena.colorChange.before"
                class="color-sample"
                :style="{ backgroundColor: phenomena.colorChange.before }"
              >
                <span>反应前</span>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              <div
                v-if="phenomena.colorChange.after"
                class="color-sample"
                :style="{ backgroundColor: phenomena.colorChange.after }"
              >
                <span>反应后</span>
              </div>
            </div>
            <div v-if="phenomena.colorChange.description" class="description">
              {{ phenomena.colorChange.description }}
            </div>
          </div>

          <div v-if="phenomena.precipitate" class="phenomenon-item precipitate">
            <div class="item-header">
              <el-icon color="#67C23A"><Box /></el-icon>
              <span>沉淀现象</span>
            </div>
            <div class="precipitate-info">
              <div class="precipitate-type">
                <span class="label">沉淀类型：</span>
                <el-tag size="small" type="success">{{ phenomena.precipitate.type }}</el-tag>
              </div>
              <div v-if="phenomena.precipitate.color" class="precipitate-color">
                <span class="label">沉淀颜色：</span>
                <span
                  class="color-dot"
                  :style="{ backgroundColor: phenomena.precipitate.color }"
                ></span>
                {{ phenomena.precipitate.color }}
              </div>
              <div v-if="phenomena.precipitate.description" class="description">
                {{ phenomena.precipitate.description }}
              </div>
            </div>
          </div>

          <div v-if="phenomena.gas" class="phenomenon-item gas">
            <div class="item-header">
              <el-icon color="#E6A23C"><Cloudy /></el-icon>
              <span>气体生成</span>
            </div>
            <div class="gas-info">
              <div class="gas-type">
                <span class="label">气体种类：</span>
                <el-tag size="small" type="warning">{{ phenomena.gas.type }}</el-tag>
              </div>
              <div v-if="phenomena.gas.color" class="gas-color">
                <span class="label">气体颜色：</span>
                <span
                  class="color-dot"
                  :style="{ backgroundColor: phenomena.gas.color }"
                ></span>
                {{ phenomena.gas.color }}
              </div>
              <div v-if="phenomena.gas.odor" class="gas-odor">
                <span class="label">气味：</span>
                {{ phenomena.gas.odor }}
              </div>
              <div v-if="phenomena.gas.description" class="description">
                {{ phenomena.gas.description }}
              </div>
            </div>
          </div>

          <div v-if="phenomena.thermalEffect" class="phenomenon-item thermal">
            <div class="item-header">
              <el-icon :color="thermalIconColor"><Promotion /></el-icon>
              <span>热效应</span>
            </div>
            <div class="thermal-info">
              <el-tag :type="thermalTagType" size="large">
                {{ thermalEffectText }}
              </el-tag>
              <div v-if="phenomena.thermalEffect.value" class="thermal-value">
                ΔH = {{ phenomena.thermalEffect.value }} kJ/mol
              </div>
              <div v-if="phenomena.thermalEffect.description" class="description">
                {{ phenomena.thermalEffect.description }}
              </div>
            </div>
          </div>

          <div v-if="phenomena.light" class="phenomenon-item light">
            <div class="item-header">
              <el-icon color="#F56C6C"><Sunny /></el-icon>
              <span>光现象</span>
            </div>
            <div class="light-info">
              <div class="light-type">{{ phenomena.light.type }}</div>
              <div v-if="phenomena.light.description" class="description">
                {{ phenomena.light.description }}
              </div>
            </div>
          </div>

          <div v-if="phenomena.other" class="phenomenon-item other">
            <div class="item-header">
              <el-icon color="#909399"><MoreFilled /></el-icon>
              <span>其他现象</span>
            </div>
            <div class="other-info">
              {{ phenomena.other }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Brush, Box, Cloudy, Promotion, Sunny, MoreFilled, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  phenomena: {
    type: Object,
    default: () => ({})
  }
})

const thermalIconColor = computed(() => {
  if (!props.phenomena.thermalEffect) return '#909399'
  return props.phenomena.thermalEffect.type === 'exothermic' ? '#F56C6C' : '#409EFF'
})

const thermalTagType = computed(() => {
  if (!props.phenomena.thermalEffect) return 'info'
  return props.phenomena.thermalEffect.type === 'exothermic' ? 'danger' : 'primary'
})

const thermalEffectText = computed(() => {
  if (!props.phenomena.thermalEffect) return ''
  const typeMap = {
    exothermic: '放热反应',
    endothermic: '吸热反应',
    neutral: '热效应不明显'
  }
  return typeMap[props.phenomena.thermalEffect.type] || ''
})
</script>

<style scoped lang="scss">
.phenomenon-card {
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

  .phenomena-content {
    .phenomenon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
    }

    .phenomenon-item {
      padding: 15px;
      border-radius: 8px;
      border: 1px solid var(--el-border-color-light);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        margin-bottom: 12px;
      }

      .description {
        margin-top: 10px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        line-height: 1.6;
      }

      &.color {
        .color-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;

          .color-sample {
            width: 80px;
            height: 50px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--el-border-color);
            font-size: 12px;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }

          .arrow-icon {
            color: var(--el-text-color-secondary);
          }
        }
      }

      &.precipitate,
      &.gas {
        .label {
          color: var(--el-text-color-secondary);
          margin-right: 8px;
        }

        .color-dot {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid var(--el-border-color);
          vertical-align: middle;
          margin-right: 5px;
        }

        .precipitate-type,
        .gas-type,
        .precipitate-color,
        .gas-color,
        .gas-odor {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      &.thermal {
        text-align: center;

        .thermal-value {
          margin-top: 10px;
          font-family: 'Times New Roman', serif;
          font-size: 16px;
        }
      }

      &.light {
        .light-type {
          font-weight: 500;
          color: var(--el-color-danger);
        }
      }

      &.other {
        .other-info {
          color: var(--el-text-color-regular);
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
