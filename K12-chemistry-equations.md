# K12化学方程式知识库

> 基于 chemist-analyst 技能构建的中小学化学方程式数据库

## 目录

1. [数据结构说明](#1-数据结构说明)
2. [反应类型分类](#2-反应类型分类)
3. [核心化学原理](#3-核心化学原理)
4. [副反应与链式反应](#4-副反应与链式反应)
5. [K12化学方程式大全](#5-k12化学方程式大全)
6. [实验现象数据库](#6-实验现象数据库)
7. [教学知识点](#7-教学知识点)

---

## 1. 数据结构说明

### 1.1 方程式核心数据结构

```typescript
interface ChemicalEquation {
  // 基础标识
  id: number;                      // 方程式唯一ID
  equationText: string;            // 方程式文本: "Zn + H₂SO₄ → ZnSO₄ + H₂↑"
  equationHtml: string;            // HTML格式: "Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>↑"

  // 反应物与产物
  reactants: ReactionComponent[];  // 反应物列表
  products: ReactionComponent[];   // 产物列表

  // 反应分类
  reactionTypeCode: ReactionType;  // 反应类型代码
  isRedox: boolean;                // 是否氧化还原反应
  difficultyLevel: DifficultyLevel; // 难度等级

  // 反应条件
  conditions: ReactionConditions;  // 反应条件
  enthalpyChange: number | null;   // 焓变 (kJ/mol)
  reactionRate: ReactionRate;      // 反应速率

  // 教学信息
  teachingInfo: TeachingInfo;      // 教学描述
  phenomena: ReactionPhenomena;    // 反应现象
  stages: ReactionStage[];         // 反应阶段

  // 氧化还原信息（可选）
  oxidationChanges?: OxidationChange[];

  // 副反应关联（可选）
  secondaryReactions?: SecondaryReaction[]; // 可能的副反应列表

  // 知识点关联
  knowledgePoints: string[];       // 关联知识点
  isPublished: boolean;            // 是否发布
}

/**
 * 副反应数据结构
 * 用于描述主反应过程中可能发生的副反应
 */
interface SecondaryReaction {
  secondaryEquationId: number;     // 副反应方程式ID
  secondaryEquationText: string;   // 副反应方程式文本
  relationship: RelationshipType; // 与主反应的关系类型
  triggerProbability: number;      // 触发概率 0-1
  triggerCondition?: TriggerCondition; // 触发条件
  phenomenonImpact?: PhenomenonImpact; // 对现象的影响
  suppressionMethod?: string;      // 抑制方法
  isCommonStudentError: boolean;   // 是否学生常见错误来源
  teachingNote?: string;           // 教学提示
}

/**
 * 副反应与主反应的关系类型
 */
enum RelationshipType {
  PARALLEL = "parallel",           // 平行反应：同时发生
  SEQUENTIAL = "sequential",       // 连串反应：产物继续反应
  COMPETITIVE = "competitive",     // 竞争反应：同一反应物多条路径
  SIDE = "side",                   // 侧反应：次要反应路径
  INTERFERENCE = "interference",   // 干扰反应：影响主反应观察
  CHAIN = "chain"                  // 链式反应：引发连续反应
}

/**
 * 触发条件
 */
interface TriggerCondition {
  temperature?: string;            // 温度条件
  oxygenPresent?: boolean;         // 是否有氧气
  lightPresent?: boolean;          // 是否有光照
  catalystPresent?: boolean;       // 是否有催化剂
  concentration?: string;          // 浓度条件
  phRange?: string;                // pH范围
  otherCondition?: string;         // 其他条件
}

/**
 * 对现象的影响
 */
interface PhenomenonImpact {
  colorMask?: string;              // 颜色掩盖（如杂质颜色掩盖主产物颜色）
  gasInterference?: string;        // 气体干扰
  precipitateInterference?: string;// 沉淀干扰
  description: string;             // 影响描述
}

interface ReactionComponent {
  substanceId: number;             // 物质库ID
  coefficient: number;             // 化学计量系数
  state: SubstanceState;           // 物质状态: s|l|g|aq
}

interface ReactionConditions {
  temperature: string | null;      // 温度条件: "室温"/"高温"/"加热"
  medium: string | null;           // 反应介质: "水溶液"/"熔融"/"干燥"
  catalyst: string | null;         // 催化剂
  pressure: string | null;         // 压强条件
}
```

### 1.2 反应现象数据结构

```typescript
interface ReactionPhenomena {
  // 颜色变化
  colorChange: {
    before: string;                // 反应前颜色
    after: string;                 // 反应后颜色
    intermediate?: string[];       // 中间过程颜色
    description: string;           // 变化描述
  };

  // 沉淀现象
  precipitate: {
    hasPrecipitate: boolean;       // 是否有沉淀
    precipitateColor?: string;     // 沉淀颜色
    precipitateDescription?: string; // 沉淀形态
    solubility?: string;           // 溶解性
  };

  // 气体放出
  gasEvolution: {
    hasGas: boolean;               // 是否有气体产生
    gasDescription?: string;       // 气体描述
    gasProperties?: string;        // 气体性质
  };

  // 温度变化
  temperatureChange: {
    isExothermic: boolean;         // 是否放热
    temperatureChange?: string;    // 温度变化幅度
    description: string;           // 热效应描述
  };

  // 其他现象
  description: string;             // 总体现象描述
  soundPhenomenon?: string;        // 声音现象
  observationPoints: string[];     // 观察要点
}
```

### 1.3 教学信息数据结构

```typescript
interface TeachingInfo {
  // 描述文本
  studentDescription: string;      // 学生版描述
  teacherDescription: string;      // 教师版描述

  // 知识点
  keyPoints: string[];             // 关键知识点

  // 常见问题与错误
  commonQuestions: QuestionAnswer[];
  commonMistakes: Correction[];

  // 实验操作
  experimentSteps?: string[];      // 实验步骤
  safetyNotes?: string[];          // 安全注意事项
}

interface ReactionStage {
  stageOrder: number;              // 阶段顺序
  stageName: string;               // 阶段名称
  stageType: string;               // 阶段类型
  durationEstimate: string;        // 预计持续时间
  phenomenaDescription: string;    // 现象描述
  microscopicExplanation: string;  // 微观解释
  colorChange?: ColorChange;       // 阶段颜色变化
}
```

### 1.4 物质数据结构

```typescript
interface Substance {
  id: number;                      // 物质唯一ID
  nameZh: string;                  // 中文名称
  nameEn: string;                  // 英文名称
  formula: string;                 // 化学式
  molarMass: number;               // 摩尔质量 (g/mol)
  state: SubstanceState;           // 标准状态
  color: string;                   // 颜色
  category: SubstanceCategory;     // 物质分类
  hazard: HazardLevel;             // 危险等级
  description: string;             // 描述
}

enum SubstanceState {
  SOLID = 's',                     // 固体
  LIQUID = 'l',                    // 液体
  GAS = 'g',                       // 气体
  AQUEOUS = 'aq'                   // 水溶液
}

enum SubstanceCategory {
  METAL = 'metal',                 // 金属
  NON_METAL = 'non_metal',         // 非金属
  ACID = 'acid',                   // 酸
  BASE = 'base',                   // 碱
  SALT = 'salt',                   // 盐
  OXIDE = 'oxide',                 // 氧化物
  OTHER = 'other'                  // 其他
}
```

---

## 2. 反应类型分类

### 2.1 反应类型枚举

| 代码 | 中文名称 | 通用形式 | 示例 |
|------|----------|----------|------|
| COMBINATION | 化合反应 | A + B → AB | 2H₂ + O₂ → 2H₂O |
| DECOMPOSITION | 分解反应 | AB → A + B | 2H₂O₂ → 2H₂O + O₂↑ |
| DISPLACEMENT | 置换反应 | A + BC → AC + B | Zn + H₂SO₄ → ZnSO₄ + H₂↑ |
| DOUBLE_DISPLACEMENT | 复分解反应 | AB + CD → AD + CB | AgNO₃ + HCl → AgCl↓ + HNO₃ |
| REDOX | 氧化还原反应 | 电子转移 | 2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O |
| COMBUSTION | 燃烧反应 | 燃料 + O₂ | 2H₂ + O₂ → 2H₂O |
| NEUTRALIZATION | 中和反应 | 酸 + 碱 → 盐 + 水 | HCl + NaOH → NaCl + H₂O |
| PRECIPITATION | 沉淀反应 | 生成难溶物 | BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl |

### 2.2 反应类型特征分析

#### 化合反应 (COMBINATION)

**化学原理**: 多种物质结合生成一种新物质，原子重新组合形成新的化学键。

**热力学特征**: 通常是放热反应 (ΔH < 0)，因为形成新键释放能量。

**动力学特征**: 反应速率取决于反应物的活泼性和表面积。

**结构变化**: 反应物中的化学键断裂，产物中形成新的化学键。

**典型示例**:
- 金属与非金属化合: 2Fe + 3Cl₂ → 2FeCl₃
- 非金属与非金属化合: 2H₂ + O₂ → 2H₂O
- 酸性氧化物与水: SO₃ + H₂O → H₂SO₄

#### 分解反应 (DECOMPOSITION)

**化学原理**: 一种物质分解成两种或多种物质，化学键断裂。

**热力学特征**: 通常是吸热反应 (ΔH > 0)，需要能量输入断裂化学键。

**动力学特征**: 常需要催化剂或加热来降低活化能。

**结构变化**: 反应物中的化学键断裂，生成物的化学键形成。

**典型示例**:
- 氧化物分解: 2HgO → 2Hg + O₂↑
- 酸分解: H₂CO₃ → H₂O + CO₂↑
- 盐分解: CaCO₃ → CaO + CO₂↑

#### 置换反应 (DISPLACEMENT)

**化学原理**: 单质与化合物反应，生成新的单质和新的化合物。

**热力学特征**: 取决于金属活动性顺序，活动性强的金属可以置换活动性弱的金属。

**动力学特征**: 反应速率与金属活泼性、表面积、酸浓度相关。

**电子转移**: 是一类特殊的氧化还原反应。

**典型示例**:
- 金属 + 酸: Zn + H₂SO₄ → ZnSO₄ + H₂↑
- 金属 + 盐: Fe + CuSO₄ → FeSO₄ + Cu
- 金属 + 水: 2Na + 2H₂O → 2NaOH + H₂↑

#### 复分解反应 (DOUBLE_DISPLACEMENT)

**化学原理**: 两种化合物交换成分，生成两种新的化合物。

**发生条件**: 生成沉淀、气体或水。

**离子交换**: 阳离子和阴离子重新组合。

**典型示例**:
- 生成沉淀: BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl
- 生成气体: Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑
- 生成水: HCl + NaOH → NaCl + H₂O

#### 氧化还原反应 (REDOX)

**化学原理**: 电子从还原剂转移到氧化剂。

**氧化数变化**: 氧化剂氧化数降低，还原剂氧化数升高。

**热力学特征**: 取决于氧化还原电势差 (E° = E°(cathode) - E°(anode))

**动力学特征**: 反应速率可能受浓度、温度、催化剂影响。

**典型示例**:
- 实验室制氯气: 2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O
- 金属腐蚀: 4Fe + 3O₂ → 2Fe₂O₃

#### 燃烧反应 (COMBUSTION)

**化学原理**: 剧烈的发光发热的氧化还原反应。

**热力学特征**: 高度放热，释放大量热能和光能。

**三要素**: 可燃物、助燃物(通常是氧气)、达到着火点。

**典型示例**:
- 氢气燃烧: 2H₂ + O₂ → 2H₂O
- 镁条燃烧: 2Mg + O₂ → 2MgO
- 甲烷燃烧: CH₄ + 2O₂ → CO₂ + 2H₂O

#### 中和反应 (NEUTRALIZATION)

**化学原理**: 酸中的H⁺与碱中的OH⁻结合生成H₂O。

**热力学特征**: 放热反应，ΔH ≈ -57 kJ/mol (强酸强碱)。

**pH变化**: 反应后溶液趋向中性 (pH ≈ 7)。

**典型示例**:
- 强酸强碱: HCl + NaOH → NaCl + H₂O
- 弱酸强碱: CH₃COOH + NaOH → CH₃COONa + H₂O

#### 沉淀反应 (PRECIPITATION)

**化学原理**: 溶液中的离子结合生成难溶性化合物。

**溶度积原理**: 当离子积 > Ksp时，沉淀生成。

**常见沉淀**: AgCl, BaSO₄, CaCO₃, Cu(OH)₂等。

**典型示例**:
- 检验氯离子: AgNO₃ + HCl → AgCl↓ + HNO₃
- 检验硫酸根: BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl

---

## 3. 核心化学原理

### 3.1 原子结构与键合

#### 电子排布与反应性

**价电子理论**: 原子的化学反应性主要由其价电子决定。

- **金属**: 倾向于失去电子形成阳离子
- **非金属**: 倾向于获得电子形成阴离子

**八隅体规则**: 原子倾向于获得/失去/共享电子以达到稳定的8电子构型。

#### 化学键类型

| 键型 | 形成方式 | 特征 | 示例 |
|------|----------|------|------|
| 离子键 | 电子转移 | 高熔点、导电 | NaCl |
| 共价键 | 电子共享 | 方向性、饱和性 | H₂O, CO₂ |
| 金属键 | 电子海 | 导电、延展 | Fe, Cu |

#### 反应中的键变化

**键断裂 (吸热)**: 反应物中的化学键断裂需要吸收能量。

**键形成 (放热)**: 产物中形成新的化学键释放能量。

**净焓变**: ΔH = Σ(键形成能) - Σ(键断裂能)

### 3.2 热力学原理

#### 吉布斯自由能

**公式**: ΔG = ΔH - TΔS

**判断标准**:
- ΔG < 0: 反应自发进行
- ΔG > 0: 反应非自发
- ΔG = 0: 反应达到平衡

#### 勒夏特列原理

**内容**: 处于平衡状态的系统，当改变条件时，系统会向减弱这种改变的方向移动。

**应用**:
- 增加反应物浓度 → 平衡向正反应方向移动
- 升高温度 → 平衡向吸热反应方向移动
- 增大压强 → 平衡向气体分子数减少的方向移动

### 3.3 动力学原理

#### 反应速率方程

**公式**: rate = k[A]^m[B]^n

**反应级数**:
- 零级: rate = k (与浓度无关)
- 一级: rate = k[A] (速率与浓度成正比)
- 二级: rate = k[A]² 或 k[A][B]

#### 阿伦尼乌斯方程

**公式**: k = A·e^(-Ea/RT)

**影响因素**:
- 温度升高 → k增大 → 反应速率加快
- 活化能Ea降低 → k增大 → 反应速率加快
- 催化剂 → 降低Ea → 加快反应

#### 反应机理

**基元反应**: 一步完成的反应，反应级数等于化学计量数。

**复杂反应**: 由多个基元反应组成的反应，速率由最慢的步骤(决速步)决定。

### 3.4 氧化还原原理

#### 氧化数规则

1. 单质中元素氧化数为0
2. 单原子离子氧化数等于离子电荷
3. 氧通常为-2 (过氧化物中为-1)
4. 氢通常为+1 (金属氢化物中为-1)
5. 化合物中氧化数代数和等于化合物电荷

#### 氧化还原反应配平

**步骤**:
1. 标出氧化数变化
2. 确定氧化剂、还原剂
3. 根据电子得失相等配平
4. 检查原子守恒和电荷守恒

**示例**: MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O

### 3.5 酸碱理论

#### 阿伦尼乌斯理论

- **酸**: 在水溶液中电离出H⁺的物质
- **碱**: 在水溶液中电离出OH⁻的物质

#### 布朗斯特-劳里理论

- **酸**: 质子(H⁺)给予体
- **碱**: 质子(H⁺)接受体

#### 路易斯理论

- **酸**: 电子对接受体
- **碱**: 电子对给予体

---

## 4. 副反应与链式反应

### 4.1 副反应概述

在化学反应中，除了主反应外，常常伴随副反应的发生。副反应是指：
- 在主反应进行的同时发生的其他反应
- 可能影响产物纯度、实验现象观察
- 是学生实验中常见问题的来源

### 4.2 副反应类型

#### 4.2.1 按反应关系分类

| 类型 | 说明 | 示例 |
|------|------|------|
| 平行反应 | 同一反应物同时进行多个反应 | 甲苯硝化生成邻/间/对位产物 |
| 连串反应 | 主反应产物继续反应 | 乙醇氧化→乙醛→乙酸 |
| 竞争反应 | 不同反应物竞争同一试剂 | Cl₂与Fe/Fe²⁺的反应 |
| 侧反应 | 次要反应路径 | CO₂与水的反应 |
| 链式反应 | 引发连续反应 | 烷烃的卤代反应 |

#### 4.2.2 按影响程度分类

| 类型 | 触发概率 | 影响 | 教学处理 |
|------|----------|------|----------|
| 主要副反应 | >0.5 | 显著影响产物 | 必须讲解抑制方法 |
| 次要副反应 | 0.1-0.5 | 影响现象观察 | 提醒学生注意 |
| 偶发副反应 | <0.1 | 偶尔出现 | 可选讲解 |

### 4.3 常见副反应示例

#### 4.3.1 金属与酸反应的副反应

**主反应**: Zn + H₂SO₄ → ZnSO₄ + H₂↑

**可能的副反应**:
1. 锌中杂质反应
   - Zn中含Fe: Fe + H₂SO₄ → FeSO₄ + H₂↑
   - 影响: 产生浅绿色Fe²⁺，影响溶液颜色观察

2. 浓硫酸的反应
   - 锌与浓硫酸: Zn + 2H₂SO₄(浓) → ZnSO₄ + SO₂↑ + 2H₂O
   - 影响: 产生刺激性气味气体

#### 4.3.2 氯气制备的副反应

**主反应**: MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O

**可能的副反应**:
1. 盐酸挥发
   - HCl气体逸出
   - 影响: 产物Cl₂不纯

2. 氯气溶解
   - Cl₂ + H₂O ⇌ HCl + HClO
   - 影响: 减少Cl₂产量

#### 4.3.3 乙烯制备的副反应

**主反应**: CH₃CH₂OH → CH₂=CH₂ + H₂O (170℃)

**可能的副反应**:
1. 分子间脱水
   - 2CH₃CH₂OH → CH₃CH₂OCH₂CH₃ + H₂O (140℃)
   - 影响: 产生乙醚杂质

2. 碳化反应
   - 乙醇 → 碳 + 其他产物
   - 影响: 温度过高时产生黑色物质

#### 4.3.4 钠与水反应的副反应

**主反应**: 2Na + 2H₂O → 2NaOH + H₂↑

**可能的副反应**:
1. 钠的氧化
   - 4Na + O₂ → 2Na₂O
   - 影响: 钠表面氧化，影响反应速率

2. 氢气燃烧
   - 2H₂ + O₂ → 2H₂O
   - 影响: 熔融钠燃烧，产生黄色火焰

#### 4.3.5 铁生锈的链式反应

**主反应**: 4Fe + 3O₂ → 2Fe₂O₃

**链式反应过程**:
1. 初期氧化: Fe → Fe²⁺ (e⁻转移)
2. 中间产物: 2Fe²⁺ + O₂ + 2H₂O → 2FeOOH + 2H⁺
3. 最终产物: 2FeOOH → Fe₂O₃ + H₂O

### 4.4 副反应在数据结构中的表示

在方程式数据中，副反应通过`secondaryReactions`数组表示：

```json
{
  "id": 1,
  "equationText": "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
  "equationHtml": "Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>↑",
  "secondaryReactions": [
    {
      "secondaryEquationId": 200,
      "secondaryEquationText": "Fe + H₂SO₄ → FeSO₄ + H₂↑",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "impurityPresent": true,
        "impurityType": "iron"
      },
      "phenomenonImpact": {
        "colorMask": "Fe²⁺的浅绿色可能掩盖Zn²⁺的无色"
      },
      "isCommonStudentError": true,
      "teachingNote": "提醒学生使用纯净锌粒，观察溶液颜色时应注意杂质影响"
    },
    {
      "secondaryEquationId": 201,
      "secondaryEquationText": "Zn + 2H₂SO₄(浓) → ZnSO₄ + SO₂↑ + 2H₂O",
      "relationship": "competitive",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "concentration": "浓硫酸"
      },
      "phenomenonImpact": {
        "gasInterference": "刺激性气味的SO₂"
      },
      "suppressionMethod": "使用稀硫酸",
      "isCommonStudentError": true,
      "teachingNote": "强调必须使用稀硫酸，不能用浓硫酸"
    }
  ]
}
```

### 4.5 副反应教学处理原则

#### 4.5.1 教学策略

1. **初学阶段**: 忽略次要副反应，专注主反应
2. **进阶阶段**: 引入主要副反应，讨论影响
3. **实验前**: 预告可能出现的副反应
4. **实验后**: 分析实验现象中的副反应影响

#### 4.5.2 常见处理方法

| 问题 | 处理方法 |
|------|----------|
| 产物不纯 | 提纯、分离 |
| 现象干扰 | 对照实验、空白实验 |
| 气体杂质 | 洗气装置 |
| 副产物抑制 | 控制反应条件 |

### 4.6 副反应数据库示例

以下是本知识库中包含副反应信息的方程式示例：

- **方程式6** (钠与水): 包含钠氧化、氢气燃烧等副反应
- **方程式61** (一氧化碳还原氧化铜): 包含CO燃烧、CO₂生成等副反应
- **方程式158** (氯气与水): 包含次氯酸分解的连串反应
- **方程式203** (乙炔与氢气加成): 包含分步加成的连串反应

---

## 5. K12化学方程式大全

### 4.1 置换反应

#### 4.1.1 金属与酸反应

**反应原理**: 金属 + 酸 → 盐 + 氢气

**发生条件**: 金属活动性 > 氢 (K > Ca > Na > Mg > Al > Zn > Fe > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au)

---

##### 方程式1: 锌与稀硫酸反应

```json
{
  "id": 1,
  "equationText": "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
  "equationHtml": "Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -152.5,
  "reactionRate": "fast",
  "oxidationChanges": [
    {"element": "Zn", "from": 0, "to": +2, "process": "氧化"},
    {"element": "H", "from": +1, "to": 0, "process": "还原"}
  ],
  "reactants": [
    {"substanceId": 1, "coefficient": 1, "state": "s", "formula": "Zn", "name": "锌"},
    {"substanceId": 30, "coefficient": 1, "state": "aq", "formula": "H₂SO₄", "name": "稀硫酸"}
  ],
  "products": [
    {"substanceId": 51, "coefficient": 1, "state": "aq", "formula": "ZnSO₄", "name": "硫酸锌"},
    {"substanceId": 20, "coefficient": 1, "state": "g", "formula": "H₂", "name": "氢气"}
  ],
  "conditions": {
    "temperature": "室温",
    "medium": "水溶液"
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触初期",
      "stageType": "initiation",
      "durationEstimate": "10-20秒",
      "phenomenaDescription": "锌粒放入稀硫酸中，表面开始产生细小气泡，溶液无明显变化",
      "colorChange": {
        "from": "无色透明+银灰色锌粒",
        "to": "无色透明+锌粒表面冒气泡"
      },
      "microscopicExplanation": "Zn原子开始失去电子成为Zn²⁺进入溶液，H⁺在锌表面得到电子生成H₂气泡"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "1-3分钟",
      "phenomenaDescription": "气泡持续大量产生，锌粒逐渐变小，试管壁发热，可听到嘶嘶声",
      "colorChange": {
        "from": "锌粒表面冒气泡",
        "to": "锌粒变小+溶液无色"
      },
      "microscopicExplanation": "Zn → Zn²⁺ + 2e⁻（氧化），2H⁺ + 2e⁻ → H₂↑（还原），反应持续进行，放热"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "锌粒完全溶解",
      "phenomenaDescription": "气泡产生逐渐减少直至停止，锌粒消失，溶液保持无色透明",
      "colorChange": {
        "from": "锌粒变小",
        "to": "无色溶液（含Zn²⁺）"
      },
      "microscopicExplanation": "Zn完全转化为Zn²⁺进入溶液，反应结束，可用点燃法检验氢气"
    }
  ],
  "teachingInfo": {
    "studentDescription": "锌是一种活泼金属，能与稀硫酸发生置换反应，生成硫酸锌和氢气。这个反应是放热反应，我们可以观察到锌粒表面产生气泡，试管壁发烫。",
    "teacherDescription": "本实验演示金属与酸的置换反应。重点引导学生观察：1) 气泡的产生；2) 温度的变化；3) 锌粒的溶解。可讨论反应速率与金属活泼性的关系。",
    "keyPoints": [
      "方程式：Zn + H₂SO₄ → ZnSO₄ + H₂↑",
      "置换反应：单质 + 化合物 → 新单质 + 新化合物",
      "反应放热，试管壁发烫",
      "氢气可燃，验纯后才能点燃",
      "金属活动性：Zn > H"
    ],
    "commonQuestions": [
      {"question": "为什么锌粒表面会产生气泡？", "answer": "因为反应生成了氢气，氢气不溶于水，以气泡形式逸出。"},
      {"question": "反应放热还是吸热？", "answer": "反应放热，用手触摸试管壁可以感觉到温度升高。"},
      {"question": "为什么需要验纯？", "answer": "氢气与空气混合可能爆炸，点燃前必须验纯。"}
    ],
    "commonMistakes": [
      {"mistake": "认为所有金属都能与酸反应", "correction": "只有金属活动性顺序表中氢之前的金属才能与酸反应置换出氢气"},
      {"mistake": "使用浓硫酸", "correction": "浓硫酸与锌反应不产生氢气，而是产生二氧化硫"}
    ],
    "safetyNotes": [
      "氢气易燃易爆，点燃前必须验纯",
      "稀硫酸有腐蚀性，避免皮肤接触",
      "实验应在通风良好处进行"
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色透明",
      "after": "无色透明",
      "description": "溶液颜色无明显变化"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "产生无色无味气泡",
      "gasProperties": "可燃，密度比空气小，是最轻的气体"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+15°C",
      "description": "反应放热，试管壁发烫"
    },
    "precipitate": {
      "hasPrecipitate": false
    },
    "description": "锌粒逐渐溶解，表面产生大量气泡，放出热量",
    "soundPhenomenon": "轻微的嘶嘶声",
    "observationPoints": [
      "观察锌粒表面是否产生气泡",
      "用手触摸试管壁感受温度变化",
      "注意气体放出的速度"
    ]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "反应初期",
      "stageType": "initiation",
      "durationEstimate": "5秒",
      "phenomenaDescription": "锌粒表面开始产生少量气泡",
      "microscopicExplanation": "Zn原子失去电子成为Zn²⁺进入溶液，H⁺获得电子成为H原子，两个H原子结合成H₂分子"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "20秒",
      "phenomenaDescription": "气泡产生速度加快，放出明显热量",
      "microscopicExplanation": "反应速率加快，大量H₂分子生成并聚集形成气泡，放热效应明显"
    },
    {
      "stageOrder": 3,
      "stageName": "反应后期",
      "stageType": "completion",
      "durationEstimate": "5秒",
      "phenomenaDescription": "锌粒完全溶解，气泡逐渐减少至停止",
      "microscopicExplanation": "反应物消耗完毕，反应终止"
    }
  ],
  "knowledgePoints": [
    "实验室制氢气的标准方法：锌粒与稀硫酸反应",
    "反应方程式：Zn + H₂SO₄ → ZnSO₄ + H₂↑",
    "离子方程式：Zn + 2H⁺ → Zn²⁺ + H₂↑",
    "反应类型：置换反应（金属单质 + 酸 → 盐 + 氢气）",
    "金属活动性：锌排在氢前面，能置换酸中的氢（Zn > H）",
    "为什么用锌：锌与稀硫酸反应速率适中，价格较低",
    "为什么用稀硫酸：浓硫酸有强氧化性，与锌反应生成SO₂而不是H₂",
    "为什么不用盐酸：盐酸易挥发，会使制得的H₂不纯",
    "反应装置：固液常温型（试管或锥形瓶）",
    "气体收集：排水法（H₂难溶于水）或向下排空气法（H₂密度最小）",
    "H₂验纯：点燃前必须验纯（小试管收集，管口向下移近火焰）",
    "实验现象：锌粒溶解，产生气泡，放热，试管壁发烫",
    "中考考点：实验室制氢气、置换反应、金属活动性",
    "高考考点：氧化还原分析、离子方程式书写"
  ]
}
```

**化学机理分析**:

1. **电子转移过程**:
   - Zn → Zn²⁺ + 2e⁻ (氧化，失去2个电子)
   - 2H⁺ + 2e⁻ → H₂ (还原，获得2个电子)

2. **热力学分析**:
   - ΔH = -152.5 kJ/mol (放热)
   - ΔG < 0 (自发进行)
   - 金属Zn的还原性比H₂强

3. **动力学因素**:
   - 锌的表面积越大，反应越快
   - 硫酸浓度越高，反应越快
   - 温度升高，反应速率加快

4. **微观过程**:
   - Zn表面Zn原子失去电子进入溶液
   - 电子转移到溶液中的H⁺
   - H⁺获得电子生成H原子
   - 两个H原子结合成H₂分子
   - H₂分子聚集形成气泡逸出

---

##### 方程式2: 铁与盐酸反应

```json
{
  "id": 2,
  "equationText": "Fe + 2HCl → FeCl₂ + H₂↑",
  "equationHtml": "Fe + 2HCl → FeCl<sub>2</sub> + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -89.0,
  "reactionRate": "moderate",
  "oxidationChanges": [
    {"element": "Fe", "from": 0, "to": +2, "process": "氧化"},
    {"element": "H", "from": +1, "to": 0, "process": "还原"}
  ],
  "reactants": [
    {"substanceId": 2, "coefficient": 1, "state": "s", "formula": "Fe", "name": "铁"},
    {"substanceId": 32, "coefficient": 2, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 66, "coefficient": 1, "state": "aq", "formula": "FeCl₂", "name": "氯化亚铁"},
    {"substanceId": 20, "coefficient": 1, "state": "g", "formula": "H₂", "name": "氢气"}
  ],
  "conditions": {
    "temperature": "室温",
    "medium": "水溶液"
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触初期",
      "stageType": "initiation",
      "durationEstimate": "10-30秒",
      "phenomenaDescription": "铁钉放入盐酸中，表面开始产生少量细小气泡",
      "colorChange": {
        "from": "银灰色铁+无色酸",
        "to": "铁表面冒少量气泡"
      },
      "microscopicExplanation": "Fe原子开始失去电子成为Fe²⁺进入溶液，H⁺在铁表面还原生成H₂"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "2-5分钟",
      "phenomenaDescription": "气泡持续产生，速率比锌慢，溶液逐渐变为浅绿色，铁钉表面变小",
      "colorChange": {
        "from": "无色溶液",
        "to": "浅绿色溶液",
        "intermediate": ["无色→淡绿→浅绿"]
      },
      "microscopicExplanation": "Fe → Fe²⁺ + 2e⁻，2H⁺ + 2e⁻ → H₂↑，Fe²⁺在溶液中呈浅绿色"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "铁基本溶解",
      "phenomenaDescription": "气泡产生逐渐减少，溶液呈浅绿色，铁钉明显变小或完全溶解",
      "colorChange": {
        "from": "浅绿色",
        "to": "稳定浅绿色溶液"
      },
      "microscopicExplanation": "Fe大部分转化为Fe²⁺，形成浅绿色的FeCl₂溶液"
    }
  ],
  "teachingInfo": {
    "studentDescription": "铁能与盐酸反应生成氯化亚铁和氢气。反应较温和，溶液逐渐变为浅绿色。",
    "teacherDescription": "演示铁与酸的置换反应。注意：铁生成+2价亚铁盐，溶液呈浅绿色。与锌反应对比速率差异。",
    "keyPoints": [
      "方程式：Fe + 2HCl → FeCl₂ + H₂↑",
      "亚铁离子Fe²⁺呈浅绿色",
      "铁在金属活动性顺序中位于氢之前",
      "反应速率比锌慢"
    ],
    "commonQuestions": [
      {"question": "溶液为什么变浅绿色？", "answer": "生成的Fe²⁺离子在水溶液中呈浅绿色。"},
      {"question": "为什么不用硝酸？", "answer": "硝酸有强氧化性，与铁反应不产生氢气。"}
    ],
    "commonMistakes": [
      {"mistake": "认为生成氯化铁FeCl₃", "correction": "铁与盐酸反应生成+2价的亚铁盐FeCl₂，不是+3价的铁盐"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色",
      "after": "浅绿色",
      "description": "溶液逐渐变为浅绿色"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "产生气泡，速度较慢"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+10°C",
      "description": "放热，但不明显"
    }
  },
  "knowledgePoints": [
    "铁与盐酸的反应是金属与酸反应的典型代表，体现了铁的金属活动性和变价特征",
    "反应方程式：Fe + 2HCl → FeCl₂ + H₂↑",
    "离子方程式：Fe + 2H⁺ → Fe²⁺ + H₂↑",
    "反应类型：置换反应（金属 + 酸 → 盐 + 氢气），也是氧化还原反应",
    "金属活动性：铁排在氢前面（Fe > H），能置换酸中的氢",
    "铁的变价特征：铁在置换反应中生成+2价亚铁盐（Fe²⁺），不是+3价铁盐（Fe³⁺）",
    "为什么生成Fe²⁺：HCl不是强氧化剂，只能将Fe氧化到+2价；强氧化剂（如HNO₃、Cl₂）才能将Fe氧化到+3价",
    "亚铁离子颜色：Fe²⁺在水溶液中呈浅绿色，这是鉴别亚铁盐的重要特征",
    "实验现象：铁钉逐渐溶解，产生气泡，溶液由无色逐渐变为浅绿色",
    "反应速率：铁与盐酸反应速率比镁慢、比锌略慢，属于中等速率",
    "放热反应：ΔH = -89.0 kJ/mol，反应放热但不如镁和锌明显",
    "中考考点：①金属活动性顺序 ②置换反应 ③铁的变价 ④实验现象描述 ⑤离子方程式书写",
    "高考考点：①氧化还原反应分析 ②Fe²⁺与Fe³⁺的转化 ③离子方程式书写 ④金属与酸反应规律",
    "常见错误：误认为生成FeCl₃（正确是FeCl₂）；忽略溶液的浅绿色现象",
    "实验安全：盐酸有腐蚀性，避免皮肤接触；氢气易燃，注意防火",
    "实际应用：①实验室制取少量氢气 ②制备氯化亚铁溶液 ③金属除锈"
  ]
}
```

**关键教学点**:

1. **Fe²⁺的颜色**: Fe²⁺在水溶液中呈现特征的浅绿色，这是鉴别亚铁盐的重要依据。

2. **为什么生成Fe²⁺而非Fe³⁺**:
   - HCl不是强氧化剂，只能将Fe氧化到+2价
   - 强氧化剂(如HNO₃、Cl₂)才能将Fe氧化到+3价

3. **反应速率对比**:
   - Mg > Zn > Fe > (H)
   - 反应速率与金属活泼性正相关

---

##### 方程式3: 镁与稀硫酸反应

```json
{
  "id": 3,
  "equationText": "Mg + H₂SO₄ → MgSO₄ + H₂↑",
  "equationHtml": "Mg + H<sub>2</sub>SO<sub>4</sub> → MgSO<sub>4</sub> + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -466.0,
  "reactionRate": "very_fast",
  "oxidationChanges": [
    {"element": "Mg", "from": 0, "to": +2, "process": "氧化"},
    {"element": "H", "from": +1, "to": 0, "process": "还原"}
  ],
  "reactants": [
    {"substanceId": 4, "coefficient": 1, "state": "s", "formula": "Mg", "name": "镁"},
    {"substanceId": 30, "coefficient": 1, "state": "aq", "formula": "H₂SO₄", "name": "稀硫酸"}
  ],
  "products": [
    {"substanceId": 86, "coefficient": 1, "state": "aq", "formula": "MgSO₄", "name": "硫酸镁"},
    {"substanceId": 20, "coefficient": 1, "state": "g", "formula": "H₂", "name": "氢气"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触瞬间",
      "stageType": "initiation",
      "durationEstimate": "5-10秒",
      "phenomenaDescription": "镁条放入稀硫酸，立即剧烈产生气泡，反应迅速",
      "colorChange": {
        "from": "银白色镁+无色酸",
        "to": "镁表面剧烈冒泡"
      },
      "microscopicExplanation": "Mg → Mg²⁺ + 2e⁻，2H⁺ + 2e⁻ → H₂↑，镁非常活泼，反应迅速"
    },
    {
      "stageOrder": 2,
      "stageName": "剧烈反应",
      "stageType": "propagation",
      "durationEstimate": "30秒-2分钟",
      "phenomenaDescription": "气泡大量产生，镁条迅速溶解，试管壁发热明显",
      "colorChange": {
        "from": "冒泡镁条",
        "to": "镁条迅速变小+无色溶液"
      },
      "microscopicExplanation": "Mg持续转化为Mg²⁺，反应放热显著，温度升高"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "镁完全溶解",
      "phenomenaDescription": "气泡停止产生，镁条完全消失，溶液呈无色",
      "colorChange": {
        "from": "镁条变小",
        "to": "无色MgSO₄溶液"
      },
      "microscopicExplanation": "Mg完全转化为Mg²⁺进入溶液，反应结束"
    }
  ],
  "teachingInfo": {
    "studentDescription": "镁与稀硫酸反应非常剧烈，迅速产生大量气泡并放出大量热。",
    "teacherDescription": "演示活泼金属与酸的反应。镁比锌更活泼，反应更快。注意控制用量。",
    "keyPoints": [
      "方程式：Mg + H₂SO₄ → MgSO₄ + H₂↑",
      "镁比锌更活泼，反应更快",
      "反应剧烈放热"
    ],
    "commonQuestions": [
      {"question": "为什么镁反应比锌快？", "answer": "镁比锌更活泼，失去电子能力更强。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色",
      "after": "无色",
      "description": "溶液颜色无变化"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "剧烈产生气泡"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+25°C",
      "description": "剧烈放热"
    }
  },
  "knowledgePoints": [
    "镁与稀硫酸的反应展示了活泼金属与酸的剧烈反应，放热效应最明显",
    "反应方程式：Mg + H₂SO₄ → MgSO₄ + H₂↑",
    "离子方程式：Mg + 2H⁺ → Mg²⁺ + H₂↑",
    "反应类型：置换反应（金属 + 酸 → 盐 + 氢气），也是氧化还原反应、放热反应",
    "金属活动性：镁是非常活泼的金属，排在氢前面（Mg > H），能迅速置换酸中的氢",
    "反应速率：在常见金属与酸反应中速率最快（Mg > Zn > Fe），反应非常剧烈",
    "放热效应：ΔH = -466.0 kJ/mol，放热量最大，试管壁明显发烫",
    "实验现象：镁条迅速溶解，剧烈产生大量气泡，放出大量热，溶液保持无色",
    "镁离子的颜色：Mg²⁺在水溶液中无色，与Fe²⁺的浅绿色、Cu²⁺的蓝色形成对比",
    "为什么不能用浓硫酸：浓硫酸有强氧化性，与镁反应生成SO₂而不是H₂，且会使镁表面钝化",
    "为什么不用硝酸：硝酸有强氧化性，与镁反应不产生氢气，可能生成氮的氧化物",
    "中考考点：①金属活动性顺序 ②置换反应 ③实验现象 ④反应速率比较",
    "高考考点：①氧化还原反应分析 ②反应速率与金属活泼性关系 ③放热反应",
    "安全注意事项：反应非常剧烈，镁条用量要少，防止反应过快溅出酸液",
    "实际应用：①实验室制氢气（快速制法） ②镁作为牺牲阳极防锈 ③照明弹原料",
    "对比教学：Mg > Zn > Fe，金属越活泼，与酸反应越剧烈，放热越多"
  ]
}
```

**教学重点**:

1. **金属活动性对比**: Mg > Zn > Fe，反应速率依次降低
2. **放热效应**: 镁反应放热量最大(ΔH = -466.0 kJ/mol)
3. **实验安全**: 反应剧烈，需要控制镁的用量

---

#### 4.1.2 金属与盐溶液反应

**反应原理**: 金属₁ + 盐₂ → 盐₁ + 金属₂

**发生条件**: 金属₁的活动性 > 金属₂的活动性

---

##### 方程式4: 锌与硫酸亚铁反应

```json
{
  "id": 30,
  "equationText": "Zn + FeSO₄ → Fe + ZnSO₄",
  "equationHtml": "Zn + FeSO<sub>4</sub> → Fe + ZnSO<sub>4</sub>",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -230.0,
  "reactionRate": "moderate",
  "oxidationChanges": [
    {"element": "Zn", "from": 0, "to": +2, "process": "氧化"},
    {"element": "Fe", "from": "+2", "to": 0, "process": "还原"}
  ],
  "reactants": [
    {"substanceId": 1, "coefficient": 1, "state": "s", "formula": "Zn", "name": "锌"},
    {"substanceId": 52, "coefficient": 1, "state": "aq", "formula": "FeSO₄", "name": "硫酸亚铁"}
  ],
  "products": [
    {"substanceId": 2, "coefficient": 1, "state": "s", "formula": "Fe", "name": "铁"},
    {"substanceId": 51, "coefficient": 1, "state": "aq", "formula": "ZnSO₄", "name": "硫酸锌"}
  ],
  "teachingInfo": {
    "studentDescription": "锌比铁活泼，能把铁从硫酸亚铁溶液中置换出来。溶液颜色由浅绿色逐渐变为无色。",
    "teacherDescription": "金属活动性顺序的应用。活动性强的金属能把活动性弱的金属从其盐溶液中置换出来。",
    "keyPoints": [
      "方程式：Zn + FeSO₄ → Fe + ZnSO₄",
      "金属活动性：Zn > Fe",
      "溶液由浅绿色变为无色",
      "铁单质析出"
    ],
    "commonQuestions": [
      {"question": "为什么溶液颜色会变化？", "answer": "浅绿色的Fe²⁺被消耗，生成无色的Zn²⁺。"},
      {"question": "铁能否置换锌？", "answer": "不能，因为铁比锌不活泼。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "浅绿色",
      "after": "无色",
      "description": "溶液颜色逐渐变浅，最后变为无色"
    },
    "precipitate": {
      "hasPrecipitate": false
    },
    "observationPoints": [
      "观察溶液颜色变化",
      "观察锌表面变化",
      "观察铁的析出"
    ]
  },
  "knowledgePoints": [
    "锌与硫酸亚铁的反应是金属与盐溶液置换反应的典型代表",
    "反应方程式：Zn + FeSO₄ → Fe + ZnSO₄",
    "离子方程式：Zn + Fe²⁺ → Zn²⁺ + Fe",
    "反应类型：置换反应（金属₁ + 盐₂ → 盐₁ + 金属₂），也是氧化还原反应",
    "反应条件：金属活动性强的金属能把活动性弱的金属从其盐溶液中置换出来",
    "金属活动性：Zn > Fe，锌比铁活泼，能将铁从亚铁盐溶液中置换出来",
    "反应方向判断：根据金属活动性顺序表判断反应能否进行，活动性强的置换活动性弱的",
    "氧化还原分析：Zn从0价升至+2价（失电子被氧化），Fe²⁺从+2价降至0价（得电子被还原）",
    "实验现象：锌表面逐渐覆盖一层红色物质（铁析出），浅绿色溶液逐渐变为无色",
    "颜色变化原理：浅绿色的Fe²⁺被消耗，生成无色的Zn²⁺，故溶液颜色由浅绿变无色",
    "铁的析出形态：铁以固体形式在锌表面析出，形成疏松的红褐色固体层",
    "中考考点：①金属活动性顺序 ②置换反应 ③溶液颜色变化 ④反应方向判断",
    "高考考点：①金属活动性应用 ②氧化还原反应分析 ③离子方程式书写 ④原电池原理",
    "常见错误：认为铁能置换锌（错误，因为Fe < Zn）；忽略溶液颜色的渐变过程",
    "实验要点：观察锌表面变化（铁析出）、溶液颜色变化（浅绿→无色）、固体析出现象",
    "实际应用：①湿法冶金（金属提炼） ②金属镀层 ③废水处理（回收重金属）",
    "对比反应：Zn + CuSO₄ → Cu + ZnSO₄（蓝色溶液变无色，铜析出），原理相同",
    "金属活动性顺序表应用：K > Ca > Na > Mg > Al > Zn > Fe > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au"
  ]
}
```

**核心概念**:

1. **金属活动性顺序**: K > Ca > Na > Mg > Al > Zn > Fe > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au

2. **反应方向判断**:
   - 活泼金属可以置换不活泼金属
   - Zn可以置换Fe，Fe不能置换Zn

3. **颜色变化原理**: Fe²⁺(浅绿色) → Zn²⁺(无色)

---

##### 方程式5: 锌与硫酸铜反应

```json
{
  "id": 31,
  "equationText": "Zn + CuSO₄ → Cu + ZnSO₄",
  "equationHtml": "Zn + CuSO<sub>4</sub> → Cu + ZnSO<sub>4</sub>",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -216.0,
  "reactionRate": "moderate",
  "oxidationChanges": [
    {"element": "Zn", "from": 0, "to": +2, "process": "氧化"},
    {"element": "Cu", "from": "+2", "to": 0, "process": "还原"}
  ],
  "reactants": [
    {"substanceId": 1, "coefficient": 1, "state": "s", "formula": "Zn", "name": "锌"},
    {"substanceId": 53, "coefficient": 1, "state": "aq", "formula": "CuSO₄", "name": "硫酸铜"}
  ],
  "products": [
    {"substanceId": 6, "coefficient": 1, "state": "s", "formula": "Cu", "name": "铜"},
    {"substanceId": 51, "coefficient": 1, "state": "aq", "formula": "ZnSO₄", "name": "硫酸锌"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触初期",
      "stageType": "initiation",
      "durationEstimate": "5-10秒",
      "phenomenaDescription": "锌粒放入蓝色硫酸铜溶液，锌表面开始出现少量红色物质",
      "colorChange": {
        "from": "蓝色溶液+银灰色锌",
        "to": "蓝色+锌表面出现红色斑点"
      },
      "microscopicExplanation": "Zn原子开始失去电子成为Zn²⁺，Cu²⁺在锌表面得到电子还原为Cu原子"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "1-3分钟",
      "phenomenaDescription": "锌表面红色物质逐渐增多，溶液蓝色逐渐变浅，锌粒逐渐变小",
      "colorChange": {
        "from": "蓝色溶液",
        "to": "浅蓝色→无色溶液",
        "intermediate": ["深蓝→蓝→浅蓝→淡蓝→无色"]
      },
      "microscopicExplanation": "Zn → Zn²⁺ + 2e⁻（氧化），Cu²⁺ + 2e⁻ → Cu（还原），Cu原子在锌表面沉积"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "锌基本消耗完",
      "phenomenaDescription": "锌表面完全覆盖红色铜层，溶液变为无色，锌粒消失",
      "colorChange": {
        "from": "淡蓝色",
        "to": "无色溶液+红色固体"
      },
      "microscopicExplanation": "Zn完全转化为Zn²⁺，Cu²⁺完全还原为Cu，形成无色ZnSO₄溶液"
    }
  ],
  "teachingInfo": {
    "studentDescription": "锌能从硫酸铜溶液中置换出铜。锌表面覆盖一层红色物质，蓝色溶液逐渐变为无色。",
    "teacherDescription": "经典的金属置换反应实验。现象明显，适合演示。",
    "keyPoints": [
      "方程式：Zn + CuSO₄ → Cu + ZnSO₄",
      "金属活动性：Zn > Cu",
      "溶液由蓝色变为无色",
      "锌表面析出红色铜"
    ],
    "commonQuestions": [
      {"question": "溶液为什么是蓝色的？", "answer": "Cu²⁺在水溶液中呈蓝色。"},
      {"question": "锌表面为什么变红？", "answer": "被置换出的铜覆盖在锌表面。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "蓝色",
      "after": "无色",
      "description": "蓝色溶液逐渐变为无色"
    },
    "observationPoints": [
      "观察溶液颜色变化",
      "观察锌表面红色物质析出"
    ]
  },
  "knowledgePoints": [
    "金属活动性顺序表（K Ca Na Mg Al Zn Fe Sn Pb (H) Cu Hg Ag Pt Au）",
    "金属与盐溶液的置换反应条件和规律",
    "铜离子Cu²⁺在水溶液中呈蓝色的特征",
    "置换反应中电子转移的过程（氧化还原反应）",
    "反应方向判断：活泼金属置换不活泼金属",
    "实验现象与微观变化的对应关系",
    "溶液颜色变化与离子浓度的关系",
    "金属镀层的形成原理"
  ]
}
```

**实验特点**:

1. **现象明显**: 蓝色→无色，银白色→红色
2. **适合演示**: 反应速率适中，现象清晰
3. **教学价值**: 验证金属活动性顺序

---

#### 4.1.3 金属与水反应

##### 方程式6: 钠与水反应

```json
{
  "id": 80,
  "equationText": "2Na + 2H₂O → 2NaOH + H₂↑",
  "equationHtml": "2Na + 2H<sub>2</sub>O → 2NaOH + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -368.0,
  "reactionRate": "very_fast",
  "oxidationChanges": [
    {"element": "Na", "from": 0, "to": "+1", "process": "氧化"},
    {"element": "H", "from": "+1", "to": 0, "process": "还原"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 216,
      "secondaryEquationText": "4Na + O₂ → 2Na₂O",
      "secondaryEquationHtml": "4Na + O<sub>2</sub> → 2Na<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.6,
      "triggerCondition": {
        "oxygenPresent": true,
        "otherCondition": "钠表面暴露在空气中"
      },
      "phenomenonImpact": {
        "description": "钠表面形成氧化层，影响反应速率"
      },
      "suppressionMethod": "使用保存在煤油中的新鲜钠",
      "isCommonStudentError": true,
      "teachingNote": "提醒学生钠表面常有氧化层，切开看到银白色光泽是金属钠"
    },
    {
      "secondaryEquationId": 7,
      "secondaryEquationText": "2H₂ + O₂ → 2H₂O",
      "secondaryEquationHtml": "2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O",
      "relationship": "chain",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "oxygenPresent": true,
        "temperature": "高温"
      },
      "phenomenonImpact": {
        "description": "氢气燃烧产生黄色火焰，误认为是钠焰色"
      },
      "isCommonStudentError": true,
      "teachingNote": "黄色火焰是钠的杂质或玻璃中钠元素的颜色，纯净钠燃烧是黄色"
    },
    {
      "secondaryEquationId": 217,
      "secondaryEquationText": "2Na + O₂ → Na₂O₂",
      "secondaryEquationHtml": "2Na + O<sub>2</sub> → Na<sub>2</sub>O<sub>2</sub>",
      "relationship": "parallel",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "oxygenPresent": true,
        "temperature": "燃烧"
      },
      "phenomenonImpact": {
        "description": "空气中燃烧主要生成过氧化钠"
      },
      "teachingNote": "钠在空气中燃烧生成Na₂O₂而非Na₂O"
    }
  ],
  "reactants": [
    {"substanceId": 3, "coefficient": 2, "state": "s", "formula": "Na", "name": "钠"},
    {"substanceId": 70, "coefficient": 2, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "products": [
    {"substanceId": 40, "coefficient": 2, "state": "aq", "formula": "NaOH", "name": "氢氧化钠"},
    {"substanceId": 20, "coefficient": 1, "state": "g", "formula": "H₂", "name": "氢气"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触水面",
      "stageType": "initiation",
      "durationEstimate": "瞬间",
      "phenomenaDescription": "钠块投入水中，立即浮在水面，开始剧烈反应，发出嘶嘶声",
      "colorChange": {
        "from": "银白色钠+无色水",
        "to": "银白色小球在水面上游动"
      },
      "microscopicExplanation": "Na密度小于水浮在水面，2Na + 2H₂O → 2NaOH + H₂↑，反应剧烈放热"
    },
    {
      "stageOrder": 2,
      "stageName": "熔化与反应",
      "stageType": "propagation",
      "durationEstimate": "几秒至十几秒",
      "phenomenaDescription": "钠熔化成银白色小球，在水面上无规则游动，产生大量气泡，可能产生黄色火焰",
      "colorChange": {
        "from": "银白色固体",
        "to": "银白色液体小球+黄色火焰"
      },
      "microscopicExplanation": "反应放热使Na熔化（熔点97.8℃），H₂气体推动小球游动，高温下H₂可能燃烧"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "钠完全消耗",
      "phenomenaDescription": "小球消失，溶液澄清，加酚酞变红色",
      "colorChange": {
        "from": "小球游动",
        "to": "无色溶液+酚酞变红"
      },
      "microscopicExplanation": "Na完全转化为NaOH，溶液呈碱性，酚酞指示剂变红"
    }
  ],
  "teachingInfo": {
    "studentDescription": "钠与水剧烈反应，产生氢气，放出大量热，使钠熔化成小球在水面上游动。",
    "teacherDescription": "演示活泼金属与水的反应。注意安全：钠粒要小，反应时远离。酚酞指示剂变红证明生成碱性物质。",
    "keyPoints": [
      "方程式：2Na + 2H₂O → 2NaOH + H₂↑",
      "浮（密度小于水）",
      "熔（放热使钠熔化）",
      "游（气体推动）",
      "响（剧烈反应）",
      "红（酚酞变红）"
    ],
    "commonQuestions": [
      {"question": "钠为什么会熔化？", "answer": "反应放出大量热，钠的熔点低（97.8°C），所以会熔化。"},
      {"question": "为什么钠会游动？", "answer": "产生的气体推动钠小球在水面上游动。"}
    ],
    "safetyNotes": [
      "钠非常活泼，取用要小心",
      "钠粒要小（绿豆大小）",
      "反应时保持距离",
      "佩戴护目镜"
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色（或酚酞无色）",
      "after": "红色（酚酞）",
      "description": "溶液遇酚酞变红"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "剧烈产生气泡"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+50°C",
      "description": "剧烈放热"
    },
    "soundPhenomenon": "嘶嘶声",
    "observationPoints": [
      "观察钠是否浮在水面",
      "观察是否熔化成小球",
      "观察游动和响声",
      "加酚酞观察颜色"
    ]
  },
  "knowledgePoints": [
    "钠是活泼金属，金属活动性顺序表中排在前三位（K Ca Na Mg Al）",
    "反应方程式：2Na + 2H₂O → 2NaOH + H₂↑",
    "氧化还原分析：Na从0价升至+1价（失电子被氧化），H从+1价降至0价（得电子被还原）",
    "实验现象口诀：浮熔游响红（五个字概括全部现象）",
    "浮：钠密度0.97g/cm³小于水（1g/cm³），浮在水面上",
    "熔：反应剧烈放热，钠熔点低（97.8℃），熔化成银白色小球",
    "游：产生的H₂气体推动钠小球在水面上无规则游动",
    "响：反应剧烈，产生嘶嘶响声，可能伴有爆炸声",
    "红：生成碱性NaOH溶液，酚酞指示剂变红",
    "离子方程式：2Na + 2H₂O → 2Na⁺ + 2OH⁻ + H₂↑",
    "实验安全：钠粒要小（绿豆大小），佩戴护目镜，保持距离",
    "钠的保存：保存在煤油中（隔绝空气和水）",
    "中考考点：金属活动性、现象描述、化学方程式书写",
    "高考考点：氧化还原分析、实验现象与微观解释"
  ]
}
```

**现象总结（浮熔游响红）**:

| 现象 | 原因 |
|------|------|
| 浮 | 钠密度(0.97g/cm³)小于水 |
| 熔 | 反应放热，钠熔点低(97.8°C) |
| 游 | 氢气推动钠球游动 |
| 响 | 剧烈反应产生声音 |
| 红 | 生成NaOH，酚酞变红 |

---

### 4.2 化合反应

#### 4.2.1 单质化合

##### 方程式7: 氢气燃烧

```json
{
  "id": 70,
  "equationText": "2H₂ + O₂ → 2H₂O",
  "equationHtml": "2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "isCombination": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -571.6,
  "reactionRate": "instant",
  "oxidationChanges": [
    {"element": "H", "from": 0, "to": "+1", "process": "氧化"},
    {"element": "O", "from": 0, "to": "-2", "process": "还原"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 226,
      "secondaryEquationText": "2H₂ + O₂ → 2H₂O (爆炸)",
      "secondaryEquationHtml": "2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O (爆炸)",
      "relationship": "parallel",
      "triggerProbability": 0.9,
      "triggerCondition": {
        "hydrogenImpure": true,
        "oxygenPresent": true
      },
      "phenomenonImpact": {
        "description": "氢气与空气混合点燃可能发生爆炸"
      },
      "suppressionMethod": "点燃前必须验纯",
      "isCommonStudentError": true,
      "teachingNote": "强调验纯的重要性，这是氢气实验最关键的安全点"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "点燃瞬间",
      "stageType": "initiation",
      "durationEstimate": "瞬间",
      "phenomenaDescription": "氢气被点燃，产生淡蓝色火焰，开始剧烈放热",
      "colorChange": {
        "from": "无色气体",
        "to": "淡蓝色火焰"
      },
      "microscopicExplanation": "H₂分子与O₂分子达到着火点，化学键断裂重组，2H₂ + O₂ → 2H₂O"
    },
    {
      "stageOrder": 2,
      "stageName": "稳定燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续至燃料耗尽",
      "phenomenaDescription": "淡蓝色火焰稳定燃烧，上方冷烧杯内壁出现水珠",
      "colorChange": {
        "from": "淡蓝色火焰",
        "to": "淡蓝色火焰+水雾"
      },
      "microscopicExplanation": "氢气持续与氧气反应，生成水蒸气，水蒸气冷凝成液态水滴"
    },
    {
      "stageOrder": 3,
      "stageName": "熄灭",
      "stageType": "completion",
      "durationEstimate": "燃料耗尽或关闭气源",
      "phenomenaDescription": "火焰熄灭，可观察到烧杯内壁有水珠附着",
      "colorChange": {
        "from": "淡蓝色火焰",
        "to": "无"
      },
      "microscopicExplanation": "燃料停止供应，反应终止，水蒸气完全冷凝为液态水"
    }
  ],
  "reactants": [
    {"substanceId": 20, "coefficient": 2, "state": "g", "formula": "H₂", "name": "氢气"},
    {"substanceId": 21, "coefficient": 1, "state": "g", "formula": "O₂", "name": "氧气"}
  ],
  "products": [
    {"substanceId": 70, "coefficient": 2, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "conditions": {
    "temperature": "点燃"
  },
  "teachingInfo": {
    "studentDescription": "氢气在氧气中燃烧，产生淡蓝色火焰，生成水。这是最清洁的燃料。",
    "teacherDescription": "氢能源的应用演示。强调点燃前必须验纯。",
    "keyPoints": [
      "方程式：2H₂ + O₂ → 2H₂O",
      "淡蓝色火焰",
      "产物只有水，清洁能源",
      "点燃前必须验纯"
    ],
    "commonQuestions": [
      {"question": "火焰是什么颜色？", "answer": "在空气中燃烧是淡蓝色火焰，玻璃导管可能使火焰呈黄色。"},
      {"question": "为什么是最清洁的燃料？", "answer": "燃烧产物只有水，不产生二氧化碳等污染物。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色",
      "after": "无色（可能产生水雾）",
      "description": "可能观察到水雾"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+1000°C",
      "description": "高温火焰"
    },
    "observationPoints": [
      "观察火焰颜色",
      "观察烧杯内壁水珠"
    ]
  },
  "knowledgePoints": [
    "氢气的物理性质（无色无味气体，密度最小）",
    "氢气的可燃性和燃烧产物（只有水）",
    "氢能源作为清洁能源的优势和应用前景",
    "燃烧的三要素（可燃物、助燃物、着火点）",
    "氢气验纯的方法和重要性（小试管收集、拇指堵住管口、移近火焰）",
    "爆炸极限的概念（氢气爆炸极限4%-74.2%）",
    "水的组成的验证实验（氢气燃烧生成水）",
    "燃烧反应的能量变化（放热反应）",
    "氧化还原反应中的电子转移（H失去电子，O得到电子）",
    "实验安全操作规范"
  ]
}
```

**燃烧三要素**:
1. 可燃物 (H₂)
2. 助燃物 (O₂)
3. 达到着火点 (点燃)

**安全要点**:
- 氢气爆炸极限: 4%-74.2%
- 点燃前必须验纯

---

##### 方程式8: 铁在氧气中燃烧

```json
{
  "equationText": "3Fe + 2O₂ → Fe₃O₄",
  "equationHtml": "3Fe + 2O<sub>2</sub> → Fe<sub>3</sub>O<sub>4</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -1118.0,
  "conditions": {
    "temperature": "点燃"
  },
  "secondaryReactions": [
    {
      "secondaryEquationId": 228,
      "secondaryEquationText": "4Fe + 3O₂ → 2Fe₂O₃",
      "secondaryEquationHtml": "4Fe + 3O<sub>2</sub> → 2Fe<sub>2</sub>O<sub>3</sub>",
      "relationship": "parallel",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "oxygenSource": "空气",
        "temperature": "点燃"
      },
      "phenomenonImpact": {
        "description": "在空气中燃烧生成Fe₂O₃和Fe₃O₄的混合物"
      },
      "teachingNote": "纯氧中主要生成Fe₃O₄，空气中主要生成Fe₂O₃"
    },
    {
      "secondaryEquationId": 20,
      "secondaryEquationText": "4Fe + 3O₂ + 2nH₂O → 2Fe₂O₃·nH₂O",
      "secondaryEquationHtml": "4Fe + 3O<sub>2</sub> + 2nH<sub>2</sub>O → 2Fe<sub>2</sub>O<sub>3</sub>·nH<sub>2</sub>O",
      "relationship": "side",
      "triggerProbability": 0.7,
      "triggerCondition": {
        "moisturePresent": true,
        "oxygenPresent": true
      },
      "phenomenonImpact": {
        "description": "铁生锈是缓慢氧化，生成铁锈（氧化铁水合物）"
      },
      "teachingNote": "这是铁生锈的原理，区别于燃烧反应",
      "isCommonStudentError": true
    }
  ],
  "teachingInfo": {
    "studentDescription": "铁丝在氧气中剧烈燃烧，火星四射，生成黑色固体。",
    "teacherDescription": "演示金属在氧气中的燃烧。注意：铁丝要绕成螺旋状，下端系火柴，伸入集气瓶中央。",
    "keyPoints": [
      "方程式：3Fe + 2O₂ → Fe₃O₄",
      "剧烈燃烧，火星四射",
      "生成黑色固体Fe₃O₄",
      "放热反应"
    ],
    "safetyNotes": [
      "集气瓶底部放少量水或细沙",
      "防止高温熔融物溅落炸裂瓶底"
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "银白色",
      "after": "黑色",
      "description": "生成黑色固体"
    },
    "temperatureChange": {
      "isExothermic": true,
      "description": "剧烈放热，火星四射"
    }
  },
  "knowledgePoints": [
    "铁丝在氧气中燃烧的实验：剧烈燃烧，火星四射，放出大量热",
    "反应方程式：3Fe + 2O₂ → Fe₃O₄（四氧化三铁）",
    "反应条件：必须在纯氧中点燃，铁丝在空气中不能燃烧",
    "实验现象：剧烈燃烧，火星四射，放出热量，生成黑色固体",
    "产物分析：Fe₃O₄是一种复杂的氧化物，可以看作FeO·Fe₂O₃",
    "实验注意事项：集气瓶底部放少量水或细沙，防止高温熔融物溅落炸裂瓶底",
    "铁丝处理：铁丝绕成螺旋状增大受热面积，下端系火柴引燃",
    "火星四射的原因：铁丝中含少量碳元素，燃烧时碳火星飞溅",
    "与铁生锈的区别：燃烧是剧烈氧化，生锈是缓慢氧化",
    "中考考点：实验现象描述、方程式书写、实验安全注意事项",
    "高考考点：氧化还原反应分析、产物组成分析"
  ]
}
```

**实验要点**:
1. 铁丝绕成螺旋状（增大受热面积）
2. 下端系火柴（引燃）
3. 集气瓶底部放水或沙（防止炸裂）

---

#### 4.2.2 化合物化合

##### 方程式9: 二氧化碳与水反应

```json
{
  "equationText": "CO₂ + H₂O → H₂CO₃",
  "equationHtml": "CO<sub>2</sub> + H<sub>2</sub>O → H<sub>2</sub>CO<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "difficultyLevel": "middle_school",
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "气体溶解",
      "stageType": "mixing",
      "durationEstimate": "10-30秒",
      "phenomenaDescription": "CO₂气体通入水中，产生气泡，部分气体溶解，溶液仍为无色",
      "colorChange": {
        "from": "无色水",
        "to": "无色水（有CO₂溶解）"
      },
      "microscopicExplanation": "CO₂分子扩散进入水中，通过物理溶解形成CO₂(aq)"
    },
    {
      "stageOrder": 2,
      "stageName": "碳酸形成",
      "stageType": "propagation",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "加入紫色石蕊试液后，溶液逐渐由紫色变为红色，pH值下降至约4-5",
      "colorChange": {
        "from": "紫色石蕊试液",
        "to": "红色溶液"
      },
      "microscopicExplanation": "CO₂ + H₂O ⇌ H₂CO₃，溶解的CO₂与水反应生成碳酸(H₂CO₃)，碳酸电离产生H⁺使石蕊变红"
    },
    {
      "stageOrder": 3,
      "stageName": "受热分解",
      "stageType": "completion",
      "durationEstimate": "加热2-3分钟",
      "phenomenaDescription": "加热后红色溶液逐渐变回紫色，产生气泡（CO₂）",
      "colorChange": {
        "from": "红色溶液",
        "to": "紫色溶液"
      },
      "microscopicExplanation": "H₂CO₃ → CO₂↑ + H₂O，碳酸不稳定受热分解，CO₂逸出，H⁺浓度降低，石蕊恢复紫色"
    }
  ],
  "teachingInfo": {
    "studentDescription": "二氧化碳溶于水生成碳酸，使紫色石蕊试液变红。",
    "teacherDescription": "酸性氧化物的性质。碳酸不稳定，受热易分解。",
    "keyPoints": [
      "CO₂是酸性氧化物",
      "与水反应生成酸",
      "石蕊变红"
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "紫色",
      "after": "红色",
      "description": "石蕊试液由紫色变红"
    }
  }
}
```

---

### 4.3 分解反应

#### 4.3.1 实验室制氧气

##### 方程式10: 过氧化氢分解

```json
{
  "id": 60,
  "equationText": "2H₂O₂ → 2H₂O + O₂↑",
  "equationHtml": "2H<sub>2</sub>O<sub>2</sub> → 2H<sub>2</sub>O + O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -196.0,
  "reactionRate": "very_fast",
  "conditions": {
    "catalyst": "MnO₂"
  },
  "teachingInfo": {
    "studentDescription": "过氧化氢（双氧水）在二氧化锰催化下迅速分解，产生大量氧气气泡。",
    "teacherDescription": "实验室制取氧气的方法之一。MnO₂是催化剂，反应前后质量和化学性质不变。",
    "keyPoints": [
      "方程式：2H₂O₂ → 2H₂O + O₂↑",
      "分解反应",
      "MnO₂作催化剂",
      "实验室制氧气"
    ],
    "commonQuestions": [
      {"question": "为什么需要催化剂？", "answer": "不加催化剂反应很慢，MnO₂能显著加快反应速率。"},
      {"question": "MnO₂会消耗吗？", "answer": "不会，催化剂在反应前后质量和化学性质都不变。"}
    ]
  },
  "phenomena": {
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "产生大量气泡",
      "gasProperties": "氧气，能助燃"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+10°C",
      "description": "放热"
    }
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "加入催化剂",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "黑色MnO₂粉末加入无色H₂O₂溶液中，立即产生细小气泡",
      "colorChange": {
        "from": "无色透明液体",
        "to": "黑色粉末+液体表面冒气泡"
      },
      "microscopicExplanation": "H₂O₂分子在MnO₂表面吸附，O-O键断裂：H₂O₂ → H₂O + [O]，活性氧原子结合生成O₂"
    },
    {
      "stageOrder": 2,
      "stageName": "剧烈分解",
      "stageType": "propagation",
      "durationEstimate": "持续几分钟",
      "phenomenaDescription": "产生大量气泡，气泡上升到液面破裂，放出氧气，溶液温度略有升高",
      "colorChange": {
        "from": "气泡产生中",
        "to": "大量气泡+溶液轻微发热"
      },
      "microscopicExplanation": "2H₂O₂ → 2H₂O + O₂↑，MnO₂提供反应表面，降低活化能，反应加速进行"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "H₂O₂分解完后",
      "phenomenaDescription": "气泡产生逐渐减少直至停止，黑色MnO₂粉末沉淀在容器底部，溶液恢复平静",
      "colorChange": {
        "from": "气泡+黑色粉末",
        "to": "黑色粉末沉淀+无色溶液"
      },
      "microscopicExplanation": "H₂O₂完全分解，剩余H₂O和MnO₂，MnO₂可回收重复使用"
    }
  ]
}
```

**催化剂特征**:
1. 改变反应速率
2. 反应前后质量不变
3. 反应前后化学性质不变
4. 有选择性（MnO₂催化H₂O₂分解，但不催化其他反应）

---

##### 方程式11: 氯酸钾分解

```json
{
  "equationText": "2KClO₃ → 2KCl + 3O₂↑",
  "equationHtml": "2KClO<sub>3</sub> → 2KCl + 3O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {
    "temperature": "加热",
    "catalyst": "MnO₂（可选）"
  },
  "teachingInfo": {
    "studentDescription": "氯酸钾在加热条件下分解，产生氯化钾和氧气。",
    "teacherDescription": "传统的实验室制氧气方法。加入MnO₂可降低反应温度，加快反应速率。",
    "keyPoints": [
      "固体加热制气",
      "使用MnO₂催化",
      "试管口略向下倾斜"
    ]
  },
  "knowledgePoints": [
    "实验室制氧气传统方法：氯酸钾受热分解",
    "反应方程式：2KClO₃ → 2KCl + 3O₂↑（条件：加热，MnO₂作催化剂）",
    "反应类型：分解反应（一种物质分解成两种物质），也是氧化还原反应",
    "催化剂的作用：二氧化锰（MnO₂）加快KClO₃分解速率，降低反应温度，反应前后质量和化学性质不变",
    "固体加热装置特点：试管口略向下倾斜，防止冷凝水倒流导致试管炸裂",
    "氧气收集方法：排水法（O₂不易溶于水）或向上排空气法（O₂密度大于空气）",
    "氧气检验方法：用带火星的木条伸入集气瓶口，木条复燃证明是氧气",
    "氯酸钾的性质：白色固体，易溶于水，是强氧化剂",
    "催化剂概念：能改变化学反应速率而在反应前后本身的质量和化学性质都不变的物质",
    "反应现象：白色固体熔化后产生大量气泡，放出氧气",
    "氧化还原分析：氯元素从+5价降至-1价，氧元素从-2价升至0价",
    "实验注意事项：①KClO₃与MnO₂需充分混合 ②先预热再集中加热 ③先移导管后熄灯",
    "中考考点：①实验室制氧气方法 ②催化剂的概念和作用 ③分解反应 ④实验操作步骤",
    "与KMnO₄制氧气对比：KClO₃需要MnO₂催化，反应温度较高；KMnO₄不需要催化剂",
    "与H₂O₂制氧气对比：KClO₃需要加热（固固加热型），H₂O₂常温反应（固液常温型，更安全）"
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "预热阶段",
      "stageType": "heating",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "白色KClO₃固体粉末受热，无明显外观变化，温度逐渐升高",
      "colorChange": {
        "from": "白色固体粉末",
        "to": "白色固体粉末"
      },
      "microscopicExplanation": "KClO₃晶体吸收热量，Cl-O键开始振动增强，温度接近分解点"
    },
    {
      "stageOrder": 2,
      "stageName": "熔融分解",
      "stageType": "propagation",
      "durationEstimate": "2-5分钟",
      "phenomenaDescription": "固体先熔化成液体，然后产生大量气泡，放出氧气",
      "colorChange": {
        "from": "白色固体",
        "to": "熔融液体+气泡产生"
      },
      "microscopicExplanation": "KClO₃熔化后分解：2KClO₃ → 2KCl + 3O₂↑，Cl-O键断裂，O原子结合成O₂"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "5-8分钟后",
      "phenomenaDescription": "气泡产生逐渐减少至停止，冷却后得到白色KCl固体",
      "colorChange": {
        "from": "熔融液体+气泡",
        "to": "白色固体残留"
      },
      "microscopicExplanation": "KClO₃完全分解为KCl和O₂，KCl重新凝固为白色固体"
    }
  ]
}
```

---

##### 方程式12: 高锰酸钾分解

```json
{
  "equationText": "2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑",
  "equationHtml": "2KMnO<sub>4</sub> → K<sub>2</sub>MnO<sub>4</sub> + MnO<sub>2</sub> + O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {
    "temperature": "加热"
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "预热阶段",
      "stageType": "heating",
      "durationEstimate": "30秒-1分钟",
      "phenomenaDescription": "紫黑色固体开始受热，无明显变化，试管可能产生少量水雾",
      "colorChange": {
        "from": "紫黑色固体",
        "to": "紫黑色固体"
      },
      "microscopicExplanation": "KMnO₄晶体吸收热量，温度逐渐升高，即将达到分解温度"
    },
    {
      "stageOrder": 2,
      "stageName": "分解进行",
      "stageType": "propagation",
      "durationEstimate": "3-5分钟",
      "phenomenaDescription": "固体颜色逐渐变化，出现黑色和绿色混合物，导管口有连续气泡产生",
      "colorChange": {
        "from": "紫黑色",
        "to": "暗绿色+黑色混合物",
        "intermediate": ["紫→暗绿→黑绿"]
      },
      "microscopicExplanation": "2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑，高锰酸钾分解为锰酸钾(绿色)、二氧化锰(黑色)和氧气"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "停止加热后",
      "phenomenaDescription": "固体变为黑色和绿色混合物，不再产生气泡",
      "colorChange": {
        "from": "暗绿色+黑色",
        "to": "稳定的黑色MnO₂+绿色K₂MnO₄"
      },
      "microscopicExplanation": "分解反应完成，产物为K₂MnO₄(锰酸钾，绿色)和MnO₂(二氧化锰，黑色)"
    }
  ],
  "teachingInfo": {
    "studentDescription": "高锰酸钾受热分解，产生锰酸钾、二氧化锰和氧气。",
    "teacherDescription": "实验室制氧气最常用的方法。注意：试管口放一团棉花，防止粉末进入导管。",
    "keyPoints": [
      "紫黑色固体",
      "试管口放棉花",
      "试管口略向下倾斜"
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "紫黑色",
      "after": "黑色（MnO₂）+绿色（K₂MnO₄）",
      "description": "固体颜色变化"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "产生气泡"
    }
  },
  "knowledgePoints": [
    "实验室制取氧气的方法之一（固体加热制气）",
    "分解反应的特征（一变多，化合价改变）",
    "氧化还原反应的电子转移分析（Mn从+7价变为+6价和+4价，O从-2价变为0价）",
    "实验装置：试管口略向下倾斜的原因（防止冷凝水倒流炸裂试管）",
    "试管口放棉花的作用（防止KMnO₄粉末进入导管）",
    "氧气的收集方法（排水法或向上排空气法）",
    "氧气的检验方法（带火星的木条复燃）",
    "高锰酸钾的物理性质（紫黑色晶体、易溶于水）",
    "自身氧化还原反应（歧化反应）的概念",
    "实验室制氧气的三种方法对比（KMnO₄、KClO₃、H₂O₂）"
  ]
}
```

---

#### 4.3.2 碳酸盐分解

##### 方程式13: 碳酸钙分解

```json
{
  "equationText": "CaCO₃ → CaO + CO₂↑",
  "equationHtml": "CaCO<sub>3</sub> → CaO + CO<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "difficultyLevel": "middle_school",
  "conditions": {
    "temperature": "高温"
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "升温阶段",
      "stageType": "heating",
      "durationEstimate": "持续加热至825℃以上",
      "phenomenaDescription": "白色固体持续受热，外观无明显变化",
      "colorChange": {
        "from": "白色固体",
        "to": "白色固体"
      },
      "microscopicExplanation": "CaCO₃晶体吸收热量，温度逐渐升高，晶格振动加剧"
    },
    {
      "stageOrder": 2,
      "stageName": "分解发生",
      "stageType": "propagation",
      "durationEstimate": "数小时（工业规模）",
      "phenomenaDescription": "固体开始分解，产生CO₂气体，质量逐渐减轻，固体仍为白色",
      "colorChange": {
        "from": "白色CaCO₃",
        "to": "白色CaO"
      },
      "microscopicExplanation": "CaCO₃ → CaO + CO₂↑，碳酸钙分解为氧化钙(生石灰)和二氧化碳"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "不再产生CO₂",
      "phenomenaDescription": "固体变为白色多孔块状物质，质量减轻，遇水放出大量热",
      "colorChange": {
        "from": "白色固体",
        "to": "白色多孔CaO"
      },
      "microscopicExplanation": "完全分解为CaO（生石灰），加水反应：CaO + H₂O → Ca(OH)₂，放热剧烈"
    }
  ],
  "teachingInfo": {
    "studentDescription": "碳酸钙（石灰石）在高温下分解生成氧化钙和二氧化碳。",
    "teacherDescription": "工业制二氧化碳和生石灰的方法。需要高温（煅烧）。",
    "keyPoints": [
      "高温分解",
      "工业制CO₂方法",
      "生石灰制备"
    ]
  },
  "knowledgePoints": [
    "分解反应的条件（高温煅烧，约900℃）",
    "工业制取生石灰（CaO）的方法和原理",
    "工业副产物CO₂的收集和利用",
    "碳酸盐的热不稳定性（高温下分解）",
    "生石灰与水的反应（CaO + H₂O → Ca(OH)₂，放热）",
    "石灰石、生石灰、熟石灰的转化关系",
    "CaCO₃在自然界的存在形式（石灰石、大理石、方解石）",
    "煅烧的操作工艺和设备（石灰窑、立窑等）",
    "反应的可逆性（CaCO₃ ⇌ CaO + CO₂，高温正向，常温逆向）",
    "建筑材料工业中的应用"
  ]
}
```

---

### 4.4 复分解反应

#### 4.4.1 酸碱中和

##### 方程式14: 盐酸与氢氧化钠反应

```json
{
  "id": 10,
  "equationText": "HCl + NaOH → NaCl + H₂O",
  "equationHtml": "HCl + NaOH → NaCl + H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -57.1,
  "reactionRate": "instant",
  "reactants": [
    {"substanceId": 32, "coefficient": 1, "state": "aq", "formula": "HCl", "name": "盐酸"},
    {"substanceId": 40, "coefficient": 1, "state": "aq", "formula": "NaOH", "name": "氢氧化钠"}
  ],
  "products": [
    {"substanceId": 50, "coefficient": 1, "state": "aq", "formula": "NaCl", "name": "氯化钠"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "teachingInfo": {
    "studentDescription": "盐酸与氢氧化钠发生中和反应，生成氯化钠和水。这是一个放热反应。",
    "teacherDescription": "典型的酸碱中和反应。可用酚酞指示剂观察反应终点（红色褪去）。",
    "keyPoints": [
      "方程式：HCl + NaOH → NaCl + H₂O",
      "中和反应：酸 + 碱 → 盐 + 水",
      "反应放热",
      "可用酚酞作指示剂"
    ],
    "commonQuestions": [
      {"question": "为什么叫中和反应？", "answer": "酸和碱反应生成中性的盐和水，酸碱性互相抵消。"},
      {"question": "反应放热还是吸热？", "answer": "中和反应都是放热的。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色（或酚酞红）",
      "after": "无色",
      "description": "若使用酚酞，红色褪去"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+5°C",
      "description": "放热但不明显"
    }
  },
  "knowledgePoints": [
    "典型的酸碱中和反应：强酸（盐酸）与强碱（氢氧化钠）反应",
    "反应方程式：HCl + NaOH → NaCl + H₂O",
    "离子方程式：H⁺ + OH⁻ → H₂O",
    "反应本质：酸中的H⁺与碱中的OH⁻结合生成水",
    "中和反应定义：酸与碱作用生成盐和水的反应",
    "反应热效应：强酸强碱中和热约为-57.3 kJ/mol（放热）",
    "pH变化：酸性溶液和碱性溶液反应后趋向中性（pH≈7）",
    "指示剂应用：可用酚酞指示剂观察反应终点（红色褪去变为无色）",
    "反应类型：复分解反应，也是放热反应",
    "应用：酸碱中和滴定、调节溶液pH、制备盐类",
    "中考考点：中和反应概念、方程式书写、酸碱指示剂",
    "高考考点：离子方程式书写、中和热测定、pH计算"
  ]
}
```

**中和反应本质**: H⁺ + OH⁻ → H₂O

---

##### 方程式15: 硫酸与氢氧化钠反应

```json
{
  "id": 11,
  "equationText": "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",
  "equationHtml": "H<sub>2</sub>SO<sub>4</sub> + 2NaOH → Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -114.2,
  "reactionRate": "instant",
  "reactants": [
    {"substanceId": 30, "coefficient": 1, "state": "aq", "formula": "H₂SO₄", "name": "稀硫酸"},
    {"substanceId": 40, "coefficient": 2, "state": "aq", "formula": "NaOH", "name": "氢氧化钠"}
  ],
  "products": [
    {"substanceId": 85, "coefficient": 1, "state": "aq", "formula": "Na₂SO₄", "name": "硫酸钠"},
    {"substanceId": 70, "coefficient": 2, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合瞬间",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "两种无色溶液混合，无明显可见变化",
      "colorChange": {
        "from": "无色溶液",
        "to": "无色溶液"
      },
      "microscopicExplanation": "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O，H⁺与OH⁻结合生成H₂O"
    },
    {
      "stageOrder": 2,
      "stageName": "中和进行",
      "stageType": "propagation",
      "durationEstimate": "瞬间完成",
      "phenomenaDescription": "反应瞬间完成，若用酚酞可观察到红色褪去",
      "colorChange": {
        "from": "红色溶液（酚酞存在）",
        "to": "无色溶液"
      },
      "microscopicExplanation": "H⁺ + OH⁻ → H₂O，酸碱中和本质是H⁺和OH⁻结合"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "反应后",
      "phenomenaDescription": "溶液呈中性（或接近中性），用手触摸容器壁感觉温度升高",
      "colorChange": {
        "from": "无色",
        "to": "无色"
      },
      "microscopicExplanation": "完全转化为Na₂SO₄和H₂O，反应放热使温度升高"
    }
  ],
  "teachingInfo": {
    "studentDescription": "硫酸与氢氧化钠发生中和反应，生成硫酸钠和水。注意硫酸需要2个氢氧化钠分子。",
    "teacherDescription": "二元酸与碱的中和反应。注意化学计量比为1:2。",
    "keyPoints": [
      "方程式：H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",
      "硫酸是二元酸，需要2倍碱",
      "生成硫酸钠和水"
    ],
    "commonQuestions": [
      {"question": "为什么需要2个NaOH？", "answer": "硫酸H₂SO₄有2个可被中和的H⁺，每个NaOH只能提供1个OH⁻。"}
    ]
  },
  "knowledgePoints": [
    "酸碱中和反应的定义和本质（H⁺ + OH⁻ → H₂O）",
    "中和反应的放热特征",
    "二元酸与一元碱反应的化学计量关系",
    "酸碱指示剂的使用（酚酞、石蕊）",
    "离子方程式的书写（H⁺ + OH⁻ → H₂O）",
    "pH值与酸碱中和的关系",
    "中和反应在生活中的应用（如处理酸性废水）",
    "完全中和与过量的判断",
    "强酸强碱中和反应的特点"
  ]
}
```

---

#### 4.4.2 沉淀反应

##### 方程式16: 氯化钡与硫酸反应

```json
{
  "id": 20,
  "equationText": "BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl",
  "equationHtml": "BaCl<sub>2</sub> + H<sub>2</sub>SO<sub>4</sub> → BaSO<sub>4</sub>↓ + 2HCl",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -25.0,
  "reactionRate": "instant",
  "reactants": [
    {"substanceId": 56, "coefficient": 1, "state": "aq", "formula": "BaCl₂", "name": "氯化钡"},
    {"substanceId": 30, "coefficient": 1, "state": "aq", "formula": "H₂SO₄", "name": "稀硫酸"}
  ],
  "products": [
    {"substanceId": 55, "coefficient": 1, "state": "s", "formula": "BaSO₄", "name": "硫酸钡"},
    {"substanceId": 32, "coefficient": 2, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合瞬间",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "两种无色溶液混合，立即产生白色浑浊",
      "colorChange": {
        "from": "无色透明溶液",
        "to": "白色浑浊"
      },
      "microscopicExplanation": "Ba²⁺与SO₄²⁻相遇，离子积超过Ksp(BaSO₄)，立即形成沉淀晶核"
    },
    {
      "stageOrder": 2,
      "stageName": "沉淀形成",
      "stageType": "propagation",
      "durationEstimate": "几秒内完成",
      "phenomenaDescription": "白色絮状沉淀逐渐聚集并下沉，溶液上层变澄清",
      "colorChange": {
        "from": "白色浑浊",
        "to": "白色沉淀+澄清溶液"
      },
      "microscopicExplanation": "BaSO₄沉淀颗粒聚集长大，迅速沉降到容器底部"
    },
    {
      "stageOrder": 3,
      "stageName": "沉淀稳定",
      "stageType": "completion",
      "durationEstimate": "沉淀完全后",
      "phenomenaDescription": "白色沉淀完全沉降，不溶于酸",
      "colorChange": {
        "from": "白色沉淀+澄清溶液",
        "to": "稳定白色沉淀（加酸不溶解）"
      },
      "microscopicExplanation": "BaSO₄是极难溶的盐，Ksp极小，不溶于盐酸或硝酸等强酸"
    }
  ],
  "teachingInfo": {
    "studentDescription": "氯化钡与硫酸反应生成白色硫酸钡沉淀。硫酸钡不溶于水也不溶于酸。",
    "teacherDescription": "典型的沉淀反应。硫酸钡是钡盐中唯一不溶于酸的，可用于检验硫酸根离子。",
    "keyPoints": [
      "方程式：BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl",
      "硫酸钡是白色沉淀",
      "BaSO₄不溶于酸",
      "用于检验SO₄²⁻"
    ],
    "commonQuestions": [
      {"question": "为什么沉淀不溶于酸？", "answer": "硫酸钡的溶度积极小，是钡盐中唯一不溶于酸的。"},
      {"question": "如何检验硫酸根？", "answer": "加入含Ba²⁺的溶液，产生不溶于酸的白色沉淀。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色",
      "after": "浑浊白色",
      "description": "产生白色沉淀，溶液变浑浊"
    },
    "precipitate": {
      "hasPrecipitate": true,
      "precipitateColor": "白色",
      "precipitateDescription": "白色絮状沉淀，迅速下沉",
      "solubility": "不溶于水，不溶于酸"
    }
  },
  "knowledgePoints": [
    "硫酸根离子SO₄²⁻的检验方法",
    "钡离子Ba²⁺与硫酸根形成沉淀的特征",
    "沉淀反应的溶解度规则（Ksp）",
    "硫酸钡BaSO₄的特殊性质（不溶于酸的白色沉淀）",
    "沉淀反应的离子方程式书写（Ba²⁺ + SO₄²⁻ → BaSO₄↓）",
    "常见沉淀的颜色记忆方法",
    "如何区分硫酸钡和其他钡盐沉淀",
    "沉淀的洗涤和纯化方法",
    "硫酸钡在医学上的应用（钡餐造影）"
  ]
}
```

**常见沉淀颜色**:
- 白色: BaSO₄, AgCl, CaCO₃, BaCO₃
- 蓝色: Cu(OH)₂
- 红褐色: Fe(OH)₃
- 浅绿色: Fe(OH)₂

---

##### 方程式17: 硝酸银与盐酸反应

```json
{
  "id": 21,
  "equationText": "AgNO₃ + HCl → AgCl↓ + HNO₃",
  "equationHtml": "AgNO<sub>3</sub> + HCl → AgCl↓ + HNO<sub>3</sub>",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -65.5,
  "reactionRate": "instant",
  "reactants": [
    {"substanceId": 62, "coefficient": 1, "state": "aq", "formula": "AgNO₃", "name": "硝酸银"},
    {"substanceId": 32, "coefficient": 1, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 57, "coefficient": 1, "state": "s", "formula": "AgCl", "name": "氯化银"},
    {"substanceId": 33, "coefficient": 1, "state": "aq", "formula": "HNO₃", "name": "硝酸"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合瞬间",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "两种无色溶液混合，立即产生白色浑浊",
      "colorChange": {
        "from": "无色透明溶液",
        "to": "白色浑浊"
      },
      "microscopicExplanation": "Ag⁺与Cl⁻相遇，离子积超过Ksp(AgCl)，开始形成沉淀晶核"
    },
    {
      "stageOrder": 2,
      "stageName": "沉淀形成",
      "stageType": "propagation",
      "durationEstimate": "几秒内完成",
      "phenomenaDescription": "白色凝乳状沉淀逐渐沉降，溶液上层变澄清",
      "colorChange": {
        "from": "白色浑浊",
        "to": "白色沉淀+澄清溶液"
      },
      "microscopicExplanation": "AgCl沉淀颗粒聚集长大，沉降到容器底部，上层溶液澄清"
    },
    {
      "stageOrder": 3,
      "stageName": "光照分解",
      "stageType": "completion",
      "durationEstimate": "数小时至数天",
      "phenomenaDescription": "白色沉淀见光逐渐变黑",
      "colorChange": {
        "from": "白色沉淀",
        "to": "灰黑色沉淀"
      },
      "microscopicExplanation": "2AgCl → 2Ag + Cl₂↑，氯化银见光分解，生成黑色银单质"
    }
  ],
  "teachingInfo": {
    "studentDescription": "硝酸银与盐酸反应生成白色氯化银沉淀。氯化银见光会分解变黑。",
    "teacherDescription": "检验氯离子的典型反应。注意避光保存。",
    "keyPoints": [
      "方程式：AgNO₃ + HCl → AgCl↓ + HNO₃",
      "氯化银是白色沉淀",
      "AgCl见光分解变黑",
      "用于检验Cl⁻"
    ],
    "commonQuestions": [
      {"question": "沉淀为什么变黑？", "answer": "氯化银见光分解生成黑色的银单质。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "无色",
      "after": "白色浑浊",
      "description": "产生白色沉淀"
    },
    "precipitate": {
      "hasPrecipitate": true,
      "precipitateColor": "白色",
      "precipitateDescription": "白色凝乳状沉淀",
      "note": "见光逐渐变黑"
    }
  },
  "knowledgePoints": [
    "氯离子的检验方法",
    "沉淀反应的特征",
    "氯化银的光敏性",
    "离子反应的本质",
    "沉淀溶解平衡的应用"
  ]
}
```

---

#### 4.4.3 产气反应

##### 方程式18: 碳酸钙与盐酸反应

```json
{
  "id": 50,
  "equationText": "CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
  "equationHtml": "CaCO<sub>3</sub> + 2HCl → CaCl<sub>2</sub> + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -15.0,
  "reactionRate": "moderate",
  "reactants": [
    {"substanceId": 59, "coefficient": 1, "state": "s", "formula": "CaCO₃", "name": "碳酸钙"},
    {"substanceId": 32, "coefficient": 2, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 58, "coefficient": 1, "state": "aq", "formula": "CaCl₂", "name": "氯化钙"},
    {"substanceId": 28, "coefficient": 1, "state": "g", "formula": "CO₂", "name": "二氧化碳"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触初期",
      "stageType": "initiation",
      "durationEstimate": "5-10秒",
      "phenomenaDescription": "盐酸倒在碳酸钙上，固体表面开始产生气泡",
      "colorChange": {
        "from": "白色固体+无色液体",
        "to": "固体表面冒气泡"
      },
      "microscopicExplanation": "H⁺与CaCO₃表面接触，开始反应生成CO₂气体"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "1-3分钟",
      "phenomenaDescription": "气泡持续大量产生，固体逐渐溶解变小，容器壁可能有水珠凝结",
      "colorChange": {
        "from": "固体表面冒气泡",
        "to": "固体变小+无色溶液"
      },
      "microscopicExplanation": "CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O，固体持续溶解，CO₂气体持续产生"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "固体完全溶解",
      "phenomenaDescription": "气泡停止产生，固体完全消失，形成无色氯化钙溶液",
      "colorChange": {
        "from": "固体变小",
        "to": "无色溶液"
      },
      "microscopicExplanation": "CaCO₃完全转化为Ca²⁺和Cl⁻，反应结束"
    }
  ],
  "teachingInfo": {
    "studentDescription": "碳酸钙（石灰石、大理石）与盐酸反应生成二氧化碳气体。固体逐渐溶解，产生气泡。",
    "teacherDescription": "实验室制取二氧化碳的主要方法。大理石与稀盐酸反应。",
    "keyPoints": [
      "方程式：CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
      "实验室制CO₂方法",
      "碳酸钙逐渐溶解",
      "产生无色气体"
    ],
    "commonQuestions": [
      {"question": "为什么不用浓盐酸？", "answer": "浓盐酸易挥发，会使制得的CO₂不纯。"},
      {"question": "为什么不用硫酸？", "answer": "生成的硫酸钙微溶，会覆盖在碳酸钙表面阻止反应继续。"}
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "白色固体",
      "after": "固体溶解",
      "description": "固体逐渐溶解"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "产生无色无味气泡",
      "gasProperties": "密度比空气大，不支持燃烧"
    }
  },
  "knowledgePoints": [
    "实验室制二氧化碳的标准方法：石灰石（或大理石）与稀盐酸反应",
    "反应方程式：CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
    "离子方程式：CaCO₃ + 2H⁺ → Ca²⁺ + CO₂↑ + H₂O",
    "反应装置：固液常温型（锥形瓶+长颈漏斗）",
    "气体收集：向上排空气法（CO₂密度大于空气）",
    "CO₂检验：通入澄清石灰水，石灰水变浑浊",
    "为什么用稀盐酸：浓盐酸易挥发，使制得的CO₂不纯",
    "为什么不用硫酸：CaCO₃ + H₂SO₄ → CaSO₄ + CO₂↑ + H₂O，CaSO₄微溶会覆盖在CaCO₃表面阻止反应",
    "为什么不用碳酸钠粉末：反应太快，不易控制",
    "中考考点：实验室制气装置选择、试剂选择、气体收集和检验",
    "高考考点：离子方程式书写、试剂选择分析"
  ]
}
```

**实验室制CO₂要点**:
1. 药品: 大理石(或石灰石) + 稀盐酸
2. 不用浓盐酸: 挥发导致气体不纯
3. 不用硫酸: 生成微溶的CaSO₄覆盖表面
4. 不用硝酸: 有强氧化性，可能产生副反应

---

### 4.5 氧化还原反应

#### 4.5.1 实验室制氯气

##### 方程式19: 高锰酸钾与浓盐酸反应

```json
{
  "id": 40,
  "equationText": "2KMnO₄ + 16HCl(浓) → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O",
  "equationHtml": "2KMnO<sub>4</sub> + 16HCl(浓) → 2KCl + 2MnCl<sub>2</sub> + 5Cl<sub>2</sub>↑ + 8H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -185.0,
  "reactionRate": "moderate",
  "oxidationChanges": [
    {"element": "Mn", "from": "+7", "to": "+2", "process": "还原"},
    {"element": "Cl", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "reactants": [
    {"substanceId": 63, "coefficient": 2, "state": "s", "formula": "KMnO₄", "name": "高锰酸钾"},
    {"substanceId": 32, "coefficient": 16, "state": "aq", "formula": "HCl", "name": "浓盐酸"}
  ],
  "products": [
    {"substanceId": 87, "coefficient": 2, "state": "aq", "formula": "KCl", "name": "氯化钾"},
    {"substanceId": 88, "coefficient": 2, "state": "aq", "formula": "MnCl₂", "name": "氯化锰"},
    {"substanceId": 22, "coefficient": 5, "state": "g", "formula": "Cl₂", "name": "氯气"},
    {"substanceId": 70, "coefficient": 8, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "conditions": {
    "temperature": "室温"
  },
  "teachingInfo": {
    "studentDescription": "高锰酸钾与浓盐酸反应生成氯气。这是一个实验室制取氯气的方法。",
    "teacherDescription": "实验室制取氯气的主要方法。强调使用浓盐酸。注意氯气有毒，需通风。",
    "keyPoints": [
      "方程式：2KMnO₄ + 16HCl(浓) → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O",
      "Mn从+7价降到+2价",
      "Cl从-1价升到0价",
      "实验室制氯气方法"
    ],
    "commonQuestions": [
      {"question": "为什么必须用浓盐酸？", "answer": "稀盐酸还原性不足，不能发生此反应。"},
      {"question": "氧化剂是什么？", "answer": "KMnO₄是氧化剂，被还原为Mn²⁺。"}
    ],
    "safetyNotes": [
      "氯气有毒，必须在通风橱中进行",
      "使用尾气处理装置",
      "佩戴防护设备"
    ]
  },
  "phenomena": {
    "colorChange": {
      "before": "紫红色溶液",
      "after": "浅粉色（Mn²⁺）",
      "description": "紫红色褪去，变为浅粉色"
    },
    "gasEvolution": {
      "hasGas": true,
      "gasDescription": "产生黄绿色气体（氯气）",
      "gasProperties": "有毒，有刺激性气味"
    },
    "temperatureChange": {
      "isExothermic": true,
      "temperatureChange": "+20°C",
      "description": "放热"
    }
  },
  "knowledgePoints": [
    "实验室制氯气的方法",
    "氧化还原反应的电子转移分析",
    "高锰酸钾的强氧化性",
    "浓盐酸的还原性",
    "氯气的性质和安全防护"
  ]
}
```

**氧化还原分析**:
- 氧化剂: KMnO₄ (Mn: +7 → +2)
- 还原剂: HCl (Cl: -1 → 0)
- 电子转移: 10e⁻

---

#### 4.5.2 金属腐蚀

##### 方程式20: 铁生锈

```json
{
  "id": 90,
  "equationText": "4Fe + 3O₂ + 2xH₂O → 2Fe₂O₃·xH₂O",
  "equationHtml": "4Fe + 3O<sub>2</sub> + 2xH<sub>2</sub>O → 2Fe<sub>2</sub>O<sub>3</sub>·xH<sub>2</sub>O",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -1648.0,
  "reactionRate": "very_slow",
  "oxidationChanges": [
    {"element": "Fe", "from": 0, "to": "+3", "process": "氧化"},
    {"element": "O", "from": 0, "to": "-2", "process": "还原"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "初期氧化",
      "stageType": "initiation",
      "durationEstimate": "数小时至1天",
      "phenomenaDescription": "铁表面开始失去光泽，出现少量暗色斑点，触摸有轻微粗糙感",
      "colorChange": {
        "from": "银白色金属光泽",
        "to": "灰暗色，局部暗斑点"
      },
      "microscopicExplanation": "Fe → Fe²⁺ + 2e⁻，铁原子失去电子成为Fe²⁺进入溶液，形成电化学腐蚀电池"
    },
    {
      "stageOrder": 2,
      "stageName": "中间产物形成",
      "stageType": "propagation",
      "durationEstimate": "数天至数周",
      "phenomenaDescription": "表面出现黄褐色或棕褐色物质，质地疏松，逐渐扩展",
      "colorChange": {
        "from": "灰暗色",
        "to": "黄褐色",
        "intermediate": ["灰暗→棕褐→黄褐"]
      },
      "microscopicExplanation": "2Fe²⁺ + O₂ + 2H₂O → 2FeOOH + 2H⁺，形成羟基氧化铁(FeOOH)中间产物"
    },
    {
      "stageOrder": 3,
      "stageName": "铁锈形成",
      "stageType": "completion",
      "durationEstimate": "数月至数年",
      "phenomenaDescription": "完全覆盖红棕色铁锈，结构疏松多孔，易脱落，体积膨胀约6-8倍",
      "colorChange": {
        "from": "黄褐色",
        "to": "红棕色(Fe₂O₃·xH₂O)"
      },
      "microscopicExplanation": "2FeOOH → Fe₂O₃ + H₂O，最终形成水合氧化铁(铁锈)，疏松多孔不能保护内部金属"
    }
  ],
  "teachingInfo": {
    "studentDescription": "铁在潮湿空气中生锈，是铁、氧气和水共同作用的结果。生锈是缓慢氧化过程。",
    "teacherDescription": "铁生锈的条件：同时接触氧气和水。防锈方法：涂油、刷漆、电镀等。",
    "keyPoints": [
      "铁生锈是缓慢氧化",
      "需要同时接触O₂和H₂O",
      "铁锈主要成分是Fe₂O₃·xH₂O",
      "防锈：隔绝空气或水"
    ],
    "commonQuestions": [
      {"question": "铁在干燥空气中会生锈吗？", "answer": "不会，需要同时有氧气和水。"},
      {"question": "铁在完全浸没的水中会生锈吗？", "answer": "不会，需要氧气参与。"}
    ]
  },
  "knowledgePoints": [
    "铁生锈的本质：铁与氧气和水发生缓慢的氧化反应，生成铁锈",
    "反应方程式：4Fe + 3O₂ + 2xH₂O → 2Fe₂O₃·xH₂O（铁锈是水合氧化铁）",
    "生锈条件：必须同时满足①有氧气 ②有水（缺一不可）",
    "生锈过程：Fe → Fe²⁺ → Fe³⁺ → Fe₂O₃·xH₂O，是一个复杂的电化学过程",
    "铁锈性质：红棕色固体，疏松多孔，不能保护内部铁继续被腐蚀",
    "缓慢氧化：反应速率很慢，放热不明显，但会持续进行",
    "防锈原理：破坏铁生锈的条件，隔绝氧气或水",
    "防锈方法：①涂油漆 ②涂机油 ③电镀（镀锌） ④制成不锈钢",
    "中考考点：①铁生锈的条件 ②防锈方法 ③实验探究",
    "高考考点：①电化学腐蚀 ②金属防护方法 ③原电池原理",
    "经济损失：全世界每年因腐蚀而损失的钢铁约占年产量的20-30%",
    "铁锈与氧化铁的区别：铁锈是Fe₂O₃·xH₂O（含结晶水），纯氧化铁不含水"
  ]
}
```

**铁生锈条件**:
1. 同时接触氧气
2. 同时接触水

**防锈方法**:
1. 涂油（隔绝空气和水）
2. 刷漆（隔绝空气和水）
3. 电镀（形成保护层）
4. 制成不锈钢（改变成分）

---

### 4.6 酸碱中和反应

*(已在4.4.1节中详细描述)*

---

### 4.7 沉淀反应

*(已在4.4.2节中详细描述)*

---

### 4.8 燃烧反应

*(已在4.2.1节中描述部分燃烧反应)*

#### 补充：常见燃料燃烧

##### 方程式21: 甲烷燃烧

```json
{
  "equationText": "CH₄ + 2O₂ → CO₂ + 2H₂O",
  "equationHtml": "CH<sub>4</sub> + 2O<sub>2</sub> → CO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -890.0,
  "conditions": {"temperature": "点燃"},
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "点燃瞬间",
      "stageType": "initiation",
      "durationEstimate": "瞬间",
      "phenomenaDescription": "甲烷被点燃，产生淡蓝色火焰，开始剧烈放热",
      "colorChange": {
        "from": "无色气体",
        "to": "淡蓝色火焰"
      },
      "microscopicExplanation": "CH₄分子与O₂分子达到着火点，化学键断裂重组：CH₄ + 2O₂ → CO₂ + 2H₂O"
    },
    {
      "stageOrder": 2,
      "stageName": "稳定燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续至燃料耗尽",
      "phenomenaDescription": "淡蓝色火焰稳定燃烧，火焰上方可能有水雾凝结",
      "colorChange": {
        "from": "淡蓝色火焰",
        "to": "稳定淡蓝色火焰"
      },
      "microscopicExplanation": "甲烷持续与氧气完全燃烧，生成CO₂和H₂O，释放大量热和光"
    },
    {
      "stageOrder": 3,
      "stageName": "熄灭",
      "stageType": "completion",
      "durationEstimate": "燃料耗尽或关闭气源",
      "phenomenaDescription": "火焰熄灭，可观察到容器壁有水珠凝结",
      "colorChange": {
        "from": "淡蓝色火焰",
        "to": "无"
      },
      "microscopicExplanation": "燃料停止供应，反应终止，H₂O蒸气冷凝成液态水滴"
    }
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 238,
      "secondaryEquationText": "CH₄ + O₂ → C + 2H₂O",
      "secondaryEquationHtml": "CH<sub>4</sub> + O<sub>2</sub> → C + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时产生炭黑，火焰发黄"
      },
      "teachingNote": "燃烧不充分产生黑烟"
    },
    {
      "secondaryEquationId": 239,
      "secondaryEquationText": "CH₄ + 3/2O₂ → CO + 2H₂O",
      "secondaryEquationHtml": "CH<sub>4</sub> + 3/2O<sub>2</sub> → CO + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时产生有毒CO气体"
      },
      "teachingNote": "燃气不完全燃烧产生CO，有中毒风险",
      "isCommonStudentError": true
    }
  ],
  "knowledgePoints": [
    "甲烷的分子式和结构",
    "有机物的完全燃烧与不完全燃烧",
    "化石燃料的燃烧",
    "燃烧反应的条件",
    "氧气不足时的产物（C和CO）"
  ]
}
```
  "difficultyLevel": "middle_school",
  "conditions": {
    "temperature": "点燃"
  },
  "teachingInfo": {
    "studentDescription": "甲烷（天然气主要成分）在氧气中完全燃烧，生成二氧化碳和水。",
    "teacherDescription": "最简单的有机物燃烧反应。完全燃烧产生蓝色火焰。",
    "keyPoints": [
      "方程式：CH₄ + 2O₂ → CO₂ + 2H₂O",
      "完全燃烧：蓝色火焰",
      "不完全燃烧：产生炭黑（黑烟）"
    ]
  },
  "knowledgePoints": [
    "甲烷是最简单的有机化合物，是天然气的主要成分",
    "完全燃烧方程式：CH₄ + 2O₂ → CO₂ + 2H₂O（点燃条件）",
    "不完全燃烧方程式：2CH₄ + 3O₂ → 2CO + 4H₂O（氧气不足时）",
    "燃烧现象：完全燃烧产生淡蓝色火焰，不完全燃烧产生黄色火焰和黑烟",
    "氧化还原分析：C从-4价升至+4价（失8个电子），O从0价降至-2价（每个O得2个电子）",
    "放热反应：1mol甲烷完全燃烧放出约890kJ热量",
    "应用：天然气、沼气、瓦斯气的主要成分，用作清洁燃料",
    "安全教育：使用天然气必须注意通风，防止不完全燃烧产生CO中毒",
    "中考考点：化石燃料、燃烧反应、环境保护",
    "高考考点：有机化学基础、燃烧热计算、能源利用"
  ]
}
```

##### 方程式22: 碳燃烧

**完全燃烧**:
```json
{
  "id": 22,
  "equationText": "C + O₂ → CO₂",
  "equationHtml": "C + O<sub>2</sub> → CO<sub>2</sub>",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -393.5,
  "conditions": {"temperature": "充足氧气点燃"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 243,
      "secondaryEquationText": "2C + O₂ → 2CO",
      "secondaryEquationHtml": "2C + O<sub>2</sub> → 2CO",
      "relationship": "parallel",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时生成有毒CO，火焰颜色发黄"
      },
      "teachingNote": "强调通风，防止CO中毒",
      "isCommonStudentError": true
    },
    {
      "secondaryEquationId": 244,
      "secondaryEquationText": "CO₂ + C → 2CO",
      "secondaryEquationHtml": "CO<sub>2</sub> + C → 2CO",
      "relationship": "sequential",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "temperature": "高温",
        "carbonExcess": true
      },
      "phenomenonImpact": {
        "description": "高温下CO₂与C反应生成CO"
      },
      "teachingNote": "工业制CO的方法之一"
    },
    {
      "secondaryEquationId": 245,
      "secondaryEquationText": "C + 2H₂SO₄(浓) → CO₂↑ + 2SO₂↑ + 2H₂O",
      "secondaryEquationHtml": "C + 2H<sub>2</sub>SO<sub>4</sub>(浓) → CO<sub>2</sub>↑ + 2SO<sub>2</sub>↑ + 2H<sub>2</sub>O",
      "relationship": "side",
      "triggerProbability": 0.7,
      "triggerCondition": {
        "acidType": "浓硫酸",
        "temperature": "加热"
      },
      "phenomenonImpact": {
        "description": "碳与浓硫酸反应产生SO₂和CO₂"
      },
      "teachingNote": "浓硫酸有强氧化性"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "点燃",
      "stageType": "initiation",
      "durationEstimate": "数秒",
      "phenomenaDescription": "木炭被点燃，发红光，开始剧烈放热",
      "colorChange": {
        "from": "黑色固体",
        "to": "发红光的固体"
      },
      "microscopicExplanation": "碳原子与氧分子接触达到着火点，C + O₂ → CO₂开始进行"
    },
    {
      "stageOrder": 2,
      "stageName": "持续燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续至燃料耗尽",
      "phenomenaDescription": "木炭持续燃烧，发出白光，放热，木炭逐渐减少",
      "colorChange": {
        "from": "发红光",
        "to": "发白光+逐渐变小"
      },
      "microscopicExplanation": "碳原子持续与氧气反应生成CO₂气体，释放大量光和热"
    },
    {
      "stageOrder": 3,
      "stageName": "燃尽",
      "stageType": "completion",
      "durationEstimate": "燃料耗尽",
      "phenomenaDescription": "红光逐渐变暗直至熄灭，剩余少量灰烬",
      "colorChange": {
        "from": "发白光",
        "to": "灰色灰烬"
      },
      "microscopicExplanation": "碳完全转化为CO₂气体，剩余灰烬是木炭中的无机盐杂质"
    }
  ],
  "teachingInfo": {
    "studentDescription": "木炭在氧气中燃烧，发出白光，放出热量，生成二氧化碳。",
    "teacherDescription": "碳在充足氧气中完全燃烧，是放热反应。需要达到着火点才能开始燃烧。",
    "keyPoints": [
      "方程式：C + O₂ → CO₂",
      "完全燃烧产物是CO₂",
      "放热反应"
    ]
  },
  "knowledgePoints": [
    "木炭在氧气中燃烧的现象：发出白光，放出热量，生成能使澄清石灰水变浑浊的气体（CO₂）",
    "燃烧的条件：①可燃物（木炭） ②助燃物（氧气） ③温度达到着火点（三者缺一不可）",
    "对比实验：木炭在空气中燃烧发红光，在氧气中燃烧发白光（氧气浓度越高，燃烧越剧烈）",
    "完全燃烧与不完全燃烧：氧气充足时完全燃烧生成CO₂，氧气不足时不完全燃烧生成CO",
    "产物检验：生成的气体使澄清石灰水变浑浊，证明是二氧化碳：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O",
    "实验操作：用坩埚钳夹住木炭，在酒精灯上点燃后迅速伸入盛有氧气的集气瓶中",
    "燃烧本质：剧烈的发光发热的氧化反应，碳从0价升至+4价（被氧化）",
    "能量变化：放热反应，ΔH = -393.5 kJ/mol，释放大量热能",
    "火焰现象：固体燃烧（如木炭）只发光不产生火焰，气体或液体燃烧才产生火焰",
    "中考考点：①燃烧的条件 ②实验现象描述 ③CO₂的检验 ④完全燃烧与不完全燃烧",
    "安全注意事项：集气瓶底部放少量水或细沙，防止高温熔融物溅落炸裂瓶底",
    "实际应用：煤、木柴、天然气等燃料的燃烧，提供热能"
  ]
}
```

**不完全燃烧**:
```json
{
  "id": 22b,
  "equationText": "2C + O₂ → 2CO",
  "equationHtml": "2C + O<sub>2</sub> → 2CO",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -221.0,
  "conditions": {"temperature": "氧气不足点燃"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 246,
      "secondaryEquationText": "2CO + O₂ → 2CO₂",
      "secondaryEquationHtml": "2CO + O<sub>2</sub> → 2CO<sub>2</sub>",
      "relationship": "parallel",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "oxygenPresent": true
      },
      "phenomenonImpact": {
        "description": "CO可以继续燃烧生成CO₂"
      },
      "teachingNote": "CO是可燃气体"
    },
    {
      "secondaryEquationId": 247,
      "secondaryEquationText": "C + CO₂ → 2CO",
      "secondaryEquationHtml": "C + CO<sub>2</sub> → 2CO",
      "relationship": "parallel",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "temperature": "高温"
      },
      "phenomenonImpact": {
        "description": "在高温下C与CO₂反应"
      },
      "teachingNote": "此反应可逆"
    }
  ],
  "teachingInfo": {
    "studentDescription": "碳在氧气不足时燃烧，生成有毒的一氧化碳。",
    "teacherDescription": "碳的不完全燃烧。CO有毒，可燃，是重要的化工原料和燃料。",
    "keyPoints": [
      "方程式：2C + O₂ → 2CO",
      "不完全燃烧产物是CO",
      "CO有毒"
    ]
  },
  "knowledgePoints": [
    "碳不完全燃烧的条件：氧气不足或温度过高导致CO₂与C继续反应",
    "一氧化碳的性质：无色无味气体，有毒，可燃，具有还原性",
    "CO的毒性：与血红蛋白结合能力强于氧气，导致人体缺氧中毒",
    "实验现象：火焰呈黄色或蓝色（取决于温度和氧气浓度），比完全燃烧火焰颜色暗",
    "CO可继续燃烧：2CO + O₂ → 2CO₂（完全燃烧），释放更多热量",
    "实际应用：工业上控制煤的燃烧，防止CO中毒；煤气中毒的原理",
    "安全注意事项：室内用煤炉要通风，防止CO积聚中毒；安装CO报警器",
    "高考考点：①燃烧产物的判断 ②CO的毒性与可燃性 ③化学平衡移动",
    "中考考点：①完全燃烧与不完全燃烧的区别 ②CO的性质与安全",
    "化学反应中的碳价态变化：C(0) → C(+2)（不完全燃烧），C(0) → C(+4)（完全燃烧）",
    "热值比较：不完全燃烧放热少（-221.0 kJ/mol），完全燃烧放热多（-393.5 kJ/mol）",
    "环境保护：燃料充分燃烧不仅提高效率，还能减少CO排放"
  ]
}
```

---

## 5. 实验现象数据库

### 5.1 现象分类

| 现象类型 | 描述 | 典型反应 |
|----------|------|----------|
| 颜色变化 | 溶液或固体颜色改变 | Cu²⁺蓝色→无色，Fe²⁺浅绿色 |
| 沉淀生成 | 产生难溶物 | AgCl白色沉淀，BaSO₄白色沉淀 |
| 气体放出 | 产生气泡 | H₂、CO₂、O₂ |
| 温度变化 | 放热或吸热 | 金属与酸放热 |
| 状态变化 | 固液气态转换 | 冰融化，水沸腾 |
| 发光现象 | 产生光 | 燃烧发光 |
| 声音现象 | 产生声音 | 嘶嘶声，爆炸声 |

### 5.2 常见离子颜色

| 离子 | 颜色 | 备注 |
|------|------|------|
| Cu²⁺ | 蓝色 | 水合铜离子 |
| Fe²⁺ | 浅绿色 | 亚铁离子 |
| Fe³⁺ | 黄色 | 铁离子 |
| MnO₄⁻ | 紫红色 | 高锰酸根 |
| Cr₂O₇²⁻ | 橙红色 | 重铬酸根 |
| [Cu(NH₃)₄]²⁺ | 深蓝色 | 铜氨络离子 |

### 5.3 常见沉淀颜色

| 沉淀 | 颜色 | 溶解性 |
|------|------|--------|
| AgCl | 白色 | 不溶于酸，见光分解 |
| BaSO₄ | 白色 | 不溶于酸 |
| CaCO₃ | 白色 | 溶于酸 |
| Cu(OH)₂ | 蓝色 | 溶于酸 |
| Fe(OH)₃ | 红褐色 | 溶于酸 |
| Fe(OH)₂ | 白色→绿色→红褐色 | 溶于酸，易被氧化 |

### 5.4 气体性质

| 气体 | 颜色 | 气味 | 溶解性 | 检验方法 |
|------|------|------|--------|----------|
| H₂ | 无色 | 无味 | 难溶 | 燃烧，只生成水 |
| O₂ | 无色 | 无味 | 不易溶 | 使带火星木条复燃 |
| CO₂ | 无色 | 无味 | 能溶 | 使澄清石灰水变浑浊 |
| Cl₂ | 黄绿色 | 刺激性 | 能溶 | 使湿润KI淀粉试纸变蓝 |
| NH₃ | 无色 | 刺激性 | 极易溶 | 使湿润红色石蕊试纸变蓝 |
| SO₂ | 无色 | 刺激性 | 易溶 | 使品红溶液褪色 |

---

## 6. 教学知识点

### 6.1 初中化学知识点

#### 6.1.1 物质的变化和性质

1. **物理变化 vs 化学变化**
   - 物理变化: 没有新物质生成
   - 化学变化: 有新物质生成

2. **物理性质 vs 化学性质**
   - 物理性质: 不需要化学变化就能表现
   - 化学性质: 通过化学变化表现

#### 6.1.2 空气和氧气

1. **空气成分**
   - N₂: 78%
   - O₂: 21%
   - 稀有气体: 0.94%
   - CO₂: 0.03%

2. **氧气性质**
   - 助燃性
   - 氧化性

3. **氧气的实验室制法**
   - 过氧化氢分解
   - 氯酸钾分解
   - 高锰酸钾分解

#### 6.1.3 物质构成的奥秘

1. **分子、原子、离子**
   - 分子: 保持物质化学性质的最小粒子
   - 原子: 化学变化中的最小粒子
   - 离子: 带电的原子或原子团

2. **元素**
   - 元素符号
   - 元素周期表

3. **化合价**
   - 化合物中各元素正负化合价代数和为0

#### 6.1.4 水

1. **水的组成**
   - 电解: 2H₂O → 2H₂↑ + O₂↑
   - 证明水由H、O元素组成

2. **水的净化**
   - 沉淀、过滤、吸附、蒸馏

3. **硬水与软水**
   - 硬水: 含较多可溶性钙镁化合物
   - 软化: 煮沸、蒸馏

#### 6.1.5 化学方程式

1. **质量守恒定律**
   - 参加化学反应的各物质质量总和等于反应后生成质量总和

2. **化学方程式书写**
   - 写: 正确写出反应物和产物
   - 配: 配平化学方程式
   - 注: 注明反应条件、生成物状态
   - 等: 短线改为等号

#### 6.1.6 碳和碳的氧化物

1. **碳单质**
   - 金刚石、石墨、C₆₀

2. **一氧化碳**
   - 可燃性: 2CO + O₂ → 2CO₂
   - 还原性: CO + CuO → Cu + CO₂
   - 毒性

3. **二氧化碳**
   - 不能燃烧也不支持燃烧
   - 与水反应: CO₂ + H₂O → H₂CO₃
   - 与碱反应: CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O

#### 6.1.7 燃烧与燃料

1. **燃烧条件**
   - 可燃物
   - 助燃物(氧气)
   - 达到着火点

2. **灭火原理**
   - 清除可燃物
   - 隔绝氧气
   - 降低温度到着火点以下

3. **化石燃料**
   - 煤、石油、天然气
   - 不可再生能源

#### 6.1.8 金属和金属材料

1. **金属物理性质**
   - 导电性、导热性
   - 延展性
   - 金属光泽

2. **合金**
   - 比纯金属硬度更大
   - 熔点更低
   - 抗腐蚀性能更好

3. **金属活动性顺序**
   - K > Ca > Na > Mg > Al > Zn > Fe > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au

4. **金属锈蚀与防护**
   - 铁生锈条件: O₂ + H₂O
   - 防锈: 涂油、刷漆、电镀

#### 6.1.9 溶液

1. **溶液组成**
   - 溶质 + 溶剂

2. **溶解度**
   - 固体溶解度影响因素: 温度
   - 气体溶解度影响因素: 温度、压强

3. **溶质质量分数**
   - 溶质质量/溶液质量 × 100%

#### 6.1.10 酸和碱

1. **酸的通性**
   - 与酸碱指示剂反应
   - 与活泼金属反应
   - 与金属氧化物反应
   - 与碱反应
   - 与某些盐反应

2. **碱的通性**
   - 与酸碱指示剂反应
   - 与非金属氧化物反应
   - 与酸反应
   - 与某些盐反应

3. **中和反应**
   - 酸 + 碱 → 盐 + 水

4. **pH**
   - pH < 7: 酸性
   - pH = 7: 中性
   - pH > 7: 碱性

#### 6.1.11 盐和化肥

1. **盐的性质**
   - 与金属反应
   - 与酸反应
   - 与碱反应
   - 与另一种盐反应

2. **复分解反应条件**
   - 生成沉淀
   - 生成气体
   - 生成水

3. **化肥**
   - 氮肥: NH₄Cl、NH₄HCO₃、尿素
   - 磷肥: 磷矿粉、过磷酸钙
   - 钾肥: K₂SO₄、KCl
   - 复合肥: KNO₃、(NH₄)₂HPO₄

---

### 6.2 高中化学知识点

#### 6.2.1 从实验学化学

1. **实验基本操作**
   - 物质的分离与提纯
   - 常见物质的检验

2. **实验安全**
   - 危险化学品标识
   - 实验室安全规则

#### 6.2.2 化学物质及其变化

1. **物质的分类**
   - 纯净物与混合物
   - 单质与化合物
   - 酸、碱、盐、氧化物

2. **分散系**
   - 溶液
   - 胶体
   - 浊液

3. **离子反应**
   - 电解质与非电解质
   - 离子方程式书写

4. **氧化还原反应**
   - 氧化数变化
   - 氧化剂与还原剂
   - 电子转移
   - 配平方法

#### 6.2.3 物质结构基础

1. **原子结构**
   - 原子组成
   - 核外电子排布

2. **元素周期表**
   - 周期与族
   - 元素性质递变规律

3. **化学键**
   - 离子键
   - 共价键
   - 金属键

#### 6.2.4 化学反应速率和化学平衡

1. **化学反应速率**
   - 速率表示方法
   - 影响因素

2. **化学平衡**
   - 平衡状态特征
   - 平衡移动原理
   - 平衡常数

#### 6.2.5 水溶液中的离子平衡

1. **弱电解质电离**
   - 电离平衡
   - 电离常数

2. **水的电离和pH**
   - 水的离子积
   - pH计算

3. **盐类水解**
   - 水解规律
   - 影响因素

4. **沉淀溶解平衡**
   - 溶度积Ksp
   - 沉淀生成与溶解

#### 6.2.6 电化学基础

1. **原电池**
   - 工作原理
   - 电极反应

2. **电解池**
   - 工作原理
   - 电解规律

3. **金属腐蚀与防护**
   - 化学腐蚀与电化学腐蚀
   - 防护方法

---

#### 4.8.2 非金属氧化物燃烧

##### 方程式23: 硫燃烧

```json
{
  "equationText": "S + O₂ → SO₂",
  "equationHtml": "S + O<sub>2</sub> → SO<sub>2</sub>",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "点燃"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 248,
      "secondaryEquationText": "2SO₂ + O₂ ⇌ 2SO₃",
      "secondaryEquationHtml": "2SO<sub>2</sub> + O<sub>2</sub> ⇌ 2SO<sub>3</sub>",
      "relationship": "sequential",
      "triggerProbability": 0.1,
      "triggerCondition": {
        "catalyst": "V₂O₅",
        "temperature": "400-500℃"
      },
      "phenomenonImpact": {
        "description": "SO₂可被催化氧化为SO₃（接触法制硫酸）"
      },
      "teachingNote": "点燃条件下此反应几乎不发生"
    },
    {
      "secondaryEquationId": 249,
      "secondaryEquationText": "SO₂ + H₂O ⇌ H₂SO₃",
      "secondaryEquationHtml": "SO<sub>2</sub> + H<sub>2</sub>O ⇌ H<sub>2</sub>SO<sub>3</sub>",
      "relationship": "side",
      "triggerProbability": 1.0,
      "triggerCondition": {
        "waterPresent": true
      },
      "phenomenonImpact": {
        "description": "SO₂易溶于水形成亚硫酸，使溶液显酸性"
      },
      "teachingNote": "SO₂是酸性氧化物"
    },
    {
      "secondaryEquationId": 250,
      "secondaryEquationText": "S + 2H₂SO₄(浓) → 3SO₂↑ + 2H₂O",
      "secondaryEquationHtml": "S + 2H<sub>2</sub>SO<sub>4</sub>(浓) → 3SO<sub>2</sub>↑ + 2H<sub>2</sub>O",
      "relationship": "side",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "acidType": "浓硫酸",
        "temperature": "加热"
      },
      "phenomenonImpact": {
        "description": "硫与浓硫酸反应生成SO₂"
      },
      "teachingNote": "实验室制备SO₂的方法"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "加热熔化",
      "stageType": "heating",
      "durationEstimate": "10-20秒",
      "phenomenaDescription": "淡黄色硫粉受热先熔化成液态，然后开始燃烧",
      "colorChange": {
        "from": "淡黄色固体",
        "to": "黄色液体"
      },
      "microscopicExplanation": "硫分子吸收热量，克服分子间作用力，固态硫转变为液态硫"
    },
    {
      "stageOrder": 2,
      "stageName": "点燃燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续至燃料耗尽",
      "phenomenaDescription": "产生明亮的蓝紫色火焰（纯氧中），空气中为淡蓝色火焰，产生刺激性气味气体",
      "colorChange": {
        "from": "黄色液体",
        "to": "蓝紫色火焰"
      },
      "microscopicExplanation": "S + O₂ → SO₂，硫原子与氧原子结合释放大量能量，电子跃迁产生特征光谱（蓝紫色）"
    },
    {
      "stageOrder": 3,
      "stageName": "熄灭",
      "stageType": "completion",
      "durationEstimate": "燃料耗尽或隔绝氧气",
      "phenomenaDescription": "火焰熄灭，残留无色刺激性气味气体（SO₂）",
      "colorChange": {
        "from": "蓝紫色火焰",
        "to": "无色气体"
      },
      "microscopicExplanation": "硫完全燃烧生成SO₂气体，扩散到空气中"
    }
  ],
  "teachingInfo": {
    "studentDescription": "硫在氧气中燃烧，产生明亮的蓝紫色火焰，生成有刺激性气味的二氧化硫气体。",
    "teacherDescription": "演示非金属在氧气中的燃烧。注意通风，SO₂有毒。",
    "keyPoints": [
      "方程式：S + O₂ → SO₂",
      "蓝紫色火焰",
      "SO₂有刺激性气味",
      "污染空气，形成酸雨"
    ],
    "safetyNotes": ["通风良好", "避免吸入SO₂"]
  },
  "phenomena": {
    "colorChange": {"before": "淡黄色", "after": "无色气体"},
    "temperatureChange": {"isExothermic": true, "description": "放热，蓝紫色火焰"},
    "observationPoints": ["观察火焰颜色", "闻气味(小心)"]
  },
  "knowledgePoints": [
    "硫在氧气中燃烧的现象：产生明亮的蓝紫色火焰，放出热量，生成有刺激性气味的气体",
    "对比现象：硫在空气中燃烧产生淡蓝色火焰，在氧气中燃烧产生蓝紫色火焰（氧气浓度越高，燃烧越剧烈）",
    "生成物性质：二氧化硫（SO₂）是无色有刺激性气味的气体，有毒，是酸雨的主要成因之一",
    "SO₂的溶解性：易溶于水，与水反应生成亚硫酸：SO₂ + H₂O ⇌ H₂SO₃",
    "酸性氧化物：SO₂是酸性氧化物，能使湿润的石蕊试纸变红",
    "环境污染：SO₂是大气污染物，会导致酸雨，危害环境和人体健康",
    "实验操作：用药匙取少量硫粉，放在燃烧匙中加热，点燃后迅速伸入盛有氧气的集气瓶中",
    "实验安全：必须在通风橱中进行，避免吸入SO₂气体",
    "微观解释：硫原子（0价）与氧原子（0价）结合，硫被氧化至+4价，氧被还原至-2价",
    "中考考点：①实验现象描述 ②SO₂的性质 ③酸雨成因 ④环境保护",
    "高考考点：①氧化还原反应分析 ②SO₂的化学性质 ③酸性氧化物通性",
    "工业应用：硫燃烧是工业制硫酸的第一步（硫或硫铁矿燃烧产生SO₂）"
  ]
}
```

##### 方程式24: 磷燃烧

```json
{
  "equationText": "4P + 5O₂ → 2P₂O₅",
  "equationHtml": "4P + 5O<sub>2</sub> → 2P<sub>2</sub>O<sub>5</sub>",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "点燃"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 251,
      "secondaryEquationText": "4P + 3O₂ → 2P₂O₃",
      "secondaryEquationHtml": "4P + 3O<sub>2</sub> → 2P<sub>2</sub>O<sub>3</sub>",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时生成三氧化二磷"
      },
      "teachingNote": "主要产物是P₂O₅"
    },
    {
      "secondaryEquationId": 252,
      "secondaryEquationText": "P₂O₅ + H₂O → 2HPO₃",
      "secondaryEquationHtml": "P<sub>2</sub>O<sub>5</sub> + H<sub>2</sub>O → 2HPO<sub>3</sub>",
      "relationship": "sequential",
      "triggerProbability": 1.0,
      "triggerCondition": {
        "waterPresent": true
      },
      "phenomenonImpact": {
        "description": "P₂O₅与水剧烈反应生成磷酸"
      },
      "teachingNote": "P₂O₅是强干燥剂"
    },
    {
      "secondaryEquationId": 253,
      "secondaryEquationText": "P₂O₅ + 3H₂O → 2H₃PO₄",
      "secondaryEquationHtml": "P<sub>2</sub>O<sub>5</sub> + 3H<sub>2</sub>O → 2H<sub>3</sub>PO<sub>4</sub>",
      "relationship": "sequential",
      "triggerProbability": 0.9,
      "triggerCondition": {
        "waterPresent": true,
        "waterExcess": "热水"
      },
      "phenomenonImpact": {
        "description": "与过量水反应生成磷酸"
      },
      "teachingNote": "根据水量不同产物不同"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "点燃瞬间",
      "stageType": "initiation",
      "durationEstimate": "瞬间",
      "phenomenaDescription": "红磷或白磷被点燃，立即开始剧烈燃烧",
      "colorChange": {
        "from": "暗红色/白色固体",
        "to": "发光发热"
      },
      "microscopicExplanation": "磷分子与氧气分子接触达到着火点，化学键断裂重组"
    },
    {
      "stageOrder": 2,
      "stageName": "剧烈燃烧",
      "stageType": "propagation",
      "durationEstimate": "几秒至十几秒",
      "phenomenaDescription": "产生大量白烟，发出黄白色火焰，剧烈放热",
      "colorChange": {
        "from": "固体表面",
        "to": "大量白色烟雾"
      },
      "microscopicExplanation": "4P + 5O₂ → 2P₂O₅，磷原子与氧原子结合生成五氧化二磷白色固体小颗粒悬浮于空气中"
    },
    {
      "stageOrder": 3,
      "stageName": "熄灭与沉积",
      "stageType": "completion",
      "durationEstimate": "燃烧停止后",
      "phenomenaDescription": "火焰熄灭，白烟逐渐扩散并沉降为白色粉末",
      "colorChange": {
        "from": "白色烟雾",
        "to": "白色粉末沉积"
      },
      "microscopicExplanation": "P₂O₅固体小颗粒沉降，五氧化二磷极易吸水，与空气中水分反应生成磷酸"
    }
  ],
  "teachingInfo": {
    "studentDescription": "磷在氧气中剧烈燃烧，产生大量白烟。",
    "teacherDescription": "演示白烟现象。白烟是五氧化二磷固体小颗粒。",
    "keyPoints": [
      "方程式：4P + 5O₂ → 2P₂O₅",
      "产生大量白烟",
      "P₂O₅是白色固体"
    ]
  },
  "knowledgePoints": [
    "红磷燃烧的现象：在氧气中剧烈燃烧，发出白光，放出热量，产生大量白烟",
    "白烟的本质：五氧化二磷（P₂O₅）白色固体小颗粒悬浮在空气中形成烟",
    "重要应用：红磷燃烧实验可用于测定空气中氧气的含量（红磷燃烧消耗氧气，气压减小，水进入集气瓶）",
    "着火点对比：白磷着火点约40℃（易自燃），红磷着火点约240℃（需点燃）",
    "P₂O₅的性质：白色固体，酸性氧化物，极易吸水，是常用的干燥剂",
    "与水的反应：P₂O₅ + H₂O → 2HPO₃（偏磷酸），P₂O₅ + 3H₂O → 2H₃PO₄（磷酸）",
    "实验安全：红磷无毒但可燃，白磷有剧毒且易自燃，实验需注意安全",
    "中考考点：①实验现象描述 ②白烟的本质 ③测定空气中氧气含量 ④燃烧的条件",
    "高考考点：①磷及其化合物的性质 ②P₂O₅的水化反应 ③氧化还原反应",
    "注意事项：集气瓶底部放少量水或细沙，防止高温物质溅落炸裂瓶底",
    "实际应用：军事上的烟幕弹（白磷燃烧产生浓烟），制作安全火柴（红磷）",
    "磷的同素异形体：白磷（P₄，剧毒，易自燃）、红磷（无毒，稳定）、黑磷"
  ]
}
```

---

### 4.9 酸碱盐反应

#### 4.9.1 酸与金属氧化物反应

##### 方程式25: 氧化铁与盐酸反应

```json
{
  "equationText": "Fe₂O₃ + 6HCl → 2FeCl₃ + 3H₂O",
  "equationHtml": "Fe<sub>2</sub>O<sub>3</sub> + 6HCl → 2FeCl<sub>3</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -250.0,
  "reactionRate": "moderate",
  "reactants": [
    {"substanceId": 100, "coefficient": 1, "state": "s", "formula": "Fe₂O₃", "name": "氧化铁"},
    {"substanceId": 32, "coefficient": 6, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 101, "coefficient": 2, "state": "aq", "formula": "FeCl₃", "name": "氯化铁"},
    {"substanceId": 70, "coefficient": 3, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "teachingInfo": {
    "studentDescription": "红棕色氧化铁粉末逐渐溶解在盐酸中，溶液变为黄色。",
    "teacherDescription": "酸与金属氧化物反应生成盐和水。Fe³⁺溶液呈黄色。",
    "keyPoints": [
      "方程式：Fe₂O₃ + 6HCl → 2FeCl₃ + 3H₂O",
      "酸 + 金属氧化物 → 盐 + 水",
      "Fe³⁺呈黄色"
    ],
    "commonQuestions": [
      {"question": "为什么溶液变黄？", "answer": "Fe³⁺在水溶液中呈黄色。"}
    ]
  },
  "phenomena": {
    "colorChange": {"before": "红棕色固体", "after": "黄色溶液", "description": "固体溶解，溶液变黄"},
    "precipitate": {"hasPrecipitate": false}
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合初期",
      "stageType": "mixing",
      "durationEstimate": "立即开始",
      "phenomenaDescription": "红棕色氧化铁粉末加入稀盐酸中，固体表面开始冒出细小气泡",
      "colorChange": {
        "from": "无色透明溶液+红棕色固体",
        "to": "无色溶液+固体表面冒泡"
      },
      "microscopicExplanation": "H⁺离子开始攻击Fe₂O₃固体表面，Fe³⁺开始从晶格中脱离进入溶液"
    },
    {
      "stageOrder": 2,
      "stageName": "溶解进行",
      "stageType": "reacting",
      "durationEstimate": "1-3分钟",
      "phenomenaDescription": "红棕色粉末逐渐溶解，溶液颜色逐渐变为黄色，固体逐渐减少",
      "colorChange": {
        "from": "无色溶液+红棕色固体",
        "to": "黄色溶液+固体减少",
        "intermediate": ["淡黄色", "浅黄色", "黄色"]
      },
      "microscopicExplanation": "Fe₂O₃ + 6H⁺ → 2Fe³⁺ + 3H₂O，Fe³⁺进入溶液形成黄色水合离子[Fe(H₂O)₆]³⁺"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "3-5分钟后",
      "phenomenaDescription": "红棕色固体完全溶解，溶液呈透明黄色，无沉淀残留",
      "colorChange": {
        "from": "黄色溶液+少量固体",
        "to": "透明黄色溶液"
      },
      "microscopicExplanation": "所有Fe₂O₃已反应完全，溶液中主要为Fe³⁺水合离子和Cl⁻离子"
    }
  ],
  "knowledgePoints": [
    "氧化铁与盐酸反应：金属氧化物与酸反应生成盐和水",
    "反应方程式：Fe₂O₃ + 6HCl → 2FeCl₃ + 3H₂O",
    "离子方程式：Fe₂O₃ + 6H⁺ → 2Fe³⁺ + 3H₂O",
    "反应类型：复分解反应，不是氧化还原反应",
    "实验现象：红棕色Fe₂O₃粉末逐渐溶解，溶液变为黄色",
    "Fe³⁺的颜色：在水溶液中呈黄色（形成[Fe(H₂O)₆]³⁺配离子）",
    "Fe³⁺的检验：滴加KSCN溶液，溶液呈血红色",
    "实际应用：盐酸除铁锈（铁锈主要成分是Fe₂O₃）",
    "反应规律：碱性氧化物 + 酸 → 盐 + 水",
    "中考考点：金属氧化物性质、除锈原理、离子颜色",
    "高考考点：离子方程式书写、Fe³⁺检验方法"
  ]
}
```

##### 方程式26: 氧化铜与硫酸反应

```json
{
  "equationText": "CuO + H₂SO₄ → CuSO₄ + H₂O",
  "equationHtml": "CuO + H<sub>2</sub>SO<sub>4</sub> → CuSO<sub>4</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "reactants": [
    {"substanceId": 102, "coefficient": 1, "state": "s", "formula": "CuO", "name": "氧化铜"},
    {"substanceId": 30, "coefficient": 1, "state": "aq", "formula": "H₂SO₄", "name": "稀硫酸"}
  ],
  "products": [
    {"substanceId": 53, "coefficient": 1, "state": "aq", "formula": "CuSO₄", "name": "硫酸铜"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合初期",
      "stageType": "initiation",
      "durationEstimate": "10-20秒",
      "phenomenaDescription": "黑色CuO粉末加入稀H₂SO₄，固体表面开始溶解，溶液略微带蓝色",
      "colorChange": {
        "from": "黑色固体+无色酸",
        "to": "固体表面溶解+淡蓝色溶液"
      },
      "microscopicExplanation": "CuO + H₂SO₄ → CuSO₄ + H₂O，Cu²⁺开始进入溶液"
    },
    {
      "stageOrder": 2,
      "stageName": "溶解进行",
      "stageType": "propagation",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "黑色固体逐渐溶解消失，溶液蓝色逐渐加深",
      "colorChange": {
        "from": "淡蓝色",
        "to": "深蓝色溶液",
        "intermediate": ["无色→淡蓝→蓝色→深蓝"]
      },
      "microscopicExplanation": "CuO持续溶解，Cu²⁺浓度增加，蓝色加深"
    },
    {
      "stageOrder": 3,
      "stageName": "完全溶解",
      "stageType": "completion",
      "durationEstimate": "固体完全消失",
      "phenomenaDescription": "黑色固体完全溶解，溶液呈深蓝色",
      "colorChange": {
        "from": "蓝色+黑色固体",
        "to": "深蓝色溶液"
      },
      "microscopicExplanation": "CuO完全转化为Cu²⁺，形成蓝色的CuSO₄溶液"
    }
  ],
  "teachingInfo": {
    "studentDescription": "黑色氧化铜粉末逐渐溶解，溶液变为蓝色。",
    "teacherDescription": "Cu²⁺在水溶液中呈蓝色。验证酸的通性。",
    "keyPoints": [
      "方程式：CuO + H₂SO₄ → CuSO₄ + H₂O",
      "黑色固体溶解",
      "溶液变蓝色（Cu²⁺）"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "黑色固体", "after": "蓝色溶液", "description": "黑色CuO溶解，溶液变蓝"}
  },
  "knowledgePoints": [
    "金属氧化物与酸的反应",
    "铜离子的颜色特征",
    "酸的通性（与碱性氧化物反应）",
    "复分解反应的条件",
    "Cu²⁺的水合离子颜色"
  ]
}
```

---

#### 4.9.2 碱与非金属氧化物反应

##### 方程式27: 氢氧化钠与二氧化碳反应

```json
{
  "equationText": "2NaOH + CO₂ → Na₂CO₃ + H₂O",
  "equationHtml": "2NaOH + CO<sub>2</sub> → Na<sub>2</sub>CO<sub>3</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -175.0,
  "reactants": [
    {"substanceId": 40, "coefficient": 2, "state": "aq", "formula": "NaOH", "name": "氢氧化钠"},
    {"substanceId": 28, "coefficient": 1, "state": "g", "formula": "CO₂", "name": "二氧化碳"}
  ],
  "products": [
    {"substanceId": 103, "coefficient": 1, "state": "aq", "formula": "Na₂CO₃", "name": "碳酸钠"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "teachingInfo": {
    "studentDescription": "二氧化碳通入氢氧化钠溶液，被吸收，无明显现象。",
    "teacherDescription": "碱的通性：与酸性氧化物反应。可用于吸收CO₂。",
    "keyPoints": [
      "方程式：2NaOH + CO₂ → Na₂CO₃ + H₂O",
      "CO₂是酸性氧化物",
      "碱吸收酸性氧化物"
    ],
    "commonQuestions": [
      {"question": "如何验证CO₂被吸收？", "answer": "对比实验，用石灰水检验。"}
    ]
  },
  "knowledgePoints": [
    "碱与酸性氧化物反应的典型代表：氢氧化钠与二氧化碳反应",
    "反应方程式：2NaOH + CO₂ → Na₂CO₃ + H₂O",
    "离子方程式：2OH⁻ + CO₂ → CO₃²⁻ + H₂O",
    "反应类型：复分解反应（非氧化还原反应），放热反应",
    "酸性氧化物概念：能与碱反应生成盐和水的氧化物，CO₂是典型的酸性氧化物",
    "碱的通性：碱能与酸性氧化物反应生成盐和水",
    "实验现象：通入CO₂后无明显现象（气体被吸收，溶液无可见变化）",
    "为什么无明显现象：反应生成的Na₂CO₃溶于水，无沉淀或气体产生",
    "如何验证反应发生：①对比实验（证明气体减少）②加酸产生气泡③加CaCl₂产生沉淀",
    "过量CO₂反应：CO₂ + Na₂CO₃ + H₂O → 2NaHCO₃（生成碳酸氢钠）",
    "实际应用：①除去混合气体中的CO₂ ②NaOH变质检验（与空气中的CO₂反应）",
    "安全注意事项：NaOH溶液有强腐蚀性，避免接触皮肤和眼睛"
  ]
}
```

##### 方程式28: 氢氧化钙与二氧化碳反应

```json
{
  "equationText": "Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O",
  "equationHtml": "Ca(OH)<sub>2</sub> + CO<sub>2</sub> → CaCO<sub>3</sub>↓ + H<sub>2</sub>O",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -113.0,
  "reactants": [
    {"substanceId": 42, "coefficient": 1, "state": "aq", "formula": "Ca(OH)₂", "name": "澄清石灰水"},
    {"substanceId": 28, "coefficient": 1, "state": "g", "formula": "CO₂", "name": "二氧化碳"}
  ],
  "products": [
    {"substanceId": 59, "coefficient": 1, "state": "s", "formula": "CaCO₃", "name": "碳酸钙"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "CO₂通入初期",
      "stageType": "initiation",
      "durationEstimate": "5-10秒",
      "phenomenaDescription": "CO₂气泡通入澄清石灰水，溶液开始出现轻微浑浊",
      "colorChange": {
        "from": "澄清透明溶液",
        "to": "轻微浑浊"
      },
      "microscopicExplanation": "CO₂溶解形成CO₃²⁻，与Ca²⁺结合生成CaCO₃沉淀开始"
    },
    {
      "stageOrder": 2,
      "stageName": "沉淀形成",
      "stageType": "propagation",
      "durationEstimate": "10-30秒",
      "phenomenaDescription": "溶液变乳白色浑浊，白色沉淀逐渐增多，最终完全浑浊",
      "colorChange": {
        "from": "轻微浑浊",
        "to": "乳白色浑浊溶液"
      },
      "microscopicExplanation": "Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O，CaCO₃沉淀大量生成，悬浮于水中"
    },
    {
      "stageOrder": 3,
      "stageName": "过量CO₂通入",
      "stageType": "completion",
      "durationEstimate": "继续通CO₂",
      "phenomenaDescription": "持续通入CO₂，白色沉淀逐渐溶解，溶液变回澄清",
      "colorChange": {
        "from": "乳白色浑浊",
        "to": "澄清透明（含Ca(HCO₃)₂）"
      },
      "microscopicExplanation": "CaCO₃ + H₂O + CO₂ → Ca(HCO₃)₂，碳酸钙与过量CO₂和水反应生成可溶性碳酸氢钙"
    }
  ],
  "teachingInfo": {
    "studentDescription": "二氧化碳通入澄清石灰水，产生白色沉淀，溶液变浑浊。",
    "teacherDescription": "检验二氧化碳的典型方法。白色沉淀是碳酸钙。",
    "keyPoints": [
      "方程式：Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O",
      "检验CO₂的方法",
      "澄清石灰水变浑浊"
    ],
    "commonQuestions": [
      {"question": "继续通CO₂会怎样？", "answer": "沉淀溶解，生成可溶的Ca(HCO₃)₂。"}
    ]
  },
  "phenomena": {
    "colorChange": {"before": "澄清", "after": "白色浑浊", "description": "溶液变浑浊"},
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "白色", "precipitateDescription": "白色沉淀"}
  },
  "knowledgePoints": [
    "实验室检验二氧化碳的典型方法：CO₂通入澄清石灰水变浑浊",
    "反应方程式：Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O",
    "离子方程式：Ca²⁺ + 2OH⁻ + CO₂ → CaCO₃↓ + H₂O",
    "实验现象：澄清石灰水变浑浊，产生白色沉淀（碳酸钙）",
    "过量CO₂的后续反应：CaCO₃ + H₂O + CO₂ → Ca(HCO₃)₂（沉淀溶解）",
    "浑浊变澄清的原理：碳酸钙转化为可溶性碳酸氢钙",
    "区分CO₂和SO₂：SO₂使石灰水变浑浊的速度较慢",
    "澄清石灰水的配制：CaO溶于水并过滤，得到Ca(OH)₂饱和溶液",
    "石灰水存放：密封保存（防止与空气中CO₂反应生成CaCO₃）",
    "中考考点：CO₂的检验、沉淀与溶解的转化",
    "高考考点：离子方程式书写、过量反应分析、碳酸盐转化"
  ]
}
```

---

#### 4.9.3 盐与盐反应

##### 方程式29: 碳酸钠与氯化钙反应

```json
{
  "equationText": "Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl",
  "equationHtml": "Na<sub>2</sub>CO<sub>3</sub> + CaCl<sub>2</sub> → CaCO<sub>3</sub>↓ + 2NaCl",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "reactants": [
    {"substanceId": 103, "coefficient": 1, "state": "aq", "formula": "Na₂CO₃", "name": "碳酸钠"},
    {"substanceId": 58, "coefficient": 1, "state": "aq", "formula": "CaCl₂", "name": "氯化钙"}
  ],
  "products": [
    {"substanceId": 59, "coefficient": 1, "state": "s", "formula": "CaCO₃", "name": "碳酸钙"},
    {"substanceId": 50, "coefficient": 2, "state": "aq", "formula": "NaCl", "name": "氯化钠"}
  ],
  "teachingInfo": {
    "studentDescription": "两种无色溶液混合，产生白色沉淀。",
    "teacherDescription": "复分解反应的典型示例：盐 + 盐 → 新盐 + 新盐。",
    "keyPoints": [
      "方程式：Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl",
      "复分解反应条件：生成沉淀",
      "CaCO₃是白色沉淀"
    ]
  },
  "knowledgePoints": [
    "盐与盐反应的典型代表：碳酸钠与氯化钙发生复分解反应",
    "反应方程式：Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl",
    "离子方程式：Ca²⁺ + CO₃²⁻ → CaCO₃↓",
    "反应类型：复分解反应（两种化合物互相交换成分生成两种新的化合物）",
    "复分解反应发生的条件：生成沉淀、气体或水，本反应生成CaCO₃沉淀",
    "实验现象：两种无色溶液混合后，立即产生白色沉淀",
    "白色沉淀的性质：碳酸钙（CaCO₃）难溶于水，溶于酸产生CO₂气体",
    "沉淀的检验方法：取沉淀加稀盐酸，产生气泡，气体使澄清石灰水变浑浊",
    "工业应用：实验室制备碳酸钙、硬水软化（去除钙离子）",
    "反应的本质：钙离子与碳酸根离子结合生成难溶的碳酸钙",
    "离子共存问题：Ca²⁺与CO₃²⁻不能在溶液中大量共存",
    "中考考点：复分解反应条件、离子方程式书写、沉淀反应"
  ]
}
```

---

#### 4.9.4 碳酸盐的性质

##### 方程式30: 碳酸钠与盐酸反应

```json
{
  "equationText": "Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O",
  "equationHtml": "Na<sub>2</sub>CO<sub>3</sub> + 2HCl → 2NaCl + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "reactants": [
    {"substanceId": 103, "coefficient": 1, "state": "aq", "formula": "Na₂CO₃", "name": "碳酸钠"},
    {"substanceId": 32, "coefficient": 2, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 50, "coefficient": 2, "state": "aq", "formula": "NaCl", "name": "氯化钠"},
    {"substanceId": 28, "coefficient": 1, "state": "g", "formula": "CO₂", "name": "二氧化碳"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合瞬间",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "盐酸倒入碳酸钠溶液，立即产生大量气泡",
      "colorChange": {
        "from": "无色透明溶液",
        "to": "溶液中产生气泡"
      },
      "microscopicExplanation": "H⁺与CO₃²⁻反应生成H₂CO₃，H₂CO₃立即分解为CO₂和H₂O"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "10-30秒",
      "phenomenaDescription": "气泡持续产生，液体可能翻腾，容器壁可能有水珠",
      "colorChange": {
        "from": "产生气泡",
        "to": "大量气泡+无色溶液"
      },
      "microscopicExplanation": "Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O，CO₂气体持续产生逸出"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "气泡停止产生",
      "phenomenaDescription": "气泡产生停止，溶液变为无色的NaCl溶液",
      "colorChange": {
        "from": "气泡+溶液",
        "to": "澄清无色溶液"
      },
      "microscopicExplanation": "CO₃²⁻完全转化为CO₂气体逸出，剩余Na⁺和Cl⁻形成无色NaCl溶液"
    }
  ],
  "teachingInfo": {
    "studentDescription": "碳酸钠溶液与盐酸反应，产生气泡。",
    "teacherDescription": "碳酸盐与酸反应生成二氧化碳。可用于检验碳酸盐。",
    "keyPoints": [
      "方程式：Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O",
      "碳酸盐遇酸产生CO₂",
      "产生气泡"
    ]
  },
  "knowledgePoints": [
    "碳酸盐与强酸反应的规律和条件",
    "碳酸根离子CO₃²⁻与酸反应生成二氧化碳的机理",
    "碳酸H₂CO₃的不稳定性（易分解）",
    "复分解反应发生的条件（生成气体）",
    "碳酸盐的检验方法（加盐酸产生使澄清石灰水变浑浊的气体）",
    "碳酸钠和碳酸氢钠与酸反应的区别",
    "气体的收集和验证方法",
    "反应中的离子方程式书写（CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O）"
  ]
}
```

##### 方程式31: 碳酸氢钠与盐酸反应

```json
{
  "equationText": "NaHCO₃ + HCl → NaCl + CO₂↑ + H₂O",
  "equationHtml": "NaHCO<sub>3</sub> + HCl → NaCl + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "reactants": [
    {"substanceId": 104, "coefficient": 1, "state": "s", "formula": "NaHCO₃", "name": "碳酸氢钠"},
    {"substanceId": 32, "coefficient": 1, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 50, "coefficient": 1, "state": "aq", "formula": "NaCl", "name": "氯化钠"},
    {"substanceId": 28, "coefficient": 1, "state": "g", "formula": "CO₂", "name": "二氧化碳"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触瞬间",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "盐酸倒在NaHCO₃粉末上，立即剧烈产生气泡",
      "colorChange": {
        "from": "白色粉末+无色酸",
        "to": "大量气泡产生"
      },
      "microscopicExplanation": "HCO₃⁻ + H⁺ → H₂CO₃，H₂CO₃立即分解为CO₂和H₂O"
    },
    {
      "stageOrder": 2,
      "stageName": "剧烈反应",
      "stageType": "propagation",
      "durationEstimate": "10-20秒",
      "phenomenaDescription": "气泡大量产生，粉末迅速溶解，液体可能喷溅",
      "colorChange": {
        "from": "产生气泡",
        "to": "剧烈冒泡+澄清溶液"
      },
      "microscopicExplanation": "NaHCO₃ + HCl → NaCl + CO₂↑ + H₂O，反应快速进行"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "气泡停止",
      "phenomenaDescription": "气泡停止产生，固体完全溶解，形成无色NaCl溶液",
      "colorChange": {
        "from": "冒泡溶液",
        "to": "澄清无色溶液"
      },
      "microscopicExplanation": "NaHCO₃完全转化为NaCl和CO₂，CO₂气体逸出"
    }
  ],
  "teachingInfo": {
    "studentDescription": "碳酸氢钠（小苏打）与盐酸反应，迅速产生气泡。",
    "teacherDescription": "对比碳酸钠，碳酸氢钠与酸反应更剧烈。",
    "keyPoints": [
      "方程式：NaHCO₃ + HCl → NaCl + CO₂↑ + H₂O",
      "1:1反应比例",
      "反应比Na₂CO₃更快"
    ]
  },
  "knowledgePoints": [
    "碳酸氢盐与酸反应的规律",
    "碳酸氢根离子HCO₃⁻的性质（既能与酸反应又能与碱反应）",
    "NaHCO₃与Na₂CO₃性质的对比",
    "酸式盐与正盐的区别",
    "反应速率与物质结构的关系",
    "碳酸氢钠的用途（发酵粉、灭火器、抗酸药等）",
    "离子方程式：HCO₃⁻ + H⁺ → CO₂↑ + H₂O",
    "生活中发酵原理的化学解释"
  ]
}
```

---

### 4.10 高中化学重要反应

#### 4.10.1 铝及其化合物

##### 方程式32: 铝与盐酸反应

```json
{
  "equationText": "2Al + 6HCl → 2AlCl₃ + 3H₂↑",
  "equationHtml": "2Al + 6HCl → 2AlCl<sub>3</sub> + 3H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -1050.0,
  "oxidationChanges": [
    {"element": "Al", "from": 0, "to": "+3", "process": "氧化"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "氧化膜反应",
      "stageType": "initiation",
      "durationEstimate": "10-30秒",
      "phenomenaDescription": "铝片放入盐酸，表面氧化膜先反应，产生少量气泡",
      "colorChange": {
        "from": "银灰色铝+无色酸",
        "to": "铝表面产生少量气泡"
      },
      "microscopicExplanation": "Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O，氧化膜先被溶解"
    },
    {
      "stageOrder": 2,
      "stageName": "铝与酸反应",
      "stageType": "propagation",
      "durationEstimate": "1-3分钟",
      "phenomenaDescription": "气泡产生速率加快，铝片逐渐溶解，溶液放热",
      "colorChange": {
        "from": "少量气泡",
        "to": "大量气泡+铝片变小"
      },
      "microscopicExplanation": "2Al + 6HCl → 2AlCl₃ + 3H₂↑，金属铝开始反应，产生大量H₂"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "铝基本溶解",
      "phenomenaDescription": "气泡逐渐减少，铝片完全或基本溶解，溶液呈无色",
      "colorChange": {
        "from": "铝片变小",
        "to": "无色溶液"
      },
      "microscopicExplanation": "Al完全转化为AlCl₃溶液，反应结束"
    }
  ],
  "teachingInfo": {
    "studentDescription": "铝与盐酸反应，产生氢气和氯化铝。",
    "teacherDescription": "铝表面有氧化膜，反应初期较慢，随后加快。",
    "keyPoints": [
      "方程式：2Al + 6HCl → 2AlCl₃ + 3H₂↑",
      "Al显+3价",
      "反应放热"
    ]
  },
  "knowledgePoints": [
    "铝是两性金属，既能与酸反应产生氢气，也能与强碱反应产生氢气",
    "反应方程式：2Al + 6HCl → 2AlCl₃ + 3H₂↑",
    "离子方程式：2Al + 6H⁺ → 2Al³⁺ + 3H₂↑",
    "反应类型：置换反应，也是氧化还原反应",
    "氧化还原分析：铝元素从0价升至+3价（被氧化），氢元素从+1价降至0价（被还原）",
    "反应现象：银白色铝片逐渐溶解，表面产生大量气泡，溶液放热",
    "铝表面氧化膜：铝在空气中形成致密氧化膜(Al₂O₃)，反应初期先溶解氧化膜，然后与铝反应",
    "反应速率：反应初期较慢（氧化膜保护），氧化膜溶解后反应速率加快",
    "铝与盐酸反应的"量"的关系：2Al + 6HCl → 2AlCl₃ + 3H₂↑，铝与氢气的物质的量之比为2:3",
    "铝与氢氧化钠反应对比：2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑，等量的铝与足量酸和碱反应产生氢气量相等",
    "铝的特殊性：既能与酸反应又能与强碱反应的金属（两性金属）",
    "实验注意事项：铝片反应前可用砂纸打磨去除氧化膜以加快反应",
    "高考考点：两性金属性质、铝的计算问题、离子方程式书写",
    "中考考点：金属与酸反应、置换反应、铝的两性性质"
  ]
}
```

##### 方程式33: 铝与氢氧化钠反应

```json
{
  "equationText": "2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑",
  "equationHtml": "2Al + 2NaOH + 2H<sub>2</sub>O → 2NaAlO<sub>2</sub> + 3H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -418.0,
  "oxidationChanges": [
    {"element": "Al", "from": 0, "to": "+3", "process": "氧化"},
    {"element": "H", "from": "+1", "to": 0, "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "铝与强碱溶液反应也能产生氢气，说明铝是两性金属。",
    "teacherDescription": "两性金属的特性：既能与酸反应，也能与强碱反应。",
    "keyPoints": [
      "方程式：2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑",
      "两性金属",
      "生成偏铝酸钠"
    ],
    "commonQuestions": [
      {"question": "为什么Al能和NaOH反应？", "answer": "Al是两性金属，既能与酸反应，也能与强碱反应。"}
    ]
  },
  "knowledgePoints": [
    "铝是典型的两性金属，既能与酸反应又能与强碱反应产生氢气",
    "反应方程式：2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑",
    "离子方程式：2Al + 2OH⁻ + 2H₂O → 2AlO₂⁻ + 3H₂↑",
    "反应实质：铝先与水反应（Al + 3H₂O → Al(OH)₃ + 3/2H₂），然后Al(OH)₃与NaOH反应",
    "分步反应：①Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O（去膜） ②2Al + 6H₂O → 2Al(OH)₃ + 3H₂↑ ③Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O",
    "两性金属：既能与酸反应又能与强碱反应的金属（Al、Zn、Be等）",
    "反应现象：铝片逐渐溶解，产生气泡（氢气），溶液放热",
    "氧化还原分析：铝从0价升至+3价，氢从水中+1价降至0价",
    "等量铝与足量酸和碱反应产生氢气量相等：2Al ~ 3H₂（与酸）和2Al ~ 3H₂（与碱）",
    "铝与NaOH反应的"量"的关系：n(Al) : n(NaOH) : n(H₂) = 2 : 2 : 3",
    "反应条件：必须使用强碱（NaOH、KOH），不能用弱碱（氨水）",
    "高考考点：两性金属性质、铝的计算问题、离子方程式书写、图像分析",
    "中考考点：金属与酸/碱反应、铝的特殊性质"
  ]
}
```

##### 方程式34: 氧化铝与盐酸反应

```json
{
  "equationText": "Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O",
  "equationHtml": "Al<sub>2</sub>O<sub>3</sub> + 6HCl → 2AlCl<sub>3</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氧化铝溶于盐酸，生成氯化铝。",
    "teacherDescription": "两性氧化物的性质：既能与酸反应，也能与碱反应。",
    "keyPoints": [
      "方程式：Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O",
      "两性氧化物",
      "Al₂O₃是白色固体"
    ]
  }
}
```

##### 方程式35: 氧化铝与氢氧化钠反应

```json
{
  "equationText": "Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O",
  "equationHtml": "Al<sub>2</sub>O<sub>3</sub> + 2NaOH → 2NaAlO<sub>2</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氧化铝溶于氢氧化钠溶液，生成偏铝酸钠。",
    "teacherDescription": "验证氧化铝的两性。",
    "keyPoints": [
      "方程式：Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O",
      "两性氧化物与碱反应"
    ]
  }
}
```

##### 方程式36: 氢氧化铝与盐酸反应

```json
{
  "equationText": "Al(OH)₃ + 3HCl → AlCl₃ + 3H₂O",
  "equationHtml": "Al(OH)<sub>3</sub> + 3HCl → AlCl<sub>3</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氢氧化铝白色沉淀溶于盐酸。",
    "teacherDescription": "两性氢氧化物的性质。Al(OH)₃是典型的两性氢氧化物。",
    "keyPoints": [
      "方程式：Al(OH)₃ + 3HCl → AlCl₃ + 3H₂O",
      "两性氢氧化物",
      "白色沉淀"
    ]
  },
  "knowledgePoints": [
    "氢氧化铝是典型的两性氢氧化物，既能与酸反应又能与强碱反应",
    "两性的本质：Al(OH)₃存在两种电离方式（酸式电离和碱式电离）",
    "碱式电离：Al(OH)₃ ⇌ Al³⁺ + 3OH⁻（表现碱性，与酸反应）",
    "与酸反应：Al(OH)₃ + 3HCl → AlCl₃ + 3H₂O",
    "离子方程式：Al(OH)₃ + 3H⁺ → Al³⁺ + 3H₂O",
    "反应现象：白色Al(OH)₃沉淀溶解在酸中，形成无色溶液",
    "铝三角转化关系：Al³⁺ ⇌ Al(OH)₃ ⇌ AlO₂⁻",
    "制备氢氧化铝：可用氨水与铝盐反应（避免强碱过量导致沉淀溶解）",
    "应用：氢氧化铝用于治疗胃酸过多（中和胃酸）",
    "两性氢氧化物判断：既能溶于强酸又能溶于强碱的氢氧化物",
    "教学重点：两性氢氧化物的概念、铝三角的转化关系",
    "高考考点：两性氢氧化物的性质、离子方程式书写、图像分析"
  ]
}
```

##### 方程式37: 氢氧化铝与氢氧化钠反应

```json
{
  "equationText": "Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O",
  "equationHtml": "Al(OH)<sub>3</sub> + NaOH → NaAlO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氢氧化铝沉淀溶解在氢氧化钠溶液中。",
    "teacherDescription": "氢氧化铝的两性：既能与酸反应，也能与强碱反应。",
    "keyPoints": [
      "方程式：Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O",
      "沉淀溶解"
    ],
    "commonQuestions": [
      {"question": "为什么Al(OH)₃是两性的？", "answer": "既能电离出H⁺表现为酸，也能电离出OH⁻表现为碱。"}
    ]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "加入碱液",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "向白色Al(OH)₃沉淀中加入NaOH溶液，沉淀表面开始溶解",
      "colorChange": {
        "from": "白色沉淀+无色溶液",
        "to": "白色沉淀边缘溶解"
      },
      "microscopicExplanation": "OH⁻离子与Al(OH)₃反应：Al(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O，酸性电离被促进"
    },
    {
      "stageOrder": 2,
      "stageName": "沉淀溶解",
      "stageType": "propagation",
      "durationEstimate": "几秒-1分钟",
      "phenomenaDescription": "白色沉淀逐渐减少，溶液逐渐变清，沉淀完全溶解",
      "colorChange": {
        "from": "白色浑浊",
        "to": "逐渐澄清"
      },
      "microscopicExplanation": "Al(OH)₃持续溶解生成偏铝酸根AlO₂⁻，形成无色透明溶液"
    },
    {
      "stageOrder": 3,
      "stageName": "溶解完成",
      "stageType": "completion",
      "durationEstimate": "1-2分钟后",
      "phenomenaDescription": "白色沉淀完全消失，溶液呈透明无色",
      "colorChange": {
        "from": "浑浊溶液",
        "to": "透明无色溶液"
      },
      "microscopicExplanation": "Al(OH)₃完全转化为NaAlO₂溶液，证明Al(OH)₃的两性（既能与酸反应又能与碱反应）"
    }
  ],
  "knowledgePoints": [
    "氢氧化铝表现酸性，与强碱反应生成偏铝酸盐",
    "酸式电离：Al(OH)₃ ⇌ H⁺ + AlO₂⁻ + H₂O（表现酸性，与碱反应）",
    "与强碱反应：Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O",
    "离子方程式：Al(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O",
    "反应现象：白色Al(OH)₃沉淀溶解在强碱中，形成无色溶液",
    "铝三角转化：Al³⁺ → Al(OH)₃ → AlO₂⁻（加碱促进转化）",
    "为什么只能用强碱：弱碱如氨水不能使Al(OH)₃溶解",
    "两性氢氧化物的判断标准：既能溶于强酸又能溶于强碱",
    "偏铝酸根的性质：AlO₂⁻遇酸会沉淀（加适量酸生成Al(OH)₃，加过量酸生成Al³⁺）",
    "制备偏铝酸盐的方法：Al(OH)₃或Al₂O₃与强碱反应",
    "实验注意：AlCl₃溶液中滴加NaOH先产生沉淀后溶解",
    "教学重点：两性氢氧化物的概念、铝三角的相互转化",
    "高考考点：离子方程式书写、沉淀图像分析、铝三角转化"
  ]
}
```

---

#### 4.10.2 钠及其化合物

##### 方程式38: 钠在氯气中燃烧

```json
{
  "equationText": "2Na + Cl₂ → 2NaCl",
  "equationHtml": "2Na + Cl<sub>2</sub> → 2NaCl",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -822.0,
  "conditions": {"temperature": "点燃"},
  "oxidationChanges": [
    {"element": "Na", "from": 0, "to": "+1", "process": "氧化"},
    {"element": "Cl", "from": 0, "to": "-1", "process": "还原"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 272,
      "secondaryEquationText": "2Na + O₂ → Na₂O₂",
      "secondaryEquationHtml": "2Na + O<sub>2</sub> → Na<sub>2</sub>O<sub>2</sub>",
      "relationship": "parallel",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "oxygenPresent": true
      },
      "phenomenonImpact": {
        "description": "钠优先与氧气反应生成过氧化钠"
      },
      "teachingNote": "氯气中若含氧气杂质，会同时生成Na₂O₂"
    },
    {
      "secondaryEquationId": 273,
      "secondaryEquationText": "2Na + H₂O → 2NaOH + H₂↑",
      "secondaryEquationHtml": "2Na + H<sub>2</sub>O → 2NaOH + H<sub>2</sub>↑",
      "relationship": "side",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "moisturePresent": true
      },
      "phenomenonImpact": {
        "description": "氯气中含水时，钠先与水反应"
      },
      "teachingNote": "反应前需干燥氯气和钠"
    }
  ],
  "teachingInfo": {
    "studentDescription": "钠在氯气中剧烈燃烧，产生黄色火焰，生成白色氯化钠固体。",
    "teacherDescription": "演示金属与非金属的化合反应。注意安全。",
    "keyPoints": [
      "方程式：2Na + Cl₂ → 2NaCl",
      "剧烈燃烧",
      "黄色火焰",
      "生成白烟（NaCl固体小颗粒）"
    ],
    "safetyNotes": ["通风良好", "佩戴护目镜"]
  },
  "phenomena": {
    "colorChange": {"before": "银白色", "after": "白色固体"},
    "temperatureChange": {"isExothermic": true, "description": "剧烈放热，黄色火焰"}
  },
  "knowledgePoints": [
    "金属与非金属化合反应的典型代表：钠在氯气中燃烧",
    "反应方程式：2Na + Cl₂ → 2NaCl（条件：点燃）",
    "反应类型：化合反应（两种物质生成一种物质），也是氧化还原反应",
    "实验现象：剧烈燃烧，黄色火焰，产生白烟，生成白色固体",
    "黄色火焰的原因：钠原子外层电子跃迁释放特定波长黄光（589-590nm）",
    "白烟的微观解释：反应生成的NaCl固体小颗粒悬浮在空气中形成烟",
    "反应条件：必须点燃才能进行（常温下钠与氯气反应极慢）",
    "氧化还原分析：Na从0价升至+1价（失电子被氧化），Cl从0价降至-1价（得电子被还原）",
    "反应本质：金属钠与非金属氯气之间发生电子转移，形成离子键",
    "NaCl的电子式：Na⁺[∶Cl̈∶]⁻（钠离子与氯离子通过静电作用形成离子键）",
    "实验安全：氯气有毒，必须在通风橱中进行，反应放热剧烈需注意防护",
    "实际应用：工业制氯化钠（食盐）、演示离子键的形成",
    "与钠在空气中燃烧对比：空气中生成Na₂O₂（淡黄色），氯气中生成NaCl（白色）",
    "高考考点：氧化还原分析、离子键形成、实验现象描述"
  ]
}
```

##### 方程式39: 过氧化钠与水反应

```json
{
  "equationText": "2Na₂O₂ + 2H₂O → 4NaOH + O₂↑",
  "equationHtml": "2Na<sub>2</sub>O<sub>2</sub> + 2H<sub>2</sub>O → 4NaOH + O<sub>2</sub>↑",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -215.0,
  "oxidationChanges": [
    {"element": "O", "from": "-1", "to": "-2", "process": "还原"},
    {"element": "O", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "淡黄色过氧化钠粉末与水反应，产生气泡，溶液显碱性。",
    "teacherDescription": "过氧化钠既是氧化剂又是还原剂（歧化反应）。",
    "keyPoints": [
      "方程式：2Na₂O₂ + 2H₂O → 4NaOH + O₂↑",
      "产生氧气",
      "溶液显碱性",
      "Na₂O₂是淡黄色固体"
    ],
    "safetyNotes": ["反应放热", "产生氧气助燃"]
  },
  "knowledgePoints": [
    "过氧化钠与水的反应是典型的歧化反应，氧元素发生自身氧化还原",
    "反应方程式：2Na₂O₂ + 2H₂O → 4NaOH + O₂↑",
    "歧化反应分析：Na₂O₂中O为-1价，反应后部分降至-2价（NaOH中），部分升至0价（O₂中）",
    "Na₂O₂既是氧化剂又是还原剂：自身发生电子转移，水既不是氧化剂也不是还原剂",
    "实验现象：淡黄色固体逐渐溶解，产生大量气泡（氧气），反应放热，溶液使酚酞变红",
    "Na₂O₂的物理性质：淡黄色固体，是钠的特殊氧化物（Na₂O是白色）",
    "反应特点：放热反应，产生氧气，溶液显碱性",
    "应用：呼吸面具和潜水艇中的供氧剂来源之一",
    "电子转移分析：每生成1mol O₂转移2mol电子（2个O⁻ → O₂ + 2e⁻，2个O⁻ + 2e⁻ → 2O²⁻）",
    "Na₂O₂与Na₂O的对比：Na₂O₂是过氧化物，Na₂O是碱性氧化物",
    "高考考点：歧化反应分析、电子转移计算、钠及其化合物性质",
    "中考考点：氧气的实验室制法、钠的化合物性质"
  ]
}
```

##### 方程式40: 过氧化钠与二氧化碳反应

```json
{
  "equationText": "2Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂",
  "equationHtml": "2Na<sub>2</sub>O<sub>2</sub> + 2CO<sub>2</sub> → 2Na<sub>2</sub>CO<sub>3</sub> + O<sub>2</sub>",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -511.0,
  "oxidationChanges": [
    {"element": "O", "from": "-1", "to": "-2", "process": "还原"},
    {"element": "C", "from": "+4", "to": "+4", "process": "不变"},
    {"element": "O", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "过氧化钠与二氧化碳反应生成碳酸钠和氧气。",
    "teacherDescription": "呼吸面具中的供氧原理。潜水、航天使用。",
    "keyPoints": [
      "方程式：2Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂",
      "潜水供氧原理",
      "航天供氧"
    ]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "气体接触",
      "stageType": "initiation",
      "durationEstimate": "立即开始",
      "phenomenaDescription": "CO₂气体通过淡黄色Na₂O₂粉末，粉末表面开始反应，产生少量气泡",
      "colorChange": {
        "from": "淡黄色粉末+无色气体",
        "to": "粉末表面+气泡产生"
      },
      "microscopicExplanation": "2Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂，CO₂与Na₂O₂接触，O-O键断裂重组"
    },
    {
      "stageOrder": 2,
      "stageName": "持续反应",
      "stageType": "propagation",
      "durationEstimate": "持续进行",
      "phenomenaDescription": "淡黄色粉末逐渐转变为白色粉末，持续产生氧气",
      "colorChange": {
        "from": "淡黄色粉末",
        "to": "白色粉末+气体产生"
      },
      "microscopicExplanation": "Na₂O₂(-1价O)歧化：2O⁻² → O²⁻ + O，生成Na₂CO₃和O₂，反应放热"
    },
    {
      "stageOrder": 3,
      "stageName": "转化完成",
      "stageType": "completion",
      "durationEstimate": "CO₂完全反应后",
      "phenomenaDescription": "淡黄色粉末完全变为白色Na₂CO₃粉末，氧气产生停止",
      "colorChange": {
        "from": "淡黄色粉末",
        "to": "白色粉末"
      },
      "microscopicExplanation": "Na₂O₂完全转化为Na₂CO₃，O₂释放完成，白色粉末为碳酸钠"
    }
  ],
  "knowledgePoints": [
    "过氧化钠与二氧化碳反应的原理和机理",
    "呼吸面具和潜水供氧系统的化学基础（Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂）",
    "歧化反应的概念（同一元素既被氧化又被还原）",
    "-1价氧的特殊化学性质（不稳定，易歧化）",
    "航天和潜水作业中氧气供应的化学方法",
    "过氧化钠的保存方法（密闭、干燥，防止与CO₂和H₂O反应）",
    "反应过程中的颜色变化（淡黄色→白色）和能量变化",
    "CO₂回收利用的化学方法（将CO₂转化为O₂和碳酸盐）",
    "密闭空间中氧气再生的原理",
    "与Na₂O₂ + H₂O反应的区别和联系"
  ]
}
```

---

#### 4.10.3 氨和铵盐

##### 方程式41: 氨的实验室制法

```json
{
  "equationText": "2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O",
  "equationHtml": "2NH<sub>4</sub>Cl + Ca(OH)<sub>2</sub> → CaCl<sub>2</sub> + 2NH<sub>3</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "reactants": [
    {"substanceId": 105, "coefficient": 2, "state": "s", "formula": "NH₄Cl", "name": "氯化铵"},
    {"substanceId": 42, "coefficient": 1, "state": "s", "formula": "Ca(OH)₂", "name": "氢氧化钙"}
  ],
  "products": [
    {"substanceId": 58, "coefficient": 1, "state": "aq", "formula": "CaCl₂", "name": "氯化钙"},
    {"substanceId": 106, "coefficient": 2, "state": "g", "formula": "NH₃", "name": "氨气"},
    {"substanceId": 70, "coefficient": 2, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "teachingInfo": {
    "studentDescription": "氯化铵与氢氧化钙固体混合加热，产生氨气。",
    "teacherDescription": "实验室制氨气的常用方法。固固加热装置。",
    "keyPoints": [
      "方程式：2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O",
      "固固加热装置",
      "向下排空气法收集",
      "湿润红色石蕊试纸检验"
    ],
    "commonQuestions": [
      {"question": "为什么不用NaOH？", "answer": "NaOH易吸湿，加热时容易腐蚀玻璃。"},
      {"question": "如何检验NH₃？", "answer": "用湿润红色石蕊试纸，变蓝；或用沾浓盐酸的玻璃棒，产生白烟。"}
    ],
    "safetyNotes": ["氨气有刺激性气味", "通风良好", "防止倒吸"]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合预热",
      "stageType": "initiation",
      "durationEstimate": "30秒-1分钟",
      "phenomenaDescription": "白色NH₄Cl粉末和白色Ca(OH)₂粉末混合均匀，装入试管开始加热",
      "colorChange": {
        "from": "白色固体粉末",
        "to": "白色固体粉末混合物"
      },
      "microscopicExplanation": "NH₄Cl和Ca(OH)₂固体颗粒接触混合，加热使温度逐渐升高"
    },
    {
      "stageOrder": 2,
      "stageName": "加热反应",
      "stageType": "propagation",
      "durationEstimate": "2-5分钟",
      "phenomenaDescription": "试管口出现水珠，产生刺激性气味的无色气体，湿润红色石蕊试纸变蓝",
      "colorChange": {
        "from": "白色固体",
        "to": "白色固体+水珠+气体"
      },
      "microscopicExplanation": "2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O，NH₄⁺与OH⁻结合生成NH₃和H₂O，NH₃气体逸出"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "不再产生气体",
      "phenomenaDescription": "气体产生逐渐减少直至停止，试管壁水珠明显，固体残渣为CaCl₂",
      "colorChange": {
        "from": "固体+气体",
        "to": "白色固体残渣"
      },
      "microscopicExplanation": "NH₄Cl完全反应，剩余CaCl₂固体，NH₃和H₂O已逸出"
    }
  ],
  "knowledgePoints": [
    "实验室制氨气的标准方法：氯化铵与氢氧化钙固体混合加热",
    "反应方程式：2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O",
    "反应装置：固固加热型（与制O₂装置类似）",
    "气体收集：向下排空气法（NH₃密度小于空气）",
    "NH₃检验：①湿润红色石蕊试纸变蓝 ②沾浓盐酸的玻璃棒产生白烟",
    "实验注意事项：试管口放棉花（防止NH₃与空气对流），防止倒吸",
    "为什么用Ca(OH)₂不用NaOH：NaOH易吸湿，加热时腐蚀玻璃",
    "为什么不用NH₄NO₃：NH₄NO₃加热可能爆炸或分解",
    "NH₃的性质：无色刺激性气味气体，极易溶于水（1:700），水溶液呈碱性",
    "应用：制氮肥、制硝酸、制冷剂",
    "中考考点：实验室制气、气体收集方法、气体验验",
    "高考考点：离子方程式书写、实验装置选择"
  ]
}
```

##### 方程式42: 氨气与水反应

```json
{
  "equationText": "NH₃ + H₂O ⇌ NH₃·H₂O ⇌ NH₄⁺ + OH⁻",
  "equationHtml": "NH<sub>3</sub> + H<sub>2</sub>O ⇌ NH<sub>3</sub>·H<sub>2</sub>O ⇌ NH<sub>4</sub><sup>+</sup> + OH<sup>-</sup>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氨气极易溶于水，氨水显弱碱性。",
    "teacherDescription": "氨水的碱性源于NH₃与H₂O反应产生的OH⁻。可逆反应。",
    "keyPoints": [
      "NH₃极易溶于水（1:700）",
      "氨水显弱碱性",
      "可逆反应"
    ],
    "commonQuestions": [
      {"question": "氨水是电解质吗？", "answer": "不是，NH₃是电解质，氨水是混合物。"},
      {"question": "为什么氨水显碱性？", "answer": "NH₃结合H₂O中的H⁺，释放OH⁻。"}
    ]
  },
  "knowledgePoints": [
    "氨气与水的反应是理解氨水性质的基础，也是理解氨气喷泉实验的关键",
    "反应过程：NH₃ + H₂O ⇌ NH₃·H₂O ⇌ NH₄⁺ + OH⁻（双重平衡）",
    "第一步：氨气溶于水形成一水合氨（NH₃·H₂O），是物理化学过程",
    "第二步：一水合氨部分电离产生铵根离子和氢氧根离子，是弱电解质电离",
    "反应类型：化合反应（NH₃与H₂O结合），也是可逆反应",
    "氨气的溶解性：极易溶于水（1体积水可溶解700体积氨气），这是喷泉实验的基础",
    "氨水的成分：三种分子（NH₃、H₂O、NH₃·H₂O），三种离子（NH₄⁺、OH⁻、H⁺，极少）",
    "氨水的碱性：由于NH₃·H₂O电离产生OH⁻，使溶液显弱碱性（pH < 11）",
    "氨水的性质：①弱碱性（使酚酞变红）②挥发性（浓氨水易挥发）③络合性（与Ag⁺、Cu²⁺形成络合物）",
    "氨气与液氨的区别：氨气是气体，液氨是纯净物（液态氨），氨水是混合物（氨气的水溶液）",
    "氨水的用途：①清洁剂 2化肥工业 ③实验室制备氨气 ④医药",
    "实验室制氨气：铵盐与碱共热，用Ca(OH)₂而不用NaOH（NaOH易吸湿，不利于加热）",
    "收集方法：向下排空气法（氨气密度比空气小），不能用排水法（氨气极易溶于水）",
    "检验方法：①湿润红色石蕊试纸变蓝 ②浓盐酸靠近产生白烟",
    "氨气喷泉实验原理：氨气极易溶于水，使烧瓶内压强急剧降低，形成喷泉",
    "安全注意事项：氨气有刺激性气味，有毒；浓氨水有腐蚀性",
    "高考考点：①氨气与水的反应 ②氨水的性质 ③氨气实验室制法 ④喷泉实验原理",
    "中考考点：①氨气性质 ②氨水碱性 ③实验现象"
  ]
}
```

##### 方程式43: 氨气与盐酸反应

```json
{
  "equationText": "NH₃ + HCl → NH₄Cl",
  "equationHtml": "NH<sub>3</sub> + HCl → NH<sub>4</sub>Cl",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -176.0,
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "气体接触",
      "stageType": "initiation",
      "durationEstimate": "瞬间",
      "phenomenaDescription": "NH₃气体与HCl气体（或浓盐酸挥发的HCl）相遇，立即产生白烟",
      "colorChange": {
        "from": "无色气体",
        "to": "白色烟状物"
      },
      "microscopicExplanation": "NH₃ + HCl → NH₄Cl，气相分子反应生成固态NH₄Cl小颗粒"
    },
    {
      "stageOrder": 2,
      "stageName": "白烟扩散",
      "stageType": "propagation",
      "durationEstimate": "几秒",
      "phenomenaDescription": "白烟逐渐扩散，周围空间可见白色烟雾状物质",
      "colorChange": {
        "from": "白色烟状物",
        "to": "扩散的白色烟雾"
      },
      "microscopicExplanation": "NH₄Cl固体小颗粒悬浮在空气中，形成烟状物"
    },
    {
      "stageOrder": 3,
      "stageName": "沉降",
      "stageType": "completion",
      "durationEstimate": "数分钟",
      "phenomenaDescription": "白烟逐渐沉降或消失，可观察到容器壁或地面有白色固体",
      "colorChange": {
        "from": "白色烟雾",
        "to": "白色固体粉末"
      },
      "microscopicExplanation": "NH₄Cl小颗粒沉降到表面或吸附在物体上"
    }
  ],
  "teachingInfo": {
    "studentDescription": "氨气与氯化氢气体相遇，产生白烟。",
    "teacherDescription": "白烟是氯化铵固体小颗粒。可用于检验氨气。",
    "keyPoints": [
      "方程式：NH₃ + HCl → NH₄Cl",
      "产生白烟",
      "气体间反应"
    ]
  },
  "phenomena": {
    "description": "产生大量白烟",
    "observationPoints": ["观察白烟生成"]
  },
  "knowledgePoints": [
    "氨气与氯化氢气体的化合反应",
    "白烟现象的微观解释（固体小颗粒悬浮）",
    "氨气的检验方法（沾浓盐酸的玻璃棒产生白烟）",
    "气体之间反应的特点（无需溶剂，直接接触反应）",
    "铵盐的制备方法",
    "NH₃与酸反应的通性（生成铵盐）",
    "氨气的物理性质（无色刺激性气味气体）",
    "氯化铵的性质（易溶于水，受热分解）",
    "烟与雾的区别（烟：固体小颗粒；雾：液体小液滴）"
  ]
}
```

##### 方程式44: 氨气催化氧化

```json
{
  "equationText": "4NH₃ + 5O₂ → 4NO + 6H₂O",
  "equationHtml": "4NH<sub>3</sub> + 5O<sub>2</sub> → 4NO + 6H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -907.0,
  "conditions": {"temperature": "加热", "catalyst": "Pt-Rh"},
  "oxidationChanges": [
    {"element": "N", "from": "-3", "to": "+2", "process": "氧化"},
    {"element": "O", "from": 0, "to": "-2", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "氨气在催化剂存在下与氧气反应生成一氧化氮和水。",
    "teacherDescription": "工业制硝酸的第一步反应。铂铑合金作催化剂。",
    "keyPoints": [
      "方程式：4NH₃ + 5O₂ → 4NO + 6H₂O",
      "催化氧化",
      "工业制HNO₃第一步"
    ]
  },
  "knowledgePoints": [
    "氨的催化氧化是工业制硝酸的第一步反应（奥斯特瓦尔德法）",
    "反应方程式：4NH₃ + 5O₂ → 4NO + 6H₂O（催化剂存在，加热）",
    "催化剂：铂铑合金网（Pt-Rh合金），高温下呈红热状态",
    "反应条件：加热（760-840℃），催化剂存在",
    "反应类型：氧化还原反应，氨气中的氮元素从-3价升至+2价",
    "实验现象：铂铑合金网保持红热，说明该反应是放热反应",
    "工业流程：氨催化氧化→NO氧化→NO₂→硝酸吸收",
    "氧化还原分析：NH₃中N(-3)→NO中N(+2)，失去5个电子被氧化",
    "高考考点：①氨的催化氧化 ②工业制硝酸流程 ③氧化还原反应分析",
    "注意事项：氨气与空气要按适当比例混合，防止爆炸",
    "实际应用：工业生产硝酸的基础反应，也是最重要的硝酸生产方法",
    "环境保护：硝酸厂尾气含NO、NO₂，需要处理后排放（防止光化学烟雾）"
  ]
}
```

##### 方程式45: 铵盐受热分解

```json
{
  "equationText": "NH₄Cl → NH₃↑ + HCl↑",
  "equationHtml": "NH<sub>4</sub>Cl → NH<sub>3</sub>↑ + HCl↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "氯化铵受热分解，遇冷又重新结合。",
    "teacherDescription": "类似升华现象，但不是物理变化，是化学变化。",
    "keyPoints": [
      "方程式：NH₄Cl → NH₃↑ + HCl↑",
      "冷却重新结合",
      "不是真正的升华"
    ]
  },
  "knowledgePoints": [
    "氯化铵受热分解，冷却后重新结合，类似升华但本质不同",
    "反应方程式：NH₄Cl → NH₃↑ + HCl↑（加热）",
    "可逆过程：NH₃ + HCl → NH₄Cl（冷却时重新结合）",
    "实验现象：试管底部白色固体消失，试管口有白色固体重新生成",
    "与升华的区别：升华是物理变化，这是化学变化（分解后再化合）",
    "应用：碘的检验（NH₄Cl受热分解，可用于区分碘和氯化铵）",
    "NH₄Cl的性质：无色晶体，易溶于水，水溶液显酸性",
    "铵盐的共性：受热易分解，与碱反应放出氨气",
    "实验注意事项：加热时试管口略向下倾斜，防止冷凝水倒流",
    "中考考点：①铵盐的性质 ②物理变化与化学变化的区别",
    "高考考点：①铵盐的热分解 ④实验现象解释",
    "实际应用：实验室制备少量氨气（与碱共热）"
  ]
}
```

---

#### 4.10.4 硫及其化合物

##### 方程式46: 二氧化硫与氧气反应

```json
{
  "equationText": "2SO₂ + O₂ ⇌ 2SO₃",
  "equationHtml": "2SO<sub>2</sub> + O<sub>2</sub> ⇌ 2SO<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热", "catalyst": "V₂O₅"},
  "oxidationChanges": [
    {"element": "S", "from": "+4", "to": "+6", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "二氧化硫在催化剂作用下与氧气反应生成三氧化硫。",
    "teacherDescription": "可逆反应，工业制硫酸的关键反应。",
    "keyPoints": [
      "方程式：2SO₂ + O₂ ⇌ 2SO₃",
      "可逆反应",
      "V₂O₅催化",
      "制硫酸中间反应"
    ]
  }
}
```

##### 方程式47: 二氧化硫与水反应

```json
{
  "equationText": "SO₂ + H₂O ⇌ H₂SO₃",
  "equationHtml": "SO<sub>2</sub> + H<sub>2</sub>O ⇌ H<sub>2</sub>SO<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "二氧化硫溶于水生成亚硫酸，亚硫酸不稳定。",
    "teacherDescription": "酸性氧化物的性质。可逆反应。",
    "keyPoints": [
      "方程式：SO₂ + H₂O ⇌ H₂SO₃",
      "亚硫酸不稳定",
      "SO₂是酸性氧化物"
    ]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "气体溶解",
      "stageType": "mixing",
      "durationEstimate": "几秒内开始",
      "phenomenaDescription": "无色刺激性气味的SO₂气体通入水中，迅速溶解",
      "colorChange": {
        "from": "无色气体+无色水",
        "to": "无色溶液"
      },
      "microscopicExplanation": "SO₂分子与H₂O分子发生水合作用：SO₂ + H₂O → SO₂·H₂O"
    },
    {
      "stageOrder": 2,
      "stageName": "酸化过程",
      "stageType": "reacting",
      "durationEstimate": "持续进行",
      "phenomenaDescription": "溶液逐渐显酸性，可用pH试纸检测，pH值下降",
      "colorChange": {
        "from": "中性溶液",
        "to": "酸性溶液(pH<7)"
      },
      "microscopicExplanation": "SO₂·H₂O ⇌ H⁺ + HSO₃⁻，亚硫酸电离产生H⁺，溶液显酸性"
    },
    {
      "stageOrder": 3,
      "stageName": "平衡建立",
      "stageType": "completion",
      "durationEstimate": "达到动态平衡",
      "phenomenaDescription": "溶液呈酸性，SO₂继续溶解直到饱和，可逆反应达到平衡",
      "colorChange": {
        "from": "酸性增强中",
        "to": "稳定酸性溶液"
      },
      "microscopicExplanation": "SO₂ + H₂O ⇌ H₂SO₃ ⇌ 2H⁺ + SO₃²⁻，建立溶解与电离平衡，H₂SO₃易分解放出SO₂"
    }
  ],
  "knowledgePoints": [
    "二氧化硫与水的反应是典型的可逆反应，也是酸性氧化物的通性",
    "反应方程式：SO₂ + H₂O ⇌ H₂SO₃（可逆反应）",
    "反应类型：化合反应（可逆），非氧化还原反应",
    "可逆反应概念：在相同条件下既能向正反应方向进行，又能向逆反应方向进行的反应",
    "亚硫酸的性质：①中强酸 ②不稳定，易分解 ③只存在于水溶液中",
    "亚硫酸分解：H₂SO₃ → SO₂↑ + H₂O（加热或浓度高时分解）",
    "SO₂的溶解性：1体积水能溶解40体积SO₂，易溶于水",
    "酸性氧化物概念：能与碱反应生成盐和水的氧化物，SO₂是典型的酸性氧化物",
    "实验现象：SO₂气体通入水中，迅速溶解，溶液显酸性（pH<7）",
    "酸性比较：亚硫酸酸性 > 碳酸（H₂SO₃ > H₂CO₃）",
    "实际应用：①酸雨形成（SO₂ + H₂O → H₂SO₃）②二氧化硫的吸收和净化",
    "高考考点：①可逆反应 ②酸性氧化物 ③亚硫酸的性质 ④酸性比较",
    "中考考点：①酸性氧化物的通性 ②SO₂的水溶性 ③溶液酸碱性",
    "环境问题：SO₂是形成酸雨的主要物质之一"
  ]
}
```

##### 方程式48: 二氧化硫与氢氧化钠反应

```json
{
  "equationText": "SO₂ + 2NaOH → Na₂SO₃ + H₂O",
  "equationHtml": "SO<sub>2</sub> + 2NaOH → Na<sub>2</sub>SO<sub>3</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "二氧化硫被氢氧化钠溶液吸收，生成亚硫酸钠。",
    "teacherDescription": "工业上常用碱液吸收SO₂，防止污染。",
    "keyPoints": [
      "方程式：SO₂ + 2NaOH → Na₂SO₃ + H₂O",
      "酸性氧化物与碱反应"
    ]
  },
  "knowledgePoints": [
    "酸性氧化物与碱反应的典型代表：二氧化硫与氢氧化钠反应",
    "反应方程式：SO₂ + 2NaOH → Na₂SO₃ + H₂O",
    "离子方程式：SO₂ + 2OH⁻ → SO₃²⁻ + H₂O",
    "反应类型：复分解反应（非氧化还原反应），也是放热反应",
    "酸性氧化物通性：能与碱反应生成盐和水",
    "过量SO₂的反应：SO₂ + NaOH → NaHSO₃（生成亚硫酸氢钠）",
    "实验现象：SO₂气体通入NaOH溶液，被吸收，无明显外观变化",
    "为什么无明显现象：反应生成的Na₂SO₃溶于水，无沉淀或气体产生",
    "实际应用：工业上处理含SO₂废气，防止空气污染",
    "尾气处理：实验室SO₂尾气用NaOH溶液吸收",
    "亚硫酸钠的性质：白色固体，易溶于水，易被氧化",
    "高考考点：①酸性氧化物 ②离子方程式 ③过量反应分析 ④尾气处理",
    "中考考点：①碱的通性 ②酸性氧化物 ③环境保护"
  ]
}
```

---

#### 4.10.5 氮氧化物

##### 方程式49: 一氧化氮与氧气反应

```json
{
  "equationText": "2NO + O₂ → 2NO₂",
  "equationHtml": "2NO + O<sub>2</sub> → 2NO<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "N", "from": "+2", "to": "+4", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "无色一氧化氮与氧气反应生成红棕色二氧化氮。",
    "teacherDescription": "NO遇空气立即变红棕色。",
    "keyPoints": [
      "方程式：2NO + O₂ → 2NO₂",
      "NO无色",
      "NO₂红棕色"
    ]
  },
  "knowledgePoints": [
    "一氧化氮与氧气的反应是氮氧化物化学中的重要反应",
    "反应方程式：2NO + O₂ → 2NO₂",
    "反应类型：化合反应，也是氧化还原反应",
    "氧化还原分析：N从+2价升至+4价（失电子被氧化），O从0价降至-2价（得电子被还原）",
    "实验现象：无色NO气体接触空气立即变成红棕色NO₂气体",
    "NO的性质：无色、无味、有毒、不溶于水、遇空气立即变红棕色",
    "NO₂的性质：红棕色、刺激性气味、有毒、能溶于水",
    "反应条件：常温下即可进行，无需点燃或加热",
    "反应速率：常温下反应迅速，NO接触空气立即变色",
    "颜色变化原因：NO（无色）被氧化为NO₂（红棕色），颜色变化明显",
    "实际应用：①工业制硝酸（氨催化氧化生成NO，NO氧化为NO₂）②环境监测（NO排放会转化为NO₂）",
    "可逆反应：高温下NO₂可分解为NO和O₂（2NO₂ ⇌ 2NO + O₂）",
    "雷雨发庄稼：闪电时N₂ + O₂ → 2NO，NO + O₂ → NO₂，NO₂ + H₂O → HNO₃",
    "高考考点：①氮的氧化物转化 ②氧化还原分析 ③硝酸工业制备",
    "中考考点：①NO和NO₂的识别 ②实验现象描述"
  ]
}
```

##### 方程式50: 二氧化氮与水反应

```json
{
  "equationText": "3NO₂ + H₂O → 2HNO₃ + NO",
  "equationHtml": "3NO<sub>2</sub> + H<sub>2</sub>O → 2HNO<sub>3</sub> + NO",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "N", "from": "+4", "to": "+5", "process": "氧化"},
    {"element": "N", "from": "+4", "to": "+2", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "红棕色二氧化氮溶于水，生成硝酸和无色一氧化氮。",
    "teacherDescription": "工业制硝酸的反应之一。NO₂既是氧化剂又是还原剂。",
    "keyPoints": [
      "方程式：3NO₂ + H₂O → 2HNO₃ + NO",
      "歧化反应",
      "工业制HNO₃"
    ]
  },
  "knowledgePoints": [
    "二氧化氮与水的反应是氮的氧化还原反应，NO₂发生歧化反应",
    "反应方程式：3NO₂ + H₂O → 2HNO₃ + NO",
    "歧化反应分析：NO₂中N为+4价，反应后部分升至+5价（HNO₃），部分降至+2价（NO）",
    "NO₂既是氧化剂又是还原剂：1/3的NO₂被还原，2/3的NO₂被氧化",
    "实验现象：红棕色气体逐渐消失，溶液呈无色（HNO₃），生成无色气体（NO）",
    "NO₂的物理性质：红棕色、有刺激性气味、有毒的气体",
    "工业应用：工业制硝酸的吸收塔反应之一",
    "后续反应：生成的NO可以继续被氧气氧化成NO₂，再与水反应",
    "环境保护：NO₂是空气污染物，会导致酸雨和光化学烟雾",
    "高考考点：①歧化反应分析 ②氮及其化合物的转化 ③氧化还原反应计算",
    "中考考点：①NO₂的性质 ②氮的氧化物与水反应",
    "注意事项：NO₂不是酸性氧化物（与水反应不生成对应的酸，是氧化还原反应）"
  ]
}
```

---

### 4.11 有机化学基础（高中）

#### 4.11.1 烷烃

##### 方程式51: 甲烷燃烧

```json
{
  "equationText": "CH₄ + 2O₂ → CO₂ + 2H₂O",
  "equationHtml": "CH<sub>4</sub> + 2O<sub>2</sub> → CO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "点燃"},
  "teachingInfo": {
    "studentDescription": "甲烷在氧气中完全燃烧，生成二氧化碳和水。",
    "teacherDescription": "最简单的有机物燃烧。完全燃烧蓝色火焰。",
    "keyPoints": [
      "方程式：CH₄ + 2O₂ → CO₂ + 2H₂O",
      "完全燃烧：蓝色火焰",
      "O₂不足：产生炭黑或CO"
    ]
  },
  "knowledgePoints": [
    "甲烷是最简单的有机物，也是相对分子质量最小的有机物",
    "反应方程式：CH₄ + 2O₂ → CO₂ + 2H₂O（点燃）",
    "完全燃烧现象：产生淡蓝色火焰，放出大量热，生成二氧化碳和水",
    "甲烷的物理性质：无色、无味气体，密度比空气小，极难溶于水",
    "甲烷的分子结构：正四面体结构，碳原子位于中心，4个氢原子位于顶点",
    "完全燃烧与不完全燃烧：氧气充足时完全燃烧生成CO₂，氧气不足时不完全燃烧生成炭黑或CO",
    "验纯方法：点燃前必须验纯（用小试管收集气体，管口向下移近火焰）",
    "爆炸极限：甲烷在空气中体积分数约5%-15%时遇火会爆炸",
    "实际应用：天然气的主要成分，用作清洁燃料",
    "中考考点：①最简单的有机物 ②甲烷燃烧 ③化学方程式书写 ④燃料的验纯",
    "高考考点：①有机化学基础 ②甲烷的结构与性质 ③燃烧反应计算",
    "环境保护：甲烷燃烧不产生SO₂，是比较清洁的化石燃料"
  ]
}
```

##### 方程式52: 甲烷与氯气取代反应

```json
{
  "equationText": "CH₄ + Cl₂ → CH₃Cl + HCl",
  "equationHtml": "CH<sub>4</sub> + Cl<sub>2</sub> → CH<sub>3</sub>Cl + HCl",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "光照"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 221,
      "secondaryEquationText": "CH₃Cl + Cl₂ → CH₂Cl₂ + HCl",
      "secondaryEquationHtml": "CH<sub>3</sub>Cl + Cl<sub>2</sub> → CH<sub>2</sub>Cl<sub>2</sub> + HCl",
      "relationship": "sequential",
      "triggerProbability": 0.7,
      "triggerCondition": {
        "chlorineExcess": true
      },
      "phenomenonImpact": {
        "description": "生成二氯甲烷，产物混合物分离困难"
      },
      "teachingNote": "甲烷氯代得到多种氯代甲烷的混合物",
      "isCommonStudentError": false
    },
    {
      "secondaryEquationId": 222,
      "secondaryEquationText": "CH₂Cl₂ + Cl₂ → CHCl₃ + HCl",
      "secondaryEquationHtml": "CH<sub>2</sub>Cl<sub>2</sub> + Cl<sub>2</sub> → CHCl<sub>3</sub> + HCl",
      "relationship": "sequential",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "chlorineExcess": true,
        "irradiationTime": "long"
      },
      "phenomenonImpact": {
        "description": "生成三氯甲烷（氯仿）"
      },
      "teachingNote": "氯仿是有机溶剂"
    },
    {
      "secondaryEquationId": 223,
      "secondaryEquationText": "CHCl₃ + Cl₂ → CCl₄ + HCl",
      "secondaryEquationHtml": "CHCl<sub>3</sub> + Cl<sub>2</sub> → CCl<sub>4</sub> + HCl",
      "relationship": "sequential",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "chlorineExcess": true,
        "irradiationTime": "very long"
      },
      "phenomenonImpact": {
        "description": "生成四氯化碳"
      },
      "teachingNote": "四氯化碳是常用有机溶剂"
    },
    {
      "secondaryEquationId": 224,
      "secondaryEquationText": "CH₄ + 2O₂ → CO₂ + 2H₂O",
      "secondaryEquationHtml": "CH<sub>4</sub> + 2O<sub>2</sub> → CO<sub>2</sub> + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.1,
      "triggerCondition": {
        "oxygenPresent": true,
        "temperature": "高温或明火"
      },
      "phenomenonImpact": {
        "description": "甲烷与氧气反应引起燃烧或爆炸"
      },
      "suppressionMethod": "实验前排尽空气，控制氯气纯度",
      "isCommonStudentError": true,
      "teachingNote": "甲烷是可燃气体，与空气混合可能爆炸"
    },
    {
      "secondaryEquationId": 225,
      "secondaryEquationText": "2Cl₂ + 2H₂O → 4HCl + O₂",
      "secondaryEquationHtml": "2Cl<sub>2</sub> + 2H<sub>2</sub>O → 4HCl + O<sub>2</sub>",
      "relationship": "side",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "moisturePresent": true
      },
      "phenomenonImpact": {
        "description": "氯气与水反应产生盐酸和氧气"
      },
      "teachingNote": "保持反应体系干燥"
    }
  ],
  "teachingInfo": {
    "studentDescription": "甲烷与氯气在光照条件下发生取代反应。",
    "teacherDescription": "有机取代反应示例。逐步取代可产生多氯代物。",
    "keyPoints": [
      "方程式：CH₄ + Cl₂ → CH₃Cl + HCl",
      "光照条件",
      "取代反应"
    ]
  },
  "knowledgePoints": [
    "甲烷与氯气的反应是典型的有机取代反应（卤代反应）",
    "反应方程式：CH₄ + Cl₂ → CH₃Cl + HCl（条件：光照）",
    "反应类型：取代反应，也是自由基反应、非氧化还原反应",
    "反应机理：自由基取代反应（链引发、链增长、链终止三个阶段）",
    "链引发：Cl₂ → 2Cl·（光照条件下，氯气分子均裂生成氯自由基）",
    "链增长：Cl· + CH₄ → ·CH₃Cl + HCl，·CH₃Cl + Cl₂ → CH₃Cl + Cl·（循环进行）",
    "链终止：自由基结合终止反应，如2Cl· → Cl₂，Cl· + ·CH₃Cl → CH₃₃Cl等",
    "实验现象：气体颜色变浅（Cl₂的黄绿色变浅），出现油状液体（氯代甲烷混合物）",
    "反应特点：逐步取代，可生成一氯甲烷、二氯甲烷、三氯甲烷、四氯化碳",
    "副反应：CH₃Cl + Cl₂ → CH₂Cl₂ + HCl，CH₂Cl₂ + Cl₂ → CHCl₃ + HCl，CHCl₃ + Cl₂ → CCl₄ + HCl",
    "产物分离：因逐步取代得到混合物，实际应用需要分离纯化",
    "实际应用：①制备氯代甲烷 ②工业制备氯仿（三氯甲烷） ③制备四氯化碳（有机溶剂）",
    "高考考点：①取代反应机理 ②自由基反应特点 ③实验现象描述 ④有机方程式书写",
    "中考考点：①甲烷的性质 ②取代反应概念 ③实验安全",
    "实验安全：氯气有毒，反应需通风；甲烷可燃，避免明火；保持体系干燥"
  ]
}
```

---

#### 4.11.2 烯烃

##### 方程式53: 乙烯燃烧

```json
{
  "equationText": "C₂H₄ + 3O₂ → 2CO₂ + 2H₂O",
  "equationHtml": "C<sub>2</sub>H<sub>4</sub> + 3O<sub>2</sub> → 2CO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "点燃"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 254,
      "secondaryEquationText": "C₂H₄ + 2O₂ → 2CO + 2H₂O",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>4</sub> + 2O<sub>2</sub> → 2CO + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时产生有毒CO"
      },
      "teachingNote": "有机物不完全燃烧产生CO"
    },
    {
      "secondaryEquationId": 255,
      "secondaryEquationText": "C₂H₄ + 2Cl₂ → C₂H₄Cl₂",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>4</sub> + 2Cl<sub>2</sub> → C<sub>2</sub>H<sub>4</sub>Cl<sub>2</sub>",
      "relationship": "side",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "chlorinePresent": true,
        "temperature": "点燃"
      },
      "phenomenonImpact": {
        "description": "乙烯与氯气剧烈反应"
      },
      "teachingNote": "乙烯在氯气中燃烧"
    }
  ],
  "knowledgePoints": [
    "乙烯燃烧是重要的烃类燃烧反应，体现不饱和烃的氧化性质",
    "反应方程式：C₂H₄ + 3O₂ → 2CO₂ + 2H₂O（条件：点燃）",
    "反应类型：氧化反应，也是燃烧反应、放热反应、氧化还原反应",
    "实验现象：乙烯在空气中或氧气中燃烧，产生明亮的火焰并伴有黑烟",
    "火焰特征：火焰明亮，有黑烟（因含碳量较高，燃烧不充分产生碳颗粒）",
    "乙烯的物理性质：无色、稍有气味的气体，密度比空气略小，难溶于水",
    "乙烯的化学性质：不饱和烃，具有可燃性，能使酸性高锰酸钾溶液褪色",
    "可燃性检验：点燃前必须验纯（防止爆炸），纯乙烯燃烧火焰明亮且带黑烟",
    "氧化还原分析：C从-2价升至+4价（失电子被氧化），O从0价降至-2价（得电子被还原）",
    "含碳量分析：乙烯含碳量85.7%，高于甲烷（75%），故燃烧时产生黑烟",
    "完全燃烧与不完全燃烧：氧气充足时完全燃烧生成CO₂，氧气不足时生成CO或C",
    "不完全燃烧：C₂H₄ + 2O₂ → 2CO + 2H₂O（氧气不足时）",
    "实际应用：①气体燃料 ②化工原料（制乙醇、聚乙烯等） ③植物生长调节剂（催熟剂）",
    "工业制备：石油裂解产生乙烯（裂化汽油中含有乙烯）",
    "安全注意事项：乙烯可燃，远离明火；乙烯气体需验纯后点燃",
    "高考考点：①燃烧方程式书写 ②氧化还原分析 ③烃类燃烧规律 ④实验现象描述",
    "中考考点：①乙烯的可燃性 ②实验现象 ③化学方程式书写"
  ]
}
```

##### 方程式54: 乙烯与溴加成反应

```json
{
  "equationText": "C₂H₄ + Br₂ → C₂H₄Br₂",
  "equationHtml": "C<sub>2</sub>H<sub>4</sub> + Br<sub>2</sub> → C<sub>2</sub>H<sub>4</sub>Br<sub>2</sub>",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "secondaryReactions": [
    {
      "secondaryEquationId": 260,
      "secondaryEquationText": "C₂H₄ + Br₂ → CH₂Br-CH₂Br",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>4</sub> + Br<sub>2</sub> → CH<sub>2</sub>Br-CH<sub>2</sub>Br",
      "relationship": "parallel",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "mechanism": "自由基反应",
        "lightPresent": true
      },
      "phenomenonImpact": {
        "description": "光照下可能发生自由基取代反应"
      },
      "teachingNote": "烯烃与卤素主要发生加成，光照条件下可能发生取代"
    },
    {
      "secondaryEquationId": 261,
      "secondaryEquationText": "C₂H₄Br₂ + Br₂ → C₂H₄Br₄",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>4</sub>Br<sub>2</sub> + Br<sub>2</sub> → C<sub>2</sub>H<sub>4</sub>Br<sub>4</sub>",
      "relationship": "sequential",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "bromineExcess": true
      },
      "phenomenonImpact": {
        "description": "溴过量时可能继续加成生成四溴化物"
      },
      "teachingNote": "乙烯与溴通常1:1加成"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "通入乙烯",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "乙烯气体通入溴水中，红棕色开始变淡",
      "colorChange": {
        "from": "红棕色溴水",
        "to": "颜色开始变淡"
      },
      "microscopicExplanation": "C₂H₄分子与Br₂分子接触，C=C双键开始打开"
    },
    {
      "stageOrder": 2,
      "stageName": "加成进行",
      "stageType": "propagation",
      "durationEstimate": "几秒至1分钟",
      "phenomenaDescription": "溴水颜色逐渐变浅直至变为无色",
      "colorChange": {
        "from": "红棕色",
        "to": "浅棕色→淡黄色→无色",
        "intermediate": ["红棕→棕→浅棕→淡黄→无色"]
      },
      "microscopicExplanation": "C₂H₄ + Br₂ → C₂H₄Br₂，双键打开与Br原子结合，Br₂被消耗"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "溴水完全褪色",
      "phenomenaDescription": "溶液完全变为无色",
      "colorChange": {
        "from": "淡黄色",
        "to": "无色溶液（含C₂H₄Br₂）"
      },
      "microscopicExplanation": "Br₂完全加成到C₂H₄上，生成无色的1,2-二溴乙烷"
    }
  ],
  "teachingInfo": {
    "studentDescription": "乙烯使溴水褪色。",
    "teacherDescription": "碳碳双键的加成反应。可用于鉴别烯烃。",
    "keyPoints": [
      "方程式：C₂H₄ + Br₂ → C₂H₄Br₂",
      "加成反应",
      "使溴水褪色"
    ]
  },
  "knowledgePoints": [
    "乙烯与溴的反应是有机化学中最典型的加成反应之一",
    "反应方程式：C₂H₄ + Br₂ → CH₂Br-CH₂Br（1,2-二溴乙烷）",
    "反应类型：加成反应，非氧化还原反应（碳溴键的形成和断裂同时进行）",
    "反应机理：C=C双键中的π键断裂，两个Br原子分别加到双键两端的碳原子上",
    "π键特点：C=C双键由一个σ键和一个π键组成，π键易断裂，故烯烃易发生加成反应",
    "实验现象：乙烯通入溴水中，溴水的红棕色逐渐变浅直至完全褪色",
    "溴水褪色原理：Br₂分子被消耗，溶液中不再有红棕色的Br₂分子",
    "反应条件：通常无需额外催化剂，常温下即可反应；光照条件下可能发生取代反应",
    "鉴别应用：用于鉴别不饱和烃（烯烃、炔烃）与饱和烃（烷烃不使溴水褪色）",
    "除杂应用：可用于除去气体中混有的烯烃杂质（如除去乙烷中混有的乙烯）",
    "定量关系：1mol C₂H₄与1mol Br₂完全加成生成1mol 1,2-二溴乙烷",
    "产物性质：1,2-二溴乙烷为无色液体，不溶于水，是有机合成重要中间体",
    "加成反应特点：①只有含不饱和键的化合物发生 ②原子加到双键两端 ③无副产物",
    "与烷烃区别：烷烃与溴在光照下发生取代反应，烯烃与溴发生加成反应",
    "高考考点：①加成反应机理 ②方程式书写 ③溴水褪色实验 ④鉴别与除杂应用",
    "中考考点：①加成反应概念 ②实验现象 ③乙烯性质"
  ]
}

---

#### 4.11.3 醇和酚

##### 方程式55: 乙醇燃烧

```json
{
  "equationText": "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O",
  "equationHtml": "C<sub>2</sub>H<sub>5</sub>OH + 3O<sub>2</sub> → 2CO<sub>2</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "点燃"},
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "气化与点燃",
      "stageType": "initiation",
      "durationEstimate": "1-2秒",
      "phenomenaDescription": "乙醇受热挥发形成蒸气，点燃后产生淡蓝色火焰",
      "colorChange": {
        "from": "无色液体",
        "to": "淡蓝色火焰"
      },
      "microscopicExplanation": "乙醇分子吸收能量克服分子间作用力成为气态，温度达到着火点后开始燃烧"
    },
    {
      "stageOrder": 2,
      "stageName": "稳定燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续至燃料耗尽",
      "phenomenaDescription": "火焰稳定，外焰温度最高（约800℃），内焰温度较低，焰心温度最低",
      "colorChange": {
        "from": "淡蓝色火焰",
        "to": "稳定淡蓝色火焰",
        "intermediate": ["焰心: 深色", "内焰: 黄色", "外焰: 淡蓝色"]
      },
      "microscopicExplanation": "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O，完全燃烧释放大量热量，火焰分层显示不同燃烧程度"
    },
    {
      "stageOrder": 3,
      "stageName": "熄灭",
      "stageType": "completion",
      "durationEstimate": "燃料耗尽",
      "phenomenaDescription": "火焰逐渐变小直至熄灭，容器可能残留水雾",
      "colorChange": {
        "from": "淡蓝色火焰",
        "to": "无"
      },
      "microscopicExplanation": "燃料耗尽或氧气不足，燃烧反应停止，水蒸气冷凝成小水滴"
    }
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 256,
      "secondaryEquationText": "C₂H₅OH + 2O₂ → 2CO + 3H₂O",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>5</sub>OH + 2O<sub>2</sub> → 2CO + 3H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时产生有毒CO，火焰呈黄色"
      },
      "teachingNote": "酒精灯火焰外焰温度最高，内焰有CO燃烧"
    },
    {
      "secondaryEquationId": 257,
      "secondaryEquationText": "C₂H₅OH → CH₃CHO + H₂",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>5</sub>OH → CH<sub>3</sub>CHO + H<sub>2</sub>",
      "relationship": "side",
      "triggerProbability": 0.1,
      "triggerCondition": {
        "catalyst": "Cu或Ag",
        "temperature": "加热"
      },
      "phenomenonImpact": {
        "description": "高温催化下乙醇脱氢生成乙醛"
      },
      "teachingNote": "这是工业制乙醛的方法"
    }
  ],
  "knowledgePoints": [
    "乙醇燃烧是重要的有机氧化反应，也是乙醇的主要化学性质之一",
    "反应方程式：C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O（条件：点燃）",
    "反应类型：氧化反应，也是燃烧反应、放热反应、氧化还原反应",
    "实验现象：乙醇在空气中或氧气中燃烧，产生淡蓝色火焰，放出大量热",
    "火焰颜色：淡蓝色火焰（氧气充足时），完全燃烧生成CO₂和H₂O",
    "乙醇的物理性质：无色、有特殊香味的液体，密度比水小，易挥发，能与水任意比互溶",
    "乙醇的化学性质：烃的衍生物，官能团为羟基（-OH），具有可燃性",
    "可燃性检验：点燃前需要验纯（虽然乙醇是液体，但其蒸气可燃）",
    "氧化还原分析：C从-2价升至+4价（失电子被氧化），O从0价降至-2价（得电子被还原），H从+1价降至+1价（不变）",
    "燃烧热：约1367 kJ/mol，放热反应，可作为燃料使用",
    "完全燃烧与不完全燃烧：氧气充足时完全燃烧生成CO₂，氧气不足时可能生成CO或C",
    "不完全燃烧：C₂H₅OH + 2O₂ → 2CO + 3H₂O（氧气不足时，火焰呈黄色）",
    "实际应用：①燃料（酒精灯、汽车燃料）②饮料（酒类）③消毒剂（70%-75%乙醇）④有机合成原料",
    "工业制备：①乙烯水合法 ②发酵法（含糖物质发酵）",
    "安全注意事项：乙醇易燃，远离明火；使用时注意通风",
    "中考考点：①乙醇的可燃性 ②实验现象 ③化学方程式书写 ④燃料用途",
    "高考考点：①燃烧方程式书写 ②氧化还原分析 ③燃烧热计算 ④有机反应类型"
  ]
}
```

##### 方程式56: 乙醇与乙酸酯化反应

```json
{
  "equationText": "C₂H₅OH + CH₃COOH ⇌ CH₃COOC₂H₅ + H₂O",
  "equationHtml": "C<sub>2</sub>H<sub>5</sub>OH + CH<sub>3</sub>COOH ⇌ CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "ESTERIFICATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热", "catalyst": "浓硫酸"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 262,
      "secondaryEquationText": "C₂H₅OH + C₂H₅OH → C₂H₅OC₂H₅ + H₂O",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>5</sub>OH + C<sub>2</sub>H<sub>5</sub>OH → C<sub>2</sub>H<sub>5</sub>OC<sub>2</sub>H<sub>5</sub> + H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "temperature": "140℃"
      },
      "phenomenonImpact": {
        "description": "140℃时主要发生分子间脱水生成乙醚"
      },
      "teachingNote": "温度控制很重要：140℃醚，170℃烯，酯化需要更高温度"
    },
    {
      "secondaryEquationId": 263,
      "secondaryEquationText": "C₂H₅OH → CH₂=CH₂ + H₂O",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>5</sub>OH → CH<sub>2</sub>=CH<sub>2</sub> + H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "temperature": "170℃",
        "acidType": "浓硫酸"
      },
      "phenomenonImpact": {
        "description": "170℃时主要发生分子内脱水生成乙烯"
      },
      "teachingNote": "制乙烯的副反应"
    },
    {
      "secondaryEquationId": 264,
      "secondaryEquationText": "2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂↑",
      "secondaryEquationHtml": "2C<sub>2</sub>H<sub>5</sub>OH + 2Na → 2C<sub>2</sub>H<sub>5</sub>ONa + H<sub>2</sub>↑",
      "relationship": "side",
      "triggerProbability": 0.1,
      "triggerCondition": {
        "sodiumPresent": true
      },
      "phenomenonImpact": {
        "description": "如果有金属钠存在，乙醇与钠反应"
      },
      "teachingNote": "乙醇具有弱酸性，可与活泼金属反应"
    }
  ],
  "knowledgePoints": [
    "酯化反应是重要的有机合成反应，指酸和醇反应生成酯和水的反应",
    "反应方程式：C₂H₅OH + CH₃COOH ⇌ CH₃COOC₂H₅ + H₂O（条件：加热、浓硫酸催化）",
    "反应类型：酯化反应（取代反应的一种），非氧化还原反应",
    "反应机理：酸脱羟基醇脱氢（羧酸脱去-OH，醇脱去-H），生成酯和水",
    "可逆反应：反应是可逆的，反应物和产物共存，需要控制条件促进正向反应",
    "催化剂作用：浓硫酸作催化剂和吸水剂（促进反应向正方向进行）",
    "反应条件：加热（约60-70℃，不能太高，否则乙醇和乙酸会挥发或发生其他反应）",
    "产物名称：乙酸乙酯（无色、有水果香味的液体，不溶于水，密度比水小）",
    "酯的通式：RCOOR'（R和R'为烃基），由羧酸和醇脱水缩合而成",
    "实验现象：液体分层，上层为有香味的无色油状液体（乙酸乙酯），下层为水溶液",
    "饱和碳酸钠溶液作用：吸收乙酸、溶解乙醇、降低乙酸乙酯溶解度（便于分层）",
    "药品添加顺序：乙醇→浓硫酸→乙酸（不能先加浓硫酸再加乙醇，防止沸腾飞溅）",
    "加热方式：小火加热（防止乙醇和乙酸挥发过多）",
    "导管位置：导管口在饱和碳酸钠溶液液面以上（防止倒吸）",
    "实际应用：①制备香料 ②溶剂 ③饮料工业 ④涂料工业",
    "高考考点：①酯化反应机理 ②可逆反应特点 ③实验现象 ④试剂添加顺序",
    "中考考点：①酯化反应概念 ②酯的气味 ③有机合成"
  ]
}
```

---

#### 4.11.4 醛和羧酸

##### 方程式57: 乙醛的银镜反应

```json
{
  "equationText": "CH₃CHO + 2Ag(NH₃)₂OH → CH₃COONH₄ + 2Ag↓ + 3NH₃ + H₂O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "水浴加热"},
  "oxidationChanges": [
    {"element": "C", "from": "+1", "to": "+3", "process": "氧化"},
    {"element": "Ag", "from": "+1", "to": "0", "process": "还原"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 240,
      "secondaryEquationText": "Ag(NH₃)₂OH → Ag₂O + 4NH₃ + H₂O",
      "secondaryEquationHtml": "Ag(NH<sub>3</sub>)<sub>2</sub>OH → Ag<sub>2</sub>O + 4NH<sub>3</sub> + H<sub>2</sub>O",
      "relationship": "side",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "temperature": "加热时间过长"
      },
      "phenomenonImpact": {
        "description": "银氨溶液不稳定，加热时间过长可能分解产生黑色沉淀"
      },
      "suppressionMethod": "现配现用，水浴加热",
      "teachingNote": "银氨溶液必须现配现用"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合阶段",
      "stageType": "mixing",
      "durationEstimate": "立即",
      "phenomenaDescription": "乙醛加入银氨溶液，形成无色透明混合液，试管内壁洁净",
      "colorChange": {
        "from": "无色透明",
        "to": "无色透明"
      },
      "microscopicExplanation": "乙醛分子与[Ag(NH₃)₂]⁺离子在溶液中分散，OH⁻提供碱性环境"
    },
    {
      "stageOrder": 2,
      "stageName": "水浴加热初期",
      "stageType": "heating",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "溶液开始变浑浊，试管内壁出现轻微灰白色雾状物",
      "colorChange": {
        "from": "无色透明",
        "to": "轻微浑浊"
      },
      "microscopicExplanation": "醛基(-CHO)开始被氧化，Ag⁺被还原为Ag原子，形成银晶核"
    },
    {
      "stageOrder": 3,
      "stageName": "银镜形成",
      "stageType": "completion",
      "durationEstimate": "3-5分钟",
      "phenomenaDescription": "试管内壁逐渐形成光亮银镜，溶液颜色逐渐变浅至无色",
      "colorChange": {
        "from": "浑浊溶液",
        "to": "光亮银镜+无色溶液"
      },
      "microscopicExplanation": "银原子在试管壁沉积形成金属银层，醛基完全氧化为羧基，生成CH₃COO⁻"
    }
  ],
  "teachingInfo": {
    "studentDescription": "乙醛与银氨溶液反应，在试管壁形成银镜。",
    "teacherDescription": "醛基的还原性。检验醛基的方法。",
    "keyPoints": [
      "银镜反应",
      "醛基被氧化",
      "Ag⁺被还原为Ag"
    ]
  },
  "knowledgePoints": [
    "银镜反应的实质：醛基（-CHO）被银氨溶液中的[Ag(NH₃)₂]⁺氧化为羧基（-COOH），同时Ag⁺被还原为金属银",
    "反应方程式：CH₃CHO + 2Ag(NH₃)₂OH → CH₃COONH₄ + 2Ag↓ + 3NH₃ + H₂O",
    "反应条件：水浴加热（温水浴，不能直接用火加热），碱性环境",
    "实验现象：在试管内壁形成光亮如镜的金属银附着层",
    "应用：①检验醛基的存在 ②工业上制镜和保温瓶胆镀银",
    "银氨溶液配制：AgNO₃溶液中滴加稀氨水至沉淀恰好溶解（AgNO₃ + NH₃·H₂O + NH₃·H₂O → Ag(NH₃)₂OH）",
    "实验注意事项：①试管内壁必须洁净 ②银氨溶液必须现配现用 ③水浴加热 ④不能直接用火加热",
    "为什么现配现用：银氨溶液放置过久会析出黑色氮化银(Ag₃N)沉淀，易爆炸",
    "有醛基的物质都能发生银镜反应：醛、甲酸、甲酸盐、甲酸酯、葡萄糖、麦芽糖等",
    "斐林反应与银镜反应的区别：斐林试剂是Cu(OH)₂，产生砖红色Cu₂O沉淀；银镜反应产生银镜",
    "高考考点：①醛基的检验 ②银镜反应方程式书写 ③实验条件与注意事项",
    "有机化学考点：氧化反应（有机物被氧化）、醛的化学性质"
  ]
}
```

##### 方程式58: 乙醛与新制氢氧化铜反应

```json
{
  "equationText": "CH₃CHO + 2Cu(OH)₂ → CH₃COOH + Cu₂O↓ + 2H₂O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "乙醛与新制氢氧化铜反应，产生砖红色沉淀。",
    "teacherDescription": "斐林反应。检验醛基的另一方法。",
    "keyPoints": [
      "砖红色Cu₂O沉淀",
      "醛基被氧化"
    ]
  },
  "knowledgePoints": [
    "斐林反应的实质：醛基（-CHO）被新制氢氧化铜氧化为羧基（-COOH），同时Cu²⁺被还原为Cu⁺形成砖红色Cu₂O沉淀",
    "反应方程式：CH₃CHO + 2Cu(OH)₂ → CH₃COOH + Cu₂O↓ + 2H₂O（碱性条件下生成羧酸盐）",
    "反应条件：加热至沸腾，必须使用新制Cu(OH)₂",
    "实验现象：蓝色絮状沉淀逐渐转化为砖红色沉淀",
    "应用：①检验醛基的存在 ②医学上检验糖尿病（斐林试剂检验还原糖）",
    "斐林试剂配制：甲液是0.1g/mL NaOH溶液，乙液是0.05g/mL CuSO₄溶液，使用时等量混合",
    "为什么用新制Cu(OH)₂：放置后的Cu(OH)₂会脱水生成黑色的CuO，失去检验醛基的能力",
    "有醛基的物质都能发生斐林反应：醛、甲酸盐、葡萄糖、果糖、麦芽糖等还原糖",
    "银镜反应与斐林反应的对比：银镜反应产生Ag，斐林反应产生砖红色Cu₂O沉淀",
    "颜色变化过程：蓝色→绿色→黄色→砖红色（Cu²⁺逐渐被还原）",
    "高考考点：①醛基的检验 ②斐林试剂的配制与使用 ③实验现象描述 ④化学方程式书写",
    "实际应用：斐林试剂检验糖尿病患者的尿液中的葡萄糖（还原糖）"
  ]
}
```

---

### 4.12 电化学反应

##### 方程式59: 原电池（铜锌原电池）

**负极反应**:
```json
{
  "equationText": "Zn - 2e⁻ → Zn²⁺",
  "reactionTypeCode": "OXIDATION",
  "teachingInfo": {
    "description": "锌失去电子，发生氧化反应，是负极"
  }
}
```

**正极反应**:
```json
{
  "equationText": "Cu²⁺ + 2e⁻ → Cu",
  "reactionTypeCode": "REDUCTION",
  "teachingInfo": {
    "description": "铜离子得到电子，发生还原反应，是正极"
  }
}
```

**总反应**:
```json
{
  "equationText": "Zn + Cu²⁺ → Zn²⁺ + Cu",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "锌铜原电池中，锌溶解，铜析出，产生电流。",
    "teacherDescription": "化学能转化为电能的装置。",
    "keyPoints": [
      "负极：较活泼金属",
      "正极：较不活泼金属或不活泼导体",
      "电子从负极流向正极"
    ]
  }
}
```

---

### 4.13 一氧化碳的性质

##### 方程式60: 一氧化碳燃烧

```json
{
  "equationText": "2CO + O₂ → 2CO₂",
  "equationHtml": "2CO + O<sub>2</sub> → 2CO<sub>2</sub>",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -566.0,
  "conditions": {"temperature": "点燃"},
  "oxidationChanges": [
    {"element": "C", "from": "+2", "to": "+4", "process": "氧化"},
    {"element": "O", "from": 0, "to": "-2", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "一氧化碳在空气中燃烧，产生蓝色火焰，生成二氧化碳。",
    "teacherDescription": "CO是可燃性气体，燃烧时产生蓝色火焰。有毒，需注意安全。",
    "keyPoints": [
      "方程式：2CO + O₂ → 2CO₂",
      "蓝色火焰",
      "有毒可燃气体"
    ],
    "safetyNotes": ["CO有毒", "通风良好", "防止中毒"]
  },
  "phenomena": {
    "colorChange": {"before": "无色气体", "after": "无色气体"},
    "temperatureChange": {"isExothermic": true, "description": "蓝色火焰，放热"},
    "observationPoints": ["观察火焰颜色（蓝色）", "注意安全"]
  },
  "knowledgePoints": [
    "一氧化碳燃烧是碳的不完全燃烧产物继续燃烧生成二氧化碳",
    "反应方程式：2CO + O₂ → 2CO₂（条件：点燃）",
    "反应类型：化合反应，也是氧化还原反应、放热反应",
    "实验现象：CO在空气中或氧气中燃烧，产生蓝色火焰，放出大量热",
    "蓝色火焰特征：CO燃烧产生蓝色火焰（与H₂在空气中燃烧的淡蓝色火焰略有不同）",
    "CO的物理性质：无色、无味、无刺激性气味的气体，密度比空气略小",
    "CO的毒性：剧毒气体，与血红蛋白结合能力强于氧气，造成人体缺氧",
    "CO的中毒机理：CO + Hb（血红蛋白）→ CO-Hb，结合力是O₂的200多倍",
    "CO的来源：燃料不完全燃烧产生（炭火、燃气灶、汽车尾气等）",
    "CO的可燃性：是可燃性气体，点燃前必须验纯（防止爆炸）",
    "氧化还原分析：C从+2价升至+4价（失电子被氧化），O从0价降至-2价（得电子被还原）",
    "完全燃烧与不完全燃烧：碳充分燃烧生成CO₂（氧气充足），碳不充分燃烧生成CO（氧气不足）",
    "实际应用：①气体燃料 ②冶金还原剂 ③有机合成原料",
    "安全注意事项：CO有毒，使用时必须通风良好，防止中毒",
    "中考考点：①CO的可燃性和毒性 ②实验现象 ③安全防护 ④化学方程式书写",
    "高考考点：①氧化还原分析 ②燃烧热计算 ③CO的工业应用"
  ]
}
```

##### 方程式61: 一氧化碳还原氧化铜

```json
{
  "equationText": "CO + CuO → Cu + CO₂",
  "equationHtml": "CO + CuO → Cu + CO<sub>2</sub>",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -217.0,
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "C", "from": "+2", "to": "+4", "process": "氧化"},
    {"element": "Cu", "from": "+2", "to": 0, "process": "还原"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 60,
      "secondaryEquationText": "2CO + O₂ → 2CO₂",
      "secondaryEquationHtml": "2CO + O<sub>2</sub> → 2CO<sub>2</sub>",
      "relationship": "parallel",
      "triggerProbability": 0.7,
      "triggerCondition": {
        "oxygenPresent": true
      },
      "phenomenonImpact": {
        "description": "CO在装置中燃烧，消耗CO并可能引起爆炸"
      },
      "suppressionMethod": "先通CO排尽空气，加热前验纯",
      "isCommonStudentError": true,
      "teachingNote": "强调实验开始前必须先通CO，结束时继续通CO直到冷却"
    },
    {
      "secondaryEquationId": 218,
      "secondaryEquationText": "C + CO₂ → 2CO",
      "secondaryEquationHtml": "C + CO<sub>2</sub> → 2CO",
      "relationship": "chain",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "temperature": "高温",
        "carbonPresent": true
      },
      "phenomenonImpact": {
        "description": "如果装置中有碳，CO₂可能被还原"
      },
      "teachingNote": "本反应中碳不是反应物，此副反应较少见"
    },
    {
      "secondaryEquationId": 219,
      "secondaryEquationText": "Cu + ½O₂ → CuO",
      "secondaryEquationHtml": "Cu + ½O<sub>2</sub> → CuO",
      "relationship": "chain",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "oxygenPresent": true,
        "temperature": "加热"
      },
      "phenomenonImpact": {
        "description": "生成的铜在加热时若接触氧气会重新氧化"
      },
      "suppressionMethod": "反应结束后继续通CO直到装置冷却",
      "isCommonStudentError": true,
      "teachingNote": "这是为什么要'先停灯后停气'的原因"
    }
  ],
  "reactants": [
    {"substanceId": 110, "coefficient": 1, "state": "g", "formula": "CO", "name": "一氧化碳"},
    {"substanceId": 102, "coefficient": 1, "state": "s", "formula": "CuO", "name": "氧化铜"}
  ],
  "products": [
    {"substanceId": 6, "coefficient": 1, "state": "s", "formula": "Cu", "name": "铜"},
    {"substanceId": 28, "coefficient": 1, "state": "g", "formula": "CO₂", "name": "二氧化碳"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "通气预热",
      "stageType": "initiation",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "先通CO排尽装置内空气，然后开始加热黑色CuO粉末",
      "colorChange": {
        "from": "黑色固体",
        "to": "黑色固体（加热中）"
      },
      "microscopicExplanation": "CO气体通过装置排除空气，防止爆炸，CuO开始被加热"
    },
    {
      "stageOrder": 2,
      "stageName": "还原进行",
      "stageType": "propagation",
      "durationEstimate": "2-5分钟",
      "phenomenaDescription": "黑色粉末逐渐变为红色，澄清石灰水可能变浑浊（检验CO₂）",
      "colorChange": {
        "from": "黑色CuO",
        "to": "红色Cu",
        "intermediate": ["黑色→黑褐色→褐色→紫红色→红色"]
      },
      "microscopicExplanation": "CO + CuO → Cu + CO₂，CuO被CO还原为Cu，自身被氧化为CO₂"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "粉末完全变红",
      "phenomenaDescription": "粉末完全变为红色，停止加热后继续通CO直至冷却",
      "colorChange": {
        "from": "红色（加热中）",
        "to": "红色铜（冷却）"
      },
      "microscopicExplanation": "CuO完全还原为Cu，继续通CO防止热的Cu被空气重新氧化"
    }
  ],
  "teachingInfo": {
    "studentDescription": "一氧化碳通过加热的氧化铜，黑色粉末逐渐变为红色，同时产生二氧化碳。",
    "teacherDescription": "演示CO的还原性。现象明显：黑色→红色。",
    "keyPoints": [
      "方程式：CO + CuO → Cu + CO₂",
      "CO有还原性",
      "现象：黑色粉末变红色"
    ],
    "commonQuestions": [
      {"question": "为什么需要先验纯CO？", "answer": "CO可燃，与空气混合可能爆炸。"},
      {"question": "如何处理尾气？", "answer": "点燃或用气球收集，防止CO污染空气。"}
    ],
    "safetyNotes": ["CO有毒", "必须通风", "尾气处理"]
  },
  "phenomena": {
    "colorChange": {"before": "黑色固体", "after": "红色固体", "description": "黑色CuO变为红色Cu"},
    "gasEvolution": {"hasGas": true, "gasDescription": "产生无色气体（CO₂）"},
    "temperatureChange": {"isExothermic": true, "description": "放热反应"}
  },
  "knowledgePoints": [
    "一氧化碳的还原性（将金属氧化物还原为金属单质）",
    "氧化还原反应中化合价的变化分析",
    "冶金工业中CO还原金属氧化物的应用",
    "实验操作要点：先通气排空气、先撤灯后撤气",
    "CO的毒性和安全防护措施",
    "尾气处理的方法（点燃或收集）",
    "还原反应的概念和特征（夺取氧的反应）",
    "碳及其化合物的转化关系（C→CO→CO₂）",
    "CO和CO₂性质的对比"
  ]
}
```

---

### 4.14 生石灰的性质

##### 方程式62: 生石灰与水反应

```json
{
  "equationText": "CaO + H₂O → Ca(OH)₂",
  "equationHtml": "CaO + H<sub>2</sub>O → Ca(OH)<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -65.0,
  "reactionRate": "fast",
  "reactants": [
    {"substanceId": 111, "coefficient": 1, "state": "s", "formula": "CaO", "name": "生石灰"},
    {"substanceId": 70, "coefficient": 1, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "products": [
    {"substanceId": 42, "coefficient": 1, "state": "aq", "formula": "Ca(OH)₂", "name": "熟石灰"}
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触初期",
      "stageType": "initiation",
      "durationEstimate": "5-10秒",
      "phenomenaDescription": "水倒在白色CaO粉末上，立即产生剧烈反应，发出嘶嘶声",
      "colorChange": {
        "from": "白色固体+无色水",
        "to": "固体表面剧烈反应，产生蒸汽"
      },
      "microscopicExplanation": "CaO + H₂O → Ca(OH)₂，反应放热剧烈，使部分水汽化"
    },
    {
      "stageOrder": 2,
      "stageName": "溶解放热",
      "stageType": "propagation",
      "durationEstimate": "30秒-2分钟",
      "phenomenaDescription": "固体逐渐溶解，产生大量水蒸气，容器壁明显发热",
      "colorChange": {
        "from": "白色固体+水",
        "to": "白色固体消失+乳白色浑浊溶液"
      },
      "microscopicExplanation": "CaO持续水合生成Ca(OH₂，放热使水温升高，产生蒸汽"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "固体完全溶解",
      "phenomenaDescription": "白色固体完全消失，形成乳白色Ca(OH)₂悬浊液",
      "colorChange": {
        "from": "白色固体",
        "to": "乳白色悬浊液"
      },
      "microscopicExplanation": "CaO完全转化为Ca(OH)₂，形成悬浊液（Ca(OH)₂微溶"
    }
  ],
  "teachingInfo": {
    "studentDescription": "生石灰遇水剧烈反应，放出大量热，生成氢氧化钙。",
    "teacherDescription": "化合反应的典型例子。放热明显，可用于煮鸡蛋。",
    "keyPoints": [
      "方程式：CaO + H₂O → Ca(OH)₂",
      "剧烈放热",
      "CaO叫生石灰",
      "Ca(OH)₂叫熟石灰或消石灰"
    ],
    "commonQuestions": [
      {"question": "为什么叫生石灰和熟石灰？", "answer": "CaO是生的（由石灰石煅烧），Ca(OH)₂是熟的（与水反应后）。"},
      {"question": "这个反应有什么应用？", "answer": "放热可用于自热食品、煮鸡蛋等。"}
    ]
  },
  "knowledgePoints": [
    "生石灰与水的反应是典型的化合反应，也是剧烈的放热反应",
    "反应方程式：CaO + H₂O → Ca(OH)₂（放热）",
    "实验现象：白色固体逐渐溶解，放出大量热，产生水蒸气，形成白色悬浊液",
    "放热应用：反应放出的热量足以将水煮沸，可以煮熟鸡蛋（自热食品原理）",
    "生石灰（CaO）：白色固体，由石灰石高温煅烧制得：CaCO₃ → CaO + CO₂↑",
    "熟石灰/消石灰（Ca(OH)₂）：白色粉末，微溶于水，水溶液叫石灰水",
    "石灰水：Ca(OH)₂的水溶液，用于检验CO₂（变浑浊）",
    "安全注意事项：生石灰遇水放热，防止烫伤；如溅到眼睛不能用水冲洗（会加重反应）",
    "实际应用：①建筑（砌墙抹灰） ②制石灰水 ③自热食品 ④消毒杀菌",
    "中考考点：①生石灰与水反应 ②放热现象 ③石灰水检验CO₂ ④化学方程式书写",
    "高考考点：①碱性氧化物的性质 ②钙及其化合物的转化 ③工业制石灰",
    "实验注意：生石灰要密封保存（防止与空气中水分反应变质）"
  ]
}
```

---

### 4.15 更多碳酸盐反应

##### 方程式63: 碳酸钠与氢氧化钙反应

```json
{
  "equationText": "Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2NaOH",
  "equationHtml": "Na<sub>2</sub>CO<sub>3</sub> + Ca(OH)<sub>2</sub> → CaCO<sub>3</sub>↓ + 2NaOH",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "reactants": [
    {"substanceId": 103, "coefficient": 1, "state": "aq", "formula": "Na₂CO₃", "name": "碳酸钠"},
    {"substanceId": 42, "coefficient": 1, "state": "aq", "formula": "Ca(OH)₂", "name": "氢氧化钙"}
  ],
  "products": [
    {"substanceId": 59, "coefficient": 1, "state": "s", "formula": "CaCO₃", "name": "碳酸钙"},
    {"substanceId": 40, "coefficient": 2, "state": "aq", "formula": "NaOH", "name": "氢氧化钠"}
  ],
  "teachingInfo": {
    "studentDescription": "碳酸钠溶液与氢氧化钙溶液（澄清石灰水）反应，产生白色沉淀。",
    "teacherDescription": "这个反应可用于制取少量NaOH，也是利用碳酸盐的例子。",
    "keyPoints": [
      "方程式：Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2NaOH",
      "产生白色沉淀",
      "工业制烧碱的基础"
    ],
    "commonQuestions": [
      {"question": "这个反应有什么应用？", "answer": "侯氏制碱法的一部分，用于制取NaOH。"}
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "白色", "precipitateDescription": "白色沉淀"},
    "colorChange": {"before": "无色溶液", "after": "白色浑浊"}
  },
  "knowledgePoints": [
    "碱与盐反应制备新碱的典型代表：碳酸钠与氢氧化钙反应",
    "反应方程式：Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2NaOH",
    "离子方程式：CO₃²⁻ + Ca²⁺ → CaCO₃↓",
    "反应类型：复分解反应（非氧化还原反应）",
    "实验现象：两种无色溶液混合，立即产生白色沉淀",
    "反应应用：工业制备烧碱（NaOH）的苛化法基础",
    "苛化法原理：利用可溶性碳酸盐与石灰水反应制备氢氧化钠",
    "侯氏制碱法：联产纯碱和氯化铵的综合工艺，此反应是其中的一步",
    "沉淀性质：碳酸钙（CaCO₃）是白色固体，难溶于水，溶于酸产生CO₂",
    "实验应用：①制备少量NaOH ②除去溶液中的Ca²⁺ ③检验碳酸盐",
    "反应条件：常温下即可进行，反应迅速",
    "高考考点：①离子方程式书写 ②工业制烧碱 ③侯氏制碱法 ④沉淀反应",
    "中考考点：①复分解反应条件 ②实验现象描述 ③化学方程式书写"
  ]
}
```

##### 方程式64: 碳酸氢钠与氢氧化钙反应

```json
{
  "equationText": "2NaHCO₃ + Ca(OH)₂ → CaCO₃↓ + Na₂CO₃ + 2H₂O",
  "equationHtml": "2NaHCO<sub>3</sub> + Ca(OH)<sub>2</sub> → CaCO<sub>3</sub>↓ + Na<sub>2</sub>CO<sub>3</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "碳酸氢钠与氢氧化钙反应，产生白色沉淀。",
    "teacherDescription": "注意NaHCO₃与Ca(OH)₂的比例关系。",
    "keyPoints": [
      "方程式：2NaHCO₃ + Ca(OH)₂ → CaCO₃↓ + Na₂CO₃ + 2H₂O",
      "2:1比例"
    ]
  },
  "knowledgePoints": [
    "酸式盐与碱反应的典型代表：碳酸氢钠与氢氧化钙反应",
    "反应方程式：2NaHCO₃ + Ca(OH)₂ → CaCO₃↓ + Na₂CO₃ + 2H₂O（NaHCO₃过量）",
    "不同比例的反应：①NaHCO₃少量：NaHCO₃ + Ca(OH)₂ → CaCO₃↓ + NaOH + H₂O ②NaHCO₃过量：2NaHCO₃ + Ca(OH)₂ → CaCO₃↓ + Na₂CO₃ + 2H₂O",
    "反应类型：复分解反应（非氧化还原反应）",
    "实验现象：溶液混合产生白色沉淀",
    "比例关系的重要性：反应物比例不同，产物不同",
    "离子方程式：NaHCO₃少量时：HCO₃⁻ + Ca²⁺ + OH⁻ → CaCO₃↓ + H₂O；NaHCO₃过量时：2HCO₃⁻ + Ca²⁺ + 2OH⁻ → CaCO₃↓ + CO₃²⁻ + 2H₂O",
    "酸式盐与碱反应规律：酸式盐+碱→正盐+水",
    "实际应用：①除去硬水中的Ca²⁺ ②制备NaOH ③沉淀分离",
    "高考考点：①比例关系对产物的影响 ②离子方程式书写 ③过量反应分析",
    "中考考点：①化学方程式书写 ②实验现象描述 ③沉淀反应"
  ]
}
```

---

### 4.16 更多金属与盐反应

##### 方程式65: 铁与硫酸铜反应

```json
{
  "equationText": "Fe + CuSO₄ → FeSO₄ + Cu",
  "equationHtml": "Fe + CuSO<sub>4</sub> → FeSO<sub>4</sub> + Cu",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -198.0,
  "oxidationChanges": [
    {"element": "Fe", "from": 0, "to": "+2", "process": "氧化"},
    {"element": "Cu", "from": "+2", "to": 0, "process": "还原"}
  ],
  "reactants": [
    {"substanceId": 2, "coefficient": 1, "state": "s", "formula": "Fe", "name": "铁"},
    {"substanceId": 53, "coefficient": 1, "state": "aq", "formula": "CuSO₄", "name": "硫酸铜"}
  ],
  "products": [
    {"substanceId": 52, "coefficient": 1, "state": "aq", "formula": "FeSO₄", "name": "硫酸亚铁"},
    {"substanceId": 6, "coefficient": 1, "state": "s", "formula": "Cu", "name": "铜"}
  ],
  "teachingInfo": {
    "studentDescription": "铁钉放入蓝色硫酸铜溶液中，铁表面析出红色物质，溶液逐渐变为浅绿色。",
    "teacherDescription": "验证金属活动性：Fe > Cu。现象非常明显。",
    "keyPoints": [
      "方程式：Fe + CuSO₄ → FeSO₄ + Cu",
      "溶液由蓝色变为浅绿色（Cu²⁺→Fe²⁺）",
      "铁表面析出红色铜"
    ],
    "commonQuestions": [
      {"question": "为什么溶液颜色会变化？", "answer": "Cu²⁺（蓝色）被消耗，生成Fe²⁺（浅绿色）。"}
    ]
  },
  "phenomena": {
    "colorChange": {"before": "蓝色", "after": "浅绿色", "description": "溶液颜色变化"},
    "observationPoints": ["观察溶液颜色变化", "观察铁表面红色物质析出"]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触初期",
      "stageType": "initiation",
      "durationEstimate": "10秒",
      "phenomenaDescription": "铁钉放入蓝色溶液，接触面开始产生微小气泡",
      "colorChange": {
        "from": "蓝色溶液",
        "to": "蓝色溶液"
      },
      "microscopicExplanation": "Fe原子开始失去电子成为Fe²⁺进入溶液，表面活性点被破坏"
    },
    {
      "stageOrder": 2,
      "stageName": "反应进行中",
      "stageType": "propagation",
      "durationEstimate": "1-3分钟",
      "phenomenaDescription": "气泡持续产生，铁表面开始出现红色物质，溶液蓝色开始变浅",
      "colorChange": {
        "from": "蓝色溶液",
        "to": "蓝绿色溶液",
        "intermediate": ["蓝色→蓝绿色"]
      },
      "microscopicExplanation": "Fe²⁺不断生成并积累，Cu²⁺逐渐被消耗，Cu原子在铁表面析出"
    },
    {
      "stageOrder": 3,
      "stageName": "反应后期",
      "stageType": "completion",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "气泡减少直至停止，铁表面覆盖红色铜层，溶液变为浅绿色",
      "colorChange": {
        "from": "蓝绿色溶液",
        "to": "浅绿色溶液",
        "description": "最终溶液呈浅绿色（Fe²⁺颜色）"
      },
      "microscopicExplanation": "反应基本完成，Cu²⁺大部分转化为Fe²⁺，铁表面被铜覆盖阻止进一步反应"
    }
  ],
  "knowledgePoints": [
    "金属活动性顺序表的验证和应用（Fe > Cu）",
    "置换反应的判断依据和特征（单质+化合物→新单质+新化合物）",
    "氧化还原反应的电子转移分析（Fe→Fe²⁺+2e⁻，Cu²⁺+2e⁻→Cu）",
    "离子的颜色特征（Cu²⁺蓝色、Fe²⁺浅绿色、Fe³⁺黄色）",
    "反应条件对置换反应的影响（金属表面状态、溶液浓度等）",
    "实验现象与微观变化的对应关系",
    "金属腐蚀与防护的电化学原理",
    "反应速率与金属活动性、接触面积的关系",
    "为什么铁表面会覆盖铜层（阻碍反应继续进行）",
    "中考常见考点：金属活动性判断、置换反应方程式书写"
  ]
}
```

---

### 4.17 卤素及其化合物

##### 方程式66: 氯气与铁反应

```json
{
  "equationText": "2Fe + 3Cl₂ → 2FeCl₃",
  "equationHtml": "2Fe + 3Cl<sub>2</sub> → 2FeCl<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -822.0,
  "conditions": {"temperature": "点燃"},
  "oxidationChanges": [
    {"element": "Fe", "from": 0, "to": "+3", "process": "氧化"},
    {"element": "Cl", "from": 0, "to": "-1", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "铁丝在氯气中剧烈燃烧，产生棕褐色的烟。",
    "teacherDescription": "演示非金属单质与金属的反应。注意：氯气有毒。",
    "keyPoints": [
      "方程式：2Fe + 3Cl₂ → 2FeCl₃",
      "棕褐色烟（FeCl₃固体小颗粒）",
      "氯气氧化性很强"
    ],
    "safetyNotes": ["氯气有毒", "通风橱中进行", "佩戴护目镜"]
  },
  "phenomena": {
    "colorChange": {"before": "银白色", "after": "棕褐色烟"},
    "temperatureChange": {"isExothermic": true, "description": "剧烈燃烧"}
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "点燃初期",
      "stageType": "initiation",
      "durationEstimate": "数秒",
      "phenomenaDescription": "红热铁丝伸入黄绿色氯气中，立即剧烈燃烧，火星四射",
      "colorChange": {
        "from": "红热铁丝+黄绿色气体",
        "to": "剧烈燃烧+火星四射"
      },
      "microscopicExplanation": "Fe原子失去电子被氧化为Fe³⁺，Cl₂分子得到电子被还原为Cl⁻，反应剧烈放热"
    },
    {
      "stageOrder": 2,
      "stageName": "剧烈燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续几秒至几十秒",
      "phenomenaDescription": "产生大量棕褐色烟，铁丝逐渐消耗，燃烧持续进行",
      "colorChange": {
        "from": "燃烧中",
        "to": "大量棕褐色烟弥漫"
      },
      "microscopicExplanation": "2Fe + 3Cl₂ → 2FeCl₃，FeCl₃以固体小颗粒形式悬浮在气体中形成棕褐色烟"
    },
    {
      "stageOrder": 3,
      "stageName": "燃烧结束",
      "stageType": "completion",
      "durationEstimate": "铁丝燃尽后",
      "phenomenaDescription": "燃烧停止，容器内充满棕褐色烟，冷却后瓶壁有棕褐色固体附着",
      "colorChange": {
        "from": "棕褐色烟",
        "to": "棕褐色固体附着"
      },
      "microscopicExplanation": "Fe完全反应生成FeCl₃固体，棕褐色烟尘沉降附着在容器壁上"
    }
  ],
  "knowledgePoints": [
    "氯气的强氧化性：氯气是活泼的非金属单质，能与绝大多数金属反应",
    "反应方程式：2Fe + 3Cl₂ → 2FeCl₃（点燃）",
    "实验现象：铁丝在氯气中剧烈燃烧，火星四射，产生棕褐色的烟",
    "烟的本质：FeCl₃固体小颗粒悬浮在气体中形成烟（注意：不是气体，是固体颗粒）",
    "产物分析：FeCl₃是棕褐色固体，易溶于水形成棕黄色溶液",
    "氯气将铁氧化至+3价：说明氯气氧化性强，能将变价金属氧化至高价态",
    "对比：铁与氧气反应生成Fe₃O₄（Fe有+2、+3价），铁与氯气反应生成FeCl₃（Fe全部+3价）",
    "实验操作：将细铁丝灼热后迅速伸入盛有氯气的集气瓶中",
    "实验安全：氯气有毒，必须在通风橱中进行，尾气用NaOH溶液吸收",
    "高考考点：①氯气的化学性质 ②氧化还原反应分析 ③实验现象描述",
    "中考考点：①氯气的性质 ②燃烧的本质 ③化学方程式书写",
    "实际应用：氯气用于消毒、制漂白粉、制盐酸等工业领域"
  ]
}
```

##### 方程式67: 氯气与铜反应

```json
{
  "equationText": "Cu + Cl₂ → CuCl₂",
  "equationHtml": "Cu + Cl<sub>2</sub> → CuCl<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -220.0,
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "Cu", "from": 0, "to": "+2", "process": "氧化"},
    {"element": "Cl", "from": 0, "to": "-1", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "铜丝在氯气中燃烧，产生棕黄色的烟。",
    "teacherDescription": "验证氯气的氧化性。CuCl₂是棕黄色固体。",
    "keyPoints": [
      "方程式：Cu + Cl₂ → CuCl₂",
      "棕黄色烟",
      "需要加热"
    ]
  },
  "knowledgePoints": [
    "氯气与铜的反应验证了氯气的强氧化性",
    "反应方程式：Cu + Cl₂ → CuCl₂（加热）",
    "实验现象：铜丝在氯气中剧烈燃烧，产生棕黄色的烟",
    "烟的本质：CuCl₂固体小颗粒悬浮在气体中形成烟",
    "产物分析：CuCl₂是棕黄色固体，溶于水形成蓝色溶液（水合铜离子Cu(H₂O)₄²⁺呈蓝色）",
    "反应条件：需要加热才能引发反应",
    "氧化还原分析：Cu从0价升至+2价（失去2个电子被氧化），Cl从0价降至-1价（得到1个电子被还原）",
    "对比：铜在氧气中加热生成黑色CuO，在氯气中燃烧生成CuCl₂",
    "实验操作：将一束细铜丝灼热后迅速伸入盛有氯气的集气瓶中",
    "实验安全：氯气有毒，必须在通风橱中进行，尾气用NaOH溶液吸收",
    "高考考点：①氯气的化学性质 ②氧化还原反应分析 ③CuCl₂的性质",
    "实际应用：氯气用于制取氯化铜等氯化物"
  ]
}
```

##### 方程式68: 氯气与氢气反应

```json
{
  "equationText": "H₂ + Cl₂ → 2HCl",
  "equationHtml": "H<sub>2</sub> + Cl<sub>2</sub> → 2HCl",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -184.6,
  "conditions": {"temperature": "点燃"},
  "oxidationChanges": [
    {"element": "H", "from": 0, "to": "+1", "process": "氧化"},
    {"element": "Cl", "from": 0, "to": "-1", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "氢气在氯气中燃烧，产生苍白色火焰。",
    "teacherDescription": "H₂和Cl₂混合光照或点燃都会爆炸。工业制盐酸的基础。",
    "keyPoints": [
      "方程式：H₂ + Cl₂ → 2HCl",
      "苍白色火焰",
      "爆炸性混合气体"
    ],
    "safetyNotes": ["避免混合点燃", "强光照射爆炸"]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "点燃引燃",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "点燃氢气导管伸入黄绿色氯气中，产生苍白色火焰",
      "colorChange": {
        "from": "无色火焰+黄绿色气体",
        "to": "苍白色火焰"
      },
      "microscopicExplanation": "H₂和Cl₂分子在点燃条件下化学键断裂，H-H和Cl-Cl键断裂，H-Cl键形成"
    },
    {
      "stageOrder": 2,
      "stageName": "持续燃烧",
      "stageType": "propagation",
      "durationEstimate": "持续至氢气耗尽",
      "phenomenaDescription": "苍白色火焰稳定燃烧，黄绿色氯气逐渐变淡",
      "colorChange": {
        "from": "黄绿色气体+苍白色火焰",
        "to": "气体颜色变浅+火焰持续"
      },
      "microscopicExplanation": "H₂ + Cl₂ → 2HCl，连锁反应持续进行，释放大量热能维持燃烧"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "氢气燃尽后",
      "phenomenaDescription": "火焰熄灭，黄绿色消失，瓶口有白雾（氯化氢气体与空气中水蒸气结合）",
      "colorChange": {
        "from": "苍白色火焰",
        "to": "瓶口白雾"
      },
      "microscopicExplanation": "H₂和Cl₂完全反应生成HCl气体，HCl与空气中水蒸气结合形成盐酸小液滴"
    }
  ],
  "knowledgePoints": [
    "非金属单质间的化合反应：氢气在氯气中燃烧",
    "反应方程式：H₂ + Cl₂ → 2HCl（条件：点燃或光照）",
    "反应类型：化合反应，也是氧化还原反应",
    "实验现象：氢气在氯气中安静燃烧，发出苍白色火焰，瓶口有白雾",
    "苍白色火焰的原因：H₂在Cl₂中燃烧产生的火焰呈苍白色（与氢气在氧气中淡蓝色火焰不同）",
    "白雾的本质：生成的HCl气体与空气中水蒸气结合形成盐酸小液滴（雾）",
    "燃烧的条件：点燃或光照都能引发反应，但H₂和Cl₂混合气体光照或点燃会爆炸",
    "爆炸极限：氢气和氯气混合气体在光照或点燃条件下可能发生链式爆炸反应",
    "工业应用：工业制盐酸的基础（H₂在Cl₂中燃烧生成HCl，HCl溶于水得盐酸）",
    "氧化还原分析：H从0价升至+1价（失电子），Cl从0价降至-1价（得电子）",
    "实验安全：氢气点燃前必须验纯，H₂和Cl₂混合气体在光照或点燃下会爆炸",
    "高考考点：①燃烧的本质（发光发热的剧烈化学反应）②HCl的工业制备 ③氧化还原分析",
    "对比实验：H₂在O₂中燃烧（淡蓝色火焰）vs H₂在Cl₂中燃烧（苍白色火焰）"
  ]
}
```

##### 方程式69: 氯气与水反应

```json
{
  "equationText": "Cl₂ + H₂O ⇌ HCl + HClO",
  "equationHtml": "Cl<sub>2</sub> + H<sub>2</sub>O ⇌ HCl + HClO",
  "reactionTypeCode": "DISPROPORTIONATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "Cl", "from": 0, "to": "-1", "process": "还原"},
    {"element": "Cl", "from": 0, "to": "+1", "process": "氧化"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 70,
      "secondaryEquationText": "2HClO → 2HCl + O₂↑",
      "secondaryEquationHtml": "2HClO → 2HCl + O<sub>2</sub>↑",
      "relationship": "sequential",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "lightPresent": true,
        "temperature": "室温或加热"
      },
      "phenomenonImpact": {
        "description": "次氯酸分解，氯水漂白性减弱，产生气泡"
      },
      "teachingNote": "氯水需要避光保存，新制氯水漂白性强",
      "isCommonStudentError": true
    },
    {
      "secondaryEquationId": 220,
      "secondaryEquationText": "HClO + HCl → H₂O + Cl₂↑",
      "secondaryEquationHtml": "HClO + HCl → H<sub>2</sub>O + Cl<sub>2</sub>↑",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "concentration": "高浓度"
      },
      "phenomenonImpact": {
        "description": "浓氯水中Cl₂重新逸出"
      },
      "teachingNote": "氯水中Cl₂、HClO、HCl存在平衡"
    }
  ],
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "溶解初期",
      "stageType": "initiation",
      "durationEstimate": "5-10秒",
      "phenomenaDescription": "氯气开始溶于水，溶液逐渐呈现浅黄绿色，有刺激性气味",
      "colorChange": {
        "from": "无色透明水",
        "to": "浅黄绿色溶液"
      },
      "microscopicExplanation": "Cl₂分子与H₂O分子碰撞，部分Cl₂发生歧化反应，生成HCl和HClO，建立Cl₂(aq)⇌Cl₂·H₂O平衡"
    },
    {
      "stageOrder": 2,
      "stageName": "反应平衡",
      "stageType": "propagation",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "溶液颜色稳定，呈浅黄绿色，pH值下降（约2-3），具有强氧化性和漂白性",
      "colorChange": {
        "from": "浅黄绿色溶液",
        "to": "稳定浅黄绿色"
      },
      "microscopicExplanation": "Cl₂ + H₂O ⇌ HCl + HClO平衡建立，溶液中存在Cl₂分子、H⁺、Cl⁻、ClO⁻等多种微粒"
    },
    {
      "stageOrder": 3,
      "stageName": "光照分解",
      "stageType": "completion",
      "durationEstimate": "数小时至数天",
      "phenomenaDescription": "光照下氯水颜色逐渐变浅，产生少量气泡，漂白性减弱",
      "colorChange": {
        "from": "浅黄绿色",
        "to": "几乎无色"
      },
      "microscopicExplanation": "2HClO → 2HCl + O₂↑（光照催化），次氯酸分解，平衡向右移动，Cl₂浓度降低"
    }
  ],
  "teachingInfo": {
    "studentDescription": "氯气溶于水，生成盐酸和次氯酸。氯水呈浅黄绿色。",
    "teacherDescription": "氯气的歧化反应。Cl₂既是氧化剂又是还原剂。",
    "keyPoints": [
      "方程式：Cl₂ + H₂O ⇌ HCl + HClO",
      "歧化反应",
      "氯水具有漂白性（HClO）"
    ],
    "commonQuestions": [
      {"question": "氯水为什么有漂白性？", "answer": "HClO具有强氧化性，能漂白有色物质。"}
    ]
  },
  "knowledgePoints": [
    "氯气与水的反应是典型的歧化反应，氯元素发生自身氧化还原",
    "反应方程式：Cl₂ + H₂O ⇌ HCl + HClO（可逆反应）",
    "离子方程式：Cl₂ + H₂O ⇌ H⁺ + Cl⁻ + HClO",
    "歧化反应分析：Cl₂中Cl为0价，反应后部分Cl降至-1价（HCl中），部分Cl升至+1价（HClO中）",
    "反应类型：歧化反应（自身氧化还原反应的一种特殊形式），也是可逆反应",
    "实验现象：氯气溶于水后形成浅黄绿色溶液（氯水），有刺激性气味",
    "氯水的成分：分子（Cl₂、H₂O、HClO），离子（H⁺、Cl⁻、ClO⁻、OH⁻）",
    "次氯酸的性质：①强氧化性（漂白、杀菌消毒）②不稳定性（见光分解）③弱酸性",
    "漂白原理：HClO具有强氧化性，能破坏有机色素的发色基团，使有色物质褪色",
    "氯水的性质：①酸性（H⁺）②漂白性（HClO）③氧化性（Cl₂、HClO）",
    "氯水与液氯的区别：氯水是混合物，液氯是纯净物（Cl₂）",
    "新制氯水与久置氯水的区别：新制氯水含HClO有漂白性，久置氯水HClO分解为HCl和O₂，无漂白性",
    "氯水保存方法：棕色瓶避光保存（防止HClO分解）",
    "高考考点：①歧化反应分析 ②氯水的成分和性质 ③漂白性原理 ④离子方程式书写",
    "实际应用：自来水消毒（Cl₂与水反应生成HClO杀菌消毒）、漂白剂"
  ]
}
```

##### 方程式70: 次氯酸分解

```json
{
  "equationText": "2HClO → 2HCl + O₂↑",
  "equationHtml": "2HClO → 2HCl + O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "光照"},
  "teachingInfo": {
    "studentDescription": "次氯酸在光照下分解，产生氧气。",
    "teacherDescription": "氯水需要避光保存的原因。光照加速HClO分解。",
    "keyPoints": [
      "方程式：2HClO → 2HCl + O₂↑",
      "光照加速分解",
      "氯水避光保存"
    ]
  },
  "knowledgePoints": [
    "次氯酸的不稳定性是其重要性质之一，容易分解",
    "反应方程式：2HClO → 2HCl + O₂↑（条件：光照或加热）",
    "反应类型：分解反应，也是氧化还原反应",
    "分解条件：光照、加热都能加速HClO的分解，光照催化效果更显著",
    "实验现象：氯水在光照下颜色逐渐变浅，产生少量气泡（氧气）",
    "氧化还原分析：Cl元素从+1价降至-1价（得电子被还原），O元素从-2价升至0价（失电子被氧化）",
    "分解的后果：HClO分解后，氯水的漂白性和杀菌消毒能力减弱或消失",
    "氯水保存方法：棕色瓶、避光、阴凉处保存（延缓HClO分解）",
    "久置氯水的成分：主要是HCl和H₂O，几乎不含HClO（已分解）",
    "新制氯水与久置氯水的区别：新制氯水有漂白性（含HClO），久置氯水无漂白性（HClO已分解）",
    "实际应用：解释为什么氯水需要现用现配、漂白剂和消毒剂的有效期",
    "高考考点：①次氯酸的不稳定性 ②氯水的保存 ③新制与久置氯水的区别 ④氧化还原分析",
    "生活联系：家用漂白剂、消毒液需要避光保存且定期更换"
  ]
}
```

##### 方程式71: 实验室制氯气

```json
{
  "equationText": "MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O",
  "equationHtml": "MnO<sub>2</sub> + 4HCl(浓) → MnCl<sub>2</sub> + Cl<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -105.0,
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "Mn", "from": "+4", "to": "+2", "process": "还原"},
    {"element": "Cl", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "二氧化锰与浓盐酸加热反应，产生黄绿色氯气。",
    "teacherDescription": "实验室制氯气的常用方法。浓盐酸必须用。",
    "keyPoints": [
      "方程式：MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O",
      "固液加热装置",
      "向上排空气法收集",
      "尾气处理（NaOH溶液）"
    ],
    "safetyNotes": ["浓盐酸易挥发", "氯气有毒", "必须通风"]
  },
  "phenomena": {
    "colorChange": {"before": "黑色固体+无色溶液", "after": "浅绿色溶液+黄绿色气体"},
    "gasEvolution": {"hasGas": true, "gasDescription": "黄绿色刺激性气体"},
    "temperatureChange": {"isExothermic": true}
  },
  "knowledgePoints": [
    "实验室制氯气的经典方法：二氧化锰与浓盐酸加热反应",
    "反应方程式：MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O（条件：加热）",
    "反应类型：氧化还原反应（MnO₂是氧化剂，HCl是还原剂）",
    "氧化还原分析：Mn从+4价降至+2价（得电子被还原），Cl从-1价升至0价（失电子被氧化）",
    "反应装置：固液加热型（圆底烧瓶+分液漏斗+酒精灯）",
    "气体收集：向上排空气法（Cl₂密度大于空气）",
    "气体检验：湿润淀粉碘化钾试纸变蓝（Cl₂氧化I⁻生成I₂）",
    "尾气处理：用NaOH溶液吸收（Cl₂ + 2NaOH → NaCl + NaClO + H₂O）",
    "为什么用浓盐酸：稀盐酸还原性不足，不能发生此反应",
    "为什么不用稀盐酸：稀盐酸中Cl⁻浓度低，且MnO₂氧化稀盐酸的反应极慢或不发生",
    "浓盐酸的挥发性：浓盐酸易挥发，制得的Cl₂中混有HCl，需通过饱和食盐水除杂",
    "实验现象：黑色MnO₂逐渐溶解，溶液变为浅绿色（Mn²⁺），产生黄绿色气体",
    "氯气干燥：通过浓硫酸干燥（除去水分）",
    "实验安全：氯气有毒，必须在通风橱中进行，尾气必须处理",
    "高考考点：①实验室制气装置 ②氧化还原分析 ③氯气净化和干燥 ④尾气处理"
  ]
}
```

---

### 4.18 氧族完整内容

##### 方程式72: 硫与铁反应

```json
{
  "equationText": "Fe + S → FeS",
  "equationHtml": "Fe + S → FeS",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "铁粉与硫粉混合加热，生成黑色硫化亚铁。",
    "teacherDescription": "放热反应。需要在研钵中混合均匀后加热。",
    "keyPoints": [
      "方程式：Fe + S → FeS",
      "黑色固体",
      "放热反应"
    ]
  },
  "knowledgePoints": [
    "金属与非金属化合反应的典型代表：铁与硫反应生成硫化亚铁",
    "反应方程式：Fe + S → FeS（条件：加热）",
    "反应类型：化合反应，也是放热反应、氧化还原反应",
    "实验现象：铁粉与硫粉混合加热后，剧烈反应，发出红光，生成黑色固体",
    "产物性质：硫化亚铁（FeS）是黑色固体，难溶于水，能溶于酸",
    "氧化还原分析：Fe从0价升至+2价（失电子被氧化），S从0价降至-2价（得电子被还原）",
    "反应特点：反应放热，一旦引发可自行持续进行",
    "对比：铁与氯气反应生成FeCl₃（Fe为+3价），铁与硫反应生成FeS（Fe为+2价）",
    "为什么生成+2价铁：硫的氧化性较弱，只能将铁氧化至+2价",
    "实验操作：铁粉和硫粉需充分混合均匀，加热引发反应",
    "反应后磁性检验：反应前混合物能被磁铁吸引（铁粉），反应后不能被磁铁吸引（FeS无磁性）",
    "中考考点：①化合反应 ②实验现象描述 ③磁性变化",
    "高考考点：①氧化性比较 ②硫的弱氧化性 ③产物分析",
    "实际应用：实验室制备硫化亚铁，用于制备硫化氢"
  ]
}
```

##### 方程式73: 硫化氢的实验室制法

```json
{
  "equationText": "FeS + 2HCl → FeCl₂ + H₂S↑",
  "equationHtml": "FeS + 2HCl → FeCl<sub>2</sub> + H<sub>2</sub>S↑",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "硫化亚铁与盐酸反应，产生有臭鸡蛋气味的硫化氢气体。",
    "teacherDescription": "实验室制H₂S的方法。H₂S有毒，必须通风。",
    "keyPoints": [
      "方程式：FeS + 2HCl → FeCl₂ + H₂S↑",
      "臭鸡蛋气味",
      "有毒气体"
    ]
  },
  "knowledgePoints": [
    "实验室制硫化氢气体的标准方法：硫化亚铁与盐酸或硫酸反应",
    "反应方程式：FeS + 2HCl → FeCl₂ + H₂S↑（也可用H₂SO₄）",
    "离子方程式：FeS + 2H⁺ → Fe²⁺ + H₂S↑",
    "反应类型：复分解反应（非氧化还原反应），也是酸性气体制备反应",
    "反应装置：固液常温型（与制CO₂装置类似），可用启普发生器",
    "气体收集：向上排空气法（H₂S密度大于空气）",
    "H₂S的性质：①无色气体 ②有臭鸡蛋气味 ③有剧毒 ④能溶于水（氢硫酸）",
    "为什么不能用强氧化性酸：浓HNO₃或浓H₂SO₄会氧化H₂S生成S或SO₂",
    "为什么用稀酸：浓盐酸挥发性强会使制得的H₂S不纯",
    "H₂S的毒性：剧毒气体，吸入少量高浓度H₂S可于短时间内致命",
    "H₂S的检验：①气味（臭鸡蛋味）②湿润醋酸铅试纸变黑",
    "实验安全：必须在通风橱中进行，尾气需处理（用CuSO₄或NaOH溶液吸收）",
    "氢硫酸：H₂S的水溶液，二元弱酸，具有挥发性和还原性",
    "高考考点：①实验室制气 ②H₂S的性质 ③离子方程式 ④毒性及安全",
    "中考考点：①实验装置选择 ②气体收集方法 ③安全注意事项"
  ]
}
      "H₂S有臭鸡蛋气味",
      "有毒"
    ],
    "safetyNotes": ["有毒气体", "通风良好"]
  }
}
```

##### 方程式74: 硫化氢燃烧

```json
{
  "equationText": "2H₂S + 3O₂ → 2SO₂ + 2H₂O",
  "equationHtml": "2H<sub>2</sub>S + 3O<sub>2</sub> → 2SO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "点燃"},
  "oxidationChanges": [
    {"element": "S", "from": "-2", "to": "+4", "process": "氧化"}
  ],
  "secondaryReactions": [
    {
      "secondaryEquationId": 265,
      "secondaryEquationText": "2H₂S + O₂ → 2S + 2H₂O",
      "secondaryEquationHtml": "2H<sub>2</sub>S + O<sub>2</sub> → 2S + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时生成硫单质，淡蓝色火焰"
      },
      "teachingNote": "H₂S燃烧根据氧气量不同产物不同"
    },
    {
      "secondaryEquationId": 266,
      "secondaryEquationText": "H₂S ⇌ H⁺ + HS⁻",
      "secondaryEquationHtml": "H<sub>2</sub>S ⇌ H<sup>+</sup> + HS<sup>-</sup>",
      "relationship": "side",
      "triggerProbability": 1.0,
      "triggerCondition": {
        "waterPresent": true
      },
      "phenomenonImpact": {
        "description": "H₂S溶于水形成弱酸性溶液"
      },
      "teachingNote": "H₂S是二元弱酸"
    }
  ],
  "teachingInfo": {
    "studentDescription": "硫化氢在空气中完全燃烧，产生二氧化硫和水。",
    "teacherDescription": "O₂充足时生成SO₂；O₂不足时生成S。",
    "keyPoints": [
      "方程式：2H₂S + 3O₂ → 2SO₂ + 2H₂O",
      "完全燃烧",
      "淡蓝色火焰"
    ]
  }
}
```

##### 方程式75: 二氧化硫与溴水反应

```json
{
  "equationText": "SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr",
  "equationHtml": "SO<sub>2</sub> + Br<sub>2</sub> + 2H<sub>2</sub>O → H<sub>2</sub>SO<sub>4</sub> + 2HBr",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "二氧化硫使溴水褪色。",
    "teacherDescription": "SO₂的还原性：将Br₂还原为Br⁻。",
    "keyPoints": [
      "方程式：SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr",
      "SO₂使溴水褪色",
      "SO₂的还原性"
    ]
  }
}
```

##### 方程式76: 浓硫酸与铜反应

```json
{
  "equationText": "Cu + 2H₂SO₄(浓) → CuSO₄ + SO₂↑ + 2H₂O",
  "equationHtml": "Cu + 2H<sub>2</sub>SO<sub>4</sub>(浓) → CuSO<sub>4</sub> + SO<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "Cu", "from": 0, "to": "+2", "process": "氧化"},
    {"element": "S", "from": "+6", "to": "+4", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "铜与浓硫酸加热反应，产生蓝色溶液和刺激性气体。",
    "teacherDescription": "浓硫酸的强氧化性。稀硫酸无此反应。",
    "keyPoints": [
      "方程式：Cu + 2H₂SO₄(浓) → CuSO₄ + SO₂↑ + 2H₂O",
      "浓硫酸强氧化性",
      "稀硫酸无此反应"
    ],
    "commonQuestions": [
      {"question": "为什么稀硫酸与铜不反应？", "answer": "稀硫酸无强氧化性，不能将Cu氧化。"}
    ],
    "safetyNotes": ["浓硫酸腐蚀", "SO₂有毒"]
  },
  "knowledgePoints": [
    "铜与浓硫酸反应展示了浓硫酸的强氧化性",
    "反应方程式：Cu + 2H₂SO₄(浓) → CuSO₄ + SO₂↑ + 2H₂O（加热）",
    "反应条件：必须加热，必须使用浓硫酸（稀硫酸与铜不反应）",
    "氧化还原分析：Cu从0价升至+2价（被氧化），S从+6价降至+4价（被还原）",
    "实验现象：黑色铜逐渐溶解，溶液由无色变为蓝色，产生刺激性气味的气体（SO₂）",
    "浓硫酸的性质：强氧化性（加热时）、吸水性、脱水性、强腐蚀性",
    "为什么稀硫酸不行：稀硫酸中H₂SO₄主要以H⁺和SO₄²⁻存在，无强氧化性",
    "产物分析：CuSO₄溶液呈蓝色（水合铜离子），加水后蓝色更明显",
    "气体检验：SO₂能使品红溶液褪色，或使酸性KMnO₄溶液褪色",
    "高考考点：①浓硫酸的强氧化性 ②氧化还原反应分析 ③实验现象描述",
    "中考考点：①浓硫酸的性质 ②铜与浓硫酸反应 ③实验安全",
    "实验安全：浓硫酸有强腐蚀性，SO₂有毒，必须在通风橱中进行",
    "实际应用：制备硫酸铜，制备SO₂气体"
  ]
}
```

##### 方程式77: 浓硫酸与碳反应

```json
{
  "equationText": "C + 2H₂SO₄(浓) → CO₂↑ + 2SO₂↑ + 2H₂O",
  "equationHtml": "C + 2H<sub>2</sub>SO<sub>4</sub>(浓) → CO<sub>2</sub>↑ + 2SO<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "C", "from": 0, "to": "+4", "process": "氧化"},
    {"element": "S", "from": "+6", "to": "+4", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "木炭与浓硫酸加热，产生两种气体。",
    "teacherDescription": "浓硫酸的强氧化性，将C氧化为CO₂。",
    "keyPoints": [
      "方程式：C + 2H₂SO₄(浓) → CO₂↑ + 2SO₂↑ + 2H₂O",
      "产生两种气体"
    ]
  },
  "knowledgePoints": [
    "木炭与浓硫酸反应展示了浓硫酸的强氧化性（能将碳氧化）",
    "反应方程式：C + 2H₂SO₄(浓) → CO₂↑ + 2SO₂↑ + 2H₂O（加热）",
    "反应条件：必须加热，必须使用浓硫酸",
    "氧化还原分析：C从0价升至+4价（被氧化），S从+6价降至+4价（被还原）",
    "实验现象：黑色木炭逐渐溶解，产生无色刺激性气味气体（SO₂和CO₂混合物）",
    "气体产物：CO₂和SO₂两种气体，CO₂能使澄清石灰水变浑浊，SO₂能使品红褪色",
    "浓硫酸的强氧化性：加热时能氧化许多非金属单质（如C、S、P等）",
    "对比：稀硫酸无强氧化性，不能与非金属单质反应",
    "实验检验：将气体通入澄清石灰水（变浑浊说明有CO₂），再通入品红溶液（褪色说明有SO₂）",
    "高考考点：①浓硫酸的强氧化性 ②氧化还原反应分析 ③气体检验",
    "实验安全：浓硫酸有强腐蚀性，反应放热，必须在通风橱中进行",
    "实际应用：实验室制备SO₂和CO₂混合气体，演示浓硫酸的强氧化性",
    "环境保护：SO₂是大气污染物，会导致酸雨"
  ]
}
```

---

### 4.19 氮族完整内容

##### 方程式78: 氮气与镁反应

```json
{
  "equationText": "3Mg + N₂ → Mg₃N₂",
  "equationHtml": "3Mg + N<sub>2</sub> → Mg<sub>3</sub>N<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "点燃"},
  "teachingInfo": {
    "studentDescription": "镁条在氮气中燃烧，生成淡黄色固体。",
    "teacherDescription": "镁在空气中燃烧的部分产物是Mg₃N₂（不是MgO）。",
    "keyPoints": [
      "方程式：3Mg + N₂ → Mg₃N₂",
      "Mg₃N₂是淡黄色固体"
    ]
  },
  "knowledgePoints": [
    "镁在氮气中燃烧展示了氮气在高温下的化学活性",
    "反应方程式：3Mg + N₂ → Mg₃N₂（点燃）",
    "反应条件：高温点燃，镁在空气中燃烧时同时与O₂和N₂反应",
    "产物性质：Mg₃N₂（氮化镁）是淡黄色固体，离子化合物",
    "镁在空气中燃烧的主要产物：MgO（白色固体），次要产物：Mg₃N₂（淡黄色固体）",
    "氮化镁的性质：与水反应生成氨气和氢氧化镁：Mg₃N₂ + 6H₂O → 3Mg(OH)₂ + 2NH₃↑",
    "Mg₃N₂的水解：离子反应Mg₃N₂ + 6H₂O → 3Mg²⁺ + 6OH⁻ + 2NH₃↑",
    "实验现象：镁条在氮气中剧烈燃烧，发出耀眼白光，生成淡黄色固体",
    "镁的性质：活泼金属，不仅能与氧气反应，还能与氮气、二氧化碳等反应",
    "固氮作用：将游离态的氮转化为化合态的氮（Mg₃N₂），这是人工固氮的一种方式",
    "高考考点：①氮的化学性质 ②Mg₃N₂的水解反应 ③金属氮化物",
    "中考考点：①镁的化学性质 ②镁在空气中燃烧的产物",
    "实际应用：制备Mg₃N₂，研究镁的化学性质"
  ]
}
```
```

##### 方程式79: 一氧化氮与氧气反应

```json
{
  "equationText": "2NO + O₂ → 2NO₂",
  "equationHtml": "2NO + O<sub>2</sub> → 2NO<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "N", "from": "+2", "to": "+4", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "无色一氧化氮遇空气立即变为红棕色二氧化氮。",
    "teacherDescription": "NO易被氧化，实验中需要无空气环境保存。",
    "keyPoints": [
      "方程式：2NO + O₂ → 2NO₂",
      "NO无色",
      "NO₂红棕色"
    ]
  }
}
```

##### 方程式80: 铜与浓硝酸反应

```json
{
  "equationText": "Cu + 4HNO₃(浓) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O",
  "equationHtml": "Cu + 4HNO<sub>3</sub>(浓) → Cu(NO<sub>3</sub>)<sub>2</sub> + 2NO<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "常温"},
  "oxidationChanges": [
    {"element": "Cu", "from": 0, "to": "+2", "process": "氧化"},
    {"element": "N", "from": "+5", "to": "+4", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "铜与浓硝酸反应，产生红棕色气体和蓝色溶液。",
    "teacherDescription": "常温下反应，不需加热。钝化：常温下Fe、Al遇浓HNO₃会钝化。",
    "keyPoints": [
      "方程式：Cu + 4HNO₃(浓) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O",
      "常温反应",
      "产生红棕色NO₂"
    ],
    "commonQuestions": [
      {"question": "为什么常温就能反应？", "answer": "浓硝酸强氧化性，常温即可与Cu反应。"}
    ],
    "safetyNotes": ["NO₂有毒", "浓硝酸腐蚀"]
  },
  "phenomena": {
    "colorChange": {"before": "紫红色溶液", "after": "蓝色溶液", "description": "溶液变蓝"},
    "gasEvolution": {"hasGas": true, "gasDescription": "红棕色气体"}
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "接触反应",
      "stageType": "initiation",
      "durationEstimate": "立即",
      "phenomenaDescription": "紫红色铜片加入无色浓硝酸中，立即产生红棕色气体，溶液开始变蓝",
      "colorChange": {
        "from": "紫红色铜+无色溶液",
        "to": "铜表面+蓝绿色溶液+红棕色气体"
      },
      "microscopicExplanation": "Cu + 4HNO₃ → Cu²⁺ + 2NO₃⁻ + 2NO₂↑ + 2H₂O，Cu失去电子被氧化为Cu²⁺，HNO₃被还原为NO₂"
    },
    {
      "stageOrder": 2,
      "stageName": "剧烈反应",
      "stageType": "propagation",
      "durationEstimate": "持续几分钟",
      "phenomenaDescription": "反应剧烈进行，产生大量红棕色NO₂气体，铜片逐渐溶解，溶液颜色逐渐变深为蓝色",
      "colorChange": {
        "from": "反应进行中",
        "to": "深蓝色溶液+大量红棕色气体"
      },
      "microscopicExplanation": "Cu持续溶解：Cu → Cu²⁺ + 2e⁻，NO₃⁻ + 2H⁺ + e⁻ → NO₂↑ + H₂O，形成水合铜离子[Cu(H₂O)₆]²⁺呈蓝色"
    },
    {
      "stageOrder": 3,
      "stageName": "反应完成",
      "stageType": "completion",
      "durationEstimate": "铜片完全溶解后",
      "phenomenaDescription": "铜片完全消失，溶液呈深蓝色，不再产生红棕色气体",
      "colorChange": {
        "from": "深蓝色溶液+气体",
        "to": "透明深蓝色溶液"
      },
      "microscopicExplanation": "Cu完全反应生成Cu(NO₃)₂溶液，溶液主要为蓝色的水合铜离子和NO₃⁻"
    }
  ]
}
```

##### 方程式81: 碳与浓硝酸反应

```json
{
  "equationText": "C + 4HNO₃(浓) → CO₂↑ + 4NO₂↑ + 2H₂O",
  "equationHtml": "C + 4HNO<sub>3</sub>(浓) → CO<sub>2</sub>↑ + 4NO<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "C", "from": 0, "to": "+4", "process": "氧化"},
    {"element": "N", "from": "+5", "to": "+4", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "木炭与浓硝酸加热，产生红棕色气体。",
    "teacherDescription": "浓硝酸强氧化性的体现。",
    "keyPoints": [
      "方程式：C + 4HNO₃(浓) → CO₂↑ + 4NO₂↑ + 2H₂O"
    ]
  }
}
```

---

### 4.20 更多有机化学反应

##### 方程式82: 乙烯聚合

```json
{
  "equationText": "nC₂H₄ → [-CH₂-CH₂-]ₙ",
  "equationHtml": "nC<sub>2</sub>H<sub>4</sub> → [-CH<sub>2</sub>-CH<sub>2</sub>-]<sub>n</sub>",
  "reactionTypeCode": "POLYMERIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "催化剂", "pressure": "加压"},
  "teachingInfo": {
    "studentDescription": "乙烯在催化剂作用下聚合生成聚乙烯。",
    "teacherDescription": "加聚反应。n表示聚合度。",
    "keyPoints": [
      "方程式：nC₂H₄ → [-CH₂-CH₂-]ₙ",
      "加聚反应",
      "聚乙烯（塑料）"
    ]
  }
}
```

##### 方程式83: 乙醇催化氧化

```json
{
  "equationText": "2C₂H₅OH + O₂ → 2CH₃CHO + 2H₂O",
  "equationHtml": "2C<sub>2</sub>H<sub>5</sub>OH + O<sub>2</sub> → 2CH<sub>3</sub>CHO + 2H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热", "catalyst": "Cu或Ag"},
  "oxidationChanges": [
    {"element": "C", "from": "-2", "to": "-1", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "乙醇蒸气在催化剂作用下被氧气氧化为乙醛。",
    "teacherDescription": "工业制乙醛的方法。Cu或Ag作催化剂。",
    "keyPoints": [
      "方程式：2C₂H₅OH + O₂ → 2CH₃CHO + 2H₂O",
      "催化氧化",
      "乙醇→乙醛"
    ]
  }
}
```

##### 方程式84: 乙醇氧化为乙酸

```json
{
  "equationText": "C₂H₅OH + O₂ → CH₃COOH + H₂O",
  "equationHtml": "C<sub>2</sub>H<sub>5</sub>OH + O<sub>2</sub> → CH<sub>3</sub>COOH + H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热", "catalyst": "催化剂"},
  "oxidationChanges": [
    {"element": "C", "from": "-2", "to": "+3", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "乙醇被氧化为乙酸。",
    "teacherDescription": "进一步氧化，-2价C变为+3价。",
    "keyPoints": [
      "方程式：C₂H₅OH + O₂ → CH₃COOH + H₂O",
      "乙醇→乙酸"
    ]
  }
}
```

##### 方程式: 苯与液溴反应

```json
{
  "equationText": "C₆H₆ + Br₂ → C₆H₅Br + HBr",
  "equationHtml": "C<sub>6</sub>H<sub>6</sub> + Br<sub>2</sub> → C<sub>6</sub>H<sub>5</sub>Br + HBr",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "催化剂", "catalyst": "FeBr₃"},
  "teachingInfo": {
    "studentDescription": "苯与液溴在催化剂作用下发生取代反应。",
    "teacherDescription": "苯环上的取代反应。产生白雾（HBr）。",
    "keyPoints": [
      "方程式：C₆H₆ + Br₂ → C₆H₅Br + HBr",
      "取代反应",
      "FeBr₃催化"
    ]
  }
}
```

##### 方程式: 苯与浓硝酸反应

```json
{
  "equationText": "C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>6</sub> + HNO<sub>3</sub> → C<sub>6</sub>H<sub>5</sub>NO<sub>2</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热", "catalyst": "浓H₂SO₄"},
  "teachingInfo": {
    "studentDescription": "苯与浓硝酸反应生成硝基苯。",
    "teacherDescription": "硝化反应。浓H₂SO₄作催化剂和吸水剂。",
    "keyPoints": [
      "方程式：C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O",
      "硝化反应",
      "硝基苯是苦杏仁味液体"
    ]
  }
}
```

---

### 4.21 电化学完整内容

##### 方程式: 电解饱和食盐水

```json
{
  "equationText": "2NaCl + 2H₂O → 2NaOH + H₂↑ + Cl₂↑",
  "equationHtml": "2NaCl + 2H<sub>2</sub>O → 2NaOH + H<sub>2</sub>↑ + Cl<sub>2</sub>↑",
  "reactionTypeCode": "ELECTROLYSIS",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "通电"},
  "oxidationChanges": [
    {"element": "Cl", "from": "-1", "to": 0, "process": "氧化"},
    {"element": "H", "from": "+1", "to": 0, "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "食盐水通电，阴极产生氢气，阳极产生氯气。",
    "teacherDescription": "氯碱工业的基础反应。",
    "keyPoints": [
      "方程式：2NaCl + 2H₂O → 2NaOH + H₂↑ + Cl₂↑",
      "阴极：2H⁺ + 2e⁻ → H₂↑",
      "阳极：2Cl⁻ - 2e⁻ → Cl₂↑"
    ]
  }
}
```

##### 方程式: 电解水

```json
{
  "equationText": "2H₂O → 2H₂↑ + O₂↑",
  "equationHtml": "2H<sub>2</sub>O → 2H<sub>2</sub>↑ + O<sub>2</sub>↑",
  "reactionTypeCode": "ELECTROLYSIS",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "通电"},
  "oxidationChanges": [
    {"element": "H", "from": "+1", "to": 0, "process": "还原"},
    {"element": "O", "from": "-2", "to": 0, "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "水通电分解，产生氢气和氧气。",
    "teacherDescription": "验证水的组成。正极产生O₂，负极产生H₂。",
    "keyPoints": [
      "方程式：2H₂O → 2H₂↑ + O₂↑",
      "正极：O₂，负极：H₂",
      "H₂:O₂ = 2:1"
    ],
    "commonQuestions": [
      {"question": "为什么需要加少量电解质？", "answer": "纯水不导电，加少量Na₂SO₄或NaOH增强导电性。"}
    ]
  },
  "knowledgePoints": [
    "电解水实验现象口诀：'氧正氢负，氧一氢二'——正极产生氧气，负极产生氢气，体积比约为1:2",
    "电极判断：与电源正极相连的电极产生氧气，与电源负极相连的电极产生氢气",
    "气体验验：正极产生的气体能使带火星的木条复燃（氧气），负极产生的气体能够燃烧，产生淡蓝色火焰（氢气）",
    "宏观现象：两极产生气泡，负极产生的气体体积大约是正极的2倍",
    "实验结论：水是由氢元素和氧元素组成的，每个水分子由2个氢原子和1个氧原子构成",
    "反应类型：分解反应（一种物质分解成两种物质），也是氧化还原反应",
    "氧化还原分析：氢元素从+1价降至0价（被还原），氧元素从-2价升至0价（被氧化）",
    "电解质的作用：纯水几乎不导电，需要加入少量稀硫酸或氢氧化钠增强导电性，加快电解速率",
    "微观解释：在电流作用下，水分子分解成氢原子和氧原子，氢原子结合成氢分子，氧原子结合成氧分子",
    "质量守恒：化学反应前后，元素种类不变，原子数目不变，水的质量等于氢气和氧气质量之和",
    "气体质量比：虽然体积比为2:1，但质量比为1:8（氢气密度小）",
    "中考考点：①电极判断 ②气体检验 ③水的组成 ④实验现象描述 ⑤质量守恒定律"
  ]
}
```

##### 方程式: 铁的吸氧腐蚀

```json
{
  "equationText": "2Fe + 2H₂O + O₂ → 2Fe(OH)₂",
  "equationHtml": "2Fe + 2H<sub>2</sub>O + O<sub>2</sub> → 2Fe(OH)<sub>2</sub>",
  "reactionTypeCode": "CORROSION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "Fe", "from": 0, "to": "+2", "process": "氧化"},
    {"element": "O", "from": 0, "to": "-2", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "铁在潮湿空气中，同时与水和氧气反应，生成氢氧化亚铁。",
    "teacherDescription": "电化学腐蚀的基础。Fe(-2)-C-Fe原电池形成。",
    "keyPoints": [
      "方程式：2Fe + 2H₂O + O₂ → 2Fe(OH)₂",
      "电化学腐蚀",
      "Fe(OH)₂进一步被氧化"
    ]
  }
}
```

---

### 4.22 碱金属反应

##### 方程式: 钾与水反应

```json
{
  "equationText": "2K + 2H₂O → 2KOH + H₂↑",
  "equationHtml": "2K + 2H<sub>2</sub>O → 2KOH + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -393.0,
  "conditions": {"temperature": "常温"},
  "teachingInfo": {
    "studentDescription": "钾放入水中，剧烈反应，产生紫色火焰。",
    "teacherDescription": "K比Na更活泼，反应更剧烈，火焰呈紫色（钾的特征焰色）。",
    "keyPoints": [
      "方程式：2K + 2H₂O → 2KOH + H₂↑",
      "紫色火焰（K的特征）",
      "反应比Na更剧烈"
    ],
    "safetyNotes": ["反应剧烈", "注意安全"]
  },
  "phenomena": {
    "colorChange": {"before": "银白色", "after": "无色溶液"},
    "temperatureChange": {"isExothermic": true, "description": "剧烈放热"},
    "gasEvolution": {"hasGas": true, "gasDescription": "产生气泡"},
    "soundPhenomenon": "轻微爆炸声",
    "observationPoints": ["观察紫色火焰", "小心安全"]
  }
}
```

##### 方程式: 碳酸钠与氢氧化钙反应（石灰水软化）

```json
{
  "equationText": "Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2NaOH",
  "equationHtml": "Na<sub>2</sub>CO<sub>3</sub> + Ca(OH)<sub>2</sub> → CaCO<sub>3</sub>↓ + 2NaOH",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "碳酸钠溶液与澄清石灰水反应，产生白色沉淀。",
    "teacherDescription": "工业制烧碱（侯氏制碱法的一部分）。",
    "keyPoints": [
      "方程式：Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2NaOH",
      "除钙的原理"
    ]
  }
}
```

---

### 4.23 更多铁化合物反应

##### 方程式: 氢氧化铁与盐酸反应

```json
{
  "equationText": "Fe(OH)₃ + 3HCl → FeCl₃ + 3H₂O",
  "equationHtml": "Fe(OH)<sub>3</sub> + 3HCl → FeCl<sub>3</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "reactants": [
    {"substanceId": 107, "coefficient": 1, "state": "s", "formula": "Fe(OH)₃", "name": "氢氧化铁"},
    {"substanceId": 32, "coefficient": 3, "state": "aq", "formula": "HCl", "name": "盐酸"}
  ],
  "products": [
    {"substanceId": 101, "coefficient": 1, "state": "aq", "formula": "FeCl₃", "name": "氯化铁"},
    {"substanceId": 70, "coefficient": 3, "state": "l", "formula": "H₂O", "name": "水"}
  ],
  "teachingInfo": {
    "studentDescription": "红褐色氢氧化铁沉淀溶解在盐酸中，溶液变为黄色。",
    "teacherDescription": "碱与酸的中和反应。沉淀溶解。",
    "keyPoints": [
      "方程式：Fe(OH)₃ + 3HCl → FeCl₃ + 3H₂O",
      "沉淀溶解",
      "溶液变黄色（Fe³⁺）"
    ]
  }
}
```

##### 方程式: 氯化铁与氢氧化钠反应

```json
{
  "equationText": "FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl",
  "equationHtml": "FeCl<sub>3</sub> + 3NaOH → Fe(OH)<sub>3</sub>↓ + 3NaCl",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "黄色氯化铁溶液与氢氧化钠反应，产生红褐色沉淀。",
    "teacherDescription": "盐与碱的复分解反应。",
    "keyPoints": [
      "方程式：FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl",
      "红褐色沉淀"
    ]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合瞬间",
      "stageType": "mixing",
      "durationEstimate": "立即",
      "phenomenaDescription": "黄色FeCl₃溶液滴入无色NaOH溶液中，接触点立即产生红褐色絮状沉淀",
      "colorChange": {
        "from": "黄色溶液+无色溶液",
        "to": "黄色溶液+红褐色沉淀"
      },
      "microscopicExplanation": "Fe³⁺ + 3OH⁻ → Fe(OH)₃↓，Fe³⁺与OH⁻结合生成难溶的Fe(OH)₃"
    },
    {
      "stageOrder": 2,
      "stageName": "沉淀聚集",
      "stageType": "reacting",
      "durationEstimate": "几秒-1分钟",
      "phenomenaDescription": "红褐色沉淀逐渐增多并聚集下沉，溶液上层黄色逐渐变浅",
      "colorChange": {
        "from": "黄色溶液+沉淀生成",
        "to": "浅黄色溶液+大量红褐色沉淀"
      },
      "microscopicExplanation": "Fe(OH)₃胶体颗粒聚集成较大沉淀，Fe³⁺浓度降低"
    },
    {
      "stageOrder": 3,
      "stageName": "沉降完成",
      "stageType": "completion",
      "durationEstimate": "1-3分钟后",
      "phenomenaDescription": "红褐色沉淀完全沉降到容器底部，上层溶液接近无色",
      "colorChange": {
        "from": "浅黄色溶液+沉淀",
        "to": "无色/浅黄上清液+底部红褐色沉淀"
      },
      "microscopicExplanation": "Fe(OH)₃沉淀完全，溶液中剩余少量Na⁺、Cl⁻离子"
    }
  ]
}
```

##### 方程式: 氯化亚铁与氯气反应

```json
{
  "equationText": "2FeCl₂ + Cl₂ → 2FeCl₃",
  "equationHtml": "2FeCl<sub>2</sub> + Cl<sub>2</sub> → 2FeCl<sub>3</sub>",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "Fe", "from": "+2", "to": "+3", "process": "氧化"},
    {"element": "Cl", "from": 0, "to": "-1", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "浅绿色氯化亚铁溶液与氯气反应，变为黄色氯化铁溶液。",
    "teacherDescription": "Fe²⁺被Cl₂氧化为Fe³⁺。溶液颜色由浅绿变为黄色。",
    "keyPoints": [
      "方程式：2FeCl₂ + Cl₂ → 2FeCl₃",
      "Fe²⁺→Fe³⁺",
      "浅绿→黄色"
    ]
  }
}
```

---

### 4.24 铜化合物反应

##### 方程式: 氢氧化铜与硫酸反应

```json
{
  "equationText": "Cu(OH)₂ + H₂SO₄ → CuSO₄ + 2H₂O",
  "equationHtml": "Cu(OH)<sub>2</sub> + H<sub>2</sub>SO<sub>4</sub> → CuSO<sub>4</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "蓝色氢氧化铜沉淀溶于硫酸，溶液变深蓝色。",
    "teacherDescription": "不溶性碱与酸的反应。",
    "keyPoints": [
      "方程式：Cu(OH)₂ + H₂SO₄ → CuSO₄ + 2H₂O",
      "蓝色沉淀溶解"
    ]
  }
}
```

---

### 4.25 焰色反应

##### 方程式: 锂的焰色反应说明

```json
{
  "equationText": "说明：锂、钾、钙、锶、钡等金属的化合物在火焰上灼烧时呈现特征颜色",
  "equationHtml": "说明：锂、钾、钙、锶、钡等金属的化合物在火焰上灼烧时呈现特征颜色",
  "reactionTypeCode": "PHYSICAL",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "不同金属的焰色不同，可用于检验金属元素。",
    "teacherDescription": "物理变化，不是化学变化。通过铂丝蘸取溶液在火焰上灼烧观察。",
    "keyPoints": [
      "锂：紫红色",
      "钠：黄色",
      "钾：浅紫色（透过蓝色钴玻璃）",
      "钙：砖红色",
      "锶：洋红色",
      "钡：黄绿色"
    ]
  }
}
```

---

### 4.26 更多有机反应

##### 方程式: 乙炔燃烧

```json
{
  "equationText": "2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O",
  "equationHtml": "2C<sub>2</sub>H<sub>2</sub> + 5O<sub>2</sub> → 4CO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "点燃"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 258,
      "secondaryEquationText": "2C₂H₂ + 3O₂ → 4CO + 2H₂O",
      "secondaryEquationHtml": "2C<sub>2</sub>H<sub>2</sub> + 3O<sub>2</sub> → 4CO + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.4,
      "triggerCondition": {
        "oxygenInsufficient": true
      },
      "phenomenonImpact": {
        "description": "氧气不足时产生大量CO，火焰呈红黄色"
      },
      "teachingNote": "乙炔含碳量高，不完全燃烧产生大量黑烟"
    },
    {
      "secondaryEquationId": 259,
      "secondaryEquationText": "C₂H₂ + 5/2O₂ → 2C + H₂O",
      "secondaryEquationHtml": "C<sub>2</sub>H<sub>2</sub> + 5/2O<sub>2</sub> → 2C + H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.2,
      "triggerCondition": {
        "oxygenVeryInsufficient": true,
        "temperature": "高温裂解"
      },
      "phenomenonImpact": {
        "description": "极度缺氧时产生炭黑，形成大量黑烟"
      },
      "teachingNote": "氧炔焰切割焊接时火焰明亮但可能产生黑烟"
    }
  ],
  "teachingInfo": {
    "studentDescription": "乙炔在氧气中完全燃烧，产生明亮的火焰。",
    "teacherDescription": "含碳量越高，火焰越明亮。",
    "keyPoints": [
      "方程式：2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O",
      "明亮的火焰",
      "含碳量高，火焰更亮"
    ]
  }
}
```

##### 方程式: 乙炔与溴加成

```json
{
  "equationText": "C₂H₂ + 2Br₂ → C₂H₂Br₄",
  "equationHtml": "C<sub>2</sub>H<sub>2</sub> + 2Br<sub>2</sub> → C<sub>2</sub>H<sub>2</sub>Br<sub>4</sub>",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "乙炔使溴水褪色。",
    "teacherDescription": "碳碳三键可以分两步加成，也可以直接加成。",
    "keyPoints": [
      "方程式：C₂H₂ + 2Br₂ → C₂H₂Br₄",
      "使溴水褪色",
      "加成反应"
    ]
  }
}
```

##### 方程式: 乙醇脱水生成乙烯

```json
{
  "equationText": "C₂H₅OH → CH₂=CH₂↑ + H₂O",
  "equationHtml": "C<sub>2</sub>H<sub>5</sub>OH → CH<sub>2</sub>=CH<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "ELIMINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "170℃", "catalyst": "浓硫酸"},
  "teachingInfo": {
    "studentDescription": "乙醇在浓硫酸催化下加热到170℃，分子内脱水生成乙烯。",
    "teacherDescription": "消去反应。170℃生成乙烯，140℃生成乙醚。",
    "keyPoints": [
      "方程式：C₂H₅OH → CH₂=CH₂↑ + H₂O",
      "170℃：乙烯",
      "140℃：乙醚（2C₂H₅OH → C₂H₅OC₂H₅ + H₂O）"
    ],
    "commonQuestions": [
      {"question": "为什么是170℃不是140℃？", "answer": "170℃分子内脱水生成乙烯，140℃分子间脱水生成乙醚。"}
    ]
  }
}
```

##### 方程式: 乙酸与碳酸钠反应

```json
{
  "equationText": "2CH₃COOH + Na₂CO₃ → 2CH₃COONa + CO₂↑ + H₂O",
  "equationHtml": "2CH<sub>3</sub>COOH + Na<sub>2</sub>CO<sub>3</sub> → 2CH<sub>3</sub>COONa + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "乙酸与碳酸钠反应，产生二氧化碳气体。",
    "teacherDescription": "强酸制弱酸的原理。乙酸酸性强于碳酸。",
    "keyPoints": [
      "方程式：2CH₃COOH + Na₂CO₃ → 2CH₃COONa + CO₂↑ + H₂O",
      "强酸制弱酸",
      "产生气泡"
    ]
  }
}
```

---

### 4.27 实验室常见反应

##### 方程式: 高锰酸钾制氧气

```json
{
  "equationText": "2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑",
  "equationHtml": "2KMnO<sub>4</sub> → K<sub>2</sub>MnO<sub>4</sub> + MnO<sub>2</sub> + O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "加热"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 267,
      "secondaryEquationText": "2KMnO₄ + 16HCl(浓) → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O",
      "secondaryEquationHtml": "2KMnO<sub>4</sub> + 16HCl(浓) → 2KCl + 2MnCl<sub>2</sub> + 5Cl<sub>2</sub>↑ + 8H<sub>2</sub>O",
      "relationship": "side",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "acidPresent": "浓盐酸",
        "temperature": "加热"
      },
      "phenomenonImpact": {
        "description": "KMnO₄与浓盐酸反应产生Cl₂"
      },
      "teachingNote": "实验室制氯气的方法"
    },
    {
      "secondaryEquationId": 268,
      "secondaryEquationText": "2KMnO₄ + 5H₂C₂O₄ → 2MnC₂O₄ + K₂C₂O₄ + 8H₂O + 5CO₂↑",
      "secondaryEquationHtml": "2KMnO<sub>4</sub> + 5H<sub>2</sub>C<sub>2</sub>O<sub>4</sub> → 2MnC<sub>2</sub>O<sub>4</sub> + K<sub>2</sub>C<sub>2</sub>O<sub>4</sub> + 8H<sub>2</sub>O + 5CO<sub>2</sub>↑",
      "relationship": "side",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "acidPresent": "草酸"
      },
      "phenomenonImpact": {
        "description": "与草酸反应产生CO₂"
      },
      "teachingNote": "KMnO₄在酸性条件下是强氧化剂"
    },
    {
      "secondaryEquationId": 269,
      "secondaryEquationText": "2KMnO₄ + 3H₂SO₄ → K₂SO₄ + 2MnSO₄ + 3H₂O + 5[O]",
      "secondaryEquationHtml": "2KMnO<sub>4</sub> + 3H<sub>2</sub>SO<sub>4</sub> → K<sub>2</sub>SO<sub>4</sub> + 2MnSO<sub>4</sub> + 3H<sub>2</sub>O + 5[O]",
      "relationship": "side",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "acidPresent": "硫酸"
      },
      "phenomenonImpact": {
        "description": "在酸性条件下KMnO₄氧化性更强"
      },
      "teachingNote": "KMnO₄常用于氧化还原滴定"
    }
  ],
  "teachingInfo": {
    "studentDescription": "紫黑色高锰酸钾固体加热分解，产生氧气。",
    "teacherDescription": "实验室制氧气的常用方法。试管口放棉花防止粉末进入导管。",
    "keyPoints": [
      "方程式：2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑",
      "固体加热制气",
      "试管口略向下倾斜",
      "导管口放棉花"
    ]
  },
  "knowledgePoints": [
    "实验室制氧气最经典方法：高锰酸钾受热分解",
    "反应方程式：2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑（条件：加热）",
    "反应类型：分解反应（一种物质分解成三种物质），也是氧化还原反应",
    "固体加热装置特点：试管口略向下倾斜，防止冷凝水倒流导致试管炸裂",
    "试管口放棉花的作用：防止高锰酸钾粉末进入导管，避免堵塞导管或进入水槽",
    "氧气收集方法：排水法（O₂不易溶于水，且不与水反应）或向上排空气法（O₂密度大于空气）",
    "氧气检验方法：用带火星的木条伸入集气瓶口，木条复燃证明是氧气",
    "实验步骤口诀：'查装定点收离熄'（查气密性、装药品、定装置、点酒精灯、收气体、离导管、熄酒精灯）",
    "实验安全注意事项：先移导管后熄灯（防止水倒吸入热的试管，导致试管炸裂）",
    "高锰酸钾的性质：紫黑色固体，易溶于水形成紫红色溶液，是强氧化剂",
    "氧化还原分析：锰元素从+7价降至+6价（锰酸钾中）和+4价（二氧化锰中），氧元素从-2价升至0价",
    "产物颜色：锰酸钾（K₂MnO₄）为绿色固体，二氧化锰（MnO₂）为黑色固体",
    "中考考点：①实验室制氧气装置选择 ②实验操作步骤 ③氧气收集和检验 ④实验现象描述 ⑤安全注意事项",
    "与KClO₃制氧气对比：KMnO₄不需要催化剂，反应温度较低；KClO₃需要MnO₂催化",
    "与H₂O₂制氧气对比：KMnO₄需要加热（固固加热型），H₂O₂常温反应（固液常温型）"
  ]
}
```

##### 方程式: 双氧水分解制氧气

```json
{
  "equationText": "2H₂O₂ → 2H₂O + O₂↑",
  "equationHtml": "2H<sub>2</sub>O<sub>2</sub> → 2H<sub>2</sub>O + O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"catalyst": "MnO₂"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 270,
      "secondaryEquationText": "2H₂O₂ → 2H₂O + O₂↑",
      "secondaryEquationHtml": "2H<sub>2</sub>O<sub>2</sub> → 2H<sub>2</sub>O + O<sub>2</sub>↑",
      "relationship": "side",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "catalyst": "FeCl₃或CuSO₄",
        "temperature": "加热"
      },
      "phenomenonImpact": {
        "description": "某些金属盐也能催化H₂O₂分解"
      },
      "teachingNote": "酶（过氧化氢酶）也能催化H₂O₂分解"
    },
    {
      "secondaryEquationId": 271,
      "secondaryEquationText": "H₂O₂ + 2KI + H₂SO₄ → I₂ + K₂SO₄ + 2H₂O",
      "secondaryEquationHtml": "H<sub>2</sub>O<sub>2</sub> + 2KI + H<sub>2</sub>SO<sub>4</sub> → I<sub>2</sub> + K<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O",
      "relationship": "side",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "reductantPresent": true
      },
      "phenomenonImpact": {
        "description": "H₂O₂将I⁻氧化为I₂"
      },
      "teachingNote": "H₂O₂是强氧化剂"
    }
  ],
  "teachingInfo": {
    "studentDescription": "过氧化氢在二氧化锰催化下分解，产生氧气。",
    "teacherDescription": "实验室制氧气最常用的方法。MnO₂作催化剂，反应前后质量和化学性质不变。",
    "keyPoints": [
      "方程式：2H₂O₂ → 2H₂O + O₂↑",
      "MnO₂催化",
      "固液常温制气"
    ],
    "commonQuestions": [
      {"question": "能不能不加MnO₂？", "answer": "可以，但反应很慢。"},
      {"question": "MnO₂参与反应吗？", "answer": "不参与，只是催化剂。"}
    ]
  },
  "knowledgePoints": [
    "实验室制氧气最常用的方法：过氧化氢（双氧水）在二氧化锰催化下分解",
    "反应方程式：2H₂O₂ → 2H₂O + O₂↑（MnO₂作催化剂）",
    "反应类型：分解反应（一种物质分解成两种物质），也是氧化还原反应",
    "催化剂的作用：MnO₂能加快H₂O₂分解速率，反应前后质量和化学性质不变",
    "实验装置：固液常温型（锥形瓶+分液漏斗），不需要加热",
    "气体收集：排水法（O₂不易溶于水）或向上排空气法（O₂密度略大于空气）",
    "其他催化剂：FeCl₃、CuSO₄、过氧化氢酶等也能催化H₂O₂分解",
    "过氧化氢的性质：无色液体，俗称双氧水，具有强氧化性，不稳定易分解",
    "实验现象：加入MnO₂后立即产生大量气泡，用带火星木条检验，木条复燃",
    "安全注意事项：双氧水对皮肤有刺激性，避免接触；使用5%-10%浓度较安全",
    "中考考点：①实验室制气方法 ②催化剂的概念 ③实验装置选择 ④分解反应",
    "与KMnO₄制氧气的对比：双氧水法更安全（不需加热）、更方便（常温反应）"
  ]
}
```

---

### 4.28 工业制酸反应

##### 方程式: 接触法制硫酸

```json
{
  "equationText": "2SO₂ + O₂ ⇌ 2SO₃",
  "equationHtml": "2SO<sub>2</sub> + O<sub>2</sub> ⇌ 2SO<sub>3</sub>",
  "reactionTypeCode": "CATALYSIS",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "400-500℃", "catalyst": "V₂O₅"},
  "oxidationChanges": [
    {"element": "S", "from": "+4", "to": "+6", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "二氧化硫在催化剂作用下与氧气反应生成三氧化硫。",
    "teacherDescription": "接触法制硫酸的关键步骤。可逆反应。",
    "keyPoints": [
      "方程式：2SO₂ + O₂ ⇌ 2SO₃",
      "V₂O₅催化",
      "400-500℃",
      "可逆反应"
    ]
  },
  "knowledgePoints": [
    "接触法制硫酸的关键反应：二氧化硫催化氧化生成三氧化硫",
    "反应方程式：2SO₂ + O₂ ⇌ 2SO₃（V₂O₅作催化剂，400-500℃）",
    "反应特点：可逆反应、放热反应、气体体积缩小的反应",
    "催化剂：五氧化二钒（V₂O₅），提高反应速率，缩短达到平衡的时间",
    "温度控制：400-500℃是最佳温度范围（温度过低反应慢，过高SO₃分解且催化剂活性降低）",
    "压强：常压即可，加压对平衡有利但设备成本高，实际采用常压",
    "接触法名称由来：SO₂与O₂在固体催化剂表面接触进行反应",
    "工业流程：沸腾炉→接触室→吸收塔（三个步骤）",
    "原料：硫磺或黄铁矿（FeS₂）燃烧产生SO₂",
    "环境保护：尾气含SO₂需处理后排放（防止酸雨）",
    "高考考点：①可逆反应 ②化学平衡移动 ③工业制硫酸流程",
    "中考考点：①硫酸的工业制法 ②环境保护 ③催化剂的作用"
  ]
}
```

##### 方程式: 三氧化硫与水反应

```json
{
  "equationText": "SO₃ + H₂O → H₂SO₄",
  "equationHtml": "SO<sub>3</sub> + H<sub>2</sub>O → H<sub>2</sub>SO<sub>4</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -130.0,
  "teachingInfo": {
    "studentDescription": "三氧化硫与水反应生成硫酸，放出大量热。",
    "teacherDescription": "工业吸收塔中进行。需用98.3%浓硫酸吸收。",
    "keyPoints": [
      "方程式：SO₃ + H₂O → H₂SO₄",
      "放热反应",
      "工业制H₂SO₄最后一步"
    ]
  },
  "knowledgePoints": [
    "三氧化硫与水反应是接触法制硫酸的最后一步反应",
    "反应方程式：SO₃ + H₂O → H₂SO₄（剧烈放热）",
    "反应特点：化合反应，剧烈放热，放出大量热",
    "SO₃的性质：无色固体，熔点16.8℃，沸点45℃，遇水剧烈反应",
    "工业吸收方法：不直接用水吸收（会形成酸雾，吸收不完全），而是用98.3%浓硫酸吸收",
    "为什么用浓硫酸吸收：SO₃在浓硫酸中溶解度大，避免形成酸雾，吸收效率高",
    "吸收塔：SO₃从底部通入，98.3%浓硫酸从顶部喷淋，逆流接触吸收",
    "最终产物：从吸收塔流出的是98%浓硫酸（工业硫酸）",
    "稀释浓硫酸：将浓硫酸沿容器壁慢慢倒入水中，并不断搅拌（放热）",
    "安全注意事项：浓硫酸有强腐蚀性、强脱水性，操作时必须小心",
    "高考考点：①SO₃的性质 ②硫酸的工业制法 ③浓硫酸的稀释",
    "中考考点：①酸的工业制法 ②浓硫酸的性质 ③实验安全"
  ]
}
```

---

### 4.29 合成氨反应

##### 方程式: 氮气与氢气合成氨

```json
{
  "equationText": "N₂ + 3H₂ ⇌ 2NH₃",
  "equationHtml": "N<sub>2</sub> + 3H<sub>2</sub> ⇌ 2NH<sub>3</sub>",
  "reactionTypeCode": "CATALYSIS",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "高温高压", "catalyst": "Fe"},
  "enthalpyChange": -92.0,
  "oxidationChanges": [
    {"element": "N", "from": 0, "to": "-3", "process": "还原"},
    {"element": "H", "from": 0, "to": "+1", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "氮气与氢气在高温高压和催化剂作用下合成氨气。",
    "teacherDescription": "工业合成氨的反应。典型的可逆反应。",
    "keyPoints": [
      "方程式：N₂ + 3H₂ ⇌ 2NH₃",
      "高温高压（500℃）",
      "Fe催化剂",
      "可逆反应"
    ],
    "commonQuestions": [
      {"question": "为什么需要高温高压？", "answer": "N≡三键很难断裂，高温提供能量，高压促使平衡向右移动。"},
      {"question": "为什么需要催化剂？", "answer": "加快速率，但不会改变平衡位置。"}
    ]
  }
}
```

---

### 4.30 离子反应

##### 方程式: 碳酸氢钙与盐酸反应

```json
{
  "equationText": "Ca(HCO₃)₂ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
  "equationHtml": "Ca(HCO<sub>3</sub>)<sub>2</sub> + 2HCl → CaCl<sub>2</sub> + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "碳酸氢钙与盐酸反应，产生二氧化碳气体。",
    "teacherDescription": "区别于CaCO₃：Ca(HCO₃)₂与酸反应更剧烈。",
    "keyPoints": [
      "方程式：Ca(HCO₃)₂ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
      "可溶性酸式盐与酸反应"
    ]
  },
  "knowledgePoints": [
    "酸式盐与强酸反应的规律和特点",
    "碳酸氢根离子HCO₃⁻与酸反应的机理",
    "Ca(HCO₃)₂在水中的溶解性（可溶于水）",
    "水垢的形成和除去（Ca(HCO₃)₂是水垢主要成分）",
    "酸式盐与正盐的区别和转化关系",
    "反应中的离子方程式（HCO₃⁻ + H⁺ → CO₂↑ + H₂O）",
    "实验室制备CO₂的原理之一",
    "硬度水的软化原理",
    "与CaCO₃反应速率和剧烈程度的对比",
    "生活中的应用（除水垢、治疗胃酸过多等）"
  ]
}
```

##### 方程式: 碳酸氢钙受热分解

```json
{
  "equationText": "Ca(HCO₃)₂ → CaCO₃↓ + CO₂↑ + H₂O",
  "equationHtml": "Ca(HCO<sub>3</sub>)<sub>2</sub> → CaCO<sub>3</sub>↓ + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "碳酸氢钙受热分解，产生白色沉淀和气体。",
    "teacherDescription": "区别于CaCO₃：较低温度即可分解。",
    "keyPoints": [
      "方程式：Ca(HCO₃)₂ → CaCO₃↓ + CO₂↑ + H₂O",
      "水垢的主要成分",
      "加热分解"
    ]
  },
  "knowledgePoints": [
    "酸式盐的热不稳定性（比正盐更容易分解）",
    "Ca(HCO₃)₂受热分解的原理和应用",
    "水垢的形成和除去过程（水垢主要成分Ca(HCO₃)₂，加热分解为CaCO₃）",
    "暂时硬度水转化为永久硬度水的过程",
    "钟乳石和石笋形成的化学原理",
    "可逆反应：Ca(HCO₃)₂ ⇌ CaCO₃ + CO₂ + H₂O",
    "加热促进分解（勒夏特列原理）",
    "生活中水垢的处理方法",
    "与CaCO₃分解温度的对比（CaCO₃需要高温900℃以上）",
    "地下溶洞形成的化学基础"
  ]
}
```

### 4.31 过渡金属化合物反应

#### 4.31.1 锰化合物反应

**反应原理**: 锰有多个氧化态 (+2, +4, +7)，化合物间可相互转化

---

##### 方程式85: 二氧化锰与浓盐酸反应（实验室制氯气）

```json
{
  "equationText": "MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O",
  "equationHtml": "MnO<sub>2</sub> + 4HCl(浓) → MnCl<sub>2</sub> + Cl<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "oxidationChanges": [
    {"element": "Mn", "from": "+4", "to": "+2", "process": "还原"},
    {"element": "Cl", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "黑色二氧化锰粉末与浓盐酸混合加热，产生黄绿色刺激性气味气体（氯气）。",
    "teacherDescription": "实验室制氯气的标准方法。强调：必须用浓盐酸，需加热。尾气处理用NaOH溶液。",
    "keyPoints": [
      "方程式：MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O",
      "MnO₂是氧化剂",
      "需加热才能进行",
      "尾气用NaOH吸收"
    ],
    "commonQuestions": [
      {"question": "为什么不能用稀盐酸？", "answer": "稀盐酸还原性弱，且Cl⁻浓度低，反应不发生。"},
      {"question": "如何检验氯气？", "answer": "用湿润的淀粉碘化钾试纸，变蓝。"}
    ],
    "safetyNotes": ["氯气有毒", "必须在通风橱中进行", "尾气必须处理"]
  },
  "phenomena": {
    "colorChange": {"before": "黑色固体+无色液体", "after": "浅绿色溶液", "description": "黑色MnO₂逐渐溶解"},
    "gasEvolution": {"hasGas": true, "gasDescription": "黄绿色刺激性气体", "gasProperties": "有毒，密度比空气大"},
    "temperatureChange": {"isExothermic": false, "description": "需要加热维持反应"}
  },
  "knowledgePoints": [
    "实验室制氯气的标准方法和反应原理",
    "氧化还原反应分析：MnO₂是氧化剂（Mn从+4降至+2），浓盐酸是还原剂（Cl从-1升至0）",
    "浓盐酸的作用：既是还原剂又是酸（提供H⁺和Cl⁻），其中一半Cl⁻被氧化，一半构成MnCl₂",
    "必须使用浓盐酸的原因：稀盐酸还原性弱且Cl⁻浓度低，反应无法进行",
    "反应条件：必须加热，否则反应速率太慢甚至不发生",
    "实验装置：固液加热型（与制O₂、NH₃类似）",
    "气体收集方法：向上排空气法（Cl₂密度大于空气）",
    "尾气处理：必须用NaOH溶液吸收（Cl₂有毒，防止污染空气）",
    "氯气检验：湿润的淀粉碘化钾试纸变蓝（Cl₂氧化I⁻生成I₂）",
    "除杂：产物通过饱和食盐水除去HCl，通过浓硫酸除去水蒸气",
    "实验安全：氯气有毒，必须在通风橱中操作，注意防护",
    "离子方程式：MnO₂ + 4H⁺ + 2Cl⁻ → Mn²⁺ + Cl₂↑ + 2H₂O",
    "反应中浓盐酸利用率：仅一半Cl⁻被氧化为Cl₂，另一半形成MnCl₂",
    "中考考点：实验室制气装置选择、氧化还原分析、尾气处理"
  ]
}
```

##### 方程式86: 高锰酸钾受热分解

```json
{
  "equationText": "2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑",
  "equationHtml": "2KMnO<sub>4</sub> → K<sub>2</sub>MnO<sub>4</sub> + MnO<sub>2</sub> + O<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "紫黑色高锰酸钾固体受热分解，产生使带火星木条复燃的气体。",
    "teacherDescription": "实验室制氧气方法之一。固体加热装置。试管口略向下倾斜。",
    "keyPoints": [
      "方程式：2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑",
      "固体加热",
      "排水法或向上排空气法收集"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "紫黑色固体", "after": "绿色固体(K₂MnO₄)+黑色固体(MnO₂)", "description": "颜色复杂变化"},
    "gasEvolution": {"hasGas": true, "gasDescription": "无色无味气体", "gasProperties": "能使带火星木条复燃"}
  },
  "knowledgePoints": [
    "实验室制氧气方法之一：高锰酸钾受热分解",
    "反应原理：高锰酸钾在加热条件下分解为锰酸钾、二氧化锰和氧气",
    "固体加热型反应装置：试管口略向下倾斜（防止冷凝水倒流炸裂试管）",
    "氧气收集方法：排水法（O₂不易溶于水）或向上排空气法（O₂密度大于空气）",
    "氧气检验方法：用带火星的木条检验，木条复燃证明是氧气",
    "实验注意事项：试管口放一团棉花（防止高锰酸钾粉末进入导管）",
    "氧化还原分析：Mn从+7价降至+6价（K₂MnO₄中）和+4价（MnO₂中），O从-2价升至0价",
    "反应类型：分解反应，也是氧化还原反应",
    "与其他制氧气方法对比：比H₂O₂分解需要加热，比KClO₃分解反应温度低",
    "产物分析：K₂MnO₄是绿色固体（锰酸钾），MnO₂是黑色固体（二氧化锰）",
    "配平方程式：2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑",
    "中考考点：实验室制气装置选择、氧气检验、反应现象观察"
  ]
}
```

##### 方程式87: 高锰酸钾与浓盐酸反应

```json
{
  "equationText": "2KMnO₄ + 16HCl(浓) → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O",
  "equationHtml": "2KMnO<sub>4</sub> + 16HCl(浓) → 2KCl + 2MnCl<sub>2</sub> + 5Cl<sub>2</sub>↑ + 8H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "oxidationChanges": [
    {"element": "Mn", "from": "+7", "to": "+2", "process": "还原"},
    {"element": "Cl", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "紫红色溶液与浓盐酸混合，产生大量黄绿色气体。",
    "teacherDescription": "KMnO₄是强氧化剂。氧化数从+7降到+2，得5个电子。2个KMnO₄氧化10个Cl⁻，生成5个Cl₂。",
    "keyPoints": [
      "KMnO₄是强氧化剂",
      "Mn从+7降到+2",
      "配平较复杂"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "紫红色溶液", "after": "浅绿色溶液(MnCl₂)", "description": "紫红色褪去"},
    "gasEvolution": {"hasGas": true, "gasDescription": "大量黄绿色气体"}
  },
  "knowledgePoints": [
    "高锰酸钾与浓盐酸反应是强氧化剂与强还原剂的典型反应",
    "反应配平技巧：氧化还原配平法（电子守恒、原子守恒、电荷守恒）",
    "氧化数变化：Mn从+7降至+2（得5个电子），Cl从-1升至0（失1个电子）",
    "配平分析：1个KMnO₄氧化5个Cl⁻生成2.5个Cl₂，为整数系数乘以2得2KMnO₄ + 16HCl",
    "高锰酸钾的强氧化性：KMnO₄是实验室和工业中常用的强氧化剂",
    "反应现象：紫红色溶液逐渐褪去变为浅绿色，产生大量黄绿色刺激性气体",
    "与MnO₂+HCl反应对比：KMnO₄氧化性更强，反应更剧烈",
    "实验安全：反应放热，Cl₂有毒，必须在通风橱中操作",
    "离子方程式：2MnO₄⁻ + 10Cl⁻ + 16H⁺ → 2Mn²⁺ + 5Cl₂↑ + 8H₂O",
    "教学重点：氧化还原反应配平方法、氧化还原分析",
    "高考考点：氧化还原方程式配平、氧化剂还原剂判断、电子转移方向和数目"
  ]
}
```

---

#### 4.31.2 铬化合物反应

##### 方程式88: 重铬酸钾与硫酸反应

```json
{
  "equationText": "K₂Cr₂O₇ + H₂SO₄ → 2KHSO₄ + 2CrO₃ + H₂O",
  "equationHtml": "K<sub>2</sub>Cr<sub>2</sub>O<sub>7</sub> + H<sub>2</sub>SO<sub>4</sub> → 2KHSO<sub>4</sub> + 2CrO<sub>3</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "橙红色重铬酸钾与浓硫酸反应，生成暗红色三氧化铬。",
    "teacherDescription": "实验室洗液制备原理。CrO₃是强氧化剂，有致癌性，现已较少使用。",
    "keyPoints": [
      "橙红色→暗红色",
      "CrO₃是强氧化剂",
      "有致癌性，慎用"
    ]
  }
}
```

---

#### 4.31.3 镍化合物反应

##### 方程式89: 镍与酸反应

```json
{
  "equationText": "Ni + H₂SO₄ → NiSO₄ + H₂↑",
  "equationHtml": "Ni + H<sub>2</sub>SO<sub>4</sub> → NiSO<sub>4</sub> + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "镍与稀硫酸反应，缓慢产生气泡。",
    "teacherDescription": "镍的金属活动性比铁弱，反应较慢。NiSO₄溶液呈绿色。",
    "keyPoints": [
      "反应比铁慢",
      "NiSO₄溶液呈绿色"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "银白色固体", "after": "绿色溶液", "description": "镍溶解，溶液变绿"},
    "gasEvolution": {"hasGas": true, "gasDescription": "无色气泡"}
  }
}
```

---

### 4.32 配位化合物反应

**反应原理**: 金属离子与配体形成配位键，生成配合物

---

##### 方程式90: 铜氨配离子的形成

```json
{
  "equationText": "Cu²⁺ + 4NH₃·H₂O → [Cu(NH₃)₄]²⁺ + 4H₂O",
  "equationHtml": "Cu<sup>2+</sup> + 4NH<sub>3</sub>·H<sub>2</sub>O → [Cu(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup> + 4H<sub>2</sub>O",
  "reactionTypeCode": "COMPLEXATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "蓝色沉淀溶于过量氨水，形成深蓝色溶液。",
    "teacherDescription": "Cu²⁺与NH₃形成四氨合铜(II)配离子。深蓝色是配离子的特征颜色。",
    "keyPoints": [
      "方程式：Cu²⁺ + 4NH₃ → [Cu(NH₃)₄]²⁺",
      "先产生沉淀后溶解",
      "深蓝色溶液"
    ],
    "commonQuestions": [
      {"question": "为什么先沉淀后溶解？", "answer": "先生成Cu(OH)₂蓝色沉淀，过量氨水时形成配离子溶解。"}
    ]
  },
  "phenomena": {
    "colorChange": {"before": "蓝色沉淀", "after": "深蓝色溶液", "description": "蓝色→深蓝"},
    "precipitate": {"hasPrecipitate": false, "description": "沉淀溶解"}
  },
  "knowledgePoints": [
    "配位化合物的形成：Cu²⁺与NH₃形成配位键，生成四氨合铜(II)配离子",
    "配位键的形成：NH₃分子中N原子提供孤对电子，Cu²⁺提供空轨道",
    "反应分两阶段：①Cu²⁺ + 2NH₃·H₂O → Cu(OH)₂↓ + 2NH₄⁺（蓝色沉淀）②Cu(OH)₂ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻（沉淀溶解）",
    "深蓝色溶液：[Cu(NH₃)₄]²⁺配离子的特征颜色",
    "配位数：Cu²⁺的配位数为4，空间构型为平面正方形",
    "实验现象：先产生蓝色Cu(OH)₂沉淀，加入过量氨水后沉淀溶解，形成深蓝色溶液",
    "配离子的稳定性：四氨合铜配离子在溶液中相对稳定",
    "配合物组成：内界是[Cu(NH₃)₄]²⁺，外界是SO₄²⁻或其他阴离子",
    "离子方程式：Cu²⁺ + 4NH₃ → [Cu(NH₃)₄]²⁺",
    "教学重点：配位化合物的概念、配位键的形成、配离子的特征",
    "高考考点：配位化合物的组成、配位数的确定、配离子的稳定性"
  ]
}
```

##### 方程式91: 银氨配离子的形成

```json
{
  "equationText": "Ag⁺ + 2NH₃·H₂O → [Ag(NH₃)₂]⁺ + 2H₂O",
  "equationHtml": "Ag<sup>+</sup> + 2NH<sub>3</sub>·H<sub>2</sub>O → [Ag(NH<sub>3</sub>)<sub>2</sub>]<sup>+</sup> + 2H<sub>2</sub>O",
  "reactionTypeCode": "COMPLEXATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "白色沉淀溶于过量氨水，形成无色溶液。",
    "teacherDescription": "Ag⁺与NH₃形成二氨合银(I)配离子。用于银镜反应前的配制。",
    "keyPoints": [
      "方程式：Ag⁺ + 2NH₃ → [Ag(NH₃)₂]⁺",
      "白色沉淀→无色溶液",
      "用于银镜反应"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "白色沉淀", "after": "无色溶液", "description": "沉淀溶解"},
    "precipitate": {"hasPrecipitate": false, "description": "沉淀溶解"}
  }
}
```

##### 方程式92: 铁氰化钾与亚铁离子反应

```json
{
  "equationText": "3Fe²⁺ + 2[Fe(CN)₆]³⁻ → Fe₃[Fe(CN)₆]₂↓",
  "equationHtml": "3Fe<sup>2+</sup> + 2[Fe(CN)<sub>6</sub>]<sup>3-</sup> → Fe<sub>3</sub>[Fe(CN)<sub>6</sub>]<sub>2</sub>↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生蓝色沉淀。",
    "teacherDescription": "滕氏蓝反应。用于检验Fe²⁺。",
    "keyPoints": [
      "蓝色沉淀",
      "检验Fe²⁺的特征反应"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "黄色溶液", "after": "蓝色沉淀", "description": "产生蓝色沉淀"},
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "蓝色", "precipitateDescription": "滕氏蓝"}
  }
}
```

##### 方程式93: 亚铁氰化钾与铁离子反应

```json
{
  "equationText": "4Fe³⁺ + 3[Fe(CN)₆]⁴⁻ → Fe₄[Fe(CN)₆]₃↓",
  "equationHtml": "4Fe<sup>3+</sup> + 3[Fe(CN)<sub>6</sub>]<sup>4-</sup> → Fe<sub>4</sub>[Fe(CN)<sub>6</sub>]<sub>3</sub>↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生蓝色沉淀。",
    "teacherDescription": "普鲁士蓝反应。用于检验Fe³⁺。滕氏蓝与普鲁士蓝结构相同。",
    "keyPoints": [
      "蓝色沉淀",
      "检验Fe³⁺的特征反应"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "蓝色", "precipitateDescription": "普鲁士蓝"}
  }
}
```

---

### 4.33 有机化学进阶

#### 4.33.1 羧酸及其衍生物

---

##### 方程式94: 乙酸的电离

```json
{
  "equationText": "CH₃COOH ⇌ CH₃COO⁻ + H⁺",
  "equationHtml": "CH<sub>3</sub>COOH ⇌ CH<sub>3</sub>COO<sup>-</sup> + H<sup>+</sup>",
  "reactionTypeCode": "IONIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "乙酸部分电离，产生氢离子。",
    "teacherDescription": "弱酸电离。Ka = 1.75×10⁻⁵。酸性比碳酸强。",
    "keyPoints": [
      "弱酸，部分电离",
      "Ka = 1.75×10⁻⁵",
      "酸性 > H₂CO₃"
    ],
    "commonQuestions": [
      {"question": "乙酸是强酸还是弱酸？", "answer": "弱酸，在水中部分电离。"}
    ]
  },
  "knowledgePoints": [
    "乙酸是典型的一元弱酸，在水溶液中部分电离",
    "电离方程式：CH₃COOH ⇌ CH₃COO⁻ + H⁺",
    "电离平衡常数：Ka = 1.75×10⁻⁵（25℃），pKa = 4.76",
    "弱酸判断依据：Ka值较小，电离度约1.3%（0.1mol/L溶液）",
    "酸性强弱比较：CH₃COOH > H₂CO₃ > HCO₃⁻",
    "电离平衡特点：动态平衡，受浓度、温度影响",
    "稀释效应：稀释促进电离，但c(H⁺)减小，pH增大",
    "同离子效应：加入CH₃COONa抑制电离（平衡左移）",
    "与强酸对比：相同浓度时，盐酸c(H⁺)远大于乙酸",
    "与强碱反应：CH₃COOH + NaOH → CH₃COONa + H₂O（中和反应）",
    "应用：食醋的主要成分，酸味来源，防腐作用",
    "高考考点：弱电解质电离平衡、Ka计算、离子浓度大小比较"
  ]
}
```

##### 方程式95: 乙酸乙酯的水解

```json
{
  "equationText": "CH₃COOC₂H₅ + H₂O ⇌ CH₃COOH + C₂H₅OH",
  "equationHtml": "CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub> + H<sub>2</sub>O ⇌ CH<sub>3</sub>COOH + C<sub>2</sub>H<sub>5</sub>OH",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "稀硫酸或NaOH溶液", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "乙酸乙酯在酸或碱催化下与水反应，生成乙酸和乙醇。",
    "teacherDescription": "酯化反应的逆反应。酸性条件下可逆，碱性条件下不可逆。",
    "keyPoints": [
      "酯化反应的逆反应",
      "酸催化可逆，碱催化不可逆"
    ]
  },
  "phenomena": {
    "description": "酯的香味逐渐消失"
  }
}
```

##### 方程式96: 乙酸与乙醇的酯化反应（详细）

```json
{
  "equationText": "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O",
  "equationHtml": "CH<sub>3</sub>COOH + C<sub>2</sub>H<sub>5</sub>OH ⇌ CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "ESTERIFICATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "浓硫酸", "temperature": "加热"},
  "enthalpyChange": -8.5,
  "teachingInfo": {
    "studentDescription": "乙酸和乙醇在浓硫酸催化下加热，产生有香味的液体。",
    "teacherDescription": "可逆反应。浓硫酸既是催化剂又是吸水剂。饱和Na₂CO₃溶液吸收产物。",
    "keyPoints": [
      "可逆反应",
      "浓硫酸催化并吸水",
      "饱和Na₂CO₃吸收产物"
    ],
    "commonQuestions": [
      {"question": "为什么用饱和Na₂CO₃？", "answer": "1.中和乙酸 2.溶解乙醇 3.降低乙酸乙酯溶解度，便于分层。"}
    ]
  },
  "knowledgePoints": [
    "酯化反应是酸和醇作用生成酯和水的反应，属于取代反应的一种",
    "反应方程式：CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O（浓硫酸作催化剂，加热）",
    "反应类型：可逆反应、取代反应、非氧化还原反应",
    "浓硫酸的作用：①催化剂 ②吸水剂（吸收生成的水，使平衡正向移动）",
    "饱和Na₂CO₃溶液的作用：①中和挥发出的乙酸 ②溶解挥发出的乙醇 ③降低乙酸乙酯的溶解度，便于分层",
    "乙酸乙酯的性质：无色油状液体，有芳香气味（梨香味），不溶于水，密度比水小",
    "反应装置：试管中反应，导管通入饱和Na₂CO₃溶液液面上（防止倒吸）",
    "加热方式：小火加热（防止反应物挥发和暴沸）",
    "导管位置：导管口在饱和Na₂CO₃溶液液面上方2-3mm处（防止倒吸）",
    "反应机理：酸脱羟基醇脱氢（乙酸提供-COOH，乙醇提供-H）",
    "酯化反应与中和反应的区别：酯化反应是分子间反应，中和反应是离子反应",
    "高考考点：①酯化反应原理 ②实验装置和操作 ③饱和Na₂CO₃的作用 ④反应类型判断",
    "实验注意事项：①试管要洁净 ②先加乙醇再加浓硫酸最后加乙酸 ③小火加热 ④防止倒吸"
  ],
  "phenomena": {
    "description": "产生有香味（梨香味）的油状液体"
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "混合加酸",
      "stageType": "mixing",
      "durationEstimate": "1-2分钟",
      "phenomenaDescription": "乙酸和乙醇混合，加入浓硫酸，混合液放热，呈无色透明",
      "colorChange": {
        "from": "无色乙酸+无色乙醇",
        "to": "无色透明混合液"
      },
      "microscopicExplanation": "CH₃COOH和C₂H₅OH分子混合，浓硫酸作为催化剂提供H⁺离子"
    },
    {
      "stageOrder": 2,
      "stageName": "加热酯化",
      "stageType": "reacting",
      "durationEstimate": "3-5分钟",
      "phenomenaDescription": "加热后液体逐渐沸腾，产生的蒸汽经导管通入饱和Na₂CO₃溶液",
      "colorChange": {
        "from": "无色溶液",
        "to": "无色溶液+蒸汽"
      },
      "microscopicExplanation": "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O，酯化反应可逆进行，浓硫酸催化并吸水使平衡右移"
    },
    {
      "stageOrder": 3,
      "stageName": "产物收集",
      "stageType": "completion",
      "durationEstimate": "5-10分钟后",
      "phenomenaDescription": "饱和Na₂CO₃溶液表面出现无色油状液体，具有芳香气味（梨香味）",
      "colorChange": {
        "from": "透明Na₂CO₃溶液",
        "to": "溶液上层有无色油状液体"
      },
      "microscopicExplanation": "CH₃COOC₂H₅（乙酸乙酯）不溶于水，密度比水小，浮在Na₂CO₃溶液表面；Na₂CO₃中和未反应乙酸，溶解乙醇，降低酯的溶解度"
    }
  ]
}
```

---

#### 4.33.2 醛和酮

##### 方程式97: 甲醛的银镜反应

```json
{
  "equationText": "HCHO + 2Ag(NH₃)₂OH → HCOONH₄ + 2Ag↓ + 3NH₃ + H₂O",
  "equationHtml": "HCHO + 2Ag(NH<sub>3</sub>)<sub>2</sub>OH → HCOONH<sub>4</sub> + 2Ag↓ + 3NH<sub>3</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "水浴加热"},
  "oxidationChanges": [
    {"element": "C", "from": "0", "to": "+2", "process": "氧化"},
    {"element": "Ag", "from": "+1", "to": "0", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "甲醛与银氨溶液反应，试管壁形成银镜。",
    "teacherDescription": "检验醛基的反应。甲醛被氧化为甲酸铵，银离子被还原为银单质。",
    "keyPoints": [
      "银镜反应检验醛基",
      "水浴加热",
      "试管要洁净"
    ],
    "commonMistakes": [
      {"mistake": "直接加热", "correction": "必须水浴加热，温度均匀"}
    ]
  },
  "knowledgePoints": [
    "银镜反应是醛基的特征反应，用于检验醛基的存在",
    "反应方程式：HCHO + 2Ag(NH₃)₂OH → HCOONH₄ + 2Ag↓ + 3NH₃ + H₂O（水浴加热）",
    "反应原理：醛基（-CHO）具有还原性，能将银氨溶液中的Ag⁺还原为单质银",
    "反应条件：碱性环境（银氨溶液）、水浴加热（约60-70℃）",
    "实验现象：试管内壁形成光亮的银镜（银单质附着在试管壁上）",
    "试管要求：试管必须洁净（可用NaOH溶液煮沸洗涤），否则银镜不均匀或不形成",
    "银氨溶液配制：向AgNO₃溶液中滴加稀氨水至沉淀恰好溶解（避免氨水过量）",
    "反应类型：氧化还原反应（HCHO被氧化，Ag⁺被还原）",
    "氧化还原分析：C从0价升至+2价（被氧化），Ag从+1价降至0价（被还原）",
    "配平技巧：1mol HCHO还原2mol Ag⁺，甲醛是还原剂，银氨溶液是氧化剂",
    "醛的通性：所有醛（含醛基的物质）都能发生银镜反应",
    "实验注意事项：①水浴加热不能直接加热 ②银氨溶液现配现用 ③反应后用稀硝酸清洗银镜",
    "高考考点：①醛基的检验 ②氧化还原反应分析 ③配平计算",
    "与Cu(OH)₂反应对比：都能检验醛基，银镜反应更灵敏，现象更明显"
  ],
  "phenomena": {
    "colorChange": {"before": "无色溶液", "after": "银白色固体", "description": "形成银镜"}
  }
}
```

##### 方程式98: 丙酮的氧化

```json
{
  "equationText": "CH₃COCH₃ + [O] → CH₃COOH + HCOOH",
  "equationHtml": "CH<sub>3</sub>COCH<sub>3</sub> + [O] → CH<sub>3</sub>COOH + HCOOH",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "丙酮能被强氧化剂氧化。",
    "teacherDescription": "酮的C=O在强氧化剂下可断裂。不像醛那样容易被氧化。",
    "keyPoints": [
      "酮比醛难氧化",
      "需要强氧化剂"
    ]
  }
}
```

---

#### 4.33.3 糖类

##### 方程式99: 葡萄糖的银镜反应

```json
{
  "equationText": "CH₂OH(CHOH)₄CHO + 2Ag(NH₃)₂OH → CH₂OH(CHOH)₄COOH + 2Ag↓ + 3NH₃ + H₂O",
  "equationHtml": "CH<sub>2</sub>OH(CHOH)<sub>4</sub>CHO + 2Ag(NH<sub>3</sub>)<sub>2</sub>OH → CH<sub>2</sub>OH(CHOH)<sub>4</sub>COOH + 2Ag↓ + 3NH<sub>3</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "水浴加热"},
  "teachingInfo": {
    "studentDescription": "葡萄糖溶液与银氨溶液反应，形成银镜。",
    "teacherDescription": "葡萄糖含醛基，能发生银镜反应。用于检验还原性糖。",
    "keyPoints": [
      "葡萄糖是还原糖",
      "有醛基",
      "检验还原糖的方法"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "无色溶液", "after": "银白色固体"}
  }
}
```

##### 方程式100: 葡萄糖与新制氢氧化铜反应

```json
{
  "equationText": "CH₂OH(CHOH)₄CHO + 2Cu(OH)₂ → CH₂OH(CHOH)₄COOH + Cu₂O↓ + 2H₂O",
  "equationHtml": "CH<sub>2</sub>OH(CHOH)<sub>4</sub>CHO + 2Cu(OH)<sub>2</sub> → CH<sub>2</sub>OH(CHOH)<sub>4</sub>COOH + Cu<sub>2</sub>O↓ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "葡萄糖与蓝色氢氧化铜沉淀反应，生成砖红色沉淀。",
    "teacherDescription": "斐林反应。砖红色Cu₂O沉淀，检验还原性糖。",
    "keyPoints": [
      "砖红色沉淀",
      "检验还原糖"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "蓝色沉淀", "after": "砖红色沉淀"}
  }
}
```

##### 方程式101: 蔗糖的水解

```json
{
  "equationText": "C₁₂H₂₂O₁₁ + H₂O → C₆H₁₂O₆ + C₆H₁₂O₆",
  "equationHtml": "C<sub>12</sub>H<sub>22</sub>O<sub>11</sub> + H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "稀硫酸", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "蔗糖在稀硫酸催化下水解，生成葡萄糖和果糖。",
    "teacherDescription": "二糖水解为单糖。产物都有还原性，水解后可发生银镜反应。",
    "keyPoints": [
      "非还原性糖→还原性糖",
      "稀硫酸催化",
      "产物: 葡萄糖 + 果糖"
    ]
  }
}
```

##### 方程式102: 淀粉的水解

```json
{
  "equationText": "(C₆H₁₀O₅)ₙ + nH₂O → nC₆H₁₂O₆",
  "equationHtml": "(C<sub>6</sub>H<sub>10</sub>O<sub>5</sub>)<sub>n</sub> + nH<sub>2</sub>O → nC<sub>6</sub>H<sub>12</sub>O<sub>6</sub>",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "稀硫酸", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "淀粉在酸催化下水解，最终生成葡萄糖。",
    "teacherDescription": "多糖→单糖。淀粉遇碘变蓝，可用于检验淀粉是否完全水解。",
    "keyPoints": [
      "多糖→单糖",
      "淀粉遇碘变蓝",
      "人体消化淀粉的过程"
    ]
  },
  "phenomena": {
    "description": "可用碘液检验水解程度（变蓝说明还有淀粉）"
  }
}
```

---

#### 4.33.4 氨基酸和蛋白质

##### 方程式103: 氨基酸的缩合反应

```json
{
  "equationText": "2CH₃CH(NH₂)COOH → CH₃CH(NH₂)CONHCH(CH₃)COOH + H₂O",
  "equationHtml": "2CH<sub>3</sub>CH(NH<sub>2</sub>)COOH → CH<sub>3</sub>CH(NH<sub>2</sub>)CONHCH(CH<sub>3</sub>)COOH + H<sub>2</sub>O",
  "reactionTypeCode": "CONDENSATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "两个氨基酸分子脱水缩合，形成肽键。",
    "teacherDescription": "氨基酸的氨基与羧基脱水缩合。肽键是蛋白质的基本连接方式。",
    "keyPoints": [
      "脱水缩合",
      "形成肽键(-CO-NH-)",
      "蛋白质形成的基础"
    ]
  }
}
```

##### 方程式104: 蛋白质的变性

```json
{
  "equationText": "蛋白质 → 变性蛋白质",
  "equationHtml": "蛋白质 → 变性蛋白质",
  "reactionTypeCode": "DENATURATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "加热", "chemical": "重金属盐"},
  "teachingInfo": {
    "studentDescription": "蛋白质在加热或重金属盐作用下发生变性，失去生物活性。",
    "teacherDescription": "变性是空间结构破坏，肽键不断裂。不可逆。",
    "keyPoints": [
      "空间结构破坏",
      "失去活性",
      "不可逆过程",
      "高温、重金属、紫外线等可导致"
    ],
    "safetyNotes": ["重金属盐中毒的原理"]
  }
}
```

##### 方程式105: 蛋白质的颜色反应

```json
{
  "equationText": "蛋白质 + HNO₃ → 黄色",
  "equationHtml": "蛋白质 + HNO<sub>3</sub> → 黄色",
  "reactionTypeCode": "COLOR_REACTION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "蛋白质与浓硝酸反应，显黄色。",
    "teacherDescription": "黄蛋白反应。含苯环的氨基酸才有此反应。",
    "keyPoints": [
      "黄蛋白反应",
      "检验蛋白质的方法"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "无色/白色", "after": "黄色", "description": "浓硝酸使蛋白质变黄"}
  }
}
```

---

### 4.34 氧化还原反应详解

#### 4.34.1 歧化反应

**反应原理**: 同一元素同时发生氧化和还原

---

##### 方程式106: 氯气与水的反应（歧化）

```json
{
  "equationText": "Cl₂ + H₂O ⇌ HCl + HClO",
  "equationHtml": "Cl<sub>2</sub> + H<sub>2</sub>O ⇌ HCl + HClO",
  "reactionTypeCode": "DISPROPORTIONATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "Cl", "from": "0", "to": "-1", "process": "还原"},
    {"element": "Cl", "from": "0", "to": "+1", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "氯气溶于水，生成盐酸和次氯酸。",
    "teacherDescription": "歧化反应。一个Cl原子氧化，一个Cl原子还原。次氯酸有强氧化性。",
    "keyPoints": [
      "歧化反应",
      "HClO是强氧化剂",
      "可逆反应"
    ]
  },
  "knowledgePoints": [
    "氯气与水的反应是典型的歧化反应，体现了氯气的氧化还原性质",
    "反应方程式：Cl₂ + H₂O ⇌ HCl + HClO（可逆反应）",
    "离子方程式：Cl₂ + H₂O ⇌ H⁺ + Cl⁻ + HClO",
    "歧化反应分析：Cl₂中Cl为0价，反应后部分Cl降至-1价（HCl中），部分Cl升至+1价（HClO中）",
    "反应类型：歧化反应（自身氧化还原反应），也是可逆反应",
    "实验现象：氯气溶于水后形成浅黄绿色溶液（氯水），有刺激性气味",
    "氯水的成分：三种分子（Cl₂、H₂O、HClO），四种离子（H⁺、Cl⁻、ClO⁻、OH⁻）",
    "次氯酸的性质：①强氧化性（漂白、杀菌消毒）②不稳定性（见光分解）③弱酸性（比碳酸弱）",
    "漂白原理：HClO具有强氧化性，能破坏有机色素的分子结构，使有色物质褪色",
    "氯水的性质：①酸性（H⁺使石蕊变红）②漂白性（HClO）③氧化性（Cl₂、HClO）",
    "新制氯水与久置氯水：新制氯水含HClO有漂白性，久置氯水变为稀盐酸无漂白性",
    "氯水保存：棕色瓶避光保存，现用现配（防止HClO分解）",
    "氯水与液氯的区别：氯水是混合物（Cl₂、H₂O、HCl、HClO等），液氯是纯净物（Cl₂）",
    "实际应用：①自来水消毒（Cl₂与水反应生成HClO杀菌消毒）②漂白剂 ③制备次氯酸盐",
    "高考考点：①歧化反应分析 ②氯水的成分和性质 ③漂白性原理 ④离子方程式书写",
    "中考考点：①氯气性质 ②漂白性 ③实验现象"
  ]
}
```

##### 方程式107: 过氧化钠与水反应（歧化）

```json
{
  "equationText": "2Na₂O₂ + 2H₂O → 4NaOH + O₂↑",
  "equationHtml": "2Na<sub>2</sub>O<sub>2</sub> + 2H<sub>2</sub>O → 4NaOH + O<sub>2</sub>↑",
  "reactionTypeCode": "DISPROPORTIONATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "O", "from": "-1", "to": "-2", "process": "还原"},
    {"element": "O", "from": "-1", "to": "0", "process": "氧化"}
  ],
  "teachingInfo": {
    "studentDescription": "淡黄色过氧化钠与水反应，产生使带火星木条复燃的气体。",
    "teacherDescription": "O的化合价从-1变为-2和0。产生氧气。",
    "keyPoints": [
      "歧化反应",
      "O: -1 → -2和0",
      "产生氧气"
    ]
  },
  "knowledgePoints": [
    "过氧化钠与水的反应是氧元素的歧化反应，-1价氧发生自身氧化还原",
    "反应方程式：2Na₂O₂ + 2H₂O → 4NaOH + O₂↑",
    "歧化反应分析：Na₂O₂中O为-1价，反应后部分O降至-2价（NaOH中），部分O升至0价（O₂中）",
    "Na₂O₂既是氧化剂又是还原剂：同一元素既被氧化又被还原",
    "实验现象：淡黄色固体溶解，产生大量气泡（氧气），反应放热",
    "氧气检验：用带火星的木条检验，木条复燃证明产生的是氧气",
    "溶液碱性：反应后生成NaOH，溶液显碱性，可使酚酞试液变红",
    "Na₂O₂的物理性质：淡黄色固体粉末，是过氧化钠的特征颜色",
    "电子转移：每生成1mol O₂转移2mol电子",
    "应用：潜水、航天等缺氧环境下的供氧来源",
    "保存方法：密封干燥保存，防止与水和CO₂反应",
    "高考考点：歧化反应、电子转移分析、氧化还原计算",
    "中考考点：氧气的制取和检验、钠的化合物"
  ],
  "phenomena": {
    "gasEvolution": {"hasGas": true, "gasDescription": "无色气体，能使带火星木条复燃"}
  }
}
```

---

#### 4.34.2 归中反应

**反应原理: 不同化合价的同种元素反应生成中间化合价

---

##### 方程式108: 硫化氢与二氧化硫反应

```json
{
  "equationText": "2H₂S + SO₂ → 3S↓ + 2H₂O",
  "equationHtml": "2H<sub>2</sub>S + SO<sub>2</sub> → 3S↓ + 2H<sub>2</sub>O",
  "reactionTypeCode": "DISPROPORTIONATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "oxidationChanges": [
    {"element": "S", "from": "-2", "to": "0", "process": "氧化"},
    {"element": "S", "from": "+4", "to": "0", "process": "还原"}
  ],
  "teachingInfo": {
    "studentDescription": "两种气体混合，产生黄色固体。",
    "teacherDescription": "归中反应。-2和+4归中为0。两种有毒气体反应生成无毒的硫。",
    "keyPoints": [
      "归中反应",
      "S: -2和+4 → 0",
      "两种污染气体相互处理"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "黄色", "precipitateDescription": "硫单质"}
  }
}
```

##### 方程式109: 一氧化氮与二氧化氮反应

```json
{
  "equationText": "NO + NO₂ ⇌ N₂O₃",
  "equationHtml": "NO + NO<sub>2</sub> ⇌ N<sub>2</sub>O<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "两种氮氧化物反应生成三氧化二氮。",
    "teacherDescription": "N₂O₃是亚硝酸的酸酐。低温下稳定，常温易分解。",
    "keyPoints": [
      "N: +2和+4 → +3",
      "N₂O₃是亚硝酸酐"
    ]
  }
}
```

---

### 4.35 化学平衡反应

#### 4.35.1 可逆反应

**反应原理**: 反应物和产物同时存在，正逆反应速率相等

---

##### 方程式110: 二氧化氮与四氧化二氮的平衡

```json
{
  "equationText": "2NO₂ ⇌ N₂O₄",
  "equationHtml": "2NO<sub>2</sub> ⇌ N<sub>2</sub>O<sub>4</sub>",
  "reactionTypeCode": "EQUILIBRIUM",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -57.2,
  "teachingInfo": {
    "studentDescription": "红棕色气体与无色气体相互转化，颜色随温度变化。",
    "teacherDescription": "温度升高，平衡向NO₂方向移动（吸热）。压力增大，向N₂O₄方向移动。",
    "keyPoints": [
      "放热反应",
      "温度↑，颜色加深",
      "压力↑，颜色变浅"
    ],
    "commonQuestions": [
      {"question": "为什么温度升高颜色变深？", "answer": "平衡向吸热方向（NO₂）移动，NO₂是红棕色。"}
    ]
  },
  "phenomena": {
    "colorChange": {"description": "红棕色(NO₂) ⇌ 无色(N₂O₄)，颜色随条件变化"}
  }
}
```

##### 方程式111: 二氧化硫与氧气的平衡

```json
{
  "equationText": "2SO₂ + O₂ ⇌ 2SO₃",
  "equationHtml": "2SO<sub>2</sub> + O<sub>2</sub> ⇌ 2SO<sub>3</sub>",
  "reactionTypeCode": "EQUILIBRIUM",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -198,
  "conditions": {"catalyst": "V₂O₅", "temperature": "400-500℃", "pressure": "常压"},
  "teachingInfo": {
    "studentDescription": "二氧化硫与氧气在催化剂作用下反应，是接触法制硫酸的基础。",
    "teacherDescription": "接触制硫酸的核心反应。放热反应，但需加热以获得合适的速率。V₂O₅催化。",
    "keyPoints": [
      "放热反应",
      "V₂O₅催化",
      "接触法制硫酸核心反应"
    ]
  }
}
```

##### 方程式112: 氮气与氢气的平衡

```json
{
  "equationText": "N₂ + 3H₂ ⇌ 2NH₃",
  "equationHtml": "N<sub>2</sub> + 3H<sub>2</sub> ⇌ 2NH<sub>3</sub>",
  "reactionTypeCode": "EQUILIBRIUM",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "enthalpyChange": -92.4,
  "conditions": {"temperature": "500℃", "pressure": "20-50MPa", "catalyst": "铁"},
  "teachingInfo": {
    "studentDescription": "氮气与氢气在高温高压催化剂下合成氨气。",
    "teacherDescription": "哈伯法合成氨。放热反应，但高温可提高速率。高压使平衡右移。",
    "keyPoints": [
      "放热反应",
      "高温高压催化剂",
      "勒夏特列原理应用"
    ],
    "commonQuestions": [
      {"question": "为什么放热反应还要高温？", "answer": "高温虽使平衡左移，但显著提高反应速率，兼顾动力学和热力学。"}
    ]
  }
}
```

---

#### 4.35.2 酯化与水解平衡

##### 方程式113: 乙酸乙酯的平衡

```json
{
  "equationText": "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O",
  "equationHtml": "CH<sub>3</sub>COOH + C<sub>2</sub>H<sub>5</sub>OH ⇌ CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "EQUILIBRIUM",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "浓硫酸", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "乙酸与乙醇在浓硫酸催化下生成乙酸乙酯和水。",
    "teacherDescription": "可逆反应。浓硫酸既是催化剂又是吸水剂，使平衡右移。",
    "keyPoints": [
      "浓硫酸催化并吸水",
      "可逆反应",
      "饱和Na₂CO₃吸收产物"
    ]
  },
  "knowledgePoints": [
    "酯化反应是酸和醇作用生成酯和水的反应，属于取代反应",
    "反应方程式：CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O（浓硫酸催化、加热）",
    "反应类型：可逆反应、取代反应、非氧化还原反应",
    "浓硫酸的作用：①催化剂（加快反应速率）②吸水剂（吸收生成的水，促进平衡正向移动）",
    "饱和Na₂CO₃溶液的作用：①中和挥发出来的乙酸 ②溶解挥发出来的乙醇 ③降低乙酸乙酯的溶解度，便于分层",
    "乙酸乙酯的性质：无色油状液体，具有芳香气味（梨香味），不溶于水，密度比水小",
    "反应机理：酸脱羟基醇脱氢（乙酸提供-COOH中的羟基，乙醇提供-OH中的氢）",
    "可逆反应的特点：反应物不能完全转化为产物，存在化学平衡",
    "影响平衡的因素：①增加反应物浓度 ②移走产物 ③使用浓硫酸吸水都能促进平衡正向移动",
    "高考考点：酯化反应原理、实验装置和操作、化学平衡移动",
    "实验注意事项：导管口在饱和Na₂CO₃溶液液面上方（防止倒吸），小火加热"
  ]
}
```

---

### 4.36 更多离子反应

#### 4.36.1 离子交换反应

---

##### 方程式114: 硫酸根离子与钡离子的沉淀反应

```json
{
  "equationText": "Ba²⁺ + SO₄²⁻ → BaSO₄↓",
  "equationHtml": "Ba<sup>2+</sup> + SO<sub>4</sub><sup>2-</sup> → BaSO<sub>4</sub>↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生白色沉淀。",
    "teacherDescription": "检验硫酸根的方法。BaSO₄不溶于酸。",
    "keyPoints": [
      "白色沉淀",
      "BaSO₄不溶于酸",
      "检验SO₄²⁻"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "白色", "solubility": "不溶于酸"}
  }
}
```

##### 方程式115: 氯离子与银离子的沉淀反应

```json
{
  "equationText": "Ag⁺ + Cl⁻ → AgCl↓",
  "equationHtml": "Ag<sup>+</sup> + Cl<sup>-</sup> → AgCl↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生白色沉淀。",
    "teacherDescription": "检验氯离子的方法。AgCl见光分解变紫。",
    "keyPoints": [
      "白色沉淀",
      "见光分解",
      "检验Cl⁻"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "白色", "description": "见光变紫黑"}
  }
}
```

##### 方程式116: 碳酸根与钙离子的沉淀反应

```json
{
  "equationText": "Ca²⁺ + CO₃²⁻ → CaCO₃↓",
  "equationHtml": "Ca<sup>2+</sup> + CO<sub>3</sub><sup>2-</sup> → CaCO<sub>3</sub>↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生白色沉淀。",
    "teacherDescription": "CaCO₃溶于酸。这是硬水形成锅垢的原因。",
    "keyPoints": [
      "白色沉淀",
      "溶于酸",
      "水垢的主要成分"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "白色", "solubility": "溶于酸"}
  }
}
```

---

#### 4.36.2 酸碱中和反应

##### 方程式117: 氢离子与氢氧根离子中和

```json
{
  "equationText": "H⁺ + OH⁻ → H₂O",
  "equationHtml": "H<sup>+</sup> + OH<sup>-</sup> → H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -57.3,
  "teachingInfo": {
    "studentDescription": "酸碱中和反应的实质。",
    "teacherDescription": "所有强酸强碱中和的离子方程式相同。ΔH = -57.3 kJ/mol。",
    "keyPoints": [
      "离子方程式",
      "放热反应",
      "ΔH = -57.3 kJ/mol"
    ]
  }
}
```

##### 方程式118: 弱酸的电离

```json
{
  "equationText": "CH₃COOH ⇌ CH₃COO⁻ + H⁺",
  "equationHtml": "CH<sub>3</sub>COOH ⇌ CH<sub>3</sub>COO<sup>-</sup> + H<sup>+</sup>",
  "reactionTypeCode": "IONIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "乙酸部分电离产生氢离子。",
    "teacherDescription": "弱酸电离是可逆过程。电离度约1.3%。",
    "keyPoints": [
      "部分电离",
      "可逆过程",
      "电离度约1.3%"
    ]
  }
}
```

##### 方程式119: 弱碱的电离

```json
{
  "equationText": "NH₃·H₂O ⇌ NH₄⁺ + OH⁻",
  "equationHtml": "NH<sub>3</sub>·H<sub>2</sub>O ⇌ NH<sub>4</sub><sup>+</sup> + OH<sup>-</sup>",
  "reactionTypeCode": "IONIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氨水部分电离产生氢氧根离子。",
    "teacherDescription": "弱碱电离。一水合氨是弱电解质。",
    "keyPoints": [
      "弱电解质",
      "部分电离"
    ]
  }
}
```

---

### 4.37 实验室制备方法

#### 4.37.1 气体制备

---

##### 方程式120: 实验室制氢气

```json
{
  "equationText": "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
  "equationHtml": "Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "secondaryReactions": [
    {
      "secondaryEquationId": 229,
      "secondaryEquationText": "Zn + 2H₂SO₄(浓) → ZnSO₄ + SO₂↑ + 2H₂O",
      "secondaryEquationHtml": "Zn + 2H<sub>2</sub>SO<sub>4</sub>(浓) → ZnSO<sub>4</sub> + SO<sub>2</sub>↑ + 2H<sub>2</sub>O",
      "relationship": "competitive",
      "triggerProbability": 0.9,
      "triggerCondition": {
        "acidType": "浓硫酸"
      },
      "phenomenonImpact": {
        "gasInterference": "刺激性气味的SO₂气体，无H₂产生"
      },
      "suppressionMethod": "必须使用稀硫酸，不能用浓硫酸",
      "isCommonStudentError": true,
      "teachingNote": "强调稀硫酸与浓硫酸的区别"
    },
    {
      "secondaryEquationId": 230,
      "secondaryEquationText": "Fe + H₂SO₄ → FeSO₄ + H₂↑",
      "secondaryEquationHtml": "Fe + H<sub>2</sub>SO<sub>4</sub> → FeSO<sub>4</sub> + H<sub>2</sub>↑",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "impurityPresent": true,
        "impurityType": "铁"
      },
      "phenomenonImpact": {
        "colorMask": "Fe²⁺使溶液呈浅绿色"
      },
      "teachingNote": "锌粒中常含铁杂质"
    }
  ],
  "teachingInfo": {
    "studentDescription": "锌与稀硫酸反应产生氢气。",
    "teacherDescription": "固液反应，不需加热。排水法或向下排空气法收集。",
    "keyPoints": [
      "固液反应",
      "不需加热",
      "排水法收集"
    ]
  },
  "knowledgePoints": [
    "实验室制氢气最常用方法：锌粒与稀硫酸反应",
    "反应方程式：Zn + H₂SO₄ → ZnSO₄ + H₂↑",
    "离子方程式：Zn + 2H⁺ → Zn²⁺ + H₂↑",
    "反应类型：置换反应（金属 + 酸 → 盐 + 氢气），也是氧化还原反应",
    "金属活动性：锌排在氢前面（Zn > H），能置换酸中的氢",
    "为什么用锌粒：锌与稀硫酸反应速率适中，价格适中，纯锌易得",
    "为什么用稀硫酸：浓硫酸有强氧化性，与锌反应生成SO₂而不是H₂",
    "为什么不用盐酸：盐酸易挥发，会使制得的H₂中混有HCl气体",
    "反应装置：固液常温型（试管或锥形瓶+长颈漏斗）",
    "气体收集：排水法（H₂难溶于水）或向下排空气法（H₂密度最小）",
    "氢气验纯：点燃前必须验纯（用小试管收集一管氢气，管口向下移近火焰，听到尖锐爆鸣声不纯，轻微'噗'声则纯）",
    "实验现象：锌粒逐渐溶解，表面产生大量气泡，反应放热（试管壁发烫）",
    "氧化还原分析：锌元素从0价升至+2价（被氧化），氢元素从+1价降至0价（被还原）",
    "中考考点：①实验室制氢气 ②置换反应 ③金属活动性顺序 ④氢气验纯 ⑤实验装置选择",
    "安全注意事项：氢气易燃易爆，点燃前必须验纯；稀硫酸有腐蚀性，避免皮肤接触"
  ],
  "phenomena": {
    "gasEvolution": {"hasGas": true, "gasDescription": "无色无味气体"}
  }
}
```

##### 方程式121: 实验室制二氧化碳

```json
{
  "equationText": "CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
  "equationHtml": "CaCO<sub>3</sub> + 2HCl → CaCl<sub>2</sub> + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "secondaryReactions": [
    {
      "secondaryEquationId": 231,
      "secondaryEquationText": "CaCO₃ + H₂SO₄ → CaSO₄ + CO₂↑ + H₂O",
      "secondaryEquationHtml": "CaCO<sub>3</sub> + H<sub>2</sub>SO<sub>4</sub> → CaSO<sub>4</sub> + CO<sub>2</sub>↑ + H<sub>2</sub>O",
      "relationship": "competitive",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "acidType": "硫酸"
      },
      "phenomenonImpact": {
        "description": "CaSO₄微溶覆盖CaCO₃表面，反应逐渐停止"
      },
      "suppressionMethod": "不使用硫酸，改用盐酸",
      "isCommonStudentError": true,
      "teachingNote": "解释为什么不用硫酸"
    },
    {
      "secondaryEquationId": 232,
      "secondaryEquationText": "CO₂ + H₂O → H₂CO₃",
      "secondaryEquationHtml": "CO<sub>2</sub> + H<sub>2</sub>O → H<sub>2</sub>CO<sub>3</sub>",
      "relationship": "sequential",
      "triggerProbability": 1.0,
      "triggerCondition": {
        "waterPresent": true
      },
      "phenomenonImpact": {
        "description": "部分CO₂溶于水生成碳酸"
      },
      "teachingNote": "可用澄清石灰水检验CO₂"
    },
    {
      "secondaryEquationId": 233,
      "secondaryEquationText": "HCl + H₂O → H₃O⁺ + Cl⁻",
      "secondaryEquationHtml": "HCl + H<sub>2</sub>O → H<sub>3</sub>O<sup>+</sup> + Cl<sup>-</sup>",
      "relationship": "side",
      "triggerProbability": 0.5,
      "triggerCondition": {
        "acidType": "浓盐酸"
      },
      "phenomenonImpact": {
        "gasInterference": "浓盐酸挥发出的HCl气体干扰CO₂检验"
      },
      "suppressionMethod": "使用稀盐酸，或通过NaHCO₃溶液洗涤",
      "teachingNote": "浓盐酸挥发出的HCl会使澄清石灰水变浑浊"
    }
  ],
  "teachingInfo": {
    "studentDescription": "大理石与稀盐酸反应产生二氧化碳。",
    "teacherDescription": "固液反应，不需加热。向上排空气法收集。不用浓盐酸或硫酸。",
    "keyPoints": [
      "大理石+稀盐酸",
      "向上排空气法",
      "不用浓盐酸或硫酸"
    ]
  }
}
```

##### 方程式122: 实验室制氨气

```json
{
  "equationText": "2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O",
  "equationHtml": "2NH<sub>4</sub>Cl + Ca(OH)<sub>2</sub> → CaCl<sub>2</sub> + 2NH<sub>3</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "加热"},
  "secondaryReactions": [
    {
      "secondaryEquationId": 234,
      "secondaryEquationText": "NH₄Cl → NH₃↑ + HCl↑",
      "secondaryEquationHtml": "NH<sub>4</sub>Cl → NH<sub>3</sub>↑ + HCl↑",
      "relationship": "parallel",
      "triggerProbability": 0.6,
      "triggerCondition": {
        "temperature": "加热",
        "baseMissing": true
      },
      "phenomenonImpact": {
        "description": "NH₄Cl单独加热分解，在试管口重新结合"
      },
      "suppressionMethod": "与Ca(OH)₂混合加热",
      "isCommonStudentError": true,
      "teachingNote": "NH₄Cl分解类似于'碘升华'，实际是化学变化"
    },
    {
      "secondaryEquationId": 235,
      "secondaryEquationText": "NH₃ + HCl → NH₄Cl",
      "secondaryEquationHtml": "NH<sub>3</sub> + HCl → NH<sub>4</sub>Cl",
      "relationship": "sequential",
      "triggerProbability": 0.8,
      "triggerCondition": {
        "temperature": "冷却"
      },
      "phenomenonImpact": {
        "description": "在试管口冷凝处生成白色固体NH₄Cl"
      },
      "teachingNote": "白色固体是NH₄Cl，不是氨气"
    },
    {
      "secondaryEquationId": 42,
      "secondaryEquationText": "NH₃ + H₂O ⇌ NH₃·H₂O ⇌ NH₄⁺ + OH⁻",
      "secondaryEquationHtml": "NH<sub>3</sub> + H<sub>2</sub>O ⇌ NH<sub>3</sub>·H<sub>2</sub>O ⇌ NH<sub>4</sub><sup>+</sup> + OH<sup>-</sup>",
      "relationship": "side",
      "triggerProbability": 0.9,
      "triggerCondition": {
        "waterPresent": true
      },
      "phenomenonImpact": {
        "description": "氨气极易溶于水，形成碱性溶液"
      },
      "teachingNote": "不能用排水法收集，要用向下排空气法"
    }
  ],
  "teachingInfo": {
    "studentDescription": "氯化铵与氢氧化钙混合加热，产生刺激性气味的氨气。",
    "teacherDescription": "固固加热反应。向下排空气法收集。试管口棉花防止对流。",
    "keyPoints": [
      "固固加热",
      "向下排空气法",
      "试管口棉花"
    ]
  }
}
```

##### 方程式123: 实验室制硫化氢

```json
{
  "equationText": "FeS + H₂SO₄ → FeSO₄ + H₂S↑",
  "equationHtml": "FeS + H<sub>2</sub>SO<sub>4</sub> → FeSO<sub>4</sub> + H<sub>2</sub>S↑",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "secondaryReactions": [
    {
      "secondaryEquationId": 74,
      "secondaryEquationText": "2H₂S + 3O₂ → 2SO₂ + 2H₂O",
      "secondaryEquationHtml": "2H<sub>2</sub>S + 3O<sub>2</sub> → 2SO<sub>2</sub> + 2H<sub>2</sub>O",
      "relationship": "parallel",
      "triggerProbability": 0.3,
      "triggerCondition": {
        "oxygenPresent": true,
        "temperature": "点燃"
      },
      "phenomenonImpact": {
        "description": "H₂S在氧气不足时燃烧生成SO₂"
      },
      "teachingNote": "H₂S完全燃烧生成SO₂，不完全燃烧生成S"
    },
    {
      "secondaryEquationId": 236,
      "secondaryEquationText": "H₂S + CuSO₄ → CuS↓ + H₂SO₄",
      "secondaryEquationHtml": "H<sub>2</sub>S + CuSO<sub>4</sub> → CuS↓ + H<sub>2</sub>SO<sub>4</sub>",
      "relationship": "side",
      "triggerProbability": 1.0,
      "triggerCondition": {
        "copperSaltPresent": true
      },
      "phenomenonImpact": {
        "precipitateInterference": "产生黑色沉淀，可用于检验H₂S"
      },
      "teachingNote": "可用CuSO₄溶液检验或吸收H₂S"
    },
    {
      "secondaryEquationId": 237,
      "secondaryEquationText": "H₂S + Cl₂ → 2HCl + S↓",
      "secondaryEquationHtml": "H<sub>2</sub>S + Cl<sub>2</sub> → 2HCl + S↓",
      "relationship": "parallel",
      "triggerProbability": 0.9,
      "triggerCondition": {
        "chlorinePresent": true
      },
      "phenomenonImpact": {
        "description": "H₂S还原性很强，能被Cl₂氧化"
      },
      "teachingNote": "H₂S不能用浓硫酸干燥"
    }
  ],
  "teachingInfo": {
    "studentDescription": "硫化亚铁与稀硫酸反应，产生臭鸡蛋气味的气体。",
    "teacherDescription": "剧毒气体，必须在通风橱中进行。",
    "keyPoints": [
      "剧毒气体",
      "通风橱操作",
      "臭鸡蛋气味"
    ],
    "safetyNotes": ["H₂S剧毒", "必须通风"]
  },
  "knowledgePoints": [
    "实验室制硫化氢的原理和方法：硫化亚铁与稀硫酸（或稀盐酸）反应",
    "反应方程式：FeS + H₂SO₄ → FeSO₄ + H₂S↑ 或 FeS + 2HCl → FeCl₂ + H₂S↑",
    "反应装置：固液常温型反应装置，可用启普发生器",
    "气体收集：向上排空气法（H₂S密度大于空气）",
    "H₂S的物理性质：无色气体，有臭鸡蛋气味，剧毒，能溶于水",
    "H₂S的化学性质：弱酸性的氢硫酸水溶液，强还原性",
    "检验方法：用湿润的醋酸铅试纸检验，变黑；或用CuSO₄溶液产生黑色沉淀",
    "安全注意事项：必须在通风橱中进行，尾气用NaOH溶液或CuSO₄溶液吸收",
    "为什么不用浓硫酸：浓硫酸有强氧化性，会氧化H₂S生成S或SO₂",
    "为什么不用硝酸：硝酸有强氧化性，会氧化H₂S",
    "离子方程式：FeS + 2H⁺ → Fe²⁺ + H₂S↑",
    "H₂S的燃烧：完全燃烧2H₂S + 3O₂ → 2SO₂ + 2H₂O，不完全燃烧2H₂S + O₂ → 2S + 2H₂O",
    "中考考点：有毒气体的实验室制法、尾气处理、气体验验"
  ]
}
```

##### 方程式124: 实验室制二氧化硫

```json
{
  "equationText": "Na₂SO₃ + H₂SO₄ → Na₂SO₄ + SO₂↑ + H₂O",
  "equationHtml": "Na<sub>2</sub>SO<sub>3</sub> + H<sub>2</sub>SO<sub>4</sub> → Na<sub>2</sub>SO<sub>4</sub> + SO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "亚硫酸钠与硫酸反应，产生刺激性气味的气体。",
    "teacherDescription": "SO₂有毒，尾气用NaOH吸收。",
    "keyPoints": [
      "亚硫酸钠+硫酸",
      "尾气处理"
    ],
    "safetyNotes": ["SO₂有毒", "尾气处理"]
  }
}
```

---

#### 4.37.2 其他制备

##### 方程式125: 实验室制氢氧化铁

```json
{
  "equationText": "FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl",
  "equationHtml": "FeCl<sub>3</sub> + 3NaOH → Fe(OH)<sub>3</sub>↓ + 3NaCl",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "氯化铁溶液与氢氧化钠溶液反应，产生红褐色沉淀。",
    "teacherDescription": "沉淀加热分解为氧化铁。",
    "keyPoints": [
      "红褐色沉淀"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "红褐色"}
  }
}
```

##### 方程式126: 实验室制氢氧化亚铁

```json
{
  "equationText": "FeSO₄ + 2NaOH → Fe(OH)₂↓ + Na₂SO₄",
  "equationHtml": "FeSO<sub>4</sub> + 2NaOH → Fe(OH)<sub>2</sub>↓ + Na<sub>2</sub>SO<sub>4</sub>",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "硫酸亚铁溶液与氢氧化钠溶液反应，产生白色沉淀。",
    "teacherDescription": "Fe(OH)₂不稳定，迅速被氧气氧化变为红褐色。需排除氧气。",
    "keyPoints": [
      "白色沉淀",
      "迅速变红褐",
      "需排除氧气"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "白色沉淀", "after": "红褐色沉淀", "description": "白色→灰绿→红褐"}
  }
}
```

---

### 4.38 工业化学反应

#### 4.38.1 炼铁与炼钢

---

##### 方程式127: 炼铁原理

```json
{
  "equationText": "Fe₂O₃ + 3CO → 2Fe + 3CO₂",
  "equationHtml": "Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub>",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "氧化铁与一氧化碳在高温下反应，生成铁。",
    "teacherDescription": "高炉炼铁的核心反应。CO由焦炭燃烧产生。",
    "keyPoints": [
      "高炉炼铁核心反应",
      "CO是还原剂",
      "高温条件"
    ]
  },
  "stages": [
    {
      "stageOrder": 1,
      "stageName": "气体接触",
      "stageType": "initiation",
      "durationEstimate": "几秒",
      "phenomenaDescription": "高温CO气体与红棕色Fe₂O₃固体接触，固体表面开始反应",
      "colorChange": {
        "from": "红棕色固体",
        "to": "红棕色固体表面变暗"
      },
      "microscopicExplanation": "CO分子与Fe₂O₃表面接触，C与O结合，Fe₂O₃中的O被CO夺取"
    },
    {
      "stageOrder": 2,
      "stageName": "还原进行",
      "stageType": "propagation",
      "durationEstimate": "持续进行",
      "phenomenaDescription": "红棕色固体逐渐转变为黑色，CO气体转化为CO₂气体",
      "colorChange": {
        "from": "红棕色",
        "to": "深灰黑色"
      },
      "microscopicExplanation": "Fe₂O₃ + 3CO → 2Fe + 3CO₂，Fe³⁺被还原为Fe单质，CO被氧化为CO₂"
    },
    {
      "stageOrder": 3,
      "stageName": "还原完成",
      "stageType": "completion",
      "durationEstimate": "反应完成后",
      "phenomenaDescription": "红棕色Fe₂O₃完全转化为银白色/灰黑色铁单质（海绵铁）",
      "colorChange": {
        "from": "红棕色氧化铁",
        "to": "灰黑色铁"
      },
      "microscopicExplanation": "Fe³⁺完全还原为Fe⁰，形成多孔状海绵铁，CO完全转化为CO₂气体"
    }
  ],
  "knowledgePoints": [
    "高炉炼铁的核心原理：一氧化碳还原氧化铁",
    "反应方程式：Fe₂O₃ + 3CO → 2Fe + 3CO₂（高温条件）",
    "反应类型：氧化还原反应",
    "氧化还原分析：Fe从+3价降至0价（得电子被还原），CO中C从+2价升至+4价（失电子被氧化）",
    "CO的作用：还原剂，将铁从铁矿石中还原出来",
    "反应条件：高温（高炉内约1500℃）",
    "实验现象：红棕色Fe₂O₃粉末逐渐变黑，生成铁粉",
    "工业应用：高炉炼铁，原料包括铁矿石（赤铁矿Fe₂O₃）、焦炭、石灰石、空气",
    "CO的来源：焦炭燃烧生成CO₂，CO₂与焦炭反应生成CO（C + CO₂ → 2CO）",
    "尾气处理：实验中尾气CO有毒，必须点燃或收集处理",
    "中考考点：炼铁原理、氧化还原分析、实验现象",
    "高考考点：氧化还原配平、工业炼铁流程分析"
  ]
}
```

##### 方程式128: 炼钢降碳

```json
{
  "equationText": "2Fe + O₂ → 2FeO",
  "equationHtml": "2Fe + O<sub>2</sub> → 2FeO",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "炼钢过程中铁被氧气氧化。",
    "teacherDescription": "生铁中的碳与FeO反应生成CO₂，降低碳含量。",
    "keyPoints": [
      "炼钢过程",
      "降低碳含量"
    ]
  }
}
```

##### 方程式129: 炼钢脱硫

```json
{
  "equationText": "FeS + CaO → FeO + CaS",
  "equationHtml": "FeS + CaO → FeO + CaS",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "生石灰脱硫反应。",
    "teacherDescription": "CaO与FeS反应生成CaS，进入炉渣。",
    "keyPoints": [
      "生石灰脱硫",
      "造渣过程"
    ]
  }
}
```

---

#### 4.38.2 其他工业反应

##### 方程式130: 工业制玻璃

```json
{
  "equationText": "Na₂CO₃ + SiO₂ → Na₂SiO₃ + CO₂↑",
  "equationHtml": "Na<sub>2</sub>CO<sub>3</sub> + SiO<sub>2</sub> → Na<sub>2</sub>SiO<sub>3</sub> + CO<sub>2</sub>↑",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "碳酸钠与二氧化硅高温反应。",
    "teacherDescription": "制造钠玻璃的原料反应。纯碱与石英砂在高温下反应。",
    "keyPoints": [
      "制玻璃原料反应",
      "高温熔融"
    ]
  }
}
```

##### 方程式131: 工业制水泥

```json
{
  "equationText": "CaCO₃ → CaO + CO₂↑",
  "equationHtml": "CaCO<sub>3</sub> → CaO + CO<sub>2</sub>↑",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "石灰石分解生成生石灰。",
    "teacherDescription": "水泥生产的第一步。生石灰是重要原料。",
    "keyPoints": [
      "水泥生产第一步",
      "高温分解"
    ]
  },
  "knowledgePoints": [
    "工业制生石灰的核心反应：碳酸钙高温分解",
    "反应方程式：CaCO₃ → CaO + CO₂↑（高温条件）",
    "反应类型：分解反应",
    "反应条件：高温煅烧（约900-1000℃）",
    "工业应用：①制生石灰（CaO）②水泥工业第一步③工业CO₂副产品",
    "CaO用途：建筑材料、制漂白粉、改良酸性土壤",
    "实验现象：白色固体高温分解，产生CO₂气体",
    "中考考点：分解反应、工业制生石灰",
    "高考考点：化学平衡、工业流程分析"
  ]
}
```

---

### 4.39 环境化学反应

#### 4.39.1 酸雨形成

---

##### 方程式132: 二氧化硫形成酸雨

```json
{
  "equationText": "SO₂ + H₂O ⇌ H₂SO₃",
  "equationHtml": "SO<sub>2</sub> + H<sub>2</sub>O ⇌ H<sub>2</sub>SO<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "二氧化硫溶于水形成亚硫酸。",
    "teacherDescription": "酸雨形成的主要原因之一。亚硫酸可被氧化为硫酸。",
    "keyPoints": [
      "酸雨成因",
      "SO₂主要来源: 化石燃料燃烧"
    ]
  },
  "knowledgePoints": [
    "酸雨形成的主要原因：二氧化硫与水反应",
    "反应方程式：SO₂ + H₂O ⇌ H₂SO₃（可逆反应）",
    "SO₂的来源：煤和石油的燃烧、金属冶炼、火山爆发等",
    "H₂SO₃的性质：亚硫酸，中强酸，不稳定，易被氧化为硫酸",
    "后续反应：2H₂SO₃ + O₂ → 2H₂SO₄（硫酸，强酸）",
    "酸雨的危害：①破坏森林 ②酸化湖泊 ③腐蚀建筑 ④危害人体健康",
    "酸雨的pH值：正常雨水pH≈5.6（因溶解CO₂），酸雨pH<5.6",
    "预防措施：①使用清洁能源 ②废气处理 ③植树造林",
    "中考考点：酸雨成因、环境保护、化学反应",
    "高考考点：环境化学、可逆反应、氧化还原反应"
  ]
}
```

##### 方程式133: 亚硫酸氧化为硫酸

```json
{
  "equationText": "2H₂SO₃ + O₂ → 2H₂SO₄",
  "equationHtml": "2H<sub>2</sub>SO<sub>3</sub> + O<sub>2</sub> → 2H<sub>2</sub>SO<sub>4</sub>",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "亚硫酸被氧化为硫酸。",
    "teacherDescription": "大气中SO₂最终转化为硫酸，使酸雨酸性更强。",
    "keyPoints": [
      "酸雨酸性增强",
      "大气化学反应"
    ]
  }
}
```

##### 方程式134: 氮氧化物形成酸雨

```json
{
  "equationText": "3NO₂ + H₂O → 2HNO₃ + NO",
  "equationHtml": "3NO<sub>2</sub> + H<sub>2</sub>O → 2HNO<sub>3</sub> + NO",
  "reactionTypeCode": "DISPROPORTIONATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "二氧化氮与水反应生成硝酸。",
    "teacherDescription": "NO₂是酸雨形成的另一主要原因。",
    "keyPoints": [
      "酸雨成因",
      "NOₓ来源: 汽车尾气"
    ]
  },
  "knowledgePoints": [
    "二氧化氮与水的反应是典型的歧化反应，NO₂中氮元素发生自身氧化还原",
    "反应方程式：3NO₂ + H₂O → 2HNO₃ + NO",
    "歧化反应分析：NO₂中N为+4价，反应后部分升至+5价（HNO₃中），部分降至+2价（NO中）",
    "NO₂既是氧化剂又是还原剂：2/3的NO₂被氧化成HNO₃，1/3的NO₂被还原成NO",
    "实验现象：红棕色气体逐渐消失，溶液变为无色（生成HNO₃），同时产生无色气体（NO）",
    "NO₂的物理性质：红棕色、有刺激性气味、有毒的气体，密度比空气大",
    "工业应用：这是工业制硝酸的吸收塔反应之一",
    "后续反应：生成的NO可被氧气氧化成NO₂（2NO + O₂ → 2NO₂），NO₂再与水反应，形成循环",
    "总反应式：4NO₂ + 2H₂O + O₂ → 4HNO₃（NO₂、H₂O、O₂共同反应）",
    "环境影响：NO₂是空气污染物，会导致酸雨和光化学烟雾",
    "酸雨形成：NO₂ + H₂O → HNO₃ + NO，生成的HNO₃随雨水落下形成酸雨",
    "高考考点：歧化反应分析、氮及其化合物转化、氧化还原反应计算",
    "中考考点：氮的氧化物与水反应、酸雨成因"
  ]
}
```

---

#### 4.39.2 光化学烟雾

##### 方程式135: 二氧化氮的光解

```json
{
  "equationText": "NO₂ → NO + O",
  "equationHtml": "NO<sub>2</sub> → NO + O",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "紫外线照射"},
  "teachingInfo": {
    "studentDescription": "二氧化氮在紫外线照射下分解。",
    "teacherDescription": "光化学烟雾形成的起始反应。原子氧很活泼。",
    "keyPoints": [
      "光化学烟雾起始",
      "紫外线驱动"
    ]
  }
}
```

##### 方程式136: 臭氧的形成

```json
{
  "equationText": "O + O₂ → O₃",
  "equationHtml": "O + O<sub>2</sub> → O<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "原子氧与氧气反应生成臭氧。",
    "teacherDescription": "近地面臭氧是污染物。光化学烟雾的成分。",
    "keyPoints": [
      "近地面O₃是污染物",
      "刺激呼吸道"
    ]
  }
}
```

---

### 4.40 生物化学相关反应

#### 4.40.1 呼吸作用

---

##### 方程式137: 有氧呼吸总反应

```json
{
  "equationText": "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "enthalpyChange": -2870,
  "teachingInfo": {
    "studentDescription": "葡萄糖与氧气反应，产生二氧化碳和水，释放能量。",
    "teacherDescription": "生物体有氧呼吸的总反应。释放大量能量供生命活动。",
    "keyPoints": [
      "生物体内氧化",
      "释放能量",
      "ATP生成"
    ]
  },
  "knowledgePoints": [
    "有氧呼吸总反应式：C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量",
    "反应实质：葡萄糖在细胞内彻底氧化分解，释放大量能量",
    "反应场所：主要在线粒体中进行",
    "能量释放：1mol葡萄糖彻底氧化释放约2870kJ能量，其中约1161kJ储存在ATP中",
    "ATP生成：共生成38个ATP分子（理论上）",
    "反应条件：需要氧气和酶的参与",
    "与光合作用的关系：有氧呼吸是光合作用的逆反应",
    "应用：生物体获取能量的主要方式，维持生命活动",
    "中考考点：呼吸作用概念、能量释放、与光合作用的区别",
    "高考考点：有氧呼吸三个阶段、ATP生成计算、与光合作用的综合分析"
  ]
}
```

##### 方程式138: 无氧呼吸（乳酸发酵）

```json
{
  "equationText": "C₆H₁₂O₆ → 2C₃H₆O₃",
  "equationHtml": "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → 2C<sub>3</sub>H<sub>6</sub>O<sub>3</sub>",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "葡萄糖无氧分解产生乳酸。",
    "teacherDescription": "剧烈运动时肌肉细胞的无氧呼吸。释放能量较少。",
    "keyPoints": [
      "无氧呼吸",
      "释放能量少",
      "肌肉酸痛原因"
    ]
  }
}
```

##### 方程式139: 酒精发酵

```json
{
  "equationText": "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂",
  "equationHtml": "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → 2C<sub>2</sub>H<sub>5</sub>OH + 2CO<sub>2</sub>",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"condition": "酵母菌催化"},
  "teachingInfo": {
    "studentDescription": "葡萄糖在酵母菌作用下分解为酒精和二氧化碳。",
    "teacherDescription": "酿酒和面包制作的原理。厌氧条件。",
    "keyPoints": [
      "酵母菌发酵",
      "酿酒原理",
      "厌氧条件"
    ]
  }
}
```

---

#### 4.40.2 光合作用

##### 方程式140: 光合作用总反应

```json
{
  "equationText": "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
  "equationHtml": "6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>",
  "reactionTypeCode": "PHOTOSYNTHESIS",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"condition": "光能, 叶绿素催化"},
  "enthalpyChange": +2870,
  "teachingInfo": {
    "studentDescription": "植物在光作用下，将二氧化碳和水转化为葡萄糖和氧气。",
    "teacherDescription": "最重要的化学反应之一。储存太阳能为化学能。",
    "keyPoints": [
      "储存太阳能",
      "产生氧气",
      "食物链基础"
    ]
  },
  "knowledgePoints": [
    "光合作用总反应式：6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂（光能，叶绿体）",
    "反应实质：绿色植物通过叶绿素，利用光能将二氧化碳和水转化为有机物",
    "能量转换：光能→化学能（储存在葡萄糖中）",
    "物质转化：无机物（CO₂、H₂O）→有机物（葡萄糖）",
    "反应条件：需要光能、叶绿素、酶的参与",
    "反应场所：叶绿体中进行",
    "两个阶段：光反应（产O₂、ATP、NADPH）和暗反应（产葡萄糖）",
    "光合作用意义：①制造有机物 ②储存能量 ③释放O₂ ④维持大气碳氧平衡",
    "与呼吸作用关系：光合作用与呼吸作用互为逆反应",
    "中考考点：光合作用概念、原料产物、条件场所",
    "高考考点：光反应暗反应过程、影响光合作用的因素、与呼吸作用的综合分析"
  ]
}
```

---

### 4.41 更多沉淀反应

#### 4.41.1 难溶盐

---

##### 方程式141: 硫酸钡沉淀

```json
{
  "equationText": "Ba²⁺ + SO₄²⁻ → BaSO₄↓",
  "equationHtml": "Ba<sup>2+</sup> + SO<sub>4</sub><sup>2-</sup> → BaSO<sub>4</sub>↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生白色沉淀。",
    "teacherDescription": "BaSO₄极难溶，Ksp很小。用于钡餐造影。",
    "keyPoints": [
      "极难溶",
      "钡餐造影",
      "不溶于X射线"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "白色", "solubility": "极难溶"}
  }
}
```

##### 方程式142: 硫化铅沉淀

```json
{
  "equationText": "Pb²⁺ + S²⁻ → PbS↓",
  "equationHtml": "Pb<sup>2+</sup> + S<sup>2-</sup> → PbS↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生黑色沉淀。",
    "teacherDescription": "PbS极难溶。黑色颜料。",
    "keyPoints": [
      "黑色沉淀",
      "极难溶"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "黑色", "precipitateDescription": "PbS"}
  }
}
```

##### 方程式143: 硫化铜沉淀

```json
{
  "equationText": "Cu²⁺ + S²⁻ → CuS↓",
  "equationHtml": "Cu<sup>2+</sup> + S<sup>2-</sup> → CuS↓",
  "reactionTypeCode": "PRECIPITATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "溶液中产生黑色沉淀。",
    "teacherDescription": "CuS极难溶，不溶于稀酸。",
    "keyPoints": [
      "黑色沉淀",
      "不溶于酸"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": true, "precipitateColor": "黑色"}
  }
}
```

---

### 4.42 络合反应

#### 4.42.1 配位化合物形成

---

##### 方程式144: 铁离子与硫氰根反应

```json
{
  "equationText": "Fe³⁺ + SCN⁻ → [Fe(SCN)]²⁺",
  "equationHtml": "Fe<sup>3+</sup> + SCN<sup>-</sup> → [Fe(SCN)]<sup>2+</sup>",
  "reactionTypeCode": "COMPLEXATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "铁离子与硫氰酸根反应，溶液变血红色。",
    "teacherDescription": "检验Fe³⁺的灵敏方法。血红色配离子。",
    "keyPoints": [
      "血红色溶液",
      "检验Fe³⁺",
      "络合反应"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "黄色溶液", "after": "血红色溶液"}
  }
}
```

##### 方程式145: 亚铁离子与邻二氮菲反应

```json
{
  "equationText": "Fe²⁺ + 3phen → [Fe(phen)₃]²⁺",
  "equationHtml": "Fe<sup>2+</sup> + 3phen → [Fe(phen)<sub>3</sub>]<sup>2+</sup>",
  "reactionTypeCode": "COMPLEXATION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "亚铁离子与邻二氮菲反应，形成橙红色络合物。",
    "teacherDescription": "检验Fe²⁺的灵敏方法。phen是邻二氮菲。",
    "keyPoints": [
      "橙红色络合物",
      "检验Fe²⁺"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "浅绿色溶液", "after": "橙红色溶液"}
  }
}
```

---

### 4.43 有机金属化合物

#### 4.43.1 格氏试剂

---

##### 方程式146: 格氏试剂的形成

```json
{
  "equationText": "R-X + Mg → RMgX",
  "equationHtml": "R-X + Mg → RMgX",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "无水乙醚", "temperature": "回流"},
  "teachingInfo": {
    "studentDescription": "卤代烃与镁在无水乙醚中反应形成格氏试剂。",
    "teacherDescription": "格氏试剂是有机合成的重要试剂。非常活泼，遇水分解。",
    "keyPoints": [
      "无水条件",
      "重要有机合成试剂",
      "遇水分解"
    ]
  }
}
```

---

### 4.44 高分子化合物

#### 4.44.1 加聚反应

---

##### 方程式147: 聚乙烯的合成

```json
{
  "equationText": "nCH₂=CH₂ → -[CH₂-CH₂]-ₙ",
  "equationHtml": "nCH<sub>2</sub>=CH<sub>2</sub> → -[CH<sub>2</sub>-CH<sub>2</sub>]-<sub>n</sub>",
  "reactionTypeCode": "POLYMERIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "催化剂, 高温高压"},
  "teachingInfo": {
    "studentDescription": "乙烯分子连接成长链，形成聚乙烯。",
    "teacherDescription": "加聚反应。聚乙烯是最常见的塑料之一。",
    "keyPoints": [
      "加聚反应",
      "常见塑料"
    ]
  }
}
```

##### 方程式148: 聚氯乙烯的合成

```json
{
  "equationText": "nCH₂=CHCl → -[CH₂-CHCl]-ₙ",
  "equationHtml": "nCH<sub>2</sub>=CHCl → -[CH<sub>2</sub>-CHCl]-<sub>n</sub>",
  "reactionTypeCode": "POLYMERIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "引发剂"},
  "teachingInfo": {
    "studentDescription": "氯乙烯聚合形成聚氯乙烯。",
    "teacherDescription": "PVC是广泛使用的塑料。含氯，燃烧产生有毒气体。",
    "keyPoints": [
      "PVC塑料",
      "燃烧有毒"
    ]
  }
}
```

##### 方程式149: 聚苯乙烯的合成

```json
{
  "equationText": "nCH₂=CH-C₆H₅ → -[CH₂-CH(C₆H₅)]-ₙ",
  "equationHtml": "nCH<sub>2</sub>=CH-C<sub>6</sub>H<sub>5</sub> → -[CH<sub>2</sub>-CH(C<sub>6</sub>H<sub>5</sub>)]-<sub>n</sub>",
  "reactionTypeCode": "POLYMERIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "苯乙烯聚合形成聚苯乙烯。",
    "teacherDescription": "PS用于包装材料。发泡聚苯乙烯是泡沫塑料。",
    "keyPoints": [
      "PS塑料",
      "泡沫塑料"
    ]
  }
}
```

---

#### 4.44.2 缩聚反应

##### 方程式150: 尼龙-66的合成

```json
{
  "equationText": "nH₂N(CH₂)₆NH₂ + nHOOC(CH₂)₄COOH → -[HN(CH₂)₆NHCO(CH₂)₄CO]-ₙ + 2nH₂O",
  "equationHtml": "nH<sub>2</sub>N(CH<sub>2</sub>)<sub>6</sub>NH<sub>2</sub> + nHOOC(CH<sub>2</sub>)<sub>4</sub>COOH → -[HN(CH<sub>2</sub>)<sub>6</sub>NHCO(CH<sub>2</sub>)<sub>4</sub>CO]-<sub>n</sub> + 2nH<sub>2</sub>O",
  "reactionTypeCode": "CONDENSATION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "己二胺与己二酸缩聚形成尼龙-66。",
    "teacherDescription": "缩聚反应，产生水。尼龙是重要的合成纤维。",
    "keyPoints": [
      "缩聚反应",
      "合成纤维"
    ]
  }
}
```

##### 方程式151: 聚酯的合成

```json
{
  "equationText": "nHOCH₂CH₂OH + nHOOC-C₆H₄-COOH → -[OCH₂CH₂OOC-C₆H₄-CO]-ₙ + 2nH₂O",
  "equationHtml": "nHOCH<sub>2</sub>CH<sub>2</sub>OH + nHOOC-C<sub>6</sub>H<sub>4</sub>-COOH → -[OCH<sub>2</sub>CH<sub>2</sub>OOC-C<sub>6</sub>H<sub>4</sub>-CO]-<sub>n</sub> + 2nH<sub>2</sub>O",
  "reactionTypeCode": "CONDENSATION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "乙二醇与对苯二甲酸缩聚形成聚酯。",
    "teacherDescription": "PET是聚酯纤维和饮料瓶的材料。",
    "keyPoints": [
      "PET材料",
      "饮料瓶"
    ]
  }
}
```

---

### 4.45 更多样品反应

#### 4.45.1 有机氧化

---

##### 方程式152: 甲苯氧化为苯甲酸

```json
{
  "equationText": "C₆H₅CH₃ + 3[O] → C₆H₅COOH + H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>5</sub>CH<sub>3</sub> + 3[O] → C<sub>6</sub>H<sub>5</sub>COOH + H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "KMnO₄或K₂Cr₂O₇"},
  "teachingInfo": {
    "studentDescription": "甲苯侧链被氧化为羧基。",
    "teacherDescription": "烷基苯无论侧链多长，都氧化为羧基。",
    "keyPoints": [
      "侧链氧化",
      "生成苯甲酸"
    ]
  }
}
```

##### 方程式153: 苯酚氧化

```json
{
  "equationText": "C₆H₅OH + [O] → 醌 + H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>5</sub>OH + [O] → 醌 + H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "苯酚容易被氧化。",
    "teacherDescription": "苯酚露置空气中逐渐变粉红色。",
    "keyPoints": [
      "易氧化",
      "空气变粉红色"
    ]
  },
  "knowledgePoints": [
    "苯酚容易被氧化，这是酚类化合物的重要特性之一",
    "反应通式：C₆H₅OH + [O] → 醌 + H₂O（[O]代表氧化剂）",
    "反应类型：氧化反应，也是氧化还原反应",
    "氧化机理：酚羟基使苯环活化，容易被氧化剂氧化",
    "实验现象：苯酚露置空气中会逐渐被氧气氧化，从无色变为粉红色",
    "粉红色原因：苯酚被氧化生成对苯醌等醌类物质，醌类呈粉红色或红色",
    "氧化过程：苯酚 → 苯醌（主要是对苯醌）→ 进一步氧化产物",
    "氧化剂种类：①空气中的氧气 ②酸性KMnO₄溶液 ③K₂Cr₂O₇/H₂SO₄ ④银氨溶液",
    "与KMnO₄反应：苯酚使酸性KMnO₄溶液褪色（被氧化）",
    "与溴水反应：苯酚与浓溴水反应生成三溴苯酚白色沉淀（取代反应）",
    "苯酚的还原性：酚羟基具有还原性，容易被氧化",
    "保存方法：苯酚应保存在棕色瓶中，密封保存（避光、防氧化）",
    "鉴别应用：利用苯酚易被氧化性质，可用KMnO₄鉴别苯酚",
    "实际应用：①抗氧化剂 ②防腐消毒 ③有机合成中间体",
    "高考考点：①酚的氧化性 ②实验现象 ③有机合成 ④结构性质关系",
    "中考考点：①苯酚性质 ②氧化反应概念"
  ]
}
```

---

#### 4.45.2 有机还原

##### 方程式154: 硝基苯还原为苯胺

```json
{
  "equationText": "C₆H₅NO₂ + 3Fe + 6HCl → C₆H₅NH₂ + 3FeCl₂ + 2H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>5</sub>NO<sub>2</sub> + 3Fe + 6HCl → C<sub>6</sub>H<sub>5</sub>NH<sub>2</sub> + 3FeCl<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "硝基苯被还原为苯胺。",
    "teacherDescription": "Fe/HCl是实验室常用还原剂。",
    "keyPoints": [
      "硝基→氨基",
      "还原反应"
    ]
  },
  "knowledgePoints": [
    "硝基苯还原为苯胺是重要的有机还原反应，是制备芳香胺的经典方法",
    "反应方程式：C₆H₅NO₂ + 3Fe + 6HCl → C₆H₅NH₂ + 3FeCl₂ + 2H₂O",
    "反应类型：氧化还原反应（硝基被还原为氨基）",
    "还原机理：-NO₂（硝基）中的氮从+3价降至-3价，得到6个电子转化为-NH₂（氨基）",
    "铁的作用：铁是还原剂，被氧化为Fe²⁺，每个Fe原子失去2个电子",
    "盐酸的作用：提供酸性环境，促进反应进行，同时与产物苯胺结合形成盐",
    "电子转移：N(+3) + 6e⁻ → N(-3)，3×Fe(0) - 6e⁻ → 3×Fe(+2)",
    "实验室方法：铁粉还原法（又称Bechamp还原法）",
    "反应条件：酸性环境（盐酸存在），加热回流",
    "反应装置：回流装置（防止有机物挥发）",
    "产物处理：反应后用碱中和至碱性，使苯胺游离出来，再用水蒸气蒸馏分离",
    "产率：铁粉还原法产率较高（约80%以上）",
    "铁粉优点：价格低廉，反应条件温和，对大多数官能团耐受性好",
    "缺点：产生大量铁盐废液，环境污染严重",
    "其他还原方法：①催化加氢（H₂/Pd） ②Sn/HCl ③Zn/HCl ④LiAlH₄",
    "产物性质：苯胺（无色油状液体，微溶于水，有特殊气味，有毒）",
    "实际应用：①制备染料 ②药物合成 ③橡胶助剂 ④有机合成中间体",
    "高考考点：①氧化还原反应 ②有机合成 ③实验原理 ④方程式书写",
    "安全注意事项：硝基苯和苯胺都有毒，需通风操作；苯胺易被皮肤吸收"
  ]
}
```

---

### 4.46 元素性质变化

#### 4.46.1 同主族递变

---

##### 方程式155: 碱金属与水反应递变

```json
{
  "equationText": "2M + 2H₂O → 2MOH + H₂↑ (M = Li, Na, K, Rb, Cs)",
  "equationHtml": "2M + 2H<sub>2</sub>O → 2MOH + H<sub>2</sub>↑ (M = Li, Na, K, Rb, Cs)",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "碱金属与水反应，产生氢气。",
    "teacherDescription": "从Li到Cs反应越来越剧烈。K, Rb, Cs遇水可能爆炸。",
    "keyPoints": [
      "反应剧烈程度: Li < Na < K < Rb < Cs",
      "熔沸点降低",
      "密度增大"
    ]
  },
  "knowledgePoints": [
    "碱金属与水的反应体现了同主族元素性质的递变规律",
    "反应通式：2M + 2H₂O → 2MOH + H₂↑（M = Li, Na, K, Rb, Cs）",
    "反应类型：置换反应（金属 + 水 → 碱 + 氢气），也是氧化还原反应",
    "反应机理：金属原子失去电子成为M⁺，水中的H⁺得到电子成为H原子再结合成H₂",
    "氧化还原分析：M从0价升至+1价（失电子被氧化），H从+1价降至0价（得电子被还原）",
    "反应剧烈程度递变：Li < Na < K < Rb < Cs（从上到下，金属性增强，反应越来越剧烈）",
    "锂与水：反应较缓慢，锂浮在水面，缓慢游动，产生气泡",
    "钠与水：反应剧烈，钠熔成小球，浮在水面迅速游动，发出嘶嘶声，产生H₂",
    "钾与水：反应更剧烈，钾熔成火球，在水面上剧烈燃烧，产生紫色火焰，可能轻微爆炸",
    "铷、铯与水：反应极剧烈，遇水立即爆炸，具有危险性",
    "实验现象共同点：①浮在水面（密度比水小）②熔成小球（反应放热，熔点低）③游动（气体推动）④发出嘶嘶声",
    "产物性质：MOH都是强碱，碱性递变：LiOH < NaOH < KOH < RbOH < CsOH",
    "元素周期律：同主族元素从上到下，原子半径增大，金属性增强，与水反应更剧烈",
    "实际应用：①制备强碱 ②制备氢气（实验室用钠，工业用电解水）③金属冶炼",
    "安全注意事项：K、Rb、Cs与水反应可能爆炸，操作时必须非常小心",
    "高考考点：①元素周期律 ②同主族性质递变 ③氧化还原反应 ④实验现象",
    "中考考点：①金属与水反应 ②碱金属性质 ③元素周期律初步认识"
  ]
}
```

##### 方程式156: 卤素单质氧化性递变

```json
{
  "equationText": "X₂ + H₂ → 2HX (X = F₂, Cl₂, Br₂, I₂)",
  "equationHtml": "X<sub>2</sub> + H<sub>2</sub> → 2HX (X = F<sub>2</sub>, Cl<sub>2</sub>, Br<sub>2</sub>, I<sub>2</sub>)",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "卤素与氢气反应生成卤化氢。",
    "teacherDescription": "氧化性: F₂ > Cl₂ > Br₂ > I₂。F₂最剧烈，I₂需持续加热。",
    "keyPoints": [
      "氧化性递减",
      "反应条件不同",
      "HX稳定性递减"
    ]
  },
  "knowledgePoints": [
    "卤素单质与氢气的反应体现了卤素氧化性的递变规律",
    "反应通式：X₂ + H₂ → 2HX（X = F, Cl, Br, I）",
    "反应类型：化合反应，也是氧化还原反应",
    "反应机理：卤素单质分子中X-X键断裂，H-H键断裂，生成H-X键",
    "氧化还原分析：X从0价降至-1价（得电子被还原），H从0价升至+1价（失电子被氧化）",
    "氧化性递变规律：F₂ > Cl₂ > Br₂ > I₂（从上到下，非金属性减弱，氧化性减弱）",
    "氟与氢气：F₂ + H₂ → 2HF，低温阴暗处即剧烈反应甚至爆炸，不需要光照或加热",
    "氯与氢气：Cl₂ + H₂ → 2HCl，光照或点燃条件下反应，链式反应（光照下可能发生爆炸）",
    "溴与氢气：Br₂ + H₂ → 2HBr，加热条件下反应，反应速率较慢",
    "碘与氢气：I₂ + H₂ → 2HI，持续高温加热才能反应，且是可逆反应（HI不稳定易分解）",
    "反应条件递变：F₂（低温阴暗）→ Cl₂（光照/点燃）→ Br₂（加热）→ I₂（高温，可逆）",
    "产物稳定性递变：HF > HCl > HBr > HI（键能递减，热稳定性递减）",
    "氟化氢特殊性：HF极稳定，熔沸点异常高（氢键），腐蚀玻璃（SiO₂ + 4HF → SiF₄ + 2H₂O）",
    "卤化氢水溶液：HF、HCl、HBr、HI的水溶液都是酸，酸性递变：HF（弱酸）< HCl < HBr < HI（强酸）",
    "元素周期律：同主族元素从上到下，原子半径增大，非金属性减弱，与氢气反应能力减弱",
    "实际应用：①制备氢卤酸 ②制备卤化氢气体 ③工业合成",
    "安全注意事项：F₂、Cl₂有毒；反应放热，控制条件防止爆炸；HF腐蚀玻璃，需塑料容器",
    "高考考点：①元素周期律 ②氧化性比较 ③反应条件与产物稳定性 ④化学平衡",
    "中考考点：①非金属性质 ②化合反应 ③氢气性质"
  ]
}
```

---

#### 4.46.2 周期律

##### 方程式157: 第三周期元素性质递变

```json
{
  "equationText": "Na > Mg > Al (金属性); Si > P > S > Cl (非金属性)",
  "equationHtml": "Na > Mg > Al (金属性); Si > P > S > Cl (非金属性)",
  "reactionTypeCode": "PERIODIC_TREND",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "同周期从左到右金属性减弱，非金属性增强。",
    "teacherDescription": "第三周期典型例子。Na是活泼金属，Cl是活泼非金属。",
    "keyPoints": [
      "金属性递减",
      "非金属性递增",
      "周期律"
    ]
  }
}
```

---

### 4.47 更多卤素化合物反应

#### 4.47.1 氟化合物

---

##### 方程式158: 氢氟酸与玻璃反应

```json
{
  "equationText": "SiO₂ + 4HF → SiF₄↑ + 2H₂O",
  "equationHtml": "SiO<sub>2</sub> + 4HF → SiF<sub>4</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氢氟酸能腐蚀玻璃。",
    "teacherDescription": "HF不能储存在玻璃容器中。用塑料瓶保存。",
    "keyPoints": [
      "HF腐蚀玻璃",
      "用塑料瓶保存"
    ],
    "safetyNotes": ["HF剧毒", "腐蚀性强"]
  }
}
```

##### 方程式159: 氟化钙与硫酸反应

```json
{
  "equationText": "CaF₂ + H₂SO₄ → CaSO₄ + 2HF↑",
  "equationHtml": "CaF<sub>2</sub> + H<sub>2</sub>SO<sub>4</sub> → CaSO<sub>4</sub> + 2HF↑",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "萤石与浓硫酸反应，产生腐蚀性气体。",
    "teacherDescription": "实验室制HF的方法。在铅皿中进行。",
    "keyPoints": [
      "制HF",
      "铅皿中进行"
    ]
  }
}
```

---

#### 4.47.2 溴和碘化合物

##### 方程式160: 溴化钠与浓硫酸反应

```json
{
  "equationText": "2NaBr + 3H₂SO₄(浓) → 2NaHSO₄ + Br₂↑ + SO₂↑ + 2H₂O",
  "equationHtml": "2NaBr + 3H<sub>2</sub>SO<sub>4</sub>(浓) → 2NaHSO<sub>4</sub> + Br<sub>2</sub>↑ + SO<sub>2</sub>↑ + 2H<sub>2</sub>O",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "溴化钠与浓硫酸反应，产生红棕色气体。",
    "teacherDescription": "浓硫酸有强氧化性，将Br⁻氧化为Br₂。",
    "keyPoints": [
      "浓硫酸氧化Br⁻",
      "产生Br₂"
    ]
  },
  "phenomena": {
    "gasEvolution": {"hasGas": true, "gasDescription": "红棕色气体"}
  }
}
```

##### 方程式161: 碘化氢的分解

```json
{
  "equationText": "2HI ⇌ H₂ + I₂",
  "equationHtml": "2HI ⇌ H<sub>2</sub> + I<sub>2</sub>",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "碘化氢受热分解。",
    "teacherDescription": "HI最不稳定，容易分解。HX稳定性: HF > HCl > HBr > HI。",
    "keyPoints": [
      "HI最不稳定",
      "稳定性递减"
    ]
  }
}
```

##### 方程式162: 碘与淀粉反应

```json
{
  "equationText": "I₂ + 淀粉 → 蓝色配合物",
  "equationHtml": "I<sub>2</sub> + 淀粉 → 蓝色配合物",
  "reactionTypeCode": "COMPLEXATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "碘单质使淀粉变蓝。",
    "teacherDescription": "检验碘的特征反应。淀粉-碘复合物呈蓝色。",
    "keyPoints": [
      "蓝色反应",
      "检验碘的方法"
    ]
  },
  "phenomena": {
    "colorChange": {"before": "无色/白色", "after": "蓝色", "description": "淀粉遇碘变蓝"}
  }
}
```

---

### 4.48 稀有气体化合物

#### 4.48.1 氙化合物

---

##### 方程式163: 氙与氟气反应

```json
{
  "equationText": "Xe + F₂ → XeF₂",
  "equationHtml": "Xe + F<sub>2</sub> → XeF<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "紫外线照射", "pressure": "高压"},
  "teachingInfo": {
    "studentDescription": "氙气与氟气反应生成二氟化氙。",
    "teacherDescription": "稀有气体也能形成化合物。XeF₂是强氧化剂和氟化剂。",
    "keyPoints": [
      "稀有气体化合物",
      "XeF₂是强氧化剂"
    ]
  }
}
```

---

### 4.49 更多酸碱反应

#### 4.49.1 两性氢氧化物

---

##### 方程式164: 氢氧化铝与酸反应

```json
{
  "equationText": "Al(OH)₃ + 3HCl → AlCl₃ + 3H₂O",
  "equationHtml": "Al(OH)<sub>3</sub> + 3HCl → AlCl<sub>3</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "白色沉淀溶于盐酸。",
    "teacherDescription": "Al(OH)₃是两性氢氧化物，既能与酸反应又能与碱反应。",
    "keyPoints": [
      "两性氢氧化物",
      "既溶于酸又溶于碱"
    ]
  },
  "phenomena": {
    "precipitate": {"hasPrecipitate": false, "description": "沉淀溶解"}
  }
}
```

##### 方程式165: 氢氧化铝与碱反应

```json
{
  "equationText": "Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O",
  "equationHtml": "Al(OH)<sub>3</sub> + NaOH → NaAlO<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "白色沉淀溶于氢氧化钠。",
    "teacherDescription": "Al(OH)₃表现酸性，生成偏铝酸钠。",
    "keyPoints": [
      "表现酸性",
      "生成偏铝酸盐"
    ]
  },
  "knowledgePoints": [
    "氢氧化铝是典型的两性氢氧化物，既能与酸反应又能与强碱反应",
    "两性的本质：Al(OH)₃存在两种电离方式（酸式电离和碱式电离）",
    "酸式电离：Al(OH)₃ ⇌ AlO₂⁻ + H⁺ + H₂O（表现酸性，与强碱反应）",
    "与强碱反应：Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O 或 Al(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O",
    "离子方程式：Al(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O",
    "反应现象：白色Al(OH)₃沉淀溶解在强碱溶液中，形成无色溶液",
    "铝三角转化关系：Al³⁺ ⇌ Al(OH)₃ ⇌ AlO₂⁻",
    "注意事项：Al(OH)₃只能与强碱反应，不与弱碱（如氨水）反应",
    "制备氢氧化铝：常用氨水与铝盐反应（避免强碱过量导致沉淀溶解）",
    "两性氢氧化物判断：既能溶于强酸又能溶于强碱的氢氧化物",
    "高考考点：两性氢氧化物性质、铝三角转化、离子方程式书写、图像分析",
    "中考考点：氢氧化铝的两性性质、与酸和碱的反应"
  ],
  "phenomena": {
    "precipitate": {"hasPrecipitate": false, "description": "沉淀溶解"}
  }
}
```

##### 方程式166: 氧化锌与酸反应

```json
{
  "equationText": "ZnO + 2HCl → ZnCl₂ + H₂O",
  "equationHtml": "ZnO + 2HCl → ZnCl<sub>2</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "氧化锌溶于盐酸。",
    "teacherDescription": "ZnO是两性氧化物，既能与酸反应又能与碱反应。",
    "keyPoints": [
      "两性氧化物"
    ]
  },
  "knowledgePoints": [
    "氧化锌是典型的两性氧化物，既能与酸反应又能与强碱反应",
    "两性氧化物的定义：既能与酸反应生成盐和水，又能与碱反应生成盐和水的氧化物",
    "与酸反应：ZnO + 2HCl → ZnCl₂ + H₂O（表现碱性，碱性氧化物的性质）",
    "离子方程式：ZnO + 2H⁺ → Zn²⁺ + H₂O",
    "反应现象：白色ZnO固体溶解在酸中，形成无色溶液",
    "与碱反应：ZnO + 2NaOH → Na₂ZnO₂ + H₂O（表现酸性，酸性氧化物的性质）",
    "ZnO的用途：①橡胶填料 ②防晒霜 ③催化剂 ④医药（收敛剂）",
    "常见两性氧化物：Al₂O₃、ZnO、BeO、PbO等",
    "两性氧化物与两性氢氧化物的关系：两性氧化物对应的水化物往往是两性氢氧化物",
    "中考考点：两性氧化物的概念、氧化锌的性质",
    "高考考点：两性氧化物性质、离子方程式书写"
  ]
}
```

##### 方程式167: 氧化锌与碱反应

```json
{
  "equationText": "ZnO + 2NaOH → Na₂ZnO₂ + H₂O",
  "equationHtml": "ZnO + 2NaOH → Na<sub>2</sub>ZnO<sub>2</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "氧化锌溶于氢氧化钠。",
    "teacherDescription": "ZnO表现酸性，生成锌酸钠。",
    "keyPoints": [
      "表现酸性"
    ]
  },
  "knowledgePoints": [
    "氧化锌是两性氧化物，与强碱反应时表现酸性",
    "两性氧化物的定义：既能与酸反应又能与碱反应生成盐和水的氧化物",
    "与碱反应：ZnO + 2NaOH → Na₂ZnO₂ + H₂O（表现酸性，生成锌酸钠）",
    "反应原理：ZnO作为酸性氧化物与碱反应，类似Al₂O₃与NaOH的反应",
    "锌酸钠也写作Na₂[Zn(OH)₄]（四羟基合锌酸钠），是锌酸盐的一种",
    "反应现象：白色ZnO固体溶解在NaOH溶液中，形成无色溶液",
    "与酸反应对比：ZnO + 2HCl → ZnCl₂ + H₂O（表现碱性）",
    "两性氧化物性质应用：ZnO既能溶于酸也能溶于强碱",
    "常见两性氧化物：Al₂O₃、ZnO、BeO、PbO等",
    "ZnO的用途：①橡胶填料 ②防晒霜（吸收紫外线）③催化剂 ④医药",
    "高考考点：两性氧化物性质、离子方程式书写、无机化合物推断"
  ]
}
```

---

### 4.50 硅及其化合物

#### 4.50.1 硅单质

---

##### 方程式168: 硅与氧气反应

```json
{
  "equationText": "Si + O₂ → SiO₂",
  "equationHtml": "Si + O<sub>2</sub> → SiO<sub>2</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "硅在氧气中燃烧，生成二氧化硅。",
    "teacherDescription": "硅亲氧性强。SiO₂是砂、石英的主要成分。",
    "keyPoints": [
      "亲氧性强",
      "SiO₂是砂的主成分"
    ]
  }
}
```

##### 方程式169: 硅与氢氟酸反应

```json
{
  "equationText": "Si + 4HF → SiF₄↑ + 2H₂↑",
  "equationHtml": "Si + 4HF → SiF<sub>4</sub>↑ + 2H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "硅与氢氟酸反应，产生气体。",
    "teacherDescription": "硅不与一般酸反应，只与HF反应。",
    "keyPoints": [
      "只与HF反应"
    ]
  }
}
```

##### 方程式170: 硅与氢氧化钠反应

```json
{
  "equationText": "Si + 2NaOH + H₂O → Na₂SiO₃ + 2H₂↑",
  "equationHtml": "Si + 2NaOH + H<sub>2</sub>O → Na<sub>2</sub>SiO<sub>3</sub> + 2H<sub>2</sub>↑",
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "硅与强碱反应，产生氢气。",
    "teacherDescription": "硅是半导体，能与强碱反应。",
    "keyPoints": [
      "产生氢气"
    ]
  }
}
```

---

#### 4.50.2 二氧化硅

##### 方程式171: 二氧化硅与氧化钙反应

```json
{
  "equationText": "SiO₂ + CaO → CaSiO₃",
  "equationHtml": "SiO<sub>2</sub> + CaO → CaSiO<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "二氧化硅与氧化钙高温反应。",
    "teacherDescription": "炼铁除脉石反应。生成硅酸钙炉渣。",
    "keyPoints": [
      "炼铁造渣"
    ]
  }
}
```

##### 方程式172: 二氧化硅与碳反应

```json
{
  "equationText": "SiO₂ + 2C → Si + 2CO↑",
  "equationHtml": "SiO<sub>2</sub> + 2C → Si + 2CO↑",
  "reactionTypeCode": "REDOX",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "二氧化硅与碳高温反应，生成硅。",
    "teacherDescription": "工业制粗硅的方法。电弧炉中进行。",
    "keyPoints": [
      "工业制粗硅"
    ]
  }
}
```

---

### 4.51 磷及其化合物

#### 4.51.1 磷单质

---

##### 方程式173: 白磷的缓慢氧化

```json
{
  "equationText": "P₄ + 5O₂ → P₄O₁₀",
  "equationHtml": "P<sub>4</sub> + 5O<sub>2</sub> → P<sub>4</sub>O<sub>10</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "白磷在空气中缓慢氧化，发磷光。",
    "teacherDescription": "白磷在暗处发光。这是自燃的原因。",
    "keyPoints": [
      "暗处发光",
      "易自燃"
    ],
    "safetyNotes": ["白磷剧毒", "保存在水中"]
  },
  "phenomena": {
    "description": "暗处有绿色磷光"
  }
}
```

##### 方程式174: 磷与氯气反应（不足）

```json
{
  "equationText": "2P + 3Cl₂ → 2PCl₃",
  "equationHtml": "2P + 3Cl<sub>2</sub> → 2PCl<sub>3</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "Cl₂不足"},
  "teachingInfo": {
    "studentDescription": "磷在氯气不足时燃烧，生成三氯化磷。",
    "teacherDescription": "PCl₃是液体。可用于制农药。",
    "keyPoints": [
      "Cl₂不足时",
      "PCl₃是液体"
    ]
  },
  "phenomena": {
    "description": "白色烟雾"
  }
}
```

##### 方程式175: 磷与氯气反应（充足）

```json
{
  "equationText": "2P + 5Cl₂ → 2PCl₅",
  "equationHtml": "2P + 5Cl<sub>2</sub> → 2PCl<sub>5</sub>",
  "reactionTypeCode": "COMBINATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "Cl₂充足"},
  "teachingInfo": {
    "studentDescription": "磷在过量氯气中燃烧，生成五氯化磷。",
    "teacherDescription": "PCl₅是固体。PCl₃ + Cl₂ ⇌ PCl₅。",
    "keyPoints": [
      "Cl₂充足时",
      "PCl₅是固体"
    ]
  }
}
```

---

#### 4.51.2 磷酸

##### 方程式176: 磷酸与氢氧化钠反应

```json
{
  "equationText": "H₃PO₄ + 3NaOH → Na₃PO₄ + 3H₂O",
  "equationHtml": "H<sub>3</sub>PO<sub>4</sub> + 3NaOH → Na<sub>3</sub>PO<sub>4</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "磷酸与氢氧化钠中和反应。",
    "teacherDescription": "三元酸，可形成三种盐：磷酸二氢盐、磷酸氢盐、磷酸盐。",
    "keyPoints": [
      "三元酸",
      "三种盐"
    ]
  }
}
```

##### 方程式177: 磷酸二氢钠与氢氧化钠反应

```json
{
  "equationText": "NaH₂PO₄ + 2NaOH → Na₃PO₄ + 2H₂O",
  "equationHtml": "NaH<sub>2</sub>PO<sub>4</sub> + 2NaOH → Na<sub>3</sub>PO<sub>4</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "磷酸二氢钠与碱反应生成磷酸钠。",
    "teacherDescription": "酸式盐与碱反应生成正盐。",
    "keyPoints": [
      "酸式盐→正盐"
    ]
  }
}
```

---

### 4.52 硼及其化合物

#### 4.52.1 硼酸

---

##### 方程式178: 硼砂与盐酸反应

```json
{
  "equationText": "Na₂B₄O₇ + 2HCl + 5H₂O → 4H₃BO₃ + 2NaCl",
  "equationHtml": "Na<sub>2</sub>B<sub>4</sub>O<sub>7</sub> + 2HCl + 5H<sub>2</sub>O → 4H<sub>3</sub>BO<sub>3</sub> + 2NaCl",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "硼砂与盐酸反应生成硼酸。",
    "teacherDescription": "实验室制硼酸的方法。",
    "keyPoints": [
      "制硼酸"
    ]
  }
}
```

##### 方程式179: 硼酸受热分解

```json
{
  "equationText": "2H₃BO₃ → B₂O₃ + 3H₂O",
  "equationHtml": "2H<sub>3</sub>BO<sub>3</sub> → B<sub>2</sub>O<sub>3</sub> + 3H<sub>2</sub>O",
  "reactionTypeCode": "DECOMPOSITION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "conditions": {"temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "硼酸受热脱水生成三氧化二硼。",
    "teacherDescription": "硼酸受热先脱水分解。",
    "keyPoints": [
      "脱水分解"
    ]
  }
}
```

---

### 4.53 金属冶炼反应

#### 4.53.1 铝的冶炼

---

##### 方程式180: 氧化铝电解

```json
{
  "equationText": "2Al₂O₃ → 4Al + 3O₂↑",
  "equationHtml": "2Al<sub>2</sub>O<sub>3</sub> → 4Al + 3O<sub>2</sub>↑",
  "reactionTypeCode": "ELECTROLYSIS",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "电解", "catalyst": "冰晶石", "temperature": "高温"},
  "teachingInfo": {
    "studentDescription": "氧化铝电解生成铝。",
    "teacherDescription": " Hall-Héroult法。冰晶石降低Al₂O₃熔点。",
    "keyPoints": [
      "电解法",
      "冰晶石助熔",
      "高能耗"
    ]
  }
}
```

---

#### 4.53.2 钠的冶炼

##### 方程式181: 氯化钠电解

```json
{
  "equationText": "2NaCl → 2Na + Cl₂↑",
  "equationHtml": "2NaCl → 2Na + Cl<sub>2</sub>↑",
  "reactionTypeCode": "ELECTROLYSIS",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "电解熔融NaCl"},
  "teachingInfo": {
    "studentDescription": "熔融氯化钠电解生成钠和氯气。",
    "teacherDescription": "Downs cell电解法。阳极产Cl₂，阴极产Na。",
    "keyPoints": [
      "电解熔融盐",
      "阳极Cl₂，阴极Na"
    ]
  }
}
```

---

#### 4.53.3 镁的冶炼

##### 方程式182: 氯化镁电解

```json
{
  "equationText": "MgCl₂ → Mg + Cl₂↑",
  "equationHtml": "MgCl<sub>2</sub> → Mg + Cl<sub>2</sub>↑",
  "reactionTypeCode": "ELECTROLYSIS",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "电解熔融MgCl₂"},
  "teachingInfo": {
    "studentDescription": "熔融氯化镁电解生成镁。",
    "teacherDescription": "电解法制镁。从海水中提取Mg。",
    "keyPoints": [
      "海水提镁",
      "电解法"
    ]
  }
}
```

---

### 4.54 更多有机取代反应

#### 4.54.1 卤代反应

---

##### 方程式183: 甲烷氯代（一氯代）

```json
{
  "equationText": "CH₄ + Cl₂ → CH₃Cl + HCl",
  "equationHtml": "CH<sub>4</sub> + Cl<sub>2</sub> → CH<sub>3</sub>Cl + HCl",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "光照"},
  "teachingInfo": {
    "studentDescription": "甲烷与氯气在光照下反应。",
    "teacherDescription": "自由基取代反应。产物复杂，多种氯代物。",
    "keyPoints": [
      "光照引发",
      "自由基反应",
      "产物复杂"
    ]
  }
}
```

##### 方程式184: 苯的硝化

```json
{
  "equationText": "C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>6</sub> + HNO<sub>3</sub> → C<sub>6</sub>H<sub>5</sub>NO<sub>2</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "浓硫酸", "temperature": "50-60℃"},
  "teachingInfo": {
    "studentDescription": "苯与浓硝酸反应生成硝基苯。",
    "teacherDescription": "亲电取代反应。浓硫酸是催化剂和吸水剂。",
    "keyPoints": [
      "亲电取代",
      "水浴加热",
      "淡黄色油状液体"
    ]
  }
}
```

##### 方程式185: 苯的磺化

```json
{
  "equationText": "C₆H₆ + H₂SO₄ → C₆H₅SO₃H + H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>6</sub> + H<sub>2</sub>SO<sub>4</sub> → C<sub>6</sub>H<sub>5</sub>SO<sub>3</sub>H + H<sub>2</sub>O",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "加热"},
  "teachingInfo": {
    "studentDescription": "苯与浓硫酸反应生成苯磺酸。",
    "teacherDescription": "可逆反应。苯磺酸易溶于水。",
    "keyPoints": [
      "可逆反应",
      "产物溶于水"
    ]
  }
}
```

---

### 4.55 有机消除反应

#### 4.55.1 卤代烃消除

---

##### 方程式186: 溴乙烷消除反应

```json
{
  "equationText": "CH₃CH₂Br + NaOH → CH₂=CH₂ + NaBr + H₂O",
  "equationHtml": "CH<sub>3</sub>CH<sub>2</sub>Br + NaOH → CH<sub>2</sub>=CH<sub>2</sub> + NaBr + H<sub>2</sub>O",
  "reactionTypeCode": "ELIMINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "醇溶液, 加热"},
  "teachingInfo": {
    "studentDescription": "溴乙烷与氢氧化钠醇溶液反应，产生乙烯。",
    "teacherDescription": "消除反应（消去反应）。醇溶液条件。与取代反应条件不同。",
    "keyPoints": [
      "消除反应",
      "醇溶液条件",
      "生成烯烃"
    ],
    "commonQuestions": [
      {"question": "与取代反应有什么区别？", "answer": "水溶液是取代（醇），醇溶液是消除（烯烃）。"}
    ]
  }
}
```

##### 方程式187: 2-溴丙烷消除反应

```json
{
  "equationText": "CH₃CHBrCH₃ + NaOH → CH₃CH=CH₂ + NaBr + H₂O",
  "equationHtml": "CH<sub>3</sub>CHBrCH<sub>3</sub> + NaOH → CH<sub>3</sub>CH=CH<sub>2</sub> + NaBr + H<sub>2</sub>O",
  "reactionTypeCode": "ELIMINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "醇溶液, 加热"},
  "teachingInfo": {
    "studentDescription": "2-溴丙烷消除生成丙烯。",
    "teacherDescription": "Zaitsev规则：主要生成取代基较多的烯烃。",
    "keyPoints": [
      "Zaitsev产物",
      "主要产物"
    ]
  }
}
```

---

#### 4.55.2 醇消除

##### 方程式188: 乙醇消除（分子内脱水）

```json
{
  "equationText": "CH₃CH₂OH → CH₂=CH₂ + H₂O",
  "equationHtml": "CH<sub>3</sub>CH<sub>2</sub>OH → CH<sub>2</sub>=CH<sub>2</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "ELIMINATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "浓硫酸, 170℃"},
  "teachingInfo": {
    "studentDescription": "乙醇在浓硫酸催化下170℃脱水生成乙烯。",
    "teacherDescription": "分子内脱水是消除反应。140℃是分子间脱水（醚）。",
    "keyPoints": [
      "170℃消除",
      "140℃取代"
    ]
  }
}
```

##### 方程式189: 乙醇消除（分子间脱水）

```json
{
  "equationText": "2CH₃CH₂OH → CH₃CH₂OCH₂CH₃ + H₂O",
  "equationHtml": "2CH<sub>3</sub>CH<sub>2</sub>OH → CH<sub>3</sub>CH<sub>2</sub>OCH<sub>2</sub>CH<sub>3</sub> + H<sub>2</sub>O",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "浓硫酸, 140℃"},
  "teachingInfo": {
    "studentDescription": "乙醇在浓硫酸催化下140℃脱水生成乙醚。",
    "teacherDescription": "分子间脱水是取代反应。产物是乙醚。",
    "keyPoints": [
      "140℃取代",
      "生成乙醚"
    ]
  }
}
```

---

### 4.56 水解反应

#### 4.56.1 酯水解

---

##### 方程式190: 乙酸乙酯碱性水解

```json
{
  "equationText": "CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH",
  "equationHtml": "CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub> + NaOH → CH<sub>3</sub>COONa + C<sub>2</sub>H<sub>5</sub>OH",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "加热"},
  "teachingInfo": {
    "studentDescription": "乙酸乙酯与氢氧化钠反应，完全水解。",
    "teacherDescription": "碱性水解不可逆。酸根转化为羧酸盐。",
    "keyPoints": [
      "碱性水解不可逆",
      "皂化反应"
    ]
  }
}
```

##### 方程式191: 油脂皂化反应

```json
{
  "equationText": "油脂 + NaOH → 高级脂肪酸钠 + 甘油",
  "equationHtml": "油脂 + NaOH → 高级脂肪酸钠 + 甘油",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "加热"},
  "teachingInfo": {
    "studentDescription": "油脂与碱反应生成肥皂和甘油。",
    "teacherDescription": "皂化反应是油脂碱性水解。制肥皂的方法。",
    "keyPoints": [
      "皂化反应",
      "制肥皂"
    ]
  }
}
```

---

#### 4.56.2 卤代烃水解

##### 方程式192: 氯乙烷水解

```json
{
  "equationText": "CH₃CH₂Cl + H₂O → CH₃CH₂OH + HCl",
  "equationHtml": "CH<sub>3</sub>CH<sub>2</sub>Cl + H<sub>2</sub>O → CH<sub>3</sub>CH<sub>2</sub>OH + HCl",
  "reactionTypeCode": "SUBSTITUTION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "NaOH水溶液"},
  "teachingInfo": {
    "studentDescription": "氯乙烷水解生成乙醇。",
    "teacherDescription": "亲核取代反应。实际用NaOH促进反应。",
    "keyPoints": [
      "亲核取代",
      "NaOH促进"
    ]
  }
}
```

---

#### 4.56.3 糖水解

##### 方程式193: 麦芽糖水解

```json
{
  "equationText": "C₁₂H₂₂O₁₁ + H₂O → 2C₆H₁₂O₆",
  "equationHtml": "C<sub>12</sub>H<sub>22</sub>O<sub>11</sub> + H<sub>2</sub>O → 2C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "稀硫酸或酶", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "麦芽糖水解生成葡萄糖。",
    "teacherDescription": "二糖水解为单糖。麦芽糖是还原性糖。",
    "keyPoints": [
      "二糖→单糖",
      "还原性糖"
    ]
  }
}
```

---

### 4.57 有机氧化还原

#### 4.57.1 醇氧化

---

##### 方程式194: 伯醇氧化为醛

```json
{
  "equationText": "RCH₂OH + [O] → RCHO + H₂O",
  "equationHtml": "RCH<sub>2</sub>OH + [O] → RCHO + H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "Cu或Ag催化", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "伯醇被氧化为醛。",
    "teacherDescription": "伯醇→醛→羧酸。控制氧化程度可停在醛。",
    "keyPoints": [
      "伯醇→醛",
      "可继续氧化"
    ]
  }
}
```

##### 方程式195: 仲醇氧化为酮

```json
{
  "equationText": "R₂CHOH + [O] → R₂C=O + H₂O",
  "equationHtml": "R<sub>2</sub>CHOH + [O] → R<sub>2</sub>C=O + H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "氧化剂"},
  "teachingInfo": {
    "studentDescription": "仲醇被氧化为酮。",
    "teacherDescription": "仲醇氧化生成酮，酮较难继续氧化。",
    "keyPoints": [
      "仲醇→酮",
      "酮较稳定"
    ]
  }
}
```

---

#### 4.57.2 醛氧化

##### 方程式196: 伯醇氧化为羧酸

```json
{
  "equationText": "RCH₂OH + 2[O] → RCOOH + H₂O",
  "equationHtml": "RCH<sub>2</sub>OH + 2[O] → RCOOH + H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "强氧化剂如KMnO₄"},
  "teachingInfo": {
    "studentDescription": "伯醇被完全氧化为羧酸。",
    "teacherDescription": "强氧化条件下，伯醇直接氧化为羧酸。",
    "keyPoints": [
      "完全氧化",
      "生成羧酸"
    ]
  }
}
```

##### 方程式197: 醛氧化为羧酸

```json
{
  "equationText": "RCHO + [O] → RCOOH",
  "equationHtml": "RCHO + [O] → RCOOH",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "high_school",
  "conditions": {"condition": "银氨溶液或新制Cu(OH)₂"},
  "teachingInfo": {
    "studentDescription": "醛被氧化为羧酸。",
    "teacherDescription": "醛有还原性，可被弱氧化剂氧化。",
    "keyPoints": [
      "醛有还原性",
      "检验醛的方法"
    ]
  }
}
```

---

### 4.58 有机酸碱反应

#### 4.58.1 羧酸酸性

---

##### 方程式198: 乙酸与碳酸钠反应

```json
{
  "equationText": "2CH₃COOH + Na₂CO₃ → 2CH₃COONa + CO₂↑ + H₂O",
  "equationHtml": "2CH<sub>3</sub>COOH + Na<sub>2</sub>CO<sub>3</sub> → 2CH<sub>3</sub>COONa + CO<sub>2</sub>↑ + H<sub>2</sub>O",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "middle_school",
  "teachingInfo": {
    "studentDescription": "乙酸与碳酸钠反应，产生气泡。",
    "teacherDescription": "证明乙酸酸性强于碳酸。",
    "keyPoints": [
      "酸性: 乙酸 > 碳酸"
    ]
  },
  "phenomena": {
    "gasEvolution": {"hasGas": true, "gasDescription": "无色气泡"}
  }
}
```

##### 方程式199: 苯酚与碳酸钠反应

```json
{
  "equationText": "C₆H₅OH + Na₂CO₃ → C₆H₅ONa + NaHCO₃",
  "equationHtml": "C<sub>6</sub>H<sub>5</sub>OH + Na<sub>2</sub>CO<sub>3</sub> → C<sub>6</sub>H<sub>5</sub>ONa + NaHCO<sub>3</sub>",
  "reactionTypeCode": "DOUBLE_DISPLACEMENT",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "苯酚与碳酸钠反应生成苯酚钠和碳酸氢钠。",
    "teacherDescription": "苯酚酸性弱于碳酸，只能与Na₂CO₃反应生成NaHCO₃。",
    "keyPoints": [
      "酸性: H₂CO₃ > C₆H₅OH > HCO₃⁻"
    ]
  },
  "knowledgePoints": [
    "苯酚与碳酸钠的反应体现了有机酸与无机酸盐的反应规律",
    "反应方程式：C₆H₅OH + Na₂CO₃ → C₆H₅ONa + NaHCO₃",
    "反应类型：复分解反应（非氧化还原反应）",
    "反应本质：强酸制弱酸（碳酸制苯酚），但苯酚酸性强于碳酸氢根",
    "酸性比较：H₂CO₃(碳酸，K₁=4.3×10⁻⁷) > C₆H₅OH(苯酚，K=1.3×10⁻¹⁰) > HCO₃⁻(碳酸氢根，K₂=5.6×10⁻¹¹)",
    "为什么生成NaHCO₃：苯酚酸性弱于碳酸但强于碳酸氢根，故只能与Na₂CO₃反应生成NaHCO₃",
    "不产生CO₂：反应不产生二氧化碳气体（区别于乙酸与碳酸钠反应）",
    "与乙酸的区别：乙酸酸性强于碳酸，能与Na₂CO₃或NaHCO₃反应生成CO₂",
    "反应现象：苯酚固体逐渐溶解，无明显气体产生",
    "苯酚钠性质：C₆H₅ONa易溶于水，水解显碱性",
    "逆反应：C₆H₅ONa + CO₂ + H₂O → C₆H₅OH + NaHCO₃（向苯酚钠溶液中通入CO₂）",
    "无论CO₂多少，只生成NaHCO₃：不能生成Na₂CO₃（因为苯酚酸性弱于碳酸）",
    "鉴别应用：可用于鉴别苯酚和乙酸（乙酸与碳酸钠反应产生CO₂，苯酚不产生）",
    "除杂应用：可用于除去苯中混有的苯酚（加入NaOH或Na₂CO₃溶液后分液）",
    "实际应用：①制备苯酚钠 ②有机合成 ③酸碱性研究",
    "高考考点：①酸性比较 ②反应规律 ③离子方程式书写 ④有机酸性质",
    "中考考点：①酸性强弱 ②苯酚性质"
  ]
}
```

---

### 4.59 有机加成反应

#### 4.59.1 烯烃加成

---

##### 方程式200: 乙烯与水加成

```json
{
  "equationText": "CH₂=CH₂ + H₂O → CH₃CH₂OH",
  "equationHtml": "CH<sub>2</sub>=CH<sub>2</sub> + H<sub>2</sub>O → CH<sub>3</sub>CH<sub>2</sub>OH",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "浓硫酸", "temperature": "加热加压"},
  "teachingInfo": {
    "studentDescription": "乙烯与水加成生成乙醇。",
    "teacherDescription": "工业制乙醇的方法。间接水合法。",
    "keyPoints": [
      "工业制乙醇",
      "间接水合法"
    ]
  },
  "knowledgePoints": [
    "乙烯与水的加成反应是工业制备乙醇的重要方法之一",
    "反应方程式：CH₂=CH₂ + H₂O → CH₃CH₂OH（条件：浓硫酸催化、加热加压）",
    "反应类型：加成反应，非氧化还原反应",
    "反应机理：C=C双键中的π键断裂，H₂O分子加到双键两端的碳原子上",
    "加成反应特点：原子加到双键两端，无副产物生成",
    "工业制乙醇方法：①乙烯水合法（包括直接水合法和间接水合法）②发酵法",
    "间接水合法（硫酸法）：反应分两步进行",
    "第一步：乙烯与浓硫酸反应生成硫酸氢乙酯（CH₃CH₂OSO₃H）",
    "第二步：硫酸氢乙酯水解生成乙醇和硫酸",
    "直接水合法：乙烯与水蒸气在催化剂（磷酸/硅藻土）作用下直接加成",
    "反应条件：高温（约300℃）、高压（约7MPa）、催化剂存在",
    "间接水合法优点：反应条件相对温和，设备要求较低",
    "间接水合法缺点：硫酸腐蚀设备，产生废酸，污染环境",
    "直接水合法优点：无腐蚀，无污染，是现代工业主要方法",
    "产物性质：乙醇（无色有香味液体，与水任意比互溶）",
    "实际应用：①工业制备乙醇 ②有机合成原料",
    "高考考点：①加成反应机理 ②工业制乙醇方法 ③反应条件 ④有机方程式书写",
    "中考考点：①加成反应概念 ②乙烯性质"
  ]
}
```

##### 方程式201: 乙烯与卤化氢加成

```json
{
  "equationText": "CH₂=CH₂ + HBr → CH₃CH₂Br",
  "equationHtml": "CH<sub>2</sub>=CH<sub>2</sub> + HBr → CH<sub>3</sub>CH<sub>2</sub>Br",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "乙烯与溴化氢加成。",
    "teacherDescription": "Markovnikov规则：H加在H多的碳上（对称烯烃无选择）。",
    "keyPoints": [
      "Markovnikov规则"
    ]
  },
  "knowledgePoints": [
    "乙烯与溴化氢的加成反应是典型的烯烃亲电加成反应",
    "反应方程式：CH₂=CH₂ + HBr → CH₃CH₂Br（溴乙烷）",
    "反应类型：加成反应，非氧化还原反应",
    "反应机理：亲电加成反应，HBr中的H⁺先进攻双键，Br⁻再加到碳正离子上",
    "反应特点：C=C双键中的π键断裂，H和Br分别加到双键两端的碳原子上",
    "马氏规则（Markovnikov规则）：不对称烯烃与不对称试剂加成时，氢原子加到含氢较多的碳上",
    "对于乙烯：乙烯是对称烯烃，两个碳原子各有一个氢，故加成产物只有一种（溴乙烷）",
    "不对称烯烃示例：丙烯(CH₃CH=CH₂) + HBr → CH₃CHBrCH₃（2-溴丙烷，不是1-溴丙烷）",
    "反应条件：通常在室温或低温下进行，不需要催化剂",
    "产物性质：溴乙烷（无色液体，不溶于水，有刺激性气味）",
    "卤代烃用途：①有机合成中间体 ②溶剂 ③灭火剂（部分）",
    "与乙烯和溴加成的区别：乙烯与Br₂加成生成1,2-二溴乙烷(C₂H₄Br₂)，与HBr加成生成溴乙烷(C₂H₅Br)",
    "加成反应通式：烯烃 + HX → 卤代烃（X = Cl, Br, I）",
    "实验现象：气体通入溴化氢溶液中，被吸收，无明显可见变化（产物是无色液体）",
    "高考考点：①马氏规则 ②加成反应机理 ③有机方程式书写 ④区域选择性",
    "中考考点：①加成反应概念 ②乙烯性质"
  ]
}
```

##### 方程式202: 丙烯与HBr加成（反马氏）

```json
{
  "equationText": "CH₃CH=CH₂ + HBr → CH₃CH₂CH₂Br (过氧化物存在)",
  "equationHtml": "CH<sub>3</sub>CH=CH<sub>2</sub> + HBr → CH<sub>3</sub>CH<sub>2</sub>CH<sub>2</sub>Br (过氧化物存在)",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "过氧化物存在"},
  "teachingInfo": {
    "studentDescription": "过氧化物存在下，HBr反马氏加成。",
    "teacherDescription": "过氧化物效应，只有HBr有此现象。",
    "keyPoints": [
      "反马氏加成",
      "只有HBr"
    ]
  }
}
```

---

#### 4.59.2 炔烃加成

##### 方程式203: 乙炔与氢气加成

```json
{
  "equationText": "CH≡CH + 2H₂ → CH₃CH₃",
  "equationHtml": "CH≡CH + 2H<sub>2</sub> → CH<sub>3</sub>CH<sub>3</sub>",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "Ni"},
  "teachingInfo": {
    "studentDescription": "乙炔与氢气加成生成乙烷。",
    "teacherDescription": "分步加成：先加成乙烯，再加成乙烷。",
    "keyPoints": [
      "分步加成"
    ]
  }
}
```

##### 方程式204: 乙炔与水加成

```json
{
  "equationText": "CH≡CH + H₂O → CH₃CHO",
  "equationHtml": "CH≡CH + H<sub>2</sub>O → CH<sub>3</sub>CHO",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "HgSO₄, H₂SO₄"},
  "teachingInfo": {
    "studentDescription": "乙炔与水加成生成乙醛。",
    "teacherDescription": "乙烯醇互变异构为乙醛。",
    "keyPoints": [
      "生成乙醛",
      "互变异构"
    ]
  }
}
```

##### 方程式205: 乙炔与氯化氢加成

```json
{
  "equationText": "CH≡CH + HCl → CH₂=CHCl",
  "equationHtml": "CH≡CH + HCl → CH<sub>2</sub>=CHCl",
  "reactionTypeCode": "ADDITION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "conditions": {"catalyst": "HgCl₂"},
  "teachingInfo": {
    "studentDescription": "乙炔与氯化氢加成生成氯乙烯。",
    "teacherDescription": "氯乙烯是聚氯乙烯的单体。",
    "keyPoints": [
      "制PVC单体"
    ]
  }
}
```

---

### 4.60 芳香族化合物

#### 4.60.1 苯的同系物

---

##### 方程式206: 甲苯燃烧

```json
{
  "equationText": "C₆H₅CH₃ + 9O₂ → 7CO₂ + 4H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>5</sub>CH<sub>3</sub> + 9O<sub>2</sub> → 7CO<sub>2</sub> + 4H<sub>2</sub>O",
  "reactionTypeCode": "COMBUSTION",
  "isRedox": true,
  "difficultyLevel": "middle_school",
  "conditions": {"condition": "点燃"},
  "teachingInfo": {
    "studentDescription": "甲苯在氧气中燃烧。",
    "teacherDescription": "含碳量高，燃烧时产生浓烟。",
    "keyPoints": [
      "含碳量高",
      "浓烟"
    ]
  },
  "phenomena": {
    "description": "燃烧时产生浓烟"
  }
}
```

##### 方程式207: 二甲苯氧化

```json
{
  "equationText": "C₆H₄(CH₃)₂ + 6[O] → C₆H₄(COOH)₂ + 2H₂O",
  "equationHtml": "C<sub>6</sub>H<sub>4</sub>(CH<sub>3</sub>)<sub>2</sub> + 6[O] → C<sub>6</sub>H<sub>4</sub>(COOH)<sub>2</sub> + 2H<sub>2</sub>O",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "二甲苯侧链氧化为羧基。",
    "teacherDescription": "无论几个侧链，都氧化为羧基。",
    "keyPoints": [
      "侧链全氧化"
    ]
  }
}
```

---

### 4.61 含氮有机化合物

#### 4.61.1 胺

---

##### 方程式208: 甲胺与盐酸反应

```json
{
  "equationText": "CH₃NH₂ + HCl → CH₃NH₃⁺Cl⁻",
  "equationHtml": "CH<sub>3</sub>NH<sub>2</sub> + HCl → CH<sub>3</sub>NH<sub>3</sub><sup>+</sup>Cl<sup>-</sup>",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "teachingInfo": {
    "studentDescription": "甲胺与盐酸反应生成盐。",
    "teacherDescription": "胺是碱性有机物，能与酸成盐。",
    "keyPoints": [
      "胺有碱性",
      "与酸成盐"
    ]
  }
}
```

##### 方程式209: 苯胺的碱性

```json
{
  "equationText": "C₆H₅NH₂ + HCl → C₆H₅NH₃⁺Cl⁻",
  "equationHtml": "C<sub>6</sub>H<sub>5</sub>NH<sub>2</sub> + HCl → C<sub>6</sub>H<sub>5</sub>NH<sub>3</sub><sup>+</sup>Cl<sup>-</sup>",
  "reactionTypeCode": "NEUTRALIZATION",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "苯胺与盐酸反应。",
    "teacherDescription": "苯胺碱性很弱，pKb≈9.4。",
    "keyPoints": [
      "弱碱性"
    ]
  }
}
```

---

#### 4.61.2 酰胺

##### 方程式210: 乙酰胺水解

```json
{
  "equationText": "CH₃CONH₂ + H₂O → CH₃COOH + NH₃",
  "equationHtml": "CH<sub>3</sub>CONH<sub>2</sub> + H<sub>2</sub>O → CH<sub>3</sub>COOH + NH<sub>3</sub>",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "酸或碱催化", "temperature": "加热"},
  "teachingInfo": {
    "studentDescription": "乙酰胺水解生成乙酸和氨。",
    "teacherDescription": "酰胺水解生成羧酸和胺。",
    "keyPoints": [
      "生成羧酸和胺"
    ]
  }
}
```

---

### 4.62 杂环化合物

#### 4.62.1 呋喃系

---

##### 方程式211: 糠醛氧化

```json
{
  "equationText": "C₄H₃OCHO + [O] → C₄H₃OCOOH",
  "equationHtml": "C<sub>4</sub>H<sub>3</sub>OCHO + [O] → C<sub>4</sub>H<sub>3</sub>OCOOH",
  "reactionTypeCode": "OXIDATION",
  "isRedox": true,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "糠醛被氧化为糠酸。",
    "teacherDescription": "糠醛是呋喃衍生物，来自农副产品。",
    "keyPoints": [
      "呋喃衍生物"
    ]
  }
}
```

---

### 4.63 生物分子

#### 4.63.1 核酸

---

##### 方程式212: DNA水解（简化）

```json
{
  "equationText": "DNA → 核苷酸 → 磷酸 + 戊糖 + 碱基",
  "equationHtml": "DNA → 核苷酸 → 磷酸 + 戊糖 + 碱基",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "conditions": {"condition": "酶催化"},
  "teachingInfo": {
    "studentDescription": "DNA逐步水解。",
    "teacherDescription": "DNA完全水解产生磷酸、脱氧核糖和碱基。",
    "keyPoints": [
      "逐步水解",
      "三种产物"
    ]
  }
}
```

---

#### 4.63.2 ATP

##### 方程式213: ATP水解释放能量

```json
{
  "equationText": "ATP + H₂O → ADP + Pi + 能量",
  "equationHtml": "ATP + H<sub>2</sub>O → ADP + P<sub>i</sub> + 能量",
  "reactionTypeCode": "HYDROLYSIS",
  "isRedox": false,
  "difficultyLevel": "high_school",
  "enthalpyChange": -30.5,
  "teachingInfo": {
    "studentDescription": "ATP水解释放能量。",
    "teacherDescription": "ATP是细胞能量货币。ΔG ≈ -30.5 kJ/mol。",
    "keyPoints": [
      "能量货币",
      "ΔG ≈ -30.5 kJ/mol"
    ]
  }
}
```

---

### 4.64 放射性衰变（简述）

#### 4.64.1 α衰变

---

##### 方程式214: 铀-238 α衰变

```json
{
  "equationText": "²³⁸U → ²³⁴Th + ⁴He",
  "equationHtml": "<sup>238</sup>U → <sup>234</sup>Th + <sup>4</sup>He",
  "reactionTypeCode": "ALPHA_DECAY",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "铀-238衰变释放α粒子。",
    "teacherDescription": "α粒子是氦核。衰变后质量数减4，质子数减2。",
    "keyPoints": [
      "α粒子=⁴He",
      "质量数-4, 质子数-2"
    ]
  }
}
```

---

#### 4.64.2 β衰变

##### 方程式215: 碳-14 β衰变

```json
{
  "equationText": "¹⁴C → ¹⁴N + ⁰e",
  "equationHtml": "<sup>14</sup>C → <sup>14</sup>N + <sup>0</sup>e",
  "reactionTypeCode": "BETA_DECAY",
  "isRedox": false,
  "difficultyLevel": "advanced",
  "teachingInfo": {
    "studentDescription": "碳-14衰变释放β粒子。",
    "teacherDescription": "β粒子是电子。中子转变为质子。",
    "keyPoints": [
      "β粒子=电子",
      "中子→质子"
    ]
  }
}
```

---

## 附录A：物质库参考ID

### 金属物质ID

| ID | 名称 | 化学式 | 颜色 |
|----|------|--------|------|
| 1 | 锌 | Zn | 银灰色 |
| 2 | 铁 | Fe | 银白色 |
| 3 | 钠 | Na | 银白色 |
| 4 | 镁 | Mg | 银白色 |
| 5 | 铝 | Al | 银白色 |
| 6 | 铜 | Cu | 紫红色 |
| 7 | 银 | Ag | 银白色 |
| 8 | 金 | Au | 金黄色 |
| 9 | 钙 | Ca | 银白色 |
| 10 | 钡 | Ba | 银白色 |

### 非金属物质ID

| ID | 名称 | 化学式 | 状态 |
|----|------|--------|------|
| 20 | 氢气 | H₂ | 气体 |
| 21 | 氧气 | O₂ | 气体 |
| 22 | 氯气 | Cl₂ | 气体 |
| 23 | 碳 | C | 固体 |
| 24 | 硫 | S | 固体 |
| 28 | 二氧化碳 | CO₂ | 气体 |

### 酸类物质ID

| ID | 名称 | 化学式 |
|----|------|--------|
| 30 | 稀硫酸 | H₂SO₄ |
| 31 | 浓硫酸 | H₂SO₄(浓) |
| 32 | 盐酸 | HCl |
| 33 | 硝酸 | HNO₃ |
| 34 | 醋酸 | CH₃COOH |

### 碱类物质ID

| ID | 名称 | 化学式 |
|----|------|--------|
| 40 | 氢氧化钠 | NaOH |
| 41 | 氢氧化钾 | KOH |
| 42 | 氢氧化钙 | Ca(OH)₂ |
| 43 | 氢氧化钡 | Ba(OH)₂ |

### 盐类物质ID

| ID | 名称 | 化学式 |
|----|------|--------|
| 50 | 氯化钠 | NaCl |
| 51 | 硫酸锌 | ZnSO₄ |
| 52 | 硫酸亚铁 | FeSO₄ |
| 53 | 硫酸铜 | CuSO₄ |
| 55 | 硫酸钡 | BaSO₄ |
| 57 | 氯化银 | AgCl |
| 58 | 氯化钙 | CaCl₂ |
| 59 | 碳酸钙 | CaCO₃ |
| 66 | 氯化亚铁 | FeCl₂ |
| 85 | 硫酸钠 | Na₂SO₄ |
| 86 | 硫酸镁 | MgSO₄ |
| 87 | 氯化钾 | KCl |
| 88 | 氯化锰 | MnCl₂ |

### 氧化物物质ID

| ID | 名称 | 化学式 |
|----|------|--------|
| 100 | 氧化铁 | Fe₂O₃ |
| 101 | 氯化铁 | FeCl₃ |
| 102 | 氧化铜 | CuO |

### 其他物质ID

| ID | 名称 | 化学式 |
|----|------|--------|
| 103 | 碳酸钠 | Na₂CO₃ |
| 104 | 碳酸氢钠 | NaHCO₃ |
| 105 | 氯化铵 | NH₄Cl |
| 106 | 氨气 | NH₃ |

---

## 附录B：反应类型速查表

| 反应类型 | 通用形式 | 关键特征 | 典型示例 |
|----------|----------|----------|----------|
| 化合反应 | A + B → AB | 多变一 | 2H₂ + O₂ → 2H₂O |
| 分解反应 | AB → A + B | 一变多 | 2H₂O₂ → 2H₂O + O₂↑ |
| 置换反应 | A + BC → AC + B | 单质换单质 | Zn + H₂SO₄ → ZnSO₄ + H₂↑ |
| 复分解反应 | AB + CD → AD + CB | 成分交换 | AgNO₃ + HCl → AgCl↓ + HNO₃ |
| 氧化还原反应 | 电子转移 | 氧化数变化 | 2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O |
| 燃烧反应 | 燃料 + O₂ | 发光发热 | 2H₂ + O₂ → 2H₂O |
| 中和反应 | 酸 + 碱 → 盐 + 水 | 生成水 | HCl + NaOH → NaCl + H₂O |
| 沉淀反应 | 离子结合 | 生成难溶物 | BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl |

---

## 附录C：金属活动性顺序表

```
K  Ca  Na  Mg  Al  Zn  Fe  Sn  Pb  (H)  Cu  Hg  Ag  Pt  Au
└─────────────────── 活泼金属 ─────────────────┘   └─ 不活泼金属 ─┘
    │                                                 │
    └─ 能置换酸中的氢 ───────────────────────────────┘
    │
    └─ 能把后面的金属从盐溶液中置换出来 ──────────────┘
```

**应用**:
1. 判断金属能否与酸反应生成氢气
2. 判断金属能否与盐溶液发生置换反应
3. 判断反应的剧烈程度

---

## 附录D：酸碱盐溶解性表

| 阴离子/阳离子 | OH⁻ | Cl⁻ | SO₄²⁻ | CO₃²⁻ |
|---------------|-----|-----|-------|-------|
| H⁺ | - | 溶 | 溶 | 溶、挥 |
| Na⁺ | 溶 | 溶 | 溶 | 溶 |
| K⁺ | 溶 | 溶 | 溶 | 溶 |
| Ba²⁺ | 溶 | 溶 | 不溶 | 不溶 |
| Ca²⁺ | 微溶 | 溶 | 微溶 | 不溶 |
| Ag⁺ | - | 不溶 | 微溶 | 不溶 |
| Cu²⁺ | 不溶 | 溶 | 溶 | - |

注: "溶"表示可溶，"不溶"表示难溶，"微溶"表示微溶，"挥"表示易挥发

---

## 附录E：常见离子检验方法

| 离子 | 检验方法 | 现象 |
|------|----------|------|
| H⁺ | 紫色石蕊试液 | 变红 |
| OH⁻ | 无色酚酞试液 | 变红 |
| Cl⁻ | AgNO₃溶液 + 稀HNO₃ | 白色沉淀，不溶于酸 |
| SO₄²⁻ | BaCl₂溶液 + 稀HNO₃ | 白色沉淀，不溶于酸 |
| CO₃²⁻ | 稀盐酸 + 澄清石灰水 | 产生气泡，石灰水变浑浊 |
| NH₄⁺ | NaOH溶液 + 红色石蕊试纸 | 产生刺激性气体，试纸变蓝 |
| Cu²⁺ | NaOH溶液 | 蓝色沉淀 |
| Fe³⁺ | NaOH溶液 | 红褐色沉淀 |
| Fe²⁺ | NaOH溶液 | 白色→灰绿色→红褐色沉淀 |

---

## 附录F：常见化学方程式速查表

### 金属与酸反应

| 金属 | 与盐酸反应 | 与稀硫酸反应 |
|------|------------|--------------|
| Mg | Mg + 2HCl → MgCl₂ + H₂↑ | Mg + H₂SO₄ → MgSO₄ + H₂↑ |
| Al | 2Al + 6HCl → 2AlCl₃ + 3H₂↑ | 2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂↑ |
| Zn | Zn + 2HCl → ZnCl₂ + H₂↑ | Zn + H₂SO₄ → ZnSO₄ + H₂↑ |
| Fe | Fe + 2HCl → FeCl₂ + H₂↑ | Fe + H₂SO₄ → FeSO₄ + H₂↑ |

### 金属氧化物与酸反应

| 氧化物 | 与盐酸反应 | 与硫酸反应 |
|--------|------------|------------|
| Na₂O | Na₂O + 2HCl → 2NaCl + H₂O | Na₂O + H₂SO₄ → Na₂SO₄ + H₂O |
| CaO | CaO + 2HCl → CaCl₂ + H₂O | CaO + H₂SO₄ → CaSO₄ + H₂O |
| CuO | CuO + 2HCl → CuCl₂ + H₂O | CuO + H₂SO₄ → CuSO₄ + H₂O |
| Fe₂O₃ | Fe₂O₃ + 6HCl → 2FeCl₃ + 3H₂O | Fe₂O₃ + 3H₂SO₄ → Fe₂(SO₄)₃ + 3H₂O |

### 实验室制气

| 气体 | 反应原理 | 收集方法 |
|------|----------|----------|
| O₂ | 2H₂O₂ → 2H₂O + O₂↑ (MnO₂催化) | 排水法 |
| O₂ | 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑ (加热) | 排水法 |
| CO₂ | CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O | 向上排空气法 |
| H₂ | Zn + H₂SO₄ → ZnSO₄ + H₂↑ | 排水法 |
| NH₃ | 2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O (加热) | 向下排空气法 |
| Cl₂ | MnO₂ + 4HCl(浓) → MnCl₂ + Cl₂↑ + 2H₂O (加热) | 向上排空气法 |

### 钠及其化合物转化

```
Na → Na₂O → Na₂O₂ → NaOH → Na₂CO₃ → NaHCO₃
  ↓ O₂     ↓ O₂     ↓ H₂O           ↓ CO₂ + H₂O
 Na₂O    Na₂O₂    NaOH            NaHCO₃
```

**关键方程式**:
- 4Na + O₂ → 2Na₂O
- 2Na + O₂ → Na₂O₂
- 2Na₂O₂ + 2H₂O → 4NaOH + O₂↑
- 2NaOH + CO₂ → Na₂CO₃ + H₂O
- Na₂CO₃ + CO₂ + H₂O → 2NaHCO₃
- 2NaHCO₃ → Na₂CO₃ + CO₂↑ + H₂O (加热)

### 铝三角转化

```
    Al³⁺
    ↕ ↑
Al(OH)₃ ⇌ AlO₂⁻
```

**关键方程式**:
- Al³⁺ + 3OH⁻ → Al(OH)₃↓
- Al(OH)₃ + 3H⁺ → Al³⁺ + 3H₂O
- Al(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O
- AlO₂⁻ + H⁺ + H₂O → Al(OH)₃↓
- AlO₂⁻ + 4H⁺ → Al³⁺ + 2H₂O

### 铁及其化合物转化

```
Fe → Fe²⁺ → Fe³⁺
 ↓      ↓      ↓
FeO    Fe(OH)₂  Fe(OH)₃
```

**关键方程式**:
- 2Fe + 3Cl₂ → 2FeCl₃
- Fe + 2HCl → FeCl₂ + H₂↑
- 2FeCl₂ + Cl₂ → 2FeCl₃
- Fe²⁺ + 2OH⁻ → Fe(OH)₂↓
- Fe³⁺ + 3OH⁻ → Fe(OH)₃↓
- 4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃

### 氮及其化合物转化

```
N₂ → NH₃ → NO → NO₂ → HNO₃
        ↓
      NH₄⁺
```

**关键方程式**:
- N₂ + 3H₂ ⇌ 2NH₃ (高温高压催化剂)
- 4NH₃ + 5O₂ → 4NO + 6H₂O (催化氧化)
- 2NO + O₂ → 2NO₂
- 3NO₂ + H₂O → 2HNO₃ + NO
- NH₃ + HCl → NH₄Cl
- NH₄Cl + NaOH → NaCl + NH₃↑ + H₂O

### 硫及其化合物转化

```
S → SO₂ → SO₃ → H₂SO₄
      ↓
      H₂SO₃
```

**关键方程式**:
- S + O₂ → SO₂
- 2SO₂ + O₂ ⇌ 2SO₃ (催化剂加热)
- SO₃ + H₂O → H₂SO₄
- SO₂ + H₂O ⇌ H₂SO₃
- SO₂ + 2NaOH → Na₂SO₃ + H₂O

---

## 附录G：化学反应条件汇总

### 点燃

- 氢气燃烧: 2H₂ + O₂ → 2H₂O
- 镁条燃烧: 2Mg + O₂ → 2MgO
- 铁丝燃烧: 3Fe + 2O₂ → Fe₃O₄
- 硫燃烧: S + O₂ → SO₂
- 红磷燃烧: 4P + 5O₂ → 2P₂O₅
- 甲烷燃烧: CH₄ + 2O₂ → CO₂ + 2H₂O

### 加热

- 碳酸钙分解: CaCO₃ → CaO + CO₂↑
- 碳酸氢钠分解: 2NaHCO₃ → Na₂CO₃ + CO₂↑ + H₂O
- 氯酸钾分解: 2KClO₃ → 2KCl + 3O₂↑
- 高锰酸钾分解: 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑
- 铵盐分解: NH₄Cl → NH₃↑ + HCl↑
- 氨催化氧化: 4NH₃ + 5O₂ → 4NO + 6H₂O

### 催化剂

- 过氧化氢分解: 2H₂O₂ → 2H₂O + O₂↑ (MnO₂)
- 二氧化硫转化: 2SO₂ + O₂ ⇌ 2SO₃ (V₂O₅)
- 氨合成: N₂ + 3H₂ ⇌ 2NH₃ (Fe)
- 酯化反应: 酸 + 醇 ⇌ 酯 + 水 (浓硫酸)

### 高温

- 工业制石灰: CaCO₃ → CaO + CO₂↑
- 炼铁: Fe₂O₃ + 3CO → 2Fe + 3CO₂

### 通电

- 水电解: 2H₂O → 2H₂↑ + O₂↑

---

## 附录H：常见化学方程式配平技巧

### 最小公倍数法

适用于简单的氧化还原反应。

**示例**: CO + Fe₂O₃ → Fe + CO₂

1. 找出变价元素: C(+2→+4), Fe(+3→0)
2. 确定变化: C升高2, Fe降低3
3. 最小公倍数: 6
4. 配平: 3CO + Fe₂O₃ → 2Fe + 3CO₂

### 观察法

适用于简单的化合、分解反应。

**示例**: Fe + O₂ → Fe₃O₄

1. 观察Fe原子: 左1右3，Fe前配3
2. 观察O原子: 右4左2，O₂前配2
3. 结果: 3Fe + 2O₂ → Fe₃O₄

### 奇偶配平法

适用于出现奇数个原子的反应。

**示例**: C₂H₆ + O₂ → CO₂ + H₂O

1. O在右边都是偶数，左边O₂也是偶数
2. 先配C: C₂H₆ + O₂ → 2CO₂ + H₂O
3. H左边6，右边H₂O配3: C₂H₆ + O₂ → 2CO₂ + 3H₂O
4. 数O: 右边7, 左边O₂配7/2: C₂H₆ + 7/2O₂ → 2CO₂ + 3H₂O
5. 去分数: 2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O

### 电子得失守恒法

适用于复杂的氧化还原反应。

**示例**: MnO₂ + HCl → MnCl₂ + Cl₂ + H₂O

1. 标变价: Mn(+4→+2), Cl(-1→0)
2. 计算得失电子: Mn得2e⁻, Cl失1e⁻
3. 最小公倍数2: 1个Mn, 2个Cl
4. 配平: MnO₂ + 4HCl → MnCl₂ + Cl₂ + 2H₂O

---

## 附录I：化学反应分类表

### 按反应形式分类

| 类型 | 定义 | 通式 | 示例 |
|------|------|------|------|
| 化合反应 | 两种或以上生成一种 | A+B→AB | 2H₂+O₂→2H₂O |
| 分解反应 | 一种生成两种或以上 | AB→A+B | CaCO₃→CaO+CO₂↑ |
| 置换反应 | 单质+化合物→新单质+新化合物 | A+BC→AC+B | Zn+H₂SO₄→ZnSO₄+H₂↑ |
| 复分解反应 | 两种化合物交换成分 | AB+CD→AD+CB | AgNO₃+HCl→AgCl↓+HNO₃ |

### 按电子转移分类

| 类型 | 定义 | 判断依据 | 示例 |
|------|------|----------|------|
| 氧化还原反应 | 有电子转移 | 化合价变化 | 2Na+Cl₂→2NaCl |
| 非氧化还原反应 | 无电子转移 | 化合价不变 | HCl+NaOH→NaCl+H₂O |

### 按热效应分类

| 类型 | 定义 | ΔH符号 | 示例 |
|------|------|--------|------|
| 放热反应 | 放出热量 | ΔH<0 | 2H₂+O₂→2H₂O |
| 吸热反应 | 吸收热量 | ΔH>0 | CaCO₃→CaO+CO₂↑ |

### 按反应关系分类（副反应类型）

| 类型 | 定义 | 典型特征 | 示例 |
|------|------|----------|------|
| 平行反应 | 同一反应物多条路径 | 产物为混合物 | 甲苯硝化（邻/间/对） |
| 连串反应 | 产物继续反应 | 中间产物存在 | 乙醇→乙醛→乙酸 |
| 竞争反应 | 不同反应物竞争试剂 | 相对速率决定产物 | Cl₂与Fe/Fe²⁺ |
| 链式反应 | 引发连续反应 | 自由基机制 | 烷烃卤代 |
| 侧反应 | 次要反应路径 | 影响产物纯度 | CO₂与水的反应 |
| 干扰反应 | 影响主反应观察 | 现象被掩盖 | 金属杂质反应 |

### 常见副反应处理方法

| 问题 | 处理方法 | 示例 |
|------|----------|------|
| 现象干扰 | 对照实验 | 空白实验 |
| 气体杂质 | 洗气装置 | 饱和NaHCO₃洗CO₂中的HCl |
| 副产物抑制 | 控制条件 | 温度、浓度、催化剂选择 |
| 产物不纯 | 分离提纯 | 蒸馏、重结晶 |

---

## 附录J：特殊反应现象汇总

| 现象 | 描述 | 典型反应 |
|------|------|----------|
| 发光 | 燃烧时发光 | 镁在O₂中燃烧 |
| 放热 | 试管壁发烫 | 金属与酸反应 |
| 产生气体 | 冒气泡 | 金属与酸反应 |
| 产生沉淀 | 溶液变浑浊 | BaCl₂+H₂SO₄ |
| 颜色改变 | 溶液颜色变化 | CuSO₄+Fe→FeSO₄+Cu |
| 白烟 | 固体小颗粒 | NH₃+HCl |
| 白雾 | 液体小液滴 | 浓盐酸露置空气中 |
| 爆炸 | 急剧反应 | H₂+O₂点燃 |
| 浮熔游响红 | 钠与水反应现象 | 2Na+2H₂O→2NaOH+H₂↑ |

---

## 结语

本文档基于chemist-analyst技能，系统地整理了K12阶段涉及的主要化学方程式及相关知识点。每个方程式都包含了完整的反应机理、热力学分析、动力学特征、实验现象和教学信息，可作为化学教育的参考资料。

**文档结构说明**:
- 数据结构严格遵循项目现有的API定义
- 教学信息参考项目现有的reactionKnowledge.js
- 物质信息参考项目现有的substanceLibrary.js

**使用建议**:
1. 可直接将本文档中的JSON数据导入数据库
2. 根据教学需要增删方程式条目
3. 结合虚拟实验模块进行可视化展示

---

*文档生成时间: 2026年*
*基于项目: mtedu-vue3-poroseye*
