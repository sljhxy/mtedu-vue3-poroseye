/**
 * 化学虚拟实验模块 - 工具函数
 */

/**
 * 格式化化学式 - 数字转下标
 * H2O -> H₂O, Fe2(SO4)3 -> Fe₂(SO₄)₃
 * @param {string} formula - 原始化学式
 * @returns {string} 格式化后的化学式
 */
export function formatFormula(formula) {
  if (!formula) return ''
  const subscriptNums = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

  // 匹配数字并转换为下标（排除已经是下标的数字）
  return formula.replace(/(\d+)/g, (match) => {
    return match.split('').map(n => subscriptNums[parseInt(n)] || n).join('')
  })
}

/**
 * 格式化离子电荷 - 转上标
 * Fe2+ -> Fe²⁺, SO4(2-) -> SO₄²⁻
 * @param {string} charge - 电荷表达式
 * @returns {string} 格式化后的电荷
 */
export function formatCharge(charge) {
  if (!charge) return ''
  const superscriptNums = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
  const superscriptSigns = { '+': '⁺', '-': '⁻', '=': '⁼' }

  // 匹配数字加符号的模式
  return charge.replace(/(\d+)[+\-=]/g, (match) => {
    const num = match.slice(0, -1)
    const sign = match.slice(-1)
    let result = num.split('').map(n => superscriptNums[parseInt(n)] || n).join('')
    result += superscriptSigns[sign] || sign
    return result
  })
}

/**
 * 同时格式化化学式和电荷
 * @param {string} formula - 化学式
 * @param {string} charge - 电荷（可选）
 * @returns {string} 格式化后的完整表达式
 */
export function formatFormulaWithCharge(formula, charge = '') {
  const formattedFormula = formatFormula(formula)
  const formattedCharge = charge ? formatCharge(charge) : ''
  return formattedFormula + formattedCharge
}

/**
 * 化学字典映射
 */
export const CHEMISTRY_DICT = {
  // 物质类型
  substanceType: {
    element: '单质',
    compound: '化合物'
  },

  // 化合物类型
  compoundType: {
    inorganic: '无机物',
    organic: '有机物'
  },

  // 难度等级
  difficultyLevel: {
    elementary: '小学',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    advanced: '高级'
  },

  // 毒性等级
  toxicityLevel: {
    none: { text: '无毒', type: 'success' },
    low: { text: '低毒', type: 'warning' },
    medium: { text: '中毒', type: 'danger' },
    high: { text: '高毒', type: 'danger' },
    extreme: { text: '剧毒', type: 'danger' }
  },

  // 标准状态
  stateAtStp: {
    solid: '固态',
    liquid: '液态',
    gas: '气态',
    s: '固态',
    l: '液态',
    g: '气态',
    aq: '水溶液'
  },

  // 元素分类
  elementCategory: {
    '非金属': '非金属',
    '金属': '金属',
    '稀有气体': '稀有气体',
    '类金属': '类金属'
  },

  // 元素分区
  elementBlock: {
    s: 's区',
    p: 'p区',
    d: 'd区',
    f: 'f区'
  },

  // 实验器材类别
  equipmentCategory: {
    container: '容器类',
    heating: '加热类',
    holding: '夹持类',
    measuring: '测量类',
    filtration: '分离类',
    other: '其他'
  },

  // 反应阶段类型
  stageType: {
    mixing: '混合',
    heating: '加热',
    reacting: '反应中',
    cooling: '冷却',
    filtering: '过滤',
    completed: '完成'
  },

  // 副反应类型
  secondaryReactionType: {
    intermediate: '中间反应',
    side: '副反应',
    competitive: '竞争反应'
  },

  // 反应关系类型
  reactionRelationship: {
    sequential: '顺序',
    parallel: '平行',
    preceding: '先于主反应'
  },

  // 中间产物稳定性
  intermediateStability: {
    very_unstable: '极不稳定',
    unstable: '不稳定',
    moderate: '中等',
    stable: '稳定'
  },

  // 中间产物存在时间
  intermediateLifetime: {
    '极短': '极短',
    '短暂': '短暂',
    '较稳定': '较稳定'
  },

  // 描述类型
  narrativeType: {
    student: '学生版',
    teacher: '教师版',
    detailed: '详细版'
  }
}

/**
 * 获取字典显示文本
 * @param {string} dictType - 字典类型
 * @param {string} value - 字典值
 * @returns {string} 显示文本
 */
export function getDictText(dictType, value) {
  const dict = CHEMISTRY_DICT[dictType]
  if (!dict || !value) return ''

  const item = dict[value]
  if (typeof item === 'object') {
    return item.text || ''
  }
  return item || ''
}

/**
 * 获取字典标签类型（用于Element Plus Tag）
 * @param {string} dictType - 字典类型
 * @param {string} value - 字典值
 * @returns {string} 标签类型
 */
export function getDictTagType(dictType, value) {
  const dict = CHEMISTRY_DICT[dictType]
  if (!dict || !value) return ''

  const item = dict[value]
  if (typeof item === 'object') {
    return item.type || ''
  }
  return ''
}

/**
 * 格式化JSON数据为可读字符串
 * @param {any} data - JSON数据
 * @returns {string} 格式化后的字符串
 */
export function formatJsonData(data) {
  if (!data) return ''
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 解析JSON字符串
 * @param {string} jsonString - JSON字符串
 * @returns {object} 解析后的对象
 */
export function parseJsonString(jsonString) {
  if (!jsonString) return null
  if (typeof jsonString === 'object') return jsonString
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

/**
 * 计算相对分子质量
 * @param {string} formula - 化学式
 * @param {object} atomicMasses - 原子质量映射 {元素符号: 质量}
 * @returns {number} 相对分子质量
 */
export function calculateMolarMass(formula, atomicMasses) {
  if (!formula || !atomicMasses) return 0

  // 简单的化学式解析（支持 H2O, Ca(OH)2 等）
  // 这是一个基础实现，复杂情况可能需要专门的库
  let mass = 0
  const regex = /([A-Z][a-z]?)(\d*)/g
  let match

  while ((match = regex.exec(formula)) !== null) {
    const element = match[1]
    const count = parseInt(match[2]) || 1
    mass += (atomicMasses[element] || 0) * count
  }

  return mass
}

/**
 * 验证化学式格式
 * @param {string} formula - 化学式
 * @returns {boolean} 是否有效
 */
export function isValidFormula(formula) {
  if (!formula) return false
  // 基本验证：以大写字母开头，包含字母、数字、括号
  const regex = /^[A-Z][a-z0-9()]+\d*$/
  return regex.test(formula) || /^([A-Z][a-z]?\d*)+(\([A-Z][a-z0-9]+\)\d*)+$/.test(formula)
}

/**
 * 物质单位列表
 */
export const SUBSTANCE_UNITS = {
  solid: ['g', 'kg', 'mg', 'mol'],
  liquid: ['mL', 'L', 'mol'],
  solution: ['mL', 'L', 'mol'],
  gas: ['L', 'mL', 'mol', 'm³']
}

/**
 * 计算物质的量
 * @param {number} amount - 数量
 * @param {string} unit - 单位
 * @param {number} molarMass - 摩尔质量 (g/mol)
 * @param {string} state - 物质状态
 * @param {number} concentration - 溶液浓度 (可选)
 * @param {string} concentrationUnit - 浓度单位 (可选)
 * @param {number} pressure - 气体压力，单位 atm (可选)
 * @returns {number} 物质的量 (mol)
 */
export function calculateMoles(amount, unit, molarMass, state, concentration, concentrationUnit, pressure) {
  if (!amount || !molarMass) return 0

  switch (unit) {
    case 'g':
      return amount / molarMass
    case 'kg':
      return (amount * 1000) / molarMass
    case 'mg':
      return amount / (molarMass * 1000)
    case 'mol':
      return amount
    case 'mL':
      if (state === 'solution' && concentration) {
        return calculateMolesFromSolution(amount, concentration, concentrationUnit)
      }
      // 对于液体，假设密度为1g/mL (简化处理)
      return amount / molarMass
    case 'L':
      if (state === 'gas') {
        // 使用理想气体状态方程 PV = nRT
        // 标准状况下 (0°C, 1atm)，1mol气体约为22.4L
        if (pressure && pressure !== 1) {
          const R = 0.0821 // L·atm/(mol·K)
          const T = 273.15 // 标准温度 (K)
          return (pressure * amount) / (R * T)
        }
        return amount / 22.4
      }
      if (state === 'solution' && concentration) {
        return calculateMolesFromSolution(amount * 1000, concentration, concentrationUnit)
      }
      // 对于液体，假设密度为1g/mL
      return (amount * 1000) / molarMass
    case 'm³':
      if (state === 'gas') {
        return (amount * 1000) / 22.4
      }
      return 0
    default:
      return 0
  }
}

/**
 * 从溶液计算物质的量
 * @param {number} volume - 溶液体积 (mL)
 * @param {number} concentration - 浓度
 * @param {string} concentrationUnit - 浓度单位
 * @returns {number} 物质的量 (mol)
 */
function calculateMolesFromSolution(volume, concentration, concentrationUnit) {
  switch (concentrationUnit) {
    case 'mol/L':
      return (volume / 1000) * concentration
    case 'g/L':
      // 需要溶质的摩尔质量，这里返回质量，需要外部转换
      return (volume / 1000) * concentration
    case 'mol/mL':
      return volume * concentration
    case '%':
      // 假设是质量百分比，需要溶液密度（这里简化处理，假设密度为1g/mL）
      return (volume * concentration / 100) / 1000
    default:
      return 0
  }
}

/**
 * 单位转换
 * @param {number} amount - 数量
 * @param {string} fromUnit - 原单位
 * @param {string} toUnit - 目标单位
 * @param {number} molarMass - 摩尔质量 (g/mol)
 * @param {object} conditions - 反应条件 {temperature, pressure, state}
 * @returns {number} 转换后的数量
 */
export function convertUnits(amount, fromUnit, toUnit, molarMass, conditions = {}) {
  if (fromUnit === toUnit) return amount

  // 先转换为mol
  const moles = calculateMoles(
    amount,
    fromUnit,
    molarMass,
    conditions.state,
    conditions.concentration,
    conditions.concentrationUnit,
    conditions.pressure
  )

  // 从mol转换为目标单位
  switch (toUnit) {
    case 'g':
      return moles * molarMass
    case 'kg':
      return (moles * molarMass) / 1000
    case 'mg':
      return moles * molarMass * 1000
    case 'mol':
      return moles
    case 'L':
      if (conditions.state === 'gas') {
        return calculateGasVolume(moles, conditions.temperature, conditions.pressure)
      }
      if (conditions.state === 'solution') {
        return calculateSolutionVolume(moles, conditions.concentration)
      }
      // 对于液体，假设密度为1g/mL
      return moles * molarMass / 1000
    case 'mL':
      if (conditions.state === 'gas') {
        return calculateGasVolume(moles, conditions.temperature, conditions.pressure) * 1000
      }
      if (conditions.state === 'solution') {
        return calculateSolutionVolume(moles, conditions.concentration) * 1000
      }
      // 对于液体，假设密度为1g/mL
      return moles * molarMass
    default:
      return 0
  }
}

/**
 * 计算气体体积（理想气体状态方程）
 * @param {number} moles - 物质的量 (mol)
 * @param {number} temperature - 温度 (°C)
 * @param {number} pressure - 压力 (atm)
 * @returns {number} 气体体积 (L)
 */
export function calculateGasVolume(moles, temperature = 0, pressure = 1) {
  const R = 0.0821 // L·atm/(mol·K)
  const T = temperature + 273.15 // 转换为开尔文
  return (moles * R * T) / pressure
}

/**
 * 计算溶液体积
 * @param {number} moles - 物质的量 (mol)
 * @param {number} concentration - 浓度 (mol/L)
 * @returns {number} 溶液体积 (L)
 */
export function calculateSolutionVolume(moles, concentration = 1) {
  if (!concentration) return 0
  return moles / concentration
}

export default {
  formatFormula,
  formatCharge,
  formatFormulaWithCharge,
  CHEMISTRY_DICT,
  getDictText,
  getDictTagType,
  formatJsonData,
  parseJsonString,
  calculateMolarMass,
  isValidFormula,
  SUBSTANCE_UNITS,
  calculateMoles,
  convertUnits,
  calculateGasVolume,
  calculateSolutionVolume
}
