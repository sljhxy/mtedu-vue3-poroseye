<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="方程式" prop="equationText">
        <el-input v-model="queryParams.equationText" placeholder="请输入方程式" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="反应类型" prop="reactionTypeCode">
        <el-select v-model="queryParams.reactionTypeCode" placeholder="请选择" clearable style="width: 150px">
          <el-option v-for="item in reactionTypeOptions" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="难度等级" prop="difficultyLevel">
        <el-select v-model="queryParams.difficultyLevel" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="dict in chemistry_difficulty_level" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:equation:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:equation:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:equation:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:equation:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="equationList" @selection-change="handleSelectionChange" class="equation-table" stripe>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="化学方程式" align="left" prop="equationText" min-width="280">
        <template #default="scope">
          <div class="equation-cell">
            <div class="equation-text" v-html="formatEquationText(scope.row.equationHtml || scope.row.equationText)"></div>
            <!-- <div v-if="scope.row.reactants?.length || scope.row.products?.length" class="equation-meta">
          
              <span class="meta-item">{{ JSON.parse(scope.row.reactants).length || 0 }}个反应物</span>
              <span class="meta-divider">→</span>
              <span class="meta-item">{{ JSON.parse(scope.row.products).length || 0 }}个生成物</span>
            </div> -->
          </div>
        </template>
      </el-table-column>
      <el-table-column label="反应类型" align="center" prop="reactionTypeCode" width="120">
        <template #default="scope">
          <el-tag size="small" :type="getReactionTypeTagType(scope.row.reactionTypeCode)">{{ getReactionTypeName(scope.row.reactionTypeCode) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="速率" align="center" prop="reactionRate" width="80">
        <template #default="scope">
          <dict-tag :options="chemistry_reaction_rate" :value="scope.row.reactionRate" />
        </template>
      </el-table-column>
      <el-table-column label="氧化还原" align="center" prop="isRedox" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.isRedox ? 'warning' : 'info'" size="small">
            <el-icon v-if="scope.row.isRedox" style="vertical-align: -2px; margin-right: 4px;"><Lightning /></el-icon>
            {{ scope.row.isRedox ? '氧化还原' : '非' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="难度" align="center" prop="difficultyLevel" width="80">
        <template #default="scope">
          <dict-tag :options="chemistry_difficulty_level" :value="scope.row.difficultyLevel" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="isPublished" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isPublished ? 'success' : 'warning'" size="small">{{ scope.row.isPublished ? '已发布' : '草稿' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="320" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleView(scope.row)" v-hasPermi="['chemistry:equation:query']">详情</el-button>
          <el-button link type="info" size="small" @click="handlePhenomena(scope.row)" v-hasPermi="['chemistry:equation:edit']">现象</el-button>
          <el-button link type="warning" size="small" @click="handleKnowledge(scope.row)" v-hasPermi="['glxt:chemistry:knowledge:edit']">知识点</el-button>
          <el-button link type="success" size="small" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:equation:edit']">修改</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:equation:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="equation-form">
        <el-scrollbar max-height="60vh">
          <!-- 基础信息 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><InfoFilled /></el-icon>
              <span>基础信息</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="方程式文本" prop="equationText">
                  <el-input v-model="form.equationText" type="textarea" :rows="2" maxlength="500" placeholder="如: Fe + CuSO₄ → FeSO₄ + Cu" />
                  <div class="form-tip">支持使用下标数字（如₂、₃）和上标数字（如²⁺、³⁻）</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="方程式HTML" prop="equationHtml">
                  <el-input v-model="form.equationHtml" type="textarea" :rows="2" maxlength="500" placeholder="HTML格式的方程式显示，用于美化展示" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="反应类型" prop="reactionTypeCode">
                  <el-select v-model="form.reactionTypeCode" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in reactionTypeOptions" :key="item.code" :label="item.name" :value="item.code" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="反应速率" prop="reactionRate">
                  <el-select v-model="form.reactionRate" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="dict in chemistry_reaction_rate" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="难度等级" prop="difficultyLevel">
                  <el-select v-model="form.difficultyLevel" placeholder="请选择" style="width: 100%">
                    <el-option v-for="dict in chemistry_difficulty_level" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="关联知识点" prop="knowledgePoints">
                  <el-select v-model="form.knowledgePoints" multiple collapse-tags collapse-tags-tooltip placeholder="请选择知识点" style="width: 100%">
                    <el-option v-for="item in knowledgePointOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="氧化还原" prop="isRedox">
                  <el-switch v-model="form.isRedox" active-text="是" inactive-text="否" />
                  <span class="switch-hint">开启后可填写氧化态变化</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否发布" prop="isPublished">
                  <el-switch v-model="form.isPublished" active-text="发布" inactive-text="草稿" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 反应物与生成物 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Operation /></el-icon>
              <span>反应物与生成物</span>
            </div>
            <el-row :gutter="24">
              <!-- 反应物 -->
              <el-col :span="12">
                <div class="sub-section-header">
                  <span class="sub-section-title">反应物</span>
                  <el-tag size="small" type="info">左侧</el-tag>
                </div>
                <div class="substance-list">
                  <div v-for="(reactant, index) in form.reactants" :key="'reactant-' + index" class="substance-item">
                    <el-row :gutter="8">
                      <el-col :span="10">
                        <el-select v-model="reactant.substanceId" placeholder="选择物质" filterable size="small">
                          <el-option v-for="substance in substanceList" :key="substance.id" :label="substance.name" :value="substance.id">
                            <span>{{ substance.name }}</span>
                            <span class="text-gray text-xs ml-2">{{ substance.formula }}</span>
                          </el-option>
                        </el-select>
                      </el-col>
                      <el-col :span="6">
                        <el-input-number v-model="reactant.coefficient" :min="1" :max="99" controls-position="right" size="small" style="width: 100%" placeholder="系数" />
                      </el-col>
                      <el-col :span="6">
                        <el-select v-model="reactant.state" placeholder="状态" size="small">
                          <el-option label="固体" value="s" />
                          <el-option label="液体" value="l" />
                          <el-option label="气体" value="g" />
                          <el-option label="水溶液" value="aq" />
                        </el-select>
                      </el-col>
                      <el-col :span="2">
                        <el-button type="danger" :icon="Delete" circle size="small" @click="removeReactant(index)" />
                      </el-col>
                    </el-row>
                  </div>
                  <el-button v-if="form.reactants?.length === 0" type="primary" :icon="Plus" size="small" @click="addReactant">添加反应物</el-button>
                  <el-button v-else type="primary" :icon="Plus" size="small" plain @click="addReactant">添加</el-button>
                </div>
              </el-col>

              <!-- 生成物 -->
              <el-col :span="12">
                <div class="sub-section-header">
                  <span class="sub-section-title">生成物</span>
                  <el-tag size="small" type="success">右侧</el-tag>
                </div>
                <div class="substance-list">
                  <div v-for="(product, index) in form.products" :key="'product-' + index" class="substance-item">
                    <el-row :gutter="8">
                      <el-col :span="10">
                        <el-select v-model="product.substanceId" placeholder="选择物质" filterable size="small">
                          <el-option v-for="substance in substanceList" :key="substance.id" :label="substance.name" :value="substance.id">
                            <span>{{ substance.name }}</span>
                            <span class="text-gray text-xs ml-2">{{ substance.formula }}</span>
                          </el-option>
                        </el-select>
                      </el-col>
                      <el-col :span="6">
                        <el-input-number v-model="product.coefficient" :min="1" :max="99" controls-position="right" size="small" style="width: 100%" placeholder="系数" />
                      </el-col>
                      <el-col :span="6">
                        <el-select v-model="product.state" placeholder="状态" size="small">
                          <el-option label="固体" value="s" />
                          <el-option label="液体" value="l" />
                          <el-option label="气体" value="g" />
                          <el-option label="水溶液" value="aq" />
                        </el-select>
                      </el-col>
                      <el-col :span="2">
                        <el-button type="danger" :icon="Delete" circle size="small" @click="removeProduct(index)" />
                      </el-col>
                    </el-row>
                  </div>
                  <el-button v-if="form.products?.length === 0" type="success" :icon="Plus" size="small" @click="addProduct">添加生成物</el-button>
                  <el-button v-else type="success" :icon="Plus" size="small" plain @click="addProduct">添加</el-button>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 氧化态变化 -->
          <div class="form-section" v-if="form.isRedox">
            <div class="section-title">
              <el-icon><TrendCharts /></el-icon>
              <span>氧化态变化</span>
              <el-tag size="small" type="warning" class="ml-2">仅氧化还原反应</el-tag>
            </div>
            <div class="oxidation-list">
              <div v-for="(change, index) in form.oxidationChanges" :key="'oxidation-' + index" class="oxidation-item">
                <el-row :gutter="12">
                  <el-col :span="6">
                    <el-input v-model="change.element" placeholder="元素符号" size="small">
                      <!-- <template #prefix>Element</template> -->
                    </el-input>
                  </el-col>
                  <el-col :span="1" class="text-center">→</el-col>
                  <el-col :span="6">
                    <el-input v-model="change.from" placeholder="起始" size="small">
                      <!-- <template #prefix>From</template> -->
                    </el-input>
                  </el-col>
                  <el-col :span="1" class="text-center">→</el-col>
                  <el-col :span="6">
                    <el-input v-model="change.to" placeholder="结束" size="small">
                      <!-- <template #prefix>To</template> -->
                    </el-input>
                  </el-col>
                  <el-col :span="4">
                    <el-button type="danger" :icon="Delete" circle size="small" @click="removeOxidationChange(index)" />
                  </el-col>
                </el-row>
              </div>
              <el-button type="warning" :icon="Plus" size="small" @click="addOxidationChange">添加氧化态变化</el-button>
            </div>
          </div>

          <!-- 反应条件与热力学 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Setting /></el-icon>
              <span>反应条件与热力学</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="温度">
                  <el-input v-model="form.conditions.temperature" placeholder="如: 室温、加热、高温" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="介质">
                  <el-input v-model="form.conditions.medium" placeholder="如: 稀硫酸、水溶液" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="催化剂">
                  <el-input v-model="form.conditions.catalyst" placeholder="如: MnO₂、Fe" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="压力">
                  <el-input v-model="form.conditions.pressure" placeholder="如: 常压、高压" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="焓变(ΔH)" prop="enthalpyChange">
                  <el-input v-model="form.enthalpyChange" placeholder="如: -178 kJ/mol (负值表示放热)" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 反应现象对话框 -->
    <el-dialog title="编辑反应现象" v-model="phenomenaOpen" width="900px" append-to-body :close-on-click-modal="false">
      <el-form ref="phenomenaRef" :model="phenomenaForm" label-width="100px" class="phenomena-form">
        <el-scrollbar max-height="55vh">
          <!-- 现象摘要 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Document /></el-icon>
              <span>现象摘要</span>
            </div>
            <el-form-item label="现象描述" prop="phenomenonSummary">
              <el-input v-model="phenomenaForm.phenomenonSummary" type="textarea" :rows="3" placeholder="请简要描述反应的主要现象" />
            </el-form-item>
          </div>

          <!-- 颜色变化 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Brush /></el-icon>
              <span>颜色变化</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="反应前颜色">
                  <el-input v-model="phenomenaForm.colorChange.from" placeholder="如: 无色、蓝色" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="反应后颜色">
                  <el-input v-model="phenomenaForm.colorChange.to" placeholder="如: 无色、红色" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否有变化">
                  <el-switch v-model="phenomenaForm.hasColorChange" active-text="是" inactive-text="否" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="变化描述">
                  <el-input v-model="phenomenaForm.colorChange.description" type="textarea" :rows="2" placeholder="描述颜色变化的过程" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 沉淀现象 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Box /></el-icon>
              <span>沉淀现象</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="是否产生沉淀">
                  <el-switch v-model="phenomenaForm.precipitate.hasPrecipitate" active-text="是" inactive-text="否" />
                </el-form-item>
              </el-col>
              <el-col :span="9" v-if="phenomenaForm.precipitate.hasPrecipitate">
                <el-form-item label="沉淀颜色">
                  <el-select v-model="phenomenaForm.precipitate.color" placeholder="选择颜色" style="width: 100%">
                    <el-option label="白色" value="白色" />
                    <el-option label="蓝色" value="蓝色" />
                    <el-option label="绿色" value="绿色" />
                    <el-option label="黄色" value="黄色" />
                    <el-option label="红色" value="红色" />
                    <el-option label="褐色" value="褐色" />
                    <el-option label="黑色" value="黑色" />
                    <el-option label="无色" value="无色" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="9" v-if="phenomenaForm.precipitate.hasPrecipitate">
                <el-form-item label="沉淀状态">
                  <el-select v-model="phenomenaForm.precipitate.state" placeholder="选择状态" style="width: 100%">
                    <el-option label="絮状" value="絮状" />
                    <el-option label="颗粒状" value="颗粒状" />
                    <el-option label="胶状" value="胶状" />
                    <el-option label="晶体" value="晶体" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16" v-if="phenomenaForm.precipitate.hasPrecipitate">
              <el-col :span="24">
                <el-form-item label="沉淀描述">
                  <el-input v-model="phenomenaForm.precipitate.description" type="textarea" :rows="2" placeholder="描述沉淀的形态和特点" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 气体现象 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><WindPower /></el-icon>
              <span>气体现象</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="是否产生气体">
                  <el-switch v-model="phenomenaForm.gasEvolution.hasGas" active-text="是" inactive-text="否" />
                </el-form-item>
              </el-col>
              <el-col :span="9" v-if="phenomenaForm.gasEvolution.hasGas">
                <el-form-item label="气体名称">
                  <el-input v-model="phenomenaForm.gasEvolution.gasName" placeholder="如: 氢气、二氧化碳" />
                </el-form-item>
              </el-col>
              <el-col :span="9" v-if="phenomenaForm.gasEvolution.hasGas">
                <el-form-item label="化学式">
                  <el-input v-model="phenomenaForm.gasEvolution.formula" placeholder="如: H₂、CO₂" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16" v-if="phenomenaForm.gasEvolution.hasGas">
              <el-col :span="24">
                <el-form-item label="气体描述">
                  <el-input v-model="phenomenaForm.gasEvolution.description" type="textarea" :rows="2" placeholder="描述气体的产生过程、特点等" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 火焰现象 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Sunny /></el-icon>
              <span>火焰现象</span>
              <el-tag size="small" type="info" class="ml-2">仅燃烧反应</el-tag>
            </div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="火焰颜色">
                  <el-input v-model="phenomenaForm.flamePhenomenon.color" placeholder="如: 淡蓝色、黄色" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="火焰强度">
                  <el-select v-model="phenomenaForm.flamePhenomenon.intensity" placeholder="选择强度" style="width: 100%">
                    <el-option label="强烈" value="强烈" />
                    <el-option label="中等" value="中等" />
                    <el-option label="微弱" value="微弱" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="火焰描述">
                  <el-input v-model="phenomenaForm.flamePhenomenon.description" type="textarea" :rows="2" placeholder="描述火焰的形态、特点等" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 温度变化 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><TrendCharts /></el-icon>
              <span>温度变化</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="温度变化类型">
                  <el-select v-model="phenomenaForm.temperatureChange.type" placeholder="请选择" style="width: 100%">
                    <el-option label="放热" value="increase" />
                    <el-option label="吸热" value="decrease" />
                    <el-option label="无明显变化" value="no_change" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="温度变化值">
                  <el-input v-model="phenomenaForm.temperatureChange.delta" placeholder="如: +15°C、-5°C" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="温度描述">
                  <el-input v-model="phenomenaForm.temperatureChange.description" type="textarea" :rows="2" placeholder="描述温度变化的特点，如试管壁发烫等" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 其他现象 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><MoreFilled /></el-icon>
              <span>其他现象</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="声音描述">
                  <el-input v-model="phenomenaForm.soundPhenomenon" placeholder="如: 轻微的嘶嘶声、爆炸声" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="观察要点">
                  <el-input v-model="observationPointsText" type="textarea" :rows="3" placeholder="每行一个观察要点，如：&#10;观察气泡产生情况&#10;用手触摸试管壁感受温度变化&#10;观察溶液颜色变化" />
                  <div class="form-tip">每行一个观察要点，将自动转换为数组</div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 微观解释 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><ViewIcon /></el-icon>
              <span>微观解释</span>
              <el-tag size="small" type="warning" class="ml-2">教学辅助</el-tag>
            </div>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="微观层面解释">
                  <el-input v-model="phenomenaForm.microscopicExplanation" type="textarea" :rows="4" placeholder="从分子、原子、离子角度解释反应现象，如：锌原子失去电子成为锌离子，氢离子获得电子成为氢原子并结合成氢气分子" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelPhenomena">取消</el-button>
          <el-button type="primary" @click="submitPhenomena">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 知识点对话框 -->
    <el-dialog title="编辑方程式知识点" v-model="knowledgeOpen" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="knowledgeRef" :model="knowledgeForm" label-width="100px" class="knowledge-form">
        <el-scrollbar max-height="55vh">
          <!-- 知识点列表 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Reading /></el-icon>
              <span>知识点列表</span>
              <el-tag size="small" type="info" class="ml-2">关联知识点</el-tag>
            </div>
            <el-form-item label="知识点">
              <div class="knowledge-input-wrapper">
                <el-select
                  v-model="knowledgeInput"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  :reserve-keyword="false"
                  placeholder="输入知识点后按回车添加，或从下拉列表选择"
                  style="width: 100%"
                  @change="handleKnowledgeInputChange"
                >
                  <el-option
                    v-for="item in commonKnowledgePoints"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="已选知识点" v-if="knowledgeForm.knowledgePoints && knowledgeForm.knowledgePoints.length > 0">
              <div class="knowledge-tags">
                <el-tag
                  v-for="(kp, index) in knowledgeForm.knowledgePoints"
                  :key="index"
                  closable
                  @close="removeKnowledgePoint(index)"
                  class="knowledge-tag"
                >
                  {{ kp }}
                </el-tag>
              </div>
            </el-form-item>
            <el-form-item label="知识点数量">
              <el-input-number v-model="knowledgeForm.kpCount" :min="0" disabled />
              <div class="form-tip">根据知识点数量自动计算</div>
            </el-form-item>
          </div>

          <!-- 方程式信息 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><InfoFilled /></el-icon>
              <span>方程式信息</span>
            </div>
            <el-form-item label="当前方程式">
              <div class="equation-preview">
                {{ currentEquation?.equationText || '-' }}
              </div>
            </el-form-item>
          </div>
        </el-scrollbar>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelKnowledge">取消</el-button>
          <el-button type="danger" @click="handleDeleteKnowledge" v-if="hasKnowledgeData">清空知识点</el-button>
          <el-button type="primary" @click="submitKnowledge">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Equation">
import { listEquation, getEquation, addEquation, updateEquation, delEquation, exportEquation } from '@/api/chemistry/equation'
import { listSubstance } from '@/api/chemistry/substance'
import { savePhenomena, getPhenomena } from '@/api/chemistry/phenomena'
import { getKnowledgeByEquationId, saveEquationKnowledge, deleteEquationKnowledge } from '@/api/chemistry/equationKnowledge'
import { Search, Refresh, Plus, Edit, Delete, Download, InfoFilled, Operation, TrendCharts, Setting, Lightning, Document, Brush, Box, WindPower, Sunny, MoreFilled, View as ViewIcon, Reading } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

// 获取系统字典
const { chemistry_difficulty_level, chemistry_reaction_rate } = proxy.useDict('chemistry_difficulty_level', 'chemistry_reaction_rate')

const equationList = ref([])
const reactionTypeOptions = ref([])  // 从后端获取的反应类型
const substanceList = ref([])  // 物质列表
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const queryFormRef = ref()
const formRef = ref()

// 现象相关
const phenomenaOpen = ref(false)
const phenomenaRef = ref()
const currentEquationId = ref(null)
const observationPointsText = ref('')

// 知识点相关
const knowledgeOpen = ref(false)
const knowledgeRef = ref()
const currentEquation = ref(null)
const knowledgeInput = ref([])
const hasKnowledgeData = ref(false)

const knowledgeForm = ref({
  knowledgePoints: [],
  kpCount: 0
})

// 常用知识点选项
const commonKnowledgePoints = ref([
  '氧化还原反应',
  '置换反应',
  '酸碱反应',
  '沉淀反应',
  '燃烧反应',
  '化合反应',
  '分解反应',
  '复分解反应',
  '中和反应',
  '离子反应',
  '氧化反应',
  '还原反应',
  '放热反应',
  '吸热反应',
  '可逆反应',
  '化学平衡',
  '电化学',
  '电解',
  '原电池',
  '金属活动性',
  '非金属活动性',
  '实验制法',
  '工业制法',
  '实验室制氢气',
  '实验室制氧气',
  '实验室制二氧化碳'
])

const phenomenaForm = ref({
  phenomenonSummary: '',
  colorChange: {
    from: '',
    to: '',
    description: ''
  },
  hasColorChange: false,
  precipitate: {
    hasPrecipitate: false,
    color: '',
    state: '',
    description: ''
  },
  gasEvolution: {
    hasGas: false,
    gasName: '',
    formula: '',
    description: ''
  },
  flamePhenomenon: {
    description: '',
    color: '',
    intensity: ''
  },
  temperatureChange: {
    type: '',
    delta: '',
    description: ''
  },
  soundPhenomenon: '',
  microscopicExplanation: '',
  observationPoints: []
})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  equationText: null,
  reactionTypeCode: null,
  difficultyLevel: null
})

const form = ref({})

const rules = {
  equationText: [
    { required: true, message: '方程式不能为空', trigger: 'blur' },
    { max: 500, message: '最多500个字符', trigger: 'blur' }
  ],
  reactionTypeCode: [
    { required: true, message: '反应类型不能为空', trigger: 'change' }
  ]
}

// 知识点选项（假数据，后续对接API）
const knowledgePointOptions = ref([
  { value: 'oxidation_reduction', label: '氧化还原反应' },
  { value: 'acid_base', label: '酸碱反应' },
  { value: 'precipitation', label: '沉淀反应' },
  { value: 'combustion', label: '燃烧反应' },
  { value: 'electrochemistry', label: '电化学' },
  { value: 'thermochemistry', label: '热化学' },
  { value: 'chemical_equilibrium', label: '化学平衡' },
  { value: 'reaction_rate', label: '反应速率' }
])

/** 获取反应类型列表 - 从后端获取 */
function getReactionTypeList() {
  // TODO: 这里需要调用后端API获取反应类型列表
  // 目前使用临时数据，实际应该调用类似 listReactionType() 的API
  reactionTypeOptions.value = [
    { code: 'COMBINATION', name: '化合反应' },
    { code: 'DECOMPOSITION', name: '分解反应' },
    { code: 'DISPLACEMENT', name: '置换反应' },
    { code: 'DOUBLE_DISPLACEMENT', name: '复分解反应' },
    { code: 'REDOX', name: '氧化还原反应' },
    { code: 'COMBUSTION', name: '燃烧反应' },
    { code: 'NEUTRALIZATION', name: '中和反应' },
    { code: 'PRECIPITATION', name: '沉淀反应' }
  ]
}

/** 格式化方程式文本 */
function formatEquationText(text) {
  if (!text) return ''
  // 这里可以添加更多格式化逻辑
  return text
}

/** 获取反应类型名称 */
function getReactionTypeName(code) {
  const item = reactionTypeOptions.value.find(r => r.code === code)
  return item ? item.name : code
}

/** 获取反应类型标签类型 */
function getReactionTypeTagType(code) {
  const typeMap = {
    COMBINATION: 'primary',
    DECOMPOSITION: 'success',
    DISPLACEMENT: 'warning',
    DOUBLE_DISPLACEMENT: 'info',
    REDOX: 'danger',
    COMBUSTION: 'danger',
    NEUTRALIZATION: 'primary',
    PRECIPITATION: 'info'
  }
  return typeMap[code] || ''
}

/** 查询化学方程式列表 */
function getList() {
  loading.value = true
  listEquation(queryParams.value).then(response => {
    equationList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    equationText: null,
    equationHtml: null,
    reactionTypeCode: null,
    isRedox: false,
    difficultyLevel: null,
    isPublished: false,
    conditions: {
      temperature: null,
      medium: null,
      catalyst: null,
      pressure: null
    },
    enthalpyChange: null,
    reactionRate: null,
    reactants: [],
    products: [],
    oxidationChanges: [],
    knowledgePoints: []
  }
  proxy.resetForm('formRef')
}

/** 获取物质列表 */
function getSubstanceList() {
  listSubstance({ pageNum: 1, pageSize: 1000 }).then(response => {
    substanceList.value = response.rows || []
  }).catch(() => {
    substanceList.value = []
  })
}

/** 添加反应物 */
function addReactant() {
  if (!form.value.reactants) {
    form.value.reactants = []
  }
  form.value.reactants.push({
    substanceId: null,
    coefficient: 1,
    state: 's'
  })
}

/** 移除反应物 */
function removeReactant(index) {
  form.value.reactants.splice(index, 1)
}

/** 添加生成物 */
function addProduct() {
  if (!form.value.products) {
    form.value.products = []
  }
  form.value.products.push({
    substanceId: null,
    coefficient: 1,
    state: 's'
  })
}

/** 移除生成物 */
function removeProduct(index) {
  form.value.products.splice(index, 1)
}

/** 添加氧化态变化 */
function addOxidationChange() {
  if (!form.value.oxidationChanges) {
    form.value.oxidationChanges = []
  }
  form.value.oxidationChanges.push({
    element: null,
    from: null,
    to: null
  })
}

/** 移除氧化态变化 */
function removeOxidationChange(index) {
  form.value.oxidationChanges.splice(index, 1)
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryFormRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加化学方程式'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getEquation(id).then(response => {
    const data = response.data

    // 解析 conditions（可能是 JSON 字符串或对象）
    let conditions = {
      temperature: null,
      medium: null,
      catalyst: null,
      pressure: null
    }
    if (data.conditions) {
      if (typeof data.conditions === 'string') {
        try {
          conditions = JSON.parse(data.conditions)
        } catch (e) {
          // 解析失败，使用默认空对象
        }
      } else if (typeof data.conditions === 'object') {
        conditions = data.conditions
      }
    }

    form.value = {
      ...data,
      conditions: conditions
    }
    open.value = true
    title.value = '修改化学方程式'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateEquation(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addEquation(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deleteIds = row.id || ids.value.join(',')
  proxy.$modal.confirm('是否确认删除化学方程式编号为"' + deleteIds + '"的数据项？').then(() => {
    return delEquation(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/equation/export', {
    ...queryParams.value
  }, `equation_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getEquation(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '方程式详情'
  })
}

/** 编辑反应现象 */
function handlePhenomena(row) {
  if (!row.id) {
    proxy.$modal.msgWarning('请先保存方程式后再编辑现象')
    return
  }
  currentEquationId.value = row.id
  resetPhenomena()

  // 加载现有现象数据
  getPhenomena(row.id).then(response => {
    if (response.data) {
      const data = response.data

      // 解析 JSON 字符串为对象
      const parseJSON = (str) => {
        if (!str || str === '' || str === 'null') return null
        try {
          return JSON.parse(str)
        } catch (e) {
          return null
        }
      }

      // 解析并映射后端数据到前端模型
      const colorChangeData = parseJSON(data.colorChange)
      const precipitateData = parseJSON(data.precipitate)
      const gasEvolutionData = parseJSON(data.gasEvolution)
      const flamePhenomenonData = parseJSON(data.flamePhenomenon)
      const temperatureChangeData = parseJSON(data.temperatureChange)
      const obsPoints = parseJSON(data.observationPoints) || []

      phenomenaForm.value = {
        phenomenonSummary: data.phenomenonSummary || '',
        colorChange: {
          from: colorChangeData?.before || colorChangeData?.from || '',
          to: colorChangeData?.after || colorChangeData?.to || '',
          description: colorChangeData?.description || ''
        },
        hasColorChange: !!(colorChangeData?.before || colorChangeData?.after || colorChangeData?.from || colorChangeData?.to),
        precipitate: {
          hasPrecipitate: precipitateData?.hasPrecipitate || false,
          color: precipitateData?.color || '',
          state: precipitateData?.state || '',
          description: precipitateData?.description || ''
        },
        gasEvolution: {
          hasGas: gasEvolutionData?.hasGas || false,
          gasName: gasEvolutionData?.gasName || '',
          formula: gasEvolutionData?.formula || gasEvolutionData?.gasProperties || '',
          description: gasEvolutionData?.gasDescription || gasEvolutionData?.description || ''
        },
        flamePhenomenon: {
          description: flamePhenomenonData?.description || '',
          color: flamePhenomenonData?.color || '',
          intensity: flamePhenomenonData?.intensity || ''
        },
        temperatureChange: {
          type: temperatureChangeData?.isExothermic ? 'increase' : (temperatureChangeData?.type || ''),
          delta: temperatureChangeData?.temperatureChange || temperatureChangeData?.delta || '',
          description: temperatureChangeData?.description || ''
        },
        soundPhenomenon: data.soundPhenomenon || '',
        microscopicExplanation: data.microscopicExplanation || '',
        observationPoints: obsPoints
      }
      // 将数组转换为文本
      observationPointsText.value = Array.isArray(obsPoints) ? obsPoints.join('\n') : ''
    }
    phenomenaOpen.value = true
  }).catch(() => {
    // 没有现象数据，使用空白表单
    phenomenaOpen.value = true
  })
}

/** 重置现象表单 */
function resetPhenomena() {
  phenomenaForm.value = {
    phenomenonSummary: '',
    colorChange: { from: '', to: '', description: '' },
    hasColorChange: false,
    precipitate: { hasPrecipitate: false, color: '', state: '', description: '' },
    gasEvolution: { hasGas: false, gasName: '', formula: '', description: '' },
    flamePhenomenon: { description: '', color: '', intensity: '' },
    temperatureChange: { type: '', delta: '', description: '' },
    soundPhenomenon: '',
    microscopicExplanation: '',
    observationPoints: []
  }
  observationPointsText.value = ''
}

/** 取消现象编辑 */
function cancelPhenomena() {
  phenomenaOpen.value = false
  resetPhenomena()
}

/** 提交现象表单 */
function submitPhenomena() {
  // 将观察要点文本转换为数组
  const observationPoints = observationPointsText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  const data = {
    phenomenonSummary: phenomenaForm.value.phenomenonSummary,
    colorChange: {
      from: phenomenaForm.value.colorChange.from,
      to: phenomenaForm.value.colorChange.to,
      description: phenomenaForm.value.colorChange.description
    },
    precipitate: phenomenaForm.value.precipitate,
    gasEvolution: phenomenaForm.value.gasEvolution,
    flamePhenomenon: phenomenaForm.value.flamePhenomenon,
    temperatureChange: phenomenaForm.value.temperatureChange,
    soundPhenomenon: phenomenaForm.value.soundPhenomenon,
    microscopicExplanation: phenomenaForm.value.microscopicExplanation,
    observationPoints: observationPoints
  }

  savePhenomena(currentEquationId.value, data).then(() => {
    proxy.$modal.msgSuccess('现象保存成功')
    phenomenaOpen.value = false
    getList()
  }).catch(() => {
    proxy.$modal.msgError('现象保存失败')
  })
}

/** 编辑知识点 */
function handleKnowledge(row) {
  if (!row.id) {
    proxy.$modal.msgWarning('请先保存方程式后再编辑知识点')
    return
  }
  currentEquation.value = row
  resetKnowledge()

  // 加载现有知识点数据
  getKnowledgeByEquationId(row.id).then(response => {
    if (response.data) {
      const data = response.data

      // 解析知识点 JSON 字符串
      const parseJSON = (str) => {
        if (!str || str === '' || str === 'null') return []
        try {
          const parsed = JSON.parse(str)
          return Array.isArray(parsed) ? parsed : []
        } catch (e) {
          return []
        }
      }

      const kps = parseJSON(data.knowledgePoints)
      knowledgeForm.value = {
        knowledgePoints: kps,
        kpCount: kps.length
      }
      knowledgeInput.value = [...kps]
      hasKnowledgeData.value = kps.length > 0
    }
    knowledgeOpen.value = true
  }).catch(() => {
    // 没有知识点数据，使用空白表单
    knowledgeOpen.value = true
  })
}

/** 重置知识点表单 */
function resetKnowledge() {
  knowledgeForm.value = {
    knowledgePoints: [],
    kpCount: 0
  }
  knowledgeInput.value = []
  hasKnowledgeData.value = false
}

/** 处理知识点输入变化 */
function handleKnowledgeInputChange(value) {
  knowledgeForm.value.knowledgePoints = value || []
  knowledgeForm.value.kpCount = value ? value.length : 0
}

/** 移除知识点 */
function removeKnowledgePoint(index) {
  knowledgeForm.value.knowledgePoints.splice(index, 1)
  knowledgeForm.value.kpCount = knowledgeForm.value.knowledgePoints.length
  knowledgeInput.value = [...knowledgeForm.value.knowledgePoints]
}

/** 取消知识点编辑 */
function cancelKnowledge() {
  knowledgeOpen.value = false
  resetKnowledge()
}

/** 提交知识点表单 */
function submitKnowledge() {
  if (!knowledgeForm.value.knowledgePoints || knowledgeForm.value.knowledgePoints.length === 0) {
    proxy.$modal.msgWarning('请至少添加一个知识点')
    return
  }

  const data = {
    knowledgePoints: JSON.stringify(knowledgeForm.value.knowledgePoints),
    kpCount: knowledgeForm.value.knowledgePoints.length
  }

  saveEquationKnowledge(currentEquation.value.id, data).then(() => {
    proxy.$modal.msgSuccess('知识点保存成功')
    knowledgeOpen.value = false
    getList()
  }).catch(() => {
    proxy.$modal.msgError('知识点保存失败')
  })
}

/** 删除/清空知识点 */
function handleDeleteKnowledge() {
  proxy.$modal.confirm('确认清空该方程式的所有知识点吗？').then(() => {
    return deleteEquationKnowledge(currentEquation.value.id)
  }).then(() => {
    proxy.$modal.msgSuccess('知识点已清空')
    knowledgeOpen.value = false
    getList()
  }).catch(() => {})
}

// 初始化
getReactionTypeList()
getSubstanceList()
getList()
</script>

<style lang="scss" scoped>
.equation-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;

  .el-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #409eff;
  }

  span {
    flex: 1;
  }
}

.sub-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #dcdfe6;
}

.sub-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.substance-list {
  min-height: 60px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
}

.substance-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;

  &:hover {
    background: #ecf5ff;
    border-color: #409eff;
  }

  &:last-child {
    margin-bottom: 0;
  }

  :deep(.el-input-number) {
    width: 100%;
  }
}

.oxidation-list {
  min-height: 60px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px dashed #e4e7ed;
}

.oxidation-item {
  margin-bottom: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%);
  border-radius: 6px;
  border: 1px solid #ffe6cc;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, #fff5e6 0%, #ffedd6 100%);
    border-color: #ffb366;
  }

  &:last-child {
    margin-bottom: 0;
  }

  .text-center {
    text-align: center;
    line-height: 32px;
    color: #909399;
    font-weight: 600;
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.switch-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.ml-2 {
  margin-left: 8px;
}

.text-gray {
  color: #909399;
}

.text-xs {
  font-size: 12px;
}

.text-center {
  text-align: center;
}

// 表格样式
.equation-table {
  :deep(.el-table__cell) {
    padding: 12px 0;
  }

  .equation-cell {
    .equation-text {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .equation-meta {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #909399;

      .meta-item {
        display: inline-flex;
        align-items: center;
      }

      .meta-divider {
        margin: 0 6px;
        color: #dcdfe6;
      }
    }
  }

  :deep(.el-button + .el-button) {
    margin-left: 4px;
  }
}

// 现象表单样式
.phenomena-form {
  :deep(.el-form-item) {
    margin-bottom: 14px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

// 知识点表单样式
.knowledge-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  .knowledge-input-wrapper {
    width: 100%;
  }

  .knowledge-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #dcdfe6;
    min-height: 50px;

    .knowledge-tag {
      font-size: 13px;
      padding: 4px 10px;
      background: #ecf5ff;
      border-color: #409eff;
      color: #409eff;

      &:hover {
        background: #409eff;
        color: #fff;
      }
    }
  }

  .equation-preview {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #dcdfe6;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}
</style>
