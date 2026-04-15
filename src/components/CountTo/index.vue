<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  startVal: {
    type: Number,
    default: 0
  },
  endVal: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  decimals: {
    type: Number,
    default: 0
  },
  decimal: {
    type: String,
    default: '.'
  },
  separator: {
    type: String,
    default: ','
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  useEasing: {
    type: Boolean,
    default: true
  },
  easingFn: {
    type: Function,
    default: null
  }
})

const displayValue = ref(props.startVal)

// 缓动函数
const easingFn = props.easingFn || ((t, b, c, d) => {
  return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b
})

function formatNumber(num) {
  const { decimals, decimal, separator, prefix, suffix } = props
  let numStr = num.toFixed(decimals)
  const parts = numStr.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return prefix + parts.join(decimal) + suffix
}

function startAnimation() {
  const { startVal, endVal, duration, useEasing } = props
  const startTime = Date.now()
  const start = startVal
  const end = endVal
  const range = end - start

  const animate = () => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed < duration) {
      const progress = elapsed / duration
      const current = useEasing
        ? easingFn(elapsed, start, range, duration)
        : start + range * progress
      displayValue.value = current
      requestAnimationFrame(animate)
    } else {
      displayValue.value = end
    }
  }

  animate()
}

onMounted(() => {
  if (props.autoplay) {
    startAnimation()
  }
})

watch(() => props.endVal, () => {
  startAnimation()
})
</script>
