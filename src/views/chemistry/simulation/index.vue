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
                      <div class="substance-with-delete">
                        <el-select
                          v-model="reactant.substanceId"
                          filterable
                          placeholder="选择物质"
                          class="substance-select"
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
                        <el-button
                          type="danger"
                          size="small"
                          :icon="Delete"
                          @click="removeReactant(index)"
                        >
                          删除
                        </el-button>
                      </div>
                    </el-form-item>
                    <el-form-item label="数量">
                      <div class="amount-unit-group">
                        <el-input-number
                          v-model="reactant.amount"
                          :min="0.01"
                          :max="1000"
                          :precision="2"
                          :step="0.1"
                          controls-position="right"
                          @change="onReactantChange"
                        />
                        <el-select v-model="reactant.unit" @change="onReactantChange">
                          <el-option label="g" value="g" />
                          <el-option label="mol" value="mol" />
                          <el-option label="L" value="L" />
                          <el-option label="mL" value="mL" />
                        </el-select>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
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
                  <el-option label="水" value="水" />
                  <el-option label="乙醇" value="乙醇" />
                  <el-option label="苯" value="苯" />
                </el-select>
              </el-form-item>
              <el-form-item label="点燃">
                <el-switch
                  v-model="conditions.ignited"
                  active-text="已点燃"
                  inactive-text="未点燃"
                />
              </el-form-item>
              <el-form-item label="pH值">
                <el-input-number
                  v-model="conditions.ph"
                  :min="0"
                  :max="14"
                  :precision="1"
                  :step="0.5"
                  controls-position="right"
                  style="width: 150px"
                />
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
            <div v-if="preview?.chainReactions?.length > 0" class="chain-reactions-preview">
              <el-divider content-position="left">
                <el-tag type="warning" size="small">可能的副反应</el-tag>
              </el-divider>
              <div v-for="reaction in preview.chainReactions" :key="reaction.equationId" class="chain-reaction-item">
                <div class="chain-equation">{{ reaction.equationText }}</div>
                <div class="chain-tip">{{ reaction.teachingNote }}</div>
              </div>
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

                  <!-- 反应物信息 -->
                  <!-- <div v-if="inputReactants.length > 0" class="reactants-info">
                    <div class="reactants-info-title">
                      <el-icon><Operation /></el-icon>
                      <span>反应物</span>
                    </div>
                    <div class="reactants-info-list">
                      <div v-for="(reactant, index) in inputReactants" :key="index" class="reactant-info-item">
                        <span class="reactant-name">{{ reactant.name }}</span>
                        <span class="reactant-formula">({{ reactant.formula }})</span>
                        <span class="reactant-amount">{{ reactant.amount }} {{ reactant.unit }}</span>
                      </div>
                    </div>
                  </div> -->

                  <div class="reaction-meta">
                    <el-tag size="small">{{ getReactionTypeName(result.primaryReaction?.reactionType) }}</el-tag>
                    <el-tag v-if="result.primaryReaction?.isRedox" type="warning" size="small" style="margin-left: 8px">
                      氧化还原反应
                    </el-tag>
                    <el-tag type="success" size="small" style="margin-left: 8px">
                      {{ getDifficultyLevelName(result.primaryReaction?.difficultyLevel) }}
                    </el-tag>
                  </div>

                  <!-- 氧化态变化 -->
                  <div v-if="result.primaryReaction?.oxidationChanges && result.primaryReaction.oxidationChanges.length > 0" class="oxidation-changes">
                    <div class="oxidation-title">
                      <el-icon color="#e6a23c"><Operation /></el-icon>
                      <span>氧化态变化</span>
                    </div>
                    <div class="oxidation-list">
                      <div
                        v-for="(change, index) in result.primaryReaction.oxidationChanges"
                        :key="index"
                        class="oxidation-item"
                      >
                        <span class="element-symbol">{{ change.element }}</span>
                        <span class="oxidation-arrow">→</span>
                        <span class="oxidation-state">
                          <span class="oxidation-before">{{ change.from }}</span>
                          <span class="oxidation-after">{{ change.to }}</span>
                        </span>
                        <el-tag :type="change.process === '氧化' ? 'danger' : 'success'" size="small" style="margin-left: 8px">
                          {{ change.process }}
                        </el-tag>
                      </div>
                    </div>
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
                        <div v-if="result.phenomena.colorChange.description" class="phenomenon-desc">
                          {{ result.phenomena.colorChange.description }}
                        </div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.gasEvolution?.hasGas" class="phenomenon-item">
                      <el-icon color="#67c23a"><Sunny /></el-icon>
                      <div>
                        <div class="phenomenon-label">气体产生</div>
                        <div class="phenomenon-value">
                          {{ result.phenomena.gasEvolution.gasDescription || result.phenomena.gasEvolution.gasName || result.phenomena.gasEvolution.formula }}
                        </div>
                        <div v-if="result.phenomena.gasEvolution.description" class="phenomenon-desc">
                          {{ result.phenomena.gasEvolution.description }}
                        </div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.precipitate?.hasPrecipitate" class="phenomenon-item">
                      <el-icon color="#e6a23c"><Check /></el-icon>
                      <div>
                        <div class="phenomenon-label">沉淀生成</div>
                        <div class="phenomenon-value">
                          <span v-if="result.phenomena.precipitate.color">{{ result.phenomena.precipitate.color }}沉淀</span>
                          <span v-else>{{ result.phenomena.precipitate.description || '有沉淀生成' }}</span>
                        </div>
                        <div v-if="result.phenomena.precipitate.state" class="phenomenon-desc">
                          状态：{{ result.phenomena.precipitate.state }}
                        </div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.flamePhenomenon" class="phenomenon-item">
                      <el-icon color="#f56c6c"><Sunny /></el-icon>
                      <div>
                        <div class="phenomenon-label">火焰现象</div>
                        <div class="phenomenon-value">{{ result.phenomena.flamePhenomenon }}</div>
                      </div>
                    </div>
                    <div v-if="result.phenomena?.temperatureChange" class="phenomenon-item">
                      <el-icon :color="result.phenomena.temperatureChange.isExothermic === 'true' ? '#f56c6c' : '#409eff'">
                        <Sunny />
                      </el-icon>
                      <div>
                        <div class="phenomenon-label">温度变化</div>
                        <div class="phenomenon-value">
                          {{ result.phenomena.temperatureChange.isExothermic === 'true' ? '放热' : '吸热' }}
                          {{ result.phenomena.temperatureChange.temperatureChange ? `(${result.phenomena.temperatureChange.temperatureChange})` : '' }}
                        </div>
                        <div v-if="result.phenomena.temperatureChange.description" class="phenomenon-desc">
                          {{ result.phenomena.temperatureChange.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="result.phenomena?.soundPhenomenon" class="phenomena-description">
                    <el-icon><Sunny /></el-icon>
                    {{ result.phenomena.soundPhenomenon }}
                  </div>
                  <div v-if="result.phenomena?.description" class="phenomena-description">
                    {{ result.phenomena.description }}
                  </div>
                  <div v-if="result.phenomena?.observationPoints?.length > 0" class="observation-points">
                    <div class="observation-title">观察要点：</div>
                    <ul>
                      <li v-for="(point, index) in result.phenomena.observationPoints" :key="index">{{ point }}</li>
                    </ul>
                  </div>
                </el-card>

                <!-- 反应参数 -->
                <el-card shadow="hover" class="result-card">
                  <template #header>
                    <span>反应参数</span>
                  </template>
                  <div class="parameters-grid">
                    <div class="parameter-item" v-if="result.parameters?.reactionTime">
                      <div class="parameter-label">反应时间</div>
                      <div class="parameter-value">{{ result.parameters.reactionTime }} 秒</div>
                    </div>
                    <div class="parameter-item" v-if="result.parameters?.heatChange">
                      <div class="parameter-label">焓变 (ΔH)</div>
                      <div class="parameter-value">{{ result.parameters.heatChange }} kJ</div>
                    </div>
                    <div class="parameter-item" v-if="result.primaryReaction?.enthalpyChange">
                      <div class="parameter-label">焓变</div>
                      <div class="parameter-value">{{ result.primaryReaction.enthalpyChange }} kJ/mol</div>
                    </div>
                    <div class="parameter-item" v-if="result.parameters?.solutionColor">
                      <div class="parameter-label">溶液颜色</div>
                      <div class="parameter-value">{{ result.parameters.solutionColor }}</div>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>

            <!-- 反应阶段 -->
            <el-tab-pane label="反应阶段" name="stages">
              <div class="tab-content">
                <el-empty v-if="!result.stages || result.stages.length === 0" description="暂无反应阶段数据" :image-size="80" />
                <el-timeline v-else class="stages-timeline">
                  <el-timeline-item
                    v-for="stage in result.stages"
                    :key="stage.stageOrder"
                    placement="top"
                    :type="getStageTypeColor(stage.stageType)"
                    :size="stage.stageType === 'initiation' ? 'large' : 'normal'"
                  >
                    <el-card shadow="hover" class="stage-card">
                      <template #header>
                        <div class="stage-header">
                          <span class="stage-name">
                            <el-icon><Timer /></el-icon>
                            {{ stage.stageName }}
                          </span>
                          <div class="stage-tags">
                            <el-tag size="small" :type="getStageTypeTag(stage.stageType)">
                              {{ getStageTypeName(stage.stageType) }}
                            </el-tag>
                            <el-tag size="small" effect="plain" style="margin-left: 8px">
                              <el-icon><Clock /></el-icon>
                              {{ stage.durationEstimate }}
                            </el-tag>
                          </div>
                        </div>
                      </template>
                      <div class="stage-content">
                        <div class="stage-phenomena">
                          <div class="stage-label">
                            <el-icon><View /></el-icon>
                            实验现象
                          </div>
                          <p>{{ stage.phenomenaDescription }}</p>
                        </div>
                        <div v-if="stage.colorChange?.description" class="stage-color">
                          <div class="stage-label">
                            <el-icon><MagicStick /></el-icon>
                            颜色变化
                          </div>
                          <p>{{ stage.colorChange.description }}</p>
                        </div>
                        <div v-if="stage.microscopicExplanation" class="stage-microscopic">
                          <div class="stage-label">
                            <el-icon><Microphone /></el-icon>
                            微观解释
                          </div>
                          <p>{{ stage.microscopicExplanation }}</p>
                        </div>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>

            <!-- 副反应 -->
            <el-tab-pane label="副反应" name="chainReactions">
              <div class="tab-content">
                <el-empty v-if="!result.chainReactions || result.chainReactions.length === 0" description="该反应无副反应" :image-size="80" />
                <el-timeline v-else>
                  <el-timeline-item
                    v-for="reaction in result.chainReactions"
                    :key="reaction.equationId"
                    placement="top"
                    :type="reaction.isTriggered ? 'primary' : 'info'"
                  >
                    <el-card shadow="hover">
                      <template #header>
                        <div class="stage-header">
                          <el-tag v-if="reaction.isTriggered" type="danger" size="small">已触发</el-tag>
                          <el-tag v-else type="info" size="small">未触发</el-tag>
                          <el-tag size="small" style="margin-left: 8px">{{ getReactionTypeName(reaction.reactionType) }}</el-tag>
                        </div>
                      </template>
                      <div class="stage-content">
                        <div class="chain-equation">{{ reaction.equationText }}</div>
                        <p><strong>触发原因：</strong>{{ reaction.triggerReason }}</p>
                        <p v-if="reaction.phenomenonImpact"><strong>现象影响：</strong>{{ reaction.phenomenonImpact }}</p>
                        <p class="teaching-note"><strong>教学说明：</strong>{{ reaction.teachingNote }}</p>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>

            <!-- 教学指导 -->
            <el-tab-pane label="教学指导" name="teaching">
              <div class="tab-content">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-card shadow="hover" class="teaching-card student-card">
                      <template #header>
                        <div class="teaching-header">
                          <el-icon><User /></el-icon>
                          <span>学生版描述</span>
                        </div>
                      </template>
                      <div class="teaching-content">
                        {{ result.teachingInfo?.studentDescription || '暂无描述' }}
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="12">
                    <el-card shadow="hover" class="teaching-card teacher-card">
                      <template #header>
                        <div class="teaching-header">
                          <el-icon><UserFilled /></el-icon>
                          <span>教师版描述</span>
                        </div>
                      </template>
                      <div class="teaching-content">
                        {{ result.teachingInfo?.teacherDescription || '暂无描述' }}
                      </div>
                    </el-card>
                  </el-col>
                </el-row>

                <!-- 关键点 -->
                <el-card shadow="hover" class="teaching-card keypoints-card" style="margin-top: 20px">
                  <template #header>
                    <div class="teaching-header">
                      <el-icon><Star /></el-icon>
                      <span>教学关键点</span>
                    </div>
                  </template>
                  <div class="keypoints-grid">
                    <div
                      v-for="(point, index) in result.teachingInfo?.keyPoints"
                      :key="index"
                      class="keypoint-item"
                    >
                      <el-icon color="#e6a23c"><StarFilled /></el-icon>
                      <span>{{ point }}</span>
                    </div>
                  </div>
                </el-card>

                <!-- 常见问题 -->
                <el-card shadow="hover" class="teaching-card questions-card" style="margin-top: 20px">
                  <template #header>
                    <div class="teaching-header">
                      <el-icon><QuestionFilled /></el-icon>
                      <span>常见问题</span>
                    </div>
                  </template>
                  <el-collapse v-model="activeQuestions" accordion>
                    <el-collapse-item
                      v-for="(qa, index) in result.teachingInfo?.commonQuestions"
                      :key="index"
                      :name="index"
                    >
                      <template #title>
                        <div class="question-title">
                          <el-icon><QuestionFilled /></el-icon>
                          {{ qa.question }}
                        </div>
                      </template>
                      <div class="answer-content">
                        <div class="answer-item">
                          <el-icon color="#67c23a"><CircleCheck /></el-icon>
                          <strong>解答：</strong>{{ qa.answer }}
                        </div>
                        <div v-if="qa.mistake" class="answer-item">
                          <el-icon color="#f56c6c"><CircleClose /></el-icon>
                          <strong>常见错误：</strong>{{ qa.mistake }}
                        </div>
                        <div v-if="qa.consequence" class="answer-item">
                          <el-icon color="#e6a23c"><Warning /></el-icon>
                          <strong>后果：</strong>{{ qa.consequence }}
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </el-card>

                <!-- 常见错误 -->
                <el-card v-if="result?.teachingInfo?.commonMistakes && result.teachingInfo.commonMistakes.length > 0" shadow="hover" class="teaching-card mistakes-card" style="margin-top: 20px">
                  <template #header>
                    <div class="teaching-header">
                      <el-icon><CircleClose /></el-icon>
                      <span>常见错误</span>
                    </div>
                  </template>
                  <div class="mistakes-list">
                    <div v-for="(item, index) in result.teachingInfo.commonMistakes" :key="index" class="mistake-item">
                      <div class="mistake-header">
                        <el-icon color="#f56c6c"><CircleClose /></el-icon>
                        <strong>错误：</strong>{{ item.mistake }}
                      </div>
                      <div class="mistake-correction">
                        <el-icon color="#67c23a"><CircleCheck /></el-icon>
                        <strong>纠正：</strong>{{ item.correction }}
                      </div>
                    </div>
                  </div>
                </el-card>

                <!-- 安全注意事项 -->
                <el-card v-if="result.teachingInfo?.safetyNotes?.length" shadow="hover" class="teaching-card safety-card" style="margin-top: 20px">
                  <template #header>
                    <div class="teaching-header">
                      <el-icon><WarningFilled /></el-icon>
                      <span>安全注意事项</span>
                    </div>
                  </template>
                  <div class="safety-notes-list">
                    <div v-for="(note, index) in result.teachingInfo.safetyNotes" :key="index" class="safety-note-item">
                      <el-icon color="#e6a23c"><Warning /></el-icon>
                      <span>{{ note }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>

            <!-- 知识点学习 -->
            <el-tab-pane label="知识点学习" name="knowledge">
              <div class="tab-content">
                <el-collapse v-model="activeCollapse" accordion>
                  <el-collapse-item title="核心知识点" name="keyPoints">
                    <ul v-if="result.knowledgePoints?.length" class="knowledge-list">
                      <li v-for="(point, index) in result.knowledgePoints" :key="index">
                        <el-icon color="#409eff"><Check /></el-icon>
                        {{ point }}
                      </li>
                    </ul>
                    <el-empty v-else description="暂无知识点" :image-size="60" />
                  </el-collapse-item>

                  <el-collapse-item title="反应类型" name="reactionType">
                    <div class="reaction-type-info">
                      <el-tag size="large" type="primary">{{ result.primaryReaction?.reactionTypeName }}</el-tag>
                      <el-tag v-if="result.primaryReaction?.isRedox" size="large" type="warning" style="margin-left: 10px">
                        氧化还原反应
                      </el-tag>
                    </div>
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
        <el-card shadow="hover" class="knowledge-card">
          <template #header>
            <div class="knowledge-header">
              <span>相关知识</span>
              <el-tooltip content="点击快速滚动到教学指导" placement="left">
                <el-button
                  v-if="hasResult"
                  type="primary"
                  size="small"
                  text
                  @click="activeTab = 'teaching'"
                >
                  <el-icon><Link /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>

          <div v-if="result" class="knowledge-quick">
            <div class="knowledge-section">
              <h4>
                <el-icon><Document /></el-icon>
                反应方程式
              </h4>
              <div class="equation-display-small" v-html="result.primaryReaction?.equationHtml"></div>
            </div>

            <el-divider />

            <div v-if="result.knowledgePoints?.length" class="knowledge-section">
              <h4>
                <el-icon><Reading /></el-icon>
                核心知识点
              </h4>
              <ul class="quick-list">
                <li v-for="(point, index) in result.knowledgePoints.slice(0, 5)" :key="index">
                  {{ point }}
                </li>
              </ul>
              <el-button
                v-if="result.knowledgePoints.length > 5"
                type="primary"
                text
                size="small"
                @click="activeTab = 'knowledge'"
              >
                查看全部 {{ result.knowledgePoints.length }} 个知识点
              </el-button>
            </div>

            <el-divider v-if="result.primaryReaction" />

            <div v-if="result.primaryReaction" class="knowledge-section">
              <h4>
                <el-icon><Collection /></el-icon>
                反应类型
              </h4>
              <div class="tags-display">
                <el-tag type="primary" size="small">{{ getReactionTypeName(result.primaryReaction.reactionType) }}</el-tag>
                <el-tag
                  v-if="result.primaryReaction.isRedox"
                  type="warning"
                  size="small"
                  style="margin-left: 8px"
                >
                  氧化还原
                </el-tag>
                <el-tag
                  type="success"
                  size="small"
                  style="margin-left: 8px"
                >
                  {{ getDifficultyLevelName(result.primaryReaction.difficultyLevel) }}
                </el-tag>
              </div>
            </div>

            <el-divider v-if="result.teachingInfo?.keyPoints?.length" />

            <div v-if="result.teachingInfo?.keyPoints?.length" class="knowledge-section">
              <h4>
                <el-icon><Star /></el-icon>
                教学关键点
              </h4>
              <div class="keypoints-compact">
                <span v-for="(point, index) in result.teachingInfo.keyPoints.slice(0, 3)" :key="index" class="keypoint-tag">
                  {{ point }}
                </span>
              </div>
            </div>

            <el-divider v-if="result.phenomena?.description" />

            <div v-if="result.phenomena?.description" class="knowledge-section">
              <h4>
                <el-icon><View /></el-icon>
                实验现象
              </h4>
              <p class="phenomena-compact">{{ result.phenomena.description }}</p>
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
import {
  Plus, Delete, InfoFilled, DocumentCopy, Operation, Edit, Sunny, Check,
  Timer, Clock, View, MagicStick, Microphone, User, UserFilled, Star, StarFilled,
  QuestionFilled, CircleCheck, CircleClose, Warning, WarningFilled, Link, Reading, Collection, Document
} from '@element-plus/icons-vue'
import { simulateReaction } from '@/api/chemistry/simulation'
import { listSubstance } from '@/api/chemistry/substance'
import { getReactionTypeName, getDifficultyLevelName } from '@/utils/chemistry/reactionKnowledge.js'

// 状态
const reactants = ref([])
const conditions = reactive({
  temperature: null,
  pressure: null,
  ph: null,
  ignited: false,
  catalystId: null,
  solvent: null
})

const preview = ref(null)
const result = ref(null)
const hasResult = ref(false)
const simulating = ref(false)
const activeTab = ref('result')
const activeCollapse = ref('keyPoints')
const activeQuestions = ref(0)

// 保存输入的反应物信息（用于结果显示）
const inputReactants = ref([])

// 物质列表
const substances = ref([])

// 防抖定时器
let debounceTimer = null

// 物质分类
const substanceCategories = computed(() => {
  const categories = [
    { key: 'element', label: '单质', substances: [] },
    { key: 'compound', label: '化合物', substances: [] }
  ]

  substances.value.forEach(substance => {
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

  // 不再调用预览API，只在开始实验时才调用真实接口
  debounceTimer = setTimeout(() => {
    // 清空预览，等待用户点击开始实验
    preview.value = null
  }, 500)
}

function getSubstanceState(substanceId) {
  const substance = substances.value.find(s => s.id === substanceId)
  return substance?.state || 's'
}

// 获取物质列表
async function fetchSubstances() {
  try {
    const response = await listSubstance({ pageNum: 1, pageSize: 1000 })
    console.log('API完整响应:', response)

    // 处理不同的响应结构
    const data = response.rows || response.data || response
    console.log('物质数据:', data)

    if (response.code === 200 && data) {
      substances.value = (Array.isArray(data) ? data : []).map(item => ({
        id: item.id,
        // API字段名: nameZh 中文名称, nameEn 英文名称
        name: item.nameZh || item.name,
        formula: item.formula,
        // API返回的是 'element' 或 'compound'，我们需要映射到分类
        category: mapSubstanceTypeToCategory(item.substanceType),
        // API字段名: stateAtStp (标准状态下的状态)
        state: mapStateToCode(item.stateAtStp) || 's',
        molarMass: item.molarMass
      }))
      console.log('映射后的物质列表:', substances.value)
      console.log('物质分类:', substanceCategories.value)
    }
  } catch (error) {
    console.error('获取物质列表失败:', error)
    ElMessage.error('获取物质列表失败')
  }
}

// 映射物质类型到分类
function mapSubstanceTypeToCategory(substanceType) {
  // 直接使用API返回的类型: 'element' (单质) 或 'compound' (化合物)
  return substanceType || 'other'
}

// 映射状态到代码
function mapStateToCode(state) {
  const stateMap = {
    'solid': 's',
    'liquid': 'l',
    'gas': 'g',
    'aqueous': 'aq'
  }
  return stateMap[state] || state
}

// 开始完整模拟
async function startSimulation() {
  if (!canSimulate.value) {
    ElMessage.warning('请至少选择两种反应物')
    return
  }

  const validReactants = reactants.value.filter(r => r.substanceId)

  // 构建请求参数
  const requestData = {
    reactants: validReactants.map(r => ({
      substanceId: r.substanceId,
      amount: r.amount,
      unit: r.unit,
      state: getSubstanceState(r.substanceId),
      concentration: r.concentration || null
    })),
    conditions: {}
  }

  // 只添加非空的条件参数
  if (conditions.temperature !== null && conditions.temperature !== undefined) {
    requestData.conditions.temperature = conditions.temperature
  }
  if (conditions.pressure !== null && conditions.pressure !== undefined) {
    requestData.conditions.pressure = conditions.pressure
  }
  if (conditions.ph !== null && conditions.ph !== undefined) {
    requestData.conditions.ph = conditions.ph
  }
  if (conditions.ignited) {
    requestData.conditions.ignited = true
  }
  if (conditions.catalystId !== null && conditions.catalystId !== undefined) {
    requestData.conditions.catalystId = conditions.catalystId
  }
  if (conditions.solvent !== null && conditions.solvent !== undefined) {
    requestData.conditions.solvent = conditions.solvent
  }

  simulating.value = true
  try {
    const response = await simulateReaction(requestData)

    if (response.code === 200 && response.data?.reactionOccurred) {
      result.value = response.data
      hasResult.value = true
      activeTab.value = 'result'

      // 保存输入的反应物信息（包含物质名称、数量、单位）
      inputReactants.value = validReactants.map(r => {
        const substance = substances.value.find(s => s.id === r.substanceId)
        return {
          name: substance?.name || '',
          formula: substance?.formula || '',
          amount: r.amount,
          unit: r.unit,
          state: getSubstanceState(r.substanceId)
        }
      })

      // 设置预览数据用于显示
      preview.value = {
        reactionOccurred: true,
        equationText: response.data.primaryReaction?.equationText,
        equationHtml: response.data.primaryReaction?.equationHtml,
        phenomena: response.data.phenomena,
        chainReactions: response.data.chainReactions
      }

      ElMessage.success('模拟完成')
    } else if (response.code === 404) {
      ElMessage.warning(response.msg || '未找到匹配的化学方程式')
    } else {
      ElMessage.warning('这些物质不会发生化学反应')
    }
  } catch (error) {
    console.error('模拟失败:', error)
    ElMessage.error('模拟失败: ' + (error.response?.data?.msg || error.message || '未知错误'))
  } finally {
    simulating.value = false
  }
}

// 重置
function resetSimulation() {
  reactants.value = []
  conditions.temperature = null
  conditions.pressure = null
  conditions.ph = null
  conditions.ignited = false
  conditions.catalystId = null
  conditions.solvent = null
  preview.value = null
  result.value = null
  inputReactants.value = []
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

// 获取阶段类型颜色
function getStageTypeColor(stageType) {
  const colorMap = {
    initiation: 'primary',
    propagation: 'warning',
    completion: 'success'
  }
  return colorMap[stageType] || 'info'
}

// 获取阶段类型标签
function getStageTypeTag(stageType) {
  const tagMap = {
    initiation: 'primary',
    propagation: 'warning',
    completion: 'success'
  }
  return tagMap[stageType] || 'info'
}

// 获取阶段类型名称
function getStageTypeName(stageType) {
  const nameMap = {
    initiation: '引发阶段',
    propagation: '进行阶段',
    completion: '完成阶段'
  }
  return nameMap[stageType] || stageType
}

// 初始化
onMounted(async () => {
  // 先获取物质列表
  await fetchSubstances()
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
          align-self: flex-start;
          margin-top: 16px;
        }

        .reactant-form {
          flex: 1;

          :deep(.el-form) {
            width: 100%;
          }

          :deep(.el-form-item) {
            margin-bottom: 10px;
          }

          .substance-with-delete {
            display: flex;
            align-items: center;
            gap: 10px;

            .substance-select {
              flex: 1;
              min-width: 120px;
            }

            .el-button {
              flex-shrink: 0;
            }
          }

          .amount-unit-group {
            display: flex;
            align-items: center;
            gap: 8px;

            :deep(.el-input-number) {
              flex: 1;
              min-width: 80px;
            }

            :deep(.el-select) {
              width: 70px !important;
              flex-shrink: 0;
            }
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

      .chain-reactions-preview {
        margin-top: 16px;

        .chain-reaction-item {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 10px;

          .chain-equation {
            font-size: 14px;
            font-family: 'Times New Roman', serif;
            font-weight: 600;
            color: #409eff;
            margin-bottom: 6px;
          }

          .chain-tip {
            font-size: 12px;
            color: #909399;
          }
        }
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

          .reactants-info {
            margin-top: 16px;
            padding: 14px 16px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
            border-radius: 10px;
            border-left: 4px solid #409eff;

            .reactants-info-title {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
              font-weight: 600;
              color: #409eff;
              font-size: 13px;
            }

            .reactants-info-list {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
            }

            .reactant-info-item {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 8px 12px;
              background: white;
              border-radius: 8px;
              border: 1px solid #d4ecff;
              transition: all 0.3s;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
              }

              .reactant-name {
                font-weight: 600;
                color: #303133;
                font-size: 14px;
              }

              .reactant-formula {
                color: #909399;
                font-size: 13px;
                font-family: 'Times New Roman', serif;
              }

              .reactant-amount {
                color: #409eff;
                font-weight: 600;
                font-size: 13px;
                padding-left: 8px;
                border-left: 2px solid #e4e7ed;
                margin-left: 4px;
              }
            }
          }

          .oxidation-changes {
            margin-top: 20px;
            padding: 16px;
            background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
            border-radius: 10px;
            border-left: 4px solid #e6a23c;

            .oxidation-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
              font-weight: 600;
              color: #e6a23c;
              font-size: 14px;
            }

            .oxidation-list {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
            }

            .oxidation-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 14px;
              background: white;
              border-radius: 8px;
              border: 1px solid #f5dab1;
              transition: all 0.3s;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
              }

              .element-symbol {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #e6a23c 0%, #f0a830 100%);
                color: white;
                border-radius: 50%;
                font-weight: 700;
                font-size: 14px;
                font-family: 'Times New Roman', serif;
              }

              .oxidation-arrow {
                color: #909399;
                font-size: 16px;
                margin: 0 4px;
              }

              .oxidation-state {
                display: flex;
                align-items: center;
                gap: 4px;
                font-family: 'Times New Roman', serif;
                font-weight: 600;

                .oxidation-before {
                  color: #f56c6c;
                  font-size: 14px;
                }

                .oxidation-after {
                  color: #67c23a;
                  font-size: 14px;
                }
              }
            }
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
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .phenomenon-desc {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }

          .observation-points {
            margin-top: 16px;
            padding: 14px 16px;
            background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
            border-radius: 10px;
            border-left: 4px solid #e6a23c;

            .observation-title {
              font-weight: 600;
              color: #e6a23c;
              margin-bottom: 8px;
            }

            ul {
              margin: 0;
              padding-left: 20px;

              li {
                color: #606266;
                line-height: 1.8;
                font-size: 13px;
              }
            }
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

          .chain-equation {
            font-size: 16px;
            font-family: 'Times New Roman', serif;
            font-weight: 600;
            color: #409eff;
            margin-bottom: 12px;
            padding: 12px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
            border-radius: 8px;
          }

          .teaching-note {
            color: #e6a23c;
            padding: 10px 14px;
            background: #fff7e6;
            border-radius: 6px;
            border-left: 3px solid #e6a23c;
          }

          .reaction-type-info {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 20px;
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

      // 反应阶段时间轴样式
      .stages-timeline {
        padding: 20px 10px;

        .stage-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
          }

          .stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .stage-name {
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 600;
              font-size: 16px;
              color: #303133;
            }

            .stage-tags {
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }

          .stage-content {
            .stage-phenomena,
            .stage-color,
            .stage-microscopic {
              margin-bottom: 16px;

              &:last-child {
                margin-bottom: 0;
              }

              .stage-label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
                font-size: 13px;
                color: #909399;
                margin-bottom: 8px;
              }

              p {
                margin: 0;
                line-height: 1.8;
                color: #606266;
                font-size: 14px;
              }
            }

            .stage-microscopic {
              padding: 12px 16px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
              border-radius: 8px;
              border-left: 4px solid #409eff;

              p {
                font-style: italic;
              }
            }
          }
        }
      }

      // 教学指导卡片样式
      .teaching-card {
        border-radius: 12px;
        overflow: hidden;

        .teaching-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 15px;
          color: #303133;
        }

        .teaching-content {
          line-height: 1.8;
          color: #606266;
          font-size: 14px;
        }
      }

      .student-card .teaching-header {
        color: #409eff;
      }

      .teacher-card .teaching-header {
        color: #67c23a;
      }

      .keypoints-card .teaching-header {
        color: #e6a23c;
      }

      .questions-card .teaching-header {
        color: #409eff;
      }

      .mistakes-card .teaching-header {
        color: #f56c6c;
      }

      .keypoints-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 12px;

        .keypoint-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
          }

          span {
            flex: 1;
            line-height: 1.6;
            color: #606266;
            font-size: 13px;
          }
        }
      }

      .question-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        color: #303133;
      }

      .answer-content {
        .answer-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          strong {
            color: #606266;
            margin-right: 4px;
          }
        }
      }

      .mistakes-list {
        .mistake-item {
          padding: 14px 16px;
          background: linear-gradient(135deg, #fef0f0 0%, #fce4e4 100%);
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 4px solid #f56c6c;

          &:last-child {
            margin-bottom: 0;
          }

          .mistake-header,
          .mistake-correction {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.6;
          }

          .mistake-header {
            color: #f56c6c;
          }

          .mistake-correction {
            color: #67c23a;
          }
        }
      }

      // 安全注意事项样式
      .safety-card .teaching-header {
        color: #e6a23c;
      }

      .safety-notes-list {
        .safety-note-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 4px solid #e6a23c;
          transition: all 0.3s;

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);
          }

          &:last-child {
            margin-bottom: 0;
          }

          span {
            flex: 1;
            line-height: 1.6;
            color: #606266;
            font-size: 14px;
          }
        }
      }
    }
  }

  .knowledge-panel {
    .knowledge-card {
      border-radius: 12px;
      overflow: hidden;
      animation: fadeIn 0.5s ease-out;

      .knowledge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .knowledge-quick {
      .knowledge-section {
        margin-bottom: 18px;

        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .equation-display-small {
          font-size: 15px;
          text-align: center;
          padding: 14px;
          font-family: 'Times New Roman', serif;
          font-weight: 600;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
          border-radius: 8px;
          color: #409eff;
          line-height: 1.8;
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .keypoints-compact {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .keypoint-tag {
            display: block;
            padding: 10px 12px;
            background: linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%);
            border-radius: 6px;
            font-size: 13px;
            color: #606266;
            line-height: 1.6;
            border-left: 3px solid #e6a23c;
          }
        }

        .phenomena-compact {
          padding: 12px;
          background: linear-gradient(135deg, #e7f7ff 0%, #d4ecff 100%);
          border-radius: 8px;
          color: #409eff;
          line-height: 1.7;
          font-size: 13px;
          border-left: 3px solid #409eff;
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
