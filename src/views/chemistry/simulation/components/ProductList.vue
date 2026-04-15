<template>
  <div class="product-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Box /></el-icon>
            生成物信息
          </span>
          <el-button
            v-if="products.length > 0"
            link
            type="primary"
            @click="showUnitConverter = !showUnitConverter"
          >
            {{ showUnitConverter ? '隐藏' : '显示' }}单位换算
          </el-button>
        </div>
      </template>

      <div v-if="products.length === 0" class="empty-state">
        <el-empty description="暂无生成物数据" :image-size="80" />
      </div>

      <div v-else class="products-content">
        <el-table :data="products" stripe style="width: 100%">
          <el-table-column label="物质" min-width="150">
            <template #default="{ row }">
              <div class="substance-cell">
                <div class="formula">{{ row.formula }}</div>
                <div class="name">{{ row.name }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getStateTagType(row.state)" size="small">
                {{ getStateLabel(row.state) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="摩尔质量" width="110" align="right">
            <template #default="{ row }">
              {{ row.molarMass?.toFixed(2) || '-' }} g/mol
            </template>
          </el-table-column>

          <el-table-column label="物质的量" width="110" align="right">
            <template #default="{ row }">
              {{ row.moles?.toFixed(4) || '-' }} mol
            </template>
          </el-table-column>

          <el-table-column label="质量" width="100" align="right">
            <template #default="{ row }">
              <template v-if="row.moles && row.molarMass">
                {{ (row.moles * row.molarMass).toFixed(2) }} g
              </template>
              <template v-else>-</template>
            </template>
          </el-table-column>

          <el-table-column label="产率" width="90" align="center">
            <template #default="{ row }">
              <el-progress
                v-if="row.yield !== undefined"
                :percentage="row.yield"
                :color="getProgressColor(row.yield)"
                :stroke-width="16"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                @click="showConverter(row)"
              >
                换算
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 单位换算面板 -->
        <el-collapse-transition>
          <div v-show="showUnitConverter && selectedProduct" class="converter-panel">
            <el-divider>单位换算</el-divider>
            <div class="converter-content">
              <div class="converter-row">
                <span class="label">物质：</span>
                <span class="value">{{ selectedProduct.formula }} ({{ selectedProduct.name }})</span>
              </div>

              <el-divider style="margin: 15px 0" />

              <div class="converter-grid">
                <div class="converter-item">
                  <div class="item-label">物质的量</div>
                  <div class="item-value">{{ (selectedProduct.moles || 0).toFixed(4) }} mol</div>
                </div>

                <div class="converter-item" v-if="selectedProduct.molarMass">
                  <div class="item-label">质量</div>
                  <div class="item-value">
                    {{ ((selectedProduct.moles || 0) * selectedProduct.molarMass).toFixed(2) }} g
                  </div>
                </div>

                <div class="converter-item" v-if="selectedProduct.state === 'gas'">
                  <div class="item-label">标准状况体积</div>
                  <div class="item-value">
                    {{ calculateStandardVolume(selectedProduct.moles).toFixed(2) }} L
                  </div>
                </div>

                <div class="converter-item" v-if="selectedProduct.state === 'gas' && conditions">
                  <div class="item-label">实际体积</div>
                  <div class="item-value">
                    {{ calculateActualVolume(selectedProduct.moles).toFixed(2) }} L
                  </div>
                </div>

                <div class="converter-item" v-if="selectedProduct.state === 'solution' || selectedProduct.state === 'liquid'">
                  <div class="item-label">1mol/L溶液体积</div>
                  <div class="item-value">
                    {{ (selectedProduct.moles || 0).toFixed(2) }} L
                  </div>
                </div>

                <div class="converter-item" v-if="selectedProduct.state === 'solid' && selectedProduct.molarMass">
                  <div class="item-label">物质的量浓度 (1L)</div>
                  <div class="item-value">
                    {{ ((selectedProduct.moles || 0) / 1).toFixed(4) }} mol/L
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Box } from '@element-plus/icons-vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  conditions: {
    type: Object,
    default: null
  }
})

const showUnitConverter = ref(false)
const selectedProduct = ref(null)

function getStateLabel(state) {
  const labels = {
    solid: '固体',
    liquid: '液体',
    gas: '气体',
    solution: '溶液',
    aqueous: '溶液'
  }
  return labels[state] || state
}

function getStateTagType(state) {
  const types = {
    solid: '',
    liquid: 'warning',
    gas: 'danger',
    solution: 'success',
    aqueous: 'success'
  }
  return types[state] || 'info'
}

function getProgressColor(yieldValue) {
  if (yieldValue >= 90) return '#67C23A'
  if (yieldValue >= 70) return '#E6A23C'
  if (yieldValue >= 50) return '#F56C6C'
  return '#909399'
}

function showConverter(product) {
  if (selectedProduct.value?.id === product.id) {
    selectedProduct.value = null
    showUnitConverter.value = false
  } else {
    selectedProduct.value = product
    showUnitConverter.value = true
  }
}

function calculateStandardVolume(moles) {
  // 标准状况下，1mol气体体积为22.4L
  return (moles || 0) * 22.4
}

function calculateActualVolume(moles) {
  if (!props.conditions) return 0
  // 使用理想气体状态方程 PV = nRT
  // V = nRT/P
  const R = 0.0821 // L·atm/(mol·K)
  const T = props.conditions.temperature + 273.15 // 转换为开尔文
  const P = props.conditions.pressure || 1 // atm
  return (moles || 0) * R * T / P
}
</script>

<style scoped lang="scss">
.product-list {
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

  .products-content {
    .substance-cell {
      .formula {
        font-family: 'Times New Roman', serif;
        font-size: 16px;
        font-weight: 500;
      }

      .name {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }

    .converter-panel {
      margin-top: 20px;
      padding: 20px;
      background-color: var(--el-fill-color-light);
      border-radius: 8px;

      .converter-content {
        .converter-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .label {
            color: var(--el-text-color-secondary);
            margin-right: 10px;
          }

          .value {
            font-weight: 500;
          }
        }

        .converter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 15px;

          .converter-item {
            background-color: var(--el-bg-color);
            padding: 12px;
            border-radius: 6px;
            text-align: center;

            .item-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-bottom: 8px;
            }

            .item-value {
              font-size: 16px;
              font-weight: 500;
              color: var(--el-color-primary);
              font-family: 'Times New Roman', serif;
            }
          }
        }
      }
    }
  }
}
</style>
