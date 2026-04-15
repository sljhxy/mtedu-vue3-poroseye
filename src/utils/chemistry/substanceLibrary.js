/**
 * 化学物质库
 * 包含常见金属、非金属、酸、碱、盐、氧化物等
 */

// 物质分类枚举
export const SubstanceCategory = {
  METAL: 'metal',           // 金属
  NON_METAL: 'non_metal',   // 非金属
  ACID: 'acid',             // 酸
  BASE: 'base',             // 碱
  SALT: 'salt',             // 盐
  OXIDE: 'oxide',           // 氧化物
  OTHER: 'other'            // 其他
}

// 物质状态枚举
export const SubstanceState = {
  SOLID: 's',       // 固体
  LIQUID: 'l',      // 液体
  GAS: 'g',         // 气体
  AQUEOUS: 'aq'     // 水溶液
}

// 危险等级
export const HazardLevel = {
  NONE: 'none',         // 无危险
  LOW: 'low',           // 低危险
  MEDIUM: 'medium',     // 中等危险
  HIGH: 'high',         // 高危险
  CORROSIVE: 'corrosive' // 腐蚀性
}

/**
 * 物质库数据
 */
export const SUBSTANCES = [
  // ========== 金属 (15种) ==========
  {
    id: 1,
    name: '锌',
    formula: 'Zn',
    molarMass: 65.38,
    state: SubstanceState.SOLID,
    color: '银灰色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.LOW,
    description: '蓝白色金属，常用于镀锌和电池'
  },
  {
    id: 2,
    name: '铁',
    formula: 'Fe',
    molarMass: 55.85,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.NONE,
    description: '常见金属，易生锈'
  },
  {
    id: 3,
    name: '钠',
    formula: 'Na',
    molarMass: 22.99,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.HIGH,
    description: '活泼金属，遇水剧烈反应'
  },
  {
    id: 4,
    name: '镁',
    formula: 'Mg',
    molarMass: 24.31,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.LOW,
    description: '轻金属，燃烧发出强光'
  },
  {
    id: 5,
    name: '铝',
    formula: 'Al',
    molarMass: 26.98,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.NONE,
    description: '轻金属，表面有氧化膜保护'
  },
  {
    id: 6,
    name: '铜',
    formula: 'Cu',
    molarMass: 63.55,
    state: SubstanceState.SOLID,
    color: '紫红色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.NONE,
    description: '导电性优良的金属'
  },
  {
    id: 7,
    name: '银',
    formula: 'Ag',
    molarMass: 107.87,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.NONE,
    description: '贵金属，导电性最好'
  },
  {
    id: 8,
    name: '金',
    formula: 'Au',
    molarMass: 196.97,
    state: SubstanceState.SOLID,
    color: '金黄色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.NONE,
    description: '贵金属，性质稳定'
  },
  {
    id: 9,
    name: '钙',
    formula: 'Ca',
    molarMass: 40.08,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.MEDIUM,
    description: '碱土金属，活泼'
  },
  {
    id: 10,
    name: '钡',
    formula: 'Ba',
    molarMass: 137.33,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.HIGH,
    description: '碱土金属，钡盐有毒'
  },
  {
    id: 11,
    name: '钾',
    formula: 'K',
    molarMass: 39.10,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.HIGH,
    description: '极活泼金属，遇水爆炸'
  },
  {
    id: 12,
    name: '汞',
    formula: 'Hg',
    molarMass: 200.59,
    state: SubstanceState.LIQUID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.HIGH,
    description: '常温下唯一的液态金属，有毒'
  },
  {
    id: 13,
    name: '铅',
    formula: 'Pb',
    molarMass: 207.20,
    state: SubstanceState.SOLID,
    color: '蓝灰色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.HIGH,
    description: '重金属，有毒'
  },
  {
    id: 14,
    name: '锰',
    formula: 'Mn',
    molarMass: 54.94,
    state: SubstanceState.SOLID,
    color: '银灰色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.MEDIUM,
    description: '过渡金属'
  },
  {
    id: 15,
    name: '镍',
    formula: 'Ni',
    molarMass: 58.69,
    state: SubstanceState.SOLID,
    color: '银白色',
    category: SubstanceCategory.METAL,
    hazard: HazardLevel.MEDIUM,
    description: '过渡金属，有磁性'
  },

  // ========== 非金属 (10种) ==========
  {
    id: 20,
    name: '氢气',
    formula: 'H₂',
    molarMass: 2.016,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.HIGH,
    description: '最轻的气体，可燃'
  },
  {
    id: 21,
    name: '氧气',
    formula: 'O₂',
    molarMass: 31.998,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.MEDIUM,
    description: '支持燃烧'
  },
  {
    id: 22,
    name: '氯气',
    formula: 'Cl₂',
    molarMass: 70.906,
    state: SubstanceState.GAS,
    color: '黄绿色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.HIGH,
    description: '有毒气体，有刺激性气味'
  },
  {
    id: 23,
    name: '碳',
    formula: 'C',
    molarMass: 12.011,
    state: SubstanceState.SOLID,
    color: '黑色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.NONE,
    description: '固体非金属，有多种同素异形体'
  },
  {
    id: 24,
    name: '硫',
    formula: 'S',
    molarMass: 32.066,
    state: SubstanceState.SOLID,
    color: '淡黄色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.LOW,
    description: '黄色固体，燃烧产生刺激性气体'
  },
  {
    id: 25,
    name: '磷',
    formula: 'P',
    molarMass: 30.974,
    state: SubstanceState.SOLID,
    color: '白色/红色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.HIGH,
    description: '有白磷和红磷两种同素异形体'
  },
  {
    id: 26,
    name: '氮气',
    formula: 'N₂',
    molarMass: 28.014,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.NONE,
    description: '惰性气体，占空气78%'
  },
  {
    id: 27,
    name: '二氧化硫',
    formula: 'SO₂',
    molarMass: 64.066,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.HIGH,
    description: '有毒气体，有刺激性气味'
  },
  {
    id: 28,
    name: '二氧化碳',
    formula: 'CO₂',
    molarMass: 44.009,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.LOW,
    description: '温室气体，不支持燃烧'
  },
  {
    id: 29,
    name: '氨气',
    formula: 'NH₃',
    molarMass: 17.031,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.NON_METAL,
    hazard: HazardLevel.MEDIUM,
    description: '有刺激性气味的气体'
  },

  // ========== 酸 (10种) ==========
  {
    id: 30,
    name: '稀硫酸',
    formula: 'H₂SO₄',
    molarMass: 98.08,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.CORROSIVE,
    description: '强酸，有腐蚀性'
  },
  {
    id: 31,
    name: '浓硫酸',
    formula: 'H₂SO₄(浓)',
    molarMass: 98.08,
    state: SubstanceState.LIQUID,
    color: '无色油状',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.CORROSIVE,
    description: '强酸，有吸水性和脱水性'
  },
  {
    id: 32,
    name: '盐酸',
    formula: 'HCl',
    molarMass: 36.46,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.CORROSIVE,
    description: '强酸，易挥发'
  },
  {
    id: 33,
    name: '硝酸',
    formula: 'HNO₃',
    molarMass: 63.01,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.CORROSIVE,
    description: '强酸，有氧化性'
  },
  {
    id: 34,
    name: '醋酸',
    formula: 'CH₃COOH',
    molarMass: 60.05,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.LOW,
    description: '弱酸，食醋主要成分'
  },
  {
    id: 35,
    name: '碳酸',
    formula: 'H₂CO₃',
    molarMass: 62.03,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.NONE,
    description: '弱酸，不稳定'
  },
  {
    id: 36,
    name: '磷酸',
    formula: 'H₃PO₄',
    molarMass: 98.00,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.LOW,
    description: '中强酸'
  },
  {
    id: 37,
    name: '氢氟酸',
    formula: 'HF',
    molarMass: 20.01,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.HIGH,
    description: '弱酸，但极度危险，腐蚀玻璃'
  },
  {
    id: 38,
    name: '氢溴酸',
    formula: 'HBr',
    molarMass: 80.91,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.CORROSIVE,
    description: '强酸'
  },
  {
    id: 39,
    name: '氢碘酸',
    formula: 'HI',
    molarMass: 127.91,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.ACID,
    hazard: HazardLevel.CORROSIVE,
    description: '强酸'
  },

  // ========== 碱 (8种) ==========
  {
    id: 40,
    name: '氢氧化钠',
    formula: 'NaOH',
    molarMass: 40.00,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.CORROSIVE,
    description: '强碱，俗称烧碱、火碱'
  },
  {
    id: 41,
    name: '氢氧化钾',
    formula: 'KOH',
    molarMass: 56.11,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.CORROSIVE,
    description: '强碱'
  },
  {
    id: 42,
    name: '氢氧化钙',
    formula: 'Ca(OH)₂',
    molarMass: 74.10,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.LOW,
    description: '中强碱，俗称熟石灰、消石灰'
  },
  {
    id: 43,
    name: '氢氧化钡',
    formula: 'Ba(OH)₂',
    molarMass: 171.34,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.HIGH,
    description: '强碱，钡有毒'
  },
  {
    id: 44,
    name: '氢氧化镁',
    formula: 'Mg(OH)₂',
    molarMass: 58.32,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.NONE,
    description: '弱碱，抗酸药成分'
  },
  {
    id: 45,
    name: '氢氧化铝',
    formula: 'Al(OH)₃',
    molarMass: 78.00,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.NONE,
    description: '两性氢氧化物'
  },
  {
    id: 46,
    name: '氢氧化铁',
    formula: 'Fe(OH)₃',
    molarMass: 106.87,
    state: SubstanceState.SOLID,
    color: '红褐色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.NONE,
    description: '弱碱，红褐色沉淀'
  },
  {
    id: 47,
    name: '氢氧化铜',
    formula: 'Cu(OH)₂',
    molarMass: 97.56,
    state: SubstanceState.SOLID,
    color: '蓝色',
    category: SubstanceCategory.BASE,
    hazard: HazardLevel.LOW,
    description: '弱碱，蓝色沉淀'
  },

  // ========== 盐 (20种) ==========
  {
    id: 50,
    name: '氯化钠',
    formula: 'NaCl',
    molarMass: 58.44,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '食盐主要成分'
  },
  {
    id: 51,
    name: '硫酸锌',
    formula: 'ZnSO₄',
    molarMass: 161.47,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '无色晶体'
  },
  {
    id: 52,
    name: '硫酸亚铁',
    formula: 'FeSO₄',
    molarMass: 151.91,
    state: SubstanceState.SOLID,
    color: '浅绿色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '浅绿色晶体，易被氧化'
  },
  {
    id: 53,
    name: '硫酸铜',
    formula: 'CuSO₄',
    molarMass: 159.61,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.MEDIUM,
    description: '白色粉末，水合物为蓝色'
  },
  {
    id: 54,
    name: '硫酸钙',
    formula: 'CaSO₄',
    molarMass: 136.14,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '白色固体，微溶于水'
  },
  {
    id: 55,
    name: '硫酸钡',
    formula: 'BaSO₄',
    molarMass: 233.39,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '白色沉淀，不溶于酸'
  },
  {
    id: 56,
    name: '氯化钡',
    formula: 'BaCl₂',
    molarMass: 208.23,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.HIGH,
    description: '无色晶体，钡有毒'
  },
  {
    id: 57,
    name: '氯化银',
    formula: 'AgCl',
    molarMass: 143.32,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '白色沉淀，见光分解'
  },
  {
    id: 58,
    name: '氯化钙',
    formula: 'CaCl₂',
    molarMass: 110.98,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '易吸潮，用作干燥剂'
  },
  {
    id: 59,
    name: '碳酸钙',
    formula: 'CaCO₃',
    molarMass: 100.09,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '不溶于水的白色固体'
  },
  {
    id: 60,
    name: '碳酸钠',
    formula: 'Na₂CO₃',
    molarMass: 105.99,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '俗称纯碱、苏打'
  },
  {
    id: 61,
    name: '碳酸氢钠',
    formula: 'NaHCO₃',
    molarMass: 84.01,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '俗称小苏打'
  },
  {
    id: 62,
    name: '硝酸银',
    formula: 'AgNO₃',
    molarMass: 169.87,
    state: SubstanceState.SOLID,
    color: '无色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.MEDIUM,
    description: '无色晶体，见光分解'
  },
  {
    id: 63,
    name: '高锰酸钾',
    formula: 'KMnO₄',
    molarMass: 158.04,
    state: SubstanceState.SOLID,
    color: '紫黑色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.MEDIUM,
    description: '紫黑色晶体，强氧化剂'
  },
  {
    id: 64,
    name: '锰酸钾',
    formula: 'K₂MnO₄',
    molarMass: 197.13,
    state: SubstanceState.SOLID,
    color: '绿色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.MEDIUM,
    description: '绿色晶体'
  },
  {
    id: 65,
    name: '氯化铁',
    formula: 'FeCl₃',
    molarMass: 162.20,
    state: SubstanceState.SOLID,
    color: '棕黄色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '棕黄色固体'
  },
  {
    id: 66,
    name: '氯化亚铁',
    formula: 'FeCl₂',
    molarMass: 126.75,
    state: SubstanceState.SOLID,
    color: '浅绿色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '浅绿色固体'
  },
  {
    id: 67,
    name: '醋酸钠',
    formula: 'CH₃COONa',
    molarMass: 82.03,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '无色晶体'
  },
  {
    id: 68,
    name: '亚硫酸钠',
    formula: 'Na₂SO₃',
    molarMass: 126.04,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '白色固体，有还原性'
  },
  {
    id: 69,
    name: '硫化钠',
    formula: 'Na₂S',
    molarMass: 78.05,
    state: SubstanceState.SOLID,
    color: '无色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.MEDIUM,
    description: '有臭味，水解产生硫化氢'
  },
  {
    id: 85,
    name: '硫酸钠',
    formula: 'Na₂SO₄',
    molarMass: 142.04,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '白色晶体，易溶于水'
  },
  {
    id: 86,
    name: '硫酸镁',
    formula: 'MgSO₄',
    molarMass: 120.37,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '白色晶体，易溶于水'
  },
  {
    id: 87,
    name: '氯化钾',
    formula: 'KCl',
    molarMass: 74.55,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.NONE,
    description: '白色晶体，易溶于水'
  },
  {
    id: 88,
    name: '氯化锰',
    formula: 'MnCl₂',
    molarMass: 125.84,
    state: SubstanceState.SOLID,
    color: '浅粉色',
    category: SubstanceCategory.SALT,
    hazard: HazardLevel.LOW,
    description: '浅粉色固体，易溶于水'
  },

  // ========== 氧化物 (15种) ==========
  {
    id: 70,
    name: '水',
    formula: 'H₂O',
    molarMass: 18.015,
    state: SubstanceState.LIQUID,
    color: '无色',
    category: SubstanceCategory.OTHER,
    hazard: HazardLevel.NONE,
    description: '生命之源，万能溶剂'
  },
  {
    id: 71,
    name: '氧化铜',
    formula: 'CuO',
    molarMass: 79.55,
    state: SubstanceState.SOLID,
    color: '黑色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.LOW,
    description: '黑色粉末'
  },
  {
    id: 72,
    name: '氧化铁',
    formula: 'Fe₂O₃',
    molarMass: 159.69,
    state: SubstanceState.SOLID,
    color: '红棕色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.NONE,
    description: '红棕色粉末，铁锈主要成分'
  },
  {
    id: 73,
    name: '氧化亚铁',
    formula: 'FeO',
    molarMass: 71.85,
    state: SubstanceState.SOLID,
    color: '黑色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.NONE,
    description: '黑色粉末'
  },
  {
    id: 74,
    name: '四氧化三铁',
    formula: 'Fe₃O₄',
    molarMass: 231.53,
    state: SubstanceState.SOLID,
    color: '黑色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.NONE,
    description: '黑色晶体，有磁性'
  },
  {
    id: 75,
    name: '氧化钙',
    formula: 'CaO',
    molarMass: 56.08,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.LOW,
    description: '俗称生石灰，与水反应放热'
  },
  {
    id: 76,
    name: '氧化镁',
    formula: 'MgO',
    molarMass: 40.30,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.NONE,
    description: '白色粉末，耐火材料'
  },
  {
    id: 77,
    name: '氧化铝',
    formula: 'Al₂O₃',
    molarMass: 101.96,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.NONE,
    description: '白色固体，两性氧化物'
  },
  {
    id: 78,
    name: '二氧化硅',
    formula: 'SiO₂',
    molarMass: 60.08,
    state: SubstanceState.SOLID,
    color: '无色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.NONE,
    description: '沙子主要成分，酸性氧化物'
  },
  {
    id: 79,
    name: '二氧化锰',
    formula: 'MnO₂',
    molarMass: 86.94,
    state: SubstanceState.SOLID,
    color: '黑色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.LOW,
    description: '黑色粉末，催化剂'
  },
  {
    id: 80,
    name: '一氧化碳',
    formula: 'CO',
    molarMass: 28.01,
    state: SubstanceState.GAS,
    color: '无色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.HIGH,
    description: '有毒气体，可燃'
  },
  {
    id: 81,
    name: '五氧化二磷',
    formula: 'P₂O₅',
    molarMass: 141.94,
    state: SubstanceState.SOLID,
    color: '白色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.HIGH,
    description: '白色粉末，吸水性强'
  },
  {
    id: 82,
    name: '过氧化氢',
    formula: 'H₂O₂',
    molarMass: 34.01,
    state: SubstanceState.AQUEOUS,
    color: '无色',
    category: SubstanceCategory.OTHER,
    hazard: HazardLevel.MEDIUM,
    description: '俗称双氧水，有氧化性'
  },
  {
    id: 83,
    name: '氧化银',
    formula: 'Ag₂O',
    molarMass: 231.74,
    state: SubstanceState.SOLID,
    color: '褐色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.LOW,
    description: '褐色粉末'
  },
  {
    id: 84,
    name: '三氧化硫',
    formula: 'SO₃',
    molarMass: 80.06,
    state: SubstanceState.SOLID,
    color: '无色',
    category: SubstanceCategory.OXIDE,
    hazard: HazardLevel.HIGH,
    description: '与水剧烈反应生成硫酸'
  }
]

/**
 * 根据ID获取物质
 */
export function getSubstanceById(id) {
  return SUBSTANCES.find(s => s.id === id)
}

/**
 * 根据分类获取物质
 */
export function getSubstancesByCategory(category) {
  return SUBSTANCES.filter(s => s.category === category)
}

/**
 * 搜索物质（按名称或化学式）
 */
export function searchSubstances(keyword) {
  if (!keyword) return SUBSTANCES
  const lowerKeyword = keyword.toLowerCase()
  return SUBSTANCES.filter(s =>
    s.name.includes(keyword) ||
    s.formula.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * 获取分类名称
 */
export function getCategoryName(category) {
  const names = {
    [SubstanceCategory.METAL]: '金属',
    [SubstanceCategory.NON_METAL]: '非金属',
    [SubstanceCategory.ACID]: '酸',
    [SubstanceCategory.BASE]: '碱',
    [SubstanceCategory.SALT]: '盐',
    [SubstanceCategory.OXIDE]: '氧化物',
    [SubstanceCategory.OTHER]: '其他'
  }
  return names[category] || '未知'
}

/**
 * 获取状态名称
 */
export function getStateName(state) {
  const names = {
    [SubstanceState.SOLID]: '固体',
    [SubstanceState.LIQUID]: '液体',
    [SubstanceState.GAS]: '气体',
    [SubstanceState.AQUEOUS]: '水溶液'
  }
  return names[state] || '未知'
}

/**
 * 获取危险等级名称
 */
export function getHazardLevelName(level) {
  const names = {
    [HazardLevel.NONE]: '无危险',
    [HazardLevel.LOW]: '低危险',
    [HazardLevel.MEDIUM]: '中等危险',
    [HazardLevel.HIGH]: '高危险',
    [HazardLevel.CORROSIVE]: '腐蚀性'
  }
  return names[level] || '未知'
}
