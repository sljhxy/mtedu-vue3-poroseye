<template>
  <div class="chemistry-simulation">
    <div class="page-header">
      <!-- <h2>化学反应模拟器</h2> -->
      <p>选择反应物和条件，实时预览并模拟化学反应过程</p>
    </div>

    <div class="simulation-container">
      <!-- 左侧：输入区 -->
      <div class="input-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>反应设置</span>
              <el-tag v-if="preview" type="success" size="small">已匹配反应</el-tag>
              <el-tag v-else-if="reactants.length >= 2" type="info" size="small">无反应</el-tag>
            </div>
          </template>

          <!-- 反应物 -->
          <div class="section">
            <div class="section-header">
              <span>反应物</span>
              <el-button type="primary" size="small" @click="addReactant">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>

            <div class="reactants-list">
              <div
                v-for="(reactant, index) in reactants"
                :key="index"
                class="reactant-item"
              >
                <el-tag class="reactant-number" :type="reactant.substanceId ? 'primary' : 'info'">
                  {{ index + 1 }}
                </el-tag>
                <div class="reactant-form">
                  <el-form label-width="60px" size="small">
                    <el-form-item label="物质">
                      <el-select
                        v-model="reactant.substanceId"
                        filterable
                        placeholder="选择物质"
                        style="width: 100%"
                        @change="onReactantChange"
                      >
                        <el-option-group
                          v-for="category in substanceCategories"
                          :key="category.key"
                          :label="category.label"
                        >
                          <el-option
                            v-for="substance in category.substances"
                            :key="substance.id"
                            :label="`${substance.name} (${substance.formula})`"
                            :value="substance.id"
                          >
                            <span>{{ substance.name }}</span>
                            <span style="float: right; color: #8492a6; font-size: 12px">
                              {{ substance.formula }}
                            </span>
                          </el-option>
                        </el-option-group>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="数量">
                      <el-input-number
                        v-model="reactant.amount"
                        :min="0.01"
                        :max="1000"
                        :precision="2"
                        :step="0.1"
                        controls-position="right"
                        style="width: 100px"
                        @change="onReactantChange"
                      />
                      <el-select v-model="reactant.unit" style="width: 70px; margin-left: 8px" @change="onReactantChange">
                        <el-option label="g" value="g" />
                        <el-option label="mol" value="mol" />
                        <el-option label="L" value="L" />
                        <el-option label="mL" value="mL" />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  :icon="Delete"
                  @click="removeReactant(index)"
                />
              </div>

              <el-empty
                v-if="reactants.length === 0"
                description="请添加反应物"
                :image-size="60"
              />
            </div>
          </div>

          <el-divider />

          <!-- 反应条件 -->
          <div class="section">
            <div class="section-header">
              <span>反应条件</span>
            </div>
            <el-form label-width="70px" size="small">
              <el-form-item label="温度">
                <el-input-number
                  v-model="conditions.temperature"
                  :min="-273"
                  :max="5000"
                  :precision="1"
                  controls-position="right"
                  style="width: 150px"
                />
                <span style="margin-left: 8px; color: #909399">°C</span>
              </el-form-item>
              <el-form-item label="压力">
                <el-input-number
                  v-model="conditions.pressure"
                  :min="0"
                  :max="100"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                  style="width: 150px"
                />
                <span style="margin-left: 8px; color: #909399">atm</span>
              </el-form-item>
              <el-form-item label="溶剂">
                <el-select v-model="conditions.solvent" placeholder="选择溶剂" style="width: 100%">
                  <el-option label="无溶剂" value="" />
                  <el-option label="水" value="H2O" />
                  <el-option label="乙醇" value="C2H5OH" />
                  <el-option label="苯" value="C6H6" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <el-divider />

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              :loading="simulating"
              @click="startSimulation"
              :disabled="!canSimulate"
            >
              {{ simulating ? '模拟中...' : '开始实验' }}
            </el-button>
            <el-button size="large" @click="resetSimulation">
              重置
            </el-button>
          </div>
        </el-card>

        <!-- 快速预览卡片 -->
        <el-card v-if="preview" shadow="hover" class="preview-card" style="margin-top: 15px">
          <template #header>
            <div class="card-header">
              <span>快速预览</span>
              <el-tag type="success" size="small">匹配成功</el-tag>
            </div>
          </template>
          <div class="preview-content">
            <div v-if="preview.reactionOccurred" class="equation-preview" v-html="preview.equationHtml || preview.equationText"></div>
            <div v-else class="no-reaction">这些物质不会发生化学反应</div>
            <div v-if="preview.phenomena" class="phenomena-preview">
              <el-icon color="#409eff"><InfoFilled /></el-icon>
              <span>{{ preview.phenomena.description }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间：结果展示区 -->
      <div class="result-panel">
        <div v-if="!hasResult && !preview" class="placeholder-state">
          <el-empty
            description="请在左侧添加反应物并设置条件，系统将自动预览可能的反应"
            :image-size="120"
          >
            <template #image>
              <el-icon :size="120" color="#c0c4cc"><Operation /></el-icon>
            </template>
          </el-empty>
        </div>

        <div v-else-if="hasResult" class="result-content">
          <el-tabs v-model="activeTab" type="card">
            <!-- 反应结果 -->
            <el-tab-pane label="反应结果" name="result">
              <div class="tab-content">
                <!-- 反应方程式 -->
                <el-card shadow="hover" class="result-card">
                  <template #header>
                    <div class="card-header">
                      <span>反应方程式</span>
                      <el-button
                        type="primary"
                        size="small"
                        text
                        @click="copyEquation"
                      >
                        <el-icon><DocumentCopy /></el-icon>
                        复制
                      </el-button>
                    </div>
                  </template>
                  <div class="equation-display" v-html="result.primaryReaction?.equationHtml"></div>
                  <div class="reaction-meta">
                    <el-tag size="small">{{ getReactionTypeName(result.primaryReaction?.reactionType) }}</el-tag>
                    <el-tag v-if="result.primaryReaction?.isRedox" type="warning" size="small" style="margin-left: 8px">
                      氧化还原反应
                    </el-tag>
                    <el-tag type="success" size="small" style="margin-left: 8px">
                      {{ getDifficultyLevelName(result.primaryReaction?.difficultyLevel) }}
                    </el-tag>
                  </div>
                </el-card>

                <!-- 生成物信息 -->
                <el-card shadow="hover" class="result-card">
                  <template #header>
                    <span>生成物信息</span>
                  </template>
                  <el-table :data="result.products" size="small">
                    <el-table-column prop="formula" label="化学式" width="100" />
                    <el-table-column prop="substanceName" label="名称" width="120" />
                    <el-table-column prop="theoreticalYield" label="理论产量">
                      <template #default="{ row }">
                        {{ row.theoreticalYield?.toFixed(2) }} {{ row.yieldUnit }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="actualYield" label="实际产量">
                      <template #default="{ row }">
                        {{ row.actualYield?.toFixed(2) }} {{ row.yieldUnit }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="yieldPercentage" label="产率">
                      <template #default="{ row }">
                        <el-tag type="success" size="small">{{ row.yieldPercentage }}%</el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>

                <!-- 反应现象 -->
                <el-card shadow="hover" class="result-card">
                  <template #header>
                    <span>反应现象</span>
                  </template>
                  <div class="phenomena-grid">
                    <div v-if="result.phenomena?.colorChange" class="phenomenon-item">
                      <el-icon color="#409eff"><Edit /></el-icon>
                      <div>
                        <div class="phenomenon-label">颜色变化</div>
                        <div class="phenomenon-value">
                          {{ result.phenomena.colorChange.before }} → {{ result.phenomena.colorChange.after }}
                        </div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.gasEvolution?.hasGas" class="phenomenon-item">
                      <el-icon color="#67c23a"><Sunny /></el-icon>
                      <div>
                        <div class="phenomenon-label">气体产生</div>
                        <div class="phenomenon-value">{{ result.phenomena.gasEvolution.gasDescription }}</div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.precipitate?.hasPrecipitate" class="phenomenon-item">
                      <el-icon color="#e6a23c"><Check /></el-icon>
                      <div>
                        <div class="phenomenon-label">沉淀生成</div>
                        <div class="phenomenon-value">{{ result.phenomena.precipitate.precipitateDescription }}</div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.temperatureChange" class="phenomenon-item">
                      <el-icon :color="result.phenomena.temperatureChange.isExothermic ? '#f56c6c' : '#409eff'">
                        <Sunny />
                      </el-icon>
                      <div>
                        <div class="phenomenon-label">温度变化</div>
                        <div class="phenomenon-value">{{ result.phenomena.temperatureChange.description }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-if="result.phenomena?.description" class="phenomena-description">
                    {{ result.phenomena.description }}
                  </div>
                </el-card>

                <!-- 反应参数 -->
                <el-card shadow="hover" class="result-card">
                  <template #header>
                    <span>反应参数</span>
                  </template>
                  <div class="parameters-grid">
                    <div class="parameter-item">
                      <div class="parameter-label">反应时间</div>
                      <div class="parameter-value">{{ result.parameters?.reactionTime }} 秒</div>
                    </div>
                    <div class="parameter-item">
                      <div class="parameter-label">焓变 (ΔH)</div>
                      <div class="parameter-value">{{ result.parameters?.heatChange }} kJ/mol</div>
                    </div>
                    <div class="parameter-item" v-if="result.parameters?.finalPh">
                      <div class="parameter-label">最终pH</div>
                      <div class="parameter-value">{{ result.parameters?.finalPh }}</div>
                    </div>
                    <div class="parameter-item">
                      <div class="parameter-label">最终温度</div>
                      <div class="parameter-value">{{ result.parameters?.finalTemperature?.toFixed(1) }} °C</div>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>

            <!-- 反应阶段 -->
            <el-tab-pane label="反应阶段" name="stages">
              <div class="tab-content">
                <el-timeline>
                  <el-timeline-item
                    v-for="stage in result.stages"
                    :key="stage.stageOrder"
                    :timestamp="stage.durationEstimate"
                    placement="top"
                  >
                    <el-card shadow="hover">
                      <template #header>
                        <div class="stage-header">
                          <el-tag :type="getStageType(stage.stageType)">{{ stage.stageName }}</el-tag>
                        </div>
                      </template>
                      <div class="stage-content">
                        <p><strong>现象：</strong>{{ stage.phenomenaDescription }}</p>
                        <p class="microscopic"><strong>微观解释：</strong>{{ stage.microscopicExplanation }}</p>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>

            <!-- 知识点学习 -->
            <el-tab-pane label="知识点学习" name="knowledge">
              <div class="tab-content">
                <el-collapse v-model="activeCollapse" accordion>
                  <el-collapse-item title="核心知识点" name="keyPoints">
                    <ul class="knowledge-list">
                      <li v-for="(point, index) in result.teachingInfo?.keyPoints" :key="index">
                        <el-icon color="#409eff"><Check /></el-icon>
                        {{ point }}
                      </li>
                    </ul>
                  </el-collapse-item>

                  <el-collapse-item title="常见问题" name="questions">
                    <el-collapse accordion>
                      <el-collapse-item
                        v-for="(item, index) in result.teachingInfo?.commonQuestions"
                        :key="index"
                        :title="item.question"
                        :name="index"
                      >
                        {{ item.answer }}
                      </el-collapse-item>
                    </el-collapse>
                  </el-collapse-item>

                  <el-collapse-item title="易错点提醒" name="mistakes">
                    <div
                      v-for="(item, index) in result.teachingInfo?.commonMistakes"
                      :key="index"
                      class="mistake-item"
                    >
                      <div class="mistake-error">
                        <el-icon color="#f56c6c"><Close /></el-icon>
                        <span>错误：{{ item.mistake }}</span>
                      </div>
                      <div class="mistake-correct">
                        <el-icon color="#67c23a"><Check /></el-icon>
                        <span>正确：{{ item.correction }}</span>
                      </div>
                    </div>
                  </el-collapse-item>

                  <el-collapse-item title="学生版说明" name="student">
                    <p>{{ result.teachingInfo?.studentDescription }}</p>
                  </el-collapse-item>

                  <el-collapse-item title="教师版说明" name="teacher">
                    <p>{{ result.teachingInfo?.teacherDescription }}</p>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 预览状态提示 -->
        <div v-else-if="preview && !hasResult" class="preview-hint">
          <el-card shadow="hover">
            <el-result icon="info" title="预览已生成" sub-title="点击【开始实验】查看完整的模拟结果和知识点">
              <template #extra>
                <div class="equation-hint" v-html="preview.equationHtml || preview.equationText"></div>
              </template>
            </el-result>
          </el-card>
        </div>
      </div>

      <!-- 右侧：知识点学习区（简化版） -->
      <div class="knowledge-panel">
        <el-card shadow="hover">
          <template #header>
            <span>相关知识</span>
          </template>

          <div v-if="result?.teachingInfo" class="knowledge-quick">
            <div class="knowledge-section">
              <h4>核心知识点</h4>
              <ul class="quick-list">
                <li v-for="(point, index) in result.teachingInfo.keyPoints?.slice(0, 4)" :key="index">
                  {{ point }}
                </li>
              </ul>
            </div>

            <el-divider />

            <div class="knowledge-section">
              <h4>学习提示</h4>
              <p>{{ result.teachingInfo.studentDescription }}</p>
            </div>
          </div>

          <el-empty v-else description="开始实验后将显示相关知识点" :image-size="80" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, InfoFilled, DocumentCopy, Operation, Edit, Sunny, Check, Close } from '@element-plus/icons-vue'
import { simulateReaction } from '@/api/chemistry/simulation'
import { SUBSTANCES } from '@/utils/chemistry/substanceLibrary.js'
import { getReactionTypeName, getDifficultyLevelName } from '@/utils/chemistry/reactionKnowledge.js'

// 状态
const reactants = ref([])
const conditions = reactive({
  temperature: 25,
  pressure: 1,
  solvent: ''
})

const preview = ref(null)
const result = ref(null)
const hasResult = ref(false)
const simulating = ref(false)
const activeTab = ref('result')
const activeCollapse = ref('keyPoints')

// 防抖定时器
let debounceTimer = null

// 物质分类
const substanceCategories = computed(() => {
  const categories = [
    { key: 'metal', label: '金属', substances: [] },
    { key: 'non_metal', label: '非金属', substances: [] },
    { key: 'acid', label: '酸', substances: [] },
    { key: 'base', label: '碱', substances: [] },
    { key: 'salt', label: '盐', substances: [] },
    { key: 'oxide', label: '氧化物', substances: [] },
    { key: 'other', label: '其他', substances: [] }
  ]

  SUBSTANCES.forEach(substance => {
    const category = categories.find(c => c.key === substance.category)
    if (category) {
      category.substances.push(substance)
    }
  })

  return categories.filter(c => c.substances.length > 0)
})

// 计算属性
const canSimulate = computed(() => {
  const validReactants = reactants.value.filter(r => r.substanceId)
  return validReactants.length >= 2
})

// 方法
function addReactant() {
  reactants.value.push({
    substanceId: null,
    amount: 1,
    unit: 'g'
  })
}

function removeReactant(index) {
  reactants.value.splice(index, 1)
  onReactantChange()
}

// 反应物变化时触发防抖预览
function onReactantChange() {
  clearTimeout(debounceTimer)

  const validReactants = reactants.value.filter(r => r.substanceId)

  if (validReactants.length < 2) {
    preview.value = null
    return
  }

  debounceTimer = setTimeout(async () => {
    try {
      // quickPreview is not implemented in API yet
      // const response = await quickPreview({
      //   reactants: validReactants.map(r => ({
      //     substanceId: r.substanceId,
      //     amount: r.amount,
      //     unit: r.unit,
      //     state: getSubstanceState(r.substanceId)
      //   })),
      //   conditions
      // })
      // preview.value = response
      preview.value = null
    } catch (error) {
      console.error('预览失败:', error)
    }
  }, 500)
}

function getSubstanceState(substanceId) {
  const substance = SUBSTANCES.find(s => s.id === substanceId)
  return substance?.state || 's'
}

// 开始完整模拟
async function startSimulation() {
  if (!canSimulate.value) {
    ElMessage.warning('请至少选择两种反应物')
    return
  }

  const validReactants = reactants.value.filter(r => r.substanceId)

  simulating.value = true
  try {
    const response = await simulateReaction({
      reactants: validReactants.map(r => ({
        substanceId: r.substanceId,
        amount: r.amount,
        unit: r.unit,
        state: getSubstanceState(r.substanceId)
      })),
      conditions
    })

    if (response.data?.reactionOccurred) {
      result.value = response.data
      hasResult.value = true
      activeTab.value = 'result'
      ElMessage.success('模拟完成')
    } else {
      ElMessage.warning('这些物质不会发生化学反应')
    }
  } catch (error) {
    console.error('模拟失败:', error)
    ElMessage.error('模拟失败: ' + (error.message || '未知错误'))
  } finally {
    simulating.value = false
  }
}

// 重置
function resetSimulation() {
  reactants.value = []
  conditions.temperature = 25
  conditions.pressure = 1
  conditions.solvent = ''
  preview.value = null
  result.value = null
  hasResult.value = false
  activeTab.value = 'result'
  ElMessage.info('已重置')
}

// 复制方程式
function copyEquation() {
  const equation = result.value?.primaryReaction?.equationText
  if (equation) {
    navigator.clipboard.writeText(equation).then(() => {
      ElMessage.success('方程式已复制')
    })
  }
}

// 获取阶段标签类型
function getStageType(stageType) {
  const typeMap = {
    'initiation': 'info',
    'propagation': 'warning',
    'completion': 'success'
  }
  return typeMap[stageType] || 'info'
}

// 初始化
onMounted(() => {
  // 添加默认的两个反应物
  addReactant()
  addReactant()
})
</script>

<style scoped lang="scss">
.chemistry-simulation {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    text-align: center;
    animation: fadeInDown 0.6s ease-out;

    h2 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      margin: 0;
      font-size: 15px;
      color: #606266;
      font-weight: 400;
    }
  }

  .simulation-container {
    display: grid;
    grid-template-columns: 360px 1fr 280px;
    gap: 20px;
    align-items: start;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }

  .section {
    margin-bottom: 20px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e4e7ed;

      span {
        font-weight: 600;
        font-size: 15px;
        color: #303133;
      }
    }

    .reactants-list {
      .reactant-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        padding: 16px;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 12px;
        border: 1px solid #e4e7ed;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        &:hover {
          background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
          border-color: #409eff;
          box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
          transform: translateY(-2px);
        }

        .reactant-number {
          flex-shrink: 0;
        }

        .reactant-form {
          flex: 1;

          :deep(.el-form-item) {
            margin-bottom: 10px;
          }
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding-top: 10px;

    .el-button {
      border-radius: 20px;
      padding: 12px 32px;
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }
  }

  .preview-card {
    border-radius: 12px;
    overflow: hidden;
    animation: slideInUp 0.5s ease-out;

    .preview-content {
      .equation-preview {
        font-size: 17px;
        text-align: center;
        padding: 18px;
        font-family: 'Times New Roman', serif;
        font-weight: 600;
        background: linear-gradient(135deg, #e7f7ff 0%, #d4ecff 100%);
        border-radius: 10px;
        margin-bottom: 12px;
        color: #409eff;
      }

      .no-reaction {
        text-align: center;
        padding: 16px;
        color: #909399;
        font-size: 14px;
      }

      .phenomena-preview {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
        border-radius: 8px;
        color: #e6a23c;
        font-size: 13px;
      }
    }
  }

  .result-panel {
    .placeholder-state {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 16px;
      padding: 80px 20px;
      text-align: center;
      border: 2px dashed #e4e7ed;
      animation: fadeIn 0.5s ease-out;
    }

    .preview-hint {
      animation: slideInUp 0.5s ease-out;

      .equation-hint {
        font-size: 20px;
        text-align: center;
        padding: 24px;
        font-family: 'Times New Roman', serif;
        font-weight: 600;
        background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .result-content {
      animation: fadeIn 0.5s ease-out;

      .tab-content {
        padding: 20px 0;

        .result-card {
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .equation-display {
            font-size: 22px;
            text-align: center;
            padding: 24px;
            font-family: 'Times New Roman', serif;
            font-weight: 600;
            line-height: 1.8;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
            border-radius: 10px;
            color: #409eff;
          }

          .reaction-meta {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 12px;
          }

          .phenomena-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .phenomenon-item {
              display: flex;
              align-items: center;
              gap: 14px;
              padding: 14px 16px;
              background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
              border-radius: 10px;
              border: 1px solid #e4e7ed;
              transition: all 0.3s;

              &:hover {
                background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
                border-color: #409eff;
                transform: translateX(4px);
              }

              .phenomenon-label {
                font-size: 12px;
                color: #909399;
                margin-bottom: 2px;
                font-weight: 500;
              }

              .phenomenon-value {
                font-size: 14px;
                color: #303133;
                font-weight: 500;
              }
            }
          }

          .phenomena-description {
            margin-top: 16px;
            padding: 14px 16px;
            background: linear-gradient(135deg, #e7f7ff 0%, #d4ecff 100%);
            border-radius: 10px;
            color: #409eff;
            font-size: 14px;
            border-left: 4px solid #409eff;
          }

          .parameters-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;

            .parameter-item {
              text-align: center;
              padding: 18px 12px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
              border-radius: 12px;
              border: 1px solid #d4ecff;
              transition: all 0.3s;

              &:hover {
                transform: translateY(-4px);
                box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
                background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);

                .parameter-label,
                .parameter-value {
                  color: #fff;
                }
              }

              .parameter-label {
                font-size: 12px;
                color: #909399;
                margin-bottom: 10px;
                font-weight: 500;
              }

              .parameter-value {
                font-size: 20px;
                font-weight: 600;
                color: #409eff;
              }
            }
          }
        }

        .stage-content {
          p {
            margin: 10px 0;
            line-height: 1.7;
            color: #606266;
          }

          .microscopic {
            color: #909399;
            font-style: italic;
            padding: 10px 14px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #67c23a;
          }
        }

        .knowledge-list {
          margin: 0;
          padding-left: 0;
          list-style: none;

          li {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.3s;

            &:hover {
              background: #f8f9fa;
              padding-left: 10px;
              border-radius: 6px;
            }

            &:last-child {
              border-bottom: none;
            }
          }
        }

        .mistake-item {
          margin-bottom: 16px;
          padding: 14px;
          background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
          border-radius: 10px;
          border-left: 4px solid #e6a23c;

          .mistake-error,
          .mistake-correct {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 10px 0;
            font-size: 14px;
          }

          .mistake-error {
            color: #f56c6c;
          }

          .mistake-correct {
            color: #67c23a;
          }
        }
      }

      :deep(.el-tabs__content) {
        padding: 0;
      }

      :deep(.el-timeline-item__wrapper) {
        padding-left: 20px;
      }

      :deep(.el-timeline-item__content) {
        width: 100%;
      }

      :deep(.el-collapse-item__header) {
        font-weight: 500;
        font-size: 15px;
      }

      :deep(.el-collapse-item__wrap) {
        background: #f8f9fa;
        border-radius: 8px;
      }
    }
  }

  .knowledge-panel {
    .el-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .knowledge-quick {
      .knowledge-section {
        margin-bottom: 18px;

        h4 {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          padding-bottom: 8px;
          border-bottom: 2px solid #e4e7ed;
        }

        .quick-list {
          margin: 0;
          padding-left: 0;
          list-style: none;

          li {
            font-size: 13px;
            color: #606266;
            line-height: 1.9;
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;

            &:before {
              content: '•';
              position: absolute;
              left: 6px;
              color: #409eff;
              font-weight: bold;
            }
          }
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #606266;
          line-height: 1.7;
        }
      }
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1500px) {
    .simulation-container {
      grid-template-columns: 1fr;

      .input-panel,
      .knowledge-panel {
        order: 2;
      }

      .result-panel {
        order: 1;
      }
    }

    .parameters-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .phenomena-grid {
      grid-template-columns: 1fr !important;
    }

    .parameters-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}
</style>
