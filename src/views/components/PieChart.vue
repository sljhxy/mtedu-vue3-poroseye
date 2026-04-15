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
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: '#606266'
        }
      },
      color: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f'
      ],
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