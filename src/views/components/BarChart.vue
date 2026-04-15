<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <slot name="actions"></slot>
    </div>
    <div ref="chartRef" class="chart-wrapper" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 300
  },
  option: {
    type: Object,
    default: () => ({})
  }
})

const chartRef = ref(null)
let chartInstance = null

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  setOption(props.option)
}

function setOption(option) {
  if (chartInstance) {
    chartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLabel: {
          color: '#606266',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e4e7ed'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#606266',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#f0f2f5'
          }
        }
      },
      ...option
    })
  }
}

function resize() {
  chartInstance?.resize()
}

watch(() => props.option, (newVal) => {
  setOption(newVal)
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initChart()
  })
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chartInstance?.dispose()
})

defineExpose({
  setOption,
  resize
})
</script>

<style lang="scss" scoped>
.chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
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
  padding-left: 12px;
  border-left: 4px solid #409EFF;
}

.chart-wrapper {
  width: 100%;
}
</style>