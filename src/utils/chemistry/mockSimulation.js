/**
 * 化学反应模拟 Mock 服务
 * 生成模拟API响应，用于前端开发和测试
 */

import { findReactionsByReactants, getReactionKnowledge } from './reactionKnowledge.js'
import { getSubstanceById } from './substanceLibrary.js'

/**
 * 是否使用Mock数据（生产环境设为false）
 */
export const USE_MOCK = true

/**
 * 模拟延迟
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 快速预览 - 轻量级响应
 */
export async function quickPreview({ reactants, conditions }) {
  if (USE_MOCK) {
    // 模拟网络延迟
    await delay(200)

    const reactantIds = reactants.map(r => r.substanceId).filter(id => id)
    if (reactantIds.length < 2) {
      return {
        code: 200,
        msg: '操作成功',
        reactionOccurred: false
      }
    }

    const matches = findReactionsByReactants(reactantIds)

    if (matches.length === 0) {
      return {
        code: 200,
        msg: '操作成功',
        reactionOccurred: false
      }
    }

    const reaction = matches[0].reaction

    return {
      code: 200,
      msg: '操作成功',
      reactionOccurred: true,
      equationText: reaction.equationText,
      equationHtml: reaction.equationHtml,
      reactionType: reaction.reactionType,
      phenomena: {
        description: reaction.phenomena.description ||
          extractPhenomenaDescription(reaction.phenomena)
      },
      products: reaction.products?.map(id => {
        const substance = getSubstanceById(id)
        return substance ? {
          substanceId: id,
          substanceName: substance.name,
          formula: substance.formula
        } : null
      }).filter(Boolean) || []
    }
  }

  // 真实API调用
  return null
}

/**
 * 完整模拟 - 详细响应
 */
export async function simulateReaction({ reactants, conditions }) {
  if (USE_MOCK) {
    // 模拟较长的处理时间
    await delay(800)

    const reactantIds = reactants.map(r => r.substanceId).filter(id => id)

    if (reactantIds.length < 2) {
      return {
        code: 200,
        msg: '操作成功',
        data: {
          reactionOccurred: false
        }
      }
    }

    const matches = findReactionsByReactants(reactantIds)

    if (matches.length === 0) {
      return {
        code: 200,
        msg: '操作成功',
        data: {
          reactionOccurred: false,
          message: '这些物质在当前条件下不会发生化学反应'
        }
      }
    }

    const reaction = matches[0].reaction

    // 计算产物产量
    const products = calculateProducts(reactants, reaction)

    return {
      code: 200,
      msg: '操作成功',
      data: {
        reactionOccurred: true,
        primaryReaction: {
          equationId: reaction.equationId,
          equationText: reaction.equationText,
          equationHtml: reaction.equationHtml,
          reactionType: reaction.reactionType,
          isRedox: reaction.isRedox,
          enthalpyChange: reaction.enthalpyChange,
          reactionRate: reaction.reactionRate,
          difficultyLevel: reaction.difficultyLevel
        },
        products: products,
        phenomena: reaction.phenomena,
        parameters: calculateParameters(reaction, conditions),
        chainReactions: [], // 暂无副反应数据
        stages: reaction.stages || generateStages(reaction),
        teachingInfo: reaction.teachingInfo
      }
    }
  }

  // 真实API调用
  return null
}

/**
 * 查找可能的反应方程式
 */
export async function findEquations({ substanceIds }) {
  if (USE_MOCK) {
    await delay(100)

    const matches = findReactionsByReactants(substanceIds)

    return {
      code: 200,
      msg: '操作成功',
      data: matches.map(m => m.equationId)
    }
  }

  return null
}

// ========== 辅助函数 ==========

/**
 * 计算产物产量
 */
function calculateProducts(reactants, reaction) {
  const products = []

  // 获取反应物信息
  const reactantSubstances = reactants.map(r => ({
    substance: getSubstanceById(r.substanceId),
    amount: r.amount,
    unit: r.unit
  }))

  // 根据化学计量计算理论产量（简化版）
  reaction.products?.forEach((productId, index) => {
    const substance = getSubstanceById(productId)
    if (!substance) return

    // 简化的产量计算：假设完全反应
    let theoreticalYield = 0
    let actualYield = 0
    let yieldPercentage = 90 // 默认90%产率

    // 根据第一个反应物的量估算
    if (reactantSubstances[0] && reactantSubstances[0].substance) {
      const molarRatio = 1 // 简化，假设1:1化学计量
      const reactantMoles = convertToMoles(
        reactantSubstances[0].amount,
        reactantSubstances[0].unit,
        reactantSubstances[0].substance.molarMass
      )
      theoreticalYield = reactantMoles * molarRatio * substance.molarMass
      actualYield = theoreticalYield * (yieldPercentage / 100)
    }

    products.push({
      substanceId: productId,
      substanceName: substance.name,
      formula: substance.formula,
      coefficient: 1, // 简化，都设为1
      state: substance.state,
      molarMass: substance.molarMass,
      theoreticalYield: Number(theoreticalYield.toFixed(2)),
      actualYield: Number(actualYield.toFixed(2)),
      yieldPercentage: yieldPercentage,
      yieldUnit: 'g'
    })
  })

  return products
}

/**
 * 转换为物质的量（mol）
 */
function convertToMoles(amount, unit, molarMass) {
  switch (unit) {
    case 'g':
      return amount / molarMass
    case 'mol':
      return amount
    case 'L':
      // 假设气体标准状况，22.4L/mol
      return amount / 22.4
    case 'mL':
      return (amount / 1000) / 22.4
    default:
      return amount / molarMass
  }
}

/**
 * 计算反应参数
 */
function calculateParameters(reaction, conditions) {
  const rateMap = {
    'instant': 0.1,
    'very_fast': 0.05,
    'fast': 0.02,
    'moderate': 0.01,
    'slow': 0.005,
    'very_slow': 0.001
  }

  return {
    reactionTime: estimateReactionTime(reaction.reactionRate),
    reactionRate: rateMap[reaction.reactionRate] || 0.01,
    finalPh: estimateFinalPh(reaction),
    finalTemperature: estimateFinalTemperature(reaction, conditions?.temperature || 25),
    finalPressure: conditions?.pressure || 1,
    heatChange: reaction.enthalpyChange || 0
  }
}

/**
 * 估算反应时间
 */
function estimateReactionTime(rate) {
  const timeMap = {
    'instant': 1,
    'very_fast': 5,
    'fast': 30,
    'moderate': 120,
    'slow': 300,
    'very_slow': 600
  }
  return timeMap[rate] || 60
}

/**
 * 估算最终pH值
 */
function estimateFinalPh(reaction) {
  // 根据反应类型估算
  if (reaction.reactionType === 'NEUTRALIZATION') {
    return 7.0
  }
  if (reaction.reactionType === 'DISPLACEMENT') {
    // 金属与酸反应，溶液可能仍呈酸性
    return 2.0
  }
  return null
}

/**
 * 估算最终温度
 */
function estimateFinalTemperature(reaction, initialTemp) {
  if (reaction.enthalpyChange < 0) {
    // 放热反应
    return initialTemp + Math.abs(reaction.enthalpyChange) / 10
  }
  return initialTemp
}

/**
 * 生成反应阶段（如果知识库中没有）
 */
function generateStages(reaction) {
  const baseStages = [
    {
      stageOrder: 1,
      stageName: '反应初期',
      stageType: 'initiation',
      durationEstimate: '5秒',
      phenomenaDescription: '反应开始，出现初步现象',
      microscopicExplanation: '反应物分子开始碰撞并发生反应'
    },
    {
      stageOrder: 2,
      stageName: '反应进行中',
      stageType: 'propagation',
      durationEstimate: '30秒',
      phenomenaDescription: '反应加快，现象明显',
      microscopicExplanation: '反应速率达到最大，大量产物生成'
    },
    {
      stageOrder: 3,
      stageName: '反应完成',
      stageType: 'completion',
      durationEstimate: '5秒',
      phenomenaDescription: '反应结束，现象停止',
      microscopicExplanation: '反应物消耗完毕，反应终止'
    }
  ]

  return baseStages
}

/**
 * 提取现象描述
 */
function extractPhenomenaDescription(phenomena) {
  const parts = []

  if (phenomena.colorChange?.description) {
    parts.push(phenomena.colorChange.description)
  }
  if (phenomena.gasEvolution?.hasGas) {
    parts.push('产生气体')
  }
  if (phenomena.precipitate?.hasPrecipitate) {
    parts.push('生成沉淀')
  }
  if (phenomena.temperatureChange?.isExothermic) {
    parts.push('放热')
  } else if (phenomena.temperatureChange?.description) {
    parts.push(phenomena.temperatureChange.description)
  }

  return parts.join('，') || '无明显外观变化'
}
