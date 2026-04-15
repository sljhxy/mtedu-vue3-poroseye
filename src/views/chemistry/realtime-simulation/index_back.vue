<template>
  <div class="realtime-simulation-container">
    <!-- 标题 -->
    <div class="page-header">
      <h2>化学实时模拟器</h2>
      <p>选择反应物和条件，实时模拟化学反应过程</p>
    </div>

    <div class="simulation-content">
      <!-- 左侧：输入区 -->
      <div class="input-panel">
        <!-- 启动表单 -->
        <el-card shadow="hover" v-if="!simulationId">
          <template #header>
            <div class="card-header">
              <span>模拟设置</span>
            </div>
          </template>

          <!-- 反应物 -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">反应物 (1-4个)</span>
              <el-button
                type="primary"
                size="small"
                @click="addReactant"
                :disabled="reactants.length >= 4"
              >
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>

            <div v-if="reactants.length === 0" class="empty-tip">
              <el-empty description="请添加反应物" :image-size="60" />
            </div>

            <div v-else class="reactants-list">
              <div
                v-for="(reactant, index) in reactants"
                :key="index"
                class="reactant-item"
              >
                <div class="reactant-header">
                  <el-tag type="primary" size="small">反应物 {{ index + 1 }}</el-tag>
                  <el-button
                    v-if="reactants.length > 1"
                    type="danger"
                    size="small"
                    text
                    @click="removeReactant(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>

                <el-form label-width="70px" size="small">
                  <el-form-item label="物质">
                    <el-select
                      v-model="reactant.id"
                      filterable
                      placeholder="选择物质"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in substanceList"
                        :key="item.id"
                        :label="`${item.nameZh} (${item.formula})`"
                        :value="item.id"
                      >
                        <span>{{ item.nameZh }}</span>
                        <span style="float: right; color: var(--el-text-color-secondary)">
                          {{ item.formula }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-row :gutter="10">
                    <el-col :span="14">
                      <el-form-item label="数量">
                        <el-input-number
                          v-model="reactant.amount"
                          :min="0"
                          :precision="2"
                          :step="0.1"
                          controls-position="right"
                          style="width: 100%"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="10">
                      <el-form-item label="单位">
                        <el-select v-model="reactant.unit" style="width: 100%">
                          <el-option label="g (克)" value="g" />
                          <el-option label="kg (千克)" value="kg" />
                          <el-option label="L (升)" value="L" />
                          <el-option label="mL (毫升)" value="mL" />
                          <el-option label="mol (摩尔)" value="mol" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-form-item
                    v-if="reactant.unit === 'mL' || reactant.unit === 'L'"
                    label="浓度"
                  >
                    <el-input
                      v-model="reactant.concentration"
                      placeholder="请输入浓度"
                      style="width: 100%"
                    />
                    <span style="margin-left: 5px; color: #909399; font-size: 12px">mol/L</span>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>

          <!-- 催化剂 -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">催化剂 (可选)</span>
              <el-button
                type="success"
                size="small"
                @click="addCatalyst"
              >
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>

            <div v-if="catalysts.length === 0" class="empty-tip-small">
              <span style="color: #909399; font-size: 12px">暂无催化剂</span>
            </div>

            <div v-else class="catalysts-list">
              <div
                v-for="(catalyst, index) in catalysts"
                :key="index"
                class="catalyst-item"
              >
                <el-tag type="success" size="small">催化剂 {{ index + 1 }}</el-tag>
                <el-select
                  v-model="catalyst.id"
                  filterable
                  placeholder="选择催化剂"
                  size="small"
                  style="width: 140px; margin-left: 10px"
                >
                  <el-option
                    v-for="item in substanceList"
                    :key="item.id"
                    :label="item.nameZh"
                    :value="item.id"
                  />
                </el-select>
                <el-input-number
                  v-model="catalyst.amount"
                  :min="0"
                  :precision="2"
                  size="small"
                  style="width: 100px; margin-left: 10px"
                />
                <el-select v-model="catalyst.unit" size="small" style="width: 80px; margin-left: 5px">
                  <el-option label="g" value="g" />
                  <el-option label="mL" value="mL" />
                  <el-option label="mol" value="mol" />
                </el-select>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="removeCatalyst(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 反应条件 -->
          <div class="section">
            <div class="section-title">反应条件</div>
            <el-form label-width="90px" size="small">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="初始温度">
                    <el-input-number
                      v-model="conditions.temperature"
                      :min="0"
                      :precision="2"
                      :step="1"
                      controls-position="right"
                      style="width: 100%"
                    />
                    <span style="margin-left: 5px; color: #909399; font-size: 12px">K</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="压强">
                    <el-input-number
                      v-model="conditions.pressure"
                      :min="0"
                      :precision="0"
                      :step="1000"
                      controls-position="right"
                      style="width: 100%"
                    />
                    <span style="margin-left: 5px; color: #909399; font-size: 12px">Pa</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="pH值">
                    <el-input-number
                      v-model="conditions.ph"
                      :min="0"
                      :max="14"
                      :precision="1"
                      :step="0.1"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="点燃">
                    <el-switch v-model="conditions.ignited" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="溶剂">
                <el-input
                  v-model="conditions.solvent"
                  placeholder="如: 水、乙醇等（可选）"
                  clearable
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 模拟参数 -->
          <div class="section">
            <div class="section-title">模拟参数</div>
            <el-form label-width="120px" size="small">
              <el-form-item label="体系总体积">
                <el-input-number
                  v-model="totalVolume"
                  :min="0.1"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                  style="width: 150px"
                />
                <span style="margin-left: 5px; color: #909399; font-size: 12px">L</span>
              </el-form-item>
              <el-form-item label="时间步长">
                <el-input-number
                  v-model="timeStep"
                  :min="0.01"
                  :max="1"
                  :precision="2"
                  :step="0.01"
                  controls-position="right"
                  style="width: 150px"
                />
                <span style="margin-left: 5px; color: #909399; font-size: 12px">秒</span>
                <span style="margin-left: 10px; color: #909399; font-size: 11px">建议0.1</span>
              </el-form-item>
              <el-form-item label="速率阈值">
                <el-input-number
                  v-model="rateThreshold"
                  :min="0.000001"
                  :max="0.1"
                  :precision="6"
                  :step="0.000001"
                  controls-position="right"
                  style="width: 150px"
                />
                <span style="margin-left: 5px; color: #909399; font-size: 12px">mol/s</span>
                <span style="margin-left: 10px; color: #909399; font-size: 11px">默认0.000001</span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 温度提示 -->
          <el-alert
            type="info"
            :closable="false"
            style="margin-bottom: 15px"
          >
            <template #default>
              <div style="font-size: 12px; line-height: 1.8">
                <div>💡 温度使用开尔文(K): 常温25℃ = 298.15K</div>
                <div>💡 WebSocket直连端口: 9209（不经过网关）</div>
                <div>💡 启动后立即连接WebSocket，服务端等待1500ms</div>
              </div>
            </template>
          </el-alert>

          <!-- 开始按钮 -->
          <el-button
            type="primary"
            size="large"
            :loading="starting"
            :disabled="reactants.length < 2"
            @click="startSimulation"
            style="width: 100%"
          >
            <el-icon><VideoPlay /></el-icon>
            开始模拟
          </el-button>
        </el-card>

        <!-- 模拟中控制 -->
        <el-card shadow="hover" v-else>
          <template #header>
            <div class="card-header">
              <span>模拟控制</span>
              <el-tag :type="getStatusTagType(status)" size="small">
                {{ getStatusText(status) }}
              </el-tag>
            </div>
          </template>

          <!-- 状态显示 -->
          <div class="status-display">
            <div class="status-item">
              <span class="label">模拟时间</span>
              <span class="value">{{ currentTime.toFixed(1) }}s</span>
            </div>
            <div class="status-item">
              <span class="label">温度</span>
              <span class="value">{{ (temperature - 273.15).toFixed(1) }}℃</span>
            </div>
            <div class="status-item">
              <span class="label">活跃反应</span>
              <span class="value">{{ activeReactions.length }}</span>
            </div>
            <div class="status-item">
              <span class="label">消息数</span>
              <span class="value">{{ messageCount }}</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="progress-bar-wrapper">
            <el-progress :percentage="progress" :stroke-width="10" />
          </div>

          <!-- 控制按钮 -->
          <div class="control-buttons">
            <el-button
              v-if="status === 'RUNNING'"
              type="warning"
              @click="pauseSimulation"
            >
              <el-icon><VideoPause /></el-icon>
              暂停
            </el-button>
            <el-button
              v-if="status === 'PAUSED'"
              type="success"
              @click="resumeSimulation"
            >
              <el-icon><VideoPlay /></el-icon>
              继续
            </el-button>
            <el-button
              type="danger"
              @click="stopSimulation"
            >
              <el-icon><CircleClose /></el-icon>
              停止
            </el-button>
          </div>

          <!-- WebSocket连接状态 -->
          <div class="ws-status">
            <span class="ws-label">WebSocket:</span>
            <el-tag :type="wsConnected ? 'success' : 'danger'" size="small">
              {{ wsConnected ? '已连接' : '未连接' }}
            </el-tag>
          </div>
        </el-card>
      </div>

      <!-- 右侧：结果展示 -->
      <div class="result-panel">
        <!-- 实验现象 -->
        <el-card shadow="hover" v-if="simulationId">
          <template #header>
            <span>实验现象</span>
          </template>

          <div class="phenomena-display">
            <!-- 气体产生 -->
            <div v-if="phenomena.gasEvolution && phenomena.gasEvolution.length > 0" class="phenomenon-item">
              <span class="phenomenon-icon">💨</span>
              <div class="phenomenon-content">
                <div class="phenomenon-title">气体产生</div>
                <div v-for="(gas, idx) in phenomena.gasEvolution" :key="idx" class="phenomenon-detail">
                  {{ gas.name || gas.formula }} {{ gas.rate ? `(${gas.rate} mol/s)` : '' }}
                </div>
              </div>
            </div>

            <!-- 沉淀 -->
            <div v-if="phenomena.precipitation && phenomena.precipitation.length > 0" class="phenomenon-item">
              <span class="phenomenon-icon">🧪</span>
              <div class="phenomenon-content">
                <div class="phenomenon-title">沉淀生成</div>
                <div v-for="(precip, idx) in phenomena.precipitation" :key="idx" class="phenomenon-detail">
                  {{ precip.name || precip.formula }} ({{ precip.color || '' }})
                </div>
              </div>
            </div>

            <!-- 温度变化 -->
            <div v-if="phenomena.temperatureChange !== null && phenomena.temperatureChange !== 0" class="phenomenon-item">
              <span class="phenomenon-icon">🌡️</span>
              <div class="phenomenon-content">
                <div class="phenomenon-title">温度变化</div>
                <div class="phenomenon-detail">
                  {{ phenomena.temperatureChange > 0 ? '+' : '' }}{{ phenomena.temperatureChange }} K
                </div>
              </div>
            </div>

            <!-- 颜色变化 -->
            <div v-if="phenomena.colorChange" class="phenomenon-item">
              <span class="phenomenon-icon">🎨</span>
              <div class="phenomenon-content">
                <div class="phenomenon-title">颜色变化</div>
                <div class="phenomenon-detail">
                  {{ phenomena.colorChange.before }} → {{ phenomena.colorChange.current }}
                </div>
                <div v-if="phenomena.colorChange.description" class="phenomenon-desc">
                  {{ phenomena.colorChange.description }}
                </div>
              </div>
            </div>

            <!-- 现象描述 -->
            <div v-if="phenomena.description" class="phenomenon-item">
              <span class="phenomenon-icon">📝</span>
              <div class="phenomenon-content">
                <div class="phenomenon-detail">{{ phenomena.description }}</div>
              </div>
            </div>

            <!-- 无现象 -->
            <div v-if="!hasPhenomena" class="no-phenomena">
              <span style="color: #909399; font-size: 13px">暂无现象</span>
            </div>
          </div>
        </el-card>

        <!-- 物质状态 -->
        <el-card shadow="hover" v-if="simulationId && substances.length > 0" style="margin-top: 15px">
          <template #header>
            <span>物质状态 ({{ substances.length }})</span>
          </template>

          <el-table :data="substances" size="small" border>
            <el-table-column label="物质" prop="name" width="100" />
            <el-table-column label="化学式" prop="formula" width="80">
              <template #default="scope">
                <span v-html="formatFormula(scope.row.formula)"></span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="70">
              <template #default="scope">
                <el-tag size="small" :type="getStateTagType(scope.row.state)">
                  {{ getStateText(scope.row.state) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="物质的量(mol)" width="90">
              <template #default="scope">
                {{ scope.row.amount?.toFixed(4) || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="浓度(mol/L)">
              <template #default="scope">
                {{ scope.row.concentration?.toFixed(4) || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 活跃反应 -->
        <el-card shadow="hover" v-if="simulationId && activeReactions.length > 0" style="margin-top: 15px">
          <template #header>
            <span>活跃反应 ({{ activeReactions.length }})</span>
          </template>

          <div class="active-reactions">
            <div
              v-for="reaction in activeReactions"
              :key="reaction.equationId"
              class="reaction-item"
            >
              <!-- 方程式 -->
              <div class="equation-text" v-html="reaction.equationHtml || reaction.equationText"></div>

              <!-- 反应状态标签 -->
              <div class="reaction-status">
                <el-tag
                  :type="reaction.status === 'EXECUTING' ? 'danger' : 'info'"
                  size="small"
                >
                  {{ reaction.status === 'EXECUTING' ? '执行中' : '已匹配' }}
                </el-tag>
                <el-tag type="warning" size="small" style="margin-left: 5px">
                  {{ getReactionRateLabel(reaction.reactionRate) }}
                </el-tag>
                <el-tag type="success" size="small" style="margin-left: 5px">
                  {{ reaction.currentRate ? reaction.currentRate.toExponential(2) + ' mol/s' : '0 mol/s' }}
                </el-tag>
              </div>

              <!-- 进度条 -->
              <div class="reaction-progress">
                <el-progress :percentage="(reaction.progress || 0) * 100" :stroke-width="6" />
              </div>

              <!-- 反应详情 -->
              <div class="reaction-details">
                <div v-if="reaction.enthalpyChange" class="detail-item">
                  <span class="label">焓变:</span>
                  <span class="value">{{ reaction.enthalpyChange }} kJ/mol</span>
                  <el-tag :type="reaction.enthalpyChange < 0 ? 'danger' : 'success'" size="small" style="margin-left: 5px">
                    {{ reaction.enthalpyChange < 0 ? '放热' : '吸热' }}
                  </el-tag>
                </div>
                <div v-if="reaction.rateConstantK" class="detail-item">
                  <span class="label">速率常数k:</span>
                  <span class="value">{{ reaction.rateConstantK }}</span>
                </div>
                <div v-if="reaction.reactionOrder" class="detail-item">
                  <span class="label">反应级数:</span>
                  <span class="value">{{ reaction.reactionOrder }}</span>
                </div>
              </div>

              <!-- 反应物和产物 -->
              <div v-if="reaction.reactants && reaction.reactants.length > 0" class="reaction-substances">
                <div class="substances-section">
                  <span class="section-label">反应物:</span>
                  <span v-for="(r, idx) in reaction.reactants" :key="idx" class="substance-item">
                    {{ r.name }} ({{ (r.consumptionRate || 0).toExponential(2) }} mol/s)
                  </span>
                </div>
              </div>
              <div v-if="reaction.products && reaction.products.length > 0" class="reaction-substances">
                <div class="substances-section">
                  <span class="section-label">产物:</span>
                  <span v-for="(p, idx) in reaction.products" :key="idx" class="substance-item">
                    {{ p.name }} ({{ (p.productionRate || 0).toExponential(2) }} mol/s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最终结果 -->
        <el-card shadow="hover" v-if="finalResult" style="margin-top: 15px">
          <template #header>
            <span>最终结果</span>
          </template>

          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="总持续时间">
              {{ finalResult.totalTime?.toFixed(1) || 0 }} 秒
            </el-descriptions-item>
            <el-descriptions-item label="最终温度">
              {{ ((finalResult.finalTemperature || 298.15) - 273.15).toFixed(1) }} ℃
            </el-descriptions-item>
            <el-descriptions-item label="总迭代数" :span="2">
              {{ messageCount }} 次
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 空状态 -->
        <el-card shadow="hover" v-if="!simulationId">
          <el-empty description="请添加反应物并开始模拟" :image-size="80" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { listSubstance } from '@/api/chemistry/substance'
import {
  startRealtimeSimulation,
  getSimulationStatus,
  controlSimulation
} from '@/api/chemistry/realtime'
import { Plus, Delete, VideoPlay, VideoPause, CircleClose } from '@element-plus/icons-vue'
import { formatFormula } from '@/utils/chemistry'
import { ElMessage } from 'element-plus'

// 状态数据
const simulationId = ref('')
const status = ref('')
const currentTime = ref(0)
const temperature = ref(298.15)  // 开尔文
const progress = ref(0)
const substances = ref([])
const activeReactions = ref([])
const phenomena = reactive({
  gasEvolution: [],      // 数组格式
  precipitation: [],      // 数组格式（注意字段名）
  temperatureChange: null,
  colorChange: null,
  description: ''
})
const finalResult = ref(null)

// WebSocket连接状态
const wsConnected = ref(false)

// 表单数据
const reactants = ref([
  { id: null, amount: 1, unit: 'g', concentration: '' },
  { id: null, amount: 1, unit: 'g', concentration: '' }
])

const catalysts = ref([])

const conditions = ref({
  temperature: 298.15,
  pressure: 101325,
  ph: 7,
  ignited: false,
  solvent: ''
})

const totalVolume = ref(1.0)
const timeStep = ref(0.1)
const rateThreshold = ref(0.000001)

// 控制状态
const starting = ref(false)

// 物质列表
const substanceList = ref([])

// WebSocket连接
let ws = null

// 轮询定时器（作为备用方案）
let pollingInterval = null

// 消息计数器
const messageCount = ref(0)

// 计算属性
const hasPhenomena = computed(() => {
  return !!(phenomena.gasEvolution?.length > 0 ||
           phenomena.precipitation?.length > 0 ||
           phenomena.temperatureChange !== null ||
           phenomena.colorChange ||
           phenomena.description)
})

// 加载物质列表
function loadSubstances() {
  listSubstance({ pageNum: 1, pageSize: 1000 }).then(response => {
    substanceList.value = response.rows || []
  }).catch(() => {
    substanceList.value = []
  })
}

// 添加反应物
function addReactant() {
  if (reactants.value.length < 4) {
    reactants.value.push({ id: null, amount: 1, unit: 'g', concentration: '' })
  }
}

// 移除催化剂
function removeCatalyst(index) {
  catalysts.value.splice(index, 1)
}

// 移除反应物
function removeReactant(index) {
  reactants.value.splice(index, 1)
}

// 添加催化剂
function addCatalyst() {
  catalysts.value.push({ id: null, amount: 1, unit: 'g' })
}

// 开始模拟
async function startSimulation() {
  // 验证输入
  if (reactants.value.length < 2) {
    ElMessage.warning('请至少添加2个反应物')
    return
  }

  for (const reactant of reactants.value) {
    if (!reactant.id) {
      ElMessage.warning('请选择所有反应物')
      return
    }
    if (!reactant.amount || reactant.amount <= 0) {
      ElMessage.warning('请输入有效的反应物数量')
      return
    }
  }

  // 验证催化剂
  for (const catalyst of catalysts.value) {
    if (!catalyst.id) {
      ElMessage.warning('请选择所有催化剂')
      return
    }
  }

  starting.value = true

  try {
    // 构建请求数据
    const requestData = {
      substances: reactants.value.map(r => ({
        id: r.id,
        amount: r.amount,
        unit: r.unit,
        ...(r.concentration?.trim() ? { concentration: r.concentration.trim() } : {})
      })),
      ...(catalysts.value.length > 0 && { catalysts: catalysts.value }),
      conditions: {
        temperature: conditions.value.temperature,
        ...(conditions.value.pressure && { pressure: conditions.value.pressure }),
        ...(conditions.value.ignited !== undefined && { ignited: conditions.value.ignited }),
        ...(conditions.value.ph && { ph: conditions.value.ph }),
        ...(conditions.value.solvent && { solvent: conditions.value.solvent })
      },
      totalVolume: totalVolume.value,
      timeStep: timeStep.value,
      maxIterations: 1000,
      rateThreshold: rateThreshold.value
    }

    console.log('========== 启动模拟 ==========')
    console.log('请求数据:', JSON.stringify(requestData, null, 2))

    const response = await startRealtimeSimulation(requestData)

    console.log('响应数据:', response)

    // 处理响应结构
    const data = response.data || response
    if (response.code === 200 && data) {
      simulationId.value = data.simulationId
      status.value = data.status

      console.log('========== 模拟启动成功 ==========')
      console.log('simulationId:', data.simulationId)
      console.log('status:', data.status)
      console.log('wsUrl:', data.wsUrl)
      console.log('estimatedDuration:', data.estimatedDuration)

      // 连接WebSocket
      try {
        await connectWebSocket(data.wsUrl)
        console.log('✅ WebSocket连接已建立')
      } catch (error) {
        console.error('❌ WebSocket连接失败，使用轮询方式:', error)
        startPollingOnly()
      }

      ElMessage.success('模拟启动成功')
    } else {
      ElMessage.error(response.msg || '启动模拟失败')
    }
  } catch (error) {
    console.error('启动模拟失败:', error)
    ElMessage.error('启动模拟失败: ' + (error.message || '网络错误'))
  } finally {
    starting.value = false
  }
}

// 连接WebSocket
function connectWebSocket(wsUrl) {
  return new Promise((resolve, reject) => {
    // 确保URL格式正确
    let url = wsUrl

    if (!url) {
      // 如果后端没有返回wsUrl，根据当前环境动态构造
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const basePath = import.meta.env.VITE_APP_BASE_API || '/dev-api'
      url = `${protocol}//${host}${basePath}/glxt/chemistry/simulation/stream/${simulationId.value}`
    }

    console.log('========== 连接WebSocket ==========')
    console.log('连接地址:', url)

    // 设置连接超时
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket连接超时（5秒）'))
    }, 5000)

    try {
      ws = new WebSocket(url)
    } catch (error) {
      clearTimeout(timeout)
      console.error('❌ 创建WebSocket失败:', error)
      reject(error)
      return
    }

    ws.onopen = () => {
      clearTimeout(timeout)
      wsConnected.value = true
      console.log('✅ WebSocket连接成功')
      console.log('readyState:', ws.readyState)
      resolve(ws)
    }

    ws.onmessage = (event) => {
      messageCount.value++
      console.log(`========== 收到WebSocket消息 #${messageCount.value} ==========`)
      console.log('消息长度:', event.data?.length, '字节')

      try {
        const message = JSON.parse(event.data)
        console.log('消息类型:', message.type)

        switch (message.type) {
          case 'STATE_UPDATE':
            handleStateUpdate(message.data)
            break
          case 'SIMULATION_COMPLETED':
            handleSimulationCompleted(message.data)
            break
          case 'SIMULATION_FAILED':
            handleSimulationFailed(message.data)
            break
          default:
            console.warn('未知消息类型:', message.type)
        }
      } catch (error) {
        console.error('消息解析失败:', error)
        console.error('原始数据:', event.data)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket错误事件:', error)
      wsConnected.value = false
    }

    ws.onclose = (event) => {
      console.log('WebSocket关闭事件')
      console.log('代码:', event.code, '| 原因:', event.reason)
      wsConnected.value = false
    }
  })
}

// 处理状态更新
function handleStateUpdate(data) {
  console.log('---------- 处理状态更新 ----------')
  console.log('currentTime:', data.currentTime, 's')
  console.log('temperature:', data.temperature, 'K')
  console.log('substances:', data.substances?.length, '个')
  console.log('activeReactions:', data.activeReactions?.length, '个')
  console.log('phenomena:', data.phenomena ? '有' : '无')

  // 更新状态
  currentTime.value = data.currentTime || 0
  temperature.value = data.temperature || 298.15
  substances.value = data.substances || []

  // 处理活跃反应
  if (data.activeReactions && data.activeReactions.length > 0) {
    activeReactions.value = data.activeReactions.map(r => ({
      equationId: r.equationId,
      equationText: r.equationText,
      equationHtml: r.equationHtml,
      reactionRate: r.reactionRate,
      currentRate: r.currentRate,
      progress: r.progress || 0,
      status: r.status,
      enthalpyChange: r.enthalpyChange,
      rateConstantK: r.rateConstantK,
      reactionOrder: r.reactionOrder,
      reactants: r.reactants || [],
      products: r.products || []
    }))
  } else {
    activeReactions.value = []
  }

  // 处理实验现象
  if (data.phenomena) {
    const p = data.phenomena

    // 气体产生 - 数组格式
    phenomena.gasEvolution = p.gasEvolution || []

    // 沉淀 - 数组格式（注意字段名是precipitation不是precipitate）
    phenomena.precipitation = p.precipitation || []

    // 温度变化
    phenomena.temperatureChange = p.temperatureChange

    // 颜色变化 - 对象格式
    phenomena.colorChange = p.colorChange || null

    // 整体描述
    phenomena.description = p.description || ''
  }

  // 计算进度（假设最大时间为30秒）
  progress.value = Math.min((currentTime.value / 30) * 100, 99)
}

// 仅轮询模式（WebSocket连接失败时使用）
function startPollingOnly() {
  console.log('========== 启动纯轮询模式 ==========')
  wsConnected.value = false

  const POLL_INTERVAL = 200
  let elapsed = 0
  const MAX_TIME = 60000 // 1分钟

  if (pollingInterval) {
    clearInterval(pollingInterval)
  }

  pollingInterval = setInterval(async () => {
    try {
      elapsed += POLL_INTERVAL

      const response = await getSimulationStatus(simulationId.value)

      if (response.code === 200 && response.data) {
        // 注意：getSimulationStatus返回的是简单状态，不包含完整的activeReactions和phenomena
        // 所以轮询模式只能获取基本信息，无法获取实时推送的详细数据
        const statusData = response.data

        console.log(`轮询 [${elapsed}ms]: status=${statusData.status}, currentTime=${statusData.currentTime}`)

        status.value = statusData.status
        currentTime.value = statusData.currentTime || 0
        temperature.value = statusData.temperature || 298.15

        // 如果模拟完成或失败，停止轮询
        if (statusData.status === 'COMPLETED' || statusData.status === 'FAILED') {
          clearInterval(pollingInterval)
          pollingInterval = null
          console.log('模拟已结束，停止轮询')
        }

        if (elapsed >= MAX_TIME) {
          clearInterval(pollingInterval)
          pollingInterval = null
          console.log('轮询超时，停止轮询')
        }
      }
    } catch (error) {
      console.error('轮询状态失败:', error)
    }
  }, POLL_INTERVAL)
}

// 处理模拟完成
function handleSimulationCompleted(data) {
  console.log('========== 模拟完成 ==========')
  console.log('数据:', data)
  status.value = 'COMPLETED'
  progress.value = 100

  // 关闭WebSocket
  if (ws) {
    ws.close()
    ws = null
    wsConnected.value = false
  }

  // 清除轮询
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }

  // 设置最终结果
  finalResult.value = {
    totalTime: data.totalTime || currentTime.value,
    finalTemperature: data.finalState?.temperature || temperature.value
  }

  ElMessage.success('模拟完成！')
}

// 处理模拟失败
function handleSimulationFailed(data) {
  console.log('========== 模拟失败 ==========')
  console.log('错误:', data.error)
  status.value = 'FAILED'

  // 关闭WebSocket
  if (ws) {
    ws.close()
    ws = null
    wsConnected.value = false
  }

  // 清除轮询
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }

  ElMessage.error('模拟失败: ' + data.error)
}

// 暂停模拟
async function pauseSimulation() {
  try {
    await controlSimulation(simulationId.value, 'PAUSE')
    status.value = 'PAUSED'
    ElMessage.success('已暂停')
  } catch (error) {
    console.error('暂停失败:', error)
    ElMessage.error('暂停失败')
  }
}

// 继续模拟
async function resumeSimulation() {
  try {
    await controlSimulation(simulationId.value, 'RESUME')
    status.value = 'RUNNING'
    ElMessage.success('已继续')
  } catch (error) {
    console.error('继续失败:', error)
    ElMessage.error('继续失败')
  }
}

// 停止模拟
async function stopSimulation() {
  console.log('========== 停止模拟 ==========')

  try {
    await controlSimulation(simulationId.value, 'STOP')
    status.value = 'CANCELLED'
  } catch (error) {
    console.error('停止失败:', error)
  }

  // 关闭WebSocket
  if (ws) {
    ws.close()
    ws = null
    wsConnected.value = false
  }

  // 清除轮询
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }

  // 重置状态
  setTimeout(() => {
    resetSimulation()
  }, 500)
}

// 重置模拟
function resetSimulation() {
  simulationId.value = ''
  status.value = ''
  currentTime.value = 0
  temperature.value = 298.15
  progress.value = 0
  substances.value = []
  activeReactions.value = []
  finalResult.value = null
  messageCount.value = 0

  Object.assign(phenomena, {
    gasEvolution: [],
    precipitation: [],
    temperatureChange: null,
    colorChange: null,
    description: ''
  })
}

// 获取状态标签类型
function getStatusTagType(statusValue) {
  const typeMap = {
    'RUNNING': 'success',
    'PAUSED': 'warning',
    'COMPLETED': 'info',
    'FAILED': 'danger',
    'CANCELLED': 'info'
  }
  return typeMap[statusValue] || ''
}

// 获取状态文本
function getStatusText(statusValue) {
  const textMap = {
    'RUNNING': '运行中',
    'PAUSED': '已暂停',
    'COMPLETED': '已完成',
    'FAILED': '失败',
    'CANCELLED': '已取消'
  }
  return textMap[statusValue] || statusValue
}

// 获取状态标签类型
function getStateTagType(state) {
  const typeMap = {
    'solid': '',
    'liquid': 'warning',
    'gas': 'info',
    'aqueous': 'success',
    'SOLID': '',
    'LIQUID': 'warning',
    'GAS': 'info',
    'AQUEOUS': 'success'
  }
  return typeMap[state] || ''
}

// 获取状态文本
function getStateText(state) {
  const textMap = {
    'solid': '固体',
    'liquid': '液体',
    'gas': '气体',
    'aqueous': '溶液',
    'SOLID': '固体',
    'LIQUID': '液体',
    'GAS': '气体',
    'AQUEOUS': '溶液'
  }
  return textMap[state] || state
}

// 获取反应速率等级标签
function getReactionRateLabel(rate) {
  const rateMap = {
    'instant': '瞬间',
    'very_fast': '极快',
    'fast': '快',
    'moderate': '中等',
    'slow': '慢',
    'very_slow': '很慢'
  }
  return rateMap[rate] || rate
}

// 组件卸载时关闭WebSocket
onUnmounted(() => {
  console.log('========== 组件卸载 ==========')

  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }

  if (ws) {
    ws.close()
    ws = null
  }
})

// 初始化
onMounted(() => {
  console.log('========== 组件挂载 ==========')
  loadSubstances()
})
</script>

<style lang="scss" scoped>
.realtime-simulation-container {
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

.simulation-content {
  display: grid;
  grid-template-columns: 420px 1fr;
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

.section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;

  &:last-of-type {
    border-bottom: none;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.empty-tip {
  padding: 10px 0;
}

.empty-tip-small {
  padding: 5px 0;
  text-align: center;
}

.reactants-list {
  .reactant-item {
    padding: 12px;
    margin-bottom: 10px;
    background: #f9fafc;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    &:last-child {
      margin-bottom: 0;
    }

    .reactant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
}

.catalysts-list {
  .catalyst-item {
    display: flex;
    align-items: center;
    padding: 8px;
    margin-bottom: 8px;
    background: #f0fdf4;
    border-radius: 6px;
    border: 1px solid #bbf7d0;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.status-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafc;
  border-radius: 8px;

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 5px;
    }

    .value {
      font-size: 18px;
      font-weight: 600;
      color: #409EFF;
    }
  }
}

.progress-bar-wrapper {
  margin-bottom: 20px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  button {
    flex: 1;
    min-width: 80px;
  }
}

.ws-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-top: 15px;
  background: #f9fafc;
  border-radius: 6px;

  .ws-label {
    font-size: 12px;
    color: #909399;
    margin-right: 10px;
  }
}

.phenomena-display {
  .phenomenon-item {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    margin-bottom: 10px;
    background: #fffbeb;
    border-radius: 8px;
    border-left: 3px solid #f59e0b;

    &:last-child {
      margin-bottom: 0;
    }

    .phenomenon-icon {
      font-size: 20px;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .phenomenon-content {
      flex: 1;

      .phenomenon-title {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 5px;
      }

      .phenomenon-detail {
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
      }

      .phenomenon-desc {
        font-size: 12px;
        color: #909399;
        margin-top: 5px;
      }
    }
  }

  .no-phenomena {
    text-align: center;
    padding: 20px;
  }
}

.active-reactions {
  .reaction-item {
    padding: 12px;
    margin-bottom: 10px;
    background: #f9fafc;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .equation-text {
      font-family: 'Times New Roman', serif;
      font-size: 14px;
      margin-bottom: 8px;
      color: #303133;
    }

    .reaction-status {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .reaction-progress {
      margin-bottom: 8px;
    }

    .reaction-details {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 10px;
      padding: 8px;
      background: #f9fafc;
      border-radius: 4px;

      .detail-item {
        display: flex;
        align-items: center;
        font-size: 12px;

        .label {
          color: #909399;
          margin-right: 5px;
        }

        .value {
          color: #303133;
          font-weight: 500;
          font-family: 'Consolas', monospace;
        }
      }
    }

    .reaction-substances {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 8px;
      padding: 8px;
      background: #f0f9ff;
      border-radius: 4px;

      .substances-section {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        font-size: 12px;
        gap: 8px;

        .section-label {
          color: #0369a1;
          font-weight: 600;
          margin-right: 5px;
        }

        .substance-item {
          color: #0369a1;
          background: #e0f2fe;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Consolas', monospace;
        }
      }
    }
  }
}
</style>
