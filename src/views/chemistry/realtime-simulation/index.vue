<template>
  <div class="realtime-simulation-container">
    <!-- 标题 -->
    <div class="page-header">
      <h2>化学实时模拟器</h2>
      <p>选择反应物和条件，实时模拟化学反应过程</p>
    </div>

    <!-- WebSocket 连接测试结果 -->
    <el-card shadow="hover" style="margin-bottom: 20px" class="ws-test-card">
      <template #header>
        <div class="card-header">
          <span>🔌 WebSocket 连接测试</span>
          <el-button size="small" @click="testWebSocketConnection" :loading="wsTestStatus.testing">
            重新测试
          </el-button>
        </div>
      </template>

      <div class="ws-test-content">
        <div class="ws-test-item">
          <span class="ws-test-label">测试状态:</span>
          <el-tag v-if="wsTestStatus.testing" type="info">测试中...</el-tag>
          <el-tag v-else-if="wsTestStatus.success" type="success">✅ 测试完成</el-tag>
          <el-tag v-else-if="wsTestStatus.failed" type="danger">❌ 测试失败</el-tag>
          <el-tag v-else type="info">未测试</el-tag>
        </div>

        <div v-if="wsTestStatus.url" class="ws-test-item">
          <span class="ws-test-label">测试URL:</span>
          <code class="ws-test-url">{{ wsTestStatus.url }}</code>
        </div>

        <div v-if="wsTestStatus.result" class="ws-test-item">
          <span class="ws-test-label">测试结果:</span>
          <span :class="{'ws-test-success': wsTestStatus.success, 'ws-test-error': wsTestStatus.failed}">
            {{ wsTestStatus.result }}
          </span>
        </div>

        <div v-if="wsTestStatus.details" class="ws-test-details">
          <div class="ws-test-details-title">详细信息:</div>
          <div class="ws-test-details-content">{{ wsTestStatus.details }}</div>
        </div>

        <div class="ws-test-tips">
          <div style="font-size: 12px; color: #909399; line-height: 1.8">
            <div>💡 测试说明: 页面加载时自动测试 WebSocket 连接</div>
            <div>💡 当前后端: {{ currentWsHost }}</div>
            <div>💡 配置修改: 编辑 .env.development 中的 VITE_WS_HOST</div>
          </div>
        </div>
      </div>
    </el-card>

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
                      placeholder="纯液体可留空（自动计算）"
                      style="width: 100%"
                    />
                    <span style="margin-left: 5px; color: #909399; font-size: 12px">mol/L</span>
                    <div style="color: #E6A23C; font-size: 11px; margin-top: 2px">
                      {{ getConcentrationHint(reactant) }}
                    </div>
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
              <el-form-item label="模拟速度">
                <el-slider
                  v-model="simulationSpeed"
                  :min="0.01"
                  :max="2"
                  :step="0.01"
                  :marks="{ 0.01: '极慢', 0.1: '慢速', 1: '正常', 2: '快速' }"
                  style="width: 200px; display: inline-block; vertical-align: middle"
                />
                <span style="margin-left: 10px; color: #909399; font-size: 12px">
                  {{ (simulationSpeed * 100).toFixed(0) }}%
                </span>
                <span style="margin-left: 10px; color: #909399; font-size: 11px">默认1.0</span>
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

        <!-- 动态添加物质 -->
        <el-card shadow="hover" style="margin-top: 15px" v-if="simulationId">
          <template #header>
            <div class="card-header">
              <span>动态添加物质</span>
              <el-button type="primary" size="small" @click="handleAddSubstance" :loading="addingSubstance">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>
          </template>

          <el-form label-width="70px" size="small">
            <el-form-item label="物质">
              <el-select
                v-model="addSubstanceForm.substanceId"
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
              <el-col :span="16">
                <el-form-item label="数量">
                  <el-input-number
                    v-model="addSubstanceForm.amount"
                    :min="0.001"
                    :precision="3"
                    :step="0.1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-select v-model="addSubstanceForm.unit" style="width: 100%">
                    <el-option label="mol" value="mol" />
                    <el-option label="g" value="g" />
                    <el-option label="L" value="L" />
                    <el-option label="mL" value="mL" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <el-alert type="info" :closable="false" style="margin-top: 10px">
            <template #default>
              <div style="font-size: 12px">
                💡 添加新物质后，系统会自动检测是否能与现有物质发生反应
              </div>
            </template>
          </el-alert>
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
            <el-table-column label="摩尔质量" width="90">
              <template #default="scope">
                {{ scope.row.molarMass ? scope.row.molarMass.toFixed(2) : '-' }} g/mol
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

        <!-- 当前反应 -->
        <el-card shadow="hover" v-if="simulationId && currentReaction" style="margin-top: 15px">
          <template #header>
            <div class="card-header">
              <span>当前反应</span>
              <el-tag type="danger" size="small">执行中</el-tag>
            </div>
          </template>

          <div class="current-reaction">
            <!-- 方程式 -->
            <div class="equation-text" v-html="currentReaction.equationHtml || currentReaction.equationText"></div>

            <!-- 进度条 -->
            <div class="reaction-progress" style="margin: 15px 0">
              <el-progress :percentage="(currentReaction.progress || 0) * 100" :stroke-width="8" :status="currentReaction.progress >= 1 ? 'success' : undefined" />
            </div>

            <!-- 反应详情 -->
            <div v-if="currentReaction.currentRate" class="reaction-details-inline">
              <span class="detail-label">当前速率:</span>
              <span class="detail-value">{{ currentReaction.currentRate.toExponential(2) }} mol/s</span>
            </div>
            <div v-if="currentReaction.temperature" class="reaction-details-inline">
              <span class="detail-label">温度:</span>
              <span class="detail-value">{{ (currentReaction.temperature - 273.15).toFixed(1) }}℃</span>
            </div>
          </div>
        </el-card>

        <!-- 反应队列 -->
        <el-card shadow="hover" v-if="simulationId && reactionQueue.length > 0" style="margin-top: 15px">
          <template #header>
            <div class="card-header">
              <span>反应队列 ({{ reactionQueue.length }})</span>
              <el-tag type="info" size="small">等待中</el-tag>
            </div>
          </template>

          <div class="reaction-queue">
            <div
              v-for="(reaction, index) in reactionQueue"
              :key="reaction.equationId"
              class="queue-item"
            >
              <div class="queue-index">{{ index + 1 }}</div>
              <div class="queue-content">
                <div class="equation-text-small" v-html="reaction.equationHtml || reaction.equationText"></div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 🔥 统一的反应状态显示 -->
        <el-card shadow="hover" v-if="simulationId && allReactions.length > 0" style="margin-top: 15px" class="reaction-status-card">
          <template #header>
            <div class="card-header">
              <span>反应状态 ({{ allReactions.length }})</span>
              <el-tag :type="reactionsByStatus.executing.length > 0 ? 'danger' : 'success'" size="small">
                {{ reactionsByStatus.executing.length > 0 ? '执行中' : '全部完成' }}
              </el-tag>
            </div>
          </template>

          <!-- 执行中的反应 -->
          <div v-if="reactionsByStatus.executing.length > 0" class="status-section">
            <div class="status-title">🔄 执行中</div>
            <div
              v-for="reaction in reactionsByStatus.executing"
              :key="reaction.equationId"
              class="reaction-item executing"
            >
              <div class="equation-text" v-html="reaction.equationHtml || reaction.equationText"></div>
              <div class="reaction-info">
                <!-- 进度条 -->
                <div class="progress-wrapper">
                  <el-progress
                    :percentage="(reaction.progress || 0) * 100"
                    :stroke-width="8"
                    :show-text="true"
                    :format="() => ((reaction.progress || 0) * 100).toFixed(1) + '%'"
                  />
                </div>
                <!-- 速率标签 -->
                <el-tag size="small" class="rate-tag">{{ reaction.currentRate?.toExponential(2) || '0' }} mol/s</el-tag>
              </div>
            </div>
          </div>

          <!-- 已完成的反应 -->
          <div v-if="reactionsByStatus.completed.length > 0" class="status-section">
            <div class="status-title">✅ 已完成 ({{ reactionsByStatus.completed.length }})</div>
            <div
              v-for="reaction in reactionsByStatus.completed"
              :key="reaction.equationId"
              class="reaction-item completed"
            >
              <div class="equation-text" v-html="reaction.equationHtml || reaction.equationText"></div>
              <div class="reaction-info">
                <el-tag type="success" size="small">耗时: {{ reaction.duration?.toFixed(1) || 0 }}s</el-tag>
                <el-tag v-if="reaction.phenomena && reaction.phenomena.description" type="info" size="small">
                  {{ reaction.phenomena.description }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 等待中的反应 -->
          <div v-if="reactionsByStatus.waiting.length > 0" class="status-section">
            <div class="status-title">⏳ 等待中 ({{ reactionsByStatus.waiting.length }})</div>
            <div
              v-for="reaction in reactionsByStatus.waiting"
              :key="reaction.equationId"
              class="reaction-item waiting"
            >
              <div class="equation-text" v-html="reaction.equationHtml || reaction.equationText"></div>
              <div class="reaction-info">
                <el-tag type="info" size="small">等待中</el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 已完成的反应（旧版，保留兼容）-->
        <el-card shadow="hover" v-if="simulationId && completedReactions.length > 0" style="margin-top: 15px">
          <template #header>
            <div class="card-header">
              <span>已完成反应 ({{ completedReactions.length }})</span>
              <el-tag type="success" size="small">完成</el-tag>
            </div>
          </template>

          <div class="completed-reactions">
            <div
              v-for="reaction in completedReactions"
              :key="reaction.equationId"
              class="completed-item"
            >
              <div class="completed-header">
                <div class="equation-text-small" v-html="reaction.equationHtml || reaction.equationText"></div>
                <el-tag type="success" size="small">✓ 完成</el-tag>
              </div>
              <div v-if="reaction.duration" class="completed-meta">
                <span>耗时: {{ reaction.duration.toFixed(1) }}s</span>
              </div>
              <div v-if="reaction.phenomena && (reaction.phenomena.gasEvolution?.length > 0 || reaction.phenomena.precipitation?.length > 0 || reaction.phenomena.colorChange)" class="completed-phenomena">
                <span v-if="reaction.phenomena.gasEvolution?.length > 0" class="phenomena-tag">💨 气体</span>
                <span v-if="reaction.phenomena.precipitation?.length > 0" class="phenomena-tag">🧪 沉淀</span>
                <span v-if="reaction.phenomena.colorChange" class="phenomena-tag">🎨 变色</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 活跃反应（旧版兼容，保留但优化显示） -->
        <el-card shadow="hover" v-if="simulationId && activeReactions.length > 0 && !currentReaction" style="margin-top: 15px">
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
                  :type="getReactionStatusType(reaction.status)"
                  size="small"
                >
                  {{ getReactionStatusText(reaction.status) }}
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
  controlSimulation,
  addSubstance
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

// 🔥 统一的反应状态管理
const allReactions = ref([])  // 所有反应的状态（等待中、执行中、已完成）

// 保留原有变量用于兼容（逐步废弃）
const activeReactions = ref([])  // 当前正在执行的反应（只有一个）
const reactionQueue = ref([])    // 待执行的反应队列
const completedReactions = ref([]) // 已完成的反应

const phenomena = reactive({
  gasEvolution: [],      // 数组格式
  precipitation: [],      // 数组格式（注意字段名）
  temperatureChange: null,
  colorChange: null,
  description: ''
})
const finalResult = ref(null)
const currentReaction = ref(null) // 当前执行的反应节点

// WebSocket连接状态
const wsConnected = ref(false)

// 🔥 当前配置的 WebSocket 后端地址（用于显示）
const currentWsHost = import.meta.env.VITE_WS_HOST || 'localhost'

// WebSocket连接测试状态
const wsTestStatus = reactive({
  testing: false,
  success: false,
  failed: false,
  url: '',
  result: '',
  details: ''
})

// 表单数据
const reactants = ref([
  { id: null, amount: 1, unit: 'g', concentration: '' },
  { id: null, amount: 1, unit: 'g', concentration: '' }
])

const catalysts = ref([])

// 动态添加物质的表单
const addSubstanceForm = ref({
  substanceId: null,
  amount: 0.1,
  unit: 'mol'
})

const addingSubstance = ref(false)

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
const simulationSpeed = ref(0.01)  // 🔥 降低默认速度，让反应持续更长时间便于观察（0.01 = 极慢模式）

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

// 🔥 按状态分组的反应
const reactionsByStatus = computed(() => {
  const executing = allReactions.value.filter(r => r.status === 'EXECUTING')
  const completed = allReactions.value.filter(r => r.status === 'COMPLETED').sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
  const waiting = allReactions.value.filter(r => r.status === 'PENDING')

  return { executing, completed, waiting }
})

// 🔥 获取或创建反应对象
function getOrCreateReaction(equationId, equationText, equationHtml) {
  let reaction = allReactions.value.find(r => r.equationId === equationId)
  if (!reaction) {
    reaction = {
      equationId,
      equationText,
      equationHtml,
      status: 'PENDING',
      progress: 0,
      startTime: null,
      endTime: null,
      duration: null,
      currentRate: 0,
      phenomena: null
    }
    allReactions.value.push(reaction)
  }
  return reaction
}

// 🔥 更新反应状态
function updateReactionStatus(equationId, status, extraData = {}) {
  const reaction = allReactions.value.find(r => r.equationId === equationId)
  if (reaction) {
    reaction.status = status
    Object.assign(reaction, extraData)
  }
}

// 加载物质列表
function loadSubstances() {
  listSubstance({ pageNum: 1, pageSize: 1000 }).then(response => {
    substanceList.value = response.rows || []
  }).catch(() => {
    substanceList.value = []
  })
}

// 测试 WebSocket 连接
async function testWebSocketConnection() {
  wsTestStatus.testing = true
  wsTestStatus.success = false
  wsTestStatus.failed = false
  wsTestStatus.result = ''
  wsTestStatus.details = ''

  console.log('========== 开始 WebSocket 连接测试 ==========')

  // 使用环境变量配置的后端地址
  const wsHost = import.meta.env.VITE_WS_HOST || 'localhost'
  const testUrl = `ws://${wsHost}:9209/chemistry/simulation/stream/test-connection-${Date.now()}`
  wsTestStatus.url = testUrl

  console.log('测试 URL:', testUrl)
  console.log('使用环境变量 VITE_WS_HOST:', wsHost)

  return new Promise((resolve) => {
    const testWs = new WebSocket(testUrl)
    let resultDetails = ''

    const timeout = setTimeout(() => {
      testWs.close()
      wsTestStatus.testing = false
      wsTestStatus.failed = true
      wsTestStatus.result = '连接超时（5秒）'
      wsTestStatus.details = `URL: ${testUrl}\n\n可能的原因：\n1. 服务器 9209 端口未开放\n2. 防火墙阻止连接\n3. 服务未启动`
      console.error('❌ WebSocket 连接超时')
      resolve()
    }, 5000)

    testWs.onopen = () => {
      clearTimeout(timeout)
      wsTestStatus.testing = false
      wsTestStatus.success = true
      wsTestStatus.result = '连接成功！✅'
      resultDetails = `URL: ${testUrl}\n连接状态: 已打开 (readyState: 1)\n协议: WebSocket\n`
      wsTestStatus.details = resultDetails
      console.log('✅ WebSocket 测试连接成功')
      testWs.close()
      resolve()
    }

    testWs.onerror = (error) => {
      clearTimeout(timeout)
      wsTestStatus.testing = false
      wsTestStatus.failed = true
      wsTestStatus.result = '连接失败 ❌'
      resultDetails = `URL: ${testUrl}\n错误: WebSocket 连接失败\n\n可能的原因：\n1. 服务器 9209 端口未开放\n2. 防火墙阻止连接\n3. 服务未启动\n4. 网络不通`
      wsTestStatus.details = resultDetails
      console.error('❌ WebSocket 测试连接失败:', error)
      resolve()
    }

    testWs.onclose = (event) => {
      clearTimeout(timeout)
      if (!wsTestStatus.success && !wsTestStatus.failed) {
        // 如果既没有成功也没有失败标记，说明是连接后被服务端关闭
        wsTestStatus.testing = false
        wsTestStatus.success = true
        wsTestStatus.result = '连接成功（服务端主动关闭）✅'
        wsTestStatus.details = `URL: ${testUrl}\n连接成功后，服务端关闭了连接\n关闭码: ${event.code}\n关闭原因: ${event.reason || '无'}\n\n这是正常的！说明 WebSocket 连接可用。`
        console.log('✅ WebSocket 连接成功（服务端主动关闭）')
      }
      resolve()
    }
  })
}

// 添加反应物
function addReactant() {
  if (reactants.value.length < 4) {
    reactants.value.push({ id: null, amount: 1, unit: 'g', concentration: '' })
  }
}

// 获取浓度提示信息
function getConcentrationHint(reactant) {
  const substance = substanceList.value.find(s => s.id === reactant.id)
  if (!substance) {
    return ''
  }

  // 如果有密度数据，说明是纯液体，可以自动计算
  if (substance.density && substance.density > 0) {
    return `💡 纯液体，系统将根据密度(${substance.density}g/cm³)自动计算浓度`
  }

  // 如果没有密度数据，建议用户输入
  return '⚠️ 溶液请手动输入浓度'
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
    // 不再强制要求液体必须输入浓度，纯液体可以留空由后端自动计算
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
      substances: reactants.value.map(r => {
        const result = {
          id: r.id,
          amount: r.amount,
          unit: r.unit
        }
        // 只有当浓度有效且不为 "0" 或 "0.0" 时才发送
        const conc = r.concentration?.trim()
        if (conc && conc !== '0' && conc !== '0.0') {
          result.concentration = conc
        }
        return result
      }),
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
      rateThreshold: rateThreshold.value,
      simulationSpeed: simulationSpeed.value
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
    let url = wsUrl

    // 🔥 开发环境：使用环境变量配置的后端地址
    if (import.meta.env.DEV) {
      const wsHost = import.meta.env.VITE_WS_HOST || 'localhost'
      url = `ws://${wsHost}:9209/chemistry/simulation/stream/${simulationId.value}`
      console.log('🔧 开发环境：使用环境变量配置的后端')
      console.log('🔧 VITE_WS_HOST =', wsHost)
      console.log('🔧 构造的 URL:', url)
      console.log('🔧 后端返回的 wsUrl:', wsUrl, '(已忽略)')
    } else if (!url) {
      // 生产环境：如果后端没有返回wsUrl，根据当前环境动态构造
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const basePath = import.meta.env.VITE_APP_BASE_API || '/prod-api'
      url = `${protocol}//${host}${basePath}/glxt/chemistry/simulation/stream/${simulationId.value}`
      console.log('🚀 生产环境：使用当前 host')
    }

    console.log('========== 连接WebSocket ==========')
    console.log('连接地址:', url)
    console.log('使用的主机:', window.location.hostname)

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
            handleStateUpdate(message.data || message)
            break
          case 'REACTION_STARTED':
            handleReactionStarted(message)  // 消息本身就是完整的反应数据
            break
          case 'REACTION_PROGRESS':
            handleReactionProgress(message)  // 消息本身就是完整的反应数据
            break
          case 'PHENOMENA_UPDATED':
            handlePhenomenaUpdated(message.data || message)
            break
          case 'REACTION_COMPLETED':
            handleReactionCompleted(message)  // 消息本身就是完整的反应数据
            break
          case 'NEW_REACTIONS_DETECTED':
            handleNewReactionsDetected(message.data || message)
            break
          case 'SUBSTANCE_ADDED':
            handleSubstanceAdded(message)  // 消息本身就是完整的物质数据
            break
          case 'SIMULATION_COMPLETED':
            handleSimulationCompleted(message.data || message)
            break
          case 'SIMULATION_FAILED':
            handleSimulationFailed(message.data || message)
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

    // 🔥 同步更新统一反应列表（修复：创建不存在的反应，移除状态限制）
    for (const backendReaction of data.activeReactions) {
      let unifiedReaction = allReactions.value.find(r => r.equationId === backendReaction.equationId)

      // 如果反应不存在，创建它（修复 STATE_UPDATE 先于 REACTION_STARTED 到达的情况）
      if (!unifiedReaction) {
        unifiedReaction = {
          equationId: backendReaction.equationId,
          equationText: backendReaction.equationText,
          equationHtml: backendReaction.equationHtml,
          status: 'PENDING',  // 初始状态为 PENDING
          progress: 0,
          startTime: null,
          endTime: null,
          duration: null,
          currentRate: 0,
          phenomena: null,
          priority: 0
        }
        allReactions.value.push(unifiedReaction)
        console.log('  [STATE_UPDATE] 创建新反应:', backendReaction.equationId)
      }

      // 🔥 修复：无论什么状态都更新（移除 status === 'EXECUTING' 的限制）
      // 根据后端状态更新前端状态
      if (backendReaction.status === 'EXECUTING' || backendReaction.status === 'ACTIVE') {
        unifiedReaction.status = 'EXECUTING'
        unifiedReaction.startTime = unifiedReaction.startTime || Date.now()
      } else if (backendReaction.status === 'COMPLETED') {
        unifiedReaction.status = 'COMPLETED'
        unifiedReaction.endTime = unifiedReaction.endTime || Date.now()
      }

      // 始终更新进度和速率
      unifiedReaction.progress = backendReaction.progress !== undefined ? backendReaction.progress : unifiedReaction.progress
      unifiedReaction.currentRate = backendReaction.currentRate !== undefined ? backendReaction.currentRate : unifiedReaction.currentRate

      console.log(`  [STATE_UPDATE] 更新反应: equationId=${backendReaction.equationId}, status=${unifiedReaction.status}, progress=${(unifiedReaction.progress * 100).toFixed(1)}%, rate=${unifiedReaction.currentRate.toExponential(2)} mol/s`)
    }
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

// 动态添加物质
async function handleAddSubstance() {
  if (!addSubstanceForm.value.substanceId) {
    ElMessage.warning('请选择要添加的物质')
    return
  }
  if (!addSubstanceForm.value.amount || addSubstanceForm.value.amount <= 0) {
    ElMessage.warning('请输入有效的数量')
    return
  }

  addingSubstance.value = true

  try {
    // 调用API添加物质
    const response = await addSubstance(simulationId.value, {
      substanceId: addSubstanceForm.value.substanceId,
      amount: addSubstanceForm.value.amount,
      unit: addSubstanceForm.value.unit
    })

    if (response.code === 200) {
      ElMessage.success('物质添加成功')

      // 重置表单
      addSubstanceForm.value.substanceId = null
      addSubstanceForm.value.amount = 0.1
    } else {
      ElMessage.error(response.msg || '添加物质失败')
    }
  } catch (error) {
    console.error('添加物质失败:', error)
    ElMessage.error('添加物质失败: ' + (error.message || '网络错误'))
  } finally {
    addingSubstance.value = false
  }
}

// 处理模拟完成
function handleSimulationCompleted(data) {
  console.log('========== 模拟完成 ==========')
  console.log('数据:', data)
  status.value = 'COMPLETED'
  progress.value = 100

  // 不关闭 WebSocket，保持连接以便查看结果和继续添加物质

  // 清除轮询
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }

  // 设置最终结果
  finalResult.value = {
    totalTime: data.totalTime || currentTime.value,
    totalIterations: data.totalIterations || 0,
    finalTemperature: temperature.value
  }

  ElMessage.success('模拟完成！')
}

// 处理模拟失败
function handleSimulationFailed(data) {
  console.log('========== 模拟失败 ==========')
  console.log('错误:', data.error)
  status.value = 'FAILED'

  // 不关闭 WebSocket，保持连接以便查看错误信息和重试

  // 清除轮询
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }

  ElMessage.error('模拟失败: ' + data.error)
}

// 处理反应开始
function handleReactionStarted(data) {
  console.log('========== 反应开始 ==========')
  // 后端消息格式: { reaction: { equationId, equationText, ... } }
  const reaction = data.reaction || data
  console.log('方程式ID:', reaction.equationId)
  console.log('方程式:', reaction.equationText)

  // 🔥 更新统一反应列表中的状态
  const unifiedReaction = getOrCreateReaction(
    reaction.equationId,
    reaction.equationText,
    reaction.equationHtml
  )
  unifiedReaction.status = 'EXECUTING'
  unifiedReaction.progress = reaction.progress || 0
  unifiedReaction.startTime = reaction.startTime || Date.now()
  unifiedReaction.currentRate = reaction.currentRate || 0
  unifiedReaction.phenomena = reaction.phenomena || null

  // 兼容旧逻辑：设置 currentReaction
  currentReaction.value = {
    equationId: reaction.equationId,
    equationText: reaction.equationText,
    equationHtml: reaction.equationHtml,
    status: 'ACTIVE',
    progress: reaction.progress || 0,
    startTime: reaction.startTime,
    currentRate: reaction.currentRate,
    phenomena: reaction.phenomena
  }

  // 从队列中移除当前反应
  reactionQueue.value = reactionQueue.value.filter(r => r.equationId !== reaction.equationId)

  ElMessage.info(`开始反应: ${reaction.equationText?.substring(0, 30)}...`)
}

// 处理反应进度更新
function handleReactionProgress(data) {
  // 后端消息格式: { reaction: { equationId, progress, ... } }
  const reaction = data.reaction || data
  console.log('反应进度更新:', reaction.equationId, '进度:', reaction.progress)

  // 🔥 更新统一反应列表
  const unifiedReaction = allReactions.value.find(r => r.equationId === reaction.equationId)
  if (unifiedReaction) {
    unifiedReaction.progress = reaction.progress
    unifiedReaction.currentRate = reaction.currentRate || 0
    unifiedReaction.temperature = reaction.temperature
    unifiedReaction.phenomena = reaction.phenomena || unifiedReaction.phenomena || null
  }

  // 兼容旧逻辑：更新 currentReaction
  if (currentReaction.value && currentReaction.value.equationId === reaction.equationId) {
    currentReaction.value.progress = reaction.progress
    currentReaction.value.currentRate = reaction.currentRate
    currentReaction.value.temperature = reaction.temperature
    currentReaction.value.phenomena = reaction.phenomena
  }
}

// 处理现象更新
function handlePhenomenaUpdated(data) {
  console.log('========== 现象更新 ==========')
  console.log('方程式ID:', data.equationId)
  console.log('现象:', data.phenomena)

  if (data.phenomena) {
    const p = data.phenomena
    phenomena.gasEvolution = p.gasEvolution || []
    phenomena.precipitation = p.precipitation || []
    phenomena.temperatureChange = p.temperatureChange
    phenomena.colorChange = p.colorChange || null
    phenomena.description = p.description || ''
  }
}

// 处理反应完成
function handleReactionCompleted(data) {
  console.log('========== 反应完成 ==========')
  // 后端消息格式: { reaction: { equationId, equationText, duration, ... } }
  const reaction = data.reaction || data
  console.log('方程式ID:', reaction.equationId)
  console.log('耗时:', reaction.duration, 's')

  // 🔥 更新统一反应列表中的状态
  const unifiedReaction = allReactions.value.find(r => r.equationId === reaction.equationId)
  if (unifiedReaction) {
    unifiedReaction.status = 'COMPLETED'
    unifiedReaction.endTime = reaction.endTime || Date.now()
    unifiedReaction.duration = reaction.duration || 0
    unifiedReaction.phenomena = reaction.phenomena || unifiedReaction.phenomena || { ...phenomena }
  }

  // 兼容旧逻辑：将当前反应移到已完成列表
  if (currentReaction.value) {
    completedReactions.value.push({
      ...currentReaction.value,
      endTime: reaction.endTime,
      duration: reaction.duration,
      phenomena: reaction.phenomena || { ...phenomena }
    })
  }

  currentReaction.value = null

  ElMessage.success(`反应完成: ${reaction.equationText?.substring(0, 30)}...`)
}

// 处理检测到新反应
function handleNewReactionsDetected(data) {
  console.log('========== 检测到新反应 ==========')
  console.log('新反应数量:', data.newReactions?.length)

  if (data.newReactions && data.newReactions.length > 0) {
    // 🔥 添加到统一反应列表
    for (const reaction of data.newReactions) {
      const exists = allReactions.value.some(r => r.equationId === reaction.equationId)
      if (!exists) {
        allReactions.value.push({
          equationId: reaction.equationId,
          equationText: reaction.equationText,
          equationHtml: reaction.equationHtml,
          status: 'PENDING',
          progress: 0,
          startTime: null,
          endTime: null,
          duration: null,
          currentRate: 0,
          phenomena: null,
          priority: reaction.priority || 0
        })
      }
    }

    // 兼容旧逻辑：添加到反应队列
    for (const reaction of data.newReactions) {
      const exists = reactionQueue.value.some(r => r.equationId === reaction.equationId) ||
                     completedReactions.value.some(r => r.equationId === reaction.equationId) ||
                     (currentReaction.value && currentReaction.value.equationId === reaction.equationId)

      if (!exists) {
        reactionQueue.value.push({
          equationId: reaction.equationId,
          equationText: reaction.equationText,
          equationHtml: reaction.equationHtml,
          status: 'PENDING',
          priority: reaction.priority || 0
        })
      }
    }

    ElMessage.info(`检测到 ${data.newReactions.length} 个新反应`)
  }
}

// 处理物质已添加
function handleSubstanceAdded(data) {
  console.log('========== 物质已添加 ==========')
  console.log('物质ID:', data.substanceId)
  console.log('数量:', data.amount || data.newTotalAmount)
  console.log('新反应数量:', data.newReactions?.length)

  ElMessage.success(`已添加物质: ${data.substanceName || data.substanceId}`)

  // 处理新反应列表
  if (data.newReactions && data.newReactions.length > 0) {
    console.log('========== 处理新反应列表 ==========')
    console.log('新反应:', data.newReactions)

    let addedCount = 0
    for (const reaction of data.newReactions) {
      // 检查是否已在队列中
      const exists = reactionQueue.value.some(r => r.equationId === reaction.equationId) ||
                     completedReactions.value.some(r => r.equationId === reaction.equationId) ||
                     (currentReaction.value && currentReaction.value.equationId === reaction.equationId)

      if (!exists) {
        reactionQueue.value.push({
          equationId: reaction.equationId,
          equationText: reaction.equationText,
          equationHtml: reaction.equationHtml,
          status: reaction.status || 'PENDING',
          priority: reaction.priority || 0
        })
        addedCount++
        console.log('  ✓ 新反应已加入队列:', reaction.equationText)
      } else {
        console.log('  × 反应已存在，跳过:', reaction.equationText)
      }
    }

    if (addedCount > 0) {
      ElMessage.info(`检测到 ${addedCount} 个新反应`)
      console.log('========== 新反应处理完成 ==========')
    }
  }
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
  allReactions.value = []  // 🔥 重置统一反应列表
  activeReactions.value = []
  reactionQueue.value = []
  completedReactions.value = []
  currentReaction.value = null
  finalResult.value = null
  messageCount.value = 0

  Object.assign(phenomena, {
    gasEvolution: [],
    precipitation: [],
    temperatureChange: null,
    colorChange: null,
    description: ''
  })

  // 重置添加物质表单
  addSubstanceForm.value = {
    substanceId: null,
    amount: 0.1,
    unit: 'mol'
  }
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

// 获取反应状态文本
function getReactionStatusText(status) {
  const statusMap = {
    'EXECUTING': '执行中',
    'COMPLETED': '已完成',
    'PENDING': '等待中',
    'MATCHED_ONLY': '已匹配'
  }
  return statusMap[status] || '已匹配'
}

// 获取反应状态标签类型
function getReactionStatusType(status) {
  const typeMap = {
    'EXECUTING': 'danger',
    'COMPLETED': 'success',
    'PENDING': 'warning',
    'MATCHED_ONLY': 'info'
  }
  return typeMap[status] || 'info'
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
  // 自动测试 WebSocket 连接
  testWebSocketConnection()
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

// WebSocket 测试卡片样式
.ws-test-card {
  :deep(.el-card__body) {
    padding: 15px;
  }
}

.ws-test-content {
  .ws-test-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .ws-test-label {
    font-weight: 600;
    color: #303133;
    min-width: 80px;
    margin-right: 10px;
  }

  .ws-test-url {
    font-size: 12px;
    color: #606266;
    background: #f5f7fa;
    padding: 4px 8px;
    border-radius: 4px;
    word-break: break-all;
  }

  .ws-test-success {
    color: #67c23a;
    font-weight: 600;
  }

  .ws-test-error {
    color: #f56c6c;
    font-weight: 600;
  }

  .ws-test-details {
    margin-top: 15px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    border-left: 3px solid #409eff;
  }

  .ws-test-details-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .ws-test-details-content {
    font-size: 12px;
    color: #606266;
    white-space: pre-line;
    line-height: 1.6;
  }

  .ws-test-tips {
    margin-top: 12px;
    padding: 10px;
    background: #ecf5ff;
    border-radius: 4px;
    border-left: 3px solid #409eff;
  }
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

// 当前反应样式
.current-reaction {
  .equation-text {
    font-size: 18px;
    text-align: center;
    padding: 15px;
    background: #f0f9ff;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .reaction-details-inline {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px;
    background: #f9fafc;
    border-radius: 6px;

    .detail-label {
      font-size: 13px;
      color: #909399;
    }

    .detail-value {
      font-size: 14px;
      color: #303133;
      font-weight: 600;
      font-family: 'Consolas', monospace;
    }
  }
}

// 反应队列样式
.reaction-queue {
  .queue-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 10px;
    background: #f9fafc;
    border-radius: 8px;
    border: 1px solid #e5e7eb;

    &:last-child {
      margin-bottom: 0;
    }

    .queue-index {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e5e7eb;
      color: #6b7280;
      border-radius: 50%;
      font-weight: 600;
      font-size: 14px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .queue-content {
      flex: 1;

      .equation-text-small {
        font-size: 14px;
        color: #374151;
      }
    }
  }
}

// 🔥 统一反应状态显示样式
.reaction-status-card {
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.status-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.status-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

.reaction-item {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid #ccc;
  background: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateX(2px);
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.executing {
    border-left-color: #ef4444;
    background: linear-gradient(to right, #fef2f2, #fef2f2);
    animation: pulse-border 2s infinite;
  }

  &.completed {
    border-left-color: #22c55e;
    background: #f0fdf4;
  }

  &.waiting {
    border-left-color: #9ca3af;
    background: #f8fafc;
  }
}

@keyframes pulse-border {
  0%, 100% {
    border-left-color: #ef4444;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    border-left-color: #f87171;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
  }
}

.equation-text {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.6;
}

.reaction-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.progress-wrapper {
  flex: 1;
  min-width: 200px;
  margin-right: 8px;
}

.rate-tag {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

// 已完成反应样式
.completed-reactions {
  .completed-item {
    padding: 12px;
    margin-bottom: 10px;
    background: #f0fdf4;
    border-radius: 8px;
    border: 1px solid #bbf7d0;

    &:last-child {
      margin-bottom: 0;
    }

    .completed-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .equation-text-small {
        font-size: 14px;
        color: #166534;
        flex: 1;
      }
    }

    .completed-meta {
      font-size: 12px;
      color: #65a30d;
      margin-bottom: 6px;
    }

    .completed-phenomena {
      display: flex;
      gap: 8px;

      .phenomena-tag {
        font-size: 12px;
        padding: 2px 8px;
        background: #dcfce7;
        color: #166534;
        border-radius: 4px;
      }
    }
  }
}
</style>
