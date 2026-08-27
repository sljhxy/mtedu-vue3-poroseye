# 化学反应现象接口文档

## 基础信息

- **服务名称**: 化学反应现象管理
- **基础路径**: `/chemistry/phenomena`
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`

---

## 1. 根据方程式ID保存/更新反应现象（推荐）

### 接口信息

```
POST /chemistry/phenomena/equation/{equationId}
```

### 请求参数

#### Path参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| equationId | Long | 是 | 方程式ID |

#### Body参数（JSON）

```json
{
  "phenomenonSummary": "锌与稀硫酸反应产生氢气，并放出热量。锌粒表面产生气泡，试管壁发烫。",
  "colorChange": {
    "from": "无色",
    "to": "无色",
    "description": "溶液颜色无明显变化"
  },
  "precipitate": {
    "hasPrecipitate": false,
    "color": null,
    "description": null
  },
  "gasEvolution": {
    "hasGas": true,
    "gasName": "氢气",
    "formula": "H₂",
    "description": "锌粒表面产生大量气泡"
  },
  "flamePhenomenon": {
    "description": null,
    "color": null,
    "intensity": null
  },
  "temperatureChange": {
    "type": "increase",
    "delta": "+15°C",
    "description": "反应放热，试管壁发烫"
  },
  "soundPhenomenon": "轻微的嘶嘶声",
  "observationPoints": [
    "观察锌粒表面是否产生气泡",
    "用手触摸试管壁感受温度变化",
    "注意观察气体放出的速度"
  ]
}
```

### 字段说明

#### 现象摘要
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| phenomenonSummary | String | 是 | 现象的总体描述 | "锌与稀硫酸反应产生氢气" |

#### 颜色变化
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| from | String | 否 | 反应前颜色 | "无色"、"蓝色"、"红色" |
| to | String | 否 | 反应后颜色 | "无色"、"蓝色"、"红色" |
| description | String | 否 | 颜色变化描述 | "溶液由无色变为蓝色" |

#### 沉淀现象
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| hasPrecipitate | Boolean | 是 | 是否产生沉淀 | true/false |
| color | String | 否 | 沉淀颜色 | "白色"、"蓝色"、"黄色" |
| state | String | 否 | 沉淀状态 | "絮状"、"颗粒状" |
| description | String | 否 | 沉淀描述 | "产生白色絮状沉淀" |

#### 气体现象
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| hasGas | Boolean | 是 | 是否产生气体 | true/false |
| gasName | String | 否 | 气体名称 | "氢气"、"二氧化碳"、"氧气" |
| formula | String | 否 | 气体化学式 | "H₂"、"CO₂"、"O₂" |
| description | String | 否 | 气体描述 | "产生大量气泡" |

#### 火焰现象
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| description | String | 否 | 火焰描述 | "发出淡蓝色火焰" |
| color | String | 否 | 火焰颜色 | "蓝色"、"黄色"、"绿色" |
| intensity | String | 否 | 火焰强度 | "强烈"、"微弱" |

#### 温度变化
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| type | String | 否 | 温度变化类型 | "increase"(放热)、"decrease"(吸热) |
| delta | String | 否 | 温度变化值 | "+15°C"、"-5°C" |
| description | String | 否 | 描述 | "反应放热，试管壁发烫" |

#### 其他
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| soundPhenomenon | String | 否 | 声音描述 | "轻微的嘶嘶声"、"爆炸声" |
| observationPoints | String[] | 否 | 观察要点数组 | ["观察气泡产生","感受温度变化"] |

### 响应示例

#### 成功响应
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "affectedRows": 1
  }
}
```

#### 失败响应
```json
{
  "code": 500,
  "msg": "保存反应现象失败"
}
```

---

## 2. 根据方程式ID查询反应现象

### 接口信息

```
GET /chemistry/phenomena/equation/{equationId}
```

### 请求参数

#### Path参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| equationId | Long | 是 | 方程式ID |

### 响应示例

```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "equationId": 1,
    "phenomenonSummary": "锌与稀硫酸反应产生氢气，并放出热量。锌粒表面产生气泡，试管壁发烫。",
    "colorChange": {
      "from": "无色",
      "to": "无色",
      "description": "溶液颜色无明显变化"
    },
    "precipitate": {
      "hasPrecipitate": false
    },
    "gasEvolution": {
      "hasGas": true,
      "gasName": "氢气",
      "formula": "H₂",
      "description": "锌粒表面产生大量气泡"
    },
    "temperatureChange": {
      "type": "increase",
      "delta": "+15°C",
      "description": "反应放热，试管壁发烫"
    },
    "soundPhenomenon": "轻微的嘶嘶声",
    "observationPoints": [
      "观察锌粒表面是否产生气泡",
      "用手触摸试管壁感受温度变化"
    ]
  }
}
```

---

## 3. 删除指定方程式的反应现象

### 接口信息

```
DELETE /chemistry/phenomena/equation/{equationId}
```

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| equationId | Long | 是 | 方程式ID |

### 响应示例

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": {
    "affectedRows": 1
  }
}
```

---

## 前端集成示例

### Vue.js 示例

```javascript
// API基础路径
const API_BASE = '/chemistry/phenomena';

/**
 * 保存或更新反应现象
 * @param {Number} equationId - 方程式ID
 * @param {Object} phenomenaData - 现象数据
 */
export async function savePhenomena(equationId, phenomenaData) {
  const response = await axios.post(
    `${API_BASE}/equation/${equationId}`,
    phenomenaData
  );
  return response.data;
}

/**
 * 查询反应现象
 * @param {Number} equationId - 方程式ID
 */
export async function getPhenomena(equationId) {
  const response = await axios.get(`${API_BASE}/equation/${equationId}`);
  return response.data.data;
}

/**
 * 删除反应现象
 * @param {Number} equationId - 方程式ID
 */
export async function deletePhenomena(equationId) {
  const response = await axios.delete(`${API_BASE}/equation/${equationId}`);
  return response.data;
}

// 使用示例
async function saveEquationWithPhenomena(equationData, phenomenaData) {
  try {
    // 1. 先保存方程式（返回方程式ID）
    const equationRes = await axios.post('/chemistry/equation', equationData);
    const equationId = equationRes.data.data;

    // 2. 保存现象数据
    if (phenomenaData) {
      await savePhenomena(equationId, phenomenaData);
    }

    return equationId;
  } catch (error) {
    console.error('保存失败:', error);
    throw error;
  }
}
```

### React 示例

```javascript
import axios from 'axios';

const PHENOMENA_API = '/chemistry/phenomena';

export const phenomenaAPI = {
  // 保存现象
  save: (equationId, data) =>
    axios.post(`${PHENOMENA_API}/equation/${equationId}`, data),

  // 查询现象
  getByEquationId: (equationId) =>
    axios.get(`${PHENOMENA_API}/equation/${equationId}`),

  // 删除现象
  deleteByEquationId: (equationId) =>
    axios.delete(`${PHENOMENA_API}/equation/${equationId}`)
};

// 组件中使用
function EquationForm() {
  const [phenomena, setPhenomena] = useState({
    phenomenonSummary: '',
    gasEvolution: { hasGas: true, gasName: '' },
    temperatureChange: { type: 'increase' }
  });

  const handleSave = async (equationData) => {
    try {
      // 保存方程式
      const eqRes = await axios.post('/chemistry/equation', equationData);
      const equationId = eqRes.data.data;

      // 保存现象
      await phenomenaAPI.save(equationId, phenomena);

      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    // ... 表单内容
  );
}
```

---

## 完整的请求体示例模板

### 示例1：置换反应（锌 + 稀硫酸）

```json
{
  "phenomenonSummary": "锌与稀硫酸反应产生氢气，并放出热量。锌粒表面产生气泡，试管壁发烫。",
  "colorChange": {
    "from": "无色",
    "to": "无色",
    "description": "溶液颜色无明显变化"
  },
  "gasEvolution": {
    "hasGas": true,
    "gasName": "氢气",
    "formula": "H₂",
    "description": "锌粒表面产生大量气泡，可用排水法收集"
  },
  "temperatureChange": {
    "type": "increase",
    "delta": "+15°C",
    "description": "反应放热，试管壁发烫，温度明显升高"
  },
  "soundPhenomenon": "轻微的嘶嘶声",
  "observationPoints": [
    "观察锌粒表面是否产生气泡",
    "用手触摸试管壁感受温度变化",
    "注意观察气体放出的速度和数量"
  ]
}
```

### 示例2：沉淀反应（硫酸铜 + 氢氧化钠）

```json
{
  "phenomenonSummary": "蓝色溶液与无色溶液混合，立即产生蓝色絮状沉淀。",
  "colorChange": {
    "from": "蓝色",
    "to": "蓝色浑浊",
    "description": "溶液颜色无明显变化，但出现浑浊"
  },
  "precipitate": {
    "hasPrecipitate": true,
    "color": "蓝色",
    "state": "絮状",
    "description": "产生蓝色絮状氢氧化铜沉淀"
  },
  "gasEvolution": {
    "hasGas": false
  },
  "temperatureChange": {
    "type": "increase",
    "delta": "+5°C",
    "description": "反应放热，温度略有升高"
  },
  "observationPoints": [
    "观察两种溶液混合时的现象",
    "观察沉淀的颜色和状态",
    "注意溶液是否变澄清"
  ]
}
```

### 示例3：气体制备（碳酸钙 + 盐酸）

```json
{
  "phenomenonSummary": "固体逐渐溶解，产生大量气泡。气体能使澄清石灰水变浑浊。",
  "gasEvolution": {
    "hasGas": true,
    "gasName": "二氧化碳",
    "formula": "CO₂",
    "description": "固体表面产生大量气泡，气体无色无味"
  },
  "temperatureChange": {
    "type": "no_change",
    "description": "温度基本保持不变"
  },
  "soundPhenomenon": "嘶嘶声",
  "observationPoints": [
    "观察固体是否逐渐溶解",
    "观察气泡产生的速度",
    "用燃着的木条检验气体（熄灭）"
  ]
}
```

---

## 常见问题

### Q1：某个字段没有数据怎么办？

**A**：不需要提供该字段，或设置为 `null` / `false`：

```json
{
  "gasEvolution": {
    "hasGas": false
  },
  "precipitate": {
    "hasPrecipitate": false
  }
}
```

### Q2：observationPoints 数组为空怎么办？

**A**：可以传空数组或不传该字段：

```json
{
  "observationPoints": []
}
```

或

```json
{
  "phenomenonSummary": "反应现象描述"
  // 不包含 observationPoints 字段
}
```

### Q3：如何判断是否需要某个字段？

**A**：根据反应类型判断：

| 反应类型 | 必填字段 | 可选字段 |
|---------|---------|---------|
| 有气体生成 | gasEvolution.hasGas = true | - |
| 有沉淀生成 | precipitate.hasPrecipitate = true | - |
| 放热反应 | temperatureChange.type = "increase" | - |
| 吸热反应 | temperatureChange.type = "decrease" | - |
| 有颜色变化 | colorChange.from/to | - |
| 有声音 | soundPhenomenon | - |

---

## 注意事项

1. **方程式ID必须存在**：在保存现象数据前，确保对应的方程式已经创建
2. **JSON格式正确**：确保嵌套的JSON对象格式正确，特别是字符串和布尔值的格式
3. **唯一性约束**：每个方程式ID只能有一条现象记录，重复保存会更新原有数据
4. **枚举值**：temperatureChange.type 只能是 "increase"、"decrease" 或 "no_change"
5. **观察要点**：建议提供3-5个观察要点，帮助学生正确观察实验现象
