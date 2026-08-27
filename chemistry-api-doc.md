# 化学虚拟实验模块 API 文档

## 目录

1. [元素周期表管理](#1-元素周期表管理)
2. [物质库管理](#2-物质库管理)
3. [化学方程式管理](#3-化学方程式管理)
4. [实验器材管理](#4-实验器材管理)
5. [实验模板管理](#5-实验模板管理)
6. [反应阶段管理](#6-反应阶段管理)
7. [副反应管理](#7-副反应管理)
8. [中间产物管理](#8-中间产物管理)
9. [反应描述管理](#9-反应描述管理)
10. [实验记录管理](#10-实验记录管理)

---

## 通用说明

### 基础地址
```
http://localhost:8080/chemistry
```

### 通用响应结构
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

### 分页参数
```
pageNum: 页码（从1开始）
pageSize: 每页数量
```

### 分页响应结构
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [],
  "total": 100
}
```

---

## 1. 元素周期表管理

### 基础信息
- **路由前缀**: `/chemistry/element`
- **权限前缀**: `chemistry:element`

### 接口列表

#### 1.1 查询元素列表
- **接口**: `GET /chemistry/element/list`
- **权限**: `chemistry:element:list`
- **说明**: 分页查询元素周期表数据

#### 1.2 获取元素详情
- **接口**: `GET /chemistry/element/{id}`
- **权限**: `chemistry:element:query`
- **参数**: `id` - 元素ID（原子序数）

#### 1.3 根据符号查询
- **接口**: `GET /chemistry/element/symbol/{symbol}`
- **参数**: `symbol` - 元素符号（如 H、O、Fe）

#### 1.4 新增元素
- **接口**: `POST /chemistry/element`
- **权限**: `chemistry:element:add`

#### 1.5 修改元素
- **接口**: `PUT /chemistry/element`
- **权限**: `chemistry:element:edit`

#### 1.6 删除元素
- **接口**: `DELETE /chemistry/element/{ids}`
- **权限**: `chemistry:element:remove`
- **参数**: `ids` - ID数组（如 `1,2,3`）

#### 1.7 导出元素
- **接口**: `POST /chemistry/element/export`
- **权限**: `chemistry:element:export`

### 元素数据结构
```json
{
  "atomicNumber": 1,
  "symbol": "H",
  "nameZh": "氢",
  "nameEn": "Hydrogen",
  "atomicMass": 1.008,
  "category": "非金属",
  "period": 1,
  "groupNum": 1,
  "block": "s",
  "electronConfiguration": "1s1",
  "valenceElectrons": 1,
  "stateAtStp": "gas",
  "color": "无色",
  "electronegativity": 2.20,
  "meltingPoint": -259.14,
  "boilingPoint": -252.87,
  "density": 0.00008988,
  "colorCode": "#FFFFFF"
}
```

---

## 2. 物质库管理

### 基础信息
- **路由前缀**: `/chemistry/substance`
- **权限前缀**: `chemistry:substance`

### 接口列表

#### 2.1 查询物质列表
- **接口**: `GET /chemistry/substance/list`
- **权限**: `chemistry:substance:list`

#### 2.2 获取物质详情
- **接口**: `GET /chemistry/substance/{id}`
- **权限**: `chemistry:substance:query`

#### 2.3 根据化学式查询
- **接口**: `GET /chemistry/substance/formula/{formula}`
- **参数**: `formula` - 化学式（如 H2O、CO2）

#### 2.4 根据类型查询
- **接口**: `GET /chemistry/substance/type/{substanceType}`
- **参数**: `substanceType` - 物质类型

#### 2.5 搜索物质
- **接口**: `GET /chemistry/substance/search`
- **参数**: `keyword` - 搜索关键词

#### 2.6 新增/修改/删除/导出
- **POST** /chemistry/substance (add)
- **PUT** /chemistry/substance (edit)
- **DELETE** /chemistry/substance/{ids} (remove)
- **POST** /chemistry/substance/export (export)

### 物质数据结构
```json
{
  "id": 1,
  "nameZh": "水",
  "nameEn": "Water",
  "formula": "H2O",
  "substanceType": "compound",
  "compoundType": "inorganic",
  "molarMass": 18.02,
  "stateAtStp": "liquid",
  "color": "无色",
  "density": 1.00,
  "meltingPoint": 0.00,
  "boilingPoint": 100.00,
  "phValue": 7.0,
  "toxicityLevel": "none"
}
```

---

## 3. 化学方程式管理

### 基础信息
- **路由前缀**: `/chemistry/equation`
- **权限前缀**: `chemistry:equation`

### 接口列表

#### 3.1 查询方程式列表
- **接口**: `GET /chemistry/equation/list`

#### 3.2 获取方程式详情
- **接口**: `GET /chemistry/equation/{id}`

#### 3.3 根据反应类型查询
- **接口**: `GET /chemistry/equation/type/{reactionTypeCode}`
- **参数**: `reactionTypeCode` - 反应类型代码

#### 3.4 根据难度查询
- **接口**: `GET /chemistry/equation/difficulty/{difficultyLevel}`
- **参数**: `difficultyLevel` - 难度等级

#### 3.5 根据反应物查找反应
- **接口**: `POST /chemistry/equation/findByReactants`
- **Body**: `reactantIds` - 反应物ID数组

#### 3.6 新增/修改/删除/导出
- **POST** /chemistry/equation
- **PUT** /chemistry/equation
- **DELETE** /chemistry/equation/{ids}
- **POST** /chemistry/equation/export

### 方程式数据结构
```json
{
  "id": 1,
  "equationText": "Fe + CuSO₄ → FeSO₄ + Cu",
  "reactants": [{"substanceId": 1, "coefficient": 1, "state": "s"}],
  "products": [{"substanceId": 2, "coefficient": 1, "state": "aq"}],
  "reactionTypeCode": "DISPLACEMENT",
  "isRedox": true,
  "conditions": {"temperature": "室温", "medium": "水溶液"},
  "enthalpyChange": null,
  "difficultyLevel": "easy"
}
```

---

## 4. 实验器材管理

### 基础信息
- **路由前缀**: `/chemistry/equipment`
- **权限前缀**: `chemistry:equipment`

### 接口列表

#### 4.1 查询器材列表
- **接口**: `GET /chemistry/equipment/list`

#### 4.2 根据编码查询
- **接口**: `GET /chemistry/equipment/code/{code}`

#### 4.3 根据类别查询
- **接口**: `GET /chemistry/equipment/category/{category}`

#### 4.4 新增/修改/删除/导出
- **POST** /chemistry/equipment
- **PUT** /chemistry/equipment
- **DELETE** /chemistry/equipment/{ids}
- **POST** /chemistry/equipment/export

### 器材数据结构
```json
{
  "id": 1,
  "nameZh": "试管",
  "nameEn": "Test Tube",
  "code": "EQ001",
  "category": "container",
  "specification": "普通试管",
  "capacity": "15mL",
  "material": "玻璃",
  "isHeatResistant": true,
  "hasGraduation": false
}
```

---

## 5. 实验模板管理

### 基础信息
- **路由前缀**: `/chemistry/template`
- **权限前缀**: `chemistry:template`

### 接口列表

#### 5.1 查询模板列表
- **接口**: `GET /chemistry/template/list`

#### 5.2 获取模板详情
- **接口**: `GET /chemistry/template/{id}`

#### 5.3 根据实验代码查询
- **接口**: `GET /chemistry/template/code/{experimentCode}`

#### 5.4 根据难度查询
- **接口**: `GET /chemistry/template/difficulty/{difficultyLevel}`

#### 5.5 根据科目查询
- **接口**: `GET /chemistry/template/subject/{subject}`

#### 5.6 获取已发布的模板
- **接口**: `GET /chemistry/template/published`

#### 5.7 新增/修改/删除/导出
- **POST** /chemistry/template
- **PUT** /chemistry/template
- **DELETE** /chemistry/template/{ids}
- **POST** /chemistry/template/export

### 模板数据结构
```json
{
  "id": 1,
  "nameZh": "铁与硫酸铜反应",
  "experimentCode": "FE_CUSO4_REACTION",
  "subject": "chemistry",
  "category": "无机反应",
  "difficultyLevel": "easy",
  "objective": "观察置换反应现象",
  "principle": "金属活动性顺序",
  "duration": 10,
  "requiredEquipment": ["EQ001", "EQ002"],
  "requiredSubstances": [{"substanceId": 1, "amount": "0.1mol"}],
  "safetyPrecautions": ["注意防护", "通风良好"]
}
```

---

## 6. 反应阶段管理

### 基础信息
- **路由前缀**: `/chemistry/reactionStage`
- **权限前缀**: `chemistry:stage`

### 接口列表

#### 6.1 查询阶段列表
- **接口**: `GET /chemistry/reactionStage/list`

#### 6.2 根据方程式ID查询阶段
- **接口**: `GET /chemistry/reactionStage/equation/{equationId}`
- **说明**: 获取某个反应的所有阶段，按顺序排列

#### 6.3 新增/修改/删除/导出
- **POST** /chemistry/reactionStage
- **PUT** /chemistry/reactionStage
- **DELETE** /chemistry/reactionStage/{ids}`
- **POST** /chemistry/reactionStage/export

### 阶段数据结构
```json
{
  "id": 1,
  "equationId": 1,
  "stageOrder": 1,
  "stageName": "混合初期",
  "stageType": "mixing",
  "durationEstimate": "立即",
  "phenomenaDescription": "溶液呈蓝色，铁钉表面呈银灰色",
  "colorChange": {
    "from": "蓝色",
    "to": "蓝色",
    "intermediate": []
  },
  "microscopicExplanation": "铁原子开始失去电子，进入溶液",
  "observationPoints": ["观察溶液颜色", "注意铁钉表面变化"]
}
```

---

## 7. 副反应管理

### 基础信息
- **路由前缀**: `/chemistry/secondaryReaction`
- **权限前缀**: `chemistry:secondary`

### 接口列表

#### 7.1 查询副反应列表
- **接口**: `GET /chemistry/secondaryReaction/list`

#### 7.2 根据主反应查询副反应
- **接口**: `GET /chemistry/secondaryReaction/mainEquation/{mainEquationId}`

#### 7.3 新增/修改/删除/导出
- **POST** /chemistry/secondaryReaction
- **PUT** /chemistry/secondaryReaction
- **DELETE** /chemistry/secondaryReaction/{ids}`
- **POST** /chemistry/secondaryReaction/export

### 副反应数据结构
```json
{
  "id": 1,
  "mainEquationId": 1,
  "secondaryEquationId": 2,
  "reactionType": "side",
  "relationship": "parallel",
  "triggerProbability": 0.1,
  "triggerCondition": {
    "oxygenPresent": true
  },
  "phenomenonImpact": {
    "colorMask": "溶液可能变黄"
  },
  "isCommonStudentError": true
}
```

---

## 8. 中间产物管理

### 基础信息
- **路由前缀**: `/chemistry/intermediate`
- **权限前缀**: `chemistry:intermediate`

### 接口列表

#### 8.1 查询中间产物列表
- **接口**: `GET /chemistry/intermediate/list`

#### 8.2 根据方程式ID查询
- **接口**: `GET /chemistry/intermediate/equation/{equationId}`

#### 8.3 根据阶段ID查询
- **接口**: `GET /chemistry/intermediate/stage/{stageId}`

#### 8.4 新增/修改/删除/导出
- **POST** /chemistry/intermediate
- **PUT** /chemistry/intermediate
- **DELETE** /chemistry/intermediate/{ids}`
- **POST** /chemistry/intermediate/export

### 中间产物数据结构
```json
{
  "id": 1,
  "equationId": 1,
  "stageId": 2,
  "intermediateFormula": "[Fe(H₂O)₆]²⁺",
  "intermediateName": "六水合亚铁离子",
  "intermediateNameEn": "Hexaaquairon(II)",
  "lifetime": "较稳定",
  "stability": "moderate",
  "isIsolatable": false,
  "detectionMethod": "加水稀释后颜色变浅",
  "observablePhenomena": {
    "color": "浅绿色"
  }
}
```

---

## 9. 反应描述管理

### 基础信息
- **路由前缀**: `/chemistry/reactionNarrative`
- **权限前缀**: `chemistry:narrative`

### 接口列表

#### 9.1 查询描述列表
- **接口**: `GET /chemistry/reactionNarrative/list`

#### 9.2 根据方程式和类型查询
- **接口**: `GET /chemistry/reactionNarrative/equation/{equationId}?type={type}`
- **参数**:
  - `equationId` - 方程式ID
  - `type` - 描述类型（student/teacher/detailed），默认 student

#### 9.3 新增/修改/删除/导出
- **POST** /chemistry/reactionNarrative
- **PUT** /chemistry/reactionNarrative
- **DELETE** /chemistry/reactionNarrative/{ids}`
- **POST** /chemistry/reactionNarrative/export

### 描述数据结构
```json
{
  "id": 1,
  "equationId": 1,
  "narrativeType": "student",
  "processDescription": "将洁净的铁钉放入盛有蓝色硫酸铜溶液的试管中...",
  "stepByStep": [
    {
      "step": 1,
      "action": "取少量硫酸铜溶液于试管中",
      "observation": "溶液呈蓝色"
    }
  ],
  "commonQuestions": [
    {
      "question": "为什么溶液颜色会变化？",
      "answer": "因为蓝色的Cu²⁺逐渐被消耗..."
    }
  ],
  "commonMistakes": [
    {
      "mistake": "铁钉未除锈",
      "consequence": "可能影响反应速率"
    }
  ],
  "keyPoints": ["铁钉要洁净", "观察要及时"]
}
```

---

## 10. 实验记录管理

### 基础信息
- **路由前缀**: `/chemistry/experimentRun`
- **权限前缀**: `chemistry:run`

### 接口列表

#### 10.1 查询实验记录列表
- **接口**: `GET /chemistry/experimentRun/list`

#### 10.2 获取记录详情
- **接口**: `GET /chemistry/experimentRun/{id}`

#### 10.3 根据用户ID查询
- **接口**: `GET /chemistry/experimentRun/user/{userId}`

#### 10.4 根据模板ID查询
- **接口**: `GET /chemistry/experimentRun/template/{templateId}`

#### 10.5 新增记录
- **接口**: `POST /chemistry/experimentRun`
- **权限**: `chemistry:run:add`

#### 10.6 删除记录
- **接口**: `DELETE /chemistry/experimentRun/{ids}`
- **权限**: `chemistry:run:remove`

#### 10.7 导出记录
- **接口**: `POST /chemistry/experimentRun/export`
- **权限**: `chemistry:run:export`

### 实验记录数据结构
```json
{
  "id": 1,
  "templateId": 1,
  "userId": 1,
  "inputParams": {
    "temperature": 25,
    "concentration": {"HCl": 0.1}
  },
  "resultData": {
    "reactionOccurred": true,
    "finalConcentrations": {"Fe²⁺": 0.05}
  },
  "observedPhenomena": {
    "colorChange": "蓝色→浅绿色",
    "precipitate": "红色物质析出"
  },
  "reactionTime": 300.00,
  "reactionRate": 0.0017,
  "yieldPercentage": 85.5,
  "score": 95,
  "createTime": "2025-02-05 12:00:00"
}
```

---

## 附录A：枚举值说明

### 反应类型代码 (reactionTypeCode)
| 代码 | 名称 | 说明 |
|------|------|------|
| COMBINATION | 化合反应 | A + B → AB |
| DECOMPOSITION | 分解反应 | AB → A + B |
| DISPLACEMENT | 置换反应 | A + BC → AC + B |
| DOUBLE_DISPLACEMENT | 复分解反应 | AB + CD → AD + CB |
| REDOX | 氧化还原反应 | 电子转移 |
| COMBUSTION | 燃烧反应 | 燃料 + O₂ |
| NEUTRALIZATION | 中和反应 | 酸 + 碱 → 盐 + 水 |
| PRECIPITATION | 沉淀反应 | 生成难溶物 |

### 难度等级 (difficultyLevel)
| 代码 | 名称 |
|------|------|
| elementary | 小学 |
| easy | 简单 |
| medium | 中等 |
| hard | 困难 |
| advanced | 高级 |

### 物质类型 (substanceType)
| 代码 | 名称 |
|------|------|
| element | 单质 |
| compound | 化合物 |

### 化合物类型 (compoundType)
| 代码 | 名称 |
|------|------|
| inorganic | 无机物 |
| organic | 有机物 |

### 毒性等级 (toxicityLevel)
| 代码 | 名称 |
|------|------|
| none | 无毒 |
| low | 低毒 |
| medium | 中毒 |
| high | 高毒 |
| extreme | 剧毒 |

### 反应阶段类型 (stageType)
| 代码 | 名称 |
|------|------|
| mixing | 混合 |
| heating | 加热 |
| reacting | 反应中 |
| cooling | 冷却 |
| filtering | 过滤 |
| completed | 完成 |

---

## 附录B：权限标识说明

### 权限命名规范
```
glxt:chemistry:{模块}:{操作}

模块: element, substance, equation, equipment, template, stage, secondary, intermediate, narrative, run
操作: list, query, add, edit, remove, export
```

### 前端权限检查示例
```javascript
// 检查是否有权限
const hasPermission = (permission) => {
  return permissions.includes(permission)
}

// 使用示例
if (hasPermission('glxt:chemistry:element:add')) {
  // 显示新增按钮
}
```

---

## 附录C：前端路由建议

```
/chemistry/element          # 元素周期表维护
/chemistry/substance       # 物质库维护
/chemistry/equation        # 化学方程式维护
/chemistry/equipment       # 实验器材维护
/chemistry/template        # 实验模板维护
/chemistry/reaction-stage  # 反应阶段维护
/chemistry/secondary       # 副反应维护
/chemistry/intermediate    # 中间产物维护
/chemistry/narrative       # 反应描述维护
/chemistry/experiment      # 实验记录查看
```

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2025-02-05 | 初始版本 |
