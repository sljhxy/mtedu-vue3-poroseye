<template>
  <div class="equation-display">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Operation /></el-icon>
            反应方程式
          </span>
          <el-tag v-if="reaction.reactionType" type="primary" size="small">
            {{ reaction.reactionType }}
          </el-tag>
        </div>
      </template>

      <div class="equation-content">
        <div class="equation-text" v-html="formattedEquation"></div>

        <div v-if="!reaction.isBalanced" class="warning-banner">
          <el-icon color="#E6A23C"><WarningFilled /></el-icon>
          <span>该方程式未配平</span>
        </div>
      </div>
    </el-card>

    <el-collapse v-if="showDetails" class="equation-details">
      <el-collapse-item title="方程式信息" name="details">
        <div class="detail-row">
          <span class="label">反应类型：</span>
          <span>{{ reaction.reactionType || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">配平状态：</span>
          <el-tag :type="reaction.isBalanced ? 'success' : 'warning'" size="small">
            {{ reaction.isBalanced ? '已配平' : '未配平' }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="label">方程式ID：</span>
          <span class="mono">{{ reaction.equationId }}</span>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Operation, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  reaction: {
    type: Object,
    default: () => ({
      equationId: null,
      equationText: '',
      reactionType: '',
      isBalanced: true
    })
  },
  showDetails: {
    type: Boolean,
    default: true
  }
})

const formattedEquation = computed(() => {
  if (!props.reaction.equationText) {
    return '<span class="placeholder">请添加反应物并开始模拟</span>'
  }

  let equation = props.reaction.equationText

  // 格式化下标数字
  equation = equation.replace(/(\d+)/g, '<sub>$1</sub>')

  // 格式化状态符号
  equation = equation.replace(/\(s\)/g, '<span class="state-symbol">(s)</span>')
  equation = equation.replace(/\(l\)/g, '<span class="state-symbol">(l)</span>')
  equation = equation.replace(/\(g\)/g, '<span class="state-symbol">(g)</span>')
  equation = equation.replace(/\(aq\)/g, '<span class="state-symbol">(aq)</span>')

  // 格式化箭头
  equation = equation.replace(/->|→/g, '<span class="arrow">→</span>')
  equation = equation.replace(/<=>|⇌/g, '<span class="arrow">⇌</span>')

  // 分隔反应物和生成物
  const parts = equation.split(/<span class="arrow">→|⇌<\/span>/)
  if (parts.length === 2) {
    equation = `<span class="reactants">${parts[0]}</span><span class="arrow">→</span><span class="products">${parts[1]}</span>`
  }

  return equation
})
</script>

<style scoped lang="scss">
.equation-display {
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

  .equation-content {
    .equation-text {
      font-size: 20px;
      text-align: center;
      padding: 20px;
      line-height: 1.8;
      font-family: 'Times New Roman', serif;
      letter-spacing: 1px;

      :deep(sub) {
        font-size: 0.7em;
        vertical-align: sub;
      }

      .state-symbol {
        font-size: 0.8em;
        color: var(--el-color-info);
      }

      .arrow {
        margin: 0 15px;
        color: var(--el-color-primary);
        font-size: 1.2em;
      }

      .reactants,
      .products {
        display: inline-block;
      }

      .placeholder {
        color: var(--el-text-color-placeholder);
        font-size: 14px;
        font-family: var(--el-font-family);
      }
    }

    .warning-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 15px;
      padding: 10px;
      background-color: var(--el-color-warning-light-9);
      border-radius: 4px;
      color: var(--el-color-warning);
      font-size: 14px;
    }
  }

  .equation-details {
    margin-top: 15px;

    .detail-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: var(--el-text-color-secondary);
        width: 100px;
        flex-shrink: 0;
      }

      .mono {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
