<template>
  <div class="periodic-table-container">
    <!-- 标题 -->
    <div class="table-header">
      <h1 class="table-title">元素周期表</h1>
    </div>

    <!-- 图例和说明 -->
    <div class="legend-section">
      <div class="legend-box">
        <div class="legend-item"><span class="legend-color" style="background: #FFB6C1;"></span>碱金属</div>
        <div class="legend-item"><span class="legend-color" style="background: #FFE4C4;"></span>碱土金属</div>
        <div class="legend-item"><span class="legend-color" style="background: #FFEFD5;"></span>过渡金属</div>
        <div class="legend-item"><span class="legend-color" style="background: #B0E0E6;"></span>类金属</div>
        <div class="legend-item"><span class="legend-color" style="background: #98FB98;"></span>非金属</div>
        <div class="legend-item"><span class="legend-color" style="background: #DDA0DD;"></span>卤素</div>
        <div class="legend-item"><span class="legend-color" style="background: #FFDAB9;"></span>稀有气体</div>
      </div>
    </div>

    <!-- 搜索工具栏 -->
    <div class="search-toolbar">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" size="small">
        <el-form-item label="原子序数">
          <el-input v-model="queryParams.atomicNumber" placeholder="原子序数" clearable style="width: 100px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="元素符号">
          <el-input v-model="queryParams.symbol" placeholder="元素符号" clearable style="width: 100px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="中文名">
          <el-input v-model="queryParams.nameZh" placeholder="中文名" clearable style="width: 120px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 周期表主体 -->
    <div class="table-wrapper">
      <!-- 主表：7 行 18 列 -->
      <div class="main-table">
        <!-- 周期标签 -->
        <div class="period-labels">
          <div v-for="p in 7" :key="p" class="period-label">{{ p }}</div>
        </div>

        <!-- 元素网格 -->
        <div class="elements-grid">
          <!-- 图示说明 - 放在第 2-3 周期、第 5-11 列的空白区域（Be 和 B 中间） -->
          <div class="legend-example-cell" style="grid-row: 2 / span 2; grid-column: 5 / span 7;">
            <div class="legend-example-title">元素信息说明</div>
            <div class="legend-example-content">
              <div class="example-cell">
                <span class="legend-atomic-number">1</span>
                <span class="legend-symbol">H</span>
                <span class="legend-name">氢</span>
                <span class="legend-mass">1.008</span>
              </div>
              <div class="legend-annotations">
                <div class="annotation"><span class="annotation-line line-atomic"></span>原子序数</div>
                <div class="annotation"><span class="annotation-line line-symbol"></span>元素符号</div>
                <div class="annotation"><span class="annotation-line line-name"></span>元素名称</div>
                <div class="annotation"><span class="annotation-line line-mass"></span>相对原子质量</div>
              </div>
            </div>
          </div>

          <template v-for="row in 7" :key="row">
            <template v-for="col in 18" :key="col">
              <div
                v-if="shouldShowCell(row, col) && !(row >= 2 && row <= 3 && col >= 5 && col <= 11)"
                class="element-cell"
                :class="['period-' + row, 'group-' + col, getCellClass(getElementAt(row, col)), { 'empty-cell': !getElementAt(row, col) }]"
                :style="{
                  gridRow: row,
                  gridColumn: col
                }"
                @click="showElementDetail(getElementAt(row, col))"
              >
                <div v-if="getElementAt(row, col)" class="cell-content">
                  <span class="atomic-number">{{ getElementAt(row, col).atomicNumber }}</span>
                  <span class="element-symbol">{{ getElementAt(row, col).symbol }}</span>
                  <span class="element-name">{{ getElementAt(row, col).nameZh }}</span>
                  <span class="atomic-mass">{{ formatAtomicMass(getElementAt(row, col).atomicMass) }}</span>
                </div>
                <div v-else class="cell-placeholder">
                  <span>{{ getPlaceholderText(row, col) }}</span>
                </div>
              </div>
            </template>
          </template>
        </div>

        <!-- 族标签 -->
        <div class="group-labels">
          <div v-for="g in 18" :key="g" class="group-label" :style="{ gridColumn: g }">{{ g }}</div>
        </div>
      </div>

      <!-- 镧系和锕系 -->
      <div class="inner-transition">
        <div class="series-row">
          <span class="series-label">镧系</span>
          <div class="series-elements">
            <div
              v-for="el in lanthanides"
              :key="el.atomicNumber"
              class="element-cell small"
              :class="getCellClass(el)"
              @click="showElementDetail(el)"
            >
              <div class="cell-content">
                <span class="atomic-number">{{ el.atomicNumber }}</span>
                <span class="element-symbol">{{ el.symbol }}</span>
                <span class="element-name">{{ el.nameZh }}</span>
                <span class="atomic-mass">{{ formatAtomicMass(el.atomicMass) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="series-row">
          <span class="series-label">锕系</span>
          <div class="series-elements">
            <div
              v-for="el in actinides"
              :key="el.atomicNumber"
              class="element-cell small"
              :class="getCellClass(el)"
              @click="showElementDetail(el)"
            >
              <div class="cell-content">
                <span class="atomic-number">{{ el.atomicNumber }}</span>
                <span class="element-symbol">{{ el.symbol }}</span>
                <span class="element-name">{{ el.nameZh }}</span>
                <span class="atomic-mass">{{ formatAtomicMass(el.atomicMass) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 元素详情弹窗 -->
    <el-dialog v-model="detailVisible" title="元素详情" width="800px" class="element-detail-dialog">
      <div v-if="selectedElement" class="element-detail-content">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="原子序数">{{ selectedElement.atomicNumber }}</el-descriptions-item>
          <el-descriptions-item label="元素符号">{{ selectedElement.symbol }}</el-descriptions-item>
          <el-descriptions-item label="中文名称">{{ selectedElement.nameZh }}</el-descriptions-item>
          <el-descriptions-item label="英文名称">{{ selectedElement.nameEn }}</el-descriptions-item>
          <el-descriptions-item label="相对原子质量">{{ selectedElement.atomicMass }}</el-descriptions-item>
          <el-descriptions-item label="元素分类">{{ selectedElement.category }}</el-descriptions-item>
          <el-descriptions-item label="所属周期">{{ selectedElement.period }}</el-descriptions-item>
          <el-descriptions-item label="所属族">{{ selectedElement.groupNum }}</el-descriptions-item>
          <el-descriptions-item label="电子区">{{ selectedElement.block }}</el-descriptions-item>
          <el-descriptions-item label="电子排布">{{ selectedElement.electronConfiguration || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="物理性质" :column="2" border style="margin-top: 15px">
          <el-descriptions-item label="标准状态">{{ getStateLabel(selectedElement.stateAtStp) }}</el-descriptions-item>
          <el-descriptions-item label="颜色">{{ selectedElement.color || '-' }}</el-descriptions-item>
          <el-descriptions-item label="熔点">{{ selectedElement.meltingPoint !== null ? selectedElement.meltingPoint + '°C' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="沸点">{{ selectedElement.boilingPoint !== null ? selectedElement.boilingPoint + '°C' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="密度">{{ selectedElement.density !== null ? selectedElement.density + ' g/cm³' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="电负性">{{ selectedElement.electronegativity !== null ? selectedElement.electronegativity : '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions" style="margin-top: 20px; text-align: center;">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增元素</el-button>
          <el-button type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
          <el-button type="danger" :icon="Delete" @click="handleDelete">删除</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialogTitle" v-model="editVisible" width="850px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="15">
              <el-col :span="8">
                <el-form-item label="原子序数" prop="atomicNumber">
                  <el-input-number v-model="form.atomicNumber" :min="1" :max="118" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="元素符号" prop="symbol">
                  <el-input v-model="form.symbol" maxlength="10" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="元素分类" prop="category">
                  <el-select v-model="form.category" placeholder="请选择" style="width: 100%">
                    <el-option v-for="(label, value) in elementCategoryOptions" :key="value" :label="label" :value="value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :span="8">
                <el-form-item label="中文名称" prop="nameZh">
                  <el-input v-model="form.nameZh" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="英文名称" prop="nameEn">
                  <el-input v-model="form.nameEn" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="相对原子质量" prop="atomicMass">
                  <el-input-number v-model="form.atomicMass" :precision="4" :step="0.0001" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :span="8">
                <el-form-item label="周期" prop="period">
                  <el-input-number v-model="form.period" :min="1" :max="7" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="族" prop="groupNum">
                  <el-input-number v-model="form.groupNum" :min="1" :max="18" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区" prop="block">
                  <el-select v-model="form.block" placeholder="请选择" style="width: 100%">
                    <el-option label="s 区" value="s" />
                    <el-option label="p 区" value="p" />
                    <el-option label="d 区" value="d" />
                    <el-option label="f 区" value="f" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="电子结构" name="electron">
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="电子排布" prop="electronConfiguration">
                  <el-input v-model="form.electronConfiguration" placeholder="如：1s² 2s² 2p⁶" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="价电子数" prop="valenceElectrons">
                  <el-input-number v-model="form.valenceElectrons" :min="0" :max="18" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="物理性质" name="physical">
            <el-row :gutter="15">
              <el-col :span="8">
                <el-form-item label="标准状态" prop="stateAtStp">
                  <el-select v-model="form.stateAtStp" placeholder="请选择" style="width: 100%">
                    <el-option label="固态" value="solid" />
                    <el-option label="液态" value="liquid" />
                    <el-option label="气态" value="gas" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="颜色" prop="color">
                  <el-input v-model="form.color" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="色值" prop="colorCode">
                  <el-color-picker v-model="form.colorCode" show-alpha />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :span="8">
                <el-form-item label="熔点 (°C)" prop="meltingPoint">
                  <el-input-number v-model="form.meltingPoint" :precision="2" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="沸点 (°C)" prop="boilingPoint">
                  <el-input-number v-model="form.boilingPoint" :precision="2" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="密度 (g/cm³)" prop="density">
                  <el-input-number v-model="form.density" :precision="4" :step="0.0001" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :span="8">
                <el-form-item label="电负性" prop="electronegativity">
                  <el-input-number v-model="form.electronegativity" :precision="2" :step="0.01" :min="0" :max="4" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PeriodicTable">
import { listElement, addElement, updateElement, delElement } from '@/api/chemistry/element'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

// 状态
const elementList = ref([])
const loading = ref(true)
const queryParams = ref({
  atomicNumber: null,
  symbol: null,
  nameZh: null
})
const selectedElement = ref(null)
const detailVisible = ref(false)
const editVisible = ref(false)
const dialogTitle = ref('')
const activeTab = ref('basic')
const formRef = ref()
const queryFormRef = ref()

// 镧系和锕系
const lanthanides = ref([])
const actinides = ref([])

// 表单数据
const form = ref({
  atomicNumber: null,
  symbol: null,
  nameZh: null,
  nameEn: null,
  atomicMass: null,
  category: null,
  period: null,
  groupNum: null,
  block: null,
  electronConfiguration: null,
  valenceElectrons: null,
  stateAtStp: null,
  color: null,
  electronegativity: null,
  meltingPoint: null,
  boilingPoint: null,
  density: null,
  colorCode: null
})

// 验证规则
const rules = {
  atomicNumber: [
    { required: true, message: '原子序数不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 118, message: '原子序数范围 1-118', trigger: 'blur' }
  ],
  symbol: [
    { required: true, message: '元素符号不能为空', trigger: 'blur' },
    { max: 10, message: '最多 10 个字符', trigger: 'blur' }
  ],
  nameZh: [
    { required: true, message: '中文名称不能为空', trigger: 'blur' }
  ]
}

// 元素分类选项
const elementCategoryOptions = ref({
  '非金属': '非金属',
  '金属': '金属',
  '稀有气体': '稀有气体',
  '类金属': '类金属',
  '碱金属': '碱金属',
  '碱土金属': '碱土金属',
  '卤素': '卤素',
  '过渡金属': '过渡金属',
  '镧系元素': '镧系元素',
  '锕系元素': '锕系元素'
})

// 原子序数到位置的映射（根据标准周期表）
function getPositionByAtomicNumber(atomicNumber) {
  // 第 1 周期
  if (atomicNumber === 1) return { period: 1, group: 1 }    // H
  if (atomicNumber === 2) return { period: 1, group: 18 }   // He

  // 第 2 周期
  if (atomicNumber === 3) return { period: 2, group: 1 }    // Li
  if (atomicNumber === 4) return { period: 2, group: 2 }    // Be
  if (atomicNumber >= 5 && atomicNumber <= 10) return { period: 2, group: atomicNumber - 5 + 13 }  // B-Ne
  if (atomicNumber === 10) return { period: 2, group: 18 }  // Ne

  // 第 3 周期
  if (atomicNumber === 11) return { period: 3, group: 1 }   // Na
  if (atomicNumber === 12) return { period: 3, group: 2 }   // Mg
  if (atomicNumber >= 13 && atomicNumber <= 18) return { period: 3, group: atomicNumber - 13 + 13 } // Al-Ar

  // 第 4 周期
  if (atomicNumber === 19) return { period: 4, group: 1 }   // K
  if (atomicNumber === 20) return { period: 4, group: 2 }   // Ca
  if (atomicNumber >= 21 && atomicNumber <= 30) return { period: 4, group: atomicNumber - 21 + 3 }  // Sc-Zn
  if (atomicNumber >= 31 && atomicNumber <= 36) return { period: 4, group: atomicNumber - 31 + 13 } // Ga-Kr

  // 第 5 周期
  if (atomicNumber === 37) return { period: 5, group: 1 }   // Rb
  if (atomicNumber === 38) return { period: 5, group: 2 }   // Sr
  if (atomicNumber >= 39 && atomicNumber <= 48) return { period: 5, group: atomicNumber - 39 + 3 }  // Y-Cd
  if (atomicNumber >= 49 && atomicNumber <= 54) return { period: 5, group: atomicNumber - 49 + 13 } // In-Xe

  // 第 6 周期（不含镧系）
  if (atomicNumber === 55) return { period: 6, group: 1 }   // Cs
  if (atomicNumber === 56) return { period: 6, group: 2 }   // Ba
  // 57-71 是镧系，放在底部
  if (atomicNumber >= 57 && atomicNumber <= 71) return { period: 6, group: 3, isLanthanide: true }
  if (atomicNumber >= 72 && atomicNumber <= 80) return { period: 6, group: atomicNumber - 72 + 4 }  // Hf-Hg
  if (atomicNumber >= 81 && atomicNumber <= 86) return { period: 6, group: atomicNumber - 81 + 13 } // Tl-Rn

  // 第 7 周期（不含锕系）
  if (atomicNumber === 87) return { period: 7, group: 1 }   // Fr
  if (atomicNumber === 88) return { period: 7, group: 2 }   // Ra
  // 89-103 是锕系，放在底部
  if (atomicNumber >= 89 && atomicNumber <= 103) return { period: 7, group: 3, isActinide: true }
  if (atomicNumber >= 104 && atomicNumber <= 112) return { period: 7, group: atomicNumber - 104 + 4 } // Rf-Cn
  if (atomicNumber >= 113 && atomicNumber <= 118) return { period: 7, group: atomicNumber - 113 + 13 } // Nh-Og

  return { period: 1, group: 1 }
}

/** 格式化原子量 */
function formatAtomicMass(mass) {
  if (!mass) return ''
  return Number(mass).toFixed(3)
}

/** 获取状态标签 */
function getStateLabel(state) {
  const labelMap = { solid: '固态', liquid: '液态', gas: '气态' }
  return labelMap[state] || state
}

/** 获取单元格样式类 */
function getCellClass(element) {
  if (!element) return ''
  const category = element.category || ''
  if (category.includes('碱金属')) return 'alkali-metal'
  if (category.includes('碱土金属')) return 'alkaline-earth'
  if (category.includes('过渡金属')) return 'transition'
  if (category.includes('类金属')) return 'metalloid'
  if (category.includes('非金属')) return 'nonmetal'
  if (category.includes('卤素')) return 'halogen'
  if (category.includes('稀有气体')) return 'noble-gas'
  if (category.includes('镧系')) return 'lanthanide'
  if (category.includes('锕系')) return 'actinide'
  if (category === '金属') return 'metal'
  return 'default'
}

/** 判断某行某列是否应该显示单元格 */
function shouldShowCell(row, col) {
  // 检查这个位置是否有元素
  const element = getElementAt(row, col)
  // 如果是镧系或锕系占位符位置，显示
  if ((row === 6 && col === 3) || (row === 7 && col === 3)) {
    return true
  }
  // 如果有元素，显示
  if (element) {
    return true
  }
  return false
}

/** 根据周期和族获取元素 - 使用原子序数映射 */
function getElementAt(period, group) {
  // 遍历所有元素，找到对应位置的元素
  for (const el of elementList.value) {
    const pos = getPositionByAtomicNumber(el.atomicNumber)
    // 处理镧系和锕系占位
    if (period === 6 && group === 3 && pos.isLanthanide) {
      return lanthanides.value[0] // 返回镧系的第一个元素作为代表
    }
    if (period === 7 && group === 3 && pos.isActinide) {
      return actinides.value[0] // 返回锕系的第一个元素作为代表
    }
    // 跳过镧系和锕系（它们在底部单独显示）
    if (pos.isLanthanide || pos.isActinide) continue
    // 匹配位置和族
    if (pos.period === period && pos.group === group) {
      return el
    }
  }
  return null
}

/** 获取占位符文本 */
function getPlaceholderText(row, col) {
  // 第 6 周期第 3 列显示镧系占位
  if (row === 6 && col === 3) return '57-71\nLa~Lu'
  // 第 7 周期第 3 列显示锕系占位
  if (row === 7 && col === 3) return '89-103\nAc~Lr'
  return ''
}

/** 选择元素 */
function showElementDetail(element) {
  if (!element) return
  selectedElement.value = element
  detailVisible.value = true
}

/** 查询 */
function handleQuery() {
  loading.value = true
  listElement({ pageNum: 1, pageSize: 118 }).then(response => {
    elementList.value = response.rows || []
    const atomicNumbers = elementList.value.map(el => el.atomicNumber).sort((a,b) => a-b)
    console.log('===== 化学元素数据调试信息 =====')
    console.log('加载的元素数量:', elementList.value.length)
    console.log('元素原子序数列表:', atomicNumbers)

    // 找出缺失的原子序数
    const missingNumbers = []
    for (let i = 1; i <= 118; i++) {
      if (!atomicNumbers.includes(i)) {
        missingNumbers.push(i)
      }
    }
    console.log('缺失的原子序数:', missingNumbers)
    console.log('缺失的元素数量:', missingNumbers.length)

    // 提取镧系（57-71）和锕系（89-103）
    lanthanides.value = elementList.value.filter(el => el.atomicNumber >= 57 && el.atomicNumber <= 71)
    actinides.value = elementList.value.filter(el => el.atomicNumber >= 89 && el.atomicNumber <= 103)
    console.log('镧系元素数量:', lanthanides.value.length)
    console.log('锕系元素数量:', actinides.value.length)
    console.log('=================================')

    loading.value = false
  }).catch((error) => {
    console.error('加载元素失败:', error)
    loading.value = false
  })
}

/** 重置查询 */
function resetQuery() {
  if (queryFormRef.value) {
    queryFormRef.value.resetForm()
  }
  handleQuery()
}

/** 编辑元素 */
function handleEdit() {
  if (!selectedElement.value) return
  form.value = { ...selectedElement.value }
  dialogTitle.value = '编辑元素'
  editVisible.value = true
  detailVisible.value = false
}

/** 新增元素 */
function handleAdd() {
  resetForm()
  dialogTitle.value = '新增元素'
  editVisible.value = true
}

/** 删除元素 */
function handleDelete() {
  if (!selectedElement.value) return
  proxy.$modal.confirm(`确认删除元素"${selectedElement.value.nameZh}"？`).then(() => {
    return delElement(selectedElement.value.atomicNumber)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    detailVisible.value = false
    handleQuery()
  }).catch(() => {})
}

/** 提交表单 */
function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const api = form.value.atomicNumber ? updateElement : addElement
      api(form.value).then(() => {
        proxy.$modal.msgSuccess(form.value.atomicNumber ? '修改成功' : '新增成功')
        editVisible.value = false
        handleQuery()
      })
    }
  })
}

/** 重置表单 */
function resetForm() {
  form.value = {
    atomicNumber: null,
    symbol: null,
    nameZh: null,
    nameEn: null,
    atomicMass: null,
    category: null,
    period: null,
    groupNum: null,
    block: null,
    electronConfiguration: null,
    valenceElectrons: null,
    stateAtStp: null,
    color: null,
    electronegativity: null,
    meltingPoint: null,
    boilingPoint: null,
    density: null,
    colorCode: null
  }
  proxy.resetForm('formRef')
}

// 初始化
onMounted(() => {
  handleQuery()
})
</script>

<style lang="scss" scoped>
.periodic-table-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

// 标题
.table-header {
  text-align: center;
  margin-bottom: 20px;

  .table-title {
    font-size: 32px;
    font-weight: bold;
    color: #303133;
    letter-spacing: 8px;
    margin: 0;
  }
}

// 图例区域
.legend-section {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .legend-box {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #ddd;

      .legend-color {
        width: 14px;
        height: 14px;
        border-radius: 2px;
        border: 1px solid #999;
      }
    }
  }
}

// 搜索工具栏
.search-toolbar {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

// 表格包装器
.table-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

// 主表区域
.main-table {
  position: relative;
  margin-bottom: 20px;
}

// 周期标签
.period-labels {
  position: absolute;
  left: 0;
  top: 25px;
  bottom: 0;
  width: 28px;
  display: flex;
  flex-direction: column;

  .period-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    background: #f0f0f0;
    border: 1px solid #ccc;
  }
}

// 元素网格
.elements-grid {
  margin-left: 28px;
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 3px;
}

// 元素单元格
.element-cell {
  aspect-ratio: 1;
  min-height: 70px;
  border: 1px solid #333;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  .cell-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 4px 2px;
  }

  .cell-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 9px;
    color: #666;
    white-space: pre-line;
    text-align: center;
  }

  .atomic-number {
    position: absolute;
    top: 2px;
    left: 3px;
    font-size: 8px;
    color: #555;
  }

  .element-symbol {
    font-size: 16px;
    font-weight: 700;
    font-family: 'Times New Roman', serif;
    margin: 2px 0;
  }

  .element-name {
    font-size: 10px;
    font-weight: 500;
  }

  .atomic-mass {
    font-size: 8px;
    color: #666;
  }

  // 分类颜色
  &.alkali-metal { background: #FFB6C1; }
  &.alkaline-earth { background: #FFE4C4; }
  &.transition { background: #FFEFD5; }
  &.metalloid { background: #B0E0E6; }
  &.nonmetal { background: #98FB98; }
  &.halogen { background: #DDA0DD; }
  &.noble-gas { background: #FFDAB9; }
  &.lanthanide { background: #F0E68C; }
  &.actinide { background: #FFA07A; }
  &.metal { background: #E0E0E0; }
  &.default { background: #fff; }
  &.empty-cell { background: #fafafa; cursor: default; }
}

// 族标签
.group-labels {
  margin-left: 28px;
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  gap: 3px;
  margin-top: 8px;

  .group-label {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #606266;
    padding: 4px 0;
    background: #f0f0f0;
    border: 1px solid #ccc;
  }
}

// 镧系和锕系
.inner-transition {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #333;

  .series-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;

    .series-label {
      width: 50px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      padding-top: 8px;
      color: #303133;
    }

    .series-elements {
      display: flex;
      gap: 3px;
      flex-wrap: wrap;
      flex: 1;
    }

    .element-cell.small {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      border: 1px solid #333;

      .cell-content {
        padding: 3px;

        .atomic-number {
          font-size: 7px;
        }

        .element-symbol {
          font-size: 13px;
        }

        .element-name {
          font-size: 8px;
        }

        .atomic-mass {
          font-size: 7px;
        }
      }
    }
  }
}

// 图示说明 - 放在周期表中间空白区域
.legend-example-cell {
  grid-row: 2 / span 2;
  grid-column: 5 / span 7;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #5a67d8;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  z-index: 1;

  .legend-example-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2px;
    margin-bottom: 6px;
    text-align: center;
  }

  .legend-example-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .example-cell {
    position: relative;
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
    border: 2px solid #333;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;

    .legend-atomic-number {
      position: absolute;
      top: 2px;
      left: 4px;
      font-size: 8px;
      color: #555;
      font-weight: 600;
    }

    .legend-symbol {
      font-size: 20px;
      font-weight: 700;
      font-family: 'Times New Roman', serif;
      color: #303133;
      margin: 2px 0;
    }

    .legend-name {
      font-size: 11px;
      font-weight: 500;
      color: #606266;
      margin: 1px 0;
    }

    .legend-mass {
      font-size: 8px;
      color: #909399;
      margin: 1px 0;
    }
  }

  .legend-annotations {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .annotation {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #fff;
      white-space: nowrap;

      .annotation-line {
        display: inline-block;
        width: 20px;
        height: 2px;
        background: #fff;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          right: 0;
          top: -3px;
          width: 0;
          height: 0;
          border-left: 5px solid #fff;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
        }

        &.line-atomic {
          width: 35px;
        }

        &.line-symbol {
          width: 20px;
        }

        &.line-name {
          width: 25px;
        }

        &.line-mass {
          width: 35px;
        }
      }
    }
  }
}
</style>
