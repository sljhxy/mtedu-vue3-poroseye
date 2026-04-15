<template>
  <div class="condition-input">
    <el-form :model="formData" label-width="100px" label-position="left">
      <el-form-item label="温度">
        <el-input-number
          v-model="formData.temperature"
          :min="-273.15"
          :max="5000"
          :precision="2"
          :step="10"
          controls-position="right"
        />
        <span style="margin-left: 10px">°C</span>
      </el-form-item>

      <el-form-item label="压力">
        <el-input-number
          v-model="formData.pressure"
          :min="0"
          :precision="2"
          :step="0.1"
          controls-position="right"
        />
        <span style="margin-left: 10px">atm</span>
      </el-form-item>

      <el-form-item label="溶剂">
        <el-select
          v-model="formData.solvent"
          filterable
          allow-create
          placeholder="选择或输入溶剂"
          style="width: 100%"
        >
          <el-option label="无溶剂" value="" />
          <el-option label="水 (H₂O)" value="H2O" />
          <el-option label="乙醇 (C₂H₅OH)" value="C2H5OH" />
          <el-option label="丙酮 (CH₃COCH₃)" value="CH3COCH3" />
          <el-option label="苯 (C₆H₆)" value="C6H6" />
          <el-option label="四氯化碳 (CCl₄)" value="CCl4" />
          <el-option label="二氯甲烷 (CH₂Cl₂)" value="CH2Cl2" />
        </el-select>
      </el-form-item>

      <el-form-item label="催化剂">
        <el-input
          v-model="formData.catalyst"
          placeholder="输入催化剂名称（可选）"
          clearable
        />
      </el-form-item>

      <el-form-item label="pH值">
        <el-slider
          v-model="formData.ph"
          :min="0"
          :max="14"
          :step="0.1"
          :marks="phMarks"
          show-stops
        />
      </el-form-item>

      <el-form-item label="反应环境">
        <el-checkbox v-model="formData.hasOxygen">有氧气存在</el-checkbox>
        <el-checkbox v-model="formData.isLight" style="margin-left: 15px">光照条件</el-checkbox>
      </el-form-item>

      <el-form-item label="特殊条件">
        <el-input
          v-model="formData.specialConditions"
          type="textarea"
          :rows="3"
          placeholder="描述其他特殊条件..."
        />
      </el-form-item>
    </el-form>

    <div class="quick-conditions">
      <div class="quick-title">快速设置：</div>
      <el-space wrap>
        <el-button size="small" @click="setStandardConditions">标准状态</el-button>
        <el-button size="small" @click="setRoomConditions">室温常压</el-button>
        <el-button size="small" @click="setHighTempConditions">高温条件</el-button>
        <el-button size="small" @click="setAcidicConditions">酸性环境</el-button>
        <el-button size="small" @click="setAlkalineConditions">碱性环境</el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
  temperature: 25,
  pressure: 1,
  solvent: '',
  catalyst: '',
  ph: 7,
  hasOxygen: false,
  isLight: false,
  specialConditions: ''
})

const phMarks = {
  0: '0',
  7: '7',
  14: '14'
}

watch(() => props.modelValue, (val) => {
  if (val && Object.keys(val).length > 0) {
    formData.value = { ...formData.value, ...val }
  }
}, { immediate: true })

watch(formData, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

function setStandardConditions() {
  formData.value.temperature = 25
  formData.value.pressure = 1
  formData.value.ph = 7
  formData.value.hasOxygen = false
  formData.value.isLight = false
}

function setRoomConditions() {
  formData.value.temperature = 25
  formData.value.pressure = 1
}

function setHighTempConditions() {
  formData.value.temperature = 500
  formData.value.pressure = 1
}

function setAcidicConditions() {
  formData.value.ph = 1
}

function setAlkalineConditions() {
  formData.value.ph = 13
}
</script>

<style scoped lang="scss">
.condition-input {
  .quick-conditions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color);

    .quick-title {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 10px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-slider__marks-text) {
    font-size: 12px;
  }
}
</style>
