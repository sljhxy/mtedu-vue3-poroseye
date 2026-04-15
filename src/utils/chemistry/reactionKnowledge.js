/**
 * 化学反应知识库
 * 包含初中+高中常见化学反应及知识点
 */

// 反应类型枚举
export const ReactionType = {
  COMBINATION: 'COMBINATION',                      // 化合反应
  DECOMPOSITION: 'DECOMPOSITION',                  // 分解反应
  DISPLACEMENT: 'DISPLACEMENT',                    // 置换反应
  DOUBLE_DISPLACEMENT: 'DOUBLE_DISPLACEMENT',      // 复分解反应
  COMBUSTION: 'COMBUSTION',                        // 燃烧反应
  NEUTRALIZATION: 'NEUTRALIZATION',                // 中和反应
  PRECIPITATION: 'PRECIPITATION',                  // 沉淀反应
  REDOX: 'REDOX',                                  // 氧化还原反应
  ACID_BASE: 'ACID_BASE'                           // 酸碱反应
}

// 难度等级
export const DifficultyLevel = {
  ELEMENTARY: 'elementary',        // 小学
  MIDDLE_SCHOOL: 'middle_school',  // 初中
  HIGH_SCHOOL: 'high_school',      // 高中
  UNIVERSITY: 'university',        // 大学
  ADVANCED: 'advanced'             // 高级
}

// 反应速率等级
export const ReactionRate = {
  INSTANT: 'instant',      // 瞬间反应
  VERY_FAST: 'very_fast',  // 极快
  FAST: 'fast',            // 快
  MODERATE: 'moderate',    // 中等
  SLOW: 'slow',            // 慢
  VERY_SLOW: 'very_slow'   // 很慢
}

/**
 * 反应知识库数据
 * 按equationId索引
 */
export const REACTION_KNOWLEDGE = {
  // ========== 置换反应 (金属 + 酸) ==========
  1: {
    equationId: 1,
    reactants: [1, 30], // Zn + H2SO4
    products: [51, 20], // ZnSO4 + H2
    equationText: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑',
    equationHtml: 'Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>↑',
    reactionType: ReactionType.DISPLACEMENT,
    isRedox: true,
    enthalpyChange: -152.5,
    reactionRate: ReactionRate.FAST,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '锌是一种活泼金属，能与稀硫酸发生置换反应，生成硫酸锌和氢气。这个反应是放热反应，我们可以观察到锌粒表面产生气泡，试管壁发烫。',
      teacherDescription: '本实验演示金属与酸的置换反应。重点引导学生观察：1) 气泡的产生；2) 温度的变化；3) 锌粒的溶解。可讨论反应速率与金属活泼性的关系。',
      keyPoints: [
        '方程式：Zn + H₂SO₄ → ZnSO₄ + H₂↑',
        '置换反应：单质 + 化合物 → 新单质 + 新化合物',
        '反应放热，试管壁发烫',
        '氢气可燃，验纯后才能点燃',
        '金属活动性：Zn > H'
      ],
      commonQuestions: [
        { question: '为什么锌粒表面会产生气泡？', answer: '因为反应生成了氢气，氢气不溶于水，以气泡形式逸出。' },
        { question: '反应放热还是吸热？', answer: '反应放热，用手触摸试管壁可以感觉到温度升高。' },
        { question: '为什么需要验纯？', answer: '氢气与空气混合可能爆炸，点燃前必须验纯。' }
      ],
      commonMistakes: [
        { mistake: '认为所有金属都能与酸反应', correction: '只有金属活动性顺序表中氢之前的金属才能与酸反应置换出氢气' },
        { mistake: '使用浓硫酸', correction: '浓硫酸与锌反应不产生氢气，而是产生二氧化硫' }
      ]
    },
    phenomena: {
      colorChange: { before: '无色透明', after: '无色透明', description: '溶液颜色无明显变化' },
      gasEvolution: { hasGas: true, gasDescription: '产生无色无味气泡', gasProperties: '可燃，密度比空气小' },
      temperatureChange: { isExothermic: true, temperatureChange: '+15°C', description: '反应放热，试管壁发烫' },
      precipitate: { hasPrecipitate: false },
      soundPhenomenon: '轻微的嘶嘶声',
      observationPoints: ['观察锌粒表面是否产生气泡', '用手触摸试管壁感受温度变化', '注意气体放出的速度']
    },
    stages: [
      {
        stageOrder: 1,
        stageName: '反应初期',
        stageType: 'initiation',
        durationEstimate: '5秒',
        phenomenaDescription: '锌粒表面开始产生少量气泡',
        microscopicExplanation: 'Zn原子失去电子成为Zn²⁺进入溶液，H⁺获得电子成为H原子'
      },
      {
        stageOrder: 2,
        stageName: '反应进行中',
        stageType: 'propagation',
        durationEstimate: '20秒',
        phenomenaDescription: '气泡产生速度加快，放出明显热量',
        microscopicExplanation: '反应速率加快，大量H₂分子生成并聚集形成气泡'
      },
      {
        stageOrder: 3,
        stageName: '反应后期',
        stageType: 'completion',
        durationEstimate: '5秒',
        phenomenaDescription: '锌粒完全溶解，气泡逐渐减少至停止',
        microscopicExplanation: '反应物消耗完毕，反应终止'
      }
    ]
  },

  2: {
    equationId: 2,
    reactants: [2, 32], // Fe + HCl
    products: [66, 20], // FeCl2 + H2
    equationText: 'Fe + 2HCl → FeCl₂ + H₂↑',
    equationHtml: 'Fe + 2HCl → FeCl<sub>2</sub> + H<sub>2</sub>↑',
    reactionType: ReactionType.DISPLACEMENT,
    isRedox: true,
    enthalpyChange: -89.0,
    reactionRate: ReactionRate.MODERATE,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '铁能与盐酸反应生成氯化亚铁和氢气。反应较温和，溶液逐渐变为浅绿色。',
      teacherDescription: '演示铁与酸的置换反应。注意：铁生成+2价亚铁盐，溶液呈浅绿色。与锌反应对比速率差异。',
      keyPoints: [
        '方程式：Fe + 2HCl → FeCl₂ + H₂↑',
        '亚铁离子Fe²⁺呈浅绿色',
        '铁在金属活动性顺序中位于氢之前',
        '反应速率比锌慢'
      ],
      commonQuestions: [
        { question: '溶液为什么变浅绿色？', answer: '生成的Fe²⁺离子在水溶液中呈浅绿色。' },
        { question: '为什么不用硝酸？', answer: '硝酸有强氧化性，与铁反应不产生氢气。' }
      ],
      commonMistakes: [
        { mistake: '认为生成氯化铁FeCl₃', correction: '铁与盐酸反应生成+2价的亚铁盐FeCl₂，不是+3价的铁盐' }
      ]
    },
    phenomena: {
      colorChange: { before: '无色', after: '浅绿色', description: '溶液逐渐变为浅绿色' },
      gasEvolution: { hasGas: true, gasDescription: '产生气泡，速度较慢' },
      temperatureChange: { isExothermic: true, temperatureChange: '+10°C', description: '放热，但不明显' },
      precipitate: { hasPrecipitate: false }
    }
  },

  3: {
    equationId: 3,
    reactants: [4, 30], // Mg + H2SO4
    products: [86, 20], // MgSO4 + H2
    equationText: 'Mg + H₂SO₄ → MgSO₄ + H₂↑',
    equationHtml: 'Mg + H<sub>2</sub>SO<sub>4</sub> → MgSO<sub>4</sub> + H<sub>2</sub>↑',
    reactionType: ReactionType.DISPLACEMENT,
    isRedox: true,
    enthalpyChange: -466.0,
    reactionRate: ReactionRate.VERY_FAST,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '镁与稀硫酸反应非常剧烈，迅速产生大量气泡并放出大量热。',
      teacherDescription: '演示活泼金属与酸的反应。镁比锌更活泼，反应更快。注意控制用量。',
      keyPoints: [
        '方程式：Mg + H₂SO₄ → MgSO₄ + H₂↑',
        '镁比锌更活泼，反应更快',
        '反应剧烈放热'
      ],
      commonQuestions: [
        { question: '为什么镁反应比锌快？', answer: '镁比锌更活泼，失去电子能力更强。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色', after: '无色', description: '溶液颜色无变化' },
      gasEvolution: { hasGas: true, gasDescription: '剧烈产生气泡' },
      temperatureChange: { isExothermic: true, temperatureChange: '+25°C', description: '剧烈放热' },
      precipitate: { hasPrecipitate: false }
    }
  },

  // ========== 酸碱中和反应 ==========
  10: {
    equationId: 10,
    reactants: [32, 40], // HCl + NaOH
    products: [50, 70], // NaCl + H2O
    equationText: 'HCl + NaOH → NaCl + H₂O',
    equationHtml: 'HCl + NaOH → NaCl + H<sub>2</sub>O',
    reactionType: ReactionType.NEUTRALIZATION,
    isRedox: false,
    enthalpyChange: -57.1,
    reactionRate: ReactionRate.INSTANT,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '盐酸与氢氧化钠发生中和反应，生成氯化钠和水。这是一个放热反应。',
      teacherDescription: '典型的酸碱中和反应。可用酚酞指示剂观察反应终点（红色褪去）。',
      keyPoints: [
        '方程式：HCl + NaOH → NaCl + H₂O',
        '中和反应：酸 + 碱 → 盐 + 水',
        '反应放热',
        '可用酚酞作指示剂'
      ],
      commonQuestions: [
        { question: '为什么叫中和反应？', answer: '酸和碱反应生成中性的盐和水，酸碱性互相抵消。' },
        { question: '反应放热还是吸热？', answer: '中和反应都是放热的。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色（或酚酞红）', after: '无色', description: '若使用酚酞，红色褪去' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: true, temperatureChange: '+5°C', description: '放热但不明显' },
      precipitate: { hasPrecipitate: false }
    }
  },

  11: {
    equationId: 11,
    reactants: [30, 40], // H2SO4 + 2NaOH
    products: [85, 70], // Na2SO4 + 2H2O
    equationText: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
    equationHtml: 'H<sub>2</sub>SO<sub>4</sub> + 2NaOH → Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O',
    reactionType: ReactionType.NEUTRALIZATION,
    isRedox: false,
    enthalpyChange: -114.2,
    reactionRate: ReactionRate.INSTANT,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '硫酸与氢氧化钠发生中和反应，生成硫酸钠和水。注意硫酸需要2个氢氧化钠分子。',
      teacherDescription: '二元酸与碱的中和反应。注意化学计量比为1:2。',
      keyPoints: [
        '方程式：H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
        '硫酸是二元酸，需要2倍碱',
        '生成硫酸钠和水'
      ],
      commonQuestions: [
        { question: '为什么需要2个NaOH？', answer: '硫酸H₂SO₄有2个可被中和的H⁺，每个NaOH只能提供1个OH⁻。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色', after: '无色', description: '无明显变化' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: true, temperatureChange: '+8°C', description: '放热' },
      precipitate: { hasPrecipitate: false }
    }
  },

  // ========== 沉淀反应 ==========
  20: {
    equationId: 20,
    reactants: [56, 30], // BaCl2 + H2SO4
    products: [55, 32], // BaSO4 + 2HCl
    equationText: 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl',
    equationHtml: 'BaCl<sub>2</sub> + H<sub>2</sub>SO<sub>4</sub> → BaSO<sub>4</sub>↓ + 2HCl',
    reactionType: ReactionType.PRECIPITATION,
    isRedox: false,
    enthalpyChange: -25.0,
    reactionRate: ReactionRate.INSTANT,
    difficultyLevel: DifficultyLevel.HIGH_SCHOOL,
    teachingInfo: {
      studentDescription: '氯化钡与硫酸反应生成白色硫酸钡沉淀。硫酸钡不溶于水也不溶于酸。',
      teacherDescription: '典型的沉淀反应。硫酸钡是钡盐中唯一不溶于酸的，可用于检验硫酸根离子。',
      keyPoints: [
        '方程式：BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl',
        '硫酸钡是白色沉淀',
        'BaSO₄不溶于酸',
        '用于检验SO₄²⁻'
      ],
      commonQuestions: [
        { question: '为什么沉淀不溶于酸？', answer: '硫酸钡的溶度积极小，是钡盐中唯一不溶于酸的。' },
        { question: '如何检验硫酸根？', answer: '加入含Ba²⁺的溶液，产生不溶于酸的白色沉淀。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色', after: '浑浊白色', description: '产生白色沉淀，溶液变浑浊' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: false },
      precipitate: {
        hasPrecipitate: true,
        precipitateColor: '白色',
        precipitateDescription: '白色絮状沉淀，迅速下沉',
        solubility: '不溶于水，不溶于酸'
      }
    }
  },

  21: {
    equationId: 21,
    reactants: [62, 32], // AgNO3 + HCl
    products: [57, 33], // AgCl + HNO3
    equationText: 'AgNO₃ + HCl → AgCl↓ + HNO₃',
    equationHtml: 'AgNO<sub>3</sub> + HCl → AgCl↓ + HNO<sub>3</sub>',
    reactionType: ReactionType.PRECIPITATION,
    isRedox: false,
    enthalpyChange: -65.5,
    reactionRate: ReactionRate.INSTANT,
    difficultyLevel: DifficultyLevel.HIGH_SCHOOL,
    teachingInfo: {
      studentDescription: '硝酸银与盐酸反应生成白色氯化银沉淀。氯化银见光会分解变黑。',
      teacherDescription: '检验氯离子的典型反应。注意避光保存。',
      keyPoints: [
        '方程式：AgNO₃ + HCl → AgCl↓ + HNO₃',
        '氯化银是白色沉淀',
        'AgCl见光分解变黑',
        '用于检验Cl⁻'
      ],
      commonQuestions: [
        { question: '沉淀为什么变黑？', answer: '氯化银见光分解生成黑色的银单质。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色', after: '白色浑浊', description: '产生白色沉淀' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: false },
      precipitate: {
        hasPrecipitate: true,
        precipitateColor: '白色',
        precipitateDescription: '白色凝乳状沉淀',
        note: '见光逐渐变黑'
      }
    }
  },

  // ========== 金属与盐溶液置换反应 ==========
  30: {
    equationId: 30,
    reactants: [1, 52], // Zn + FeSO4
    products: [2, 51], // Fe + ZnSO4
    equationText: 'Zn + FeSO₄ → Fe + ZnSO₄',
    equationHtml: 'Zn + FeSO<sub>4</sub> → Fe + ZnSO<sub>4</sub>',
    reactionType: ReactionType.DISPLACEMENT,
    isRedox: true,
    enthalpyChange: -230.0,
    reactionRate: ReactionRate.MODERATE,
    difficultyLevel: DifficultyLevel.HIGH_SCHOOL,
    teachingInfo: {
      studentDescription: '锌比铁活泼，能把铁从硫酸亚铁溶液中置换出来。溶液颜色由浅绿色逐渐变为无色。',
      teacherDescription: '金属活动性顺序的应用。活动性强的金属能把活动性弱的金属从其盐溶液中置换出来。',
      keyPoints: [
        '方程式：Zn + FeSO₄ → Fe + ZnSO₄',
        '金属活动性：Zn > Fe',
        '溶液由浅绿色变为无色',
        '铁单质析出'
      ],
      commonQuestions: [
        { question: '为什么溶液颜色会变化？', answer: '浅绿色的Fe²⁺被消耗，生成无色的Zn²⁺。' },
        { question: '铁能否置换锌？', answer: '不能，因为铁比锌不活泼。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '浅绿色', after: '无色', description: '溶液颜色逐渐变浅，最后变为无色' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: true, temperatureChange: '+12°C', description: '放热' },
      precipitate: { hasPrecipitate: false },
      observationPoints: ['观察溶液颜色变化', '观察锌表面变化', '观察铁的析出']
    }
  },

  31: {
    equationId: 31,
    reactants: [1, 53], // Zn + CuSO4
    products: [6, 51], // Cu + ZnSO4
    equationText: 'Zn + CuSO₄ → Cu + ZnSO₄',
    equationHtml: 'Zn + CuSO<sub>4</sub> → Cu + ZnSO<sub>4</sub>',
    reactionType: ReactionType.DISPLACEMENT,
    isRedox: true,
    enthalpyChange: -216.0,
    reactionRate: ReactionRate.MODERATE,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '锌能从硫酸铜溶液中置换出铜。锌表面覆盖一层红色物质，蓝色溶液逐渐变为无色。',
      teacherDescription: '经典的金属置换反应实验。现象明显，适合演示。',
      keyPoints: [
        '方程式：Zn + CuSO₄ → Cu + ZnSO₄',
        '金属活动性：Zn > Cu',
        '溶液由蓝色变为无色',
        '锌表面析出红色铜'
      ],
      commonQuestions: [
        { question: '溶液为什么是蓝色的？', answer: 'Cu²⁺在水溶液中呈蓝色。' },
        { question: '锌表面为什么变红？', answer: '被置换出的铜覆盖在锌表面。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '蓝色', after: '无色', description: '蓝色溶液逐渐变为无色' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: true, temperatureChange: '+15°C', description: '放热' },
      precipitate: { hasPrecipitate: false },
      observationPoints: ['观察溶液颜色变化', '观察锌表面红色物质析出']
    }
  },

  // ========== 氧化还原反应 ==========
  40: {
    equationId: 40,
    reactants: [63, 32], // KMnO4 + HCl (concentrated)
    products: [87, 88, 22, 70], // KCl + MnCl2 + Cl2 + H2O
    equationText: '2KMnO₄ + 16HCl(浓) → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O',
    equationHtml: '2KMnO<sub>4</sub> + 16HCl(浓) → 2KCl + 2MnCl<sub>2</sub> + 5Cl<sub>2</sub>↑ + 8H<sub>2</sub>O',
    reactionType: ReactionType.REDOX,
    isRedox: true,
    enthalpyChange: -185.0,
    reactionRate: ReactionRate.MODERATE,
    difficultyLevel: DifficultyLevel.HIGH_SCHOOL,
    teachingInfo: {
      studentDescription: '高锰酸钾与浓盐酸反应生成氯气。这是一个实验室制取氯气的方法。',
      teacherDescription: '实验室制取氯气的主要方法。强调使用浓盐酸。注意氯气有毒，需通风。',
      keyPoints: [
        '方程式：2KMnO₄ + 16HCl(浓) → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O',
        'Mn从+7价降到+2价',
        'Cl从-1价升到0价',
        '实验室制氯气方法'
      ],
      commonQuestions: [
        { question: '为什么必须用浓盐酸？', answer: '稀盐酸还原性不足，不能发生此反应。' },
        { question: '氧化剂是什么？', answer: 'KMnO₄是氧化剂，被还原为Mn²⁺。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '紫红色溶液', after: '浅粉色（Mn²⁺）', description: '紫红色褪去，变为浅粉色' },
      gasEvolution: { hasGas: true, gasDescription: '产生黄绿色气体（氯气）', gasProperties: '有毒，有刺激性气味' },
      temperatureChange: { isExothermic: true, temperatureChange: '+20°C', description: '放热' },
      precipitate: { hasPrecipitate: false }
    }
  },

  // ========== 碳酸钙与酸反应 ==========
  50: {
    equationId: 50,
    reactants: [59, 32], // CaCO3 + 2HCl
    products: [58, 28, 70], // CaCl2 + CO2 + H2O
    equationText: 'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O',
    equationHtml: 'CaCO<sub>3</sub> + 2HCl → CaCl<sub>2</sub> + CO<sub>2</sub>↑ + H<sub>2</sub>O',
    reactionType: ReactionType.DOUBLE_DISPLACEMENT,
    isRedox: false,
    enthalpyChange: -15.0,
    reactionRate: ReactionRate.MODERATE,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '碳酸钙（石灰石、大理石）与盐酸反应生成二氧化碳气体。固体逐渐溶解，产生气泡。',
      teacherDescription: '实验室制取二氧化碳的主要方法。大理石与稀盐酸反应。',
      keyPoints: [
        '方程式：CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O',
        '实验室制CO₂方法',
        '碳酸钙逐渐溶解',
        '产生无色气体'
      ],
      commonQuestions: [
        { question: '为什么不用浓盐酸？', answer: '浓盐酸易挥发，会使制得的CO₂不纯。' },
        { question: '为什么不用硫酸？', answer: '生成的硫酸钙微溶，会覆盖在碳酸钙表面阻止反应继续。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '白色固体', after: '固体溶解', description: '固体逐渐溶解' },
      gasEvolution: { hasGas: true, gasDescription: '产生无色无味气泡', gasProperties: '密度比空气大，不支持燃烧' },
      temperatureChange: { isExothermic: false },
      precipitate: { hasPrecipitate: false }
    }
  },

  // ========== 过氧化氢分解 ==========
  60: {
    equationId: 60,
    reactants: [82], // H2O2 (with MnO2 catalyst)
    products: [21, 70], // O2 + H2O
    equationText: '2H₂O₂ → 2H₂O + O₂↑',
    equationHtml: '2H<sub>2</sub>O<sub>2</sub> → 2H<sub>2</sub>O + O<sub>2</sub>↑',
    reactionType: ReactionType.DECOMPOSITION,
    isRedox: true,
    enthalpyChange: -196.0,
    reactionRate: ReactionRate.VERY_FAST,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '过氧化氢（双氧水）在二氧化锰催化下迅速分解，产生大量氧气气泡。',
      teacherDescription: '实验室制取氧气的方法之一。MnO₂是催化剂，反应前后质量和化学性质不变。',
      keyPoints: [
        '方程式：2H₂O₂ → 2H₂O + O₂↑',
        '分解反应',
        'MnO₂作催化剂',
        '实验室制氧气'
      ],
      commonQuestions: [
        { question: '为什么需要催化剂？', answer: '不加催化剂反应很慢，MnO₂能显著加快反应速率。' },
        { question: 'MnO₂会消耗吗？', answer: '不会，催化剂在反应前后质量和化学性质都不变。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色液体', after: '无色液体', description: '溶液无明显变化' },
      gasEvolution: { hasGas: true, gasDescription: '产生大量气泡', gasProperties: '氧气，能助燃' },
      temperatureChange: { isExothermic: true, temperatureChange: '+10°C', description: '放热' },
      precipitate: { hasPrecipitate: false }
    }
  },

  // ========== 氢气燃烧 ==========
  70: {
    equationId: 70,
    reactants: [20, 21], // H2 + O2
    products: [70], // H2O
    equationText: '2H₂ + O₂ → 2H₂O',
    equationHtml: '2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O',
    reactionType: ReactionType.COMBUSTION,
    isRedox: true,
    enthalpyChange: -571.6,
    reactionRate: ReactionRate.INSTANT,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '氢气在氧气中燃烧，产生淡蓝色火焰，生成水。这是最清洁的燃料。',
      teacherDescription: '氢能源的应用演示。强调点燃前必须验纯。',
      keyPoints: [
        '方程式：2H₂ + O₂ → 2H₂O',
        '淡蓝色火焰',
        '产物只有水，清洁能源',
        '点燃前必须验纯'
      ],
      commonQuestions: [
        { question: '火焰是什么颜色？', answer: '在空气中燃烧是淡蓝色火焰，玻璃导管可能使火焰呈黄色。' },
        { question: '为什么是最清洁的燃料？', answer: '燃烧产物只有水，不产生二氧化碳等污染物。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色', after: '无色（可能产生水雾）', description: '可能观察到水雾' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: true, temperatureChange: '+1000°C', description: '高温火焰' },
      precipitate: { hasPrecipitate: false },
      observationPoints: ['观察火焰颜色', '观察烧杯内壁水珠']
    }
  },

  // ========== 金属与水反应 ==========
  80: {
    equationId: 80,
    reactants: [3, 70], // Na + H2O
    products: [40, 20], // NaOH + H2
    equationText: '2Na + 2H₂O → 2NaOH + H₂↑',
    equationHtml: '2Na + 2H<sub>2</sub>O → 2NaOH + H<sub>2</sub>↑',
    reactionType: ReactionType.DISPLACEMENT,
    isRedox: true,
    enthalpyChange: -368.0,
    reactionRate: ReactionRate.VERY_FAST,
    difficultyLevel: DifficultyLevel.HIGH_SCHOOL,
    teachingInfo: {
      studentDescription: '钠与水剧烈反应，产生氢气，放出大量热，使钠熔化成小球在水面上游动。',
      teacherDescription: '演示活泼金属与水的反应。注意安全：钠粒要小，反应时远离。酚酞指示剂变红证明生成碱性物质。',
      keyPoints: [
        '方程式：2Na + 2H₂O → 2NaOH + H₂↑',
        '浮（密度小于水）',
        '熔（放热使钠熔化）',
        '游（气体推动）',
        '响（剧烈反应）',
        '红（酚酞变红）'
      ],
      commonQuestions: [
        { question: '钠为什么会熔化？', answer: '反应放出大量热，钠的熔点低（97.8°C），所以会熔化。' },
        { question: '为什么钠会游动？', answer: '产生的气体推动钠小球在水面上游动。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '无色（或酚酞无色）', after: '红色（酚酞）', description: '溶液遇酚酞变红' },
      gasEvolution: { hasGas: true, gasDescription: '剧烈产生气泡', gasProperties: '氢气，可燃' },
      temperatureChange: { isExothermic: true, temperatureChange: '+50°C', description: '剧烈放热' },
      precipitate: { hasPrecipitate: false },
      soundPhenomenon: '嘶嘶声',
      observationPoints: ['观察钠是否浮在水面', '观察是否熔化成小球', '观察游动和响声', '加酚酞观察颜色']
    }
  },

  // ========== 铁生锈（简化版） ==========
  90: {
    equationId: 90,
    reactants: [2, 21, 28], // Fe + O2 + H2O
    products: [72], // Fe2O3·xH2O
    equationText: '4Fe + 3O₂ + 2xH₂O → 2Fe₂O₃·xH₂O',
    equationHtml: '4Fe + 3O<sub>2</sub> + 2xH<sub>2</sub>O → 2Fe<sub>2</sub>O<sub>3</sub>·xH<sub>2</sub>O',
    reactionType: ReactionType.COMBINATION,
    isRedox: true,
    enthalpyChange: -1648.0,
    reactionRate: ReactionRate.VERY_SLOW,
    difficultyLevel: DifficultyLevel.MIDDLE_SCHOOL,
    teachingInfo: {
      studentDescription: '铁在潮湿空气中生锈，是铁、氧气和水共同作用的结果。生锈是缓慢氧化过程。',
      teacherDescription: '铁生锈的条件：同时接触氧气和水。防锈方法：涂油、刷漆、电镀等。',
      keyPoints: [
        '铁生锈是缓慢氧化',
        '需要同时接触O₂和H₂O',
        '铁锈主要成分是Fe₂O₃·xH₂O',
        '防锈：隔绝空气或水'
      ],
      commonQuestions: [
        { question: '铁在干燥空气中会生锈吗？', answer: '不会，需要同时有氧气和水。' },
        { question: '铁在完全浸没的水中会生锈吗？', answer: '不会，需要氧气参与。' }
      ],
      commonMistakes: []
    },
    phenomena: {
      colorChange: { before: '银白色金属', after: '红棕色', description: '逐渐变为红棕色铁锈' },
      gasEvolution: { hasGas: false },
      temperatureChange: { isExothermic: true, temperatureChange: '+5°C', description: '缓慢放热，不明显' },
      precipitate: { hasPrecipitate: false }
    }
  }
}

/**
 * 根据反应物ID查找可能的反应
 */
export function findReactionsByReactants(reactantIds) {
  const sortedIds = [...reactantIds].sort((a, b) => a - b)
  const matches = []

  for (const [equationId, reaction] of Object.entries(REACTION_KNOWLEDGE)) {
    const reactionReactantIds = [...reaction.reactants].sort((a, b) => a - b)
    if (JSON.stringify(sortedIds) === JSON.stringify(reactionReactantIds)) {
      matches.push({
        equationId: parseInt(equationId),
        reaction: reaction
      })
    }
  }

  return matches
}

/**
 * 根据方程式ID获取反应知识
 */
export function getReactionKnowledge(equationId) {
  return REACTION_KNOWLEDGE[equationId] || null
}

/**
 * 获取反应类型中文名称
 */
export function getReactionTypeName(type) {
  const names = {
    [ReactionType.COMBINATION]: '化合反应',
    [ReactionType.DECOMPOSITION]: '分解反应',
    [ReactionType.DISPLACEMENT]: '置换反应',
    [ReactionType.DOUBLE_DISPLACEMENT]: '复分解反应',
    [ReactionType.COMBUSTION]: '燃烧反应',
    [ReactionType.NEUTRALIZATION]: '中和反应',
    [ReactionType.PRECIPITATION]: '沉淀反应',
    [ReactionType.REDOX]: '氧化还原反应',
    [ReactionType.ACID_BASE]: '酸碱反应'
  }
  return names[type] || type
}

/**
 * 获取难度等级中文名称
 */
export function getDifficultyLevelName(level) {
  const names = {
    [DifficultyLevel.ELEMENTARY]: '小学',
    [DifficultyLevel.MIDDLE_SCHOOL]: '初中',
    [DifficultyLevel.HIGH_SCHOOL]: '高中',
    [DifficultyLevel.UNIVERSITY]: '大学',
    [DifficultyLevel.ADVANCED]: '高级'
  }
  return names[level] || level
}

/**
 * 获取反应速率描述
 */
export function getReactionRateDescription(rate) {
  const descriptions = {
    [ReactionRate.INSTANT]: '瞬间反应 (<1秒)',
    [ReactionRate.VERY_FAST]: '极快 (约5秒)',
    [ReactionRate.FAST]: '快 (约30秒)',
    [ReactionRate.MODERATE]: '中等 (约2分钟)',
    [ReactionRate.SLOW]: '慢 (约5分钟)',
    [ReactionRate.VERY_SLOW]: '很慢 (10分钟以上)'
  }
  return descriptions[rate] || rate
}
