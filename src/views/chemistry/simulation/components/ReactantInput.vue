<template>
  <div class="reactant-input">
    <el-form :model="formData" label-width="100px" label-position="left">
      <el-form-item label="物质名称">
        <el-select
          v-model="formData.substanceId"
          filterable
          remote
          reserve-keyword
          placeholder="搜索或选择物质"
          :remote-method="searchSubstances"
          :loading="loading"
          @change="handleSubstanceChange"
          style="width: 100%"
        >
          <el-option
            v-for="item in substanceOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span>{{ item.name }}</span>
            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
              {{ item.formula }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="化学式">
        <el-input v-model="formData.formula" disabled placeholder="自动填充" />
      </el-form-item>

      <el-form-item label="物质状态">
        <el-select v-model="formData.state" placeholder="选择状态" @change="handleStateChange">
          <el-option label="固体" value="solid" />
          <el-option label="液体" value="liquid" />
          <el-option label="溶液" value="solution" />
          <el-option label="气体" value="gas" />
        </el-select>
      </el-form-item>

      <el-form-item label="数量">
        <el-input-number
          v-model="formData.amount"
          :min="0"
          :precision="2"
          :step="0.1"
          controls-position="right"
        />
        <el-select
          v-model="formData.unit"
          :style="{ width: '100px', marginLeft: '10px' }"
          @change="handleUnitChange"
        >
          <el-option
            v-for="unit in unitOptions"
            :key="unit"
            :label="unit"
            :value="unit"
          />
        </el-select>
      </el-form-item>

      <template v-if="formData.state === 'solution'">
        <el-form-item label="溶液浓度">
          <el-input-number
            v-model="formData.concentration"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
          />
          <el-select
            v-model="formData.concentrationUnit"
            :style="{ width: '120px', marginLeft: '10px' }"
          >
            <el-option label="mol/L" value="mol/L" />
            <el-option label="g/L" value="g/L" />
            <el-option label="mol/mL" value="mol/mL" />
            <el-option label="%" value="%" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="formData.state === 'gas'">
        <el-form-item label="气体压力">
          <el-input-number
            v-model="formData.pressure"
            :min="0"
            :precision="2"
            :step="0.01"
            controls-position="right"
          />
          <span style="margin-left: 10px">atm</span>
        </el-form-item>
      </template>

      <el-form-item label="物质的量">
        <el-input v-model="molesDisplay" disabled>
          <template #append>mol</template>
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { searchSubstances as searchSubstancesApi } from '@/api/chemistry/simulation'
import { calculateMoles, SUBSTANCE_UNITS } from '@/utils/chemistry'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
  substanceId: null,
  formula: '',
  state: 'solid',
  amount: 1,
  unit: 'g',
  concentration: null,
  concentrationUnit: 'mol/L',
  pressure: 1,
  moles: null
})

const loading = ref(false)
const substanceOptions = ref([])

const unitOptions = computed(() => SUBSTANCE_UNITS[formData.value.state] || [])

const molesDisplay = computed(() => {
  if (formData.value.moles !== null) {
    return formData.value.moles.toFixed(4)
  }
  return '-'
})

watch(() => props.modelValue, (val) => {
  if (val && Object.keys(val).length > 0) {
    formData.value = { ...formData.value, ...val }
  }
}, { immediate: true })

watch(formData, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

async function searchSubstances(query) {
  if (!query) {
    substanceOptions.value = []
    return
  }
  loading.value = true
  try {
    // TODO: 调用实际的搜索API
    // const res = await searchSubstancesApi(query)
    // substanceOptions.value = res.data

    // 临时数据
    substanceOptions.value = [
      { id: 1, name: '氢气', formula: 'H₂', molarMass: 2.016 },
      { id: 2, name: '氧气', formula: 'O₂', molarMass: 31.998 },
      { id: 3, name: '水', formula: 'H₂O', molarMass: 18.015 },
      { id: 4, name: '盐酸', formula: 'HCl', molarMass: 36.461 },
      { id: 5, name: '氢氧化钠', formula: 'NaOH', molarMass: 39.997 }
    ].filter(item => item.name.includes(query) || item.formula.includes(query))
  } finally {
    loading.value = false
  }
}

function handleSubstanceChange(id) {
  const substance = substanceOptions.value.find(item => item.id === id)
  if (substance) {
    formData.value.formula = substance.formula
    formData.value.molarMass = substance.molarMass
    calculateMolesValue()
  }
}

function handleStateChange() {
  // 重置单位为该状态的第一个可用单位
  formData.value.unit = unitOptions.value[0] || 'g'
  calculateMolesValue()
}

function handleUnitChange() {
  calculateMolesValue()
}

function calculateMolesValue() {
  if (formData.value.amount && formData.value.molarMass) {
    formData.value.moles = calculateMoles(
      formData.value.amount,
      formData.value.unit,
      formData.value.molarMass,
      formData.value.state,
      formData.value.concentration,
      formData.value.concentrationUnit,
      formData.value.pressure
    )
  }
}
</script>

<style scoped lang="scss">
.reactant-input {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}
</style>
