# 化学虚拟实验模块 - 页面设计规范

> 基于若依Vue3 + 统一CRUD模板

## 目录

1. [通用页面规范](#1-通用页面规范)
2. [元素周期表管理](#2-元素周期表管理)
3. [物质库管理](#3-物质库管理)
4. [化学方程式管理](#4-化学方程式管理)
5. [实验器材管理](#5-实验器材管理)
6. [实验模板管理](#6-实验模板管理)
7. [反应阶段管理](#7-反应阶段管理)
8. [副反应管理](#8-副反应管理)
9. [中间产物管理](#9-中间产物管理)
10. [反应描述管理](#10-反应描述管理)
11. [实验记录管理](#11-实验记录管理)

---

## 1. 通用页面规范

### 1.1 页面结构标准

```
chemistry/
├── element/
│   └── index.vue          # 元素周期表维护
├── substance/
│   └── index.vue          # 物质库维护
├── equation/
│   └── index.vue          # 化学方程式维护
├── equipment/
│   └── index.vue          # 实验器材维护
├── template/
│   └── index.vue          # 实验模板维护
├── reaction-stage/
│   └── index.vue          # 反应阶段维护
├── secondary-reaction/
│   └── index.vue          # 副反应维护
├── intermediate/
│   └── index.vue          # 中间产物维护
├── narrative/
│   └── index.vue          # 反应描述维护
└── experiment-run/
    └── index.vue          # 实验记录查看
```

### 1.2 列表页字段配置

统一CRUD模板的列配置：

```javascript
// columns 配置示例
const columns = [
  { field: 'id', label: 'ID', width: 80, show: false },
  { field: 'name', label: '名称', minWidth: 120, show: true, sortable: true },
  // ... 其他字段
]
```

### 1.3 表单页字段配置

```javascript
// 表单字段配置
const formFields = [
  {
    field: 'name',
    label: '名称',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  },
  // ... 其他字段
]
```

### 1.4 字段类型映射

| 数据库类型 | 组件类型 | 特殊配置 |
|-----------|----------|----------|
| VARCHAR | input | placeholder |
| TEXT | textarea | rows: 3 |
| JSON字段 | input | 仅展示，格式化显示 |
| INT/DECIMAL | input-number | precision/scale |
| BOOLEAN | switch | active-text |
| ENUM | select | options数组 |

---

## 2. 元素周期表管理

### 2.1 页面路由
```
/chemistry/element
```

### 2.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'atomicNumber', label: '原子序数', width: 100, sortable: true },
  { field: 'symbol', label: '符号', width: 80 },
  { field: 'nameZh', label: '中文名', minWidth: 100, sortable: true },
  { field: 'nameEn', label: '英文名', minWidth: 120 },
  { field: 'atomicMass', label: '原子量', width: 100 },
  { field: 'category', label: '分类', width: 100 },
  { field: 'period', label: '周期', width: 80 },
  { field: 'groupNum', label: '族', width: 80 },
  { field: 'block', label: '区', width: 60 },
  { field: 'stateAtStp', label: '状态', width: 80 },
  { field: 'color', label: '颜色', width: 80 },
  { field: 'colorCode', label: '色值', width: 100 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 2.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'atomicNumber',
      label: '原子序数',
      type: 'input-number',
      required: true,
      props: { min: 1, max: 118 }
    },
    {
      field: 'symbol',
      label: '元素符号',
      type: 'input',
      required: true,
      props: { maxlength: 10 }
    },
    {
      field: 'nameZh',
      label: '中文名称',
      type: 'input',
      required: true
    },
    {
      field: 'nameEn',
      label: '英文名称',
      type: 'input'
    },
    {
      field: 'atomicMass',
      label: '相对原子质量',
      type: 'input-number',
      props: { precision: 4, step: 0.0001 }
    },
    {
      field: 'category',
      label: '元素分类',
      type: 'select',
      options: [
        { label: '非金属', value: '非金属' },
        { label: '金属', value: '金属' },
        { label: '稀有气体', value: '稀有气体' },
        { label: '类金属', value: '类金属' }
      ]
    },
    {
      field: 'period',
      label: '周期',
      type: 'input-number',
      props: { min: 1, max: 7 }
    },
    {
      field: 'groupNum',
      label: '族',
      type: 'input-number',
      props: { min: 1, max: 18 }
    },
    {
      field: 'block',
      label: '区',
      type: 'select',
      options: [
        { label: 's区', value: 's' },
        { label: 'p区', value: 'p' },
        { label: 'd区', value: 'd' },
        { label: 'f区', value: 'f' }
      ]
    },
    {
      field: 'electronConfiguration',
      label: '电子排布',
      type: 'input'
    },
    {
      field: 'valenceElectrons',
      label: '价电子数',
      type: 'input-number'
    },
    {
      field: 'stateAtStp',
      label: '标准状态',
      type: 'select',
      options: [
        { label: '固态', value: 'solid' },
        { label: '液态', value: 'liquid' },
        { label: '气态', value: 'gas' }
      ]
    },
    {
      field: 'color',
      label: '颜色',
      type: 'input'
    },
    {
      field: 'electronegativity',
      label: '电负性',
      type: 'input-number',
      props: { precision: 2, step: 0.01 }
    },
    {
      field: 'meltingPoint',
      label: '熔点(°C)',
      type: 'input-number',
      props: { precision: 2 }
    },
    {
      field: 'boilingPoint',
      label: '沸点(°C)',
      type: 'input-number',
      props: { precision: 2 }
    },
    {
      field: 'density',
      label: '密度(g/cm³)',
      type: 'input-number',
      props: { precision: 4, step: 0.0001 }
    },
    {
      field: 'colorCode',
      label: '色值',
      type: 'input',
      props: { maxlength: 20 }
    }
]
```

### 2.4 特殊说明
- **主键字段**：atomicNumber（原子序数）不可编辑
- **颜色预览**：colorCode字段可添加颜色选择器，显示颜色预览

---

## 3. 物质库管理

### 3.1 页面路由
```
/chemistry/substance
```

### 3.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'nameZh', label: '中文名', minWidth: 120, sortable: true },
  { field: 'nameEn', label: '英文名', minWidth: 120 },
  { field: 'formula', label: '化学式', width: 120 },
  { field: 'substanceType', label: '类型', width: 80 },
  { field: 'compoundType', label: '化合物类型', width: 100 },
  { field: 'molarMass', label: '摩尔质量', width: 100 },
  { field: 'stateAtStp', label: '状态', width: 80 },
  { field: 'color', label: '颜色', width: 80 },
  { field: 'density', label: '密度', width: 100 },
  { field: 'phValue', label: 'pH值', width: 80 },
  { field: 'toxicityLevel', label: '毒性', width: 80 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 3.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'nameZh',
      label: '中文名称',
      type: 'input',
      required: true
    },
    {
      field: 'nameEn',
      label: '英文名称',
      type: 'input'
    },
    {
      field: 'formula',
      label: '化学式',
      type: 'input',
      required: true,
      props: { maxlength: 50 },
      rules: [{ required: true, message: '请输入化学式' }]
    },
    {
      field: 'substanceType',
      label: '物质类型',
      type: 'select',
      options: [
        { label: '单质', value: 'element' },
        { label: '化合物', value: 'compound' }
      ]
    },
    {
      field: 'compoundType',
      label: '化合物类型',
      type: 'select',
      options: [
        { label: '无机物', value: 'inorganic' },
        { label: '有机物', value: 'organic' }
      ]
    },
    {
      field: 'molarMass',
      label: '摩尔质量(g/mol)',
      type: 'input-number',
      props: { precision: 2, step: 0.01 }
    },
    {
      field: 'stateAtStp',
      label: '标准状态',
      type: 'select',
      options: [
        { label: '固态', value: 'solid' },
        { label: '液态', value: 'liquid' },
        { label: '气态', value: 'gas' }
      ]
    },
    {
      field: 'color',
      label: '颜色',
      type: 'input'
    },
    {
      field: 'density',
      label: '密度(g/cm³)',
      type: 'input-number',
      props: { precision: 4, step: 0.0001 }
    },
    {
      field: 'meltingPoint',
      label: '熔点(°C)',
      type: 'input-number',
      props: { precision: 2 }
    },
    {
      field: 'boilingPoint',
      label: '沸点(°C)',
      type: 'input-number',
      props: { precision: 2 }
    },
    {
      field: 'phValue',
      label: 'pH值',
      type: 'input-number',
      props: { precision: 2, step: 0.1, min: 0, max: 14 }
    },
    {
      field: 'toxicityLevel',
      label: '毒性等级',
      type: 'select',
      options: [
        { label: '无毒', value: 'none' },
        { label: '低毒', value: 'low' },
        { label: '中毒', value: 'medium' },
        { label: '高毒', value: 'high' },
        { label: '剧毒', value: 'extreme' }
      ]
    }
]
```

### 3.4 特殊说明
- **化学式显示**：formula字段可使用下标格式化显示（如 H₂O）

---

## 4. 化学方程式管理

### 4.1 页面路由
```
/chemistry/equation
```

### 4.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'equationText', label: '方程式', minWidth: 200 },
  { field: 'reactionTypeCode', label: '反应类型', width: 120 },
  { field: 'isRedox', label: '氧化还原', width: 100 },
  { field: 'difficultyLevel', label: '难度', width: 80 },
  { field: 'isPublished', label: '状态', width: 80 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 4.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'equationText',
      label: '方程式',
      type: 'input',
      required: true,
      component: 'EquationInput', // 自定义组件，支持下标输入
      props: { maxlength: 500 }
    },
    {
      field: 'reactionTypeCode',
      label: '反应类型',
      type: 'select',
      required: true,
      options: [
        { label: '化合反应', value: 'COMBINATION' },
        { label: '分解反应', value: 'DECOMPOSITION' },
        { label: '置换反应', value: 'DISPLACEMENT' },
        { label: '复分解反应', value: 'DOUBLE_DISPLACEMENT' },
        { label: '氧化还原', value: 'REDOX' },
        { label: '燃烧反应', value: 'COMBUSTION' },
        { label: '中和反应', value: 'NEUTRALIZATION' },
        { label: '沉淀反应', value: 'PRECIPITATION' }
      ]
    },
    {
      field: 'isRedox',
      label: '是否氧化还原反应',
      type: 'switch'
    },
    {
      field: 'difficultyLevel',
      label: '难度等级',
      type: 'select',
      options: [
        { label: '小学', value: 'elementary' },
        { label: '简单', value: 'easy' },
        { label: '中等', value: 'medium' },
        { label: '困难', value: 'hard' },
        { label: '高级', value: 'advanced' }
      ]
    },
    {
      field: 'isPublished',
      label: '是否发布',
      type: 'switch'
    }
]
```

### 4.4 特殊说明
- **方程式输入**：建议使用支持化学式下标和上标的自定义输入组件
- **状态标签**：isPublished显示为"已发布/未发布"标签
- **难度标签**：difficultyLevel使用不同颜色标签展示

---

## 5. 实验器材管理

### 5.1 页面路由
```
/chemistry/equipment
```

### 5.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'nameZh', label: '名称', minWidth: 120 },
  { field: 'code', label: '编码', width: 100 },
  { field: 'category', label: '类别', width: 100 },
  { field: 'specification', label: '规格', width: 100 },
  { field: 'capacity', label: '容量', width: 80 },
  { field: 'material', label: '材质', width: 80 },
  { field: 'isHeatResistant', label: '耐热', width: 80 },
  { field: 'hasGraduation', label: '有刻度', width: 80 }
]
```

### 5.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'nameZh',
      label: '中文名称',
      type: 'input',
      required: true
    },
    {
      field: 'nameEn',
      label: '英文名称',
      type: 'input'
    },
    {
      field: 'code',
      label: '器材编码',
      type: 'input',
      required: true,
      props: { maxlength: 50 }
    },
    {
      field: 'category',
      label: '类别',
      type: 'select',
      required: true,
      options: [
        { label: '容器类', value: 'container' },
        { label: '加热类', value: 'heating' },
        { label: '夹持类', value: 'holding' },
        { label: '测量类', value: 'measuring' },
        { label: '分离类', value: 'filtration' },
        { label: '其他', value: 'other' }
      ]
    },
    {
      field: 'specification',
      label: '规格',
      type: 'input',
      props: { maxlength: 100 }
    },
    {
      field: 'capacity',
      label: '容量',
      type: 'input',
      props: { maxlength: 20 }
    },
    {
      field: 'material',
      label: '材质',
      type: 'input',
      props: { maxlength: 50 }
    },
    {
      field: 'isHeatResistant',
      label: '是否耐热',
      type: 'switch'
    },
    {
      field: 'hasGraduation',
      label: '是否有刻度',
      type: 'switch'
    },
    {
      field: 'primaryUse',
      label: '主要用途',
      type: 'textarea',
      props: { rows: 2, maxlength: 200 }
    },
    {
      field: 'usagePrecautions',
      label: '使用注意事项',
      type: 'textarea',
      props: { rows: 3, maxlength: 500 }
    }
]
```

---

## 6. 实验模板管理

### 6.1 页面路由
```
/chemistry/template
```

### 6.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'nameZh', label: '实验名称', minWidth: 150 },
  { field: 'experimentCode', label: '实验代码', width: 150 },
  { field: 'category', label: '分类', width: 100 },
  { field: 'difficultyLevel', label: '难度', width: 80 },
  { field: 'duration', label: '时长(分钟)', width: 100 },
  { field: 'isPublished', label: '状态', width: 80 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 6.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'nameZh',
      label: '实验中文名称',
      type: 'input',
      required: true
    },
    {
      field: 'nameEn',
      label: '实验英文名称',
      type: 'input'
    },
    {
      field: 'experimentCode',
      label: '实验代码',
      type: 'input',
      required: true,
      props: { maxlength: 50 }
    },
    {
      field: 'subject',
      label: '科目',
      type: 'input',
      default: 'chemistry'
    },
    {
      field: 'category',
      label: '实验分类',
      type: 'input',
      props: { maxlength: 50 }
    },
    {
      field: 'difficultyLevel',
      label: '难度等级',
      type: 'select',
      options: [
        { label: '小学', value: 'elementary' },
        { label: '简单', value: 'easy' },
        { label: '中等', value: 'medium' },
        { label: '困难', value: 'hard' },
        { label: '高级', value: 'advanced' }
      ]
    },
    {
      field: 'duration',
      label: '预计时长(分钟)',
      type: 'input-number',
      props: { min: 0 }
    },
    {
      field: 'objective',
      label: '实验目标',
      type: 'textarea',
      props: { rows: 3 }
    },
    {
      field: 'principle',
      label: '实验原理',
      type: 'textarea',
      props: { rows: 4 }
    },
    {
      field: 'requiredEquipment',
      label: '所需器材',
      type: 'select',
      component: 'EquipmentSelect', // 多选组件
      props: { multiple: true, emitPath: 'value' }
    },
    {
      field: 'safetyPrecautions',
      label: '安全注意事项',
      type: 'textarea',
      props: { rows: 3 }
    },
    {
      field: 'isPublished',
      label: '是否发布',
      type: 'switch'
    }
]
```

---

## 7. 反应阶段管理

### 7.1 页面路由
```
/chemistry/reaction-stage
```

### 7.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'equationId', label: '方程式ID', width: 100 },
  { field: 'stageOrder', label: '阶段顺序', width: 100 },
  { field: 'stageName', label: '阶段名称', width: 120 },
  { field: 'stageType', label: '阶段类型', width: 100 },
  { field: 'durationEstimate', label: '预计时间', width: 100 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 7.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'equationId',
      label: '所属方程式',
      type: 'select',
      required: true,
      component: 'EquationSelect', // 方程式选择器
      props: { emitPath: 'value' }
    },
    {
      field: 'stageOrder',
      label: '阶段顺序',
      type: 'input-number',
      required: true,
      props: { min: 1 }
    },
    {
      field: 'stageName',
      label: '阶段名称',
      type: 'input',
      required: true,
      props: { maxlength: 100 }
    },
    {
      field: 'stageType',
      label: '阶段类型',
      type: 'select',
      options: [
        { label: '混合', value: 'mixing' },
        { label: '加热', value: 'heating' },
        { label: '反应中', value: 'reacting' },
        { label: '冷却', value: 'cooling' },
        { label: '过滤', value: 'filtering' },
        { label: '完成', value: 'completed' }
      ]
    },
    {
      field: 'durationEstimate',
      label: '预计持续时间',
      type: 'input',
      placeholder: '如: 5-10秒、1-2分钟'
    },
    {
      field: 'phenomenaDescription',
      label: '现象描述',
      type: 'textarea',
      props: { rows: 3 }
    },
    {
      field: 'microscopicExplanation',
      label: '微观解释',
      type: 'textarea',
      props: { rows: 4 }
    },
    {
      field: 'observationPoints',
      label: '观察要点',
      type: 'textarea',
      props: { rows: 3 },
      component: 'JsonInput' // JSON输入组件，解析为数组展示
    }
]
```

### 7.4 特殊说明
- **级联显示**：列表页按equationId分组显示
- **阶段类型标签**：使用不同颜色标签区分阶段类型

---

## 8. 副反应管理

### 8.1 页面路由
```
/chemistry/secondary-reaction
```

### 8.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'mainEquationId', label: '主反应ID', width: 100 },
  { field: 'secondaryEquationId', label: '副反应ID', width: 120 },
  { field: 'reactionType', label: '反应类型', width: 100 },
  { field: 'relationship', label: '关系', width: 100 },
  { field: 'triggerProbability', label: '触发概率', width: 100 },
  { field: 'isCommonStudentError', label: '学生易错', width: 100 }
]
```

### 8.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'mainEquationId',
      label: '主反应方程式',
      type: 'select',
      required: true,
      component: 'EquationSelect'
    },
    {
      field: 'secondaryEquationId',
      label: '副反应方程式',
      type: 'select',
      required: true,
      component: 'EquationSelect'
    },
    {
      field: 'reactionType',
      label: '反应类型',
      type: 'select',
      options: [
        { label: '中间反应', value: 'intermediate' },
        { label: '副反应', value: 'side' },
        { label: '竞争反应', value: 'competitive' }
      ]
    },
    {
      field: 'relationship',
      label: '与主反应关系',
      type: 'select',
      options: [
        { label: '顺序', value: 'sequential' },
        { label: '平行', value: 'parallel' },
        { label: '先于主反应', value: 'preceding' }
      ]
    },
    {
      field: 'triggerProbability',
      label: '触发概率',
      type: 'input-number',
      props: { min: 0, max: 1, step: 0.001, precision: 3 }
    },
    {
      field: 'triggerCondition',
      label: '触发条件(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: { rows: 3, placeholder: '{"temperature_range": [50, 80]}' }
    },
    {
      field: 'phenomenonImpact',
      label: '现象影响(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: { rows: 3 }
    },
    {
      field: 'teachingNote',
      label: '教学说明',
      type: 'textarea',
      props: { rows: 3 }
    },
    {
      field: 'isCommonStudentError',
      label: '是否学生常见错误',
      type: 'switch'
    }
]
```

### 8.4 特殊说明
- **双方程式选择**：需要同时选择主反应和副反应
- **JSON字段**：triggerCondition、phenomenonImpact 需要JSON编辑器组件

---

## 9. 中间产物管理

### 9.1 页面路由
```
/chemistry/intermediate
```

### 9.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'equationId', label: '方程式ID', width: 100 },
  { field: 'stageId', label: '阶段ID', width: 100 },
  { field: 'intermediateFormula', label: '化学式', width: 120 },
  { field: 'intermediateName', label: '名称', minWidth: 150 },
  { field: 'lifetime', label: '存在时间', width: 100 },
  { field: 'stability', label: '稳定性', width: 100 },
  { field: 'isIsolatable', label: '可分离', width: 80 }
]
```

### 9.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'equationId',
      label: '所属方程式',
      type: 'select',
      required: true,
      component: 'EquationSelect'
    },
    {
      field: 'stageId',
      label: '所属阶段',
      type: 'select',
      component: 'StageSelect' // 级联equationId
    },
    {
      field: 'intermediateFormula',
      label: '中间产物化学式',
      type: 'input',
      component: 'FormulaInput', // 支持下标
      required: true,
      props: { maxlength: 100 }
    },
    {
      field: 'intermediateName',
      label: '中间产物名称',
      type: 'input',
      required: true
    },
    {
      field: 'intermediateNameEn',
      label: '英文名称',
      type: 'input'
    },
    {
      field: 'lifetime',
      label: '存在时间',
      type: 'select',
      options: [
        { label: '极短', value: '极短' },
        { label: '短暂', value: '短暂' },
        { label: '较稳定', value: '较稳定' }
      ]
    },
    {
      field: 'stability',
      label: '稳定性',
      type: 'select',
      options: [
        { label: '极不稳定', value: 'very_unstable' },
        { label: '不稳定', value: 'unstable' },
        { label: '中等', value: 'moderate' },
        { label: '稳定', value: 'stable' }
      ]
    },
    {
      field: 'isIsolatable',
      label: '是否可分离',
      type: 'switch'
    },
    {
      field: 'detectionMethod',
      label: '检验方法',
      type: 'textarea',
      props: { rows: 3 }
    },
    {
      field: 'characteristicReaction',
      label: '特征反应',
      type: 'textarea',
      props: { rows: 2 }
    },
    {
      field: 'observablePhenomena',
      label: '可观察现象(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: { rows: 2 }
    },
    {
      field: 'teachingImportance',
      label: '教学重要性',
      type: 'textarea',
      props: { rows: 3 }
    }
]
```

---

## 10. 反应描述管理

### 10.1 页面路由
```
/chemistry/narrative
```

### 10.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'equationId', label: '方程式ID', width: 100 },
  { field: 'narrativeType', label: '描述类型', width: 100 },
  { field: 'processDescription', label: '过程描述', minWidth: 200 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 10.3 表单字段配置

```javascript
const formFields = [
  [
    {
      field: 'equationId',
      label: '所属方程式',
      type: 'select',
      required: true,
      component: 'EquationSelect'
    },
    {
      field: 'narrativeType',
      label: '描述类型',
      type: 'select',
      required: true,
      options: [
        { label: '学生版', value: 'student' },
        { label: '教师版', value: 'teacher' },
        { label: '详细版', value: 'detailed' }
      ]
    },
    {
      field: 'processDescription',
      label: '过程描述',
      type: 'textarea',
      props: { rows: 4 },
      required: true
    },
    {
      field: 'stepByStep',
      label: '分步描述(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: {
        rows: 6,
        placeholder: '[{"step": 1, "action": "...", "observation": "..."}]'
      }
    },
    {
      field: 'commonQuestions',
      label: '常见问题(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: { rows: 4 }
    },
    {
      field: 'commonMistakes',
      label: '常见错误(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: { rows: 4 }
    },
    {
      field: 'keyPoints',
      label: '关键点(JSON)',
      type: 'textarea',
      component: 'JsonInput',
      props: { rows: 3 }
    }
]
```

### 10.4 特殊说明
- **分步描述编辑器**：建议使用可折叠的步骤编辑器组件
- **JSON字段**：所有JSON字段需要美观的JSON编辑器

---

## 11. 实验记录管理

### 11.1 页面路由
```
/chemistry/experiment
```

### 11.2 列表页配置

```javascript
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'templateId', label: '模板ID', width: 100 },
  { field: 'userId', label: '用户ID', width: 100 },
  { field: 'reactionTime', label: '反应时间(秒)', width: 120 },
  { field: 'yieldPercentage', label: '产率(%)', width: 100 },
  { field: 'score', label: '评分', width: 80 },
  { field: 'createTime', label: '创建时间', width: 160 }
]
```

### 11.3 详情页查看

实验记录为只查看，不需要编辑功能。建议使用详情抽屉或详情弹窗展示：

```javascript
// 详情页字段分组
const detailGroups = [
  {
    title: '输入参数',
    fields: [
      { label: '模板ID', field: 'templateId' },
      { label: '用户ID', field: 'userId' },
      { label: '输入参数', field: 'inputParams', type: 'json' }
    ]
  },
  {
    title: '反应结果',
    fields: [
      { label: '反应时间', field: 'reactionTime' },
      { label: '反应速率', field: 'reactionRate' },
      { label: '理论产量', field: 'theoreticalYield' },
      { label: '实际产量', field: 'actualYield' },
      { label: '产率', field: 'yieldPercentage' }
    ]
  },
  {
    title: '观察现象',
    fields: [
      { label: '现象数据', field: 'observedPhenomena', type: 'json' }
    ]
  },
  {
    title: '评价',
    fields: [
      { label: '评分', field: 'score' },
      { label: '反馈', field: 'feedback' }
    ]
  }
]
```

---

## 附录A：通用组件开发建议

### A.1 化学式输入组件

```vue
<template>
  <el-input v-model="innerValue" @input="formatFormula" />
</template>

<script>
export default {
  props: ['modelValue'],
  computed: {
    innerValue: {
      get() { return this.modelValue },
      set(val) { this.$emit('update:modelValue', val) }
    }
  },
  methods: {
    formatFormula(value) {
      // 处理化学式格式，H2O -> H₂O
    }
  }
}
</script>
```

### A.2 方程式选择器

```vue
<template>
  <el-select
    v-model="innerValue"
    :remote-method="loadEquations"
    :remote="true"
    placeholder="选择化学方程式"
  >
    <el-option
      v-for="eq in equationList"
      :key="eq.id"
      :label="eq.equationText"
      :value="eq.id"
    >
      <span :style="{marginLeft: '10px'}">{{ eq.equationText }}</span>
      <el-tag size="mini" style="margin-left: 10px">{{ eq.reactionTypeCode }}</el-tag>
    </el-option>
  </el-select>
</template>
```

### A.3 JSON编辑器组件

使用如 `vue-json-editor` 或 `codemirror` 的JSON编辑模式

---

## 附录B：统一CRUD模板配置示例

### B.1 页面模板结构

```vue
<template>
  <div class="chemistry-container">
    <!-- 列表页 -->
    <chemistry-list
      v-if="!showDetail"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 详情页/表单页 -->
    <chemistry-form
      v-else
      :mode="formMode"
      :data="currentData"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import ChemistryList from './components/ChemistryList.vue'
import ChemistryForm from './components/ChemistryForm.vue'

export default {
  components: { ChemistryList, ChemistryForm },
  data() {
    return {
      showDetail: false,
      formMode: 'add', // add | edit
      currentData: null
    }
  },
  methods: {
    handleAdd() {
      this.formMode = 'add'
      this.currentData = {}
      this.showDetail = true
    },
    handleEdit(row) {
      this.formMode = 'edit'
      this.currentData = { ...row }
      this.showDetail = true
    },
    handleCancel() {
      this.showDetail = false
    },
    handleSubmit(formData) {
      // 调用API保存
    }
  }
}
</script>
```

### B.2 API调用配置

```javascript
// api/chemistry.js
import request from '@/utils/request'

export default {
  // 列表
  list: (params) => request({
    url: '/chemistry/element/list',
    method: 'get',
    params
  }),

  // 详情
  get: (id) => request({
    url: `/chemistry/element/${id}`,
    method: 'get'
  }),

  // 新增
  add: (data) => request({
    url: '/chemistry/element',
    method: 'post',
    data
  }),

  // 修改
  update: (data) => request({
    url: '/chemistry/element',
    method: 'put',
    data
  }),

  // 删除
  remove: (ids) => request({
    url: `/chemistry/element/${ids.join(',')}`,
    method: 'delete'
  }),

  // 导出
  export: (params) => request({
    url: '/chemistry/element/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}
```

---

## 附录C：字段显示格式化

### C.1 化学式格式化

```javascript
// utils/formatter.js
export function formatFormula(formula) {
  if (!formula) return ''
  // 数字转下标
  return formula
    .replace(/(\d+)/g, (match) => {
      const nums = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
      return match.split('').map(n => nums[parseInt(n)] || n).join('')
    })
    // 电荷转上标
    .replace(/(\d+)−/g, (match) => {
      const nums = ['⁺', '⁻', '⁼', '⁽']
      return match.split('').map(n => nums[parseInt(n)] || n).join('')
    })
}
```

### C.2 状态标签格式化

```javascript
// utils/dict.js
export const DICT_CHEMISTRY = {
  substanceType: {
    element: '单质',
    compound: '化合物'
  },
  toxicityLevel: {
    none: { text: '无毒', type: 'success' },
    low: { text: '低毒', type: 'warning' },
    medium: { text: '中毒', type: 'danger' },
    high: { text: '高毒', type: 'danger' },
    extreme: { text: '剧毒', type: 'danger' }
  }
}
```

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2025-02-05 | 初始版本 |
