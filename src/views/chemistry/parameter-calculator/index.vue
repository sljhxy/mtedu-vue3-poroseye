<template>
  <div class="parameter-calculator-container">
    <!-- 标题 -->
    <div class="page-header">
      <h2>物质参数计算器</h2>
      <p>输入已知参数，自动计算其他相关物理量</p>
    </div>

    <div class="calculator-content">
      <!-- 左侧：参数输入区 -->
      <div class="input-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>参数输入</span>
              <el-button type="primary" size="small" @click="handleCalculate" :loading="calculating">
                <el-icon><Refresh /></el-icon>
                计算
              </el-button>
            </div>
          </template>

          <el-form ref="formRef" :model="params" label-width="100px" size="default">
            <!-- 物质选择 -->
            <el-form-item label="选择物质">
              <el-select
                v-model="params.substanceId"
                filterable
                placeholder="选择物质（可选）"
                clearable
                @change="handleSubstanceChange"
                style="width: 100%"
              >
                <el-option
                  v-for="item in substanceList"
                  :key="item.id"
                  :label="`${item.nameZh} (${item.formula})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <!-- 质量相关 -->
            <el-divider content-position="left">质量与摩尔质量</el-divider>
            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="质量">
                  <el-input-number
                    v-model="params.mass"
                    :precision="4"
                    :step="0.1"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-select v-model="params.massUnit" @change="handleCalculate">
                    <el-option label="g" value="g" />
                    <el-option label="kg" value="kg" />
                    <el-option label="mg" value="mg" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="摩尔质量">
                  <el-input-number
                    v-model="params.molarMass"
                    :precision="6"
                    :step="0.01"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <span class="unit-label">g/mol</span>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 体积相关 -->
            <el-divider content-position="left">体积与密度</el-divider>
            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="体积">
                  <el-input-number
                    v-model="params.volume"
                    :precision="4"
                    :step="0.1"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-select v-model="params.volumeUnit" @change="handleCalculate">
                    <el-option label="cm³" value="cm3" />
                    <el-option label="mL" value="mL" />
                    <el-option label="L" value="L" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="密度">
                  <el-input-number
                    v-model="params.density"
                    :precision="4"
                    :step="0.01"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <span class="unit-label">g/cm³</span>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 条件参数 -->
            <el-divider content-position="left">环境条件</el-divider>
            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="温度">
                  <el-input-number
                    v-model="params.temperature"
                    :precision="2"
                    :step="0.1"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-select v-model="params.temperatureUnit" @change="handleCalculate">
                    <el-option label="K" value="K" />
                    <el-option label="°C" value="C" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="压强">
                  <el-input-number
                    v-model="params.pressure"
                    :precision="3"
                    :step="0.1"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-select v-model="params.pressureUnit" @change="handleCalculate">
                    <el-option label="kPa" value="kPa" />
                    <el-option label="atm" value="atm" />
                    <el-option label="Pa" value="Pa" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 溶液浓度（如果是溶液） -->
            <el-divider content-position="left">溶液参数（可选）</el-divider>
            <el-row :gutter="15">
              <el-col :span="16">
                <el-form-item label="浓度">
                  <el-input-number
                    v-model="params.concentration"
                    :precision="3"
                    :step="0.1"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                    @change="handleCalculate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-select v-model="params.concentrationUnit" @change="handleCalculate">
                    <el-option label="mol/L" value="mol/L" />
                    <el-option label="g/L" value="g/L" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 快捷操作 -->
            <el-form-item>
              <el-space>
                <el-button @click="resetParams">重置</el-button>
                <el-button type="success" @click="loadStandardConditions">标准状况</el-button>
                <el-button type="warning" @click="loadRoomConditions">常温常压</el-button>
              </el-space>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧：计算结果 -->
      <div class="result-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>计算结果</span>
              <el-tag v-if="hasResults" type="success" size="small">已计算</el-tag>
              <el-tag v-else type="info" size="small">未计算</el-tag>
            </div>
          </template>

          <div v-if="hasResults" class="results-content">
            <!-- 物质的量 -->
            <div class="result-item">
              <div class="result-label">物质的量</div>
              <div class="result-value">
                <span class="value">{{ results.moles?.toFixed(6) || '-' }}</span>
                <span class="unit">mol</span>
              </div>
            </div>

            <!-- 摩尔体积 -->
            <div class="result-item">
              <div class="result-label">摩尔体积</div>
              <div class="result-value">
                <span class="value">{{ results.molarVolume?.toFixed(4) || '-' }}</span>
                <span class="unit">cm³/mol</span>
              </div>
            </div>

            <!-- 标准状况体积 -->
            <div class="result-item">
              <div class="result-label">标准状况体积 (STP)</div>
              <div class="result-value">
                <span class="value">{{ results.stpVolume?.toFixed(4) || '-' }}</span>
                <span class="unit">L</span>
              </div>
            </div>

            <!-- 粒子数 -->
            <div class="result-item">
              <div class="result-label">粒子数</div>
              <div class="result-value">
                <span class="value">{{ results.particleCount?.toExponential(4) || '-' }}</span>
                <span class="unit">个</span>
              </div>
            </div>

            <!-- 当量浓度（如果是溶液） -->
            <div v-if="params.concentration" class="result-item">
              <div class="result-label">溶质质量</div>
              <div class="result-value">
                <span class="value">{{ results.soluteMass?.toFixed(4) || '-' }}</span>
                <span class="unit">g</span>
              </div>
            </div>

            <!-- 温度换算 -->
            <el-divider />
            <div class="result-section-title">温度换算</div>
            <div class="result-item">
              <div class="result-label">摄氏度</div>
              <div class="result-value">
                <span class="value">{{ results.tempCelsius?.toFixed(2) || '-' }}</span>
                <span class="unit">°C</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">开尔文</div>
              <div class="result-value">
                <span class="value">{{ results.tempKelvin?.toFixed(2) || '-' }}</span>
                <span class="unit">K</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">华氏度</div>
              <div class="result-value">
                <span class="value">{{ results.tempFahrenheit?.toFixed(2) || '-' }}</span>
                <span class="unit">°F</span>
              </div>
            </div>

            <!-- 压强换算 -->
            <el-divider />
            <div class="result-section-title">压强换算</div>
            <div class="result-item">
              <div class="result-label">帕斯卡</div>
              <div class="result-value">
                <span class="value">{{ results.pressurePa?.toFixed(2) || '-' }}</span>
                <span class="unit">Pa</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">千帕</div>
              <div class="result-value">
                <span class="value">{{ results.pressureKPa?.toFixed(3) || '-' }}</span>
                <span class="unit">kPa</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">大气压</div>
              <div class="result-value">
                <span class="value">{{ results.pressureAtm?.toFixed(4) || '-' }}</span>
                <span class="unit">atm</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">毫米汞柱</div>
              <div class="result-value">
                <span class="value">{{ results.pressureMmHg?.toFixed(2) || '-' }}</span>
                <span class="unit">mmHg</span>
              </div>
            </div>
          </div>

          <div v-else class="no-results">
            <el-empty description="请输入参数后点击计算" />
          </div>
        </el-card>

        <!-- 计算公式说明 -->
        <el-card shadow="hover" style="margin-top: 15px">
          <template #header>
            <span>计算公式</span>
          </template>
          <div class="formula-list">
            <div class="formula-item">
              <span class="formula-name">物质的量:</span>
              <span class="formula-text">n = m / M</span>
            </div>
            <div class="formula-item">
              <span class="formula-name">摩尔体积:</span>
              <span class="formula-text">Vm = V / n</span>
            </div>
            <div class="formula-item">
              <span class="formula-name">理想气体状态方程:</span>
              <span class="formula-text">PV = nRT</span>
            </div>
            <div class="formula-item">
              <span class="formula-name">粒子数:</span>
              <span class="formula-text">N = n × NA (NA = 6.022×10²³)</span>
            </div>
            <div class="formula-item">
              <span class="formula-name">温度换算:</span>
              <span class="formula-text">K = °C + 273.15, °F = °C × 1.8 + 32</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup name="ParameterCalculator">
import { listSubstance } from '@/api/chemistry/substance'
import { Refresh } from '@element-plus/icons-vue'

// 参数状态
const params = ref({
  substanceId: null,
  mass: null,
  massUnit: 'g',
  molarMass: null,
  volume: null,
  volumeUnit: 'cm3',
  density: null,
  temperature: 298.15,
  temperatureUnit: 'K',
  pressure: 101.325,
  pressureUnit: 'kPa',
  concentration: null,
  concentrationUnit: 'mol/L'
})

// 计算结果
const results = ref({})
const hasResults = ref(false)
const calculating = ref(false)

// 物质列表
const substanceList = ref([])

// 常量
const AVOGADRO_NUMBER = 6.022e23 // 阿伏伽德罗常数
const GAS_CONSTANT = 8.314 // 理想气体常数 J/(mol·K)
const STANDARD_TEMPERATURE = 273.15 // 标准温度 K
const STANDARD_PRESSURE = 101.325 // 标准压强 kPa
const MOLAR_VOLUME_STP = 22.414 // 标准摩尔体积 L/mol

/** 加载物质列表 */
function loadSubstances() {
  listSubstance({ pageNum: 1, pageSize: 1000 }).then(response => {
    substanceList.value = response.rows || []
  }).catch(() => {
    substanceList.value = []
  })
}

/** 物质选择变化 */
function handleSubstanceChange(substanceId) {
  const substance = substanceList.value.find(s => s.id === substanceId)
  if (substance) {
    params.value.molarMass = substance.molarMass
    params.value.density = substance.density
    handleCalculate()
  }
}

/** 单位转换 - 质量转克 */
function massToGrams() {
  const mass = params.value.mass || 0
  switch (params.value.massUnit) {
    case 'kg': return mass * 1000
    case 'mg': return mass / 1000
    default: return mass
  }
}

/** 单位转换 - 体积转升 */
function volumeToLiters() {
  const volume = params.value.volume || 0
  switch (params.value.volumeUnit) {
    case 'cm3':
    case 'mL': return volume / 1000
    case 'L': return volume
    default: return volume / 1000
  }
}

/** 单位转换 - 温度转开尔文 */
function temperatureToKelvin() {
  const temp = params.value.temperature || 0
  switch (params.value.temperatureUnit) {
    case 'C': return temp + 273.15
    default: return temp
  }
}

/** 单位转换 - 压强转帕斯卡 */
function pressureToPascals() {
  const pressure = params.value.pressure || 0
  switch (params.value.pressureUnit) {
    case 'kPa': return pressure * 1000
    case 'atm': return pressure * 101325
    default: return pressure
  }
}

/** 计算所有参数 */
function handleCalculate() {
  calculating.value = true

  setTimeout(() => {
    try {
      const mass = massToGrams()
      const molarMass = params.value.molarMass
      const volume = volumeToLiters()
      const tempK = temperatureToKelvin()
      const pressurePa = pressureToPascals()

      // 计算物质的量 n = m / M
      let moles = 0
      if (mass && molarMass) {
        moles = mass / molarMass
      } else if (params.value.concentration && params.value.volume) {
        // 从浓度计算 n = C × V
        if (params.value.concentrationUnit === 'mol/L') {
          moles = params.value.concentration * volume
        }
      }

      // 计算摩尔体积 Vm = V / n
      let molarVolume = 0
      if (volume > 0 && moles > 0) {
        molarVolume = (volume * 1000) / moles // cm³/mol
      } else if (pressurePa > 0 && tempK > 0) {
        // 使用理想气体状态方程 PV = nRT，Vm = RT/P
        molarVolume = (GAS_CONSTANT * tempK) / (pressurePa / 1000) * 1000 // cm³/mol
      }

      // 计算标准状况体积
      let stpVolume = 0
      if (moles > 0) {
        stpVolume = moles * MOLAR_VOLUME_STP
      }

      // 计算粒子数
      const particleCount = moles > 0 ? moles * AVOGADRO_NUMBER : 0

      // 计算溶质质量
      let soluteMass = 0
      if (params.value.concentration && params.value.volume) {
        if (params.value.concentrationUnit === 'g/L') {
          soluteMass = params.value.concentration * volume
        } else if (params.value.concentrationUnit === 'mol/L' && molarMass) {
          soluteMass = params.value.concentration * volume * molarMass
        }
      }

      // 温度换算
      const tempCelsius = tempK - 273.15
      const tempFahrenheit = tempCelsius * 1.8 + 32

      // 压强换算
      const pressureKPa = pressurePa / 1000
      const pressureAtm = pressurePa / 101325
      const pressureMmHg = pressurePa / 133.322

      results.value = {
        moles: moles || null,
        molarVolume: molarVolume || null,
        stpVolume: stpVolume || null,
        particleCount: particleCount || null,
        soluteMass: soluteMass || null,
        tempCelsius: tempCelsius || null,
        tempKelvin: tempK || null,
        tempFahrenheit: tempFahrenheit || null,
        pressurePa: pressurePa || null,
        pressureKPa: pressureKPa || null,
        pressureAtm: pressureAtm || null,
        pressureMmHg: pressureMmHg || null
      }

      hasResults.value = !!(mass || molarMass || volume || params.value.concentration)
    } catch (error) {
      console.error('计算错误:', error)
    } finally {
      calculating.value = false
    }
  }, 100)
}

/** 重置参数 */
function resetParams() {
  params.value = {
    substanceId: null,
    mass: null,
    massUnit: 'g',
    molarMass: null,
    volume: null,
    volumeUnit: 'cm3',
    density: null,
    temperature: 298.15,
    temperatureUnit: 'K',
    pressure: 101.325,
    pressureUnit: 'kPa',
    concentration: null,
    concentrationUnit: 'mol/L'
  }
  results.value = {}
  hasResults.value = false
}

/** 加载标准状况 */
function loadStandardConditions() {
  params.value.temperature = 273.15
  params.value.temperatureUnit = 'K'
  params.value.pressure = 101.325
  params.value.pressureUnit = 'kPa'
  handleCalculate()
}

/** 加载常温常压 */
function loadRoomConditions() {
  params.value.temperature = 298.15
  params.value.temperatureUnit = 'K'
  params.value.pressure = 101.325
  params.value.pressureUnit = 'kPa'
  handleCalculate()
}

// 初始化
onMounted(() => {
  loadSubstances()
})
</script>

<style lang="scss" scoped>
.parameter-calculator-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }
}

.calculator-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit-label {
  display: inline-block;
  width: 100%;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.results-content {
  .result-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .result-label {
      font-size: 14px;
      color: #606266;
    }

    .result-value {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .value {
        font-size: 18px;
        font-weight: 600;
        color: #409EFF;
        font-family: 'Consolas', monospace;
      }

      .unit {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.no-results {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.formula-list {
  .formula-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .formula-name {
      font-size: 13px;
      color: #606266;
      min-width: 140px;
    }

    .formula-text {
      font-size: 14px;
      color: #303133;
      font-family: 'Times New Roman', serif;
    }
  }
}
</style>
