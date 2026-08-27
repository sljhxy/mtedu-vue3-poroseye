# 化学反应模拟API接口文档

## 概述

化学反应模拟服务提供类似NOBOOK虚拟实验平台的化学反应模拟功能，根据输入的反应物和条件，返回完整的反应模拟结果。

**Base URL**: `http://localhost:8080`
**API前缀**: `/chemistry/simulation`
**Content-Type**: `application/json`

---

## 目录

1. [完整模拟接口](#1-完整模拟接口)
2. [查找匹配方程式接口](#2-查找匹配方程式接口)
3. [快速模拟接口](#3-快速模拟接口)
4. [数据字典](#4-数据字典)
5. [完整请求响应示例](#5-完整请求响应示例)

---

## 1. 完整模拟接口

### 接口地址

```
POST /chemistry/simulation/simulate
```

### 功能说明

根据输入的反应物和反应条件，进行完整的化学反应模拟，返回包括方程式、产物、现象、参数、链式反应、反应阶段和教学信息在内的完整数据。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reactants | Array | 是 | 反应物列表 |
| reactants[].substanceId | Long | 是 | 反应物物质ID |
| reactants[].amount | BigDecimal | 是 | 反应物数量 |
| reactants[].unit | String | 是 | 单位：g(克)、mL(毫升)、L(升) |
| reactants[].state | String | 否 | 物质状态：s(固体)、l(液体)、g(气体)、aq(水溶液) |
| reactants[].concentration | BigDecimal | 否 | 溶液浓度（mol/L），仅溶液需要 |
| conditions | Object | 否 | 反应条件 |
| conditions.temperature | BigDecimal | 否 | 反应温度（℃） |
| conditions.pressure | BigDecimal | 否 | 反应压强（atm） |
| conditions.catalyst | String | 否 | 催化剂 |
| conditions.solvent | String | 否 | 溶剂 |

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| reactionOccurred | Boolean | 反应是否发生 |
| primaryReaction | Object | 主反应信息 |
| products | Array | 产物信息列表 |
| phenomena | Object | 反应现象 |
| parameters | Object | 反应参数 |
| chainReactions | Array | 链式反应/副反应列表 |
| stages | Array | 反应阶段列表 |
| teachingInfo | Object | 教学信息 |

### 主反应信息 (primaryReaction)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| equationId | Long | 方程式ID |
| equationText | String | 方程式文本（如：Zn + H₂SO₄ → ZnSO₄ + H₂↑） |
| equationHtml | String | 方程式HTML格式（含下标上标） |
| reactionType | String | 反应类型代码 |
| isRedox | Boolean | 是否氧化还原反应 |
| enthalpyChange | BigDecimal | 焓变（kJ/mol） |
| reactionRate | String | 反应速率等级 |
| difficultyLevel | String | 难度等级 |
| oxidationChanges | Object | 氧化态变化 |

### 产物信息 (products)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| substanceId | Long | 产物物质ID |
| substanceName | String | 产物中文名称 |
| formula | String | 化学式 |
| coefficient | Integer | 化学计量系数 |
| state | String | 产物状态 |
| molarMass | BigDecimal | 摩尔质量（g/mol） |
| theoreticalYield | BigDecimal | 理论产量（g） |
| actualYield | BigDecimal | 实际产量（g） |
| yieldPercentage | BigDecimal | 产率百分比 |
| yieldUnit | String | 产量单位 |

### 反应现象 (phenomena)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| colorChange | Object | 颜色变化 |
| precipitate | Object | 沉淀信息 |
| gasEvolution | Object | 气体放出 |
| temperatureChange | Object | 温度变化 |
| description | String | 现象描述 |
| soundPhenomenon | String | 声音现象 |
| observationPoints | Array | 观察要点列表 |

### 反应参数 (parameters)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| reactionTime | BigDecimal | 反应时间（秒） |
| reactionRate | BigDecimal | 反应速率值 |
| finalPh | BigDecimal | 最终pH值 |
| finalTemperature | BigDecimal | 最终温度（℃） |
| finalPressure | BigDecimal | 最终压强（atm） |
| heatChange | BigDecimal | 焓变（kJ/mol） |

### 链式反应 (chainReactions)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| equationId | Long | 副反应方程式ID |
| equationText | String | 副反应方程式 |
| reactionType | String | 副反应类型 |
| triggerProbability | BigDecimal | 触发概率 |
| isTriggered | Boolean | 是否触发 |
| triggerReason | String | 触发原因 |
| phenomenonImpact | String | 现象影响 |
| teachingNote | String | 教学备注 |

### 反应阶段 (stages)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| stageOrder | Integer | 阶段顺序 |
| stageName | String | 阶段名称 |
| stageType | String | 阶段类型 |
| durationEstimate | String | 预计持续时间 |
| phenomenaDescription | String | 现象描述 |
| microscopicExplanation | String | 微观解释 |
| colorChange | Object | 颜色变化 |

### 教学信息 (teachingInfo)

| 参数名 | 类型 | 说明 |
|--------|------|------|
| studentDescription | String | 学生版描述 |
| teacherDescription | String | 教师版描述 |
| keyPoints | Array | 知识点列表 |
| commonQuestions | Array | 常见问题列表 |
| commonMistakes | Array | 常见错误列表 |

---

## 2. 查找匹配方程式接口

### 接口地址

```
POST /chemistry/simulation/find-equations
```

### 功能说明

根据输入的反应物，查找数据库中可能发生的化学反应方程式，返回匹配的方程式ID列表。

### 请求参数

同完整模拟接口的 `reactants` 参数。

### 响应参数

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [1, 2, 3]
}
```

返回的是方程式ID列表，按匹配度排序，最多返回3个。

---

## 3. 快速模拟接口

### 接口地址

```
POST /chemistry/simulation/quick-simulate
```

### 功能说明

快速模拟化学反应，仅返回关键信息（是否反应、方程式、现象、产物），适合实时预览场景。

### 请求参数

同完整模拟接口。

### 响应参数

```json
{
  "code": 200,
  "msg": "操作成功",
  "reactionOccurred": true,
  "equationText": "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
  "phenomena": { /* 反应现象 */ },
  "products": [ /* 产物列表 */ ]
}
```

---

## 4. 数据字典

### 物质状态 (state)

| 值 | 说明 |
|----|------|
| s | 固体 (solid) |
| l | 液体 (liquid) |
| g | 气体 (gas) |
| aq | 水溶液 (aqueous) |

### 反应类型 (reactionType)

| 值 | 说明 |
|----|------|
| COMBINATION | 化合反应 |
| DECOMPOSITION | 分解反应 |
| DISPLACEMENT | 置换反应 |
| DOUBLE_DISPLACEMENT | 复分解反应 |
| COMBUSTION | 燃烧反应 |
| NEUTRALIZATION | 中和反应 |
| PRECIPITATION | 沉淀反应 |
| REDOX | 氧化还原反应 |
| ACID_BASE | 酸碱反应 |

### 反应速率等级 (reactionRate)

| 值 | 说明 | 估算时间 |
|----|------|----------|
| instant | 瞬间反应 | < 1秒 |
| very_fast | 极快 | 5秒 |
| fast | 快 | 30秒 |
| moderate | 中等 | 2分钟 |
| slow | 慢 | 5分钟 |
| very_slow | 很慢 | 10分钟 |

### 难度等级 (difficultyLevel)

| 值 | 说明 |
|----|------|
| elementary | 小学 |
| middle_school | 初中 |
| high_school | 高中 |
| university | 大学 |
| advanced | 高级 |

---

## 5. 完整请求响应示例

### 示例1：锌与稀硫酸反应

**请求：**

```json
{
  "reactants": [
    {
      "substanceId": 1,
      "amount": 6.5,
      "unit": "g",
      "state": "s"
    },
    {
      "substanceId": 2,
      "amount": 100,
      "unit": "mL",
      "state": "aq",
      "concentration": 2.0
    }
  ],
  "conditions": {
    "temperature": 25.0,
    "pressure": 1.0
  }
}
```

**响应：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "reactionOccurred": true,
    "primaryReaction": {
      "equationId": 1,
      "equationText": "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
      "equationHtml": "Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>↑",
      "reactionType": "DISPLACEMENT",
      "isRedox": true,
      "enthalpyChange": -152.5,
      "reactionRate": "fast",
      "difficultyLevel": "middle_school"
    },
    "products": [
      {
        "substanceId": 3,
        "substanceName": "硫酸锌",
        "formula": "ZnSO₄",
        "coefficient": 1,
        "state": "aq",
        "molarMass": 161.47,
        "theoreticalYield": 16.15,
        "actualYield": 14.85,
        "yieldPercentage": 92.0,
        "yieldUnit": "g"
      },
      {
        "substanceId": 4,
        "substanceName": "氢气",
        "formula": "H₂",
        "coefficient": 1,
        "state": "g",
        "molarMass": 2.016,
        "theoreticalYield": 0.20,
        "actualYield": 0.18,
        "yieldPercentage": 92.0,
        "yieldUnit": "g"
      }
    ],
    "phenomena": {
      "colorChange": {
        "before": "无色透明",
        "after": "无色透明",
        "description": "溶液颜色无明显变化"
      },
      "gasEvolution": {
        "hasGas": true,
        "gasDescription": "产生无色无味气泡",
        "gasProperties": "可燃，密度比空气小"
      },
      "temperatureChange": {
        "isExothermic": true,
        "temperatureChange": "+15°C",
        "description": "反应放热，试管壁发烫"
      },
      "description": "锌粒逐渐溶解，表面产生大量气泡，放出热量",
      "soundPhenomenon": "轻微的嘶嘶声",
      "observationPoints": [
        "观察锌粒表面是否产生气泡",
        "用手触摸试管壁感受温度变化",
        "注意气体放出的速度"
      ]
    },
    "parameters": {
      "reactionTime": 30,
      "reactionRate": 0.1,
      "finalPh": 1.5,
      "finalTemperature": 40.0,
      "heatChange": -152.5
    },
    "chainReactions": [],
    "stages": [
      {
        "stageOrder": 1,
        "stageName": "反应初期",
        "stageType": "initiation",
        "durationEstimate": "5秒",
        "phenomenaDescription": "锌粒表面开始产生少量气泡",
        "microscopicExplanation": "Zn原子失去电子成为Zn²⁺进入溶液，H⁺获得电子成为H原子"
      },
      {
        "stageOrder": 2,
        "stageName": "反应进行中",
        "stageType": "propagation",
        "durationEstimate": "20秒",
        "phenomenaDescription": "气泡产生速度加快，放出明显热量",
        "microscopicExplanation": "反应速率加快，大量H₂分子生成并聚集形成气泡"
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
    "teachingInfo": {
      "studentDescription": "锌是一种活泼金属，能与稀硫酸发生置换反应，生成硫酸锌和氢气。这个反应是放热反应，我们可以观察到锌粒表面产生气泡，试管壁发烫。",
      "teacherDescription": "本实验演示金属与酸的置换反应。重点引导学生观察：1) 气泡的产生；2) 温度的变化；3) 锌粒的溶解。可讨论反应速率与金属活泼性的关系。",
      "keyPoints": [
        "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
        "置换反应：单质 + 化合物 → 新单质 + 新化合物",
        "反应放热",
        "氢气可燃"
      ],
      "commonQuestions": [
        {
          "question": "为什么锌粒表面会产生气泡？",
          "answer": "因为反应生成了氢气，氢气不溶于水，以气泡形式逸出。"
        },
        {
          "question": "反应放热还是吸热？",
          "answer": "反应放热，用手触摸试管壁可以感觉到温度升高。"
        }
      ],
      "commonMistakes": [
        {
          "mistake": "认为所有金属都能与酸反应",
          "correction": "只有金属活动性顺序表中氢之前的金属才能与酸反应置换出氢气"
        }
      ]
    }
  }
}
```

### 示例2：不发生反应的情况

**请求：**

```json
{
  "reactants": [
    {
      "substanceId": 10,
      "amount": 10,
      "unit": "g",
      "state": "s"
    },
    {
      "substanceId": 11,
      "amount": 50,
      "unit": "mL",
      "state": "l"
    }
  ]
}
```

**响应：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "reactionOccurred": false
  }
}
```

---

## 6. 前端开发注意事项

### 1. 错误处理

所有接口遵循统一的错误响应格式：

```json
{
  "code": 500,
  "msg": "错误描述信息"
}
```

常见错误码：
- `200`: 成功
- `400`: 请求参数错误
- `500`: 服务器内部错误

### 2. 单位换算

前端在显示数据时注意：
- 产量默认单位为克(g)
- 反应时间单位为秒
- 温度单位为摄氏度(℃)
- 压强单位为大气压(atm)

### 3. 数值精度

后端返回的BigDecimal类型数据，前端显示时建议保留2-4位小数。

### 4. 异步处理建议

- `/simulate` 接口处理时间较长，建议显示加载动画
- `/quick-simulate` 适合实时预览，响应更快
- `/find-equations` 可用于提示用户可能的反应

### 5. 物质ID获取

物质ID需要从物质列表接口获取（需要另外提供），或使用预定义的常用物质ID。

### 6. 可视化建议

- 使用化学式渲染库显示方程式（如 mhchem）
- 颜色变化建议用颜色块展示
- 气体产生可用动画效果
- 温度变化可用温度计图标展示

---

## 7. 测试用例

### 测试用例1：固体+溶液反应

```bash
curl -X POST http://localhost:8080/chemistry/simulation/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "reactants": [
      {"substanceId": 1, "amount": 6.5, "unit": "g", "state": "s"},
      {"substanceId": 2, "amount": 100, "unit": "mL", "state": "aq", "concentration": 2.0}
    ]
  }'
```

### 测试用例2：两种溶液混合

```bash
curl -X POST http://localhost:8080/chemistry/simulation/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "reactants": [
      {"substanceId": 5, "amount": 50, "unit": "mL", "state": "aq", "concentration": 1.0},
      {"substanceId": 6, "amount": 50, "unit": "mL", "state": "aq", "concentration": 1.0}
    ]
  }'
```

### 测试用例3：高温条件反应

```bash
curl -X POST http://localhost:8080/chemistry/simulation/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "reactants": [
      {"substanceId": 7, "amount": 10, "unit": "g", "state": "s"}
    ],
    "conditions": {
      "temperature": 300.0
    }
  }'
```

---

## 8. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2025-02-05 | 初始版本，支持基础反应模拟 |

---

## 9. 联系方式

如有问题，请联系后端开发团队。
